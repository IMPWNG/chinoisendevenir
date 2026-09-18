# Chinois en Devenir — brief pour agent IA

Lis ce fichier avant de modifier le code. Le `README.md` racine est un reliquat Vite : **ignore-le**.

## Produit

**Chinois en Devenir** (`https://chinoisendevenir.com`) est l’app d’une agence francophone qui accompagne des étudiants pour **étudier en Chine** : orientation, matching universités / écoles de langue, dossier d’admission, bourses, visa.

Ce n’est **pas** une université, **pas** le CSC, **pas** un garant d’admission / bourse / visa. Toute copy publique et tout e-mail doivent rester factuels là-dessus.

Package npm : `etudier-en-chine`. Repo : App Router Next.js 16 + React 19, déployé Vercel depuis `main`.

## Trois surfaces

| Surface | Routes | Qui |
|---|---|---|
| Site public SEO | `/`, `/etudier-en-chine`, `/ecoles-de-langue-chine`, `/visa-etudiant-chine`, `/bourses`, `/processus`, `/tarifs`, `/faq`, `/blog`, `/blog/[slug]`, `/contact`, `/about` | Anonyme. Copy FR, JSON-LD, `public/llms.txt`. Blog : 20 articles pré-rédigés, **1 publication/jour** via `publishedAt` (Europe/Paris) dans `src/lib/blog/`. |
| Espace étudiant | `/espace-etudiant`, `/espace-etudiant/connexion` | Compte Supabase Auth. Accès gated par paiement / statut. |
| Admin | `/admin/login`, `/admin/dashboard`, `/admin/universites` | Allowlist `ADMIN_EMAILS` + table `admin_users`. Rôle `full` ou `limited`. |

Les pages `src/app/**/page.tsx` sont minces : metadata SEO + import d’une vue dans `src/views/`. La logique vit dans `src/lib/`.

## Stack

- **Next.js 16** App Router, **TypeScript** (`strict: true`, `tsc --noEmit` via `npm test`), alias `@/*` → `src/*`
- **React 19** + **Tailwind 4**
- **Supabase** : Auth + Postgres. Le navigateur n’écrit pas les tables métier. Les API routes utilisent la **service role** (`src/lib/supabaseAdmin.ts`) et bypassent RLS.
- **Resend** : e-mails transactionnels + inbound (`contact@chinoisendevenir.com`)
- **Mammouth** (`MAMMOUTH_API_KEY`) : LLM matching, bilans, rédaction d’e-mails admin
- Node `>= 20`. Qualité = `npm test` (`tsc --noEmit`) + `npm run lint` + `npm run build`.

## Modèle métier

### Contact = dossier

Table centrale : `contacts`. Un étudiant Auth est relié à une ligne `contacts` via l’e-mail (`findContactByEmail` / `ensureStudentContact` dans `src/lib/studentAuth.ts`).

Profil public côté UI : `publicStudentProfile()`.

### Formules (`src/lib/formules.ts`)

Source de vérité des offres, aliases historiques, et droits débloqués (`getFormuleAccess`) :

1. **Premier pas en Chine — 800 €** : école de langue + visa
2. **Admission universitaire — 1 700 €** : jusqu’à 5 candidatures
3. **Accompagnement complet — 2 000 €** : langue puis univ., jusqu’à 8 candidatures

Les libellés stockés en base peuvent être d’anciens prix (`aliases`). Toujours passer par `getFormuleNumber()` / `displayFormuleLabel()`, ne pas parser le string à la main.

### Suivi (`src/lib/suiviStatuts.ts`)

Machine à états du CRM. Noms **canoniques** en UI ≠ noms **stockés** en Postgres (CHECK legacy). Toujours `canonicalStatut()` / `toStoredStatut()`.

Statuts payés / espace débloqué : `PAID_STATUSES`, `STUDENT_UNLOCKED_STATUSES`. Progression affichée : `src/lib/studentProgress.ts`.

Ne jamais avancer un statut en arrière sans le dire ; `shouldAdvanceStatus()` existe pour ça.

### Emails contact (`sql/contact-emails.sql`, `src/lib/contactEmails.ts`)

Fil envoyés/reçus pour l’admin (badge non-lus + chat dans la fiche). Rempli par Resend inbound + `sendTemplatedEmail` / bienvenue formulaire. Pas de sync Gmail complète — uniquement ce qui passe par Resend (`contact@`).

### Attribution dossiers (`src/lib/contactOwner.ts`)

Attribution **manuelle** (case à cocher dans la fiche admin). Migration `sql/contacts-assigned.sql` :
- `assigned_to` / `assigned_at` — admin responsable du dossier (primes / suivi)

Helpers : `contactAssignPatch()`, `contactUnassignPatch()`, `isAssignedTo()`. Pas d’attribution automatique au toucher ni au paiement.

Primes : `src/lib/contactRevenue.ts`. Si le dossier est attribué à l’admin restreint, le global touche 60 % et le restreint 40 % du prix de la formule. Sinon le global touche 100 %. Carte admin : hypothétique (formule choisie, non payée) / réel (statut payé). Filtre « Dossiers admin restreint » visible pour le rôle `full`.

### Matching universités

