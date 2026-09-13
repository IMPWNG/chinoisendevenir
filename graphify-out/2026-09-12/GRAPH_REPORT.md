# Graph Report - chinoisendevenir  (2026-09-12)

## Corpus Check
- 283 files · ~364,562 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 1454 nodes · 3585 edges · 71 communities (61 shown, 8 thin omitted)
- Extraction: 98% EXTRACTED · 2% INFERRED · 0% AMBIGUOUS · INFERRED: 73 edges (avg confidence: 0.85)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `07064755`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- EcolesDeLangueChinePage.tsx
- studentDocuments.ts
- LeadForm.tsx
- seo.ts
- AdminCalendar.tsx
- reports.ts
- package.json
- scan-universities.mjs
- matching/route.ts
- universityScanImport.ts
- inbound-email.ts
- emailCompose.ts
- messages.ts
- Row Level Security
- formules.ts
- emailIntents.ts
- run.ts
- chinese.ts
- student.ts
- compilerOptions
- enrich.ts
- AdminUniversities.tsx
- Chinois en Devenir — brief pour agent IA
- supabase.ts
- studentProgress.ts
- auto-reply.ts
- whatsapp-webhook.ts
- errorMessage
- AdminDashboard.tsx
- useSiteI18n
- score.ts
- Postgres Reference Writing Guidelines
- Choose the Right Index Type
- AdminI18nContext.tsx
- Use Connection Pooling for All Applications
- request.ts
- scrapling-crawl-universities.py
- Chinois en Devenir Agency
- SVG Icon Sprite Sheet
- react
- AdminMatchingPanel.tsx
- Supabase Postgres Best Practices
- Concurrency and Locking
- Use tsvector for Full-Text Search
- StudentDashboard.tsx
- Data Access Patterns
- AdminChineseMatchingPanel.tsx
- Iridescent Blurred Ellipse Overlay
- resend/route.ts
- AdminBulkEmail.tsx
- TarifsPage.tsx
- app/layout.tsx
- Monitoring and Diagnostics
- vercel.json
- StudentMatching.tsx
- next.config.mjs
- apple-icon.tsx
- icon.tsx
- about/page.tsx
- opengraph-image.tsx
- Find Skills
- AdminStudentFiles.tsx
- Lowercase snake_case Identifiers
- Dependabot npm Weekly Updates
- weights.ts
- adminRoles.ts
- studentAuth.ts
- SiteI18nContext.tsx
- next-env.d.ts

## God Nodes (most connected - your core abstractions)
1. `useSiteI18n()` - 59 edges
2. `errorMessage()` - 53 edges
3. `asString()` - 34 edges
4. `processInboundEmail()` - 32 edges
5. `react` - 30 edges
6. `getAuthenticatedAdmin()` - 30 edges
7. `readJsonObject()` - 27 edges
8. `AdminCalendar()` - 23 edges
9. `useAdminI18n()` - 23 edges
10. `buildDualReports()` - 23 edges

## Surprising Connections (you probably didn't know these)
- `React Vite Template README` --conceptually_related_to--> `Next.js Agent Rules`  [AMBIGUOUS]
  README.md → AGENTS.md
- `pgvector` --semantically_similar_to--> `Use tsvector for Full-Text Search`  [INFERRED] [semantically similar]
  .agents/skills/supabase-postgres-best-practices/SKILL.md → .agents/skills/supabase-postgres-best-practices/references/advanced-full-text-search.md
- `Next.js Sitemap Self-Reference Caveat` --conceptually_related_to--> `Next.js Agent Rules`  [INFERRED]
  .agents/skills/seo-audit/references/international-seo.md → AGENTS.md
- `Use EXPLAIN ANALYZE to Diagnose Slow Queries` --semantically_similar_to--> `Enable pg_stat_statements for Query Analysis`  [INFERRED] [semantically similar]
  .agents/skills/supabase-postgres-best-practices/references/monitor-explain-analyze.md → .agents/skills/supabase-postgres-best-practices/references/monitor-pg-stat-statements.md
