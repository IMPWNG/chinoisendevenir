/**
 * Self-check for country normalization.
 * Run: npx tsx src/lib/countries.check.ts
 */
import { canonicalCountry } from "./countries";

function assert(cond: unknown, msg: string): asserts cond {
  if (!cond) throw new Error(msg);
}

assert(
  canonicalCountry("République démocratique du Congo 🇨🇩") ===
    "République démocratique du Congo",
  "rdc emoji",
);
assert(canonicalCountry("RDC") === "République démocratique du Congo", "RDC");
assert(canonicalCountry("La RDC") === "République démocratique du Congo", "La RDC");
assert(canonicalCountry("RDCongo") === "République démocratique du Congo", "RDCongo");
assert(canonicalCountry("Senegal") === "Sénégal", "senegal");
assert(canonicalCountry("Le Mali") === "Mali", "le mali");
assert(canonicalCountry("Guinée Conakry") === "Guinée", "guinee conakry");
assert(canonicalCountry("MADAGASCAR") === "Madagascar", "madagascar caps");
assert(canonicalCountry("TCHAD") === "Tchad", "tchad");
assert(canonicalCountry("Cote d'ivoire") === "Côte d'Ivoire", "cote ivoire");
assert(
  canonicalCountry("République du congo") === "République du Congo",
  "congo brazzaville case",
);
assert(canonicalCountry("") === null, "empty");
assert(canonicalCountry("Narnia") === null, "unknown");

console.log("countries check ok");
