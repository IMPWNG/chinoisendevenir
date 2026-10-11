/**
 * Self-check for editable email drafts.
 * Run: npx tsx src/lib/emailTemplateDrafts.check.ts
 */
import {
  CARD_EMAIL_TEMPLATE_KEYS,
  formuleChoiceLines,
  generateDraftEmailHtml,
  generateFormulesEmailHtml,
  getEmailTemplateDraft,
  renderEditableEmailHtml,
} from "./emailTemplateDrafts";

function assert(cond: unknown, msg: string): asserts cond {
  if (!cond) throw new Error(msg);
}

assert(CARD_EMAIL_TEMPLATE_KEYS.length === 4, "4 modèles");
assert(CARD_EMAIL_TEMPLATE_KEYS.includes("reponse_general"), "bienvenue");
assert(CARD_EMAIL_TEMPLATE_KEYS.includes("formules_presentation"), "formules");
assert(CARD_EMAIL_TEMPLATE_KEYS.includes("espace_etudiant"), "espace");
assert(CARD_EMAIL_TEMPLATE_KEYS.includes("liste_documents"), "documents");

const bienvenue = getEmailTemplateDraft("reponse_general");
assert(bienvenue, "draft bienvenue");
assert(bienvenue.body.includes("bien reçu"), "bienvenue : reçu");
assert(bienvenue.body.includes("formulaire"), "bienvenue : formulaire");

const formules = getEmailTemplateDraft("formules_presentation");
assert(formules, "draft formules");
assert(formules.body.includes(formuleChoiceLines()), "formules : 3 tarifs");
assert(formules.body.includes("aucun paiement"), "formules : pas de paiement");
assert(
  formules.body.includes("https://chinoisendevenir.com/tarifs"),
  "formules : lien tarifs",
);
assert(
  formules.body.includes("Recherche personnalisée d'écoles de langue en Chine"),
  "formules : détail formule 1",
);
assert(
  formules.body.includes("Dépôt de jusqu'à 5 candidatures universitaires"),
  "formules : détail formule 2",
);

const espace = getEmailTemplateDraft("espace_etudiant");
assert(espace, "draft espace");
assert(espace.body.includes("Créer un compte"), "espace : création");
assert(espace.body.includes("espace-etudiant/guide"), "espace : guide");
assert(
  !espace.body.includes("ni l'ouverture d'un compte WeChat"),
  "disclaimer without WeChat/Alipay/bank account",
);

const formulesHtml = generateFormulesEmailHtml({ prenom: "Awa" });
assert(formulesHtml.includes("Bonjour Awa"), "formules : prénom");
assert(
  formulesHtml.includes('href="https://chinoisendevenir.com/tarifs"'),
  "formules : lien cliquable",
);
assert(formulesHtml.includes("text-decoration:underline"), "formules : titres soulignés");
assert(formulesHtml.includes("Recommandée"), "formules : formule 3");
assert(formulesHtml.includes("<table"), "formules : tableau");
const edited = renderEditableEmailHtml(
  { prenom: "Awa" },
  {
    customSubject: formules.subject,
    customTitle: formules.title,
    customSubtitle: formules.subtitle,
    customMessage: "Texte modifié par l'admin",
  },
);
assert(edited.includes("Texte modifié"), "texte modifié conservé");
assert(!edited.includes("Recommandée"), "texte modifié : pas le tableau");

const html = generateDraftEmailHtml({ prenom: "Awa" }, bienvenue);
assert(html.includes("Bonjour Awa"), "prénom");
assert(!html.includes("<script"), "pas de script");

const documents = getEmailTemplateDraft("liste_documents");
assert(documents, "draft documents");
assert(documents.body.includes("page d'information du passeport"), "documents : passeport");
assert(documents.body.includes("3 000 USD"), "documents : fonds");
assert(documents.body.includes("150 RMB — 18,75 € (12 299 F CFA)"), "documents : traduction");
assert(documents.body.includes("ne sont pas inclus"), "documents : hors accompagnement");

assert(getEmailTemplateDraft("ouverture_printemps") === null, "printemps retiré");
assert(getEmailTemplateDraft("inconnu") === null, "clé inconnue");

console.log("emailTemplateDrafts.check ok");
