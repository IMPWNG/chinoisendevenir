"use client";

import { createContext, useContext } from "react";
import { ADMIN_ROLE_FULL, adminCapabilities } from "../lib/adminRoles";

const FULL_ACCESS = adminCapabilities(ADMIN_ROLE_FULL);

const AdminAccessContext = createContext(FULL_ACCESS);

export function AdminAccessProvider({ value, children }) {
  return (
    <AdminAccessContext.Provider value={value || FULL_ACCESS}>
      {children}
    </AdminAccessContext.Provider>
  );
}

export function useAdminAccess() {
  return useContext(AdminAccessContext);
}
