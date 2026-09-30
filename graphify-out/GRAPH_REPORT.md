# Graph Report - chinoisendevenir  (2026-09-30)

## Corpus Check
- 333 files · ~414,724 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 1689 nodes · 4280 edges · 97 communities (83 shown, 12 thin omitted)
- Extraction: 98% EXTRACTED · 2% INFERRED · 0% AMBIGUOUS · INFERRED: 79 edges (avg confidence: 0.85)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `4db85b23`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- seo.ts
- studentDocuments.ts
- emailCompose.ts
- errorMessage
- emailTemplateDrafts.ts
- reports.ts
- package.json
- scan-universities.mjs
- index.ts
- universityScanImport.ts
- inbound-email.ts
- suiviStatuts.ts
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
- opengraph-image.tsx
- contactRevenue.ts
- languageProgramImport.ts
- LeadForm.tsx
- StudentDashboard.tsx
- studentAuth.ts
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
- supabaseAdmin.ts
- AdminDashboard.tsx
- Monitoring and Diagnostics
- vercel.json
- studentProgress.ts
- next.config.mjs
- apple-icon.tsx
- icon.tsx
- about/page.tsx
- app/layout.tsx
- Find Skills
- buildDualReports
- Lowercase snake_case Identifiers
- Dependabot npm Weekly Updates
- saleContract.ts
- money.ts
- contact-submit.ts
- resend/route.ts
- openwa.ts
- devDependencies
- ProtectedRoute.tsx
- recover/route.ts
- next-env.d.ts
- semantic.ts
- scripts
- dependencies
- adminSupabase
- AdminContactEmailThread.tsx
- eslint.config.mjs
- next
- allowScripts
- auto-reply.ts
- displayFormulePrice
- AdminContactWhatsApp.tsx
- react
- countries.ts
- getSupabaseAdmin
- request.ts
- contactOwner.ts
- mapUniversity
- useSiteI18n
- engines
- getChosenFormule
- formules-relance/route.ts
- robots.ts

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

## Communities (97 total, 12 thin omitted)

### Community 0 - "seo.ts"
Cohesion: 0.13
Nodes (31): metadata, metadata, metadata, metadata, metadata, metadata, metadata, JsonLd() (+23 more)

### Community 1 - "studentDocuments.ts"
Cohesion: 0.06
Nodes (82): GET(), POST(), GET(), POST(), DELETE(), GET(), loadFiles(), POST() (+74 more)

### Community 2 - "emailCompose.ts"
Cohesion: 0.09
Nodes (36): BulkTopic, ComposeContact, ComposeResult, isBulkTopic(), POST(), uniqueIds(), BULK_AI_TOPIC_KEYS, BULK_AI_TOPICS (+28 more)

### Community 3 - "errorMessage"
Cohesion: 0.23
Nodes (15): OPTIONS, POST, handler(), logAction(), sendTemplatedEmail(), updateContactStatus(), actionTime(), getSupabase() (+7 more)

### Community 4 - "emailTemplateDrafts.ts"
Cohesion: 0.11
Nodes (22): AdminBulkEmail(), composeDraft(), sendBulk(), AdminBulkEmailProps, AI_TOPICS, authedFetch(), BulkContact, BulkProgress (+14 more)

### Community 5 - "reports.ts"
Cohesion: 0.12
Nodes (23): analysisNote(), blankOr(), BREAKDOWN_ORDER, DEGREE_LABELS, degreeLabel(), degreePhrase(), DIPLOMA_LABELS, diplomaLabel() (+15 more)

### Community 6 - "package.json"
Cohesion: 0.13
Nodes (14): name, private, version, eslint, eslint-config-next, react-dom, resend, tailwindcss (+6 more)

### Community 7 - "scan-universities.mjs"
Cohesion: 0.09
Nodes (41): args, callMammouthJson(), CATALOG_PATH, closeTruncatedJson(), crawlUniversity(), enqueue(), decodeHtml(), discoverUrls() (+33 more)

### Community 8 - "index.ts"
Cohesion: 0.11
Nodes (24): BlogPage(), metadata, revalidate, BlogSlugPage(), generateMetadata(), generateStaticParams(), Params, revalidate (+16 more)

### Community 9 - "universityScanImport.ts"
Cohesion: 0.09
Nodes (37): admin, catalog, ROOT, asScanCatalog(), buildAdmissionSummary(), canonicalUniversityKey(), compactRequirement(), dedupeScanProfiles() (+29 more)

