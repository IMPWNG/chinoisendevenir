/**
 * Run: npx tsx src/lib/paymentPlan.check.ts
 */
import { paymentPlan, readPaymentFlags } from "./paymentPlan";

function assert(cond: unknown, msg: string): asserts cond {
  if (!cond) throw new Error(msg);
}

const empty = paymentPlan({ formule: "Premier pas en Chine (800€)" });
assert(empty?.amounts.join(",") === "320,240,240", "800 € splits 40/30/30");
assert(empty?.remaining === 800, "nothing paid");
assert(empty?.paidCount === 0, "zero checks");

const partial = paymentPlan({
  formule: "Admission universitaire (1700€)",
  paiements: { e1: true },
});
assert(partial?.amounts[0] === 680, "formule 2 first installment");
assert(partial?.remaining === 1700 - 680, "remainder after the first check");
assert(partial?.paidCount === 1, "one check");

const settled = paymentPlan({
  formule: "Accompagnement complet (2000€)",
  paiements: { e1: true, e2: true, e3: true },
});
assert(settled?.remaining === 0, "settled");
assert(settled?.paidCount === 3, "three checks");
assert(paymentPlan({ formule: "" }) === null, "no formule, no plan");
assert(readPaymentFlags(null).e2 === false, "missing flags stay unchecked");

console.log("payment plan check ok");
