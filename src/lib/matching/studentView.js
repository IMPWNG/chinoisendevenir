import { reportsFromStored } from "./reports";
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

export function matchingForStudent(
  result,
  formuleNumber,
  { documents, adminDocuments } = {},
) {
  const n = Number(formuleNumber) || 0;
  if (!result || n < 1) return null;

  const reports = reportsFromStored(result, { documents: documents || [] });
  const student = result.student || {};
  const matches = result.matches || [];

  return {
    depth: n === 1 ? "orientation" : n === 2 ? "candidature" : "complete",
    formuleNumber: n,
    generated_at: result.generated_at || reports.student_report?.generated_at || null,
    student_report: reports.student_report,
    admin_report: null,
    quality_score: student.qualityScore ?? reports.student_report?.completeness?.pct ?? null,
    mix: {
      safety: matches.filter((item) => categoryKeyOf(item) === "safety"),
      match: matches.filter((item) => categoryKeyOf(item) === "match"),
      reach: matches.filter((item) => categoryKeyOf(item) === "reach"),
    },
    gaps: result.gaps || [],
    orientation_bilan: reports.student_report,
    adminDocumentsCount: Array.isArray(adminDocuments) ? adminDocuments.length : 0,
  };
}
