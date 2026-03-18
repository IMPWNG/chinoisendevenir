import Nav from "../components/Nav.jsx";
import { Link } from "react-router-dom";

const TYPES_LOGEMENT = [
  {
    icon: "🏢",
    titre: "Appartements",
    tag: "Le plus courant",
    tagColor: "var(--gold)",
    desc: "Option la plus répandue. Large choix selon le budget, loués via agences ou plateformes locales.",
    avantages: [
      "Large choix selon budget",
      "Accessible dans toutes les villes",
      "Flexible sur la durée",
    ],
  },
  {
    icon: "🏘",
    titre: "Colocation",
    tag: "Populaire chez les expatriés",
    tagColor: "var(--gold)",
    desc: "Très populaire chez les expatriés. Moins cher et plus flexible, idéal pour les premiers mois.",
    avantages: ["Moins cher", "Plus flexible", "Rencontres et réseau"],
  },
  {
    icon: "🏠",
    titre: "Résidences universitaires",
    tag: "Pour les étudiants",
    tagColor: "var(--muted)",
    desc: "Idéal pour les étudiants. Encadré, abordable, et souvent inclus dans le dossier d'inscription.",
    avantages: [
      "Prix abordable",
      "Proximité du campus",
      "Démarches simplifiées",
    ],
  },
];

const PIEGES = [
  "Dépôt souvent élevé — 1 à 3 mois de loyer",
  "Paiement à l'avance fréquent (3 à 6 mois)",
  "Contrats en chinois, souvent complexes",
  "Arnaques possibles sur les plateformes non vérifiées",
];

const CONSEILS = [
  {
    icon: "💰",
    titre: "Prépare ton budget",
    desc: "Anticipe le dépôt + premier loyer + frais d'agence avant de partir.",
  },
  {
    icon: "📋",
    titre: "Comprends le marché local",
    desc: "Les prix varient énormément selon le quartier et la ville. Renseigne-toi avant.",
  },
  {
    icon: "⏳",
    titre: "Évite de signer trop vite",
    desc: "Prends le temps de visiter et comparer. La précipitation coûte cher.",
  },
  {
    icon: "🔍",
    titre: "Vérifie les contrats",
    desc: "Fais-toi aider pour lire les contrats en chinois avant de signer.",
  },
];

const RETENIR = [
  "Le logement en Chine est accessible — mais différent des standards européens",
  "Le dépôt et les frais initiaux peuvent être élevés",
  "Les contrats sont en chinois — être accompagné fait une vraie différence",
  "La préparation évite les mauvaises surprises coûteuses",
];

