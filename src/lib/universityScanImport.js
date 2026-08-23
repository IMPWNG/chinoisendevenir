const FIELD_FR = {
  business: "Business",
  economics: "Économie",
  finance: "Finance",
  computer_science: "Informatique",
  engineering: "Ingénierie",
  sciences: "Sciences",
  medicine: "Médecine",
  dentistry: "Dentisterie",
  pharmacy: "Pharmacie",
  chinese_language: "Langue chinoise",
  arts: "Arts",
  design: "Design",
  music: "Musique",
  law: "Droit",
  education: "Éducation",
  agriculture: "Agriculture",
  other: "Autre",
};

const DOC_FR = {
  passport: "Passeport",
  diplome: "Diplôme",
  diplome_dernier_niveau: "Diplôme du dernier niveau",
  diploma: "Diplôme",
  transcript: "Relevés de notes",
  releve_notes: "Relevés de notes",
  language_certificate: "Certificat de langue",
  hsk: "HSK",
  ielts: "IELTS",
  toefl: "TOEFL",
  photo: "Photo d'identité",
  recommendation: "Lettres de recommandation",
  lettre_recommandation: "Lettres de recommandation",
  study_plan: "Study plan / lettre de motivation",
  motivation: "Lettre de motivation",
  personal_statement: "Personal statement",
  cv: "CV",
  application_form: "Formulaire de demande",
  medical: "Formulaire médical",
  certificat_physique: "Formulaire médical (Foreigner Physical Examination)",
  physical_examination: "Formulaire médical",
  criminal: "Casier judiciaire",
  casier_judiciaire: "Casier judiciaire",
  portfolio: "Portfolio",
  research_proposal: "Proposition de recherche",
};

const LEVEL_FR = {
  bachelor: "Bachelor",
  master: "Master",
  phd: "Doctorat",
  language: "Langue chinoise",
  foundation: "Prépa / foundation",
  exchange: "Échange",
};

export function fieldLabel(field) {
  return FIELD_FR[field] || field;
}

export function documentLabel(type) {
  if (!type) return "";
  return DOC_FR[String(type).toLowerCase()] || String(type).replaceAll("_", " ");
}

export function levelLabel(level) {
  return LEVEL_FR[level] || level;
}

export function dedupeScanProfiles(profiles) {
  const byKey = new Map();
  for (const profile of profiles || []) {
    const key = canonicalUniversityKey(profile);
    const current = byKey.get(key);
    if (!current) {
      byKey.set(key, profile);
      continue;
    }
    byKey.set(key, mergeProfiles(current, profile));
  }
  return [...byKey.values()];
}

export function canonicalUniversityKey(profile) {
  const zh = filled(profile?.identity?.name_zh || profile?.name_zh);
  if (zh) return `zh:${zh}`;
  const slug = String(profile?.slug || "")
    .replace(/-(old|new)$/i, "")
    .replace(/-old-one$/i, "");
  if (slug) return `slug:${slug}`;
  return `en:${normalizeText(profile?.identity?.name_en || profile?.name_en)}`;
}

export function profileToRow(profile) {
  const identity = profile.identity || {};
  const matching = profile.matching || {};
  const contacts = profile.contacts || {};
  const application = profile.application || {};
  const language = profile.language || {};
  const fees = profile.fees || {};
  const admission = buildAdmissionSummary(profile);

  const emails = uniqueStrings([
    contacts.iso_email,
    contacts.admissions_email,
    ...(profile.db_row?.emails || []),
  ]);

  const majors = uniqueStrings([
    ...(matching.fields || []).map(fieldLabel),
    ...(profile.programs || [])
      .slice(0, 8)
      .map((p) => p.name)
      .filter(Boolean),
  ]);

  const documents = uniqueStrings(
    (profile.documents || [])
      .filter((d) => d?.required !== false)
      .map((d) => documentLabel(d.type)),
  );

  const scholarships = (profile.scholarships || [])
    .map((s) => s.name)
    .filter(Boolean);

  const stipendValues = (profile.scholarships || [])
    .map((s) => Number(s.stipend_cny_month))
    .filter((n) => Number.isFinite(n) && n > 0);

  const slug = String(profile.slug || "")
    .replace(/-(old|new)$/i, "")
    .replace(/-old-one$/i, "");

  return {
    name_zh: filled(identity.name_zh),
    name_en: filled(identity.name_en),
    name_fr: filled(identity.name_fr),
    slug: filled(slug),
    city: filled(matching.city || profile.general?.location?.city),
    province: filled(matching.province || profile.general?.location?.province),
    country: "Chine",
    department: filled(contacts.office_name),
    emails,
    phone: filled(contacts.phone),
    wechat: filled(contacts.wechat),
    website: filled(
      identity.international_website ||
        application.platform_url ||
        identity.application_portal_url ||
        identity.website,
    ),
    notes: filled(profile.notes),
    is_partner: false,
    is_active: true,
    majors,
    required_documents: documents,
    scholarship_amount: scholarships.join(" / ") || null,
    scholarship_min: stipendValues.length ? Math.min(...stipendValues) : null,
    scholarship_max: stipendValues.length ? Math.max(...stipendValues) : null,
    min_hsk_level: toInt(
      matching.min_hsk_level ||
        language.hsk_bachelor ||
        language.hsk_master,
    ),
    language_requirements: languageRequirementText(matching, language),
    tuition_min: toNumber(
      matching.tuition_cny_min ?? fees.tuition_cny_year?.bachelor?.min,
    ),
    tuition_max: toNumber(
      matching.tuition_cny_max ??
        fees.tuition_cny_year?.master?.max ??
        fees.tuition_cny_year?.bachelor?.max,
    ),
    application_deadline: filled(
      matching.deadline_typical || application.deadline,
    ),
    extra: {
      admission,
      scan_slug: profile.slug || slug,
      scan_confidence: Number(profile.confidence) || 0,
      scanned_at: profile.scraped_at || null,
    },
  };
}

