import {
  CALENDAR_TZ,
  compactSlot,
  findMatchingFreeSlot,
  formatSlotLabel,
  nowInCalendar,
} from "./calendar";

const DEFAULT_SUBJECT = "Votre projet d'études en Chine";

function extractJsonObject(text) {
  const trimmed = String(text || "").trim();
  const fenced = trimmed.match(/```(?:json)?\s*([\s\S]*?)```/i);
  const raw = (fenced ? fenced[1] : trimmed).trim();
  const start = raw.indexOf("{");
  const end = raw.lastIndexOf("}");
  if (start === -1 || end === -1 || end <= start) return null;
  try {
    return JSON.parse(raw.slice(start, end + 1));
  } catch {
    return null;
  }
}

function stripGreetingAndSignoff(body) {
  let text = String(body || "")
    .replace(/\r\n/g, "\n")
    .trim();
  text = text.replace(
    /^(bonjour|bonsoir|hello|hi)(\s+[^,\n]+)?[,\s]*/i,
    "",
  );
  text = text.replace(
    /\n+(cordialement|bien à vous|belle journée|l['’]équipe chinois en devenir)[\s\S]*$/i,
    "",
  );
  return text.trim();
}

function clip(value, max) {
  return String(value || "").trim().slice(0, max);
}

function compactContact(contact) {
  if (!contact) return {};
  return {
    prenom: clip(contact.prenom, 40),
    nom: clip(contact.nom, 40),
    domaine_etudes: clip(contact.domaine_etudes, 80),
    formule: clip(contact.formule, 80),
    suivi_statut: clip(contact.suivi_statut, 40),
  };
}

function sanitizeComposeLine(value, maxLen) {
  return clip(value, maxLen)
    .replace(/[\r\n\u0000-\u001f\u007f\u2028\u2029]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function sanitizeComposeBody(value) {
  return String(value || "")
    .replace(/\r\n/g, "\n")
    .replace(/[\u0000-\u0008\u000b\u000c\u000e-\u001f\u007f]/g, "")
    .trim()
    .slice(0, 6000);
}

function composeEmailFromParsed(parsed, fallbackText) {
  const body = stripGreetingAndSignoff(
    parsed?.body || (!parsed ? fallbackText : ""),
  );
  if (!body || body.length < 20) {
    return { ok: false, error: "Réponse IA inutilisable" };
  }
  const subject = sanitizeComposeLine(parsed?.subject, 180) || DEFAULT_SUBJECT;
  const title = sanitizeComposeLine(parsed?.title, 120) || subject;
  const subtitle = sanitizeComposeLine(parsed?.subtitle, 160);
  return {
    ok: true,
    subject,
    title,
    subtitle,
    body: sanitizeComposeBody(body),
  };
}

function eventToSlot(event) {
  if (!event?.starts_at) return null;
  return {
    starts_at: event.starts_at,
    ends_at: event.ends_at,
    label: formatSlotLabel(event.starts_at, event.ends_at),
    id: event.id || null,
  };
}

function calendarPromptBlock({ promptSlots = [], booked = [], contactAppointments = [] } = {}) {
  const clock = nowInCalendar();
  const free = promptSlots.map(compactSlot).filter(Boolean);
  const busy = (booked || []).slice(0, 24).map((event) => ({
    starts_at: event.starts_at,
    ends_at: event.ends_at,
    label: formatSlotLabel(event.starts_at, event.ends_at),
    title: clip(event.title, 80),
  }));
  const mine = (contactAppointments || []).map((event) => ({
    starts_at: event.starts_at,
    ends_at: event.ends_at,
    label: formatSlotLabel(event.starts_at, event.ends_at),
    title: clip(event.title, 80),
  }));

  return {
    timezone: CALENDAR_TZ,
    maintenant: clock.label,
    creneaux_libres: free,
    creneaux_occupes: busy,
    rdv_deja_pris_avec_cet_etudiant: mine,
  };
}

async function mammouthChat({ system, user, temperature = 0.3, maxTokens = 1800, timeoutMs = 30000 }) {
  const apiKey = process.env.MAMMOUTH_API_KEY;
  if (!apiKey) {
    return { ok: false, error: "Clé MAMMOUTH_API_KEY manquante" };
  }

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const response = await fetch("https://api.mammouth.ai/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: process.env.MAMMOUTH_MODEL || "minimax-m3",
        temperature,
        max_tokens: maxTokens,
        messages: [
          { role: "system", content: system },
          { role: "user", content: user },
        ],
      }),
      signal: controller.signal,
    });

    if (!response.ok) {
      return { ok: false, error: "Le service IA n'a pas répondu" };
    }

    const data = await response.json();
    const text = data?.choices?.[0]?.message?.content?.trim();
    if (!text) {
      return { ok: false, error: "Réponse IA vide" };
    }
    return { ok: true, text, json: extractJsonObject(text) };
  } catch (error) {
    if (error?.name === "AbortError") {
      return { ok: false, error: "Délai dépassé. Réessayez." };
    }
    return { ok: false, error: "Erreur IA" };
  } finally {
    clearTimeout(timer);
  }
}

