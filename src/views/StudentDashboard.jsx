"use client";

import { useEffect, useState } from "react";
import Navigation from "../components/Navigation";
import Footer from "../components/Footer";
import LeadForm from "../components/LeadForm";
import StudentFormules from "../components/StudentFormules";
import StudentMatching from "../components/StudentMatching";
import StudentChineseMatching from "../components/StudentChineseMatching";
import StudentFormuleBanner from "../components/StudentFormuleBanner";
import StudentVisaDocuments from "../components/StudentVisaDocuments";
import { studentSupabase } from "../lib/supabase";
import { useAuth } from "../context/AuthContext";
import { useSiteI18n } from "../context/SiteI18nContext";
import { STUDY_DOMAIN_VALUE_BY_INDEX } from "../i18n/site";
import {
  BUDGET_VALUES,
  DIPLOMA_VALUES,
  INTAKE_VALUES,
  withCurrentOption,
} from "../lib/contactForm";
import {
  DOMAINES_ETUDES,
  diplomaLevelFromStudent,
  getDisplayedStepIndex,
  getRequiredStudentDocuments,
  getVisibleStudentSteps,
  studentCanAccessVisaDocuments,
} from "../lib/studentProgress";

async function studentFetch(path, options = {}) {
  const {
    data: { session },
    } = await studentSupabase.auth.getSession();

  if (!session?.access_token) {
    throw new Error("Session expirée. Veuillez vous reconnecter.");
  }

  const isFormData = options.body instanceof FormData;
  const response = await fetch(path, {
    ...options,
    headers: {
      ...(isFormData ? {} : { "Content-Type": "application/json" }),
      ...(options.headers || {}),
      Authorization: `Bearer ${session.access_token}`,
    },
  });

  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(data.error || "Une erreur est survenue");
  }
  return data;
}

function translatedOption(t, prefix, value) {
  const path = `${prefix}.${value}`;
  const translated = t(path);
  return translated === path ? value : translated;
}

const BUDGET_LABEL_KEYS = {
  "<5000": "lt5000",
  ">20000": "gt20000",
};

function budgetLabel(t, value) {
  return translatedOption(t, "form.budgets", BUDGET_LABEL_KEYS[value] || value);
}

