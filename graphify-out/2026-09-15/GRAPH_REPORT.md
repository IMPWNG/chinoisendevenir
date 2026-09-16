# Graph Report - chinoisendevenir  (2026-09-12)

## Corpus Check
- 296 files · ~360,579 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 1311 nodes · 3267 edges · 66 communities (55 shown, 8 thin omitted)
- Extraction: 97% EXTRACTED · 3% INFERRED · 0% AMBIGUOUS · INFERRED: 88 edges (avg confidence: 0.84)
- Token cost: 0 input · 0 output

## Community Hubs (Navigation)
- Public SEO Pages
- Student Auth Documents
- Auth and Contact API
- Student Matching UI
- Admin Calendar Appointments
- Matching Dual Reports
- Package Dependencies
- University Scan Script
- Orientation Bilan Reports
- University Scan Import
- Inbound Email Processing
- AI Email Compose
- WhatsApp Cloud Send
- Stripe and RLS Docs
- Student Formule Catalog
- Email Intent Templates
- Matching Narrative Mix
- Chinese School Matching
- Student Profile Enrichment
- WhatsApp Webhook Intake
- Matching Weights Catalog
- Admin Universities UI
- SEO Audit Skill
- Scoped Auth Contexts
- Admin Dashboard Shell
- Auto-Reply Email Templates
- WhatsApp Formule Messages
- Formules Relance Cron
- Suivi Status Machine
- Matching Student Constants
- University Match Scoring
- Postgres Index Guidelines
- Postgres Schema Indexes
- Admin i18n Layout
- Postgres Connection Pooling
- Admin Contact Email
- Scrapling University Crawler
- LLM Public Briefs
- SVG Icon Sprite
- Admin Access Guards
- Admin Matching Report UI
- Postgres Best Practices Skill
- Postgres Locking Patterns
- JSONB Full-Text Search
- Admin Contact Info Form
- Postgres Data Access
- Admin Chinese Matching UI
- Favicon Brand Mark
- Resend Webhook Verify
- Admin Bulk Email
- Student Matching View
- Domain Semantic Similarity
- Postgres Query Monitoring
- Vercel Cron Config
- JSConfig Path Aliases
- Next.js Security Headers
- Apple Touch Icon
- App Favicon Icon
- About Page Redirect
- Student Space Layout
- Find Skills CLI
- Snake Case Identifiers
- Dependabot Weekly Updates

## God Nodes (most connected - your core abstractions)
1. `useSiteI18n()` - 59 edges
2. `getAuthenticatedAdmin()` - 30 edges
3. `processInboundEmail()` - 29 edges
4. `buildDualReports()` - 26 edges
5. `react` - 25 edges
6. `useAdminI18n()` - 23 edges
7. `AdminCalendar()` - 21 edges
8. `getChosenFormule()` - 21 edges
9. `displayFormulePrice()` - 20 edges
10. `publicStudentProfile()` - 19 edges

## Surprising Connections (you probably didn't know these)
- `React Vite Template README` --conceptually_related_to--> `Next.js Agent Rules`  [AMBIGUOUS]
  README.md → AGENTS.md
- `pgvector` --semantically_similar_to--> `Use tsvector for Full-Text Search`  [INFERRED] [semantically similar]
  .agents/skills/supabase-postgres-best-practices/SKILL.md → .agents/skills/supabase-postgres-best-practices/references/advanced-full-text-search.md
- `Use EXPLAIN ANALYZE to Diagnose Slow Queries` --semantically_similar_to--> `Enable pg_stat_statements for Query Analysis`  [INFERRED] [semantically similar]
  .agents/skills/supabase-postgres-best-practices/references/monitor-explain-analyze.md → .agents/skills/supabase-postgres-best-practices/references/monitor-pg-stat-statements.md
- `Next.js Sitemap Self-Reference Caveat` --conceptually_related_to--> `Next.js Agent Rules`  [INFERRED]
  .agents/skills/seo-audit/references/international-seo.md → AGENTS.md
- `verify()` --calls--> `adminCapabilities()`  [EXTRACTED]
  src/components/ProtectedRoute.jsx → src/lib/adminRoles.js

## Import Cycles
- None detected.

