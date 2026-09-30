# Graph Report - chinoisendevenir  (2026-09-30)

## Corpus Check
- 331 files · ~411,540 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 1655 nodes · 4175 edges · 84 communities (72 shown, 10 thin omitted)
- Extraction: 98% EXTRACTED · 2% INFERRED · 0% AMBIGUOUS · INFERRED: 79 edges (avg confidence: 0.85)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `f829b9a6`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- TarifsPage.tsx
- studentDocuments.ts
- emailCompose.ts
- errorMessage
- auto-reply.ts
- reports.ts
- package.json
- scan-universities.mjs
- index.ts
- universityScanImport.ts
- inbound-email.ts
- studentProgress.ts
- generate-blog-posts.mjs
- Row Level Security
- reportsLlm.ts
- asString
- weights.ts
- AdminMatchingReport.tsx
- enrich.ts
- compilerOptions
- run.ts
- AdminUniversities.tsx
- Chinois en Devenir — brief pour agent IA
- seo.ts
- contactRevenue.ts
- languageProgramImport.ts
- StudentDashboard.tsx
- useSiteI18n
- adminRoles.ts
- student.ts
- score.ts
- Postgres Reference Writing Guidelines
- Choose the Right Index Type
- AdminI18nContext.tsx
- Use Connection Pooling for All Applications
- SiteI18nContext.tsx
- scrapling-crawl-universities.py
- Chinois en Devenir Agency
- SVG Icon Sprite Sheet
- useAdminI18n
- AdminMatchingPanel.tsx
- Supabase Postgres Best Practices
- Concurrency and Locking
- Use tsvector for Full-Text Search
- AdminContactInfo.tsx
- Data Access Patterns
- AdminChineseMatchingPanel.tsx
- Iridescent Blurred Ellipse Overlay
- formules.ts
- chinese.ts
- request.ts
- AdminDashboard.tsx
- Monitoring and Diagnostics
- vercel.json
- studentAuth.ts
- next.config.mjs
- apple-icon.tsx
- icon.tsx
- about/page.tsx
- react
- Find Skills
- buildDualReports
- Lowercase snake_case Identifiers
- Dependabot npm Weekly Updates
- saleContract.ts
- StudentMatching.tsx
- contact-submit.ts
- resend/route.ts
- openwa.ts
- devDependencies
- ProtectedRoute.tsx
- supabase.ts
- next-env.d.ts
- semantic.ts
- scripts
- dependencies
- AdminStudentFiles.tsx
- AdminContactEmailThread.tsx
- eslint.config.mjs
- next
- allowScripts
- AdminContactWhatsApp.tsx

## God Nodes (most connected - your core abstractions)
1. `useSiteI18n()` - 63 edges
2. `errorMessage()` - 54 edges
3. `asString()` - 41 edges
4. `processInboundEmail()` - 33 edges
5. `react` - 32 edges
6. `readJsonObject()` - 29 edges
7. `getAuthenticatedAdmin()` - 29 edges
8. `useAdminI18n()` - 28 edges
9. `AdminDashboard()` - 25 edges
10. `displayFormulePrice()` - 23 edges

## Surprising Connections (you probably didn't know these)
- `React Vite Template README` --conceptually_related_to--> `Next.js Agent Rules`  [AMBIGUOUS]
  README.md → AGENTS.md
- `main()` --calls--> `profileToRow()`  [EXTRACTED]
  scripts/import-language-programs.ts → src/lib/universityScanImport.ts
- `main()` --calls--> `canonicalCountry()`  [EXTRACTED]
  scripts/normalize-contact-countries.ts → src/lib/countries.ts
- `load()` --indirect_call--> `contactId()`  [INFERRED]
  src/components/AdminContactEmailThread.tsx → src/lib/api/inbound-email.ts
- `pgvector` --semantically_similar_to--> `Use tsvector for Full-Text Search`  [INFERRED] [semantically similar]
  .agents/skills/supabase-postgres-best-practices/SKILL.md → .agents/skills/supabase-postgres-best-practices/references/advanced-full-text-search.md

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

## Communities (84 total, 10 thin omitted)

