# Graph Report - chinoisendevenir  (2026-09-30)

## Corpus Check
- 333 files · ~414,648 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 1688 nodes · 4279 edges · 94 communities (80 shown, 12 thin omitted)
- Extraction: 98% EXTRACTED · 2% INFERRED · 0% AMBIGUOUS · INFERRED: 79 edges (avg confidence: 0.85)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `0ac4c043`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- useSiteI18n
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
- seo.ts
- contactRevenue.ts
- languageProgramImport.ts
- LeadForm.tsx
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
- AdminLogin.tsx
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
- recover/route.ts
- next-env.d.ts
- semantic.ts
- scripts
- dependencies
- adminSupabase
- useAdminI18n
- eslint.config.mjs
- next
- allowScripts
- auto-reply.ts
- TarifsPage.tsx
- AdminContactWhatsApp.tsx
- Navigation.tsx
- countries.ts
- getSupabaseAdmin
- request.ts
- AdminContactEmail.tsx
- mapUniversity
- HomePage.tsx
- engines

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

## Communities (94 total, 12 thin omitted)

### Community 0 - "useSiteI18n"
Cohesion: 0.13
Nodes (30): metadata, metadata, metadata, metadata, metadata, metadata, metadata, FaqItem (+22 more)

### Community 1 - "studentDocuments.ts"
Cohesion: 0.07
Nodes (74): GET(), POST(), POST(), DELETE(), GET(), loadFiles(), POST(), GET() (+66 more)

### Community 2 - "emailCompose.ts"
Cohesion: 0.09
Nodes (35): BulkTopic, ComposeContact, ComposeResult, isBulkTopic(), POST(), uniqueIds(), BULK_AI_TOPIC_KEYS, BULK_AI_TOPICS (+27 more)

### Community 3 - "errorMessage"
Cohesion: 0.19
Nodes (19): GET(), isAuthorizedCron(), maxDuration, POST(), runCron(), handler(), logAction(), sendTemplatedEmail() (+11 more)

### Community 4 - "emailTemplateDrafts.ts"
Cohesion: 0.12
Nodes (20): AdminBulkEmail(), composeDraft(), sendBulk(), AdminBulkEmailProps, AI_TOPICS, authedFetch(), BulkContact, BulkProgress (+12 more)

### Community 5 - "reports.ts"
Cohesion: 0.11
Nodes (24): isCanonicalDocReceived(), analysisNote(), BREAKDOWN_ORDER, DEGREE_LABELS, degreeLabel(), degreePhrase(), DIPLOMA_LABELS, diplomaLabel() (+16 more)

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
Cohesion: 0.08
Nodes (40): admin, catalog, ROOT, GET(), POST(), requireFullAdmin(), asScanCatalog(), buildAdmissionSummary() (+32 more)

### Community 10 - "inbound-email.ts"
Cohesion: 0.10
Nodes (37): asEmailContact(), asInboundPayload(), classifyInboundIntent(), contactId(), createContactFromInbound(), detectFormule(), detectInterest(), EmailAddressLike (+29 more)

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
Cohesion: 0.16
Nodes (28): alreadySentIntentReply(), AUTO_REPLY_MARKER(), autoReplyMarker(), descriptionHasAutoMarker(), displayNameFromFrom(), EMAIL_INTENTS, EmailIntentKey, extractPersonName() (+20 more)

### Community 16 - "weights.ts"
Cohesion: 0.18
Nodes (16): asRecord(), filled(), normalizeUniversity(), reqFor(), toNumber(), unique(), yearlyLivingCost(), CATEGORY_THRESHOLDS (+8 more)

### Community 17 - "AdminMatchingReport.tsx"
Cohesion: 0.14
Nodes (14): AdminMatchingReport(), AdminReport, CheckGroup, CheckGroups(), dedupedRisks(), FACTOR_LABELS, FieldNote, followKey() (+6 more)

### Community 18 - "enrich.ts"
Cohesion: 0.16
Nodes (22): asRecord(), CHINESE_LEVEL_TO_HSK, clamp(), computeQualityScore(), emptyIa(), englishFromIa(), enrichStudent(), extractMotivationSignals() (+14 more)

