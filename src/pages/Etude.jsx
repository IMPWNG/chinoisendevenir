import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import Nav from "../components/Nav.jsx";
import LeadForm from "../components/LeadForm.jsx";
import Popup from "../components/Popup.jsx";

const MODULES = [
  {
    num: "01",
    tag: "Module 1",
    title: "Comprendre comment fonctionnent vraiment les admissions",
    points: [
      "Pourquoi la Chine attire les étudiants internationaux",
      "Comment les universités sélectionnent",
      "Ce qu'elles regardent en priorité",
      "Les idées reçues les plus fréquentes",
    ],
    obj: "Comprendre les règles du jeu avant de postuler.",
  },
  {
    num: "02",
    tag: "Module 2",
    title: "Ce qui fait vraiment la différence dans un dossier",
    points: [
      "Les critères visibles… et ceux qu'on oublie",
      "Comment adapter ton profil",
      "Ce que les universités attendent vraiment",
      "Les détails qui changent tout",
    ],
    obj: "Mettre toutes les chances de ton côté.",
  },
  {
    num: "03",
    tag: "Module 3",
    title: "Les erreurs qui peuvent retarder ton départ",
    points: [
      "Les pièges les plus fréquents",
      "Les mauvais timings",
      "Les oublis qui bloquent un dossier",
      "Comment les éviter facilement",
    ],
    obj: "Éviter de perdre une année inutilement.",
  },
  {
    num: "04",
    tag: "Module 4",
    title: "Le vrai calendrier 2026/2027",
    points: [
      "Quand commencer les démarches",
      "Pourquoi il faut anticiper",
      "Les délais réels à prévoir",
      "Comment garder de l'avance",
    ],
    obj: "Ne jamais être en retard.",
  },
  {
    num: "05",
    tag: "Module 5",
    title: "Construire un dossier solide et convaincant",
    points: [
      "Comment ton dossier est lu",
      "Les erreurs classiques",
      "Ce qui renforce ta crédibilité",
      "Comment rester cohérent",
    ],
    obj: "Présenter un dossier clair, complet et sérieux.",
  },
  {
    num: "06",
    tag: "Module 6",
    title: "Visa & démarches administratives",
    points: [
      "Les étapes importantes",
      "Les documents nécessaires",
      "Les délais à prévoir",
      "Les erreurs à éviter",
    ],
    obj: "Partir sans stress administratif.",
  },
  {
    num: "07",
    tag: "Module 7",
    title: "Financement & bourses",
    points: [
      "Comment fonctionnent les bourses",
      "Les critères importants",
      "Comment maximiser tes chances",
      "Choisir la bonne option pour ton profil",
    ],
    obj: "Réduire le coût de ton projet.",
  },
  {
    num: "08",
    tag: "Module 8",
    title: "Préparer ton avenir après l'admission",
    points: [
      "Bien choisir ton université",
      "Penser à ton futur professionnel",
      "Valoriser ton expérience en Chine",
      "Construire un profil international",
    ],
    obj: "Faire de cette expérience un vrai tremplin.",
  },
];

const ETUDES = [];

