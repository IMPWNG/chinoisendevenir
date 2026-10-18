import { readFileSync } from "node:fs";
import { join } from "node:path";

export type AssistantTurn = { role: "user" | "assistant"; content: string };

const MAX_TURNS = 12;
const MAX_CHARS = 1500;

// ponytail: the whole brief is stuffed in the prompt, no retrieval.
// Ceiling: docs/for-agents.md. Split and search if it outgrows the model context.
let knowledgeCache: string | null = null;

export function projectKnowledge(): string {
  if (knowledgeCache != null) return knowledgeCache;
  knowledgeCache = readFileSync(join(process.cwd(), "docs/for-agents.md"), "utf8").trim();
  return knowledgeCache;
}

export function assistantSystemPrompt(): string {
  return [
    "Tu es l'assistant interne de l'admin Chinois en Devenir.",
    "Réponds uniquement à partir de la base de connaissance ci-dessous.",
    "Si l'information n'y figure pas, dis-le en une phrase. N'invente ni procédure, ni prix, ni statut, ni dossier étudiant.",
    "Tu n'as pas accès aux contacts, e-mails ou à la base en direct.",
    "Réponds dans la langue de la question, en français par défaut. Court, factuel, texte brut sans markdown.",
    "Pas de garantie d'admission, de bourse ou de visa. Ne répète aucune clé ni valeur d'environnement.",
    "",
    "# Base de connaissance",
    projectKnowledge(),
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
          messages: [{ role: "system", content: assistantSystemPrompt() }, ...turns],
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