## Hyperedges (group relationships)
- **Connection Management Best Practices** — _agents_skills_supabase_postgres_best_practices_references_conn_pooling_connection_pooling, _agents_skills_supabase_postgres_best_practices_references_conn_limits_connection_limits, _agents_skills_supabase_postgres_best_practices_references_conn_idle_timeout_idle_connection_timeouts, _agents_skills_supabase_postgres_best_practices_references_conn_prepared_statements_prepared_statements_with_pooling [EXTRACTED 1.00]
- **Concurrency and Locking Best Practices** — _agents_skills_supabase_postgres_best_practices_references_lock_advisory_advisory_locks, _agents_skills_supabase_postgres_best_practices_references_lock_deadlock_prevention_consistent_lock_ordering, _agents_skills_supabase_postgres_best_practices_references_lock_short_transactions_short_transactions, _agents_skills_supabase_postgres_best_practices_references_lock_skip_locked_skip_locked [EXTRACTED 1.00]
- **Data Access Pattern Best Practices** — _agents_skills_supabase_postgres_best_practices_references_data_batch_inserts_batch_inserts, _agents_skills_supabase_postgres_best_practices_references_data_n_plus_one_n_plus_one_elimination, _agents_skills_supabase_postgres_best_practices_references_data_pagination_cursor_pagination, _agents_skills_supabase_postgres_best_practices_references_data_upsert_upsert [EXTRACTED 1.00]
- **PostgreSQL Indexing Strategy** — _agents_skills_supabase_postgres_best_practices_references_query_index_types_choose_right_index_type, _agents_skills_supabase_postgres_best_practices_references_query_missing_indexes_where_join_indexes, _agents_skills_supabase_postgres_best_practices_references_query_partial_indexes_partial_indexes, _agents_skills_supabase_postgres_best_practices_references_schema_foreign_key_indexes_index_fk_columns [INFERRED 0.85]
- **Postgres Access Control Defense in Depth** — _agents_skills_supabase_postgres_best_practices_references_security_privileges_least_privilege, _agents_skills_supabase_postgres_best_practices_references_security_rls_basics_row_level_security, _agents_skills_supabase_postgres_best_practices_references_security_rls_performance_select_wrapper, _agents_skills_supabase_postgres_best_practices_references_security_rls_performance_security_definer [INFERRED 0.85]
- **Chinois en Devenir LLM Citation Corpus** — public_llms_chinois_en_devenir, public__well_known_llms_chinois_en_devenir, public_llms_full_chinois_en_devenir [EXTRACTED 1.00]
- **Glass Folded-Ribbon Favicon Composition** — public_favicon_folded_ribbon_glyph, public_favicon_alpha_mask, public_favicon_iridescent_overlay, public_favicon_brand_purple [EXTRACTED 1.00]
- **Icons in the SVG Sprite** — public_icons_bluesky_icon, public_icons_discord_icon, public_icons_documentation_icon, public_icons_github_icon, public_icons_social_icon, public_icons_x_icon [EXTRACTED 1.00]
- **Filled Social Brand Logos** — public_icons_bluesky_icon, public_icons_discord_icon, public_icons_github_icon, public_icons_x_icon, public_icons_dark_brand_fill [INFERRED 0.85]
- **Purple Stroke UI Glyphs** — public_icons_documentation_icon, public_icons_social_icon, public_icons_purple_accent_stroke, public_icons_ui_chrome_glyphs [INFERRED 0.85]

## Communities (66 total, 8 thin omitted)

### Community 0 - "Public SEO Pages"
Cohesion: 0.06
Nodes (65): metadata, metadata, metadata, metadata, metadata, metadata, metadata, RootLayout() (+57 more)

### Community 1 - "Student Auth Documents"
Cohesion: 0.05
Nodes (88): GET(), POST(), GET(), POST(), GET(), DELETE(), GET(), loadFiles() (+80 more)

### Community 2 - "Auth and Contact API"
Cohesion: 0.07
Nodes (45): POST(), POST(), adapted, OPTIONS, POST, adapted, OPTIONS, POST (+37 more)

### Community 3 - "Student Matching UI"
Cohesion: 0.06
Nodes (45): BUDGET_VALUES, EMPTY_FORM, INTAKE_VALUES, LeadForm(), StudentChineseMatching(), ROAD_STATUS_MARK, StudentMatching(), StudentProtectedRoute() (+37 more)

