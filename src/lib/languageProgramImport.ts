import { documentLabel, type ScanProfile } from "./universityScanImport";

export type LanguageCsvRecord = {
  name_zh: string;
  city_raw: string;
  project: string;
  tuition: string;
  age: string;
  foundation: string;
  dormitory: string;
  deadline: string;
  apply_website: string;
  contact: string;
  pathway: string;
  documents: string;
  note: string;
  scholarship: string;
};

export type LanguageUniMeta = {
  slug: string;
  name_en: string;
  name_fr: string;
  city: string;
  province: string;
  existing: boolean;
  seed_urls: string[];
};

export const LANGUAGE_UNI_META: Record<string, LanguageUniMeta> = {
  重庆建筑科技职业学院: {
    slug: "cqrec",
    name_en: "Chongqing Architecture Science and Technology Vocational College",
    name_fr: "Institut professionnel de science et technologie du bâtiment de Chongqing",
    city: "Chongqing",
    province: "Chongqing",
    existing: false,
    seed_urls: [
      "https://www.cqrec.edu.cn/",
      "https://cqrec.at0086.cn/StuApplication/Login.aspx",
    ],
  },
  成都航空职业技术大学: {
    slug: "cap",
    name_en: "Chengdu Aeronautic Polytechnic",
    name_fr: "Université professionnelle aéronautique de Chengdu",
    city: "Chengdu",
    province: "Sichuan",
    existing: false,
    seed_urls: [
      "https://www.cap.edu.cn/",
      "https://www.cap.edu.cn/gjjyxy/lxsgz/gych.htm",
      "https://www.cap.edu.cn/gjjyxy/info/1311/2611.htm",
    ],
  },
  四川交通职业大学: {
    slug: "svtcc",
    name_en: "Sichuan Vocational and Technical College of Communications",
    name_fr: "Université professionnelle des transports du Sichuan",
    city: "Chengdu",
    province: "Sichuan",
    existing: false,
    seed_urls: ["http://gjxy.svtcc.edu.cn/"],
  },
  重庆文理学院: {
    slug: "cqwu",
    name_en: "Chongqing University of Arts and Sciences",
    name_fr: "Université des arts et des sciences de Chongqing",
    city: "Chongqing",
    province: "Chongqing",
    existing: false,
    seed_urls: [
      "https://iss.cqwu.edu.cn/",
      "https://iss.cqwu.edu.cn/article_362983.html",
    ],
  },
  成都信息工程大学: {
    slug: "cuit",
    name_en: "Chengdu University of Information Technology",
    name_fr: "Université d'information et d'ingénierie de Chengdu",
    city: "Chengdu",
    province: "Sichuan",
    existing: false,
    seed_urls: [
      "https://gjjl.cuit.edu.cn/",
      "https://gjjl.cuit.edu.cn/info/1042/2638.htm",
    ],
  },
  成都大学: {
    slug: "chengdu-university",
    name_en: "Chengdu University",
    name_fr: "Université de Chengdu",
    city: "Chengdu",
    province: "Sichuan",
    existing: false,
    seed_urls: [
      "https://admissions.cdu.edu.cn/",
      "https://coe.cdu.edu.cn/",
      "https://en.cdu.edu.cn/",
    ],
  },
  贵州大学: {
    slug: "gzu",
    name_en: "Guizhou University",
    name_fr: "Université du Guizhou",
    city: "Guiyang",
    province: "Guizhou",
    existing: false,
    seed_urls: [
      "http://cie.gzu.edu.cn/",
      "https://gzu.at0086.cn/StuApplication/Login.aspx",
    ],
  },
  云南师范大学: {
    slug: "ynnu",
    name_en: "Yunnan Normal University",
    name_fr: "Université normale du Yunnan",
    city: "Kunming",
    province: "Yunnan",
    existing: false,
    seed_urls: [
      "http://lx.ynnu.edu.cn/",
      "http://ynnu.at0086.cn/student",
      "https://lx.ynnu.edu.cn/info/1271/1026.htm",
    ],
  },
  云南大学: {
    slug: "ynu",
    name_en: "Yunnan University",
    name_fr: "Université du Yunnan",
    city: "Kunming",
    province: "Yunnan",
    existing: false,
    seed_urls: [
      "http://english.ynu.edu.cn/nondegreeprograms.html",
      "https://ynu.at0086.cn/StuApplication/Login.aspx",
    ],
  },
  云南财经大学: {
    slug: "ynufe",
    name_en: "Yunnan University of Finance and Economics",
    name_fr: "Université de finance et d'économie du Yunnan",
    city: "Kunming",
    province: "Yunnan",
    existing: false,
    seed_urls: [
      "https://www.ynufe.edu.cn/hwxy/index.htm",
      "https://ynufe.at0086.cn/StuApplication/Login.aspx",
    ],
  },
  重庆科技大学: {
    slug: "cqust",
    name_en: "Chongqing University of Science and Technology",
    name_fr: "Université de science et technologie de Chongqing",
    city: "Chongqing",
    province: "Chongqing",
    existing: true,
    seed_urls: ["https://cqust.at0086.cn/StuApplication/Login.aspx"],
  },
  重庆师范大学: {
    slug: "chongqing-normal-university",
    name_en: "Chongqing Normal University",
    name_fr: "Université normale de Chongqing",
    city: "Chongqing",
    province: "Chongqing",
    existing: true,
    seed_urls: ["http://foreignstudent.cqnu.edu.cn/"],
  },
  重庆邮电大学: {
    slug: "cqupt",
    name_en: "Chongqing University of Posts and Telecommunications",
    name_fr: "Université des postes et télécommunications de Chongqing",
    city: "Chongqing",
    province: "Chongqing",
    existing: true,
    seed_urls: ["https://cqupt.17gz.org/"],
  },
  四川外国语大学: {
    slug: "sisu",
    name_en: "Sichuan International Studies University",
    name_fr: "Université des études internationales du Sichuan",
    city: "Chongqing",
    province: "Chongqing",
    existing: true,
    seed_urls: ["https://sisu.at0086.cn/StuApplication/Login.aspx"],
  },
  四川师范大学: {
    slug: "sichuan-normal-university",
    name_en: "Sichuan Normal University",
    name_fr: "Université normale du Sichuan",
    city: "Chengdu",
    province: "Sichuan",
    existing: true,
    seed_urls: ["http://lxs.sicnu.edu.cn/"],
  },
  西南大学: {
    slug: "southwest-university",
    name_en: "Southwest University",
    name_fr: "Université du Sud-Ouest",
    city: "Chongqing",
    province: "Chongqing",
    existing: true,
    seed_urls: ["https://swu.17gz.org/"],
  },
  西南财经大学: {
    slug: "swufe",
    name_en: "Southwestern University of Finance and Economics",
    name_fr: "Université du Sud-Ouest de finance et d'économie",
    city: "Chengdu",
    province: "Sichuan",
    existing: true,
    seed_urls: ["https://swufe.17gz.org/"],
  },
  重庆大学: {
    slug: "chongqing-university",
    name_en: "Chongqing University",
    name_fr: "Université de Chongqing",
    city: "Chongqing",
    province: "Chongqing",
    existing: true,
    seed_urls: ["https://cqu.17gz.org/member/login.do"],
  },
  西南交通大学: {
    slug: "swjtu",
    name_en: "Southwest Jiaotong University",
    name_fr: "Université Jiaotong du Sud-Ouest",
    city: "Chengdu",
    province: "Sichuan",
    existing: true,
    seed_urls: ["https://admission.swjtu.edu.cn/"],
  },
  四川大学: {
    slug: "sichuan-university",
    name_en: "Sichuan University",
    name_fr: "Université du Sichuan",
    city: "Chengdu",
    province: "Sichuan",
    existing: true,
    seed_urls: ["https://scu.17gz.org/member/login.do"],
  },
};

