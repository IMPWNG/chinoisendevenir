import { countryDialCode } from "./countries";

/** Digits for OpenWA: international MSISDN, no plus, no leading zero. */
export function whatsappMsisdn(raw: unknown, country?: string | null): string | null {
  const text = String(raw ?? "").trim();
  const alreadyInternational = text.startsWith("+") || /^00/.test(text.replace(/[\s().-]/g, ""));
  let digits = text.replace(/\D/g, "");
  if (digits.startsWith("00")) digits = digits.slice(2);
  const code = countryDialCode(country);
  if (code && digits && !alreadyInternational) {
    if (digits.startsWith("0")) digits = digits.slice(1);
    if (digits && !digits.startsWith(code)) digits = `${code}${digits}`;
  }
  if (!/^[1-9]\d{7,14}$/.test(digits)) return null;
  return digits;
}

/** Stored and displayed form: +indicatif followed by the national number. */
export function phoneWithIndicatif(raw: unknown, country?: string | null): string | null {
  const number = whatsappMsisdn(raw, country);
  return number ? `+${number}` : null;
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
