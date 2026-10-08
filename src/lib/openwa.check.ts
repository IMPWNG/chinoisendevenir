/**
 * Run: npx tsx src/lib/openwa.check.ts
 */
import { fillWhatsappText, mergeWhatsappThread, whatsappChatHead } from "./openwa";

function assert(cond: unknown, msg: string): asserts cond {
  if (!cond) throw new Error(msg);
}

assert(
  fillWhatsappText("Bonjour {prenom} {nom}", "Léa", "Martin") === "Bonjour Léa Martin",
  "names fill in",
);
assert(fillWhatsappText("  Bonjour  ", "", "") === "Bonjour", "trim");
const head = whatsappChatHead({
  lastMessage: { body: "bonjour", fromMe: true, timestamp: 10, type: "chat" },
});
assert(head?.body === "bonjour", "chat head");
assert(whatsappChatHead({ lastMessage: null }) === null, "empty head");
assert(whatsappChatHead({}) === null, "missing head");
const sent = whatsappChatHead({ lastMessage: "relance", unreadCount: 0, timestamp: 4 });
assert(sent?.body === "relance" && sent.direction === "outgoing", "string preview sent");
const waiting = whatsappChatHead({ lastMessage: "question", unreadCount: 2, timestamp: 5 });
assert(waiting?.fromMe === false, "string preview unread");
const thread = mergeWhatsappThread(
  [
    { id: "live-1", body: "un", fromMe: false, timestamp: 1 },
    { id: "same", body: "deux", fromMe: true, timestamp: 2 },
  ],
  {
    messages: [
      { waMessageId: "same", body: "deux", direction: "outgoing", timestamp: 2 },
      { id: "stored-3", body: "trois", direction: "outgoing", timestamp: 3 },
      { id: "stored-4", body: "quatre", direction: "incoming", timestamp: 4 },
      { id: "stored-5", body: "cinq", direction: "outgoing", timestamp: 5 },
      { id: "stored-6", body: "six", direction: "incoming", timestamp: 6 },
    ],
  },
);
assert(thread.length === 6, "thread keeps every message");
assert(thread[1]?.fromMe === true && thread[5]?.body === "six", "thread order");

console.log("openwa check ok");
