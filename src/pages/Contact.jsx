import Nav from '../components/Nav.jsx'
import LeadForm from '../components/LeadForm.jsx'

export default function Contact() {
  const CALENDLY_URL = 'https://calendly.com/VOTRE_LIEN_CALENDLY'

  return (
    <>
      <Nav />

      {/* BG grain overlay */}
      <div style={{
        position: 'fixed', inset: 0, zIndex: 0, pointerEvents: 'none',
        backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='0.03'/%3E%3C/svg%3E")`,
        opacity: 0.4,
      }} />

      <main style={{ paddingTop: '64px', position: 'relative', zIndex: 1 }}>

        {/* ── HERO SECTION ── */}
        <section style={{
          minHeight: '60vh',
          display: 'flex', flexDirection: 'column',
          alignItems: 'center', justifyContent: 'center',
          textAlign: 'center',
          padding: '80px 24px 60px',
          position: 'relative', overflow: 'hidden',
        }}>
          {/* glow */}
          <div style={{
            position: 'absolute', inset: 0, pointerEvents: 'none',
            background: 'radial-gradient(ellipse 70% 50% at 50% 50%, rgba(212,168,83,0.07) 0%, transparent 70%)',
          }} />

          <div style={{
            display: 'inline-block',
            border: '1px solid rgba(212,168,83,0.4)',
            color: 'var(--gold)',
            fontSize: '10px', fontWeight: 700,
            letterSpacing: '3px', textTransform: 'uppercase',
            padding: '7px 20px', marginBottom: '32px',
            animation: 'fadeUp 0.7s ease both',
            position: 'relative',
          }}>
            🇨🇳 Chinois en Devenir — Contact Privé
          </div>

          <h1 style={{
            fontFamily: '"Playfair Display", serif',
            fontSize: 'clamp(36px, 6vw, 72px)',
            fontWeight: 900, lineHeight: 1.05,
            marginBottom: '24px',
            animation: 'fadeUp 0.8s 0.1s ease both',
            position: 'relative',
            maxWidth: '800px',
          }}>
            On se parle.<br />
            <span style={{ color: 'var(--red)' }}>Vraiment.</span>
          </h1>

          <p style={{
            fontSize: '17px',
            color: 'rgba(245,240,232,0.55)',
            lineHeight: 1.8, maxWidth: '520px',
            marginBottom: '0',
            animation: 'fadeUp 0.8s 0.2s ease both',
            position: 'relative',
          }}>
            Tu as un projet de départ en Chine.<br />
            Réserve un appel gratuit de 20 min — ou laisse ton email<br />
            pour recevoir les infos importantes.
          </p>
        </section>

        {/* ── DEUX COLONNES ── */}
        <section style={{
          maxWidth: '1000px', margin: '0 auto',
          padding: '0 24px 100px',
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: '2px',
        }}
          className="contact-grid"
        >

          {/* COLONNE GAUCHE — Calendly */}
          <div style={{
            background: 'var(--dark2)',
            border: '1px solid rgba(212,168,83,0.15)',
            padding: '48px 40px',
            display: 'flex', flexDirection: 'column',
            animation: 'fadeUp 0.8s 0.3s ease both',
          }}>
            <div style={{
              fontSize: '10px', fontWeight: 700,
              letterSpacing: '3px', textTransform: 'uppercase',
              color: 'var(--gold)', marginBottom: '20px',
            }}>
              Étape 1 — Recommandé
            </div>

            <div style={{ fontSize: '40px', marginBottom: '16px' }}>📞</div>

            <h2 style={{
              fontFamily: '"Playfair Display", serif',
              fontSize: 'clamp(22px, 3vw, 30px)',
              fontWeight: 900, lineHeight: 1.2,
              marginBottom: '16px',
            }}>
              Appel découverte<br />
              <span style={{ color: 'var(--gold)' }}>gratuit — 20 min</span>
            </h2>

            <p style={{
              fontSize: '14px',
              color: 'rgba(245,240,232,0.5)',
              lineHeight: 1.8, marginBottom: '32px', flex: 1,
            }}>
              On fait le point ensemble sur ton projet, ton profil et les prochaines étapes concrètes à suivre pour 2026/2027.
            </p>

            <ul style={{ listStyle: 'none', marginBottom: '36px' }}>
              {[
                'Analyse de ton profil en direct',
                'Les vraies dates à ne pas rater',
                'Réponses à tes questions spécifiques',
                '100% gratuit, sans engagement',
              ].map(item => (
                <li key={item} style={{
                  fontSize: '13px',
                  color: 'rgba(245,240,232,0.65)',
                  padding: '8px 0',
                  borderBottom: '1px solid rgba(255,255,255,0.04)',
                  paddingLeft: '20px', position: 'relative',
                  lineHeight: 1.5,
                }}>
                  <span style={{ position: 'absolute', left: 0, color: 'var(--gold)' }}>✓</span>
                  {item}
                </li>
              ))}
            </ul>

            <a
              href={CALENDLY_URL}
              target="_blank" rel="noreferrer"
              style={{
                display: 'block',
                background: 'var(--red)',
                color: 'white',
                textAlign: 'center',
                fontSize: '12px', fontWeight: 700,
                letterSpacing: '2px', textTransform: 'uppercase',
                padding: '18px 32px',
                textDecoration: 'none',
                transition: 'background 0.2s, transform 0.2s',
              }}
              onMouseEnter={e => { e.target.style.background = '#a50e26'; e.target.style.transform = 'translateY(-2px)' }}
              onMouseLeave={e => { e.target.style.background = 'var(--red)'; e.target.style.transform = 'translateY(0)' }}
            >
              Réserver mon appel gratuit →
            </a>

            <p style={{
              fontSize: '11px', color: 'rgba(255,255,255,0.2)',
              textAlign: 'center', marginTop: '12px', letterSpacing: '0.5px',
            }}>
              Choisis directement le créneau qui te convient
            </p>
          </div>

          {/* COLONNE DROITE — Email */}
          <div style={{
            background: '#0f0f0f',
            border: '1px solid rgba(255,255,255,0.05)',
            padding: '48px 40px',
            display: 'flex', flexDirection: 'column',
            animation: 'fadeUp 0.8s 0.4s ease both',
          }}>
            <div style={{
              fontSize: '10px', fontWeight: 700,
              letterSpacing: '3px', textTransform: 'uppercase',
              color: 'var(--muted)', marginBottom: '20px',
            }}>
              Étape 2 — Rester informé
            </div>

            <div style={{ fontSize: '40px', marginBottom: '16px' }}>📬</div>

            <h2 style={{
              fontFamily: '"Playfair Display", serif',
              fontSize: 'clamp(22px, 3vw, 30px)',
              fontWeight: 900, lineHeight: 1.2,
              marginBottom: '16px',
            }}>
              Reçois les infos<br />
              <span style={{ color: 'var(--gold)' }}>au bon moment</span>
            </h2>

            <p style={{
              fontSize: '14px',
              color: 'rgba(245,240,232,0.5)',
              lineHeight: 1.8, marginBottom: '32px',
            }}>
              Dates d'ouverture des candidatures, rappels importants, mises à jour 2026/2027 — directement dans ta boîte mail.
            </p>

            <LeadForm prefix="contact" />
          </div>

        </section>

        {/* ── SOCIAL PROOF / REASSURANCE ── */}
        <section style={{
          borderTop: '1px solid var(--border)',
          padding: '60px 24px',
          maxWidth: '800px', margin: '0 auto',
          textAlign: 'center',
        }}>
          <div style={{
            display: 'flex', flexWrap: 'wrap',
            gap: '12px', justifyContent: 'center',
          }}>
            {[
              '🔒 Données confidentielles',
              '📅 Appel sans engagement',
              '🇨🇳 Spécialiste Chine 2026/2027',
              '⚡ Réponse sous 24h',
            ].map(item => (
              <span key={item} style={{
                border: '1px solid rgba(212,168,83,0.2)',
                color: 'rgba(245,240,232,0.45)',
                fontSize: '11px', letterSpacing: '1px',
                padding: '8px 16px',
              }}>
                {item}
              </span>
            ))}
          </div>
        </section>

      </main>

      <footer>
        <p>ÉTUDE – CHINE – 2026/2027 &nbsp;|&nbsp; Contact Privé <span>▲</span> &nbsp;|&nbsp; Chinois en devenir - Tous droits réservés</p>
      </footer>

      <style>{`
        @media (max-width: 700px) {
          .contact-grid {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </>
  )
}
