/**
 * Self-check for university document names.
 * Run: npx tsx src/lib/matching/documents.check.ts
 */
import { canonicalDocuments, isCanonicalDocReceived } from "./documents";

function assert(cond: unknown, msg: string): asserts cond {
  if (!cond) throw new Error(msg);
}

const messy = canonicalDocuments([
  "passport",
  "Passeport",
  "护照照片页扫描件",
  "high school diploma",
  "diplome lycee",
  "transcripts",
  "releves notes",
  "Relevés de notes",
  "HSK",
  "Certificat HSK",
  "certificat langue",
  "IELTS ou TOEFL",
  "ielts or toefl",
  "non criminal record",
  "Casier judiciaire",
  "no criminal record",
  "Personal statement",
  "study plan / lettre de motivation",
  "self statement",
  "lettre motivation",
  "financial proof",
  "financial guarantee",
  "physical exam",
  "Formulaire médical",
  "examen physique",
]);

const keys = messy.map((doc) => doc.key);
assert(keys.filter((key) => key === "passeport").length === 1, "one passport");
assert(keys.filter((key) => key === "transcripts").length === 1, "one transcript");
assert(keys.filter((key) => key === "hsk").length === 1, "one hsk");
assert(keys.filter((key) => key === "ielts_or_toefl").length === 1, "one english test");
assert(keys.filter((key) => key === "casier_judiciaire").length === 1, "one record");
assert(keys.filter((key) => key === "motivation").length === 1, "one letter");
assert(keys.filter((key) => key === "financial_proof").length === 1, "one funds");
assert(keys.filter((key) => key === "formulaire_medical").length === 1, "one medical");
assert(keys.includes("high_school_diploma"), "high school kept");
assert(!keys.includes("diplome"), "generic diploma folded");
assert(messy.every((doc) => doc.label[0] === doc.label[0].toUpperCase()), "labels capped");
assert(isCanonicalDocReceived("passeport", ["passeport"]), "upload marks passport");
assert(!isCanonicalDocReceived("passeport", []), "missing passport");
assert(isCanonicalDocReceived("diplome", ["bachelor_degree"]), "any diploma covers generic");

const photo = canonicalDocuments(["passport photo"]);
assert(photo.length === 1 && photo[0].key === "photo", "photo is not a passport");

console.log("document canon ok");
