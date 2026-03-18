import Nav from "../components/Nav.jsx";
import { Link } from "react-router-dom";

const SECTEURS = [
  {
    icon: "📚",
    titre: "Enseignement (langues)",
    desc: "Les profils francophones et anglophones sont très recherchés dans les écoles et universités.",
  },
  {
    icon: "🌐",
    titre: "Commerce international",
    desc: "Les entreprises chinoises cherchent des profils capables de gérer des relations avec l'étranger.",
  },
  {
    icon: "📱",
    titre: "Marketing / digital",
    desc: "Croissance rapide du secteur numérique en Chine, notamment sur les plateformes locales.",
  },
  {
    icon: "💻",
    titre: "Tech",
    desc: "Forte demande de profils techniques dans les grandes métropoles comme Shenzhen ou Beijing.",
  },
];

const EMPLOYEURS = [
  "Compétences spécifiques et rares",
  "Capacité d'adaptation culturelle",
  "Expérience internationale",
  "Maîtrise d'une langue étrangère",
];

const RETENIR = [
  "Visa Z obligatoire pour travailler légalement",
  "Marché compétitif — la préparation fait la différence",
  "Opportunités réelles dans plusieurs secteurs",
  "Une offre d'emploi est généralement requise avant d'obtenir le visa",
];

