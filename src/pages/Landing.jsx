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

  const navItems = [
    { emoji: "🎓", label: "Étudier", href: "/etudier", active: true },
    { emoji: "🏢", label: "S'expatrier", href: "/expatrier", active: false },
    { emoji: "✈️", label: "Tourisme", href: "/tourisme", active: true },
    {
      emoji: "🛠",
      label: "Indispensables",
      href: "/indispensables",
      gold: true,
    },
  ];

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
          <Link
            to="/contact"
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
          </Link>
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
            padding: "48px 24px 100px",
            position: "relative",
            zIndex: 1,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            textAlign: "center",
          }}
        >
          {/* MENU NAVIGATION */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(4, 1fr)",
              gap: "2px",
              width: "100%",
              marginBottom: "48px",
              animation: "fadeUp 0.6s ease both",
            }}
            className="nav-grid"
          >
            {navItems.map((s) => (
              <Link
                key={s.label}
                to={s.href}
                className={`nav-card ${s.gold ? "nav-card-gold" : s.active ? "nav-card-active" : "nav-card-soon"}`}
              >
                {!s.active && !s.gold && (
                  <span className="nav-card-badge">Bientôt</span>
                )}
                <span className="nav-card-emoji">{s.emoji}</span>
                <span className="nav-card-label">{s.label}</span>
              </Link>
            ))}
          </div>

          {/* HERO */}
          <div
            style={{
              fontSize: "52px",
              marginBottom: "20px",
              animation: "fadeUp 0.65s 0.05s ease both",
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
              marginBottom: "24px",
              letterSpacing: "-1px",
              animation: "fadeUp 0.65s 0.1s ease both",
            }}
          >
            Chinois
            <br />
            <span style={{ color: "var(--red)" }}>en Devenir</span>
          </h1>

          <p
            style={{
              fontSize: "16px",
              color: "rgba(245,240,232,0.5)",
              lineHeight: 1.8,
              marginBottom: "48px",
              maxWidth: "440px",
              animation: "fadeUp 0.65s 0.15s ease both",
            }}
          >
            Étudier en Chine, s'expatrier ou voyager 🇨🇳 On t'accompagne pour les
            universités, les bourses, les démarches et la préparation de ton
            projet en Chine.
          </p>

          {/* FLÈCHES */}
          <div
            style={{
              display: "flex",
              gap: "40px",
              justifyContent: "center",
              marginBottom: "40px",
              animation: "fadeUp 0.65s 0.2s ease both",
            }}
          >
            {[
              { label: "Appel", color: "var(--gold)" },
              { label: "Email", color: "var(--gold)" },
            ].map((item, i) => (
              <div
                key={item.label}
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
                    color: item.color,
                  }}
                >
                  {item.label}
                </span>
                <span
                  style={{
                    fontSize: "20px",
                    color: item.color,
                    display: "inline-block",
                    animation: `bounce 1.5s ${i * 0.3}s infinite`,
                  }}
                >
                  ↓
                </span>
              </div>
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
            {/* APPEL */}
            <div className="action-card action-card-call">
              <div className="action-card-tag">Recommandé</div>
              <span className="action-card-icon">📞</span>
              <p className="action-card-title">
                Appel gratuit
                <br />
                <span>30 min</span>
              </p>
              <p className="action-card-desc">
                On analyse ton profil, on identifie les universités et bourses
                adaptées, et on t'explique les vraies étapes à suivre pour
                2026/2027.
              </p>
              <a
                href={CALENDLY_URL}
                target="_blank"
                rel="noreferrer"
                className="action-card-btn action-card-btn-red"
              >
                📞 Réserver mon appel gratuit →
              </a>
              <p className="action-card-sub">Sans engagement</p>
            </div>

            {/* EMAIL */}
            <div className="action-card action-card-email">
              <span className="action-card-icon">📬</span>
              <p className="action-card-title">
                Rester
                <br />
                <span>informé</span>
              </p>
              <p className="action-card-desc">
                Reçois les dates d'ouverture des candidatures, les bourses
                disponibles et les rappels importants pour ne rien rater en
                2026/2027.
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
                    className="action-input"
                    onFocus={(e) =>
                      (e.target.style.borderColor = "var(--gold)")
                    }
                    onBlur={(e) =>
                      (e.target.style.borderColor = "rgba(212,168,83,0.25)")
                    }
                  />
                  <input
                    type="email"
                    placeholder="Email *"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
                    className="action-input"
                    onFocus={(e) =>
                      (e.target.style.borderColor = "var(--gold)")
                    }
                    onBlur={(e) =>
                      (e.target.style.borderColor = "rgba(212,168,83,0.25)")
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
                    className="action-card-btn action-card-btn-gold"
                    style={{
                      opacity: loading ? 0.5 : 1,
                      cursor: loading ? "not-allowed" : "pointer",
                    }}
                  >
                    {loading ? "Envoi…" : "📬 Recevoir les infos →"}
                  </button>
                </div>
              )}
            </div>
          </div>

          <p
            style={{
              fontSize: "12px",
              color: "rgba(245,240,232,0.45)",
              letterSpacing: "1px",
              marginTop: "24px",
              animation: "fadeUp 0.65s 0.35s ease both",
              display: "flex",
              gap: "8px",
              alignItems: "center",
              flexWrap: "wrap",
              justifyContent: "center",
            }}
          >
            <span>🔒 Aucun spam</span>
            <span style={{ color: "#444" }}>·</span>
            <span>Sans engagement</span>
            <span style={{ color: "#444" }}>·</span>
            <span>Réponse sous 24h</span>
          </p>
        </div>
      </main>

      <footer
        style={{
          borderTop: "1px solid rgba(255,255,255,0.07)",
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
        /* ── NAV CARDS ── */
        .nav-card {
          padding: 20px 16px;
          text-decoration: none;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 8px;
          position: relative;
          transition: all 0.25s ease;
          cursor: pointer;
        }
        .nav-card-active {
          background: var(--dark2);
          border: 1px solid rgba(200,16,46,0.5);
          box-shadow: 0 0 0 1px rgba(200,16,46,0.15), inset 0 0 20px rgba(200,16,46,0.05);
        }
        .nav-card-soon {
          background: #0d0d0d;
          border: 1px solid rgba(255,255,255,0.1);
        }
        .nav-card-gold {
          background: rgba(212,168,83,0.04);
          border: 1px solid rgba(212,168,83,0.3);
        }
        .nav-card::after {
          content: '↗';
          position: absolute;
          bottom: 8px; right: 10px;
          font-size: 10px; color: #333;
          transition: color 0.25s, transform 0.25s;
        }
        .nav-card-active::after { color: rgba(200,16,46,0.4); }
        .nav-card-gold::after { color: rgba(212,168,83,0.3); }
        .nav-card-active:hover {
          background: #1e1010;
          border-color: var(--red);
          transform: translateY(-4px);
          box-shadow: 0 12px 32px rgba(200,16,46,0.25);
        }
        .nav-card-soon:hover {
          background: #141414;
          border-color: rgba(212,168,83,0.4);
          transform: translateY(-4px);
          box-shadow: 0 12px 24px rgba(0,0,0,0.5);
        }
        .nav-card-gold:hover {
          background: rgba(212,168,83,0.1);
          border-color: var(--gold);
          transform: translateY(-4px);
          box-shadow: 0 12px 32px rgba(212,168,83,0.15);
        }
        .nav-card:hover::after { color: var(--gold); transform: translate(2px, -2px); }
        .nav-card-active:hover .nav-card-label { color: var(--red); }
        .nav-card-soon:hover .nav-card-label { color: rgba(245,240,232,0.6); }
        .nav-card-gold:hover .nav-card-label { color: var(--gold); }
        .nav-card-active:hover .nav-card-emoji { transform: scale(1.2); }
        .nav-card-soon:hover .nav-card-emoji { transform: scale(1.1); }
        .nav-card-gold:hover .nav-card-emoji { transform: scale(1.2); }
        .nav-card-badge {
          position: absolute; top: 0; right: 0;
          font-size: 7px; font-weight: 700; letter-spacing: 1px;
          text-transform: uppercase; color: var(--gold);
          background: rgba(212,168,83,0.08);
          border-bottom: 1px solid rgba(212,168,83,0.15);
          border-left: 1px solid rgba(212,168,83,0.15);
          padding: 3px 8px;
        }
        .nav-card-emoji { font-size: 24px; transition: transform 0.25s ease; }
        .nav-card-label {
          font-family: "Playfair Display", serif;
          font-size: 13px; font-weight: 700; letter-spacing: 0.5px;
          transition: color 0.25s ease;
        }
        .nav-card-active .nav-card-label { color: var(--light); }
        .nav-card-soon .nav-card-label { color: rgba(245,240,232,0.4); }
        .nav-card-gold .nav-card-label { color: var(--gold); }

        /* ── ACTION CARDS ── */
        .action-card {
          padding: 32px 24px;
          display: flex; flex-direction: column;
          position: relative; overflow: hidden;
          transition: transform 0.25s ease, box-shadow 0.25s ease;
        }
        .action-card:hover { transform: translateY(-3px); }
        .action-card-call {
          background: var(--dark2);
          border: 1px solid rgba(200,16,46,0.2);
        }
        .action-card-call:hover {
          border-color: rgba(200,16,46,0.5);
          box-shadow: 0 12px 40px rgba(200,16,46,0.15);
        }
        .action-card-email {
          background: #0f0f0f;
          border: 1px solid rgba(212,168,83,0.1);
        }
        .action-card-email:hover {
          border-color: rgba(212,168,83,0.35);
          box-shadow: 0 12px 40px rgba(212,168,83,0.08);
        }
        .action-card-tag {
          position: absolute; top: 0; right: 0;
          background: var(--red); color: white;
          font-size: 8px; font-weight: 700;
          letter-spacing: 1.5px; text-transform: uppercase;
          padding: 5px 10px;
        }
        .action-card-icon { font-size: 28px; margin-bottom: 12px; transition: transform 0.25s ease; }
        .action-card:hover .action-card-icon { transform: scale(1.15); }
        .action-card-title {
          font-family: "Playfair Display", serif;
          font-size: 18px; font-weight: 700;
          color: var(--light); line-height: 1.2; margin-bottom: 8px;
        }
        .action-card-call .action-card-title span { color: var(--gold); }
        .action-card-email .action-card-title span { color: var(--gold); }
        .action-card-desc {
          font-size: 12px; color: rgba(245,240,232,0.35);
          line-height: 1.6; margin-bottom: 20px; flex: 1;
        }
        .action-card-btn {
          display: block; text-align: center;
          font-size: 11px; font-weight: 700;
          letter-spacing: 1.5px; text-transform: uppercase;
          padding: 14px; text-decoration: none;
          border: none; width: 100%;
          transition: all 0.2s ease; cursor: pointer;
        }
        .action-card-btn-red { background: var(--red); color: white; }
        .action-card-btn-red:hover { background: #a50e26; letter-spacing: 2.5px; }
        .action-card-btn-gold {
          background: rgba(212,168,83,0.1);
          border: 1px solid rgba(212,168,83,0.3) !important;
          color: var(--gold);
          font-family: "DM Sans", sans-serif;
        }
        .action-card-btn-gold:hover { background: rgba(212,168,83,0.2); letter-spacing: 2.5px; }
        .action-card-sub { font-size: 10px; color: #555; text-align: center; margin-top: 10px; }
        .action-input {
          background: rgba(255,255,255,0.04);
          border: 1px solid rgba(212,168,83,0.25);
          color: var(--light); font-family: "DM Sans", sans-serif;
          font-size: 13px; padding: 11px 13px;
          outline: none; width: 100%; box-sizing: border-box;
          transition: border-color 0.2s, background 0.2s;
        }
        .action-input:hover { background: rgba(255,255,255,0.06); }

        /* ── ANIMATIONS ── */
        @keyframes bounce {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(6px); }
        }
        @media (max-width: 600px) {
          .nav-grid { grid-template-columns: repeat(2, 1fr) !important; }
          .action-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </>
  );
}
