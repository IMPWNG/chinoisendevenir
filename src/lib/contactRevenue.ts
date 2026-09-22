import type { AdminRole } from "./adminRoles";
import { ADMIN_ROLE_LIMITED } from "./adminRoles";
import { isAssignedTo, normalizeAdminEmail } from "./contactOwner";
import { getFormuleByNumber, getFormuleNumber } from "./formules";
import { formatEurosWithCfa } from "./money";
import { getChosenFormule, type ContactRow } from "./studentProgress";
import { PAID_STATUSES, canonicalStatut } from "./suiviStatuts";

/** Owner share when a limited admin is assigned to the dossier. */
export const FULL_SHARE = 0.6;
/** Limited admin share on dossiers they are assigned to. */
export const LIMITED_SHARE = 0.4;

export type RevenueContact = Pick<ContactRow, "formule" | "notes_admin" | "suivi_statut" | "assigned_to">;

export type RevenueSplit = {
  hypothetic: number;
  real: number;
  hypotheticCount: number;
  realCount: number;
};

export function formuleAmountEuros(formuleLabel: unknown): number {
  const formule = getFormuleByNumber(getFormuleNumber(formuleLabel));
  return formule?.priceEuros || 0;
}

/**
 * Full admin: 100% on own or unassigned dossiers, 60% when someone else
 * (the limited admin) is assigned. Limited admin: 40% only on their dossiers.
 */
export function viewerShare(
  role: AdminRole | string | null | undefined,
  contact: { assigned_to?: string | null },
  viewerEmail: string | null | undefined,
): number {
  if (role === ADMIN_ROLE_LIMITED) {
    return isAssignedTo(contact, viewerEmail) ? LIMITED_SHARE : 0;
  }
  const assignee = normalizeAdminEmail(contact.assigned_to);
  const me = normalizeAdminEmail(viewerEmail);
  if (!assignee || assignee === me) return 1;
  return FULL_SHARE;
}

export function isPaidContact(statut: unknown): boolean {
  return PAID_STATUSES.has(canonicalStatut(statut));
}

export function revenueForViewer(
  contacts: RevenueContact[],
  role: AdminRole | string | null | undefined,
  viewerEmail: string | null | undefined,
): RevenueSplit {
  const split: RevenueSplit = {
    hypothetic: 0,
    real: 0,
    hypotheticCount: 0,
    realCount: 0,
  };

  for (const contact of contacts) {
    const amount = formuleAmountEuros(getChosenFormule(contact));
    if (!amount) continue;
    const share = viewerShare(role, contact, viewerEmail);
    if (!share) continue;
    const part = Math.round(amount * share);
    if (isPaidContact(contact.suivi_statut)) {
      split.real += part;
      split.realCount += 1;
    } else {
      split.hypothetic += part;
      split.hypotheticCount += 1;
    }
  }

  return split;
}

export function formatEuros(amount: number): string {
  return formatEurosWithCfa(amount);
}