function normalizeOfferedSlots(raw, freeSlots) {
  if (!Array.isArray(raw)) return [];
  const matched = [];
  for (const item of raw) {
    const chosen = {
      starts_at: item?.starts_at || item?.startsAt,
      ends_at: item?.ends_at || item?.endsAt,
    };
    const hit = findMatchingFreeSlot(chosen, freeSlots);
    if (hit && !matched.some((slot) => slot.starts_at === hit.starts_at)) {
      matched.push(compactSlot(hit));
    }
  }
  return matched.slice(0, 6);
}

export async function composeEmailWithAi({
  notes,
  contact,
  calendar = null,
} = {}) {
  const calendarBlock = calendar ? calendarPromptBlock(calendar) : null;
  const hasSlots = Boolean(calendarBlock?.creneaux_libres?.length);

  const result = await mammouthChat({
    system: `Tu rédiges des e-mails pour Chinois en Devenir, agence francophone d'accompagnement pour étudier en Chine.

Transforme les notes de l'administrateur en un e-mail professionnel, clair, chaleureux et rassurant.

Règles :
- Rédige dans la langue des notes (français par défaut).
- Ne jamais garantir une admission, une bourse ou un visa.
- Ne pas inventer de frais, dates, HSK, universités, programmes ou faits absents des notes, du profil ou du calendrier.
- Ne pas écrire « Bonjour » ni la signature : le template HTML les ajoute déjà.
- Paragraphes courts, sans markdown, sans listes à puces markdown.
- Le bandeau (title) est court. Le sous-titre est optionnel.
- Fuseau horaire des rendez-vous : ${CALENDAR_TZ} (heure de Pékin). Écris toujours « heure de Pékin » quand tu cites un créneau.
- Si les notes parlent d'un RDV, appel, visio ou disponibilité : propose 2 à 4 créneaux pris UNIQUEMENT dans creneaux_libres. Cite-les en toutes lettres (ex. mardi 2 septembre de 14h00 à 14h30, heure de Pékin). N'invente aucun horaire.
- Si creneaux_libres est vide et qu'un RDV est demandé, dis que l'agenda est complet sur la période et propose de revenir vers l'étudiant.
- Si les notes ne parlent pas de RDV, ignore le calendrier.
- Ne réserve aucun créneau : tu proposes seulement.

Réponds uniquement par un JSON valide :
{"subject":"...","title":"...","subtitle":"...","body":"...","offered_slots":[{"starts_at":"...ISO...","ends_at":"...ISO..."}]}

body : paragraphes séparés par une ligne vide.
offered_slots : uniquement des créneaux copiés depuis creneaux_libres (tableau vide sinon).`,
    user: `Profil étudiant (JSON) :
${JSON.stringify(compactContact(contact))}

Maintenant (heure de Pékin) : ${nowInCalendar().label}

Calendrier (JSON) :
${JSON.stringify(calendarBlock || { note: "calendrier indisponible" })}

Notes de l'administrateur :
${notes}`,
    temperature: 0.25,
    maxTokens: 1800,
  });

  if (!result.ok) return result;

  const composed = composeEmailFromParsed(result.json, result.text);
  if (!composed.ok) return composed;

  const offeredSlots = hasSlots
    ? normalizeOfferedSlots(
        result.json?.offered_slots,
        calendar.freeSlots || calendar.promptSlots || [],
      )
    : [];

  return {
    ...composed,
    offeredSlots,
  };
}

