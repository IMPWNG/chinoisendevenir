/**
 * Self-check for the short student WhatsApp draft.
 * Run: npx tsx src/lib/emailCompose.check.ts
 */
import { STUDENT_WHATSAPP_MAX, studentWhatsappDraft } from "./emailCompose";

function assert(cond: unknown, msg: string): asserts cond {
  if (!cond) throw new Error(msg);
}

const short = "Votre dossier est prêt. On peut en parler demain à 15h ?\n\nL'équipe Chinois en Devenir";
const drafted = studentWhatsappDraft({ body: short }, "", "Awa");
assert(drafted?.startsWith("Bonjour Awa,"), "adds first name");
assert((drafted || "").length <= STUDENT_WHATSAPP_MAX, "stays short");

const already = studentWhatsappDraft(
  { body: "Bonjour Awa,\n\nOn se rappelle demain." },
  "",
  "Awa",
);
assert(already === "Bonjour Awa,\n\nOn se rappelle demain.", "keeps greeting");

const long = `${"Phrase assez longue pour remplir le message. ".repeat(40)}Fin.`;
const clipped = studentWhatsappDraft({ body: long }, "", "");
assert(clipped !== null && clipped.length <= STUDENT_WHATSAPP_MAX, "clips email length");
assert(studentWhatsappDraft({ body: "trop court" }, "", "") === null, "rejects tiny");
assert(studentWhatsappDraft(null, '{"body":"secret"}', "") === null, "rejects json blob");

console.log("emailCompose check ok");
