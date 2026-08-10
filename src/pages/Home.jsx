import { useEffect, useRef, useState } from "react";
import Nav from "../components/Nav.jsx";
import LeadForm from "../components/LeadForm.jsx";
import Popup from "../components/Popup.jsx";
import { useLanguage } from "../context/LanguageContext.jsx";
import translations from "../translations.js";

export default function Home() {
  const { lang } = useLanguage();
  const t = translations[lang];
  const SERVICES = t.services;

  const [popupEp, setPopupEp] = useState(null);
  const observerRef = useRef(null);

  useEffect(() => {
    observerRef.current = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry, index) => {
          if (entry.isIntersecting) {
            setTimeout(() => {
              entry.target.classList.add("visible");
            }, index * 80);
          }
        });
      },
      { threshold: 0.1 },
    );

    document.querySelectorAll(".ep-card, .stat-item").forEach((element) => {
      observerRef.current.observe(element);
    });

    return () => observerRef.current?.disconnect();
  }, [lang]);

  return (
    <>
      <Nav />

      {/* HERO */}
      <section className="hero">
        <div className="hero-badge">{t.hero_badge}</div>

        <div className="hero-flag">🇨🇳</div>

        <h1
          className="hero-title"
          style={{
            fontSize: "clamp(32px, 5vw, 64px)",
            letterSpacing: "-1px",
          }}
        >
          {t.hero_title_1}
          <br />
          <span>{t.hero_title_2}</span>
        </h1>

        <p className="hero-sub">{t.hero_sub}</p>

        <div className="hero-tags">
          {t.hero_tags.map((tag) => (
            <span className="hero-tag" key={tag}>
              {tag}
            </span>
          ))}
        </div>

        <a href="#etudier-en-chine" className="hero-cta">
          {t.hero_cta}
        </a>

        <p className="hero-footer">{t.hero_footer}</p>
      </section>

      {/* STATS */}
      <section className="stats">
        {t.stats.map((stat) => (
          <div className="stat-item" key={`${stat.num}-${stat.label}`}>
            <div className="stat-num">{stat.num}</div>
            <div className="stat-label">{stat.label}</div>
          </div>
        ))}
      </section>

      {/* FORMULAIRE TOP */}
      <section className="lead-section" id="etudier-en-chine">
        <div className="lead-inner">
          <div className="section-label">{t.lead_top_label}</div>

          <h2>
            {t.lead_top_title}{" "}
            <em style={{ fontStyle: "normal", color: "var(--gold)" }}>
              {t.lead_top_title_em}
            </em>
            .
          </h2>

          <p>{t.lead_top_text}</p>

          <LeadForm prefix="top" />
        </div>
      </section>

      {/* INTRO */}
      <section className="intro">
        <div className="section-label">{t.intro_label}</div>

        <h2>
          {t.intro_title}{" "}
          <em style={{ fontStyle: "normal", color: "var(--gold)" }}>
            {t.intro_title_em}
          </em>
        </h2>

        <p>{t.intro_p1}</p>
        <p>{t.intro_p2}</p>
        <p>{t.intro_p3}</p>

        <p className="intro-note">{t.intro_p4}</p>
      </section>

      {/* POUR QUI / PAS POUR QUI */}
      <section className="fit-section">
        <div className="fit-notfit-grid">
          <div className="fit-card">
            <div className="section-label fit-title">{t.fit_title}</div>

            <ul className="fit-list">
              {t.fit_items.map((item) => (
                <li key={item}>
                  <span className="fit-icon">✓</span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="notfit-card">
            <div className="notfit-title">{t.notfit_title}</div>

            <ul className="fit-list notfit-list">
              {t.notfit_items.map((item) => (
                <li key={item}>
                  <span className="notfit-icon">✗</span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* SERVICES */}
      <section className="episodes" id="episodes">
        <div className="episodes-header">
          <div className="section-label">{t.services_label}</div>
          <h2>{t.services_title}</h2>
        </div>

        <div className="ep-grid">
          {SERVICES.map((service) => (
            <div className="ep-card" key={service.num}>
              <div className="ep-num">{service.num}</div>
              <div className="ep-tag">{service.tag}</div>
              <div className="ep-title">{service.title}</div>

              <ul className="ep-points">
                {service.points.map((point) => (
                  <li key={point}>{point}</li>
                ))}
              </ul>

              <div className="ep-box">
                <strong>{t.services_obj}</strong> {service.obj}
              </div>

              <a
                href="#lead-bottom"
                className="ep-link"
                onClick={(event) => {
                  event.preventDefault();

                  document
                    .getElementById("lead-bottom")
                    ?.scrollIntoView({ behavior: "smooth" });
                }}
              >
                {t.services_more}
              </a>
            </div>
          ))}
        </div>
      </section>

      {/* COMMENT ÇA SE PASSE */}
      <section className="plan">
        <div className="plan-inner">
          <div className="section-label plan-label">{t.plan_label}</div>

          <h2>{t.plan_title}</h2>

          <div className="weeks">
            {t.plan_steps.map((step) => (
              <div className="week" key={step.title}>
                <div className="week-icon">{step.icon}</div>
                <div className="week-title">{step.title}</div>

                <ul className="week-items">
                  {step.items.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* POURQUOI ANTICIPER */}
      <section className="anticiper-section">
        <div className="anticiper-inner">
          <div className="section-label">{t.anticiper_label}</div>

          <h2>{t.anticiper_title}</h2>

          <div className="anticiper-stats">
            {t.anticiper_stats.map((item) => (
              <div className="anticiper-stat" key={item.l}>
                <div className="anticiper-number">{item.n}</div>
                <div className="anticiper-label">{item.l}</div>
              </div>
            ))}
          </div>

          <p>{t.anticiper_text}</p>
        </div>
      </section>

      {/* FORMULAIRE BOTTOM */}
      <section className="lead-section" id="lead-bottom">
        <div className="lead-inner">
          <div className="section-label">{t.lead_bottom_label}</div>

          <h2>
            {t.lead_bottom_title}{" "}
            <em style={{ fontStyle: "normal", color: "var(--gold)" }}>
              {t.lead_bottom_title_em}
            </em>
            .
          </h2>

          <p>{t.lead_bottom_text}</p>

          <LeadForm prefix="bottom" />
        </div>
      </section>

      {/* CTA FINAL */}
      <section className="final-cta">
        <h2>
          {t.final_title_1}
          <br />
          <em>{t.final_title_2}</em>
        </h2>

        <p className="final-subtitle">{t.final_sub1}</p>
        <p className="final-highlight">{t.final_sub2}</p>

        <div className="cta-group">
          <a href="#etudier-en-chine" className="btn-primary">
            {t.final_cta1}
          </a>

          <a href="#episodes" className="btn-secondary">
            {t.final_cta2}
          </a>
        </div>

        <p className="final-footer">{t.final_footer}</p>
      </section>

      <footer>
        <p>{t.footer_text}</p>
      </footer>

      {popupEp && <Popup epNum={popupEp} onClose={() => setPopupEp(null)} />}
    </>
  );
}
