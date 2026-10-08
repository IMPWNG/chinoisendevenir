/**
 * Unanswered email threads for the admin home (full + limited).
 * - needOurReply: last message is inbound (student wrote, we must answer)
 * - needStudentReply: last message is outbound (we wrote, student silent)
 */
import type { AdminClient } from "./supabaseAdmin";
import { displayFormuleLabel } from "./formules";
import { canonicalStatut } from "./suiviStatuts";
import {
  REPORT_TZ,
  addShanghaiDays,
  shanghaiDayBounds,
  shanghaiDayString,
} from "./dailyReportShared";
import { attachEmailTags } from "./emailTagSummary";

export type EmailWeekItem = {
  id: string;
  contactId: string;
  direction: "in" | "out";
  subject: string;
  body: string;
  preview: string;
  sentAt: string;
  fromEmail: string;
  toEmail: string;
  name: string;
  email: string;
  statut: string;
  formule: string;
  awaitingDays?: number;
  /** Short CRM label shown next to the student name. */
  tag?: string;
};

export type UnansweredEmailsReport = {
  timezone: string;
  generatedAt: string;
  needOurReply: EmailWeekItem[];
  needStudentReply: EmailWeekItem[];
};

/** @deprecated alias — keep API consumers compiling during rename */
export type EmailWeekReport = UnansweredEmailsReport & {
  weekStart?: string;
  weekEnd?: string;
  received?: EmailWeekItem[];
  sent?: EmailWeekItem[];
  awaiting?: EmailWeekItem[];
};

type EmailRow = {
  id: string;
  contact_id: string;
  direction: string;
  subject?: string | null;
  body_text?: string | null;
  from_email?: string | null;
  to_email?: string | null;
  sent_at: string;
  read_at?: string | null;
  dismissed_at?: string | null;
};

type ContactLite = {
  id: string;
  prenom?: string | null;
  nom?: string | null;
  email?: string | null;
  suivi_statut?: string | null;
  formule?: string | null;
};

const LOOKBACK_DAYS = 45;
const LIST_CAP = 40;
const PREVIEW_LEN = 160;

export function previewText(body: string | null | undefined) {
  const text = String(body || "")
    .replace(/\s+/g, " ")
    .trim();
  if (text.length <= PREVIEW_LEN) return text;
  return `${text.slice(0, PREVIEW_LEN)}…`;
}

function contactName(c: ContactLite | undefined, fallbackEmail: string) {
  const name = [c?.prenom, c?.nom].filter(Boolean).join(" ").trim();
  return name || fallbackEmail || "Sans nom";
}

function toItem(
  row: EmailRow,
  contact: ContactLite | undefined,
  awaitingDays?: number,
): EmailWeekItem {
  const email = String(contact?.email || row.from_email || row.to_email || "");
  const formuleRaw = contact?.formule;
  return {
    id: String(row.id),
    contactId: String(row.contact_id),
    direction: row.direction === "in" ? "in" : "out",
    subject: String(row.subject || "").trim() || "(sans objet)",
    body: String(row.body_text || "").trim(),
    preview: previewText(row.body_text),
    sentAt: String(row.sent_at || ""),
    fromEmail: String(row.from_email || ""),
    toEmail: String(row.to_email || ""),
    name: contactName(contact, email),
    email,
    statut: canonicalStatut(contact?.suivi_statut) || "",
    formule:
      formuleRaw != null && String(formuleRaw).trim()
        ? displayFormuleLabel(formuleRaw)
        : "",
    awaitingDays,
  };
}

/** Latest email per contact. */
export function latestEmailByContact(rows: EmailRow[]): EmailRow[] {
  const latest = new Map<string, EmailRow>();
  for (const row of rows) {
    const id = String(row.contact_id || "");
    if (!id) continue;
    const prev = latest.get(id);
    if (!prev || String(row.sent_at) > String(prev.sent_at)) {
      latest.set(id, row);
    }
  }
  return [...latest.values()].sort((a, b) =>
    String(b.sent_at).localeCompare(String(a.sent_at)),
  );
}