### Community 19 - "compilerOptions"
Cohesion: 0.11
Nodes (18): compilerOptions, allowJs, esModuleInterop, incremental, isolatedModules, jsx, lib, module (+10 more)

### Community 20 - "run.ts"
Cohesion: 0.12
Nodes (30): getFormuleAccess(), CATEGORY_META, categoryFromScore(), categoryKeyFromScore(), CanonDoc, identifyGaps(), MatchingGap, monthsForHskGap() (+22 more)

### Community 21 - "AdminUniversities.tsx"
Cohesion: 0.10
Nodes (22): toUniversityInsert(), UNIVERSITY_SEED, UniversitySeedRow, AdminUniversities(), AdmissionChips(), AdmissionExtra, AdmissionRequirement, chipClass() (+14 more)

### Community 22 - "Chinois en Devenir — brief pour agent IA"
Cohesion: 0.06
Nodes (38): AI Writing Detection, Em Dashes as AI Tell, Canonical Overrides Hreflang, Google Localized Versions Docs, Helpful Content System, International SEO Evidence, Next.js Sitemap Self-Reference Caveat, hreflang x-default (+30 more)

### Community 23 - "seo.ts"
Cohesion: 0.12
Nodes (18): metadata, metadata, RootLayout(), alt, contentType, size, metadata, AI_BOTS (+10 more)

### Community 24 - "contactRevenue.ts"
Cohesion: 0.11
Nodes (23): ADMIN_ROLE_LIMITED, assign, clear, contactAssignPatch(), ContactOwnerFields, contactUnassignPatch(), isAssignedTo(), normalizeAdminEmail() (+15 more)

### Community 25 - "languageProgramImport.ts"
Cohesion: 0.09
Nodes (53): crawlPresentation(), existingPatchSql(), fetchPage(), insertSql(), loadEnv(), main(), parseCsv(), ROOT (+45 more)

### Community 26 - "LeadForm.tsx"
Cohesion: 0.19
Nodes (17): BUDGET_VALUES, EMPTY_FORM, INTAKE_VALUES, LeadForm(), LeadFormErrors, LeadFormProps, LeadFormStatus, LeadFormValues (+9 more)

### Community 27 - "StudentDashboard.tsx"
Cohesion: 0.09
Nodes (25): BreakdownRow, ChineseView, School, StudentChineseMatching(), TranslateFn, StudentVisaDocuments(), en, fr (+17 more)

### Community 28 - "adminRoles.ts"
Cohesion: 0.23
Nodes (12): GET(), AdminAuthResult, adminCapabilities(), AdminRole, getAdminEmailAllowlist(), getFullAdminEmails(), getLimitedAdminEmails(), parseEmailSet() (+4 more)

### Community 29 - "student.ts"
Cohesion: 0.19
Nodes (17): BUDGET_BANDS, autumn, empty, spring, diplomaToTargetDegree(), englishToIelts(), englishToToefl(), EUR_TO_CNY (+9 more)

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
Nodes (13): metadata, NavItem, AdminI18nContext, AdminI18nProvider(), AdminI18nValue, interpolate(), isAdminLang(), lookup() (+5 more)

### Community 34 - "Use Connection Pooling for All Applications"
Cohesion: 0.20
Nodes (14): Connection Management, Configure Idle Connection Timeouts, idle_session_timeout, Set Appropriate Connection Limits, max_connections, work_mem, Use Connection Pooling for All Applications, PgBouncer (+6 more)

### Community 35 - "SiteI18nContext.tsx"
Cohesion: 0.22
Nodes (15): interpolate(), isSiteLang(), lookup(), SiteI18nContext, SiteI18nProvider(), TranslateVars, SiteLang, siteTranslations (+7 more)

### Community 36 - "scrapling-crawl-universities.py"
Cohesion: 0.28
Nodes (11): Namespace, allowed_domains_for(), crawl_university(), load_targets(), main(), make_spider_class(), __init__(), parse() (+3 more)

