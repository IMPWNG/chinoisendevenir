"use client";

import {
  FORMULES,
  PAYMENT_NOTE,
  displayFormuleFootnote,
  getFormuleIncludeGroups,
  getFormuleNumber,
} from "../lib/formules";

export default function StudentFormules({ currentFormule = "" }) {
  const selectedNumber = getFormuleNumber(currentFormule);

  return (
    <div className="student-card student-card-wide">
      <h2 className="card-title">Nos formules</h2>
      <p className="card-subtitle">
        Une fois votre formule débloquée par Chinois en Devenir, vous
        accéderez à l'orientation, au suivi et aux documents correspondant à
        votre accompagnement.
      </p>

      <div className="student-formule-grid">
        {FORMULES.map((formule) => {
          const featured = formule.featured;
          const selected = selectedNumber === formule.number;
          return (
            <article
              key={formule.number}
              className={`student-formule-card ${featured ? "is-featured" : ""} ${selected ? "is-selected" : ""}`}
            >
              <div className="student-formule-card-top">
                <p className="student-formule-kicker">Formule {formule.number}</p>
                {formule.badge ? (
                  <span
                    className={`student-formule-badge ${featured ? "is-featured" : ""}`}
                  >
                    {formule.badge}
                  </span>
                ) : null}
              </div>
              {formule.audience ? (
                <p className="student-formule-audience">{formule.audience}</p>
              ) : null}
              <h3 className="student-formule-title">{formule.title}</h3>
              {formule.subtitle ? (
                <p className="student-formule-intro">{formule.subtitle}</p>
              ) : null}
              {formule.comparePrice ? (
                <p className="student-formule-compare">{formule.comparePrice}</p>
              ) : null}
              <p className="student-formule-price">{formule.price}</p>
              {formule.savingsLabel ? (
                <p className="student-formule-savings">{formule.savingsLabel}</p>
              ) : null}
              <p className="student-formule-payment">{PAYMENT_NOTE}</p>
              {formule.savingsText ? (
                <p className="student-formule-intro">{formule.savingsText}</p>
              ) : null}
              <p className="student-formule-intro">{formule.intro}</p>
              {getFormuleIncludeGroups(formule).map((group) => (
                <div key={group.title}>
                  <p className="student-formule-label">{group.title}</p>
                  <ul className="student-formule-list">
                    {group.items.map((item) => (
                      <li key={item}>{item}</li>
                    ))}
                  </ul>
                </div>
              ))}
              {formule.footnote ? (
                <p className="student-formule-note formule-footnote">
                  {displayFormuleFootnote(formule.footnote)}
                </p>
              ) : null}
              <button
                type="button"
                className={`landing-btn landing-btn-full ${featured ? "landing-btn-accent" : "landing-btn-primary"}`}
                disabled
                aria-disabled="true"
                title="Le paiement en ligne sera bientôt disponible"
              >
                Payer {formule.price}
              </button>
            </article>
          );
        })}
      </div>
    </div>
  );
}
