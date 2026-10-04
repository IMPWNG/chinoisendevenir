# Graph Report - chinoisendevenir  (2026-10-04)

## Corpus Check
- 377 files · ~451,140 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 1906 nodes · 4919 edges · 89 communities (80 shown, 7 thin omitted)
- Extraction: 98% EXTRACTED · 2% INFERRED · 0% AMBIGUOUS · INFERRED: 84 edges (avg confidence: 0.85)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `206a58dc`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- seo.ts
- studentDocuments.ts
- emailCompose.ts
- formules-relance.ts
- emailTemplateDrafts.ts
- reports.ts
- package.json
- scan-universities.mjs
- index.ts
- universityScanImport.ts
- inbound-email.ts
- getAuthenticatedAdmin
- generate-blog-posts.mjs
- Row Level Security
- reportsLlm.ts
- asString
- university.ts
- AdminMatchingPanel.tsx
- enrich.ts
- compilerOptions
- run.ts
- AdminUniversities.tsx
- Chinois en Devenir — brief pour agent IA
- generate.ts
- contactRevenue.ts
- languageProgramImport.ts
- blog/route.ts
- StudentDashboard.tsx
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
- drip/route.ts
- Supabase Postgres Best Practices
- Concurrency and Locking
- Use tsvector for Full-Text Search
- AdminContactInfo.tsx
- Data Access Patterns
- AdminChineseMatchingPanel.tsx
- sitemap.check.ts
- formules.ts
- chinese.ts
- getSupabaseAdmin
- AdminDashboard.tsx
- Monitoring and Diagnostics
- vercel.json
- studentProgress.ts
- next.config.mjs
- dripQueue.ts
- errorMessage
- about/page.tsx
- AdminAuthContext.tsx
- Find Skills
- AdminDripSend.tsx
- Lowercase snake_case Identifiers
- Dependabot npm Weekly Updates
- saleContract.ts
- money.ts
- contact-submit.ts
- resend/route.ts
- openwa.ts
- StudentMatching.tsx
- react
- request.ts
- next-env.d.ts
- AdminBulkWhatsapp.tsx
- persist.check.ts
- StudentSetPassword.tsx
- AdminStudentFiles.tsx
- supabase.ts
- eslint.config.mjs
- StudentChineseMatching.tsx
- blog-generate/route.ts
- auto-reply.ts
- getFormuleNumber
- AdminContactWhatsApp.tsx
- TarifsPage.tsx
- useSiteI18n
- studentAuth.ts

## God Nodes (most connected - your core abstractions)
1. `useSiteI18n()` - 76 edges
2. `errorMessage()` - 70 edges
3. `asString()` - 48 edges
4. `react` - 38 edges
5. `getAuthenticatedAdmin()` - 38 edges
6. `useAdminI18n()` - 36 edges
7. `readJsonObject()` - 36 edges
8. `processInboundEmail()` - 33 edges
9. `getSupabaseAdmin()` - 28 edges
10. `AdminDashboard()` - 27 edges

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
- **Icons in the SVG Sprite** — public_icons_bluesky_icon, public_icons_discord_icon, public_icons_documentation_icon, public_icons_github_icon, public_icons_social_icon, public_icons_x_icon [EXTRACTED 1.00]
- **PostgreSQL Indexing Strategy** — _agents_skills_supabase_postgres_best_practices_references_query_index_types_choose_right_index_type, _agents_skills_supabase_postgres_best_practices_references_query_missing_indexes_where_join_indexes, _agents_skills_supabase_postgres_best_practices_references_query_partial_indexes_partial_indexes, _agents_skills_supabase_postgres_best_practices_references_schema_foreign_key_indexes_index_fk_columns [INFERRED 0.85]
- **Postgres Access Control Defense in Depth** — _agents_skills_supabase_postgres_best_practices_references_security_privileges_least_privilege, _agents_skills_supabase_postgres_best_practices_references_security_rls_basics_row_level_security, _agents_skills_supabase_postgres_best_practices_references_security_rls_performance_select_wrapper, _agents_skills_supabase_postgres_best_practices_references_security_rls_performance_security_definer [INFERRED 0.85]
- **Filled Social Brand Logos** — public_icons_bluesky_icon, public_icons_discord_icon, public_icons_github_icon, public_icons_x_icon, public_icons_dark_brand_fill [INFERRED 0.85]
- **Purple Stroke UI Glyphs** — public_icons_documentation_icon, public_icons_social_icon, public_icons_purple_accent_stroke, public_icons_ui_chrome_glyphs [INFERRED 0.85]

