import {
  CALENDAR_TZ,
  addDaysYmd,
  compactSlot,
  filterSlotsByHints,
  findMatchingFreeSlot,
  formatSlotLabel,
  formatYmd,
  nowInCalendar,
  parseAvailabilityHints,
  pickSpreadSlots,
} from "./calendar";

const DEFAULT_SUBJECT = "Votre projet d'études en Chine";

function clip(value, max) {
  return String(value || "").trim().slice(0, max);
}

function extractMessageText(payload) {
  const choice = payload?.choices?.[0] || {};
  const message = choice.message || {};
  const parts = [];

  const push = (value) => {
    if (typeof value === "string" && value.trim()) parts.push(value);
  };

  if (typeof message.content === "string") push(message.content);
  else if (Array.isArray(message.content)) {
    for (const part of message.content) {
      if (typeof part === "string") push(part);
      else push(part?.text || part?.content || part?.value);
    }
  }

  push(message.reasoning_content);
  push(message.reasoning);
  push(message.text);
  push(choice.text);

  return parts.join("\n").trim();
}

function closeTruncatedJson(input) {
  let inStr = false;
  let escape = false;
  const stack = [];
  let out = "";
  for (const ch of String(input || "")) {
    out += ch;
    if (inStr) {
      if (escape) escape = false;
      else if (ch === "\\") escape = true;
      else if (ch === '"') inStr = false;
      continue;
    }
    if (ch === '"') inStr = true;
    else if (ch === "{") stack.push("}");
    else if (ch === "[") stack.push("]");
    else if (ch === "}" || ch === "]") stack.pop();
  }
  if (inStr) out += '"';
  while (stack.length) out += stack.pop();
  return out;
}

function unescapeJsonString(value) {
  try {
    return JSON.parse(`"${String(value)}"`);
  } catch {
    return String(value || "")
      .replaceAll("\\n", "\n")
      .replaceAll('\\"', '"')
      .replaceAll("\\\\", "\\");
  }
}

