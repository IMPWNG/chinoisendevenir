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
{"subject":"...","title":"...","subtitle":"...","body":"..."}`,
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

export { sanitizeComposeBody, sanitizeComposeLine };