### Community 10 - "inbound-email.ts"
Cohesion: 0.10
Nodes (36): asEmailContact(), asInboundPayload(), classifyInboundIntent(), contactId(), createContactFromInbound(), detectFormule(), detectInterest(), EmailAddressLike (+28 more)

### Community 11 - "suiviStatuts.ts"
Cohesion: 0.17
Nodes (11): CANONICAL_TO_STORED_STATUT, EARLY_STATUSES, FORMULE_ALREADY_CHOSEN, FORMULES_AWAITING_REPLY, LEGACY_STATUT_MAP, PAID_STATUSES, STATUS_RANK, STATUT_COLORS (+3 more)

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
Cohesion: 0.15
Nodes (19): asRecord(), filled(), normalizeUniversity(), reqFor(), toNumber(), unique(), UniversityRow, yearlyLivingCost() (+11 more)

### Community 17 - "AdminMatchingReport.tsx"
Cohesion: 0.14
Nodes (14): AdminMatchingReport(), AdminReport, CheckGroup, CheckGroups(), dedupedRisks(), FACTOR_LABELS, FieldNote, followKey() (+6 more)

### Community 18 - "enrich.ts"
Cohesion: 0.17
Nodes (22): asRecord(), CHINESE_LEVEL_TO_HSK, clamp(), computeQualityScore(), emptyIa(), englishFromIa(), enrichStudent(), extractMotivationSignals() (+14 more)

### Community 19 - "compilerOptions"
Cohesion: 0.11
Nodes (18): compilerOptions, allowJs, esModuleInterop, incremental, isolatedModules, jsx, lib, module (+10 more)

### Community 20 - "run.ts"
Cohesion: 0.15
Nodes (23): getFormuleAccess(), identifyGaps(), MatchingGap, monthsForHskGap(), groupMix(), Mixable, selectMix(), takeFrom() (+15 more)

### Community 21 - "AdminUniversities.tsx"
Cohesion: 0.10
Nodes (22): toUniversityInsert(), UNIVERSITY_SEED, UniversitySeedRow, AdminUniversities(), AdmissionChips(), AdmissionExtra, AdmissionRequirement, chipClass() (+14 more)

### Community 22 - "Chinois en Devenir — brief pour agent IA"
Cohesion: 0.06
Nodes (38): AI Writing Detection, Em Dashes as AI Tell, Canonical Overrides Hreflang, Google Localized Versions Docs, Helpful Content System, International SEO Evidence, Next.js Sitemap Self-Reference Caveat, hreflang x-default (+30 more)

### Community 23 - "opengraph-image.tsx"
Cohesion: 0.40
Nodes (3): alt, contentType, size

### Community 24 - "contactRevenue.ts"
Cohesion: 0.21
Nodes (11): ADMIN_ROLE_LIMITED, owner, split, formuleAmountEuros(), FULL_SHARE, isPaidContact(), LIMITED_SHARE, RevenueContact (+3 more)

### Community 25 - "languageProgramImport.ts"
Cohesion: 0.09
Nodes (53): crawlPresentation(), existingPatchSql(), fetchPage(), insertSql(), loadEnv(), main(), parseCsv(), ROOT (+45 more)

### Community 26 - "LeadForm.tsx"
Cohesion: 0.19
Nodes (15): BUDGET_VALUES, EMPTY_FORM, INTAKE_VALUES, LeadForm(), LeadFormErrors, LeadFormProps, LeadFormStatus, LeadFormValues (+7 more)

### Community 27 - "StudentDashboard.tsx"
Cohesion: 0.06
Nodes (32): BreakdownRow, ChineseView, School, StudentChineseMatching(), TranslateFn, DocGroup, GrantGroup, Matching (+24 more)

### Community 28 - "studentAuth.ts"
Cohesion: 0.19
Nodes (18): AdminAuthResult, AdminRole, getAdminEmailAllowlist(), getFullAdminEmails(), getLimitedAdminEmails(), parseEmailSet(), resolveAdminRole(), getUnlockedStudentAccess() (+10 more)

### Community 29 - "student.ts"
Cohesion: 0.15
Nodes (20): BUDGET_BANDS, autumn, empty, libre, spring, diplomaToTargetDegree(), DOMAIN_FAMILIES, DOMAIN_KEYS (+12 more)

### Community 30 - "score.ts"
Cohesion: 0.19
Nodes (19): categoryMetaFromScore(), priorityFromScore(), isCanonicalDocReceived(), clamp(), diplomaFitsTarget(), hardFilter(), intakeTooFar(), matchUniversity() (+11 more)

