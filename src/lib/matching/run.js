import { getFormuleAccess, getFormuleByNumber } from "../formules";
import { normalizeStudent } from "./student";
import { normalizeUniversity } from "./university";
import { rankMatches } from "./score";
import { enrichStudent } from "./enrich";
import { selectMix, groupMix } from "./mix";
import { identifyGaps } from "./gaps";
import { MIX_SIZE } from "./weights";
import {
  buildClientMessage,
  buildInternalBrief,
  buildUniversityAnalysis,
} from "./narrative";
import { generateOrientationBilan } from "./orientationBilan";
import { matchingLlm } from "./llm";

function limitForFormula(formuleNumber) {
  return getFormuleAccess(formuleNumber).matchLimit || MIX_SIZE.max;
}

async function polishClientMessage(message, payload) {
  const polished = await matchingLlm({
    system:
      "Tu es assistant d'une agence francophone d'études en Chine. Réécris le message client en français, clair, rassurant et réaliste. Ne jamais garantir admission, bourse ou visa. Ne pas inventer de frais, deadlines, HSK ou programmes absents du brief. Garde les noms d'universités, les catégories (sûre / réaliste / ambitieuse) et les écarts à combler. Réponds uniquement par le texte du mail, sans markdown.",
    user: `Brief interne (JSON):\n${JSON.stringify(payload).slice(0, 12000)}\n\nBrouillon:\n${message}`,
    temperature: 0.2,
    maxTokens: 1800,
    timeoutMs: 25000,
  });
  if (!polished.ok || !polished.text || polished.text.length < 120) {
    return { message, ai: false };
  }
  return { message: polished.text, ai: true };
}

export async function runMatching({
  contact,
  universities,
  documents,
  adminDocuments = [],
  overrides,
  forceBilan = false,
}) {
  const rawStudent = normalizeStudent(contact, overrides, documents);
  const student = await enrichStudent(rawStudent, { documents });
  const catalog = universities.map(normalizeUniversity);
  const { ranked, excluded } = rankMatches(student, catalog);
  const limit = Math.min(Math.max(limitForFormula(student.formuleNumber), MIX_SIZE.min), MIX_SIZE.max);
  const mixed = selectMix(ranked, { min: MIX_SIZE.min, max: limit });
  const analyses = mixed.map((match) => buildUniversityAnalysis(match, student));
  const gaps = identifyGaps(student, mixed);
  const mixGroups = groupMix(analyses);

  const formulaVotes = analyses
    .slice(0, 3)
    .map((item) => item.recommended_formula)
    .filter(Boolean);
  const overallFormula =
    student.formuleNumber || (formulaVotes.sort((a, b) => b - a)[0] ?? 1);

  const draft = buildClientMessage(student, analyses, overallFormula, { gaps });
  const polished = await polishClientMessage(draft, {
    student: {
      name: student.name,
      field: student.field,
      intake: student.intake?.label,
      budget: student.budget?.label,
      quality: student.qualityScore,
    },
    matches: analyses.slice(0, 8).map((item) => ({
      name: item.university_name,
      score: item.score,
      category: item.category,
      qualitative: item.qualitative,
      strengths: item.strengths,
      warnings: item.warnings,
      deadline: item.deadline,
      language: item.teaching_language,
      cost: item.cost_estimate,
    })),
    gaps: gaps.slice(0, 6),
    formula: getFormuleByNumber(overallFormula)?.shortTitle,
  });

  let orientation_bilan = null;
  const bilanFormule = student.formuleNumber || (forceBilan ? 1 : null);
  if (bilanFormule) {
    orientation_bilan = await generateOrientationBilan({
      student,
      analyses,
      formuleNumber: bilanFormule,
      documents,
      adminDocuments,
      gaps,
    });
  }

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
    client_message: polished.message,
    client_message_ai: polished.ai,
    recommended_formula: overallFormula,
    orientation_bilan,
    formule1_bilan: bilanFormule === 1 ? orientation_bilan : null,
    generated_at: new Date().toISOString(),
  };
}
