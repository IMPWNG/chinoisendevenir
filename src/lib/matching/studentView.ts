import { reportsFromStored } from "./reports";
import { CATEGORY_META, categoryKeyFromScore } from "./constants";
import type { MatchingGap } from "./gaps";
import type { UniversityMatch } from "./narrative";
import type { MatchingStudent } from "./student";
import type { StudentDocRef } from "../studentProgress";

type StoredMatchingResult = {
  kind?: string;
  generated_at?: string | null;
  student?: Partial<MatchingStudent>;
  matches?: UniversityMatch[];
  gaps?: MatchingGap[];
  admin_report?: Record<string, unknown>;
  student_report?: Record<string, unknown>;
  recommended_formula?: unknown;
  student_view?: {
    generated_at?: string | null;
    profile_blurb?: string;
    criteria?: Record<string, unknown>;
    schools?: unknown[];
    disclaimer?: string;
  } | null;
};

function categoryKeyOf(item: UniversityMatch) {
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
  result: StoredMatchingResult | null | undefined,
  formuleNumber: unknown,
  {
    documents,
    adminDocuments,
  }: {
    documents?: StudentDocRef[];
    adminDocuments?: unknown[];
  } = {},
) {
  const n = Number(formuleNumber) || 0;
  if (!result || n < 1) return null;
  if (result.kind === "chinese") return null;

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

export function chineseMatchingForStudent(
  result: StoredMatchingResult | null | undefined,
  formuleNumber: unknown,
) {
  const n = Number(formuleNumber) || 0;
  if (!result || result.kind !== "chinese") return null;
  if (n < 1) return null;
  const view = result.student_view;
  if (!view && !result.matches?.length) return null;
  return {
    generated_at: result.generated_at || view?.generated_at || null,
    student_view: view || {
      profile_blurb: "",
      criteria: {},
      schools: [],
      disclaimer: "Aucune inscription, bourse ou visa n’est garantie.",
    },
  };
}
