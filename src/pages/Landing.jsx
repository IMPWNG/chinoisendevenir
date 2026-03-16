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

  return (
    <>
      {/* NAV */}
      <nav
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          zIndex: 100,
          background: "rgba(13,13,13,0.97)",
          borderBottom: "1px solid var(--border)",
          backdropFilter: "blur(12px)",
        }}
      >
        <div
          style={{
            maxWidth: "1100px",
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
              fontSize: "15px",
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
          paddingTop: "64px",
          position: "relative",
          zIndex: 1,
          overflow: "hidden",
        }}
      >
        <div
          style={{
            position: "fixed",
            inset: 0,
            pointerEvents: "none",
            zIndex: 0,
            background:
              "radial-gradient(ellipse 55% 45% at 50% 25%, rgba(200,16,46,0.09) 0%, transparent 65%)",
          }}
        />

        <div
          style={{
            maxWidth: "600px",
            margin: "0 auto",
            padding: "64px 24px 100px",
            position: "relative",
            zIndex: 1,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            textAlign: "center",
          }}
        >
          {/* HERO */}
          <div
            style={{
              fontSize: "56px",
              marginBottom: "20px",
              animation: "fadeUp 0.6s ease both",
            }}
          >
            🇨🇳
          </div>

          <h1
            style={{
              fontFamily: '"Playfair Display", serif',
              fontSize: "clamp(42px, 8vw, 72px)",
              fontWeight: 900,
              lineHeight: 1.0,
              marginBottom: "20px",
              letterSpacing: "-1px",
              animation: "fadeUp 0.65s 0.05s ease both",
            }}
          >
            Chinois
            <br />
            <span style={{ color: "var(--red)" }}>en Devenir</span>
          </h1>

          {/* PRÉSENTATION */}
          <div
            style={{
              animation: "fadeUp 0.65s 0.1s ease both",
              marginBottom: "40px",
              width: "100%",
            }}
          >
            {[
              { e: "🎓", t: "Trouve ton université et étudie en Chine" },
              { e: "🏢", t: "Expatrie-toi et lance ton projet là-bas" },
              { e: "✈️", t: "Prépare ton prochain voyage en toute sérénité" },
            ].map((item) => (
              <div
                key={item.t}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "12px",
                  padding: "10px 0",
                  borderBottom: "1px solid rgba(255,255,255,0.05)",
                  textAlign: "left",
                }}
              >
                <span style={{ fontSize: "20px", flexShrink: 0 }}>
                  {item.e}
                </span>
                <span
                  style={{
                    fontSize: "15px",
                    color: "rgba(245,240,232,0.55)",
                    lineHeight: 1.4,
                  }}
                >
                  {item.t}
                </span>
              </div>
            ))}
          </div>

          {/* FLÈCHES */}
          <div
            style={{
              display: "flex",
              gap: "32px",
              justifyContent: "center",
              marginBottom: "40px",
              animation: "fadeUp 0.65s 0.15s ease both",
            }}
          >
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: "6px",
              }}
            >
              <span
                style={{
                  fontSize: "11px",
                  letterSpacing: "2px",
                  textTransform: "uppercase",
                  color: "var(--gold)",
                }}
              >
                Appel
              </span>
              <span
                style={{
                  fontSize: "20px",
                  color: "var(--gold)",
                  display: "inline-block",
                  animation: "bounce 1.5s infinite",
                }}
              >
                ↓
              </span>
            </div>
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: "6px",
              }}
            >
              <span
                style={{
                  fontSize: "11px",
                  letterSpacing: "2px",
                  textTransform: "uppercase",
                  color: "rgba(245,240,232,0.3)",
                }}
              >
                Email
              </span>
              <span
                style={{
                  fontSize: "20px",
                  color: "rgba(245,240,232,0.3)",
                  display: "inline-block",
                  animation: "bounce 1.5s 0.3s infinite",
                }}
              >
                ↓
              </span>
            </div>
          </div>

          {/* MENU NAVIGATION */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(3, 1fr)",
              gap: "2px",
              width: "100%",
              marginBottom: "48px",
              animation: "fadeUp 0.65s 0.2s ease both",
            }}
            className="nav-grid"
          >
            {[
              { emoji: "🎓", label: "Étudier", href: "/etudier", active: true },
              {
                emoji: "🏢",
                label: "S'expatrier",
                href: "/a-venir",
                active: false,
              },
              {
                emoji: "✈️",
                label: "Tourisme",
                href: "/a-venir",
                active: false,
              },
            ].map((s) => (
              <Link
                key={s.label}
                to={s.href}
                style={{
                  background: s.active ? "var(--dark2)" : "#0a0a0a",
                  border: s.active
                    ? "1px solid rgba(200,16,46,0.25)"
                    : "1px solid rgba(255,255,255,0.04)",
                  padding: "20px 16px",
                  textDecoration: "none",
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  gap: "8px",
                  transition: "border-color 0.2s, background 0.2s",
                  position: "relative",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = s.active
                    ? "rgba(200,16,46,0.5)"
                    : "rgba(212,168,83,0.2)";
                  e.currentTarget.style.background = "#141414";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = s.active
                    ? "rgba(200,16,46,0.25)"
                    : "rgba(255,255,255,0.04)";
                  e.currentTarget.style.background = s.active
                    ? "var(--dark2)"
                    : "#0a0a0a";
                }}
              >
                {!s.active && (
                  <span
                    style={{
                      position: "absolute",
                      top: 0,
                      right: 0,
                      fontSize: "7px",
                      fontWeight: 700,
                      letterSpacing: "1px",
                      textTransform: "uppercase",
                      color: "#444",
                      background: "rgba(255,255,255,0.03)",
                      padding: "3px 8px",
                    }}
                  >
                    Bientôt
                  </span>
                )}
                <span style={{ fontSize: "24px" }}>{s.emoji}</span>
                <span
                  style={{
                    fontFamily: '"Playfair Display", serif',
                    fontSize: "13px",
                    fontWeight: 700,
                    color: s.active ? "var(--light)" : "rgba(245,240,232,0.2)",
                    letterSpacing: "0.5px",
                  }}
                >
                  {s.label}
                </span>
              </Link>
            ))}
          </div>

          {/* SÉPARATEUR */}
          <div
            style={{
              width: "100%",
              display: "flex",
              alignItems: "center",
              gap: "16px",
              marginBottom: "32px",
              animation: "fadeUp 0.65s 0.25s ease both",
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
                fontSize: "9px",
                letterSpacing: "2.5px",
                textTransform: "uppercase",
                color: "#3a3a3a",
              }}
            >
              agir maintenant
            </span>
            <div
              style={{
                flex: 1,
                height: "1px",
                background: "rgba(255,255,255,0.06)",
              }}
            />
          </div>

          {/* 2 BLOCS ACTIONS */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: "2px",
              width: "100%",
              animation: "fadeUp 0.65s 0.3s ease both",
            }}
            className="action-grid"
          >
            {/* BLOC APPEL */}
            <div
              style={{
                background: "var(--dark2)",
                border: "1px solid rgba(200,16,46,0.2)",
                padding: "32px 24px",
                display: "flex",
                flexDirection: "column",
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
                  fontSize: "8px",
                  fontWeight: 700,
                  letterSpacing: "1.5px",
                  textTransform: "uppercase",
                  padding: "5px 10px",
                }}
              >
                Recommandé
              </div>
              <span style={{ fontSize: "28px", marginBottom: "12px" }}>📞</span>
              <p
                style={{
                  fontFamily: '"Playfair Display", serif',
                  fontSize: "18px",
                  fontWeight: 700,
                  color: "var(--light)",
                  lineHeight: 1.2,
                  marginBottom: "8px",
                }}
              >
                Appel gratuit
                <br />
                <span style={{ color: "var(--gold)" }}>30 min</span>
              </p>
              <p
                style={{
                  fontSize: "12px",
                  color: "rgba(245,240,232,0.35)",
                  lineHeight: 1.6,
                  marginBottom: "24px",
                  flex: 1,
                }}
              >
                On fait le point sur ton projet et on t'oriente vers les
                meilleures options.
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
                  padding: "14px",
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
              <p
                style={{
                  fontSize: "10px",
                  color: "#333",
                  textAlign: "center",
                  marginTop: "10px",
                }}
              >
                Sans engagement
              </p>
            </div>

            {/* BLOC EMAIL */}
            <div
              style={{
                background: "#0f0f0f",
                border: "1px solid rgba(212,168,83,0.1)",
                padding: "32px 24px",
                display: "flex",
                flexDirection: "column",
              }}
            >
              <span style={{ fontSize: "28px", marginBottom: "12px" }}>📬</span>
              <p
                style={{
                  fontFamily: '"Playfair Display", serif',
                  fontSize: "18px",
                  fontWeight: 700,
                  color: "var(--light)",
                  lineHeight: 1.2,
                  marginBottom: "8px",
                }}
              >
                Rester
                <br />
                <span style={{ color: "var(--gold)" }}>informé</span>
              </p>
              <p
                style={{
                  fontSize: "12px",
                  color: "rgba(245,240,232,0.35)",
                  lineHeight: 1.6,
                  marginBottom: "20px",
                }}
              >
                Dates, bourses et mises à jour 2026/2027.
              </p>

              {success ? (
                <div
                  style={{
                    textAlign: "center",
                    padding: "16px 0",
                    flex: 1,
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <div style={{ fontSize: "32px", marginBottom: "8px" }}>
                    ✅
                  </div>
                  <p
                    style={{
                      fontSize: "12px",
                      color: "var(--gold)",
                      letterSpacing: "1px",
                    }}
                  >
                    Inscrit !
                  </p>
                </div>
              ) : (
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: "8px",
                    flex: 1,
                    justifyContent: "flex-end",
                  }}
                >
                  <input
                    type="text"
                    placeholder="Prénom *"
                    value={prenom}
                    onChange={(e) => setPrenom(e.target.value)}
                    style={{
                      background: "rgba(255,255,255,0.04)",
                      border: "1px solid rgba(212,168,83,0.2)",
                      color: "var(--light)",
                      fontFamily: '"DM Sans", sans-serif',
                      fontSize: "13px",
                      padding: "11px 13px",
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
                      background: "rgba(255,255,255,0.04)",
                      border: "1px solid rgba(212,168,83,0.2)",
                      color: "var(--light)",
                      fontFamily: '"DM Sans", sans-serif',
                      fontSize: "13px",
                      padding: "11px 13px",
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
                      background: "rgba(212,168,83,0.1)",
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
                        "rgba(212,168,83,0.1)")
                    }
                  >
                    {loading ? "Envoi…" : "S'inscrire →"}
                  </button>
                </div>
              )}
            </div>
          </div>

          <p
            style={{
              fontSize: "10px",
              color: "#2a2a2a",
              letterSpacing: "1px",
              marginTop: "20px",
              animation: "fadeUp 0.65s 0.35s ease both",
            }}
          >
            🔒 Aucun spam &nbsp;·&nbsp; Sans engagement &nbsp;·&nbsp; Réponse
            sous 24h
          </p>
        </div>
      </main>

      <footer
        style={{
          borderTop: "1px solid rgba(255,255,255,0.05)",
          padding: "20px 24px",
          textAlign: "center",
          fontSize: "11px",
          color: "#333",
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
        @keyframes bounce {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(6px); }
        }
        @media (max-width: 480px) {
          .action-grid { grid-template-columns: 1fr !important; }
          .nav-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </>
  );
}
