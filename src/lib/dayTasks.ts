import { isValidDayString } from "./dailyReportShared";

export const DAY_TASK_MAX = 500;
const AGENT_TASK_CAP = 20;

export type DayTaskSource = "admin" | "grokbot";

export type AgentDayTask = {
  contactId: string;
  task: string;
};

export function cleanDayTask(value: unknown): string {
  return String(value || "")
    .trim()
    .replace(/\s+/g, " ")
    .slice(0, DAY_TASK_MAX);
}

/**
 * Body sent by GrokBot. ponytail: 20 tâches, un dossier une fois.
 */
export function parseAgentDayTasks(
  body: unknown,
  today: string,
): { day: string; tasks: AgentDayTask[] } | { error: string } {
  if (!body || typeof body !== "object" || Array.isArray(body)) {
    return { error: "Format invalide" };
  }
  const raw = body as Record<string, unknown>;
  const day =
    raw.day == null || String(raw.day).trim() === ""
      ? today
      : String(raw.day).trim();
  if (!isValidDayString(day)) return { error: "Jour invalide" };
  if (!Array.isArray(raw.tasks)) return { error: "tasks manquant" };

  const seen = new Set<string>();
  const tasks: AgentDayTask[] = [];
  for (const item of raw.tasks) {
    if (!item || typeof item !== "object") continue;
    const row = item as Record<string, unknown>;
    const contactId = String(row.contactId || row.contact_id || "").trim();
    const task = cleanDayTask(row.task);
    if (!contactId || !task || seen.has(contactId)) continue;
    seen.add(contactId);
    tasks.push({ contactId, task });
    if (tasks.length >= AGENT_TASK_CAP) break;
  }
  return { day, tasks };
}

export function isMissingDayTasksTable(
  message: string | null | undefined,
): boolean {
  const text = String(message || "");
  return (
    /day_tasks/i.test(text) &&
    /(relation|table|schema cache|does not exist|n'existe pas)/i.test(text)
  );
}
