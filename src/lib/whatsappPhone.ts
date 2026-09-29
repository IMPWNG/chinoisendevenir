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
