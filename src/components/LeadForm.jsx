import { useState } from "react";

export default function LeadForm({ prefix, source = "website" }) {
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
      setError("⚠ Prénom requis.");
      return;
    }
    if (!nom.trim()) {
      setError("⚠ Nom requis.");
      return;
    }
    if (!age.trim() || isNaN(age) || age < 15 || age > 99) {
      setError("⚠ Âge invalide.");
      return;
    }
    if (!pays.trim()) {
      setError("⚠ Pays de résidence requis.");
      return;
    }
    if (!email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError("⚠ Email invalide.");
      return;
    }
    if (!phone.trim()) {
      setError("⚠ Numéro de téléphone requis.");
      return;
    }
    if (!domaineEtudes.trim()) {
      setError("⚠ Domaine d'études requis.");
      return;
    }
    if (!budget) {
      setError("⚠ Merci de sélectionner ton budget.");
      return;
    }
    if (!dateRentree) {
      setError("⚠ Merci de sélectionner la rentrée souhaitée.");
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
      else setError(json.error || "Une erreur est survenue.");
    } catch {
      setError("⚠ Connexion impossible.");
    } finally {
      setLoading(false);
    }
  }

  if (success) {
    return (
      <div className="lead-success show">
        <div className="lead-success-icon">✅</div>
        <h3>Ta demande a bien été envoyée 🎉</h3>
        <p>
          Notre équipe va analyser ton profil et te recontacter rapidement.
          Pense à vérifier tes emails et ton téléphone.
        </p>
      </div>
    );
  }

  return (
    <div className="lead-form">
      <div className="lead-row">
        <input
          className="lead-input"
          type="text"
          placeholder="Prénom *"
          value={prenom}
          onChange={(e) => setPrenom(e.target.value)}
        />
        <input
          className="lead-input"
          type="text"
          placeholder="Nom *"
          value={nom}
          onChange={(e) => setNom(e.target.value)}
        />
      </div>

      <div className="lead-row">
        <input
          className="lead-input"
          type="number"
          placeholder="Âge *"
          value={age}
          onChange={(e) => setAge(e.target.value)}
          min="15"
          max="99"
        />
        <input
          className="lead-input"
          type="text"
          placeholder="Pays de résidence *"
          value={pays}
          onChange={(e) => setPays(e.target.value)}
        />
      </div>

      <div className="lead-row">
        <input
          className="lead-input"
          type="email"
          placeholder="Email *"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <input
          className="lead-input"
          type="tel"
          placeholder="📱 Téléphone (WhatsApp) *"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
        />
      </div>

      <input
        className="lead-input"
        type="text"
        placeholder="Domaine d'études souhaité * (ex: Médecine, Informatique...)"
        value={domaineEtudes}
        onChange={(e) => setDomaineEtudes(e.target.value)}
      />

      <div className="lead-row">
        <select
          className="lead-input"
          value={budget}
          onChange={(e) => setBudget(e.target.value)}
        >
          <option value="">Budget annuel disponible *</option>
          <option value="moins-3000">Moins de 3 000 €</option>
          <option value="3000-6000">3 000 € – 6 000 €</option>
          <option value="6000-10000">6 000 € – 10 000 €</option>
          <option value="plus-10000">Plus de 10 000 €</option>
          <option value="besoin-bourse">Je recherche une bourse</option>
          <option value="ne-sais-pas">Je ne sais pas encore</option>
        </select>

        <select
          className="lead-input"
          value={dateRentree}
          onChange={(e) => setDateRentree(e.target.value)}
        >
          <option value="">Rentrée souhaitée *</option>
          <option value="2026-septembre">Septembre 2026</option>
          <option value="2027-mars">Mars 2027</option>
          <option value="2027-septembre">Septembre 2027</option>
          <option value="plus-tard">Plus tard</option>
          <option value="pas-sur">Pas encore décidé</option>
        </select>
      </div>

      <button className="lead-submit" onClick={handleSubmit} disabled={loading}>
        {loading ? "Envoi en cours…" : "Envoyer ma demande →"}
      </button>

      {error && <div className="lead-error show">{error}</div>}

      <p className="lead-legal">
        🔒 Données confidentielles · Aucun spam · Désinscription à tout moment
      </p>
    </div>
  );
}
