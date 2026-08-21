"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "../context/AuthContext";

export default function StudentProtectedRoute({ children }) {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.replace("/espace-etudiant/connexion");
    }
  }, [loading, user, router]);

  if (loading || !user) {
    return (
      <div className="app app-page-fill">
        <div className="landing-form-section">
          <p className="landing-section-subtitle">Chargement de votre espace...</p>
        </div>
      </div>
    );
  }

  return children;
}
