import {
  CALENDAR_TZ,
  DEFAULT_DURATION_MINUTES,
  addDaysYmd,
  compactSlot,
  filterSlotsByHints,
  findMatchingFreeSlot,
  formatSlotLabel,
  formatYmd,
  nowInCalendar,
  parseAvailabilityHints,
  pickSpreadSlots,
  weekdayNameFr,
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

function notesAskToListSlots(notes) {
  const text = String(notes || "");
  if (
    /\b(propose|proposer|propose[sz]|voici les cr[eé]neaux|liste(?:r)?(?:\s+les)?\s+cr[eé]neaux)\b/i.test(
      text,
    )
  ) {
    return true;
  }
  const folded = text
    .toLowerCase()
    .normalize("NFD")
    .replace(/\p{M}/gu, "");
  const day = "lundi|mardi|mercredi|mecredi|jeudi|vendredi|samedi|dimanche";
  const hasDaySpan =
    new RegExp(`entre(?:\\s+le)?\\s+(${day})`).test(folded) ||
    new RegExp(`(?:du|de)\\s+(?:le\\s+)?(${day})s?\\s+au\\s+`).test(folded);
  const hasHourSpan =
    /(?:entre|de)\s+\d{1,2}(?:[:h]\d{2})?\s*h?\s+(?:et|a|à)\s+\d{1,2}/.test(
      folded,
    );
  if (hasDaySpan || (hasHourSpan && /\b(dispo|disponib|rdv|rendez)/.test(folded))) {
    return false;
  }
  return new RegExp(
    `\\b(${day})\\b[^.?]{0,40}\\b\\d{1,2}\\s*h`,
    "i",
  ).test(text);
}

function formatMinutesLabel(minutes) {
  if (minutes == null || !Number.isFinite(minutes)) return null;
  const hour = Math.floor(minutes / 60);
  const minute = minutes % 60;
  return minute ? `${hour} h ${String(minute).padStart(2, "0")}` : `${hour} h`;
}

function formatYmdFr(ymd) {
  const [year, month, day] = String(ymd).split("-").map(Number);
  if (!year || !month || !day) return ymd;
  const utc = new Date(Date.UTC(year, month - 1, day, 12));
  return utc.toLocaleDateString("fr-FR", {
    timeZone: "UTC",
    day: "numeric",
    month: "long",
  });
}

function summarizeAvailability(hints, matched) {
  if (!hints?.hasHints) {
    return matched.length
      ? `${matched.length} créneaux libres dans les semaines à venir (heure de Pékin).`
      : "Aucun créneau libre.";
  }

  const DAY_NAMES = [
    "dimanche",
    "lundi",
    "mardi",
    "mercredi",
    "jeudi",
    "vendredi",
    "samedi",
  ];
  const days = hints.weekdays?.length
    ? hints.weekdays.map((index) => DAY_NAMES[index]).join(", ")
    : "jours indiqués";
  const fromHour = formatMinutesLabel(hints.minMinutes);
  const toHour = formatMinutesLabel(hints.maxMinutes);
  const hours =
    fromHour && toHour ? `entre ${fromHour} et ${toHour}` : "horaires habituels";

  const byDay = new Map();
  for (const slot of matched || []) {
    const list = byDay.get(slot.ymd) || [];
    list.push(slot);
    byDay.set(slot.ymd, list);
  }
  const dayLines = [...byDay.keys()].sort().map((ymd) => {
    const slots = byDay.get(ymd);
    const name = weekdayNameFr(ymd);
    const first = slots[0].startHm?.replace(":", "h");
    const last = slots[slots.length - 1].endHm?.replace(":", "h");
    return `- ${name} ${formatYmdFr(ymd)} : libre de ${first} à ${last}`;
  });

  if (!dayLines.length) {
    return `Fenêtre demandée (${days}, ${hours}, heure de Pékin) : aucun créneau libre. Ne propose aucun horaire inventé ; dis que vous reviendrez vers la personne.`;
  }

  return `Fenêtre demandée : ${days}, ${hours} (heure de Pékin). Cette fenêtre est libre :
${dayLines.join("\n")}
Si les notes demandent « est-ce que tu es libre sur cette plage », garde la plage dans le mail. Ne la transforme pas en liste de créneaux de 30 minutes.`;
}

function composeModels() {
  const names = [
    process.env.MAMMOUTH_COMPOSE_MODEL,
    "gpt-4.1-mini",
    "openai/gpt-4.1-mini",
    "gpt-4o-mini",
    "gpt-4.1-nano",
  ].filter(Boolean);
  const unique = [...new Set(names)];
  const writing = unique.filter((name) => !/nano/i.test(name));
  const nano = unique.filter((name) => /nano/i.test(name));
  return [...writing, ...nano];
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

function notesAskTutoiement(notes) {
  return /\b(tutoie|tutoiement|tutoyer)\b/i.test(String(notes || ""));
}

function bodyLooksLikeSlotList(body) {
  const matches = String(body || "").match(
    /^\s*[-•*]\s+.+\d{1,2}\s*h\d{0,2}.+\d{1,2}\s*h/gim,
  );
  return (matches || []).length >= 2;
}

function bodyTooThinForAppointment(body) {
  const text = String(body || "").trim();
  if (text.length < 320) return true;
  if (!/disponib|horaire|📅|mercredi|lundi|mardi|jeudi|vendredi/i.test(text)) {
    return true;
  }
  return false;
}

function formatWindowLabels(hints) {
  const DAY_NAMES = [
    "dimanche",
    "lundi",
    "mardi",
    "mercredi",
    "jeudi",
    "vendredi",
    "samedi",
  ];
  let daysLine = "cette semaine";
  if (hints?.weekdays?.length >= 2) {
    const first = DAY_NAMES[hints.weekdays[0]];
    const last = DAY_NAMES[hints.weekdays[hints.weekdays.length - 1]];
    daysLine = `du ${first} au ${last}`;
  } else if (hints?.weekdays?.length === 1) {
    daysLine = DAY_NAMES[hints.weekdays[0]];
  }
  const fromHour = formatMinutesLabel(hints?.minMinutes);
  const toHour = formatMinutesLabel(hints?.maxMinutes);
  const hoursLine = fromHour && toHour ? `de ${fromHour} à ${toHour}` : "";
  return { daysLine, hoursLine };
}

function windowFallbackBody({ notes, hints }) {
  const { daysLine, hoursLine } = formatWindowLabels(hints);
  const duration = DEFAULT_DURATION_MINUTES;
  const hoursBlock = hoursLine
    ? `📅 Disponibilités : ${daysLine}\n🕘 Horaires : ${hoursLine} (heure de Pékin)`
    : `📅 Disponibilités : ${daysLine} (heure de Pékin)`;
  const projet = /chine|etud/i.test(notes)
    ? "et d'échanger sur votre projet de venir étudier en Chine"
    : "et d'échanger sur votre projet";
  return `Nous vous proposons de prendre rendez-vous afin de faire le point sur votre dossier ${projet}.

Le rendez-vous, d'une durée de ${duration} minutes, permettra de répondre à vos questions et de vous accompagner dans les différentes étapes de votre projet.

${hoursBlock}

Merci de nous indiquer le jour et l'heure qui vous conviendraient le mieux parmi ces créneaux.

Nous restons à votre disposition pour toute question complémentaire.`;
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
  return {
    slots: pickSpreadSlots(matched, 4),
    matched,
    exact,
    hints,
  };
}

export async function composeEmailWithAi({
  notes,
  contact,
  calendar = null,
} = {}) {
  const wantRdv = notesWantAppointment(notes);
  const listSlots = wantRdv && notesAskToListSlots(notes);
  const now = new Date();
  const selected = wantRdv
    ? selectComposeSlots(calendar?.freeSlots || calendar?.promptSlots || [], notes, now)
    : { slots: [], matched: [], exact: true, hints: null };
  const slotsToOffer = listSlots ? selected.slots : [];
  const existingLabels = (calendar?.contactAppointments || []).map((event) =>
    formatSlotLabel(event.starts_at, event.ends_at),
  );

  const slotLines = slotsToOffer
    .map((slot, index) => `${index + 1}. ${slot.label}`)
    .join("\n");
  const tutoyer = notesAskTutoiement(notes);
  const windowLabels = formatWindowLabels(selected.hints);
  const duration = DEFAULT_DURATION_MINUTES;

  let calendarBlock = "Pas de rendez-vous dans le brief : rédige un e-mail pro à partir des notes, sans inventer d'horaires.";
  if (wantRdv && listSlots) {
    calendarBlock = `${
      selected.exact
        ? "Le brief demande des horaires précis. Dans le mail, liste 2 à 4 créneaux parmi ceux-ci (heure de Pékin), en toutes lettres :"
        : "Aucun créneau n'était libre dans la fenêtre demandée. Dis-le et propose les plus proches :"
    }
${slotLines || "Aucun créneau libre."}
Durée du rendez-vous : ${duration} minutes.
RDV déjà posé avec cette personne : ${existingLabels.join(" ; ") || "aucun"}`;
  } else if (wantRdv) {
    calendarBlock = `Le brief donne une PLAGE, pas une liste d'horaires. Présente-la exactement sous cette forme dans le body (deux lignes, un saut de ligne entre les deux) :

📅 Disponibilités : ${windowLabels.daysLine}
🕘 Horaires : ${windowLabels.hoursLine || "selon vos disponibilités"} (heure de Pékin)

Ne dresse pas de liste « mercredi 2 septembre de 09h00 à 09h30 ».
Durée du rendez-vous : ${duration} minutes.
${summarizeAvailability(selected.hints, selected.matched || selected.slots)}
RDV déjà posé avec cette personne : ${existingLabels.join(" ; ") || "aucun"}`;
  }

  const result = await mammouthChat({
    system: `Tu es rédacteur pour Chinois en Devenir, agence francophone d'accompagnement aux études en Chine.

Les notes de l'admin sont un brief en vrac (fautes, phrases courtes, tutoiement). Tu en fais un e-mail professionnel, chaleureux et soigné — le niveau d'une conseillère qui écrit à un futur étudiant. Ce n'est pas une reformulation mot à mot, c'est une rédaction.

Le template HTML ajoute déjà « Bonjour {prénom}, » et « Cordialement, L'équipe Chinois en Devenir ».
- N'écris JAMAIS Bonjour, Madame, Monsieur, le prénom, le nom, ni Cordialement, ni la signature.

${tutoyer ? "Le brief demande explicitement le tutoiement : tutoie (tu / toi / ton)." : "Vouvoie toujours (vous / votre), même si le brief dit « ton dossier ». Écris « nous » pour l'agence, jamais « je »."}

Structure d'un e-mail de rendez-vous (4 à 6 paragraphes, sauts \\n\\n) :
1. Proposition : prendre rendez-vous pour faire le point sur le dossier et échanger sur le projet d'études en Chine.
2. Valeur + durée : le rendez-vous dure ${duration} minutes ; il sert à répondre aux questions et accompagner les étapes du projet. (N'invente pas de filière, HSK, université ou tarifs.)
3. Disponibilités : si le brief donne une plage, utilise le bloc 📅 / 🕘 fourni. Si le brief demande des horaires précis, liste alors les créneaux donnés.
4. CTA : demander le jour et l'heure qui conviennent le mieux.
5. Phrase de clôture : « Nous restons à votre disposition pour toute question complémentaire. »

Objet type : « Prise de rendez-vous pour votre projet d'études en Chine » (adapte si le brief n'est pas un RDV).
title : même idée, court, pour le bandeau. subtitle : une ligne, ex. « Échange de 30 minutes ».

Exemple de body (sans salutation ni signature) pour un brief « RDV point dossier, dispo mercredi-vendredi 9h-11h, 30 min » :
"Nous vous proposons de prendre rendez-vous afin de faire le point sur votre dossier et d'échanger sur votre projet de venir étudier en Chine.\\n\\nLe rendez-vous, d'une durée de 30 minutes, permettra de répondre à vos questions et de vous accompagner dans les différentes étapes de votre projet.\\n\\n📅 Disponibilités : du mercredi au vendredi\\n🕘 Horaires : de 9 h à 11 h (heure de Pékin)\\n\\nMerci de nous indiquer le jour et l'heure qui vous conviendraient le mieux parmi ces créneaux.\\n\\nNous restons à votre disposition pour toute question complémentaire."

Interdit : transformer une plage en 3 puces de 30 minutes ; inventer des faits hors brief.

JSON uniquement, sans markdown :
{"subject":"...","title":"...","subtitle":"...","body":"..."}`,
    user: `Prénom déjà dans le template (ne pas le répéter) : ${contact?.prenom || ""}
Maintenant : ${nowInCalendar().label}

${calendarBlock}

Brief admin (à transformer en e-mail pro) :
${notes}`,
    temperature: 0.55,
    maxTokens: 4000,
    retries: 1,
  });

  if (!result.ok) return result;

  let composed = composeEmailFromParsed(result.json, result.text);
  const needsRewrite =
    composed.ok &&
    wantRdv &&
    !listSlots &&
    (bodyLooksLikeSlotList(composed.body) ||
      bodyTooThinForAppointment(composed.body));

  if (needsRewrite) {
    const retry = await mammouthChat({
      system: `Rédige un e-mail professionnel Chinois en Devenir, vouvoiement, « nous ».
Le template ajoute déjà Bonjour et Cordialement : ne les écris pas.
Le brief donne une PLAGE : utilise ce bloc, sans lister des créneaux de 30 min :
📅 Disponibilités : ${windowLabels.daysLine}
🕘 Horaires : ${windowLabels.hoursLine || "selon vos disponibilités"} (heure de Pékin)
Inclus la durée (${duration} min), un CTA (jour et heure), et « Nous restons à votre disposition pour toute question complémentaire. »
JSON : {"subject":"...","title":"...","subtitle":"...","body":"..."}`,
      user: `Brief :
${notes}

Jet précédent (trop court ou trop de créneaux listés) :
${composed.body}`,
      temperature: 0.4,
      maxTokens: 4000,
      retries: 0,
    });
    if (retry.ok) {
      const redone = composeEmailFromParsed(retry.json, retry.text);
      if (redone.ok) composed = redone;
    }
  }

  if (
    composed.ok &&
    wantRdv &&
    !listSlots &&
    (bodyLooksLikeSlotList(composed.body) ||
      bodyTooThinForAppointment(composed.body))
  ) {
    composed = {
      ...composed,
      subject:
        sanitizeComposeLine(
          "Prise de rendez-vous pour votre projet d'études en Chine",
          180,
        ),
      title: sanitizeComposeLine("Prise de rendez-vous", 120),
      subtitle: sanitizeComposeLine(`Échange de ${duration} minutes`, 160),
      body: sanitizeComposeBody(
        windowFallbackBody({
          notes,
          hints: selected.hints,
        }),
      ),
    };
  }

  if (!composed.ok) return composed;

  const mentioned = listSlots
    ? slotsMentionedInBody(slotsToOffer, composed.body)
    : [];
  const offeredSlots = wantRdv
    ? (mentioned.length
        ? mentioned
        : listSlots
          ? slotsToOffer
          : []
      ).map(compactSlot)
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
