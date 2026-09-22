/**
 * EUR → F CFA (XOF / XAF share the same official peg).
 * 1 EUR = 655.957 F CFA (BCEAO / BEAC).
 */
export const EUR_TO_FCFA = 655.957;
export const FCFA_LABEL = "F CFA";

const UNICODE_SPACES = /[\u00a0\u202f\u2007\u2009]/g;

function plainSpaces(value: string): string {
  return value.replace(UNICODE_SPACES, " ");
}

function fractionDigits(amount: number): number {
  return Number.isInteger(amount) ? 0 : 2;
}

function formatFrNumber(amount: number, digits: number): string {
  return plainSpaces(
    new Intl.NumberFormat("fr-FR", {
      maximumFractionDigits: digits,
      minimumFractionDigits: digits,
    }).format(amount),
  );
}

export function eurosToFcfa(euros: number): number {
  return Math.round(Number(euros) * EUR_TO_FCFA);
}

export function formatFcfa(fcfa: number): string {
  return `${formatFrNumber(fcfa, 0)} ${FCFA_LABEL}`;
}

export function formatEurosOnly(amount: number): string {
  return `${formatFrNumber(amount, fractionDigits(amount))} €`;
}

export function formatEurosWithCfa(amount: number): string {
  return `${formatEurosOnly(amount)} (${formatFcfa(eurosToFcfa(amount))})`;
}

export function parseEuroAmount(raw: string): number | null {
  const token = plainSpaces(String(raw || "")).trim();
  if (!token) return null;
  const compact = token.replace(/\s/g, "");
  if (/^\d{1,3}(,\d{3})+$/.test(compact)) {
    return Number(compact.replace(/,/g, ""));
  }
  if (/^\d+,\d{1,2}$/.test(compact)) {
    return Number(compact.replace(",", "."));
  }
  const amount = Number(compact.replace(",", "."));
  return Number.isFinite(amount) ? amount : null;
}

function cfaBeside(euros: number): string {
  return `, soit ${formatFcfa(eurosToFcfa(euros))}`;
}

function cfaBesideRange(from: number, to: number, sep: string): string {
  const fromFcfa = formatFcfa(eurosToFcfa(from)).replace(` ${FCFA_LABEL}`, "");
  return `, soit ${fromFcfa}${sep}${formatFcfa(eurosToFcfa(to))}`;
}

const NUMBER = String.raw`\d{1,3}(?:[\s\u00a0\u202f]\d{3})*(?:[.,]\d{1,2})?|\d+(?:[.,]\d{1,2})?`;
const RANGE_SEP = String.raw`\s*(?:à|-|–|—|et)\s*`;
const CURRENCY = String.raw`€|euros?|EUR`;

const SUFFIX_RE = new RegExp(
  `(${NUMBER})(?:(${RANGE_SEP})(${NUMBER}))?\\s*(${CURRENCY})(?!,?\\s*soit\\b)(?!\\s*\\([^)]*F\\s*CFA\\))`,
  "gi",
);
const PREFIX_RE =
  /€\s*(\d{1,3}(?:,\d{3})+|\d+(?:[.,]\d{1,2})?)(?!,?\s*soit\b)(?!\s*\([^)]*F\s*CFA\))/g;

/**
 * Append F CFA next to every euro amount in a string.
 * Idempotent: already converted amounts are left as-is.
 */
export function withCfaInText(text: unknown): string {
  if (text == null) return "";
  const source = String(text);
  if (!source) return source;

  const withSuffix = source.replace(
    SUFFIX_RE,
    (full, left: string, sep: string | undefined, right: string | undefined, currency: string) => {
      const from = parseEuroAmount(left);
      if (from == null) return full;
      if (right) {
        const to = parseEuroAmount(right);
        if (to == null) return full;
        return `${left}${sep}${right} ${currency}${cfaBesideRange(from, to, sep || " ")}`;
      }
      return `${left} ${currency}${cfaBeside(from)}`;
    },
  );

  return withSuffix.replace(PREFIX_RE, (full, amount: string) => {
    const euros = parseEuroAmount(amount);
    if (euros == null) return full;
    return `${full}${cfaBeside(euros)}`;
  });
}

export function withCfaDeep<T>(value: T): T {
  if (typeof value === "string") return withCfaInText(value) as T;
  if (Array.isArray(value)) return value.map((item) => withCfaDeep(item)) as T;
  if (value && typeof value === "object") {
    const out: Record<string, unknown> = {};
    for (const [key, nested] of Object.entries(value as Record<string, unknown>)) {
      out[key] = withCfaDeep(nested);
    }
    return out as T;
  }
  return value;
}

