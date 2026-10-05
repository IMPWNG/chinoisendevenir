import { withEtudeChineSubject } from "./emailLayout";
import { FORMULES, displayFormulePrice } from "./formules";
import { asString } from "./request";

const DEFAULT_SUBJECT = "Votre projet d'études en Chine";

type ComposeFields = {
  subject?: unknown;
  title?: unknown;
  subtitle?: unknown;
  body?: unknown;
};

type MammouthMessagePart = {
  text?: unknown;
  content?: unknown;
  value?: unknown;
};

type MammouthChoice = {
  message?: {
    content?: string | MammouthMessagePart[];
    reasoning_content?: unknown;
    reasoning?: unknown;
    text?: unknown;
  };
  text?: unknown;
};

type MammouthChatPayload = {
  choices?: MammouthChoice[];
  error?: { message?: unknown };
  message?: unknown;
};

type MammouthChatOk = {
  ok: true;
  text: string;
  json: ComposeFields;
  model: string;
};

type MammouthChatErr = { ok: false; error: string };

type ComposeOk = {
  ok: true;
  subject: string;
  title: string;
  subtitle: string;
  body: string;
};

type ComposeErr = { ok: false; error: string };

function clip(value: unknown, max: number): string {
  return String(value || "").trim().slice(0, max);
}

