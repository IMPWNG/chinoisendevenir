import { buildOrientationBilanFromResult } from "./orientationBilan";
import { CATEGORY_META, categoryKeyFromScore } from "./constants";

function categoryKeyOf(item) {
  if (item.categoryKey && CATEGORY_META[item.categoryKey]) return item.categoryKey;
  if (item.category === "Sûre" || item.category === "Très bon match") return "safety";
  if (item.category === "Réaliste" || item.category === "Match intéressant à vérifier") {
    return "match";
  }
  if (item.category === "Ambitieuse" || item.category === "Option possible avec conditions") {
    return "reach";
  }
  if (item.category === "Non recommandée" || item.category === "Faible compatibilité") {
    return "unready";
  }
  return categoryKeyFromScore(item.score || 0);
}

function clientUniversity(item, formuleNumber) {
  const n = Number(formuleNumber) || 1;
  const meta = CATEGORY_META[item.categoryKey] || CATEGORY_META[categoryKeyOf(item)] || CATEGORY_META.match;
  const row = {
    name: item.university_name,
    city: item.city || null,
    categoryKey: categoryKeyOf(item),
    category: meta.clientLabel || item.category,
    qualitative: item.qualitative || null,
    language: item.teaching_language || "à confirmer",
    deadline: item.deadline && !/^à vérifier/i.test(item.deadline) ? item.deadline : null,
    scholarships: item.scholarships_possible || [],
  };
  if (n >= 2) {
    row.score = item.score;
    row.breakdown = item.breakdown || null;
    row.cost = item.cost_estimate || null;
    row.warnings = item.warnings || [];
    row.strengths = item.strengths || [];
  }
  return row;
}

export function matchingForStudent(
  result,
  formuleNumber,
  { documents, adminDocuments } = {},
) {
  const n = Number(formuleNumber) || 0;
  if (!result || n < 1) return null;

  const student = result.student || {};
  const budgetLabel =
    student.budget?.label ||
    (typeof student.budget === "string" ? student.budget : null);
  const matches = result.matches || [];

  return {
    depth: n === 1 ? "orientation" : n === 2 ? "candidature" : "complete",
    formuleNumber: n,
    generated_at: result.generated_at || null,
    quality_score: student.qualityScore ?? result.orientation_bilan?.quality_score ?? null,
    profile_summary: {
      field: student.field || null,
      diploma: student.dernierDiplome || student.diploma || null,
      country: student.country || null,
      budget: budgetLabel,
      intake: student.intake?.label || student.intake || null,
      hsk: student.hsk === 0 || student.hsk ? `HSK ${student.hsk}` : null,
      english: student.english || null,
      quality: student.qualityScore ?? null,
    },
    mix: {
      safety: matches.filter((item) => categoryKeyOf(item) === "safety").map((item) => clientUniversity(item, n)),
      match: matches.filter((item) => categoryKeyOf(item) === "match").map((item) => clientUniversity(item, n)),
      reach: matches.filter((item) => categoryKeyOf(item) === "reach").map((item) => clientUniversity(item, n)),
    },
    gaps: (result.gaps || result.orientation_bilan?.gaps || []).map((gap) => ({
      type: gap.type,
      universite: gap.universite || null,
      conseil: gap.conseil,
    })),
    orientation_bilan: buildOrientationBilanFromResult(result, n, {
      documents,
      adminDocuments,
    }),
  };
}
