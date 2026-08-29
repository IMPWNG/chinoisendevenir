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
  const { user, loading, signIn, signUp, resetPassword } = useAuth();
  const [mode, setMode] = useState("login");
  const [status, setStatus] = useState("idle");
  const [message, setMessage] = useState("");
  const [form, setForm] = useState({
    email: "",
    password: "",
    confirmPassword: "",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const goToDashboard = () => {
    router.replace("/espace-etudiant");
  };

  useEffect(() => {
    if (!loading && user) {
      router.replace("/espace-etudiant");
    }
  }, [loading, user, router]);

  const handleLogin = async (e) => {
    e.preventDefault();
    setStatus("submitting");
    setMessage("");

    try {
      const { error } = await signIn(
        form.email.trim().toLowerCase(),
        form.password,
      );
      if (error) {
        setStatus("error");
        setMessage(error.message || "Email ou mot de passe incorrect.");
        return;
      }

      goToDashboard();
    } catch (err) {
      setStatus("error");
      setMessage(err.message || "Une erreur est survenue.");
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setStatus("submitting");
    setMessage("");

    if (form.password.length < 8) {
      setStatus("error");
      setMessage("Le mot de passe doit contenir au moins 8 caractères.");
      return;
    }

    if (form.password !== form.confirmPassword) {
      setStatus("error");
      setMessage("Les mots de passe ne correspondent pas.");
      return;
    }

    try {
      const email = form.email.trim().toLowerCase();
      const { error } = await signUp(email, form.password);

      if (error) {
        const already =
          error.message?.includes("déjà") || error.message?.includes("already");
        setStatus("error");
        setMessage(
          already
            ? "Un compte existe déjà avec cet email. Connectez-vous."
            : error.message || "Impossible de créer le compte.",
        );
        if (already) setMode("login");
        return;
      }

      goToDashboard();
    } catch (err) {
      setStatus("error");
      setMessage(err.message || "Une erreur est survenue.");
    }
  };

  if (loading || user) {
    return (
      <div className="app app-page-fill is-centered">
        <Navigation />
        <section className="landing-form-section">
          <p className="landing-section-subtitle">Chargement de votre espace...</p>
        </section>
      </div>
    );
  }

  return (
    <div className="app app-page-fill is-centered">
      <Navigation />
      <section className="landing-form-section">
        <div className="container">
          <span className="landing-hero-badge">Espace étudiant</span>
          <h1 className="landing-section-title">
            {mode === "login" ? "Connexion" : "Créer un compte"}
          </h1>
          <p className="landing-section-subtitle">
            {mode === "login"
              ? "Connectez-vous avec l'email utilisé dans le formulaire."
              : "Créez un compte avec votre email et un mot de passe. Utilisez la même adresse que sur le formulaire de projet."}
          </p>

          {status === "success" && (
            <div className="landing-alert landing-alert-success">{message}</div>
          )}
          {status === "error" && (
            <div className="landing-alert landing-alert-error">{message}</div>
          )}

          <div className="auth-tabs">
            <button
              type="button"
              className={`auth-tab ${mode === "login" ? "is-active" : ""}`}
              onClick={() => {
                setMode("login");
                setStatus("idle");
                setMessage("");
              }}
            >
              Connexion
            </button>
            <button
              type="button"
              className={`auth-tab ${mode === "register" ? "is-active" : ""}`}
              onClick={() => {
                setMode("register");
                setStatus("idle");
                setMessage("");
              }}
            >
              Créer un compte
            </button>
          </div>

          {mode === "login" ? (
            <form className="landing-form landing-form-narrow" onSubmit={handleLogin}>
              <div className="landing-form-group">
                <label htmlFor="login-email">Adresse e-mail *</label>
                <input
                  id="login-email"
                  type="email"
                  name="email"
                  value={form.email}
                  onChange={handleChange}
                  placeholder="jean@example.com"
                  required
                />
              </div>
              <div className="landing-form-group">
                <label htmlFor="login-password">Mot de passe *</label>
                <input
                  id="login-password"
                  type="password"
                  name="password"
                  value={form.password}
                  onChange={handleChange}
                  required
                />
              </div>
              <button
                type="submit"
                className="landing-btn landing-btn-primary landing-btn-full"
                disabled={status === "submitting"}
              >
                {status === "submitting" ? "Connexion..." : "Se connecter"}
              </button>
              <button
                type="button"
                className="landing-btn-link"
                onClick={async () => {
                  if (!form.email) {
                    setStatus("error");
                    setMessage("Entrez votre email pour réinitialiser le mot de passe.");
                    return;
                  }
                  setStatus("submitting");
                  const { error } = await resetPassword(form.email.trim().toLowerCase());
                  if (error) {
                    setStatus("error");
                    setMessage(error.message || "Impossible d'envoyer l'email.");
                    return;
                  }
                  setStatus("success");
                  setMessage(
                    "Un email de réinitialisation vous a été envoyé si un compte existe.",
                  );
                }}
              >
                Mot de passe oublié ?
              </button>
            </form>
          ) : (
            <form
              className="landing-form landing-form-narrow"
              onSubmit={handleRegister}
            >
              <div className="landing-form-group">
                <label htmlFor="register-email">Adresse e-mail *</label>
                <input
                  id="register-email"
                  type="email"
                  name="email"
                  value={form.email}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="landing-form-group">
                <label htmlFor="register-password">Mot de passe *</label>
                <input
                  id="register-password"
                  type="password"
                  name="password"
                  value={form.password}
                  onChange={handleChange}
                  minLength={8}
                  required
                />
              </div>
              <div className="landing-form-group">
                <label htmlFor="register-confirm">Confirmer le mot de passe *</label>
                <input
                  id="register-confirm"
                  type="password"
                  name="confirmPassword"
                  value={form.confirmPassword}
                  onChange={handleChange}
                  required
                />
              </div>
              <button
                type="submit"
                className="landing-btn landing-btn-primary landing-btn-full"
                disabled={status === "submitting"}
              >
                {status === "submitting" ? "Création..." : "Créer mon compte"}
              </button>
            </form>
          )}
        </div>
      </section>
      <Footer t={t} />
    </div>
  );
}
