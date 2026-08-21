"use client";

import { useEffect, useState } from "react";
import Navigation from "../components/Navigation";
import Footer from "../components/Footer";
import { fr } from "../i18n/fr";
import { supabase } from "../lib/supabase";
import { useAuth } from "../context/AuthContext";
import {
  DOMAINES_ETUDES,
  STUDENT_PROCESS_STEPS,
  REQUIRED_STUDENT_DOCUMENTS,
  getDisplayedStepIndex,
  getChosenFormule,
} from "../lib/studentProgress";

async function studentFetch(path, options = {}) {
  const {
    data: { session },
  } = await supabase.auth.getSession();

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

export default function StudentDashboard() {
  const t = fr;
  const { user, signOut } = useAuth();
  const [profile, setProfile] = useState(null);
  const [requiredDocuments, setRequiredDocuments] = useState([]);
  const [adminDocuments, setAdminDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploadingKey, setUploadingKey] = useState("");
  const [message, setMessage] = useState(null);
  const [error, setError] = useState("");
  const [selectedFiles, setSelectedFiles] = useState({});

  const unlocked = Boolean(profile?.unlocked);
  const chosenFormule = getChosenFormule(profile);
  const currentStep = getDisplayedStepIndex(profile);
  const docsToShow =
    requiredDocuments.length > 0
      ? requiredDocuments
      : REQUIRED_STUDENT_DOCUMENTS.map((doc) => ({
          ...doc,
          status: "missing",
          file: null,
        }));
  const missingCount = docsToShow.filter(
    (doc) => doc.status === "missing",
  ).length;

  const loadProfile = async () => {
    setLoading(true);
    setError("");
    try {
      const data = await studentFetch("/api/student/me");
      setProfile(data.profile);
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
      setMessage({ type: "success", text: "Vos informations ont été enregistrées." });
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
      setMessage({ type: "success", text: "Document envoyé avec succès." });
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
            <p className="landing-section-subtitle">Chargement de votre dossier...</p>
          </div>
        </section>
        <Footer t={t} />
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
              Se déconnecter
            </button>
          </div>
        </section>
        <Footer t={t} />
      </div>
    );
  }

  return (
    <div className="app app-page-fill">
      <Navigation />
      <section className="landing-form-section">
        <div className="container">
          <div className="student-toolbar">
            <div>
              <span className="landing-hero-badge">Espace étudiant</span>
              <h1 className="landing-section-title is-left">
                Bonjour {profile.prenom || ""}
              </h1>
              <p className="landing-section-subtitle is-left">
                {unlocked
                  ? "Consultez l'avancement de votre dossier, mettez à jour vos informations et déposez vos documents."
                  : "Complétez vos informations. Le suivi et les documents seront débloqués une fois votre formule validée."}
              </p>
            </div>
            <button
              type="button"
              className="landing-btn landing-btn-secondary"
              onClick={handleLogout}
            >
              Se déconnecter
            </button>
          </div>

          {message?.type === "success" && (
            <div className="landing-alert landing-alert-success">{message.text}</div>
          )}
          {message?.type === "error" && (
            <div className="landing-alert landing-alert-error">{message.text}</div>
          )}

          {chosenFormule ? (
            <div className="student-card">
              <h2 className="card-title">Votre formule</h2>
              <p className="card-subtitle">
                Formule confirmée pour votre accompagnement.
              </p>
              <div className="landing-alert landing-alert-success">
                {chosenFormule}
              </div>
            </div>
          ) : (
            <div className="student-card">
              <h2 className="card-title">Votre formule</h2>
              <p className="card-subtitle">
                Aucune formule n'a encore été confirmée. Répondez à notre email
                avec le numéro de la formule souhaitée (1, 2 ou 3).
              </p>
            </div>
          )}

          <form className="student-card" onSubmit={handleSave}>
            <h2 className="card-title">Mes informations</h2>
            <p className="card-subtitle">
              Connecté avec {user?.email}. L'adresse email ne peut pas être
              modifiée ici.
            </p>

            <div className="landing-form-row">
              <div className="landing-form-group">
                <label htmlFor="student-prenom">Prénom *</label>
                <input
                  id="student-prenom"
                  name="prenom"
                  value={profile.prenom}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="landing-form-group">
                <label htmlFor="student-nom">Nom *</label>
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
                <label htmlFor="student-email">Email</label>
                <input id="student-email" value={profile.email} disabled />
              </div>
              <div className="landing-form-group">
                <label htmlFor="student-phone">Téléphone</label>
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
                <label htmlFor="student-age">Âge</label>
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
                <label htmlFor="student-pays">Pays *</label>
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
                <label htmlFor="student-diplome">Dernier diplôme</label>
                <select
                  id="student-diplome"
                  name="dernier_diplome"
                  value={profile.dernier_diplome}
                  onChange={handleChange}
                >
                  <option value="">-- Sélectionner --</option>
                  <option value="bac">Baccalauréat</option>
                  <option value="licence">Licence</option>
                  <option value="master">Master</option>
                  <option value="doctorat">Doctorat</option>
                  <option value="autre">Autre</option>
                </select>
              </div>
              <div className="landing-form-group">
                <label htmlFor="student-domaine">Domaine d'études</label>
                <select
                  id="student-domaine"
                  name="domaine_etudes"
                  value={profile.domaine_etudes}
                  onChange={handleChange}
                >
                  <option value="">-- Sélectionner --</option>
                  {profile.domaine_etudes &&
                  !DOMAINES_ETUDES.includes(profile.domaine_etudes) ? (
                    <option value={profile.domaine_etudes}>
                      {profile.domaine_etudes}
                    </option>
                  ) : null}
                  {DOMAINES_ETUDES.map((domaine) => (
                    <option key={domaine} value={domaine}>
                      {domaine}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="landing-form-row">
              <div className="landing-form-group">
                <label htmlFor="student-budget">Budget annuel estimé</label>
                <select
                  id="student-budget"
                  name="budget"
                  value={profile.budget}
                  onChange={handleChange}
                >
                  <option value="">-- Sélectionner --</option>
                  <option value="<5000">Moins de 5 000 $</option>
                  <option value="5000-10000">5 000 - 10 000 $</option>
                  <option value="10000-20000">10 000 - 20 000 $</option>
                  <option value=">20000">Plus de 20 000 $</option>
                </select>
              </div>
              <div className="landing-form-group">
                <label htmlFor="student-rentree">Rentrée souhaitée</label>
                <select
                  id="student-rentree"
                  name="date_rentree"
                  value={profile.date_rentree}
                  onChange={handleChange}
                >
                  <option value="">-- Sélectionner --</option>
                  <option value="septembre_2026">Septembre 2026</option>
                  <option value="mars_2027">Mars 2027</option>
                  <option value="septembre_2027">Septembre 2027</option>
                  <option value="flexible">Flexible</option>
                </select>
              </div>
            </div>

            <button
              type="submit"
              className="landing-btn landing-btn-primary"
              disabled={saving}
            >
              {saving ? "Enregistrement..." : "Enregistrer mes informations"}
            </button>
          </form>

          {unlocked ? (
            <>
              <div className="student-card">
                <h2 className="card-title">Avancement de votre dossier</h2>
                <p className="card-subtitle">
                  Étape {currentStep + 1} sur {STUDENT_PROCESS_STEPS.length}
                </p>
                <div className="student-progress">
                  {STUDENT_PROCESS_STEPS.map((step, index) => {
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
                          {step.label}
                        </div>
                        <div className="student-step-desc">{step.description}</div>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="student-card">
                <h2 className="card-title">Documents à fournir</h2>
                <p className="card-subtitle">
                  {missingCount > 0
                    ? `${missingCount} document${missingCount > 1 ? "s" : ""} manquant${missingCount > 1 ? "s" : ""}. Déposez-les ci-dessous (PDF, JPG ou PNG — 10 Mo max).`
                    : "Tous les documents demandés ont été reçus."}
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
                            {doc.label}
                            <span
                              className={
                                missing ? "doc-badge-missing" : "doc-badge-ok"
                              }
                            >
                              {missing ? "Manquant" : "Reçu"}
                            </span>
                          </div>
                          <p className="doc-row-desc">{doc.description}</p>
                          {doc.file ? (
                            <p className="doc-row-file">
                              Fichier actuel : <strong>{doc.file.name}</strong>
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
                                ? "Envoi..."
                                : doc.file
                                  ? "Remplacer"
                                  : "Envoyer"}
                            </button>
                            {doc.file ? (
                              <button
                                type="button"
                                className="landing-btn landing-btn-secondary"
                                onClick={() => handleDownload(doc.file.path)}
                              >
                                Télécharger
                              </button>
                            ) : null}
                          </div>
                        </form>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="student-card">
                <h2 className="card-title">Documents fournis par Chinois en Devenir</h2>
                <p className="card-subtitle">
                  Fichiers transmis par Chinois en Devenir pour votre dossier.
                </p>
                {adminDocuments.length === 0 ? (
                  <div className="landing-alert landing-alert-warning">
                    Aucun document n'a encore été envoyé par l'équipe.
                  </div>
                ) : (
                  <div className="doc-list">
                    {adminDocuments.map((doc) => (
                      <div key={doc.path} className="doc-row doc-received">
                        <div className="doc-row-main">
                          <div className="doc-row-title">
                            <span>📄</span>
                            {doc.name}
                            <span className="doc-badge-ok">Reçu</span>
                          </div>
                        </div>
                        <button
                          type="button"
                          className="landing-btn landing-btn-secondary"
                          onClick={() => handleDownload(doc.path)}
                        >
                          Télécharger
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </>
          ) : (
            <div className="student-card student-locked">
              <h2 className="card-title">Suivi et documents verrouillés</h2>
              <p className="card-subtitle">
                Une fois votre formule validée par notre équipe, vous pourrez
                consulter l'avancement de votre dossier et déposer vos documents.
              </p>
            </div>
          )}
        </div>
      </section>
      <Footer t={t} />
    </div>
  );
}
