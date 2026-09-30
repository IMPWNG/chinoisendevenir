import { whatsappMsisdn } from "./whatsappPhone";

type ChatLike = {
  id?: unknown;
  unreadCount?: unknown;
  isGroup?: unknown;
  kind?: unknown;
};

/**
 * Phones with an unread WhatsApp chat.
 * ponytail: only `{msisdn}@c.us` in the page OpenWA returns (newest 200).
 * A privacy id (@lid) is skipped. Upgrade: resolve @lid via contacts/:id/phone.
 */
export function unreadChatPhones(body: unknown): string[] {
  const wrapped =
    body && typeof body === "object" && !Array.isArray(body)
      ? (body as { data?: unknown }).data
      : null;
  const rows = Array.isArray(body) ? body : Array.isArray(wrapped) ? wrapped : [];
  const phones: string[] = [];
  for (const item of rows) {
    if (!item || typeof item !== "object") continue;
    const chat = item as ChatLike;
    if (Number(chat.unreadCount) <= 0) continue;
    if (chat.isGroup === true || chat.kind === "group") continue;
    const match = /^(\d+)@c\.us$/.exec(String(chat.id || ""));
    if (match) phones.push(match[1]);
  }
  return phones;
}

export function pendingWhatsappContactIds(
  contacts: readonly { id: string; phone?: unknown; pays?: string | null }[],
  phones: readonly string[],
): string[] {
  const wanted = new Set(phones);
  const ids: string[] = [];
  for (const contact of contacts) {
    const number = whatsappMsisdn(contact.phone, contact.pays);
    if (number && wanted.has(number)) ids.push(contact.id);
  }
  return ids;
}

export function isInboxPending(
  contactId: string,
  unreadEmails: Readonly<Record<string, number>> | undefined,
  whatsappIds: ReadonlySet<string>,
): boolean {
  return (unreadEmails?.[contactId] || 0) > 0 || whatsappIds.has(contactId);
}

/** Unread mail or WhatsApp first. Same flag keeps the incoming order. */
export function sortInboxFirst<T extends { id: string }>(
  rows: readonly T[],
  pending: (row: T) => boolean,
): T[] {
  return [...rows].sort((a, b) => Number(pending(b)) - Number(pending(a)));
}
