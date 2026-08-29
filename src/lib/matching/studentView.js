import { buildOrientationBilanFromResult } from "./orientationBilan";

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

  return {
    depth: n === 1 ? "orientation" : n === 2 ? "candidature" : "complete",
    formuleNumber: n,
    generated_at: result.generated_at || null,
    profile_summary: {
      field: student.field || null,
      diploma: student.dernierDiplome || student.diploma || null,
      country: student.country || null,
      budget: budgetLabel,
      intake: student.intake?.label || student.intake || null,
      hsk: student.hsk === 0 || student.hsk ? `HSK ${student.hsk}` : null,
      english: student.english || null,
    },
    orientation_bilan: buildOrientationBilanFromResult(result, n, {
      documents,
      adminDocuments,
    }),
  };
}
