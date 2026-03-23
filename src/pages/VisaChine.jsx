import Nav from "../components/Nav.jsx";
import { Link } from "react-router-dom";

const VISAS = [
  {
    icon: "🎓",
    type: "Visa étudiant (X1 / X2)",
    code: "Visa X",
    tag: "Le plus utilisé",
    tagColor: "var(--gold)",
    desc: "Le plus utilisé pour partir étudier en Chine. X1 pour les études longues (+6 mois), X2 pour les séjours courts.",
    permet: ["Étudier légalement en Chine"],
    warning: "Travail très limité avec ce visa.",
    objectif: "Étudier",
  },
  {
    icon: "💼",
    type: "Visa de travail (Z)",
    code: "Visa Z",
    tag: "Seul visa travail",
    tagColor: "var(--red)",
    desc: "Le seul visa permettant de travailler légalement. Nécessite un contrat avec une entreprise chinoise, un diplôme et une procédure stricte.",
    permet: [
      "Travailler légalement en Chine",
      "Accéder à un permis de résidence",
      "Vivre et travailler sur le territoire",
    ],
    warning: null,
    objectif: "Travailler",
  },
  {
    icon: "🧳",
    type: "Visa business (M)",
    code: "Visa M",
    tag: "Déplacements pro",
    tagColor: "var(--muted)",
    desc: "Pour les déplacements professionnels ponctuels — réunions, missions, prospection.",
    permet: ["Réunions et missions ponctuelles", "Prospection commerciale"],
    warning: "Ne permet pas un emploi local.",
    objectif: "Business",
  },
  {
    icon: "👨‍👩‍👧",
    type: "Visa familial (S / Q)",
    code: "Visa S / Q",
    tag: "Rejoindre un proche",
    tagColor: "var(--muted)",
    desc: "Pour rejoindre un proche en Chine. Q pour la famille de citoyens chinois, S pour la famille d'expatriés.",
    permet: ["Séjourner légalement en Chine", "Rejoindre un proche"],
    warning: "Pas de droit de travail automatique.",
    objectif: "Famille",
  },
  {
    icon: "🌍",
    type: "Visa tourisme (L)",
    code: "Visa L",
    tag: "Tourisme",
    tagColor: "var(--muted)",
    desc: "Pour voyager en Chine. Durée limitée, aucune activité professionnelle autorisée.",
    permet: ["Voyager et découvrir la Chine"],
    warning: "Aucune activité professionnelle autorisée.",
    objectif: "Voyager",
  },
];

const ERREURS = [
  "Choisir le mauvais type de visa pour son objectif",
  "Sous-estimer les délais de traitement",
  "Fournir un dossier incomplet",
  "Penser pouvoir changer facilement de statut sur place",
];

