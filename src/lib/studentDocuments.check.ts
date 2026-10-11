/**
 * Requested-document keys stay inside the catalog, in catalog order.
 * Run: npx tsx src/lib/studentDocuments.check.ts
 */
import {
  parseRequestedDocumentKeys,
  STARTER_DOSSIER_DOCUMENT_KEYS,
  STUDENT_DOCUMENT_CATALOG,
  withStarterDocuments,
} from "./studentProgress";

function assert(cond: unknown, msg: string): asserts cond {
  if (!cond) throw new Error(msg);
}

const keys = STUDENT_DOCUMENT_CATALOG.map((doc) => doc.key);
assert(new Set(keys).size === keys.length, "catalog keys are unique");
assert(keys.includes("passeport") && keys.includes("autorisation_parentale"), "catalog covers passport and guardian");
assert(keys.includes("hskk") && keys.includes("portfolio") && keys.includes("projet_recherche"), "catalog covers language, art, research");

assert(parseRequestedDocumentKeys(null).length === 0, "null asks for nothing");
assert(parseRequestedDocumentKeys([]).length === 0, "empty asks for nothing");
assert(parseRequestedDocumentKeys(["inconnu", ""]).length === 0, "unknown keys dropped");

const picked = parseRequestedDocumentKeys(["projet_recherche", "passeport", "passeport", "nope"]);
assert(picked.length === 2 && picked[0] === "passeport" && picked[1] === "projet_recherche", "catalog order, duplicates dropped");

const starter = withStarterDocuments(["hsk"]);
assert(starter.includes("hsk") && starter.includes("passeport") && starter.includes("financial_proof"), "starter docs added");
assert(starter.filter((key) => key === "passeport").length === 1, "starter does not duplicate");
assert(STARTER_DOSSIER_DOCUMENT_KEYS.length === 6, "six starter documents");

console.log("requested documents ok");