- `generateRelance1Template()` --calls--> `wrapEmailHtml()`  [EXTRACTED]
  src/lib/api/auto-reply.ts → src/lib/emailLayout.ts

## Import Cycles
- None detected.

## Hyperedges (group relationships)
- **Concurrency and Locking Best Practices** — _agents_skills_supabase_postgres_best_practices_references_lock_advisory_advisory_locks, _agents_skills_supabase_postgres_best_practices_references_lock_deadlock_prevention_consistent_lock_ordering, _agents_skills_supabase_postgres_best_practices_references_lock_short_transactions_short_transactions, _agents_skills_supabase_postgres_best_practices_references_lock_skip_locked_skip_locked [EXTRACTED 1.00]
- **Connection Management Best Practices** — _agents_skills_supabase_postgres_best_practices_references_conn_pooling_connection_pooling, _agents_skills_supabase_postgres_best_practices_references_conn_limits_connection_limits, _agents_skills_supabase_postgres_best_practices_references_conn_idle_timeout_idle_connection_timeouts, _agents_skills_supabase_postgres_best_practices_references_conn_prepared_statements_prepared_statements_with_pooling [EXTRACTED 1.00]
- **Data Access Pattern Best Practices** — _agents_skills_supabase_postgres_best_practices_references_data_batch_inserts_batch_inserts, _agents_skills_supabase_postgres_best_practices_references_data_n_plus_one_n_plus_one_elimination, _agents_skills_supabase_postgres_best_practices_references_data_pagination_cursor_pagination, _agents_skills_supabase_postgres_best_practices_references_data_upsert_upsert [EXTRACTED 1.00]
- **Chinois en Devenir LLM Citation Corpus** — public_llms_chinois_en_devenir, public__well_known_llms_chinois_en_devenir, public_llms_full_chinois_en_devenir [EXTRACTED 1.00]
- **Glass Folded-Ribbon Favicon Composition** — public_favicon_folded_ribbon_glyph, public_favicon_alpha_mask, public_favicon_iridescent_overlay, public_favicon_brand_purple [EXTRACTED 1.00]
- **Icons in the SVG Sprite** — public_icons_bluesky_icon, public_icons_discord_icon, public_icons_documentation_icon, public_icons_github_icon, public_icons_social_icon, public_icons_x_icon [EXTRACTED 1.00]
- **PostgreSQL Indexing Strategy** — _agents_skills_supabase_postgres_best_practices_references_query_index_types_choose_right_index_type, _agents_skills_supabase_postgres_best_practices_references_query_missing_indexes_where_join_indexes, _agents_skills_supabase_postgres_best_practices_references_query_partial_indexes_partial_indexes, _agents_skills_supabase_postgres_best_practices_references_schema_foreign_key_indexes_index_fk_columns [INFERRED 0.85]
- **Postgres Access Control Defense in Depth** — _agents_skills_supabase_postgres_best_practices_references_security_privileges_least_privilege, _agents_skills_supabase_postgres_best_practices_references_security_rls_basics_row_level_security, _agents_skills_supabase_postgres_best_practices_references_security_rls_performance_select_wrapper, _agents_skills_supabase_postgres_best_practices_references_security_rls_performance_security_definer [INFERRED 0.85]
- **Filled Social Brand Logos** — public_icons_bluesky_icon, public_icons_discord_icon, public_icons_github_icon, public_icons_x_icon, public_icons_dark_brand_fill [INFERRED 0.85]
- **Purple Stroke UI Glyphs** — public_icons_documentation_icon, public_icons_social_icon, public_icons_purple_accent_stroke, public_icons_ui_chrome_glyphs [INFERRED 0.85]

## Communities (71 total, 8 thin omitted)

### Community 0 - "EcolesDeLangueChinePage.tsx"
Cohesion: 0.14
Nodes (25): metadata, metadata, metadata, metadata, metadata, metadata, JsonLd(), JsonLdProps (+17 more)

