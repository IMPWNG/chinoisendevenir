"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Navigation from "../components/Navigation";
import Footer from "../components/Footer";
import { fr } from "../i18n/fr";
import { useAuth } from "../context/AuthContext";

export default function StudentLogin() {
  const t = fr;
  const router = useRouter();
  const { user, loading, signInWithMagicLink } = useAuth();
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState("idle");
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (!loading && user) {
      router.replace("/espace-etudiant");
    }
  }, [loading, user, router]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus("submitting");
    setMessage("");

    try {
      const check = await fetch("/api/student/request-access", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const checkData = await check.json();

      if (!check.ok) {
        setStatus("error");
        setMessage(checkData.error || "Impossible de vérifier cet email.");
        return;
      }

      const { error } = await signInWithMagicLink(email.trim().toLowerCase());
      if (error) {
        setStatus("error");
        setMessage(error.message || "Impossible d'envoyer le lien de connexion.");
        return;
      }

      setStatus("success");
      setMessage(
        "Un lien de connexion vous a été envoyé par email. Ouvrez-le pour accéder à votre espace.",
      );
    } catch (err) {
      setStatus("error");
      setMessage(err.message || "Une erreur est survenue.");
    }
  };

  return (
    <div className="app">
      <Navigation />
      <section className="landing-form-section">
        <div className="container">
          <span className="landing-hero-badge">🎓 Espace étudiant</span>
          <h1 className="landing-section-title">Connexion à votre dossier</h1>
          <p className="landing-section-subtitle">
            Entrez l'email utilisé lors de votre inscription. Vous recevrez un
            lien pour vous connecter, sans mot de passe.
          </p>

          {status === "success" && (
            <div className="landing-alert landing-alert-success">{message}</div>
          )}
          {status === "error" && (
            <div className="landing-alert landing-alert-error">{message}</div>
          )}

          <form className="landing-form" onSubmit={handleSubmit}>
            <div className="landing-form-group">
              <label>Adresse e-mail *</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="jean@example.com"
                required
              />
            </div>
            <button
              type="submit"
              className="landing-btn landing-btn-primary landing-btn-full"
              disabled={status === "submitting"}
            >
              {status === "submitting"
                ? "Envoi du lien..."
                : "Recevoir mon lien de connexion"}
            </button>
          </form>
        </div>
      </section>
      <Footer t={t} />
    </div>
  );
}
