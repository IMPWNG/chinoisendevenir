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

export function getChosenFormule(contact) {
  if (!contact) return "";
  if (contact.formule) return String(contact.formule).trim();
  const notes = String(contact.notes_admin || "");
  const match = notes.match(/Formule choisie:\s*(.+)/i);
  return match ? match[1].trim() : "";
}
