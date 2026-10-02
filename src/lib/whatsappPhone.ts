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

/** Canonical chat id from the number check. A privacy id (@lid) must be kept:
 *  labels and the saved name are ignored when they are sent to `{phone}@c.us` instead.
 */
export function whatsappChatId(_number: string, whatsappId: unknown): string | null {
  const id = String(whatsappId || "");
  if (/^\d+@(c\.us|lid)$/.test(id)) return id;
  return null;
}

/** Address book key. OpenWA refuses to store a name under an @lid. */
export function whatsappAddressBookId(number: string): string | null {
  if (!/^[1-9]\d{7,14}$/.test(number)) return null;
  return `${number}@c.us`;
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
