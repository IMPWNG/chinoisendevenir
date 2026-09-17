import { canonicalStatut } from "./suiviStatuts";

export type ContactOwnerFields = {
  last_touched_by?: string | null;
  last_touched_at?: string | null;
  closed_by?: string | null;
  closed_at?: string | null;
};

function normalizeAdminEmail(email: string | null | undefined): string {
  return String(email || "")
    .trim()
    .toLowerCase();
}

/** Patch for any admin mutation on a contact. */
export function contactTouchPatch(
  email: string | null | undefined,
): { last_touched_by: string; last_touched_at: string } | Record<string, never> {
  const who = normalizeAdminEmail(email);
  if (!who) return {};
  return {
    last_touched_by: who,
    last_touched_at: new Date().toISOString(),
  };
}

/**
 * When status becomes client_payé, freeze closed_by once (commission owner).
 * Does not overwrite an existing closed_by.
 */
export function contactClosePatch(
  email: string | null | undefined,
  current: ContactOwnerFields,
  nextStatut: string,
): { closed_by: string; closed_at: string } | Record<string, never> {
  if (canonicalStatut(nextStatut) !== "client_payé") return {};
  if (normalizeAdminEmail(current.closed_by)) return {};
  const who = normalizeAdminEmail(email);
  if (!who) return {};
  return {
    closed_by: who,
    closed_at: new Date().toISOString(),
  };
}

export function shortAdminLabel(email: string | null | undefined): string {
  const who = normalizeAdminEmail(email);
  if (!who) return "—";
  const local = who.split("@")[0] || who;
  return local;
}
