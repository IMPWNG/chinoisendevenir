# Graph Report - chinoisendevenir  (2026-09-12)

## Corpus Check
- 283 files · ~364,591 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 1455 nodes · 3598 edges · 73 communities (61 shown, 10 thin omitted)
- Extraction: 98% EXTRACTED · 2% INFERRED · 0% AMBIGUOUS · INFERRED: 73 edges (avg confidence: 0.85)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `07064755`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- useSiteI18n
- studentDocuments.ts
- request.ts
- seo.ts
- AdminCalendar.tsx
- reports.ts
- package.json
- scan-universities.mjs
- matching/route.ts
- universityScanImport.ts
- inbound-email.ts
- emailCompose.ts
- whatsapp-send.ts
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
- AuthContext.tsx
- getRequiredStudentDocuments
- auto-reply.ts
- emailLayout.ts
- asString
- studentProgress.ts
- HomePage.tsx
- score.ts
- Postgres Reference Writing Guidelines
- Choose the Right Index Type
- AdminI18nContext.tsx
- Use Connection Pooling for All Applications
- AdminMatchingReport.tsx
- scrapling-crawl-universities.py
- Chinois en Devenir Agency
- SVG Icon Sprite Sheet
- admin/layout.tsx
- AdminMatchingPanel.tsx
- Supabase Postgres Best Practices
- Concurrency and Locking
- Use tsvector for Full-Text Search
- StudentDashboard.tsx
- Data Access Patterns
- AdminChineseMatchingPanel.tsx
- Iridescent Blurred Ellipse Overlay
- AdminContactEmail.tsx
- AdminBulkEmail.tsx
- adminRoles.ts
- semantic.ts
- Monitoring and Diagnostics
- vercel.json
- StudentMatching.tsx
- next.config.mjs
- apple-icon.tsx
- icon.tsx
- about/page.tsx
- opengraph-image.tsx
- Find Skills
- supabase.ts
- Lowercase snake_case Identifiers
- Dependabot npm Weekly Updates
- weights.ts
- react
- studentAuth.ts
- NotFoundContent.tsx
- SiteI18nContext.tsx
- StudentSetPassword.tsx
- next-env.d.ts

## God Nodes (most connected - your core abstractions)
1. `useSiteI18n()` - 59 edges
2. `errorMessage()` - 53 edges
3. `asString()` - 40 edges
4. `processInboundEmail()` - 33 edges
5. `react` - 30 edges
6. `getAuthenticatedAdmin()` - 30 edges
7. `readJsonObject()` - 29 edges
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
- `chineseCitiesFromCatalog()` --indirect_call--> `normalizeUniversity()`  [INFERRED]
  src/lib/matching/chinese.ts → src/lib/matching/university.ts

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

## Communities (73 total, 10 thin omitted)

### Community 0 - "useSiteI18n"
Cohesion: 0.26
Nodes (22): FaqItem, FaqSection(), FaqSectionProps, Footer(), JsonLd(), JsonLdProps, Navigation(), BreadcrumbItem (+14 more)

### Community 1 - "studentDocuments.ts"
Cohesion: 0.16
Nodes (30): DELETE(), GET(), loadFiles(), POST(), GET(), POST(), ensureStudentBucket(), STUDENT_DOCUMENT_BUCKET (+22 more)

### Community 2 - "request.ts"
Cohesion: 0.07
Nodes (58): @supabase/supabase-js, FIELD_LABELS, FieldKey, filled(), PATCH(), sameValue(), POST(), POST() (+50 more)

### Community 3 - "seo.ts"
Cohesion: 0.07
Nodes (29): metadata, metadata, metadata, metadata, metadata, metadata, metadata, RootLayout() (+21 more)

### Community 4 - "AdminCalendar.tsx"
Cohesion: 0.09
Nodes (56): DELETE(), GET(), limited(), PATCH(), POST(), searchParams(), AdminCalendar(), openCreate() (+48 more)

### Community 5 - "reports.ts"
Cohesion: 0.08
Nodes (47): adminGuideline(), applicationCap(), applicationMixAdvice(), blankOr(), blockingFields(), BREAKDOWN_ORDER, breakdownBars(), buildDualReports() (+39 more)

