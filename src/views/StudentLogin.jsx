"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Navigation from "../components/Navigation";
import Footer from "../components/Footer";
import { useAuth } from "../context/AuthContext";
import { useSiteI18n } from "../context/SiteI18nContext";

export default function StudentLogin() {
  const { t } = useSiteI18n();
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
        setMessage(error.message || t("student.errors.credentials"));
        return;
      }

      goToDashboard();
    } catch (err) {
      setStatus("error");
      setMessage(err.message || t("student.errors.generic"));
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setStatus("submitting");
    setMessage("");

    if (form.password.length < 8) {
      setStatus("error");
      setMessage(t("student.errors.passwordLength"));
      return;
    }

    if (form.password !== form.confirmPassword) {
      setStatus("error");
      setMessage(t("student.errors.passwordMatch"));
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
            ? t("student.errors.exists")
            : error.message || t("student.errors.createFail"),
        );
        if (already) setMode("login");
        return;
      }

      goToDashboard();
    } catch (err) {
      setStatus("error");
      setMessage(err.message || t("student.errors.generic"));
    }
  };

  if (loading || user) {
    return (
      <div className="app app-page-fill is-centered">
        <Navigation />
        <section className="landing-form-section">
          <p className="landing-section-subtitle">{t("student.loading")}</p>
        </section>
      </div>
    );
  }

  return (
    <div className="app app-page-fill is-centered">
      <Navigation />
      <section className="landing-form-section">
        <div className="container">
          <span className="landing-hero-badge">{t("student.space")}</span>
          <h1 className="landing-section-title">
            {mode === "login" ? t("student.login") : t("student.register")}
          </h1>
          <p className="landing-section-subtitle">
            {mode === "login"
              ? t("student.loginSubtitle")
              : t("student.registerSubtitle")}
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
              {t("student.login")}
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
              {t("student.register")}
            </button>
          </div>

          {mode === "login" ? (
            <form className="landing-form landing-form-narrow" onSubmit={handleLogin}>
              <div className="landing-form-group">
                <label htmlFor="login-email">{t("form.email")} *</label>
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
                <label htmlFor="login-password">{t("student.password")} *</label>
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
                {status === "submitting" ? t("student.signingIn") : t("student.signIn")}
              </button>
              <button
                type="button"
                className="landing-btn-link"
                onClick={async () => {
                  if (!form.email) {
                    setStatus("error");
                    setMessage(t("student.errors.resetEmail"));
                    return;
                  }
                  setStatus("submitting");
                  const { error } = await resetPassword(form.email.trim().toLowerCase());
                  if (error) {
                    setStatus("error");
                    setMessage(error.message || t("student.errors.resetFail"));
                    return;
                  }
                  setStatus("success");
                  setMessage(t("student.errors.resetSent"));
                }}
              >
                {t("student.forgot")}
              </button>
            </form>
          ) : (
            <form
              className="landing-form landing-form-narrow"
              onSubmit={handleRegister}
            >
              <div className="landing-form-group">
                <label htmlFor="register-email">{t("form.email")} *</label>
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
                <label htmlFor="register-password">{t("student.password")} *</label>
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
                <label htmlFor="register-confirm">{t("student.confirmPassword")} *</label>
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
                {status === "submitting"
                  ? t("student.creating")
                  : t("student.createAccount")}
              </button>
            </form>
          )}
        </div>
      </section>
      <Footer />
    </div>
  );
}
