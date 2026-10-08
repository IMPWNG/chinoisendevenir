import type { ReportPerson } from "./dailyReportShared";

export const DAY_TASK_MAX = 500;

export type DayTaskSource = "admin" | "grokbot";

export type DayTaskDraft = {
  contactId: string;
  task: string;
  source: DayTaskSource;
};

type PriorityLists = {
  unreadInbox?: ReportPerson[];
  attentePaiement?: ReportPerson[];
  noFirstTouch?: ReportPerson[];
};

const GROK_BUCKETS: Array<[keyof PriorityLists, string]> = [
  ["unreadInbox", "Répondre à l'email reçu"],
  ["attentePaiement", "Relancer le paiement"],
  ["noFirstTouch", "Faire le premier contact"],
];

export function cleanDayTask(value: unknown): string {
  return String(value || "")
    .trim()
    .replace(/\s+/g, " ")
    .slice(0, DAY_TASK_MAX);
}

/**
 * Compte rendu → tâches du jour.
 * ponytail: 8 tâches max, un dossier une fois, ces 3 files seulement.
 * Un agent peut insérer d'autres lignes source=grokbot.
 */
export function grokbotDayTasks(
  priorities: PriorityLists,
  limit = 8,
): DayTaskDraft[] {
  const seen = new Set<string>();
  const out: DayTaskDraft[] = [];
  const cap = Math.max(0, limit);
  for (const [key, task] of GROK_BUCKETS) {
    for (const person of priorities[key] || []) {
      const contactId = String(person?.id || "").trim();
      if (!contactId || seen.has(contactId)) continue;
      seen.add(contactId);
      out.push({ contactId, task, source: "grokbot" });
      if (out.length >= cap) return out;
    }
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