### Community 6 - "package.json"
Cohesion: 0.04
Nodes (46): compat, eslintConfig, allowScripts, unrs-resolver, dependencies, next, react, react-dom (+38 more)

### Community 7 - "scan-universities.mjs"
Cohesion: 0.09
Nodes (41): args, callMammouthJson(), CATALOG_PATH, closeTruncatedJson(), crawlUniversity(), enqueue(), decodeHtml(), discoverUrls() (+33 more)

### Community 8 - "matching/route.ts"
Cohesion: 0.17
Nodes (21): GET(), GET(), POST(), POST(), requireFullAdmin(), appendMessageToNotes(), asRecord(), CHINESE_MATCHING_JSON_PREFIX (+13 more)

### Community 9 - "universityScanImport.ts"
Cohesion: 0.09
Nodes (37): admin, catalog, ROOT, asScanCatalog(), buildAdmissionSummary(), canonicalUniversityKey(), compactRequirement(), dedupeScanProfiles() (+29 more)

### Community 10 - "inbound-email.ts"
Cohesion: 0.05
Nodes (85): GET(), isAuthorizedCron(), maxDuration, POST(), runCron(), maxDuration, POST(), handler() (+77 more)

### Community 11 - "emailCompose.ts"
Cohesion: 0.09
Nodes (37): BulkTopic, ComposeContact, ComposeResult, isBulkTopic(), POST(), uniqueIds(), BULK_AI_TOPIC_KEYS, BULK_AI_TOPICS (+29 more)

### Community 12 - "whatsapp-send.ts"
Cohesion: 0.05
Nodes (63): GET(), maxDuration, POST(), GET(), maxDuration, POST(), AdminContactInfo(), adminFetch() (+55 more)

### Community 13 - "Row Level Security"
Cohesion: 0.18
Nodes (12): Sequential Scan, Indexes on WHERE and JOIN Columns, Partial Indexes, Idempotent Constraint Creation, pg_constraint Catalog, Index Foreign Key Columns, Principle of Least Privilege, auth.uid() RLS Policy (+4 more)

### Community 14 - "formules.ts"
Cohesion: 0.11
Nodes (28): StudentFormuleBanner(), IncludeGroup, StudentFormules(), StudentFormulesProps, generateFormulesPresentationTemplate(), generateRelanceFormulesTemplate(), displayFormuleFootnote(), displayFormuleLabel() (+20 more)

### Community 15 - "emailIntents.ts"
Cohesion: 0.18
Nodes (17): alreadySentIntentReply(), AUTO_REPLY_MARKER(), autoReplyMarker(), descriptionHasAutoMarker(), displayNameFromFrom(), EMAIL_INTENTS, EmailIntent, EmailIntentKey (+9 more)

### Community 16 - "run.ts"
Cohesion: 0.13
Nodes (27): getFormuleAccess(), CATEGORY_META, identifyGaps(), MatchingGap, monthsForHskGap(), groupMix(), Mixable, selectMix() (+19 more)

### Community 17 - "chinese.ts"
Cohesion: 0.14
Nodes (27): POST(), CATEGORIES, categoryFromScore(), chineseCitiesFromCatalog(), ChineseMatch, chineseMatchingSummary(), clamp(), compactChineseMatchingResult() (+19 more)

### Community 18 - "student.ts"
Cohesion: 0.19
Nodes (18): BUDGET_BANDS, categoryFromScore(), categoryKeyFromScore(), diplomaToTargetDegree(), DOMAIN_FAMILIES, DOMAIN_KEYS, englishToIelts(), englishToToefl() (+10 more)

### Community 19 - "compilerOptions"
Cohesion: 0.11
Nodes (18): compilerOptions, allowJs, esModuleInterop, incremental, isolatedModules, jsx, lib, module (+10 more)

### Community 20 - "enrich.ts"
Cohesion: 0.16
Nodes (22): asRecord(), CHINESE_LEVEL_TO_HSK, clamp(), computeQualityScore(), emptyIa(), englishFromIa(), enrichStudent(), extractMotivationSignals() (+14 more)

