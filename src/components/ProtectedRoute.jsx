"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAdminAuth } from "../context/AdminAuthContext";
import { AdminAccessProvider } from "../context/AdminAccessContext";
import { useAdminI18n } from "../context/AdminI18nContext";
import { adminSupabase } from "../lib/supabase";
import { ADMIN_ROLE_FULL, adminCapabilities } from "../lib/adminRoles";

export default function ProtectedRoute({ children, requireFull = false }) {
  const { user, loading, signOut } = useAdminAuth();
  const { t } = useAdminI18n();
  const router = useRouter();
  const [access, setAccess] = useState(null);

  useEffect(() => {
    let cancelled = false;

    async function verify() {
      if (loading) return;

      if (!user) {
        router.replace("/admin/login");
        return;
      }

      const {
        data: { session },
      } = await adminSupabase.auth.getSession();
      const token = session?.access_token;
      if (!token) {
        router.replace("/admin/login");
        return;
      }

      const response = await fetch("/api/admin/me", {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (cancelled) return;

      if (!response.ok) {
        await signOut();
        router.replace("/admin/login?forbidden=1");
        return;
      }

      const data = await response.json().catch(() => ({}));
      const capabilities = adminCapabilities(data.role || ADMIN_ROLE_FULL);

      if (requireFull && !capabilities.universities) {
        router.replace("/admin/dashboard");
        return;
      }

      setAccess(capabilities);
    }

    verify();
    return () => {
      cancelled = true;
    };
  }, [loading, user, router, signOut, requireFull]);

  if (loading || !user || !access) {
    return <div className="p-10 text-center">{t("loading")}</div>;
  }

  return <AdminAccessProvider value={access}>{children}</AdminAccessProvider>;
}