### Community 4 - "Admin Calendar Appointments"
Cohesion: 0.09
Nodes (54): DELETE(), GET(), limited(), PATCH(), POST(), FIELD_LABELS, filled(), PATCH() (+46 more)

### Community 5 - "Matching Dual Reports"
Cohesion: 0.10
Nodes (43): adminGuideline(), applicationCap(), applicationMixAdvice(), blankOr(), blockingFields(), BREAKDOWN_ORDER, breakdownBars(), buildDualReports() (+35 more)

### Community 6 - "Package Dependencies"
Cohesion: 0.05
Nodes (42): compat, eslintConfig, allowScripts, unrs-resolver, dependencies, next, react, react-dom (+34 more)

### Community 7 - "University Scan Script"
Cohesion: 0.09
Nodes (41): args, callMammouthJson(), CATALOG_PATH, closeTruncatedJson(), crawlUniversity(), enqueue(), decodeHtml(), discoverUrls() (+33 more)

### Community 8 - "Orientation Bilan Reports"
Cohesion: 0.12
Nodes (39): getFormuleAccess(), applicationLimit(), applyPolishedJson(), BILAN_DISCLAIMER, buildFormule1BilanDraft(), buildFormule1BilanFromResult(), buildOrientationBilanDraft(), buildOrientationBilanFromResult() (+31 more)

### Community 9 - "University Scan Import"
Cohesion: 0.14
Nodes (27): admin, catalog, ROOT, buildAdmissionSummary(), canonicalUniversityKey(), compactRequirement(), dedupeScanProfiles(), DOC_FR (+19 more)

### Community 10 - "Inbound Email Processing"
Cohesion: 0.13
Nodes (27): classifyInboundIntent(), createContactFromInbound(), extractEmailAddress(), extractForwardedSender(), extractLatestReply(), fetchReceivedEmail(), fetchRecentActions(), filledName() (+19 more)

### Community 11 - "AI Email Compose"
Cohesion: 0.17
Nodes (23): POST(), uniqueIds(), BULK_AI_TOPIC_KEYS, BULK_AI_TOPICS, clip(), clipNotes(), closeTruncatedJson(), composeBulkEmailWithAi() (+15 more)

### Community 12 - "WhatsApp Cloud Send"
Cohesion: 0.17
Nodes (22): @supabase/supabase-js, GET(), maxDuration, POST(), deliverWhatsApp(), handleWhatsAppSend(), sendWhatsAppToContact(), supabase (+14 more)

### Community 13 - "Stripe and RLS Docs"
Cohesion: 0.10
Nodes (24): Stripe Customer Portal, Elements with Checkout Sessions, One-Time Hosted Checkout, Stripe Refunds and Disputes, Webhook Idempotency, Webhook Signature Verification, Checkout Sessions, Payment Intents (+16 more)

### Community 14 - "Student Formule Catalog"
Cohesion: 0.18
Nodes (21): StudentFormuleBanner(), StudentFormules(), generateFormulesPresentationTemplate(), canonicalFormuleValue(), displayFormuleFootnote(), displayFormuleLabel(), displayFormulePrice(), FORMULE_1_INCLUDES (+13 more)

### Community 15 - "Email Intent Templates"
Cohesion: 0.21
Nodes (21): AUTO_REPLY_MARKER(), autoReplyMarker(), descriptionHasAutoMarker(), displayNameFromFrom(), EMAIL_INTENTS, extractPersonName(), formCtaHtml(), generateAdmissionReplyTemplate() (+13 more)

### Community 16 - "Matching Narrative Mix"
Cohesion: 0.18
Nodes (17): identifyGaps(), monthsForHskGap(), groupMix(), selectMix(), takeFrom(), buildClientMessage(), buildInternalBrief(), buildUniversityAnalysis() (+9 more)

### Community 17 - "Chinese School Matching"
Cohesion: 0.21
Nodes (19): CATEGORIES, categoryFromScore(), clamp(), costLabel(), filled(), intakeLabel(), languageCost(), languageIntakeMonths() (+11 more)

### Community 18 - "Student Profile Enrichment"
Cohesion: 0.22
Nodes (18): CHINESE_LEVEL_TO_HSK, clamp(), computeQualityScore(), emptyIa(), englishFromIa(), enrichStudent(), extractMotivationSignals(), filled() (+10 more)

