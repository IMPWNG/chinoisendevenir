# Graph Report - chinoisendevenir  (2026-09-17)

## Corpus Check
- 293 files · ~394,142 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 1473 nodes · 3618 edges · 77 communities (66 shown, 9 thin omitted)
- Extraction: 98% EXTRACTED · 2% INFERRED · 0% AMBIGUOUS · INFERRED: 74 edges (avg confidence: 0.85)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `0dca1e47`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- seo.ts
- studentDocuments.ts
- contact-submit.ts
- studentProgress.ts
- AdminCalendar.tsx
- reports.ts
- package.json
- scan-universities.mjs
- index.ts
- universityScanImport.ts
- inbound-email.ts
- emailCompose.ts
- generate-blog-posts.mjs
- Row Level Security
- formules.ts
- asString
- run.ts
- chinese.ts
- enrich.ts
- compilerOptions
- weights.ts
- AdminUniversities.tsx
- Chinois en Devenir — brief pour agent IA
- supabase.ts
- AdminDashboard.tsx
- auto-reply.ts
- StudentDashboard.tsx
- formules-relance.ts
- useSiteI18n
- student.ts
- score.ts
- Postgres Reference Writing Guidelines
- Choose the Right Index Type
- AdminI18nContext.tsx
- Use Connection Pooling for All Applications
- AdminContactEmail.tsx
- scrapling-crawl-universities.py
- Chinois en Devenir Agency
- SVG Icon Sprite Sheet
- react
- AdminMatchingPanel.tsx
- Supabase Postgres Best Practices
- Concurrency and Locking
- Use tsvector for Full-Text Search
- AdminContactInfo.tsx
- Data Access Patterns
- AdminChineseMatchingPanel.tsx
- Iridescent Blurred Ellipse Overlay
- resend/route.ts
- TarifsPage.tsx
- studentAuth.ts
- semantic.ts
- Monitoring and Diagnostics
- vercel.json
- LeadForm.tsx
- next.config.mjs
- apple-icon.tsx
- icon.tsx
- about/page.tsx
- contacts/route.ts
- Find Skills
- AdminStudentFiles.tsx
- Lowercase snake_case Identifiers
- Dependabot npm Weekly Updates
- formule/route.ts
- StudentMatching.tsx
- SITE
- suiviStatuts.ts
- StudentChineseMatching.tsx
- site.ts
- useAdminI18n
- espace-etudiant/page.tsx
- next-env.d.ts
- AdminBulkEmail.tsx
- AdminContactEmailThread.tsx

## God Nodes (most connected - your core abstractions)
1. `useSiteI18n()` - 63 edges
2. `errorMessage()` - 53 edges
3. `asString()` - 38 edges
4. `processInboundEmail()` - 34 edges
5. `react` - 31 edges
6. `getAuthenticatedAdmin()` - 28 edges
7. `readJsonObject()` - 27 edges
8. `useAdminI18n()` - 25 edges
9. `AdminCalendar()` - 23 edges
10. `buildDualReports()` - 23 edges

## Surprising Connections (you probably didn't know these)
- `React Vite Template README` --conceptually_related_to--> `Next.js Agent Rules`  [AMBIGUOUS]
  README.md → AGENTS.md
- `load()` --indirect_call--> `contactId()`  [INFERRED]
  src/components/AdminContactEmailThread.tsx → src/lib/api/inbound-email.ts
- `pgvector` --semantically_similar_to--> `Use tsvector for Full-Text Search`  [INFERRED] [semantically similar]
  .agents/skills/supabase-postgres-best-practices/SKILL.md → .agents/skills/supabase-postgres-best-practices/references/advanced-full-text-search.md
- `Next.js Sitemap Self-Reference Caveat` --conceptually_related_to--> `Next.js Agent Rules`  [INFERRED]
  .agents/skills/seo-audit/references/international-seo.md → AGENTS.md
- `Use EXPLAIN ANALYZE to Diagnose Slow Queries` --semantically_similar_to--> `Enable pg_stat_statements for Query Analysis`  [INFERRED] [semantically similar]
  .agents/skills/supabase-postgres-best-practices/references/monitor-explain-analyze.md → .agents/skills/supabase-postgres-best-practices/references/monitor-pg-stat-statements.md

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

## Communities (77 total, 9 thin omitted)

### Community 0 - "seo.ts"
Cohesion: 0.09
Nodes (33): metadata, metadata, metadata, metadata, metadata, metadata, RootLayout(), metadata (+25 more)