const DOC_HINTS: Array<[RegExp, string]> = [
  [/护照/, "passport"],
  [/学历|毕业|学位/, "diplome"],
  [/成绩单/, "transcript"],
  [/无犯罪|犯罪记录/, "criminal"],
  [/体检|体格检查/, "medical"],
  [/照片|证件照/, "photo"],
  [/推荐信/, "recommendation"],
  [/申请表/, "application_form"],
  [/学习计划|个人陈述|个人简历|动机/, "study_plan"],
  [/经济|资金|存款|担保/, "financial_guarantee"],
  [/\bHSK\b|汉语水平/, "hsk"],
  [/简历/, "cv"],
  [/监护/, "guardian"],
  [/签证|居留/, "visa"],
];

export function parseTuitionCny(text: string) {
  if (!text || (!/\d/.test(text) && /[？?]/.test(text))) {
    return { min: null, max: null, semester: null, year: null };
  }
  const cleaned = text.replace(/,/g, "");
  const semester: number[] = [];
  const year: number[] = [];
  const unknown: number[] = [];
  const re =
    /(\d+)\s*(?:CNY|RMB|元)?\s*(?:\/|／)?\s*(?:人\/)?(学期|学年|年|semester|year|16周|周)?/gi;
  let match: RegExpExecArray | null;
  while ((match = re.exec(cleaned))) {
    const value = Number(match[1]);
    if (!Number.isFinite(value) || value < 1000 || value > 200000) continue;
    const unit = (match[2] || "").toLowerCase();
    if (unit === "学期" || unit === "semester" || unit === "16周" || unit === "周") {
      semester.push(value);
    } else if (unit === "学年" || unit === "年" || unit === "year") {
      year.push(value);
    } else {
      unknown.push(value);
    }
  }
  const semesterMin = semester.length ? Math.min(...semester) : null;
  const yearMax = year.length ? Math.max(...year) : null;
  const yearMin = year.length ? Math.min(...year) : null;
  if (semesterMin != null || yearMin != null) {
    return {
      min: semesterMin ?? yearMin,
      max: yearMax ?? (semesterMin != null ? semesterMin * 2 : yearMin),
      semester: semesterMin,
      year: yearMax ?? yearMin,
    };
  }
  if (unknown.length) {
    return {
      min: Math.min(...unknown),
      max: Math.max(...unknown),
      semester: null,
      year: Math.max(...unknown),
    };
  }
  return { min: null, max: null, semester: null, year: null };
}

