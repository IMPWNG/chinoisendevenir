import { useEffect, useRef, useState } from "react";
import Nav from "../components/Nav.jsx";
import LeadForm from "../components/LeadForm.jsx";
import Popup from "../components/Popup.jsx";

const SERVICES = [
  {
    num: "01",
    tag: "Orientation",
    title: "Trouver l'université et le programme adaptés à ton profil",
    points: [
      "Analyse de ton parcours et de tes objectifs",
      "Sélection des universités qui correspondent à ton profil",
      "Comparatif des programmes et des villes",
      "Conseils sur les langues d'enseignement (anglais / chinois)",
    ],
    obj: "Faire le bon choix dès le départ.",
  },
  {
    num: "02",
    tag: "Dossier de candidature",
    title: "Construire un dossier complet et solide",
    points: [
      "Liste précise des documents nécessaires",
      "Aide à la rédaction de la lettre de motivation",
      "Vérification et mise en forme du dossier",
      "Conseils pour éviter les erreurs qui font perdre du temps",
    ],
    obj: "Présenter un dossier crédible et complet.",
  },
  {
    num: "03",
    tag: "Bourses & financement",
    title: "Explorer les options de financement disponibles",
    points: [
      "Panorama des bourses accessibles (CSC, Confucius, universitaires…)",
      "Critères d'éligibilité expliqués simplement",
      "Conseils pour renforcer un dossier de bourse",
      "Alternatives si la bourse n'est pas obtenue",
    ],
    obj: "Réduire le coût réel de ton projet d'études.",
  },
  {
    num: "04",
    tag: "Visa & démarches",
    title: "Comprendre les démarches administratives",
    points: [
      "Étapes du visa étudiant (type X1 / X2)",
      "Documents à préparer en amont",
      "Délais réalistes à anticiper",
      "Points de vigilance fréquents",
    ],
    obj: "Aborder les démarches sans stress.",
  },
  {
    num: "05",
    tag: "Calendrier",
    title: "Connaître les dates clés de candidature",
    points: [
      "Périodes d'ouverture et de fermeture des candidatures",
      "Différences selon les universités et les programmes",
      "Rappels pour ne rien manquer",
      "Anticipation des délais administratifs",
    ],
    obj: "Ne jamais candidater dans l'urgence.",
  },
  {
    num: "06",
    tag: "Vie sur place",
    title: "Préparer ton installation en Chine",
    points: [
      "Logement étudiant : options et démarches",
      "Coût de la vie selon les villes",
      "Premiers repères une fois sur place",
      "Réseau d'étudiants et de contacts utiles",
    ],
    obj: "Arriver préparé, pas seulement admis.",
  },
];

