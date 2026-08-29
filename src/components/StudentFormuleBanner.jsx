"use client";

import { displayFormuleLabel, getFormuleByNumber } from "../lib/formules";

export default function StudentFormuleBanner({
  formule = "",
  formuleNumber = null,
}) {
  const details = getFormuleByNumber(formuleNumber);
  if (!formule && !details) return null;

  const number = details?.number || formuleNumber;
  const title = details?.title || displayFormuleLabel(formule);
  const price = details?.price || "";

  return (
    <div className="student-formule-banner student-card-wide">
      <span className="student-formule-banner-number">
        {number ? `Formule ${number}` : "Formule"}
      </span>
      <div>
        <p className="student-formule-banner-kicker">Votre accompagnement</p>
        <p className="student-formule-banner-title">{title}</p>
        {price ? (
          <p className="student-formule-banner-price">{price}</p>
        ) : null}
      </div>
    </div>
  );
}
