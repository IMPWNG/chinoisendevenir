# Chinois en Devenir — brief pour agent IA

Lis ce fichier avant de modifier le code. Le `README.md` racine est un reliquat Vite : **ignore-le**.

## Produit

**Chinois en Devenir** (`https://chinoisendevenir.com`) est l’app d’une agence francophone qui accompagne des étudiants pour **étudier en Chine** : orientation, matching universités / écoles de langue, dossier d’admission, bourses, visa.

Ce n’est **pas** une université, **pas** le CSC, **pas** un garant d’admission / bourse / visa. Toute copy publique et tout e-mail doivent rester factuels là-dessus.

Package npm : `etudier-en-chine`. Repo : App Router Next.js 16 + React 19, déployé Vercel depuis `main`.

## Trois surfaces

| Surface | Routes | Qui |
|---|---|---|
| Site public SEO | `/`, `/etudier-en-chine`, `/ecoles-de-langue-chine`, `/visa-etudiant-chine`, `/bourses`, `/processus`, `/tarifs`, `/faq`, `/contact`, `/about` | Anonyme. Copy FR, JSON-LD, `public/llms.txt`. |
| Espace étudiant | `/espace-etudiant`, `/espace-etudiant/connexion` | Compte Supabase Auth. Accès gated par paiement / statut. |
| Admin | `/admin/login`, `/admin/dashboard`, `/admin/universites` | Allowlist `ADMIN_EMAILS` + table `admin_users`. Rôle `full` ou `limited`. |

Les pages `src/app/**/page.jsx` sont minces : metadata SEO + import d’une vue dans `src/views/`. La logique vit dans `src/lib/`.

## Stack

- **Next.js 16** App Router, **JavaScript** (pas de TypeScript dans `src/`), alias `@/*` → `src/*`
- **React 19** + **Tailwind 4**
- **Supabase** : Auth + Postgres. Le navigateur n’écrit pas les tables métier. Les API routes utilisent la **service role** (`src/lib/supabaseAdmin.js`) et bypassent RLS.
- **Resend** : e-mails transactionnels + inbound (`contact@chinoisendevenir.com`)
- **WhatsApp Cloud API** : webhook + envoi admin
- **Mammouth** (`MAMMOUTH_API_KEY`) : LLM matching, bilans, rédaction d’e-mails admin
- Node `>= 20`. Pas de suite de tests dans `package.json` (`npm test` n’existe pas). Qualité = `npm run lint` + `npm run build`.

## Modèle métier

### Contact = dossier

Table centrale : `contacts`. Un étudiant Auth est relié à une ligne `contacts` via l’e-mail (`findContactByEmail` / `ensureStudentContact` dans `src/lib/studentAuth.js`).

Profil public côté UI : `publicStudentProfile()`.

### Formules (`src/lib/formules.js`)

Source de vérité des offres, aliases historiques, et droits débloqués (`getFormuleAccess`) :

1. **Premier pas en Chine — 800 €** : école de langue + visa
2. **Admission universitaire — 1 700 €** : jusqu’à 5 candidatures
3. **Accompagnement complet — 2 000 €** : langue puis univ., jusqu’à 8 candidatures

Les libellés stockés en base peuvent être d’anciens prix (`aliases`). Toujours passer par `getFormuleNumber()` / `displayFormuleLabel()`, ne pas parser le string à la main.

### Suivi (`src/lib/suiviStatuts.js`)

Machine à états du CRM. Noms **canoniques** en UI ≠ noms **stockés** en Postgres (CHECK legacy). Toujours `canonicalStatut()` / `toStoredStatut()`.

Statuts payés / espace débloqué : `PAID_STATUSES`, `STUDENT_UNLOCKED_STATUSES`. Progression affichée : `src/lib/studentProgress.js`.

Ne jamais avancer un statut en arrière sans le dire ; `shouldAdvanceStatus()` existe pour ça.

### Matching universités

Pipeline : `src/lib/matching/run.js` → `runMatching()`.

```
contact → normalizeStudent → enrichStudent (LLM)
       → rankMatches(score.js, weights.js)
       → selectMix (safety / match / reach)
       → generateDualReports (admin + étudiant)
       → persist.js (table matching_runs, payload JSON)
```

Poids dans `src/lib/matching/weights.js` (pas dans `score.js`). Matching écoles de langue : `src/lib/matching/chinese.js`, préfixe `[[CHINESE_MATCHING_JSON]]`.

Limite du mix = formule (1/2/3). Vue étudiant filtrée : `matchingForStudent()` dans `studentView.js`.

### Documents

Bucket Storage `student-documents`. Logique : `src/lib/studentDocuments.js`. L’étudiant n’y accède que si `access.documents` (formule débloquée).

## Auth et rôles

- Login/register admin : `/api/auth/*` → `src/lib/authUsers.js` + rate limit `httpSecurity.js`
- Étudiant : `/api/student/auth/register` + routes `/api/student/*` via `getAuthenticatedContact()`
- Admin API : **toujours** `getAuthenticatedAdmin(request)` puis, si besoin, `requireFullAdmin(auth)` (`src/lib/adminRoles.js`)

Rôles :

- `full` : universités, matching, bulk e-mail, suppression contacts
- `limited` (`ADMIN_LIMITED_EMAILS`) : étudiants / agenda / e-mail contact, pas matching ni universités
- WhatsApp admin est **off** dans `adminCapabilities()` (`whatsapp: false`)

