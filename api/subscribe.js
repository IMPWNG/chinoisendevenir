import https from 'https'
import { createClient } from '@supabase/supabase-js'

function formatPhone(num) {
  if (!num) return null
  let clean = num.replace(/\s|-|\./g, '')
  if (clean.startsWith('0')) clean = '+33' + clean.slice(1)
  if (!clean.startsWith('+')) clean = '+' + clean
  return clean
}

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type')

  if (req.method === 'OPTIONS') { res.status(204).end(); return }
  if (req.method !== 'POST') { res.status(405).json({ error: 'Method not allowed' }); return }

  const { prenom, email, phone, source = 'website' } = req.body || {}
  const formattedPhone = formatPhone(phone)

  if (!prenom || !email) {
    res.status(400).json({ error: 'Prénom et email requis.' })
    return
  }

  // ── 1. Supabase ──
  const supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_SERVICE_KEY  // service key côté serveur
  )

  const { error: supabaseError } = await supabase
    .from('contacts')
    .upsert(
      { prenom, email, phone: formattedPhone, source },
      { onConflict: 'email' }  // met à jour si email existe déjà
    )

  if (supabaseError) {
    console.error('Supabase error:', supabaseError)
    res.status(500).json({ error: 'Erreur base de données.' })
    return
  }

  // ── 2. Brevo (toujours pour les emails auto) ──
  const payload = JSON.stringify({
    email,
    attributes: {
      FIRSTNAME: prenom,
      ...(formattedPhone && { SMS: formattedPhone }),
    },
    listIds: [parseInt(process.env.BREVO_LIST_ID, 10)],
    updateEnabled: true,
  })

  return new Promise((resolve) => {
    const options = {
      hostname: 'api.brevo.com',
      path: '/v3/contacts',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'api-key': process.env.BREVO_API_KEY,
        'Content-Length': Buffer.byteLength(payload),
      },
    }

    const brevoReq = https.request(options, (brevoRes) => {
      let data = ''
      brevoRes.on('data', chunk => data += chunk)
      brevoRes.on('end', () => {
        res.status(200).json({ success: true })
        resolve()
      })
    })

    brevoReq.on('error', (e) => {
      // Supabase a déjà enregistré — on retourne quand même success
      console.error('Brevo error:', e.message)
      res.status(200).json({ success: true })
      resolve()
    })

    brevoReq.write(payload)
    brevoReq.end()
  })
}
