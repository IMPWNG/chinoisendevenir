import { FORMULES, displayFormulePrice, getFormuleNumber } from "./formules";
import {
  canonicalStatut,
  PAID_STATUSES,
  STUDENT_UNLOCKED_STATUSES,
} from "./suiviStatuts";

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
  nouveau_prospect: 0,
  bienvenue_envoyé: 0,
  prospect_perdu: 0,
  a_qualifier: 1,
  appel_réservé: 1,
  formules_présentées: 1,
  formule_choisie: 1,
  offre_envoyée: 1,
  relance_en_cours: 1,
  attente_paiement: 1,
  client_payé: 2,
  dossier_préparation: 3,
  dossier_incomplet: 3,
  candidature_envoyée: 4,
  admission_reçue: 5,
  visa_préparation: 6,
  arrive_chine: 7,
  dossier_terminé: 7,
};

export function getStudentStepIndex(statut) {
  if (!statut) return 0;
  const key = canonicalStatut(statut) || statut;
  return STATUS_STEP_INDEX[key] ?? 0;
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
  return STUDENT_UNLOCKED_STATUSES.has(canonicalStatut(statut));
}

export function isFormulePaid(contact) {
  return PAID_STATUSES.has(canonicalStatut(contact?.suivi_statut));
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
  label: `${FORMULE_OPTION_PREFIX[formule.number]} ${formule.shortTitle} — ${displayFormulePrice(formule)}`,
}));

const FILE_HINT = "PDF, JPG ou PNG — 10 Mo max.";

export const STUDENT_DOCUMENT_CATALOG = [
  {
    key: "passeport",
    label: "Passeport",
    icon: "🛂",
    description: `Passeport en cours de validité (${FILE_HINT}).`,
    levels: "all",
  },
  {
    key: "high_school_diploma",
    label: "Diplôme de fin d'études secondaires",
    icon: "🏫",
    description: `Baccalauréat ou équivalent, avec traduction si besoin (${FILE_HINT}).`,
    levels: ["bac", "autre"],
  },
  {
    key: "bachelor_degree",
    label: "Diplôme de licence (bachelor)",
    icon: "🎓",
    description: `Diplôme de licence / bachelor, avec relevés de notes si possible (${FILE_HINT}).`,
    levels: ["licence", "master", "doctorat", "autre"],
  },
  {
    key: "master_degree",
    label: "Diplôme de master",
    icon: "📜",
    description: `Diplôme de master, avec relevés de notes si possible (${FILE_HINT}).`,
    levels: ["master", "doctorat"],
  },
  {
    key: "hsk",
    label: "Certificat HSK",
    icon: "🈶",
    description: `Pour un programme enseigné en chinois (${FILE_HINT}).`,
    levels: "all",
  },
  {
    key: "ielts_or_toefl",
    label: "IELTS ou TOEFL",
    icon: "🔤",
    description: `Pour un programme enseigné en anglais. Un des deux certificats suffit (${FILE_HINT}).`,
    levels: "all",
  },
  {
    key: "csca",
    label: "CSCA",
    icon: "📝",
    description: `China Scholastic Competency Assessment, souvent demandé pour une licence en Chine (${FILE_HINT}).`,
    levels: ["bac"],
  },
  {
    key: "formulaire_medical",
    label: "Formulaire médical",
    icon: "🩺",
    description: `Formulaire d'examen médical pour étrangers (Foreigner Physical Examination Form), daté et tamponné (${FILE_HINT}).`,
    levels: "all",
  },
  {
    key: "casier_judiciaire",
    label: "Extrait de casier judiciaire",
    icon: "⚖️",
    description: `Certificat de non-condamnation (No Criminal Record), récent (${FILE_HINT}).`,
    levels: "all",
  },
];

export const REQUIRED_STUDENT_DOCUMENTS = STUDENT_DOCUMENT_CATALOG;

const DIPLOMA_DOC_KEYS = [
  "dernier_diplome",
  "high_school_diploma",
  "bachelor_degree",
  "master_degree",
];

export function diplomaLevelFromStudent(dernierDiplome) {
  const value = String(dernierDiplome || "").toLowerCase();
  if (value.includes("doctorat") || value.includes("phd")) return "doctorat";
  if (value.includes("master")) return "master";
  if (value.includes("licence") || value.includes("bachelor")) return "licence";
  if (value.includes("bac")) return "bac";
  return "autre";
}

export function getRequiredStudentDocuments(student = {}) {
  const level = diplomaLevelFromStudent(student.dernier_diplome);
  return STUDENT_DOCUMENT_CATALOG.filter(
    (doc) => doc.levels === "all" || doc.levels.includes(level),
  );
}

export function getSchoolDocumentsIntro(dernierDiplome) {
  const level = diplomaLevelFromStudent(dernierDiplome);
  if (level === "bac") {
    return "Pour une licence en Chine, les universités demandent le plus souvent le passeport, le bac, le CSCA, un certificat de langue, le formulaire médical et un extrait de casier judiciaire.";
  }
  if (level === "licence") {
    return "Pour un master, les universités demandent le plus souvent le passeport, le diplôme de licence, un certificat de langue, le formulaire médical et un extrait de casier judiciaire.";
  }
  if (level === "master" || level === "doctorat") {
    return "Pour un doctorat, les universités demandent le plus souvent le passeport, les diplômes de licence et de master, un certificat de langue, le formulaire médical et un extrait de casier judiciaire.";
  }
  return "Les universités chinoises demandent le plus souvent le passeport, le diplôme du dernier niveau, un certificat de langue, le formulaire médical et un extrait de casier judiciaire.";
}

export function legacyDiplomaDocKey(dernierDiplome) {
  const level = diplomaLevelFromStudent(dernierDiplome);
  if (level === "licence") return "bachelor_degree";
  if (level === "master" || level === "doctorat") return "master_degree";
  return "high_school_diploma";
}

export function studentHasDiplomaUpload(documents = []) {
  const keys = new Set(
    (documents || []).map((doc) =>
      typeof doc === "string" ? doc : doc.key,
    ),
  );
  return DIPLOMA_DOC_KEYS.some((key) => keys.has(key));
}

export const VISA_DOCUMENT_GUIDE = {
  title: "Documents pour le visa",
  intro:
    "Les étudiants qui souhaitent étudier en Chine doivent demander un visa. La démarche est simple. Commencez par identifier le type de visa adapté à votre séjour :",
  types: [
    {
      name: "Visa X1",
      description: "pour un séjour d'études de plus de 180 jours.",
    },
    {
      name: "Visa X2",
      description: "pour un séjour d'études de moins de 180 jours.",
    },
    {
      name: "Visa L",
      description: "pour un programme d'été ou d'hiver.",
    },
  ],
  documentsTitle: "Documents à fournir",
  documents: [
    "Passeport original",
    "Photo d'identité",
    "Un formulaire de demande de visa dûment rempli",
    "Preuve de séjour légal ou de résidence",
    "Lettre d'admission : original et photocopie",
    "Original et photocopie du formulaire « Visa Application for Study in China » (JW201 ou JW202). Uniquement requis pour le visa X1.",
  ],
  note: "En plus des documents ci-dessus, les agents consulaires peuvent exiger d'autres pièces, au cas par cas, pour décider de la délivrance du visa. La décision finale appartient aux autorités compétentes.",
};

export function studentCanAccessVisaDocuments(formuleNumber) {
  const n = Number(formuleNumber);
  return n === 1 || n >= 3;
}

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
