/** Pure helpers/types for the daily CRM report (safe for client bundles). */

export const REPORT_TZ = "Asia/Shanghai";
export const REPORT_HISTORY_DAYS = 14;

export type ReportPerson = {
  id: string;
  name: string;
  email: string;
  statut: string;
  formule: string;
  assigned_to: string;
  note?: string;
};

export type DayTotals = {
  date: string;
  newContacts: number;
  formulesChoisies: number;
  formulesF1: number;
  formulesF2: number;
  formulesF3: number;
  clientPaye: number;
  prospectPerdu: number;
  appels: number;
  reponsesClient: number;
  emailsIn: number;
  emailsOut: number;
  whatsappOut: number;
  matchings: number;
  relancesFormules: number;
};

export type DailyReport = {
  timezone: string;
  day: string;
  generatedAt: string;
  today: DayTotals;
  yesterday: DayTotals | null;
  delta: Record<keyof Omit<DayTotals, "date">, number>;
  series: DayTotals[];
  lists: {
    newContacts: ReportPerson[];
    formulesChoisies: ReportPerson[];
    clientPaye: ReportPerson[];
    prospectPerdu: ReportPerson[];
    appels: ReportPerson[];
    reponsesClient: ReportPerson[];
  };
  priorities: {
    unassigned: ReportPerson[];
    noFirstTouch: ReportPerson[];
    formulesSansReponse: ReportPerson[];
    attentePaiement: ReportPerson[];
    unreadInbox: ReportPerson[];
    payeSansMatching: ReportPerson[];
    prioritaires: ReportPerson[];
  };
  pipeline: Record<string, number>;
};

export function shanghaiDayString(at: Date = new Date()): string {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: REPORT_TZ,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(at);
  const y = parts.find((p) => p.type === "year")?.value;
  const m = parts.find((p) => p.type === "month")?.value;
  const d = parts.find((p) => p.type === "day")?.value;
  return `${y}-${m}-${d}`;
}

export function isValidDayString(value: unknown): value is string {
  return /^\d{4}-\d{2}-\d{2}$/.test(String(value || ""));
}

export function shanghaiDayBounds(day: string): { startIso: string; endIso: string } {
  if (!isValidDayString(day)) throw new Error("date invalide");
  const start = new Date(`${day}T00:00:00+08:00`);
  const end = new Date(start.getTime() + 24 * 60 * 60 * 1000);
  return { startIso: start.toISOString(), endIso: end.toISOString() };
}

export function addShanghaiDays(day: string, delta: number): string {
  const { startIso } = shanghaiDayBounds(day);
  return shanghaiDayString(
    new Date(new Date(startIso).getTime() + delta * 86400000),
  );
}

export function dayWindow(endDay: string, count: number): string[] {
  const n = Math.max(1, Math.min(60, count));
  const out: string[] = [];
  for (let i = n - 1; i >= 0; i -= 1) out.push(addShanghaiDays(endDay, -i));
  return out;
}

export function formatDelta(n: number): string {
  if (n > 0) return `+${n}`;
  if (n < 0) return String(n);
  return "0";
}
