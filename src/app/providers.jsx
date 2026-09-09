"use client";

import { AdminAuthProvider } from "@/context/AdminAuthContext";
import { StudentAuthProvider } from "@/context/AuthContext";
import { SiteI18nProvider } from "@/context/SiteI18nContext";

export default function Providers({ children }) {
  return (
    <SiteI18nProvider>
      <AdminAuthProvider>
        <StudentAuthProvider>{children}</StudentAuthProvider>
      </AdminAuthProvider>
    </SiteI18nProvider>
  );
}