### Community 1 - "studentDocuments.ts"
Cohesion: 0.15
Nodes (32): DELETE(), GET(), loadFiles(), POST(), GET(), POST(), GET(), chineseMatchingForStudent() (+24 more)

### Community 2 - "LeadForm.tsx"
Cohesion: 0.10
Nodes (41): @supabase/supabase-js, POST(), POST(), BUDGET_VALUES, EMPTY_FORM, INTAKE_VALUES, LeadForm(), LeadFormErrors (+33 more)

### Community 3 - "seo.ts"
Cohesion: 0.10
Nodes (17): metadata, metadata, metadata, metadata, AI_BOTS, Footer(), Navigation(), NotFoundContent() (+9 more)

### Community 4 - "AdminCalendar.tsx"
Cohesion: 0.08
Nodes (62): DELETE(), GET(), limited(), PATCH(), POST(), searchParams(), FIELD_LABELS, FieldKey (+54 more)

### Community 5 - "reports.ts"
Cohesion: 0.08
Nodes (48): adminGuideline(), applicationCap(), applicationMixAdvice(), blankOr(), blockingFields(), BREAKDOWN_ORDER, breakdownBars(), buildDualReports() (+40 more)

### Community 6 - "package.json"
Cohesion: 0.04
Nodes (46): compat, eslintConfig, allowScripts, unrs-resolver, dependencies, next, react, react-dom (+38 more)

### Community 7 - "scan-universities.mjs"
Cohesion: 0.09
Nodes (41): args, callMammouthJson(), CATALOG_PATH, closeTruncatedJson(), crawlUniversity(), enqueue(), decodeHtml(), discoverUrls() (+33 more)

### Community 8 - "matching/route.ts"
Cohesion: 0.18
Nodes (20): GET(), GET(), POST(), POST(), requireFullAdmin(), appendMessageToNotes(), asRecord(), CHINESE_MATCHING_JSON_PREFIX (+12 more)

### Community 9 - "universityScanImport.ts"
Cohesion: 0.09
Nodes (37): admin, catalog, ROOT, asScanCatalog(), buildAdmissionSummary(), canonicalUniversityKey(), compactRequirement(), dedupeScanProfiles() (+29 more)

### Community 10 - "inbound-email.ts"
Cohesion: 0.12
Nodes (30): asEmailContact(), classifyInboundIntent(), contactId(), createContactFromInbound(), EmailAddressLike, extractEmailAddress(), extractForwardedSender(), extractLatestReply() (+22 more)

### Community 11 - "emailCompose.ts"
Cohesion: 0.09
Nodes (36): BulkTopic, ComposeContact, ComposeResult, isBulkTopic(), POST(), uniqueIds(), BULK_AI_TOPIC_KEYS, BULK_AI_TOPICS (+28 more)

### Community 12 - "messages.ts"
Cohesion: 0.06
Nodes (58): GET(), maxDuration, POST(), AdminContactInfo(), adminFetch(), BUDGETS, ContactForm, ContactInfo (+50 more)

### Community 13 - "Row Level Security"
Cohesion: 0.18
Nodes (12): Sequential Scan, Indexes on WHERE and JOIN Columns, Partial Indexes, Idempotent Constraint Creation, pg_constraint Catalog, Index Foreign Key Columns, Principle of Least Privilege, auth.uid() RLS Policy (+4 more)

### Community 14 - "formules.ts"
Cohesion: 0.14
Nodes (16): StudentFormuleBanner(), displayFormuleLabel(), FORMULE_1_INCLUDES, FORMULE_1_VALUE, FORMULE_2_INCLUDES, FORMULE_2_VALUE, FORMULE_3_GROUPS, FORMULE_3_VALUE (+8 more)