function extractMessageText(payload: MammouthChatPayload | null | undefined): string {
  const choice = payload?.choices?.[0] || {};
  const message = choice.message || {};
  const parts: string[] = [];

  const push = (value: unknown) => {
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

function closeTruncatedJson(input: unknown): string {
  let inStr = false;
  let escape = false;
  const stack: string[] = [];
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

function unescapeJsonString(value: unknown): string {
  try {
    return JSON.parse(`"${String(value)}"`) as string;
  } catch {
    return String(value || "")
      .replaceAll("\\n", "\n")
      .replaceAll('\\"', '"')
      .replaceAll("\\\\", "\\");
  }
}

function grabJsonString(text: unknown, key: string): string {
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

export function extractJsonObject(text: unknown): ComposeFields | null {
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
      const parsed: unknown = JSON.parse(candidate);
      if (parsed && typeof parsed === "object") return parsed as ComposeFields;
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

function looksLikeJsonBlob(text: unknown): boolean {
  const value = String(text || "").trim();
  return (
    /^```/.test(value) ||
    /^\{\s*"/.test(value) ||
    /"subject"\s*:/.test(value)
  );
}

function stripGreetingAndSignoff(body: unknown): string {
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

function sanitizeComposeLine(value: unknown, maxLen: number): string {
  return clip(value, maxLen)
    .replace(/[\r\n\u0000-\u001f\u007f\u2028\u2029]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function sanitizeComposeBody(value: unknown): string {
  return String(value || "")
    .replace(/\r\n/g, "\n")
    .replace(/[\u0000-\u0008\u000b\u000c\u000e-\u001f\u007f]/g, "")
    .trim()
    .slice(0, 6000);
}

function composeEmailFromParsed(
  parsed: ComposeFields | null | undefined,
  fallbackText: unknown,
): ComposeOk | ComposeErr {
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

function composeModels(): string[] {
  const names = [
    process.env.MAMMOUTH_COMPOSE_MODEL,
    "gpt-4.1-mini",
    "openai/gpt-4.1-mini",
    "gpt-4o-mini",
    "gpt-4.1-nano",
  ].filter((name): name is string => Boolean(name));
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
}: {
  system: string;
  user: string;
  temperature?: number;
  maxTokens?: number;
  timeoutMs?: number;
  retries?: number;
  models?: string[];
}): Promise<MammouthChatOk | MammouthChatErr> {
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

        const data = (await response.json().catch(() => ({}))) as MammouthChatPayload;
        if (!response.ok) {
          lastError =
            asString(data?.error?.message) ||
            asString(data?.message) ||
            "Le service IA n'a pas répondu";
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
      } catch (error: unknown) {
        if (error instanceof Error && error.name === "AbortError") {
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

function notesAskTutoiement(notes: unknown): boolean {
  return /\b(tutoie|tutoiement|tutoyer)\b/i.test(String(notes || ""));
}

function adminBriefParts(notes: unknown) {
  const raw = String(notes || "").trim();
  const directives = [...raw.matchAll(/\(([^)]{2,240})\)/g)]
    .map((match) => match[1].replace(/\s+/g, " ").trim())
    .filter(Boolean);
  const urls = [...raw.matchAll(/https?:\/\/[^\s<>"')]+/gi)]
    .map((match) => match[0].replace(/[),.;:!?]+$/g, ""))
    .filter(Boolean);
  return {
    raw,
    directives,
    wantsFormules: /formule/i.test(raw),
    urls: [...new Set(urls)],
  };
}

export function adminOrderBlock(notes: unknown) {
  const brief = adminBriefParts(notes);
  const lines = [
    "Les parenthèses ( ) et les phrases du type « indique les formules », « ton convaincant » sont des ORDRES. Applique-les dans le mail. Ne les ignore pas. Ne les recopie pas mot pour mot (n'écris pas « (indiquer les formules) » dans le corps).",
  ];
  if (brief.directives.length) {
    lines.push(
      "Consignes détectées :",
      ...brief.directives.map((item) => `- ${item}`),
    );
  }
  if (brief.wantsFormules) {
    lines.push(
      "La consigne demande les formules : liste les 3 formules (numéro, intitulé, tarif officiel des faits agence), en quelques lignes claires.",
    );
  }
  if (brief.urls.length) {
    lines.push("Recopie ces URLs telles quelles dans le body :", ...brief.urls);
  } else {
    lines.push(
      "Si le brief contient une URL, recopie-la telle quelle dans le body.",
    );
  }
  return lines.join("\n");
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
} as const;

export type BulkAiTopicKey = keyof typeof BULK_AI_TOPICS;

export const BULK_AI_TOPIC_KEYS = Object.keys(BULK_AI_TOPICS) as string[];
export const MAX_BULK_COMPOSE_CONTACTS = 40;

function formuleFactsForPrompt(): string {
  const lines = FORMULES.map((formule) => {
    const price = displayFormulePrice(formule);
    return `${formule.number}. ${formule.title} — ${price} — ${formule.audience || formule.subtitle || ""}`;
  });
  return `Faits agence (ne pas inventer d'autres tarifs ni d'autres formules):\n${lines.join("\n")}\nSite: https://chinoisendevenir.com/`;
}

function clipNotes(value: unknown, max = 180): string {
  const text = String(value || "").replace(/\s+/g, " ").trim();
  if (!text) return "";
  return text.length > max ? `${text.slice(0, max)}…` : text;
}

export function summarizeContactsForCompose(contacts: unknown[] = []) {
  const list = Array.isArray(contacts) ? contacts.filter(Boolean) : [];
  const shown = list.slice(0, 25);
  const lines = shown.map((contact, index) => {
    const row = (contact || {}) as Record<string, unknown>;
    const name = [row.prenom, row.nom].filter(Boolean).join(" ") || "Sans nom";
    const formule = String(row.formule || "").trim() || "aucune formule";
    const notes = clipNotes(row.notes_admin);
    return `${index + 1}. ${name} | diplôme: ${row.dernier_diplome || "non renseigné"} | domaine: ${row.domaine_etudes || "non renseigné"} | budget: ${row.budget || "non renseigné"} | rentrée: ${row.date_rentree || "non renseignée"} | statut: ${row.suivi_statut || "—"} | formule: ${formule}${notes ? ` | notes: ${notes}` : ""}`;
  });
  const extra = list.length - shown.length;
  if (extra > 0) lines.push(`… et ${extra} autre(s) profil(s) non détaillé(s).`);
  return {
    count: list.length,
    text: lines.join("\n") || "Aucun profil.",
  };
}

export async function composeEmailWithAi({
  notes,
  contact,
}: {
  notes?: unknown;
  contact?: { prenom?: unknown } | null;
} = {}): Promise<ComposeOk | ComposeErr> {
  const tutoyer = notesAskTutoiement(notes);
  const brief = adminBriefParts(notes);
  const result = await mammouthChat({
    system: `Tu es rédacteur pour Chinois en Devenir, agence francophone d'accompagnement aux études en Chine.

Le BRIEF ADMIN est le seul contenu du mail. Tu le reformules (orthographe, vouvoiement, phrases claires). Tu n'inventes pas un autre sujet.

Interdit, sauf si le brief le dit clairement : confirmer une formule, parler d'universités, de rentrée, de dossier, de commerce, d'un appel passé. Un brief du type « dites-leur de nous écrire » reste un mail d'invitation à écrire, rien d'autre.

${adminOrderBlock(notes)}

Le template HTML ajoute déjà « Bonjour {prénom}, » et « Cordialement, L'équipe Chinois en Devenir ».
- N'écris JAMAIS Bonjour, Madame, Monsieur, le prénom, le nom, ni Cordialement, ni la signature.

${tutoyer ? "Le brief demande explicitement le tutoiement : tutoie (tu / toi / ton)." : "Vouvoie toujours (vous / votre), même si le brief dit « ton dossier ». Écris « nous » pour l'agence, jamais « je »."}

Si le brief mentionne un horaire, recopie-le tel quel. N'invente aucun créneau, aucune université, aucun tarif hors faits agence. Pas de garantie d'admission, de bourse ou de visa.

JSON uniquement, sans markdown :
{"subject":"Etude Chine — ...","title":"...","subtitle":"...","body":"..."}

L'objet (subject) doit toujours commencer par « Etude Chine — ».`,
    user: `${brief.wantsFormules ? `${formuleFactsForPrompt()}\n\n` : ""}Prénom déjà dans le template (ne pas le répéter) : ${contact?.prenom || ""}

Brief admin (contenu unique du mail) :
${notes}`,
    temperature: brief.directives.length ? 0.35 : 0.4,
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
}: {
  notes?: unknown;
  topic?: string;
  contacts?: unknown[];
} = {}): Promise<ComposeOk | ComposeErr> {
  const topicKey: BulkAiTopicKey =
    topic in BULK_AI_TOPICS ? (topic as BulkAiTopicKey) : "custom";
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

${adminOrderBlock(notes)}

Les profils ci-dessous servent à adapter le fond (diplôme, domaine, absence de certificat de langue, budget). Parle de façon générale (« si vous n'avez pas encore de HSK », « pour un projet de licence »), sans citer de personne.

N'invente aucune université, aucun créneau, aucun tarif, aucune bourse chiffrée. Utilise uniquement les faits agence fournis. Les notes admin priment sur le sujet type si elles demandent autre chose.

JSON uniquement, sans markdown :
{"subject":"Etude Chine — ...","title":"...","subtitle":"...","body":"..."}

L'objet (subject) doit toujours commencer par « Etude Chine — ».`,
    user: `${formuleFactsForPrompt()}

${topicDef.brief}

Notes et consignes admin (obligatoires, pas optionnelles) :
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

function whatsappBodyFromParsed(json: ComposeFields | null, raw: string) {
  const fromJson = String(json?.body || "").trim();
  const body = (fromJson || raw).replace(/^```(?:json)?/i, "").replace(/```$/, "").trim();
  if (!body || body.length < 12) return null;
  const capped =
    body.length > WHATSAPP_TEXT_MAX ? body.slice(0, WHATSAPP_TEXT_MAX).trim() : body;
  return capped.includes("{prenom}") ? capped : `Bonjour {prenom},\n\n${capped}`;
}

/** WhatsApp hard cap. No extra “keep it short” clip for AI drafts. */
export const WHATSAPP_TEXT_MAX = 4096;
export const STUDENT_WHATSAPP_MAX = WHATSAPP_TEXT_MAX;

export function studentWhatsappDraft(
  json: { body?: unknown } | null | undefined,
  raw: unknown,
  prenom?: unknown,
): string | null {
  let body = String(json?.body || "").trim();
  if (!body) {
    const text = String(raw || "").trim();
    if (!text || looksLikeJsonBlob(text)) return null;
    body = text;
  }
  body = body
    .replace(/^```(?:json)?\s*/i, "")
    .replace(/\s*```$/g, "")
    .replace(/<[^>]+>/g, "")
    .trim();
  if (body.length < 12) return null;
  const name = String(prenom || "").trim();
  if (name && !/^bonjour\b/i.test(body)) {
    body = `Bonjour ${name},\n\n${body}`;
  }
  if (body.length > WHATSAPP_TEXT_MAX) {
    body = body.slice(0, WHATSAPP_TEXT_MAX).trim();
  }
  return body.length >= 12 ? body : null;
}

export async function composeBulkWhatsappWithAi({
  notes = "",
  topic = "custom",
  contacts = [],
}: {
  notes?: unknown;
  topic?: string;
  contacts?: unknown[];
} = {}): Promise<ComposeOk | ComposeErr> {
  const topicKey: BulkAiTopicKey =
    topic in BULK_AI_TOPICS ? (topic as BulkAiTopicKey) : "custom";
  const topicDef = BULK_AI_TOPICS[topicKey];
  const tutoyer = notesAskTutoiement(notes);
  const summary = summarizeContactsForCompose(contacts);
  const extraNotes = String(notes || "").trim();

  const result = await mammouthChat({
    system: `Tu es rédacteur pour Chinois en Devenir, agence francophone d'accompagnement aux études en Chine.

Tu rédiges UN seul message WhatsApp, envoyé tel quel à plusieurs étudiants. Même niveau de détail qu'un e-mail, en texte brut.

Format:
- Texte brut, autant de paragraphes que nécessaire, séparés par une ligne vide.
- Développe le brief : formules, ton, liens, tout ce que l'admin demande. Pas de plafond artificiel de longueur (maximum ${WHATSAPP_TEXT_MAX} caractères, limite WhatsApp).
- La première ligne est exactement « Bonjour {prenom}, » avec les accolades, pour que le prénom soit ajouté à l'envoi.
- Pas d'objet, pas de titre, pas de HTML, pas de liste de destinataires.
- Dernière ligne : « L'équipe Chinois en Devenir ».
- Tutoiement: ${tutoyer ? "le brief demande le tutoiement : tutoie (tu / toi / ton)." : "vouvoie (vous / votre). Écris « nous » pour l'agence, jamais « je »."}

${adminOrderBlock(notes)}

Les profils servent à adapter le fond, sans citer de personne. N'invente aucune université, aucun créneau, aucun tarif, aucune bourse chiffrée. Les notes admin priment sur le sujet type.

JSON uniquement, sans markdown :
{"body":"Bonjour {prenom},\\n\\n..."}`,
    user: `${formuleFactsForPrompt()}

${topicDef.brief}

Notes et consignes admin (obligatoires, pas optionnelles) :
${extraNotes || "(aucune note supplémentaire)"}

Profils sélectionnés (${summary.count}) — ne pas les citer nommément :
${summary.text}`,
    temperature: 0.5,
    maxTokens: 4000,
    retries: 1,
  });

  if (!result.ok) return result;
  const body = whatsappBodyFromParsed(result.json, result.text);
  if (!body) return { ok: false, error: "Réponse IA inutilisable" };
  return { ok: true, body, subject: "", title: "", subtitle: "" };
}

export async function composeStudentWhatsappWithAi({
  notes,
  contact,
}: {
  notes?: unknown;
  contact?: { prenom?: unknown; domaine_etudes?: unknown; formule?: unknown; suivi_statut?: unknown } | null;
} = {}): Promise<ComposeOk | ComposeErr> {
  const tutoyer = notesAskTutoiement(notes);
  const prenom = String(contact?.prenom || "").trim();
  const brief = adminBriefParts(notes);
  const result = await mammouthChat({
    system: `Tu es rédacteur pour Chinois en Devenir, agence francophone d'accompagnement aux études en Chine.

Tu reformules le BRIEF ADMIN en message WhatsApp. Le brief EST le message. Tu corriges l'orthographe et le vouvoiement. Tu n'inventes pas un autre sujet.

Interdit, sauf si le brief le dit clairement : confirmer une formule, parler d'universités, de rentrée, d'un dossier, d'un domaine d'études, d'une conversation précédente. Un brief du type « dites-leur de nous écrire sur WhatsApp ou par mail » reste uniquement cette invitation.

Contraintes :
- Texte brut. Reste proche du brief : si le brief est court, le message reste court.
- Commence par « Bonjour ${prenom || ""} ».
- Pas d'objet, pas de titre, pas de HTML.
- Dernière ligne : « L'équipe Chinois en Devenir ».
- ${tutoyer ? "Le brief demande le tutoiement : tutoie (tu / toi / ton)." : "Vouvoie (vous / votre). Écris « nous » pour l'agence, jamais « je »."}
- ${adminOrderBlock(notes).replaceAll("\n", " ")}
- N'invente aucun créneau, aucune université, aucun tarif. Si le brief donne un horaire, recopie-le tel quel.

JSON uniquement, sans markdown :
{"body":"Bonjour ${prenom || ""},\\n\\n..."}`,
    user: `${brief.wantsFormules ? `${formuleFactsForPrompt()}\n\n` : ""}Prénom (salutation seulement) : ${prenom || "prénom inconnu"}

Brief admin (contenu unique du message) :
${notes}`,
    temperature: 0.25,
    maxTokens: 4000,
    retries: 1,
  });

  if (!result.ok) return result;
  const body = studentWhatsappDraft(result.json, result.text, prenom);
  if (!body) return { ok: false, error: "Réponse IA inutilisable" };
  return { ok: true, body, subject: "", title: "", subtitle: "" };
}

export { sanitizeComposeBody, sanitizeComposeLine };
