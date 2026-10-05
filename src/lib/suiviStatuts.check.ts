/**
 * Self-check: student space unlock = paid statuses only.
 * Run: npx tsx src/lib/suiviStatuts.check.ts
 */
import {
  PAID_STATUSES,
  STUDENT_UNLOCKED_STATUSES,
  canonicalStatut,
} from "./suiviStatuts";
import { isStudentSpaceUnlocked } from "./studentProgress";

function assert(cond: unknown, msg: string): asserts cond {
  if (!cond) throw new Error(msg);
}

assert(
  STUDENT_UNLOCKED_STATUSES === PAID_STATUSES,
  "unlock set must be the paid set",
);
assert(!isStudentSpaceUnlocked("formule_choisie"), "formule_choisie stays locked");
assert(!isStudentSpaceUnlocked("attente_paiement"), "attente_paiement stays locked");
assert(!isStudentSpaceUnlocked("offre_envoyée"), "offre_envoyée stays locked");
assert(isStudentSpaceUnlocked("client_payé"), "client_payé unlocks");
assert(isStudentSpaceUnlocked("dossier_préparation"), "later paid statuses unlock");
assert(
  canonicalStatut("client_payé") === "client_payé",
  "canonical client_payé",
);
assert(canonicalStatut("perdu") === "prospect_perdu", "legacy perdu maps");
assert(canonicalStatut("prospect_perdu") === "prospect_perdu", "prospect_perdu stays");

console.log("suiviStatuts unlock check ok");