### Community 0 - "TarifsPage.tsx"
Cohesion: 0.11
Nodes (33): metadata, metadata, metadata, metadata, metadata, metadata, FaqItem, FaqSection() (+25 more)

### Community 1 - "studentDocuments.ts"
Cohesion: 0.09
Nodes (56): GET(), POST(), DELETE(), GET(), loadFiles(), POST(), GET(), POST() (+48 more)

### Community 2 - "emailCompose.ts"
Cohesion: 0.09
Nodes (36): BulkTopic, ComposeContact, ComposeResult, isBulkTopic(), POST(), uniqueIds(), BULK_AI_TOPIC_KEYS, BULK_AI_TOPICS (+28 more)

### Community 3 - "errorMessage"
Cohesion: 0.19
Nodes (19): GET(), isAuthorizedCron(), maxDuration, POST(), runCron(), handler(), logAction(), sendTemplatedEmail() (+11 more)

### Community 4 - "auto-reply.ts"
Cohesion: 0.06
Nodes (48): OPTIONS, POST, AdminBulkEmail(), composeDraft(), sendBulk(), AdminBulkEmailProps, AI_TOPICS, authedFetch() (+40 more)

### Community 5 - "reports.ts"
Cohesion: 0.13
Nodes (26): blankOr(), blockingFields(), BREAKDOWN_ORDER, breakdownBars(), categoryOf(), constructiveVigilance(), costOf(), deadlineOf() (+18 more)

### Community 6 - "package.json"
Cohesion: 0.12
Nodes (15): engines, node, name, private, version, eslint, eslint-config-next, react-dom (+7 more)

### Community 7 - "scan-universities.mjs"
Cohesion: 0.09
Nodes (41): args, callMammouthJson(), CATALOG_PATH, closeTruncatedJson(), crawlUniversity(), enqueue(), decodeHtml(), discoverUrls() (+33 more)

### Community 8 - "index.ts"
Cohesion: 0.11
Nodes (24): BlogPage(), metadata, revalidate, BlogSlugPage(), generateMetadata(), generateStaticParams(), Params, revalidate (+16 more)

### Community 9 - "universityScanImport.ts"
Cohesion: 0.09
Nodes (38): admin, catalog, ROOT, POST(), asScanCatalog(), buildAdmissionSummary(), canonicalUniversityKey(), compactRequirement() (+30 more)

### Community 10 - "inbound-email.ts"
Cohesion: 0.10
Nodes (36): asEmailContact(), asInboundPayload(), classifyInboundIntent(), contactId(), createContactFromInbound(), detectFormule(), detectInterest(), EmailAddressLike (+28 more)

### Community 11 - "studentProgress.ts"
Cohesion: 0.09
Nodes (27): FORMULES, clampDossierEtape(), DIPLOMA_DOC_KEYS, FORMULE_OPTION_PREFIX, FORMULE_OPTIONS, getDisplayedStepIndex(), getPaidFormuleNumber(), getStudentStepIndex() (+19 more)

### Community 12 - "generate-blog-posts.mjs"
Cohesion: 0.24
Nodes (11): BRIEFS, __dirname, extractJson(), generateOne(), loadExisting(), main(), mammouth(), MODELS (+3 more)

### Community 13 - "Row Level Security"
Cohesion: 0.18
Nodes (12): Sequential Scan, Indexes on WHERE and JOIN Columns, Partial Indexes, Idempotent Constraint Creation, pg_constraint Catalog, Index Foreign Key Columns, Principle of Least Privilege, auth.uid() RLS Policy (+4 more)

### Community 14 - "reportsLlm.ts"
Cohesion: 0.38
Nodes (6): DualReportsInput, mergePolishedReports(), NO_GUARANTEE, stripGuarantees(), generateDualReports(), sourcePayload()

### Community 15 - "asString"
Cohesion: 0.14
Nodes (30): alreadySentIntentReply(), AUTO_REPLY_MARKER(), autoReplyMarker(), descriptionHasAutoMarker(), displayNameFromFrom(), EMAIL_INTENTS, EmailIntent, EmailIntentKey (+22 more)

