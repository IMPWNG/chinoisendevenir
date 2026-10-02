import { contractInstallments } from "./saleContract";
import { getFormuleByNumber, getFormuleNumber } from "./formules";
import { getChosenFormule } from "./studentProgress";

export type PaymentFlags = { e1: boolean; e2: boolean; e3: boolean };

export function readPaymentFlags(value: unknown): PaymentFlags {
  const raw =
    value && typeof value === "object" && !Array.isArray(value)
      ? (value as Record<string, unknown>)
      : {};
  return {
    e1: raw.e1 === true,
    e2: raw.e2 === true,
    e3: raw.e3 === true,
  };
}

export function paymentPlan(contact: {
  formule?: string | null;
  notes_admin?: string | null;
  paiements?: unknown;
}) {
  const formule = getFormuleByNumber(getFormuleNumber(getChosenFormule(contact)));
  if (!formule) return null;
  const amounts = contractInstallments(formule.priceEuros);
  const flags = readPaymentFlags(contact.paiements);
  const paid = [flags.e1, flags.e2, flags.e3];
  const remaining = amounts.reduce(
    (sum, euros, index) => sum + (paid[index] ? 0 : euros),
    0,
  );
  return {
    priceEuros: formule.priceEuros,
    amounts,
    flags,
    remaining,
    paidCount: paid.filter(Boolean).length,
  };
}