### Community 19 - "WhatsApp Webhook Intake"
Cohesion: 0.20
Nodes (17): GET(), maxDuration, POST(), detectFormule(), detectInterest(), looksLikeQuestion(), normalizeText(), saveChosenFormule() (+9 more)

### Community 20 - "Matching Weights Catalog"
Cohesion: 0.15
Nodes (17): filled(), normalizeUniversity(), reqFor(), toNumber(), unique(), yearlyLivingCost(), CATEGORY_THRESHOLDS, CHINESE_MATCH_SIZE (+9 more)

### Community 21 - "Admin Universities UI"
Cohesion: 0.16
Nodes (14): toUniversityInsert(), UNIVERSITY_SEED, AdminUniversities(), AdmissionChips(), chipClass(), EMPTY_FORM, formToPayload(), inputClass() (+6 more)

### Community 22 - "SEO Audit Skill"
Cohesion: 0.14
Nodes (18): AI Writing Detection, Em Dashes as AI Tell, Canonical Overrides Hreflang, Google Localized Versions Docs, Helpful Content System, International SEO Evidence, Next.js Sitemap Self-Reference Caveat, hreflang x-default (+10 more)

### Community 23 - "Scoped Auth Contexts"
Cohesion: 0.18
Nodes (11): AdminAuthProvider, { AuthProvider, useScopedAuth }, { AuthProvider, useScopedAuth }, StudentAuthProvider, useStudentAuth, createScopedAuth(), applySession(), AuthProvider() (+3 more)

### Community 24 - "Admin Dashboard Shell"
Cohesion: 0.21
Nodes (14): AdminShell(), adminFetch(), AdminStudentFiles(), useAdminAccess(), useAdminI18n(), mergeFormuleNote(), stripFormuleNote(), STUDENT_PROCESS_STEPS (+6 more)

### Community 25 - "Auto-Reply Email Templates"
Cohesion: 0.16
Nodes (16): EMAIL_TEMPLATES, generateFormuleConfirmeeTemplate(), generateRelance1Template(), generateRelance2Template(), generateRelanceFormulesTemplate(), requestFromNodeHeaders(), resend, supabase (+8 more)

### Community 26 - "WhatsApp Formule Messages"
Cohesion: 0.18
Nodes (17): EXTRA_FEES, FORMULES, PAYMENT_NOTE, callingCodeFromCountry(), COUNTRY_CALLING_CODES, digitsOnly(), fold(), generateFormuleConfirmeeText() (+9 more)

### Community 27 - "Formules Relance Cron"
Cohesion: 0.23
Nodes (15): GET(), isAuthorizedCron(), maxDuration, POST(), runCron(), handler(), logAction(), sendTemplatedEmail() (+7 more)

### Community 28 - "Suivi Status Machine"
Cohesion: 0.17
Nodes (16): maybeSendIntentAutoReply(), CANONICAL_TO_STORED_STATUT, canonicalStatut(), EARLY_STATUSES, FORMULES_AWAITING_REPLY, isFormuleAlreadyChosen(), isFormulesAwaitingReply(), LEGACY_STATUT_MAP (+8 more)

### Community 29 - "Matching Student Constants"
Cohesion: 0.24
Nodes (15): BUDGET_BANDS, diplomaToTargetDegree(), DOMAIN_FAMILIES, DOMAIN_KEYS, englishToIelts(), englishToToefl(), EUR_TO_CNY, infoStatus() (+7 more)

### Community 30 - "University Match Scoring"
Cohesion: 0.24
Nodes (16): categoryMetaFromScore(), priorityFromScore(), clamp(), diplomaFitsTarget(), hardFilter(), intakeTooFar(), matchUniversity(), recommendFormula() (+8 more)

### Community 31 - "Postgres Index Guidelines"
Cohesion: 0.17
Nodes (15): Concrete Transformation Patterns, Error-First Structure, Impact Level Guidelines, Quantified Impact, Self-Contained Examples, Semantic Naming, Postgres Reference Writing Guidelines, Query Performance (+7 more)

### Community 32 - "Postgres Schema Indexes"
Cohesion: 0.13
Nodes (15): BRIN Index, B-tree Index, Choose the Right Index Type, GIN Index, GiST Index, Hash Index, PostgreSQL Index Types Documentation, Appropriate PostgreSQL Data Types (+7 more)