/** Latest mail per contact, skipping threads an admin already cleared. */
export function latestOpenEmails(rows: EmailRow[]): EmailRow[] {
  return latestEmailByContact(rows).filter((row) => !row.dismissed_at);
}

/** @deprecated use latestEmailByContact + filter direction */
export function pickAwaitingReply(rows: EmailRow[]): EmailRow[] {
  return latestOpenEmails(rows).filter((row) => row.direction === "in");
}

async function mapContacts(
  admin: AdminClient,
  ids: string[],
): Promise<Map<string, ContactLite>> {
  const map = new Map<string, ContactLite>();
  const unique = [...new Set(ids.filter(Boolean))];
  for (let i = 0; i < unique.length; i += 80) {
    const chunk = unique.slice(i, i + 80);
    const { data, error } = await admin
      .from("contacts")
      .select("id, prenom, nom, email, suivi_statut, formule")
      .in("id", chunk);
    if (error) throw error;
    for (const row of (data || []) as ContactLite[]) {
      map.set(String(row.id), row);
    }
  }
  return map;
}

function ageDays(sentAt: string, nowMs: number) {
  return Math.max(
    0,
    Math.floor((nowMs - new Date(sentAt).getTime()) / 86400000),
  );
}

export async function buildUnansweredEmailsReport(
  admin: AdminClient,
): Promise<UnansweredEmailsReport> {
  const lookbackStart = shanghaiDayBounds(
    addShanghaiDays(shanghaiDayString(), -LOOKBACK_DAYS),
  ).startIso;

  const empty = (): UnansweredEmailsReport => ({
    timezone: REPORT_TZ,
    generatedAt: new Date().toISOString(),
    needOurReply: [],
    needStudentReply: [],
  });

  const { data, error } = await admin
    .from("contact_emails")
    .select(
      "id, contact_id, direction, subject, body_text, from_email, to_email, sent_at, read_at, dismissed_at",
    )
    .gte("sent_at", lookbackStart)
    .order("sent_at", { ascending: false })
    .limit(3000);

  if (error) {
    if (/relation|does not exist|schema cache/i.test(error.message)) {
      return empty();
    }
    throw error;
  }

  const latest = latestOpenEmails((data || []) as EmailRow[]);
  const needOur = latest
    .filter((r) => r.direction === "in")
    .slice(0, LIST_CAP);
  const needStudent = latest
    .filter((r) => r.direction !== "in")
    .slice(0, LIST_CAP);

  const contacts = await mapContacts(admin, [
    ...needOur.map((r) => String(r.contact_id)),
    ...needStudent.map((r) => String(r.contact_id)),
  ]);

  const now = Date.now();
  const needOurReply = needOur.map((r) =>
    toItem(r, contacts.get(String(r.contact_id)), ageDays(r.sent_at, now)),
  );
  const needStudentReply = needStudent.map((r) =>
    toItem(r, contacts.get(String(r.contact_id)), ageDays(r.sent_at, now)),
  );

  const tagged = await attachEmailTags([...needOurReply, ...needStudentReply], {
    useAi: true,
  });
  const byId = new Map(tagged.map((item) => [item.id, item.tag]));

  return {
    timezone: REPORT_TZ,
    generatedAt: new Date().toISOString(),
    needOurReply: needOurReply.map((item) => ({
      ...item,
      tag: byId.get(item.id) || item.tag,
    })),
    needStudentReply: needStudentReply.map((item) => ({
      ...item,
      tag: byId.get(item.id) || item.tag,
    })),
  };
}

/** Kept for the existing route name. */
export async function buildEmailWeekReport(
  admin: AdminClient,
): Promise<EmailWeekReport> {
  const report = await buildUnansweredEmailsReport(admin);
  return {
    ...report,
    awaiting: report.needOurReply,
    received: [],
    sent: [],
  };
}

export const __test = {
  latestEmailByContact,
  latestOpenEmails,
  pickAwaitingReply,
  previewText,
};
