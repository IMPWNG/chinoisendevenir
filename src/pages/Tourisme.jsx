import Nav from "../components/Nav.jsx";
import LeadForm from "../components/LeadForm.jsx";
import { Link } from "react-router-dom";

const DESTINATIONS = [
  {
    icon: "📍",
    ville: "Beijing",
    desc: "Histoire, culture et monuments emblématiques",
  },
  {
    icon: "📍",
    ville: "Shanghai",
    desc: "Modernité et skyline impressionnante",
  },
  {
    icon: "📍",
    ville: "Xi'an",
    desc: "Armée de terre cuite et histoire impériale",
  },
  {
    icon: "📍",
    ville: "Guilin",
    desc: "Paysages naturels parmi les plus beaux du monde",
  },
  { icon: "📍", ville: "Chengdu", desc: "Pandas et culture du Sichuan" },
];

const RAISONS = [
  "Découvrir une des plus anciennes civilisations du monde",
  "Explorer des paysages uniques au monde",
  "Goûter à une gastronomie riche et variée",
  "Vivre un choc culturel fort et enrichissant",
];

const MISSION = [
  "Préparer votre voyage étape par étape",
  "Éviter les erreurs classiques",
  "Accéder aux bonnes adresses",
  "Comprendre la culture et les codes locaux",
  "Voyager sereinement, même sans parler chinois",
];

