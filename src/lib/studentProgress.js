import { FORMULES, getFormuleNumber } from "./formules";

export const DOMAINES_ETUDES = [
  "Informatique / IA / Data Science",
  "Ingénierie / Génie civil",
  "Génie électrique / Énergie",
  "Génie mécanique",
  "Aérospatial",
  "Architecture",
  "Commerce / Business",
  "Commerce international",
  "Management / Gestion",
  "Marketing digital",
  "Banque / Finance / Assurance",
  "Droit",
  "Science politique",
  "Sciences pharmaceutiques",
  "Agriculture",
  "Hydrologie",
  "Langues",
  "Autre",
];

export const STUDENT_PROCESS_STEPS = [
  {
    key: "inscription",
    label: "Inscription",
    icon: "📝",
    description: "Votre profil a été enregistré.",
  },
  {
    key: "consultation",
    label: "Consultation initiale",
    icon: "🤝",
    description: "Analyse de votre projet d'études.",
  },
  {
    key: "formation",
    label: "Choix de la formation",
    icon: "🏫",
    description: "Université et programme adaptés.",
  },
  {
    key: "dossier",
    label: "Préparation du dossier",
    icon: "📄",
    description: "Documents et candidature en cours.",
  },
  {
    key: "envoi",
    label: "Candidature envoyée",
    icon: "📤",
    description: "Dossier transmis aux universités.",
  },
  {
    key: "admission",
    label: "Admission",
    icon: "🎊",
    description: "Réponse des universités.",
  },
  {
    key: "visa",
    label: "Visa et départ",
    icon: "✈️",
    description: "Formalités avant l'arrivée en Chine.",
  },
  {
    key: "termine",
    label: "Arrivée",
    icon: "🎓",
    description: "Dossier finalisé.",
  },
];

const STATUS_STEP_INDEX = {
  mail_bienvenue_envoyé: 0,
  relance_1_envoyée: 0,
  relance_2_envoyée: 0,
  nouveau_prospect: 0,
  nouveau: 0,
  choix_des_formules: 1,
  formule_choisie: 1,
  prospect_à_qualifier: 1,
  offre_envoyée: 1,
  attente_paiement: 1,
  client_payé: 2,
  appel_réservé: 2,
  dossier_préparation: 3,
  candidature_envoyée: 4,
  admission_reçue: 5,
  dossier_terminé: 7,
};

export function getStudentStepIndex(statut) {
  if (!statut) return 0;
  return STATUS_STEP_INDEX[statut] ?? 0;
}

export function clampDossierEtape(value) {
  if (value === null || value === undefined || value === "") return null;
  const index = Number(value);
  if (!Number.isInteger(index)) return null;
  if (index < 0 || index >= STUDENT_PROCESS_STEPS.length) return null;
  return index;
}

export function getDisplayedStepIndex(contact) {
  const explicit = clampDossierEtape(contact?.dossier_etape);
  if (explicit !== null) return explicit;
  const notes = String(contact?.notes_admin || "");
  const match = notes.match(/Avancement dossier:\s*(\d+)/i);
  if (match) {
    const fromNotes = clampDossierEtape(Number(match[1]));
    if (fromNotes !== null) return fromNotes;
  }
  return getStudentStepIndex(contact?.suivi_statut);
}

export function mergeAvancementNote(notesAdmin, etapeIndex) {
  const noteLine = `Avancement dossier: ${etapeIndex}`;
  const cleaned = stripAvancementNote(notesAdmin);
  return cleaned ? `${cleaned}\n${noteLine}` : noteLine;
}

export function stripAvancementNote(notesAdmin) {
  return String(notesAdmin || "")
    .replace(/\n?Avancement dossier:\s*\d+/gi, "")
    .trim();
}

