import { Link } from "react-router-dom";
import LeadForm from "../components/LeadForm.jsx";

export default function Landing() {
  const navItems = [
    { emoji: "🎓", label: "Étudier", href: "/etudier", active: true },
    { emoji: "🏢", label: "S'expatrier", href: "/expatrier", active: true },
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

      <main style={{ paddingTop: "64px", position: "relative", zIndex: 1 }}>
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
            maxWidth: "560px",
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
              marginBottom: "20px",
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
              maxWidth: "420px",
              animation: "fadeUp 0.65s 0.15s ease both",
            }}
          >
            Étudier, s'expatrier ou voyager en Chine 🇨🇳
            <br />
            On t'accompagne de A à Z.
          </p>

          {/* FORM UNIQUE */}
          <div
            style={{
              width: "100%",
              background: "var(--dark2)",
              border: "1px solid rgba(212,168,83,0.2)",
              padding: "32px 28px",
              animation: "fadeUp 0.65s 0.2s ease both",
            }}
          >
            <div
              style={{
                fontSize: "10px",
                fontWeight: 700,
                letterSpacing: "3px",
                textTransform: "uppercase",
                color: "var(--gold)",
                marginBottom: "8px",
              }}
            >
              Laisse tes informations
            </div>
            <p
              style={{
                fontSize: "13px",
                color: "rgba(245,240,232,0.4)",
                lineHeight: 1.6,
                marginBottom: "24px",
              }}
            >
              On te recontacte pour t'orienter vers les meilleures options selon
              ton profil.
            </p>
            <LeadForm
              prefix="landing"
              source="landing"
              submitLabel="Envoyer mes informations →"
            />
          </div>

          <p
            style={{
              fontSize: "12px",
              color: "rgba(245,240,232,0.3)",
              letterSpacing: "1px",
              marginTop: "20px",
              animation: "fadeUp 0.65s 0.25s ease both",
              display: "flex",
              gap: "8px",
              alignItems: "center",
              flexWrap: "wrap",
              justifyContent: "center",
            }}
          >
            <span>🔒 Aucun spam</span>
            <span style={{ color: "#333" }}>·</span>
            <span>Sans engagement</span>
            <span style={{ color: "#333" }}>·</span>
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
        .nav-card { padding: 20px 16px; text-decoration: none; display: flex; flex-direction: column; align-items: center; gap: 8px; position: relative; transition: all 0.25s ease; cursor: pointer; }
        .nav-card-active { background: var(--dark2); border: 1px solid rgba(200,16,46,0.5); box-shadow: 0 0 0 1px rgba(200,16,46,0.15), inset 0 0 20px rgba(200,16,46,0.05); }
        .nav-card-soon { background: #0d0d0d; border: 1px solid rgba(255,255,255,0.1); }
        .nav-card-gold { background: rgba(212,168,83,0.04); border: 1px solid rgba(212,168,83,0.3); }
        .nav-card::after { content: '↗'; position: absolute; bottom: 8px; right: 10px; font-size: 10px; color: #333; transition: color 0.25s, transform 0.25s; }
        .nav-card-active::after { color: rgba(200,16,46,0.4); }
        .nav-card-gold::after { color: rgba(212,168,83,0.3); }
        .nav-card-active:hover { background: #1e1010; border-color: var(--red); transform: translateY(-4px); box-shadow: 0 12px 32px rgba(200,16,46,0.25); }
        .nav-card-soon:hover { background: #141414; border-color: rgba(212,168,83,0.4); transform: translateY(-4px); box-shadow: 0 12px 24px rgba(0,0,0,0.5); }
        .nav-card-gold:hover { background: rgba(212,168,83,0.1); border-color: var(--gold); transform: translateY(-4px); box-shadow: 0 12px 32px rgba(212,168,83,0.15); }
        .nav-card:hover::after { color: var(--gold); transform: translate(2px, -2px); }
        .nav-card-active:hover .nav-card-label { color: var(--red); }
        .nav-card-soon:hover .nav-card-label { color: rgba(245,240,232,0.6); }
        .nav-card-gold:hover .nav-card-label { color: var(--gold); }
        .nav-card-active:hover .nav-card-emoji { transform: scale(1.2); }
        .nav-card-soon:hover .nav-card-emoji { transform: scale(1.1); }
        .nav-card-gold:hover .nav-card-emoji { transform: scale(1.2); }
        .nav-card-badge { position: absolute; top: 0; right: 0; font-size: 7px; font-weight: 700; letter-spacing: 1px; text-transform: uppercase; color: var(--gold); background: rgba(212,168,83,0.08); border-bottom: 1px solid rgba(212,168,83,0.15); border-left: 1px solid rgba(212,168,83,0.15); padding: 3px 8px; }
        .nav-card-emoji { font-size: 24px; transition: transform 0.25s ease; }
        .nav-card-label { font-family: "Playfair Display", serif; font-size: 13px; font-weight: 700; letter-spacing: 0.5px; transition: color 0.25s ease; }
        .nav-card-active .nav-card-label { color: var(--light); }
        .nav-card-soon .nav-card-label { color: rgba(245,240,232,0.4); }
        .nav-card-gold .nav-card-label { color: var(--gold); }
        @media (max-width: 600px) { .nav-grid { grid-template-columns: repeat(2, 1fr) !important; } }
      `}</style>
    </>
  );
}
