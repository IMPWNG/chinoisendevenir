import Nav from "../components/Nav.jsx";
import { Link } from "react-router-dom";

const OUTILS = [
  {
    categorie: "VPN",
    icon: "🔐",
    items: [
      {
        nom: "LetsVPN",
        desc: "Le VPN le plus fiable en Chine. Indispensable pour accéder à Google, Instagram, WhatsApp.",
        cta: "Obtenir LetsVPN",
        href: "", // ← remplace
        badge: "Essentiel",
        badgeColor: "var(--red)",
      },
    ],
  },
  {
    categorie: "Banque & Argent",
    icon: "💳",
    items: [
      {
        nom: "Revolut",
        desc: "Carte sans frais à l'étranger. Idéale pour les retraits et paiements en voyage.",
        cta: "Obtenir Revolut",
        href: "https://revolut.com/referral/TON_ID",
        badge: "Utile",
        badgeColor: "var(--gold)",
      },
      {
        nom: "WeChat Pay",
        desc: "L'application de paiement incontournable en Chine. Utilisée partout — restaurants, transports, commerces. À configurer avant ton départ.",
        cta: "Voir le guide d'installation",
        href: "https://pay.weixin.qq.com/index.php/public/wechatpay",
        badge: "Essentiel",
        badgeColor: "var(--red)",
      },
      {
        nom: "Alipay",
        desc: "Le second portefeuille numérique dominant en Chine. Accepte désormais les cartes étrangères pour les étrangers.",
        cta: "Créer un compte Alipay",
        href: "https://global.alipay.com",
        badge: "Essentiel",
        badgeColor: "var(--red)",
      },
    ],
  },
  {
    categorie: "Assurance",
    icon: "🏥",
    items: [
      {
        nom: "A venir",
        desc: "",
        cta: "",
        href: "", // ← remplace
        badge: "",
        badgeColor: "",
      },
      {
        nom: "A venir",
        desc: "",
        cta: "",
        href: "", // ← remplace
        badge: "",
        badgeColor: "",
      },
    ],
  },
  {
    categorie: "Logement",
    icon: "🏠",
    items: [
      {
        nom: "A venir",
        desc: "",
        cta: "",
        href: "", // ← remplace
        badge: "",
        badgeColor: "",
      },
    ],
  },
  {
    categorie: "Apprentissage du mandarin",
    icon: "🀄",
    items: [
      {
        nom: "A venir",
        desc: "",
        cta: "",
        href: "", // ← remplace
        badge: "",
        badgeColor: "",
      },
      {
        nom: "A venir",
        desc: "",
        cta: "",
        href: "", // ← remplace
        badge: "",
        badgeColor: "",
      },
    ],
  },
];

