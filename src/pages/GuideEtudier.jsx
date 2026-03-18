import { Link } from "react-router-dom";
import Nav from "../components/Nav.jsx";

const FAQ = [
  {
    q: "Est-ce difficile d'étudier en Chine ?",
    r: "Non, mais cela demande une bonne préparation. Le système est différent mais accessible si on l'anticipe.",
  },
  {
    q: "Peut-on étudier en Chine sans parler chinois ?",
    r: "Oui, certains programmes sont en anglais, mais le chinois reste un avantage considérable au quotidien.",
  },
  {
    q: "Quand commencer les démarches ?",
    r: "Idéalement 6 à 12 mois avant la rentrée. Les meilleures opportunités partent en premier.",
  },
  {
    q: "Peut-on obtenir une bourse ?",
    r: "Oui, mais les places sont limitées et les dossiers doivent être solides et bien préparés.",
  },
];

const ERREURS = [
  "Commencer les démarches trop tard",
  "Ne pas comprendre le calendrier réel",
  "Envoyer un dossier incomplet",
  "Sous-estimer les délais administratifs",
  "Ne pas adapter son profil aux attentes",
];

const DEFIS = [
  {
    icon: "🧠",
    titre: "La barrière de la langue",
    desc: "Même si certains programmes sont en anglais, le chinois reste omniprésent dans la vie quotidienne.",
  },
  {
    icon: "📄",
    titre: "Les démarches administratives",
    desc: "Visa, documents, traductions, certifications… chaque étape demande de la rigueur.",
  },
  {
    icon: "📅",
    titre: "L'anticipation obligatoire",
    desc: "Les universités chinoises fonctionnent avec une logique d'anticipation forte. Attendre = perdre des opportunités.",
  },
];