## Communities (89 total, 7 thin omitted)

### Community 0 - "seo.ts"
Cohesion: 0.05
Nodes (43): metadata, metadata, metadata, metadata, metadata, metadata, metadata, RootLayout() (+35 more)

### Community 1 - "studentDocuments.ts"
Cohesion: 0.11
Nodes (42): DELETE(), GET(), loadFiles(), POST(), GET(), POST(), add(), asList() (+34 more)

### Community 2 - "emailCompose.ts"
Cohesion: 0.08
Nodes (44): BulkTopic, ComposeContact, ComposeResult, isBulkTopic(), POST(), uniqueIds(), BULK_AI_TOPIC_KEYS, BULK_AI_TOPICS (+36 more)

### Community 3 - "formules-relance.ts"
Cohesion: 0.23
Nodes (13): GET(), isAuthorizedCron(), maxDuration, POST(), runCron(), actionTime(), getSupabase(), isFormulesSentAction() (+5 more)

### Community 4 - "emailTemplateDrafts.ts"
Cohesion: 0.11
Nodes (22): AdminContactEmail(), applyDraft(), composeWithAi(), sendEmail(), authedFetch(), EmailContact, fieldClass(), generateCustomEmailHtml() (+14 more)

### Community 5 - "reports.ts"
Cohesion: 0.09
Nodes (47): adminGuideline(), analysisNote(), applicationCap(), applicationMixAdvice(), blankOr(), blockingFields(), BREAKDOWN_ORDER, breakdownBars() (+39 more)

### Community 6 - "package.json"
Cohesion: 0.04
Nodes (44): allowScripts, unrs-resolver, dependencies, next, react, react-dom, resend, @supabase/supabase-js (+36 more)

### Community 7 - "scan-universities.mjs"
Cohesion: 0.09
Nodes (41): args, callMammouthJson(), CATALOG_PATH, closeTruncatedJson(), crawlUniversity(), enqueue(), decodeHtml(), discoverUrls() (+33 more)

### Community 8 - "index.ts"
Cohesion: 0.13
Nodes (22): BlogPage(), metadata, revalidate, BlogSlugPage(), generateMetadata(), generateStaticParams(), Params, revalidate (+14 more)

### Community 9 - "universityScanImport.ts"
Cohesion: 0.09
Nodes (38): admin, catalog, ROOT, POST(), asScanCatalog(), buildAdmissionSummary(), canonicalUniversityKey(), compactRequirement() (+30 more)

### Community 10 - "inbound-email.ts"
Cohesion: 0.12
Nodes (31): asEmailContact(), asInboundPayload(), classifyInboundIntent(), detectFormule(), detectInterest(), EmailAddressLike, extractEmailAddress(), extractForwardedSender() (+23 more)

### Community 11 - "getAuthenticatedAdmin"
Cohesion: 0.17
Nodes (28): DELETE(), GET(), POST(), DELETE(), GET(), POST(), requireFullAdmin(), chineseCitiesFromCatalog() (+20 more)

### Community 12 - "generate-blog-posts.mjs"
Cohesion: 0.24
Nodes (11): BRIEFS, __dirname, extractJson(), generateOne(), loadExisting(), main(), mammouth(), MODELS (+3 more)

### Community 13 - "Row Level Security"
Cohesion: 0.18
Nodes (12): Sequential Scan, Indexes on WHERE and JOIN Columns, Partial Indexes, Idempotent Constraint Creation, pg_constraint Catalog, Index Foreign Key Columns, Principle of Least Privilege, auth.uid() RLS Policy (+4 more)

### Community 14 - "reportsLlm.ts"
Cohesion: 0.24
Nodes (10): extractJsonObject(), matchingLlm(), MatchingLlmInput, MatchingLlmResult, DualReportsInput, mergePolishedReports(), NO_GUARANTEE, stripGuarantees() (+2 more)

### Community 15 - "asString"
Cohesion: 0.15
Nodes (29): alreadySentIntentReply(), AUTO_REPLY_MARKER(), autoReplyMarker(), descriptionHasAutoMarker(), displayNameFromFrom(), EMAIL_INTENTS, EmailIntent, EmailIntentKey (+21 more)

### Community 16 - "university.ts"
Cohesion: 0.15
Nodes (19): asRecord(), filled(), normalizeUniversity(), reqFor(), resolveLanguageTuition(), toNumber(), unique(), UniversityRow (+11 more)

