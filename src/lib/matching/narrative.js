import { getFormuleByNumber } from "../formules";
import { CATEGORY_META } from "./constants";

function money(cny) {
  if (cny == null) return "à confirmer";
  return `${Number(cny).toLocaleString("fr-FR")} RMB / an`;
}

function formulaLabel(number) {
  const f = getFormuleByNumber(number);
  if (!f) return "à confirmer selon le projet";
  return `Formule ${f.number} — ${f.shortTitle} (${f.price})`;
}

function depthForFormula(number) {
  if (number === 3) return "complete";
  if (number === 2) return "candidature";
  return "orientation";
}

function qualitativeFromBreakdown(match) {
  const langue = match.breakdown?.langue?.points ?? 50;
  const acad = match.breakdown?.academique?.points ?? 50;
  const fin = match.breakdown?.financier?.points ?? 50;
  const parts = [];
  if (langue >= 70) parts.push("langue compatible");
  else if (langue >= 40) parts.push("langue à renforcer");
  else parts.push("langue insuffisante en l'état");
  if (acad >= 70) parts.push("parcours cohérent");
  else parts.push("dossier académique à étayer");
  if (fin >= 80) parts.push("budget tenable");
  else if (fin >= 50) parts.push("budget tendu");
  else parts.push("financement à revoir");
  return parts.join(" · ");
}

export function buildUniversityAnalysis(match, student) {
  const uni = match.university;
  const strengths = [];
  const vigilance = [...(match.warnings || [])];
  if ((match.breakdown?.academique?.points || 0) >= 70) {
    strengths.push("Le parcours et le domaine correspondent au projet.");
  }
  if (match.scholarships_possible?.length) {
    strengths.push(`Pistes de bourses : ${match.scholarships_possible.join(", ")}.`);
  }
  if (uni?.englishAvailable) strengths.push("Des programmes en anglais sont identifiés.");
  if (uni?.city) {
    strengths.push(`Localisation : ${uni.city}${uni.province ? ` (${uni.province})` : ""}.`);
  }

  if ((match.breakdown?.langue?.points || 0) <= 40) {
    vigilance.push("Le niveau linguistique actuel peut bloquer une admission directe.");
  }
  if ((match.breakdown?.financier?.points || 0) <= 40) {
    vigilance.push("Le budget devra être recoupé avec les frais réels et une éventuelle bourse.");
  }

  const actions = [];
  (match.to_verify || []).forEach((item) => actions.push(`Vérifier : ${item}`));
  if ((match.breakdown?.langue?.points || 0) < 55) {
    actions.push("Évaluer ou faire tester le niveau de langue (HSK / anglais).");
  }
  if (match.missing_documents?.length) {
    actions.push("Préparer les documents manquants listés ci-dessous.");
  }
  if (uni?.website) actions.push(`Consulter le site : ${uni.website}`);
  if (!actions.length) actions.push("Confirmer les conditions d'admission auprès de l'université.");

  const meta = CATEGORY_META[match.categoryKey] || CATEGORY_META.match;
  const summary = `${match.university_name} obtient ${match.score}/100 (${meta.label}). ${qualitativeFromBreakdown(match)}`;

  return {
    student_id: student.id,
    university_id: match.university_id,
    university_name: match.university_name,
    city: match.city || null,
    province: match.province || null,
    score: match.score,
    categoryKey: match.categoryKey,
    category: match.category,
    category_subtitle: match.category_subtitle,
    priority: match.priority,
    summary: summary.trim(),
    qualitative: qualitativeFromBreakdown(match),
    confirmed_information: match.confirmed_information,
    estimated_information: match.estimated_information,
    strengths: strengths.slice(0, 6),
    warnings: [...new Set(vigilance)].slice(0, 6),
    missing_information: match.missing_information,
    to_verify: match.to_verify,
    missing_documents: match.missing_documents,
    risks: [...new Set(vigilance)].slice(0, 5),
    scholarships_possible: match.scholarships_possible,
    cost_estimate: match.cost_estimate,
    cost_total_cny: match.cost_total_cny,
    hsk_required: match.hsk_required,
    gpa_required: match.gpa_required,
    teaching_language: match.teaching_language,
    deadline: match.deadline || "À vérifier auprès de l'université",
    recommended_actions: [...new Set(actions)].slice(0, 6),
    recommended_formula: match.recommended_formula,
    pedagogical: Boolean(match.pedagogical),
    excludeReason: match.excludeReason || null,
    breakdown: Object.fromEntries(
      Object.entries(match.breakdown || {}).map(([key, value]) => [
        key,
        { points: value.points, max: value.max, note: value.note, status: value.status },
      ]),
    ),
  };
}