export function mergeUniversityRow(existing, incoming) {
  if (!existing) {
    return {
      ...incoming,
      is_partner: incoming.is_partner === true,
      is_active: incoming.is_active !== false,
    };
  }

  return {
    name_zh: existing.name_zh || incoming.name_zh,
    name_en: firstFilled(existing.name_en, incoming.name_en),
    name_fr: firstFilled(existing.name_fr, incoming.name_fr),
    slug: firstFilled(existing.slug, incoming.slug),
    city: firstFilled(existing.city, incoming.city),
    province: firstFilled(existing.province, incoming.province),
    country: firstFilled(existing.country, incoming.country) || "Chine",
    department: firstFilled(existing.department, incoming.department),
    emails: uniqueStrings([...(existing.emails || []), ...(incoming.emails || [])]),
    phone: firstFilled(existing.phone, incoming.phone),
    wechat: firstFilled(existing.wechat, incoming.wechat),
    website: firstFilled(existing.website, incoming.website),
    last_contact_at: existing.last_contact_at || null,
    last_contact_note: existing.last_contact_note || null,
    reply_status: existing.reply_status || null,
    notes: mergeNotes(existing.notes, incoming.notes),
    is_partner: existing.is_partner === true,
    is_active: existing.is_active !== false,
    majors: uniqueStrings([...(existing.majors || []), ...(incoming.majors || [])]),
    required_documents: uniqueStrings([
      ...(existing.required_documents || []),
      ...(incoming.required_documents || []),
    ]),
    scholarship_amount: firstFilled(
      existing.scholarship_amount,
      incoming.scholarship_amount,
    ),
    scholarship_min: firstNumber(existing.scholarship_min, incoming.scholarship_min),
    scholarship_max: firstNumber(existing.scholarship_max, incoming.scholarship_max),
    min_hsk_level: firstNumber(existing.min_hsk_level, incoming.min_hsk_level),
    language_requirements: firstFilled(
      existing.language_requirements,
      incoming.language_requirements,
    ),
    tuition_min: firstNumber(existing.tuition_min, incoming.tuition_min),
    tuition_max: firstNumber(existing.tuition_max, incoming.tuition_max),
    application_deadline: firstFilled(
      existing.application_deadline,
      incoming.application_deadline,
    ),
    extra: {
      ...(existing.extra && typeof existing.extra === "object" ? existing.extra : {}),
      ...(incoming.extra && typeof incoming.extra === "object" ? incoming.extra : {}),
      admission:
        incoming.extra?.admission ||
        existing.extra?.admission ||
        null,
    },
  };
}

export function findExistingUniversity(existingRows, incoming) {
  const zh = filled(incoming.name_zh);
  const slug = filled(incoming.slug);
  const en = normalizeText(incoming.name_en);

  return (
    existingRows.find((row) => zh && row.name_zh === zh) ||
    existingRows.find((row) => slug && row.slug === slug) ||
    existingRows.find(
      (row) => en && normalizeText(row.name_en) === en,
    ) ||
    null
  );
}

