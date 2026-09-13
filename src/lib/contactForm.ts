export const DIPLOMA_VALUES = ["bac", "licence", "master", "doctorat", "autre"] as const;
export const BUDGET_VALUES = ["<5000", "5000-10000", "10000-20000", ">20000"] as const;
export const INTAKE_VALUES = [
  "septembre_2026",
  "mars_2027",
  "septembre_2027",
  "flexible",
] as const;

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function normalizeEmail(value: unknown): string {
  return String(value || "")
    .trim()
    .toLowerCase();
}

export function isValidEmail(value: unknown): boolean {
  const email = normalizeEmail(value);
  return email.length > 0 && email.length <= 254 && EMAIL_RE.test(email);
}

export function isValidPhone(value: unknown): boolean {
  const raw = String(value || "").trim();
  if (!raw) return true;
  const digits = raw.replace(/\D/g, "");
  return digits.length >= 8 && digits.length <= 15;
}

export function parseAge(value: unknown): number | null {
  if (value === null || value === undefined || String(value).trim() === "") {
    return null;
  }
  const age = Number.parseInt(String(value).trim(), 10);
  return Number.isFinite(age) ? age : NaN;
}

export function isValidAge(value: unknown): boolean {
  const age = parseAge(value);
  if (age === null) return true;
  return Number.isFinite(age) && age >= 15 && age <= 60;
}

export function withCurrentOption(options: readonly string[], current: unknown): string[] {
  const value = String(current || "").trim();
  if (!value || options.includes(value)) return [...options];
  return [...options, value];
}
