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

export function matchingForStudent(result, formuleNumber) {
  const granted = Number(formuleNumber) > 0;
  const access = granted ? getFormuleAccess(3) : getFormuleAccess(0);
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
    formuleNumber: Number(formuleNumber) || access.number,
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
    upgrade_hint: null,
  };
}
