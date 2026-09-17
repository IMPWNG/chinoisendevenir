/**
 * Self-check for contact owner helpers.
 * Run: npx tsx src/lib/contactOwner.check.ts
 */
import {
  contactClosePatch,
  contactTouchPatch,
  shortAdminLabel,
} from "./contactOwner";

function assert(cond: unknown, msg: string): asserts cond {
  if (!cond) throw new Error(msg);
}

const touch = contactTouchPatch("  Alice@Example.com ");
assert(touch.last_touched_by === "alice@example.com", "touch email");
assert(Boolean(touch.last_touched_at), "touch at");

assert(
  Object.keys(contactTouchPatch("")).length === 0,
  "empty email no touch",
);

const close = contactClosePatch("bob@x.com", {}, "client_payé");
assert(close.closed_by === "bob@x.com", "close sets owner");

const frozen = contactClosePatch("carol@x.com", { closed_by: "bob@x.com" }, "client_payé");
assert(Object.keys(frozen).length === 0, "close frozen");

assert(
  Object.keys(contactClosePatch("bob@x.com", {}, "nouveau")).length === 0,
  "close only on paid",
);

assert(shortAdminLabel("matisse@ced.com") === "matisse", "short label");

console.log("contactOwner check ok");