export default function Home() {
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
        <div className="hero-badge">Chinois en Devenir — Étudier en Chine</div>
        <div className="hero-flag">🇨🇳</div>
        <h1
          className="hero-title"
          style={{ fontSize: "clamp(32px, 5vw, 64px)", letterSpacing: "-1px" }}
        >
          Étudier en Chine,
          <br />
          <span>ça se prépare bien avant la candidature.</span>
        </h1>
        <p className="hero-sub">
          Universités, bourses, visa, calendrier, vie sur place…
          <br />
          On t'accompagne à chaque étape pour que ton projet
          <br />
          se construise sereinement, sans mauvaise surprise.
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
            "✓ Informations à jour",
            "✓ Accompagnement personnalisé",
            "✓ Réponses claires à tes questions",
            "✓ Suivi jusqu'à ton départ",
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
        <a href="#lead-top" className="hero-cta">
          Être accompagné dans mon projet →
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
          Réponse rapide &nbsp;·&nbsp; Sans engagement &nbsp;·&nbsp;
          Informations vérifiées
        </p>
      </section>

      {/* STATS */}
      <div className="stats">
        {[
          {
            num: "6–9 mois",
            label: "Délai moyen à anticiper avant une rentrée",
          },
          { num: "6", label: "Domaines d'accompagnement" },
          { num: "100%", label: "Informations vérifiées et actualisées" },
          { num: "1", label: "Interlocuteur pour tout ton projet" },
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
          <div className="section-label">Ton projet d'études en Chine</div>
          <h2>
            Reçois des informations claires sur{" "}
            <em style={{ fontStyle: "normal", color: "var(--gold)" }}>
              les études en Chine
            </em>
            .
          </h2>
          <p>
            Universités, bourses, visa, dates de candidature…
            <br />
            Laisse-nous tes coordonnées pour recevoir des informations
            personnalisées et être accompagné dans ton projet.
          </p>
          <LeadForm prefix="top" />
        </div>
      </section>

      {/* INTRO */}
      <section className="intro">
        <div className="section-label">Pourquoi se faire accompagner</div>
        <h2>
          Étudier en Chine est une vraie opportunité,{" "}
          <em style={{ fontStyle: "normal", color: "var(--gold)" }}>
            à condition d'être bien informé
          </em>
        </h2>
        <p>
          Chaque année, de nombreux étudiants s'intéressent aux études en Chine
          sans savoir par où commencer.
        </p>
        <p>
          Entre le choix de l'université, les démarches de bourse, la
          constitution du dossier et les formalités de visa, il est facile de
          perdre du temps ou de rater une échéance importante.
        </p>
        <p>
          Notre rôle est simple : t'apporter des informations fiables et un
          accompagnement concret, pour que ton projet avance sans stress
          inutile.
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
          Que tu sois au tout début de ta réflexion ou prêt à candidater, on
          t'aide à voir clair.
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
              Cet accompagnement est fait pour toi si :
            </div>
            <ul style={{ listStyle: "none" }}>
              {[
                "Tu envisages sérieusement d'étudier en Chine",
                "Tu veux des réponses claires à tes questions",
                "Tu ne sais pas par où commencer et cherches un accompagnement",
                "Tu veux gagner du temps sur tes recherches",
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
              Pas adapté si :
            </div>
            <ul style={{ listStyle: "none" }}>
              {[
                "Tu cherches juste des informations générales sans projet concret",
                "Tu n'as pas encore réfléchi à tes objectifs d'études",
                "Tu ne souhaites pas être accompagné dans les démarches",
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

      {/* SERVICES */}
      <section className="episodes" id="episodes">
        <div className="episodes-header">
          <div className="section-label">Nos domaines d'accompagnement</div>
          <h2>Ce qu'on t'aide à comprendre et à préparer</h2>
        </div>
        <div className="ep-grid">
          {SERVICES.map((m, i) => (
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
                href="#lead-bottom"
                className="ep-link"
                onClick={(e) => {
                  e.preventDefault();
                  document
                    .getElementById("lead-bottom")
                    ?.scrollIntoView({ behavior: "smooth" });
                }}
              >
                ▶ En savoir plus
              </a>
            </div>
          ))}
        </div>
      </section>

      {/* COMMENT ÇA SE PASSE */}
      <section className="plan">
        <div className="plan-inner">
          <div className="section-label" style={{ textAlign: "center" }}>
            Comment ça fonctionne
          </div>
          <h2>Un accompagnement simple, en 4 étapes</h2>
          <div className="weeks">
            {[
              {
                icon: "📩",
                title: "1. Premier contact",
                items: [
                  "Tu remplis le formulaire",
                  "On revient vers toi rapidement",
                  "Un premier échange pour comprendre ton projet",
                ],
              },
              {
                icon: "🎯",
                title: "2. Analyse de ton profil",
                items: [
                  "Objectifs, niveau, budget",
                  "Universités et programmes envisageables",
                  "Options de bourses possibles",
                ],
              },
              {
                icon: "📋",
                title: "3. Préparation du dossier",
                items: [
                  "Documents à réunir",
                  "Rédaction et vérification",
                  "Calendrier personnalisé",
                ],
              },
              {
                icon: "✈️",
                title: "4. Suivi jusqu'au départ",
                items: [
                  "Démarches de visa",
                  "Préparation de l'installation",
                  "Accompagnement jusqu'à ton arrivée en Chine",
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
          <div className="section-label">Pourquoi anticiper</div>
          <h2
            style={{
              fontFamily: '"Playfair Display", serif',
              fontSize: "clamp(28px, 4vw, 44px)",
              fontWeight: 900,
              marginBottom: "40px",
              lineHeight: 1.2,
            }}
          >
            Les candidatures ferment plus tôt qu'on ne le pense
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
              { n: "6–9", l: "Mois avant la rentrée" },
              { n: "1", l: "Rentrée par an, parfois deux" },
              { n: "1", l: "Dossier bien préparé" },
              { n: "0", l: "Place pour l'improvisation" },
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
            Plus tu commences tôt, plus tu as de choix : universités, bourses et
            délais confortables pour ton visa.
          </p>
        </div>
      </section>

      {/* LEAD FORM BOTTOM */}
      <section className="lead-section" id="lead-bottom">
        <div className="lead-inner">
          <div className="section-label">Prêt à démarrer ton projet ?</div>
          <h2>
            Parle-nous de{" "}
            <em style={{ fontStyle: "normal", color: "var(--gold)" }}>
              ton projet d'études en Chine
            </em>
            .
          </h2>
          <p>
            Laisse-nous tes coordonnées, on te recontacte pour faire le point
            sur ta situation et t'aider à avancer étape par étape.
          </p>
          <LeadForm prefix="bottom" />
        </div>
      </section>

      {/* FINAL CTA */}
      <section className="final-cta">
        <h2>
          Étudier en Chine,
          <br />
          <em>ce n'est pas si compliqué</em>
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
          À condition d'être bien accompagné.
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
          Fais le premier pas dès aujourd'hui.
        </p>
        <div className="cta-group">
          <a href="#lead-top" className="btn-primary">
            Démarrer mon projet →
          </a>
          <a href="#episodes" className="btn-secondary">
            Voir nos domaines d'accompagnement
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
          Réponse rapide &nbsp;·&nbsp; Sans engagement &nbsp;·&nbsp;
          Informations vérifiées
        </p>
      </section>

      <footer>
        <p>
          ÉTUDIER EN CHINE &nbsp;|&nbsp; Accompagnement personnalisé{" "}
          <span>▲</span> &nbsp;|&nbsp; Chinois en devenir - Tous droits réservés
        </p>
      </footer>
    </>
  );
}
