import Nav from "../components/Nav.jsx";
import { Link } from "react-router-dom";

const VISAS = [
  {
    icon: "🎓",
    type: "Visa étudiant (X1 / X2)",
    tag: "Le plus utilisé",
    tagColor: "var(--gold)",
    desc: "X1 pour les études longues (+6 mois), X2 pour les séjours courts.",
    permet: [
      "Étudier dans une université chinoise",
      "Être sur place légalement",
    ],
    warning: "Le travail est très limité avec ce visa.",
  },
  {
    icon: "💼",
    type: "Visa de travail (Z)",
    tag: "Le plus stable",
    tagColor: "var(--gold)",
    desc: "Le visa indispensable pour travailler légalement en Chine. Nécessite une offre d'emploi et un sponsor.",
    permet: ["Travailler légalement", "Obtenir un permis de résidence"],
    warning: "Le plus strict, mais aussi le plus stable.",
  },
  {
    icon: "🧳",
    type: "Visa business (M)",
    tag: "Séjours courts",
    tagColor: "var(--muted)",
    desc: "Pour les rendez-vous business, missions ponctuelles et prospection.",
    permet: ["Séjours professionnels courts", "Prospection et rendez-vous"],
    warning: "Ne permet PAS de travailler officiellement en Chine.",
  },
  {
    icon: "👨‍👩‍👧",
    type: "Visa familial (S / Q)",
    tag: "Rejoindre un proche",
    tagColor: "var(--muted)",
    desc: "Q pour la famille de citoyens chinois, S pour la famille d'expatriés.",
    permet: ["Rester sur le territoire", "Vivre avec un proche"],
    warning: "Ne donne pas automatiquement le droit de travailler.",
  },
  {
    icon: "🌍",
    type: "Visa tourisme (L)",
    tag: "Court séjour",
    tagColor: "var(--muted)",
    desc: "Pour découvrir la Chine. Durée limitée.",
    permet: ["Visites touristiques", "Séjours de courte durée"],
    warning: "Aucune activité professionnelle autorisée.",
  },
];

const SECTEURS = [
  "Commerce international",
  "Technologie",
  "Éducation (notamment langues)",
  "Marketing / digital",
];

const DEFIS = [
  {
    icon: "🗣️",
    titre: "Une langue complexe",
    desc: "Le mandarin est indispensable pour s'intégrer vraiment, même dans les grandes villes.",
  },
  {
    icon: "🏛️",
    titre: "Un système administratif unique",
    desc: "Visa, permis de résidence, enregistrement... chaque démarche a ses règles propres.",
  },
  {
    icon: "🌏",
    titre: "Une culture différente",
    desc: "Les codes sociaux, professionnels et quotidiens sont profondément différents des standards occidentaux.",
  },
];

