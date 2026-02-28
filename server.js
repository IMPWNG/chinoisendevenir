require('dotenv').config();
const http = require('http');
const fs   = require('fs');
const path = require('path');

const BREVO_API_KEY = process.env.BREVO_API_KEY;
const BREVO_LIST_ID = parseInt(process.env.BREVO_LIST_ID, 10);
const PORT          = process.env.PORT || 3000;

const server = http.createServer((req, res) => {

  // ── CORS headers ──
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') { res.writeHead(204); res.end(); return; }

  // ── Sert le fichier HTML ──
  if (req.method === 'GET' && (req.url === '/' || req.url === '/index.html')) {
    const filePath = path.join(__dirname, 'etude-chine-2026.html');
    fs.readFile(filePath, (err, data) => {
      if (err) { res.writeHead(404); res.end('HTML not found'); return; }
      res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
      res.end(data);
    });
    return;
  }

  // ── Endpoint proxy Brevo ──
  if (req.method === 'POST' && req.url === '/api/subscribe') {
    let body = '';
    req.on('data', chunk => body += chunk);
    req.on('end', async () => {
      try {
        const { prenom, email, phone } = JSON.parse(body);

        // Validation serveur
        if (!prenom || !email) {
          res.writeHead(400, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ error: 'Prénom et email requis.' }));
          return;
        }

        const payload = JSON.stringify({
          email,
          attributes: {
            PRENOM: prenom,
            ...(phone && { SMS: phone })
          },
          listIds: [BREVO_LIST_ID],
          updateEnabled: true
        });

        // Appel Brevo (Node natif, pas de dépendance)
        const options = {
          hostname: 'api.brevo.com',
          path: '/v3/contacts',
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'api-key': BREVO_API_KEY,
            'Content-Length': Buffer.byteLength(payload)
          }
        };

        const https = require('https');
        const brevoReq = https.request(options, (brevoRes) => {
          let data = '';
          brevoRes.on('data', chunk => data += chunk);
          brevoRes.on('end', () => {
            const status = brevoRes.statusCode;
            if (status === 201 || status === 204) {
              res.writeHead(200, { 'Content-Type': 'application/json' });
              res.end(JSON.stringify({ success: true }));
            } else if (status === 400) {
              // Contact déjà existant = succès côté UX
              res.writeHead(200, { 'Content-Type': 'application/json' });
              res.end(JSON.stringify({ success: true }));
            } else {
              res.writeHead(status, { 'Content-Type': 'application/json' });
              res.end(data);
            }
          });
        });

        brevoReq.on('error', (e) => {
          res.writeHead(500, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ error: 'Erreur serveur : ' + e.message }));
        });

        brevoReq.write(payload);
        brevoReq.end();

      } catch (e) {
        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'JSON invalide.' }));
      }
    });
    return;
  }

  // ── 404 ──
  res.writeHead(404);
  res.end('Not found');
});

server.listen(PORT, () => {
  console.log(`✅ Serveur lancé sur http://localhost:${PORT}`);
  console.log(`   Brevo List ID : ${BREVO_LIST_ID}`);
  console.log(`   Clé API       : ${BREVO_API_KEY ? '✓ chargée' : '✗ MANQUANTE'}`);
});