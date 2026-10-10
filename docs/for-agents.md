# Chinois en Devenir — brief agent

Lis ce fichier avant de modifier le code. Ignore le `README.md` racine (reliquat Vite).

**Produit :** agence francophone (`https://chinoisendevenir.com`) — orientation, matching univ. / école de langue, admission, bourses, visa. Pas une univ., pas le CSC, pas de garantie d’admission/bourse/visa. Copy et e-mails factuels.

**Stack :** Next.js 16 App Router, React 19, Tailwind 4, TS strict (`npm test` = `tsc --noEmit`), `@/*` → `src/*`. Node ≥ 20. Vercel depuis `main`. Package npm : `etudier-en-chine`.

**Git :** uniquement `main`. Jamais de branche. Après un changement : `npm test` → commit → `git push origin main`. Pas de `graphify-out/`, `.env*`, `.next/`, secrets. Après code : `graphify update .` (local, ne pas committer).

## Surfaces

| Surface | Routes | Qui |
|---|---|---|
| Public SEO | `/`, `/etudier-en-chine`, `/ecoles-de-langue-chine`, `/visa-etudiant-chine`, `/bourses`, `/processus`, `/tarifs`, `/faq`, `/blog`, `/blog/[slug]`, `/contact`, `/about` | Anonyme. FR, JSON-LD, `public/llms.txt`. Blog : guides `src/lib/blog/` + IA `blog_posts` (1/jour si sujet inédit, cron). |
| Étudiant | `/espace-etudiant`, `/espace-etudiant/connexion` | Supabase Auth. Orientation / documents après déblocage admin (`espace_debloque`). |
| Admin | `/admin/login`, `/admin/dashboard`, `/admin/universites`, `/admin/blog`, `/admin/rapport` | `ADMIN_EMAILS` + `admin_users`. Rôle `full` ou `limited`. |

`src/app/**/page.tsx` = metadata + vue `src/views/`. Métier dans `src/lib/`.

**Infra :** Auth + Postgres Supabase — le navigateur n’écrit pas les tables métier. APIs = service role (`src/lib/supabaseAdmin.ts`, bypass RLS). Resend = mails + inbound `contact@`. Mammouth = matching, bilans, e-mails admin, blog.

## Métier

**Contact = dossier** (`contacts`). Lien Auth via e-mail : `findContactByEmail` / `ensureStudentContact` (`studentAuth.ts`). UI publique : `publicStudentProfile()`.

**Formules** (`formules.ts`) — toujours `getFormuleNumber()` / `displayFormuleLabel()` / `getFormuleAccess()` (aliases historiques en base) :

1. Premier pas — 800 € (langue + visa)
2. Admission univ. — 1 700 € (≤ 5 candidatures)
3. Complet — 2 000 € (langue puis univ., ≤ 8)

**Suivi** (`suiviStatuts.ts`) : UI canonique ≠ CHECK Postgres. Toujours `canonicalStatut()` / `toStoredStatut()`. Espace étudiant **accessible dès qu'un compte est lié à un dossier** (formule pas obligatoire pour se connecter). L'étudiant choisit sa formule dans l'espace (`POST /api/student/formule`) s'il n'en a pas encore ; ensuite plus de changement côté étudiant. Déblocage orientation / documents = flag `espace_debloque` (bouton admin, **sans** passer le statut en `client_payé`). SQL : `sql/contacts-espace-debloque.sql`. Progression : `studentProgress.ts`. Ne pas reculer un statut sans le dire (`shouldAdvanceStatus()`). Pas de paiement en ligne auto.

