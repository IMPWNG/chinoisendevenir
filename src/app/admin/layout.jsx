"use client";

import { AdminI18nProvider } from "@/context/AdminI18nContext";

export default function AdminLayout({ children }) {
  return <AdminI18nProvider>{children}</AdminI18nProvider>;
}