### Community 1 - "studentDocuments.ts"
Cohesion: 0.09
Nodes (53): GET(), GET(), POST(), DELETE(), GET(), loadFiles(), POST(), GET() (+45 more)

### Community 2 - "contact-submit.ts"
Cohesion: 0.07
Nodes (53): @supabase/supabase-js, POST(), POST(), OPTIONS, POST, DOMAINES_VALIDES, generateEmailTemplate(), handler() (+45 more)

### Community 3 - "studentProgress.ts"
Cohesion: 0.15
Nodes (17): FORMULES, clampDossierEtape(), DIPLOMA_DOC_KEYS, diplomaLevelFromStudent(), FORMULE_OPTION_PREFIX, getDisplayedStepIndex(), getPaidFormuleNumber(), getSchoolDocumentsIntro() (+9 more)

### Community 4 - "AdminCalendar.tsx"
Cohesion: 0.09
Nodes (55): DELETE(), GET(), limited(), PATCH(), POST(), searchParams(), AdminCalendar(), openCreate() (+47 more)

### Community 5 - "reports.ts"
Cohesion: 0.08
Nodes (50): adminGuideline(), applicationCap(), applicationMixAdvice(), blankOr(), blockingFields(), BREAKDOWN_ORDER, breakdownBars(), buildDualReports() (+42 more)

### Community 6 - "package.json"
Cohesion: 0.04
Nodes (46): compat, eslintConfig, allowScripts, unrs-resolver, dependencies, next, react, react-dom (+38 more)

### Community 7 - "scan-universities.mjs"
Cohesion: 0.09
Nodes (41): args, callMammouthJson(), CATALOG_PATH, closeTruncatedJson(), crawlUniversity(), enqueue(), decodeHtml(), discoverUrls() (+33 more)

### Community 8 - "index.ts"
Cohesion: 0.10
Nodes (27): BlogPage(), metadata, revalidate, BlogSlugPage(), generateMetadata(), generateStaticParams(), Params, revalidate (+19 more)

### Community 9 - "universityScanImport.ts"
Cohesion: 0.09
Nodes (38): admin, catalog, ROOT, POST(), asScanCatalog(), buildAdmissionSummary(), canonicalUniversityKey(), compactRequirement() (+30 more)

### Community 10 - "inbound-email.ts"
Cohesion: 0.10
Nodes (45): handler(), logAction(), sendTemplatedEmail(), updateContactStatus(), asEmailContact(), asInboundPayload(), classifyInboundIntent(), contactId() (+37 more)

### Community 11 - "emailCompose.ts"
Cohesion: 0.09
Nodes (36): BulkTopic, ComposeContact, ComposeResult, isBulkTopic(), POST(), uniqueIds(), BULK_AI_TOPIC_KEYS, BULK_AI_TOPICS (+28 more)

### Community 12 - "generate-blog-posts.mjs"
Cohesion: 0.24
Nodes (11): BRIEFS, __dirname, extractJson(), generateOne(), loadExisting(), main(), mammouth(), MODELS (+3 more)

### Community 13 - "Row Level Security"
Cohesion: 0.18
Nodes (12): Sequential Scan, Indexes on WHERE and JOIN Columns, Partial Indexes, Idempotent Constraint Creation, pg_constraint Catalog, Index Foreign Key Columns, Principle of Least Privilege, auth.uid() RLS Policy (+4 more)

### Community 14 - "formules.ts"
Cohesion: 0.11
Nodes (25): IncludeGroup, StudentFormules(), StudentFormulesProps, generateFormulesPresentationTemplate(), displayFormuleFootnote(), displayFormulePrice(), EXTRA_FEES, Formule (+17 more)

### Community 15 - "asString"
Cohesion: 0.15
Nodes (29): alreadySentIntentReply(), AUTO_REPLY_MARKER(), autoReplyMarker(), descriptionHasAutoMarker(), displayNameFromFrom(), EMAIL_INTENTS, EmailIntent, EmailIntentKey (+21 more)

### Community 16 - "run.ts"
Cohesion: 0.14
Nodes (26): getFormuleAccess(), identifyGaps(), MatchingGap, monthsForHskGap(), groupMix(), Mixable, selectMix(), takeFrom() (+18 more)