export async function analyzeReplyWithAi({
  replyText,
  contact,
  calendar = null,
  previousEmails = [],
} = {}) {
  const calendarBlock = calendar ? calendarPromptBlock(calendar) : null;
  const freeSlots = calendar?.freeSlots || calendar?.promptSlots || [];
  const ownSlots = (calendar?.contactAppointments || [])
    .map(eventToSlot)
    .filter(Boolean);

  const result = await mammouthChat({
    system: `Tu aides l'admin de Chinois en Devenir à traiter les réponses d'étudiants au sujet des rendez-vous.

Tu dois :
1. Décider si le message choisit / propose / refuse un créneau d'appel ou de visio.
2. Si l'étudiant choisit un horaire, le faire correspondre à un créneau de creneaux_libres (starts_at / ends_at identiques).
3. Rédiger un e-mail de réponse (même style que les templates) pour que l'admin le relise et l'envoie. Ne jamais envoyer toi-même.
4. Ne pas écrire « Bonjour » ni la signature.

Règles :
- Fuseau : ${CALENDAR_TZ} (heure de Pékin). Cite les horaires en toutes lettres + « heure de Pékin ».
- Si l'étudiant confirme le RDV déjà dans rdv_deja_pris_avec_cet_etudiant : kind = "confirmation", chosen_slot = ce RDV, slot_available = true. Confirme sans proposer d'autre horaire.
- Si l'étudiant propose UN AUTRE créneau qui est dans creneaux_libres : kind = "move", chosen_slot = le nouveau créneau, slot_available = true. Le mail confirme le déplacement et rappelle l'ancien horaire annulé.
- Si l'étudiant propose un autre créneau QUI N'EST PAS libre : kind = "reschedule", slot_available = false, chosen_slot = null. On garde l'éventuel RDV déjà posé. Propose 2 à 4 alternatives uniquement depuis creneaux_libres, et mentionne le RDV actuel s'il existe.
- Si le créneau demandé est dans creneaux_libres et qu'il n'y a pas encore de RDV : kind = "confirmation".
- Si ce n'est pas un message de RDV : is_appointment_reply = false, body peut être vide.
- Ne jamais inventer un horaire hors creneaux_libres (sauf confirmation d'un RDV déjà posé avec cet étudiant).
- Ne jamais garantir admission / bourse / visa.

JSON uniquement :
{"is_appointment_reply":true,"kind":"confirmation","student_preference":"...","chosen_slot":{"starts_at":"...","ends_at":"..."}|null,"slot_available":true,"confidence":0.0,"reason":"...","subject":"...","title":"...","subtitle":"...","body":"...","offered_slots":[]}`,
    user: `Profil étudiant (JSON) :
${JSON.stringify(compactContact(contact))}

Maintenant : ${nowInCalendar().label}

Calendrier (JSON) :
${JSON.stringify(calendarBlock || { note: "calendrier indisponible" })}

Derniers emails envoyés par l'admin :
${JSON.stringify((previousEmails || []).slice(0, 4))}

Réponse de l'étudiant :
${clip(replyText, 4000)}`,
    temperature: 0.15,
    maxTokens: 1800,
  });

  if (!result.ok) return result;

  const parsed = result.json || {};
  const isAppointment = Boolean(parsed.is_appointment_reply);
  if (!isAppointment) {
    return {
      ok: true,
      isAppointmentReply: false,
      kind: null,
      confidence: Number(parsed.confidence) || 0,
      reason: sanitizeComposeLine(parsed.reason, 300),
    };
  }

  const chosenRaw = parsed.chosen_slot || null;
  const freeMatch = chosenRaw ? findMatchingFreeSlot(chosenRaw, freeSlots) : null;
  const ownMatch = chosenRaw ? findMatchingFreeSlot(chosenRaw, ownSlots) : null;
  const matched = freeMatch || ownMatch;
  const slotAvailable = Boolean(matched);
  const kind =
    ownMatch && !freeMatch
      ? "confirmation"
      : freeMatch && ownSlots.length && !ownMatch
        ? "move"
        : parsed.kind === "reschedule" || !slotAvailable
          ? "reschedule"
          : parsed.kind === "move" && freeMatch
            ? "move"
            : parsed.kind === "offer"
              ? "offer"
              : "confirmation";

  const composed = composeEmailFromParsed(parsed, result.text);
  if (!composed.ok) {
    return { ok: false, error: composed.error };
  }

  const offeredSlots = normalizeOfferedSlots(parsed.offered_slots, freeSlots);

  return {
    ok: true,
    isAppointmentReply: true,
    kind,
    confidence: Math.max(0, Math.min(1, Number(parsed.confidence) || 0)),
    reason: sanitizeComposeLine(parsed.reason, 300),
    studentPreference: sanitizeComposeLine(parsed.student_preference, 240),
    chosenSlot: slotAvailable ? compactSlot(matched) : null,
    existingSlot: ownSlots[0] || null,
    slotAvailable,
    offeredSlots,
    subject: composed.subject,
    title: composed.title,
    subtitle: composed.subtitle,
    body: composed.body,
  };
}

export { extractJsonObject, sanitizeComposeBody, sanitizeComposeLine };
