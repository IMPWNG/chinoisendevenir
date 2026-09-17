export type ContactOwnerFields = {
  assigned_to?: string | null;
  assigned_at?: string | null;
  /** @deprecated kept for old rows; no longer written */
  last_touched_by?: string | null;
  last_touched_at?: string | null;
  closed_by?: string | null;
  closed_at?: string | null;
};

export function normalizeAdminEmail(email: string | null | undefined): string {
  return String(email || "")
    .trim()
    .toLowerCase();
}

export function shortAdminLabel(email: string | null | undefined): string {
  const who = normalizeAdminEmail(email);
  if (!who) return "—";
  return who.split("@")[0] || who;
}

export function isAssignedTo(
  contact: ContactOwnerFields | null | undefined,
  email: string | null | undefined,
): boolean {
  const me = normalizeAdminEmail(email);
  if (!me) return false;
  return normalizeAdminEmail(contact?.assigned_to) === me;
}

/** Assign dossier to this admin (manual checkbox on). */
export function contactAssignPatch(
  email: string | null | undefined,
): { assigned_to: string; assigned_at: string } | Record<string, never> {
  const who = normalizeAdminEmail(email);
  if (!who) return {};
  return {
    assigned_to: who,
    assigned_at: new Date().toISOString(),
  };
}

/** Clear assignment (manual checkbox off by the current assignee). */
export function contactUnassignPatch(): {
  assigned_to: null;
  assigned_at: null;
} {
  return { assigned_to: null, assigned_at: null };
}