### Community 16 - "weights.ts"
Cohesion: 0.17
Nodes (17): asRecord(), filled(), normalizeUniversity(), reqFor(), toNumber(), unique(), UniversityRow, yearlyLivingCost() (+9 more)

### Community 17 - "AdminMatchingReport.tsx"
Cohesion: 0.20
Nodes (8): AdminMatchingReport(), AdminReport, FACTOR_LABELS, FieldNote, GuidelineRow, STATUS_CLASS, STATUS_LABELS, UniversityRisk

### Community 18 - "enrich.ts"
Cohesion: 0.17
Nodes (22): asRecord(), CHINESE_LEVEL_TO_HSK, clamp(), computeQualityScore(), emptyIa(), englishFromIa(), enrichStudent(), extractMotivationSignals() (+14 more)

### Community 19 - "compilerOptions"
Cohesion: 0.11
Nodes (18): compilerOptions, allowJs, esModuleInterop, incremental, isolatedModules, jsx, lib, module (+10 more)

### Community 20 - "run.ts"
Cohesion: 0.12
Nodes (30): getFormuleAccess(), CATEGORY_META, identifyGaps(), MatchingGap, monthsForHskGap(), groupMix(), Mixable, selectMix() (+22 more)

### Community 21 - "AdminUniversities.tsx"
Cohesion: 0.10
Nodes (22): toUniversityInsert(), UNIVERSITY_SEED, UniversitySeedRow, AdminUniversities(), AdmissionChips(), AdmissionExtra, AdmissionRequirement, chipClass() (+14 more)

### Community 22 - "Chinois en Devenir — brief pour agent IA"
Cohesion: 0.06
Nodes (38): AI Writing Detection, Em Dashes as AI Tell, Canonical Overrides Hreflang, Google Localized Versions Docs, Helpful Content System, International SEO Evidence, Next.js Sitemap Self-Reference Caveat, hreflang x-default (+30 more)

### Community 23 - "seo.ts"
Cohesion: 0.09
Nodes (21): metadata, metadata, metadata, RootLayout(), alt, contentType, size, metadata (+13 more)

### Community 24 - "contactRevenue.ts"
Cohesion: 0.11
Nodes (22): ADMIN_ROLE_LIMITED, assign, clear, contactAssignPatch(), ContactOwnerFields, contactUnassignPatch(), isAssignedTo(), normalizeAdminEmail() (+14 more)

### Community 25 - "languageProgramImport.ts"
Cohesion: 0.09
Nodes (53): crawlPresentation(), existingPatchSql(), fetchPage(), insertSql(), loadEnv(), main(), parseCsv(), ROOT (+45 more)

### Community 26 - "StudentDashboard.tsx"
Cohesion: 0.10
Nodes (30): BUDGET_VALUES, EMPTY_FORM, INTAKE_VALUES, LeadForm(), LeadFormErrors, LeadFormProps, LeadFormStatus, LeadFormValues (+22 more)

### Community 27 - "useSiteI18n"
Cohesion: 0.18
Nodes (10): Hero(), HomeSeoContent(), Stats(), BreakdownRow, ChineseView, School, StudentChineseMatching(), TranslateFn (+2 more)

### Community 28 - "adminRoles.ts"
Cohesion: 0.29
Nodes (10): AdminAuthResult, AdminRole, getAdminEmailAllowlist(), getFullAdminEmails(), getLimitedAdminEmails(), parseEmailSet(), resolveAdminRole(), getAdminAccess() (+2 more)

### Community 29 - "student.ts"
Cohesion: 0.16
Nodes (20): BUDGET_BANDS, categoryFromScore(), categoryKeyFromScore(), categoryMetaFromScore(), autumn, empty, spring, diplomaToTargetDegree() (+12 more)

### Community 30 - "score.ts"
Cohesion: 0.22
Nodes (17): priorityFromScore(), clamp(), diplomaFitsTarget(), hardFilter(), intakeTooFar(), matchUniversity(), recommendFormula(), scoreAcademique() (+9 more)

