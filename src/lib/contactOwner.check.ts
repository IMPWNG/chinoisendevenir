/**
 * Self-check for manual contact assignment helpers.
 * Run: npx tsx src/lib/contactOwner.check.ts
 */
import {
  contactAssignPatch,
  contactUnassignPatch,
  isAssignedTo,
  shortAdminLabel,
} from "./contactOwner";

function assert(cond: unknown, msg: string): asserts cond {
  if (!cond) throw new Error(msg);
}

const assign = contactAssignPatch("  Alice@Example.com ");
assert(assign.assigned_to === "alice@example.com", "assign email");
assert(Boolean(assign.assigned_at), "assign at");

assert(Object.keys(contactAssignPatch("")).length === 0, "empty no assign");

assert(
  isAssignedTo({ assigned_to: "alice@example.com" }, "Alice@Example.com"),
  "is assigned",
);
assert(
  !isAssignedTo({ assigned_to: "bob@x.com" }, "alice@example.com"),
  "not assigned",
);

const clear = contactUnassignPatch();
assert(clear.assigned_to === null && clear.assigned_at === null, "unassign");

assert(shortAdminLabel("matisse@ced.com") === "matisse", "short label");

console.log("contactOwner check ok");