function grabJsonString(text, key) {
  const source = String(text || "");
  const complete = source.match(
    new RegExp(`"${key}"\\s*:\\s*"((?:\\\\.|[^"\\\\])*)"`),
  );
  if (complete) return unescapeJsonString(complete[1]);

  const partial = source.match(new RegExp(`"${key}"\\s*:\\s*"([\\s\\S]*)`));
  if (!partial) return "";
  let raw = partial[1];
  raw = raw.replace(/"\s*,\s*"[a-z_]+"\s*:[\s\S]*$/i, "");
  raw = raw.replace(/"\s*}\s*$/g, "");
  raw = raw.replace(/```[\s\S]*$/g, "");
  return unescapeJsonString(raw.replace(/"\s*$/, ""));
}

export function extractJsonObject(text) {
  const trimmed = String(text || "").trim();
  if (!trimmed) return null;
  const fenced = trimmed.match(/```(?:json)?\s*([\s\S]*?)```/i);
  const raw = (fenced ? fenced[1] : trimmed).trim();
  const start = raw.indexOf("{");
  if (start === -1) return null;
  const end = raw.lastIndexOf("}");
  const slice = end > start ? raw.slice(start, end + 1) : raw.slice(start);
  const candidates = [
    slice,
    slice.replace(/,\s*([}\]])/g, "$1"),
    closeTruncatedJson(slice.replace(/,\s*([}\]])/g, "$1")),
  ];
  for (const candidate of candidates) {
    try {
      const parsed = JSON.parse(candidate);
      if (parsed && typeof parsed === "object") return parsed;
    } catch {
      /* try next */
    }
  }

  const subject = grabJsonString(raw, "subject");
  const body = grabJsonString(raw, "body");
  if (!subject && !body) return null;
  return {
    subject,
    title: grabJsonString(raw, "title"),
    subtitle: grabJsonString(raw, "subtitle"),
    body,
  };
}

function looksLikeJsonBlob(text) {
  const value = String(text || "").trim();
  return (
    /^```/.test(value) ||
    /^\{\s*"/.test(value) ||
    /"subject"\s*:/.test(value)
  );
}

function stripGreetingAndSignoff(body) {
  let text = String(body || "")
    .replace(/\r\n/g, "\n")
    .trim();
  if (looksLikeJsonBlob(text)) {
    const parsed = extractJsonObject(text);
    if (parsed?.body) text = String(parsed.body).trim();
  }
  text = text.replace(/^```(?:json)?\s*/i, "").replace(/\s*```$/g, "");
  text = text.replace(
    /^(bonjour|bonsoir|hello|hi)(\s+[^,\n]+)?[,\s]*/i,
    "",
  );
  text = text.replace(
    /^(madame|monsieur|mademoiselle|mlle|m\.|mr\.?|cher[eès]*)\s+[^\n,]{1,50},?\s*/i,
    "",
  );
  text = text.replace(
    /\n+(cordialement|bien à vous|belle journée|l['’]équipe chinois en devenir)[\s\S]*$/i,
    "",
  );
  return text.trim();
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
  const fromJson = parsed?.body ? parsed.body : "";
  const fallback = looksLikeJsonBlob(fallbackText) ? "" : fallbackText;
  const body = stripGreetingAndSignoff(fromJson || fallback);
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

function notesWantAppointment(notes) {
  return /\b(rdv|rendez[-\s]?vous|appel|visio|cr[eé]neau|dispo|disponib|t[eé]l[eé]phone|call)\b/i.test(
    String(notes || ""),
  );
}

function composeModels() {
  const names = [
    process.env.MAMMOUTH_COMPOSE_MODEL,
    "gpt-4.1-nano",
    "openai/gpt-4.1-nano",
    "gpt-4o-mini",
  ].filter(Boolean);
  return [...new Set(names)];
}

async function mammouthChat({
  system,
  user,
  temperature = 0.7,
  maxTokens = 4000,
  timeoutMs = 45000,
  retries = 1,
  models = composeModels(),
} = {}) {
  const apiKey = process.env.MAMMOUTH_API_KEY;
  if (!apiKey) {
    return { ok: false, error: "Clé MAMMOUTH_API_KEY manquante" };
  }

  let lastError = "Réponse IA vide";

  for (const model of models) {
    for (let attempt = 0; attempt <= retries; attempt += 1) {
      const controller = new AbortController();
      const timer = setTimeout(() => controller.abort(), timeoutMs);
      const compact = attempt > 0;
      try {
        const response = await fetch("https://api.mammouth.ai/v1/chat/completions", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${apiKey}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            model,
            temperature: compact ? 0.3 : temperature,
            max_tokens: maxTokens,
            messages: compact
              ? [
                  { role: "system", content: system },
                  { role: "user", content: user },
                  {
                    role: "user",
                    content:
                      "Réponds maintenant par un JSON compact valide uniquement. Pas de markdown, pas de ``` . Sauts de ligne dans body écrits \\n\\n.",
                  },
                ]
              : [
                  { role: "system", content: system },
                  { role: "user", content: user },
                ],
          }),
          signal: controller.signal,
        });

        const data = await response.json().catch(() => ({}));
        if (!response.ok) {
          lastError =
            data?.error?.message || data?.message || "Le service IA n'a pas répondu";
          const missingModel = /model|not found|unknown|invalid/i.test(String(lastError));
          if (missingModel) break;
          continue;
        }

        const text = extractMessageText(data);
        if (!text) {
          lastError = "Réponse IA vide";
          continue;
        }

        const json = extractJsonObject(text);
        if (json) return { ok: true, text, json, model };
        lastError = "Réponse IA inutilisable";
      } catch (error) {
        if (error?.name === "AbortError") {
          lastError = "Délai dépassé. Réessayez.";
        } else {
          lastError = "Erreur IA";
        }
      } finally {
        clearTimeout(timer);
      }
    }
  }

  return { ok: false, error: lastError };
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

function slotsMentionedInBody(slots, body) {
  const text = String(body || "").toLowerCase();
  return (slots || []).filter((slot) => {
    const hm = String(slot.startHm || "").replace(/^0/, "");
    const day = String(slot.label || "").split(" de ")[0]?.toLowerCase();
    return (
      (hm && text.includes(slot.startHm)) ||
      (hm && text.includes(hm.replace(":", "h"))) ||
      (day && text.includes(day))
    );
  });
}

function notesUseTutoiement(notes) {
  return /\b(tu|toi|ton|ta|tes|t['’]es)\b/i.test(String(notes || ""));
}

function selectComposeSlots(freeSlots, notes, now) {
  const hints = parseAvailabilityHints(notes, now);
  let matched = filterSlotsByHints(freeSlots, hints);
  let exact = Boolean(hints.hasHints && matched.length);
  if (hints.hasHints && matched.length === 0) {
    const relaxed = {
      ...hints,
      fromYmd: formatYmd(now),
      toYmd: addDaysYmd(formatYmd(now), 14),
      hasHints: true,
    };
    matched = filterSlotsByHints(freeSlots, relaxed);
    exact = false;
  }
  if (!matched.length) matched = freeSlots || [];
  return { slots: pickSpreadSlots(matched, 4), exact, hints };
}

export async function composeEmailWithAi({
  notes,
  contact,
  calendar = null,
} = {}) {
  const wantRdv = notesWantAppointment(notes);
  const now = new Date();
  const selected = wantRdv
    ? selectComposeSlots(calendar?.freeSlots || calendar?.promptSlots || [], notes, now)
    : { slots: [], exact: true, hints: null };
  const slotsToOffer = selected.slots;
  const existingLabels = (calendar?.contactAppointments || []).map((event) =>
    formatSlotLabel(event.starts_at, event.ends_at),
  );

  const slotLines = slotsToOffer
    .map((slot, index) => `${index + 1}. ${slot.label}`)
    .join("\n");
  const tutoyer = notesUseTutoiement(notes);

  const result = await mammouthChat({
    system: `Tu es rédacteur pour Chinois en Devenir, agence francophone d'accompagnement aux études en Chine.

Ta seule tâche : reformuler les notes de l'administrateur en un e-mail naturel, clair et chaleureux. Ce n'est pas un mail marketing.

Le template HTML ajoute déjà « Bonjour {prénom}, » et la signature. Donc :
- n'écris JAMAIS Bonjour, Madame, Monsieur, le prénom ou le nom.
- n'écris JAMAIS la signature.

${tutoyer ? "Les notes tutoient : tutoie aussi (tu / toi / ton)." : "Vouvoie (vous / votre)."}
Ton : humain, concret, polie, comme un conseiller qui écrit vite mais bien. 2 à 4 paragraphes courts.

Rendez-vous :
- Heure de Pékin uniquement.
- Propose UNIQUEMENT les créneaux numérotés fournis. Recopie les dates en toutes lettres.
- Si les notes demandent mercredi-vendredi 9h-11h, ne propose pas un mardi ni 13h.
- S'il n'y a pas de créneau, dis que vous reviendrez vers la personne. N'invente aucun horaire.

N'invente rien (filière, HSK, frais, université, « merci pour votre message » si ce n'est pas dans les notes).

Exemple de body (sans salutation) :
"Afin de faire le point sur votre dossier et de mieux comprendre votre projet, nous aimerions convenir d'un rendez-vous cette semaine.\\n\\nAuriez-vous une disponibilité sur l'un de ces créneaux, heure de Pékin :\\n- mercredi 3 septembre de 9h00 à 9h30\\n- jeudi 4 septembre de 10h00 à 10h30\\n\\nRépondez à cet e-mail avec le créneau qui vous convient."

JSON uniquement, sans markdown :
{"subject":"...","title":"...","subtitle":"...","body":"..."}`,
    user: `Prénom déjà dans le template (ne pas le répéter) : ${contact?.prenom || ""}
Maintenant : ${nowInCalendar().label}

${
  wantRdv
    ? `${selected.exact ? "Créneaux qui correspondent à la demande (propose 2 à 4 parmi ceux-ci) :" : "Aucun créneau n'était libre dans la fenêtre demandée. Propose les plus proches ci-dessous et dis-le brièvement :"}
${slotLines || "Aucun créneau libre."}
RDV déjà posé avec cette personne : ${existingLabels.join(" ; ") || "aucun"}`
    : "Pas de rendez-vous : ignore le calendrier."
}

Notes à reformuler :
${notes}`,
    temperature: 0.7,
    maxTokens: 4000,
    retries: 1,
  });

  if (!result.ok) return result;

  const composed = composeEmailFromParsed(result.json, result.text);
  if (!composed.ok) return composed;

  const mentioned = slotsMentionedInBody(slotsToOffer, composed.body);
  const offeredSlots = wantRdv
    ? (mentioned.length ? mentioned : slotsToOffer).map(compactSlot)
    : normalizeOfferedSlots(
        result.json?.offered_slots,
        calendar?.freeSlots || calendar?.promptSlots || [],
      );

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
  const calendarBlock = calendar
    ? {
        timezone: CALENDAR_TZ,
        maintenant: nowInCalendar().label,
        creneaux_libres: (calendar.promptSlots || []).map(compactSlot).filter(Boolean),
        rdv_deja_pris_avec_cet_etudiant: (calendar.contactAppointments || []).map(
          eventToSlot,
        ),
      }
    : null;
  const freeSlots = calendar?.freeSlots || calendar?.promptSlots || [];
  const ownSlots = (calendar?.contactAppointments || [])
    .map(eventToSlot)
    .filter(Boolean);

  const result = await mammouthChat({
    system: `Tu aides l'admin de Chinois en Devenir à traiter les réponses d'étudiants au sujet des rendez-vous.

Tu dois :
1. Décider si le message choisit / propose / refuse un créneau d'appel ou de visio.
2. Si l'étudiant choisit un horaire, le faire correspondre à un créneau de creneaux_libres (starts_at / ends_at identiques).
3. Rédiger un e-mail de réponse, vouvoiement, même style que nos modèles. L'admin relit avant envoi.
4. Ne pas écrire « Bonjour » ni la signature.

Règles :
- Fuseau : ${CALENDAR_TZ} (heure de Pékin). Cite les horaires en toutes lettres + « heure de Pékin ».
- Si l'étudiant confirme le RDV déjà dans rdv_deja_pris_avec_cet_etudiant : kind = "confirmation", chosen_slot = ce RDV, slot_available = true.
- Si l'étudiant propose UN AUTRE créneau qui est dans creneaux_libres : kind = "move", chosen_slot = le nouveau créneau, slot_available = true.
- Si l'étudiant propose un autre créneau QUI N'EST PAS libre : kind = "reschedule", slot_available = false, chosen_slot = null. On garde le RDV déjà posé. Propose 2 à 4 alternatives depuis creneaux_libres.
- Si le créneau demandé est dans creneaux_libres et qu'il n'y a pas encore de RDV : kind = "confirmation".
- Si ce n'est pas un message de RDV : is_appointment_reply = false, body peut être vide.
- Ne jamais inventer un horaire hors creneaux_libres (sauf confirmation d'un RDV déjà posé).
- Vouvoiement. Pas de formules commerciales.

JSON compact uniquement, sans markdown :
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
    temperature: 0.4,
    maxTokens: 4000,
    retries: 1,
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

export { sanitizeComposeBody, sanitizeComposeLine };