### Community 31 - "Postgres Reference Writing Guidelines"
Cohesion: 0.17
Nodes (15): Concrete Transformation Patterns, Error-First Structure, Impact Level Guidelines, Quantified Impact, Self-Contained Examples, Semantic Naming, Postgres Reference Writing Guidelines, Query Performance (+7 more)

### Community 32 - "Choose the Right Index Type"
Cohesion: 0.13
Nodes (15): BRIN Index, B-tree Index, Choose the Right Index Type, GIN Index, GiST Index, Hash Index, PostgreSQL Index Types Documentation, Appropriate PostgreSQL Data Types (+7 more)

### Community 33 - "AdminI18nContext.tsx"
Cohesion: 0.17
Nodes (12): metadata, AdminI18nContext, AdminI18nProvider(), AdminI18nValue, interpolate(), isAdminLang(), lookup(), TranslateVars (+4 more)

### Community 34 - "Use Connection Pooling for All Applications"
Cohesion: 0.20
Nodes (14): Connection Management, Configure Idle Connection Timeouts, idle_session_timeout, Set Appropriate Connection Limits, max_connections, work_mem, Use Connection Pooling for All Applications, PgBouncer (+6 more)

### Community 35 - "SiteI18nContext.tsx"
Cohesion: 0.16
Nodes (19): interpolate(), isSiteLang(), lookup(), SiteI18nContext, SiteI18nProvider(), TranslateVars, en, fr (+11 more)

### Community 36 - "scrapling-crawl-universities.py"
Cohesion: 0.28
Nodes (11): Namespace, allowed_domains_for(), crawl_university(), load_targets(), main(), make_spider_class(), __init__(), parse() (+3 more)

### Community 37 - "Chinois en Devenir Agency"
Cohesion: 0.23
Nodes (13): Chinois en Devenir, No Guarantee Policy, Chinois en Devenir, CSC Scholarships, Chinese Language Year, Chinois en Devenir Agency, China Scholarship Council, JW201 JW202 Forms (+5 more)

### Community 38 - "SVG Icon Sprite Sheet"
Cohesion: 0.38
Nodes (13): Bluesky Clip Path, Bluesky Icon, Dark Brand Fill #08060d, Discord Icon, Documentation Icon, GitHub Icon, Purple Accent Stroke #aa3bff, Social Brand Marks (+5 more)

### Community 39 - "useAdminI18n"
Cohesion: 0.48
Nodes (5): ProtectedRoute(), useAdminAuth, useAdminI18n(), AdminLogin(), LanguageSessionPanel()

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

### Community 44 - "AdminContactInfo.tsx"
Cohesion: 0.18
Nodes (11): AdminContactInfo(), adminFetch(), BUDGETS, ContactForm, ContactInfo, contactToForm(), DATES_RENTREE, NIVEAUX_ETUDES (+3 more)

### Community 45 - "Data Access Patterns"
Cohesion: 0.22
Nodes (10): Data Access Patterns, Batch INSERT Statements for Bulk Data, COPY Bulk Load, ANY Array Batching, Eliminate N+1 Queries with Batch Loading, Use Cursor-Based Pagination Instead of OFFSET, OFFSET Pagination, INSERT ON CONFLICT (+2 more)

### Community 46 - "AdminChineseMatchingPanel.tsx"
Cohesion: 0.18
Nodes (10): AdminChineseMatchingPanel(), authedFetch(), BREAKDOWN_LABELS, CATEGORY_STYLES, ChineseContact, ChineseMatch, ChineseResult, ChineseRun (+2 more)

### Community 47 - "Iridescent Blurred Ellipse Overlay"
Cohesion: 0.36
Nodes (8): Alpha Mask Silhouette Clip, Brand Purple #863bff, Cyan Accent Highlight, Display-P3 Wide Gamut Fills, Folded Ribbon Glyph, Iridescent Blurred Ellipse Overlay, Lavender Specular Highlight, Site Favicon Brand Mark

### Community 48 - "formules.ts"
Cohesion: 0.11
Nodes (33): StudentFormuleBanner(), IncludeGroup, StudentFormules(), StudentFormulesProps, generateFormulesPresentationTemplate(), generateRelanceFormulesTemplate(), formuleAmountEuros(), canonicalFormuleValue() (+25 more)

