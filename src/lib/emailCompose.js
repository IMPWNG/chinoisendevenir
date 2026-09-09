import { withEtudeChineSubject } from "./emailLayout.js";
import { FORMULES, displayFormulePrice } from "./formules.js";

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
  const subject = withEtudeChineSubject(
    sanitizeComposeLine(parsed?.subject, 180) || DEFAULT_SUBJECT,
  );
  const title =
    sanitizeComposeLine(parsed?.title, 120) ||
    subject.replace(/^Etude Chine\s*[—–\-:]\s*/i, "").trim();
  const subtitle = sanitizeComposeLine(parsed?.subtitle, 160);
  return {
    ok: true,
    subject,
    title,
    subtitle,
    body: sanitizeComposeBody(body),
  };
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

function notesAskTutoiement(notes) {
  return /\b(tutoie|tutoiement|tutoyer)\b/i.test(String(notes || ""));
}

export const BULK_AI_TOPICS = {
  langue_sans_diplome: {
    title: "Formations de chinois sans diplôme / certificat de langue",
    brief: `Sujet: proposer une formation pour apprendre le chinois en Chine (école de langue, année préparatoire) aux personnes qui n'ont pas de diplôme de langue ni de certificat (HSK, IELTS, TOEFL).

Expliquer clairement:
- Sans HSK, une licence ou un master enseigné en chinois est en général inaccessible.
- Une année (ou un semestre) en école de langue en Chine est souvent le meilleur premier pas: immersion, visa étudiant, puis université ensuite.
- Des programmes universitaires existent aussi en anglais, mais ils demandent en général IELTS ou TOEFL.
- La formule 1 accompagne l'inscription en école de langue et le visa. La formule 3 combine année de chinois puis admission universitaire.

Invitez à répondre pour préciser le niveau actuel et le calendrier. Ne promettez aucune admission.`,
  },
  annee_chinois: {
    title: "Année de langue avant l'université",
    brief: `Sujet: relancer les profils pour une année de chinois en Chine avant une candidature universitaire.

Expliquer le parcours en deux temps (langue, puis université), l'intérêt pour le visa étudiant et le quotidien, et le lien avec la formule 1 ou 3. Pas de promesse d'admission.`,
  },
  bourses: {
    title: "Bourses et financement",
    brief: `Sujet: relancer au sujet des bourses pour étudier en Chine.

Rappeler que les bourses ne sont pas automatiques, qu'un dossier sérieux et un projet cohérent aident, et que nous accompagnons la recherche d'options réalistes (formule 2 ou 3). Ne promettez aucun montant ni aucune attribution.`,
  },
  formules: {
    title: "Présentation des formules",
    brief: `Sujet: présenter les 3 formules d'accompagnement et demander laquelle correspond le mieux.

Utilisez uniquement les tarifs et intitulés fournis dans les faits agence. Demandez une réponse par numéro de formule. Rappelez que le paiement n'intervient qu'après un premier échange.`,
  },
  custom: {
    title: "Sujet libre",
    brief: `Sujet libre: rédige à partir des notes admin et des profils sélectionnés. Reste factuel, utile, et dans le cadre des études en Chine.`,
  },
};

export const BULK_AI_TOPIC_KEYS = Object.keys(BULK_AI_TOPICS);
export const MAX_BULK_COMPOSE_CONTACTS = 40;

function formuleFactsForPrompt() {
  const lines = FORMULES.map((formule) => {
    const price = displayFormulePrice(formule);
    return `${formule.number}. ${formule.title} — ${price} — ${formule.audience || formule.subtitle || ""}`;
  });
  return `Faits agence (ne pas inventer d'autres tarifs ni d'autres formules):\n${lines.join("\n")}\nSite: https://chinoisendevenir.com/`;
}

function clipNotes(value, max = 180) {
  const text = String(value || "").replace(/\s+/g, " ").trim();
  if (!text) return "";
  return text.length > max ? `${text.slice(0, max)}…` : text;
}

export function summarizeContactsForCompose(contacts = []) {
  const list = Array.isArray(contacts) ? contacts.filter(Boolean) : [];
  const shown = list.slice(0, 25);
  const lines = shown.map((contact, index) => {
    const name = [contact.prenom, contact.nom].filter(Boolean).join(" ") || "Sans nom";
    const formule = String(contact.formule || "").trim() || "aucune formule";
    const notes = clipNotes(contact.notes_admin);
    return `${index + 1}. ${name} | diplôme: ${contact.dernier_diplome || "non renseigné"} | domaine: ${contact.domaine_etudes || "non renseigné"} | budget: ${contact.budget || "non renseigné"} | rentrée: ${contact.date_rentree || "non renseignée"} | statut: ${contact.suivi_statut || "—"} | formule: ${formule}${notes ? ` | notes: ${notes}` : ""}`;
  });
  const extra = list.length - shown.length;
  if (extra > 0) lines.push(`… et ${extra} autre(s) profil(s) non détaillé(s).`);
  return {
    count: list.length,
    text: lines.join("\n") || "Aucun profil.",
  };
}

