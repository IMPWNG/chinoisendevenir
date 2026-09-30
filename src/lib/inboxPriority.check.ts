/**
 * Self-check for inbox priority (unread mail / WhatsApp).
 * Run: npx tsx src/lib/inboxPriority.check.ts
 */
import {
  isInboxPending,
  pendingWhatsappContactIds,
  sortInboxFirst,
  unreadChatPhones,
} from "./inboxPriority";

function assert(cond: unknown, msg: string): asserts cond {
  if (!cond) throw new Error(msg);
}

const phones = unreadChatPhones([
  { id: "33600000001@c.us", unreadCount: 2, kind: "individual" },
  { id: "33600000002@c.us", unreadCount: 0 },
  { id: "120363@g.us", unreadCount: 4, isGroup: true, kind: "group" },
  { id: "19813070032933@lid", unreadCount: 1 },
  { id: "237677135084@c.us", unreadCount: "3" },
]);
assert(phones.join(",") === "33600000001,237677135084", "unread individual phones");

assert(
  unreadChatPhones({ data: [{ id: "33600000009@c.us", unreadCount: 1 }] }).join() ===
    "33600000009",
  "wrapped list",
);

const ids = pendingWhatsappContactIds(
  [
    { id: "a", phone: "+33600000001", pays: "France" },
    { id: "b", phone: "0600000002", pays: "France" },
    { id: "c", phone: null, pays: "France" },
  ],
  ["33600000001"],
);
assert(ids.join() === "a", "match stored phones");

const unread = { a: 1 };
const wa = new Set(["b"]);
assert(isInboxPending("a", unread, wa), "unread mail");
assert(isInboxPending("b", unread, wa), "unread whatsapp");
assert(!isInboxPending("c", unread, wa), "nothing pending");

const sorted = sortInboxFirst(
  [
    { id: "old" },
    { id: "mail" },
    { id: "wa" },
  ],
  (row) => row.id !== "old",
);
assert(sorted.map((row) => row.id).join(",") === "mail,wa,old", "pending first");
assert(
  sortInboxFirst([{ id: "old" }, { id: "mail" }], () => false)[0].id === "old",
  "stable when nobody is pending",
);

console.log("inboxPriority check ok");
