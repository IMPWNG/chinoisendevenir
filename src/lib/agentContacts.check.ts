/**
 * Self-check for the agent contact feed grouping.
 * Run: npx tsx src/lib/agentContacts.check.ts
 */
import { clipAgentText, groupRecent } from "./agentContacts";

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

console.log("agentContacts check ok");