export function buildClientMessage(student, analyses, overallFormula, { gaps = [] } = {}) {
  const depth = depthForFormula(student.formuleNumber || overallFormula);
  const top = analyses.slice(0, depth === "orientation" ? 5 : 8);
  const name = student.prenom || "Bonjour";
  const lines = [];

  lines.push(`${name},`);
  lines.push("");
  lines.push(
    "Après lecture de votre profil, voici une orientation réaliste, avec des universités sûres, réalistes et ambitieuses, et ce qu'il faut préciser avant de candidater. Aucune admission, bourse ou visa n'est garantie.",
  );
  lines.push("");
  lines.push("Profil retenu");
  lines.push(
    [
      student.field ? `Domaine : ${student.field}` : "Domaine : à préciser",
      student.dernierDiplome ? `Dernier diplôme : ${student.dernierDiplome}` : null,
      student.targetDegree ? `Niveau visé : ${student.targetDegree}` : "Niveau visé : à confirmer",
      student.country ? `Pays : ${student.country}` : null,
      student.age ? `Âge : ${student.age} ans` : null,
      student.budget?.label ? `Budget : ${student.budget.label}` : "Budget : à préciser",
      student.intake?.label ? `Rentrée : ${student.intake.label}` : null,
      student.hsk != null ? `HSK : ${student.hsk}${student.hskSource === "default_beginner" ? " (défaut débutant)" : ""}` : "HSK : non renseigné",
      student.english ? `Anglais : ${student.english}` : "Anglais : non renseigné",
      student.qualityScore != null ? `Complétude du dossier : ${student.qualityScore}/100` : null,
    ]
      .filter(Boolean)
      .map((item) => `• ${item}`)
      .join("\n"),
  );
  lines.push("");

  if (!top.length) {
    lines.push(
      "Nous n'avons pas identifié d'université suffisamment compatible avec les données actuelles. Il faudra préciser le domaine, le niveau visé ou le budget avant de relancer l'analyse.",
    );
  } else {
    lines.push("Universités recommandées (mix sûre / réaliste / ambitieuse)");
    top.forEach((item, index) => {
      const detail =
        depth === "orientation"
          ? item.qualitative
          : `${item.score}/100`;
      lines.push(
        `${index + 1}. ${item.university_name} — ${item.category}. ${detail}.`,
      );
      if (item.strengths[0]) lines.push(`   Point positif : ${item.strengths[0]}`);
      if (item.warnings[0]) lines.push(`   Vigilance : ${item.warnings[0]}`);
      if (depth !== "orientation") {
        lines.push(
          `   Langue : ${item.teaching_language}. Coût estimé : ${money(item.cost_estimate?.total_cny || item.cost_estimate?.tuition_cny)}. Deadline : ${item.deadline}.`,
        );
      }
    });
  }

  if (gaps.length) {
    lines.push("");
    lines.push("Ce qu'il faut combler avant de déposer");
    gaps.slice(0, 5).forEach((gap) => {
      lines.push(`• ${gap.conseil}`);
    });
  }

  const docs = [...new Set(top.flatMap((item) => item.missing_documents || []))].slice(0, 8);
  lines.push("");
  lines.push("Documents à préparer");
  if (
    student.documents.includes("passeport") &&
    student.documents.includes("dernier_diplome") &&
    !docs.length
  ) {
    lines.push(
      "• Passeport et dernier diplôme sont déjà dans l'espace étudiant. D'autres pièces (relevés, lettre, traductions) seront probablement demandées.",
    );
  } else {
    lines.push("• Passeport valide");
    lines.push("• Dernier diplôme et relevés de notes, avec traduction si besoin");
    docs.forEach((doc) => lines.push(`• ${doc}`));
  }

  const scholarships = [...new Set(top.flatMap((item) => item.scholarships_possible || []))];
  lines.push("");
  lines.push("Bourses possibles");
  lines.push(
    scholarships.length
      ? `• Pistes identifiées : ${scholarships.join(", ")}. L'obtention n'est jamais automatique.`
      : "• Peu de bourses clairement documentées pour ces établissements. Un financement personnel reste à prévoir, sauf vérification contraire.",
  );

  lines.push("");
  lines.push("Prochaines étapes");
  if (depth === "orientation") {
    lines.push("• Valider le domaine et le niveau visé");
    lines.push("• Trancher langue d'enseignement (chinois ou anglais)");
    lines.push("• Traiter les écarts listés ci-dessus avant de candidater");
  } else if (depth === "candidature") {
    lines.push("• Choisir jusqu'à 3 universités parmi le mix");
    lines.push("• Vérifier deadlines et pièces officielles");
    lines.push("• Préparer le dossier (lettres, traductions, formulaires)");
  } else {
    lines.push("• Figer jusqu'à 5 candidatures");
    lines.push("• Caler un calendrier admission → JW201/JW202 → visa → logement");
    lines.push("• Anticiper les frais hors accompagnement (dossier, visa, vol)");
  }

  lines.push("");
  lines.push(`Formule recommandée : ${formulaLabel(overallFormula)}.`);
  if (student.formuleNumber && student.formuleNumber !== overallFormula) {
    lines.push(
      `Vous avez actuellement la formule ${student.formuleNumber}. Compte tenu des points de vigilance, la formule ${overallFormula} serait plus adaptée.`,
    );
  }
  lines.push("");
  lines.push("Nous restons disponibles pour en parler ensemble.");
  lines.push("Chinois en Devenir");

  return lines.join("\n");
}

export function buildInternalBrief(student, analyses, excluded, overallFormula, extra = {}) {
  const top = analyses[0];
  return {
    student: {
      id: student.id,
      name: student.name,
      country: student.country,
      age: student.age,
      field: student.field,
      diploma: student.dernierDiplome,
      target_degree: student.targetDegree,
      target_degree_status: student.targetDegreeSource,
      budget: student.budget?.label || null,
      intake: student.intake?.label || null,
      hsk: student.hsk,
      english: student.english,
      gpa: student.gpa,
      scholarship_goal: student.scholarshipGoal,
      formule: student.formuleLabel,
      documents: student.documents,
      quality_score: student.qualityScore,
      missing_fields: student.missingFields,
    },
    overall_recommended_formula: overallFormula,
    overall_recommended_formula_label: formulaLabel(overallFormula),
    ranked_count: analyses.length,
    excluded_count: excluded.length,
    mix: extra.mixCounts || null,
    gaps_count: extra.gaps?.length || 0,
    top_match: top
      ? { name: top.university_name, score: top.score, category: top.category }
      : null,
    excluded_sample: excluded.slice(0, 8).map((item) => ({
      name: item.university_name,
      reason: item.excludeReason,
    })),
  };
}