### Community 17 - "AdminMatchingPanel.tsx"
Cohesion: 0.08
Nodes (26): AdminMatchingPanel(), authedFetch(), BREAKDOWN_LABELS, CATEGORY_STYLES, KindTone, MatchingContact, MatchingResult, MatchingRun (+18 more)

### Community 18 - "enrich.ts"
Cohesion: 0.22
Nodes (18): asRecord(), CHINESE_LEVEL_TO_HSK, clamp(), computeQualityScore(), emptyIa(), englishFromIa(), enrichStudent(), extractMotivationSignals() (+10 more)

### Community 19 - "compilerOptions"
Cohesion: 0.11
Nodes (18): compilerOptions, allowJs, esModuleInterop, incremental, isolatedModules, jsx, lib, module (+10 more)

### Community 20 - "run.ts"
Cohesion: 0.12
Nodes (30): getFormuleAccess(), CATEGORY_META, CanonDoc, identifyGaps(), MatchingGap, monthsForHskGap(), groupMix(), Mixable (+22 more)

### Community 21 - "AdminUniversities.tsx"
Cohesion: 0.10
Nodes (22): toUniversityInsert(), UNIVERSITY_SEED, UniversitySeedRow, AdminUniversities(), AdmissionChips(), AdmissionExtra, AdmissionRequirement, chipClass() (+14 more)

### Community 22 - "Chinois en Devenir — brief pour agent IA"
Cohesion: 0.06
Nodes (38): AI Writing Detection, Em Dashes as AI Tell, Canonical Overrides Hreflang, Google Localized Versions Docs, Helpful Content System, International SEO Evidence, Next.js Sitemap Self-Reference Caveat, hreflang x-default (+30 more)

### Community 23 - "generate.ts"
Cohesion: 0.11
Nodes (28): asStringArray(), BLOG_CONVERSION_HREFS, BLOG_DAILY_LIMIT, BLOG_PILLARS, BLOG_TOPICS, BlogTopic, brief, catalog (+20 more)

### Community 24 - "contactRevenue.ts"
Cohesion: 0.12
Nodes (22): ADMIN_ROLE_LIMITED, assign, clear, contactAssignPatch(), ContactOwnerFields, contactUnassignPatch(), isAssignedTo(), normalizeAdminEmail() (+14 more)

### Community 25 - "languageProgramImport.ts"
Cohesion: 0.08
Nodes (60): crawlPresentation(), existingPatchSql(), fetchPage(), insertSql(), loadEnv(), main(), parseSource(), ROOT (+52 more)

### Community 26 - "blog/route.ts"
Cohesion: 0.21
Nodes (20): catalog(), DELETE(), GET(), maxDuration, PATCH(), POST(), staticRows(), listAllPosts() (+12 more)

### Community 27 - "StudentDashboard.tsx"
Cohesion: 0.07
Nodes (38): BUDGET_VALUES, EMPTY_FORM, INTAKE_VALUES, LeadForm(), LeadFormErrors, LeadFormProps, LeadFormStatus, LeadFormValues (+30 more)

### Community 28 - "adminRoles.ts"
Cohesion: 0.29
Nodes (10): AdminAuthResult, AdminRole, getAdminEmailAllowlist(), getFullAdminEmails(), getLimitedAdminEmails(), parseEmailSet(), resolveAdminRole(), getAdminAccess() (+2 more)

### Community 29 - "student.ts"
Cohesion: 0.12
Nodes (22): BUDGET_BANDS, categoryFromScore(), categoryKeyFromScore(), autumn, empty, libre, spring, diplomaToTargetDegree() (+14 more)

### Community 30 - "score.ts"
Cohesion: 0.15
Nodes (28): categoryMetaFromScore(), englishToIelts(), normalizeText(), priorityFromScore(), isCanonicalDocReceived(), clamp(), diplomaFitsTarget(), hardFilter() (+20 more)

### Community 31 - "Postgres Reference Writing Guidelines"
Cohesion: 0.17
Nodes (15): Concrete Transformation Patterns, Error-First Structure, Impact Level Guidelines, Quantified Impact, Self-Contained Examples, Semantic Naming, Postgres Reference Writing Guidelines, Query Performance (+7 more)