export default function GuideEtudier() {
  return (
    <>
      <Nav />

      <main style={{ paddingTop: "64px", position: "relative", zIndex: 1 }}>
        <div
          style={{
            position: "fixed",
            inset: 0,
            pointerEvents: "none",
            zIndex: 0,
            background:
              "radial-gradient(ellipse 55% 40% at 50% 20%, rgba(200,16,46,0.07) 0%, transparent 65%)",
          }}
        />

        {/* ── HERO ── */}
        <section
          style={{
            maxWidth: "760px",
            margin: "0 auto",
            padding: "72px 24px 56px",
            textAlign: "center",
            position: "relative",
            zIndex: 1,
          }}
        >
          <Link
            to="/etudier"
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "6px",
              fontSize: "11px",
              color: "var(--muted)",
              letterSpacing: "1px",
              textDecoration: "none",
              marginBottom: "28px",
              transition: "color 0.2s",
            }}
            onMouseEnter={(e) => (e.currentTarget.style.color = "var(--gold)")}
            onMouseLeave={(e) => (e.currentTarget.style.color = "var(--muted)")}
          >
            ← Retour à Étudier en Chine
          </Link>

          <div
            style={{
              display: "block",
              border: "1px solid rgba(212,168,83,0.3)",
              color: "var(--gold)",
              fontSize: "10px",
              fontWeight: 700,
              letterSpacing: "3px",
              textTransform: "uppercase",
              padding: "7px 20px",
              marginBottom: "28px",
              animation: "fadeUp 0.7s ease both",
              display: "inline-block",
            }}
          >
            🎓 Guide complet — 2026/2027
          </div>

          <h1
            style={{
              fontFamily: '"Playfair Display", serif',
              fontSize: "clamp(28px, 5vw, 54px)",
              fontWeight: 900,
              lineHeight: 1.1,
              marginBottom: "24px",
              animation: "fadeUp 0.7s 0.05s ease both",
            }}
          >
            Étudier en Chine :<br />
            <span style={{ color: "var(--red)" }}>
              comprendre, préparer
              <br />
              et réussir ton projet
            </span>
          </h1>

          <p
            style={{
              fontSize: "16px",
              color: "rgba(245,240,232,0.5)",
              lineHeight: 1.8,
              maxWidth: "540px",
              margin: "0 auto 16px",
              animation: "fadeUp 0.7s 0.1s ease both",
            }}
          >
            Étudier en Chine est aujourd'hui bien plus qu'un simple choix
            académique. C'est une décision stratégique. Avec son développement
            économique rapide et ses universités en constante progression, la
            Chine attire chaque année des milliers d'étudiants internationaux.
          </p>

          <p
            style={{
              fontSize: "14px",
              color: "rgba(200,16,46,0.8)",
              fontWeight: 600,
              letterSpacing: "0.5px",
              animation: "fadeUp 0.7s 0.15s ease both",
            }}
          >
            Mais attention — c'est un projet qui ne s'improvise pas.
          </p>
        </section>

        <div
          style={{
            maxWidth: "860px",
            margin: "0 auto",
            padding: "0 24px 100px",
            position: "relative",
            zIndex: 1,
          }}
        >
          {/* ── SYSTÈME DIFFÉRENT ── */}
          <section style={{ marginBottom: "64px" }}>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "12px",
                marginBottom: "24px",
                borderBottom: "1px solid rgba(255,255,255,0.06)",
                paddingBottom: "14px",
              }}
            >
              <h2
                style={{
                  fontFamily: '"Playfair Display", serif',
                  fontSize: "22px",
                  fontWeight: 700,
                  color: "var(--light)",
                }}
              >
                Un système universitaire différent — et souvent mal compris
              </h2>
            </div>

            <p
              style={{
                fontSize: "15px",
                color: "rgba(245,240,232,0.55)",
                lineHeight: 1.8,
                marginBottom: "24px",
              }}
            >
              Contrairement à beaucoup de pays occidentaux, le système
              universitaire chinois fonctionne avec des calendriers stricts, des
              processus administratifs précis et des critères de sélection
              parfois peu transparents. Les candidatures ouvrent tôt… et ferment
              encore plus vite.
            </p>

            <div
              style={{
                background: "rgba(200,16,46,0.05)",
                border: "1px solid rgba(200,16,46,0.2)",
                padding: "24px 28px",
              }}
            >
              <p
                style={{
                  fontSize: "14px",
                  color: "rgba(245,240,232,0.6)",
                  lineHeight: 1.7,
                  marginBottom: "12px",
                  fontWeight: 600,
                }}
              >
                Beaucoup d'étudiants font la même erreur : ils commencent trop
                tard.
              </p>
              <div
                style={{ display: "flex", flexDirection: "column", gap: "8px" }}
              >
                {[
                  "Dossier incomplet",
                  "Délais dépassés",
                  "Projet repoussé d'un an",
                ].map((item) => (
                  <div
                    key={item}
                    style={{
                      display: "flex",
                      gap: "10px",
                      alignItems: "center",
                    }}
                  >
                    <span
                      style={{
                        color: "rgba(255,107,107,0.7)",
                        fontWeight: 700,
                      }}
                    >
                      ✗
                    </span>
                    <span
                      style={{
                        fontSize: "14px",
                        color: "rgba(245,240,232,0.5)",
                      }}
                    >
                      {item}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* ── DÉFIS ── */}
          <section style={{ marginBottom: "64px" }}>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "12px",
                marginBottom: "24px",
                borderBottom: "1px solid rgba(255,255,255,0.06)",
                paddingBottom: "14px",
              }}
            >
              <h2
                style={{
                  fontFamily: '"Playfair Display", serif',
                  fontSize: "22px",
                  fontWeight: 700,
                  color: "var(--light)",
                }}
              >
                Une opportunité… mais aussi un défi
              </h2>
            </div>

            <div
              style={{ display: "flex", flexDirection: "column", gap: "2px" }}
            >
              {DEFIS.map((d) => (
                <div
                  key={d.titre}
                  style={{
                    background: "var(--dark2)",
                    border: "1px solid rgba(255,255,255,0.05)",
                    padding: "24px 28px",
                    display: "flex",
                    gap: "20px",
                    alignItems: "flex-start",
                    transition: "border-color 0.2s",
                  }}
                  className="hover-card"
                >
                  <span style={{ fontSize: "28px", flexShrink: 0 }}>
                    {d.icon}
                  </span>
                  <div>
                    <div
                      style={{
                        fontFamily: '"Playfair Display", serif',
                        fontSize: "16px",
                        fontWeight: 700,
                        color: "var(--light)",
                        marginBottom: "6px",
                      }}
                    >
                      {d.titre}
                    </div>
                    <div
                      style={{
                        fontSize: "13px",
                        color: "rgba(245,240,232,0.45)",
                        lineHeight: 1.6,
                      }}
                    >
                      {d.desc}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* ── CE QUE VEULENT LES UNIVERSITÉS ── */}
          <section style={{ marginBottom: "64px" }}>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "12px",
                marginBottom: "24px",
                borderBottom: "1px solid rgba(255,255,255,0.06)",
                paddingBottom: "14px",
              }}
            >
              <h2
                style={{
                  fontFamily: '"Playfair Display", serif',
                  fontSize: "22px",
                  fontWeight: 700,
                  color: "var(--light)",
                }}
              >
                Ce que recherchent vraiment les universités chinoises
              </h2>
            </div>

            <p
              style={{
                fontSize: "15px",
                color: "rgba(245,240,232,0.55)",
                lineHeight: 1.8,
                marginBottom: "24px",
              }}
            >
              Contrairement aux idées reçues, les universités ne sélectionnent
              pas uniquement sur les notes. Elles évaluent la cohérence du
              projet, la préparation du candidat, la qualité du dossier et la
              capacité à s'adapter.
            </p>

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: "2px",
              }}
              className="reasons-grid"
            >
              {[
                {
                  label: 'Un bon dossier n\'est pas le plus "fort"',
                  sub: "C'est le plus structuré et anticipé.",
                },
                {
                  label: "La motivation ne suffit pas",
                  sub: "C'est la préparation qui fait la différence.",
                },
              ].map((item) => (
                <div
                  key={item.label}
                  style={{
                    background: "var(--dark2)",
                    border: "1px solid rgba(212,168,83,0.15)",
                    padding: "24px",
                  }}
                >
                  <div
                    style={{
                      fontFamily: '"Playfair Display", serif',
                      fontSize: "15px",
                      fontWeight: 700,
                      color: "var(--gold)",
                      marginBottom: "8px",
                      lineHeight: 1.4,
                    }}
                  >
                    {item.label}
                  </div>
                  <div
                    style={{
                      fontSize: "13px",
                      color: "rgba(245,240,232,0.45)",
                    }}
                  >
                    {item.sub}
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* ── ERREURS ── */}
          <section style={{ marginBottom: "64px" }}>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "12px",
                marginBottom: "24px",
                borderBottom: "1px solid rgba(255,255,255,0.06)",
                paddingBottom: "14px",
              }}
            >
              <h2
                style={{
                  fontFamily: '"Playfair Display", serif',
                  fontSize: "22px",
                  fontWeight: 700,
                  color: "var(--light)",
                }}
              >
                Les erreurs les plus fréquentes ❌
              </h2>
            </div>

            <p
              style={{
                fontSize: "15px",
                color: "rgba(245,240,232,0.55)",
                lineHeight: 1.8,
                marginBottom: "20px",
              }}
            >
              Chaque année, beaucoup de candidatures échouent pour les mêmes
              raisons. Ces erreurs sont évitables… mais seulement si tu es
              informé à l'avance.
            </p>

            <div
              style={{ display: "flex", flexDirection: "column", gap: "2px" }}
            >
              {ERREURS.map((e) => (
                <div
                  key={e}
                  style={{
                    background: "var(--dark2)",
                    border: "1px solid rgba(255,255,255,0.05)",
                    padding: "16px 24px",
                    display: "flex",
                    gap: "14px",
                    alignItems: "center",
                    transition: "border-color 0.2s",
                  }}
                  className="hover-card"
                >
                  <span
                    style={{
                      color: "rgba(255,107,107,0.6)",
                      fontWeight: 700,
                      flexShrink: 0,
                    }}
                  >
                    ✗
                  </span>
                  <span
                    style={{
                      fontSize: "14px",
                      color: "rgba(245,240,232,0.6)",
                      lineHeight: 1.5,
                    }}
                  >
                    {e}
                  </span>
                </div>
              ))}
            </div>
          </section>

          {/* ── TIMING ── */}
          <section style={{ marginBottom: "64px" }}>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "12px",
                marginBottom: "24px",
                borderBottom: "1px solid rgba(255,255,255,0.06)",
                paddingBottom: "14px",
              }}
            >
              <h2
                style={{
                  fontFamily: '"Playfair Display", serif',
                  fontSize: "22px",
                  fontWeight: 700,
                  color: "var(--light)",
                }}
              >
                Quand commencer pour 2026/2027 ? ⏳
              </h2>
            </div>

            <div
              style={{
                background: "var(--dark2)",
                border: "1px solid rgba(212,168,83,0.2)",
                padding: "32px",
                marginBottom: "16px",
                textAlign: "center",
              }}
            >
              <p
                style={{
                  fontFamily: '"Playfair Display", serif',
                  fontSize: "clamp(22px, 3vw, 32px)",
                  fontWeight: 900,
                  color: "var(--gold)",
                  marginBottom: "24px",
                }}
              >
                Le plus tôt possible.
              </p>
              <div
                style={{
                  display: "flex",
                  justifyContent: "center",
                  gap: "32px",
                  flexWrap: "wrap",
                }}
              >
                {[
                  { n: "6–9", l: "mois avant la rentrée" },
                  { n: "1er", l: "arrivé, 1er servi" },
                  { n: "∞", l: "plus de choix si tu anticipes" },
                ].map((item) => (
                  <div key={item.l} style={{ textAlign: "center" }}>
                    <div
                      style={{
                        fontFamily: '"Playfair Display", serif',
                        fontSize: "28px",
                        fontWeight: 900,
                        color: "var(--red)",
                        marginBottom: "4px",
                      }}
                    >
                      {item.n}
                    </div>
                    <div
                      style={{
                        fontSize: "11px",
                        color: "var(--muted)",
                        letterSpacing: "1px",
                        textTransform: "uppercase",
                      }}
                    >
                      {item.l}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <p
              style={{
                fontSize: "14px",
                color: "rgba(245,240,232,0.4)",
                lineHeight: 1.7,
                textAlign: "center",
                fontStyle: "italic",
              }}
            >
              Se préparer en avance = avoir plus de choix, plus de temps, moins
              de stress.
            </p>
          </section>

          {/* ── FINANCEMENT ── */}
          <section style={{ marginBottom: "64px" }}>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "12px",
                marginBottom: "24px",
                borderBottom: "1px solid rgba(255,255,255,0.06)",
                paddingBottom: "14px",
              }}
            >
              <h2
                style={{
                  fontFamily: '"Playfair Display", serif',
                  fontSize: "22px",
                  fontWeight: 700,
                  color: "var(--light)",
                }}
              >
                Financer ses études en Chine 💰
              </h2>
            </div>

            <p
              style={{
                fontSize: "15px",
                color: "rgba(245,240,232,0.55)",
                lineHeight: 1.8,
                marginBottom: "20px",
              }}
            >
              Bonne nouvelle : la Chine propose de nombreuses options pour
              financer ses études.
            </p>

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr 1fr",
                gap: "2px",
              }}
              className="three-grid"
            >
              {[
                {
                  icon: "🏛️",
                  titre: "Bourses gouvernementales",
                  desc: "Programme CSC — les plus complètes.",
                },
                {
                  icon: "🎓",
                  titre: "Bourses universitaires",
                  desc: "Proposées directement par chaque université.",
                },
                {
                  icon: "📋",
                  titre: "Programmes partiels",
                  desc: "Réductions sur les frais de scolarité.",
                },
              ].map((item) => (
                <div
                  key={item.titre}
                  style={{
                    background: "var(--dark2)",
                    border: "1px solid rgba(255,255,255,0.05)",
                    padding: "24px 20px",
                    textAlign: "center",
                    transition: "border-color 0.2s",
                  }}
                  className="hover-card"
                >
                  <div style={{ fontSize: "28px", marginBottom: "10px" }}>
                    {item.icon}
                  </div>
                  <div
                    style={{
                      fontFamily: '"Playfair Display", serif',
                      fontSize: "14px",
                      fontWeight: 700,
                      color: "var(--light)",
                      marginBottom: "8px",
                    }}
                  >
                    {item.titre}
                  </div>
                  <div
                    style={{
                      fontSize: "12px",
                      color: "rgba(245,240,232,0.4)",
                      lineHeight: 1.5,
                    }}
                  >
                    {item.desc}
                  </div>
                </div>
              ))}
            </div>

            <div
              style={{
                marginTop: "16px",
                padding: "16px 24px",
                background: "rgba(212,168,83,0.05)",
                border: "1px solid rgba(212,168,83,0.15)",
                fontSize: "13px",
                color: "rgba(245,240,232,0.5)",
                lineHeight: 1.7,
              }}
            >
              Les dossiers solides et bien préparés sont prioritaires pour
              l'obtention des bourses.
            </div>
          </section>

          {/* ── 3 PILIERS ── */}
          <section style={{ marginBottom: "64px" }}>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "12px",
                marginBottom: "24px",
                borderBottom: "1px solid rgba(255,255,255,0.06)",
                paddingBottom: "14px",
              }}
            >
              <h2
                style={{
                  fontFamily: '"Playfair Display", serif',
                  fontSize: "22px",
                  fontWeight: 700,
                  color: "var(--light)",
                }}
              >
                Construire un projet solide : les 3 piliers
              </h2>
            </div>

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr 1fr",
                gap: "2px",
              }}
              className="three-grid"
            >
              {[
                {
                  num: "01",
                  titre: "Comprendre le système",
                  desc: "Savoir comment fonctionnent réellement les admissions en Chine.",
                },
                {
                  num: "02",
                  titre: "Anticiper les étapes",
                  desc: "Respecter les délais et préparer les documents au bon moment.",
                },
                {
                  num: "03",
                  titre: "Structurer son dossier",
                  desc: "Présenter un profil clair, cohérent et stratégique.",
                },
              ].map((item) => (
                <div
                  key={item.num}
                  style={{
                    background: "var(--dark2)",
                    border: "1px solid rgba(255,255,255,0.05)",
                    padding: "28px 24px",
                    transition: "border-color 0.2s",
                  }}
                  className="hover-card"
                >
                  <div
                    style={{
                      fontFamily: '"Playfair Display", serif',
                      fontSize: "40px",
                      fontWeight: 900,
                      color: "rgba(212,168,83,0.15)",
                      lineHeight: 1,
                      marginBottom: "12px",
                    }}
                  >
                    {item.num}
                  </div>
                  <div
                    style={{
                      fontFamily: '"Playfair Display", serif',
                      fontSize: "15px",
                      fontWeight: 700,
                      color: "var(--light)",
                      marginBottom: "8px",
                    }}
                  >
                    {item.titre}
                  </div>
                  <div
                    style={{
                      fontSize: "13px",
                      color: "rgba(245,240,232,0.4)",
                      lineHeight: 1.6,
                    }}
                  >
                    {item.desc}
                  </div>
                </div>
              ))}
            </div>

            <div
              style={{
                marginTop: "16px",
                padding: "20px 24px",
                background: "rgba(200,16,46,0.05)",
                border: "1px solid rgba(200,16,46,0.15)",
                fontSize: "14px",
                color: "rgba(245,240,232,0.55)",
                lineHeight: 1.7,
              }}
            >
              Sans ces 3 éléments, le risque d'échec augmente fortement.
            </div>
          </section>

          {/* ── FAQ ── */}
          <section style={{ marginBottom: "64px" }}>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "12px",
                marginBottom: "24px",
                borderBottom: "1px solid rgba(255,255,255,0.06)",
                paddingBottom: "14px",
              }}
            >
              <h2
                style={{
                  fontFamily: '"Playfair Display", serif',
                  fontSize: "22px",
                  fontWeight: 700,
                  color: "var(--light)",
                }}
              >
                FAQ — Étudier en Chine
              </h2>
            </div>

            <div
              style={{ display: "flex", flexDirection: "column", gap: "2px" }}
            >
              {FAQ.map((item) => (
                <div
                  key={item.q}
                  style={{
                    background: "var(--dark2)",
                    border: "1px solid rgba(255,255,255,0.05)",
                    padding: "24px 28px",
                    transition: "border-color 0.2s",
                  }}
                  className="hover-card"
                >
                  <div
                    style={{
                      fontFamily: '"Playfair Display", serif',
                      fontSize: "15px",
                      fontWeight: 700,
                      color: "var(--light)",
                      marginBottom: "8px",
                    }}
                  >
                    {item.q}
                  </div>
                  <div
                    style={{
                      fontSize: "14px",
                      color: "rgba(245,240,232,0.5)",
                      lineHeight: 1.7,
                    }}
                  >
                    {item.r}
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* ── CTA GUIDE ── */}
          <section
            style={{
              background: "var(--dark2)",
              border: "1px solid rgba(212,168,83,0.2)",
              padding: "48px 40px",
              textAlign: "center",
              marginBottom: "16px",
              position: "relative",
              overflow: "hidden",
            }}
          >
            <div
              style={{
                position: "absolute",
                top: 0,
                right: 0,
                background: "var(--red)",
                color: "white",
                fontSize: "9px",
                fontWeight: 700,
                letterSpacing: "2px",
                textTransform: "uppercase",
                padding: "6px 16px",
              }}
            >
              Accès immédiat
            </div>

            <div
              style={{
                fontSize: "10px",
                fontWeight: 700,
                letterSpacing: "3px",
                textTransform: "uppercase",
                color: "var(--gold)",
                marginBottom: "16px",
              }}
            >
              🎯 Tu veux éviter les erreurs et gagner du temps ?
            </div>

            <h2
              style={{
                fontFamily: '"Playfair Display", serif',
                fontSize: "clamp(22px, 3vw, 34px)",
                fontWeight: 900,
                color: "var(--light)",
                lineHeight: 1.2,
                marginBottom: "16px",
              }}
            >
              Le guide complet
              <br />
              <span style={{ color: "var(--gold)" }}>
                Étudier en Chine 2026/2027
              </span>
            </h2>

            <p
              style={{
                fontSize: "15px",
                color: "rgba(245,240,232,0.5)",
                lineHeight: 1.7,
                marginBottom: "28px",
                maxWidth: "480px",
                margin: "0 auto 28px",
              }}
            >
              Une vision claire de toutes les étapes, un plan structuré, les
              informations essentielles sans perte de temps et une méthode pour
              maximiser tes chances.
            </p>

            <div
              style={{
                display: "flex",
                flexWrap: "wrap",
                gap: "10px",
                justifyContent: "center",
                marginBottom: "32px",
              }}
            >
              {[
                "Guide complet",
                "Vidéos explicatives",
                "Méthode claire",
                "Mise à jour 2026/2027",
              ].map((item) => (
                <span
                  key={item}
                  style={{
                    border: "1px solid rgba(212,168,83,0.25)",
                    color: "rgba(245,240,232,0.5)",
                    fontSize: "11px",
                    letterSpacing: "1px",
                    padding: "6px 14px",
                  }}
                >
                  ✓ {item}
                </span>
              ))}
            </div>

            <a
              href="https://chinoisendevenir.gumroad.com/l/etude-chine-2026-2027"
              target="_blank"
              rel="noreferrer"
              style={{
                display: "inline-block",
                background: "var(--red)",
                color: "white",
                fontSize: "12px",
                fontWeight: 700,
                letterSpacing: "2px",
                textTransform: "uppercase",
                padding: "16px 36px",
                textDecoration: "none",
                transition: "background 0.2s",
              }}
              onMouseEnter={(e) =>
                (e.currentTarget.style.background = "#a50e26")
              }
              onMouseLeave={(e) =>
                (e.currentTarget.style.background = "var(--red)")
              }
            >
              Accéder au guide — 29€ →
            </a>

            <p
              style={{
                fontSize: "11px",
                color: "#444",
                letterSpacing: "0.5px",
                marginTop: "16px",
              }}
            >
              Préparer ton départ maintenant, c'est éviter de le repousser d'un
              an.
            </p>
          </section>

          {/* ── CONCLUSION ── */}
          <section
            style={{
              padding: "32px",
              border: "1px solid rgba(255,255,255,0.05)",
              background: "#0a0a0a",
              textAlign: "center",
            }}
          >
            <p
              style={{
                fontSize: "15px",
                color: "rgba(245,240,232,0.5)",
                lineHeight: 1.8,
                marginBottom: "8px",
              }}
            >
              Étudier en Chine peut transformer ton avenir.
            </p>
            <p
              style={{
                fontSize: "15px",
                color: "var(--light)",
                fontWeight: 600,
                lineHeight: 1.8,
              }}
            >
              Ceux qui réussissent ne sont pas les plus motivés.
              <br />
              <span style={{ color: "var(--gold)" }}>
                Ce sont ceux qui sont prêts au bon moment.
              </span>
            </p>
          </section>
        </div>
      </main>

      <footer
        style={{
          borderTop: "1px solid rgba(255,255,255,0.05)",
          padding: "24px",
          textAlign: "center",
          position: "relative",
          zIndex: 1,
        }}
      >
        <p
          style={{
            fontSize: "12px",
            color: "rgba(245,240,232,0.35)",
            letterSpacing: "1px",
            display: "flex",
            gap: "8px",
            alignItems: "center",
            justifyContent: "center",
            flexWrap: "wrap",
          }}
        >
          <span>🇨🇳 Chinois en Devenir</span>
          <span style={{ color: "#333" }}>·</span>
          <span style={{ color: "var(--red)" }}>2026/2027</span>
          <span style={{ color: "#333" }}>·</span>
          <span>Tous droits réservés</span>
        </p>
      </footer>

      <style>{`
        .hover-card:hover {
          border-color: rgba(212,168,83,0.2) !important;
          background: #161616 !important;
        }
        @media (max-width: 600px) {
          .reasons-grid { grid-template-columns: 1fr !important; }
          .three-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </>
  );
}