export function parseAgeRange(text: string) {
  const cleaned = String(text || "").replace(/\s/g, "");
  const range = cleaned.match(/(\d+)\s*[-–~至到]\s*(\d+)/);
  if (range) {
    return { min: Number(range[1]), max: Number(range[2]) };
  }
  const gt = cleaned.match(/[>≥]\s*(\d+)/);
  if (gt) return { min: Number(gt[1]), max: null };
  const only = cleaned.match(/^(\d+)$/);
  if (only) return { min: Number(only[1]), max: null };
  return { min: null, max: null };
}

export function parseApplicationFee(text: string) {
  const match = String(text || "").replace(/,/g, "").match(
    /(?:注册费|报名费|申请费)\s*(\d+)/,
  );
  return match ? Number(match[1]) : null;
}

export function parseEmails(text: string) {
  return uniqueStrings(
    [...String(text || "").matchAll(/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/gi)].map(
      (m) => m[0],
    ),
  );
}

export function parsePhones(text: string) {
  return uniqueStrings(
    [...String(text || "").matchAll(/(?:\+?86[-\s]?)?(?:0\d{2,3}[-\s]?)?\d{7,11}/g)]
      .map((m) => m[0].replace(/\s+/g, " ").trim())
      .filter((p) => p.replace(/\D/g, "").length >= 8),
  );
}

export function parseWebsite(contact: string, apply: string) {
  const urls = [
    ...String(contact || "").matchAll(/https?:\/\/[^\s)）]+/gi),
    ...String(apply || "").matchAll(/https?:\/\/[^\s)）]+/gi),
  ].map((m) => m[0].replace(/[.,;。，]+$/, ""));
  const site = urls.find((u) => !/at0086|17gz\.org|Login\.aspx/i.test(u));
  return site || urls[0] || null;
}

export function parseIntakeMonths(deadline: string, project: string) {
  const text = `${deadline} ${project}`;
  const months = new Set<number>();
  if (/春季|2\/3月|二月|三月|3月/.test(text)) months.add(3);
  if (/2\/3月|二月|2月开学/.test(text)) months.add(2);
  if (/秋季|九月|9月/.test(text)) months.add(9);
  if (/五月|5月入学/.test(text)) months.add(5);
  if (/随到随学|全年/.test(text)) {
    months.add(3);
    months.add(9);
  }
  return [...months].sort((a, b) => a - b);
}

