"use client";

import type React from "react";
import { AdminAuthProvider } from "@/context/AdminAuthContext";
import { StudentAuthProvider } from "@/context/AuthContext";
import { SiteI18nProvider } from "@/context/SiteI18nContext";
import IntakePopup from "@/components/IntakePopup";

export default function Providers({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <SiteI18nProvider>
      <AdminAuthProvider>
        <StudentAuthProvider>
          {children}
          <IntakePopup />
        </StudentAuthProvider>
      </AdminAuthProvider>
    </SiteI18nProvider>
  );
}
