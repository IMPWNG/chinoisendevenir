import { useState } from 'react'

export default function LeadForm({ prefix }) {
  const [prenom, setPrenom] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)

  async function handleSubmit() {
    setError('')

    if (!prenom.trim()) { setError('⚠ Merci de renseigner ton prénom.'); return }
    if (!email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError('⚠ Adresse email invalide.'); return
    }

    setLoading(true)
    try {
      const res = await fetch('/api/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prenom: prenom.trim(), email: email.trim() }),
      })
      const json = await res.json().catch(() => ({}))
      if (res.ok && json.success) {
        setSuccess(true)
      } else {
        setError(json.error || 'Une erreur est survenue. Réessaie.')
      }
    } catch {
      setError('⚠ Connexion impossible. Vérifie ta connexion internet.')
    } finally {
      setLoading(false)
    }
  }

  if (success) {
    return (
      <div className="lead-success show">
        <div className="lead-success-icon">✅</div>
        <h3>Tu es inscrit 🎉</h3>
        <p>Tu recevras toutes les informations importantes pour préparer ton dossier 2026/2027. Pense à vérifier tes emails.</p>
      </div>
    )
  }

  return (
    <div className="lead-form">
      <div className="lead-row">
        <input className="lead-input" type="text" placeholder="Prénom *" value={prenom} onChange={e => setPrenom(e.target.value)} />
        <input className="lead-input" type="email" placeholder="Email *" value={email} onChange={e => setEmail(e.target.value)} />
      </div>
      <button className="lead-submit" onClick={handleSubmit} disabled={loading}>
        {loading ? 'Envoi en cours…' : 'Recevoir les infos importantes →'}
      </button>
      {error && <div className="lead-error show">{error}</div>}
      <p className="lead-legal">🔒 Aucun spam • Données confidentielles • Désinscription à tout moment</p>
    </div>
  )
}
