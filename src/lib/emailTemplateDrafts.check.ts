/**
 * Self-check for editable email drafts.
 * Run: npx tsx src/lib/emailTemplateDrafts.check.ts
 */
import {
  CARD_EMAIL_TEMPLATE_KEYS,
  formuleChoiceLines,
  generateDraftEmailHtml,
  getEmailTemplateDraft,
} from "./emailTemplateDrafts";

function assert(cond: unknown, msg: string): asserts cond {
  if (!cond) throw new Error(msg);
}

assert(CARD_EMAIL_TEMPLATE_KEYS.length === 3, "3 modèles");
assert(CARD_EMAIL_TEMPLATE_KEYS.includes("reponse_general"), "bienvenue");
assert(CARD_EMAIL_TEMPLATE_KEYS.includes("formules_presentation"), "formules");
assert(CARD_EMAIL_TEMPLATE_KEYS.includes("espace_etudiant"), "espace");

const bienvenue = getEmailTemplateDraft("reponse_general");
assert(bienvenue, "draft bienvenue");
assert(bienvenue.body.includes("bien reçu"), "bienvenue : reçu");
assert(bienvenue.body.includes("formulaire"), "bienvenue : formulaire");

const formules = getEmailTemplateDraft("formules_presentation");
assert(formules, "draft formules");
assert(formules.body.includes(formuleChoiceLines()), "formules : 3 tarifs");
assert(formules.body.includes("aucun paiement"), "formules : pas de paiement");

const espace = getEmailTemplateDraft("espace_etudiant");
assert(espace, "draft espace");
assert(espace.body.includes("Créer un compte"), "espace : création");
assert(espace.body.includes("espace-etudiant/guide"), "espace : guide");
assert(
  !espace.body.includes("ni l'ouverture d'un compte WeChat"),
  "disclaimer without WeChat/Alipay/bank account",
);

const html = generateDraftEmailHtml({ prenom: "Awa" }, bienvenue);
assert(html.includes("Bonjour Awa"), "prénom");
assert(!html.includes("<script"), "pas de script");

assert(getEmailTemplateDraft("ouverture_printemps") === null, "printemps retiré");
assert(getEmailTemplateDraft("inconnu") === null, "clé inconnue");

console.log("emailTemplateDrafts.check ok");
