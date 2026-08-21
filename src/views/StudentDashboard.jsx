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
  getStudentStepIndex,
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
  const [documentFile, setDocumentFile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState(null);
  const [error, setError] = useState("");
  const [selectedFile, setSelectedFile] = useState(null);

  const currentStep = getStudentStepIndex(profile?.suivi_statut);

  const loadProfile = async () => {
    setLoading(true);
    setError("");
    try {
      const data = await studentFetch("/api/student/me");
      setProfile(data.profile);
      setDocumentFile(data.document);
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

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!selectedFile) return;
    setUploading(true);
    setMessage(null);
    setError("");
    try {
      const body = new FormData();
      body.append("file", selectedFile);
      const data = await studentFetch("/api/student/document", {
        method: "POST",
        body,
      });
      setDocumentFile(data.document);
      setSelectedFile(null);
      setMessage({ type: "success", text: "Document envoyé avec succès." });
    } catch (err) {
      setMessage({ type: "error", text: err.message });
    } finally {
      setUploading(false);
    }
  };

  const handleDownload = async () => {
    try {
      const data = await studentFetch("/api/student/document");
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
      <div className="app">
        <Navigation />
        <div className="p-10 text-center">Chargement de votre dossier...</div>
      </div>
    );
  }

  if (error && !profile) {
    return (
      <div className="app">
        <Navigation />
        <section className="landing-programs py-20">
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
    <div className="app">
      <Navigation />
      <section className="landing-programs py-20">
        <div className="container">
          <div className="student-toolbar">
            <div>
              <span className="landing-hero-badge">🎓 Espace étudiant</span>
              <h1 className="landing-section-title" style={{ marginTop: 16 }}>
                Bonjour {profile.prenom || ""}
              </h1>
              <p className="landing-section-subtitle">
                Consultez l'avancement de votre dossier, mettez à jour vos
                informations et déposez vos documents.
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

          <h2 className="landing-section-title">Avancement de votre dossier</h2>
          <p className="landing-section-subtitle">
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

          <div className="student-card">
            <h2 className="landing-section-title" style={{ textAlign: "left" }}>
              📄 Document requis
            </h2>
            <p className="landing-section-subtitle" style={{ textAlign: "left" }}>
              Pour le moment, merci de déposer votre passeport ou une pièce
              d'identité (PDF, JPG ou PNG — 10 Mo max).
            </p>

            {documentFile ? (
              <div className="landing-alert landing-alert-success">
                Document actuel : <strong>{documentFile.name}</strong>
              </div>
            ) : (
              <div className="landing-alert landing-alert-warning">
                Aucun document n'a encore été envoyé.
              </div>
            )}

            <form onSubmit={handleUpload}>
              <div className="landing-form-group">
                <label>Choisir un fichier</label>
                <input
                  type="file"
                  accept=".pdf,.jpg,.jpeg,.png,.webp"
                  onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
                />
              </div>
              <div className="landing-hero-actions" style={{ justifyContent: "flex-start" }}>
                <button
                  type="submit"
                  className="landing-btn landing-btn-primary"
                  disabled={uploading || !selectedFile}
                >
                  {uploading ? "Envoi..." : "Envoyer le document"}
                </button>
                {documentFile && (
                  <button
                    type="button"
                    className="landing-btn landing-btn-secondary"
                    onClick={handleDownload}
                  >
                    Télécharger
                  </button>
                )}
              </div>
            </form>
          </div>

          <form className="student-card" onSubmit={handleSave}>
            <h2 className="landing-section-title" style={{ textAlign: "left" }}>
              👤 Mes informations
            </h2>
            <p className="landing-section-subtitle" style={{ textAlign: "left" }}>
              Connecté avec {user?.email}. L'adresse email ne peut pas être
              modifiée ici.
            </p>

            <div className="landing-form-row">
              <div className="landing-form-group">
                <label>Prénom *</label>
                <input
                  name="prenom"
                  value={profile.prenom}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="landing-form-group">
                <label>Nom *</label>
                <input
                  name="nom"
                  value={profile.nom}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            <div className="landing-form-row">
              <div className="landing-form-group">
                <label>Email</label>
                <input value={profile.email} disabled />
              </div>
              <div className="landing-form-group">
                <label>Téléphone</label>
                <input
                  name="phone"
                  value={profile.phone}
                  onChange={handleChange}
                />
              </div>
            </div>

            <div className="landing-form-row">
              <div className="landing-form-group">
                <label>Âge</label>
                <input
                  type="number"
                  name="age"
                  min="15"
                  max="60"
                  value={profile.age}
                  onChange={handleChange}
                />
              </div>
              <div className="landing-form-group">
                <label>Pays *</label>
                <input
                  name="pays"
                  value={profile.pays}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            <div className="landing-form-row">
              <div className="landing-form-group">
                <label>Dernier diplôme</label>
                <select
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
                <label>Domaine d'études</label>
                <select
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
                <label>Budget annuel estimé</label>
                <select
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
                <label>Rentrée souhaitée</label>
                <select
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
        </div>
      </section>
      <Footer t={t} />
    </div>
  );
}
