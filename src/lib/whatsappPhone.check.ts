/**
 * Self-check for WhatsApp number normalization.
 * Run: npx tsx src/lib/whatsappPhone.check.ts
 */
import { COUNTRIES, countryDialCode } from "./countries";
import { isEtudeChineLabel, phoneWithIndicatif, whatsappChatId, whatsappMsisdn } from "./whatsappPhone";

function assert(cond: unknown, msg: string): asserts cond {
  if (!cond) throw new Error(msg);
}

assert(whatsappMsisdn("+33 6 12 34 56 78") === "33612345678", "plus 33");
assert(whatsappMsisdn("0033612345678") === "33612345678", "00 prefix");
assert(whatsappMsisdn("0612345678", "France") === "33612345678", "french local");
assert(whatsappMsisdn("0612345678", "Sénégal") === "221612345678", "senegal local");
assert(whatsappMsisdn("221771234567", "Sénégal") === "221771234567", "senegal intl");
assert(phoneWithIndicatif("07 00 00 00 00", "Côte d'Ivoire") === "+225700000000", "ivoire indicatif");
assert(phoneWithIndicatif("+221 77 123 45 67", "Sénégal") === "+221771234567", "keep existing indicatif");
assert(whatsappMsisdn("+33 6 12 34 56 78", "Sénégal") === "33612345678", "plus stays");
for (const country of COUNTRIES) {
  assert(countryDialCode(country), `dial ${country}`);
}
assert(whatsappMsisdn("") === null, "empty");
assert(whatsappMsisdn("123") === null, "too short");
assert(isEtudeChineLabel("Étude Chine 🇨🇳"), "label emoji");
assert(isEtudeChineLabel("etude chine"), "label plain");
assert(!isEtudeChineLabel("Chongqing Guide"), "other label");
assert(
  whatsappChatId("237677135084", "19813070032933@lid") === "237677135084@c.us",
  "lid maps to phone",
);
assert(
  whatsappChatId("33612345678", "33612345678@c.us") === "33612345678@c.us",
  "phone jid kept",
);
assert(whatsappChatId("33612345678", null) === null, "missing jid");

console.log("whatsappPhone check ok");
