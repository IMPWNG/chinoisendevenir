"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Navigation from "../components/Navigation";
import Footer from "../components/Footer";
import { fr } from "../i18n/fr";
import { studentSupabase } from "../lib/supabase";

export default function StudentSetPassword() {
  const t = fr;
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [status, setStatus] = useState("idle");
  const [message, setMessage] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (password.length < 8) {
      setStatus("error");
      setMessage("Le mot de passe doit contenir au moins 8 caractères.");
      return;
    }
    if (password !== confirmPassword) {
      setStatus("error");
      setMessage("Les mots de passe ne correspondent pas.");
      return;
    }

    setStatus("submitting");
    const { error } = await studentSupabase.auth.updateUser({ password });
    if (error) {
      setStatus("error");
      setMessage(error.message || "Impossible de mettre à jour le mot de passe.");
      return;
    }

    router.replace("/espace-etudiant");
  };

  return (
    <div className="app app-page-fill is-centered">
      <Navigation />
      <section className="landing-form-section">
        <div className="container">
          <span className="landing-hero-badge">Espace étudiant</span>
          <h1 className="landing-section-title">Nouveau mot de passe</h1>
          <p className="landing-section-subtitle">
            Choisissez un mot de passe pour accéder à votre dossier.
          </p>
          {status === "error" && (
            <div className="landing-alert landing-alert-error">{message}</div>
          )}
          <form className="landing-form landing-form-narrow" onSubmit={handleSubmit}>
            <div className="landing-form-group">
              <label htmlFor="new-password">Mot de passe *</label>
              <input
                id="new-password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                minLength={8}
                required
              />
            </div>
            <div className="landing-form-group">
              <label htmlFor="confirm-password">Confirmer le mot de passe *</label>
              <input
                id="confirm-password"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
              />
            </div>
            <button
              type="submit"
              className="landing-btn landing-btn-primary landing-btn-full"
              disabled={status === "submitting"}
            >
              {status === "submitting" ? "Enregistrement..." : "Enregistrer"}
            </button>
          </form>
        </div>
      </section>
      <Footer t={t} />
    </div>
  );
}