### Community 15 - "emailIntents.ts"
Cohesion: 0.14
Nodes (30): alreadySentIntentReply(), AUTO_REPLY_MARKER(), autoReplyMarker(), descriptionHasAutoMarker(), displayNameFromFrom(), EMAIL_INTENTS, EmailIntent, EmailIntentKey (+22 more)

### Community 16 - "run.ts"
Cohesion: 0.14
Nodes (24): getFormuleAccess(), identifyGaps(), MatchingGap, monthsForHskGap(), groupMix(), Mixable, selectMix(), takeFrom() (+16 more)

### Community 17 - "chinese.ts"
Cohesion: 0.16
Nodes (25): POST(), CATEGORIES, categoryFromScore(), chineseCitiesFromCatalog(), ChineseMatch, chineseMatchingSummary(), clamp(), compactChineseMatchingResult() (+17 more)

### Community 18 - "student.ts"
Cohesion: 0.18
Nodes (20): CATEGORY_META, categoryFromScore(), categoryKeyFromScore(), diplomaToTargetDegree(), englishToIelts(), englishToToefl(), EUR_TO_CNY, intakeFromRentree() (+12 more)

### Community 19 - "compilerOptions"
Cohesion: 0.11
Nodes (18): compilerOptions, allowJs, esModuleInterop, incremental, isolatedModules, jsx, lib, module (+10 more)

### Community 20 - "enrich.ts"
Cohesion: 0.17
Nodes (22): asRecord(), CHINESE_LEVEL_TO_HSK, clamp(), computeQualityScore(), emptyIa(), englishFromIa(), enrichStudent(), extractMotivationSignals() (+14 more)

### Community 21 - "AdminUniversities.tsx"
Cohesion: 0.10
Nodes (21): toUniversityInsert(), UNIVERSITY_SEED, UniversitySeedRow, AdminUniversities(), AdmissionChips(), AdmissionExtra, AdmissionRequirement, chipClass() (+13 more)

### Community 22 - "Chinois en Devenir — brief pour agent IA"
Cohesion: 0.06
Nodes (36): AI Writing Detection, Em Dashes as AI Tell, Canonical Overrides Hreflang, Google Localized Versions Docs, Helpful Content System, International SEO Evidence, Next.js Sitemap Self-Reference Caveat, hreflang x-default (+28 more)

### Community 23 - "supabase.ts"
Cohesion: 0.13
Nodes (16): AdminAuthProvider, { AuthProvider, useScopedAuth }, useAdminAuth, { AuthProvider, useScopedAuth }, StudentAuthProvider, useStudentAuth, AuthResult, createScopedAuth() (+8 more)

### Community 24 - "studentProgress.ts"
Cohesion: 0.10
Nodes (27): clampDossierEtape(), DIPLOMA_DOC_KEYS, diplomaLevelFromStudent(), FORMULE_OPTION_PREFIX, getDisplayedStepIndex(), getPaidFormuleNumber(), getSchoolDocumentsIntro(), getStudentStepIndex() (+19 more)

### Community 25 - "auto-reply.ts"
Cohesion: 0.08
Nodes (36): AdminContactEmail(), composeWithAi(), sendEmail(), authedFetch(), EmailContact, fieldClass(), TEMPLATE_OPTIONS, EMAIL_TEMPLATES (+28 more)

### Community 26 - "whatsapp-webhook.ts"
Cohesion: 0.18
Nodes (18): GET(), maxDuration, POST(), detectFormule(), detectInterest(), looksLikeQuestion(), normalizeText(), truncate() (+10 more)

### Community 27 - "errorMessage"
Cohesion: 0.16
Nodes (23): GET(), isAuthorizedCron(), maxDuration, POST(), runCron(), OPTIONS, POST, handler() (+15 more)

### Community 28 - "AdminDashboard.tsx"
Cohesion: 0.14
Nodes (21): AdminMatchingPanel(), AdminShell(), NavItem, ProtectedRoute(), useAdminAccess(), useAdminI18n(), canonicalFormuleValue(), getFormuleNumber() (+13 more)

