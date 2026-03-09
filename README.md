# Chinois en Devenir — Vite + React

Stack : **Vite + React + React Router** · API Route Vercel · Déploiement Vercel

## Structure

```
chinois-en-devenir/
├── api/
│   └── subscribe.js        ← Vercel serverless function (Brevo)
├── src/
│   ├── components/
│   │   ├── Nav.jsx
│   │   ├── LeadForm.jsx
│   │   └── Popup.jsx
│   ├── pages/
│   │   ├── Home.jsx
│   │   └── AVenir.jsx
│   ├── main.jsx
│   └── index.css
├── index.html
├── vite.config.js
├── vercel.json
└── package.json
```

## Lancer en local

```bash
npm install
npm run dev
```

## Variables d'environnement

Crée un fichier `.env` à la racine :
```
BREVO_API_KEY=ta_clé_api_brevo
BREVO_LIST_ID=ton_list_id
```

Sur Vercel : Settings → Environment Variables → ajouter les mêmes.

## Déployer sur Vercel

```bash
# Option 1 — via CLI
npm i -g vercel
vercel

# Option 2 — via GitHub
# Push sur GitHub → importer le repo sur vercel.com
# Vercel détecte Vite automatiquement, aucune config nécessaire
```

**Framework preset** : Vite (détecté automatiquement)  
**Build command** : `npm run build`  
**Output directory** : `dist`

## Notes importantes

- Le fichier `api/subscribe.js` est une **Vercel Serverless Function** — elle remplace ton `server.js`
- `vercel.json` gère le routing : `/api/*` → serverless, `/*` → React SPA
- Les variables d'environnement Vercel sont automatiquement disponibles dans `api/subscribe.js`
