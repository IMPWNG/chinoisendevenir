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
        entries.forEach((e, i) => {
          if (e.isIntersecting) {
            setTimeout(() => e.target.classList.add("visible"), i * 80);
          }
        });
      },
      { threshold: 0.1 },
    );
    document.querySelectorAll(".ep-card, .stat-item").forEach((el) => {
      observerRef.current.observe(el);
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
          style={{ fontSize: "clamp(32px, 5vw, 64px)", letterSpacing: "-1px" }}
        >
          {t.hero_title_1}
          <br />
          <span>{t.hero_title_2}</span>
        </h1>
        <p className="hero-sub" style={{ whiteSpace: "pre-line" }}>
          {t.hero_sub}
        </p>
        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            gap: "12px",
            justifyContent: "center",
            marginBottom: "40px",
            animation: "fadeUp 0.9s 0.3s ease both",
            position: "relative",
          }}
        >
          {t.hero_tags.map((tag) => (
            <span
              key={tag}
              style={{
                border: "1px solid rgba(212,168,83,0.3)",
                color: "rgba(245,240,232,0.6)",
                fontSize: "11px",
                letterSpacing: "1.5px",
                padding: "6px 14px",
              }}
            >
              {tag}
            </span>
          ))}
        </div>
        <a href="#etudier-en-chine" className="hero-cta">
          {t.hero_cta}
        </a>
        <p
          style={{
            marginTop: "14px",
            fontSize: "11px",
            color: "rgba(255,255,255,0.25)",
            letterSpacing: "1px",
            animation: "fadeUp 0.9s 0.5s ease both",
            position: "relative",
          }}
        >
          {t.hero_footer}
        </p>
      </section>

      {/* STATS */}
      <div className="stats">
        {t.stats.map((s) => (
          <div className="stat-item" key={s.num}>
            <div className="stat-num">{s.num}</div>
            <div className="stat-label">{s.label}</div>
          </div>
        ))}
      </div>

      {/* LEAD FORM TOP */}
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
        <p
          style={{
            color: "var(--muted)",
            fontSize: "14px",
            marginTop: "32px",
            borderTop: "1px solid var(--border)",
            paddingTop: "32px",
          }}
        >
          {t.intro_p4}
        </p>
      </section>

      {/* POUR QUI / PAS POUR QUI */}
      <section
        style={{ padding: "0 24px 100px", maxWidth: "900px", margin: "0 auto" }}
      >
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: "2px",
          }}
        >
          <div style={{ background: "var(--dark2)", padding: "40px" }}>
            <div className="section-label" style={{ marginBottom: "24px" }}>
              {t.fit_title}
            </div>
            <ul style={{ listStyle: "none" }}>
              {t.fit_items.map((item) => (
                <li
                  key={item}
                  style={{
                    fontSize: "14px",
                    color: "rgba(245,240,232,0.8)",
                    padding: "10px 0",
                    borderBottom: "1px solid rgba(255,255,255,0.05)",
                    paddingLeft: "24px",
                    position: "relative",
                  }}
                >
                  <span
                    style={{
                      position: "absolute",
                      left: 0,
                      color: "var(--gold)",
                      fontWeight: 700,
                    }}
                  >
                    ✓
                  </span>
                  {item}
                </li>
              ))}
            </ul>
          </div>
          <div
            style={{
              background: "var(--dark3)",
              padding: "40px",
              borderLeft: "1px solid rgba(255,255,255,0.04)",
            }}
          >
            <div
              style={{
                fontSize: "11px",
                fontWeight: 600,
                letterSpacing: "3px",
                textTransform: "uppercase",
                color: "var(--muted)",
                marginBottom: "24px",
              }}
            >
              {t.notfit_title}
            </div>
            <ul style={{ listStyle: "none" }}>
              {t.notfit_items.map((item) => (
                <li
                  key={item}
                  style={{
                    fontSize: "14px",
                    color: "rgba(245,240,232,0.35)",
                    padding: "10px 0",
                    borderBottom: "1px solid rgba(255,255,255,0.04)",
                    paddingLeft: "24px",
                    position: "relative",
                  }}
                >
                  <span
                    style={{
                      position: "absolute",
                      left: 0,
                      color: "rgba(255,107,107,0.5)",
                    }}
                  >
                    ✗
                  </span>
                  {item}
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
          {SERVICES.map((m) => (
            <div className="ep-card" key={m.num}>
              <div className="ep-num">{m.num}</div>
              <div className="ep-tag">{m.tag}</div>
              <div className="ep-title">{m.title}</div>
              <ul className="ep-points">
                {m.points.map((p) => (
                  <li key={p}>{p}</li>
                ))}
              </ul>
              <div className="ep-box">
                <strong>{t.services_obj}</strong> {m.obj}
              </div>
              <a
                href="#lead-bottom"
                className="ep-link"
                onClick={(e) => {
                  e.preventDefault();
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
          <div className="section-label" style={{ textAlign: "center" }}>
            {t.plan_label}
          </div>
          <h2>{t.plan_title}</h2>
          <div className="weeks">
            {t.plan_steps.map((w) => (
              <div className="week" key={w.title}>
                <div style={{ fontSize: "28px", marginBottom: "12px" }}>
                  {w.icon}
                </div>
                <div className="week-title">{w.title}</div>
                <ul className="week-items">
                  {w.items.map((it) => (
                    <li key={it}>{it}</li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* POURQUOI ANTICIPER */}
      <section
        style={{
          padding: "80px 24px",
          background: "var(--dark)",
          borderTop: "1px solid var(--border)",
          borderBottom: "1px solid var(--border)",
        }}
      >
        <div
          style={{ maxWidth: "680px", margin: "0 auto", textAlign: "center" }}
        >
          <div className="section-label">{t.anticiper_label}</div>
          <h2
            style={{
              fontFamily: '"Playfair Display", serif',
              fontSize: "clamp(28px, 4vw, 44px)",
              fontWeight: 900,
              marginBottom: "40px",
              lineHeight: 1.2,
            }}
          >
            {t.anticiper_title}
          </h2>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(4, 1fr)",
              gap: "2px",
              marginBottom: "48px",
            }}
          >
            {t.anticiper_stats.map((item) => (
              <div
                key={item.l}
                style={{
                  background: "var(--dark2)",
                  padding: "28px 16px",
                  textAlign: "center",
                  border: "1px solid rgba(200,16,46,0.15)",
                }}
              >
                <div
                  style={{
                    fontFamily: '"Playfair Display", serif',
                    fontSize: "32px",
                    fontWeight: 900,
                    color: "var(--red)",
                    marginBottom: "8px",
                  }}
                >
                  {item.n}
                </div>
                <div
                  style={{
                    fontSize: "11px",
                    letterSpacing: "2px",
                    textTransform: "uppercase",
                    color: "var(--muted)",
                  }}
                >
                  {item.l}
                </div>
              </div>
            ))}
          </div>
          <p
            style={{
              fontSize: "16px",
              color: "rgba(245,240,232,0.6)",
              lineHeight: 1.7,
            }}
          >
            {t.anticiper_text}
          </p>
        </div>
      </section>

      {/* LEAD FORM BOTTOM */}
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

      {/* FINAL CTA */}
      <section className="final-cta">
        <h2>
          {t.final_title_1}
          <br />
          <em>{t.final_title_2}</em>
        </h2>
        <p
          style={{
            fontSize: "17px",
            color: "rgba(245,240,232,0.5)",
            marginBottom: "12px",
            maxWidth: "520px",
            margin: "0 auto 12px",
            position: "relative",
          }}
        >
          {t.final_sub1}
        </p>
        <p
          style={{
            fontFamily: '"Playfair Display", serif',
            fontSize: "clamp(18px, 3vw, 26px)",
            fontWeight: 700,
            color: "var(--light)",
            marginBottom: "48px",
            maxWidth: "520px",
            margin: "0 auto 48px",
            position: "relative",
          }}
        >
          {t.final_sub2}
        </p>
        <div className="cta-group">
          <a href="#etudier-en-chine" className="btn-primary">
            {t.final_cta1}
          </a>
          <a href="#episodes" className="btn-secondary">
            {t.final_cta2}
          </a>
        </div>
        <p
          style={{
            marginTop: "20px",
            fontSize: "11px",
            color: "rgba(255,255,255,0.2)",
            letterSpacing: "1px",
            position: "relative",
          }}
        >
          {t.final_footer}
        </p>
      </section>

      <footer>
        <p>{t.footer_text}</p>
      </footer>

      {popupEp && <Popup epNum={popupEp} onClose={() => setPopupEp(null)} />}
    </>
  );
}
