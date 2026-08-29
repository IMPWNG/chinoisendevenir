import { getFormuleAccess } from "../formules";

function money(cny) {
  if (cny == null) return null;
  return `${Number(cny).toLocaleString("fr-FR")} RMB / an`;
}

function publicMatch(item, depth) {
  const base = {
    university_name: item.university_name,
    category: item.category,
    teaching_language: item.teaching_language || null,
    strengths: (item.strengths || []).slice(0, depth === "orientation" ? 2 : 4),
    warnings: (item.warnings || []).slice(0, depth === "orientation" ? 1 : 3),
    scholarships_possible: item.scholarships_possible || [],
  };

  if (depth === "orientation") {
    return base;
  }

  const candidature = {
    ...base,
    score: item.score,
    deadline: item.deadline || null,
    tuition: money(item.cost_estimate?.tuition_cny),
    missing_documents: item.missing_documents || [],
    recommended_actions: (item.recommended_actions || []).slice(0, 5),
  };

  if (depth !== "complete") {
    return candidature;
  }

  return {
    ...candidature,
    summary: item.summary || null,
    confirmed_information: item.confirmed_information || [],
    estimated_information: item.estimated_information || [],
    to_verify: item.to_verify || [],
    risks: item.risks || [],
  };
}

function upgradeHint(number) {
  if (number === 1) {
    return "La formule 2 débloque les délais, les frais et le suivi de candidature.";
  }
  if (number === 2) {
    return "La formule 3 débloque le suivi jusqu'au visa, au logement et au départ.";
  }
  return null;
}

export function matchingForStudent(result, formuleNumber) {
  const access = getFormuleAccess(formuleNumber);
  if (!result || access.depth === "none") return null;

  const matches = (result.matches || [])
    .slice(0, access.matchLimit)
    .map((item) => publicMatch(item, access.depth));

  const student = result.student || {};
  const budgetLabel =
    student.budget?.label ||
    (typeof student.budget === "string" ? student.budget : null);

  return {
    depth: access.depth,
    formuleNumber: access.number,
    generated_at: result.generated_at || null,
    profile_summary: {
      field: student.field || null,
      diploma: student.dernierDiplome || student.diploma || null,
      country: student.country || null,
      budget: budgetLabel,
      intake: student.intake?.label || student.intake || null,
    },
    matches,
    documents_to_prepare: [
      ...new Set(matches.flatMap((item) => item.missing_documents || [])),
    ].slice(0, access.depth === "orientation" ? 4 : 8),
    scholarships: [
      ...new Set(matches.flatMap((item) => item.scholarships_possible || [])),
    ],
    upgrade_hint: upgradeHint(access.number),
  };
}
