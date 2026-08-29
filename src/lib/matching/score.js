import {
  CATEGORY_META,
  categoryMetaFromScore,
  englishToIelts,
  infoStatus,
  normalizeText,
  priorityFromScore,
} from "./constants";
import { scoreMotivationIa } from "./enrich";
import { domainPassesHardFilter, domainSimilarity } from "./semantic";
import { MATCHING_WEIGHTS } from "./weights";

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

function diplomaFitsTarget(student) {
  const diploma = normalizeText(student.dernierDiplome);
  const target = student.targetDegree;
  if (!diploma || !target) return null;
  if (target === "bachelor") return diploma.includes("bac") || diploma.includes("lycee");
  if (target === "master") {
    return diploma.includes("licence") || diploma.includes("bachelor");
  }
  if (target === "phd") {
    return diploma.includes("master") || diploma.includes("doctorat") || diploma.includes("phd");
  }
  if (target === "language") return true;
  return null;
}

function intakeTooFar(student, university) {
  if (student.intake?.flexible) return false;
  const months = university.intakeMonths || [];
  if (!student.intake?.month || !months.length) return false;
  if (months.includes(student.intake.month)) return false;
  const closest = months.reduce(
    (best, month) => Math.min(best, Math.abs(month - student.intake.month)),
    12,
  );
  return closest >= 5;
}

function hardFilter(student, university) {
  if (!university.isActive) {
    return { pass: false, reason: "Université inactive (hors matching)." };
  }
  if (student.age && university.ageMin && student.age < university.ageMin) {
    return { pass: false, reason: `Âge ${student.age} ans inférieur au minimum connu (${university.ageMin}).` };
  }
  const ageMax = university.ageMaxForDegree?.(student.targetDegree);
  if (student.age && ageMax && student.age > ageMax) {
    return {
      pass: false,
      reason: `Âge ${student.age} ans supérieur à la limite connue (${ageMax}).`,
    };
  }
  if (student.targetDegree && university.degrees.length) {
    const ok =
      university.degrees.includes(student.targetDegree) ||
      (student.targetDegree !== "language" && university.chineseLanguageProgram);
    if (!ok) {
      return { pass: false, reason: "Niveau d'études incompatible." };
    }
  }
  const overlap = domainSimilarity(student.field, university);
  if (!domainPassesHardFilter(overlap)) {
    return { pass: false, reason: "Domaine d'études incompatible.", overlap };
  }
  if (intakeTooFar(student, university)) {
    return { pass: false, reason: "Rentrée visée trop éloignée du calendrier connu." };
  }
  return { pass: true, overlap };
}

function scoreLangue(student, university, flags) {
  const hskRequired = university.hskForDegree?.(student.targetDegree) ?? university.hsk;
  const ieltsRequired = university.ielts;
  const studentHsk = student.hsk;
  const studentIelts =
    student.ielts != null ? student.ielts : englishToIelts(student.english);

  if (studentHsk == null && studentIelts == null && !university.englishAvailable) {
    flags.estimated.push("Langue : niveau débutant retenu par défaut");
    return { points: 20, max: 100, status: "missing", note: "Aucun score de langue : plancher débutant." };
  }

  if (studentHsk == null && studentIelts == null) {
    flags.estimated.push("Langue non documentée — score plancher");
    const points = university.englishAvailable ? 35 : 20;
    return { points, max: 100, status: "missing", note: "Score plancher, débutant total." };
  }

  let score = 50;
  if (studentHsk != null && hskRequired != null) {
    const ecart = studentHsk - hskRequired;
    if (ecart >= 0) {
      score += Math.min(ecart * 15, 30);
      flags.confirmed.push(`HSK ${studentHsk} ≥ HSK ${hskRequired} requis`);
    } else {
      score += Math.max(ecart * 25, -50);
      flags.warnings.push(`HSK insuffisant (HSK ${studentHsk} vs HSK ${hskRequired})`);
      if (university.chineseLanguageProgram) {
        flags.estimated.push("Année de langue chinoise possible pour rattraper le HSK");
        score += 8;
      }
    }
  } else if (university.englishAvailable && (studentIelts != null || student.english)) {
    flags.confirmed.push("Programmes en anglais identifiés");
    score += studentIelts >= 6 ? 20 : studentIelts >= 5 ? 10 : 0;
  }

  if (studentIelts != null && ieltsRequired != null) {
    const ecartIelts = studentIelts - ieltsRequired;
    if (ecartIelts >= 0) score += Math.min(ecartIelts * 3, 20);
    else score += Math.max(ecartIelts * 8, -25);
  }

  return {
    points: clamp(Math.round(score), 0, 100),
    max: 100,
    status: studentHsk == null ? "estimated" : "confirmed",
    note: "Compatibilité linguistique (HSK / IELTS / anglais).",
    required: hskRequired,
  };
}

