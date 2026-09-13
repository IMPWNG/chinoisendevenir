export const ADMIN_ROLE_FULL = "full";
export const ADMIN_ROLE_LIMITED = "limited";

export type AdminRole = typeof ADMIN_ROLE_FULL | typeof ADMIN_ROLE_LIMITED;

export type AdminAuthResult = {
  error?: string;
  status?: number;
  role?: AdminRole | null;
};

export function parseEmailSet(value: unknown) {
  return new Set(
    String(value || "")
      .split(",")
      .map((item) => item.trim().toLowerCase())
      .filter(Boolean),
  );
}

export function getFullAdminEmails() {
  return parseEmailSet(process.env.ADMIN_EMAILS);
}

export function getLimitedAdminEmails() {
  return parseEmailSet(process.env.ADMIN_LIMITED_EMAILS);
}

export function getAdminEmailAllowlist() {
  return new Set([...getFullAdminEmails(), ...getLimitedAdminEmails()]);
}

export function resolveAdminRole(email: unknown, dbRole: unknown): AdminRole {
  const normalized = String(email || "").toLowerCase();
  if (getLimitedAdminEmails().has(normalized)) return ADMIN_ROLE_LIMITED;
  if (String(dbRole || "").toLowerCase() === ADMIN_ROLE_LIMITED) {
    return ADMIN_ROLE_LIMITED;
  }
  return ADMIN_ROLE_FULL;
}

export function adminCapabilities(role: unknown) {
  const full = role === ADMIN_ROLE_FULL;
  return {
    role: full ? ADMIN_ROLE_FULL : ADMIN_ROLE_LIMITED,
    universities: full,
    matching: full,
    contactEmail: true,
    bulkSend: full,
    deleteContacts: full,
  };
}

export function requireFullAdmin(auth: AdminAuthResult | null | undefined) {
  if (auth?.error) return auth;
  if (auth?.role !== ADMIN_ROLE_FULL) {
    return { error: "Droits insuffisants", status: 403 };
  }
  return null;
}