### Community 29 - "useSiteI18n"
Cohesion: 0.23
Nodes (10): metadata, FaqItem, FaqSection(), FaqSectionProps, Hero(), HomeSeoContent(), Stats(), useSiteI18n() (+2 more)

### Community 30 - "score.ts"
Cohesion: 0.12
Nodes (29): categoryMetaFromScore(), DOMAIN_FAMILIES, DOMAIN_KEYS, infoStatus(), priorityFromScore(), clamp(), diplomaFitsTarget(), hardFilter() (+21 more)

### Community 31 - "Postgres Reference Writing Guidelines"
Cohesion: 0.17
Nodes (15): Concrete Transformation Patterns, Error-First Structure, Impact Level Guidelines, Quantified Impact, Self-Contained Examples, Semantic Naming, Postgres Reference Writing Guidelines, Query Performance (+7 more)

### Community 32 - "Choose the Right Index Type"
Cohesion: 0.13
Nodes (15): BRIN Index, B-tree Index, Choose the Right Index Type, GIN Index, GiST Index, Hash Index, PostgreSQL Index Types Documentation, Appropriate PostgreSQL Data Types (+7 more)

### Community 33 - "AdminI18nContext.tsx"
Cohesion: 0.23
Nodes (11): AdminI18nContext, AdminI18nProvider(), AdminI18nValue, interpolate(), isAdminLang(), lookup(), TranslateVars, ADMIN_LANGS (+3 more)

### Community 34 - "Use Connection Pooling for All Applications"
Cohesion: 0.20
Nodes (14): Connection Management, Configure Idle Connection Timeouts, idle_session_timeout, Set Appropriate Connection Limits, max_connections, work_mem, Use Connection Pooling for All Applications, PgBouncer (+6 more)

### Community 35 - "request.ts"
Cohesion: 0.20
Nodes (12): OPTIONS, POST, DOMAINES_VALIDES, generateEmailTemplate(), handler(), isFilled(), mergeNotes(), pick() (+4 more)

### Community 36 - "scrapling-crawl-universities.py"
Cohesion: 0.28
Nodes (11): Namespace, allowed_domains_for(), crawl_university(), load_targets(), main(), make_spider_class(), __init__(), parse() (+3 more)

### Community 37 - "Chinois en Devenir Agency"
Cohesion: 0.23
Nodes (13): Chinois en Devenir, No Guarantee Policy, Chinois en Devenir, CSC Scholarships, Chinese Language Year, Chinois en Devenir Agency, China Scholarship Council, JW201 JW202 Forms (+5 more)

### Community 38 - "SVG Icon Sprite Sheet"
Cohesion: 0.38
Nodes (13): Bluesky Clip Path, Bluesky Icon, Dark Brand Fill #08060d, Discord Icon, Documentation Icon, GitHub Icon, Purple Accent Stroke #aa3bff, Social Brand Marks (+5 more)

### Community 39 - "react"
Cohesion: 0.29
Nodes (4): next, react, metadata, metadata

### Community 40 - "AdminMatchingPanel.tsx"
Cohesion: 0.10
Nodes (17): authedFetch(), BREAKDOWN_LABELS, CATEGORY_STYLES, KindTone, MatchingContact, MatchingResult, MatchingRun, MatchItem (+9 more)

### Community 41 - "Supabase Postgres Best Practices"
Cohesion: 0.26
Nodes (12): auth.role() Deprecation, Broken Object Level Authorization, Supabase Postgres Best Practices Changelog, Schema Constraints Safe Migration Patterns, SECURITY DEFINER, Schema Design, Postgres Best Practice Section Definitions, Security and RLS (+4 more)

### Community 42 - "Concurrency and Locking"
Cohesion: 0.20
Nodes (12): Concurrency and Locking, idle_in_transaction_session_timeout, Use Advisory Locks for Application-Level Locking, pg_advisory_lock, pg_try_advisory_lock, Prevent Deadlocks with Consistent Lock Ordering, Deadlocks, Keep Transactions Short to Reduce Lock Contention (+4 more)

