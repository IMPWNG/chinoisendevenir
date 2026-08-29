import { matchingLlm } from "./llm";
import { QUALITY_FIELDS } from "./weights";

const CHINESE_LEVEL_TO_HSK = {
  debutant: 0,
  débutant: 0,
  intermediaire: 3,
  intermédiaire: 3,
  avance: 5,
  avancé: 5,
};

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

function filled(value) {
  if (value === null || value === undefined) return null;
  const text = String(value).trim();
  return text === "" ? null : text;
}

export function inferNiveauActuel(age, diplome) {
  const value = String(diplome || "").toLowerCase();
  if (value.includes("master") || value.includes("doctorat") || value.includes("phd")) {
    return "master";
  }
  if (value.includes("licence") || value.includes("bachelor")) return "licence";
  if (value.includes("bac")) return "lycee";
  if (age == null) return null;
  if (age < 20) return "lycee";
  if (age <= 24) return "licence";
  return "master";
}

export function inferNiveauVise(niveauActuel, diplome, existing) {
  if (existing) return existing;
  const value = String(diplome || "").toLowerCase();
  if (value.includes("master") || value.includes("doctorat")) return "phd";
  if (value.includes("licence") || value.includes("bachelor")) return "master";
  if (value.includes("bac")) return "bachelor";
  if (niveauActuel === "lycee") return "bachelor";
  if (niveauActuel === "licence") return "master";
  if (niveauActuel === "master") return "phd";
  return null;
}

export function inferBesoinBourse(student) {
  if (student.scholarshipGoal === "required" || student.scholarshipGoal === "helpful") {
    return true;
  }
  if (student.scholarshipGoal === "none") return false;
  const maxUsd = student.budget?.maxUsd ?? student.budget?.maxEur ?? null;
  if (maxUsd != null && maxUsd < 5000) return true;
  return null;
}

function qualityFieldPresent(student, key) {
  if (key === "hskKnown") return student.hsk === 0 || student.hsk != null;
  if (key === "besoinBourseKnown") return student.besoinBourse != null;
  if (key === "budget") return Boolean(student.budget);
  if (key === "intake") return Boolean(student.intake?.label);
  if (key === "motivationText") return Boolean(filled(student.motivationText));
  return student[key] != null && student[key] !== "";
}

export function computeQualityScore(student, documents = [], ia = null) {
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

function normalizeIa(raw) {
  if (!raw || typeof raw !== "object") return emptyIa();
  const forte = raw.signaux_motivation_forte;
  const risque = raw.signaux_risque;
  return {
    niveau_chinois_estime: filled(raw.niveau_chinois_estime),
    niveau_anglais_estime: filled(raw.niveau_anglais_estime),
    domaine_precis_souhaite: filled(raw.domaine_precis_souhaite),
    ville_mentionnee: filled(raw.ville_mentionnee),
    contraintes_budget_mentionnees: filled(raw.contraintes_budget_mentionnees),
    signaux_motivation_forte: Boolean(
      forte && typeof forte === "object" ? forte.value ?? forte.bool : forte,
    ),
    signaux_motivation_justification: filled(
      typeof forte === "object"
        ? forte.justification || forte.reason
        : raw.signaux_motivation_justification,
    ),
    signaux_risque: Boolean(
      risque && typeof risque === "object" ? risque.value ?? risque.bool : risque,
    ),
    signaux_risque_detail: filled(
      typeof risque === "object"
        ? risque.justification || risque.detail
        : raw.signaux_risque_detail,
    ),
    diplome_reel_estime: filled(raw.diplome_reel_estime),
    score_clarte_projet: clamp(Number(raw.score_clarte_projet) || 0, 0, 10),
  };
}

export async function extractMotivationSignals(texteMotivation) {
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

function hskFromIa(niveau) {
  if (!niveau) return null;
  const key = normalizeKey(niveau);
  return CHINESE_LEVEL_TO_HSK[key] ?? CHINESE_LEVEL_TO_HSK[niveau] ?? null;
}

function normalizeKey(value) {
  return String(value || "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim();
}

function englishFromIa(niveau) {
  const key = normalizeKey(niveau);
  if (!key) return null;
  if (key.includes("avance")) return "C1";
  if (key.includes("intermediaire")) return "B2";
  if (key.includes("debutant")) return "A2";
  return null;
}

export async function enrichStudent(student, { documents = [] } = {}) {
  const inferred = {};
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

export function scoreMotivationIa(ia) {
  if (!ia) return 40;
  let base = (Number(ia.score_clarte_projet) || 0) * 10;
  if (ia.signaux_motivation_forte) base += 15;
  if (ia.signaux_risque) base -= 30;
  return clamp(base, 0, 100);
}
