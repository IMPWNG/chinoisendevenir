/**
 * Home table « WhatsApp reçu »: same split as unanswered emails.
 * needOurReply = last message from the student. needStudentReply = last message from us.
 */
import { agentWhatsappMessages } from "./agentContacts";
import { previewText } from "./adminEmailWeek";

export type WhatsappInboxItem = {
  id: string;
  contactId: string;
  direction: "in" | "out";
  body: string;
  preview: string;
  sentAt: string;
  name: string;
  phone: string;
  awaitingDays: number;
};

export type WhatsappInboxReport = {
  needOurReply: WhatsappInboxItem[];
  needStudentReply: WhatsappInboxItem[];
};

const LIST_CAP = 200;

type InboxContact = {
  id: string;
  prenom?: string | null;
  nom?: string | null;
  phone?: string | null;
};

function ageDays(sentAt: string, nowMs: number) {
  const at = new Date(sentAt).getTime();
  if (!Number.isFinite(at)) return 0;
  return Math.max(0, Math.floor((nowMs - at) / 86400000));
}

/** A cleared thread stays hidden until a newer WhatsApp message. */
export function whatsappThreadOpen(
  sentAt: string,
  dismissedMessageAt: string | null | undefined,
): boolean {
  if (!dismissedMessageAt) return true;
  const sent = Date.parse(sentAt);
  const dismissed = Date.parse(dismissedMessageAt);
  if (!Number.isFinite(sent) || !Number.isFinite(dismissed)) return true;
  return sent > dismissed;
}

export function splitWhatsappInbox(
  contacts: readonly InboxContact[],
  histories: ReadonlyMap<string, unknown[]>,
  nowMs = Date.now(),
  dismissed: ReadonlyMap<string, string> = new Map(),
): WhatsappInboxReport {
  const items: WhatsappInboxItem[] = [];
  for (const contact of contacts) {
    const latest = agentWhatsappMessages(histories.get(contact.id), 1)[0];
    if (!latest || !whatsappThreadOpen(latest.sentAt, dismissed.get(contact.id))) continue;
    const name = [contact.prenom, contact.nom].filter(Boolean).join(" ").trim() || "Sans nom";
    items.push({
      id: contact.id,
      contactId: contact.id,
      direction: latest.direction,
      body: latest.body,
      preview: previewText(latest.body),
      sentAt: latest.sentAt,
      name,
      phone: String(contact.phone || "").trim(),
      awaitingDays: ageDays(latest.sentAt, nowMs),
    });
  }
  items.sort((a, b) => b.sentAt.localeCompare(a.sentAt));
  return {
    needOurReply: items.filter((row) => row.direction === "in").slice(0, LIST_CAP),
    needStudentReply: items.filter((row) => row.direction === "out").slice(0, LIST_CAP),
  };
}
