import {
  DOMAIN_FAMILIES,
  DOMAIN_KEYS,
  EUR_TO_CNY,
  categoryFromScore,
  infoStatus,
  normalizeText,
  priorityFromScore,
} from "./constants";

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

function familyOf(field) {
  return Object.entries(DOMAIN_FAMILIES).find(([, fields]) =>
    fields.includes(field),
  )?.[0];
}

function domainOverlap(studentField, university) {
  if (!studentField || studentField === "Autre") {
    return { score: null, related: false, hit: false, unknownStudent: true };
  }
  const keys = (DOMAIN_KEYS[studentField] || [normalizeText(studentField)]).map(
    normalizeText,
  );
  const structured = (university.fieldKeys || []).map(normalizeText).filter(Boolean);
  const haystack = normalizeText(
    [
      ...(university.fields || []),
      ...(university.majors || []),
      ...(university.programs || []).map((p) => `${p.name} ${p.field}`),
    ].join(" "),
  );

  const matchesKeys = (pool) =>
    keys.some((key) => pool.some((item) => item.includes(key) || key.includes(item)));

  if (structured.length) {
    if (matchesKeys(structured) || keys.some((key) => haystack.includes(key))) {
      return { score: "strong", related: false, hit: true };
    }
    const studentFamily = familyOf(studentField);
    if (studentFamily) {
      const related = DOMAIN_FAMILIES[studentFamily].some((label) => {
        const aliases = (DOMAIN_KEYS[label] || []).map(normalizeText);
        return aliases.some(
          (key) => structured.some((item) => item.includes(key)) || haystack.includes(key),
        );
      });
      if (related) return { score: "related", related: true, hit: true };
    }
    return { score: "none", related: false, hit: false };
  }

  if (!haystack) {
    return { score: null, related: false, hit: false, unknownUniversity: true };
  }
  if (keys.some((key) => haystack.includes(key))) {
    return { score: "strong", related: false, hit: true };
  }
  const hasLatin = /[a-z]/.test(haystack);
  if (!hasLatin) {
    return { score: null, related: false, hit: false, unknownUniversity: true };
  }
  return { score: "none", related: false, hit: false };
}

function englishLevelScore(english) {
  const value = normalizeText(english);
  if (!value || value === "none" || value === "aucun") return 0;
  if (value.includes("c1") || value.includes("ielts7") || value.includes("ielts 7")) return 4;
  if (value.includes("b2") || value.includes("ielts6") || value.includes("ielts 6")) return 3;
  if (value.includes("b1") || value.includes("ielts5")) return 2;
  if (value.includes("a2") || value.includes("a1")) return 1;
  return 2;
}

function scoreDomain(student, university, flags) {
  const overlap = domainOverlap(student.field, university);
  if (overlap.unknownStudent) {
    flags.toVerify.push("Domaine d'études de l'étudiant à préciser");
    return { points: 12, max: 25, status: "missing", note: "Domaine étudiant manquant." };
  }
  if (overlap.unknownUniversity) {
    flags.toVerify.push("Domaines et programmes de l'université à vérifier");
    return {
      points: 14,
      max: 25,
      status: "missing",
      note: "Programmes universitaires non renseignés.",
    };
  }
  if (overlap.score === "strong") {
    flags.confirmed.push("Domaine correspondant aux programmes identifiés");
    return { points: 25, max: 25, status: "confirmed", note: "Forte correspondance de domaine." };
  }
  if (overlap.score === "related") {
    flags.estimated.push("Domaine proche, pas une correspondance exacte");
    return { points: 16, max: 25, status: "estimated", note: "Domaine connexe." };
  }
  return { points: 0, max: 25, status: "confirmed", note: "Domaine incompatible.", exclude: true };
}

function scoreLevel(student, university, flags) {
  const target = student.targetDegree;
  if (!target) {
    flags.toVerify.push("Niveau d'études visé à confirmer");
    return { points: 8, max: 15, status: "missing", note: "Niveau visé non confirmé." };
  }
  if (!university.degrees.length) {
    flags.toVerify.push("Niveaux d'études acceptés par l'université à vérifier");
    return { points: 8, max: 15, status: "missing", note: "Niveaux universitaires inconnus." };
  }
  if (university.degrees.includes(target)) {
    flags.confirmed.push(`Niveau ${target} proposé`);
    return { points: 15, max: 15, status: "confirmed", note: `Niveau ${target} disponible.` };
  }
  if (university.chineseLanguageProgram && target !== "language") {
    flags.estimated.push("Année de langue possible comme passerelle");
    return {
      points: 8,
      max: 15,
      status: "estimated",
      note: "Niveau visé absent, mais année de langue possible.",
      signal: "level_bridge",
    };
  }
  return {
    points: 0,
    max: 15,
    status: "confirmed",
    note: "Niveau d'études incompatible.",
    exclude: true,
  };
}