export default function StudentDashboard() {
  const { t, dict } = useSiteI18n();
  const { user, signOut } = useAuth();
  const [profile, setProfile] = useState(null);
  const [matching, setMatching] = useState(null);
  const [chineseMatching, setChineseMatching] = useState(null);
  const [requiredDocuments, setRequiredDocuments] = useState([]);
  const [adminDocuments, setAdminDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploadingKey, setUploadingKey] = useState("");
  const [message, setMessage] = useState(null);
  const [error, setError] = useState("");
  const [selectedFiles, setSelectedFiles] = useState({});
  const [choosingFormule, setChoosingFormule] = useState(null);

  const hasForm = Boolean(profile?.hasForm);
  const unlocked = Boolean(profile?.unlocked ?? profile?.paid);
  const hasChosenFormule = Boolean(profile?.formule);
  const canChooseFormule = Boolean(
    profile?.canChooseFormule ?? (hasForm && !unlocked),
  );
  const formuleNumber = profile?.formuleNumber || null;
  const access = profile?.access || {};
  const showVisaDocs = studentCanAccessVisaDocuments(formuleNumber);
  const visibleSteps = getVisibleStudentSteps(formuleNumber);
  const currentStep = Math.min(
    getDisplayedStepIndex(profile),
    Math.max(visibleSteps.length - 1, 0),
  );
  const docsToShow =
    requiredDocuments.length > 0
      ? requiredDocuments
      : getRequiredStudentDocuments(profile).map((doc) => ({
          ...doc,
          status: "missing",
          file: null,
        }));
  const missingCount = docsToShow.filter(
    (doc) => doc.status === "missing",
  ).length;
  const diplomaOptions = withCurrentOption(
    DIPLOMA_VALUES,
    profile?.dernier_diplome,
  );
  const budgetOptions = withCurrentOption(BUDGET_VALUES, profile?.budget);
  const intakeOptions = withCurrentOption(INTAKE_VALUES, profile?.date_rentree);

  const loadProfile = async ({ silent = false } = {}) => {
    if (!silent) setLoading(true);
    setError("");
    try {
      const data = await studentFetch("/api/student/me");
      setProfile(data.profile);
      setMatching(data.matching || null);
      setChineseMatching(data.chineseMatching || null);
      setRequiredDocuments(data.requiredDocuments || []);
      setAdminDocuments(data.adminDocuments || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProfile();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setProfile((prev) => ({ ...prev, [name]: value }));
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    setMessage(null);
    setError("");
    try {
      const data = await studentFetch("/api/student/profile", {
        method: "PATCH",
        body: JSON.stringify(profile),
      });
      setProfile(data.profile);
      setMessage({ type: "success", text: t("student.saved") });
      await loadProfile({ silent: true });
    } catch (err) {
      setMessage({ type: "error", text: err.message });
    } finally {
      setSaving(false);
    }
  };

  const handleUpload = async (e, docKey) => {
    e.preventDefault();
    const file = selectedFiles[docKey];
    if (!file) return;
    setUploadingKey(docKey);
    setMessage(null);
    setError("");
    try {
      const body = new FormData();
      body.append("file", file);
      body.append("docKey", docKey);
      const data = await studentFetch("/api/student/document", {
        method: "POST",
        body,
      });
      setRequiredDocuments(data.requiredDocuments || []);
      setAdminDocuments(data.adminDocuments || []);
      setSelectedFiles((prev) => ({ ...prev, [docKey]: null }));
      setMessage({ type: "success", text: t("student.docSent") });
    } catch (err) {
      setMessage({ type: "error", text: err.message });
    } finally {
      setUploadingKey("");
    }
  };

  const handleDownload = async (path) => {
    try {
      const data = await studentFetch(
        `/api/student/document?path=${encodeURIComponent(path)}`,
      );
      window.open(data.url, "_blank", "noopener,noreferrer");
    } catch (err) {
      setMessage({ type: "error", text: err.message });
    }
  };

  const handleChooseFormule = async (number) => {
    if (!canChooseFormule || choosingFormule) return;
    setChoosingFormule(number);
    setMessage(null);
    setError("");
    try {
      const data = await studentFetch("/api/student/formule", {
        method: "POST",
        body: JSON.stringify({ number }),
      });
      setProfile(data.profile);
      setMessage({ type: "success", text: t("student.formuleSaved") });
      await loadProfile({ silent: true });
    } catch (err) {
      setMessage({ type: "error", text: err.message });
    } finally {
      setChoosingFormule(null);
    }
  };

  const handleLogout = async () => {
    await signOut();
    window.location.href = "/espace-etudiant/connexion";
  };

  if (loading) {
    return (
      <div className="app app-page-fill">
        <Navigation />
        <section className="landing-form-section">
          <div className="container">
            <p className="landing-section-subtitle">{t("student.loadingFile")}</p>
          </div>
        </section>
        <Footer />
      </div>
    );
  }

  if (error && !profile) {
    return (
      <div className="app app-page-fill">
        <Navigation />
        <section className="landing-form-section">
          <div className="container">
            <div className="landing-alert landing-alert-error">{error}</div>
            <button
              type="button"
              className="landing-btn landing-btn-primary"
              onClick={handleLogout}
            >
              {t("student.logout")}
            </button>
          </div>
        </section>
        <Footer />
      </div>
    );
  }

  const diplomaLevel = diplomaLevelFromStudent(profile?.dernier_diplome);
  const docsIntroKey =
    diplomaLevel === "doctorat" ? "master" : diplomaLevel || "autre";
  const subtitle = !hasForm
    ? t("student.noFile")
    : unlocked
      ? t("student.unlockedSubtitle")
      : hasChosenFormule
        ? t("student.chosenPendingSubtitle")
        : t("student.lockedSubtitle");

  return (
    <div className="app app-page-fill">
      <Navigation />
      <section className="landing-form-section">
        <div className="container">
          <div className="student-toolbar student-toolbar-wide">
            <div>
              <span className="landing-hero-badge">{t("student.space")}</span>
              <h1 className="landing-section-title is-left">
                {t("student.hello", { name: profile?.prenom || "" })}
              </h1>
              <p className="landing-section-subtitle is-left">{subtitle}</p>
            </div>
            <button
              type="button"
              className="landing-btn landing-btn-secondary"
              onClick={handleLogout}
            >
              {t("student.logout")}
            </button>
          </div>

          {message?.type === "success" && (
            <div className="landing-alert landing-alert-success">{message.text}</div>
          )}
          {message?.type === "error" && (
            <div className="landing-alert landing-alert-error">{message.text}</div>
          )}

          {!hasForm ? (
            <div className="student-card student-card-wide">
              <h2 className="card-title">{t("student.completeTitle")}</h2>
              <p className="card-subtitle">
                {t("student.completeText", { email: user?.email })}
              </p>
              <LeadForm
                embedded
                lockedEmail={user?.email || ""}
                initialValues={{
                  prenom: profile?.prenom || "",
                  nom: profile?.nom || "",
                  age: profile?.age || "",
                  phone: profile?.phone || "",
                  pays: profile?.pays || "",
                  dernier_diplome: profile?.dernier_diplome || "",
                  domaine_etudes: DOMAINES_ETUDES.includes(profile?.domaine_etudes)
                    ? profile.domaine_etudes
                    : profile?.domaine_etudes
                      ? "Autre"
                      : "",
                  domaine_etudes_precision:
                    profile?.domaine_etudes &&
                    !DOMAINES_ETUDES.includes(profile.domaine_etudes)
                      ? profile.domaine_etudes
                      : "",
                  budget: profile?.budget || "",
                  date_rentree: profile?.date_rentree || "",
                }}
                onSuccess={() => loadProfile({ silent: true })}
              />
            </div>
          ) : !hasChosenFormule ? (
            <StudentFormules
              currentFormule=""
              selectable
              choosingNumber={choosingFormule}
              onChoose={handleChooseFormule}
            />
          ) : (
            <>
              <StudentFormuleBanner
                formule={profile.formule || ""}
                formuleNumber={formuleNumber}
              />
              <form className="student-card student-card-wide" onSubmit={handleSave}>
                <h2 className="card-title">{t("student.infoTitle")}</h2>
                <p className="card-subtitle">
                  {t("student.infoSubtitle", { email: user?.email })}
                </p>

                <div className="landing-form-row">
                  <div className="landing-form-group">
                    <label htmlFor="student-prenom">{t("form.firstname")} *</label>
                    <input
                      id="student-prenom"
                      name="prenom"
                      value={profile.prenom}
                      onChange={handleChange}
                      required
                    />
                  </div>
                  <div className="landing-form-group">
                    <label htmlFor="student-nom">{t("form.lastname")} *</label>
                    <input
                      id="student-nom"
                      name="nom"
                      value={profile.nom}
                      onChange={handleChange}
                      required
                    />
                  </div>
                </div>

                <div className="landing-form-row">
                  <div className="landing-form-group">
                    <label htmlFor="student-email">{t("form.email")}</label>
                    <input id="student-email" value={profile.email} disabled />
                  </div>
                  <div className="landing-form-group">
                    <label htmlFor="student-phone">{t("form.phone")}</label>
                    <input
                      id="student-phone"
                      name="phone"
                      value={profile.phone}
                      onChange={handleChange}
                    />
                  </div>
                </div>

                <div className="landing-form-row">
                  <div className="landing-form-group">
                    <label htmlFor="student-age">{t("form.age")}</label>
                    <input
                      id="student-age"
                      type="number"
                      name="age"
                      min="15"
                      max="60"
                      value={profile.age}
                      onChange={handleChange}
                    />
                  </div>
                  <div className="landing-form-group">
                    <label htmlFor="student-pays">{t("form.country")} *</label>
                    <input
                      id="student-pays"
                      name="pays"
                      value={profile.pays}
                      onChange={handleChange}
                      required
                    />
                  </div>
                </div>

                <div className="landing-form-row">
                  <div className="landing-form-group">
                    <label htmlFor="student-diplome">{t("form.level")}</label>
                    <select
                      id="student-diplome"
                      name="dernier_diplome"
                      value={profile.dernier_diplome}
                      onChange={handleChange}
                      required
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
                  </div>
                  <div className="landing-form-group">
                    <label htmlFor="student-domaine">{t("form.field")}</label>
                    <select
                      id="student-domaine"
                      name="domaine_etudes"
                      value={profile.domaine_etudes}
                      onChange={handleChange}
                      required
                    >
                      <option value="">{t("form.select")}</option>
                      {profile.domaine_etudes &&
                      !DOMAINES_ETUDES.includes(profile.domaine_etudes) ? (
                        <option value={profile.domaine_etudes}>
                          {profile.domaine_etudes}
                        </option>
                      ) : null}
                      {STUDY_DOMAIN_VALUE_BY_INDEX.map((domaine, index) => (
                        <option key={domaine} value={domaine}>
                          {dict.form.domains[index] || domaine}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="landing-form-row">
                  <div className="landing-form-group">
                    <label htmlFor="student-budget">{t("form.budget")}</label>
                    <select
                      id="student-budget"
                      name="budget"
                      value={profile.budget}
                      onChange={handleChange}
                    >
                      <option value="">{t("form.select")}</option>
                      {budgetOptions.map((value) => (
                        <option key={value} value={value}>
                          {budgetLabel(t, value)}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="landing-form-group">
                    <label htmlFor="student-rentree">{t("form.intake")}</label>
                    <select
                      id="student-rentree"
                      name="date_rentree"
                      value={profile.date_rentree}
                      onChange={handleChange}
                    >
                      <option value="">{t("form.select")}</option>
                      {intakeOptions.map((value) => (
                        <option key={value} value={value}>
                          {translatedOption(t, "form.intakes", value)}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <button
                  type="submit"
                  className="landing-btn landing-btn-primary"
                  disabled={saving}
                >
                  {saving ? t("student.saving") : t("student.saveInfo")}
                </button>
              </form>


              {canChooseFormule ? (
                <StudentFormules
                  currentFormule={profile.formule || ""}
                  selectable
                  choosingNumber={choosingFormule}
                  onChoose={handleChooseFormule}
                />
              ) : (
                <>
                  <div className="student-card student-card-wide">
                    <h2 className="card-title">{t("student.progressTitle")}</h2>
                    <p className="card-subtitle">
                      {t("student.progressSubtitle", {
                        current: currentStep + 1,
                        total: visibleSteps.length,
                      })}
                    </p>
                    <div
                      className={`student-progress${
                        visibleSteps.length <= 2
                          ? " is-short"
                          : visibleSteps.length === 6
                            ? " is-six"
                            : ""
                      }`}
                    >
                      {visibleSteps.map((step, index) => {
                        const state =
                          index < currentStep
                            ? "student-step-done"
                            : index === currentStep
                              ? "student-step-current"
                              : "";
                        return (
                          <div key={step.key} className={`student-step ${state}`}>
                            <div className="student-step-icon">{step.icon}</div>
                            <div className="student-step-label">
                              {index < currentStep ? "✓ " : ""}
                              {formuleNumber <= 1 && step.key === "consultation"
                                ? t("student.steps.consultation.short")
                                : t(`student.steps.${step.key}.label`)}
                            </div>
                            <div className="student-step-desc">
                              {t(`student.steps.${step.key}.description`)}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  <StudentMatching
                    matching={matching}
                    formuleNumber={formuleNumber}
                  />
                  <StudentChineseMatching
                    chineseMatching={chineseMatching}
                    formuleNumber={formuleNumber}
                  />

                  {access.documents || showVisaDocs ? (
                    <>
                      <div className="student-card student-card-wide">
                        <h2 className="card-title">{t("student.docsTitle")}</h2>
                        {access.documents ? (
                          <>
                            <h3 className="doc-school-title">
                              <span>🏫</span>
                              {t("student.schoolDocs")}
                            </h3>
                            <p className="card-subtitle">
                              {t(`student.docsIntro.${docsIntroKey}`)}
                            </p>
                            <p className="card-subtitle">
                              {missingCount > 0
                                ? t(
                                    missingCount > 1
                                      ? "student.missingCountPlural"
                                      : "student.missingCount",
                                    { count: missingCount },
                                  )
                                : t("student.allReceived")}
                            </p>

                            <div className="doc-list">
                              {docsToShow.map((doc) => {
                                const missing = doc.status !== "received";
                                return (
                                  <div
                                    key={doc.key}
                                    className={`doc-row ${missing ? "doc-missing" : "doc-received"}`}
                                  >
                                    <div className="doc-row-main">
                                      <div className="doc-row-title">
                                        <span>{doc.icon}</span>
                                        {dict.student.docsCatalog[doc.key]?.label || doc.label}
                                        <span
                                          className={
                                            missing ? "doc-badge-missing" : "doc-badge-ok"
                                          }
                                        >
                                          {missing ? t("student.missing") : t("student.received")}
                                        </span>
                                      </div>
                                      <p className="doc-row-desc">
                                        {dict.student.docsCatalog[doc.key]?.description ||
                                          doc.description}
                                      </p>
                                      {doc.file ? (
                                        <p className="doc-row-file">
                                          {t("student.currentFile")} <strong>{doc.file.name}</strong>
                                        </p>
                                      ) : null}
                                    </div>
                                    <form
                                      className="doc-row-actions"
                                      onSubmit={(e) => handleUpload(e, doc.key)}
                                    >
                                      <input
                                        type="file"
                                        accept=".pdf,.jpg,.jpeg,.png,.webp"
                                        onChange={(e) =>
                                          setSelectedFiles((prev) => ({
                                            ...prev,
                                            [doc.key]: e.target.files?.[0] || null,
                                          }))
                                        }
                                      />
                                      <div className="landing-hero-actions landing-actions-start">
                                        <button
                                          type="submit"
                                          className="landing-btn landing-btn-primary"
                                          disabled={
                                            uploadingKey === doc.key || !selectedFiles[doc.key]
                                          }
                                        >
                                          {uploadingKey === doc.key
                                            ? t("student.sending")
                                            : doc.file
                                              ? t("student.replace")
                                              : t("student.send")}
                                        </button>
                                        {doc.file ? (
                                          <button
                                            type="button"
                                            className="landing-btn landing-btn-secondary"
                                            onClick={() => handleDownload(doc.file.path)}
                                          >
                                            {t("student.download")}
                                          </button>
                                        ) : null}
                                      </div>
                                    </form>
                                  </div>
                                );
                              })}
                            </div>
                          </>
                        ) : (
                          <p className="card-subtitle">
                            {t("student.visaPrep")}
                          </p>
                        )}

                        {showVisaDocs ? (
                          <StudentVisaDocuments standalone={!access.documents} />
                        ) : null}
                      </div>

                      {access.documents ? (
                        <div className="student-card student-card-wide">
                          <h2 className="card-title">{t("student.adminDocsTitle")}</h2>
                          <p className="card-subtitle">
                            {t("student.adminDocsSubtitle")}
                          </p>
                          {adminDocuments.length === 0 ? (
                            <div className="landing-alert landing-alert-warning">
                              {t("student.noAdminDocs")}
                            </div>
                          ) : (
                            <div className="doc-list">
                              {adminDocuments.map((doc) => (
                                <div key={doc.path} className="doc-row doc-received">
                                  <div className="doc-row-main">
                                    <div className="doc-row-title">
                                      <span>📄</span>
                                      {doc.name}
                                      <span className="doc-badge-ok">{t("student.received")}</span>
                                    </div>
                                  </div>
                                  <button
                                    type="button"
                                    className="landing-btn landing-btn-secondary"
                                    onClick={() => handleDownload(doc.path)}
                                  >
                                    {t("student.download")}
                                  </button>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      ) : null}
                    </>
                  ) : null}
                </>
              )}
            </>
          )}
        </div>
      </section>
      <Footer />
    </div>
  );
}
