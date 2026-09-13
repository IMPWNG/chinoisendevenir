"use client";

import type React from "react";
import { AdminAuthProvider } from "@/context/AdminAuthContext";
import { StudentAuthProvider } from "@/context/AuthContext";
import { SiteI18nProvider } from "@/context/SiteI18nContext";

export default function Providers({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <SiteI18nProvider>
      <AdminAuthProvider>
        <StudentAuthProvider>{children}</StudentAuthProvider>
      </AdminAuthProvider>
    </SiteI18nProvider>
  );
}