function scoreBudget(student, university, flags) {
  const tuition = university.tuitionMin;
  if (!student.budget) {
    flags.missing.push("Budget annuel de l'étudiant");
    return { points: 10, max: 20, status: "missing", note: "Budget non renseigné." };
  }
  if (tuition == null) {
    flags.toVerify.push("Frais de scolarité exacts à demander à l'université");
    return { points: 11, max: 20, status: "missing", note: "Frais universitaires inconnus." };
  }
  const maxCny = student.budget.maxEur * EUR_TO_CNY;
  const housing = university.housingMin || 0;
  const yearly = tuition + housing;
  const hasScholarship =
    university.hasCsc || university.hasUniScholarship || university.hasProvincial;
  if (maxCny >= yearly) {
    flags.confirmed.push("Budget a priori suffisant pour les frais connus");
    return { points: 20, max: 20, status: "confirmed", note: "Budget couvre les frais connus." };
  }
  if (maxCny >= tuition) {
    flags.estimated.push("Budget tendu une fois le logement inclus");
    return { points: 14, max: 20, status: "estimated", note: "Scolarité OK, logement à arbitrer." };
  }
  if (hasScholarship && student.scholarshipGoal !== "none") {
    flags.warnings.push("Budget insuffisant sans bourse");
    return {
      points: 10,
      max: 20,
      status: "estimated",
      note: "Budget inférieur aux frais ; bourse probablement nécessaire.",
    };
  }
  flags.warnings.push("Budget insuffisant par rapport aux frais connus");
  return {
    points: 5,
    max: 20,
    status: "confirmed",
    note: "Budget insuffisant.",
  };
}

function scoreLanguage(student, university, flags) {
  const hskRequired = university.hsk;
  const englishOk = university.englishAvailable;
  const studentHsk = student.hsk;
  const studentEnglish = englishLevelScore(student.english);

  if (hskRequired == null && !englishOk && !university.languageRequirements) {
    flags.toVerify.push("Exigences linguistiques à confirmer");
    return { points: 8, max: 15, status: "missing", note: "Langue d'enseignement à vérifier." };
  }

  if (englishOk && studentHsk == null) {
    flags.confirmed.push("Programmes en anglais identifiés");
    const points = studentEnglish >= 2 ? 13 : studentEnglish === 1 ? 9 : 8;
    if (student.english == null) flags.missing.push("Niveau d'anglais de l'étudiant");
    return {
      points,
      max: 15,
      status: student.english ? "confirmed" : "estimated",
      note: "Cours en anglais possibles.",
    };
  }

  if (hskRequired != null) {
    if (studentHsk == null) {
      flags.missing.push("Niveau HSK de l'étudiant");
      if (englishOk) {
        flags.estimated.push("HSK requis, mais une piste en anglais existe");
        return { points: 8, max: 15, status: "missing", note: "HSK non renseigné." };
      }
      return { points: 7, max: 15, status: "missing", note: "HSK étudiant inconnu." };
    }
    if (studentHsk >= hskRequired) {
      flags.confirmed.push(`HSK ${studentHsk} ≥ HSK ${hskRequired} requis`);
      return { points: 15, max: 15, status: "confirmed", note: "Niveau de chinois suffisant." };
    }
    const gap = hskRequired - studentHsk;
    const points = gap === 1 ? 6 : 3;
    flags.warnings.push(`HSK insuffisant (HSK ${studentHsk} vs HSK ${hskRequired})`);
    if (university.chineseLanguageProgram) {
      flags.estimated.push("Année de langue chinoise possible pour rattraper le HSK");
      return { points: points + 3, max: 15, status: "estimated", note: "HSK insuffisant, passerelle langue." };
    }
    return { points, max: 15, status: "confirmed", note: "Pénalité linguistique importante." };
  }

  if (englishOk) {
    return { points: studentEnglish >= 2 ? 12 : 8, max: 15, status: "estimated", note: "Anglais possible." };
  }
  return { points: 8, max: 15, status: "estimated", note: "Langue à confirmer." };
}

