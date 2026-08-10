import { useState } from "react";
import { useLanguage } from "../context/LanguageContext.jsx";
import translations from "../translations.js";

export default function LeadForm({ prefix, source = "website" }) {
  const { lang } = useLanguage();
  const t = translations[lang].leadForm;

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

  async function handleSubmit() {
    setError("");

    if (!prenom.trim()) {
      setError(t.errPrenom);
      return;
    }
    if (!nom.trim()) {
      setError(t.errNom);
      return;
    }
    if (!age.trim() || isNaN(age) || age < 15 || age > 99) {
      setError(t.errAge);
      return;
    }
    if (!pays.trim()) {
      setError(t.errPays);
      return;
    }
    if (!email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
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
      const res = await fetch("/api/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prenom: prenom.trim(),
          nom: nom.trim(),
          age: age.trim(),
          pays: pays.trim(),
          email: email.trim(),
          phone: phone.trim(),
          domaineEtudes: domaineEtudes.trim(),
          budget,
          dateRentree,
          source,
        }),
      });
      const json = await res.json().catch(() => ({}));
      if (res.ok && json.success) setSuccess(true);
      else setError(json.error || t.errGeneric);
    } catch {
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
    <div className="lead-form">
      <div className="lead-row">
        <input
          className="lead-input"
          type="text"
          placeholder={t.placeholderPrenom}
          value={prenom}
          onChange={(e) => setPrenom(e.target.value)}
        />
        <input
          className="lead-input"
          type="text"
          placeholder={t.placeholderNom}
          value={nom}
          onChange={(e) => setNom(e.target.value)}
        />
      </div>

      <div className="lead-row">
        <input
          className="lead-input"
          type="number"
          placeholder={t.placeholderAge}
          value={age}
          onChange={(e) => setAge(e.target.value)}
          min="15"
          max="99"
        />
        <input
          className="lead-input"
          type="text"
          placeholder={t.placeholderPays}
          value={pays}
          onChange={(e) => setPays(e.target.value)}
        />
      </div>

      <div className="lead-row">
        <input
          className="lead-input"
          type="email"
          placeholder={t.placeholderEmail}
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <input
          className="lead-input"
          type="tel"
          placeholder={t.placeholderPhone}
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
        />
      </div>

      <input
        className="lead-input"
        type="text"
        placeholder={t.placeholderDomaine}
        value={domaineEtudes}
        onChange={(e) => setDomaineEtudes(e.target.value)}
      />

      <div className="lead-row">
        <select
          className="lead-input"
          value={budget}
          onChange={(e) => setBudget(e.target.value)}
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
          onChange={(e) => setDateRentree(e.target.value)}
        >
          <option value="">{t.dateLabel}</option>
          <option value="2026-septembre">{t.dateOptions.sept2026}</option>
          <option value="2027-mars">{t.dateOptions.mars2027}</option>
          <option value="2027-septembre">{t.dateOptions.sept2027}</option>
          <option value="plus-tard">{t.dateOptions.plusTard}</option>
          <option value="pas-sur">{t.dateOptions.pasSur}</option>
        </select>
      </div>

      <button className="lead-submit" onClick={handleSubmit} disabled={loading}>
        {loading ? t.submitLoading : t.submitDefault}
      </button>

      {error && <div className="lead-error show">{error}</div>}

      <p className="lead-legal">{t.legal}</p>
    </div>
  );
}
