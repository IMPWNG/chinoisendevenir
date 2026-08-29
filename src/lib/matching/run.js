import { getFormuleAccess, getFormuleByNumber } from "../formules";
import { normalizeStudent } from "./student";
import { normalizeUniversity } from "./university";
import { rankMatches } from "./score";
import {
  buildClientMessage,
  buildInternalBrief,
  buildUniversityAnalysis,
} from "./narrative";
import { generateFormule1Bilan } from "./formule1Bilan";

function limitForFormula(formuleNumber) {
  return getFormuleAccess(formuleNumber).matchLimit || 5;
}

async function polishClientMessage(message, payload) {
  const apiKey = process.env.MAMMOUTH_API_KEY;
  if (!apiKey) return { message, ai: false };

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 25000);
  try {
    const response = await fetch("https://api.mammouth.ai/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: process.env.MAMMOUTH_MODEL || "minimax-m3",
        temperature: 0.2,
        max_tokens: 1800,
        messages: [
          {
            role: "system",
            content:
              "Tu es assistant d'une agence francophone d'études en Chine. Réécris le message client en français, clair, rassurant et réaliste. Ne jamais garantir admission, bourse ou visa. Ne pas inventer de frais, deadlines, HSK ou programmes absents du brief. Garde les noms d'universités et les scores. Réponds uniquement par le texte du mail, sans markdown.",
          },
          {
            role: "user",
            content: `Brief interne (JSON):\n${JSON.stringify(payload).slice(0, 12000)}\n\nBrouillon:\n${message}`,
          },
        ],
      }),
      signal: controller.signal,
    });
    if (!response.ok) return { message, ai: false };
    const data = await response.json();
    const text = data?.choices?.[0]?.message?.content?.trim();
    if (!text || text.length < 120) return { message, ai: false };
    return { message: text, ai: true };
  } catch {
    return { message, ai: false };
  } finally {
    clearTimeout(timer);
  }
}

export async function runMatching({
  contact,
  universities,
  documents,
  overrides,
  forceBilan = false,
}) {
  const student = normalizeStudent(contact, overrides, documents);
  const catalog = universities.map(normalizeUniversity);
  const { ranked, excluded } = rankMatches(student, catalog);
  const limit = limitForFormula(student.formuleNumber);
  const analyses = ranked.slice(0, Math.max(limit, 8)).map((match) =>
    buildUniversityAnalysis(match, student),
  );

  const formulaVotes = analyses
    .slice(0, 3)
    .map((item) => item.recommended_formula)
    .filter(Boolean);
  const overallFormula =
    student.formuleNumber ||
    (formulaVotes.sort((a, b) => b - a)[0] ?? 1);

  const draft = buildClientMessage(student, analyses, overallFormula);
  const polished = await polishClientMessage(draft, {
    student: {
      name: student.name,
      field: student.field,
      intake: student.intake?.label,
      budget: student.budget?.label,
    },
    matches: analyses.slice(0, 5).map((item) => ({
      name: item.university_name,
      score: item.score,
      category: item.category,
      strengths: item.strengths,
      warnings: item.warnings,
      deadline: item.deadline,
      language: item.teaching_language,
      cost: item.cost_estimate,
    })),
    formula: getFormuleByNumber(overallFormula)?.shortTitle,
  });

  let formule1_bilan = null;
  if (student.formuleNumber === 1 || forceBilan) {
    formule1_bilan = await generateFormule1Bilan({ student, analyses });
  }

  return {
    student,
    brief: buildInternalBrief(student, analyses, excluded, overallFormula),
    matches: analyses,
    excluded,
    client_message: polished.message,
    client_message_ai: polished.ai,
    recommended_formula: overallFormula,
    formule1_bilan,
    generated_at: new Date().toISOString(),
  };
}
