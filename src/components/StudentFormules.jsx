"use client";

import { FORMULES } from "../lib/formules";

export default function StudentFormules({ currentFormule = "", paid = false }) {
  return (
    <div className="student-card student-card-wide">
      <h2 className="card-title">
        {paid ? "Votre formule" : "Choisissez votre formule"}
      </h2>
      <p className="card-subtitle">
        {paid
          ? "Votre accompagnement est débloqué selon la formule réglée."
          : "Une fois le règlement effectué, vous accéderez aux informations correspondant à la formule choisie. Le paiement en ligne sera bientôt disponible."}
      </p>

      <div className="student-formule-grid">
        {FORMULES.map((formule) => {
          const featured = formule.number === 2;
          const selected = currentFormule === formule.value;
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
              {paid && selected ? (
                <div className="landing-alert landing-alert-success">
                  Formule active
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
