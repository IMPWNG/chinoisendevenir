/**
 * Weekly email inbox for admin (full + limited): received, sent, awaiting reply.
 */
import type { AdminClient } from "./supabaseAdmin";
import { displayFormuleLabel } from "./formules";
import { canonicalStatut } from "./suiviStatuts";
import {
  REPORT_TZ,
  addShanghaiDays,
  shanghaiDayBounds,
  shanghaiDayString,
  isValidDayString,
} from "./dailyReportShared";

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
};

export type EmailWeekReport = {
  timezone: string;
  weekStart: string;
  weekEnd: string;
  generatedAt: string;
  received: EmailWeekItem[];
  sent: EmailWeekItem[];
  awaiting: EmailWeekItem[];
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
};

type ContactLite = {
  id: string;
  prenom?: string | null;
  nom?: string | null;
  email?: string | null;
  suivi_statut?: string | null;
  formule?: string | null;
};

const WEEK_LIST_CAP = 150;
const AWAITING_LOOKBACK_DAYS = 45;
const AWAITING_CAP = 80;
const PREVIEW_LEN = 180;

const WEEKDAY_MON0: Record<string, number> = {
  Mon: 0,
  Tue: 1,
  Wed: 2,
  Thu: 3,
  Fri: 4,
  Sat: 5,
  Sun: 6,
};

export function shanghaiWeekdayMon0(day: string): number {
  if (!isValidDayString(day)) return 0;
  const label = new Intl.DateTimeFormat("en-US", {
    timeZone: REPORT_TZ,
    weekday: "short",
  }).format(new Date(`${day}T12:00:00+08:00`));
  return WEEKDAY_MON0[label] ?? 0;
}

/** Monday 00:00 Asia/Shanghai → next Monday 00:00 (exclusive end). */
export function shanghaiWeekBounds(day = shanghaiDayString()): {
  weekStart: string;
  weekEnd: string;
  startIso: string;
  endIso: string;
} {
  const base = isValidDayString(day) ? day : shanghaiDayString();
  const monday = addShanghaiDays(base, -shanghaiWeekdayMon0(base));
  const nextMonday = addShanghaiDays(monday, 7);
  return {
    weekStart: monday,
    weekEnd: addShanghaiDays(nextMonday, -1),
    startIso: shanghaiDayBounds(monday).startIso,
    endIso: shanghaiDayBounds(nextMonday).startIso,
  };
}

function contactName(c: ContactLite | undefined, fallbackEmail: string) {
  const name = [c?.prenom, c?.nom].filter(Boolean).join(" ").trim();
  return name || fallbackEmail || "Sans nom";
}

export function previewText(body: string | null | undefined) {
  const text = String(body || "")
    .replace(/\s+/g, " ")
    .trim();
  if (text.length <= PREVIEW_LEN) return text;
  return `${text.slice(0, PREVIEW_LEN)}…`;
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

/** Latest email per contact; keep those whose last message is inbound. */
export function pickAwaitingReply(rows: EmailRow[]): EmailRow[] {
  const latest = new Map<string, EmailRow>();
  for (const row of rows) {
    const id = String(row.contact_id || "");
    if (!id) continue;
    const prev = latest.get(id);
    if (!prev || String(row.sent_at) > String(prev.sent_at)) {
      latest.set(id, row);
    }
  }
  return [...latest.values()]
    .filter((row) => row.direction === "in")
    .sort((a, b) => String(b.sent_at).localeCompare(String(a.sent_at)));
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

export async function buildEmailWeekReport(
  admin: AdminClient,
  { day = shanghaiDayString() }: { day?: string } = {},
): Promise<EmailWeekReport> {
  const week = shanghaiWeekBounds(day);
  const lookbackStart = shanghaiDayBounds(
    addShanghaiDays(week.weekStart, -AWAITING_LOOKBACK_DAYS),
  ).startIso;

  const empty = (): EmailWeekReport => ({
    timezone: REPORT_TZ,
    weekStart: week.weekStart,
    weekEnd: week.weekEnd,
    generatedAt: new Date().toISOString(),
    received: [],
    sent: [],
    awaiting: [],
  });

  const { data: weekRows, error: weekError } = await admin
    .from("contact_emails")
    .select(
      "id, contact_id, direction, subject, body_text, from_email, to_email, sent_at, read_at",
    )
    .gte("sent_at", week.startIso)
    .lt("sent_at", week.endIso)
    .order("sent_at", { ascending: false })
    .limit(800);

  if (weekError) {
    if (/relation|does not exist|schema cache/i.test(weekError.message)) {
      return empty();
    }
    throw weekError;
  }

  const { data: lookbackRows, error: lookError } = await admin
    .from("contact_emails")
    .select(
      "id, contact_id, direction, subject, body_text, from_email, to_email, sent_at, read_at",
    )
    .gte("sent_at", lookbackStart)
    .order("sent_at", { ascending: false })
    .limit(3000);

  if (
    lookError &&
    !/relation|does not exist|schema cache/i.test(lookError.message)
  ) {
    throw lookError;
  }

  const weekEmails = (weekRows || []) as EmailRow[];
  const lookback = (lookbackRows || []) as EmailRow[];
  const awaitingRaw = pickAwaitingReply(lookback).slice(0, AWAITING_CAP);

  const contacts = await mapContacts(admin, [
    ...weekEmails.map((r) => String(r.contact_id)),
    ...awaitingRaw.map((r) => String(r.contact_id)),
  ]);

  const now = Date.now();
  const received = weekEmails
    .filter((r) => r.direction === "in")
    .slice(0, WEEK_LIST_CAP)
    .map((r) => toItem(r, contacts.get(String(r.contact_id))));

  const sent = weekEmails
    .filter((r) => r.direction !== "in")
    .slice(0, WEEK_LIST_CAP)
    .map((r) => toItem(r, contacts.get(String(r.contact_id))));

  const awaiting = awaitingRaw.map((r) => {
    const age = Math.max(
      0,
      Math.floor((now - new Date(r.sent_at).getTime()) / 86400000),
    );
    return toItem(r, contacts.get(String(r.contact_id)), age);
  });

  return {
    timezone: REPORT_TZ,
    weekStart: week.weekStart,
    weekEnd: week.weekEnd,
    generatedAt: new Date().toISOString(),
    received,
    sent,
    awaiting,
  };
}

export const __test = {
  shanghaiWeekdayMon0,
  shanghaiWeekBounds,
  pickAwaitingReply,
  previewText,
};
