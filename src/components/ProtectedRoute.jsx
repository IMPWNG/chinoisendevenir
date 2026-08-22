"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "../context/AuthContext";
import { useAdminI18n } from "../context/AdminI18nContext";
import { supabase } from "../lib/supabase";

export default function ProtectedRoute({ children }) {
  const { user, loading, signOut } = useAuth();
  const { t } = useAdminI18n();
  const router = useRouter();
  const [allowed, setAllowed] = useState(false);

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
      } = await supabase.auth.getSession();
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

      setAllowed(true);
    }

    verify();
    return () => {
      cancelled = true;
    };
  }, [loading, user, router, signOut]);

  if (loading || !user || !allowed) {
    return <div className="p-10 text-center">{t("loading")}</div>;
  }

  return children;
}
