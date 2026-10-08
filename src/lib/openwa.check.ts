/**
 * Run: npx tsx src/lib/openwa.check.ts
 */
import { fillWhatsappText, whatsappChatHead } from "./openwa";

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

console.log("openwa check ok");
