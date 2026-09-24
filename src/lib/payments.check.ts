/**
 * Self-check for the installment split and the unlock rule.
 * Run: npx tsx src/lib/payments.check.ts
 */
import { createHmac } from "crypto";
import { verifyAirwallexWebhook } from "./airwallex";
import {
  INSTALLMENT_COUNT,
  accessUnlocksFromInstallments,
  amountsMatch,
  quoteInstallments,
  splitAmountCents,
} from "./payments";

function assert(cond: unknown, msg: string): asserts cond {
  if (!cond) throw new Error(msg);
}

function sum(rows: number[]) {
  return rows.reduce((total, value) => total + value, 0);
}

for (const total of [80000, 170000, 200000]) {
  const parts = splitAmountCents(total, INSTALLMENT_COUNT);
  assert(parts.length === INSTALLMENT_COUNT, "count");
  assert(sum(parts) === total, `sum ${total}`);
  assert(parts.every((part) => part > 0), "positive");
}

assert(splitAmountCents(80000, 1).join() === "80000", "full is one row");

const full = quoteInstallments(200000, "full");
assert(full.length === 1 && full[0].sequence === 1 && full[0].amountCents === 200000, "full quote");

const several = quoteInstallments(170000, "installments");
assert(several.length === INSTALLMENT_COUNT, "installment quote");
assert(
  several.reduce((total, row) => total + row.amountCents, 0) === 170000,
  "installment quote sum",
);

assert(
  accessUnlocksFromInstallments([
    { sequence: 1, status: "succeeded" },
    { sequence: 2, status: "pending" },
    { sequence: 3, status: "pending" },
  ]),
  "first installment unlocks",
);
assert(
  accessUnlocksFromInstallments([{ sequence: 1, status: "succeeded" }]),
  "single full payment unlocks",
);
assert(
  !accessUnlocksFromInstallments([
    { sequence: 1, status: "pending" },
    { sequence: 2, status: "succeeded" },
  ]),
  "a later installment alone does not unlock",
);
assert(
  accessUnlocksFromInstallments([
    { sequence: 1, status: "succeeded" },
    { sequence: 2, status: "succeeded" },
  ]),
  "all paid unlocks",
);
assert(
  !accessUnlocksFromInstallments([
    { sequence: 1, status: "processing" },
  ]),
  "processing is not paid",
);

assert(amountsMatch(800, 80000, "EUR"), "major units");
assert(!amountsMatch(799.99, 80000, "EUR"), "mismatch");
assert(!amountsMatch(800, 80000, "USD"), "currency");

const secret = "whsec-test";
const rawBody = '{"id":"evt_1","name":"payment_intent.succeeded"}';
const timestamp = "1357872222592";
const signature = createHmac("sha256", secret)
  .update(`${timestamp}${rawBody}`)
  .digest("hex");
const headers = new Headers({
  "x-timestamp": timestamp,
  "x-signature": signature,
});

assert(
  verifyAirwallexWebhook({
    rawBody,
    headers,
    secret,
    now: 1357872222592,
  }).ok,
  "valid signature",
);
const missingSecret = verifyAirwallexWebhook({
  rawBody,
  headers,
  secret: "",
  now: 1357872222592,
});
assert(!missingSecret.ok, "missing secret rejected");
assert(missingSecret.reason === "missing_secret", "missing secret reason");
assert(
  !verifyAirwallexWebhook({
    rawBody,
    headers: new Headers({
      "x-timestamp": timestamp,
      "x-signature": "deadbeef",
    }),
    secret,
    now: 1357872222592,
  }).ok,
  "bad signature rejected",
);
const stale = verifyAirwallexWebhook({
  rawBody,
  headers,
  secret,
  now: 1357872222592 + 6 * 60 * 1000,
});
assert(!stale.ok, "stale timestamp rejected");
assert(stale.reason === "expired_timestamp", "stale timestamp reason");

console.log("payments.check ok");
