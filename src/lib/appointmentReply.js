import { analyzeReplyWithAi } from "./emailCompose";
import {
  createAppointment,
  getCalendarContext,
  listEmailDrafts,
  saveEmailDraft,
  updateAppointment,
} from "./appointments";
import { slotsEqual } from "./calendar";

function clip(value, max) {
  return String(value || "").trim().slice(0, max);
}

const MIN_CONFIDENCE = 0.62;

async function recentOutboundNotes(client, contactId) {
  const { data } = await client
    .from("suivi_actions")
    .select("action, description, created_at")
    .eq("contact_id", contactId)
    .in("action", ["email_envoye", "relance_1", "relance_2", "email_formules"])
    .order("created_at", { ascending: false })
    .limit(5);

  return (data || []).map((row) => ({
    action: row.action,
    description: clip(row.description, 400),
    at: row.created_at,
  }));
}

export async function processAppointmentReply({
  client,
  contact,
  replyText,
  userAdmin = "système_automatique",
} = {}) {
  const text = String(replyText || "").trim();
  if (text.length < 4) {
    return { ok: true, skipped: true, reason: "Réponse trop courte" };
  }

  const calendar = await getCalendarContext(client, { contactId: contact.id });
  if (calendar.missingTable) {
    return {
      ok: false,
      missingTable: true,
      error: "Tables calendrier absentes. Exécutez sql/appointments.sql.",
    };
  }

  const pending = await listEmailDrafts(client, {
    contactId: contact.id,
    status: "pending",
  });
  if (
    userAdmin === "système_automatique" &&
    pending.ok &&
    pending.drafts.some((draft) => draft.kind !== "offer")
  ) {
    const latest = pending.drafts[0];
    if (latest && Date.now() - new Date(latest.created_at).getTime() < 10 * 60 * 1000) {
      return { ok: true, skipped: true, reason: "Brouillon déjà en attente", draft: latest };
    }
  }

  const previousEmails = await recentOutboundNotes(client, contact.id);
  const analysis = await analyzeReplyWithAi({
    replyText: text,
    contact,
    calendar: {
      ...calendar,
      freeSlots: calendar.freeSlots,
      promptSlots: calendar.promptSlots,
    },
    previousEmails,
  });

  if (!analysis.ok) return analysis;
  if (!analysis.isAppointmentReply) {
    return { ok: true, isAppointmentReply: false, analysis };
  }

  let appointment = null;
  let moved = false;
  const existing =
    (calendar.contactAppointments || [])
      .slice()
      .sort((a, b) => new Date(a.starts_at) - new Date(b.starts_at))[0] || null;

  const shouldPlace =
    (analysis.kind === "confirmation" || analysis.kind === "move") &&
    analysis.slotAvailable &&
    analysis.chosenSlot &&
    analysis.confidence >= MIN_CONFIDENCE;

  if (shouldPlace) {
    const sameAsExisting = existing && slotsEqual(existing, analysis.chosenSlot);
    if (sameAsExisting) {
      appointment = existing;
    } else if (existing) {
      const updated = await updateAppointment(client, existing.id, {
        startsAt: analysis.chosenSlot.starts_at,
        endsAt: analysis.chosenSlot.ends_at,
        source: "ai_reply",
        notes: analysis.studentPreference || analysis.reason || null,
        title: existing.title,
        kind: existing.kind,
        status: "confirmed",
      });
      if (updated.ok) {
        appointment = updated.event;
        moved = true;
      } else if (updated.status === 409) {
        analysis.slotAvailable = false;
        analysis.kind = "reschedule";
        analysis.chosenSlot = null;
      } else if (!updated.missingTable) {
        console.warn("appointmentReply move:", updated.error);
      }
    } else {
      const created = await createAppointment(client, {
        contactId: String(contact.id),
        startsAt: analysis.chosenSlot.starts_at,
        endsAt: analysis.chosenSlot.ends_at,
        kind: "appel",
        title: `Appel — ${[contact.prenom, contact.nom].filter(Boolean).join(" ")}`.trim(),
        source: "ai_reply",
        status: "confirmed",
        notes: analysis.studentPreference || analysis.reason || null,
      });
      if (created.ok) {
        appointment = created.event;
      } else if (created.status === 409) {
        analysis.slotAvailable = false;
        analysis.kind = "reschedule";
        analysis.chosenSlot = null;
      } else if (!created.missingTable) {
        console.warn("appointmentReply book:", created.error);
      }
    }
  }

  const draft = await saveEmailDraft(client, {
    contactId: String(contact.id),
    appointmentId: appointment?.id || null,
    kind: analysis.kind === "move" ? "confirmation" : analysis.kind || "confirmation",
    subject: analysis.subject,
    title: analysis.title,
    subtitle: analysis.subtitle,
    body: analysis.body,
    inboundExcerpt: clip(text, 1500),
    analysis: {
      confidence: analysis.confidence,
      reason: analysis.reason,
      studentPreference: analysis.studentPreference,
      chosenSlot: analysis.chosenSlot,
      slotAvailable: analysis.slotAvailable,
      offeredSlots: analysis.offeredSlots,
      booked: Boolean(appointment),
      moved,
      previousSlot: moved ? analysis.existingSlot : null,
    },
  });

  try {
    await client.from("suivi_actions").insert({
      contact_id: contact.id,
      action: appointment ? "rendez_vous_fixe" : "note_ajoutee",
      description: moved
        ? `RDV déplacé au calendrier (${analysis.existingSlot?.label || "ancien créneau"} → ${analysis.chosenSlot?.label || analysis.chosenSlot?.starts_at}). Brouillon de confirmation à relire avant envoi.`
        : appointment
        ? `RDV placé au calendrier (${analysis.chosenSlot?.label || analysis.chosenSlot?.starts_at}). Brouillon de confirmation à relire avant envoi.`
        : `Réponse RDV analysée (${analysis.kind}). Brouillon à relire avant envoi.${analysis.reason ? ` ${analysis.reason}` : ""}`,
      user_admin: userAdmin,
    });
  } catch (error) {
    console.warn("appointmentReply log:", error.message);
  }

  if (appointment) {
    try {
      await client
        .from("contacts")
        .update({
          suivi_statut: "appel_réservé",
          updated_at: new Date().toISOString(),
        })
        .eq("id", contact.id);
    } catch (error) {
      console.warn("appointmentReply status:", error.message);
    }
  }

  return {
    ok: true,
    isAppointmentReply: true,
    appointment,
    draft: draft.draft || null,
    analysis,
  };
}