export function parseScholarshipFlag(text: string) {
  const value = String(text || "").trim();
  if (value.includes("✅") && !value.includes("？") && !value.includes("❌")) return true;
  if (value.includes("❌")) return false;
  return null;
}

export function parseHousing(text: string) {
  const cleaned = String(text || "").replace(/,/g, "");
  if (!cleaned.trim() || /^[？?]/.test(cleaned.trim())) return [];
  const yearly: Array<{ type: string; price_cny_year: number }> = [];
  const re =
    /(\d+)\s*元?(?:\/人)?(?:\/床位)?\s*(?:\/)?(学年|年|学期|月)?[^（(]{0,8}[（(]?([^）)\n]{0,12})/g;
  let match: RegExpExecArray | null;
  while ((match = re.exec(cleaned))) {
    const amount = Number(match[1]);
    if (!Number.isFinite(amount) || amount < 200 || amount > 80000) continue;
    const unit = match[2] || "";
    const room = String(match[3] || "").trim();
    const year =
      unit === "月" ? amount * 12 : unit === "学期" ? amount * 2 : amount;
    yearly.push({
      type: room || (unit === "月" ? "mensuel" : "on_campus"),
      price_cny_year: year,
    });
  }
  return uniqueBy(yearly, (h) => `${h.type}|${h.price_cny_year}`).slice(0, 6);
}

export function parseDocuments(text: string) {
  const lines = String(text || "")
    .split(/\n+/)
    .map((line) => line.replace(/^\s*\d+[．.\s)）]+/, "").trim())
    .filter((line) => line.length > 3);
  const docs: Array<{ type: string; required: boolean; notes: string; applies_to: string[] }> = [];
  for (const line of lines) {
    const hint = DOC_HINTS.find(([re]) => re.test(line));
    const type = hint ? documentLabel(hint[1]) : line.slice(0, 40);
    docs.push({
      type,
      required: true,
      notes: line.slice(0, 180),
      applies_to: ["language"],
    });
  }
  return uniqueBy(docs, (d) => d.type).slice(0, 16);
}

export function dedupeLanguageRecords(rows: LanguageCsvRecord[]) {
  const byZh = new Map<string, LanguageCsvRecord>();
  for (const row of rows) {
    const current = byZh.get(row.name_zh);
    if (!current) {
      byZh.set(row.name_zh, row);
      continue;
    }
    byZh.set(row.name_zh, {
      name_zh: current.name_zh,
      city_raw: firstFilled(current.city_raw, row.city_raw) || "",
      project: joinFilled(current.project, row.project),
      tuition: preferNumbered(current.tuition, row.tuition),
      age: firstFilled(current.age, row.age) || "",
      foundation: joinFilled(current.foundation, row.foundation),
      dormitory: preferNumbered(current.dormitory, row.dormitory),
      deadline: joinFilled(current.deadline, row.deadline),
      apply_website: firstFilled(current.apply_website, row.apply_website) || "",
      contact: joinFilled(current.contact, row.contact),
      pathway: joinFilled(current.pathway, row.pathway),
      documents: current.documents.length >= row.documents.length ? current.documents : row.documents,
      note: joinFilled(current.note, row.note),
      scholarship: firstFilled(current.scholarship, row.scholarship) || "",
    });
  }
  return [...byZh.values()];
}

