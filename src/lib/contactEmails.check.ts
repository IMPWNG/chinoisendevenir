/**
 * Self-check for contact email helpers.
 * Run: npx tsx src/lib/contactEmails.check.ts
 */
import { emailHtmlToText, threadEmailParts } from "./contactEmails";

function assert(cond: unknown, msg: string): asserts cond {
  if (!cond) throw new Error(msg);
}

assert(
  emailHtmlToText("<p>Bonjour <b>Alice</b></p><br/>Suite") ===
    "Bonjour Alice\n\nSuite" ||
    emailHtmlToText("<p>Bonjour <b>Alice</b></p><br/>Suite").includes("Bonjour Alice"),
  "html to text",
);

assert(emailHtmlToText("") === "", "empty html");
assert(
  !emailHtmlToText("<script>alert(1)</script>hello").includes("alert"),
  "strips script",
);

const custom = threadEmailParts({
  subject: "Etude Chine — RDV téléphone",
  body_text: "As-tu de la dispo jeudi matin ?\n\nOn peut faire 10h.",
});
assert(custom.subject.includes("RDV"), "objet");
assert(!custom.title, "pas de titre dupliqué");
assert(custom.content.includes("jeudi"), "contenu libre");

const wrapped = threadEmailParts({
  subject: "Etude Chine — Votre espace étudiant — créer votre compte",
  body_text:
    "CHINOIS EN DEVENIR\nVotre espace étudiant\nCompte, paiements, documents et départ\n\nBonjour Awa,\n\nCréer le compte :\n1. Ouvrez le lien\n\nCordialement,\nChinois en Devenir\n",
});
assert(wrapped.greeting.startsWith("Bonjour"), "salut");
assert(wrapped.title.includes("espace"), "titre bandeau");
assert(wrapped.subtitle.toLowerCase().includes("compte"), "sous-titre");
assert(wrapped.content.includes("Créer le compte"), "corps");
assert(!wrapped.content.includes("Cordialement"), "signature coupée");

console.log("contactEmails check ok");
