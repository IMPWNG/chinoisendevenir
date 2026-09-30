import { parseTuitionCny } from "../languageProgramImport";
import { DEFAULT_AGE_MIN, DEFAULT_LIVING_COST_CNY } from "./weights";

export type UniversityRow = {
  id?: string | null;
  name_zh?: unknown;
  name_en?: unknown;
  name_fr?: unknown;
  city?: unknown;
  province?: unknown;
  website?: unknown;
  emails?: unknown;
  notes?: unknown;
  is_active?: unknown;
  is_partner?: unknown;
  majors?: unknown;
  extra?: unknown;
  tuition_min?: unknown;
  tuition_max?: unknown;
  min_hsk_level?: unknown;
  language_requirements?: unknown;
  scholarship_amount?: unknown;
  application_deadline?: unknown;
  required_documents?: unknown;
};

function asRecord(value: unknown): Record<string, unknown> {
  if (value && typeof value === "object" && !Array.isArray(value)) {
    return value as Record<string, unknown>;
  }
  return {};
}

function filled(value: unknown) {
  if (value === null || value === undefined) return null;
  const text = String(value).trim();
  return text === "" ? null : text;
}

function toNumber(value: unknown) {
  if (value === "" || value === null || value === undefined) return null;
  const n = Number(value);
  return Number.isFinite(n) ? n : null;
}

export function resolveLanguageTuition({
  min,
  max,
  semester,
  year,
  text,
}: {
  min?: number | null;
  max?: number | null;
  semester?: number | null;
  year?: number | null;
  text?: string | null;
}) {
  const parsed = text
    ? parseTuitionCny(text)
    : { min: null, max: null, semester: null, year: null };
  const semesterValue = semester ?? parsed.semester;
  const yearValue = year ?? parsed.year;
  if (semesterValue != null && yearValue != null && yearValue !== semesterValue) {
    return { semester: semesterValue, year: yearValue, amount: null, period: "both" as const };
  }
  if (semesterValue != null) {
    return {
      semester: semesterValue,
      year: yearValue != null && yearValue !== semesterValue ? yearValue : semesterValue * 2,
      amount: null,
      period: "semester" as const,
    };
  }
  if (yearValue != null) {
    return { semester: null, year: yearValue, amount: null, period: "year" as const };
  }
  if (min != null && max != null && max >= Math.round(min * 1.5)) {
    return { semester: min, year: max, amount: null, period: "both" as const };
  }
  const source = String(text || "");
  const saysSemester = /学期|semester|16周/i.test(source);
  const saysYear = /学年|(?:\/|／)年|\byear\b/i.test(source);
  if (min != null && saysSemester && !saysYear) {
    return { semester: min, year: min * 2, amount: null, period: "semester" as const };
  }
  if (min != null && saysYear && !saysSemester) {
    return { semester: null, year: max ?? min, amount: null, period: "year" as const };
  }
  if (min != null) {
    return { semester: null, year: null, amount: min, period: "unknown" as const };
  }
  return { semester: null, year: null, amount: null, period: "unknown" as const };
}

function unique(list: unknown) {
  return [
    ...new Set(
      (Array.isArray(list) ? list : [])
        .map((item) => String(item).trim())
        .filter(Boolean),
    ),
  ];
}

