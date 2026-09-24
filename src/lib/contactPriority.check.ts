/**
 * Self-check for the suivi prioritaire flag and table sort.
 * Run: npx tsx src/lib/contactPriority.check.ts
 */
import {
  isMissingPriorityColumn,
  isPrioritaire,
  priorityPatch,
  sortPriorityFirst,
} from "./contactPriority";

function assert(cond: unknown, msg: string): asserts cond {
  if (!cond) throw new Error(msg);
}

assert(priorityPatch(true).prioritaire === true, "patch on");
assert(priorityPatch(false).prioritaire === false, "patch off");

assert(isPrioritaire({ prioritaire: true }), "flag on");
assert(!isPrioritaire({ prioritaire: false }), "flag off");
assert(!isPrioritaire({}), "missing flag");
assert(!isPrioritaire(null), "null contact");

const rows = [
  { id: "new", prioritaire: false },
  { id: "hot", prioritaire: true },
  { id: "mid", prioritaire: false },
  { id: "also", prioritaire: true },
  { id: "old" },
];
assert(
  sortPriorityFirst(rows)
    .map((row) => row.id)
    .join(",") === "hot,also,new,mid,old",
  "priority first, then existing order",
);
assert(rows[0].id === "new", "sort does not mutate the source");

const onlyOne = sortPriorityFirst([
  { id: "a", prioritaire: true, suivi_statut: "client_payé" },
  { id: "b", prioritaire: true, suivi_statut: "attente_paiement" },
]);
assert(onlyOne.length === 2, "several students can be prioritaire");
assert(onlyOne[0].suivi_statut === "client_payé", "statut stays on the row");

assert(
  isMissingPriorityColumn(
    "Could not find the 'prioritaire' column of 'contacts' in the schema cache",
  ),
  "missing column",
);
assert(!isMissingPriorityColumn("permission denied"), "other error");

console.log("contactPriority check ok");