### Community 31 - "Postgres Reference Writing Guidelines"
Cohesion: 0.17
Nodes (15): Concrete Transformation Patterns, Error-First Structure, Impact Level Guidelines, Quantified Impact, Self-Contained Examples, Semantic Naming, Postgres Reference Writing Guidelines, Query Performance (+7 more)

### Community 32 - "Choose the Right Index Type"
Cohesion: 0.13
Nodes (15): BRIN Index, B-tree Index, Choose the Right Index Type, GIN Index, GiST Index, Hash Index, PostgreSQL Index Types Documentation, Appropriate PostgreSQL Data Types (+7 more)

### Community 33 - "AdminI18nContext.tsx"
Cohesion: 0.15
Nodes (15): metadata, AdminShell(), NavItem, useAdminAccess(), AdminI18nContext, AdminI18nProvider(), AdminI18nValue, interpolate() (+7 more)

### Community 34 - "Use Connection Pooling for All Applications"
Cohesion: 0.20
Nodes (14): Connection Management, Configure Idle Connection Timeouts, idle_session_timeout, Set Appropriate Connection Limits, max_connections, work_mem, Use Connection Pooling for All Applications, PgBouncer (+6 more)

### Community 35 - "SiteI18nContext.tsx"
Cohesion: 0.16
Nodes (20): interpolate(), isSiteLang(), lookup(), SiteI18nContext, SiteI18nProvider(), TranslateVars, en, fr (+12 more)

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
Cohesion: 0.15
Nodes (12): AdminMatchingPanel(), authedFetch(), BREAKDOWN_LABELS, CATEGORY_STYLES, KindTone, MatchingContact, MatchingResult, MatchingRun (+4 more)

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
Cohesion: 0.12
Nodes (24): IncludeGroup, StudentFormules(), StudentFormulesProps, generateFormulesPresentationTemplate(), displayFormuleFootnote(), Formule, FORMULE_1_INCLUDES, FORMULE_1_VALUE (+16 more)

### Community 49 - "chinese.ts"
Cohesion: 0.20
Nodes (19): CATEGORIES, categoryFromScore(), ChineseMatch, clamp(), costLabel(), filled(), intakeLabel(), languageCost() (+11 more)

### Community 50 - "supabaseAdmin.ts"
Cohesion: 0.24
Nodes (12): @supabase/supabase-js, alreadyRegistered(), AuthErrorLike, createConfirmedAuthUser(), emailNotConfirmed(), findAuthUserByEmail(), getSupabaseAnonServer(), signInAuthUser() (+4 more)

### Community 51 - "AdminDashboard.tsx"
Cohesion: 0.14
Nodes (16): onlyOne, rows, isMissingPriorityColumn(), isPrioritaire(), PriorityContact, priorityPatch(), sortPriorityFirst(), formatEuros() (+8 more)

### Community 52 - "Monitoring and Diagnostics"
Cohesion: 0.60
Nodes (5): Monitoring and Diagnostics, Use EXPLAIN ANALYZE to Diagnose Slow Queries, Enable pg_stat_statements for Query Analysis, Autovacuum Tuning, Maintain Table Statistics with VACUUM and ANALYZE

### Community 53 - "vercel.json"
Cohesion: 0.40
Nodes (4): buildCommand, crons, framework, $schema

### Community 54 - "studentProgress.ts"
Cohesion: 0.14
Nodes (19): clampDossierEtape(), ContactRow, DIPLOMA_DOC_KEYS, diplomaLevelFromStudent(), FORMULE_OPTION_PREFIX, getDisplayedStepIndex(), getPaidFormuleNumber(), getSchoolDocumentsIntro() (+11 more)

### Community 59 - "app/layout.tsx"
Cohesion: 0.15
Nodes (14): metadata, RootLayout(), Providers(), AdminAuthProvider, { AuthProvider, useScopedAuth }, StudentAuthProvider, AuthResult, createScopedAuth() (+6 more)

### Community 61 - "buildDualReports"
Cohesion: 0.18
Nodes (16): adminGuideline(), applicationCap(), applicationMixAdvice(), blockingFields(), buildDualReports(), closingText(), detectLimitingFactor(), draftClientResponse() (+8 more)

### Community 66 - "saleContract.ts"
Cohesion: 0.11
Nodes (32): AdminSendContract(), send(), updatePrestataire(), authedFetch(), ContractContact, fieldClass(), generateRelanceFormulesTemplate(), escapeHtml() (+24 more)