function scoreIntake(student, university, flags) {
  if (student.intake.flexible) {
    return { points: 10, max: 10, status: "confirmed", note: "Rentrée flexible." };
  }
  const months = university.intakeMonths;
  if (!months.length) {
    flags.toVerify.push("Mois de rentrée à confirmer");
    return { points: 6, max: 10, status: "missing", note: "Calendrier universitaire inconnu." };
  }
  if (student.intake.month && months.includes(student.intake.month)) {
    const now = new Date();
    if (
      student.intake.year === now.getFullYear() &&
      student.intake.month <= now.getMonth() + 1
    ) {
      flags.warnings.push("Rentrée visée très proche ou déjà commencée");
      return { points: 4, max: 10, status: "estimated", note: "Rentrée possible mais délai critique." };
    }
    flags.confirmed.push("Mois de rentrée compatible");
    return { points: 10, max: 10, status: "confirmed", note: "Rentrée compatible." };
  }
  flags.warnings.push("Rentrée visée absente du calendrier connu");
  return { points: 3, max: 10, status: "confirmed", note: "Pénalité de rentrée." };
}

function scoreScholarship(student, university, flags) {
  const wants =
    student.scholarshipGoal === "required" || student.scholarshipGoal === "helpful";
  const hasAny =
    university.hasCsc || university.hasUniScholarship || university.hasProvincial;
  if (!hasAny && !university.scholarshipText) {
    flags.toVerify.push("Bourses à confirmer auprès de l'université");
    return { points: 2, max: 5, status: "missing", note: "Bourses non documentées." };
  }
  if (hasAny) {
    const names = [
      university.hasCsc ? "CSC" : null,
      university.hasUniScholarship ? "universitaire" : null,
      university.hasProvincial ? "provinciale / municipale" : null,
    ].filter(Boolean);
    flags.confirmed.push(`Bourses possibles : ${names.join(", ")}`);
    if (student.scholarshipGoal === "required") return { points: 5, max: 5, status: "confirmed", note: "Pistes de bourse identifiées." };
    return { points: wants ? 5 : 4, max: 5, status: "confirmed", note: "Bourses disponibles." };
  }
  if (student.scholarshipGoal === "required") {
    flags.warnings.push("Objectif bourse, mais aucune bourse listée");
    return { points: 1, max: 5, status: "estimated", note: "Peu de pistes de financement." };
  }
  return { points: 3, max: 5, status: "estimated", note: "Financement à préciser." };
}

function scoreAdmission(student, university, flags) {
  let points = 2;
  if (university.applicationUrl || university.emails.length) points += 1;
  if (university.documents.length) points += 1;
  if (university.confidence >= 0.6) points += 1;
  if (university.isPartner) points += 1;
  points = clamp(points, 0, 5);
  if (points <= 2) flags.toVerify.push("Procédure d'admission à vérifier");
  const missingDocs = (university.documents || []).filter((doc) => {
    const key = normalizeText(doc);
    if (key.includes("passeport") || key.includes("passport")) {
      return !student.documents.includes("passeport");
    }
    if (key.includes("diplome") || key.includes("diploma") || key.includes("degree")) {
      return !student.documents.includes("dernier_diplome");
    }
    return true;
  });
  if (missingDocs.length) {
    flags.missing.push(...missingDocs.slice(0, 6).map((d) => `Document : ${d}`));
  }
  return {
    points,
    max: 5,
    status: points >= 4 ? "confirmed" : "estimated",
    note: "Faisabilité d'admission selon la complétude du dossier université.",
    missingDocs,
  };
}

function scoreFormule(student, university, flags) {
  const n = student.formuleNumber;
  if (!n) {
    flags.estimated.push("Aucune formule choisie pour l'instant");
    return { points: 3, max: 5, status: "estimated", note: "Formule non choisie." };
  }
  if (n === 1) return { points: 4, max: 5, status: "confirmed", note: "Adapté à une première orientation." };
  if (n === 2) {
    const ready = Boolean(university.applicationUrl || university.emails.length);
    return {
      points: ready ? 5 : 3,
      max: 5,
      status: ready ? "confirmed" : "estimated",
      note: ready
        ? "Candidature accompagnée possible."
        : "Canal de candidature à confirmer.",
    };
  }
  const complete = Boolean(university.housingMin || university.contacts?.email);
  return {
    points: complete ? 5 : 3,
    max: 5,
    status: complete ? "confirmed" : "estimated",
    note: "Suivi jusqu'au départ possible, infos logement/visa à compléter.",
  };
}