export async function composeEmailWithAi({ notes, contact } = {}) {
  const tutoyer = notesAskTutoiement(notes);
  const result = await mammouthChat({
    system: `Tu es rédacteur pour Chinois en Devenir, agence francophone d'accompagnement aux études en Chine.

Les notes de l'admin sont un brief en vrac (fautes, phrases courtes, tutoiement). Tu en fais un e-mail professionnel, chaleureux et soigné. Ce n'est pas une reformulation mot à mot, c'est une rédaction.

Le template HTML ajoute déjà « Bonjour {prénom}, » et « Cordialement, L'équipe Chinois en Devenir ».
- N'écris JAMAIS Bonjour, Madame, Monsieur, le prénom, le nom, ni Cordialement, ni la signature.

${tutoyer ? "Le brief demande explicitement le tutoiement : tutoie (tu / toi / ton)." : "Vouvoie toujours (vous / votre), même si le brief dit « ton dossier ». Écris « nous » pour l'agence, jamais « je »."}

Si le brief mentionne un horaire, recopie-le tel quel. N'invente aucun créneau, aucune université, aucun tarif.

JSON uniquement, sans markdown :
{"subject":"Etude Chine — ...","title":"...","subtitle":"...","body":"..."}

L'objet (subject) doit toujours commencer par « Etude Chine — ».`,
    user: `Prénom déjà dans le template (ne pas le répéter) : ${contact?.prenom || ""}

Brief admin (à transformer en e-mail pro) :
${notes}`,
    temperature: 0.55,
    maxTokens: 4000,
    retries: 1,
  });

  if (!result.ok) return result;
  return composeEmailFromParsed(result.json, result.text);
}

export async function composeBulkEmailWithAi({
  notes = "",
  topic = "custom",
  contacts = [],
} = {}) {
  const topicKey = BULK_AI_TOPICS[topic] ? topic : "custom";
  const topicDef = BULK_AI_TOPICS[topicKey];
  const tutoyer = notesAskTutoiement(notes);
  const summary = summarizeContactsForCompose(contacts);
  const extraNotes = String(notes || "").trim();

  const result = await mammouthChat({
    system: `Tu es rédacteur pour Chinois en Devenir, agence francophone d'accompagnement aux études en Chine.

Tu rédiges UN seul e-mail de relance, envoyé tel quel à plusieurs étudiants. Ce n'est pas un mail personnalisé prénom par prénom.

Le template HTML ajoute déjà « Bonjour {prénom}, » (prénom de chaque destinataire) et « Cordialement, L'équipe Chinois en Devenir ».
- N'écris JAMAIS Bonjour, Madame, Monsieur, un prénom, un nom, ni Cordialement, ni la signature.
- N'écris JAMAIS la liste des destinataires dans le mail.
- Tutoiement: ${tutoyer ? "le brief demande le tutoiement : tutoie (tu / toi / ton)." : "vouvoie toujours (vous / votre). Écris « nous » pour l'agence, jamais « je »."}

Les profils ci-dessous servent à adapter le fond (diplôme, domaine, absence de certificat de langue, budget). Parle de façon générale (« si vous n'avez pas encore de HSK », « pour un projet de licence »), sans citer de personne.

N'invente aucune université, aucun créneau, aucun tarif, aucune bourse chiffrée. Utilise uniquement les faits agence fournis.

JSON uniquement, sans markdown :
{"subject":"Etude Chine — ...","title":"...","subtitle":"...","body":"..."}

L'objet (subject) doit toujours commencer par « Etude Chine — ».`,
    user: `${formuleFactsForPrompt()}

${topicDef.brief}

Notes admin (à intégrer si utiles) :
${extraNotes || "(aucune note supplémentaire)"}

Profils sélectionnés (${summary.count}) — ne pas les citer nommément dans l'e-mail :
${summary.text}`,
    temperature: 0.5,
    maxTokens: 4000,
    retries: 1,
  });

  if (!result.ok) return result;
  return composeEmailFromParsed(result.json, result.text);
}

export { sanitizeComposeBody, sanitizeComposeLine };
