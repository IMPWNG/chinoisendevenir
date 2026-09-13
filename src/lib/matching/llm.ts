export type MatchingLlmInput = {
  system?: string;
  user?: string;
  temperature?: number;
  maxTokens?: number;
  timeoutMs?: number;
};

export type MatchingLlmResult = {
  ok: boolean;
  text: string;
  json: Record<string, unknown> | null;
};

function extractJsonObject(text: unknown): Record<string, unknown> | null {
  const trimmed = String(text || "").trim();
  const fenced = trimmed.match(/```(?:json)?\s*([\s\S]*?)```/i);
  const raw = (fenced ? fenced[1] : trimmed).trim();
  const start = raw.indexOf("{");
  const end = raw.lastIndexOf("}");
  if (start === -1 || end === -1 || end <= start) return null;
  try {
    const parsed: unknown = JSON.parse(raw.slice(start, end + 1));
    if (parsed && typeof parsed === "object" && !Array.isArray(parsed)) {
      return parsed as Record<string, unknown>;
    }
    return null;
  } catch {
    return null;
  }
}

export { extractJsonObject };

export async function matchingLlm({
  system,
  user,
  temperature = 0.15,
  maxTokens = 1800,
  timeoutMs = 25000,
}: MatchingLlmInput = {}): Promise<MatchingLlmResult> {
  const apiKey = process.env.MAMMOUTH_API_KEY;
  if (!apiKey) return { ok: false, text: "", json: null };

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
    if (!response.ok) return { ok: false, text: "", json: null };
    const data: unknown = await response.json();
    const text =
      data &&
      typeof data === "object" &&
      "choices" in data &&
      Array.isArray((data as { choices?: unknown }).choices)
        ? String(
            (
              (data as { choices: { message?: { content?: unknown } }[] }).choices[0]
                ?.message?.content || ""
            ),
          ).trim()
        : "";
    if (!text) return { ok: false, text: "", json: null };
    return { ok: true, text, json: extractJsonObject(text) };
  } catch {
    return { ok: false, text: "", json: null };
  } finally {
    clearTimeout(timer);
  }
}
