import Nav from "../components/Nav.jsx";
import LeadForm from "../components/LeadForm.jsx";

export default function Contact() {
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
        <section
          style={{
            minHeight: "45vh",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            textAlign: "center",
            padding: "80px 24px 60px",
            position: "relative",
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
              maxWidth: "480px",
              animation: "fadeUp 0.8s 0.2s ease both",
              position: "relative",
            }}
          >
            Laisse tes coordonnées et on te recontacte rapidement pour
            t'orienter selon ton profil.
          </p>
        </section>

        {/* FORM */}
        <section
          style={{
            maxWidth: "560px",
            margin: "0 auto",
            padding: "0 24px 100px",
          }}
        >
          <div
            style={{
              background: "var(--dark2)",
              border: "1px solid rgba(212,168,83,0.2)",
              padding: "40px",
              animation: "fadeUp 0.8s 0.3s ease both",
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
              Études, expatriation, tourisme… On te recontacte pour faire le
              point sur ton projet.
            </p>
            <LeadForm
              prefix="contact"
              source="contact"
              submitLabel="Envoyer mes informations →"
            />
          </div>

          {/* REASSURANCE */}
          <div
            style={{
              display: "flex",
              flexWrap: "wrap",
              gap: "10px",
              justifyContent: "center",
              marginTop: "24px",
            }}
          >
            {[
              "🇨🇳 Spécialiste Chine",
              "⚡ Réponse sous 24h",
              "🔒 Données confidentielles",
              "📅 Sans engagement",
            ].map((item) => (
              <span
                key={item}
                style={{
                  border: "1px solid rgba(212,168,83,0.15)",
                  color: "rgba(245,240,232,0.35)",
                  fontSize: "11px",
                  letterSpacing: "0.5px",
                  padding: "6px 14px",
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
    </>
  );
}