### Community 49 - "chinese.ts"
Cohesion: 0.17
Nodes (24): GET(), POST(), CATEGORIES, categoryFromScore(), chineseCitiesFromCatalog(), ChineseMatch, chineseMatchingSummary(), clamp() (+16 more)

### Community 50 - "request.ts"
Cohesion: 0.13
Nodes (33): @supabase/supabase-js, POST(), POST(), missingAuthUser(), POST(), POST(), alreadyRegistered(), AuthErrorLike (+25 more)

### Community 51 - "AdminDashboard.tsx"
Cohesion: 0.10
Nodes (24): AdminShell(), NavItem, useAdminAccess(), onlyOne, rows, isMissingPriorityColumn(), isPrioritaire(), PriorityContact (+16 more)

### Community 52 - "Monitoring and Diagnostics"
Cohesion: 0.60
Nodes (5): Monitoring and Diagnostics, Use EXPLAIN ANALYZE to Diagnose Slow Queries, Enable pg_stat_statements for Query Analysis, Autovacuum Tuning, Maintain Table Statistics with VACUUM and ANALYZE

### Community 53 - "vercel.json"
Cohesion: 0.40
Nodes (4): buildCommand, crons, framework, $schema

### Community 54 - "studentAuth.ts"
Cohesion: 0.24
Nodes (19): POST(), filled(), PATCH(), getUnlockedStudentAccess(), AuthErrorResult, ensureStudentContact(), filled(), getAuthenticatedContact() (+11 more)

### Community 59 - "react"
Cohesion: 0.12
Nodes (16): react, metadata, Providers(), Footer(), Navigation(), NotFoundContent(), StudentProtectedRoute(), AdminAuthProvider (+8 more)

### Community 61 - "buildDualReports"
Cohesion: 0.17
Nodes (15): adminGuideline(), applicationCap(), applicationMixAdvice(), buildDualReports(), closingText(), completenessNote(), documentInventory(), draftClientResponse() (+7 more)

### Community 66 - "saleContract.ts"
Cohesion: 0.07
Nodes (54): AdminSendContract(), send(), updatePrestataire(), authedFetch(), ContractContact, fieldClass(), escapeHtml(), ALREADY (+46 more)

### Community 67 - "StudentMatching.tsx"
Cohesion: 0.15
Nodes (10): BreakdownRow, GrantGroup, Matching, MatchingDoc, ROAD_STATUS_MARK, RoadmapRow, StudentMatching(), StudentReport (+2 more)

### Community 68 - "contact-submit.ts"
Cohesion: 0.11
Nodes (28): resend, OPTIONS, POST, DOMAINES_VALIDES, generateEmailTemplate(), handler(), isFilled(), mergeNotes() (+20 more)

### Community 69 - "resend/route.ts"
Cohesion: 0.36
Nodes (7): maxDuration, POST(), decodeWebhookSecret(), HeaderSource, headerValue(), signaturesMatch(), verifyResendWebhook()

### Community 70 - "openwa.ts"
Cohesion: 0.07
Nodes (48): main(), supabase, FIELD_LABELS, FieldKey, filled(), PATCH(), sameValue(), GET() (+40 more)

### Community 71 - "devDependencies"
Cohesion: 0.20
Nodes (10): devDependencies, eslint, eslint-config-next, @eslint/eslintrc, tailwindcss, @tailwindcss/postcss, @types/node, @types/react (+2 more)

### Community 72 - "ProtectedRoute.tsx"
Cohesion: 0.23
Nodes (9): GET(), AdminCapabilities, verify(), AdminAccessContext, AdminAccessProvider(), AdminCapabilities, FULL_ACCESS, ADMIN_ROLE_FULL (+1 more)

### Community 73 - "supabase.ts"
Cohesion: 0.21
Nodes (8): { AuthProvider, useScopedAuth }, AuthResult, createScopedAuth(), applySession(), AuthProvider(), emptyAuth, ScopedAuth, adminSupabase

### Community 75 - "semantic.ts"
Cohesion: 0.33
Nodes (9): DOMAIN_FAMILIES, DOMAIN_KEYS, DomainSimilarity, familyOf(), jaccard(), studentTokens(), tokenize(), universityTokens() (+1 more)

