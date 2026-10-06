/**
 * Self-check: student space unlock is the admin flag, not client_payé.
 * Run: npx tsx src/lib/suiviStatuts.check.ts
 */
import { PAID_STATUSES, canonicalStatut } from "./suiviStatuts";
import {
  canStudentChooseFormule,
  isStudentAccessGranted,
  isStudentSpaceUnlocked,
} from "./studentProgress";

function assert(cond: unknown, msg: string): asserts cond {
  if (!cond) throw new Error(msg);
}

assert(PAID_STATUSES.has("client_payé"), "paid includes client_payé");
assert(
  isStudentSpaceUnlocked({ espace_debloque: true, suivi_statut: "formule_choisie" }),
  "flag unlocks without paid status",
);
assert(
  !isStudentSpaceUnlocked({ espace_debloque: false, suivi_statut: "client_payé" }),
  "flag off stays locked even if paid",
);
assert(
  !isStudentAccessGranted({
    espace_debloque: true,
    prenom: "A",
    nom: "B",
    pays: "FR",
    dernier_diplome: "Bac",
    domaine_etudes: "Droit",
  }),
  "unlock without formule is not full access",
);
assert(
  isStudentAccessGranted({
    espace_debloque: true,
    formule: "Admission universitaire",
    prenom: "A",
    nom: "B",
    pays: "FR",
    dernier_diplome: "Bac",
    domaine_etudes: "Droit",
  }),
  "flag + formule grants access",
);
assert(
  canStudentChooseFormule({
    prenom: "A",
    nom: "B",
    pays: "FR",
    dernier_diplome: "Bac",
    domaine_etudes: "Droit",
  }),
  "no formule yet → student can choose",
);
assert(
  !canStudentChooseFormule({
    prenom: "A",
    nom: "B",
    pays: "FR",
    dernier_diplome: "Bac",
    domaine_etudes: "Droit",
    formule: "Admission universitaire",
  }),
  "already chosen → no picker",
);
assert(canonicalStatut("client_payé") === "client_payé", "canonical client_payé");
assert(canonicalStatut("perdu") === "prospect_perdu", "legacy perdu maps");
assert(canonicalStatut("prospect_perdu") === "prospect_perdu", "prospect_perdu stays");

console.log("suiviStatuts unlock check ok");