### Community 33 - "Admin i18n Layout"
Cohesion: 0.21
Nodes (9): metadata, useAdminAuth, AdminI18nContext, AdminI18nProvider(), interpolate(), lookup(), ADMIN_LANGS, adminTranslations (+1 more)

### Community 34 - "Postgres Connection Pooling"
Cohesion: 0.20
Nodes (14): Connection Management, Configure Idle Connection Timeouts, idle_session_timeout, Set Appropriate Connection Limits, max_connections, work_mem, Use Connection Pooling for All Applications, PgBouncer (+6 more)

### Community 35 - "Admin Contact Email"
Cohesion: 0.21
Nodes (12): AdminContactEmail(), composeWithAi(), sendEmail(), authedFetch(), fieldClass(), TEMPLATE_OPTIONS, ADMIN_NOTIFY_EMAIL, CONTACT_FROM (+4 more)

### Community 36 - "Scrapling University Crawler"
Cohesion: 0.28
Nodes (11): Namespace, allowed_domains_for(), crawl_university(), load_targets(), main(), make_spider_class(), __init__(), parse() (+3 more)

### Community 37 - "LLM Public Briefs"
Cohesion: 0.23
Nodes (13): Chinois en Devenir, No Guarantee Policy, Chinois en Devenir, CSC Scholarships, Chinese Language Year, Chinois en Devenir Agency, China Scholarship Council, JW201 JW202 Forms (+5 more)

### Community 38 - "SVG Icon Sprite"
Cohesion: 0.38
Nodes (13): Bluesky Clip Path, Bluesky Icon, Dark Brand Fill #08060d, Discord Icon, Documentation Icon, GitHub Icon, Purple Accent Stroke #aa3bff, Social Brand Marks (+5 more)

### Community 39 - "Admin Access Guards"
Cohesion: 0.22
Nodes (7): react, ProtectedRoute(), verify(), AdminAccessContext, AdminAccessProvider(), FULL_ACCESS, ADMIN_ROLE_FULL

### Community 40 - "Admin Matching Report UI"
Cohesion: 0.18
Nodes (8): AdminMatchingPanel(), authedFetch(), BREAKDOWN_LABELS, CATEGORY_STYLES, AdminMatchingReport(), FACTOR_LABELS, STATUS_CLASS, STATUS_LABELS

### Community 41 - "Postgres Best Practices Skill"
Cohesion: 0.26
Nodes (12): auth.role() Deprecation, Broken Object Level Authorization, Supabase Postgres Best Practices Changelog, Schema Constraints Safe Migration Patterns, SECURITY DEFINER, Schema Design, Postgres Best Practice Section Definitions, Security and RLS (+4 more)

### Community 42 - "Postgres Locking Patterns"
Cohesion: 0.20
Nodes (12): Concurrency and Locking, idle_in_transaction_session_timeout, Use Advisory Locks for Application-Level Locking, pg_advisory_lock, pg_try_advisory_lock, Prevent Deadlocks with Consistent Lock Ordering, Deadlocks, Keep Transactions Short to Reduce Lock Contention (+4 more)

### Community 43 - "JSONB Full-Text Search"
Cohesion: 0.20
Nodes (11): Advanced Features, GIN Index for tsvector, LIKE Wildcard Matching, ts_rank, Use tsvector for Full-Text Search, JSONB Expression Index, GIN Index for JSONB, Index JSONB Columns for Efficient Querying (+3 more)

### Community 44 - "Admin Contact Info Form"
Cohesion: 0.24
Nodes (8): AdminContactInfo(), adminFetch(), BUDGETS, contactToForm(), DATES_RENTREE, NIVEAUX_ETUDES, translatedOrRaw(), DOMAINES_ETUDES

### Community 45 - "Postgres Data Access"
Cohesion: 0.22
Nodes (10): Data Access Patterns, Batch INSERT Statements for Bulk Data, COPY Bulk Load, ANY Array Batching, Eliminate N+1 Queries with Batch Loading, Use Cursor-Based Pagination Instead of OFFSET, OFFSET Pagination, INSERT ON CONFLICT (+2 more)

### Community 46 - "Admin Chinese Matching UI"
Cohesion: 0.22
Nodes (8): AdminChineseMatchingPanel(), authedFetch(), BREAKDOWN_LABELS, BUDGET_OPTIONS, CATEGORY_STYLES, COMMON_CITIES, RENTREE_LABELS, RENTREE_OPTIONS