### Community 17 - "chinese.ts"
Cohesion: 0.17
Nodes (24): POST(), CATEGORIES, categoryFromScore(), chineseCitiesFromCatalog(), ChineseMatch, chineseMatchingSummary(), clamp(), compactChineseMatchingResult() (+16 more)

### Community 18 - "enrich.ts"
Cohesion: 0.17
Nodes (22): asRecord(), CHINESE_LEVEL_TO_HSK, clamp(), computeQualityScore(), emptyIa(), englishFromIa(), enrichStudent(), extractMotivationSignals() (+14 more)

### Community 19 - "compilerOptions"
Cohesion: 0.11
Nodes (18): compilerOptions, allowJs, esModuleInterop, incremental, isolatedModules, jsx, lib, module (+10 more)

### Community 20 - "weights.ts"
Cohesion: 0.15
Nodes (19): asRecord(), filled(), normalizeUniversity(), reqFor(), toNumber(), unique(), UniversityRow, yearlyLivingCost() (+11 more)

### Community 21 - "AdminUniversities.tsx"
Cohesion: 0.10
Nodes (21): toUniversityInsert(), UNIVERSITY_SEED, UniversitySeedRow, AdminUniversities(), AdmissionChips(), AdmissionExtra, AdmissionRequirement, chipClass() (+13 more)

### Community 22 - "Chinois en Devenir — brief pour agent IA"
Cohesion: 0.06
Nodes (38): AI Writing Detection, Em Dashes as AI Tell, Canonical Overrides Hreflang, Google Localized Versions Docs, Helpful Content System, International SEO Evidence, Next.js Sitemap Self-Reference Caveat, hreflang x-default (+30 more)

### Community 23 - "supabase.ts"
Cohesion: 0.14
Nodes (13): AdminAuthProvider, { AuthProvider, useScopedAuth }, { AuthProvider, useScopedAuth }, StudentAuthProvider, useStudentAuth, AuthResult, createScopedAuth(), applySession() (+5 more)

### Community 24 - "AdminDashboard.tsx"
Cohesion: 0.17
Nodes (17): useAdminAccess(), isMatchingPayloadAction(), isStudentSpaceUnlocked(), mergeFormuleNote(), stripFormuleNote(), canonicalStatut(), toStoredStatut(), ACTIONS_TYPES (+9 more)

### Community 25 - "auto-reply.ts"
Cohesion: 0.12
Nodes (21): OPTIONS, POST, EMAIL_TEMPLATES, EmailContact, EmailTemplate, generateFormuleConfirmeeTemplate(), generateRelance1Template(), generateRelance2Template() (+13 more)

### Community 26 - "StudentDashboard.tsx"
Cohesion: 0.17
Nodes (16): withCurrentOption(), getVisibleStudentSteps(), studentCanAccessVisaDocuments(), AdminDoc, BUDGET_LABEL_KEYS, budgetLabel(), catalogDoc(), ChineseMatchingData (+8 more)

### Community 27 - "formules-relance.ts"
Cohesion: 0.23
Nodes (13): GET(), isAuthorizedCron(), maxDuration, POST(), runCron(), actionTime(), getSupabase(), isFormulesSentAction() (+5 more)

### Community 28 - "useSiteI18n"
Cohesion: 0.10
Nodes (20): metadata, metadata, Hero(), HomeSeoContent(), NotFoundContent(), Stats(), StudentVisaDocuments(), useAuth (+12 more)

### Community 29 - "student.ts"
Cohesion: 0.18
Nodes (18): CATEGORY_META, categoryFromScore(), categoryKeyFromScore(), diplomaToTargetDegree(), DOMAIN_FAMILIES, DOMAIN_KEYS, englishToIelts(), englishToToefl() (+10 more)

### Community 30 - "score.ts"
Cohesion: 0.20
Nodes (18): categoryMetaFromScore(), priorityFromScore(), clamp(), diplomaFitsTarget(), hardFilter(), intakeTooFar(), matchUniversity(), recommendFormula() (+10 more)

### Community 31 - "Postgres Reference Writing Guidelines"
Cohesion: 0.17
Nodes (15): Concrete Transformation Patterns, Error-First Structure, Impact Level Guidelines, Quantified Impact, Self-Contained Examples, Semantic Naming, Postgres Reference Writing Guidelines, Query Performance (+7 more)

### Community 32 - "Choose the Right Index Type"
Cohesion: 0.13
Nodes (15): BRIN Index, B-tree Index, Choose the Right Index Type, GIN Index, GiST Index, Hash Index, PostgreSQL Index Types Documentation, Appropriate PostgreSQL Data Types (+7 more)