### Community 21 - "AdminUniversities.tsx"
Cohesion: 0.11
Nodes (21): toUniversityInsert(), UNIVERSITY_SEED, UniversitySeedRow, AdminUniversities(), AdmissionChips(), AdmissionExtra, AdmissionRequirement, chipClass() (+13 more)

### Community 22 - "Chinois en Devenir — brief pour agent IA"
Cohesion: 0.06
Nodes (36): AI Writing Detection, Em Dashes as AI Tell, Canonical Overrides Hreflang, Google Localized Versions Docs, Helpful Content System, International SEO Evidence, Next.js Sitemap Self-Reference Caveat, hreflang x-default (+28 more)

### Community 23 - "AuthContext.tsx"
Cohesion: 0.19
Nodes (11): AdminAuthProvider, { AuthProvider, useScopedAuth }, { AuthProvider, useScopedAuth }, StudentAuthProvider, useStudentAuth, AuthResult, createScopedAuth(), applySession() (+3 more)

### Community 24 - "getRequiredStudentDocuments"
Cohesion: 0.50
Nodes (4): diplomaLevelFromStudent(), getRequiredStudentDocuments(), getSchoolDocumentsIntro(), legacyDiplomaDocKey()

### Community 25 - "auto-reply.ts"
Cohesion: 0.16
Nodes (12): OPTIONS, POST, EMAIL_TEMPLATES, EmailContact, EmailTemplate, resend, supabase, ADMIN_NOTIFY_EMAIL (+4 more)

### Community 26 - "emailLayout.ts"
Cohesion: 0.23
Nodes (11): generateFormuleConfirmeeTemplate(), linkHtml(), EMAIL_STYLES, EMAIL_SUBJECT_PREFIX, EmailExtras, escapeHtml(), generateCustomEmailHtml(), plainTextToEmailBodyHtml() (+3 more)

### Community 27 - "asString"
Cohesion: 0.39
Nodes (12): generateRelance1Template(), generateRelance2Template(), formCtaHtml(), generateAdmissionReplyTemplate(), generateBoursesReplyTemplate(), generateGeneralReplyTemplate(), generateLangueReplyTemplate(), generateProcessusReplyTemplate() (+4 more)

### Community 28 - "studentProgress.ts"
Cohesion: 0.11
Nodes (37): canonicalFormuleValue(), getFormuleNumber(), isMatchingPayloadAction(), publicStudentProfile(), canStudentChooseFormule(), clampDossierEtape(), ContactRow, DIPLOMA_DOC_KEYS (+29 more)

### Community 29 - "HomePage.tsx"
Cohesion: 0.29
Nodes (5): metadata, Hero(), HomeSeoContent(), Stats(), HomePage()

### Community 30 - "score.ts"
Cohesion: 0.19
Nodes (19): categoryMetaFromScore(), priorityFromScore(), scoreMotivationIa(), clamp(), diplomaFitsTarget(), hardFilter(), intakeTooFar(), matchUniversity() (+11 more)

### Community 31 - "Postgres Reference Writing Guidelines"
Cohesion: 0.17
Nodes (15): Concrete Transformation Patterns, Error-First Structure, Impact Level Guidelines, Quantified Impact, Self-Contained Examples, Semantic Naming, Postgres Reference Writing Guidelines, Query Performance (+7 more)

### Community 32 - "Choose the Right Index Type"
Cohesion: 0.13
Nodes (15): BRIN Index, B-tree Index, Choose the Right Index Type, GIN Index, GiST Index, Hash Index, PostgreSQL Index Types Documentation, Appropriate PostgreSQL Data Types (+7 more)

### Community 33 - "AdminI18nContext.tsx"
Cohesion: 0.16
Nodes (17): AdminShell(), NavItem, useAdminAccess(), useAdminAuth, AdminI18nContext, AdminI18nProvider(), AdminI18nValue, interpolate() (+9 more)

### Community 34 - "Use Connection Pooling for All Applications"
Cohesion: 0.20
Nodes (14): Connection Management, Configure Idle Connection Timeouts, idle_session_timeout, Set Appropriate Connection Limits, max_connections, work_mem, Use Connection Pooling for All Applications, PgBouncer (+6 more)