### Community 37 - "Chinois en Devenir Agency"
Cohesion: 0.23
Nodes (13): Chinois en Devenir, No Guarantee Policy, Chinois en Devenir, CSC Scholarships, Chinese Language Year, Chinois en Devenir Agency, China Scholarship Council, JW201 JW202 Forms (+5 more)

### Community 38 - "SVG Icon Sprite Sheet"
Cohesion: 0.38
Nodes (13): Bluesky Clip Path, Bluesky Icon, Dark Brand Fill #08060d, Discord Icon, Documentation Icon, GitHub Icon, Purple Accent Stroke #aa3bff, Social Brand Marks (+5 more)

### Community 40 - "AdminMatchingPanel.tsx"
Cohesion: 0.15
Nodes (13): AdminMatchingPanel(), authedFetch(), BREAKDOWN_LABELS, CATEGORY_STYLES, KindTone, MatchingContact, MatchingResult, MatchingRun (+5 more)

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
Nodes (26): StudentFormuleBanner(), useAdminAccess(), generateRelanceFormulesTemplate(), formuleFactsForPrompt(), canonicalFormuleValue(), displayFormuleLabel(), displayFormulePrice(), EXTRA_FEES (+18 more)

### Community 49 - "chinese.ts"
Cohesion: 0.17
Nodes (22): CATEGORIES, categoryFromScore(), chineseCitiesFromCatalog(), ChineseMatch, clamp(), costLabel(), filled(), intakeLabel() (+14 more)

### Community 50 - "supabaseAdmin.ts"
Cohesion: 0.22
Nodes (14): @supabase/supabase-js, POST(), AuthErrorLike, emailNotConfirmed(), findAuthUserByEmail(), getSupabaseAnonServer(), publicAuthError(), signInAuthUser() (+6 more)

### Community 51 - "AdminDashboard.tsx"
Cohesion: 0.11
Nodes (22): onlyOne, rows, isMissingPriorityColumn(), isPrioritaire(), PriorityContact, priorityPatch(), sortPriorityFirst(), isInboxPending() (+14 more)

### Community 52 - "Monitoring and Diagnostics"
Cohesion: 0.60
Nodes (5): Monitoring and Diagnostics, Use EXPLAIN ANALYZE to Diagnose Slow Queries, Enable pg_stat_statements for Query Analysis, Autovacuum Tuning, Maintain Table Statistics with VACUUM and ANALYZE

### Community 53 - "vercel.json"
Cohesion: 0.40
Nodes (4): buildCommand, crons, framework, $schema

### Community 54 - "studentProgress.ts"
Cohesion: 0.18
Nodes (26): POST(), getUnlockedStudentAccess(), AuthErrorResult, ensureStudentContact(), filled(), publicStudentProfile(), canStudentChooseFormule(), clampDossierEtape() (+18 more)

### Community 59 - "react"
Cohesion: 0.12
Nodes (16): react, Providers(), AdminAuthProvider, { AuthProvider, useScopedAuth }, { AuthProvider, useScopedAuth }, StudentAuthProvider, useStudentAuth, AuthResult (+8 more)

### Community 61 - "buildDualReports"
Cohesion: 0.18
Nodes (16): adminGuideline(), applicationCap(), applicationMixAdvice(), blockingFields(), buildDualReports(), closingText(), detectLimitingFactor(), documentInventory() (+8 more)

### Community 66 - "saleContract.ts"
Cohesion: 0.07
Nodes (56): POST(), AdminSendContract(), send(), updatePrestataire(), authedFetch(), ContractContact, fieldClass(), emailHtmlToText() (+48 more)

### Community 67 - "StudentMatching.tsx"
Cohesion: 0.18
Nodes (9): DocGroup, GrantGroup, Matching, MatchingDoc, Reading, StudentMatching(), StudentReport, TranslateFn (+1 more)

### Community 68 - "contact-submit.ts"
Cohesion: 0.23
Nodes (12): OPTIONS, POST, DOMAINES_VALIDES, generateEmailTemplate(), handler(), isFilled(), mergeNotes(), pick() (+4 more)

