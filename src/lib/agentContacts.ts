export const AGENT_PAGE = 200;
export const AGENT_MAX = 1000;
export const AGENT_RECENT_CAP = 3;
const CLIP = 400;

export function clipAgentText(value: unknown): string {
  const text = String(value || "").trim().replace(/\s+/g, " ");
  if (text.length <= CLIP) return text;
  return `${text.slice(0, CLIP)}…`;
}

function clampInt(value: string | null, min: number, max: number, fallback: number) {
  if (value == null || value.trim() === "") return fallback;
  const n = Number(value);
  if (!Number.isFinite(n)) return fallback;
  return Math.min(max, Math.max(min, Math.floor(n)));
}

/** No query → up to 1000 fiches. ?page=2 or ?offset=200 → slices of 200. */
export function agentContactWindow(search: string): { offset: number; limit: number } {
  const params = new URLSearchParams(search);
  const paging = params.has("page") || params.has("offset");
  const limit = clampInt(
    params.get("limit"),
    1,
    AGENT_MAX,
    paging ? AGENT_PAGE : AGENT_MAX,
  );
  if (params.has("offset")) {
    return { offset: clampInt(params.get("offset"), 0, 100000, 0), limit };
  }
  const page = clampInt(params.get("page"), 1, 100000, 1);
  return { offset: params.has("page") ? (page - 1) * limit : 0, limit };
}

/** Rows must already be newest first. ponytail: first N per contact, not a SQL window. */
export function groupRecent<T>(
  rows: readonly T[],
  contactId: (row: T) => string,
  limit = AGENT_RECENT_CAP,
): Map<string, T[]> {
  const out = new Map<string, T[]>();
  const cap = Math.max(0, limit);
  for (const row of rows) {
    const id = contactId(row);
    if (!id) continue;
    const list = out.get(id) || [];
    if (list.length >= cap) continue;
    list.push(row);
    out.set(id, list);
  }
  return out;
}