### Community 43 - "Use tsvector for Full-Text Search"
Cohesion: 0.20
Nodes (11): Advanced Features, GIN Index for tsvector, LIKE Wildcard Matching, ts_rank, Use tsvector for Full-Text Search, JSONB Expression Index, GIN Index for JSONB, Index JSONB Columns for Efficient Querying (+3 more)

### Community 44 - "StudentDashboard.tsx"
Cohesion: 0.09
Nodes (24): BreakdownRow, ChineseView, School, StudentChineseMatching(), TranslateFn, StudentProtectedRoute(), StudentVisaDocuments(), useAuth (+16 more)

### Community 45 - "Data Access Patterns"
Cohesion: 0.22
Nodes (10): Data Access Patterns, Batch INSERT Statements for Bulk Data, COPY Bulk Load, ANY Array Batching, Eliminate N+1 Queries with Batch Loading, Use Cursor-Based Pagination Instead of OFFSET, OFFSET Pagination, INSERT ON CONFLICT (+2 more)

### Community 46 - "AdminChineseMatchingPanel.tsx"
Cohesion: 0.13
Nodes (14): AdminChineseMatchingPanel(), authedFetch(), BREAKDOWN_LABELS, BUDGET_OPTIONS, CATEGORY_STYLES, ChineseContact, ChineseMatch, ChineseResult (+6 more)

### Community 47 - "Iridescent Blurred Ellipse Overlay"
Cohesion: 0.36
Nodes (8): Alpha Mask Silhouette Clip, Brand Purple #863bff, Cyan Accent Highlight, Display-P3 Wide Gamut Fills, Folded Ribbon Glyph, Iridescent Blurred Ellipse Overlay, Lavender Specular Highlight, Site Favicon Brand Mark

### Community 48 - "resend/route.ts"
Cohesion: 0.36
Nodes (7): maxDuration, POST(), decodeWebhookSecret(), HeaderSource, headerValue(), signaturesMatch(), verifyResendWebhook()

### Community 49 - "AdminBulkEmail.tsx"
Cohesion: 0.24
Nodes (9): AdminBulkEmail(), composeDraft(), sendBulk(), AdminBulkEmailProps, AI_TOPICS, authedFetch(), BulkContact, BulkProgress (+1 more)

### Community 50 - "TarifsPage.tsx"
Cohesion: 0.20
Nodes (11): metadata, IncludeGroup, StudentFormules(), StudentFormulesProps, SiteI18nValue, displayFormuleFootnote(), Formule, localizeFormule() (+3 more)

### Community 51 - "app/layout.tsx"
Cohesion: 0.47
Nodes (5): metadata, RootLayout(), Providers(), organizationJsonLd(), websiteJsonLd()

### Community 52 - "Monitoring and Diagnostics"
Cohesion: 0.60
Nodes (5): Monitoring and Diagnostics, Use EXPLAIN ANALYZE to Diagnose Slow Queries, Enable pg_stat_statements for Query Analysis, Autovacuum Tuning, Maintain Table Statistics with VACUUM and ANALYZE

### Community 53 - "vercel.json"
Cohesion: 0.40
Nodes (4): buildCommand, crons, framework, $schema

### Community 54 - "StudentMatching.tsx"
Cohesion: 0.15
Nodes (10): BreakdownRow, GrantGroup, Matching, MatchingDoc, ROAD_STATUS_MARK, RoadmapRow, StudentMatching(), StudentReport (+2 more)

### Community 59 - "opengraph-image.tsx"
Cohesion: 0.40
Nodes (3): alt, contentType, size

### Community 61 - "AdminStudentFiles.tsx"
Cohesion: 0.33
Nodes (6): AdminDoc, adminFetch(), AdminStudentFiles(), FilesPayload, RequiredDoc, RequiredFile

