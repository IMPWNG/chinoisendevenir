"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "../context/AuthContext";
import { useAdminI18n } from "../context/AdminI18nContext";

export default function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();
  const { t } = useAdminI18n();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.replace("/admin/login");
    }
  }, [loading, user, router]);

  if (loading || !user) {
    return <div className="p-10 text-center">{t("loading")}</div>;
  }

  return children;
}
