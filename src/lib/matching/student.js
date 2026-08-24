import { getFormuleNumber } from "../formules";
import { getChosenFormule } from "../studentProgress";
import {
  BUDGET_BANDS,
  diplomaToTargetDegree,
  intakeFromRentree,
} from "./constants";

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

  return {
    id: contact.id,
    name: [contact.prenom, contact.nom].filter(Boolean).join(" ").trim(),
    prenom: filled(contact.prenom),
    nom: filled(contact.nom),
    country: filled(contact.pays),
    age: toNumber(overrides.age ?? contact.age),
    dernierDiplome,
    targetDegree,
    targetDegreeSource: filled(overrides.targetDegree) ? "confirmed" : "estimated",
    field: filled(contact.domaine_etudes),
    budgetKey,
    budget,
    intake: intakeFromRentree(contact.date_rentree),
    hsk: toNumber(overrides.hsk),
    english: filled(overrides.english),
    scholarshipGoal,
    documents: receivedDocs,
    formuleLabel: getChosenFormule(contact),
    formuleNumber: getFormuleNumber(getChosenFormule(contact)),
    notes: filled(overrides.extraNotes) || filled(contact.notes_admin),
  };
}