export function isStudentSpaceUnlocked(statut) {
  const unlocked = new Set([
    "formule_choisie",
    "prospect_à_qualifier",
    "offre_envoyée",
    "attente_paiement",
    "client_payé",
    "appel_réservé",
    "dossier_préparation",
    "candidature_envoyée",
    "admission_reçue",
    "dossier_terminé",
  ]);
  return unlocked.has(statut);
}

const PAID_STATUSES = new Set([
  "client_payé",
  "appel_réservé",
  "dossier_préparation",
  "candidature_envoyée",
  "admission_reçue",
  "dossier_terminé",
]);

export function isFormulePaid(contact) {
  return PAID_STATUSES.has(contact?.suivi_statut);
}

export function isStudentAccessGranted(contact) {
  if (!contact) return false;
  if (!getChosenFormule(contact)) return false;
  return (
    isStudentSpaceUnlocked(contact.suivi_statut) || isFormulePaid(contact)
  );
}

export function getGrantedFormuleNumber(contact) {
  if (!isStudentAccessGranted(contact)) return null;
  return getFormuleNumber(getChosenFormule(contact)) || 1;
}

export function hasFilledLeadForm(contact) {
  if (!contact) return false;
  const required = [
    contact.prenom,
    contact.nom,
    contact.pays,
    contact.dernier_diplome,
    contact.domaine_etudes,
  ];
  return required.every((value) => {
    if (value === null || value === undefined) return false;
    return String(value).trim() !== "";
  });
}

export function getPaidFormuleNumber(contact) {
  if (!isFormulePaid(contact)) return null;
  return getFormuleNumber(getChosenFormule(contact)) || 1;
}

export function studentCanAccessDocuments(contact) {
  if (!isStudentAccessGranted(contact)) return false;
  return Number(getGrantedFormuleNumber(contact)) >= 2;
}

export function getVisibleStudentSteps(formuleNumber) {
  const n = Number(formuleNumber) || 0;
  if (n <= 1) {
    return STUDENT_PROCESS_STEPS.slice(0, 2).map((step) =>
      step.key === "consultation"
        ? { ...step, label: "Consultation" }
        : step,
    );
  }
  if (n === 2) {
    const admissionIndex = STUDENT_PROCESS_STEPS.findIndex(
      (step) => step.key === "admission",
    );
    return STUDENT_PROCESS_STEPS.slice(0, admissionIndex + 1);
  }
  return STUDENT_PROCESS_STEPS;
}

const FORMULE_OPTION_PREFIX = ["", "1️⃣", "2️⃣", "3️⃣"];

export const FORMULE_OPTIONS = FORMULES.map((formule) => ({
  value: formule.value,
  label: `${FORMULE_OPTION_PREFIX[formule.number]} ${formule.shortTitle} (${formule.price})`,
}));

export const REQUIRED_STUDENT_DOCUMENTS = [
  {
    key: "passeport",
    label: "Passeport",
    icon: "🛂",
    description: "Passeport en cours de validité (PDF, JPG ou PNG — 10 Mo max).",
  },
  {
    key: "dernier_diplome",
    label: "Dernier diplôme obtenu",
    icon: "🎓",
    description:
      "Copie de votre dernier diplôme obtenu (PDF, JPG ou PNG — 10 Mo max).",
  },
];

export function getChosenFormule(contact) {
  if (!contact) return "";
  if (contact.formule) return String(contact.formule).trim();
  const notes = String(contact.notes_admin || "");
  const match = notes.match(/Formule choisie:\s*(.+)/i);
  return match ? match[1].trim() : "";
}

export function mergeFormuleNote(notesAdmin, formuleLabel) {
  const noteLine = `Formule choisie: ${formuleLabel}`;
  const cleaned = stripFormuleNote(notesAdmin);
  return cleaned ? `${cleaned}\n${noteLine}` : noteLine;
}

export function stripFormuleNote(notesAdmin) {
  return String(notesAdmin || "")
    .replace(/\n?Formule choisie:\s*.+/gi, "")
    .trim();
}
