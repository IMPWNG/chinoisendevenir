/**
 * Self-check for editable email drafts.
 * Run: npx tsx src/lib/emailTemplateDrafts.check.ts
 */
import {
  CARD_EMAIL_TEMPLATE_KEYS,
  generateDraftEmailHtml,
  getEmailTemplateDraft,
} from "./emailTemplateDrafts";

function assert(cond: unknown, msg: string): asserts cond {
  if (!cond) throw new Error(msg);
}

assert(CARD_EMAIL_TEMPLATE_KEYS.length === 1, "un seul modèle");
assert(CARD_EMAIL_TEMPLATE_KEYS[0] === "espace_etudiant", "clé espace");

const espace = getEmailTemplateDraft("espace_etudiant");
assert(espace, "draft espace");
assert(espace.body.includes("Créer un compte"), "espace : création");
assert(espace.body.includes("espace-etudiant/guide"), "espace : guide");
assert(espace.body.includes("espace-etudiant/connexion"), "espace : connexion");
assert(espace.body.includes("déjà payé"), "espace : paiements");

const html = generateDraftEmailHtml({ prenom: "Awa" }, espace);
assert(html.includes("Bonjour Awa"), "prénom");
assert(html.includes("espace étudiant"), "titre dans le html");
assert(!html.includes("<script"), "pas de script");

assert(getEmailTemplateDraft("ouverture_printemps") === null, "printemps retiré");
assert(getEmailTemplateDraft("relance_1") === null, "relance 1 retirée");
assert(getEmailTemplateDraft("inconnu") === null, "clé inconnue");

console.log("emailTemplateDrafts.check ok");
