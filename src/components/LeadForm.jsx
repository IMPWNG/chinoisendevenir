import { useState } from "react";
import { supabase } from "../lib/supabase";

export default function LeadForm({ prefix, source = "website" }) {
  const [prenom, setPrenom] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

async function handleSubmit() {
  setError("");

  if (!prenom.trim()) {
    setError("⚠ Prénom requis.");
    return;
  }

  if (!email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    setError("⚠ Email invalide.");
    return;
  }

  setLoading(true);

  try {
    const { data, error } = await supabase.from("contacts").upsert({
      prenom: prenom.trim(),
      email: email.trim(),
      phone: phone.trim(),
      source,
    });

    if (error) {
      console.error("❌ ERROR:", error);
      setError("⚠ Erreur : " + error.message);
    } else {
      console.log("✅ SUCCESS:", data);
      setSuccess(true);
    }
  } catch (err) {
    console.error("💥 CRASH:", err);
    setError("⚠ Connexion impossible.");
  } finally {
    setLoading(false);
  }
}

  if (success) {
    return (
      <div className="lead-success show">
        <div className="lead-success-icon">✅</div>
        <h3>Tu es inscrit 🎉</h3>
        <p>
          Tu recevras toutes les informations importantes. Pense à vérifier tes
          emails.
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
          placeholder="👤 Prénom *"
          value={prenom}
          onChange={(e) => setPrenom(e.target.value)}
        />
        <input
          className="lead-input"
          type="email"
          placeholder="📩 Email *"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
      </div>
      <input
        className="lead-input"
        type="tel"
        placeholder="📱 Téléphone"
        value={phone}
        onChange={(e) => setPhone(e.target.value)}
      />
      <button className="lead-submit" onClick={handleSubmit} disabled={loading}>
        {loading ? "Envoi en cours…" : "Recevoir les infos importantes →"}
      </button>
      {error && <div className="lead-error show">{error}</div>}
      <p className="lead-legal">
        🔒 Données confidentielles · Aucun spam · Désinscription à tout moment
      </p>
    </div>
  );
}