### Community 67 - "money.ts"
Cohesion: 0.14
Nodes (21): ALREADY, cfaBeside(), cfaBesideRange(), converted, twice, CURRENCY, EUR_TO_FCFA, eurosToFcfa() (+13 more)

### Community 68 - "contact-submit.ts"
Cohesion: 0.24
Nodes (11): OPTIONS, POST, DOMAINES_VALIDES, generateEmailTemplate(), handler(), isFilled(), mergeNotes(), pick() (+3 more)

### Community 69 - "resend/route.ts"
Cohesion: 0.36
Nodes (7): maxDuration, POST(), decodeWebhookSecret(), HeaderSource, headerValue(), signaturesMatch(), verifyResendWebhook()

### Community 70 - "openwa.ts"
Cohesion: 0.10
Nodes (38): GET(), GET(), guard(), POST(), ChatLike, ids, phones, sorted (+30 more)

### Community 71 - "devDependencies"
Cohesion: 0.20
Nodes (10): devDependencies, eslint, eslint-config-next, @eslint/eslintrc, tailwindcss, @tailwindcss/postcss, @types/node, @types/react (+2 more)

### Community 72 - "ProtectedRoute.tsx"
Cohesion: 0.19
Nodes (9): GET(), AdminCapabilities, verify(), AdminAccessContext, AdminAccessProvider(), AdminCapabilities, FULL_ACCESS, ADMIN_ROLE_FULL (+1 more)

### Community 73 - "recover/route.ts"
Cohesion: 0.23
Nodes (18): POST(), missingAuthUser(), POST(), POST(), publicAuthError(), isValidEmail(), studentRecoveryEmailHtml(), ALLOWED_ORIGINS (+10 more)

### Community 75 - "semantic.ts"
Cohesion: 0.46
Nodes (7): DomainSimilarity, familyOf(), jaccard(), studentTokens(), tokenize(), universityTokens(), DOMAIN_SIMILARITY_MIN

### Community 76 - "scripts"
Cohesion: 0.25
Nodes (8): scripts, build, dev, import:universities, lint, scan:universities, start, test

### Community 77 - "dependencies"
Cohesion: 0.29
Nodes (7): dependencies, next, react, react-dom, resend, @supabase/supabase-js, @vercel/speed-insights

### Community 78 - "adminSupabase"
Cohesion: 0.29
Nodes (7): AdminDoc, adminFetch(), AdminStudentFiles(), FilesPayload, RequiredDoc, RequiredFile, adminSupabase

### Community 79 - "AdminContactEmailThread.tsx"
Cohesion: 0.47
Nodes (5): AdminContactEmailThread(), load(), formatWhen(), localeFor(), ContactEmailRow

### Community 80 - "eslint.config.mjs"
Cohesion: 0.50
Nodes (3): compat, eslintConfig, @eslint/eslintrc

### Community 83 - "auto-reply.ts"
Cohesion: 0.09
Nodes (29): AdminContactEmail(), composeWithAi(), sendEmail(), authedFetch(), EmailContact, fieldClass(), EMAIL_TEMPLATES, EmailContact (+21 more)

### Community 84 - "displayFormulePrice"
Cohesion: 0.33
Nodes (11): StudentFormuleBanner(), canonicalFormuleValue(), displayFormuleLabel(), displayFormulePrice(), getFormuleByNumber(), getFormuleNumber(), formulaLabel(), FormulaInfo (+3 more)

### Community 85 - "AdminContactWhatsApp.tsx"
Cohesion: 0.33
Nodes (8): AdminContactWhatsApp(), loadCard(), run(), authedFetch(), localeFor(), ThreadMessage, WhatsappCard, WhatsappContact

### Community 86 - "react"
Cohesion: 0.11
Nodes (17): react, metadata, metadata, metadata, Footer(), Navigation(), NotFoundContent(), StudentProtectedRoute() (+9 more)

### Community 87 - "countries.ts"
Cohesion: 0.17
Nodes (13): main(), supabase, FIELD_LABELS, FieldKey, filled(), PATCH(), sameValue(), ALIASES (+5 more)

### Community 88 - "getSupabaseAdmin"
Cohesion: 0.23
Nodes (11): ContactEmailDirection, ContactEmailInput, listContactEmails(), markContactEmailsRead(), normalizeEmail(), storeContactEmail(), storeInboundContactEmail(), storeOutboundContactEmail() (+3 more)