### Community 69 - "resend/route.ts"
Cohesion: 0.36
Nodes (7): maxDuration, POST(), decodeWebhookSecret(), HeaderSource, headerValue(), signaturesMatch(), verifyResendWebhook()

### Community 70 - "openwa.ts"
Cohesion: 0.11
Nodes (36): GET(), GET(), guard(), POST(), ChatLike, ids, phones, sorted (+28 more)

### Community 71 - "devDependencies"
Cohesion: 0.20
Nodes (10): devDependencies, eslint, eslint-config-next, @eslint/eslintrc, tailwindcss, @tailwindcss/postcss, @types/node, @types/react (+2 more)

### Community 72 - "ProtectedRoute.tsx"
Cohesion: 0.21
Nodes (8): AdminCapabilities, ProtectedRoute(), verify(), AdminAccessContext, AdminAccessProvider(), AdminCapabilities, FULL_ACCESS, ADMIN_ROLE_FULL

### Community 73 - "recover/route.ts"
Cohesion: 0.17
Nodes (19): missingAuthUser(), POST(), POST(), alreadyRegistered(), createConfirmedAuthUser(), ADMIN_NOTIFY_EMAIL, CONTACT_FROM, CONTACT_FROM_NAME (+11 more)

### Community 75 - "semantic.ts"
Cohesion: 0.29
Nodes (10): DOMAIN_FAMILIES, DOMAIN_KEYS, DomainSimilarity, familyOf(), jaccard(), studentTokens(), tokenize(), universityTokens() (+2 more)

### Community 76 - "scripts"
Cohesion: 0.25
Nodes (8): scripts, build, dev, import:universities, lint, scan:universities, start, test

### Community 77 - "dependencies"
Cohesion: 0.29
Nodes (7): dependencies, next, react, react-dom, resend, @supabase/supabase-js, @vercel/speed-insights

### Community 78 - "adminSupabase"
Cohesion: 0.29
Nodes (7): AdminDoc, adminFetch(), AdminStudentFiles(), FilesPayload, RequiredDoc, RequiredFile, adminSupabase

### Community 79 - "useAdminI18n"
Cohesion: 0.31
Nodes (8): AdminContactEmailThread(), load(), formatWhen(), localeFor(), AdminShell(), useAdminI18n(), ContactEmailRow, LanguageSessionPanel()

### Community 80 - "eslint.config.mjs"
Cohesion: 0.50
Nodes (3): compat, eslintConfig, @eslint/eslintrc

### Community 83 - "auto-reply.ts"
Cohesion: 0.11
Nodes (20): OPTIONS, POST, EMAIL_TEMPLATES, EmailContact, EmailTemplate, generateFormuleConfirmeeTemplate(), generateRelance1Template(), generateRelance2Template() (+12 more)

### Community 84 - "TarifsPage.tsx"
Cohesion: 0.22
Nodes (14): metadata, IncludeGroup, StudentFormules(), StudentFormulesProps, SiteI18nValue, generateFormulesPresentationTemplate(), displayFormuleFootnote(), Formule (+6 more)

### Community 85 - "AdminContactWhatsApp.tsx"
Cohesion: 0.33
Nodes (8): AdminContactWhatsApp(), loadCard(), run(), authedFetch(), localeFor(), ThreadMessage, WhatsappCard, WhatsappContact

### Community 86 - "Navigation.tsx"
Cohesion: 0.20
Nodes (7): metadata, Navigation(), NotFoundContent(), StudentProtectedRoute(), useAuth, SITE_LANGS, StudentLogin()

### Community 87 - "countries.ts"
Cohesion: 0.24
Nodes (8): main(), supabase, ALIASES, BY_FOLD, canonicalCountry(), COUNTRIES, fold(), isKnownCountry()

### Community 88 - "getSupabaseAdmin"
Cohesion: 0.27
Nodes (11): ContactEmailDirection, ContactEmailInput, listContactEmails(), markContactEmailsRead(), normalizeEmail(), storeContactEmail(), storeInboundContactEmail(), truncateBody() (+3 more)