### Community 66 - "weights.ts"
Cohesion: 0.17
Nodes (17): asRecord(), filled(), normalizeUniversity(), reqFor(), toNumber(), unique(), UniversityRow, yearlyLivingCost() (+9 more)

### Community 67 - "adminRoles.ts"
Cohesion: 0.16
Nodes (17): GET(), AdminCapabilities, verify(), AdminAccessContext, AdminAccessProvider(), AdminCapabilities, FULL_ACCESS, ADMIN_ROLE_FULL (+9 more)

### Community 68 - "studentAuth.ts"
Cohesion: 0.21
Nodes (21): POST(), filled(), PATCH(), AuthErrorResult, ensureStudentContact(), filled(), findContactByEmail(), getAdminAccess() (+13 more)

### Community 70 - "SiteI18nContext.tsx"
Cohesion: 0.18
Nodes (14): interpolate(), isSiteLang(), lookup(), SiteI18nContext, SiteI18nProvider(), TranslateVars, en, fr (+6 more)

## Ambiguous Edges - Review These
- `Next.js Agent Rules` → `React Vite Template README`  [AMBIGUOUS]
  README.md · relation: conceptually_related_to

## Knowledge Gaps
- **408 isolated node(s):** `compat`, `eslintConfig`, `securityHeaders`, `nextConfig`, `name` (+403 more)
  These have ≤1 connection - possible missing edges or undocumented components. (Counts symbols only; 461 node(s) total have ≤1 connection when file, concept and rationale nodes are included.)
- **8 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **What is the exact relationship between `Next.js Agent Rules` and `React Vite Template README`?**
  _Edge tagged AMBIGUOUS (relation: conceptually_related_to) - confidence is low._
- **Why does `react` connect `react` to `LeadForm.tsx`, `seo.ts`, `AdminCalendar.tsx`, `package.json`, `messages.ts`, `AdminUniversities.tsx`, `supabase.ts`, `auto-reply.ts`, `AdminDashboard.tsx`, `AdminI18nContext.tsx`, `AdminMatchingPanel.tsx`, `StudentDashboard.tsx`, `AdminChineseMatchingPanel.tsx`, `AdminBulkEmail.tsx`, `app/layout.tsx`, `StudentMatching.tsx`, `AdminStudentFiles.tsx`, `adminRoles.ts`, `SiteI18nContext.tsx`?**
  _High betweenness centrality (0.067) - this node is a cross-community bridge._
- **Why does `errorMessage()` connect `errorMessage` to `studentDocuments.ts`, `LeadForm.tsx`, `request.ts`, `AdminCalendar.tsx`, `seo.ts`, `matching/route.ts`, `AdminMatchingPanel.tsx`, `inbound-email.ts`, `messages.ts`, `StudentDashboard.tsx`, `AdminChineseMatchingPanel.tsx`, `chinese.ts`, `AdminBulkEmail.tsx`, `AdminUniversities.tsx`, `supabase.ts`, `auto-reply.ts`, `AdminDashboard.tsx`, `AdminStudentFiles.tsx`?**
  _High betweenness centrality (0.057) - this node is a cross-community bridge._
- **Why does `@supabase/supabase-js` connect `LeadForm.tsx` to `AdminCalendar.tsx`, `studentAuth.ts`, `package.json`, `universityScanImport.ts`, `supabase.ts`, `AdminDashboard.tsx`?**
  _High betweenness centrality (0.028) - this node is a cross-community bridge._
- **What connects `compat`, `eslintConfig`, `securityHeaders` to the rest of the system?**
  _408 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `EcolesDeLangueChinePage.tsx` be split into smaller, more focused modules?**
  _Cohesion score 0.13974358974358975 - nodes in this community are weakly interconnected._
- **Should `LeadForm.tsx` be split into smaller, more focused modules?**
  _Cohesion score 0.09523809523809523 - nodes in this community are weakly interconnected._