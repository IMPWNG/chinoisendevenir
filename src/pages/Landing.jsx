import { useState } from "react";
import { Link } from "react-router-dom";

const CALENDLY_URL = "https://calendly.com/chinoisendevenir/30min";

export default function Landing() {
  const [prenom, setPrenom] = useState("");
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit() {
    setError("");
    if (!prenom.trim()) {
      setError("⚠ Prénom requis.");
      return;
    }
    if (!email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError("⚠ Email invalide.");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("/api/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prenom: prenom.trim(), email: email.trim() }),
      });
      const json = await res.json().catch(() => ({}));
      if (res.ok && json.success) setSuccess(true);
      else setError(json.error || "Une erreur est survenue.");
    } catch {
      setError("⚠ Connexion impossible.");
    } finally {
      setLoading(false);
    }
  }

  const services = [
    {
      emoji: "🎓",
      label: "Étudier en Chine",
      sub: "Guide 2026/2027",
      href: "/etudier",
      color: "var(--red)",
    },
    {
      emoji: "🏢",
      label: "S'expatrier",
      sub: "Vivre & travailler",
      href: "/a-venir",
      color: "#888",
    },
    {
      emoji: "✈️",
      label: "Tourisme",
      sub: "Préparer ton séjour",
      href: "/a-venir",
      color: "#888",
    },
    {
      emoji: "🀄",
      label: "Mandarin",
      sub: "Apprendre la langue",
      href: "/a-venir",
      color: "#888",
    },
  ];

  return (
    <>
      {/* ── NAV minimal ── */}
      <nav
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          zIndex: 100,
          background: "rgba(13,13,13,0.95)",
          borderBottom: "1px solid var(--border)",
          backdropFilter: "blur(12px)",
        }}
      >
        <div
          style={{
            maxWidth: "1200px",
            margin: "0 auto",
            padding: "0 32px",
            height: "64px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <span
            style={{
              fontFamily: '"Playfair Display", serif',
              fontSize: "16px",
              fontWeight: 700,
              color: "var(--light)",
              display: "flex",
              alignItems: "center",
              gap: "10px",
            }}
          >
            🇨🇳 <span style={{ color: "var(--red)" }}>Chinois</span> en Devenir
          </span>
          <a
            href={CALENDLY_URL}
            target="_blank"
            rel="noreferrer"
            style={{
              background: "var(--red)",
              color: "white",
              fontSize: "11px",
              fontWeight: 700,
              letterSpacing: "1.5px",
              textTransform: "uppercase",
              padding: "10px 20px",
              textDecoration: "none",
              transition: "background 0.2s",
            }}
            onMouseEnter={(e) => (e.currentTarget.style.background = "#a50e26")}
            onMouseLeave={(e) =>
              (e.currentTarget.style.background = "var(--red)")
            }
          >
            Appel gratuit →
          </a>
        </div>
      </nav>

      <main
        style={{
          minHeight: "100vh",
          paddingTop: "64px",
          position: "relative",
          overflow: "hidden",
        }}
      >
        {/* glow bg */}
        <div
          style={{
            position: "fixed",
            inset: 0,
            pointerEvents: "none",
            zIndex: 0,
            background:
              "radial-gradient(ellipse 60% 50% at 50% 30%, rgba(200,16,46,0.1) 0%, transparent 65%)",
          }}
        />

        <div
          style={{
            maxWidth: "560px",
            margin: "0 auto",
            padding: "72px 24px 80px",
            position: "relative",
            zIndex: 1,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            textAlign: "center",
          }}
        >
          {/* FLAG */}
          <div
            style={{
              fontSize: "52px",
              marginBottom: "24px",
              animation: "fadeUp 0.6s ease both",
            }}
          >
            🇨🇳
          </div>

          {/* HEADLINE — ultra court, ultra impactant */}
          <h1
            style={{
              fontFamily: '"Playfair Display", serif',
              fontSize: "clamp(38px, 7vw, 68px)",
              fontWeight: 900,
              lineHeight: 1.0,
              marginBottom: "16px",
              animation: "fadeUp 0.7s 0.05s ease both",
              letterSpacing: "-1px",
            }}
          >
            Ton projet
            <br />
            <span style={{ color: "var(--red)" }}>Chine.</span>
          </h1>

          <p
            style={{
              fontSize: "16px",
              color: "rgba(245,240,232,0.45)",
              lineHeight: 1.6,
              marginBottom: "52px",
              animation: "fadeUp 0.7s 0.1s ease both",
              maxWidth: "380px",
            }}
          >
            Études, expatriation, tourisme.
            <br />
            On t'accompagne de A à Z.
          </p>

          {/* ── SERVICES GRID ── */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: "2px",
              width: "100%",
              marginBottom: "48px",
              animation: "fadeUp 0.7s 0.15s ease both",
            }}
          >
            {services.map((s) => (
              <Link
                key={s.label}
                to={s.href}
                style={{
                  background: "var(--dark2)",
                  border: `1px solid ${s.color === "var(--red)" ? "rgba(200,16,46,0.25)" : "rgba(255,255,255,0.04)"}`,
                  padding: "28px 24px",
                  textDecoration: "none",
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "flex-start",
                  gap: "6px",
                  transition: "border-color 0.2s, background 0.2s",
                  position: "relative",
                  overflow: "hidden",
                  textAlign: "left",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor =
                    s.color === "var(--red)"
                      ? "rgba(200,16,46,0.6)"
                      : "rgba(212,168,83,0.2)";
                  e.currentTarget.style.background = "#161616";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor =
                    s.color === "var(--red)"
                      ? "rgba(200,16,46,0.25)"
                      : "rgba(255,255,255,0.04)";
                  e.currentTarget.style.background = "var(--dark2)";
                }}
              >
                {s.color === "var(--red)" && (
                  <div
                    style={{
                      position: "absolute",
                      top: 0,
                      right: 0,
                      background: "var(--red)",
                      color: "white",
                      fontSize: "8px",
                      fontWeight: 700,
                      letterSpacing: "1.5px",
                      textTransform: "uppercase",
                      padding: "4px 10px",
                    }}
                  >
                    Disponible
                  </div>
                )}
                {s.color !== "var(--red)" && (
                  <div
                    style={{
                      position: "absolute",
                      top: 0,
                      right: 0,
                      background: "rgba(255,255,255,0.04)",
                      color: "#555",
                      fontSize: "8px",
                      fontWeight: 700,
                      letterSpacing: "1.5px",
                      textTransform: "uppercase",
                      padding: "4px 10px",
                    }}
                  >
                    Bientôt
                  </div>
                )}
                <span style={{ fontSize: "28px", lineHeight: 1 }}>
                  {s.emoji}
                </span>
                <span
                  style={{
                    fontFamily: '"Playfair Display", serif',
                    fontSize: "16px",
                    fontWeight: 700,
                    color:
                      s.color === "var(--red)"
                        ? "var(--light)"
                        : "rgba(245,240,232,0.35)",
                    lineHeight: 1.2,
                  }}
                >
                  {s.label}
                </span>
                <span
                  style={{
                    fontSize: "11px",
                    letterSpacing: "0.5px",
                    color: s.color === "var(--red)" ? "var(--gold)" : "#444",
                  }}
                >
                  {s.sub}
                </span>
              </Link>
            ))}
          </div>

          {/* ── DIVIDER ── */}
          <div
            style={{
              width: "100%",
              marginBottom: "40px",
              display: "flex",
              alignItems: "center",
              gap: "16px",
              animation: "fadeUp 0.7s 0.2s ease both",
            }}
          >
            <div
              style={{
                flex: 1,
                height: "1px",
                background: "rgba(255,255,255,0.06)",
              }}
            />
            <span
              style={{
                fontSize: "10px",
                letterSpacing: "2px",
                textTransform: "uppercase",
                color: "#444",
              }}
            >
              agis maintenant
            </span>
            <div
              style={{
                flex: 1,
                height: "1px",
                background: "rgba(255,255,255,0.06)",
              }}
            />
          </div>

          {/* ── DEUX ACTIONS ── */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: "2px",
              width: "100%",
              animation: "fadeUp 0.7s 0.25s ease both",
            }}
            className="action-grid"
          >
            {/* GAUCHE — Calendly */}
            <div
              style={{
                background: "var(--dark2)",
                border: "1px solid rgba(200,16,46,0.2)",
                padding: "32px 28px",
              }}
            >
              <div
                style={{
                  fontSize: "10px",
                  fontWeight: 700,
                  letterSpacing: "2px",
                  textTransform: "uppercase",
                  color: "var(--gold)",
                  marginBottom: "12px",
                }}
              >
                Recommandé
              </div>
              <div style={{ fontSize: "28px", marginBottom: "10px" }}>📞</div>
              <p
                style={{
                  fontFamily: '"Playfair Display", serif',
                  fontSize: "17px",
                  fontWeight: 700,
                  color: "var(--light)",
                  lineHeight: 1.3,
                  marginBottom: "8px",
                }}
              >
                Appel gratuit
                <br />
                30 min
              </p>
              <p
                style={{
                  fontSize: "12px",
                  color: "rgba(245,240,232,0.4)",
                  lineHeight: 1.6,
                  marginBottom: "24px",
                }}
              >
                On analyse ton profil et ton projet ensemble.
              </p>
              <a
                href={CALENDLY_URL}
                target="_blank"
                rel="noreferrer"
                style={{
                  display: "block",
                  background: "var(--red)",
                  color: "white",
                  textAlign: "center",
                  fontSize: "11px",
                  fontWeight: 700,
                  letterSpacing: "1.5px",
                  textTransform: "uppercase",
                  padding: "14px 16px",
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
                Réserver →
              </a>
            </div>

            {/* DROITE — Email */}
            <div
              style={{
                background: "#0f0f0f",
                border: "1px solid rgba(212,168,83,0.1)",
                padding: "32px 28px",
              }}
            >
              <div
                style={{
                  fontSize: "10px",
                  fontWeight: 700,
                  letterSpacing: "2px",
                  textTransform: "uppercase",
                  color: "#555",
                  marginBottom: "12px",
                }}
              >
                Rester informé
              </div>
              <div style={{ fontSize: "28px", marginBottom: "10px" }}>📬</div>
              <p
                style={{
                  fontFamily: '"Playfair Display", serif',
                  fontSize: "17px",
                  fontWeight: 700,
                  color: "var(--light)",
                  lineHeight: 1.3,
                  marginBottom: "8px",
                }}
              >
                Infos & dates
                <br />
                2026/2027
              </p>
              <p
                style={{
                  fontSize: "12px",
                  color: "rgba(245,240,232,0.4)",
                  lineHeight: 1.6,
                  marginBottom: "20px",
                }}
              >
                Reçois les deadlines et mises à jour.
              </p>

              {success ? (
                <div style={{ textAlign: "center", padding: "12px 0" }}>
                  <div style={{ fontSize: "28px", marginBottom: "8px" }}>
                    ✅
                  </div>
                  <p style={{ fontSize: "12px", color: "var(--gold)" }}>
                    Inscrit !
                  </p>
                </div>
              ) : (
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: "8px",
                  }}
                >
                  <input
                    type="text"
                    placeholder="Prénom *"
                    value={prenom}
                    onChange={(e) => setPrenom(e.target.value)}
                    style={{
                      background: "rgba(255,255,255,0.05)",
                      border: "1px solid rgba(212,168,83,0.2)",
                      color: "var(--light)",
                      fontFamily: '"DM Sans", sans-serif',
                      fontSize: "13px",
                      padding: "11px 14px",
                      outline: "none",
                      width: "100%",
                      boxSizing: "border-box",
                    }}
                    onFocus={(e) =>
                      (e.target.style.borderColor = "var(--gold)")
                    }
                    onBlur={(e) =>
                      (e.target.style.borderColor = "rgba(212,168,83,0.2)")
                    }
                  />
                  <input
                    type="email"
                    placeholder="Email *"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
                    style={{
                      background: "rgba(255,255,255,0.05)",
                      border: "1px solid rgba(212,168,83,0.2)",
                      color: "var(--light)",
                      fontFamily: '"DM Sans", sans-serif',
                      fontSize: "13px",
                      padding: "11px 14px",
                      outline: "none",
                      width: "100%",
                      boxSizing: "border-box",
                    }}
                    onFocus={(e) =>
                      (e.target.style.borderColor = "var(--gold)")
                    }
                    onBlur={(e) =>
                      (e.target.style.borderColor = "rgba(212,168,83,0.2)")
                    }
                  />
                  {error && (
                    <p
                      style={{ fontSize: "11px", color: "#ff6b6b", margin: 0 }}
                    >
                      {error}
                    </p>
                  )}
                  <button
                    onClick={handleSubmit}
                    disabled={loading}
                    style={{
                      background: "rgba(212,168,83,0.12)",
                      border: "1px solid rgba(212,168,83,0.3)",
                      color: "var(--gold)",
                      fontFamily: '"DM Sans", sans-serif',
                      fontSize: "11px",
                      fontWeight: 700,
                      letterSpacing: "1.5px",
                      textTransform: "uppercase",
                      padding: "13px",
                      cursor: loading ? "not-allowed" : "pointer",
                      opacity: loading ? 0.5 : 1,
                      transition: "background 0.2s",
                      width: "100%",
                    }}
                    onMouseEnter={(e) =>
                      !loading &&
                      (e.currentTarget.style.background =
                        "rgba(212,168,83,0.2)")
                    }
                    onMouseLeave={(e) =>
                      (e.currentTarget.style.background =
                        "rgba(212,168,83,0.12)")
                    }
                  >
                    {loading ? "Envoi…" : "S'inscrire →"}
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* reassurance */}
          <p
            style={{
              fontSize: "10px",
              color: "rgba(255,255,255,0.15)",
              letterSpacing: "1px",
              marginTop: "20px",
              animation: "fadeUp 0.7s 0.3s ease both",
            }}
          >
            🔒 Aucun spam &nbsp;·&nbsp; Sans engagement &nbsp;·&nbsp; Réponse
            sous 24h
          </p>
        </div>
      </main>

      <footer
        style={{
          borderTop: "1px solid var(--border)",
          padding: "20px 24px",
          textAlign: "center",
          fontSize: "11px",
          color: "#444",
          letterSpacing: "1px",
          position: "relative",
          zIndex: 1,
        }}
      >
        <p>
          🇨🇳 Chinois en Devenir &nbsp;·&nbsp;{" "}
          <span style={{ color: "var(--red)" }}>2026/2027</span> &nbsp;·&nbsp;
          Tous droits réservés
        </p>
      </footer>

      <style>{`
        @media (max-width: 480px) {
          .action-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </>
  );
}