**Mails** (`contactEmails.ts`) : fil Resend inbound + `sendTemplatedEmail`. Pas de sync Gmail. Inbound : **pas** de réponse auto aux questions — seulement bienvenue et confirmation de formule. Fil admin (`AdminContactEmailThread`) : bulles conversation, **Objet + Contenu** (signature incluse), en haut du dossier (full + limited). Le file Emails = compose seulement. Accueil admin (full + limited) : bloc **Email reçu** sous les filtres (`AdminUnansweredEmails` + `GET /api/admin/emails-week`) — à répondre (dernier = inbound) / en attente étudiant (dernier = outbound). Full seulement : bloc **WhatsApp reçu** juste en dessous (`AdminWhatsappInbox` + `GET /api/admin/whatsapp-inbox`), même découpage sur le dernier message OpenWA. Les « à répondre » deviennent une tâche du jour (`source=whatsapp`), visible seulement par l'admin global. Tag court à côté du nom (`emailTagSummary.ts` : heuristique + batch Mammouth). Boutons « Lire l'email » (modal), « Ouvrir la fiche » et « Retirer » (`dismissed_at` sur le dernier mail ; le fil revient s'il y a un mail plus récent).

**Attribution** (`contactOwner.ts`) : manuelle (`assigned_to` / `assigned_at`). Helpers `contactAssignPatch()` / `contactUnassignPatch()`. Primes (`contactRevenue.ts`) : dossier attribué au restreint → global 60 % / restreint 40 %, sinon global 100 %. Historique : emails reçus = acteur `étudiant` (🎓) ; `système_automatique` = envoi mail auto seulement. Tags inbound `[demande_formules]` / `[auto:tarifs]` réécrits en clair (`suiviHistory.ts`).

**Matching** (`matching/run.ts` → `runMatching()`) : normalize → enrich LLM → `rankMatches` (`weights.ts`, pas `score.ts`) → mix safety/match/reach → rapports dual → `persist.ts` (`matching_runs`). Langue : `chinese.ts`, préfixe `[[CHINESE_MATCHING_JSON]]`. Univ. : `[[MATCHING_JSON]]`. Mix limité par formule. Vue étudiant : `matchingForStudent()`.

**Docs :** bucket `student-documents` (`studentDocuments.ts`). Les pièces à déposer ne sont pas une liste fixe : l'admin coche le catalogue (`STUDENT_DOCUMENT_CATALOG`) sur la fiche. Seules les clés dans `contacts.documents_demandes` s'affichent dans l'espace étudiant (formule 1 comprise, si l'espace est ouvert). SQL : `sql/contacts-documents-demandes.sql`. Les fichiers envoyés par l'admin restent liés à `access.documents` (formule 2+).

## Auth