function yearlyLivingCost(livingCost: unknown) {
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

  const cost = asRecord(livingCost);
  const food = toNumber(cost.food);
  const transport = toNumber(cost.transport);
  const other = toNumber(cost.other);
  const parts = [food, transport, other].filter((n): n is number => n != null);
  if (parts.length) {
    const monthly = parts.reduce((a, b) => a + b, 0);
    return { value: Math.round(monthly * 12), status: "estimated" };
  }

  const typical =
    toNumber(cost.typical) ??
    toNumber(cost.average) ??
    toNumber(cost.total);
  if (typical != null) {
    const yearly = typical > 8000 ? typical : typical * 12;
    return { value: Math.round(yearly), status: "estimated" };
  }

  const min = toNumber(cost.min);
  const max = toNumber(cost.max);
  if (min != null || max != null) {
    const lo = min ?? max ?? 0;
    const hi = max ?? min ?? 0;
    const monthly = (lo + hi) / 2;
    const yearly = monthly > 8000 ? monthly : monthly * 12;
    return { value: Math.round(yearly), status: "estimated" };
  }

  const notes = String(cost.notes || "");
  const nums = [...notes.matchAll(/(\d[\d\s]{2,})/g)]
    .map((match) => Number(String(match[1]).replace(/\s/g, "")))
    .filter((n) => Number.isFinite(n) && n >= 800 && n <= 20000);
  if (nums.length) {
    const monthly = nums.reduce((a, b) => a + b, 0) / nums.length;
    return { value: Math.round(monthly * 12), status: "estimated" };
  }
  return { value: DEFAULT_LIVING_COST_CNY, status: "default" };
}

function reqFor(admission: Record<string, unknown>, level: unknown) {
  const requirements = asRecord(admission.requirements);
  const value = requirements[String(level)] ?? requirements[`${level}`];
  return value && typeof value === "object" && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : null;
}

