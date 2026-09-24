/**
 * Installment schedule and the unlock rule.
 *
 * ponytail: Mat has not written a commercial calendar. INSTALLMENT_COUNT is an
 * equal split and is the only knob. Unlock does not depend on 2x/3x: the first
 * row (sequence 1) or a fully paid plan is enough. A "full" plan is one row.
 */

export const INSTALLMENT_COUNT = 3;
export const PAYMENT_CURRENCY = "EUR";

export const INSTALLMENT_STATUSES = [
  "pending",
  "processing",
  "succeeded",
  "failed",
  "cancelled",
] as const;

export type InstallmentStatus = (typeof INSTALLMENT_STATUSES)[number];
export type PaymentMode = "full" | "installments";

export type InstallmentQuote = {
  sequence: number;
  amountCents: number;
};

export type PaymentInstallmentView = InstallmentQuote & {
  status: InstallmentStatus;
  paidAt: string | null;
};

export type PaymentEventView = {
  id: string;
  name: string;
  label: string;
  at: string;
  sequence: number | null;
  amountCents: number | null;
  status: string | null;
};

export type PaymentPlanView = {
  mode: PaymentMode;
  formule: string;
  totalCents: number;
  currency: string;
  installments: PaymentInstallmentView[];
};

const EVENT_LABELS: Record<string, string> = {
  "payment_intent.created": "Intention de paiement créée",
  "payment_intent.requires_payment_method": "Moyen de paiement requis",
  "payment_intent.requires_customer_action": "Action du payeur requise",
  "payment_intent.requires_capture": "Capture requise",
  "payment_intent.pending": "Paiement en attente",
  "payment_intent.pending_review": "Paiement en revue",
  "payment_intent.succeeded": "Paiement confirmé",
  "payment_intent.cancelled": "Paiement annulé",
  "payment_intent.payment_failed": "Paiement refusé",
  "payment_attempt.received": "Tentative reçue",
  "payment_attempt.authentication_redirected": "Authentification en cours",
  "payment_attempt.authentication_failed": "Authentification échouée",
  "payment_attempt.pending_authorization": "Autorisation en attente",
  "payment_attempt.authorized": "Paiement autorisé",
  "payment_attempt.authorization_failed": "Autorisation refusée",
  "payment_attempt.capture_requested": "Capture demandée",
  "payment_attempt.capture_failed": "Capture échouée",
  "payment_attempt.settled": "Fonds reçus par Airwallex",
  "payment_attempt.paid": "Fonds versés sur le compte",
  "payment_attempt.cancelled": "Tentative annulée",
  "payment_attempt.expired": "Tentative expirée",
  "payment_attempt.risk_declined": "Tentative refusée (risque)",
  "payment_attempt.failed_to_process": "Tentative non traitée",
};

export function paymentEventLabel(name: string): string {
  return EVENT_LABELS[name] || name;
}

export function centsToMajor(cents: number): number {
  return Math.round(cents) / 100;
}

export function majorToCents(amount: number): number {
  return Math.round(amount * 100);
}

/** Equal shares. Remainder cents go on the last row so the sum stays exact. */
export function splitAmountCents(totalCents: number, count: number): number[] {
  const total = Math.round(totalCents);
  const parts = Math.max(1, Math.round(count));
  if (total < parts) {
    throw new Error("Montant trop petit pour ce nombre de versements");
  }
  const base = Math.floor(total / parts);
  const remainder = total - base * parts;
  const rows = Array.from({ length: parts }, () => base);
  rows[rows.length - 1] += remainder;
  return rows;
}

export function quoteInstallments(
  totalCents: number,
  mode: PaymentMode,
): InstallmentQuote[] {
  const count = mode === "full" ? 1 : INSTALLMENT_COUNT;
  return splitAmountCents(totalCents, count).map((amountCents, index) => ({
    sequence: index + 1,
    amountCents,
  }));
}

/**
 * First installment paid, or every installment paid (a one-row plan is both).
 * Callers still open access through the existing CRM status, not a second flag.
 */
export function accessUnlocksFromInstallments(
  rows: { sequence: number; status: string }[],
): boolean {
  if (!rows.length) return false;
  if (rows.some((row) => row.sequence === 1 && row.status === "succeeded")) {
    return true;
  }
  return rows.every((row) => row.status === "succeeded");
}

export function isPayableStatus(status: string): boolean {
  return status === "pending" || status === "processing" || status === "failed" || status === "cancelled";
}

export function nextPayable<T extends { sequence: number; status: string }>(
  rows: T[],
): T | null {
  const sorted = [...rows].sort((a, b) => a.sequence - b.sequence);
  return sorted.find((row) => isPayableStatus(row.status)) || null;
}

export function amountsMatch(
  major: unknown,
  amountCents: number,
  currency: unknown,
): boolean {
  const code = String(currency || "").toUpperCase();
  if (code && code !== PAYMENT_CURRENCY) return false;
  const cents = majorToCents(Number(major));
  return Number.isFinite(cents) && cents === amountCents;
}
