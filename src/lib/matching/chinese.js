import { normalizeStudent } from "./student";
import { normalizeUniversity } from "./university";
import { normalizeText } from "./constants";
import {
  CHINESE_MATCHING_WEIGHTS,
  CHINESE_MATCH_SIZE,
  DEFAULT_LANGUAGE_TUITION_CNY,
  DEFAULT_LIVING_COST_CNY,
} from "./weights";

const MONTH_LABELS = {
  2: "février",
  3: "mars",
  4: "avril",
  9: "septembre",
  10: "octobre",
};

const CATEGORIES = {
  safety: { key: "safety", label: "Bien alignée" },
  match: { key: "match", label: "Possible" },
  reach: { key: "reach", label: "Écart" },
};

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

function filled(value) {
  if (value === null || value === undefined) return null;
  const text = String(value).trim();
  return text === "" ? null : text;
}

function unique(list) {
  return [...new Set((list || []).filter(Boolean))];
}

function categoryFromScore(score) {
  if (score >= 75) return CATEGORIES.safety;
  if (score >= 50) return CATEGORIES.match;
  return CATEGORIES.reach;
}

function monthLabel(month) {
  return MONTH_LABELS[Number(month)] || `mois ${month}`;
}

function intakeLabel(months) {
  const labels = unique((months || []).map(monthLabel));
  if (!labels.length) return "à confirmer auprès de l’école";
  return labels.join(" / ");
}

function costLabel(cost) {
  if (!cost?.total_cny) return "frais à confirmer auprès de l’école";
  const tuition = cost.tuition_cny
    ? `${Math.round(cost.tuition_cny).toLocaleString("fr-FR")} RMB de scolarité`
    : "scolarité à confirmer";
  const prefix = cost.status === "estimated" ? "environ " : "";
  return `${prefix}${tuition} · total estimé ${Math.round(cost.total_cny).toLocaleString("fr-FR")} RMB / an`;
}

function languageIntakeMonths(university) {
  const fromPrograms = (university.languagePrograms || []).flatMap(
    (program) => program.start_months || [],
  );
  const months = unique(
    [...fromPrograms, ...(university.intakeMonths || [])]
      .map(Number)
      .filter(Boolean),
  );
  return months;
}

function languageCost(university) {
  const tuitionKnown = university.languageTuitionMean != null;
  const tuition = tuitionKnown
    ? university.languageTuitionMean
    : DEFAULT_LANGUAGE_TUITION_CNY;
  const housing = university.housingMean ?? university.housingMin ?? 0;
  const living = university.livingCostYearly || DEFAULT_LIVING_COST_CNY;
  const total = tuition + housing + living;
  return {
    tuition_cny: tuition,
    housing_cny: housing || null,
    living_cny: living,
    total_cny: total,
    status: tuitionKnown ? "estimated" : "default",
    label: costLabel({
      tuition_cny: tuition,
      total_cny: total,
      status: tuitionKnown ? "estimated" : "default",
    }),
  };
}

function scoreCity(student, university) {
  const cities = (student.preferredCities || []).map(normalizeText).filter(Boolean);
  if (!cities.length) {
    return {
      points: 70,
      max: 100,
      note: "Aucune ville précisée : toutes les villes restent comparables.",
    };
  }
  const city = normalizeText(university.city);
  const province = normalizeText(university.province);
  if (cities.some((item) => city && (city.includes(item) || item.includes(city)))) {
    return { points: 100, max: 100, note: `Ville demandée : ${university.city}.` };
  }
  if (
    cities.some(
      (item) => province && (province.includes(item) || item.includes(province)),
    )
  ) {
    return {
      points: 72,
      max: 100,
      note: `Même région (${university.province}), pas la ville exacte.`,
    };
  }
  return {
    points: 28,
    max: 100,
    note: university.city
      ? `${university.city} n’est pas la ville demandée.`
      : "Ville de l’école non renseignée.",
  };
}

function scoreBudget(student, cost) {
  const budget = student.budgetCny;
  if (!budget) {
    return {
      points: 45,
      max: 100,
      note: "Budget annuel non renseigné.",
    };
  }
  const ratio = budget / Math.max(cost.total_cny, 1);
  let points = 10;
  if (ratio >= 1.2) points = 100;
  else if (ratio >= 1) points = 82;
  else if (ratio >= 0.8) points = 58;
  else if (ratio >= 0.55) points = 32;
  else points = 12;

  if (points >= 82) {
    return { points, max: 100, note: "Budget a priori suffisant pour une année de langue." };
  }
  if (points >= 58) {
    return { points, max: 100, note: "Budget tendu : à recouper avec les frais réels." };
  }
  return {
    points,
    max: 100,
    note: "Budget trop juste pour le coût estimé de cette ville / école.",
  };
}

