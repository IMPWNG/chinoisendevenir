"use client";

import { useRef, useState } from "react";
import Link from "next/link";
import { useSiteI18n } from "../context/SiteI18nContext";
import { STUDY_DOMAIN_VALUE_BY_INDEX } from "../i18n/site";
import {
  DIPLOMA_VALUES,
  isValidAge,
  isValidEmail,
  isValidPhone,
  normalizeEmail,
  parseAge,
  withCurrentOption,
} from "../lib/contactForm";

const EMPTY_FORM = {
  prenom: "",
  nom: "",
  age: "",
  email: "",
  phone: "",
  pays: "",
  dernier_diplome: "",
  domaine_etudes: "",
  domaine_etudes_precision: "",
  budget: "",
  date_rentree: "",
  notes_admin: "",
};

const OTHER_DOMAIN_VALUE = "Autre";

const BUDGET_VALUES = [
  ["<5000", "lt5000"],
  ["5000-10000", "5000-10000"],
  ["10000-20000", "10000-20000"],
  [">20000", "gt20000"],
];
const INTAKE_VALUES = [
  "septembre_2026",
  "mars_2027",
  "septembre_2027",
  "flexible",
];

const LeadForm = ({
  lockedEmail,
  initialValues,
  onSuccess,
  embedded = false,
}) => {
  const { t, dict } = useSiteI18n();
  const domainLabels = dict.form.domains;
  const [formData, setFormData] = useState({
    ...EMPTY_FORM,
    ...initialValues,
    email: lockedEmail || initialValues?.email || "",
  });

  const [errors, setErrors] = useState({});
  const [status, setStatus] = useState("idle");
  const [serverError, setServerError] = useState("");
  const formRef = useRef(null);

  const diplomaOptions = withCurrentOption(
    DIPLOMA_VALUES,
    formData.dernier_diplome,
  );
  const budgetOptionValues = withCurrentOption(
    BUDGET_VALUES.map(([value]) => value),
    formData.budget,
  );
  const intakeOptions = withCurrentOption(INTAKE_VALUES, formData.date_rentree);

  const scrollToFirstError = () => {
    requestAnimationFrame(() => {
      const field = formRef.current?.querySelector(".landing-error-msg");
      field
        ?.closest(".landing-form-group")
        ?.scrollIntoView({ behavior: "smooth", block: "center" });
    });
  };

  const validate = () => {
    const newErrors = {};
    const prenom = String(formData.prenom || "").trim();
    const nom = String(formData.nom || "").trim();
    const pays = String(formData.pays || "").trim();
    const email = String(formData.email || "").trim();
    const phone = String(formData.phone || "").trim();
    const precision = String(formData.domaine_etudes_precision || "").trim();

    if (!prenom) newErrors.prenom = t("form.required");
    if (!nom) newErrors.nom = t("form.required");

    if (!lockedEmail) {
      if (!email) {
        newErrors.email = t("form.required");
      } else if (!isValidEmail(email)) {
        newErrors.email = t("form.errorEmail");
      }
    }

    if (phone && !isValidPhone(phone)) {
      newErrors.phone = t("form.errorPhone");
    }

    if (!isValidAge(formData.age)) {
      newErrors.age = t("form.errorAge");
    }

    if (!pays) newErrors.pays = t("form.required");
    if (!formData.dernier_diplome)
      newErrors.dernier_diplome = t("form.required");

    if (!formData.domaine_etudes)
      newErrors.domaine_etudes = t("form.required");

    if (formData.domaine_etudes === OTHER_DOMAIN_VALUE && !precision) {
      newErrors.domaine_etudes_precision = t("form.required");
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: null }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setServerError("");
    if (!validate()) {
      scrollToFirstError();
      return;
    }

    setStatus("submitting");

    const domaineFinal =
      formData.domaine_etudes === OTHER_DOMAIN_VALUE
        ? String(formData.domaine_etudes_precision || "").trim()
        : formData.domaine_etudes;

    try {
      const response = await fetch("/api/contact-submit", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          prenom: String(formData.prenom || "").trim(),
          nom: String(formData.nom || "").trim(),
          age: parseAge(formData.age),
          email: lockedEmail || normalizeEmail(formData.email),
          phone: String(formData.phone || "").trim() || null,
          pays: String(formData.pays || "").trim(),
          dernier_diplome: formData.dernier_diplome || null,
          domaine_etudes: domaineFinal,
          budget: formData.budget || null,
          date_rentree: formData.date_rentree || null,
          notes_admin: String(formData.notes_admin || "").trim() || null,
        }),
      });

      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        if (data.code === "duplicate") {
          setStatus("duplicate");
          setTimeout(() => setStatus("idle"), 3000);
        } else if (data.code === "rate_limit" || response.status === 429) {
          setStatus("error");
          setServerError(t("form.errorRateLimit"));
          setTimeout(() => setStatus("idle"), 5000);
        } else {
          console.error("❌ Erreur:", data.error);
          setStatus("error");
          setServerError(data.error || t("form.error"));
          setTimeout(() => setStatus("idle"), 4000);
        }
        return;
      }

      setStatus("success");
      setFormData({
        ...EMPTY_FORM,
        email: lockedEmail || "",
      });
      onSuccess?.();
      if (!embedded) {
        setTimeout(() => setStatus("idle"), 3000);
      }
    } catch (err) {
      console.error("❌ Erreur fetch:", err);
      setStatus("error");
      setServerError(t("form.error"));
      setTimeout(() => setStatus("idle"), 4000);
    }
  };

  const formBody = (
    <>
        {status === "success" && (
          <div className="landing-alert landing-alert-success">
            ✅ {t("form.success")}{" "}
            {!embedded ? (
              <Link href="/espace-etudiant/connexion">
                {t("form.createSpace")}
              </Link>
            ) : null}
          </div>
        )}
        {status === "error" && (
          <div className="landing-alert landing-alert-error">
            ❌ {serverError || t("form.error")}
          </div>
        )}
        {status === "duplicate" && (
          <div className="landing-alert landing-alert-warning">
            ⚠️ {t("form.duplicate")}
          </div>
        )}

        <form
          ref={formRef}
          className="landing-form"
          onSubmit={handleSubmit}
          noValidate
        >
          <div className="landing-form-row">
            <div className="landing-form-group">
              <label>{t("form.firstname")} *</label>
              <input
                type="text"
                name="prenom"
                value={formData.prenom}
                onChange={handleChange}
                className={errors.prenom ? "error" : ""}
                placeholder="Jean"
              />
              {errors.prenom && (
                <span className="landing-error-msg">{errors.prenom}</span>
              )}
            </div>

            <div className="landing-form-group">
              <label>{t("form.lastname")} *</label>
              <input
                type="text"
                name="nom"
                value={formData.nom}
                onChange={handleChange}
                className={errors.nom ? "error" : ""}
                placeholder="Dupont"
              />
              {errors.nom && (
                <span className="landing-error-msg">{errors.nom}</span>
              )}
            </div>
          </div>

          <div className="landing-form-row">
            <div className="landing-form-group">
              <label>{t("form.email")} *</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className={errors.email ? "error" : ""}
                placeholder="jean@example.com"
                disabled={Boolean(lockedEmail)}
              />
              {errors.email && (
                <span className="landing-error-msg">{errors.email}</span>
              )}
            </div>

            <div className="landing-form-group">
              <label>{t("form.phone")}</label>
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                placeholder="+33 6 12 34 56 78"
                className={errors.phone ? "error" : ""}
              />
              {errors.phone && (
                <span className="landing-error-msg">{errors.phone}</span>
              )}
            </div>
          </div>

          <div className="landing-form-row">
            <div className="landing-form-group">
              <label>{t("form.age")}</label>
              <input
                type="number"
                name="age"
                min="15"
                max="60"
                value={formData.age}
                onChange={handleChange}
                className={errors.age ? "error" : ""}
                placeholder="25"
              />
              {errors.age && (
                <span className="landing-error-msg">{errors.age}</span>
              )}
            </div>

            <div className="landing-form-group">
              <label>{t("form.country")} *</label>
              <input
                type="text"
                name="pays"
                value={formData.pays}
                onChange={handleChange}
                className={errors.pays ? "error" : ""}
                placeholder="France"
              />
              {errors.pays && (
                <span className="landing-error-msg">{errors.pays}</span>
              )}
            </div>
          </div>

          <div className="landing-form-row">
            <div className="landing-form-group">
              <label>{t("form.level")} *</label>
              <select
                name="dernier_diplome"
                value={formData.dernier_diplome}
                onChange={handleChange}
                className={errors.dernier_diplome ? "error" : ""}
              >
                <option value="">{t("form.select")}</option>
                {diplomaOptions.map((value) => (
                  <option key={value} value={value}>
                    {DIPLOMA_VALUES.includes(value)
                      ? t(`form.diplomas.${value}`)
                      : value}
                  </option>
                ))}
              </select>
              {errors.dernier_diplome && (
                <span className="landing-error-msg">
                  {errors.dernier_diplome}
                </span>
              )}
            </div>

            <div className="landing-form-group">
              <label>{t("form.field")} *</label>
              <select
                name="domaine_etudes"
                value={formData.domaine_etudes}
                onChange={handleChange}
                className={errors.domaine_etudes ? "error" : ""}
              >
                <option value="">{t("form.select")}</option>
                {STUDY_DOMAIN_VALUE_BY_INDEX.map((value, index) => (
                  <option key={value} value={value}>
                    {domainLabels[index] || value}
                  </option>
                ))}
              </select>
              {errors.domaine_etudes && (
                <span className="landing-error-msg">
                  {errors.domaine_etudes}
                </span>
              )}

              {formData.domaine_etudes === OTHER_DOMAIN_VALUE && (
                <>
                  <input
                    type="text"
                    name="domaine_etudes_precision"
                    value={formData.domaine_etudes_precision}
                    onChange={handleChange}
                    placeholder={t("form.otherFieldPlaceholder")}
                    className={errors.domaine_etudes_precision ? "error" : ""}
                    style={{ marginTop: "8px" }}
                  />
                  {errors.domaine_etudes_precision && (
                    <span className="landing-error-msg">
                      {errors.domaine_etudes_precision}
                    </span>
                  )}
                </>
              )}
            </div>
          </div>

          <div className="landing-form-row">
            <div className="landing-form-group">
              <label>{t("form.budget")}</label>
              <select
                name="budget"
                value={formData.budget}
                onChange={handleChange}
              >
                <option value="">{t("form.select")}</option>
                {budgetOptionValues.map((value) => {
                  const known = BUDGET_VALUES.find(([item]) => item === value);
                  return (
                    <option key={value} value={value}>
                      {known ? t(`form.budgets.${known[1]}`) : value}
                    </option>
                  );
                })}
              </select>
            </div>

            <div className="landing-form-group">
              <label>{t("form.intake")}</label>
              <select
                name="date_rentree"
                value={formData.date_rentree}
                onChange={handleChange}
              >
                <option value="">{t("form.select")}</option>
                {intakeOptions.map((value) => (
                  <option key={value} value={value}>
                    {INTAKE_VALUES.includes(value)
                      ? t(`form.intakes.${value}`)
                      : value}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="landing-form-group">
            <label>{t("form.message")}</label>
            <textarea
              name="notes_admin"
              rows="4"
              value={formData.notes_admin}
              onChange={handleChange}
              placeholder={t("form.messagePlaceholder")}
              className="resize-none"
            />
          </div>

          <button
            type="submit"
            className="landing-btn landing-btn-primary landing-btn-full"
            disabled={status === "submitting"}
          >
            {status === "submitting"
              ? "⏳ " + t("form.submitting")
              : t("form.submit")}
          </button>
        </form>
    </>
  );

  if (embedded) {
    return <div className="student-lead-form">{formBody}</div>;
  }

  return (
    <section id="lead-form" className="landing-form-section">
      <div className="container">
        <h2 className="landing-section-title">{t("form.title")}</h2>
        <p className="landing-section-subtitle">{t("form.subtitle")}</p>
        {formBody}
      </div>
    </section>
  );
};

export default LeadForm;