### Community 76 - "scripts"
Cohesion: 0.25
Nodes (8): scripts, build, dev, import:universities, lint, scan:universities, start, test

### Community 77 - "dependencies"
Cohesion: 0.29
Nodes (7): dependencies, next, react, react-dom, resend, @supabase/supabase-js, @vercel/speed-insights

### Community 78 - "AdminStudentFiles.tsx"
Cohesion: 0.33
Nodes (6): AdminDoc, adminFetch(), AdminStudentFiles(), FilesPayload, RequiredDoc, RequiredFile

### Community 79 - "AdminContactEmailThread.tsx"
Cohesion: 0.60
Nodes (4): AdminContactEmailThread(), load(), formatWhen(), localeFor()

### Community 80 - "eslint.config.mjs"
Cohesion: 0.50
Nodes (3): compat, eslintConfig, @eslint/eslintrc

### Community 85 - "AdminContactWhatsApp.tsx"
Cohesion: 0.33
Nodes (8): AdminContactWhatsApp(), loadCard(), run(), authedFetch(), localeFor(), ThreadMessage, WhatsappCard, WhatsappContact

## Ambiguous Edges - Review These
- `Next.js Agent Rules` → `React Vite Template README`  [AMBIGUOUS]
  README.md · relation: conceptually_related_to

## Knowledge Gaps
- **462 isolated node(s):** `compat`, `eslintConfig`, `securityHeaders`, `nextConfig`, `name` (+457 more)
  These have ≤1 connection - possible missing edges or undocumented components. (Counts symbols only; 531 node(s) total have ≤1 connection when file, concept and rationale nodes are included.)
- **10 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **What is the exact relationship between `Next.js Agent Rules` and `React Vite Template README`?**
  _Edge tagged AMBIGUOUS (relation: conceptually_related_to) - confidence is low._
- **Why does `react` connect `react` to `auto-reply.ts`, `package.json`, `AdminMatchingReport.tsx`, `AdminUniversities.tsx`, `seo.ts`, `StudentDashboard.tsx`, `useSiteI18n`, `AdminI18nContext.tsx`, `SiteI18nContext.tsx`, `useAdminI18n`, `AdminMatchingPanel.tsx`, `AdminContactInfo.tsx`, `AdminChineseMatchingPanel.tsx`, `AdminDashboard.tsx`, `saleContract.ts`, `StudentMatching.tsx`, `ProtectedRoute.tsx`, `supabase.ts`, `AdminStudentFiles.tsx`, `AdminContactEmailThread.tsx`, `next`, `AdminContactWhatsApp.tsx`?**
  _High betweenness centrality (0.064) - this node is a cross-community bridge._
- **Why does `@supabase/supabase-js` connect `request.ts` to `openwa.ts`, `package.json`, `universityScanImport.ts`, `supabase.ts`, `AdminDashboard.tsx`, `studentAuth.ts`, `languageProgramImport.ts`?**
  _High betweenness centrality (0.052) - this node is a cross-community bridge._
- **Why does `errorMessage()` connect `errorMessage` to `studentDocuments.ts`, `saleContract.ts`, `contact-submit.ts`, `auto-reply.ts`, `AdminMatchingPanel.tsx`, `inbound-email.ts`, `AdminContactInfo.tsx`, `AdminChineseMatchingPanel.tsx`, `AdminStudentFiles.tsx`, `chinese.ts`, `request.ts`, `AdminContactWhatsApp.tsx`, `AdminUniversities.tsx`, `StudentDashboard.tsx`, `react`?**
  _High betweenness centrality (0.037) - this node is a cross-community bridge._
- **What connects `compat`, `eslintConfig`, `securityHeaders` to the rest of the system?**
  _462 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `TarifsPage.tsx` be split into smaller, more focused modules?**
  _Cohesion score 0.11465892597968069 - nodes in this community are weakly interconnected._
- **Should `studentDocuments.ts` be split into smaller, more focused modules?**
  _Cohesion score 0.08514013749338974 - nodes in this community are weakly interconnected._