function scoreIntake(student, months) {
  if (student.intake?.flexible) {
    return {
      points: 90,
      max: 100,
      note: "Rentrée flexible : le calendrier de l’école n’est pas bloquant.",
    };
  }
  const wanted = student.intake?.month;
  if (!wanted) {
    return {
      points: 60,
      max: 100,
      note: "Date de rentrée non précisée.",
    };
  }
  if (!months.length) {
    return {
      points: 55,
      max: 100,
      note: "Calendrier de rentrée à confirmer auprès de l’école.",
    };
  }
  if (months.includes(wanted)) {
    return {
      points: 100,
      max: 100,
      note: `Rentrée ${monthLabel(wanted)} proposée.`,
    };
  }
  const closest = months.reduce(
    (best, month) => Math.min(best, Math.abs(month - wanted)),
    12,
  );
  if (closest <= 2) {
    return {
      points: 70,
      max: 100,
      note: `Rentrée proche (${intakeLabel(months)}), pas le mois exact.`,
    };
  }
  return {
    points: 30,
    max: 100,
    note: `Rentrée visée (${monthLabel(wanted)}) éloignée du calendrier connu (${intakeLabel(months)}).`,
  };
}

function matchSchool(student, university) {
  if (!university.isActive) {
    return {
      excluded: true,
      university_name: university.displayName,
      excludeReason: "Établissement inactif.",
    };
  }
  if (!university.chineseLanguageProgram) {
    return {
      excluded: true,
      university_name: university.displayName,
      excludeReason: "Pas de programme de langue chinoise identifié.",
    };
  }

  const months = languageIntakeMonths(university);
  const cost = languageCost(university);
  const localisation = scoreCity(student, university);
  const financier = scoreBudget(student, cost);
  const intake = scoreIntake(student, months);

  const score = Math.round(
    clamp(
      localisation.points * CHINESE_MATCHING_WEIGHTS.localisation +
        financier.points * CHINESE_MATCHING_WEIGHTS.financier +
        intake.points * CHINESE_MATCHING_WEIGHTS.intake,
      0,
      100,
    ),
  );
  const category = categoryFromScore(score);
  const why = [];
  const vigilance = [];

  if (localisation.points >= 90) why.push(localisation.note);
  else if (localisation.points <= 40) vigilance.push(localisation.note);
  else why.push(localisation.note);

  if (financier.points >= 80) why.push(financier.note);
  else vigilance.push(financier.note);

  if (intake.points >= 85) why.push(intake.note);
  else if (intake.points <= 45) vigilance.push(intake.note);
  else why.push(intake.note);

  if (cost.status === "default") {
    vigilance.push("Frais de scolarité langue non chiffrés : montant type retenu.");
  }
  if (!months.length) {
    vigilance.push("Dates de rentrée à confirmer auprès de l’école.");
  }

  return {
    excluded: false,
    university_id: university.id,
    university_name: university.displayName,
    university_name_zh: university.nameZh,
    city: university.city,
    province: university.province,
    website: university.website,
    program_name: university.languageProgramName,
    score,
    categoryKey: category.key,
    category: category.label,
    breakdown: { localisation, financier, intake },
    cost,
    intake_months: months,
    intake_label: intakeLabel(months),
    why: unique(why).slice(0, 3),
    vigilance: unique(vigilance).slice(0, 4),
    deadline: university.deadline,
  };
}

function scorePhrase(item) {
  if (item.categoryKey === "safety") {
    return "Ville, budget et rentrée s’alignent bien avec votre demande.";
  }
  if (item.categoryKey === "match") {
    return "Piste possible : un critère reste à confirmer (ville, budget ou date).";
  }
  return "Écart sur la ville, le budget ou la rentrée visée.";
}