### Community 32 - "Choose the Right Index Type"
Cohesion: 0.13
Nodes (15): BRIN Index, B-tree Index, Choose the Right Index Type, GIN Index, GiST Index, Hash Index, PostgreSQL Index Types Documentation, Appropriate PostgreSQL Data Types (+7 more)

### Community 33 - "AdminI18nContext.tsx"
Cohesion: 0.17
Nodes (10): next, metadata, metadata, AdminI18nContext, AdminI18nProvider(), AdminI18nValue, interpolate(), isAdminLang() (+2 more)

### Community 34 - "Use Connection Pooling for All Applications"
Cohesion: 0.20
Nodes (14): Connection Management, Configure Idle Connection Timeouts, idle_session_timeout, Set Appropriate Connection Limits, max_connections, work_mem, Use Connection Pooling for All Applications, PgBouncer (+6 more)

### Community 35 - "SiteI18nContext.tsx"
Cohesion: 0.15
Nodes (17): interpolate(), isSiteLang(), lookup(), resolvePublicLang(), SiteI18nContext, SiteI18nProvider(), TranslateVars, en (+9 more)

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
Cohesion: 0.22
Nodes (10): AdminShell(), NavItem, useAdminAccess(), useAdminI18n(), ADMIN_LANGS, AdminCopy, AdminLang, adminTranslations (+2 more)

### Community 40 - "drip/route.ts"
Cohesion: 0.18
Nodes (14): Channel, gate(), GET(), isChannel(), POST(), TEXT_MAX, uniqueIds(), backlog (+6 more)

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

### Community 47 - "sitemap.check.ts"
Cohesion: 0.16
Nodes (14): dynamic, sitemap(), SITEMAP_ROUTES, buildSitemapEntries(), beforeBlog, blogIndex, entries, firstDay (+6 more)

### Community 48 - "formules.ts"
Cohesion: 0.13
Nodes (22): IncludeGroup, StudentFormules(), StudentFormulesProps, generateFormulesPresentationTemplate(), generateRelanceFormulesTemplate(), displayFormuleFootnote(), Formule, FORMULE_1_INCLUDES (+14 more)

### Community 49 - "chinese.ts"
Cohesion: 0.19
Nodes (21): CATEGORIES, categoryFromScore(), ChineseMatch, clamp(), filled(), intakeLabel(), languageCost(), languageFeeLines() (+13 more)

### Community 50 - "getSupabaseAdmin"
Cohesion: 0.13
Nodes (23): @supabase/supabase-js, alreadyRegistered(), AuthErrorLike, createConfirmedAuthUser(), emailNotConfirmed(), findAuthUserByEmail(), getSupabaseAnonServer(), signInAuthUser() (+15 more)

### Community 51 - "AdminDashboard.tsx"
Cohesion: 0.13
Nodes (19): onlyOne, rows, isMissingPriorityColumn(), isPrioritaire(), PriorityContact, priorityPatch(), sortPriorityFirst(), mergeFormuleNote() (+11 more)

### Community 52 - "Monitoring and Diagnostics"
Cohesion: 0.60
Nodes (5): Monitoring and Diagnostics, Use EXPLAIN ANALYZE to Diagnose Slow Queries, Enable pg_stat_statements for Query Analysis, Autovacuum Tuning, Maintain Table Statistics with VACUUM and ANALYZE

### Community 53 - "vercel.json"
Cohesion: 0.40
Nodes (4): buildCommand, crons, framework, $schema

### Community 54 - "studentProgress.ts"
Cohesion: 0.09
Nodes (26): clampDossierEtape(), DIPLOMA_DOC_KEYS, diplomaLevelFromStudent(), FORMULE_OPTION_PREFIX, getDisplayedStepIndex(), getPaidFormuleNumber(), getSchoolDocumentsIntro(), getStudentStepIndex() (+18 more)

### Community 56 - "dripQueue.ts"
Cohesion: 0.25
Nodes (13): GET(), isAuthorizedCron(), maxDuration, POST(), runCron(), logAction(), sendTemplatedEmail(), deliverDrip() (+5 more)

### Community 57 - "errorMessage"
Cohesion: 0.19
Nodes (13): OPTIONS, POST, handler(), updateContactStatus(), contactId(), createContactFromInbound(), findContactByEmail(), saveChosenFormule() (+5 more)

### Community 59 - "AdminAuthContext.tsx"
Cohesion: 0.21
Nodes (9): AdminAuthProvider, { AuthProvider, useScopedAuth }, StudentAuthProvider, AuthResult, createScopedAuth(), applySession(), AuthProvider(), emptyAuth (+1 more)

