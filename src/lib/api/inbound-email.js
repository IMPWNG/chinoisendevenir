/* eslint-disable no-undef */
import { Resend } from "resend";
import { createClient } from "@supabase/supabase-js";
import { CONTACT_FROM, CONTACT_FROM_EMAIL, ADMIN_NOTIFY_EMAIL } from "../emailConfig.js";
import {
  sendTemplatedEmail,
  updateContactStatus,
  logAction,
} from "./auto-reply.js";
import { getChosenFormule } from "../studentProgress.js";

const supabaseUrl =
  process.env.SUPABASE_URL ||
  process.env.NEXT_PUBLIC_SUPABASE_URL ||
  process.env.VITE_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const resendApiKey =
  process.env.RESEND_API_KEY || process.env.VITE_RESEND_API_KEY;

const supabase = createClient(supabaseUrl, serviceRoleKey);
const resend = new Resend(resendApiKey);

const INTEREST_KEYWORDS = [
  "je souhaite recevoir les informations",
  "je souhaite recevoir",
  "je veux recevoir",
  "je souhaite l'accompagnement",
  "je souhaite l accompagnement",
  "oui je suis intéressé",
  "oui je suis interesse",
  "oui je suis intéressée",
  "je suis intéressé",
  "je suis interesse",
  "ça m'intéresse",
  "ca m'interesse",
  "ca minteresse",
  "informations sur l'accompagnement",
  "informations sur l accompagnement",
  "intéressé",
  "interessee",
  "interesse",
  "continuer",
  "je continue",
  "envoyez-moi",
  "envoie moi",
  "d'accord",
  "daccord",
  "ok",
  "oui",
];

