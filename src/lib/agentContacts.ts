export const AGENT_CONTACT_CAP = 200;
export const AGENT_RECENT_CAP = 3;
const CLIP = 400;

export function clipAgentText(value: unknown): string {
  const text = String(value || "").trim().replace(/\s+/g, " ");
  if (text.length <= CLIP) return text;
  return `${text.slice(0, CLIP)}…`;
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