Le client anon Supabase ne doit pas lire `contacts` / `universities` / `matching_runs`. Toute nouvelle table métier : RLS on, grants service_role, SQL dans `sql/`.

## Où poser le code

| Besoin | Fichier |
|---|---|
| Copy / FAQ / metadata site | `src/lib/seo.js`, `src/i18n/fr.js`, `src/i18n/site.js` |
| Copy admin | `src/i18n/admin.js` |
| Formules, prix, inclus | `src/lib/formules.js` |
| Statuts CRM | `src/lib/suiviStatuts.js` |
| Auth admin + étudiant | `src/lib/studentAuth.js` |
| Scoring univ. | `src/lib/matching/score.js` + `weights.js` |
| Rapports matching | `src/lib/matching/reports.js`, `reportsLlm.js` |
| E-mails auto / intents | `src/lib/api/auto-reply.js`, `src/lib/emailIntents.js` |
| Inbound mail | `src/lib/api/inbound-email.js` |
| WhatsApp | `src/lib/api/whatsapp-webhook.js`, `whatsapp-send.js`, `src/lib/whatsapp/` |
| Relance quotidienne | `src/lib/api/formules-relance.js` (cron Vercel `0 2 * * *`) |
| Scan univ. (offline) | `scripts/scan-universities.mjs` → `data/universities/` → `import:universities` |

Anciennes routes Vercel style `(req, res)` : wrapper `adaptVercelHandler()` (`src/lib/adaptVercelHandler.js`). Préférer `NextResponse` sur le code nouveau.

## API (carte)

**Public :** `POST /api/contact-submit`, webhooks ` /api/webhooks/resend`, `/api/webhooks/whatsapp`

**Auth :** `/api/auth/login`, `/api/auth/register`

**Étudiant :** `/api/student/me`, `profile`, `formule`, `document`, `ensure-profile`, `request-access`, `auth/register`

**Admin :** `/api/admin/me`, `contacts`, `appointments`, `matching`, `matching/chinese`, `student-files`, `compose-email`, `universities/import-scan`

**Ops :** `POST /api/email/auto-reply`, `POST /api/whatsapp/send`, `GET /api/cron/formules-relance` (Bearer `CRON_SECRET`)

## Données Postgres (SQL dans `sql/`)

Appliquer les `.sql` dans l’éditeur Supabase, pas via une migration auto dans ce repo.

- `contacts` — dossiers (colonnes suivi, formule, lead form…)
- `suivi_actions` — historique d’actions CRM
- `admin_users` — allowlist admin (personne ne s’auto-promouvoit)
- `universities` — catalogue matching / partenaires
- `matching_runs` — JSON des analyses
- `appointments` — agenda admin
- Storage : `student-documents`

Schéma de référence : `sql/admin-security.sql`, `sql/universities.sql`, `sql/matching_runs.sql`, `sql/appointments.sql`.

Env : copier `.env.example`. Ne jamais committer `.env*`. Anciennes vars `VITE_*` encore lues en fallback dans `next.config.mjs`.

## Conventions

- Langue UI et e-mails : **français**. Ton : agence sérieuse, pas de garantie d’admission/bourse/visa.
- JS, pas TS. Pas de nouvelle dépendance si le stdlib / un package déjà là suffit.
- Logique métier dans `src/lib/*`, pas dans les `page.jsx`.
- Réutiliser `getSupabaseAdmin()`, `rateLimit()`, `publicStudentProfile()`, helpers formules/statuts.
- Après un changement de code : `graphify update .` (règle workspace).
- Prod : git → GitHub → Vercel sur `main`. Chantier auth / RLS / nouvelle feature : branche `feature/` ou `fix/` + PR. Copy ou un fichier : commit sur `main`.
- Ne pas committer `graphify-out/`, `.next/`, secrets.

## Explorer le code

Graphe du repo : `graphify-out/`. Avant un grep large :

```
graphify query "<question>"
graphify path "<A>" "<B>"
graphify explain "<symbole>"
```

Hubs utiles : `getAuthenticatedAdmin()`, `runMatching()`, `buildDualReports()`, `publicStudentProfile()`, `processInboundEmail()`.

## Commandes

```
npm run dev                 # localhost
npm run lint
npm run build
npm run scan:universities   # crawl + LLM → data/universities/
npm run import:universities # scan → table universities
```

## Pièges connus

1. **README.md** décrit Vite. L’app est Next.
2. `AGENTS.md` contient un bloc auto Next.js (`BEGIN:nextjs-agent-rules`) : ne pas le supprimer.
3. Statuts : UI canonique vs CHECK Postgres legacy — `toStoredStatut()`.
4. Formules : anciennes étiquettes en base, matcher via `aliases`.
5. Matching persisté avec préfixes `[[MATCHING_JSON]]` / `[[CHINESE_MATCHING_JSON]]`.
6. WhatsApp et Relance cron exigent leurs secrets ; webhooks sans secret = rejet.
7. CSP dans `next.config.mjs` : `connect-src` limité à `self` + `*.supabase.co`.
8. `npm test` n’existe pas (le pipeline workspace mentionne `tsc --noEmit` : ce repo est du JS).
