import { getFormuleByNumber } from "../formules";

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

export function buildUniversityAnalysis(match, student) {
  const uni = match.university;
  const strengths = [];
  const vigilance = [...match.warnings];
  if (match.breakdown.domain.points >= 20) strengths.push("Le domaine correspond au projet de l'étudiant.");
  if (match.breakdown.level.points === 15) strengths.push("Le niveau d'études visé est proposé.");
  if (match.scholarships_possible.length) {
    strengths.push(`Pistes de bourses : ${match.scholarships_possible.join(", ")}.`);
  }
  if (uni.englishAvailable) strengths.push("Des programmes en anglais sont identifiés.");
  if (uni.city) strengths.push(`Localisation : ${uni.city}${uni.province ? ` (${uni.province})` : ""}.`);

  if (match.breakdown.language.points <= 6) {
    vigilance.push("Le niveau linguistique actuel peut bloquer une admission directe.");
  }
  if (match.breakdown.budget.points <= 10) {
    vigilance.push("Le budget devra être recoupé avec les frais réels et une éventuelle bourse.");
  }
  if (match.breakdown.intake.points <= 4) {
    vigilance.push("La rentrée visée n'est pas alignée avec le calendrier connu.");
  }

  const actions = [];
  match.to_verify.forEach((item) => actions.push(`Vérifier : ${item}`));
  if (match.breakdown.language.points < 12) actions.push("Évaluer ou faire tester le niveau de langue (HSK / anglais).");
  if (match.missing_documents.length) {
    actions.push("Préparer les documents manquants listés ci-dessous.");
  }
  if (uni.website) actions.push(`Consulter le site : ${uni.website}`);
  if (!actions.length) actions.push("Confirmer les conditions d'admission auprès de l'université.");

  const summary = `${match.university_name} obtient ${match.score}/100 (${match.category}). ${match.breakdown.domain.note} ${match.breakdown.level.note}`;

  return {
    student_id: student.id,
    university_id: match.university_id,
    university_name: match.university_name,
    score: match.score,
    category: match.category,
    priority: match.priority,
    summary: summary.trim(),
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
    teaching_language: match.teaching_language,
    deadline: match.deadline || "À vérifier auprès de l'université",
    recommended_actions: [...new Set(actions)].slice(0, 6),
    recommended_formula: match.recommended_formula,
    breakdown: Object.fromEntries(
      Object.entries(match.breakdown).map(([key, value]) => [
        key,
        { points: value.points, max: value.max, note: value.note, status: value.status },
      ]),
    ),
  };
}

export function buildClientMessage(student, analyses, overallFormula) {
  const depth = depthForFormula(student.formuleNumber || overallFormula);
  const top = analyses.slice(0, depth === "orientation" ? 4 : depth === "candidature" ? 6 : 8);
  const name = student.prenom || "Bonjour";
  const lines = [];

  lines.push(`${name},`);
  lines.push("");
  lines.push("Après lecture de votre profil, voici une première orientation réaliste pour un projet d'études en Chine. Aucune admission, bourse ou visa n'est garantie : les décisions appartiennent aux universités, aux organismes financeurs et aux autorités consulaires.");
  lines.push("");
  lines.push("Profil retenu");
  lines.push(
    [
      student.field ? `Domaine : ${student.field}` : "Domaine : à préciser",
      student.dernierDiplome ? `Dernier diplôme : ${student.dernierDiplome}` : null,
      student.targetDegree ? `Niveau visé (estimation) : ${student.targetDegree}` : "Niveau visé : à confirmer",
      student.country ? `Pays : ${student.country}` : null,
      student.age ? `Âge : ${student.age} ans` : null,
      student.budget?.label ? `Budget : ${student.budget.label}` : "Budget : à préciser",
      student.intake?.label ? `Rentrée : ${student.intake.label}` : null,
      student.hsk != null ? `HSK : ${student.hsk}` : "HSK : non renseigné",
      student.english ? `Anglais : ${student.english}` : "Anglais : non renseigné",
    ]
      .filter(Boolean)
      .map((item) => `• ${item}`)
      .join("\n"),
  );
  lines.push("");

  if (!top.length) {
    lines.push("Nous n'avons pas identifié d'université suffisamment compatible avec les données actuelles. Il faudra préciser le domaine, le niveau visé ou le budget avant de relancer l'analyse.");
  } else {
    lines.push("Universités recommandées");
    top.forEach((item, index) => {
      lines.push(
        `${index + 1}. ${item.university_name} — ${item.score}/100, ${item.category}.`,
      );
      if (item.strengths[0]) lines.push(`   Point positif : ${item.strengths[0]}`);
      if (item.warnings[0]) lines.push(`   Vigilance : ${item.warnings[0]}`);
      lines.push(
        `   Langue : ${item.teaching_language}. Frais scolarité : ${money(item.cost_estimate.tuition_cny)}. Deadline : ${item.deadline}.`,
      );
    });
  }

  const docs = [...new Set(top.flatMap((item) => item.missing_documents))].slice(0, 8);
  lines.push("");
  lines.push("Documents à préparer");
  if (student.documents.includes("passeport") && student.documents.includes("dernier_diplome") && !docs.length) {
    lines.push("• Passeport et dernier diplôme sont déjà dans l'espace étudiant. D'autres pièces (relevés, lettre, traductions) seront probablement demandées.");
  } else {
    lines.push("• Passeport valide");
    lines.push("• Dernier diplôme et relevés de notes, avec traduction si besoin");
    docs.forEach((doc) => lines.push(`• ${doc}`));
  }

  const scholarships = [...new Set(top.flatMap((item) => item.scholarships_possible))];
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
    lines.push("• Revenir vers nous pour un bilan plus précis si vous souhaitez avancer");
  } else if (depth === "candidature") {
    lines.push("• Choisir 2 à 3 universités parmi la liste");
    lines.push("• Vérifier deadlines et pièces officielles");
    lines.push("• Préparer le dossier (lettres, traductions, formulaires)");
  } else {
    lines.push("• Figéer la liste de candidatures (jusqu'à 5)");
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

export function buildInternalBrief(student, analyses, excluded, overallFormula) {
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
      scholarship_goal: student.scholarshipGoal,
      formule: student.formuleLabel,
      documents: student.documents,
    },
    overall_recommended_formula: overallFormula,
    overall_recommended_formula_label: formulaLabel(overallFormula),
    ranked_count: analyses.length,
    excluded_count: excluded.length,
    top_match: top
      ? { name: top.university_name, score: top.score, category: top.category }
      : null,
    excluded_sample: excluded.slice(0, 8).map((item) => ({
      name: item.university_name,
      reason: item.excludeReason,
    })),
  };
}
