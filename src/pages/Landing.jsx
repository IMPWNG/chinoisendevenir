import { useState } from "react";

const CALENDLY_URL = "https://calendly.com/chinoisendevenir/30min";

export default function Landing() {
  const [prenom, setPrenom] = useState("");
  const [email, setEmail] = useState("");
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit() {
    setError("");

    if (!prenom.trim()) {
      setError("⚠ Prénom requis");
      return;
    }

    if (!email.trim()) {
      setError("⚠ Email requis");
      return;
    }

    try {
      const res = await fetch("/api/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prenom, email }),
      });

      const json = await res.json();

      if (json.success) setSuccess(true);
      else setError("Erreur.");
    } catch {
      setError("Connexion impossible.");
    }
  }

  return (
    <>
      {/* NAV */}
      <nav
        style={{
          position: "fixed",
          top: 0,
          width: "100%",
          background: "#0d0d0d",
          borderBottom: "1px solid #222",
          zIndex: 100,
        }}
      >
        <div
          style={{
            maxWidth: "1100px",
            margin: "0 auto",
            padding: "16px 24px",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <span style={{ fontWeight: 700, color: "white" }}>
            🇨🇳 Chinois en Devenir
          </span>

          <a
            href={CALENDLY_URL}
            target="_blank"
            rel="noreferrer"
            style={{
              background: "#c8102e",
              color: "white",
              padding: "10px 18px",
              fontSize: "12px",
              textDecoration: "none",
              fontWeight: 700,
            }}
          >
            Appel gratuit →
          </a>
        </div>
      </nav>

      <main
        style={{
          paddingTop: "120px",
          maxWidth: "720px",
          margin: "0 auto",
          textAlign: "center",
          paddingLeft: "24px",
          paddingRight: "24px",
        }}
      >
        {/* HERO */}
        <div style={{ marginBottom: "60px" }}>
          <div style={{ fontSize: "52px", marginBottom: "20px" }}>🇨🇳</div>

          <h1
            style={{
              fontSize: "46px",
              fontWeight: 900,
              lineHeight: 1.1,
              marginBottom: "20px",
            }}
          >
            Étudier en Chine
          </h1>

          <p
            style={{
              fontSize: "18px",
              color: "#aaa",
              lineHeight: 1.6,
              marginBottom: "40px",
            }}
          >
            On t'aide à trouver ton université, obtenir une bourse et préparer
            ton dossier étudiant.
          </p>

          {/* CTA */}
          <div
            style={{
              display: "flex",
              gap: "12px",
              justifyContent: "center",
              flexWrap: "wrap",
            }}
          >
            <a
              href={CALENDLY_URL}
              target="_blank"
              rel="noreferrer"
              style={{
                background: "#c8102e",
                color: "white",
                padding: "16px 26px",
                textDecoration: "none",
                fontWeight: 700,
                fontSize: "14px",
              }}
            >
              📞 Réserver un appel gratuit
            </a>

            <a
              href="#guide"
              style={{
                border: "1px solid #444",
                padding: "16px 26px",
                textDecoration: "none",
                color: "#ddd",
                fontSize: "14px",
              }}
            >
              📘 Recevoir le guide
            </a>
          </div>
        </div>

        {/* BENEFITS */}
        <div style={{ marginBottom: "70px" }}>
          <h2 style={{ marginBottom: "24px" }}>Tu veux étudier en Chine ?</h2>

          <div
            style={{
              display: "grid",
              gap: "14px",
              fontSize: "16px",
              color: "#ccc",
            }}
          >
            <div>🎓 Trouver les universités adaptées</div>
            <div>💰 Identifier les bourses disponibles</div>
            <div>📄 Préparer ton dossier étudiant</div>
            <div>✈️ Comprendre les démarches de visa</div>
          </div>
        </div>

        {/* EMAIL GUIDE */}
        <div
          id="guide"
          style={{
            border: "1px solid #333",
            padding: "40px",
            marginBottom: "70px",
          }}
        >
          <h3 style={{ marginBottom: "10px" }}>
            📘 Guide gratuit – Étudier en Chine
          </h3>

          <p style={{ color: "#aaa", marginBottom: "24px" }}>
            Universités, bourses, visa étudiant et démarches.
          </p>

          {success ? (
            <p style={{ color: "#d4a853" }}>✅ Email enregistré !</p>
          ) : (
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: "10px",
                maxWidth: "340px",
                margin: "0 auto",
              }}
            >
              <input
                placeholder="Prénom"
                value={prenom}
                onChange={(e) => setPrenom(e.target.value)}
                style={{
                  padding: "12px",
                  background: "#111",
                  border: "1px solid #333",
                  color: "white",
                }}
              />

              <input
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                style={{
                  padding: "12px",
                  background: "#111",
                  border: "1px solid #333",
                  color: "white",
                }}
              />

              {error && <p style={{ color: "#ff6b6b" }}>{error}</p>}

              <button
                onClick={handleSubmit}
                style={{
                  background: "#d4a853",
                  color: "black",
                  border: "none",
                  padding: "14px",
                  fontWeight: 700,
                  cursor: "pointer",
                }}
              >
                Recevoir le guide →
              </button>
            </div>
          )}
        </div>

        {/* SOCIAL PROOF */}
        <div style={{ marginBottom: "70px" }}>
          <p style={{ color: "#888", fontSize: "14px" }}>
            🇨🇳 Nous partageons notre expérience de la Chine et aidons les
            étudiants à préparer leur projet.
          </p>
        </div>

        {/* FINAL CTA */}
        <div style={{ marginBottom: "100px" }}>
          <h2 style={{ marginBottom: "20px" }}>
            Prêt à lancer ton projet en Chine ?
          </h2>

          <a
            href={CALENDLY_URL}
            target="_blank"
            rel="noreferrer"
            style={{
              background: "#c8102e",
              color: "white",
              padding: "18px 34px",
              textDecoration: "none",
              fontWeight: 700,
              fontSize: "15px",
            }}
          >
            📞 Réserver un appel gratuit
          </a>
        </div>
      </main>

      {/* FOOTER */}
      <footer
        style={{
          textAlign: "center",
          padding: "30px",
          borderTop: "1px solid #222",
          color: "#555",
          fontSize: "12px",
        }}
      >
        🇨🇳 Chinois en Devenir · 2026
      </footer>
    </>
  );
}