Pipeline : `src/lib/matching/run.ts` → `runMatching()`.

```
contact → normalizeStudent → enrichStudent (LLM)
       → rankMatches(score.ts, weights.ts)
       → selectMix (safety / match / reach)
       → generateDualReports (admin + étudiant)
       → persist.ts (table matching_runs, payload JSON)
```

Poids dans `src/lib/matching/weights.ts` (pas dans `score.ts`). Matching écoles de langue : `src/lib/matching/chinese.ts`, préfixe `[[CHINESE_MATCHING_JSON]]`.

Limite du mix = formule (1/2/3). Vue étudiant filtrée : `matchingForStudent()` dans `studentView.ts`.

### Documents

Bucket Storage `student-documents`. Logique : `src/lib/studentDocuments.ts`. L’étudiant n’y accède que si `access.documents` (formule débloquée).

## Auth et rôles

- Login/register : `/api/auth/*` → `src/lib/authUsers.ts` + rate limit `httpSecurity.ts`
- Étudiant : routes `/api/student/*` via `getAuthenticatedContact()`
- Admin API : **toujours** `getAuthenticatedAdmin(request)` puis, si besoin, `requireFullAdmin(auth)` (`src/lib/adminRoles.ts`)

Rôles :

- `full` : universités, matching, bulk e-mail, suppression contacts
- `limited` (`ADMIN_LIMITED_EMAILS`) : étudiants / agenda / e-mail contact, pas matching ni universités

Le client anon Supabase ne doit pas lire `contacts` / `universities` / `matching_runs`. Toute nouvelle table métier : RLS on, grants service_role, SQL dans `sql/`.

## Où poser le code

| Besoin | Fichier |
|---|---|
| Copy / FAQ / metadata site | `src/lib/seo.ts`, `src/i18n/site.ts` |
| Copy admin | `src/i18n/admin.ts` |
| Formules, prix, inclus | `src/lib/formules.ts` |
| Statuts CRM | `src/lib/suiviStatuts.ts` |
| Auth admin + étudiant | `src/lib/studentAuth.ts` |
| Scoring univ. | `src/lib/matching/score.ts` + `weights.ts` |
| Rapports matching | `src/lib/matching/reports.ts`, `reportsLlm.ts` |
| E-mails auto / intents | `src/lib/api/auto-reply.ts`, `src/lib/emailIntents.ts`. Inbound : pas de réponse auto aux questions. Seuls le mail de bienvenue et la confirmation de formule partent seuls. |
| Inbound mail | `src/lib/api/inbound-email.ts` |
| Relance quotidienne | `src/lib/api/formules-relance.ts` (cron Vercel `0 2 * * *`) |
| Scan univ. (offline) | `scripts/scan-universities.mjs` → `data/universities/` → `import:universities` |

Handlers API : `NextResponse` dans `route.ts` (plus de wrapper Vercel `(req, res)`).

## API (carte)

**Public :** `POST /api/contact-submit`, webhook `/api/webhooks/resend`

**Auth :** `/api/auth/login`, `/api/auth/register`

**Étudiant :** `/api/student/me`, `profile`, `formule`, `document`

**Admin :** `/api/admin/me`, `contacts`, `matching`, `matching/chinese`, `student-files`, `compose-email`, `universities/import-scan`

**Ops :** `POST /api/email/auto-reply`, `GET /api/cron/formules-relance` (Bearer `CRON_SECRET`)

## Données Postgres (SQL dans `sql/`)

Appliquer les `.sql` dans l’éditeur Supabase, pas via une migration auto dans ce repo.

- `contacts` — dossiers (colonnes suivi, formule, lead form…). Pays canoniques : `src/lib/countries.ts` (liste déroulante du formulaire).
- `suivi_actions` — historique d’actions CRM
- `admin_users` — allowlist admin (personne ne s’auto-promouvoit)
- `universities` — catalogue matching / partenaires
- `matching_runs` — JSON des analyses
- Storage : `student-documents`

Schéma de référence : `sql/admin-security.sql`, `sql/universities.sql`, `sql/matching_runs.sql`.

Env : copier `.env.example`. Ne jamais committer `.env*`. Vars publiques : `NEXT_PUBLIC_SUPABASE_URL` / `NEXT_PUBLIC_SUPABASE_ANON_KEY` (fallback build : `VITE_SUPABASE_*` si encore présentes sur Vercel).

## Conventions

- Langue UI et e-mails : **français**. Ton : agence sérieuse, pas de garantie d’admission/bourse/visa.
- TypeScript strict. Pas de nouvelle dépendance si le stdlib / un package déjà là suffit.
- Logique métier dans `src/lib/*`, pas dans les `page.tsx`.
- Réutiliser `getSupabaseAdmin()`, `rateLimit()`, `publicStudentProfile()`, helpers formules/statuts, `readJsonObject` / `asString` (`src/lib/request.ts`).
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
6. Relance cron exige `CRON_SECRET` ; webhooks Resend sans secret = rejet.
7. CSP dans `next.config.mjs` : `connect-src` limité à `self` + `*.supabase.co`.
8. Qualité : `npm test` (`tsc --noEmit`) + `npm run lint` + `npm run build`.
