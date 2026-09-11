"use client";

import {
  displayFormuleFootnote,
  displayFormulePrice,
  getFormuleIncludeGroups,
  getFormuleNumber,
  localizeFormules,
} from "../lib/formules";
import { useSiteI18n } from "../context/SiteI18nContext";

export default function StudentFormules({
  currentFormule = "",
  selectable = false,
  choosingNumber = null,
  onChoose,
  subtitle,
}) {
  const { t, dict } = useSiteI18n();
  const selectedNumber = getFormuleNumber(currentFormule);
  const formules = localizeFormules(dict);
  const busy = choosingNumber != null;

  return (
    <div className="student-card student-card-wide">
      <h2 className="card-title">{t("student.formulasTitle")}</h2>
      <p className="card-subtitle">
        {subtitle ||
          (selectedNumber
            ? t("student.formulasChangeSubtitle")
            : t("student.formulasChooseSubtitle"))}
      </p>

      <div className="student-formule-grid">
        {formules.map((formule) => {
          const featured = formule.featured;
          const selected = selectedNumber === formule.number;
          const isChoosing = choosingNumber === formule.number;
          return (
            <article
              key={formule.number}
              className={`student-formule-card ${featured ? "is-featured" : ""} ${selected ? "is-selected" : ""}`}
            >
              <div className="student-formule-card-top">
                <p className="student-formule-kicker">
                  {t("student.formulaN", { n: formule.number })}
                </p>
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
              <p className="student-formule-price">
                {displayFormulePrice(formule)}
              </p>
              <p className="student-formule-payment">{t("tarifs.paymentNote")}</p>
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
              {selectable ? (
                <button
                  type="button"
                  className={`landing-btn landing-btn-full ${
                    selected
                      ? "landing-btn-secondary"
                      : featured
                        ? "landing-btn-accent"
                        : "landing-btn-primary"
                  }`}
                  disabled={busy || selected || !onChoose}
                  aria-pressed={selected}
                  onClick={() => onChoose?.(formule.number)}
                >
                  {isChoosing
                    ? t("student.saving")
                    : selected
                      ? t("student.chosenFormula")
                      : t("student.chooseFormula")}
                </button>
              ) : null}
            </article>
          );
        })}
      </div>
      {selectable ? (
        <p className="student-formule-note">{t("student.paySoon")}</p>
      ) : null}
    </div>
  );
}