### Community 35 - "AdminMatchingReport.tsx"
Cohesion: 0.20
Nodes (8): AdminMatchingReport(), AdminReport, FACTOR_LABELS, FieldNote, GuidelineRow, STATUS_CLASS, STATUS_LABELS, UniversityRisk

### Community 36 - "scrapling-crawl-universities.py"
Cohesion: 0.28
Nodes (11): Namespace, allowed_domains_for(), crawl_university(), load_targets(), main(), make_spider_class(), __init__(), parse() (+3 more)

### Community 37 - "Chinois en Devenir Agency"
Cohesion: 0.23
Nodes (13): Chinois en Devenir, No Guarantee Policy, Chinois en Devenir, CSC Scholarships, Chinese Language Year, Chinois en Devenir Agency, China Scholarship Council, JW201 JW202 Forms (+5 more)

### Community 38 - "SVG Icon Sprite Sheet"
Cohesion: 0.38
Nodes (13): Bluesky Clip Path, Bluesky Icon, Dark Brand Fill #08060d, Discord Icon, Documentation Icon, GitHub Icon, Purple Accent Stroke #aa3bff, Social Brand Marks (+5 more)

### Community 39 - "admin/layout.tsx"
Cohesion: 0.29
Nodes (3): next, metadata, metadata

### Community 40 - "AdminMatchingPanel.tsx"
Cohesion: 0.16
Nodes (11): AdminMatchingPanel(), authedFetch(), BREAKDOWN_LABELS, CATEGORY_STYLES, KindTone, MatchingContact, MatchingResult, MatchingRun (+3 more)

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
Cohesion: 0.08
Nodes (26): BreakdownRow, ChineseView, School, StudentChineseMatching(), TranslateFn, StudentProtectedRoute(), StudentVisaDocuments(), useAuth (+18 more)

### Community 45 - "Data Access Patterns"
Cohesion: 0.22
Nodes (10): Data Access Patterns, Batch INSERT Statements for Bulk Data, COPY Bulk Load, ANY Array Batching, Eliminate N+1 Queries with Batch Loading, Use Cursor-Based Pagination Instead of OFFSET, OFFSET Pagination, INSERT ON CONFLICT (+2 more)

### Community 46 - "AdminChineseMatchingPanel.tsx"
Cohesion: 0.14
Nodes (13): AdminChineseMatchingPanel(), authedFetch(), BREAKDOWN_LABELS, BUDGET_OPTIONS, CATEGORY_STYLES, ChineseContact, ChineseMatch, ChineseResult (+5 more)

### Community 47 - "Iridescent Blurred Ellipse Overlay"
Cohesion: 0.36
Nodes (8): Alpha Mask Silhouette Clip, Brand Purple #863bff, Cyan Accent Highlight, Display-P3 Wide Gamut Fills, Folded Ribbon Glyph, Iridescent Blurred Ellipse Overlay, Lavender Specular Highlight, Site Favicon Brand Mark

### Community 48 - "AdminContactEmail.tsx"
Cohesion: 0.31
Nodes (8): AdminContactEmail(), composeWithAi(), sendEmail(), authedFetch(), EmailContact, fieldClass(), TEMPLATE_OPTIONS, CONTACT_FROM_NAME

### Community 49 - "AdminBulkEmail.tsx"
Cohesion: 0.24
Nodes (9): AdminBulkEmail(), composeDraft(), sendBulk(), AdminBulkEmailProps, AI_TOPICS, authedFetch(), BulkContact, BulkProgress (+1 more)

### Community 50 - "adminRoles.ts"
Cohesion: 0.36
Nodes (8): ADMIN_ROLE_LIMITED, AdminAuthResult, AdminRole, getAdminEmailAllowlist(), getFullAdminEmails(), getLimitedAdminEmails(), parseEmailSet(), resolveAdminRole()

### Community 51 - "semantic.ts"
Cohesion: 0.57
Nodes (6): DomainSimilarity, familyOf(), jaccard(), studentTokens(), tokenize(), universityTokens()

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