### Community 89 - "request.ts"
Cohesion: 0.31
Nodes (8): FIELD_LABELS, FieldKey, filled(), PATCH(), sameValue(), filled(), PATCH(), readJsonObject()

### Community 90 - "AdminContactEmail.tsx"
Cohesion: 0.27
Nodes (9): AdminContactEmail(), applyDraft(), composeWithAi(), sendEmail(), authedFetch(), EmailContact, fieldClass(), CONTACT_FROM_EMAIL (+1 more)

### Community 91 - "mapUniversity"
Cohesion: 0.27
Nodes (10): blankOr(), breakdownBars(), categoryOf(), costOf(), deadlineOf(), factLines(), mapUniversity(), scorePhrase() (+2 more)

### Community 92 - "HomePage.tsx"
Cohesion: 0.31
Nodes (5): metadata, Hero(), Stats(), FAQS, HomePage()

## Ambiguous Edges - Review These
- `Next.js Agent Rules` → `React Vite Template README`  [AMBIGUOUS]
  README.md · relation: conceptually_related_to

## Knowledge Gaps
- **468 isolated node(s):** `compat`, `eslintConfig`, `securityHeaders`, `nextConfig`, `name` (+463 more)
  These have ≤1 connection - possible missing edges or undocumented components. (Counts symbols only; 537 node(s) total have ≤1 connection when file, concept and rationale nodes are included.)
- **12 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **What is the exact relationship between `Next.js Agent Rules` and `React Vite Template README`?**
  _Edge tagged AMBIGUOUS (relation: conceptually_related_to) - confidence is low._
- **Why does `react` connect `react` to `emailTemplateDrafts.ts`, `package.json`, `AdminMatchingReport.tsx`, `AdminUniversities.tsx`, `seo.ts`, `LeadForm.tsx`, `StudentDashboard.tsx`, `AdminI18nContext.tsx`, `SiteI18nContext.tsx`, `AdminLogin.tsx`, `AdminMatchingPanel.tsx`, `AdminContactInfo.tsx`, `AdminChineseMatchingPanel.tsx`, `AdminDashboard.tsx`, `saleContract.ts`, `StudentMatching.tsx`, `ProtectedRoute.tsx`, `adminSupabase`, `useAdminI18n`, `next`, `AdminContactWhatsApp.tsx`, `Navigation.tsx`, `AdminContactEmail.tsx`?**
  _High betweenness centrality (0.067) - this node is a cross-community bridge._
- **Why does `@supabase/supabase-js` connect `supabaseAdmin.ts` to `AdminI18nContext.tsx`, `package.json`, `universityScanImport.ts`, `studentProgress.ts`, `countries.ts`, `languageProgramImport.ts`, `react`?**
  _High betweenness centrality (0.055) - this node is a cross-community bridge._
- **Why does `errorMessage()` connect `errorMessage` to `studentDocuments.ts`, `saleContract.ts`, `emailTemplateDrafts.ts`, `contact-submit.ts`, `AdminMatchingPanel.tsx`, `StudentDashboard.tsx`, `inbound-email.ts`, `AdminContactInfo.tsx`, `AdminChineseMatchingPanel.tsx`, `adminSupabase`, `supabaseAdmin.ts`, `auto-reply.ts`, `AdminContactWhatsApp.tsx`, `AdminUniversities.tsx`, `Navigation.tsx`, `request.ts`, `AdminContactEmail.tsx`, `react`?**
  _High betweenness centrality (0.045) - this node is a cross-community bridge._
- **What connects `compat`, `eslintConfig`, `securityHeaders` to the rest of the system?**
  _468 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `useSiteI18n` be split into smaller, more focused modules?**
  _Cohesion score 0.1284013605442177 - nodes in this community are weakly interconnected._
- **Should `studentDocuments.ts` be split into smaller, more focused modules?**
  _Cohesion score 0.06540447504302926 - nodes in this community are weakly interconnected._