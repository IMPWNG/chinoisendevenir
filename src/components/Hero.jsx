"use client";

import { useSiteI18n } from "../context/SiteI18nContext";

const Hero = () => {
  const { t } = useSiteI18n();

  const scrollToForm = () => {
    document
      .getElementById("lead-form")
      ?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <section id="home" className="landing-hero">
      <div className="container">
        <span className="landing-hero-badge">{t("hero.badge")}</span>
        <h1 className="landing-hero-title">{t("hero.title")}</h1>
        <p className="landing-hero-subtitle">{t("hero.subtitle")}</p>
        <div className="landing-hero-actions">
          <button
            className="landing-btn landing-btn-primary"
            onClick={scrollToForm}
          >
            {t("hero.ctaPrimary")}
          </button>
          <a href="/tarifs" className="landing-btn landing-btn-secondary">
            {t("hero.ctaSecondary")}
          </a>
        </div>
      </div>
    </section>
  );
};

export default Hero;
