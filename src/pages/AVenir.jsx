import { Link } from 'react-router-dom'
import Nav from '../components/Nav.jsx'

export default function AVenir() {
  return (
    <>
      <Nav />
      <main
        style={{
          flex: 1,
          display: "flex",
          alignItems: "flex-start",
          justifyContent: "center",
          padding: "120px 24px 80px",
          position: "relative",
          minHeight: "100vh",
        }}
      >
        <div
          style={{
            position: "absolute",
            inset: 0,
            background:
              "radial-gradient(ellipse 80% 60% at 50% 50%, rgba(200,16,46,0.08) 0%, transparent 70%)",
            pointerEvents: "none",
          }}
        />
        <div
          style={{
            textAlign: "center",
            maxWidth: "640px",
            position: "relative",
          }}
        >
          <div
            style={{
              fontSize: "64px",
              marginBottom: "24px",
              animation: "fadeUp 0.8s ease both",
            }}
          >
            🚧
          </div>
          <div
            style={{
              display: "inline-block",
              border: "1px solid var(--gold)",
              color: "var(--gold)",
              fontSize: "10px",
              fontWeight: 700,
              letterSpacing: "3px",
              textTransform: "uppercase",
              padding: "7px 18px",
              marginBottom: "32px",
              animation: "fadeUp 0.8s 0.1s ease both",
            }}
          >
            Prochaines thématiques
          </div>
          <h1
            style={{
              fontFamily: '"Playfair Display", serif',
              fontSize: "clamp(32px, 6vw, 64px)",
              fontWeight: 900,
              lineHeight: 1.1,
              marginBottom: "24px",
              animation: "fadeUp 0.9s 0.15s ease both",
            }}
          >
            Ce contenu arrive
            <br />
            <span style={{ color: "var(--red)", display: "block" }}>
              bientôt.
            </span>
          </h1>
          <p
            style={{
              fontSize: "16px",
              color: "var(--muted)",
              lineHeight: 1.7,
              marginBottom: "48px",
              animation: "fadeUp 0.9s 0.25s ease both",
            }}
          >
            Nous développons de nouveaux contenus pour accompagner celles et
            ceux qui souhaitent construire un projet en Chine.
            <br />
            En attendant, découvre notre accompagnement pour les études.
          </p>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: "2px",
              marginBottom: "48px",
              animation: "fadeUp 0.9s 0.3s ease both",
              textAlign: "left",
            }}
          >
            {[
              {
                tag: "Disponible maintenant",
                title: "Étudier en Chine 2026/2027",
                desc: "Accompagnement clair pour comprendre les démarches, éviter les erreurs et préparer ton dossier pour 2026/2027. Conseils concrets, explications simples et vision globale.",
                available: true,
              },
              {
                tag: "Prochainement",
                title: "S'expatrier & Créer son entreprise en Chine",
                desc: "Conseils pratiques pour celles et ceux qui souhaitent vivre, travailler ou entreprendre en Chine. Démarches, réalités du terrain et points d'attention.",
                available: false,
              },
              {
                tag: "Prochainement",
                title: "Tourisme en Chine",
                desc: "Informations essentielles pour préparer un séjour en Chine : visa, organisation, villes à découvrir et conseils utiles.",
                available: false,
              },
              {
                tag: "Prochainement",
                title: "Et d'autres sujets...",
                desc: "Culture, apprentissage du mandarin, opportunités professionnelles et compréhension du pays. Notre objectif : t'aider à avancer avec clarté.",
                available: false,
              },
            ].map((card) => (
              <div
                key={card.title}
                style={{
                  background: "var(--dark2)",
                  border: `1px solid ${card.available ? "rgba(200,16,46,0.3)" : "rgba(255,255,255,0.04)"}`,
                  padding: "28px",
                }}
              >
                <div
                  style={{
                    fontSize: "10px",
                    fontWeight: 600,
                    letterSpacing: "2px",
                    textTransform: "uppercase",
                    color: "var(--gold)",
                    marginBottom: "10px",
                  }}
                >
                  {card.tag}
                </div>
                <div
                  style={{
                    fontFamily: '"Playfair Display", serif',
                    fontSize: "18px",
                    fontWeight: 700,
                    color: "var(--light)",
                    marginBottom: "10px",
                    lineHeight: 1.3,
                  }}
                >
                  {card.title}
                </div>
                <div
                  style={{
                    fontSize: "13px",
                    color: "var(--muted)",
                    lineHeight: 1.6,
                  }}
                >
                  {card.desc}
                </div>
                <span
                  style={{
                    display: "inline-block",
                    marginTop: "14px",
                    fontSize: "10px",
                    fontWeight: 700,
                    letterSpacing: "2px",
                    textTransform: "uppercase",
                    padding: "5px 10px",
                    border: `1px solid ${card.available ? "rgba(200,16,46,0.4)" : "rgba(212,168,83,0.3)"}`,
                    color: card.available ? "var(--red)" : "var(--gold)",
                  }}
                >
                  {card.available ? "✓ Disponible" : "À venir"}
                </span>
              </div>
            ))}
          </div>

          <Link
            to="/"
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "8px",
              background: "var(--red)",
              color: "white",
              fontSize: "12px",
              fontWeight: 700,
              letterSpacing: "2px",
              textTransform: "uppercase",
              padding: "16px 32px",
              textDecoration: "none",
              transition: "background 0.2s",
              animation: "fadeUp 0.9s 0.4s ease both",
            }}
          >
            ← Retour au guide disponible
          </Link>
        </div>
      </main>
      <footer>
        <p>
          ÉTUDE – CHINE – 2026/2027 &nbsp;|&nbsp; Guide complet <span>▲</span>{" "}
          &nbsp;|&nbsp; Chinois en devenir - Tous droits réservés
        </p>
      </footer>
    </>
  );
}