export default function Indispensables() {
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
              "radial-gradient(ellipse 55% 40% at 50% 20%, rgba(212,168,83,0.06) 0%, transparent 65%)",
          }}
        />

        {/* HERO */}
        <section
          style={{
            maxWidth: "720px",
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
            🛠 Ressources recommandées
          </div>

          <h1
            style={{
              fontFamily: '"Playfair Display", serif',
              fontSize: "clamp(32px, 5vw, 56px)",
              fontWeight: 900,
              lineHeight: 1.1,
              marginBottom: "20px",
              animation: "fadeUp 0.7s 0.05s ease both",
            }}
          >
            Les indispensables
            <br />
            <span style={{ color: "var(--gold)" }}>pour la Chine</span>
          </h1>

          <p
            style={{
              fontSize: "16px",
              color: "rgba(245,240,232,0.5)",
              lineHeight: 1.8,
              maxWidth: "480px",
              margin: "0 auto",
              animation: "fadeUp 0.7s 0.1s ease both",
            }}
          >
            VPN, banque, assurance, logement… Tous les outils qu'on utilise et
            recommande pour préparer et vivre ton projet en Chine.
          </p>

          <p
            style={{
              marginTop: "16px",
              fontSize: "11px",
              color: "rgba(245,240,232,0.2)",
              letterSpacing: "0.5px",
              animation: "fadeUp 0.7s 0.15s ease both",
            }}
          >
            Certains liens sont affiliés — ils nous permettent de continuer à
            créer du contenu gratuit, sans coût supplémentaire pour toi.
          </p>
        </section>

        {/* CATÉGORIES */}
        <section
          style={{
            maxWidth: "800px",
            margin: "0 auto",
            padding: "0 24px 100px",
            position: "relative",
            zIndex: 1,
          }}
        >
          {OUTILS.map((cat, ci) => (
            <div
              key={cat.categorie}
              style={{
                marginBottom: "56px",
                animation: `fadeUp 0.7s ${0.1 + ci * 0.05}s ease both`,
              }}
            >
              {/* HEADER CATÉGORIE */}
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "12px",
                  marginBottom: "16px",
                  borderBottom: "1px solid rgba(255,255,255,0.06)",
                  paddingBottom: "14px",
                }}
              >
                <span style={{ fontSize: "24px" }}>{cat.icon}</span>
                <h2
                  style={{
                    fontFamily: '"Playfair Display", serif',
                    fontSize: "20px",
                    fontWeight: 700,
                    color: "var(--light)",
                  }}
                >
                  {cat.categorie}
                </h2>
              </div>

              {/* OUTILS */}
              <div
                style={{ display: "flex", flexDirection: "column", gap: "2px" }}
              >
                {cat.items.map((outil) => (
                  <div key={outil.nom} className="outil-card">
                    <div style={{ flex: 1 }}>
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "10px",
                          marginBottom: "6px",
                        }}
                      >
                        <span
                          style={{
                            fontFamily: '"Playfair Display", serif',
                            fontSize: "16px",
                            fontWeight: 700,
                            color: "var(--light)",
                          }}
                        >
                          {outil.nom}
                        </span>
                        {outil.badge && (
                          <span
                            style={{
                              fontSize: "8px",
                              fontWeight: 700,
                              letterSpacing: "1.5px",
                              textTransform: "uppercase",
                              padding: "3px 8px",
                              border: `1px solid ${outil.badgeColor}`,
                              color: outil.badgeColor,
                            }}
                          >
                            {outil.badge}
                          </span>
                        )}
                      </div>
                      <p
                        style={{
                          fontSize: "13px",
                          color: "rgba(245,240,232,0.45)",
                          lineHeight: 1.6,
                          margin: 0,
                        }}
                      >
                        {outil.desc}
                      </p>
                    </div>
                    <a
                      href={outil.href}
                      target="_blank"
                      rel="noreferrer nofollow"
                      className="outil-btn"
                    >
                      {outil.cta} →
                    </a>
                  </div>
                ))}
              </div>
            </div>
          ))}

          {/* CTA FINAL */}
          <div
            style={{
              border: "1px solid rgba(212,168,83,0.15)",
              background: "var(--dark2)",
              padding: "40px",
              textAlign: "center",
            }}
          >
            <p
              style={{
                fontFamily: '"Playfair Display", serif',
                fontSize: "20px",
                fontWeight: 700,
                marginBottom: "12px",
                color: "var(--light)",
              }}
            >
              Tu as des questions sur ces outils ?
            </p>
            <p
              style={{
                fontSize: "14px",
                color: "rgba(245,240,232,0.45)",
                marginBottom: "24px",
                lineHeight: 1.7,
              }}
            >
              On en parle lors d'un appel gratuit de 30 min.
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
              Réserver un appel gratuit →
            </Link>
          </div>
        </section>
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
        .outil-card {
          background: var(--dark2);
          border: 1px solid rgba(255,255,255,0.05);
          padding: 24px 28px;
          display: flex;
          align-items: center;
          gap: 24px;
          transition: border-color 0.2s, background 0.2s;
        }
        .outil-card:hover {
          border-color: rgba(212,168,83,0.2);
          background: #161616;
        }
        .outil-btn {
          flex-shrink: 0;
          background: rgba(212,168,83,0.08);
          border: 1px solid rgba(212,168,83,0.25);
          color: var(--gold);
          font-size: 11px; font-weight: 700;
          letter-spacing: 1px; text-transform: uppercase;
          padding: 10px 18px; text-decoration: none;
          white-space: nowrap;
          transition: all 0.2s;
        }
        .outil-btn:hover {
          background: rgba(212,168,83,0.18);
          border-color: var(--gold);
          letter-spacing: 1.5px;
        }
        @media (max-width: 600px) {
          .outil-card { flex-direction: column; align-items: flex-start; }
          .outil-btn { width: 100%; text-align: center; }
        }
      `}</style>
    </>
  );
}
