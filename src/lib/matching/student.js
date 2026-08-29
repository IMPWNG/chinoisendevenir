import { getFormuleNumber } from "../formules";
import { getChosenFormule } from "../studentProgress";
import {
  BUDGET_BANDS,
  diplomaToTargetDegree,
  englishToIelts,
  englishToToefl,
  intakeFromRentree,
} from "./constants";
import { USD_TO_CNY } from "./weights";

function filled(value) {
  if (value === null || value === undefined) return null;
  const text = String(value).trim();
  return text === "" ? null : text;
}

function toNumber(value) {
  if (value === "" || value === null || value === undefined) return null;
  const n = Number(value);
  return Number.isFinite(n) ? n : null;
}

export function stripMatchingNotes(notes) {
  return String(notes || "")
    .replace(/\n*--- Matching[\s\S]*?--- Fin matching ---/g, "")
    .trim();
}

export function normalizeStudent(contact, overrides = {}, documents = []) {
  const dernierDiplome = filled(contact.dernier_diplome);
  const targetDegree =
    filled(overrides.targetDegree) || diplomaToTargetDegree(dernierDiplome);
  const budgetKey = filled(contact.budget);
  const budget = BUDGET_BANDS[budgetKey] || null;
  const scholarshipGoal =
    filled(overrides.scholarshipGoal) ||
    (budget?.scholarshipRequired ? "required" : null);
  const receivedDocs = documents
    .filter((doc) => doc.status === "received")
    .map((doc) => doc.key);

  const maxUsd = budget?.maxUsd ?? budget?.maxEur ?? null;
  const budgetCny = maxUsd != null ? Math.round(maxUsd * USD_TO_CNY) : null;
  const motivationText = filled(overrides.extraNotes) || stripMatchingNotes(contact.notes_admin);
  const english = filled(overrides.english);
  const preferredCities = Array.isArray(overrides.preferredCities)
    ? overrides.preferredCities.filter(Boolean)
    : filled(overrides.preferredCity)
      ? [overrides.preferredCity]
      : [];

  const besoinBourse =
    scholarshipGoal === "required" || scholarshipGoal === "helpful"
      ? true
      : scholarshipGoal === "none"
        ? false
        : null;

  return {
    id: contact.id,
    name: [contact.prenom, contact.nom].filter(Boolean).join(" ").trim(),
    prenom: filled(contact.prenom),
    nom: filled(contact.nom),
    country: filled(contact.pays),
    nationalite: filled(overrides.nationalite) || filled(contact.pays),
    age: toNumber(overrides.age ?? contact.age),
    dernierDiplome,
    niveauActuel: filled(overrides.niveauActuel),
    targetDegree,
    targetDegreeSource: filled(overrides.targetDegree) ? "confirmed" : "estimated",
    field: filled(contact.domaine_etudes),
    fieldPrecis: filled(overrides.fieldPrecis),
    budgetKey,
    budget,
    budgetCny,
    intake: intakeFromRentree(contact.date_rentree),
    hsk: toNumber(overrides.hsk),
    hskSource: overrides.hsk === 0 || overrides.hsk ? "admin" : null,
    english,
    ielts: toNumber(overrides.ielts) ?? englishToIelts(english),
    toefl: toNumber(overrides.toefl) ?? englishToToefl(english),
    gpa: toNumber(overrides.gpa),
    scholarshipGoal,
    besoinBourse,
    preferredCities,
    motivationText,
    documents: receivedDocs,
    formuleLabel: getChosenFormule(contact),
    formuleNumber: getFormuleNumber(getChosenFormule(contact)),
    notes: filled(overrides.extraNotes) || filled(contact.notes_admin),
    qualityScore: null,
    missingFields: [],
    inferred: {},
    iaAnalysis: null,
    iaEnriched: false,
  };
}
