/**
 * Run: npx tsx src/lib/openwa.check.ts
 */
import { fillWhatsappText } from "./openwa";

function assert(cond: unknown, msg: string): asserts cond {
  if (!cond) throw new Error(msg);
}

assert(
  fillWhatsappText("Bonjour {prenom} {nom}", "Léa", "Martin") === "Bonjour Léa Martin",
  "names fill in",
);
assert(fillWhatsappText("  Bonjour  ", "", "") === "Bonjour", "trim");

console.log("openwa check ok");
