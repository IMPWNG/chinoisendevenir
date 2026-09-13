import type { Metadata } from "next";
import type React from "react";
import { AdminI18nProvider } from "@/context/AdminI18nContext";

export const metadata: Metadata = {
  title: "Administration",
  robots: { index: false, follow: false },
};

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <AdminI18nProvider>{children}</AdminI18nProvider>;
}
