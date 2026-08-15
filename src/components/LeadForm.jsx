import { useState } from "react";
import { supabase } from "../lib/supabase";

const LeadForm = ({ t }) => {
  const [formData, setFormData] = useState({
    prenom: "",
    nom: "",
    age: "",
    email: "",
    phone: "",
    pays: "",
    dernier_diplome: "",
    domaine_etudes: "",
    budget: "",
    date_rentree: "",
    notes_admin: "",
  });

  const [errors, setErrors] = useState({});
  const [status, setStatus] = useState("idle");

  const validate = () => {
    const newErrors = {};
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const phoneRegex = /^[+]?[\d\s()-]{8,20}$/;

    if (!formData.prenom.trim()) newErrors.prenom = t.form_error_required;
    if (!formData.nom.trim()) newErrors.nom = t.form_error_required;

    if (!formData.email.trim()) {
      newErrors.email = t.form_error_required;
    } else if (!emailRegex.test(formData.email)) {
      newErrors.email = t.form_error_email;
    }

    if (formData.phone && !phoneRegex.test(formData.phone)) {
      newErrors.phone = t.form_error_phone;
    }

    if (
      formData.age &&
      (isNaN(formData.age) || formData.age < 15 || formData.age > 60)
    ) {
      newErrors.age = t.form_error_age;
    }

    if (!formData.pays.trim()) newErrors.pays = t.form_error_required;
    if (!formData.dernier_diplome)
      newErrors.dernier_diplome = t.form_error_required;
    if (!formData.domaine_etudes.trim())
      newErrors.domaine_etudes = t.form_error_required;

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

  const calculateScore = (data) => {
    let score = 0;
    if (data.phone) score += 20;
    if (data.age) score += 10;
    if (data.budget) score += 20;
    if (data.date_rentree) score += 15;
    if (data.notes_admin && data.notes_admin.length > 20) score += 15;
    if (data.domaine_etudes) score += 20;
    return Math.min(score, 100);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setStatus("submitting");

    const payload = {
      prenom: formData.prenom.trim(),
      nom: formData.nom.trim(),
      age: formData.age ? parseInt(formData.age, 10) : null,
      email: formData.email.trim().toLowerCase(),
      phone: formData.phone.trim() || null,
      pays: formData.pays.trim(),
      dernier_diplome: formData.dernier_diplome || null,
      domaine_etudes: formData.domaine_etudes.trim(),
      budget: formData.budget || null,
      date_rentree: formData.date_rentree || null,
      notes_admin: formData.notes_admin.trim() || null,
      source: "website",
      suivi_statut: "nouveau",
      score_qualite: calculateScore(formData),
    };

    try {
      const { data, error } = await supabase
        .from("contacts")
        .insert([payload])
        .select();

      if (error) {
        if (error.code === "23505") {
          setStatus("duplicate");
          return;
        }
        throw error;
      }

      if (data && data[0]) {
        await supabase.from("suivi_actions").insert([
          {
            contact_id: data[0].id,
            action: "changement_statut",
            description: "Nouveau lead créé depuis le site web",
            user_admin: "system",
          },
        ]);
      }

      setStatus("success");
      setFormData({
        prenom: "",
        nom: "",
        age: "",
        email: "",
        phone: "",
        pays: "",
        dernier_diplome: "",
        domaine_etudes: "",
        budget: "",
        date_rentree: "",
        notes_admin: "",
      });
    } catch (err) {
      console.error("Erreur Supabase:", err);
      setStatus("error");
    }
  };

  return (
    <section id="lead-form" className="landing-form-section">
      <div className="container">
        <h2 className="landing-section-title">{t.form_title}</h2>
        <p className="landing-section-subtitle">{t.form_subtitle}</p>

        {status === "success" && (
          <div className="landing-alert landing-alert-success">
            ✅ {t.form_success}
          </div>
        )}
        {status === "error" && (
          <div className="landing-alert landing-alert-error">
            ❌ {t.form_error}
          </div>
        )}
        {status === "duplicate" && (
          <div className="landing-alert landing-alert-warning">
            ⚠️ {t.form_error_duplicate}
          </div>
        )}

        <form className="landing-form" onSubmit={handleSubmit} noValidate>
          <div className="landing-form-row">
            <div className="landing-form-group">
              <label>{t.form_firstname} *</label>
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
              <label>{t.form_lastname} *</label>
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
              <label>{t.form_email} *</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className={errors.email ? "error" : ""}
                placeholder="jean@example.com"
              />
              {errors.email && (
                <span className="landing-error-msg">{errors.email}</span>
              )}
            </div>

            <div className="landing-form-group">
              <label>{t.form_phone}</label>
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
              <label>{t.form_age}</label>
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
              <label>{t.form_country} *</label>
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
              <label>{t.form_level} *</label>
              <select
                name="dernier_diplome"
                value={formData.dernier_diplome}
                onChange={handleChange}
                className={errors.dernier_diplome ? "error" : ""}
              >
                <option value="">-- Sélectionner --</option>
                <option value="bac">Baccalauréat</option>
                <option value="licence">Licence</option>
                <option value="master">Master</option>
                <option value="doctorat">Doctorat</option>
                <option value="autre">Autre</option>
              </select>
              {errors.dernier_diplome && (
                <span className="landing-error-msg">
                  {errors.dernier_diplome}
                </span>
              )}
            </div>

            <div className="landing-form-group">
              <label>{t.form_field} *</label>
              <input
                type="text"
                name="domaine_etudes"
                value={formData.domaine_etudes}
                onChange={handleChange}
                placeholder="Ex: Commerce international"
                className={errors.domaine_etudes ? "error" : ""}
              />
              {errors.domaine_etudes && (
                <span className="landing-error-msg">
                  {errors.domaine_etudes}
                </span>
              )}
            </div>
          </div>

          <div className="landing-form-row">
            <div className="landing-form-group">
              <label>{t.form_budget}</label>
              <select
                name="budget"
                value={formData.budget}
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
              <label>{t.form_date_rentree}</label>
              <select
                name="date_rentree"
                value={formData.date_rentree}
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

          <div className="landing-form-group">
            <label>{t.form_message}</label>
            <textarea
              name="notes_admin"
              rows="4"
              value={formData.notes_admin}
              onChange={handleChange}
              placeholder="Parlez-nous de votre projet d'études..."
              className="resize-none"
            />
          </div>

          <button
            type="submit"
            className="landing-btn landing-btn-primary landing-btn-full"
            disabled={status === "submitting"}
          >
            {status === "submitting"
              ? "⏳ " + t.form_submitting
              : t.form_submit}
          </button>
        </form>
      </div>
    </section>
  );
};

export default LeadForm;
