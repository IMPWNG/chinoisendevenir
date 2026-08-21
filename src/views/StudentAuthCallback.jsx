"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "../lib/supabase";

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
          const { error } = await supabase.auth.exchangeCodeForSession(code);
          if (error) {
            setMessage(error.message);
            return;
          }
        }

        router.replace("/espace-etudiant");
      } catch (error) {
        setMessage(error.message || "Connexion impossible");
      }
    };

    finishLogin();
  }, [router]);

  return (
    <div className="app">
      <div className="p-10 text-center">{message}</div>
    </div>
  );
}
