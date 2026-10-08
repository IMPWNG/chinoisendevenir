import { NextResponse } from "next/server";
import {
  AGENT_RECENT_CAP,
  agentContactWindow,
  clipAgentText,
  groupRecent,
} from "@/lib/agentContacts";
import { displayFormuleLabel } from "@/lib/formules";
import { canonicalStatut } from "@/lib/suiviStatuts";
import { getSupabaseAdmin } from "@/lib/supabaseAdmin";

export const maxDuration = 60;

function isAuthorizedAgent(request: Request) {
  const secret = String(process.env.CRON_SECRET || "").trim();
  if (!secret) return false;
  return request.headers.get("authorization") === `Bearer ${secret}`;
}

type ContactRow = {
  id: string;
  prenom?: string | null;
  nom?: string | null;
  email?: string | null;
  suivi_statut?: string | null;
  formule?: string | null;
};

type EmailRow = {
  contact_id?: string | null;
  direction?: string | null;
  subject?: string | null;
  body_text?: string | null;
  sent_at?: string | null;
};

type ActionRow = {
  contact_id?: string | null;
  action?: string | null;
  description?: string | null;
  created_at?: string | null;
  user_admin?: string | null;
};

export async function GET(request: Request) {
  if (!isAuthorizedAgent(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { offset, limit } = agentContactWindow(new URL(request.url).search);
    const admin = getSupabaseAdmin();
    const { data, error, count } = await admin
      .from("contacts")
      .select("id, prenom, nom, email, suivi_statut, formule", { count: "exact" })
      .order("created_at", { ascending: false })
      .range(offset, offset + limit - 1);
    if (error) {
      return NextResponse.json({ error: "Lecture impossible" }, { status: 500 });
    }

    const contacts = (data || []) as ContactRow[];
    const ids = contacts.map((row) => String(row.id)).filter(Boolean);
    const emailsByContact = new Map<string, EmailRow[]>();
    const actionsByContact = new Map<string, ActionRow[]>();

    if (ids.length) {
      const [emails, actions] = await Promise.all([
        admin
          .from("contact_emails")
          .select("contact_id, direction, subject, body_text, sent_at")
          .in("contact_id", ids)
          .order("sent_at", { ascending: false })
          .limit(ids.length * AGENT_RECENT_CAP),
        admin
          .from("suivi_actions")
          .select("contact_id, action, description, created_at, user_admin")
          .in("contact_id", ids)
          .order("created_at", { ascending: false })
          .limit(ids.length * AGENT_RECENT_CAP),
      ]);
      if (!emails.error) {
        for (const [id, rows] of groupRecent(
          (emails.data || []) as EmailRow[],
          (row) => String(row.contact_id || ""),
        )) {
          emailsByContact.set(id, rows);
        }
      }
      if (!actions.error) {
        for (const [id, rows] of groupRecent(
          (actions.data || []) as ActionRow[],
          (row) => String(row.contact_id || ""),
        )) {
          actionsByContact.set(id, rows);
        }
      }
    }

    return NextResponse.json({
      success: true,
      total: count ?? contacts.length,
      offset,
      limit,
      contacts: contacts.map((row) => {
        const id = String(row.id);
        return {
          id,
          prenom: String(row.prenom || "").trim(),
          nom: String(row.nom || "").trim(),
          email: String(row.email || "").trim(),
          statut: canonicalStatut(row.suivi_statut) || String(row.suivi_statut || ""),
          formule: displayFormuleLabel(row.formule) || "",
          emails: (emailsByContact.get(id) || []).map((mail) => ({
            direction: mail.direction === "in" ? "in" : "out",
            subject: clipAgentText(mail.subject),
            body: clipAgentText(mail.body_text),
            sentAt: mail.sent_at || "",
          })),
          actions: (actionsByContact.get(id) || []).map((action) => ({
            action: String(action.action || ""),
            description: clipAgentText(action.description),
            at: action.created_at || "",
            by: String(action.user_admin || ""),
          })),
        };
      }),
    });
  } catch (error) {
    console.error("agent contacts:", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
