import { matchingLlm } from "./llm";
import { buildDualReports, mergePolishedReports, NO_GUARANTEE } from "./reports";

function sourcePayload({ student, matches, excluded, gaps, documents, formuleNumber }) {
  return {
    student: {
      prenom: student.prenom,
      field: student.field,
      fieldPrecis: student.fieldPrecis,
      diploma: student.dernierDiplome,
      degree: student.targetDegree,
      degreeSource: student.targetDegreeSource,
      intake: student.intake?.label,
      hsk: student.hsk,
      hskSource: student.hskSource,
      english: student.english,
      budget: student.budget?.label,
      age: student.age,
      gpa: student.gpa,
      completeness: student.qualityScore,
      formuleNumber: student.formuleNumber,
    },
    formuleNumber,
    gaps: (gaps || []).slice(0, 8).map((gap) => ({
      type: gap.type,
      universite: gap.universite || null,
      conseil: gap.conseil,
    })),
    excluded: (excluded || []).slice(0, 20).map((item) => ({
      name: item.university_name,
      reason: item.excludeReason,
    })),
    documents: (documents || []).map((doc) => ({
      name: doc.label || doc.key,
      status: doc.status,
    })),
    matches: (matches || []).map((item) => ({
      name: item.university_name,
      city: item.city,
      score: item.score,
      category: item.category,
      categoryKey: item.categoryKey,
      language: item.teaching_language,
      deadline: item.deadline,
      cost: item.cost_estimate,
      scholarships: item.scholarships_possible,
      strengths: item.strengths,
      warnings: item.warnings,
      to_verify: item.to_verify,
      documents: item.missing_documents,
      breakdown: item.breakdown,
    })),
  };
}

export async function generateDualReports(ctx) {
  const draft = buildDualReports(ctx);
  const payload = sourcePayload(ctx);

  const polished = await matchingLlm({
    system: `Tu rédiges deux vues d'un matching d'études en Chine : une guideline interne conseiller, une lecture étudiant.

Règles non négociables :
- ${NO_GUARANTEE}
- N'invente aucun score, frais, deadline, HSK, document ou université. Reprends le JSON source.
- Donnée absente → « à préciser » (profil) ou « à vérifier auprès de l'université » (établissement). Jamais de valeur fantaisiste.
- Ton factuel, professionnel, non commercial. Pas de jargon interne côté étudiant (pas de « mix », « matching », « formule 1/2/3 » dans les phrases étudiant — tu peux dire « accompagnement souscrit »).
- Côté étudiant, un score brut est toujours accompagné d'une phrase de contexte.
- Un champ vide n'est pas une « erreur » pour l'étudiant : c'est une info à préciser pour affiner.

JSON uniquement :
{
  "diagnostic": {
    "limiting_factor": "langue|budget|documents|age|academique",
    "limiting_factor_note": "string",
    "top_actions": ["string","string","string"],
    "inconsistencies": [{"field":"string","note":"string","blocking":true}]
  },
  "draft_client_response": "texte mail, vouvoiement",
  "profile_blurb": "2 phrases max, chaleureuses et factuelles",
  "completeness_remaining_note": "string",
  "why_top": "2-3 phrases, pourquoi l'université en tête",
  "application_mix": "comment répartir les candidatures selon le plafond fourni",
  "no_safety_note": "string ou null",
  "vigilance_rewrite": { "Nom Université": ["phrase constructive"] },
  "closing": "message de clôture, invitation à l'échange"
}`,
    user: `Source de vérité (JSON) :\n${JSON.stringify(payload).slice(0, 14000)}\n\nBrouillon déjà calculé (à réécrire, sans changer les chiffres) :\n${JSON.stringify({
      diagnostic: draft.admin_report.diagnostic,
      draft_client_response: draft.admin_report.draft_client_response,
      profile_blurb: draft.student_report.profile_blurb,
      completeness: draft.student_report.completeness,
      options: draft.student_report.options_synthesis,
      closing: draft.student_report.closing,
      vigilance: Object.fromEntries(
        draft.student_report.universities.map((uni) => [uni.name, uni.vigilance]),
      ),
    }).slice(0, 8000)}`,
    temperature: 0.15,
    maxTokens: 4500,
    timeoutMs: 45000,
  });

  if (!polished.ok || !polished.json) {
    return draft;
  }

  return mergePolishedReports(draft, polished.json);
}