export default function LogementChine() {
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
              display: "block",
              marginBottom: "28px",
              fontSize: "11px",
              color: "var(--muted)",
              letterSpacing: "1px",
              textDecoration: "none",
              transition: "color 0.2s",
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
            🏠 Guide Logement Chine — 2026
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
            Se loger en Chine :<br />
            <span style={{ color: "var(--red)" }}>
              appartements, prix
              <br />
              et erreurs à éviter
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
            Se loger en Chine est une étape clé de l'expatriation. Le marché est
            dynamique, les options nombreuses — mais les règles sont différentes
            de l'Europe.
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
            Les erreurs coûtent cher — la préparation est essentielle.
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
          {/* TYPES DE LOGEMENT */}
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
              <span style={{ fontSize: "24px" }}>🏢</span>
              <h2
                style={{
                  fontFamily: '"Playfair Display", serif',
                  fontSize: "22px",
                  fontWeight: 700,
                  color: "var(--light)",
                }}
              >
                Les types de logement en Chine
              </h2>
            </div>

            <div
              style={{ display: "flex", flexDirection: "column", gap: "2px" }}
            >
              {TYPES_LOGEMENT.map((t) => (
                <div
                  key={t.titre}
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
                    <div
                      style={{
                        width: "48px",
                        height: "48px",
                        flexShrink: 0,
                        background: "rgba(212,168,83,0.06)",
                        border: "1px solid rgba(212,168,83,0.15)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontSize: "22px",
                      }}
                    >
                      {t.icon}
                    </div>
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
                          {t.titre}
                        </span>
                        <span
                          style={{
                            fontSize: "9px",
                            fontWeight: 700,
                            letterSpacing: "1.5px",
                            textTransform: "uppercase",
                            padding: "3px 8px",
                            border: `1px solid ${t.tagColor}`,
                            color: t.tagColor,
                            opacity: t.tagColor === "var(--muted)" ? 0.6 : 1,
                          }}
                        >
                          {t.tag}
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
                        {t.desc}
                      </p>
                      <div
                        style={{
                          display: "flex",
                          gap: "16px",
                          flexWrap: "wrap",
                        }}
                      >
                        {t.avantages.map((a) => (
                          <div
                            key={a}
                            style={{
                              display: "flex",
                              gap: "6px",
                              alignItems: "center",
                            }}
                          >
                            <span
                              style={{ color: "var(--gold)", fontSize: "11px" }}
                            >
                              ✓
                            </span>
                            <span
                              style={{
                                fontSize: "12px",
                                color: "rgba(245,240,232,0.55)",
                              }}
                            >
                              {a}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* PRIX */}
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
              <span style={{ fontSize: "24px" }}>💰</span>
              <h2
                style={{
                  fontFamily: '"Playfair Display", serif',
                  fontSize: "22px",
                  fontWeight: 700,
                  color: "var(--light)",
                }}
              >
                Prix des logements en Chine
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
              Le logement reste souvent la plus grosse dépense mensuelle — et
              les prix varient énormément selon la ville.
            </p>

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: "2px",
                marginBottom: "16px",
              }}
              className="reasons-grid"
            >
              <div
                style={{
                  background: "rgba(200,16,46,0.05)",
                  border: "1px solid rgba(200,16,46,0.15)",
                  padding: "28px",
                }}
              >
                <div
                  style={{
                    fontFamily: '"Playfair Display", serif',
                    fontSize: "16px",
                    fontWeight: 700,
                    color: "var(--light)",
                    marginBottom: "8px",
                  }}
                >
                  Grandes villes
                </div>
                <div
                  style={{
                    fontSize: "13px",
                    color: "rgba(245,240,232,0.5)",
                    marginBottom: "10px",
                  }}
                >
                  Shanghai, Beijing, Shenzhen…
                </div>
                <div
                  style={{
                    fontSize: "14px",
                    color: "rgba(200,16,46,0.8)",
                    fontWeight: 600,
                  }}
                >
                  Loyers élevés
                </div>
                <div
                  style={{
                    fontSize: "12px",
                    color: "rgba(245,240,232,0.35)",
                    marginTop: "4px",
                  }}
                >
                  proche des standards européens dans certains quartiers
                </div>
              </div>
              <div
                style={{
                  background: "rgba(212,168,83,0.04)",
                  border: "1px solid rgba(212,168,83,0.15)",
                  padding: "28px",
                }}
              >
                <div
                  style={{
                    fontFamily: '"Playfair Display", serif',
                    fontSize: "16px",
                    fontWeight: 700,
                    color: "var(--light)",
                    marginBottom: "8px",
                  }}
                >
                  Villes secondaires
                </div>
                <div
                  style={{
                    fontSize: "13px",
                    color: "rgba(245,240,232,0.5)",
                    marginBottom: "10px",
                  }}
                >
                  Chengdu, Xi'an, Wuhan, Hangzhou…
                </div>
                <div
                  style={{
                    fontSize: "14px",
                    color: "var(--gold)",
                    fontWeight: 600,
                  }}
                >
                  Beaucoup plus accessibles
                </div>
                <div
                  style={{
                    fontSize: "12px",
                    color: "rgba(245,240,232,0.35)",
                    marginTop: "4px",
                  }}
                >
                  excellent rapport qualité/prix
                </div>
              </div>
            </div>
          </section>

          {/* PIÈGES */}
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
                Les pièges du logement en Chine
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
              Être informé = éviter les mauvaises surprises. Ces pièges touchent
              beaucoup d'expatriés la première fois.
            </p>

            <div
              style={{ display: "flex", flexDirection: "column", gap: "2px" }}
            >
              {PIEGES.map((p) => (
                <div
                  key={p}
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
                    {p}
                  </span>
                </div>
              ))}
            </div>
          </section>

          {/* OÙ HABITER */}
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
              <span style={{ fontSize: "24px" }}>📍</span>
              <h2
                style={{
                  fontFamily: '"Playfair Display", serif',
                  fontSize: "22px",
                  fontWeight: 700,
                  color: "var(--light)",
                }}
              >
                Où habiter en Chine ?
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
              Le choix dépend de ton travail, ton budget et ton mode de vie. Les
              expatriés privilégient souvent certains quartiers selon leur
              profil.
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
                  icon: "💼",
                  critere: "Ton travail",
                  desc: "Privilégie les quartiers proches de ton lieu de travail — les transports peuvent être longs.",
                },
                {
                  icon: "💰",
                  critere: "Ton budget",
                  desc: "Les centres-villes sont plus chers mais mieux équipés. Les périphéries offrent plus d'espace.",
                },
                {
                  icon: "🌏",
                  critere: "Ton mode de vie",
                  desc: "Quartiers expat pour plus de confort, quartiers locaux pour une immersion plus authentique.",
                },
              ].map((item) => (
                <div
                  key={item.critere}
                  style={{
                    background: "var(--dark2)",
                    border: "1px solid rgba(255,255,255,0.05)",
                    padding: "24px 20px",
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
                      color: "var(--gold)",
                      marginBottom: "8px",
                    }}
                  >
                    {item.critere}
                  </div>
                  <div
                    style={{
                      fontSize: "12px",
                      color: "rgba(245,240,232,0.4)",
                      lineHeight: 1.6,
                    }}
                  >
                    {item.desc}
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* CONSEILS */}
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
              <span style={{ fontSize: "24px" }}>🧠</span>
              <h2
                style={{
                  fontFamily: '"Playfair Display", serif',
                  fontSize: "22px",
                  fontWeight: 700,
                  color: "var(--light)",
                }}
              >
                Conseils pour se loger facilement
              </h2>
            </div>

            <div
              style={{ display: "flex", flexDirection: "column", gap: "2px" }}
            >
              {CONSEILS.map((c) => (
                <div
                  key={c.titre}
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
                  <div
                    style={{
                      width: "44px",
                      height: "44px",
                      flexShrink: 0,
                      background: "rgba(212,168,83,0.06)",
                      border: "1px solid rgba(212,168,83,0.12)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: "20px",
                    }}
                  >
                    {c.icon}
                  </div>
                  <div>
                    <div
                      style={{
                        fontFamily: '"Playfair Display", serif',
                        fontSize: "15px",
                        fontWeight: 700,
                        color: "var(--light)",
                        marginBottom: "6px",
                      }}
                    >
                      {c.titre}
                    </div>
                    <div
                      style={{
                        fontSize: "13px",
                        color: "rgba(245,240,232,0.45)",
                        lineHeight: 1.6,
                      }}
                    >
                      {c.desc}
                    </div>
                  </div>
                </div>
              ))}
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
              {RETENIR.map((item) => (
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
              🏠 Tu cherches un logement en Chine ?
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
              On t'aide à préparer
              <br />
              <span style={{ color: "var(--gold)" }}>
                ton installation en Chine
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
              Budget, quartiers, démarches, contrats — on répond à toutes tes
              questions lors d'un appel gratuit de 30 min.
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
                "Budget logement",
                "Quartiers recommandés",
                "Éviter les arnaques",
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
              Un logement bien préparé = une installation sans stress.
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