export function buildAdmissionSummary(profile) {
  const matching = profile.matching || {};
  const application = profile.application || {};
  const fees = profile.fees || {};
  const language = profile.language || {};
  const contacts = profile.contacts || {};
  const identity = profile.identity || {};

  return {
    presentation: filled(profile.general?.presentation),
    strengths: (profile.general?.strengths || []).filter(Boolean).slice(0, 8),
    teaching_languages: matching.languages || profile.general?.teaching_languages || [],
    english_programs_available: matching.english_programs_available ?? null,
    chinese_language_program_available:
      matching.chinese_language_program_available ?? null,
    degrees: matching.degrees || [],
    fields: matching.fields || [],
    programs: (profile.programs || []).slice(0, 12).map((p) => ({
      level: p.level || "",
      name: p.name || "",
      field: p.field || "",
      language: p.language || "",
      duration_years: p.duration_years ?? null,
    })),
    age_max: {
      bachelor: matching.age_max_bachelor ?? profile.admission_requirements?.bachelor?.age_max ?? null,
      master: matching.age_max_master ?? profile.admission_requirements?.master?.age_max ?? null,
      phd: matching.age_max_phd ?? profile.admission_requirements?.phd?.age_max ?? null,
    },
    requirements: {
      bachelor: compactRequirement(profile.admission_requirements?.bachelor),
      master: compactRequirement(profile.admission_requirements?.master),
      phd: compactRequirement(profile.admission_requirements?.phd),
      language: compactRequirement(profile.admission_requirements?.language),
    },
    documents: (profile.documents || [])
      .filter((d) => d?.type)
      .map((d) => ({
        type: documentLabel(d.type),
        required: d.required !== false,
        notes: filled(d.notes),
        applies_to: d.applies_to || [],
      })),
    application: {
      platform_name: filled(application.platform_name),
      platform_url: filled(
        application.platform_url || identity.application_portal_url,
      ),
      steps: (application.steps || []).filter(Boolean).slice(0, 8),
      opens_at: filled(application.opens_at),
      deadline: filled(matching.deadline_typical || application.deadline),
      intake_months: matching.intake_months || application.intake_months || [],
      application_fee_cny: toNumber(application.application_fee_cny),
    },
    fees: {
      tuition: fees.tuition_cny_year || {},
      insurance_cny_year: toNumber(fees.insurance_cny_year),
      housing: (fees.housing?.on_campus || [])
        .filter((h) => h?.type || h?.price_cny_year)
        .slice(0, 6),
      living_cost: fees.living_cost_cny_month || profile.general?.cost_of_living_cny_month || {},
    },
    scholarships: (profile.scholarships || [])
      .filter((s) => s?.name)
      .map((s) => ({
        name: s.name,
        type: s.type || "",
        coverage: s.coverage || "",
        covers: s.covers || [],
        stipend_cny_month: toNumber(s.stipend_cny_month),
        conditions: filled(s.conditions),
        apply_via: filled(s.apply_via),
        deadline: filled(s.deadline),
      })),
    language: {
      hsk_bachelor: language.hsk_bachelor ?? matching.min_hsk_level ?? null,
      hsk_master: language.hsk_master ?? null,
      hsk_phd: language.hsk_phd ?? null,
      ielts_min: matching.min_ielts ?? language.ielts_min ?? null,
      toefl_min: matching.min_toefl ?? language.toefl_min ?? null,
      preparatory: language.preparatory_chinese || null,
      foundation: language.foundation || null,
    },
    visa: profile.visa || {},
    housing_and_services: profile.housing_and_services || {},
    contacts: {
      office_name: filled(contacts.office_name),
      email: filled(contacts.iso_email || contacts.admissions_email),
      phone: filled(contacts.phone),
      wechat: filled(contacts.wechat),
      address: filled(contacts.address),
    },
    has_csc: matching.has_csc ?? null,
    has_university_scholarship: matching.has_university_scholarship ?? null,
    has_provincial_scholarship: matching.has_provincial_scholarship ?? null,
    sources: (profile.sources || []).map((s) => ({
      url: s.url,
      title: s.title || "",
    })),
    confidence: Number(profile.confidence) || 0,
  };
}

function mergeProfiles(a, b) {
  const better = Number(b.confidence || 0) > Number(a.confidence || 0) ? b : a;
  const other = better === a ? b : a;
  return {
    ...other,
    ...better,
    identity: { ...(other.identity || {}), ...(better.identity || {}) },
    matching: { ...(other.matching || {}), ...(better.matching || {}) },
    contacts: { ...(other.contacts || {}), ...(better.contacts || {}) },
    application: { ...(other.application || {}), ...(better.application || {}) },
    language: { ...(other.language || {}), ...(better.language || {}) },
    programs: uniqueBy(
      [...(better.programs || []), ...(other.programs || [])],
      (p) => `${p.level}|${p.name}|${p.language}`,
    ).slice(0, 16),
    scholarships: uniqueBy(
      [...(better.scholarships || []), ...(other.scholarships || [])],
      (s) => s.name,
    ),
    documents: uniqueBy(
      [...(better.documents || []), ...(other.documents || [])],
      (d) => d.type,
    ),
    sources: uniqueBy(
      [...(better.sources || []), ...(other.sources || [])],
      (s) => s.url,
    ),
    confidence: Math.max(Number(a.confidence) || 0, Number(b.confidence) || 0),
  };
}

