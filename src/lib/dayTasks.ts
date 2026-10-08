import { isValidDayString } from "./dailyReportShared";

export const DAY_TASK_MAX = 500;
const AGENT_TASK_CAP = 20;

export type DayTaskSource = "admin" | "grokbot" | "whatsapp";

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

export function cleanAuthorEmail(value: unknown): string {
  return String(value || "").trim().toLowerCase().slice(0, 200);
}

/**
 * Body sent by GrokBot. ponytail: 20 tâches, un dossier une fois.
 */
export function parseAgentDayTasks(
  body: unknown,
  today: string,
): { day: string; tasks: AgentDayTask[]; createdBy: string } | { error: string } {
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
  const createdBy = cleanAuthorEmail(raw.createdBy || raw.created_by);

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
  return { day, tasks, createdBy };
}

/** Students waiting on a WhatsApp reply become today's tasks. Skips dossiers already tasked from WhatsApp. */
export function whatsappPriorityTasks(
  items: readonly { contactId: string; text: string }[],
  day: string,
  existing: ReadonlySet<string>,
) {
  const out: {
    contact_id: string;
    day: string;
    task: string;
    source: "whatsapp";
    done: false;
    created_by: string;
  }[] = [];
  const seen = new Set<string>();
  for (const item of items) {
    const contactId = String(item.contactId || "").trim();
    const task = cleanDayTask(`Répondre sur WhatsApp : ${item.text}`);
    if (!contactId || !task || existing.has(contactId) || seen.has(contactId)) continue;
    seen.add(contactId);
    out.push({
      contact_id: contactId,
      day,
      task,
      source: "whatsapp",
      done: false,
      created_by: "WhatsApp",
    });
  }
  return out;
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
