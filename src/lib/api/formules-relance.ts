import { getSupabaseAdmin } from "../supabaseAdmin";
import {
  sendTemplatedEmail,
  updateContactStatus,
  logAction,
} from "./auto-reply";
import { getChosenFormule } from "../studentProgress";
import { isFormulesAwaitingReply } from "../suiviStatuts";
import { errorMessage } from "../request";

const FIVE_DAYS_MS = 5 * 24 * 60 * 60 * 1000;
const MAX_PER_RUN = 40;

function getSupabase() {
  return getSupabaseAdmin();
}

type SuiviActionRow = {
  contact_id?: string | null;
  action?: string | null;
  description?: string | null;
  created_at?: string | null;
};

type RelanceDetail =
  | { contactId: unknown; email: unknown; error: string }
  | { contactId: unknown; email: unknown; status: string };

function actionTime(action: SuiviActionRow | null | undefined) {
  const value = action?.created_at;
  const date = value ? new Date(value) : null;
  return date && !Number.isNaN(date.getTime()) ? date.getTime() : 0;
}

function isFormulesSentAction(action: SuiviActionRow | null | undefined) {
  const type = String(action?.action || "");
  if (type === "email_formules") return true;
  const description = String(action?.description || "").toLowerCase();
  return type === "email_envoye" && description.includes("formules");
}

function isRelanceFormulesAction(action: SuiviActionRow | null | undefined) {
  const type = String(action?.action || "");
  if (type === "relance_formules") return true;
  const description = String(action?.description || "").toLowerCase();
  return (
    (type === "relance" || type === "relance_1" || type === "relance_2") &&
    description.includes("formules")
  );
}

export async function processFormulesRelances({ now = Date.now() } = {}) {
  let supabase;
  try {
    supabase = getSupabase();
  } catch {
    return { success: false, error: "Supabase non configuré", sent: 0 };
  }

  const { data: contacts, error } = await supabase
    .from("contacts")
    .select("*")
    .in("suivi_statut", ["formules_présentées", "choix_des_formules"]);

  if (error) {
    console.error("❌ Relance formules — lecture contacts:", error.message);
    return { success: false, error: error.message, sent: 0 };
  }

  const due = (contacts || []).filter((contact) => {
    if (!contact?.email) return false;
    if (getChosenFormule(contact)) return false;
    return isFormulesAwaitingReply(contact.suivi_statut);
  });

  const results: {
    success: boolean;
    scanned: number;
    sent: number;
    skipped: number;
    failed: number;
    details: RelanceDetail[];
  } = {
    success: true,
    scanned: due.length,
    sent: 0,
    skipped: 0,
    failed: 0,
    details: [],
  };

  const dueIds = due.map((contact) => contact.id).filter(Boolean);
  const actionsByContact = new Map();
  if (dueIds.length) {
    const { data: allActions, error: actionsError } = await supabase
      .from("suivi_actions")
      .select("contact_id, action, description, created_at")
      .in("contact_id", dueIds)
      .order("created_at", { ascending: false })
      .limit(Math.min(dueIds.length * 80, 4000));
    if (actionsError) {
      return { success: false, error: actionsError.message, sent: 0 };
    }
    for (const action of allActions || []) {
      const list = actionsByContact.get(action.contact_id) || [];
      if (list.length < 80) list.push(action);
      actionsByContact.set(action.contact_id, list);
    }
  }

  for (const contact of due) {
    if (results.sent + results.failed >= MAX_PER_RUN) break;

    const history = actionsByContact.get(contact.id) || [];
    const lastFormules = history.find(isFormulesSentAction);
    const lastRelance = history.find(isRelanceFormulesAction);
    const formulesAt = lastFormules
      ? actionTime(lastFormules)
      : new Date(contact.updated_at || contact.created_at || 0).getTime();

    if (!formulesAt || now - formulesAt < FIVE_DAYS_MS) {
      results.skipped += 1;
      continue;
    }

    if (lastRelance && actionTime(lastRelance) >= formulesAt) {
      results.skipped += 1;
      continue;
    }

    const sent = await sendTemplatedEmail(contact, "relance_formules");
    if (!sent.success) {
      results.failed += 1;
      results.details.push({
        contactId: contact.id,
        email: contact.email,
        error: errorMessage(sent.error),
      });
      await logAction(
        contact.id,
        contact.email,
        "note_ajoutee",
        `Échec relance automatique formules (5 jours) : ${errorMessage(sent.error)}`,
      );
      continue;
    }

    await updateContactStatus(contact.id, "relance_en_cours");
    await logAction(
      contact.id,
      contact.email,
      "relance_formules",
      "Relance 3 automatique envoyée — pas de réponse au choix des formules après 5 jours",
    );

    results.sent += 1;
    results.details.push({
      contactId: contact.id,
      email: contact.email,
      status: "relance_en_cours",
    });
  }

  return results;
}