function compactRequirement(req) {
  if (!req || typeof req !== "object") return null;
  const other = (req.other || []).filter(Boolean);
  return {
    academic: filled(req.academic),
    min_gpa: req.min_gpa ?? null,
    age_max: req.age_max ?? null,
    age_min: req.age_min ?? null,
    hsk_level: req.hsk_level ?? null,
    hsk_score_min: req.hsk_score_min ?? null,
    ielts_min: req.ielts_min ?? null,
    toefl_min: req.toefl_min ?? null,
    preparatory_if_insufficient: filled(req.preparatory_if_insufficient),
    other,
  };
}

function languageRequirementText(matching, language) {
  const parts = [];
  const hsk = matching.min_hsk_level || language.hsk_bachelor;
  if (hsk) parts.push(`HSK ${hsk}+`);
  if (matching.min_ielts || language.ielts_min) {
    parts.push(`IELTS ${matching.min_ielts || language.ielts_min}`);
  }
  if (matching.min_toefl || language.toefl_min) {
    parts.push(`TOEFL ${matching.min_toefl || language.toefl_min}`);
  }
  const langs = matching.languages || [];
  if (langs.includes("en")) parts.push("Programmes EN");
  if (langs.includes("zh")) parts.push("Programmes ZH");
  return parts.join(" · ") || null;
}

function filled(value) {
  if (value === null || value === undefined) return null;
  const text = String(value).trim();
  return text ? text : null;
}

function firstFilled(...values) {
  for (const value of values) {
    const next = filled(value);
    if (next) return next;
  }
  return null;
}

function firstNumber(...values) {
  for (const value of values) {
    const n = toNumber(value);
    if (n !== null) return n;
  }
  return null;
}

function toNumber(value) {
  if (value === "" || value === null || value === undefined) return null;
  const n = Number(value);
  return Number.isFinite(n) ? n : null;
}

function toInt(value) {
  const n = toNumber(value);
  return n === null ? null : Math.round(n);
}

function normalizeText(value) {
  return String(value || "")
    .toLowerCase()
    .replace(/['’`]/g, "'")
    .replace(/[^a-z0-9\u4e00-\u9fff]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function uniqueStrings(values) {
  const out = [];
  const seen = new Set();
  for (const value of values || []) {
    const text = filled(value);
    if (!text) continue;
    const key = text.toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);
    out.push(text);
  }
  return out;
}

function uniqueBy(items, keyFn) {
  const out = [];
  const seen = new Set();
  for (const item of items || []) {
    if (!item) continue;
    const key = filled(keyFn(item));
    if (!key || seen.has(key)) continue;
    seen.add(key);
    out.push(item);
  }
  return out;
}

export async function importScanCatalog(admin, catalog) {
  const profiles = dedupeScanProfiles(catalog?.universities || []);
  const incomingRows = profiles
    .map(profileToRow)
    .filter((row) => row.name_zh);

  const { data: existing, error: fetchError } = await admin
    .from("universities")
    .select("*");
  if (fetchError) throw fetchError;

  const existingRows = existing || [];
  const usedIds = new Set();
  let updated = 0;
  let inserted = 0;
  const names = [];

  for (const incoming of incomingRows) {
    const match = findExistingUniversity(
      existingRows.filter((row) => !usedIds.has(row.id)),
      incoming,
    );
    const merged = mergeUniversityRow(match, incoming);
    names.push(merged.name_zh);

    if (match?.id) {
      usedIds.add(match.id);
      const { id: _id, created_at: _c, ...payload } = merged;
      const { error } = await admin
        .from("universities")
        .update({ ...payload, updated_at: new Date().toISOString() })
        .eq("id", match.id);
      if (error) throw error;
      updated += 1;
    } else {
      const { error } = await admin.from("universities").insert({
        ...merged,
        is_partner: false,
        is_active: true,
      });
      if (error) throw error;
      inserted += 1;
    }
  }

  return {
    scanned: profiles.length,
    updated,
    inserted,
    total_after: existingRows.length + inserted,
    names,
  };
}

function mergeNotes(existing, incoming) {
  const a = filled(existing);
  const b = filled(incoming);
  if (!a) return b;
  if (!b) return a;
  if (a.includes(b) || b.includes(a)) return a.length >= b.length ? a : b;
  return `${a}\n${b}`;
}
