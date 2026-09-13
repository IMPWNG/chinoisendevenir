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
  const mixed = selectMix(ranked as Mixable[], { min: MIX_SIZE.min, max: limit });
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