export function buildLanguageAdmission(
  row: LanguageCsvRecord,
  crawl?: { presentation?: string | null },
) {
  const tuition = parseTuitionCny(row.tuition);
  const age = parseAgeRange(row.age);
  const housing = parseHousing(row.dormitory);
  const intake = parseIntakeMonths(row.deadline, row.project);
  const fee = parseApplicationFee(`${row.tuition} ${row.note}`);
  const durationYears = /4年/.test(row.project) ? 4 : /1学期|学期/.test(row.project) ? 0.5 : 1;
  const zeroBase = /0基础|零基础/.test(row.foundation);
  const other = [
    compactText(row.foundation),
    compactText(row.pathway),
    compactText(row.deadline) ? `Deadline langue : ${compactText(row.deadline)}` : null,
    compactText(row.note),
  ].filter(Boolean);

  return {
    presentation: crawl?.presentation || null,
    chinese_language_program_available: true,
    degrees: ["language"],
    fields: ["chinese_language"],
    teaching_languages: ["zh"],
    programs: [
      {
        level: "language",
        name: compactText(row.project) || "汉语言进修",
        field: "chinese_language",
        language: "zh",
        duration_years: durationYears,
        start_months: intake,
      },
    ],
    requirements: {
      language: {
        academic: compactText(row.foundation) || "Passeport valide, non-citoyen chinois",
        min_gpa: null,
        age_min: age.min,
        age_max: age.max,
        hsk_level: zeroBase ? 0 : null,
        hsk_score_min: null,
        ielts_min: null,
        toefl_min: null,
        preparatory_if_insufficient: null,
        other,
      },
    },
    age_max: { language: age.max },
    documents: parseDocuments(row.documents),
    application: {
      platform_name: platformName(row.apply_website),
      platform_url: filled(row.apply_website),
      deadline: compactText(row.deadline),
      intake_months: intake,
      application_fee_cny: fee,
      steps: [],
      opens_at: null,
    },
    fees: {
      tuition: {
        language: { min: tuition.min, max: tuition.max },
      },
      housing,
    },
    language: {
      preparatory: zeroBase ? "0基础 accepté" : null,
      foundation: compactText(row.foundation),
    },
    has_university_scholarship: parseScholarshipFlag(row.scholarship),
  };
}

export function mergeLanguageAdmission(
  extra: Record<string, unknown> | null | undefined,
  languageAdmission: Record<string, unknown>,
) {
  const current = extra && typeof extra === "object" ? { ...extra } : {};
  const existing = asRecord(current.admission);
  const incomingPrograms = asArray(languageAdmission.programs);
  const existingPrograms = asArray(existing.programs).filter(
    (p) => !isLanguageLevel(asRecord(p).level),
  );
  const existingFees = asRecord(existing.fees);
  const incomingFees = asRecord(languageAdmission.fees);
  const existingTuition = asRecord(existingFees.tuition);
  const incomingTuition = asRecord(incomingFees.tuition);
  const existingReq = asRecord(existing.requirements);
  const incomingReq = asRecord(languageAdmission.requirements);
  const existingAge = asRecord(existing.age_max);
  const incomingAge = asRecord(languageAdmission.age_max);
  const existingHousing = Array.isArray(existingFees.housing)
    ? existingFees.housing
    : [];
  const incomingHousing = Array.isArray(incomingFees.housing)
    ? incomingFees.housing
    : [];

  return {
    ...current,
    admission: {
      ...existing,
      presentation: filled(existing.presentation) || languageAdmission.presentation || null,
      chinese_language_program_available: true,
      degrees: uniqueStrings([
        ...asArray(existing.degrees),
        ...asArray(languageAdmission.degrees),
        "language",
      ]),
      fields: uniqueStrings([
        ...asArray(existing.fields),
        ...asArray(languageAdmission.fields),
        "chinese_language",
      ]),
      programs: [...existingPrograms, ...incomingPrograms],
      requirements: {
        ...existingReq,
        language: incomingReq.language || existingReq.language || null,
      },
      age_max: {
        ...existingAge,
        language: incomingAge.language ?? existingAge.language ?? null,
      },
      fees: {
        ...existingFees,
        tuition: {
          ...existingTuition,
          language: incomingTuition.language || existingTuition.language || null,
        },
        housing: existingHousing.length ? existingHousing : incomingHousing,
      },
      application: {
        ...asRecord(languageAdmission.application),
        ...asRecord(existing.application),
        platform_url:
          filled(asRecord(existing.application).platform_url) ||
          asRecord(languageAdmission.application).platform_url ||
          null,
        platform_name:
          filled(asRecord(existing.application).platform_name) ||
          asRecord(languageAdmission.application).platform_name ||
          null,
      },
    },
  };
}

