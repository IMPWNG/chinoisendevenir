import Nav from "../components/Nav.jsx";
import LeadForm from "../components/LeadForm.jsx";

export default function Contact() {
  const CALENDLY_URL = "https://calendly.com/VOTRE_LIEN_CALENDLY";

  return (
    <>
      <Nav />

      <div
        style={{
          position: "fixed",
          inset: 0,
          zIndex: 0,
          pointerEvents: "none",
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='0.03'/%3E%3C/svg%3E")`,
          opacity: 0.4,
        }}
      />

      <main style={{ paddingTop: "64px", position: "relative", zIndex: 1 }}>
        {/* HERO */}
        <section
          style={{
            minHeight: "55vh",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            textAlign: "center",
            padding: "80px 24px 60px",
            position: "relative",
            overflow: "hidden",
          }}
        >
          <div
            style={{
              position: "absolute",
              inset: 0,
              pointerEvents: "none",
              background:
                "radial-gradient(ellipse 70% 50% at 50% 50%, rgba(212,168,83,0.07) 0%, transparent 70%)",
            }}
          />

          <div
            style={{
              display: "inline-block",
              border: "1px solid rgba(212,168,83,0.4)",
              color: "var(--gold)",
              fontSize: "10px",
              fontWeight: 700,
              letterSpacing: "3px",
              textTransform: "uppercase",
              padding: "7px 20px",
              marginBottom: "32px",
              animation: "fadeUp 0.7s ease both",
              position: "relative",
            }}
          >
            🇨🇳 Chinois en Devenir — Parlons de ton projet Chine
          </div>

          <h1
            style={{
              fontFamily: '"Playfair Display", serif',
              fontSize: "clamp(32px, 5vw, 62px)",
              fontWeight: 900,
              lineHeight: 1.1,
              marginBottom: "24px",
              animation: "fadeUp 0.8s 0.1s ease both",
              position: "relative",
              maxWidth: "800px",
            }}
          >
            Tu t'intéresses à la Chine ?<br />
            <span style={{ color: "var(--red)" }}>
              On en parle directement.
            </span>
          </h1>

          <p
            style={{
              fontSize: "17px",
              color: "rgba(245,240,232,0.55)",
              lineHeight: 1.8,
              maxWidth: "560px",
              marginBottom: "0",
              animation: "fadeUp 0.8s 0.2s ease both",
              position: "relative",
            }}
          >
            Études, expatriation, projets futurs… Comprends quelles opportunités
            existent vraiment pour toi. Deux options simples 👇
          </p>
        </section>

        {/* DEUX COLONNES */}
        <section
          style={{
            maxWidth: "1000px",
            margin: "0 auto",
            padding: "0 24px 100px",
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: "2px",
          }}
          className="contact-grid"
        >
          {/* GAUCHE — Calendly */}
          <div
            style={{
              background: "var(--dark2)",
              border: "1px solid rgba(212,168,83,0.2)",
              padding: "48px 40px",
              display: "flex",
              flexDirection: "column",
              animation: "fadeUp 0.8s 0.3s ease both",
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
                padding: "6px 14px",
              }}
            >
              Recommandé
            </div>

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
              1️⃣ Parler avec nous
            </div>

            <div style={{ fontSize: "40px", marginBottom: "16px" }}>📞</div>

            <h2
              style={{
                fontFamily: '"Playfair Display", serif',
                fontSize: "clamp(22px, 3vw, 30px)",
                fontWeight: 900,
                lineHeight: 1.2,
                marginBottom: "16px",
              }}
            >
              Appel découverte
              <br />
              <span style={{ color: "var(--gold)" }}>gratuit — 20 min</span>
            </h2>

            <p
              style={{
                fontSize: "14px",
                color: "rgba(245,240,232,0.5)",
                lineHeight: 1.8,
                marginBottom: "28px",
              }}
            >
              On analyse rapidement ton profil et ton projet pour voir ce qui
              est possible pour toi en 2026/2027.
            </p>

            <div
              style={{
                fontSize: "12px",
                fontWeight: 600,
                letterSpacing: "1px",
                textTransform: "uppercase",
                color: "var(--muted)",
                marginBottom: "14px",
              }}
            >
              Pendant l'appel tu vas découvrir :
            </div>

            <ul style={{ listStyle: "none", marginBottom: "28px", flex: 1 }}>
              {[
                "Les options réelles qui existent pour ton profil",
                "Les universités et opportunités possibles",
                "Les dates importantes à ne pas rater",
                "Les réponses à toutes tes questions",
              ].map((item) => (
                <li
                  key={item}
                  style={{
                    fontSize: "13px",
                    color: "rgba(245,240,232,0.7)",
                    padding: "9px 0",
                    borderBottom: "1px solid rgba(255,255,255,0.05)",
                    paddingLeft: "22px",
                    position: "relative",
                    lineHeight: 1.5,
                  }}
                >
                  <span
                    style={{
                      position: "absolute",
                      left: 0,
                      color: "var(--gold)",
                      fontWeight: 700,
                    }}
                  >
                    ✓
                  </span>
                  {item}
                </li>
              ))}
            </ul>

            <p
              style={{
                fontSize: "12px",
                color: "rgba(245,240,232,0.3)",
                marginBottom: "20px",
                fontStyle: "italic",
              }}
            >
              C'est gratuit et sans engagement.
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
                fontSize: "12px",
                fontWeight: 700,
                letterSpacing: "2px",
                textTransform: "uppercase",
                padding: "18px 32px",
                textDecoration: "none",
                transition: "background 0.2s, transform 0.2s",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = "#a50e26";
                e.currentTarget.style.transform = "translateY(-2px)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = "var(--red)";
                e.currentTarget.style.transform = "translateY(0)";
              }}
            >
              👉 Réserver mon appel gratuit →
            </a>
            <p
              style={{
                fontSize: "11px",
                color: "rgba(255,255,255,0.2)",
                textAlign: "center",
                marginTop: "12px",
              }}
            >
              Choisis simplement un créneau disponible
            </p>
          </div>

          {/* DROITE — Email */}
          <div
            style={{
              background: "#0f0f0f",
              border: "1px solid rgba(255,255,255,0.05)",
              padding: "48px 40px",
              display: "flex",
              flexDirection: "column",
              animation: "fadeUp 0.8s 0.4s ease both",
            }}
          >
            <div
              style={{
                fontSize: "10px",
                fontWeight: 700,
                letterSpacing: "3px",
                textTransform: "uppercase",
                color: "var(--muted)",
                marginBottom: "20px",
              }}
            >
              2️⃣ Recevoir les infos importantes
            </div>

            <div style={{ fontSize: "40px", marginBottom: "16px" }}>📬</div>

            <h2
              style={{
                fontFamily: '"Playfair Display", serif',
                fontSize: "clamp(22px, 3vw, 30px)",
                fontWeight: 900,
                lineHeight: 1.2,
                marginBottom: "16px",
              }}
            >
              Tu préfères commencer
              <br />
              <span style={{ color: "var(--gold)" }}>tranquillement ?</span>
            </h2>

            <p
              style={{
                fontSize: "14px",
                color: "rgba(245,240,232,0.5)",
                lineHeight: 1.8,
                marginBottom: "20px",
              }}
            >
              Inscris ton email et reçois :
            </p>

            <ul style={{ listStyle: "none", marginBottom: "32px" }}>
              {[
                "📬 Les dates d'ouverture des candidatures",
                "📬 Les nouvelles opportunités en Chine",
                "📬 Les informations importantes pour 2026/2027",
              ].map((item) => (
                <li
                  key={item}
                  style={{
                    fontSize: "13px",
                    color: "rgba(245,240,232,0.55)",
                    padding: "8px 0",
                    borderBottom: "1px solid rgba(255,255,255,0.04)",
                    lineHeight: 1.5,
                  }}
                >
                  {item}
                </li>
              ))}
            </ul>

            <LeadForm prefix="contact" />
          </div>
        </section>

        {/* REASSURANCE */}
        <section
          style={{
            borderTop: "1px solid var(--border)",
            padding: "50px 24px",
            maxWidth: "800px",
            margin: "0 auto",
            textAlign: "center",
          }}
        >
          <div
            style={{
              fontSize: "11px",
              fontWeight: 600,
              letterSpacing: "2px",
              textTransform: "uppercase",
              color: "var(--muted)",
              marginBottom: "24px",
            }}
          >
            Pourquoi nous contacter ?
          </div>
          <div
            style={{
              display: "flex",
              flexWrap: "wrap",
              gap: "12px",
              justifyContent: "center",
            }}
          >
            {[
              "🇨🇳 Plateforme dédiée à la Chine",
              "📅 Informations mises à jour 2026/2027",
              "⚡ Réponse rapide sous 24h",
              "🔒 Aucun spam — seulement les infos importantes",
            ].map((item) => (
              <span
                key={item}
                style={{
                  border: "1px solid rgba(212,168,83,0.2)",
                  color: "rgba(245,240,232,0.45)",
                  fontSize: "11px",
                  letterSpacing: "0.5px",
                  padding: "8px 16px",
                }}
              >
                {item}
              </span>
            ))}
          </div>
        </section>
      </main>

      <footer>
        <p>
          ÉTUDE – CHINE – 2026/2027 &nbsp;|&nbsp; Contact <span>▲</span>{" "}
          &nbsp;|&nbsp; Chinois en devenir - Tous droits réservés
        </p>
      </footer>

      <style>{`
        @media (max-width: 700px) {
          .contact-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </>
  );
}
