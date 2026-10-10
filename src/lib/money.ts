import { EUR_TO_CNY } from "./matching/constants";

/**
 * EUR → F CFA (XOF / XAF share the same official peg).
 * 1 EUR = 655.957 F CFA (BCEAO / BEAC).
 * RMB uses the same EUR_TO_CNY rate as the matching (1 € = 8 RMB).
 */
export const EUR_TO_FCFA = 655.957;
export const FCFA_LABEL = "F CFA";
export const RMB_LABEL = "RMB";

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

export function eurosToRmb(euros: number): number {
  return Math.round(Number(euros) * EUR_TO_CNY);
}

export function formatRmb(rmb: number): string {
  return `${formatFrNumber(rmb, 0)} ${RMB_LABEL}`;
}

export function formatEurosWithRmb(amount: number): string {
  return `${formatEurosOnly(amount)} (${formatRmb(eurosToRmb(amount))})`;
}

/** Remove a CFA gloss so the euro amount can be shown in another currency. */
export function stripCfaAside(text: string): string {
  return text
    .replace(/,?\s*soit\s+[\d\s\u00a0\u202f]+(?:à|-|–|—)\s*[\d\s\u00a0\u202f]+ F CFA/g, "")
    .replace(/,?\s*soit\s+[\d\s\u00a0\u202f]+ F CFA/g, "")
    .replace(/\s*\([\d\s\u00a0\u202f]+ F CFA\)/g, "");
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

type MoneyAside = "cfa" | "rmb";

function asideLabel(euros: number, kind: MoneyAside) {
  return kind === "rmb" ? formatRmb(eurosToRmb(euros)) : formatFcfa(eurosToFcfa(euros));
}

function asideBeside(euros: number, kind: MoneyAside): string {
  return `, soit ${asideLabel(euros, kind)}`;
}

function asideBesideRange(from: number, to: number, sep: string, kind: MoneyAside): string {
  const unit = kind === "rmb" ? ` ${RMB_LABEL}` : ` ${FCFA_LABEL}`;
  const fromBare = asideLabel(from, kind).replace(unit, "");
  return `, soit ${fromBare}${sep}${asideLabel(to, kind)}`;
}

const NUMBER = String.raw`\d{1,3}(?:[\s\u00a0\u202f]\d{3})*(?:[.,]\d{1,2}(?!\d))?|\d+(?:[.,]\d{1,2}(?!\d))?`;
const RANGE_SEP = String.raw`\s*(?:à|-|–|—|et)\s*`;
const CURRENCY = String.raw`€|euros?|EUR`;
const ALREADY = String.raw`(?!,?\s*soit\b)(?!\s*\([^)]*(?:F\s*CFA|RMB)\))(?!\d)`;

const SUFFIX_RE = new RegExp(
  `(${NUMBER})(?:(${RANGE_SEP})(${NUMBER}))?\\s*(${CURRENCY})${ALREADY}`,
  "gi",
);
/** English €1,700 / €2,000: comma = thousands, not decimals. */
const PREFIX_ALREADY = String.raw`(?!,?\s*soit\b)(?!\s*\([^)]*(?:F\s*CFA|RMB)\))(?!\d)(?!,\d)`;
const PREFIX_RE = new RegExp(
  String.raw`€\s*(\d{1,3}(?:,\d{3})+|\d+)(?:\.(\d{1,2}))?${PREFIX_ALREADY}`,
  "g",
);

/**
 * Append F CFA next to every euro amount in a string.
 * Idempotent: already converted amounts are left as-is.
 */
function annotateEuros(text: unknown, kind: MoneyAside): string {
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
        return `${left}${sep}${right} ${currency}${asideBesideRange(from, to, sep || " ", kind)}`;
      }
      return `${left} ${currency}${asideBeside(from, kind)}`;
    },
  );

  return withSuffix.replace(PREFIX_RE, (full, amount: string, decimals?: string) => {
    const token = decimals ? `${amount}.${decimals}` : amount;
    const euros = parseEuroAmount(token);
    if (euros == null) return full;
    return `${full}${asideBeside(euros, kind)}`;
  });
}

export function withCfaInText(text: unknown): string {
  return annotateEuros(text, "cfa");
}

export function withRmbInText(text: unknown): string {
  return annotateEuros(text, "rmb");
}

/** Global admin sees RMB beside euros. Limited admin keeps the CFA gloss. */
export function moneyAsideForRole(role: string | null | undefined, text: string): string {
  if (role === "full") return withRmbInText(stripCfaAside(text));
  return text;
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

