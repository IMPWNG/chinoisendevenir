"use client";

import { useSiteI18n } from "../context/SiteI18nContext";

const Stats = () => {
  const { t } = useSiteI18n();
  const stats = [
    { value: "250+", label: t("stats.students") },
    { value: "20+", label: t("stats.universities") },
    { value: "95%", label: t("stats.dossiers") },
    { value: "2+", label: t("stats.years") },
  ];

  return (
    <section className="landing-stats">
      <div className="landing-stats-grid">
        {stats.map((s) => (
          <div key={s.label}>
            <div className="landing-stat-value">{s.value}</div>
            <div className="landing-stat-label">{s.label}</div>
          </div>
        ))}
      </div>
    </section>
  );
};

export default Stats;