function profileBlurb(student) {
  const city = student.preferredCities?.[0];
  const budget = student.budget?.label;
  const intake = student.intake?.label;
  const bits = [];
  if (city) bits.push(`ville visée : ${city}`);
  if (budget) bits.push(`budget ${budget}`);
  if (intake && intake !== "Flexible") bits.push(`rentrée ${intake}`);
  else if (student.intake?.flexible) bits.push("rentrée flexible");
  if (!bits.length) {
    return "Voici des écoles de langue en Chine, classées selon les données disponibles. Précisez une ville, un budget et une rentrée pour affiner.";
  }
  return `Sélection d’écoles de langue selon ${bits.join(", ")}. Les frais exacts et les dates restent à confirmer auprès de chaque établissement.`;
}

function studentView(student, matches) {
  const schools = matches.map((item, index) => ({
    id: item.university_id,
    name: item.university_name,
    city: item.city || "ville à confirmer",
    score: item.score,
    score_phrase: scorePhrase(item),
    best_match: index === 0,
    categoryKey: item.categoryKey,
    category: item.category,
    cost: { label: item.cost?.label },
    intake: item.intake_label,
    why: item.why,
    vigilance: item.vigilance,
    breakdown: [
      {
        key: "localisation",
        label: "Ville",
        points: item.breakdown.localisation.points,
        max: 100,
      },
      {
        key: "financier",
        label: "Budget",
        points: item.breakdown.financier.points,
        max: 100,
      },
      {
        key: "intake",
        label: "Rentrée",
        points: item.breakdown.intake.points,
        max: 100,
      },
    ],
  }));

  return {
    generated_at: new Date().toISOString(),
    profile_blurb: profileBlurb(student),
    criteria: {
      city: student.preferredCities?.[0] || "aucune ville précisée",
      budget: student.budget?.label || "à préciser",
      intake: student.intake?.label || "à préciser",
    },
    schools,
    disclaimer:
      "Aucune inscription, bourse ou visa n’est garantie. Les frais et dates restent à confirmer auprès de l’école.",
  };
}

export function chineseCitiesFromCatalog(universities) {
  return unique(
    universities
      .map(normalizeUniversity)
      .filter((item) => item.chineseLanguageProgram && item.city)
      .map((item) => item.city),
  ).sort((a, b) => a.localeCompare(b, "fr"));
}

export function runChineseMatching({ contact, universities, overrides = {} }) {
  const patched = {
    ...contact,
    budget: filled(overrides.budgetKey) || contact.budget,
    date_rentree: filled(overrides.dateRentree) || contact.date_rentree,
  };
  const student = normalizeStudent(patched, {
    ...overrides,
    targetDegree: "language",
    preferredCity: filled(overrides.preferredCity),
    preferredCities: filled(overrides.preferredCity)
      ? [overrides.preferredCity]
      : overrides.preferredCities || [],
  });

  const catalog = universities.map(normalizeUniversity);
  const ranked = [];
  const excluded = [];

  for (const university of catalog) {
    const result = matchSchool(student, university);
    if (result.excluded) excluded.push(result);
    else ranked.push(result);
  }

  ranked.sort((a, b) => b.score - a.score);
  const matches = ranked.slice(0, CHINESE_MATCH_SIZE);

  return {
    kind: "chinese",
    generated_at: new Date().toISOString(),
    student: {
      name: student.name,
      budgetKey: student.budgetKey,
      budget: student.budget,
      budgetCny: student.budgetCny,
      preferredCities: student.preferredCities,
      intake: student.intake,
      formuleNumber: student.formuleNumber,
    },
    matches,
    excluded: excluded.slice(0, 40).map((item) => ({
      university_name: item.university_name,
      excludeReason: item.excludeReason,
    })),
    student_view: studentView(student, matches),
    overrides,
  };
}

export function compactChineseMatchingResult(result, overrides = {}) {
  return {
    version: 1,
    kind: "chinese",
    generated_at: result.generated_at,
    student: result.student,
    matches: result.matches,
    excluded: result.excluded,
    student_view: result.student_view,
    overrides: overrides || result.overrides || {},
  };
}

export function chineseMatchingSummary(payload) {
  const top = payload?.matches?.[0];
  const count = payload?.matches?.length || 0;
  if (!top) {
    return "Matching chinois sauvegardé : aucune école de langue compatible.";
  }
  return `Matching chinois sauvegardé (${count} école${count > 1 ? "s" : ""}). Top : ${top.university_name} (${top.score}/100, ${top.city || "ville à confirmer"}).`;
}
