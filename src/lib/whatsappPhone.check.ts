/**
 * Self-check for WhatsApp number normalization.
 * Run: npx tsx src/lib/whatsappPhone.check.ts
 */
import { isEtudeChineLabel, whatsappMsisdn } from "./whatsappPhone";

function assert(cond: unknown, msg: string): asserts cond {
  if (!cond) throw new Error(msg);
}

assert(whatsappMsisdn("+33 6 12 34 56 78") === "33612345678", "plus 33");
assert(whatsappMsisdn("0033612345678") === "33612345678", "00 prefix");
assert(whatsappMsisdn("0612345678", "France") === "33612345678", "french local");
assert(whatsappMsisdn("0612345678", "Sénégal") === null, "other local");
assert(whatsappMsisdn("221771234567", "Sénégal") === "221771234567", "senegal intl");
assert(whatsappMsisdn("") === null, "empty");
assert(whatsappMsisdn("123") === null, "too short");
assert(isEtudeChineLabel("Étude Chine 🇨🇳"), "label emoji");
assert(isEtudeChineLabel("etude chine"), "label plain");
assert(!isEtudeChineLabel("Chongqing Guide"), "other label");

console.log("whatsappPhone check ok");