function scoreAcademique(student, university, flags, overlap) {
  let score = 50;
  const gpaMin = university.gpaMinForDegree?.(student.targetDegree);
  if (student.gpa && gpaMin) {
    const diff = student.gpa - gpaMin;
    score += diff * 30;
    if (diff >= 0) flags.confirmed.push(`GPA ${student.gpa} ≥ ${gpaMin}`);
    else flags.warnings.push(`GPA ${student.gpa} sous le seuil ${gpaMin}`);
  } else if (student.gpa == null) {
    flags.toVerify.push("GPA / moyenne à préciser");
    score -= 8;
  }

  const fit = diplomaFitsTarget(student);
  if (fit === true) {
    score += 20;
    flags.confirmed.push("Diplôme cohérent avec le niveau visé");
  } else if (fit === false) {
    score -= 40;
    flags.warnings.push("Diplôme actuel peu aligné avec le niveau visé");
  } else {
    flags.toVerify.push("Correspondance diplôme / niveau visé à confirmer");
  }

  if (overlap?.hit === "strong") score += 8;
  else if (overlap?.hit === "related") score += 3;
  else if (overlap?.hit === "none") score -= 15;

  if (student.targetDegree && university.degrees.includes(student.targetDegree)) {
    flags.confirmed.push(`Niveau ${student.targetDegree} proposé`);
  }

  return {
    points: clamp(Math.round(score), 0, 100),
    max: 100,
    status: student.gpa ? "confirmed" : "estimated",
    note: "GPA, diplôme et correspondance de domaine.",
    required: gpaMin,
  };
}

function scoreFinancier(student, university, flags) {
  const cout =
    university.costTotalCny ||
    (university.tuitionMean || 0) +
      (university.housingMean || 0) +
      (university.livingCostYearly || 0);
  const budget = student.budgetCny;
  if (!budget) {
    flags.missing.push("Budget annuel de l'étudiant");
    return { points: 40, max: 100, status: "missing", note: "Budget non renseigné.", cost: cout };
  }
  if (!university.tuitionMean && university.tuitionMin == null) {
    flags.toVerify.push("Frais de scolarité exacts à demander à l'université");
    return { points: 45, max: 100, status: "missing", note: "Frais universitaires inconnus.", cost: cout };
  }
  const ratio = budget / Math.max(cout, 1);
  let points = 10;
  if (ratio >= 1.2) points = 100;
  else if (ratio >= 1.0) points = 80;
  else if (ratio >= 0.8) points = 50;
  else if (ratio >= 0.5) points = 25;
  else points = 10;

  if (points >= 80) flags.confirmed.push("Budget a priori suffisant pour le coût estimé");
  else if (points >= 50) flags.estimated.push("Budget tendu : bourse partielle probablement nécessaire");
  else flags.warnings.push("Budget insuffisant sans bourse complète");

  return {
    points,
    max: 100,
    status: points >= 80 ? "confirmed" : "estimated",
    note: `Ratio budget / coût estimé : ${ratio.toFixed(2)}.`,
    cost: cout,
  };
}

function scoreBourse(student, university, flags) {
  if (!student.besoinBourse) {
    return { points: 100, max: 100, status: "confirmed", note: "Pas de contrainte bourse." };
  }
  const types = university.scholarshipTypes || [];
  const hasAny =
    university.hasCsc || university.hasUniScholarship || university.hasProvincial || types.length;
  if (hasAny) {
    flags.confirmed.push(`Bourses possibles : ${types.slice(0, 3).join(", ")}`);
    return {
      points: Math.min(60 + types.length * 10, 100),
      max: 100,
      status: "confirmed",
      note: "Bourses documentées pour ce besoin de financement.",
    };
  }
  if (!university.scholarshipText) {
    flags.toVerify.push("Bourses à confirmer auprès de l'université");
    return { points: 25, max: 100, status: "missing", note: "Bourses non documentées." };
  }
  flags.warnings.push("Objectif bourse, mais peu de pistes listées");
  return { points: 10, max: 100, status: "estimated", note: "Gros risque si le dossier dépend d'une bourse." };
}

function scoreAge(student, university, flags) {
  if (!student.age) {
    flags.toVerify.push("Âge de l'étudiant à confirmer");
    return { points: 60, max: 100, status: "missing", note: "Âge non renseigné." };
  }
  const ageMax = university.ageMaxForDegree?.(student.targetDegree);
  if (!ageMax) {
    flags.toVerify.push("Âge maximum à vérifier selon le programme");
    return { points: 70, max: 100, status: "missing", note: "Limite d'âge inconnue." };
  }
  const marge = ageMax - student.age;
  if (marge >= 5) return { points: 100, max: 100, status: "confirmed", note: "Marge d'âge confortable." };
  if (marge >= 2) return { points: 80, max: 100, status: "confirmed", note: "Marge d'âge correcte." };
  if (marge >= 0) {
    flags.warnings.push("Âge proche de la limite connue");
    return { points: 60, max: 100, status: "estimated", note: "Âge proche du plafond." };
  }
  return { points: 0, max: 100, status: "confirmed", note: "Au-dessus de la limite d'âge." };
}

