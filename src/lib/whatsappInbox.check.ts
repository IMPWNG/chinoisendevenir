/**
 * Self-check for the WhatsApp home table split.
 * Run: npx tsx src/lib/whatsappInbox.check.ts
 */
import { splitWhatsappInbox } from "./whatsappInbox";

function assert(cond: unknown, msg: string): asserts cond {
  if (!cond) throw new Error(msg);
}

const report = splitWhatsappInbox(
  [
    { id: "a", prenom: "Ada", nom: "Lovelace", phone: "+336" },
    { id: "b", prenom: "Bo", nom: "", phone: "+237" },
    { id: "c", prenom: "Calme", nom: "X" },
  ],
  new Map([
    ["a", [{ body: "question", fromMe: false, timestamp: 200 }]],
    ["b", [{ body: "relance", fromMe: true, timestamp: 300 }]],
  ]),
  new Date("2026-10-08T00:00:00.000Z").getTime(),
);

assert(report.needOurReply.length === 1 && report.needOurReply[0]?.name === "Ada Lovelace", "student last");
assert(report.needStudentReply.length === 1 && report.needStudentReply[0]?.body === "relance", "our last");
assert(report.needOurReply[0]?.direction === "in", "in");
assert(!report.needOurReply.some((row) => row.id === "c"), "no thread skipped");

console.log("whatsappInbox check ok");