### Community 89 - "request.ts"
Cohesion: 0.38
Nodes (7): POST(), filled(), PATCH(), emailHtmlToText(), readJsonObject(), clientReady(), prestataireReady()

### Community 90 - "contactOwner.ts"
Cohesion: 0.29
Nodes (9): assign, clear, contactAssignPatch(), ContactOwnerFields, contactUnassignPatch(), isAssignedTo(), normalizeAdminEmail(), shortAdminLabel() (+1 more)

### Community 91 - "mapUniversity"
Cohesion: 0.24
Nodes (11): breakdownBars(), categoryOf(), costOf(), deadlineOf(), factLines(), mapUniversity(), scorePhrase(), sentence() (+3 more)

### Community 92 - "useSiteI18n"
Cohesion: 0.16
Nodes (12): metadata, metadata, FaqItem, FaqSection(), FaqSectionProps, Hero(), HomeSeoContent(), Stats() (+4 more)

### Community 94 - "getChosenFormule"
Cohesion: 0.51
Nodes (9): POST(), publicStudentProfile(), canStudentChooseFormule(), getChosenFormule(), getGrantedFormuleNumber(), hasFilledLeadForm(), isStudentAccessGranted(), isStudentSpaceUnlocked() (+1 more)

### Community 95 - "formules-relance/route.ts"
Cohesion: 0.53
Nodes (5): GET(), isAuthorizedCron(), maxDuration, POST(), runCron()

## Ambiguous Edges - Review These
- `Next.js Agent Rules` → `React Vite Template README`  [AMBIGUOUS]
  README.md · relation: conceptually_related_to

## Knowledge Gaps
- **469 isolated node(s):** `compat`, `eslintConfig`, `securityHeaders`, `nextConfig`, `name` (+464 more)
  These have ≤1 connection - possible missing edges or undocumented components. (Counts symbols only; 538 node(s) total have ≤1 connection when file, concept and rationale nodes are included.)
- **12 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **What is the exact relationship between `Next.js Agent Rules` and `React Vite Template README`?**
  _Edge tagged AMBIGUOUS (relation: conceptually_related_to) - confidence is low._
- **Why does `react` connect `react` to `emailTemplateDrafts.ts`, `package.json`, `AdminMatchingReport.tsx`, `AdminUniversities.tsx`, `LeadForm.tsx`, `StudentDashboard.tsx`, `AdminI18nContext.tsx`, `SiteI18nContext.tsx`, `useAdminI18n`, `AdminMatchingPanel.tsx`, `AdminContactInfo.tsx`, `AdminChineseMatchingPanel.tsx`, `AdminDashboard.tsx`, `app/layout.tsx`, `saleContract.ts`, `ProtectedRoute.tsx`, `adminSupabase`, `AdminContactEmailThread.tsx`, `next`, `auto-reply.ts`, `AdminContactWhatsApp.tsx`, `useSiteI18n`?**
  _High betweenness centrality (0.069) - this node is a cross-community bridge._
- **Why does `@supabase/supabase-js` connect `supabaseAdmin.ts` to `AdminI18nContext.tsx`, `package.json`, `universityScanImport.ts`, `react`, `countries.ts`, `languageProgramImport.ts`, `app/layout.tsx`, `studentAuth.ts`?**
  _High betweenness centrality (0.054) - this node is a cross-community bridge._
- **Why does `errorMessage()` connect `errorMessage` to `studentDocuments.ts`, `saleContract.ts`, `emailTemplateDrafts.ts`, `contact-submit.ts`, `AdminMatchingPanel.tsx`, `inbound-email.ts`, `AdminContactInfo.tsx`, `AdminChineseMatchingPanel.tsx`, `adminSupabase`, `supabaseAdmin.ts`, `auto-reply.ts`, `AdminContactWhatsApp.tsx`, `AdminUniversities.tsx`, `react`, `request.ts`, `StudentDashboard.tsx`, `useSiteI18n`?**
  _High betweenness centrality (0.042) - this node is a cross-community bridge._
- **What connects `compat`, `eslintConfig`, `securityHeaders` to the rest of the system?**
  _469 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `seo.ts` be split into smaller, more focused modules?**
  _Cohesion score 0.12979591836734694 - nodes in this community are weakly interconnected._
- **Should `studentDocuments.ts` be split into smaller, more focused modules?**
  _Cohesion score 0.057195149851292613 - nodes in this community are weakly interconnected._