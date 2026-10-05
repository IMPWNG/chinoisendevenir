/**
 * Self-check: AI brief orders + clickable links in email HTML.
 * Run: npx tsx src/lib/emailCompose.check.ts
 */
import { STUDENT_WHATSAPP_MAX, adminOrderBlock, studentWhatsappDraft } from "./emailCompose";
import { plainTextToEmailBodyHtml, textToLinkedHtml } from "./emailLayout";

function assert(cond: unknown, msg: string): asserts cond {
  if (!cond) throw new Error(msg);
}

const short = "Votre dossier est prêt. On peut en parler demain à 15h ?\n\nL'équipe Chinois en Devenir";
const drafted = studentWhatsappDraft({ body: short }, "", "Awa");
assert(drafted?.startsWith("Bonjour Awa,"), "adds first name");

const already = studentWhatsappDraft(
  { body: "Bonjour Awa,\n\nOn se rappelle demain." },
  "",
  "Awa",
);
assert(already === "Bonjour Awa,\n\nOn se rappelle demain.", "keeps greeting");

const long = `${"Phrase assez longue pour remplir le message. ".repeat(40)}Fin.`;
const kept = studentWhatsappDraft({ body: long }, "", "");
assert(kept !== null && kept.includes("Fin."), "keeps long drafts");
assert((kept || "").length > 500, "no 500-char clip");
assert(studentWhatsappDraft({ body: "trop court" }, "", "") === null, "rejects tiny");
assert(studentWhatsappDraft(null, '{"body":"secret"}', "") === null, "rejects json blob");
assert(
  (studentWhatsappDraft({ body: "A".repeat(5000) }, "", "") || "").length <=
    STUDENT_WHATSAPP_MAX,
  "whatsapp platform cap only",
);

const orders = adminOrderBlock(
  "RDV jeudi (indiquer les formules) (ton convaincant) https://chinoisendevenir.com/tarifs",
);
assert(orders.includes("indiquer les formules"), "keeps parenthetical order");
assert(orders.includes("ton convaincant"), "keeps tone order");
assert(orders.includes("https://chinoisendevenir.com/tarifs"), "keeps url");
assert(/3 formules/.test(orders), "asks to list packages");

const linked = textToLinkedHtml(
  "Voir https://chinoisendevenir.com/tarifs et [le site](https://chinoisendevenir.com/)",
);
assert(
  linked.includes('href="https://chinoisendevenir.com/tarifs"'),
  "raw url becomes href",
);
assert(linked.includes('class="body-link"'), "uses body-link");
assert(linked.includes(">le site</a>"), "markdown label");
assert(!linked.includes("javascript:"), "no javascript scheme");

const html = plainTextToEmailBodyHtml("Lien: https://chinoisendevenir.com/processus");
assert(html.includes("<a href="), "paragraph html has anchor");
assert(
  textToLinkedHtml("javascript:alert(1)").includes("javascript:alert(1)") === false ||
    !textToLinkedHtml("javascript:alert(1)").includes("<a "),
  "rejects javascript url",
);

console.log("emailCompose check ok");