function scoreLocalisation(student, university) {
  const cities = (student.preferredCities || []).map(normalizeText).filter(Boolean);
  if (!cities.length) {
    return { points: 80, max: 100, status: "confirmed", note: "Pas de préférence de ville." };
  }
  const city = normalizeText(university.city);
  const province = normalizeText(university.province);
  if (cities.some((item) => item && (city.includes(item) || item.includes(city)))) {
    return { points: 100, max: 100, status: "confirmed", note: "Ville demandée." };
  }
  if (cities.some((item) => item && (province.includes(item) || item.includes(province)))) {
    return { points: 75, max: 100, status: "estimated", note: "Région proche de la préférence." };
  }
  return { points: 35, max: 100, status: "confirmed", note: "Hors des villes préférées." };
}

function weighted(parts) {
  const score = Object.entries(MATCHING_WEIGHTS).reduce((sum, [key, weight]) => {
    const value = parts[key]?.points ?? 0;
    return sum + weight * value;
  }, 0);
  return Math.round(clamp(score, 0, 100));
}

function recommendFormula(student, breakdown, flags) {
  const languageGap = breakdown.langue.points <= 40;
  const budgetTight = breakdown.financier.points <= 40;
  const manyWarnings = flags.warnings.length >= 3;
  if (languageGap || budgetTight || manyWarnings) return 3;
  if (student.formuleNumber) return student.formuleNumber;
  if (breakdown.academique.points >= 70 && breakdown.langue.points >= 60) return 2;
  return 1;
}

export function matchUniversity(student, university, { pedagogical = false } = {}) {
  const flags = {
    confirmed: [],
    estimated: [],
    missing: [],
    toVerify: [],
    warnings: [],
  };

  const filter = hardFilter(student, university);
  if (!filter.pass && !pedagogical) {
    return {
      excluded: true,
      excludeReason: filter.reason,
      university_id: university.id,
      university_name: university.displayName,
    };
  }

  const overlap = filter.overlap || domainSimilarity(student.field, university);
  const langue = scoreLangue(student, university, flags);
  const academique = scoreAcademique(student, university, flags, overlap);
  const financier = scoreFinancier(student, university, flags);
  const bourse = scoreBourse(student, university, flags);
  const age = scoreAge(student, university, flags);
  const localisation = scoreLocalisation(student, university);
  const motivation = {
    points: scoreMotivationIa(student.iaAnalysis),
    max: 100,
    status: student.iaEnriched ? "estimated" : "missing",
    note: student.iaEnriched
      ? "Clarté du projet extraite du texte libre."
      : "Pas assez de texte projet pour scorer la motivation.",
  };

  const breakdown = {
    langue,
    academique,
    financier,
    bourse,
    age,
    localisation,
    motivation,
  };
  const score = weighted(breakdown);
  const meta = filter.pass ? categoryMetaFromScore(score) : CATEGORY_META.unready;
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
    excluded: false,
    pedagogical: Boolean(filter.pass === false),
    excludeReason: filter.pass ? null : filter.reason,
    university_id: university.id,
    university_name: university.displayName,
    university_name_zh: university.nameZh,
    university_name_en: university.nameEn,
    city: university.city,
    province: university.province,
    score,
    categoryKey: meta.key,
    category: meta.label,
    category_subtitle: meta.subtitle,
    priority: priorityFromScore(score),
    breakdown,
    weights: MATCHING_WEIGHTS,
    confirmed_information: [...new Set(flags.confirmed)],
    estimated_information: [...new Set(flags.estimated)],
    missing_information: [...new Set(flags.missing)],
    to_verify: [...new Set(flags.toVerify)],
    warnings: [...new Set(flags.warnings)],
    missing_documents: missingDocs,
    scholarships_possible: university.scholarshipTypes || [],
    hsk_required: university.hskForDegree?.(student.targetDegree) ?? university.hsk,
    gpa_required: university.gpaMinForDegree?.(student.targetDegree) ?? null,
    cost_total_cny: financier.cost ?? university.costTotalCny,
    cost_estimate: {
      tuition_cny: university.tuitionMin,
      tuition_cny_max: university.tuitionMax,
      housing_cny: university.housingMin,
      living_cny: university.livingCostYearly,
      total_cny: financier.cost ?? university.costTotalCny,
      currency: "CNY",
      status: university.tuitionMin == null ? "missing" : "estimated",
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
    recommended_formula: recommendFormula(student, breakdown, flags),
    domain_similarity: overlap,
    university,
  };
}

export function rankMatches(student, universities) {
  const pedagogical = student.formuleNumber === 1;
  const ranked = [];
  const excluded = [];
  for (const university of universities) {
    if (!university.isActive) {
      excluded.push({
        excluded: true,
        university_name: university.displayName,
        excludeReason: "Université inactive (hors matching).",
      });
      continue;
    }
    const result = matchUniversity(student, university, { pedagogical });
    if (result.excluded) excluded.push(result);
    else ranked.push(result);
  }
  ranked.sort((a, b) => b.score - a.score);
  return { ranked, excluded };
}

export { infoStatus };
