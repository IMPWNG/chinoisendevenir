/**
 * Short FR labels next to student names in the unanswered-emails block.
 * Heuristic first, optional one-shot Mammouth batch to refine.
 */
import { asString } from "./request";

export type TagSource = {
  id: string;
  direction: "in" | "out";
  subject: string;
  body: string;
  formule?: string;
  statut?: string;
};

const TAG_MAX = 48;

export function clampTag(raw: unknown): string {
  const text = String(raw || "")
    .replace(/^[-–—:\s]+/, "")
    .replace(/\s+/g, " ")
    .trim();
  if (!text) return "";
  if (text.length <= TAG_MAX) return text;
  return `${text.slice(0, TAG_MAX - 1)}…`;
}

/** Fast deterministic label — covers common CRM cases. */
export function heuristicEmailTag(item: TagSource): string {
  const subject = String(item.subject || "");
  const body = String(item.body || "");
  const text = `${subject}\n${body}`;
  const lower = text.toLowerCase();
  const hasFormule = Boolean(String(item.formule || "").trim());
  const formulesThread =
    /formules?\s+d['’]accompagnement|nos formules|choix des formules|formule\s*[123]|accompagnement pour étudier/i.test(
      text,
    );
  const choseFormule =
    hasFormule ||
    /\bformule\s*[123]\b/i.test(text) ||
    /\b(premi[eè]re|deuxi[eè]me|troisi[eè]me)\s+formule\b/i.test(text) ||
    (/\b(je\s+)?(choisis|prends|préf[eè]re|pense que)\b/i.test(text) &&
      /formule/i.test(text));

  if (item.direction === "in") {
    if (choseFormule) return "A choisi sa formule";
    if (/\bbourse/i.test(lower)) return "Question bourses";
    if (/\bvisa\b/i.test(lower)) return "Question visa";
    if (/espace\s+[eé]tudiant|cr[eé]er (mon|votre) compte/i.test(lower)) {
      return "Parle de l'espace étudiant";
    }
    if (/\?/.test(body) || /pouvez-vous|est-ce que|comment /i.test(lower)) {
      return "A posé une question";
    }
    if (/rdv|appel|t[eé]l[eé]phone|disponible/i.test(lower)) {
      return "Demande un échange";
    }
    return "Message de l'étudiant";
  }

  if (formulesThread && !hasFormule) return "N'a pas choisi de formule";
  if (formulesThread && hasFormule) return "Formules déjà choisies";
  if (/espace\s+[eé]tudiant/i.test(text)) return "Espace étudiant envoyé";
  if (/bien reçu votre demande|projet d['’]études en chine — nous avons/i.test(lower)) {
    return "Bienvenue envoyée";
  }
  if (/relance|avez-vous choisi/i.test(lower)) return "Relance formules";
  return "En attente de réponse";
}

function extractTagsMap(text: unknown): Record<string, string> {
  const raw = String(text || "").trim();
  if (!raw) return {};
  const fenced = raw.match(/```(?:json)?\s*([\s\S]*?)```/i);
  const slice = (fenced ? fenced[1] : raw).trim();
  const start = slice.indexOf("{");
  const end = slice.lastIndexOf("}");
  if (start < 0 || end <= start) return {};
  try {
    const parsed = JSON.parse(slice.slice(start, end + 1)) as {
      tags?: Record<string, unknown>;
    };
    const tags = parsed?.tags && typeof parsed.tags === "object" ? parsed.tags : parsed;
    if (!tags || typeof tags !== "object") return {};
    const out: Record<string, string> = {};
    for (const [id, value] of Object.entries(tags as Record<string, unknown>)) {
      if (id === "tags") continue;
      const tag = clampTag(value);
      if (tag) out[id] = tag;
    }
    return out;
  } catch {
    return {};
  }
}

async function mammouthTags(user: string): Promise<Record<string, string>> {
  const apiKey = process.env.MAMMOUTH_API_KEY;
  if (!apiKey) return {};

  const model =
    String(process.env.MAMMOUTH_COMPOSE_MODEL || "").trim() || "claude-haiku-4-5-20251001";
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 18000);
  try {
    const response = await fetch("https://api.mammouth.ai/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model,
        temperature: 0.2,
        max_tokens: 1200,
        messages: [
          {
            role: "system",
            content:
              "Tu étiquettes des emails CRM francophones Chinois en Devenir. Pour chaque id, une étiquette courte (3 à 8 mots), FR, ton neutre. Pas de phrase longue, pas de point final. Exemples: « A choisi sa formule », « N'a pas choisi de formule », « Question visa », « Demande un RDV », « Bienvenue envoyée ». Réponds UNIQUEMENT un JSON compact: {\"tags\":{\"<id>\":\"…\"}}",
          },
          { role: "user", content: user },
        ],
      }),
      signal: controller.signal,
    });
    const data = (await response.json().catch(() => ({}))) as {
      choices?: Array<{ message?: { content?: unknown } }>;
      error?: { message?: unknown };
    };
    if (!response.ok) {
      console.warn("emailTagSummary AI:", asString(data?.error?.message));
      return {};
    }
    const content = asString(data?.choices?.[0]?.message?.content);
    return extractTagsMap(content);
  } catch (error) {
    console.warn("emailTagSummary AI fail:", error);
    return {};
  } finally {
    clearTimeout(timer);
  }
}

/** Heuristic for every row; AI may override when available (one batch). */
export async function attachEmailTags<T extends TagSource>(
  items: T[],
  { useAi = true }: { useAi?: boolean } = {},
): Promise<Array<T & { tag: string }>> {
  const withHeuristic = items.map((item) => ({
    ...item,
    tag: heuristicEmailTag(item),
  }));

  if (!useAi || withHeuristic.length === 0) return withHeuristic;

  const batch = withHeuristic.slice(0, 28);
  const lines = batch.map((item) => {
    const preview = String(item.body || "")
      .replace(/\s+/g, " ")
      .trim()
      .slice(0, 220);
    return [
      `id=${item.id}`,
      `sens=${item.direction === "in" ? "reçu" : "envoyé"}`,
      `formule_dossier=${item.formule ? "oui" : "non"}`,
      `objet=${item.subject}`,
      `extrait=${preview}`,
    ].join(" | ");
  });

  const aiTags = await mammouthTags(
    `Étiquette chaque email:\n${lines.join("\n")}`,
  );

  return withHeuristic.map((item) => {
    const ai = clampTag(aiTags[item.id]);
    return { ...item, tag: ai || item.tag };
  });
}

export const __test = {
  clampTag,
  heuristicEmailTag,
  extractTagsMap,
};
