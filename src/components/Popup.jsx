import { useEffect } from 'react'

const episodes = {
  1: { tag: 'Épisode 1', title: 'Pourquoi étudier en Chine en 2026/2027 est un choix stratégique' },
  2: { tag: 'Épisode 2', title: 'Est-ce que TU peux vraiment y aller ?' },
  3: { tag: 'Épisode 3', title: 'Comment choisir la bonne université' },
  4: { tag: 'Épisode 4', title: 'Les bourses : vraiment accessibles ?' },
  5: { tag: 'Épisode 5', title: "Les erreurs qui ruinent un dossier" },
  6: { tag: 'Épisode 6', title: 'Visa & démarches simplifiées' },
  7: { tag: 'Épisode 7', title: 'La vraie vie sur place' },
  8: { tag: 'Épisode 8', title: "Plan d'action en 30 jours" },
}

export default function Popup({ epNum, onClose }) {
  const ep = episodes[epNum] || episodes[1]

  useEffect(() => {
    document.body.style.overflow = 'hidden'
    const handler = (e) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', handler)
    return () => {
      document.body.style.overflow = ''
      window.removeEventListener('keydown', handler)
    }
  }, [onClose])

  return (
    <div className="popup-overlay show" onClick={e => { if (e.target === e.currentTarget) onClose() }}>
      <div className="popup-box">
        <button className="popup-close" onClick={onClose}>✕</button>
        <div className="popup-top">
          <span className="popup-lock">🔒</span>
          <span className="popup-top-label">Contenu réservé aux acheteurs</span>
        </div>
        <div className="popup-body">
          <div className="popup-ep-tag">{ep.tag}</div>
          <h2 className="popup-title">🔒 {ep.title} — Accès réservé</h2>
          <p className="popup-desc">
            Cette vidéo fait partie du système complet.<br /><br />
            Sans le guide, tu vois l'introduction.<br />
            <strong>Avec le guide, tu as la structure, les modèles et la feuille de route complète.</strong><br /><br />
            La différence entre information et stratégie, c'est l'organisation.
          </p>
          <ul className="popup-perks">
            <li>8 épisodes vidéo privés — accès immédiat</li>
            <li>Templates lettre de motivation + CV académique</li>
            <li>Checklist candidature 2026/2027 complète</li>
            <li>Timeline et vraies deadlines</li>
            <li>Mises à jour incluses à vie</li>
          </ul>
          <a href="https://chinoisendevenir.gumroad.com/l/etude-chine-2026-2027" className="popup-btn-primary" target="_blank" rel="noreferrer">
            GUIDE COMPLET — 29€ →
          </a>
          <p style={{ textAlign: 'center', fontSize: '11px', color: 'rgba(255,255,255,0.2)', marginBottom: '12px' }}>
            Accès immédiat · Paiement sécurisé
          </p>
        </div>
      </div>
    </div>
  )
}