function recommendFormula(student, breakdown, flags) {
  const languageGap = breakdown.language.points <= 6;
  const budgetTight = breakdown.budget.points <= 10;
  const manyWarnings = flags.warnings.length >= 3;
  if (languageGap || budgetTight || manyWarnings) return 3;
  if (student.formuleNumber) return student.formuleNumber;
  if (breakdown.domain.points >= 20 && breakdown.level.points >= 12) return 2;
  return 1;
}

export function matchUniversity(student, university) {
  const flags = {
    confirmed: [],
    estimated: [],
    missing: [],
    toVerify: [],
    warnings: [],
  };

  if (!university.isActive) {
    return { excluded: true, excludeReason: "Université inactive (hors matching)." };
  }

  const ageLimit = student.targetDegree
    ? university.ageMax[student.targetDegree]
    : null;
  if (student.age && ageLimit && student.age > ageLimit) {
    return {
      excluded: true,
      excludeReason: `Âge ${student.age} ans supérieur à la limite connue (${ageLimit}).`,
    };
  }
  if (student.age && !ageLimit) {
    flags.toVerify.push("Âge maximum à vérifier selon le programme");
  }

  const domain = scoreDomain(student, university, flags);
  if (domain.exclude) {
    return { excluded: true, excludeReason: "Domaine d'études incompatible." };
  }
  const level = scoreLevel(student, university, flags);
  if (level.exclude) {
    return { excluded: true, excludeReason: "Niveau d'études incompatible." };
  }

  const budget = scoreBudget(student, university, flags);
  const language = scoreLanguage(student, university, flags);
  const intake = scoreIntake(student, university, flags);
  const scholarship = scoreScholarship(student, university, flags);
  const admission = scoreAdmission(student, university, flags);
  const formule = scoreFormule(student, university, flags);

  const breakdown = { domain, level, budget, language, intake, scholarship, admission, formule };
  const score = Object.values(breakdown).reduce((sum, item) => sum + item.points, 0);
  const recommendedFormula = recommendFormula(student, breakdown, flags);

  return {
    excluded: false,
    university_id: university.id,
    university_name: university.displayName,
    university_name_zh: university.nameZh,
    university_name_en: university.nameEn,
    city: university.city,
    province: university.province,
    score,
    category: categoryFromScore(score),
    priority: priorityFromScore(score),
    breakdown,
    confirmed_information: [...new Set(flags.confirmed)],
    estimated_information: [...new Set(flags.estimated)],
    missing_information: [...new Set(flags.missing)],
    to_verify: [...new Set(flags.toVerify)],
    warnings: [...new Set(flags.warnings)],
    missing_documents: admission.missingDocs || [],
    scholarships_possible: [
      university.hasCsc ? "CSC" : null,
      university.hasUniScholarship ? "Bourse universitaire" : null,
      university.hasProvincial ? "Bourse provinciale / municipale" : null,
    ].filter(Boolean),
    cost_estimate: {
      tuition_cny: university.tuitionMin,
      tuition_cny_max: university.tuitionMax,
      housing_cny: university.housingMin,
      currency: "CNY",
      status:
        university.tuitionMin == null ? "missing" : "estimated",
    },
    teaching_language: university.englishAvailable
      ? university.hsk
        ? "Chinois et anglais (selon programme)"
        : "Anglais possible"
      : university.hsk
        ? `Chinois (HSK ${university.hsk}+)`
        : "À vérifier",
    deadline: university.deadline,
    website: university.website,
    recommended_formula: recommendedFormula,
    university,
  };
}

export function rankMatches(student, universities) {
  const ranked = [];
  const excluded = [];
  for (const university of universities) {
    const result = matchUniversity(student, university);
    if (result.excluded) excluded.push({ ...result, university_name: university.displayName });
    else ranked.push(result);
  }
  ranked.sort((a, b) => b.score - a.score);
  return { ranked, excluded };
}
