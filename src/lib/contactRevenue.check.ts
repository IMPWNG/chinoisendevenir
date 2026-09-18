/**
 * Self-check for admin revenue split.
 * Run: npx tsx src/lib/contactRevenue.check.ts
 */
import { ADMIN_ROLE_FULL, ADMIN_ROLE_LIMITED } from "./adminRoles";
import { FORMULE_1_VALUE, FORMULE_2_VALUE } from "./formules";
import {
  formuleAmountEuros,
  revenueForViewer,
  viewerShare,
} from "./contactRevenue";

function assert(cond: unknown, msg: string): asserts cond {
  if (!cond) throw new Error(msg);
}

assert(formuleAmountEuros(FORMULE_1_VALUE) === 800, "formule 1 = 800");
assert(formuleAmountEuros(FORMULE_2_VALUE) === 1700, "formule 2 = 1700");
assert(formuleAmountEuros("inconnu") === 0, "unknown formule = 0");

assert(
  viewerShare(ADMIN_ROLE_LIMITED, { assigned_to: "asso@x.com" }, "asso@x.com") === 0.4,
  "limited 40 on own",
);
assert(
  viewerShare(ADMIN_ROLE_LIMITED, { assigned_to: "boss@x.com" }, "asso@x.com") === 0,
  "limited 0 on others",
);
assert(
  viewerShare(ADMIN_ROLE_FULL, { assigned_to: "asso@x.com" }, "boss@x.com") === 0.6,
  "full 60 when other assigned",
);
assert(
  viewerShare(ADMIN_ROLE_FULL, { assigned_to: "boss@x.com" }, "boss@x.com") === 1,
  "full 100 on own",
);
assert(
  viewerShare(ADMIN_ROLE_FULL, { assigned_to: null }, "boss@x.com") === 1,
  "full 100 if unassigned",
);

const split = revenueForViewer(
  [
    {
      formule: FORMULE_1_VALUE,
      suivi_statut: "formule_choisie",
      assigned_to: "asso@x.com",
    },
    {
      formule: FORMULE_2_VALUE,
      suivi_statut: "client_payé",
      assigned_to: "asso@x.com",
    },
  ],
  ADMIN_ROLE_LIMITED,
  "asso@x.com",
);
assert(split.hypothetic === 320, "limited hypo 40% of 800");
assert(split.real === 680, "limited real 40% of 1700");

const owner = revenueForViewer(
  [
    {
      formule: FORMULE_2_VALUE,
      suivi_statut: "client_payé",
      assigned_to: "asso@x.com",
    },
  ],
  ADMIN_ROLE_FULL,
  "boss@x.com",
);
assert(owner.real === 1020, "full 60% of 1700");

console.log("contactRevenue check ok");