### Community 61 - "supabase.ts"
Cohesion: 0.19
Nodes (9): AdminDoc, adminFetch(), AdminStudentFiles(), FilesPayload, RequiredDoc, RequiredFile, adminSupabase, studentSupabase (+1 more)

### Community 66 - "weights.ts"
Cohesion: 0.18
Nodes (16): asRecord(), filled(), normalizeUniversity(), reqFor(), toNumber(), unique(), yearlyLivingCost(), CATEGORY_THRESHOLDS (+8 more)

### Community 67 - "react"
Cohesion: 0.16
Nodes (11): react, GET(), AdminCapabilities, ProtectedRoute(), verify(), AdminAccessContext, AdminAccessProvider(), AdminCapabilities (+3 more)

### Community 68 - "studentAuth.ts"
Cohesion: 0.20
Nodes (15): GET(), filled(), PATCH(), getUnlockedStudentAccess(), chineseMatchingForStudent(), matchingForStudent(), AuthErrorResult, ensureStudentContact() (+7 more)

### Community 70 - "SiteI18nContext.tsx"
Cohesion: 0.17
Nodes (15): interpolate(), isSiteLang(), lookup(), SiteI18nContext, SiteI18nProvider(), SiteI18nValue, TranslateVars, en (+7 more)

## Ambiguous Edges - Review These
- `Next.js Agent Rules` → `React Vite Template README`  [AMBIGUOUS]
  README.md · relation: conceptually_related_to

## Knowledge Gaps
- **408 isolated node(s):** `compat`, `eslintConfig`, `securityHeaders`, `nextConfig`, `name` (+403 more)
  These have ≤1 connection - possible missing edges or undocumented components. (Counts symbols only; 461 node(s) total have ≤1 connection when file, concept and rationale nodes are included.)
- **10 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **What is the exact relationship between `Next.js Agent Rules` and `React Vite Template README`?**
  _Edge tagged AMBIGUOUS (relation: conceptually_related_to) - confidence is low._
- **Why does `react` connect `react` to `useSiteI18n`, `request.ts`, `seo.ts`, `AdminCalendar.tsx`, `package.json`, `whatsapp-send.ts`, `AdminUniversities.tsx`, `AuthContext.tsx`, `studentProgress.ts`, `AdminI18nContext.tsx`, `AdminMatchingReport.tsx`, `admin/layout.tsx`, `AdminMatchingPanel.tsx`, `StudentDashboard.tsx`, `AdminChineseMatchingPanel.tsx`, `AdminContactEmail.tsx`, `AdminBulkEmail.tsx`, `StudentMatching.tsx`, `supabase.ts`, `SiteI18nContext.tsx`, `StudentSetPassword.tsx`?**
  _High betweenness centrality (0.069) - this node is a cross-community bridge._
- **Why does `errorMessage()` connect `inbound-email.ts` to `request.ts`, `studentAuth.ts`, `AdminCalendar.tsx`, `matching/route.ts`, `AdminMatchingPanel.tsx`, `whatsapp-send.ts`, `StudentDashboard.tsx`, `AdminChineseMatchingPanel.tsx`, `AdminContactEmail.tsx`, `chinese.ts`, `AdminBulkEmail.tsx`, `AdminUniversities.tsx`, `auto-reply.ts`, `supabase.ts`?**
  _High betweenness centrality (0.047) - this node is a cross-community bridge._
- **Why does `useSiteI18n()` connect `useSiteI18n` to `request.ts`, `seo.ts`, `NotFoundContent.tsx`, `SiteI18nContext.tsx`, `StudentSetPassword.tsx`, `StudentDashboard.tsx`, `formules.ts`, `supabase.ts`, `StudentMatching.tsx`, `HomePage.tsx`?**
  _High betweenness centrality (0.029) - this node is a cross-community bridge._
- **What connects `compat`, `eslintConfig`, `securityHeaders` to the rest of the system?**
  _408 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `request.ts` be split into smaller, more focused modules?**
  _Cohesion score 0.07042253521126761 - nodes in this community are weakly interconnected._
- **Should `seo.ts` be split into smaller, more focused modules?**
  _Cohesion score 0.07123034227567067 - nodes in this community are weakly interconnected._