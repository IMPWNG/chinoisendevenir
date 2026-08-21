"use client";

const Hero = ({ t }) => {
  const scrollToForm = () => {
    document
      .getElementById("lead-form")
      ?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <section id="home" className="landing-hero">
      <div className="container">
        <span className="landing-hero-badge">{t.hero_badge}</span>
        <h1 className="landing-hero-title">{t.hero_title}</h1>
        <p className="landing-hero-subtitle">{t.hero_subtitle}</p>
        <div className="landing-hero-actions">
          <button
            className="landing-btn landing-btn-primary"
            onClick={scrollToForm}
          >
            {t.hero_cta_primary}
          </button>
          <a href="#programs" className="landing-btn landing-btn-secondary">
            {t.hero_cta_secondary}
          </a>
        </div>
      </div>
    </section>
  );
};

export default Hero;
