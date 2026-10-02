import { logAction, sendTemplatedEmail } from "./api/auto-reply";
import { dripSendAllowed } from "./dripSchedule";
import { fillWhatsappText, sendStudentWhatsapp } from "./openwa";
import { errorMessage } from "./request";
import { getSupabaseAdmin } from "./supabaseAdmin";

const STUCK_SENDING_MS = 15 * 60 * 1000;

type DripRow = {
  id: string;
  contact_id: string;
  channel: "email" | "whatsapp";
  subject: string | null;
  title: string | null;
  subtitle: string | null;
  body: string;
  status: string;
  scheduled_at: string;
  created_by: string | null;
};

function failText(error: unknown): string {
  if (typeof error === "string" && error.trim()) return error.trim().slice(0, 240);
  if (error && typeof error === "object" && "message" in error) {
    const message = String((error as { message: unknown }).message || "").trim();
    if (message) return message.slice(0, 240);
  }
  const text = errorMessage(error).trim();
  return (text || "Envoi refusé").slice(0, 240);
}

export async function processOutboundDrip(now = Date.now()) {
  const supabase = getSupabaseAdmin();
  const nowIso = new Date(now).toISOString();

  await supabase
    .from("outbound_drip")
    .update({ status: "pending", updated_at: nowIso })
    .eq("status", "sending")
    .lt("updated_at", new Date(now - STUCK_SENDING_MS).toISOString());

  const { count: sendingNow, error: sendingError } = await supabase
    .from("outbound_drip")
    .select("id", { count: "exact", head: true })
    .eq("status", "sending");
  if (sendingError) {
    return { success: false as const, error: sendingError.message, sent: 0 };
  }
  if ((sendingNow ?? 0) > 0) {
    return { success: true as const, sent: 0, reason: "busy" as const };
  }

  const hourAgo = new Date(now - 60 * 60 * 1000).toISOString();
  const { count: sentInLastHour, error: countError } = await supabase
    .from("outbound_drip")
    .select("id", { count: "exact", head: true })
    .eq("status", "sent")
    .gte("sent_at", hourAgo);
  if (countError) {
    return { success: false as const, error: countError.message, sent: 0 };
  }

  const { data: lastAttempt, error: lastError } = await supabase
    .from("outbound_drip")
    .select("updated_at")
    .in("status", ["sent", "failed"])
    .order("updated_at", { ascending: false })
    .limit(1)
    .maybeSingle();
  if (lastError) {
    return { success: false as const, error: lastError.message, sent: 0 };
  }

  const lastSentAt = lastAttempt?.updated_at
    ? new Date(lastAttempt.updated_at).getTime()
    : null;
  if (
    !dripSendAllowed({
      now,
      sentInLastHour: sentInLastHour ?? 0,
      lastSentAt: Number.isNaN(lastSentAt) ? null : lastSentAt,
    })
  ) {
    return { success: true as const, sent: 0, reason: "rate" as const };
  }

  const { data: due, error: dueError } = await supabase
    .from("outbound_drip")
    .select(
      "id, contact_id, channel, subject, title, subtitle, body, status, scheduled_at, created_by",
    )
    .eq("status", "pending")
    .lte("scheduled_at", nowIso)
    .order("scheduled_at", { ascending: true })
    .limit(1)
    .maybeSingle();
  if (dueError) {
    return { success: false as const, error: dueError.message, sent: 0 };
  }
  if (!due) {
    return { success: true as const, sent: 0, reason: "empty" as const };
  }

  const row = due as DripRow;
  const { data: claimed, error: claimError } = await supabase
    .from("outbound_drip")
    .update({ status: "sending", updated_at: nowIso })
    .eq("id", row.id)
    .eq("status", "pending")
    .select("id")
    .maybeSingle();
  if (claimError) {
    return { success: false as const, error: claimError.message, sent: 0 };
  }
  if (!claimed) {
    return { success: true as const, sent: 0, reason: "race" as const };
  }

  try {
    await deliverDrip(row);
    await supabase
      .from("outbound_drip")
      .update({
        status: "sent",
        sent_at: new Date().toISOString(),
        error: null,
        updated_at: new Date().toISOString(),
      })
      .eq("id", row.id);
    return { success: true as const, sent: 1, id: row.id };
  } catch (error) {
    const message = failText(error);
    await supabase
      .from("outbound_drip")
      .update({
        status: "failed",
        error: message,
        updated_at: new Date().toISOString(),
      })
      .eq("id", row.id);
    return { success: true as const, sent: 0, failed: 1, error: message };
  }
}

async function deliverDrip(row: DripRow) {
  const supabase = getSupabaseAdmin();
  const { data: contact, error } = await supabase
    .from("contacts")
    .select("id, prenom, nom, email, phone, pays")
    .eq("id", row.contact_id)
    .maybeSingle();
  if (error || !contact) throw new Error("Dossier introuvable");

  const prenom = String(contact.prenom || "");
  const nom = String(contact.nom || "");
  const body = fillWhatsappText(row.body, prenom, nom);
  const actor = row.created_by || "système_automatique";

  if (row.channel === "whatsapp") {
    await sendStudentWhatsapp({
      phone: contact.phone,
      country: contact.pays,
      text: body,
    });
    await logAction(
      row.contact_id,
      contact.email,
      "whatsapp_envoye",
      `Séquence automatique — ${body.slice(0, 180)}`,
      actor,
    );
    return;
  }

  const subject = fillWhatsappText(row.subject || "", prenom, nom);
  const sent = await sendTemplatedEmail(
    {
      id: contact.id,
      email: contact.email,
      prenom: contact.prenom,
      nom: contact.nom,
    },
    "custom",
    {
      customSubject: subject,
      customTitle: fillWhatsappText(row.title || "", prenom, nom),
      customSubtitle: fillWhatsappText(row.subtitle || "", prenom, nom),
      customMessage: body,
    },
  );
  if (!sent.success) throw new Error(failText(sent.error));
  await logAction(
    row.contact_id,
    contact.email,
    "email_envoye",
    `Séquence automatique — ${subject}`.slice(0, 240),
    actor,
  );
}
