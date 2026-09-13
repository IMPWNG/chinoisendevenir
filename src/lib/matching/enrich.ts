import { matchingLlm } from "./llm";
import { QUALITY_FIELDS } from "./weights";
import type { MatchingStudent } from "./student";
import type { StudentDocRef } from "../studentProgress";

const CHINESE_LEVEL_TO_HSK: Record<string, number> = {
  debutant: 0,
  débutant: 0,
  intermediaire: 3,
  intermédiaire: 3,
  avance: 5,
  avancé: 5,
};

type IaSignals = {
  niveau_chinois_estime: string | null;
  niveau_anglais_estime: string | null;
  domaine_precis_souhaite: string | null;
  ville_mentionnee: string | null;
  contraintes_budget_mentionnees: string | null;
  signaux_motivation_forte: boolean;
  signaux_motivation_justification: string | null;
  signaux_risque: boolean;
  signaux_risque_detail: string | null;
  diplome_reel_estime: string | null;
  score_clarte_projet: number;
};

function clamp(value: number, min: number, max: number) {
  return Math.max(min, Math.min(max, value));
}

function filled(value: unknown) {
  if (value === null || value === undefined) return null;
  const text = String(value).trim();
  return text === "" ? null : text;
}

export function inferNiveauActuel(age: unknown, diplome: unknown) {
  const value = String(diplome || "").toLowerCase();
  if (value.includes("master") || value.includes("doctorat") || value.includes("phd")) {
    return "master";
  }
  if (value.includes("licence") || value.includes("bachelor")) return "licence";
  if (value.includes("bac")) return "lycee";
  if (age == null) return null;
  const n = Number(age);
  if (n < 20) return "lycee";
  if (n <= 24) return "licence";
  return "master";
}

export function inferNiveauVise(
  niveauActuel: unknown,
  diplome: unknown,
  existing: unknown,
): string | null {
  if (existing) return String(existing);
  const value = String(diplome || "").toLowerCase();
  if (value.includes("master") || value.includes("doctorat")) return "phd";
  if (value.includes("licence") || value.includes("bachelor")) return "master";
  if (value.includes("bac")) return "bachelor";
  if (niveauActuel === "lycee") return "bachelor";
  if (niveauActuel === "licence") return "master";
  if (niveauActuel === "master") return "phd";
  return null;
}

export function inferBesoinBourse(student: MatchingStudent) {
  if (student.scholarshipGoal === "required" || student.scholarshipGoal === "helpful") {
    return true;
  }
  if (student.scholarshipGoal === "none") return false;
  const maxUsd = student.budget?.maxUsd ?? student.budget?.maxEur ?? null;
  if (maxUsd != null && maxUsd < 5000) return true;
  return null;
}

function qualityFieldPresent(student: MatchingStudent, key: string) {
  if (key === "hskKnown") return student.hsk === 0 || student.hsk != null;
  if (key === "besoinBourseKnown") return student.besoinBourse != null;
  if (key === "budget") return Boolean(student.budget);
  if (key === "intake") return Boolean(student.intake?.label);
  if (key === "motivationText") return Boolean(filled(student.motivationText));
  const value = (student as Record<string, unknown>)[key];
  return value != null && value !== "";
}

export function computeQualityScore(
  student: MatchingStudent,
  documents: StudentDocRef[] = [],
  ia: IaSignals | null = null,
) {
  const filledCount = QUALITY_FIELDS.filter((key) =>
    qualityFieldPresent(student, key),
  ).length;
  const completeness = (filledCount / QUALITY_FIELDS.length) * 60;
  const clarte = (Number(ia?.score_clarte_projet) || 0) * 2;
  const academicDocs = (documents || []).some((doc) => {
    const key = String(doc.key || doc.label || "").toLowerCase();
    return (
      doc.status === "received" &&
      (key.includes("diplome") ||
        key.includes("diploma") ||
        key.includes("releve") ||
        key.includes("transcript"))
    );
  });
  const docsScore = academicDocs ? 20 : 0;
  const missingFields = QUALITY_FIELDS.filter(
    (key) => !qualityFieldPresent(student, key),
  );
  return {
    score: Math.round(clamp(completeness + clarte + docsScore, 0, 100)),
    missingFields,
    completeness: Math.round(completeness),
    clarte: Math.round(clarte),
    documents: docsScore,
  };
}

function emptyIa() {
  return {
    niveau_chinois_estime: null,
    niveau_anglais_estime: null,
    domaine_precis_souhaite: null,
    ville_mentionnee: null,
    contraintes_budget_mentionnees: null,
    signaux_motivation_forte: false,
    signaux_motivation_justification: null,
    signaux_risque: false,
    signaux_risque_detail: null,
    diplome_reel_estime: null,
    score_clarte_projet: 0,
  };
}

function normalizeIa(raw: unknown) {
  if (!raw || typeof raw !== "object") return emptyIa();
  const data = raw as Record<string, unknown>;
  const forte = data.signaux_motivation_forte;
  const risque = data.signaux_risque;
  const forteObj = asRecord(forte);
  const risqueObj = asRecord(risque);
  return {
    niveau_chinois_estime: filled(data.niveau_chinois_estime),
    niveau_anglais_estime: filled(data.niveau_anglais_estime),
    domaine_precis_souhaite: filled(data.domaine_precis_souhaite),
    ville_mentionnee: filled(data.ville_mentionnee),
    contraintes_budget_mentionnees: filled(data.contraintes_budget_mentionnees),
    signaux_motivation_forte: Boolean(
      forte && typeof forte === "object" ? forteObj.value ?? forteObj.bool : forte,
    ),
    signaux_motivation_justification: filled(
      typeof forte === "object"
        ? forteObj.justification || forteObj.reason
        : data.signaux_motivation_justification,
    ),
    signaux_risque: Boolean(
      risque && typeof risque === "object" ? risqueObj.value ?? risqueObj.bool : risque,
    ),
    signaux_risque_detail: filled(
      typeof risque === "object"
        ? risqueObj.justification || risqueObj.detail
        : data.signaux_risque_detail,
    ),
    diplome_reel_estime: filled(data.diplome_reel_estime),
    score_clarte_projet: clamp(Number(data.score_clarte_projet) || 0, 0, 10),
  };
}

