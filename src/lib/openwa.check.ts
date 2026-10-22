/**
 * Run: npx tsx src/lib/openwa.check.ts
 */
import {
  fillWhatsappText,
  mergeWhatsappThread,
  newerWhatsappRow,
  pickInboxHead,
  whatsappChatHead,
  whatsappTextParts,
} from "./openwa";

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
assert(sent?.body === "relance" && sent?.directionUnknown === true, "read preview has no sender");
assert(sent?.unread === false, "read preview");
const waiting = whatsappChatHead({ lastMessage: "question", unreadCount: 2, timestamp: 5 });
assert(waiting?.unread === true && waiting?.directionUnknown === true, "unread preview");
const readInbound = pickInboxHead(
  { body: "ancien", direction: "outgoing", timestamp: 10 },
  { body: "question", timestamp: 20, directionUnknown: true, unread: false },
);
assert(readInbound.needsHistory && readInbound.row?.body === "ancien", "read reply needs history");
const unreadNow = pickInboxHead(null, {
  body: "question",
  timestamp: 20,
  directionUnknown: true,
  unread: true,
});
assert(unreadNow.needsHistory === false && unreadNow.row?.fromMe === false, "unread is the student");
const kept = newerWhatsappRow(
  { body: "old", timestamp: 1, direction: "outgoing" },
  { body: "new", timestamp: 5, direction: "incoming" },
);
assert(kept.body === "new", "newer stored row wins");
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
assert(whatsappTextParts("  Bonjour  ").join() === "Bonjour", "court message intact");
assert(whatsappTextParts("Bonjour\u2028Awa").join("\n") === "Bonjour\nAwa", "séparateur Word");
const long = `${"Paragraphe assez long pour remplir. ".repeat(120)}\n\n${"Suite du message pour la fin. ".repeat(80)}`;
const parts = whatsappTextParts(long);
assert(parts.length >= 2, "long message découpé");
assert(parts.every((part) => part.length <= 4000), "chaque partie tient dans WhatsApp");
assert(parts[0].startsWith("1/"), "numéro de partie");
assert(parts.join("\n").includes("Suite du message pour la fin."), "la fin est gardée");

console.log("openwa check ok");
