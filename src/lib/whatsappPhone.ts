import { canonicalCountry } from "./countries";

/** Digits for OpenWA: international MSISDN, no plus, no leading zero.
 *  ponytail: a national 0-prefix is rewritten to +33 only when the country is France.
 *  Other countries must already be stored in international form.
 */
export function whatsappMsisdn(raw: unknown, country?: string | null): string | null {
  let digits = String(raw ?? "").replace(/\D/g, "");
  if (digits.startsWith("00")) digits = digits.slice(2);
  if (
    digits.length === 10 &&
    digits.startsWith("0") &&
    canonicalCountry(country) === "France"
  ) {
    digits = `33${digits.slice(1)}`;
  }
  if (!/^[1-9]\d{7,14}$/.test(digits)) return null;
  return digits;
}

/** Chat id for sends, contacts and labels.
 *  ponytail: a privacy id (@lid) is mapped back to the phone JID. WhatsApp
 *  still answers history, labels and isMyContact on `{msisdn}@c.us`.
 */
export function whatsappChatId(number: string, whatsappId: unknown): string | null {
  const id = String(whatsappId || "");
  if (/^\d+@c\.us$/.test(id)) return id;
  if (/^\d+@lid$/.test(id) && /^[1-9]\d{7,14}$/.test(number)) {
    return `${number}@c.us`;
  }
  return null;
}

/** WhatsApp Business label « Étude Chine », emoji and accents ignored. */
export function isEtudeChineLabel(name: unknown): boolean {
  const folded = String(name ?? "")
    .normalize("NFD")
    .replace(/\p{M}/gu, "")
    .replace(/\p{Extended_Pictographic}|\p{Regional_Indicator}/gu, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
  return folded === "etude chine" || folded.startsWith("etude chine ");
}
