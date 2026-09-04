/* eslint-disable no-undef */
import { createHmac, timingSafeEqual } from "crypto";
import { createClient } from "@supabase/supabase-js";
import {
  logAction,
  updateContactStatus,
} from "./auto-reply.js";
import {
  detectFormule,
  detectInterest,
  looksLikeQuestion,
  saveChosenFormule,
  FORMULE_ALREADY_CHOSEN,
  truncate,
} from "./inbound-email.js";
import { getChosenFormule } from "../studentProgress.js";
import { phonesMatch } from "../whatsapp/messages.js";
import { getWhatsAppConfig } from "../whatsapp/cloud.js";
import { sendWhatsAppToContact } from "./whatsapp-send.js";

const supabaseUrl =
  process.env.SUPABASE_URL ||
  process.env.NEXT_PUBLIC_SUPABASE_URL ||
  process.env.VITE_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(supabaseUrl, serviceRoleKey);

export function verifyWhatsAppSignature(rawBody, signatureHeader, appSecret) {
  if (!appSecret) return false;
  const expected = `sha256=${createHmac("sha256", appSecret)
    .update(rawBody)
    .digest("hex")}`;
  const received = String(signatureHeader || "");
  if (!received) return false;
  const a = Buffer.from(expected);
  const b = Buffer.from(received);
  if (a.length !== b.length) return false;
  return timingSafeEqual(a, b);
}

function extractIncomingText(message) {
  if (!message) return "";
  if (message.type === "text") return message.text?.body || "";
  if (message.type === "button") {
    return message.button?.text || message.button?.payload || "";
  }
  if (message.type === "interactive") {
    return (
      message.interactive?.button_reply?.title ||
      message.interactive?.list_reply?.title ||
      message.interactive?.button_reply?.id ||
      ""
    );
  }
  if (message.image?.caption) return message.image.caption;
  if (message.video?.caption) return message.video.caption;
  if (message.document?.caption) return message.document.caption;
  if (message.type) return `[${message.type}]`;
  return "";
}

function collectIncomingMessages(body) {
  const messages = [];
  for (const entry of body?.entry || []) {
    for (const change of entry.changes || []) {
      if (change.field && change.field !== "messages") continue;
      const value = change.value || {};
      for (const message of value.messages || []) {
        messages.push({
          message,
          contacts: value.contacts || [],
          phoneNumberId: value.metadata?.phone_number_id,
        });
      }
    }
  }
  return messages;
}

async function findContactByWhatsAppId(waId) {
  const incoming = String(waId || "").replace(/\D/g, "");
  if (!incoming) return null;

  const { data: rows, error } = await supabase
    .from("contacts")
    .select("*")
    .not("phone", "is", null);

  if (error) {
    console.error("❌ Recherche contact WhatsApp:", error.message);
    return null;
  }

  return (rows || []).find((contact) =>
    phonesMatch(contact.phone, incoming, contact.pays),
  ) || null;
}

export async function processIncomingWhatsApp(body) {
  const incoming = collectIncomingMessages(body);
  if (incoming.length === 0) {
    return { success: true, ignored: true, message: "Aucun message" };
  }

  const results = [];
  for (const item of incoming) {
    results.push(await handleOneIncoming(item));
  }

  return { success: true, results };
}

async function handleOneIncoming({ message, contacts }) {
  const from = message.from || contacts[0]?.wa_id;
  const text = extractIncomingText(message).trim();
  const contact = await findContactByWhatsAppId(from);

  if (!contact) {
    console.log("⚠️ Contact WhatsApp non trouvé:", from);
    return { ignored: true, message: "Contact non trouvé", from };
  }

  const formule = detectFormule(text);
  const interest = detectInterest(text);
  const question = looksLikeQuestion(text);
  const statut = contact.suivi_statut || "";
  const existingFormule = getChosenFormule(contact);

  let intent = "reponse_libre";
  if (formule) intent = "choix_formule";
  else if (interest) intent = "demande_formules";
  else if (question) intent = "question";

  await logAction(
    contact.id,
    contact.email,
    "reponse_whatsapp",
    `WhatsApp reçu [${intent}] : ${truncate(text || "(vide)")}`,
  );

  if (formule) {
    const alreadySameFormule = existingFormule === formule.label;
    if (!alreadySameFormule) {
      const sent = await sendWhatsAppToContact(contact, "formule_confirmee", {
        formuleLabel: formule.label,
      });
      if (!sent.success) {
        await logAction(
          contact.id,
          contact.email,
          "note_ajoutee",
          `Échec confirmation WhatsApp (${formule.label}) : ${sent.error || "erreur"}`,
        );
      }
    }

    await saveChosenFormule(contact, formule.label);
    if (!alreadySameFormule) {
      await logAction(
        contact.id,
        contact.email,
        "formule_choisie",
        `Formule choisie via WhatsApp : ${formule.label}`,
      );
    }

    return {
      contact: contact.id,
      intent,
      formule: formule.label,
    };
  }

  if (
    interest &&
    statut !== "choix_des_formules" &&
    !FORMULE_ALREADY_CHOSEN.has(statut)
  ) {
    const sent = await sendWhatsAppToContact(contact, "formules_presentation");
    if (sent.success) {
      await updateContactStatus(contact.id, "choix_des_formules");
      await logAction(
        contact.id,
        contact.email,
        "whatsapp_formules",
        "Formules envoyées automatiquement après réponse WhatsApp",
      );
    }
    return { contact: contact.id, intent, auto: "formules" };
  }

  return { contact: contact.id, intent };
}

export function verifySubscribeChallenge(searchParams) {
  const config = getWhatsAppConfig();
  const mode = searchParams.get("hub.mode");
  const token = searchParams.get("hub.verify_token");
  const challenge = searchParams.get("hub.challenge");

  if (
    mode === "subscribe" &&
    config.verifyToken &&
    token &&
    token === config.verifyToken
  ) {
    return { ok: true, challenge };
  }

  return { ok: false };
}