export default function Tourisme() {
  return (
    <>
      <Nav />

      <main style={{ paddingTop: "64px", position: "relative", zIndex: 1 }}>
        {/* glow */}
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
            🌏 Voyager en Chine
          </div>

          <h1
            style={{
              fontFamily: '"Playfair Display", serif',
              fontSize: "clamp(32px, 5vw, 60px)",
              fontWeight: 900,
              lineHeight: 1.1,
              marginBottom: "24px",
              animation: "fadeUp 0.7s 0.05s ease both",
            }}
          >
            Un monde
            <br />
            <span style={{ color: "var(--red)" }}>à découvrir.</span>
          </h1>

          <p
            style={{
              fontSize: "17px",
              color: "rgba(245,240,232,0.55)",
              lineHeight: 1.8,
              maxWidth: "580px",
              margin: "0 auto 16px",
              animation: "fadeUp 0.7s 0.1s ease both",
            }}
          >
            La Chine n'est pas une destination comme les autres. C'est un
            continent à elle seule. Entre modernité futuriste et traditions
            millénaires, chaque voyage est une immersion unique dans une culture
            riche, fascinante et dépaysante.
          </p>

          <p
            style={{
              fontSize: "15px",
              color: "rgba(245,240,232,0.4)",
              lineHeight: 1.8,
              maxWidth: "520px",
              margin: "0 auto",
              animation: "fadeUp 0.7s 0.15s ease both",
            }}
          >
            Des gratte-ciel de Shanghai aux paysages de Zhangjiajie, en passant
            par la Grande Muraille — la Chine offre une diversité incroyable.
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
          {/* ── POURQUOI ── */}
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
              <span style={{ fontSize: "24px" }}>🇨🇳</span>
              <h2
                style={{
                  fontFamily: '"Playfair Display", serif',
                  fontSize: "22px",
                  fontWeight: 700,
                  color: "var(--light)",
                }}
              >
                Pourquoi voyager en Chine ?
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
              {RAISONS.map((r) => (
                <div
                  key={r}
                  style={{
                    background: "var(--dark2)",
                    border: "1px solid rgba(255,255,255,0.05)",
                    padding: "20px 24px",
                    display: "flex",
                    alignItems: "flex-start",
                    gap: "12px",
                  }}
                >
                  <span
                    style={{
                      color: "var(--gold)",
                      fontWeight: 700,
                      flexShrink: 0,
                    }}
                  >
                    ✔️
                  </span>
                  <span
                    style={{
                      fontSize: "14px",
                      color: "rgba(245,240,232,0.65)",
                      lineHeight: 1.6,
                    }}
                  >
                    {r}
                  </span>
                </div>
              ))}
            </div>

            <div
              style={{
                marginTop: "16px",
                padding: "20px 24px",
                background: "rgba(200,16,46,0.05)",
                border: "1px solid rgba(200,16,46,0.15)",
                fontSize: "15px",
                color: "rgba(245,240,232,0.6)",
                lineHeight: 1.7,
                fontStyle: "italic",
              }}
            >
              Surtout… c'est vivre une expérience que peu de destinations
              peuvent offrir aujourd'hui.
            </div>
          </section>

          {/* ── ATTENTION ── */}
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
                Un voyage qui se prépare
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
              {[
                {
                  icon: "🔐",
                  titre: "Visa",
                  desc: "Les démarches sont spécifiques et prennent du temps.",
                },
                {
                  icon: "📱",
                  titre: "Applications locales",
                  desc: "WeChat, Alipay — tout est différent en Chine.",
                },
                {
                  icon: "💳",
                  titre: "Paiements mobiles",
                  desc: "Les espèces et cartes étrangères sont peu acceptées.",
                },
                {
                  icon: "🗣️",
                  titre: "Barrière de la langue",
                  desc: "Peu de personnes parlent anglais, même en ville.",
                },
              ].map((item) => (
                <div
                  key={item.titre}
                  style={{
                    background: "var(--dark2)",
                    border: "1px solid rgba(255,255,255,0.05)",
                    padding: "24px",
                    transition: "border-color 0.2s",
                  }}
                  className="hover-card"
                >
                  <div style={{ fontSize: "24px", marginBottom: "10px" }}>
                    {item.icon}
                  </div>
                  <div
                    style={{
                      fontFamily: '"Playfair Display", serif',
                      fontSize: "15px",
                      fontWeight: 700,
                      color: "var(--light)",
                      marginBottom: "6px",
                    }}
                  >
                    {item.titre}
                  </div>
                  <div
                    style={{
                      fontSize: "13px",
                      color: "rgba(245,240,232,0.45)",
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
                border: "1px solid rgba(200,16,46,0.2)",
                fontSize: "14px",
                color: "rgba(245,240,232,0.55)",
                lineHeight: 1.7,
              }}
            >
              ⚡ Un mauvais choix ou un manque d'anticipation peut rapidement
              transformer ton voyage en galère.
            </div>
          </section>

          {/* ── DESTINATIONS ── */}
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
              <span style={{ fontSize: "24px" }}>✈️</span>
              <h2
                style={{
                  fontFamily: '"Playfair Display", serif',
                  fontSize: "22px",
                  fontWeight: 700,
                  color: "var(--light)",
                }}
              >
                Les destinations incontournables
              </h2>
            </div>

            <div
              style={{ display: "flex", flexDirection: "column", gap: "2px" }}
            >
              {DESTINATIONS.map((d, i) => (
                <div
                  key={d.ville}
                  style={{
                    background: "var(--dark2)",
                    border: "1px solid rgba(255,255,255,0.05)",
                    padding: "20px 28px",
                    display: "flex",
                    alignItems: "center",
                    gap: "20px",
                    transition: "border-color 0.2s, background 0.2s",
                  }}
                  className="hover-card"
                >
                  <div
                    style={{
                      fontFamily: '"Playfair Display", serif',
                      fontSize: "28px",
                      fontWeight: 900,
                      color: "rgba(212,168,83,0.15)",
                      minWidth: "40px",
                      textAlign: "center",
                      lineHeight: 1,
                    }}
                  >
                    {String(i + 1).padStart(2, "0")}
                  </div>
                  <div>
                    <div
                      style={{
                        fontFamily: '"Playfair Display", serif',
                        fontSize: "17px",
                        fontWeight: 700,
                        color: "var(--light)",
                        marginBottom: "4px",
                      }}
                    >
                      {d.ville}
                    </div>
                    <div
                      style={{
                        fontSize: "13px",
                        color: "rgba(245,240,232,0.45)",
                        lineHeight: 1.5,
                      }}
                    >
                      {d.desc}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* ── GASTRONOMIE ── */}
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
              <span style={{ fontSize: "24px" }}>🍜</span>
              <h2
                style={{
                  fontFamily: '"Playfair Display", serif',
                  fontSize: "22px",
                  fontWeight: 700,
                  color: "var(--light)",
                }}
              >
                Une gastronomie unique
              </h2>
            </div>

            <div
              style={{
                background: "var(--dark2)",
                border: "1px solid rgba(255,255,255,0.05)",
                padding: "32px",
              }}
            >
              <p
                style={{
                  fontSize: "15px",
                  color: "rgba(245,240,232,0.6)",
                  lineHeight: 1.8,
                  marginBottom: "12px",
                }}
              >
                La cuisine chinoise est bien plus que ce que l'on connaît en
                Occident. Chaque région possède ses spécialités, ses saveurs,
                ses traditions.
              </p>
              <p
                style={{
                  fontSize: "14px",
                  color: "var(--gold)",
                  lineHeight: 1.7,
                  margin: 0,
                }}
              >
                Du Peking Duck à la street food locale — chaque repas est une
                expérience.
              </p>
            </div>
          </section>

          {/* ── NOTRE MISSION ── */}
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
              <span style={{ fontSize: "24px" }}>🚀</span>
              <h2
                style={{
                  fontFamily: '"Playfair Display", serif',
                  fontSize: "22px",
                  fontWeight: 700,
                  color: "var(--light)",
                }}
              >
                Notre mission : vous simplifier la Chine
              </h2>
            </div>

            <p
              style={{
                fontSize: "15px",
                color: "rgba(245,240,232,0.5)",
                lineHeight: 1.8,
                marginBottom: "24px",
              }}
            >
              De plus en plus de voyageurs veulent découvrir la Chine… Mais
              beaucoup abandonnent à cause de la complexité. C'est exactement là
              que nous intervenons.
            </p>

            <div
              style={{ display: "flex", flexDirection: "column", gap: "2px" }}
            >
              {MISSION.map((m) => (
                <div
                  key={m}
                  style={{
                    background: "var(--dark2)",
                    border: "1px solid rgba(255,255,255,0.05)",
                    padding: "16px 24px",
                    display: "flex",
                    alignItems: "center",
                    gap: "14px",
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
                    ✔️
                  </span>
                  <span
                    style={{
                      fontSize: "14px",
                      color: "rgba(245,240,232,0.65)",
                      lineHeight: 1.5,
                    }}
                  >
                    {m}
                  </span>
                </div>
              ))}
            </div>
          </section>

          {/* ── LEAD FORM ── */}
          <section
            style={{
              background: "var(--dark2)",
              border: "1px solid rgba(212,168,83,0.15)",
              padding: "48px 40px",
              textAlign: "center",
              marginBottom: "48px",
            }}
          >
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
              📩 Prépare ton voyage avec nous
            </div>

            <h2
              style={{
                fontFamily: '"Playfair Display", serif',
                fontSize: "clamp(22px, 3vw, 32px)",
                fontWeight: 900,
                lineHeight: 1.2,
                marginBottom: "16px",
              }}
            >
              Tu veux voyager en Chine
              <br />
              <span style={{ color: "var(--gold)" }}>
                mais tu ne sais pas par où commencer ?
              </span>
            </h2>

            <p
              style={{
                fontSize: "15px",
                color: "rgba(245,240,232,0.45)",
                lineHeight: 1.7,
                marginBottom: "32px",
                maxWidth: "460px",
                margin: "0 auto 32px",
              }}
            >
              Laisse-nous tes informations et on t'aide à construire un voyage
              adapté à ton profil.
            </p>

            <div
              style={{
                display: "flex",
                flexWrap: "wrap",
                gap: "12px",
                justifyContent: "center",
                marginBottom: "32px",
              }}
            >
              {[
                "✔️ Conseils personnalisés",
                "✔️ Itinéraire optimisé",
                "✔️ Astuces exclusives",
                "✔️ Accompagnement avant départ",
              ].map((item) => (
                <span
                  key={item}
                  style={{
                    border: "1px solid rgba(212,168,83,0.2)",
                    color: "rgba(245,240,232,0.45)",
                    fontSize: "11px",
                    letterSpacing: "0.5px",
                    padding: "6px 14px",
                  }}
                >
                  {item}
                </span>
              ))}
            </div>

            <div style={{ maxWidth: "480px", margin: "0 auto" }}>
              <LeadForm prefix="tourisme" />
            </div>
          </section>

          {/* ── CTA FINAL ── */}
          <div
            style={{
              background: "rgba(200,16,46,0.06)",
              border: "1px solid rgba(200,16,46,0.2)",
              padding: "40px",
              textAlign: "center",
            }}
          >
            <div style={{ fontSize: "32px", marginBottom: "16px" }}>🔥</div>
            <h3
              style={{
                fontFamily: '"Playfair Display", serif',
                fontSize: "22px",
                fontWeight: 900,
                color: "var(--light)",
                marginBottom: "12px",
                lineHeight: 1.3,
              }}
            >
              La Chine peut changer ta vision du monde.
            </h3>
            <p
              style={{
                fontSize: "14px",
                color: "rgba(245,240,232,0.45)",
                lineHeight: 1.7,
                marginBottom: "28px",
              }}
            >
              Mais encore faut-il bien s'y préparer. Ne perds pas de temps à
              chercher des infos partout.
            </p>
            <Link
              to="/contact"
              style={{
                display: "inline-block",
                background: "var(--red)",
                color: "white",
                fontSize: "11px",
                fontWeight: 700,
                letterSpacing: "2px",
                textTransform: "uppercase",
                padding: "14px 32px",
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
              On en parle — appel gratuit →
            </Link>
          </div>
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
        }
      `}</style>
    </>
  );
}