export default function Etude() {
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
  }, []);

  return (
    <>
      <Nav />

      {/* HERO */}
      <section className="hero">
        <div className="hero-badge">Chinois en Devenir — Guide 2026/2027</div>
        <div className="hero-flag">🇨🇳</div>
        <h1
          className="hero-title"
          style={{ fontSize: "clamp(32px, 5vw, 64px)", letterSpacing: "-1px" }}
        >
          En 2026/2027, les candidatures
          <br />
          <span>ferment avant que tu commences.</span>
        </h1>
        <p className="hero-sub">
          Les universités ferment leurs candidatures 6 à 9 mois avant la
          rentrée.
          <br />
          Si tu attends → tu repousses ton projet d'un an.
          <br />
          Si tu te prépares → tu prends de l'avance.
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
          {[
            "✓ Guide complet étape par étape",
            "✓ 8 épisodes vidéo",
            "✓ Modèles de candidature prêts à utiliser",
            "✓ Feuille de route claire pour partir",
          ].map((t) => (
            <span
              key={t}
              style={{
                border: "1px solid rgba(212,168,83,0.3)",
                color: "rgba(245,240,232,0.6)",
                fontSize: "11px",
                letterSpacing: "1.5px",
                padding: "6px 14px",
              }}
            >
              {t}
            </span>
          ))}
        </div>
        <a
          href="https://chinoisendevenir.gumroad.com/l/etude-chine-2026-2027"
          className="hero-cta"
          target="_blank"
          rel="noreferrer"
        >
          Je prépare mon départ →
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
          Lecture immédiate &nbsp;·&nbsp; Accès privé &nbsp;·&nbsp; Mise à jour
          2026/2027 incluse
        </p>
      </section>

      {/* STATS */}
      <div className="stats">
        {[
          { num: "6–9 mois", label: "Avant la fermeture des candidatures" },
          { num: "8", label: "Modules clairs & concrets" },
          {
            num: "Structure",
            label: "Un bon dossier multiplie fortement tes chances.",
          },
          { num: "29€", label: "Accès complet au guide" },
        ].map((s) => (
          <div className="stat-item" key={s.num}>
            <div className="stat-num">{s.num}</div>
            <div className="stat-label">{s.label}</div>
          </div>
        ))}
      </div>

      {/* LEAD FORM TOP */}
      <section className="lead-section" id="lead-top">
        <div className="lead-inner">
          <div className="section-label">Départ Chine 2026/2027</div>
          <h2>
            Prépare ton dossier dès maintenant pour{" "}
            <em style={{ fontStyle: "normal", color: "var(--gold)" }}>
              2026/2027
            </em>
            .
          </h2>
          <p>
            Les universités ferment leurs candidatures des mois à l'avance.
            <br />
            Si tu veux partir sereinement et éviter les erreurs, reste informé
            des dates clés et des mises à jour officielles.
          </p>
          <LeadForm prefix="top" />
        </div>
      </section>

      {/* INTRO */}
      <section className="intro">
        <div className="section-label">Ce qu'il faut comprendre</div>
        <h2>
          Pourquoi beaucoup d'étudiants passent à côté{" "}
          <em style={{ fontStyle: "normal", color: "var(--gold)" }}>
            avant même d'envoyer leur dossier
          </em>
        </h2>
        <p>
          Étudier en Chine ne se décide pas au dernier moment.
          <br />
          Les candidatures ouvrent tôt… et ferment vite.
        </p>
        <p>
          En 2026/2027, les universités sélectionnent plus rapidement et
          demandent des dossiers complets dès le départ.
          <br />
          La différence ne se joue pas sur la motivation.
          <br />
          Elle se joue sur l'anticipation.
        </p>
        <p>
          Un retard dans les dates = candidature reportée.
          <br />
          Un document manquant = dossier mis en attente.
          <br />
          Un manque de préparation = une année repoussée.
        </p>
        <p
          style={{
            color: "var(--muted)",
            fontSize: "14px",
            marginTop: "32px",
            borderTop: "1px solid var(--border)",
            paddingTop: "32px",
          }}
        >
          Ce guide est là pour t'éviter ces erreurs et te faire gagner du temps.
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
              Ce guide est fait pour toi si :
            </div>
            <ul style={{ listStyle: "none" }}>
              {[
                "Tu veux candidater en 2026/2027 avec un plan clair",
                "Tu refuses de perdre un an par manque d'information",
                "Tu veux comprendre le système avant d'entrer dedans",
                "Tu veux structurer ton dossier comme un profil stratégique",
              ].map((item) => (
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
              Pas pour toi si :
            </div>
            <ul style={{ listStyle: "none" }}>
              {[
                'Tu veux "voir comment ça se passe"',
                "Tu préfères improviser",
                "Tu n'es pas prêt à t'organiser sérieusement",
              ].map((item) => (
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

      {/* EPISODES */}
      <section className="episodes" id="episodes">
        <div className="episodes-header">
          <div className="section-label">Programme complet — 8 modules</div>
          <h2>Ce que tu vas apprendre concrètement</h2>
        </div>
        <div className="ep-grid">
          {MODULES.map((m, i) => (
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
                <strong>Objectif :</strong> {m.obj}
              </div>
              <a
                href="#"
                className="ep-link"
                onClick={(e) => {
                  e.preventDefault();
                  setPopupEp(i + 1);
                }}
              >
                ▶ Voir le module
              </a>
            </div>
          ))}
        </div>
      </section>

      {/* CE QUE TU REÇOIS */}
      <section className="plan">
        <div className="plan-inner">
          <div className="section-label" style={{ textAlign: "center" }}>
            Programme 2026/2027
          </div>
          <h2>Ce que tu obtiens concrètement</h2>
          <div className="weeks">
            {[
              {
                icon: "📘",
                title: "Guide clair et structuré",
                items: [
                  "Explications étape par étape",
                  "Informations organisées simplement",
                  "Consultable à ton rythme",
                  "Un échange individuel pour analyser ton profil et t'orienter efficacement",
                ],
              },
              {
                icon: "🎬",
                title: "Vidéos explicatives",
                items: [
                  "Explications concrètes et accessibles",
                  "Conseils pour mieux comprendre les attentes",
                  "Points clés souvent mal expliqués ailleurs",
                ],
              },
              {
                icon: "📝",
                title: "Conseils pour ton dossier",
                items: [
                  "Comment structurer ta candidature",
                  "Les erreurs fréquentes à éviter",
                  "Comment rendre ton profil plus cohérent",
                ],
              },
              {
                icon: "🗓",
                title: "Calendrier 2026/2027",
                items: [
                  "Dates importantes regroupées",
                  "Délais à anticiper",
                  "Vision claire des étapes à suivre",
                ],
              },
            ].map((w) => (
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

      {/* ANCRAGE PRIX */}
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
          <div className="section-label">Mise en perspective</div>
          <h2
            style={{
              fontFamily: '"Playfair Display", serif',
              fontSize: "clamp(28px, 4vw, 44px)",
              fontWeight: 900,
              marginBottom: "40px",
              lineHeight: 1.2,
            }}
          >
            Une année perdue coûte :
          </h2>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(4, 1fr)",
              gap: "2px",
              marginBottom: "48px",
            }}
          >
            {[
              { n: "12", l: "Mois" },
              { n: "1", l: "Rentrée" },
              { n: "1", l: "Opportunité" },
              { n: "1", l: "Bourse" },
            ].map((item) => (
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
            Ce guide coûte{" "}
            <strong style={{ color: "var(--light)" }}>
              moins qu'un mois d'abonnement Netflix.
            </strong>
          </p>
          <p
            style={{
              fontFamily: '"Playfair Display", serif',
              fontSize: "clamp(36px, 5vw, 56px)",
              fontWeight: 900,
              color: "var(--gold)",
              marginTop: "32px",
            }}
          >
            29€
          </p>
          <p
            style={{
              fontSize: "12px",
              color: "var(--muted)",
              marginTop: "8px",
              letterSpacing: "1px",
            }}
          >
            Accès complet au guide · Mises à jour incluses
          </p>
        </div>
      </section>

      {/* LEAD FORM BOTTOM */}
      <section className="lead-section" id="lead-bottom">
        <div className="lead-inner">
          <div className="section-label">Départ Chine 2026/2027</div>
          <h2>
            Prépare dès maintenant{" "}
            <em style={{ fontStyle: "normal", color: "var(--gold)" }}>
              2026/2027
            </em>
            .
          </h2>
          <p>
            Les candidatures ferment des mois à l'avance.
            <br />
            Inscris-toi pour recevoir les dates importantes, les mises à jour
            officielles et les rappels utiles pour ne rien rater.
          </p>
          <LeadForm prefix="bottom" />
        </div>
      </section>

      {/* FINAL CTA */}
      <section className="final-cta">
        <h2>
          La question n'est pas :<br />
          <em>« Est-ce possible ? »</em>
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
          La question est :
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
          « Est-ce que tu t'organises à temps ? »
        </p>
        <div className="cta-group">
          <a
            href="https://chinoisendevenir.gumroad.com/l/etude-chine-2026-2027"
            className="btn-primary"
            target="_blank"
            rel="noreferrer"
          >
            Accéder au guide complet — 29€ →
          </a>
          <a href="#episodes" className="btn-secondary">
            Voir les 8 modules
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
          Accès immédiat &nbsp;·&nbsp; Paiement sécurisé &nbsp;·&nbsp; Mise à
          jour 2026/2027 incluse
        </p>
      </section>
      <section
        style={{
          padding: "40px 24px",
          textAlign: "center",
          borderTop: "1px solid var(--border)",
        }}
      >
        <Link
          to="/etudier/guide-etudier-en-chine"
          style={{
            color: "var(--gold)",
            fontSize: "13px",
            textDecoration: "none",
            letterSpacing: "1px",
            borderBottom: "1px solid rgba(212,168,83,0.3)",
            paddingBottom: "2px",
          }}
        >
          📖 Lire le guide complet : Étudier en Chine, comprendre et réussir ton
          projet →
        </Link>
      </section>

      <footer>
        <p>
          ÉTUDE – CHINE – 2026/2027 &nbsp;|&nbsp; Guide Complet <span>▲</span>{" "}
          &nbsp;|&nbsp; Chinois en devenir - Tous droits réservés
        </p>
      </footer>

      {popupEp && <Popup epNum={popupEp} onClose={() => setPopupEp(null)} />}
    </>
  );
}
