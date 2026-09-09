"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Navigation from "../components/Navigation";
import Footer from "../components/Footer";
import { studentSupabase } from "../lib/supabase";
import { useSiteI18n } from "../context/SiteI18nContext";

export default function StudentSetPassword() {
  const { t } = useSiteI18n();
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [status, setStatus] = useState("idle");
  const [message, setMessage] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (password.length < 8) {
      setStatus("error");
      setMessage(t("student.errors.passwordLength"));
      return;
    }
    if (password !== confirmPassword) {
      setStatus("error");
      setMessage(t("student.errors.passwordMatch"));
      return;
    }

    setStatus("submitting");
    const { error } = await studentSupabase.auth.updateUser({ password });
    if (error) {
      setStatus("error");
      setMessage(error.message || t("student.errors.passwordUpdate"));
      return;
    }

    router.replace("/espace-etudiant");
  };

  return (
    <div className="app app-page-fill is-centered">
      <Navigation />
      <section className="landing-form-section">
        <div className="container">
          <span className="landing-hero-badge">{t("student.space")}</span>
          <h1 className="landing-section-title">{t("student.newPassword")}</h1>
          <p className="landing-section-subtitle">
            {t("student.newPasswordSubtitle")}
          </p>
          {status === "error" && (
            <div className="landing-alert landing-alert-error">{message}</div>
          )}
          <form className="landing-form landing-form-narrow" onSubmit={handleSubmit}>
            <div className="landing-form-group">
              <label htmlFor="new-password">{t("student.password")} *</label>
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
              <label htmlFor="confirm-password">{t("student.confirmPassword")} *</label>
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
              {status === "submitting" ? t("student.saving") : t("student.save")}
            </button>
          </form>
        </div>
      </section>
      <Footer />
    </div>
  );
}