export function languageRecordToScanProfile(
  row: LanguageCsvRecord,
  meta: LanguageUniMeta,
  crawl?: { presentation?: string | null },
): ScanProfile {
  const emails = parseEmails(row.contact);
  const phones = parsePhones(row.contact);
  const website = parseWebsite(row.contact, row.apply_website);
  const admission = buildLanguageAdmission(row, crawl);
  const tuition = parseTuitionCny(row.tuition);
  const age = parseAgeRange(row.age);
  return {
    slug: meta.slug,
    name_zh: row.name_zh,
    name_en: meta.name_en,
    notes: compactText([row.pathway, row.note].filter(Boolean).join("\n")),
    identity: {
      name_zh: row.name_zh,
      name_en: meta.name_en,
      name_fr: meta.name_fr,
      website,
      international_website: website,
      application_portal_url: filled(row.apply_website),
    },
    matching: {
      city: meta.city,
      province: meta.province,
      fields: ["chinese_language"],
      chinese_language_program_available: true,
      degrees: ["language"],
      languages: ["zh"],
      tuition_cny_min: tuition.min,
      tuition_cny_max: tuition.max,
      deadline_typical: compactText(row.deadline),
      intake_months: admission.application.intake_months,
      has_university_scholarship: parseScholarshipFlag(row.scholarship),
    },
    contacts: {
      admissions_email: emails[0] || null,
      phone: phones[0] || null,
    },
    application: {
      platform_url: filled(row.apply_website),
      platform_name: platformName(row.apply_website),
      deadline: compactText(row.deadline),
      intake_months: admission.application.intake_months,
      application_fee_cny: admission.application.application_fee_cny,
    },
    fees: {
      tuition_cny_year: { language: admission.fees.tuition.language },
      housing: { on_campus: admission.fees.housing },
    },
    programs: admission.programs,
    documents: admission.documents.map((d) => ({
      type: d.type,
      required: d.required,
      notes: d.notes,
      applies_to: d.applies_to,
    })),
    admission_requirements: {
      language: {
        academic: asRecord(admission.requirements.language).academic,
        age_min: age.min,
        age_max: age.max,
        hsk_level: asRecord(admission.requirements.language).hsk_level,
        other: asArray(asRecord(admission.requirements.language).other),
      },
    },
    general: {
      location: { city: meta.city, province: meta.province },
      presentation: crawl?.presentation || `${meta.name_fr} — programme de langue chinoise pour étudiants internationaux.`,
      teaching_languages: ["zh"],
    },
    language: admission.language,
  };
}

function isLanguageLevel(level: unknown) {
  const value = String(level || "").toLowerCase();
  return value === "language" || value === "foundation" || value === "langue";
}

function platformName(url: string) {
  if (/at0086/.test(url)) return "Study in China (at0086)";
  if (/17gz/.test(url)) return "Easy Apply (17gz)";
  if (url) return "Portail de candidature";
  return null;
}

function compactText(value: unknown) {
  const text = String(value || "")
    .replace(/\r/g, "")
    .replace(/[ \t]+\n/g, "\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
  return text && !/^[？?]+$/.test(text) ? text : null;
}

function preferNumbered(a: string, b: string) {
  const aHas = /\d/.test(a) && !/^[？?]+$/.test(a.trim());
  const bHas = /\d/.test(b) && !/^[？?]+$/.test(b.trim());
  if (aHas && !bHas) return a;
  if (bHas && !aHas) return b;
  return firstFilled(a, b) || "";
}

function joinFilled(a: string, b: string) {
  const left = compactText(a);
  const right = compactText(b);
  if (!left) return right || "";
  if (!right || left.includes(right)) return left;
  if (right.includes(left)) return right;
  return `${left}\n${right}`;
}

function filled(value: unknown): string | null {
  if (value === null || value === undefined) return null;
  const text = String(value).trim();
  return text && !/^[？?]+$/.test(text) ? text : null;
}

function firstFilled(...values: unknown[]) {
  for (const value of values) {
    const next = filled(value);
    if (next) return next;
  }
  return null;
}

function asRecord(value: unknown): Record<string, unknown> {
  if (value && typeof value === "object" && !Array.isArray(value)) {
    return value as Record<string, unknown>;
  }
  return {};
}

function asArray(value: unknown): unknown[] {
  return Array.isArray(value) ? value : [];
}

function uniqueStrings(values: unknown[]) {
  const out: string[] = [];
  const seen = new Set<string>();
  for (const value of values) {
    const text = filled(value);
    if (!text) continue;
    const key = text.toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);
    out.push(text);
  }
  return out;
}

function uniqueBy<T>(items: T[], keyFn: (item: T) => unknown): T[] {
  const out: T[] = [];
  const seen = new Set<string>();
  for (const item of items) {
    const key = String(keyFn(item) || "");
    if (!key || seen.has(key)) continue;
    seen.add(key);
    out.push(item);
  }
  return out;
}
