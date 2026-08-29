"use client";

import { FORMULES, getFormuleNumber } from "../lib/formules";

export default function StudentFormules({
  currentFormule = "",
  unlocked = false,
}) {
  const selectedNumber = getFormuleNumber(currentFormule);

  return (
    <div className="student-card student-card-wide">
      <h2 className="card-title">
        {unlocked ? "Votre formule" : "Nos formules"}
      </h2>
      <p className="card-subtitle">
        {unlocked
          ? "Votre accompagnement est débloqué. La formule choisie est mise en avant ci-dessus."
          : "Une fois votre formule débloquée par Chinois en Devenir, vous accéderez à l'orientation, au suivi et aux documents."}
      </p>

      <div className="student-formule-grid">
        {FORMULES.map((formule) => {
          const featured = formule.number === 2;
          const selected = selectedNumber === formule.number;
          return (
            <article
              key={formule.number}
              className={`student-formule-card ${featured ? "is-featured" : ""} ${selected ? "is-selected" : ""}`}
            >
              <p className="student-formule-kicker">Formule {formule.number}</p>
              <h3 className="student-formule-title">{formule.title}</h3>
              <p className="student-formule-price">{formule.price}</p>
              <p className="student-formule-intro">{formule.intro}</p>
              <p className="student-formule-label">Inclus</p>
              <ul className="student-formule-list">
                {formule.includes.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
              {formule.footnote ? (
                <p className="student-formule-note">{formule.footnote}</p>
              ) : null}
              {unlocked && selected ? (
                <div className="landing-alert landing-alert-success">
                  Formule {formule.number} active
                </div>
              ) : (
                <button
                  type="button"
                  className={`landing-btn landing-btn-full ${featured ? "landing-btn-accent" : "landing-btn-primary"}`}
                  disabled
                  aria-disabled="true"
                  title="Le paiement en ligne sera bientôt disponible"
                >
                  Payer {formule.price}
                </button>
              )}
            </article>
          );
        })}
      </div>
    </div>
  );
}