export default function TravaillerChine() {
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
            💼 Guide Travail Chine — 2026
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
            Travailler en Chine :<br />
            <span style={{ color: "var(--red)" }}>
              conditions, visa
              <br />
              et opportunités
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
            Travailler en Chine en tant qu'étranger est possible — mais pas
            n'importe comment. Le cadre légal est strict, le marché compétitif,
            et les opportunités réelles pour les profils bien préparés.
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
            Visa Z + employeur + dossier solide = les 3 conditions obligatoires.
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
          {/* VISA Z */}
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
                Le visa de travail en Chine (Z)
              </h2>
            </div>

            <p
              style={{
                fontSize: "14px",
                color: "rgba(200,16,46,0.7)",
                fontWeight: 600,
                marginBottom: "20px",
              }}
            >
              Obligatoire pour travailler légalement en Chine — sans exception.
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
                  background: "var(--dark2)",
                  border: "1px solid rgba(255,255,255,0.05)",
                  padding: "28px",
                }}
              >
                <div
                  style={{
                    fontSize: "10px",
                    fontWeight: 700,
                    letterSpacing: "2px",
                    textTransform: "uppercase",
                    color: "var(--muted)",
                    marginBottom: "16px",
                  }}
                >
                  Conditions principales
                </div>
                {[
                  "Contrat de travail avec une entreprise",
                  "Diplôme (souvent minimum licence)",
                  "Expérience professionnelle",
                ].map((item) => (
                  <div
                    key={item}
                    style={{
                      display: "flex",
                      gap: "10px",
                      alignItems: "flex-start",
                      padding: "8px 0",
                      borderBottom: "1px solid rgba(255,255,255,0.04)",
                    }}
                  >
                    <span
                      style={{ color: "rgba(255,107,107,0.6)", flexShrink: 0 }}
                    >
                      →
                    </span>
                    <span
                      style={{
                        fontSize: "13px",
                        color: "rgba(245,240,232,0.55)",
                      }}
                    >
                      {item}
                    </span>
                  </div>
                ))}
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
                    fontSize: "10px",
                    fontWeight: 700,
                    letterSpacing: "2px",
                    textTransform: "uppercase",
                    color: "var(--gold)",
                    marginBottom: "16px",
                  }}
                >
                  Ce que ça permet
                </div>
                {[
                  "Travailler légalement en Chine",
                  "Obtenir un permis de résidence",
                  "Accéder à tous les services",
                ].map((item) => (
                  <div
                    key={item}
                    style={{
                      display: "flex",
                      gap: "10px",
                      alignItems: "flex-start",
                      padding: "8px 0",
                      borderBottom: "1px solid rgba(255,255,255,0.04)",
                    }}
                  >
                    <span style={{ color: "var(--gold)", flexShrink: 0 }}>
                      ✔
                    </span>
                    <span
                      style={{
                        fontSize: "13px",
                        color: "rgba(245,240,232,0.65)",
                      }}
                    >
                      {item}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Lien vers page visa */}
            <Link
              to="/expatrier/visa-chine"
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
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
                    Tous les visas pour la Chine expliqués
                  </div>
                  <div
                    style={{
                      fontSize: "12px",
                      color: "rgba(245,240,232,0.4)",
                      marginTop: "4px",
                    }}
                  >
                    X1, Z, M, S/Q, L — lequel choisir selon ton profil
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
          </section>

          {/* SECTEURS */}
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
              <span style={{ fontSize: "24px" }}>📊</span>
              <h2
                style={{
                  fontFamily: '"Playfair Display", serif',
                  fontSize: "22px",
                  fontWeight: 700,
                  color: "var(--light)",
                }}
              >
                Les secteurs qui recrutent en Chine
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
              Les profils internationaux sont recherchés… mais sélectionnés. La
              compétition est réelle.
            </p>

            <div
              style={{ display: "flex", flexDirection: "column", gap: "2px" }}
            >
              {SECTEURS.map((s) => (
                <div
                  key={s.titre}
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
                    {s.icon}
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
                      {s.titre}
                    </div>
                    <div
                      style={{
                        fontSize: "13px",
                        color: "rgba(245,240,232,0.45)",
                        lineHeight: 1.6,
                      }}
                    >
                      {s.desc}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* SALAIRE */}
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
                Salaire en Chine
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
              Le salaire dépend de ton expérience, ton domaine et surtout la
              ville.
            </p>

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
                    marginBottom: "8px",
                  }}
                >
                  Grandes villes
                </div>
                <div
                  style={{
                    fontSize: "13px",
                    color: "rgba(245,240,232,0.5)",
                    marginBottom: "8px",
                  }}
                >
                  Shanghai, Beijing, Shenzhen…
                </div>
                <div
                  style={{
                    fontSize: "13px",
                    color: "rgba(200,16,46,0.7)",
                    fontWeight: 600,
                  }}
                >
                  Salaires plus élevés
                </div>
                <div
                  style={{
                    fontSize: "12px",
                    color: "rgba(245,240,232,0.35)",
                    marginTop: "4px",
                  }}
                >
                  mais coût de vie plus important
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
                    marginBottom: "8px",
                  }}
                >
                  Chengdu, Xi'an, Wuhan…
                </div>
                <div
                  style={{
                    fontSize: "13px",
                    color: "var(--gold)",
                    fontWeight: 600,
                  }}
                >
                  Coût de vie plus bas
                </div>
                <div
                  style={{
                    fontSize: "12px",
                    color: "rgba(245,240,232,0.35)",
                    marginTop: "4px",
                  }}
                >
                  bon équilibre qualité de vie
                </div>
              </div>
            </div>
          </section>

          {/* SANS VISA */}
          <section style={{ marginBottom: "64px" }}>
            <div
              style={{
                background: "rgba(200,16,46,0.06)",
                border: "1px solid rgba(200,16,46,0.25)",
                padding: "28px",
              }}
            >
              <div
                style={{
                  fontSize: "10px",
                  fontWeight: 700,
                  letterSpacing: "2px",
                  textTransform: "uppercase",
                  color: "var(--red)",
                  marginBottom: "12px",
                }}
              >
                ⚠️ Travailler sans visa en Chine
              </div>
              <p
                style={{
                  fontSize: "15px",
                  color: "var(--light)",
                  fontWeight: 600,
                  marginBottom: "16px",
                }}
              >
                C'est illégal — sans exception.
              </p>
              <div
                style={{ display: "flex", flexDirection: "column", gap: "8px" }}
              >
                {[
                  "Amende",
                  "Expulsion immédiate",
                  "Interdiction de retour en Chine",
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
                        fontSize: "13px",
                        color: "rgba(245,240,232,0.6)",
                      }}
                    >
                      {item}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* CE QUE CHERCHENT LES EMPLOYEURS */}
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
                Ce que les employeurs recherchent
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
              Le diplôme seul ne suffit pas. Les employeurs chinois recherchent
              des profils complets.
            </p>

            <div
              style={{ display: "flex", flexDirection: "column", gap: "2px" }}
            >
              {EMPLOYEURS.map((e) => (
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
                      lineHeight: 1.5,
                    }}
                  >
                    {e}
                  </span>
                </div>
              ))}
            </div>
          </section>

          {/* TROUVER UN EMPLOI */}
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
              <span style={{ fontSize: "24px" }}>📅</span>
              <h2
                style={{
                  fontFamily: '"Playfair Display", serif',
                  fontSize: "22px",
                  fontWeight: 700,
                  color: "var(--light)",
                }}
              >
                Trouver un travail en Chine
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
                  background: "rgba(212,168,83,0.04)",
                  border: "1px solid rgba(212,168,83,0.15)",
                  padding: "28px",
                }}
              >
                <div style={{ fontSize: "24px", marginBottom: "12px" }}>✈️</div>
                <div
                  style={{
                    fontFamily: '"Playfair Display", serif',
                    fontSize: "16px",
                    fontWeight: 700,
                    color: "var(--light)",
                    marginBottom: "8px",
                  }}
                >
                  Avant de partir
                </div>
                <div
                  style={{
                    fontSize: "13px",
                    color: "rgba(245,240,232,0.5)",
                    lineHeight: 1.6,
                    marginBottom: "10px",
                  }}
                >
                  La méthode recommandée. Tu arrives avec un visa valide et un
                  contrat signé.
                </div>
                <div
                  style={{
                    fontSize: "11px",
                    color: "var(--gold)",
                    fontWeight: 600,
                  }}
                >
                  ✓ Recommandé
                </div>
              </div>
              <div
                style={{
                  background: "var(--dark2)",
                  border: "1px solid rgba(255,255,255,0.05)",
                  padding: "28px",
                }}
              >
                <div style={{ fontSize: "24px", marginBottom: "12px" }}>🔍</div>
                <div
                  style={{
                    fontFamily: '"Playfair Display", serif',
                    fontSize: "16px",
                    fontWeight: 700,
                    color: "var(--light)",
                    marginBottom: "8px",
                  }}
                >
                  Sur place
                </div>
                <div
                  style={{
                    fontSize: "13px",
                    color: "rgba(245,240,232,0.5)",
                    lineHeight: 1.6,
                    marginBottom: "10px",
                  }}
                >
                  Possible mais plus risqué. Nécessite d'arriver avec le bon
                  visa et d'anticiper les démarches.
                </div>
                <div
                  style={{
                    fontSize: "11px",
                    color: "rgba(200,16,46,0.7)",
                    fontWeight: 600,
                  }}
                >
                  ⚠️ Plus risqué
                </div>
              </div>
            </div>

            <div
              style={{
                marginTop: "16px",
                padding: "16px 24px",
                background: "rgba(200,16,46,0.05)",
                border: "1px solid rgba(200,16,46,0.15)",
                fontSize: "13px",
                color: "rgba(245,240,232,0.5)",
                lineHeight: 1.7,
              }}
            >
              La plupart des visas nécessitent une offre d'emploi en amont — ne
              pas attendre d'être sur place.
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
              🚀 Tu veux travailler en Chine ?
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
              Parlons de ton projet
              <br />
              <span style={{ color: "var(--gold)" }}>
                professionnel en Chine
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
              Quel visa ? Quels secteurs ? Comment trouver un employeur ? On
              répond à toutes tes questions lors d'un appel gratuit de 30 min.
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
                "Visa Z et démarches",
                "Secteurs qui recrutent",
                "Comment se préparer",
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
              Travailler en Chine ne dépend pas de la chance — ça dépend de ta
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
