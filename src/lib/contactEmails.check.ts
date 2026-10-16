/**
 * Self-check for contact email helpers.
 * Run: npx tsx src/lib/contactEmails.check.ts
 */
import { emailHtmlToText, isFormWelcomeSubject } from "./contactEmails";

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

assert(
  isFormWelcomeSubject(
    "Etude Chine — Nous avons bien reçu votre demande, Kadra",
  ),
  "welcome subject",
);
assert(
  !isFormWelcomeSubject(
    "Etude Chine — Nos formules d'accompagnement pour étudier en Chine",
  ),
  "formules is not the welcome",
);

console.log("contactEmails check ok");