function asRecord(value: unknown): Record<string, unknown> {
  if (value && typeof value === "object" && !Array.isArray(value)) {
    return value as Record<string, unknown>;
  }
  return {};
}

export async function extractMotivationSignals(texteMotivation: unknown) {
  const text = filled(texteMotivation);
  if (!text || text.length < 40) {
    return { ia: emptyIa(), ai: false };
  }

  const result = await matchingLlm({
    system: `Tu es un extracteur de données pour agence d'études en Chine.
Analyse le texte suivant et extrais un JSON avec les clés suivantes,
en laissant null si l'information n'est pas présente :

- niveau_chinois_estime (débutant/intermédiaire/avancé)
- niveau_anglais_estime (débutant/intermédiaire/avancé)
- domaine_precis_souhaite
- ville_mentionnee
- contraintes_budget_mentionnees
- signaux_motivation_forte (bool)
- signaux_motivation_justification (courte)
- signaux_risque (bool : travail illégal, urgence suspecte, incohérences)
- signaux_risque_detail (courte si true)
- diplome_reel_estime
- score_clarte_projet (0-10)

Réponds uniquement par le JSON.`,
    user: `Texte étudiant:\n"""${text.slice(0, 4000)}"""`,
    temperature: 0.1,
    maxTokens: 800,
    timeoutMs: 20000,
  });

  if (!result.ok || !result.json) return { ia: emptyIa(), ai: false };
  return { ia: normalizeIa(result.json), ai: true };
}

function hskFromIa(niveau: unknown) {
  if (!niveau) return null;
  const key = normalizeKey(niveau);
  return CHINESE_LEVEL_TO_HSK[key] ?? CHINESE_LEVEL_TO_HSK[String(niveau)] ?? null;
}

function normalizeKey(value: unknown) {
  return String(value || "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim();
}

function englishFromIa(niveau: unknown) {
  const key = normalizeKey(niveau);
  if (!key) return null;
  if (key.includes("avance")) return "C1";
  if (key.includes("intermediaire")) return "B2";
  if (key.includes("debutant")) return "A2";
  return null;
}

export async function enrichStudent(
  student: MatchingStudent,
  { documents = [] }: { documents?: StudentDocRef[] } = {},
) {
  const inferred: Record<string, unknown> = {};
  const next = { ...student };

  if (!next.niveauActuel) {
    next.niveauActuel = inferNiveauActuel(next.age, next.dernierDiplome);
    if (next.niveauActuel) inferred.niveauActuel = next.niveauActuel;
  }

  if (!next.targetDegree) {
    next.targetDegree = inferNiveauVise(
      next.niveauActuel,
      next.dernierDiplome,
      null,
    );
    if (next.targetDegree) {
      inferred.targetDegree = next.targetDegree;
      next.targetDegreeSource = "estimated";
    }
  }

  if (next.besoinBourse == null) {
    const besoin = inferBesoinBourse(next);
    if (besoin != null) {
      next.besoinBourse = besoin;
      inferred.besoinBourse = besoin;
      if (!next.scholarshipGoal) {
        next.scholarshipGoal = besoin ? "required" : "none";
      }
    }
  }

  const { ia, ai } = await extractMotivationSignals(next.motivationText);

  if (next.hsk == null) {
    const fromIa = hskFromIa(ia.niveau_chinois_estime);
    next.hsk = fromIa != null ? fromIa : 0;
    inferred.hsk = next.hsk;
    next.hskSource = fromIa != null ? "ia" : "default_beginner";
  }

  if (!next.english) {
    const fromIa = englishFromIa(ia.niveau_anglais_estime);
    if (fromIa) {
      next.english = fromIa;
      inferred.english = fromIa;
    }
  }

  if (ia.ville_mentionnee) {
    const city = ia.ville_mentionnee;
    if (!next.preferredCities.includes(city)) {
      next.preferredCities = [...next.preferredCities, city];
      inferred.preferredCity = city;
    }
  }

  if (ia.domaine_precis_souhaite && (!next.field || next.field === "Autre")) {
    next.fieldPrecis = ia.domaine_precis_souhaite;
    inferred.fieldPrecis = ia.domaine_precis_souhaite;
  } else if (ia.domaine_precis_souhaite) {
    next.fieldPrecis = ia.domaine_precis_souhaite;
  }

  const quality = computeQualityScore(next, documents, ia);
  next.qualityScore = quality.score;
  next.missingFields = quality.missingFields;
  next.iaAnalysis = ia;
  next.iaEnriched = ai;
  next.inferred = inferred;

  return next;
}

export function scoreMotivationIa(ia: Record<string, unknown> | IaSignals | null | undefined) {
  if (!ia) return 40;
  let base = (Number(ia.score_clarte_projet) || 0) * 10;
  if (ia.signaux_motivation_forte) base += 15;
  if (ia.signaux_risque) base -= 30;
  return clamp(base, 0, 100);
}
