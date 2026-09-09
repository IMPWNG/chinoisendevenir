"use client";

import { displayFormuleLabel, getFormuleByNumber } from "../lib/formules";
import { useSiteI18n } from "../context/SiteI18nContext";

export default function StudentFormuleBanner({
  formule = "",
  formuleNumber = null,
}) {
  const { t, dict } = useSiteI18n();
  const details = getFormuleByNumber(formuleNumber);
  if (!formule && !details) return null;

  const number = details?.number || formuleNumber;
  const localized = details ? dict.formules[details.number] : null;
  const title = localized?.title || details?.title || displayFormuleLabel(formule);
  const price = details?.price || "";

  return (
    <div className="student-formule-banner student-card-wide">
      <span className="student-formule-banner-number">
        {number ? t("student.formulaN", { n: number }) : t("student.formula")}
      </span>
      <div>
        <p className="student-formule-banner-kicker">{t("student.yourSupport")}</p>
        <p className="student-formule-banner-title">{title}</p>
        {price ? (
          <p className="student-formule-banner-price">{price}</p>
        ) : null}
      </div>
    </div>
  );
}
