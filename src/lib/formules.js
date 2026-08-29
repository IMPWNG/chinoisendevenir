export const FORMULE_1_VALUE = "Bilan personnalisé (100€)";
export const FORMULE_2_VALUE = "Accompagnement candidature (500€)";
export const FORMULE_3_VALUE = "Accompagnement complet (1000€)";

export const FORMULES = [
  {
    number: 1,
    value: FORMULE_1_VALUE,
    aliases: ["Orientation (50€)"],
    title: "Bilan personnalisé et stratégie d'études",
    shortTitle: "Bilan personnalisé",
    price: "100 €",
    priceLabel: "100 euros",
    intro:
      "Pour clarifier votre projet et savoir concrètement comment avancer avant de vous lancer.",
    includes: [
      "Analyse de votre parcours, de votre profil et de votre projet",
      "Évaluation de votre niveau de langue et de votre situation",
      "Conseils sur le domaine et le niveau d'études",
      "Première sélection d'universités et de formations",
      "Informations sur les bourses possibles",
      "Présentation des étapes de la procédure",
      "Liste personnalisée des documents à préparer",
      "Recommandations pour renforcer votre dossier",
      "Échange téléphonique + compte rendu des prochaines étapes",
    ],
    idealIf: [
      "Vous ne savez pas encore quelle formation choisir",
      "Vous hésitez entre plusieurs universités",
      "Vous voulez savoir si votre profil est adapté",
      "Vous souhaitez comprendre les démarches avant de vous lancer",
    ],
    cta: "Demander mon bilan personnalisé",
  },
  {
    number: 2,
    value: FORMULE_2_VALUE,
    aliases: ["Accompagnement candidature (300€)"],
    title: "Accompagnement à la candidature",
    shortTitle: "Accompagnement candidature",
    price: "500 €",
    priceLabel: "500 euros",
    intro:
      "Pour préparer et déposer vos candidatures avec un suivi structuré, jusqu'aux réponses des universités.",
    includes: [
      "Tous les services de la formule 1",
      "Recherche personnalisée d'universités, formations et bourses",
      "Vérification des critères d'admission",
      "Préparation, relecture et mise en cohérence du dossier",
      "Aide aux formulaires de candidature",
      "Dépôt de 3 candidatures maximum",
      "Suivi jusqu'aux réponses des universités",
      "Échanges réguliers sur l'avancement",
    ],
    idealIf: [
      "Votre projet est déjà assez clair",
      "Vous voulez gagner du temps et éviter les erreurs",
      "Vous avez besoin d'aide pour constituer le dossier",
      "Vous souhaitez être accompagné jusqu'aux réponses",
    ],
    cta: "Être accompagné pour ma candidature",
  },
  {
    number: 3,
    value: FORMULE_3_VALUE,
    aliases: ["Accompagnement complet (500€)"],
    title: "Accompagnement complet jusqu'au départ",
    shortTitle: "Accompagnement complet",
    price: "1 000 €",
    priceLabel: "1 000 euros",
    intro:
      "Pour un suivi de A à Z : candidatures, admission, visa, logement et préparation du départ.",
    includes: [
      "Tous les services des formules 1 et 2",
      "Jusqu'à 5 candidatures universitaires",
      "Suivi personnalisé pendant toute la procédure",
      "Assistance après admission et lecture des documents de l'université",
      "Conseils pour le dossier de visa et les démarches avant le départ",
      "Orientation logement, voyage et arrivée en Chine",
      "Liste des démarches à faire avant le départ",
    ],
    footnote:
      "Visa, logement et arrivée : conseils et orientation. Nous ne réalisons pas les démarches officielles à votre place.",
    idealIf: [
      "Vous voulez un accompagnement de A à Z",
      "Vous avez besoin d'un suivi régulier",
      "Vous souhaitez de l'aide après l'admission",
      "Vous voulez préparer visa et arrivée sereinement",
    ],
    cta: "Préparer mon départ en Chine",
  },
];

export const EXTRA_FEES = [
  "Frais de candidature des universités",
  "Examens de langue",
  "Traductions officielles ou certifiées",
  "Légalisation, authentification, notarisation",
  "Frais médicaux",
  "Visa, envoi de documents, billet d'avion",
  "Logement, assurance, installation en Chine",
  "Tout autre frais administratif demandé par une université ou une autorité",
];

export const PROCESS_STEPS = [
  {
    title: "Vous choisissez une formule",
    text: "Cela nous permet de comprendre votre besoin et de préparer l'échange.",
  },
  {
    title: "Nous échangeons par téléphone",
    text: "Nous analysons votre parcours, vos objectifs et la faisabilité du projet.",
  },
  {
    title: "Nous confirmons l'accompagnement",
    text: "Nous précisons les services inclus et les limites de la formule.",
  },
  {
    title: "Vous recevez les conditions",
    text: "Récapitulatif, conditions de service et modalités de règlement.",
  },
  {
    title: "L'accompagnement commence",
    text: "Après validation des conditions et confirmation du règlement.",
  },
];

export function getFormuleNumber(formuleLabel) {
  if (!formuleLabel) return null;
  const value = String(formuleLabel).trim();
  const found = FORMULES.find(
    (item) => item.value === value || item.aliases.includes(value),
  );
  if (found) return found.number;
  if (/complet|1000/i.test(value)) return 3;
  if (/candidature|500/i.test(value)) return 2;
  if (/bilan|orientation|100/i.test(value)) return 1;
  return null;
}

export function displayFormuleLabel(formuleLabel) {
  const labels = {
    [FORMULE_1_VALUE]: `Formule 1 — ${FORMULES[0].title} (${FORMULES[0].price})`,
    [FORMULE_2_VALUE]: `Formule 2 — ${FORMULES[1].title} (${FORMULES[1].price})`,
    [FORMULE_3_VALUE]: `Formule 3 — ${FORMULES[2].title} (${FORMULES[2].price})`,
    "Orientation (50€)": `Formule 1 — ${FORMULES[0].title} (${FORMULES[0].price})`,
    "Accompagnement candidature (300€)": `Formule 2 — ${FORMULES[1].title} (${FORMULES[1].price})`,
    "Accompagnement complet (500€)": `Formule 3 — ${FORMULES[2].title} (${FORMULES[2].price})`,
  };
  return labels[formuleLabel] || formuleLabel || "Formule sélectionnée";
}

export function getFormuleByNumber(number) {
  return FORMULES.find((item) => item.number === number) || null;
}

export function getFormuleAccess(number) {
  const n = Number(number) || 0;
  if (n >= 3) {
    return {
      number: 3,
      matchLimit: 10,
      depth: "complete",
      documents: true,
      progress: true,
      visa: true,
    };
  }
  if (n >= 2) {
    return {
      number: 2,
      matchLimit: 8,
      depth: "candidature",
      documents: true,
      progress: true,
      visa: false,
    };
  }
  if (n >= 1) {
    return {
      number: 1,
      matchLimit: 5,
      depth: "orientation",
      documents: false,
      progress: false,
      visa: false,
    };
  }
  return {
    number: 0,
    matchLimit: 0,
    depth: "none",
    documents: false,
    progress: false,
    visa: false,
  };
}