export function normalizeUniversity(row: UniversityRow) {
  const extra = asRecord(row.extra);
  const admission = asRecord(extra.admission);
  const language = asRecord(admission.language);
  const ageMax = asRecord(admission.age_max);
  const fees = asRecord(admission.fees);
  const application = asRecord(admission.application);
  const tuition = asRecord(fees.tuition);
  const tuitionLanguage = asRecord(tuition.language);
  const tuitionBachelor = asRecord(tuition.bachelor);
  const tuitionMaster = asRecord(tuition.master);
  const session = asRecord(admission.language_session);
  const sessionTuition = asRecord(session.tuition);
  const listedHousing = Array.isArray(fees.housing)
    ? (fees.housing as Record<string, unknown>[])
    : [];
  const sessionHousing = Array.isArray(session.housing)
    ? (session.housing as Record<string, unknown>[])
    : [];
  const housing = listedHousing.length ? listedHousing : sessionHousing;
  const programs = Array.isArray(admission.programs)
    ? (admission.programs as Record<string, unknown>[])
    : [];
  const degrees = unique([
    ...(Array.isArray(admission.degrees) ? admission.degrees : []),
    ...programs.map((p) => p.level),
  ]).map((d) => String(d).toLowerCase());

  const fieldKeys = unique(admission.fields || []).map((item) =>
    String(item).toLowerCase(),
  );
  const fields = unique([
    ...fieldKeys,
    ...(Array.isArray(row.majors) ? row.majors : []),
    ...programs.map((p) => p.field || p.name),
  ]);

  const teachingLanguages = unique([
    ...(Array.isArray(admission.teaching_languages)
      ? admission.teaching_languages
      : []),
    ...programs.map((p) => p.language),
  ]).map((l) => String(l).toLowerCase());

  const englishAvailable =
    admission.english_programs_available === true ||
    teachingLanguages.some((l) => l.startsWith("en")) ||
    programs.some((p) => /^en/i.test(String(p.language || "")));

  const languagePrograms = programs.filter((p) => {
    const level = String(p.level || "").toLowerCase();
    return level === "language" || level === "foundation";
  });

  const chineseLanguageProgram =
    admission.chinese_language_program_available === true ||
    degrees.includes("language") ||
    languagePrograms.length > 0;

  const languageFees = resolveLanguageTuition({
    min: toNumber(tuitionLanguage.min),
    max: toNumber(tuitionLanguage.max),
    semester: toNumber(sessionTuition.semester),
    year: toNumber(sessionTuition.year),
    text: filled(session.tuition_text),
  });
  const languageTuitionSemester = languageFees.semester;
  const languageTuitionYear = languageFees.year;
  const languageTuitionMin = languageTuitionSemester ?? languageTuitionYear ?? languageFees.amount;
  const languageTuitionMax = languageTuitionYear ?? languageTuitionSemester ?? languageFees.amount;
  const languageTuitionMean = languageTuitionYear;

  const tuitionMin =
    toNumber(row.tuition_min) ??
    toNumber(tuitionBachelor.min) ??
    toNumber(tuitionMaster.min);
  const tuitionMax =
    toNumber(row.tuition_max) ??
    toNumber(tuitionBachelor.max) ??
    toNumber(tuitionMaster.max) ??
    tuitionMin;
  const tuitionMean =
    tuitionMin != null
      ? Math.round((tuitionMin + (tuitionMax ?? tuitionMin)) / 2)
      : null;

  const housingPrices = housing
    .map((h) => toNumber(h.price_cny_year))
    .filter((n): n is number => n !== null)
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
    ? (admission.scholarships as Record<string, unknown>[])
    : [];
  const hasCsc =
    admission.has_csc === true ||
    scholarships.some((s) =>
      /csc|china scholarship/i.test(String(s.name || s.type || "")),
    );
  const hasUniScholarship =
    admission.has_university_scholarship === true || scholarships.length > 0;
  const hasProvincial =
    admission.has_provincial_scholarship === true ||
    scholarships.some((s) =>
      /provinc|municipal/i.test(String(s.type || s.name || "")),
    );
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

  const hskForDegree = (degree: unknown) => {
    if (degree === "master") return hskMaster ?? hskBachelor;
    if (degree === "phd") return hskPhd ?? hskMaster ?? hskBachelor;
    if (degree === "language") return 0;
    return hskBachelor;
  };

  const gpaMinForDegree = (degree: unknown) => {
    if (degree === "master") return gpaMin.master ?? gpaMin.bachelor;
    if (degree === "phd") return gpaMin.phd ?? gpaMin.master;
    return gpaMin.bachelor;
  };

  const ageMaxForDegree = (degree: unknown) => {
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
    languagePrograms,
    languageProgramName:
      filled(languagePrograms[0]?.name) || "Programme de langue chinoise",
    languageTuitionMin,
    languageTuitionMax,
    languageTuitionMean,
    languageProfile: {
      tuitionText: filled(session.tuition_text),
      semester: languageTuitionSemester,
      year: languageTuitionYear,
      amount: languageFees.amount,
      period: languageFees.period,
      ageMin: toNumber(session.age_min),
      ageMax: toNumber(session.age_max),
      beginner: /0\s*基础|零基础|零起点|débutant|beginner/i.test(
        `${session.foundation || ""} ${session.project || ""}`,
      ),
      deadline: filled(session.deadline),
      scholarship: /❌/.test(String(session.scholarship || ""))
        ? false
        : /✅/.test(String(session.scholarship || ""))
          ? true
          : null,
      documents: Array.isArray(session.documents)
        ? session.documents.map((item) => String(item))
        : [],
      applicationFee: toNumber(session.application_fee_cny),
      applyWebsite: filled(session.apply_website),
      pathway: /本科|硕士|升学|衔接|bachelor|master/i.test(String(session.pathway || "")),
      project: filled(session.project),
    },
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
    intakeMonths: unique([
      ...(Array.isArray(application.intake_months) ? application.intake_months : []),
      ...(Array.isArray(session.intake_months) ? session.intake_months : []),
    ])
      .map(Number)
      .filter(Boolean),
    deadline:
      filled(row.application_deadline) ||
      filled(application.deadline) ||
      filled(session.deadline),
    documents: unique([
      ...(Array.isArray(row.required_documents) ? row.required_documents : []),
      ...(Array.isArray(admission.documents) ? admission.documents : []).map(
        (d) => asRecord(d).type,
      ),
      ...(Array.isArray(asRecord(admission.language_session).documents)
        ? (asRecord(admission.language_session).documents as unknown[])
        : []),
    ]),
    applicationUrl: filled(application.platform_url),
    contacts: asRecord(admission.contacts),
    confidence: Number(admission.confidence) || 0,
    raw: row,
  };
}

export type MatchingUniversity = ReturnType<typeof normalizeUniversity>;
