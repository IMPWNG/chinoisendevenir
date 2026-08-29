import { DEFAULT_AGE_MIN, DEFAULT_LIVING_COST_CNY } from "./weights";

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

function yearlyLivingCost(livingCost) {
  if (livingCost == null || livingCost === "") {
    return { value: DEFAULT_LIVING_COST_CNY, status: "default" };
  }
  if (typeof livingCost === "number" && Number.isFinite(livingCost)) {
    const yearly = livingCost > 8000 ? livingCost : livingCost * 12;
    return { value: Math.round(yearly), status: "estimated" };
  }
  if (typeof livingCost !== "object") {
    return { value: DEFAULT_LIVING_COST_CNY, status: "default" };
  }

  const food = toNumber(livingCost.food);
  const transport = toNumber(livingCost.transport);
  const other = toNumber(livingCost.other);
  const parts = [food, transport, other].filter((n) => n != null);
  if (parts.length) {
    const monthly = parts.reduce((a, b) => a + b, 0);
    return { value: Math.round(monthly * 12), status: "estimated" };
  }

  const typical =
    toNumber(livingCost.typical) ??
    toNumber(livingCost.average) ??
    toNumber(livingCost.total);
  if (typical != null) {
    const yearly = typical > 8000 ? typical : typical * 12;
    return { value: Math.round(yearly), status: "estimated" };
  }

  const min = toNumber(livingCost.min);
  const max = toNumber(livingCost.max);
  if (min != null || max != null) {
    const monthly = ((min ?? max) + (max ?? min)) / 2;
    const yearly = monthly > 8000 ? monthly : monthly * 12;
    return { value: Math.round(yearly), status: "estimated" };
  }

  const notes = String(livingCost.notes || "");
  const nums = [...notes.matchAll(/(\d[\d\s]{2,})/g)]
    .map((match) => Number(String(match[1]).replace(/\s/g, "")))
    .filter((n) => Number.isFinite(n) && n >= 800 && n <= 20000);
  if (nums.length) {
    const monthly = nums.reduce((a, b) => a + b, 0) / nums.length;
    return { value: Math.round(monthly * 12), status: "estimated" };
  }
  return { value: DEFAULT_LIVING_COST_CNY, status: "default" };
}

function reqFor(admission, level) {
  return admission?.requirements?.[level] || admission?.requirements?.[`${level}`] || null;
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
  const tuitionMean =
    tuitionMin != null
      ? Math.round((tuitionMin + (tuitionMax ?? tuitionMin)) / 2)
      : null;

  const housingPrices = housing
    .map((h) => toNumber(h.price_cny_year))
    .filter((n) => n !== null)
    .sort((a, b) => a - b);
  const housingMin = housingPrices[0] ?? null;
  const housingMean = housingPrices.length
    ? Math.round(housingPrices.reduce((a, b) => a + b, 0) / housingPrices.length)
    : housingMin;

  const living = yearlyLivingCost(fees.living_cost);
  const costTotalCny =
    (tuitionMean ?? 0) + (housingMean ?? 0) + (living.value ?? DEFAULT_LIVING_COST_CNY);

  const hskBachelor =
    toNumber(language.hsk_bachelor) ??
    toNumber(row.min_hsk_level) ??
    toNumber(reqFor(admission, "bachelor")?.hsk_level);
  const hskMaster =
    toNumber(language.hsk_master) ?? toNumber(reqFor(admission, "master")?.hsk_level);
  const hskPhd = toNumber(language.hsk_phd) ?? toNumber(reqFor(admission, "phd")?.hsk_level);

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
  const scholarshipTypes = unique(
    [
      hasCsc ? "CSC" : null,
      hasProvincial ? "Bourse provinciale / municipale" : null,
      hasUniScholarship ? "Bourse universitaire" : null,
      ...scholarships.map((s) => s.name || s.type),
    ].filter(Boolean),
  );

  const ageMin =
    toNumber(reqFor(admission, "bachelor")?.age_min) ??
    toNumber(reqFor(admission, "master")?.age_min) ??
    DEFAULT_AGE_MIN;

  const gpaMin = {
    bachelor: toNumber(reqFor(admission, "bachelor")?.min_gpa),
    master: toNumber(reqFor(admission, "master")?.min_gpa),
    phd: toNumber(reqFor(admission, "phd")?.min_gpa),
  };

  const hskForDegree = (degree) => {
    if (degree === "master") return hskMaster ?? hskBachelor;
    if (degree === "phd") return hskPhd ?? hskMaster ?? hskBachelor;
    if (degree === "language") return 0;
    return hskBachelor;
  };

  const gpaMinForDegree = (degree) => {
    if (degree === "master") return gpaMin.master ?? gpaMin.bachelor;
    if (degree === "phd") return gpaMin.phd ?? gpaMin.master;
    return gpaMin.bachelor;
  };

  const ageMaxForDegree = (degree) => {
    if (degree === "master") return toNumber(ageMax.master);
    if (degree === "phd") return toNumber(ageMax.phd);
    if (degree === "language") return toNumber(ageMax.language) ?? 60;
    return toNumber(ageMax.bachelor);
  };

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
    hsk: hskBachelor,
    hskBachelor,
    hskMaster,
    hskPhd,
    hskForDegree,
    ielts: toNumber(language.ielts_min),
    toefl: toNumber(language.toefl_min),
    languageRequirements: filled(row.language_requirements),
    ageMin,
    ageMax: {
      bachelor: toNumber(ageMax.bachelor),
      master: toNumber(ageMax.master),
      phd: toNumber(ageMax.phd),
    },
    ageMaxForDegree,
    gpaMin,
    gpaMinForDegree,
    tuitionMin,
    tuitionMax,
    tuitionMean,
    housingMin: housingMin ?? null,
    housingMean: housingMean ?? null,
    livingCostYearly: living.value,
    livingCostStatus: living.status,
    costTotalCny,
    scholarships,
    scholarshipTypes,
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
