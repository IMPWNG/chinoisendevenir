function filled(value) {
  if (value === null || value === undefined) return null;
  const text = String(value).trim();
  return text === "" ? null : text;
}

function toNumber(value) {
  if (value === "" || value === null || value === undefined) return null;
  const n = Number(value);
  return Number.isFinite(n) ? n : null;
}

function unique(list) {
  return [...new Set((list || []).map((item) => String(item).trim()).filter(Boolean))];
}

export function normalizeUniversity(row) {
  const admission = row.extra?.admission || {};
  const language = admission.language || {};
  const ageMax = admission.age_max || {};
  const fees = admission.fees || {};
  const application = admission.application || {};
  const tuition = fees.tuition || {};
  const housing = Array.isArray(fees.housing) ? fees.housing : [];
  const programs = Array.isArray(admission.programs) ? admission.programs : [];
  const degrees = unique([
    ...(admission.degrees || []),
    ...programs.map((p) => p.level),
  ]).map((d) => String(d).toLowerCase());

  const fieldKeys = unique(admission.fields || []).map((item) =>
    String(item).toLowerCase(),
  );
  const fields = unique([
    ...fieldKeys,
    ...(row.majors || []),
    ...programs.map((p) => p.field || p.name),
  ]);

  const teachingLanguages = unique([
    ...(admission.teaching_languages || []),
    ...programs.map((p) => p.language),
  ]).map((l) => String(l).toLowerCase());

  const englishAvailable =
    admission.english_programs_available === true ||
    teachingLanguages.some((l) => l.startsWith("en")) ||
    programs.some((p) => /^en/i.test(p.language || ""));

  const chineseLanguageProgram =
    admission.chinese_language_program_available === true ||
    degrees.includes("language");

  const tuitionMin =
    toNumber(row.tuition_min) ??
    toNumber(tuition.bachelor?.min) ??
    toNumber(tuition.master?.min);
  const tuitionMax =
    toNumber(row.tuition_max) ??
    toNumber(tuition.bachelor?.max) ??
    toNumber(tuition.master?.max) ??
    tuitionMin;

  const housingMin = housing
    .map((h) => toNumber(h.price_cny_year))
    .filter((n) => n !== null)
    .sort((a, b) => a - b)[0];

  const hsk =
    toNumber(row.min_hsk_level) ??
    toNumber(language.hsk_bachelor) ??
    toNumber(language.hsk_master);

  const scholarships = Array.isArray(admission.scholarships)
    ? admission.scholarships
    : [];
  const hasCsc =
    admission.has_csc === true ||
    scholarships.some((s) => /csc|china scholarship/i.test(s.name || s.type || ""));
  const hasUniScholarship =
    admission.has_university_scholarship === true || scholarships.length > 0;
  const hasProvincial =
    admission.has_provincial_scholarship === true ||
    scholarships.some((s) => /provinc|municipal/i.test(s.type || s.name || ""));

  return {
    id: row.id,
    nameZh: filled(row.name_zh),
    nameEn: filled(row.name_en),
    nameFr: filled(row.name_fr),
    displayName:
      filled(row.name_fr) ||
      filled(row.name_en) ||
      filled(row.name_zh) ||
      "Université",
    city: filled(row.city),
    province: filled(row.province),
    website: filled(row.website),
    emails: row.emails || [],
    notes: filled(row.notes),
    isActive: row.is_active !== false,
    isPartner: row.is_partner === true,
    degrees,
    fieldKeys,
    fields,
    majors: row.majors || [],
    programs,
    teachingLanguages,
    englishAvailable,
    chineseLanguageProgram,
    hsk,
    ielts: toNumber(language.ielts_min),
    toefl: toNumber(language.toefl_min),
    languageRequirements: filled(row.language_requirements),
    ageMax: {
      bachelor: toNumber(ageMax.bachelor),
      master: toNumber(ageMax.master),
      phd: toNumber(ageMax.phd),
    },
    tuitionMin,
    tuitionMax,
    housingMin: housingMin ?? null,
    livingCost: fees.living_cost || {},
    scholarships,
    hasCsc,
    hasUniScholarship,
    hasProvincial,
    scholarshipText: filled(row.scholarship_amount),
    intakeMonths: (application.intake_months || []).map(Number).filter(Boolean),
    deadline: filled(row.application_deadline) || filled(application.deadline),
    documents: unique([
      ...(row.required_documents || []),
      ...(admission.documents || []).map((d) => d.type),
    ]),
    applicationUrl: filled(application.platform_url),
    contacts: admission.contacts || {},
    confidence: Number(admission.confidence) || 0,
    raw: row,
  };
}