export default function VisaChine() {
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

        {/* HERO */}
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
            to="/expatrier"
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
              display: "block",
            }}
            onMouseEnter={(e) => (e.currentTarget.style.color = "var(--gold)")}
            onMouseLeave={(e) => (e.currentTarget.style.color = "var(--muted)")}
          >
            ← Retour à S'expatrier en Chine
          </Link>

          <div
            style={{
              display: "inline-block",
              border: "1px solid rgba(212,168,83,0.3)",
              color: "var(--gold)",
              fontSize: "10px",
              fontWeight: 700,
              letterSpacing: "3px",
              textTransform: "uppercase",
              padding: "7px 20px",
              marginBottom: "28px",
              animation: "fadeUp 0.7s ease both",
            }}
          >
            🛂 Guide Visa Chine — 2026
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
            Visa Chine : quel visa choisir
            <br />
            <span style={{ color: "var(--red)" }}>
              pour vivre, travailler ou étudier
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
            Obtenir un visa est la première étape obligatoire pour aller en
            Chine. Que tu veuilles étudier, travailler, t'expatrier ou
            simplement visiter — le visa détermine ce que tu peux faire
            légalement sur le territoire.
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
            Mauvais choix = projet bloqué.
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
          {/* QUEL VISA CHOISIR — tableau rapide */}
          <section style={{ marginBottom: "48px" }}>
            <div
              style={{
                background: "var(--dark2)",
                border: "1px solid rgba(212,168,83,0.15)",
                padding: "28px",
              }}
            >
              <div
                style={{
                  fontSize: "10px",
                  fontWeight: 700,
                  letterSpacing: "3px",
                  textTransform: "uppercase",
                  color: "var(--gold)",
                  marginBottom: "20px",
                }}
              >
                ❓ Quel visa choisir selon ton objectif ?
              </div>
              <div
                style={{ display: "flex", flexDirection: "column", gap: "2px" }}
              >
                {[
                  {
                    obj: "Étudier",
                    visa: "Visa X1 / X2",
                    color: "var(--gold)",
                  },
                  { obj: "Travailler", visa: "Visa Z", color: "var(--red)" },
                  { obj: "Business", visa: "Visa M", color: "var(--muted)" },
                  {
                    obj: "Rejoindre un proche",
                    visa: "Visa S / Q",
                    color: "var(--muted)",
                  },
                  { obj: "Voyager", visa: "Visa L", color: "var(--muted)" },
                ].map((item) => (
                  <div
                    key={item.obj}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      padding: "12px 16px",
                      background: "#111",
                      borderBottom: "1px solid rgba(255,255,255,0.04)",
                    }}
                  >
                    <span
                      style={{
                        fontSize: "14px",
                        color: "rgba(245,240,232,0.6)",
                      }}
                    >
                      {item.obj}
                    </span>
                    <span
                      style={{
                        fontSize: "12px",
                        fontWeight: 700,
                        letterSpacing: "1px",
                        color: item.color,
                        border: `1px solid ${item.color}`,
                        padding: "3px 10px",
                        opacity: item.color === "var(--muted)" ? 0.6 : 1,
                      }}
                    >
                      → {item.visa}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* VISAS DÉTAIL */}
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
              <span style={{ fontSize: "24px" }}>🛂</span>
              <h2
                style={{
                  fontFamily: '"Playfair Display", serif',
                  fontSize: "22px",
                  fontWeight: 700,
                  color: "var(--light)",
                }}
              >
                Les principaux types de visa pour la Chine
              </h2>
            </div>

            <div
              style={{ display: "flex", flexDirection: "column", gap: "2px" }}
            >
              {VISAS.map((v) => (
                <div
                  key={v.type}
                  style={{
                    background: "var(--dark2)",
                    border: "1px solid rgba(255,255,255,0.05)",
                    padding: "28px",
                    transition: "border-color 0.2s",
                  }}
                  className="hover-card"
                >
                  <div
                    style={{
                      display: "flex",
                      alignItems: "flex-start",
                      gap: "16px",
                    }}
                  >
                    <span style={{ fontSize: "28px", flexShrink: 0 }}>
                      {v.icon}
                    </span>
                    <div style={{ flex: 1 }}>
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "10px",
                          marginBottom: "8px",
                          flexWrap: "wrap",
                        }}
                      >
                        <span
                          style={{
                            fontFamily: '"Playfair Display", serif',
                            fontSize: "17px",
                            fontWeight: 700,
                            color: "var(--light)",
                          }}
                        >
                          {v.type}
                        </span>
                        <span
                          style={{
                            fontSize: "9px",
                            fontWeight: 700,
                            letterSpacing: "1.5px",
                            textTransform: "uppercase",
                            padding: "3px 8px",
                            border: `1px solid ${v.tagColor}`,
                            color: v.tagColor,
                          }}
                        >
                          {v.tag}
                        </span>
                      </div>
                      <p
                        style={{
                          fontSize: "13px",
                          color: "rgba(245,240,232,0.5)",
                          lineHeight: 1.6,
                          marginBottom: "12px",
                        }}
                      >
                        {v.desc}
                      </p>
                      <div
                        style={{
                          display: "flex",
                          flexDirection: "column",
                          gap: "4px",
                          marginBottom: v.warning ? "10px" : "0",
                        }}
                      >
                        {v.permet.map((p) => (
                          <div
                            key={p}
                            style={{
                              display: "flex",
                              gap: "8px",
                              alignItems: "center",
                            }}
                          >
                            <span
                              style={{
                                color: "var(--gold)",
                                fontSize: "11px",
                                flexShrink: 0,
                              }}
                            >
                              ✔
                            </span>
                            <span
                              style={{
                                fontSize: "13px",
                                color: "rgba(245,240,232,0.6)",
                              }}
                            >
                              {p}
                            </span>
                          </div>
                        ))}
                      </div>
                      {v.warning && (
                        <div
                          style={{
                            fontSize: "12px",
                            color: "rgba(200,16,46,0.7)",
                            fontStyle: "italic",
                            marginTop: "8px",
                          }}
                        >
                          ⚠️ {v.warning}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* ERREURS */}
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
              <span style={{ fontSize: "24px" }}>⚠️</span>
              <h2
                style={{
                  fontFamily: '"Playfair Display", serif',
                  fontSize: "22px",
                  fontWeight: 700,
                  color: "var(--light)",
                }}
              >
                Les erreurs fréquentes avec les visas chinois
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
              En Chine, les règles sont strictes. Ces erreurs sont évitables si
              tu es bien informé à l'avance.
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

          {/* TIMING */}
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
              <span style={{ fontSize: "24px" }}>⏳</span>
              <h2
                style={{
                  fontFamily: '"Playfair Display", serif',
                  fontSize: "22px",
                  fontWeight: 700,
                  color: "var(--light)",
                }}
              >
                Délais et timing des visas Chine
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
                  icon: "📋",
                  titre: "Procédure",
                  desc: "Plusieurs semaines selon le type de visa et ton pays de résidence.",
                },
                {
                  icon: "📁",
                  titre: "Documents",
                  desc: "Nombreux et précis. Un document manquant = dossier refusé.",
                },
                {
                  icon: "🗓",
                  titre: "Anticipation",
                  desc: "Certaines démarches doivent être faites avant d'arriver en Chine.",
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
                background: "rgba(212,168,83,0.04)",
                border: "1px solid rgba(212,168,83,0.12)",
                fontSize: "13px",
                color: "rgba(245,240,232,0.5)",
                lineHeight: 1.7,
              }}
            >
              Anticiper = éviter les refus ou les retards qui bloquent ton
              projet.
            </div>
          </section>

          {/* CE QU'IL FAUT RETENIR */}
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
                🎯 Ce qu'il faut retenir
              </h2>
            </div>

            <div
              style={{ display: "flex", flexDirection: "column", gap: "2px" }}
            >
              {[
                "Le visa est la base de tout projet en Chine",
                "Chaque visa a ses limites — bien choisir évite les blocages",
                "Les démarches sont strictes et les délais longs",
                "L'anticipation est essentielle pour éviter les refus",
              ].map((item) => (
                <div
                  key={item}
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
                      color: "var(--gold)",
                      fontWeight: 700,
                      flexShrink: 0,
                    }}
                  >
                    ✓
                  </span>
                  <span
                    style={{
                      fontSize: "14px",
                      color: "rgba(245,240,232,0.65)",
                      lineHeight: 1.5,
                    }}
                  >
                    {item}
                  </span>
                </div>
              ))}
            </div>
          </section>

          {/* CTA */}
          <section
            style={{
              background: "var(--dark2)",
              border: "1px solid rgba(212,168,83,0.2)",
              padding: "48px 40px",
              textAlign: "center",
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
              Gratuit
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
              🚀 Tu ne sais pas quel visa choisir ?
            </div>

            <h2
              style={{
                fontFamily: '"Playfair Display", serif',
                fontSize: "clamp(22px, 3vw, 32px)",
                fontWeight: 900,
                color: "var(--light)",
                lineHeight: 1.2,
                marginBottom: "16px",
              }}
            >
              On t'aide à identifier
              <br />
              <span style={{ color: "var(--gold)" }}>
                le bon visa pour ton profil
              </span>
            </h2>

            <p
              style={{
                fontSize: "15px",
                color: "rgba(245,240,232,0.5)",
                lineHeight: 1.7,
                maxWidth: "460px",
                margin: "0 auto 28px",
              }}
            >
              En 30 min d'appel gratuit, on analyse ton projet et on t'oriente
              vers les bonnes démarches pour partir sereinement.
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
                "Quel visa pour ton profil",
                "Délais réels à prévoir",
                "Documents nécessaires",
                "Sans engagement",
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

            <Link
              to="/contact"
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
              Réserver un appel gratuit →
            </Link>

            <p
              style={{
                fontSize: "11px",
                color: "#444",
                letterSpacing: "0.5px",
                marginTop: "16px",
              }}
            >
              Un bon visa au départ = un projet sans blocage.
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