### Community 33 - "AdminI18nContext.tsx"
Cohesion: 0.18
Nodes (12): metadata, AdminI18nContext, AdminI18nProvider(), AdminI18nValue, interpolate(), isAdminLang(), lookup(), TranslateVars (+4 more)

### Community 34 - "Use Connection Pooling for All Applications"
Cohesion: 0.20
Nodes (14): Connection Management, Configure Idle Connection Timeouts, idle_session_timeout, Set Appropriate Connection Limits, max_connections, work_mem, Use Connection Pooling for All Applications, PgBouncer (+6 more)

### Community 35 - "AdminContactEmail.tsx"
Cohesion: 0.27
Nodes (9): AdminContactEmail(), composeWithAi(), sendEmail(), authedFetch(), EmailContact, fieldClass(), TEMPLATE_OPTIONS, CONTACT_FROM_NAME (+1 more)

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
Cohesion: 0.19
Nodes (9): next, react, metadata, AdminCapabilities, AdminAccessContext, AdminAccessProvider(), AdminCapabilities, FULL_ACCESS (+1 more)

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

### Community 44 - "AdminContactInfo.tsx"
Cohesion: 0.18
Nodes (11): AdminContactInfo(), adminFetch(), BUDGETS, ContactForm, ContactInfo, contactToForm(), DATES_RENTREE, NIVEAUX_ETUDES (+3 more)

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

### Community 49 - "TarifsPage.tsx"
Cohesion: 0.33
Nodes (12): FaqItem, FaqSection(), FaqSectionProps, Footer(), JsonLd(), JsonLdProps, Navigation(), BreadcrumbItem (+4 more)

### Community 50 - "studentAuth.ts"
Cohesion: 0.14
Nodes (23): GET(), filled(), PATCH(), ADMIN_ROLE_LIMITED, AdminAuthResult, adminCapabilities(), AdminRole, getAdminEmailAllowlist() (+15 more)

### Community 51 - "semantic.ts"
Cohesion: 0.46
Nodes (7): DomainSimilarity, familyOf(), jaccard(), studentTokens(), tokenize(), universityTokens(), MatchingUniversity

### Community 52 - "Monitoring and Diagnostics"
Cohesion: 0.60
Nodes (5): Monitoring and Diagnostics, Use EXPLAIN ANALYZE to Diagnose Slow Queries, Enable pg_stat_statements for Query Analysis, Autovacuum Tuning, Maintain Table Statistics with VACUUM and ANALYZE

### Community 53 - "vercel.json"
Cohesion: 0.40
Nodes (4): buildCommand, crons, framework, $schema

### Community 54 - "LeadForm.tsx"
Cohesion: 0.19
Nodes (14): BUDGET_VALUES, EMPTY_FORM, INTAKE_VALUES, LeadForm(), LeadFormErrors, LeadFormProps, LeadFormStatus, LeadFormValues (+6 more)

### Community 59 - "contacts/route.ts"
Cohesion: 0.19
Nodes (13): FIELD_LABELS, FieldKey, filled(), PATCH(), sameValue(), close, frozen, touch (+5 more)

### Community 61 - "AdminStudentFiles.tsx"
Cohesion: 0.33
Nodes (6): AdminDoc, adminFetch(), AdminStudentFiles(), FilesPayload, RequiredDoc, RequiredFile

### Community 66 - "formule/route.ts"
Cohesion: 0.29
Nodes (15): POST(), AdminMatchingPanel(), StudentFormuleBanner(), canonicalFormuleValue(), displayFormuleLabel(), getFormuleByNumber(), getFormuleNumber(), publicStudentProfile() (+7 more)

### Community 67 - "StudentMatching.tsx"
Cohesion: 0.15
Nodes (10): BreakdownRow, GrantGroup, Matching, MatchingDoc, ROAD_STATUS_MARK, RoadmapRow, StudentMatching(), StudentReport (+2 more)

### Community 68 - "SITE"
Cohesion: 0.13
Nodes (9): metadata, alt, contentType, size, metadata, AI_BOTS, SITE, PrivacyPolicyPage() (+1 more)

### Community 69 - "suiviStatuts.ts"
Cohesion: 0.17
Nodes (11): CANONICAL_TO_STORED_STATUT, EARLY_STATUSES, FORMULE_ALREADY_CHOSEN, FORMULES_AWAITING_REPLY, LEGACY_STATUT_MAP, PAID_STATUSES, STATUS_RANK, STATUT_COLORS (+3 more)

