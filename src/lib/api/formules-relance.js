/* eslint-disable no-undef */
import { createClient } from "@supabase/supabase-js";
import {
  sendTemplatedEmail,
  updateContactStatus,
  logAction,
} from "./auto-reply.js";
import { getChosenFormule } from "../studentProgress.js";
import { isFormulesAwaitingReply } from "../suiviStatuts.js";

const FIVE_DAYS_MS = 5 * 24 * 60 * 60 * 1000;
const MAX_PER_RUN = 40;

const supabaseUrl =
  process.env.SUPABASE_URL ||
  process.env.NEXT_PUBLIC_SUPABASE_URL ||
  process.env.VITE_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

function getSupabase() {
  return createClient(supabaseUrl, serviceRoleKey);
}

function actionTime(action) {
  const value = action?.created_at;
  const date = value ? new Date(value) : null;
  return date && !Number.isNaN(date.getTime()) ? date.getTime() : 0;
}

function isFormulesSentAction(action) {
  const type = String(action?.action || "");
  if (type === "email_formules") return true;
  const description = String(action?.description || "").toLowerCase();
  return type === "email_envoye" && description.includes("formules");
}

function isRelanceFormulesAction(action) {
  const type = String(action?.action || "");
  if (type === "relance_formules") return true;
  const description = String(action?.description || "").toLowerCase();
  return (
    (type === "relance" || type === "relance_1" || type === "relance_2") &&
    description.includes("formules")
  );
}

export async function processFormulesRelances({ now = Date.now() } = {}) {
  if (!supabaseUrl || !serviceRoleKey) {
    return { success: false, error: "Supabase non configuré", sent: 0 };
  }

  const supabase = getSupabase();
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

  const results = {
    success: true,
    scanned: due.length,
    sent: 0,
    skipped: 0,
    failed: 0,
    details: [],
  };

  for (const contact of due) {
    if (results.sent + results.failed >= MAX_PER_RUN) break;

    const { data: actions, error: actionsError } = await supabase
      .from("suivi_actions")
      .select("action, description, created_at")
      .eq("contact_id", contact.id)
      .order("created_at", { ascending: false })
      .limit(80);

    if (actionsError) {
      results.failed += 1;
      results.details.push({
        contactId: contact.id,
        error: actionsError.message,
      });
      continue;
    }

    const history = actions || [];
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
        error: sent.error?.message || sent.error || "envoi impossible",
      });
      await logAction(
        contact.id,
        contact.email,
        "note_ajoutee",
        `Échec relance automatique formules (5 jours) : ${sent.error || "erreur Resend"}`,
      );
      continue;
    }

    await updateContactStatus(contact.id, "relance_en_cours");
    await logAction(
      contact.id,
      contact.email,
      "relance_formules",
      "Relance automatique envoyée — pas de réponse au choix des formules après 5 jours",
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