### Community 61 - "AdminDripSend.tsx"
Cohesion: 0.24
Nodes (11): AdminDripSend(), composeDraft(), launch(), load(), stopQueue(), authedFetch(), BulkContact, Channel (+3 more)

### Community 66 - "saleContract.ts"
Cohesion: 0.12
Nodes (35): POST(), AdminSendContract(), send(), updatePrestataire(), authedFetch(), ContractContact, fieldClass(), CONTACT_FROM_EMAIL (+27 more)

### Community 67 - "money.ts"
Cohesion: 0.11
Nodes (24): KEYS, StudentPaymentStatus(), formatEuros(), FORMULES, ALREADY, cfaBeside(), cfaBesideRange(), converted (+16 more)

### Community 68 - "contact-submit.ts"
Cohesion: 0.22
Nodes (13): OPTIONS, POST, DOMAINES_VALIDES, generateEmailTemplate(), handler(), isFilled(), mergeNotes(), pick() (+5 more)

### Community 69 - "resend/route.ts"
Cohesion: 0.36
Nodes (7): maxDuration, POST(), decodeWebhookSecret(), HeaderSource, headerValue(), signaturesMatch(), verifyResendWebhook()

### Community 70 - "openwa.ts"
Cohesion: 0.06
Nodes (61): main(), supabase, FIELD_LABELS, FieldKey, filled(), PATCH(), sameValue(), GET() (+53 more)

### Community 71 - "StudentMatching.tsx"
Cohesion: 0.17
Nodes (12): CRITERION_HELP, DOC_HELP, DocGroup, Matching, MatchingDoc, Reading, splitLabeled(), StudentMatching() (+4 more)

### Community 72 - "react"
Cohesion: 0.13
Nodes (17): react, GET(), AdminCapabilities, ProtectedRoute(), verify(), AdminAccessContext, AdminAccessProvider(), AdminCapabilities (+9 more)

### Community 73 - "request.ts"
Cohesion: 0.21
Nodes (19): POST(), missingAuthUser(), POST(), POST(), publicAuthError(), isValidEmail(), studentRecoveryEmailHtml(), ALLOWED_ORIGINS (+11 more)

### Community 75 - "AdminBulkWhatsapp.tsx"
Cohesion: 0.26
Nodes (11): AdminBulkWhatsapp(), addToBook(), composeDraft(), runOnRecipients(), sendBulk(), authedFetch(), BulkContact, BulkProgress (+3 more)

### Community 76 - "persist.check.ts"
Cohesion: 0.24
Nodes (8): assert(), main(), makeAdmin(), uni, uniOld, zh, MATCHING_KIND_CHINESE, MATCHING_KIND_UNIVERSITY

### Community 77 - "StudentSetPassword.tsx"
Cohesion: 0.32
Nodes (3): studentSupabase, StudentAuthCallback(), StudentSetPassword()

### Community 78 - "AdminStudentFiles.tsx"
Cohesion: 0.33
Nodes (6): AdminDoc, adminFetch(), AdminStudentFiles(), FilesPayload, RequiredDoc, RequiredFile

### Community 79 - "supabase.ts"
Cohesion: 0.11
Nodes (17): AdminBulkEmail(), composeDraft(), sendBulk(), AdminBulkEmailProps, authedFetch(), BulkContact, BulkProgress, AdminContactEmailThread() (+9 more)

### Community 81 - "StudentChineseMatching.tsx"
Cohesion: 0.33
Nodes (6): ChineseView, School, SchoolCard(), splitLabeled(), StudentChineseMatching(), TranslateFn

### Community 82 - "blog-generate/route.ts"
Cohesion: 0.53
Nodes (5): GET(), isAuthorizedCron(), maxDuration, POST(), runCron()

### Community 83 - "auto-reply.ts"
Cohesion: 0.11
Nodes (21): EMAIL_TEMPLATES, EmailContact, EmailTemplate, generateRelance1Template(), generateRelance2Template(), resend, supabase, ADMIN_NOTIFY_EMAIL (+13 more)

### Community 84 - "getFormuleNumber"
Cohesion: 0.18
Nodes (17): StudentFormuleBanner(), generateFormuleConfirmeeTemplate(), canonicalFormuleValue(), displayFormuleLabel(), displayFormulePrice(), getFormuleByNumber(), getFormuleNumber(), isMatchingPayloadAction() (+9 more)

