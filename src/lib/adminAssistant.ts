import { readFileSync } from "node:fs";
import { join } from "node:path";

export type AssistantTurn = { role: "user" | "assistant"; content: string };

const MAX_TURNS = 12;
const MAX_CHARS = 1500;
const SECTION_CLIP = 4500;
const EXCERPT_BUDGET = 18000;
const MAX_EXCERPTS = 6;

const STOP = new Set([
  "les", "des", "une", "que", "qui", "dans", "pour", "avec", "sur", "par", "est", "sont",
  "pas", "plus", "cette", "comme", "vous", "nous", "votre", "comment", "quel", "quelle",
  "quels", "quelles", "quoi", "donc", "mais", "une", "le", "la", "un", "en", "au", "aux",
  "du", "de", "ce", "ces", "son", "sa", "ses", "leur", "leurs", "elle", "ils", "elles",
  "mon", "mes", "and", "the", "for", "depuis", "entre", "tout", "tous", "aussi", "sans",
  "sous", "dont", "alors", "etre", "avoir", "fait", "faire", "quand", "chez", "vers",
]);

// ponytail: keyword overlap on markdown sections, no embeddings.
// Ceiling: misses a paraphrase that shares no word with the section. Upgrade path: embed the sections.
let knowledgeCache: string | null = null;

export function projectKnowledge(): string {
  if (knowledgeCache != null) return knowledgeCache;
  knowledgeCache = readFileSync(join(process.cwd(), "docs/chatbot-knowledge.md"), "utf8").trim();
  return knowledgeCache;
}

function fold(value: string): string {
  return value
    .normalize("NFD")
    .replace(/\p{M}/gu, "")
    .toLowerCase();
}

function words(value: string): string[] {
  return [...new Set(fold(value).split(/[^a-z0-9]+/).filter((word) => word.length >= 3 && !STOP.has(word)))];
}

function clip(text: string): string {
  if (text.length <= SECTION_CLIP) return text;
  return `${text.slice(0, SECTION_CLIP).trimEnd()}\n…`;
}

type KnowledgeSection = { heading: string; body: string };

function knowledgeSections(markdown: string): KnowledgeSection[] {
  return markdown
    .split(/^(?=#{2,3} )/m)
    .map((part) => {
      const body = part.trim();
      const line = body.split("\n", 1)[0] || "";
      return { heading: line.replace(/^#+\s*/, "").trim(), body };
    })
    .filter((section) => section.body);
}

function alwaysIncluded(heading: string): boolean {
  const name = fold(heading);
  return (
    name.startsWith("base de connaissance") ||
    name.startsWith("regles de reponse") ||
    name === "identite" ||
    name.startsWith("ce que l'agence ne fait pas")
  );
}

export function selectKnowledge(markdown: string, question: string): string {
  const sections = knowledgeSections(markdown);
  const query = words(question);
  const ranked = sections
    .map((section, index) => {
      if (alwaysIncluded(section.heading) || !query.length) return { index, score: 0 };
      const title = fold(section.heading);
      const hay = fold(section.body);
      let score = 0;
      for (const word of query) {
        if (!hay.includes(word)) continue;
        score += title.includes(word) ? 3 : 1;
      }
      return { index, score };
    })
    .filter((item) => item.score > 0)
    .sort((a, b) => b.score - a.score || a.index - b.index);

  const always = sections
    .map((section, index) => (alwaysIncluded(section.heading) ? index : -1))
    .filter((index) => index >= 0);
  const chosen = new Set(always);
  let used = 0;
  let picked = 0;
  for (const item of ranked) {
    if (picked >= MAX_EXCERPTS) break;
    const text = clip(sections[item.index].body);
    if (picked > 0 && used + text.length > EXCERPT_BUDGET) break;
    chosen.add(item.index);
    used += text.length;
    picked += 1;
  }

  return [...chosen]
    .sort((a, b) => a - b)
    .map((index) => clip(sections[index].body))
    .join("\n\n");
}

export function assistantSystemPrompt(question: string): string {
  return [
    "Tu es l'assistant de l'admin Chinois en Devenir.",
    "Réponds uniquement à partir des extraits ci-dessous. S'ils ne contiennent pas le fait, dis-le en une phrase.",
    "Tu n'as pas accès aux dossiers, e-mails ou à la base en direct.",
    "Réponds dans la langue de la question, court, texte brut sans markdown.",
    "",
    selectKnowledge(projectKnowledge(), question),
  ].join("\n");
}

export function assistantPromptTurns(input: unknown): AssistantTurn[] | null {
  if (!Array.isArray(input)) return null;
  const turns: AssistantTurn[] = [];
  for (const item of input) {
    if (!item || typeof item !== "object") continue;
    const role = (item as { role?: unknown }).role;
    const content = String((item as { content?: unknown }).content || "")
      .trim()
      .slice(0, MAX_CHARS);
    if ((role !== "user" && role !== "assistant") || !content) continue;
    turns.push({ role, content });
  }
  const recent = turns.slice(-MAX_TURNS);
  while (recent.length && recent[recent.length - 1].role !== "user") recent.pop();
  if (!recent.length) return null;
  return recent;
}

type ChatPayload = {
  choices?: { message?: { content?: unknown }; text?: unknown }[];
};

export function assistantReplyText(data: ChatPayload): string {
  const choice = data.choices?.[0];
  const content = choice?.message?.content;
  if (typeof content === "string" && content.trim()) return content.trim();
  if (Array.isArray(content)) {
    const joined = content
      .map((part) => {
        if (typeof part === "string") return part;
        if (part && typeof part === "object" && "text" in part) {
          return typeof part.text === "string" ? part.text : "";
        }
        return "";
      })
      .join("")
      .trim();
    if (joined) return joined;
  }
  if (typeof choice?.text === "string" && choice.text.trim()) return choice.text.trim();
  return "";
}

function assistantModels(): string[] {
  const names = [
    process.env.MAMMOUTH_COMPOSE_MODEL,
    process.env.MAMMOUTH_MODEL,
    "gpt-4.1-mini",
  ].filter((name): name is string => Boolean(name && name.trim()));
  return [...new Set(names)];
}

export async function askAdminAssistant(
  turns: AssistantTurn[],
): Promise<{ ok: true; reply: string } | { ok: false; error: string }> {
  const apiKey = process.env.MAMMOUTH_API_KEY;
  if (!apiKey) return { ok: false, error: "Assistant indisponible" };

  let lastError = "Réponse IA vide";
  for (const model of assistantModels()) {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 28000);
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
          max_tokens: 700,
          messages: [
            {
              role: "system",
              content: assistantSystemPrompt(
                turns
                  .filter((turn) => turn.role === "user")
                  .slice(-2)
                  .map((turn) => turn.content)
                  .join("\n"),
              ),
            },
            ...turns,
          ],
        }),
        signal: controller.signal,
      });
      const data = (await response.json().catch(() => ({}))) as ChatPayload;
      if (!response.ok) {
        lastError = "Le service IA n'a pas répondu";
        continue;
      }
      const reply = assistantReplyText(data).slice(0, 4000);
      if (reply) return { ok: true, reply };
      lastError = "Réponse IA vide";
    } catch (error: unknown) {
      lastError =
        error instanceof Error && error.name === "AbortError"
          ? "Délai dépassé. Réessayez."
          : "Erreur IA";
    } finally {
      clearTimeout(timer);
    }
  }
  return { ok: false, error: lastError };
}
