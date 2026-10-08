/**
 * Self-check for the agent contact feed grouping.
 * Run: npx tsx src/lib/agentContacts.check.ts
 */
import { clipAgentText, agentContactWindow, agentWhatsappMessages, groupRecent } from "./agentContacts";

function assert(cond: unknown, msg: string): asserts cond {
  if (!cond) throw new Error(msg);
}

assert(clipAgentText("  a   b ") === "a b", "collapse");
assert(clipAgentText("x".repeat(500)).endsWith("…"), "clip");
assert(clipAgentText("x".repeat(500)).length === 401, "clip length");

const grouped = groupRecent(
  [
    { contactId: "a", n: 1 },
    { contactId: "a", n: 2 },
    { contactId: "b", n: 1 },
    { contactId: "a", n: 3 },
    { contactId: "a", n: 4 },
  ],
  (row) => row.contactId,
  2,
);
assert(grouped.get("a")?.map((row) => row.n).join(",") === "1,2", "keep newest two");
assert(grouped.get("b")?.length === 1, "other contact");

assert(
  JSON.stringify(agentContactWindow("")) === JSON.stringify({ offset: 0, limit: 1000 }),
  "default is the full list",
);
assert(
  JSON.stringify(agentContactWindow("?page=2")) === JSON.stringify({ offset: 200, limit: 200 }),
  "page 2",
);
assert(
  JSON.stringify(agentContactWindow("?offset=200")) === JSON.stringify({ offset: 200, limit: 200 }),
  "offset",
);
assert(
  JSON.stringify(agentContactWindow("?offset=200&limit=50")) ===
    JSON.stringify({ offset: 200, limit: 50 }),
  "offset and limit",
);

const whatsapp = agentWhatsappMessages(
  [
    { body: "  hello  ", fromMe: false, timestamp: 100 },
    { body: "moi", fromMe: true, timestamp: 300 },
    { body: "", type: "image", fromMe: false, timestamp: 200 },
    { body: "old", direction: "incoming", timestamp: 50 },
  ],
  3,
);
assert(whatsapp.map((row) => row.body).join("|") === "moi|[image]|hello", "newest three");
assert(whatsapp.map((row) => row.direction).join(",") === "out,in,in", "direction");
assert(whatsapp[0]?.sentAt === new Date(300_000).toISOString(), "sentAt");

console.log("agentContacts check ok");