const FORMULES = [
  {
    key: "orientation",
    label: "Orientation (50€)",
    patterns: [
      /\bformule\s*1\b/i,
      /\borientation\b/i,
      /1️⃣/,
      /\b1\s*[-–:.]?\s*orientation\b/i,
      /^[\s"'«»]*1[\s"'«».!]*$/m,
    ],
  },
  {
    key: "candidature",
    label: "Accompagnement candidature (300€)",
    patterns: [
      /\bformule\s*2\b/i,
      /\baccompagnement\s+candidature\b/i,
      /\bcandidature\b/i,
      /2️⃣/,
      /\b2\s*[-–:.]?\s*(accompagnement|candidature)\b/i,
      /^[\s"'«»]*2[\s"'«».!]*$/m,
    ],
  },
  {
    key: "complet",
    label: "Accompagnement complet (500€)",
    patterns: [
      /\bformule\s*3\b/i,
      /\baccompagnement\s+complet\b/i,
      /\bcomplet\b/i,
      /3️⃣/,
      /\b3\s*[-–:.]?\s*(accompagnement|complet)\b/i,
      /^[\s"'«»]*3[\s"'«».!]*$/m,
    ],
  },
];

const FORMULE_ALREADY_CHOSEN = new Set([
  "formule_choisie",
  "offre_envoyée",
  "attente_paiement",
  "client_payé",
  "appel_réservé",
  "dossier_préparation",
  "candidature_envoyée",
  "admission_reçue",
  "dossier_terminé",
]);

function isIgnoredSender(email) {
  const value = String(email || "").toLowerCase();
  if (!value) return true;
  if (value.endsWith("@google.com")) return true;
  if (value.endsWith("@zenaek.resend.app")) return true;
  if (value.includes("mailer-daemon")) return true;
  if (value.includes("noreply") || value.includes("no-reply")) return true;
  return false;
}

function isLoopEmail(subject, envelopeFrom) {
  const sub = String(subject || "");
  if (sub.startsWith("📩")) return true;
  if (isOurMailbox(envelopeFrom)) return true;
  if (String(envelopeFrom || "").endsWith("@zenaek.resend.app")) return true;
  return false;
}

function isOurMailbox(email) {
  const value = String(email || "").toLowerCase();
  return (
    value === CONTACT_FROM_EMAIL ||
    value === ADMIN_NOTIFY_EMAIL.toLowerCase() ||
    value.endsWith("@chinoisendevenir.com")
  );
}

function extractForwardedSender(text, headers = {}) {
  const headerBag = headers || {};
  const headerCandidates = [
    headerBag["reply-to"],
    headerBag.reply_to,
    headerBag["x-original-from"],
    headerBag["resent-from"],
    headerBag.from,
  ];

  for (const candidate of headerCandidates) {
    const email = extractEmailAddress(candidate);
    if (email && !isOurMailbox(email) && !isIgnoredSender(email)) {
      return email;
    }
  }

  const body = String(text || "");
  const patterns = [
    /Forwarded message[\s\S]{0,300}?From:\s*(.+)/i,
    /Message transféré[\s\S]{0,300}?De\s*:\s*(.+)/i,
    /\nFrom:\s*(.+@.+\..+)/i,
    /\nDe\s*:\s*(.+@.+\..+)/i,
  ];

  for (const pattern of patterns) {
    const match = body.match(pattern);
    if (!match) continue;
    const email = extractEmailAddress(match[1]);
    if (email && !isOurMailbox(email) && !isIgnoredSender(email)) {
      return email;
    }
  }

  return "";
}

function extractEmailAddress(from) {
  if (!from) return "";
  if (Array.isArray(from)) return extractEmailAddress(from[0]);
  if (typeof from === "object") {
    return String(from.email || from.address || "").trim().toLowerCase();
  }
  const value = String(from).trim();
  const match = value.match(/<([^>]+)>/);
  return (match ? match[1] : value).trim().toLowerCase();
}

function htmlToText(html) {
  return String(html || "")
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<\/p>/gi, "\n")
    .replace(/<\/div>/gi, "\n")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/gi, " ")
    .replace(/&amp;/gi, "&")
    .replace(/&lt;/gi, "<")
    .replace(/&gt;/gi, ">")
    .replace(/[ \t]{2,}/g, " ")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

function extractLatestReply(text) {
  if (!text) return "";
  let body = String(text).replace(/\r\n/g, "\n");
  const splitters = [
    /\s+On (Mon|Tue|Wed|Thu|Fri|Sat|Sun),[\s\S]*$/i,
    /\nOn .+ wrote:\s*\n?/i,
    /\s+Le .+? a écrit\s*:[\s\S]*$/i,
    /\nLe .+? a écrit\s*:/i,
    /\n-----Original Message-----/i,
    /\n________________________________/,
    /\nDe\s*:/i,
    /\nFrom\s*:/i,
    /\n-{2,} ?message d'origine/i,
  ];

  for (const splitter of splitters) {
    const parts = body.split(splitter);
    if (parts.length > 1) body = parts[0];
  }

  return body
    .split("\n")
    .filter((line) => !line.trim().startsWith(">"))
    .join("\n")
    .trim();
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function normalizeText(text) {
  return String(text || "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/['’]/g, "'");
}

function detectFormule(text) {
  const matches = FORMULES.filter((formule) =>
    formule.patterns.some((pattern) => pattern.test(text)),
  );
  if (matches.length === 1) return matches[0];
  if (matches.length > 1) {
    return (
      matches.find((item) => /formule\s*[123]/i.test(text)) || matches[0]
    );
  }
  return null;
}

function detectInterest(text) {
  const normalized = normalizeText(text);
  return INTEREST_KEYWORDS.some((keyword) =>
    normalized.includes(normalizeText(keyword)),
  );
}

function looksLikeQuestion(text) {
  const normalized = normalizeText(text);
  return (
    text.includes("?") ||
    normalized.includes("comment") ||
    normalized.includes("combien") ||
    normalized.includes("prix") ||
    normalized.includes("question") ||
    normalized.includes("pouvez-vous") ||
    normalized.includes("est-ce que") ||
    normalized.includes("j'aimerais savoir")
  );
}

function truncate(text, max = 1200) {
  const value = String(text || "").trim();
  if (value.length <= max) return value;
  return `${value.slice(0, max)}…`;
}

async function fetchReceivedEmail(emailId) {
  if (!emailId) return null;

  for (let attempt = 1; attempt <= 4; attempt += 1) {
    try {
      if (resend.emails?.receiving?.get) {
        const { data, error } = await resend.emails.receiving.get(emailId);
        if (!error && data) return data;
        if (error) {
          console.warn(
            `⚠️ Resend receiving.get (${attempt}/4):`,
            error.message || error,
          );
        }
      }
    } catch (error) {
      console.warn("⚠️ SDK receiving.get:", error.message);
    }

    try {
      const response = await fetch(
        `https://api.resend.com/emails/receiving/${emailId}`,
        {
          headers: { Authorization: `Bearer ${resendApiKey}` },
        },
      );
      if (response.ok) {
        return await response.json();
      }
      console.warn(
        `⚠️ HTTP receiving (${attempt}/4):`,
        response.status,
        await response.text(),
      );
    } catch (error) {
      console.warn("⚠️ Fetch receiving:", error.message);
    }

    if (attempt < 4) await sleep(800 * attempt);
  }

  return null;
}

async function findContactByEmail(email) {
  const { data: rows, error } = await supabase
    .from("contacts")
    .select("*")
    .ilike("email", email)
    .order("created_at", { ascending: true })
    .limit(1);

  if (error) {
    console.error("❌ Recherche contact:", error.message);
    return null;
  }

  return rows?.[0] || null;
}

async function saveChosenFormule(contact, formuleLabel) {
  const noteLine = `Formule choisie: ${formuleLabel}`;
  const notes = contact.notes_admin
    ? contact.notes_admin.includes(noteLine)
      ? contact.notes_admin
      : `${contact.notes_admin}\n${noteLine}`
    : noteLine;

  const payloads = [
    {
      formule: formuleLabel,
      suivi_statut: "formule_choisie",
      notes_admin: notes,
      updated_at: new Date().toISOString(),
    },
    {
      formule: formuleLabel,
      suivi_statut: "formule_choisie",
      notes_admin: notes,
    },
    {
      suivi_statut: "formule_choisie",
      notes_admin: notes,
      updated_at: new Date().toISOString(),
    },
    { suivi_statut: "formule_choisie", notes_admin: notes },
    { suivi_statut: "formule_choisie" },
  ];

  for (const payload of payloads) {
    const { error } = await supabase
      .from("contacts")
      .update(payload)
      .eq("id", contact.id);
    if (!error) return true;
    console.warn("⚠️ Update formule:", error.message);
  }

  await updateContactStatus(contact.id, "formule_choisie");
  return false;
}

async function notifyAdmin({ contact, subject, text, intent }) {
  try {
    await resend.emails.send({
      from: CONTACT_FROM,
      to: ADMIN_NOTIFY_EMAIL,
      replyTo: contact.email,
      subject: `📩 Réponse de ${contact.prenom || ""} ${contact.nom || ""} — ${intent}`,
      html: `
        <p><strong>${contact.prenom || ""} ${contact.nom || ""}</strong> (${contact.email})</p>
        <p><strong>Sujet :</strong> ${subject || "—"}</p>
        <p><strong>Intent détecté :</strong> ${intent}</p>
        <p><strong>Statut actuel :</strong> ${contact.suivi_statut || "—"}</p>
        <hr>
        <pre style="white-space:pre-wrap;font-family:inherit">${truncate(text, 4000)}</pre>
      `,
    });
  } catch (error) {
    console.warn("⚠️ Notif admin inbound:", error.message);
  }
}

export async function processInboundEmail(payload) {
  const data = payload?.data || {};
  const emailId = data.email_id || data.id;
  const webhookFrom = extractEmailAddress(data.from);
  const webhookSubject = data.subject || "";

  console.log("📨 Inbound Resend", {
    type: payload?.type,
    emailId,
    from: webhookFrom,
    subject: webhookSubject,
  });

  if (payload?.type && payload.type !== "email.received") {
    return {
      success: true,
      ignored: true,
      message: `Event ignored: ${payload.type}`,
      httpStatus: 200,
    };
  }

  const received = await fetchReceivedEmail(emailId);
  const envelopeFrom = extractEmailAddress(received?.from || webhookFrom);
  const subject = received?.subject || webhookSubject;
  const rawText = received?.text || htmlToText(received?.html) || data.text || "";
  const replyText = extractLatestReply(rawText);
  const from =
    extractForwardedSender(rawText, received?.headers) || envelopeFrom;

  if (!from) {
    return {
      success: false,
      message: "Expéditeur introuvable",
      httpStatus: 200,
    };
  }

  if (
    isIgnoredSender(from) ||
    isIgnoredSender(envelopeFrom) ||
    isLoopEmail(subject, envelopeFrom)
  ) {
    return {
      success: true,
      ignored: true,
      message: "Email système ignoré (anti-boucle)",
      from,
      httpStatus: 200,
    };
  }

  const contact =
    (await findContactByEmail(from)) ||
    (envelopeFrom && envelopeFrom !== from
      ? await findContactByEmail(envelopeFrom)
      : null);

  if (!contact) {
    console.log("⚠️ Contact non trouvé:", from);
    return {
      success: true,
      ignored: true,
      message: "Contact non trouvé",
      from,
      httpStatus: 200,
    };
  }

  const formule = detectFormule(replyText);
  const interest = detectInterest(replyText);
  const question = looksLikeQuestion(replyText);
  const statut = contact.suivi_statut || "";
  const existingFormule = getChosenFormule(contact);

  let intent = "reponse_libre";
  if (formule) intent = "choix_formule";
  else if (interest) intent = "demande_formules";
  else if (question) intent = "question";

  await logAction(
    contact.id,
    contact.email,
    "reponse_client",
    `Email reçu (${subject || "sans sujet"}) [${intent}] : ${truncate(replyText || rawText || "(vide)")}`,
  );

  if (formule) {
    const alreadySameFormule = existingFormule === formule.label;

    if (!alreadySameFormule) {
      const sent = await sendTemplatedEmail(contact, "formule_confirmee", {
        formuleLabel: formule.label,
      });
      if (!sent.success) {
        await logAction(
          contact.id,
          contact.email,
          "note_ajoutee",
          `Échec envoi confirmation formule (${formule.label}) : ${sent.error || "erreur Resend"}`,
        );
        return {
          success: false,
          message: "Erreur envoi confirmation formule",
          error: sent.error,
          httpStatus: 500,
        };
      }
    }

    await saveChosenFormule(contact, formule.label);
    if (!alreadySameFormule) {
      await logAction(
        contact.id,
        contact.email,
        "formule_choisie",
        `Formule choisie automatiquement : ${formule.label}`,
      );
    }

    return {
      success: true,
      message: alreadySameFormule
        ? "Formule déjà enregistrée"
        : "Formule confirmée et email envoyé",
      contact: contact.id,
      formule: formule.label,
      status: "formule_choisie",
      httpStatus: 200,
    };
  }

  if (
    interest &&
    statut !== "choix_des_formules" &&
    !FORMULE_ALREADY_CHOSEN.has(statut)
  ) {
    const sent = await sendTemplatedEmail(contact, "formules_presentation");
    if (!sent.success) {
      return {
        success: false,
        message: "Erreur envoi des formules",
        error: sent.error,
        httpStatus: 500,
      };
    }

    await updateContactStatus(contact.id, "choix_des_formules");
    await logAction(
      contact.id,
      contact.email,
      "email_formules",
      "Email des formules envoyé automatiquement après réponse du prospect",
    );

    return {
      success: true,
      message: "Formules envoyées",
      contact: contact.id,
      status: "choix_des_formules",
      httpStatus: 200,
    };
  }

  return {
    success: true,
    message: question
      ? "Réponse enregistrée (question détectée, pas d'email automatique)"
      : "Réponse enregistrée sans email automatique",
    contact: contact.id,
    intent,
    httpStatus: 200,
  };
}