### Community 47 - "Favicon Brand Mark"
Cohesion: 0.36
Nodes (8): Alpha Mask Silhouette Clip, Brand Purple #863bff, Cyan Accent Highlight, Display-P3 Wide Gamut Fills, Folded Ribbon Glyph, Iridescent Blurred Ellipse Overlay, Lavender Specular Highlight, Site Favicon Brand Mark

### Community 48 - "Resend Webhook Verify"
Cohesion: 0.43
Nodes (6): maxDuration, POST(), decodeWebhookSecret(), headerValue(), signaturesMatch(), verifyResendWebhook()

### Community 49 - "Admin Bulk Email"
Cohesion: 0.32
Nodes (7): AdminBulkEmail(), composeDraft(), sendBulk(), AI_TOPICS, authedFetch(), TEMPLATE_OPTIONS, adminSupabase

### Community 50 - "Student Matching View"
Cohesion: 0.43
Nodes (6): CATEGORY_META, categoryFromScore(), categoryKeyFromScore(), reportsFromStored(), categoryKeyOf(), matchingForStudent()

### Community 51 - "Domain Semantic Similarity"
Cohesion: 0.57
Nodes (6): domainSimilarity(), familyOf(), jaccard(), studentTokens(), tokenize(), universityTokens()

### Community 52 - "Postgres Query Monitoring"
Cohesion: 0.60
Nodes (5): Monitoring and Diagnostics, Use EXPLAIN ANALYZE to Diagnose Slow Queries, Enable pg_stat_statements for Query Analysis, Autovacuum Tuning, Maintain Table Statistics with VACUUM and ANALYZE

### Community 53 - "Vercel Cron Config"
Cohesion: 0.40
Nodes (4): buildCommand, crons, framework, $schema

### Community 54 - "JSConfig Path Aliases"
Cohesion: 0.50
Nodes (3): compilerOptions, baseUrl, paths

## Ambiguous Edges - Review These
- `Next.js Agent Rules` → `React Vite Template README`  [AMBIGUOUS]
  README.md · relation: conceptually_related_to

## Knowledge Gaps
- **244 isolated node(s):** `compat`, `eslintConfig`, `baseUrl`, `paths`, `securityHeaders` (+239 more)
  These have ≤1 connection - possible missing edges or undocumented components. (Counts symbols only; 301 node(s) total have ≤1 connection when file, concept and rationale nodes are included.)
- **8 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **What is the exact relationship between `Next.js Agent Rules` and `React Vite Template README`?**
  _Edge tagged AMBIGUOUS (relation: conceptually_related_to) - confidence is low._
- **Why does `react` connect `Admin Access Guards` to `Public SEO Pages`, `Admin i18n Layout`, `Admin Contact Email`, `Admin Calendar Appointments`, `Student Matching UI`, `Package Dependencies`, `Admin Matching Report UI`, `Admin Contact Info Form`, `Admin Chinese Matching UI`, `Admin Bulk Email`, `Admin Universities UI`, `Scoped Auth Contexts`, `Admin Dashboard Shell`?**
  _High betweenness centrality (0.061) - this node is a cross-community bridge._
- **Why does `@supabase/supabase-js` connect `WhatsApp Cloud Send` to `Auth and Contact API`, `Package Dependencies`, `University Scan Import`, `Inbound Email Processing`, `WhatsApp Webhook Intake`, `Scoped Auth Contexts`, `Auto-Reply Email Templates`, `Formules Relance Cron`?**
  _High betweenness centrality (0.037) - this node is a cross-community bridge._
- **Why does `getAuthenticatedAdmin()` connect `Admin Calendar Appointments` to `Student Auth Documents`, `AI Email Compose`, `WhatsApp Cloud Send`, `Auto-Reply Email Templates`, `Formules Relance Cron`?**
  _High betweenness centrality (0.029) - this node is a cross-community bridge._
- **What connects `compat`, `eslintConfig`, `baseUrl` to the rest of the system?**
  _244 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `Public SEO Pages` be split into smaller, more focused modules?**
  _Cohesion score 0.0623951182303585 - nodes in this community are weakly interconnected._
- **Should `Student Auth Documents` be split into smaller, more focused modules?**
  _Cohesion score 0.052541404911479156 - nodes in this community are weakly interconnected._