export default function Expatrier() {
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
            🏢 Guide complet — Expatriation 2026
          </div>

          <h1
            style={{
              fontFamily: '"Playfair Display", serif',
              fontSize: "clamp(28px, 5vw, 56px)",
              fontWeight: 900,
              lineHeight: 1.1,
              marginBottom: "24px",
              animation: "fadeUp 0.7s 0.05s ease both",
            }}
          >
            S'expatrier en Chine :<br />
            <span style={{ color: "var(--red)" }}>
              visas, logement, travail
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
            S'expatrier en Chine attire étudiants, jeunes diplômés,
            entrepreneurs et salariés internationaux. Opportunités
            professionnelles, coût de la vie intéressant, expérience
            internationale forte.
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
            Mais s'expatrier en Chine ne s'improvise pas.
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
          {/* VISAS */}
          <section style={{ marginBottom: "64px" }}>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "12px",
                marginBottom: "8px",
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
                Les visas pour s'expatrier en Chine
              </h2>
            </div>

            <p
              style={{
                fontSize: "14px",
                color: "rgba(200,16,46,0.7)",
                fontWeight: 600,
                marginBottom: "24px",
                lineHeight: 1.6,
              }}
            >
              Le choix du visa détermine tout ton projet — ce que tu peux faire
              légalement, combien de temps tu peux rester, si tu peux
              travailler. Une erreur ici peut bloquer ton expatriation.
            </p>

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
                            fontSize: "16px",
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
                          marginBottom: "12px",
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
                              ✓
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
                      <div
                        style={{
                          fontSize: "12px",
                          color: "rgba(200,16,46,0.7)",
                          fontStyle: "italic",
                        }}
                      >
                        ⚠️ {v.warning}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <Link
              to="/expatrier/visa-chine"
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                marginTop: "16px",
                background: "var(--dark2)",
                border: "1px solid rgba(212,168,83,0.2)",
                padding: "20px 24px",
                textDecoration: "none",
                transition: "border-color 0.2s, background 0.2s",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = "var(--gold)";
                e.currentTarget.style.background = "#161616";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = "rgba(212,168,83,0.2)";
                e.currentTarget.style.background = "var(--dark2)";
              }}
            >
              <div
                style={{ display: "flex", alignItems: "center", gap: "16px" }}
              >
                <span style={{ fontSize: "28px" }}>🛂</span>
                <div>
                  <div
                    style={{
                      fontSize: "10px",
                      fontWeight: 700,
                      letterSpacing: "2px",
                      textTransform: "uppercase",
                      color: "var(--gold)",
                      marginBottom: "4px",
                    }}
                  >
                    Guide complet
                  </div>
                  <div
                    style={{
                      fontFamily: '"Playfair Display", serif',
                      fontSize: "16px",
                      fontWeight: 700,
                      color: "var(--light)",
                    }}
                  >
                    Quel visa choisir pour la Chine ?
                  </div>
                  <div
                    style={{
                      fontSize: "12px",
                      color: "rgba(245,240,232,0.4)",
                      marginTop: "4px",
                    }}
                  >
                    X1, Z, M, S/Q, L — tous les visas expliqués
                  </div>
                </div>
              </div>
              <span
                style={{
                  fontSize: "18px",
                  color: "var(--gold)",
                  flexShrink: 0,
                }}
              >
                →
              </span>
            </Link>

            <div
              style={{
                marginTop: "16px",
                padding: "20px 24px",
                background: "rgba(200,16,46,0.05)",
                border: "1px solid rgba(200,16,46,0.15)",
                fontSize: "13px",
                color: "rgba(245,240,232,0.55)",
                lineHeight: 1.7,
              }}
            >
              <strong style={{ color: "var(--light)" }}>À retenir :</strong> Le
              visa ≠ droit automatique de rester longtemps. Le permis de
              résidence est souvent obligatoire. Les règles peuvent évoluer
              rapidement et les contrôles sont stricts.
            </div>
          </section>

          {/* LOGEMENT */}
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
              <span style={{ fontSize: "24px" }}>🏠</span>
              <h2
                style={{
                  fontFamily: '"Playfair Display", serif',
                  fontSize: "22px",
                  fontWeight: 700,
                  color: "var(--light)",
                }}
              >
                Se loger en Chine
              </h2>
            </div>

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr 1fr",
                gap: "2px",
                marginBottom: "16px",
              }}
              className="three-grid"
            >
              {[
                {
                  icon: "🏢",
                  titre: "Appartements",
                  desc: "Solution la plus courante. Loués via agences ou plateformes locales.",
                },
                {
                  icon: "🏠",
                  titre: "Résidences universitaires",
                  desc: "Idéal pour les étudiants. Moins cher mais plus encadré.",
                },
                {
                  icon: "🏘",
                  titre: "Colocation",
                  desc: "Très populaire chez les expatriés. Permet de réduire les coûts.",
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
              style={{ display: "flex", flexDirection: "column", gap: "2px" }}
            >
              {[
                "Dépôt souvent élevé (1 à 3 mois)",
                "Paiement à l'avance fréquent",
                "Contrats parfois complexes",
                "Barrière de la langue",
              ].map((item) => (
                <div
                  key={item}
                  style={{
                    background: "var(--dark2)",
                    border: "1px solid rgba(255,255,255,0.04)",
                    padding: "14px 24px",
                    display: "flex",
                    gap: "12px",
                    alignItems: "center",
                  }}
                >
                  <span style={{ color: "rgba(200,16,46,0.6)", flexShrink: 0 }}>
                    ⚠️
                  </span>
                  <span
                    style={{ fontSize: "13px", color: "rgba(245,240,232,0.5)" }}
                  >
                    {item}
                  </span>
                </div>
              ))}
            </div>
          </section>

          <div style={{ marginTop: "24px", marginBottom: "16px" }}>
            <Link
              to="/expatrier/logement-en-chine"
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                background: "var(--dark2)",
                border: "1px solid rgba(212,168,83,0.2)",
                padding: "24px 28px",
                textDecoration: "none",
                transition: "border-color 0.2s, background 0.2s",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = "var(--gold)";
                e.currentTarget.style.background = "#161616";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = "rgba(212,168,83,0.2)";
                e.currentTarget.style.background = "var(--dark2)";
              }}
            >
              <div
                style={{ display: "flex", alignItems: "center", gap: "20px" }}
              >
                <div
                  style={{
                    width: "48px",
                    height: "48px",
                    flexShrink: 0,
                    background: "rgba(212,168,83,0.08)",
                    border: "1px solid rgba(212,168,83,0.2)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: "22px",
                  }}
                >
                  🏠
                </div>
                <div>
                  <div
                    style={{
                      fontSize: "10px",
                      fontWeight: 700,
                      letterSpacing: "2px",
                      textTransform: "uppercase",
                      color: "var(--gold)",
                      marginBottom: "5px",
                    }}
                  >
                    Guide complet
                  </div>
                  <div
                    style={{
                      fontFamily: '"Playfair Display", serif',
                      fontSize: "16px",
                      fontWeight: 700,
                      color: "var(--light)",
                      marginBottom: "5px",
                      lineHeight: 1.3,
                    }}
                  >
                    Se loger en Chine en tant qu'étranger
                  </div>
                  <div
                    style={{
                      fontSize: "12px",
                      color: "rgba(245,240,232,0.35)",
                      lineHeight: 1.5,
                    }}
                  >
                    Prix · types de logement · pièges à éviter · conseils
                    pratiques
                  </div>
                </div>
              </div>
              <div
                style={{
                  flexShrink: 0,
                  marginLeft: "16px",
                  width: "32px",
                  height: "32px",
                  border: "1px solid rgba(212,168,83,0.25)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "var(--gold)",
                  fontSize: "14px",
                }}
              >
                →
              </div>
            </Link>
          </div>

          {/* TRAVAIL */}
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
              <span style={{ fontSize: "24px" }}>💼</span>
              <h2
                style={{
                  fontFamily: '"Playfair Display", serif',
                  fontSize: "22px",
                  fontWeight: 700,
                  color: "var(--light)",
                }}
              >
                Travailler en Chine
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
              Le marché chinois offre de nombreuses opportunités, mais reste
              exigeant. Visa Z obligatoire, diplôme requis dans la plupart des
              cas, expérience souvent demandée.
            </p>

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: "2px",
              }}
              className="reasons-grid"
            >
              {SECTEURS.map((s) => (
                <div
                  key={s}
                  style={{
                    background: "var(--dark2)",
                    border: "1px solid rgba(255,255,255,0.05)",
                    padding: "18px 24px",
                    display: "flex",
                    gap: "12px",
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
                    →
                  </span>
                  <span
                    style={{
                      fontSize: "14px",
                      color: "rgba(245,240,232,0.65)",
                    }}
                  >
                    {s}
                  </span>
                </div>
              ))}
            </div>
          </section>

          <div style={{ marginTop: "24px", marginBottom: "16px" }}>
            <Link
              to="/expatrier/travailler-en-chine"
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                background: "var(--dark2)",
                border: "1px solid rgba(212,168,83,0.2)",
                padding: "24px 28px",
                textDecoration: "none",
                transition: "border-color 0.2s, background 0.2s",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = "var(--gold)";
                e.currentTarget.style.background = "#161616";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = "rgba(212,168,83,0.2)";
                e.currentTarget.style.background = "var(--dark2)";
              }}
            >
              <div
                style={{ display: "flex", alignItems: "center", gap: "20px" }}
              >
                <div
                  style={{
                    width: "48px",
                    height: "48px",
                    flexShrink: 0,
                    background: "rgba(212,168,83,0.08)",
                    border: "1px solid rgba(212,168,83,0.2)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: "22px",
                  }}
                >
                  💼
                </div>
                <div>
                  <div
                    style={{
                      fontSize: "10px",
                      fontWeight: 700,
                      letterSpacing: "2px",
                      textTransform: "uppercase",
                      color: "var(--gold)",
                      marginBottom: "5px",
                    }}
                  >
                    Guide complet
                  </div>
                  <div
                    style={{
                      fontFamily: '"Playfair Display", serif',
                      fontSize: "16px",
                      fontWeight: 700,
                      color: "var(--light)",
                      marginBottom: "5px",
                      lineHeight: 1.3,
                    }}
                  >
                    Travailler en Chine en tant qu'étranger
                  </div>
                  <div
                    style={{
                      fontSize: "12px",
                      color: "rgba(245,240,232,0.35)",
                      lineHeight: 1.5,
                    }}
                  >
                    Visa Z · secteurs qui recrutent · salaires · démarches
                  </div>
                </div>
              </div>
              <div
                style={{
                  flexShrink: 0,
                  marginLeft: "16px",
                  width: "32px",
                  height: "32px",
                  border: "1px solid rgba(212,168,83,0.25)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "var(--gold)",
                  fontSize: "14px",
                }}
              >
                →
              </div>
            </Link>
          </div>

          {/* COÛT DE LA VIE */}
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
                Coût de la vie en Chine
              </h2>
            </div>

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: "2px",
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
                    marginBottom: "10px",
                  }}
                >
                  Grandes villes
                </div>
                <div
                  style={{
                    fontSize: "13px",
                    color: "rgba(245,240,232,0.5)",
                    marginBottom: "4px",
                  }}
                >
                  Shanghai, Beijing…
                </div>
                <div
                  style={{
                    fontSize: "14px",
                    color: "rgba(200,16,46,0.8)",
                    fontWeight: 600,
                  }}
                >
                  Plus chères
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
                    marginBottom: "10px",
                  }}
                >
                  Villes secondaires
                </div>
                <div
                  style={{
                    fontSize: "13px",
                    color: "rgba(245,240,232,0.5)",
                    marginBottom: "4px",
                  }}
                >
                  Chengdu, Xi'an, Wuhan…
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
              </div>
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
              Globalement, le coût de la vie peut être inférieur à l'Europe
              selon ton mode de vie et la ville choisie.
            </div>
          </section>

          {/* VRAIS DÉFIS */}
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
              <span style={{ fontSize: "24px" }}>🌏</span>
              <h2
                style={{
                  fontFamily: '"Playfair Display", serif',
                  fontSize: "22px",
                  fontWeight: 700,
                  color: "var(--light)",
                }}
              >
                S'intégrer en Chine : les vrais défis
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
              S'expatrier en Chine, ce n'est pas juste un déménagement. Ceux qui
              réussissent sont ceux qui s'adaptent rapidement.
            </p>

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
                "Le visa est la base de ton expatriation — bien le choisir évite les blocages",
                "Chaque type de visa a ses règles propres",
                "Le logement et le travail dépendent de ton statut légal",
                "L'anticipation est essentielle — tout demande du temps",
                "Un projet bien préparé = une expatriation réussie",
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

          {/* CTA APPEL */}
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
              🚀 Tu veux aller plus loin ?
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
              Parlons de ton projet
              <br />
              <span style={{ color: "var(--gold)" }}>
                d'expatriation en Chine
              </span>
            </h2>

            <p
              style={{
                fontSize: "15px",
                color: "rgba(245,240,232,0.5)",
                lineHeight: 1.7,
                maxWidth: "480px",
                margin: "0 auto 28px",
              }}
            >
              Quel visa choisir ? Comment s'organiser ? Quelles erreurs éviter ?
              On répond à toutes tes questions lors d'un appel gratuit de 30
              min.
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
                "Démarches étape par étape",
                "Erreurs à éviter",
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
              S'expatrier en Chine ne dépend pas de la chance — ça dépend de ta
              préparation.
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
