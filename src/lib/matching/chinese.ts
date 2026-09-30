import { normalizeStudent, type StudentOverrides, type MatchingStudent } from "./student";
import { normalizeUniversity, type MatchingUniversity, type UniversityRow } from "./university";
import { normalizeText } from "./constants";
import { canonicalDocuments } from "./documents";
import {
  CHINESE_MATCHING_WEIGHTS,
  CHINESE_MATCH_SIZE,
  DEFAULT_LIVING_COST_CNY,
} from "./weights";
import type { ContactRow } from "../studentProgress";

const MONTH_LABELS: Record<number, string> = {
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

function clamp(value: number, min: number, max: number) {
  return Math.max(min, Math.min(max, value));
}

function filled(value: unknown) {
  if (value === null || value === undefined) return null;
  const text = String(value).trim();
  return text === "" ? null : text;
}

function unique(list: unknown) {
  return [...new Set((Array.isArray(list) ? list : []).filter(Boolean))];
}

function categoryFromScore(score: number) {
  if (score >= 75) return CATEGORIES.safety;
  if (score >= 50) return CATEGORIES.match;
  return CATEGORIES.reach;
}

function monthLabel(month: unknown) {
  return MONTH_LABELS[Number(month)] || `mois ${month}`;
}

function intakeLabel(months: unknown[] | null | undefined) {
  const labels = unique((months || []).map(monthLabel));
  if (!labels.length) return "à confirmer auprès de l’école";
  return labels.join(" / ");
}

function money(value: number) {
  return Math.round(value).toLocaleString("fr-FR");
}

export function languageFeeLines(input: {
  semester?: number | null;
  year?: number | null;
  amount?: number | null;
  period?: string | null;
  housing?: number | null;
  living?: number | null;
  livingDefault?: boolean;
}) {
  const lines: string[] = [];
  const semester = input.semester ?? null;
  const year = input.year ?? null;
  if (input.period === "unknown" && input.amount != null) {
    lines.push(
      `Scolarité indiquée : ${money(input.amount)} RMB. Le fichier ne précise pas s'il s'agit d'un semestre ou d'une année, donc ce montant n'est pas additionné à une année de vie courante.`,
    );
  } else if (semester != null && year != null && year !== semester) {
    lines.push(
      `Scolarité : ${money(semester)} RMB par semestre, soit ${money(year)} RMB par an.`,
    );
  } else if (semester != null) {
    const annual = year ?? semester * 2;
    lines.push(
      `Scolarité : ${money(semester)} RMB par semestre, soit environ ${money(annual)} RMB pour deux semestres.`,
    );
  } else if (year != null) {
    lines.push(`Scolarité : ${money(year)} RMB par an.`);
  } else {
    lines.push("Scolarité : à confirmer auprès de l'école.");
  }
  if (input.housing) {
    lines.push(`Logement sur le campus : environ ${money(input.housing)} RMB par an.`);
  }
  if (input.living) {
    lines.push(
      input.livingDefault
        ? `Vie courante : estimation de ${money(input.living)} RMB par an, hors frais de l'école.`
        : `Vie courante estimée : ${money(input.living)} RMB par an.`,
    );
  }
  const annualTuition = input.period === "unknown" ? null : year;
  if (annualTuition != null) {
    const total = annualTuition + (input.housing || 0) + (input.living || 0);
    lines.push(`Total indicatif : environ ${money(total)} RMB par an.`);
  }
  return lines;
}

function languageIntakeMonths(university: MatchingUniversity) {
  const fromPrograms = (university.languagePrograms || []).flatMap(
    (program: Record<string, unknown>) =>
      (Array.isArray(program.start_months) ? program.start_months : []),
  );
  const months = unique(
    [...fromPrograms, ...(university.intakeMonths || [])]
      .map(Number)
      .filter(Boolean),
  );
  return months;
}

function languageCost(university: MatchingUniversity) {
  const profile = university.languageProfile;
  const housing = university.housingMean ?? university.housingMin ?? 0;
  const living = university.livingCostYearly || DEFAULT_LIVING_COST_CNY;
  const livingDefault =
    university.livingCostStatus === "default" || !university.livingCostYearly;
  const period = profile?.period || "unknown";
  const year = period === "unknown" ? null : profile?.year ?? university.languageTuitionMean;
  const lines = languageFeeLines({
    semester: profile?.semester,
    year,
    amount: profile?.amount ?? (period === "unknown" ? university.languageTuitionMin : null),
    period,
    housing: housing || null,
    living,
    livingDefault,
  });
  return {
    tuition_cny: year,
    semester_cny: profile?.semester ?? null,
    housing_cny: housing || null,
    living_cny: living,
    total_cny: year != null ? year + housing + living : null,
    status: year != null ? "estimated" : "default",
    label: lines[0],
    lines,
  };
}

function schoolFacts(university: MatchingUniversity) {
  const profile = university.languageProfile;
  const lines: string[] = [];
  const program = profile?.project || university.languageProgramName;
  if (program) lines.push(`Programme : ${program}.`);
  if (profile?.ageMin && profile?.ageMax) {
    lines.push(`Âge accepté : ${profile.ageMin} à ${profile.ageMax} ans.`);
  } else if (profile?.ageMin) {
    lines.push(`Âge minimum indiqué : ${profile.ageMin} ans.`);
  } else if (profile?.ageMax) {
    lines.push(`Âge maximum indiqué : ${profile.ageMax} ans.`);
  }
  if (profile?.beginner) lines.push("Un niveau débutant en chinois est accepté.");
  if (profile?.applicationFee) {
    lines.push(`Frais de dossier : ${money(profile.applicationFee)} RMB.`);
  }
  if (profile?.scholarship === true) {
    lines.push("Une bourse de langue est mentionnée. Son attribution n'est pas automatique.");
  }
  if (profile?.pathway) {
    lines.push("Un passage vers un diplôme après l'année de langue est mentionné.");
  }
  const docs = canonicalDocuments(profile?.documents || []).map((doc) => doc.label);
  if (docs.length) lines.push(`Pièces demandées : ${docs.slice(0, 8).join(", ")}.`);
  const deadline = profile?.deadline;
  if (deadline && !/[\u4e00-\u9fff]/.test(deadline)) {
    lines.push(`Date limite : ${deadline}.`);
  } else if (deadline) {
    lines.push("L'école publie une date limite de candidature. Le détail est à confirmer sur son site.");
  }
  if (profile?.applyWebsite || university.website) {
    lines.push(`Site : ${profile?.applyWebsite || university.website}.`);
  }
  return lines;
}

function scoreCity(student: MatchingStudent, university: MatchingUniversity) {
  const cities = (student.preferredCities || []).map(normalizeText).filter(Boolean);
  if (!cities.length) {
    return {
      points: 70,
      max: 100,
      note: "Aucune ville de préférence n'est indiquée dans votre dossier.",
    };
  }
  const city = normalizeText(university.city);
  const province = normalizeText(university.province);
  if (cities.some((item) => city && (city.includes(item) || item.includes(city)))) {
    return { points: 100, max: 100, note: `${university.city} correspond à la ville indiquée dans votre dossier.` };
  }
  if (
    cities.some(
      (item) => province && (province.includes(item) || item.includes(province)),
    )
  ) {
    return {
      points: 72,
      max: 100,
      note: `La région (${university.province}) est proche, pas la ville exacte.`,
    };
  }
  return {
    points: 28,
    max: 100,
    note: university.city
      ? `${university.city} n'est pas la ville indiquée dans votre dossier.`
      : "La ville de l'école n'est pas renseignée.",
  };
}

function scoreIntake(student: MatchingStudent, months: unknown[]) {
  if (student.intake?.flexible) {
    return {
      points: 90,
      max: 100,
      note: "Votre rentrée est flexible : le calendrier de l'école convient.",
    };
  }
  const wanted = student.intake?.month;
  const wantedMonths = (
    Array.isArray(student.intake?.months) && student.intake.months.length
      ? student.intake.months
      : wanted
        ? [wanted]
        : []
  )
    .map(Number)
    .filter((month) => month >= 1 && month <= 12);
  if (!wantedMonths.length) {
    return {
      points: 60,
      max: 100,
      note: "La date de rentrée n'est pas indiquée dans votre dossier.",
    };
  }
  if (!months.length) {
    return {
      points: 55,
      max: 100,
      note: "Le calendrier de rentrée est à confirmer auprès de l'école.",
    };
  }
  if (wantedMonths.some((month) => months.includes(month))) {
    return {
      points: 100,
      max: 100,
      note: `La rentrée de ${wantedMonths.map(monthLabel).join(" / ")} est proposée.`,
    };
  }
  const closest = months.reduce((best: number, month) => {
    return Math.min(
      best,
      ...wantedMonths.map((wantedMonth) => Math.abs(Number(month) - wantedMonth)),
    );
  }, 12);
  if (closest <= 2) {
    return {
      points: 70,
      max: 100,
      note: `Une rentrée proche est proposée (${intakeLabel(months)}), pas le mois exact.`,
    };
  }
  return {
    points: 30,
    max: 100,
    note: `La rentrée demandée est éloignée du calendrier connu (${intakeLabel(months)}).`,
  };
}

function matchSchool(student: MatchingStudent, university: MatchingUniversity) {
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
  const intake = scoreIntake(student, months);

  const score = Math.round(
    clamp(
      localisation.points * CHINESE_MATCHING_WEIGHTS.localisation +
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

  if (intake.points >= 85) why.push(intake.note);
  else if (intake.points <= 45) vigilance.push(intake.note);
  else why.push(intake.note);

  if (cost.status === "default") {
    vigilance.push("Les frais de scolarité ne sont pas assez précis pour calculer un total annuel.");
  }
  if (!months.length) {
    vigilance.push("Les dates de rentrée sont à confirmer auprès de l'école.");
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
    facts: schoolFacts(university),
    deadline_raw: university.languageProfile?.deadline || null,
    score,
    categoryKey: category.key,
    category: category.label,
    breakdown: { localisation, intake },
    cost,
    intake_months: months,
    intake_label: intakeLabel(months),
    why: unique(why).slice(0, 3),
    vigilance: unique(vigilance).slice(0, 4),
    deadline: university.deadline,
  };
}

type ChineseMatch = ReturnType<typeof matchSchool>;

function scorePhrase(item: { categoryKey?: string }) {
  if (item.categoryKey === "safety") {
    return "Ville et rentrée s’alignent bien avec votre demande.";
  }
  if (item.categoryKey === "match") {
    return "Piste possible : la ville ou la date de rentrée reste à confirmer.";
  }
  return "Écart sur la ville ou la rentrée visée.";
}

function profileBlurb(student: MatchingStudent) {
  const city = student.preferredCities?.[0];
  const intake = student.intake?.label;
  const bits: string[] = ["Vous visez une année de langue chinoise"];
  if (city) bits.push(`à ${city}`);
  if (student.intake?.months?.length && intake) bits.push(`pour la rentrée ${intake}`);
  else if (student.intake?.flexible) bits.push("avec une rentrée flexible");
  return `${bits.join(" ")}. Les écoles ci-dessous sont classées à partir des frais, des dates et des conditions publiés. Aucune inscription n'est garantie.`;
}

function studentView(student: MatchingStudent, matches: ChineseMatch[]) {
  const schools = matches.map((item, index) => ({
    id: item.university_id,
    name: item.university_name,
    city: item.city || "ville à confirmer",
    score: item.score,
    score_phrase: scorePhrase(item),
    best_match: index === 0,
    categoryKey: item.categoryKey,
    category: item.category,
    cost: { label: item.cost?.label, lines: item.cost?.lines || [] },
    intake: item.intake_label,
    facts: item.facts,
    why: item.why,
    vigilance: item.vigilance,
    breakdown: [
      {
        key: "localisation",
        label: "Ville",
        points: item.breakdown?.localisation?.points,
        max: 100,
      },
      {
        key: "intake",
        label: "Rentrée",
        points: item.breakdown?.intake?.points,
        max: 100,
      },
    ],
  }));

  return {
    generated_at: new Date().toISOString(),
    profile_blurb: profileBlurb(student),
    criteria: {
      city: student.preferredCities?.[0]
        ? `Ville indiquée dans votre dossier : ${student.preferredCities[0]}.`
        : "Aucune ville de préférence n'est indiquée dans votre dossier.",
      intake: student.intake?.label
        ? `Rentrée indiquée : ${student.intake.label}.`
        : "La date de rentrée n'est pas indiquée dans votre dossier.",
    },
    schools,
    disclaimer:
      "Aucune inscription, bourse ou visa n’est garantie. Les frais et dates restent à confirmer auprès de l’école.",
  };
}

export function chineseCitiesFromCatalog(universities: UniversityRow[]) {
  return unique(
    universities
      .map(normalizeUniversity)
      .filter((item) => item.chineseLanguageProgram && item.city)
      .map((item) => item.city),
  ).sort((a, b) => a.localeCompare(b, "fr"));
}

export function runChineseMatching({
  contact,
  universities,
  overrides = {},
}: {
  contact: ContactRow;
  universities: UniversityRow[];
  overrides?: StudentOverrides;
}) {
  const patched = {
    ...contact,
    budget: null,
    date_rentree: filled(overrides.dateRentree) || "non precisee",
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
  const ranked: ChineseMatch[] = [];
  const excluded: ChineseMatch[] = [];

  for (const university of catalog) {
    const result = matchSchool(student, university);
    if (result.excluded) excluded.push(result);
    else ranked.push(result);
  }

  ranked.sort((a, b) => (Number(b.score) || 0) - (Number(a.score) || 0));
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

export function compactChineseMatchingResult(
  result: Record<string, unknown>,
  overrides: StudentOverrides = {},
) {
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

export function chineseMatchingSummary(payload: Record<string, unknown> | null | undefined) {
  const matches = Array.isArray(payload?.matches) ? payload.matches : [];
  const top = matches[0] as Record<string, unknown> | undefined;
  const count = matches.length;
  if (!top) {
    return "Matching chinois sauvegardé : aucune école de langue compatible.";
  }
  return `Matching chinois sauvegardé (${count} école${count > 1 ? "s" : ""}). Top : ${top.university_name} (${top.score}/100, ${top.city || "ville à confirmer"}).`;
}
