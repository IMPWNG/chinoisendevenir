/**
 * Self-check for editable email drafts.
 * Run: npx tsx src/lib/emailTemplateDrafts.check.ts
 */
import {
  formuleChoiceLines,
  generateDraftEmailHtml,
  getEmailTemplateDraft,
} from "./emailTemplateDrafts";

function assert(cond: unknown, msg: string): asserts cond {
  if (!cond) throw new Error(msg);
}

const spring = getEmailTemplateDraft("ouverture_printemps");
assert(spring, "draft printemps");
assert(spring.body.includes("octobre"), "octobre");
assert(spring.body.includes("novembre"), "novembre");
assert(spring.body.includes("décembre"), "décembre");
assert(spring.body.includes("aucun paiement"), "pas de paiement");
assert(spring.body.includes("n'engage à rien"), "pas d'engagement");
assert(spring.body.includes("appellerons"), "appel ensuite");
assert(spring.body.includes(formuleChoiceLines()), "3 formules");
assert(spring.body.includes("1 —"), "formule 1");
assert(spring.body.includes("2 —"), "formule 2");
assert(spring.body.includes("3 —"), "formule 3");

const html = generateDraftEmailHtml({ prenom: "Awa" }, spring);
assert(html.includes("Bonjour Awa"), "prénom");
assert(html.includes("printemps"), "printemps dans le html");
assert(!html.includes("<script"), "pas de script");

assert(getEmailTemplateDraft("relance_1")?.body.includes("formulaire"), "relance 1");
const espace = getEmailTemplateDraft("espace_etudiant");
assert(espace?.body.includes("Créer un compte"), "espace : création");
assert(espace?.body.includes("espace-etudiant/guide"), "espace : guide");
assert(espace?.body.includes("espace-etudiant/connexion"), "espace : connexion");
assert(espace?.body.includes("déjà payé"), "espace : paiements");
assert(getEmailTemplateDraft("inconnu") === null, "clé inconnue");

console.log("emailTemplateDrafts.check ok");
