"use client";

import { createContext, useContext, type ReactNode } from "react";
import { ADMIN_ROLE_FULL, adminCapabilities } from "../lib/adminRoles";

type AdminCapabilities = ReturnType<typeof adminCapabilities>;

const FULL_ACCESS = adminCapabilities(ADMIN_ROLE_FULL);

const AdminAccessContext = createContext<AdminCapabilities>(FULL_ACCESS);

export function AdminAccessProvider({
  value,
  children,
}: {
  value?: AdminCapabilities | null;
  children: ReactNode;
}) {
  return (
    <AdminAccessContext.Provider value={value || FULL_ACCESS}>
      {children}
    </AdminAccessContext.Provider>
  );
}

export function useAdminAccess() {
  return useContext(AdminAccessContext);
}
