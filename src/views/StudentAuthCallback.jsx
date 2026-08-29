"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { studentSupabase } from "../lib/supabase";

export default function StudentAuthCallback() {
  const router = useRouter();
  const [message, setMessage] = useState("Connexion en cours...");

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
        setMessage(error.message || "Connexion impossible");
      }
    };

    finishLogin();
  }, [router]);

  return (
    <div className="app app-page-fill is-centered">
      <div className="landing-form-section">
        <p className="landing-section-subtitle">{message}</p>
      </div>
    </div>
  );
}
