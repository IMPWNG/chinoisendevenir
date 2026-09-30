import { getFormuleAccess } from "../formules";
import { normalizeStudent, type StudentOverrides } from "./student";
import { normalizeUniversity, type UniversityRow } from "./university";
import { rankMatches } from "./score";
import { enrichStudent } from "./enrich";
import { selectMix, groupMix, type Mixable } from "./mix";
import { identifyGaps } from "./gaps";
import { MIX_SIZE } from "./weights";
import {
  buildInternalBrief,
  buildUniversityAnalysis,
  type UniversityMatch,
} from "./narrative";
import { generateDualReports } from "./reportsLlm";
import type { ContactRow, StudentDocRef } from "../studentProgress";

function limitForFormula(formuleNumber: unknown) {
  return getFormuleAccess(formuleNumber).matchLimit || MIX_SIZE.max;
}

function offersLanguageThenDegree(item: Mixable, targetDegree: unknown) {
  const uni = item.university;
  if (!uni?.chineseLanguageProgram) return false;
  const target = String(targetDegree || "");
  if (!target || target === "language") return true;
  return (uni.degrees || []).includes(target);
}

function mixForStudent(
  ranked: Mixable[],
  student: { formuleNumber?: unknown; targetDegree?: unknown },
  limit: number,
) {
  if (Number(student.formuleNumber) !== 3) {
    return selectMix(ranked, { min: MIX_SIZE.min, max: limit });
  }
  const pathway = ranked.filter((item) =>
    offersLanguageThenDegree(item, student.targetDegree),
  );
  if (!pathway.length) return selectMix(ranked, { min: MIX_SIZE.min, max: limit });
  const primary = selectMix(pathway, { min: 0, max: limit });
  if (primary.length >= limit) return primary.slice(0, limit);
  const used = new Set(primary.map((item) => item.university_id));
  const extra = selectMix(
    ranked.filter((item) => !used.has(item.university_id)),
    { min: 0, max: limit - primary.length },
  );
  return [...primary, ...extra].slice(0, limit);
}

export async function runMatching({
  contact,
  universities,
  documents,
  adminDocuments = [],
  overrides,
  forceBilan = false,
}: {
  contact: ContactRow;
  universities: UniversityRow[];
  documents?: StudentDocRef[];
  adminDocuments?: unknown[];
  overrides?: StudentOverrides;
  forceBilan?: boolean;
}) {
  const rawStudent = normalizeStudent(contact, overrides, documents);
  const student = await enrichStudent(rawStudent, { documents });
  const catalog = universities.map(normalizeUniversity);
  const { ranked, excluded } = rankMatches(student, catalog);
  const limit = Math.min(Math.max(limitForFormula(student.formuleNumber), MIX_SIZE.min), MIX_SIZE.max);
  const mixed = mixForStudent(ranked as Mixable[], student, limit);
  const analyses = mixed.map((match) =>
    buildUniversityAnalysis(match as UniversityMatch, student),
  );
  const gaps = identifyGaps(student, mixed);
  const mixGroups = groupMix(analyses as Mixable[]);

  const formulaVotes = analyses
    .slice(0, 3)
    .map((item) => item.recommended_formula)
    .filter((n): n is number => typeof n === "number");
  const overallFormula =
    student.formuleNumber || (formulaVotes.sort((a, b) => b - a)[0] ?? 1);

  const reports = await generateDualReports({
    student,
    matches: analyses,
    excluded,
    gaps,
    documents,
    recommendedFormula: overallFormula,
  });

  const bilanFormule = student.formuleNumber || (forceBilan ? 1 : null);

  return {
    student,
    brief: buildInternalBrief(student, analyses, excluded, overallFormula, {
      gaps,
      mixCounts: {
        safety: mixGroups.safety.length,
        match: mixGroups.match.length,
        reach: mixGroups.reach.length,
      },
    }),
    matches: analyses,
    mix: mixGroups,
    gaps,
    excluded,
    admin_report: reports.admin_report,
    student_report: reports.student_report,
    client_message: reports.admin_report.draft_client_response,
    client_message_ai: Boolean(reports.admin_report.ai),
    recommended_formula: overallFormula,
    orientation_bilan: reports.student_report,
    formule1_bilan: bilanFormule === 1 ? reports.student_report : null,
    generated_at: reports.admin_report.generated_at || new Date().toISOString(),
    adminDocumentsCount: Array.isArray(adminDocuments) ? adminDocuments.length : 0,
  };
}
