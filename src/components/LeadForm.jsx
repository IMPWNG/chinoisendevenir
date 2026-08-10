import { useState } from "react";
import { useLanguage } from "../context/LanguageContext.jsx";
import translations from "../translations.js";

export default function LeadForm({ prefix = "", source = "website" }) {
  const { lang } = useLanguage();

  // Sécurité : si la langue sélectionnée n'existe pas,
  // on utilise le français par défaut.
  const currentLanguage = translations[lang] || translations.fr;
  const t = currentLanguage.leadForm;

  const [prenom, setPrenom] = useState("");
  const [nom, setNom] = useState("");
  const [age, setAge] = useState("");
  const [pays, setPays] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [domaineEtudes, setDomaineEtudes] = useState("");
  const [budget, setBudget] = useState("");
  const [dateRentree, setDateRentree] = useState("");

  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  function handleInputChange(setter) {
    return (event) => {
      setter(event.target.value);
      setError("");
    };
  }

  async function handleSubmit(event) {
    event.preventDefault();

    setError("");

    const ageNumber = Number(age);

    if (!prenom.trim()) {
      setError(t.errPrenom);
      return;
    }

    if (!nom.trim()) {
      setError(t.errNom);
      return;
    }

    if (
      !age.trim() ||
      !Number.isFinite(ageNumber) ||
      ageNumber < 15 ||
      ageNumber > 99
    ) {
      setError(t.errAge);
      return;
    }

    if (!pays.trim()) {
      setError(t.errPays);
      return;
    }

    if (!email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      setError(t.errEmail);
      return;
    }

    if (!phone.trim()) {
      setError(t.errPhone);
      return;
    }

    if (!domaineEtudes.trim()) {
      setError(t.errDomaine);
      return;
    }

    if (!budget) {
      setError(t.errBudget);
      return;
    }

    if (!dateRentree) {
      setError(t.errDate);
      return;
    }

    setLoading(true);

    try {
      const response = await fetch("/api/subscribe", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          prenom: prenom.trim(),
          nom: nom.trim(),
          age: ageNumber,
          pays: pays.trim(),
          email: email.trim(),
          phone: phone.trim(),
          domaineEtudes: domaineEtudes.trim(),
          budget,
          dateRentree,
          source,
          prefix,
          language: lang,
        }),
      });

      const data = await response.json().catch(() => ({}));

      if (!response.ok || !data.success) {
        setError(data.error || t.errGeneric);
        return;
      }

      setSuccess(true);
    } catch (submitError) {
      console.error("Erreur lors de l'envoi du formulaire :", submitError);
      setError(t.errConnexion);
    } finally {
      setLoading(false);
    }
  }

  if (success) {
    return (
      <div className="lead-success show">
        <div className="lead-success-icon">✅</div>

        <h3>{t.successTitle}</h3>

        <p>{t.successText}</p>
      </div>
    );
  }

  return (
    <form className="lead-form" onSubmit={handleSubmit} noValidate>
      <div className="lead-row">
        <input
          className="lead-input"
          type="text"
          placeholder={t.placeholderPrenom}
          value={prenom}
          onChange={handleInputChange(setPrenom)}
          autoComplete="given-name"
        />

        <input
          className="lead-input"
          type="text"
          placeholder={t.placeholderNom}
          value={nom}
          onChange={handleInputChange(setNom)}
          autoComplete="family-name"
        />
      </div>

      <div className="lead-row">
        <input
          className="lead-input"
          type="number"
          placeholder={t.placeholderAge}
          value={age}
          onChange={handleInputChange(setAge)}
          min="15"
          max="99"
          inputMode="numeric"
        />

        <input
          className="lead-input"
          type="text"
          placeholder={t.placeholderPays}
          value={pays}
          onChange={handleInputChange(setPays)}
          autoComplete="country-name"
        />
      </div>

      <div className="lead-row">
        <input
          className="lead-input"
          type="email"
          placeholder={t.placeholderEmail}
          value={email}
          onChange={handleInputChange(setEmail)}
          autoComplete="email"
        />

        <input
          className="lead-input"
          type="tel"
          placeholder={t.placeholderPhone}
          value={phone}
          onChange={handleInputChange(setPhone)}
          autoComplete="tel"
        />
      </div>

      <input
        className="lead-input"
        type="text"
        placeholder={t.placeholderDomaine}
        value={domaineEtudes}
        onChange={handleInputChange(setDomaineEtudes)}
      />

      <div className="lead-row">
        <select
          className="lead-input"
          value={budget}
          onChange={handleInputChange(setBudget)}
        >
          <option value="">{t.budgetLabel}</option>

          <option value="moins-3000">{t.budgetOptions.moins3000}</option>

          <option value="3000-6000">{t.budgetOptions.de3000a6000}</option>

          <option value="6000-10000">{t.budgetOptions.de6000a10000}</option>

          <option value="plus-10000">{t.budgetOptions.plus10000}</option>

          <option value="besoin-bourse">{t.budgetOptions.besoinBourse}</option>

          <option value="ne-sais-pas">{t.budgetOptions.neSaisPas}</option>
        </select>

        <select
          className="lead-input"
          value={dateRentree}
          onChange={handleInputChange(setDateRentree)}
        >
          <option value="">{t.dateLabel}</option>

          <option value="2026-septembre">{t.dateOptions.sept2026}</option>

          <option value="2027-mars">{t.dateOptions.mars2027}</option>

          <option value="2027-septembre">{t.dateOptions.sept2027}</option>

          <option value="plus-tard">{t.dateOptions.plusTard}</option>

          <option value="pas-sur">{t.dateOptions.pasSur}</option>
        </select>
      </div>

      {error && (
        <div className="lead-error show" role="alert">
          {error}
        </div>
      )}

      <button className="lead-submit" type="submit" disabled={loading}>
        {loading ? t.submitLoading : t.submitDefault}
      </button>

      <p className="lead-legal">{t.legal}</p>
    </form>
  );
}