### Community 70 - "StudentChineseMatching.tsx"
Cohesion: 0.25
Nodes (5): BreakdownRow, ChineseView, School, StudentChineseMatching(), TranslateFn

### Community 71 - "site.ts"
Cohesion: 0.25
Nodes (7): en, fr, SiteCopy, SiteLang, siteTranslations, STUDY_DOMAIN_VALUE_BY_INDEX, STUDY_DOMAIN_VALUES

### Community 72 - "useAdminI18n"
Cohesion: 0.31
Nodes (7): AdminShell(), NavItem, ProtectedRoute(), verify(), useAdminAuth, useAdminI18n(), AdminLogin()

### Community 75 - "AdminBulkEmail.tsx"
Cohesion: 0.24
Nodes (9): AdminBulkEmail(), composeDraft(), sendBulk(), AdminBulkEmailProps, AI_TOPICS, authedFetch(), BulkContact, BulkProgress (+1 more)

### Community 76 - "AdminContactEmailThread.tsx"
Cohesion: 0.47
Nodes (5): AdminContactEmailThread(), load(), formatWhen(), localeFor(), ContactEmailRow

## Ambiguous Edges - Review These
- `Next.js Agent Rules` → `React Vite Template README`  [AMBIGUOUS]
  README.md · relation: conceptually_related_to

## Knowledge Gaps
- **414 isolated node(s):** `compat`, `eslintConfig`, `securityHeaders`, `nextConfig`, `name` (+409 more)
  These have ≤1 connection - possible missing edges or undocumented components. (Counts symbols only; 469 node(s) total have ≤1 connection when file, concept and rationale nodes are included.)
- **9 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **What is the exact relationship between `Next.js Agent Rules` and `React Vite Template README`?**
  _Edge tagged AMBIGUOUS (relation: conceptually_related_to) - confidence is low._
- **Why does `react` connect `react` to `seo.ts`, `AdminCalendar.tsx`, `package.json`, `AdminUniversities.tsx`, `supabase.ts`, `AdminDashboard.tsx`, `StudentDashboard.tsx`, `useSiteI18n`, `AdminI18nContext.tsx`, `AdminContactEmail.tsx`, `AdminMatchingPanel.tsx`, `AdminContactInfo.tsx`, `AdminChineseMatchingPanel.tsx`, `TarifsPage.tsx`, `LeadForm.tsx`, `AdminStudentFiles.tsx`, `StudentMatching.tsx`, `StudentChineseMatching.tsx`, `useAdminI18n`, `espace-etudiant/page.tsx`, `AdminBulkEmail.tsx`, `AdminContactEmailThread.tsx`?**
  _High betweenness centrality (0.074) - this node is a cross-community bridge._
- **Why does `errorMessage()` connect `inbound-email.ts` to `studentDocuments.ts`, `formule/route.ts`, `AdminContactEmail.tsx`, `AdminCalendar.tsx`, `contact-submit.ts`, `AdminMatchingPanel.tsx`, `AdminBulkEmail.tsx`, `AdminContactInfo.tsx`, `AdminChineseMatchingPanel.tsx`, `chinese.ts`, `AdminUniversities.tsx`, `supabase.ts`, `auto-reply.ts`, `StudentDashboard.tsx`, `formules-relance.ts`, `useSiteI18n`, `AdminStudentFiles.tsx`?**
  _High betweenness centrality (0.057) - this node is a cross-community bridge._
- **Why does `asString()` connect `asString` to `studentDocuments.ts`, `contact-submit.ts`, `AdminCalendar.tsx`, `inbound-email.ts`, `emailCompose.ts`, `resend/route.ts`, `chinese.ts`, `studentAuth.ts`, `auto-reply.ts`, `contacts/route.ts`?**
  _High betweenness centrality (0.025) - this node is a cross-community bridge._
- **What connects `compat`, `eslintConfig`, `securityHeaders` to the rest of the system?**
  _414 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `seo.ts` be split into smaller, more focused modules?**
  _Cohesion score 0.09080841638981174 - nodes in this community are weakly interconnected._
- **Should `studentDocuments.ts` be split into smaller, more focused modules?**
  _Cohesion score 0.09175920514319112 - nodes in this community are weakly interconnected._