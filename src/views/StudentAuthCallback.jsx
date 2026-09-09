"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { studentSupabase } from "../lib/supabase";
import { useSiteI18n } from "../context/SiteI18nContext";

export default function StudentAuthCallback() {
  const router = useRouter();
  const { t } = useSiteI18n();
  const [message, setMessage] = useState("");

  useEffect(() => {
    const finishLogin = async () => {
      try {
        const url = new URL(window.location.href);
        const code = url.searchParams.get("code");
        const errorDescription = url.searchParams.get("error_description");

        if (errorDescription) {
          setMessage(errorDescription);
          return;
        }

        if (code) {
          const { error } = await studentSupabase.auth.exchangeCodeForSession(code);
          if (error) {
            setMessage(error.message);
            return;
          }
        }

        const next = url.searchParams.get("next");
        if (next === "password") {
          router.replace("/espace-etudiant/mot-de-passe");
          return;
        }

        router.replace("/espace-etudiant");
      } catch (error) {
        setMessage(error.message || t("student.callbackFail"));
      }
    };

    finishLogin();
  }, [router, t]);

  return (
    <div className="app app-page-fill is-centered">
      <div className="landing-form-section">
        <p className="landing-section-subtitle">
          {message || t("student.callbackLoading")}
        </p>
      </div>
    </div>
  );
}