- `/api/auth/*` → `authUsers.ts` + `rateLimit()` (`httpSecurity.ts`)
- Étudiant : `/api/student/*` via `getAuthenticatedContact()`
- Admin : toujours `getAuthenticatedAdmin(request)` puis `requireFullAdmin` si besoin (`adminRoles.ts`)
- `full` : univ., matching (lancer/supprimer), bulk mail, suppression contacts, WhatsApp (OpenWA)
- `limited` : étudiants / agenda / mail contact, assigner une formule (cases à cocher dans le bandeau de la fiche, sans débloquer l'espace), lecture matching seulement, pas univ. / WhatsApp.
- Anon ne lit pas `contacts` / `universities` / `matching_runs`. Nouvelle table : RLS on, grants `service_role`, SQL dans `sql/` (éditeur Supabase, pas de migration auto).

Register / recover : uniquement si l’e-mail existe déjà dans `contacts`. Compte activé tout de suite (pas de mail de confirmation).

## Où poser le code

| Besoin | Fichier |
|---|---|
| Copy SEO / site | `seo.ts`, `i18n/site.ts` |
| Copy admin | `i18n/admin.ts` |
| Formules | `formules.ts` |
| Statuts | `suiviStatuts.ts` |
| Auth | `studentAuth.ts` |
| Scoring / rapports | `matching/score.ts`, `weights.ts`, `reports.ts`, `reportsLlm.ts` |
| Blog IA | `blog/generate.ts`, `store.ts`, cron `blog-generate`, `/admin/blog` |
| Auto-reply / intents | `api/auto-reply.ts`, `emailIntents.ts` |
| Inbound | `api/inbound-email.ts` |
| Relance formules | `api/formules-relance.ts` (cron `0 2 * * *`) |
| Scan univ. | `scripts/scan-universities.mjs` → `data/universities/` → `import:universities`. Langue 2027 : `npx tsx scripts/import-language-programs.ts [xlsx\|csv]`. Ne pas écraser `required_documents` d’une univ. diplôme. |

APIs : `NextResponse` dans `route.ts`. Réutiliser `getSupabaseAdmin()`, `rateLimit()`, `publicStudentProfile()`, `readJsonObject` / `asString` (`request.ts`).

## API

**Public :** `POST /api/contact-submit`, `POST /api/webhooks/resend`  
**Auth :** `login`, `register`, `recover`  
**Étudiant :** `me`, `profile`, `formule`, `document`  
**Admin :** `me`, `contacts`, `emails-week` (GET full+limited), `daily-report` (GET full), `matching` (GET/POST/DELETE full), `matching/chinese`, `student-files`, `compose-email`, `whatsapp` (full), `inbox-priority` (full), `universities/import-scan`, `blog` (full)  
**Ops :** `POST /api/email/auto-reply`, crons `formules-relance`, `blog-generate` (1/jour), `daily-report` (20h Pékin = `0 12 * * *` UTC → mail aux `ADMIN_EMAILS` + page `/admin/rapport`). Bearer `CRON_SECRET`. Webhook Resend sans secret = rejet. Le cron du rapport n'écrit pas les tâches du jour.

**WhatsApp inbound (OpenWA) :** pas de webhook site — OpenWA POST en direct l'URL Cursor (`message.received`, filtre `fromMe: false`). Helper `GET|POST|DELETE /api/agent/openwa-webhooks` (header `Authorization: Bearer CRON_SECRET`), env serveur `OPENWA_*`. POST ré-exécutable : même `url` → update, pas de doublon. Ne pas toucher `/api/webhooks/resend`.

```bash
curl -X POST https://chinoisendevenir.com/api/agent/openwa-webhooks \
  -H "Authorization: Bearer $CRON_SECRET" \
  -H "Content-Type: application/json" \
  -d '{"url":"https://api2.cursor.sh/automations/webhook/0fd1fd86-c1ea-5eec-961f-6c0237ed81b1","events":["message.received"]}'

curl https://chinoisendevenir.com/api/agent/openwa-webhooks \
  -H "Authorization: Bearer $CRON_SECRET"

curl -X DELETE "https://chinoisendevenir.com/api/agent/openwa-webhooks?id=WEBHOOK_ID" \
  -H "Authorization: Bearer $CRON_SECRET"
```

**Tâches du jour** (`day_tasks`) : une tâche non cochée (`done=false`) reste dans la liste des jours suivants (`dayTaskBelongsToday`). Une seule ligne par étudiant (`pickVisibleDayTasks`) : la plus ancienne encore ouverte. GrokBot et WhatsApp n'en ajoutent pas une autre si le dossier est déjà dans la liste. L'admin les pose dans la fiche (`source=admin`) : s'il en existe déjà une ouverte, le texte est mis à jour au lieu d'en créer une deuxième. GrokBot lit les fiches avec `GET /api/agent/contacts` et le header `Authorization: Bearer CRON_SECRET`. Sans paramètre, jusqu'à 1000 fiches. La suite : `?offset=200` ou `?page=2` (tranches de 200). La réponse indique `total`, `offset` et `limit`. Chaque fiche a `emails` et `whatsapp` (3 derniers messages, `in` / `out`). WhatsApp est lu dans OpenWA ; s'il ne répond pas, `whatsapp` est vide et le reste de la fiche reste là. Il ajoute ensuite les tâches : `POST /api/agent/day-tasks`, corps `{ "tasks": [{ "contactId", "task" }] }` (jour Shanghai si `day` est omis). L'assignation affichée est « système automatique », pas un email. S'il y a déjà une tâche visible pour ce dossier, elle n'est pas recréée. SQL : `sql/day-tasks.sql`.

**Tables :** `contacts` (suivi, formule, `paiements` 3 échéances, `espace_debloque`, `prioritaire`, pays via `countries.ts`), `contact_emails`, `suivi_actions`, `admin_users`, `universities`, `matching_runs`, `blog_posts`. SQL : `sql/admin-security.sql`, `universities.sql`, `matching_runs.sql`, `blog-posts.sql`, `sql/contacts-espace-debloque.sql`. Env : `.env.example`. Public : `NEXT_PUBLIC_SUPABASE_*` (fallback `VITE_SUPABASE_*`).

## Explorer

Avant grep large : `graphify query`, `path`, `explain`. Hubs : `getAuthenticatedAdmin()`, `runMatching()`, `buildDualReports()`, `publicStudentProfile()`, `processInboundEmail()`.

`npm run dev` / `lint` / `build`. Scan : `npm run scan:universities` puis `import:universities`.

## Pièges

1. Bloc auto Next dans `AGENTS.md` (`BEGIN:nextjs-agent-rules`) : ne pas le supprimer.
2. CSP `next.config.mjs` : `connect-src` = `self` + `*.supabase.co`.
3. UI FR ; ton sérieux, zéro garantie.