### Community 85 - "AdminContactWhatsApp.tsx"
Cohesion: 0.31
Nodes (9): AdminContactWhatsApp(), composeWithAi(), loadCard(), run(), authedFetch(), localeFor(), ThreadMessage, WhatsappCard (+1 more)

### Community 86 - "TarifsPage.tsx"
Cohesion: 0.27
Nodes (17): FaqItem, FaqSection(), FaqSectionProps, Footer(), JsonLd(), JsonLdProps, Navigation(), BreadcrumbItem (+9 more)

### Community 92 - "useSiteI18n"
Cohesion: 0.09
Nodes (23): metadata, metadata, Hero(), HomeSeoContent(), NotFoundContent(), Stats(), StudentArrivalGuide(), useSiteI18n() (+15 more)

### Community 94 - "studentAuth.ts"
Cohesion: 0.21
Nodes (20): POST(), GET(), filled(), PATCH(), getUnlockedStudentAccess(), chineseMatchingForStudent(), matchingForStudent(), AuthErrorResult (+12 more)

## Ambiguous Edges - Review These
- `Next.js Agent Rules` → `React Vite Template README`  [AMBIGUOUS]
  README.md · relation: conceptually_related_to

## Knowledge Gaps
- **531 isolated node(s):** `eslintConfig`, `securityHeaders`, `nextConfig`, `name`, `private` (+526 more)
  These have ≤1 connection - possible missing edges or undocumented components. (Counts symbols only; 612 node(s) total have ≤1 connection when file, concept and rationale nodes are included.)
- **7 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **What is the exact relationship between `Next.js Agent Rules` and `React Vite Template README`?**
  _Edge tagged AMBIGUOUS (relation: conceptually_related_to) - confidence is low._
- **Why does `react` connect `react` to `seo.ts`, `emailTemplateDrafts.ts`, `package.json`, `AdminMatchingPanel.tsx`, `AdminUniversities.tsx`, `StudentDashboard.tsx`, `AdminI18nContext.tsx`, `SiteI18nContext.tsx`, `useAdminI18n`, `AdminContactInfo.tsx`, `AdminChineseMatchingPanel.tsx`, `AdminDashboard.tsx`, `AdminAuthContext.tsx`, `AdminDripSend.tsx`, `saleContract.ts`, `StudentMatching.tsx`, `AdminBulkWhatsapp.tsx`, `StudentSetPassword.tsx`, `AdminStudentFiles.tsx`, `supabase.ts`, `StudentChineseMatching.tsx`, `AdminContactWhatsApp.tsx`, `TarifsPage.tsx`, `useSiteI18n`?**
  _High betweenness centrality (0.065) - this node is a cross-community bridge._
- **Why does `errorMessage()` connect `errorMessage` to `formules-relance.ts`, `emailTemplateDrafts.ts`, `inbound-email.ts`, `getAuthenticatedAdmin`, `AdminMatchingPanel.tsx`, `AdminUniversities.tsx`, `blog/route.ts`, `StudentDashboard.tsx`, `AdminContactInfo.tsx`, `AdminChineseMatchingPanel.tsx`, `getSupabaseAdmin`, `dripQueue.ts`, `AdminDripSend.tsx`, `saleContract.ts`, `contact-submit.ts`, `react`, `request.ts`, `AdminBulkWhatsapp.tsx`, `StudentSetPassword.tsx`, `AdminStudentFiles.tsx`, `supabase.ts`, `auto-reply.ts`, `AdminContactWhatsApp.tsx`, `studentAuth.ts`?**
  _High betweenness centrality (0.053) - this node is a cross-community bridge._
- **Why does `@supabase/supabase-js` connect `getSupabaseAdmin` to `openwa.ts`, `useAdminI18n`, `package.json`, `universityScanImport.ts`, `request.ts`, `supabase.ts`, `languageProgramImport.ts`, `AdminAuthContext.tsx`, `studentAuth.ts`?**
  _High betweenness centrality (0.033) - this node is a cross-community bridge._
- **What connects `eslintConfig`, `securityHeaders`, `nextConfig` to the rest of the system?**
  _531 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `seo.ts` be split into smaller, more focused modules?**
  _Cohesion score 0.053613053613053616 - nodes in this community are weakly interconnected._
- **Should `studentDocuments.ts` be split into smaller, more focused modules?**
  _Cohesion score 0.10726950354609929 - nodes in this community are weakly interconnected._