export const FORMULE_1_VALUE = "Premier pas en Chine (800€)";
export const FORMULE_2_VALUE = "Admission universitaire (1700€)";
export const FORMULE_3_VALUE = "Accompagnement complet (2000€)";

export const PAYMENT_NOTE =
  "Paiement possible en plusieurs fois selon les conditions convenues.";

const FORMULE_1_INCLUDES = [
  "Analyse de votre profil, de votre parcours et de vos objectifs",
  "Évaluation de votre niveau actuel en chinois ou en anglais",
  "Conseils sur la durée et le type de programme adaptés",
  "Recherche personnalisée d'écoles de langue en Chine",
  "Sélection d'écoles selon votre budget, votre ville et vos préférences",
  "Vérification des conditions d'admission",
  "Informations sur les dates de rentrée et les programmes disponibles",
  "Aide à la préparation des documents nécessaires",
  "Vérification et organisation de votre dossier",
  "Accompagnement dans les étapes d'inscription",
  "Aide à la préparation du dossier de visa étudiant chinois",
  "Vérification des documents nécessaires pour le visa",
  "Conseils concernant la procédure de demande de visa",
  "Orientation concernant le logement, le voyage et l'arrivée en Chine",
  "Suivi jusqu'à la confirmation de votre inscription",
];

const FORMULE_2_INCLUDES = [
  "Analyse complète de votre parcours et de votre projet",
  "Définition de votre stratégie d'études en Chine",
  "Recherche personnalisée d'universités et de formations",
  "Recherche des opportunités de bourses disponibles",
  "Vérification des conditions d'admission",
  "Évaluation de la cohérence de votre profil avec les formations visées",
  "Sélection d'universités adaptées à votre niveau et à vos objectifs",
  "Préparation et organisation des documents",
  "Relecture et amélioration de votre dossier",
  "Aide à la rédaction ou à l'amélioration de votre projet d'études",
  "Vérification de votre CV et de votre lettre de motivation",
  "Aide au remplissage des formulaires de candidature",
  "Dépôt de jusqu'à 5 candidatures universitaires",
  "Suivi de l'avancement des candidatures",
  "Échanges réguliers pendant la procédure",
  "Suivi jusqu'à la réception des réponses des universités",
];

const FORMULE_3_GROUPS = [
  {
    title: "Première étape : année de chinois",
    items: [
      "Analyse approfondie de votre profil et de votre projet",
      "Recherche personnalisée d'une école de langue",
      "Sélection selon votre ville, votre budget et vos objectifs",
      "Vérification des conditions d'admission",
      "Aide à la préparation du dossier d'inscription",
      "Accompagnement pour l'inscription à l'école de langue",
      "Conseils concernant le logement et l'arrivée en Chine",
      "Aide à la préparation du dossier de visa étudiant chinois",
      "Conseils concernant les documents et les étapes de la demande de visa",
    ],
  },
  {
    title: "Deuxième étape : admission universitaire",
    items: [
      "Élaboration d'une stratégie personnalisée d'études en Chine",
      "Recherche d'universités, de formations et de bourses",
      "Sélection des établissements les plus adaptés à votre profil",
      "Vérification des critères d'admission et des délais",
      "Préparation complète du dossier de candidature",
      "Relecture et amélioration des documents importants",
      "Aide à la rédaction du projet d'études et des lettres nécessaires",
      "Aide au remplissage des plateformes et formulaires",
      "Dépôt de jusqu'à 8 candidatures universitaires",
      "Suivi personnalisé pendant toute la procédure",
      "Suivi des échanges avec les universités",
      "Suivi jusqu'à la réception des réponses des établissements",
    ],
  },
  {
    title: "Accompagnement après admission",
    items: [
      "Explication des documents transmis par l'université",
      "Conseils concernant les prochaines étapes",
      "Orientation concernant le logement",
      "Conseils pour organiser votre voyage",
      "Préparation de la liste des démarches avant le départ",
      "Conseils pour préparer votre installation en Chine",
      "Suivi jusqu'à votre départ",
    ],
  },
];

export const FORMULES = [
  {
    number: 1,
    value: FORMULE_1_VALUE,
    aliases: [
      "École de langue (500€)",
      "École de langue (800€)",
      "Bilan personnalisé (100€)",
      "Orientation (50€)",
    ],
    title: "Premier pas en Chine",
    subtitle: "Apprendre le chinois en Chine + aide au visa étudiant",
    shortTitle: "Premier pas en Chine",
    audience: "Pour une première année de chinois",
    badge: null,
    featured: false,
    price: "800 €",
    priceLabel: "800 euros",
    intro:
      "Vous souhaitez faire vos premiers pas en Chine, apprendre le chinois en immersion et communiquer plus vite au quotidien ? Cette formule vous accompagne pour choisir une école de langue et préparer votre départ, y compris le dossier de visa étudiant.",
    includes: FORMULE_1_INCLUDES,
    matchingIncludes: [
      "Analyse de votre profil, de votre parcours et de vos objectifs",
      "Évaluation de votre niveau actuel en chinois ou en anglais",
      "Conseils sur la durée et le type de programme adaptés",
      "Recherche personnalisée d'écoles de langue en Chine",
      "Sélection d'écoles selon votre budget, votre ville et vos préférences",
      "Accompagnement dans les étapes d'inscription",
      "Aide à la préparation des documents nécessaires",
      "Aide à la préparation du dossier de visa étudiant chinois",
      "Suivi jusqu'à la confirmation de votre inscription",
    ],
    footnote:
      "L'aide au visa comprend des conseils, une vérification et une orientation. Les décisions finales et la délivrance du visa relèvent des autorités compétentes.",
    idealIf: [
      "Vous souhaitez apprendre le chinois en Chine",
      "Vous voulez vous immerger dans la langue et la culture chinoise",
      "Vous êtes débutant ou souhaitez améliorer votre niveau",
      "Vous voulez développer vos chances de parler chinois au quotidien",
      "Vous souhaitez vivre une première expérience en Chine",
      "Vous préférez commencer par une année de langue avant l'université",
      "Vous avez besoin d'aide pour votre inscription et votre visa étudiant",
    ],
    cta: "Commencer mon projet en Chine",
  },
  {
    number: 2,
    value: FORMULE_2_VALUE,
    aliases: [
      "Admission universitaire (1000€)",
      "Accompagnement candidature (500€)",
      "Accompagnement candidature (300€)",
    ],
    title: "Admission universitaire",
    subtitle: "Accompagnement universitaire complet",
    shortTitle: "Admission universitaire",
    audience: "Pour un projet d'études déjà défini",
    badge: null,
    featured: false,
    price: "1 700 €",
    priceLabel: "1 700 euros",
    intro:
      "Vous avez déjà un projet universitaire et souhaitez intégrer une université en Chine ? Cette formule est consacrée exclusivement à votre admission, de la recherche des formations jusqu'à la réception des réponses des établissements.",
    includes: FORMULE_2_INCLUDES,
    matchingIncludes: [
      "Recherche personnalisée d'universités et de formations",
      "Vérification des conditions d'admission",
      "Préparation et organisation des documents",
      "Aide au remplissage des formulaires de candidature",
      "Dépôt de jusqu'à 5 candidatures universitaires",
      "Suivi jusqu'à la réception des réponses des universités",
      "Échanges réguliers pendant la procédure",
    ],
    footnote:
      "Cette formule concerne uniquement la partie universitaire. L'année de langue et l'accompagnement spécifique pour le visa ne sont pas inclus.",
    idealIf: [
      "Votre projet universitaire est déjà défini",
      "Vous souhaitez intégrer directement une université en Chine",
      "Vous avez déjà un niveau de langue suffisant pour votre formation",
      "Vous voulez présenter un dossier solide et bien organisé",
      "Vous avez besoin d'aide pour choisir les bonnes universités",
      "Vous souhaitez gagner du temps et éviter les erreurs",
      "Vous voulez être accompagné jusqu'aux réponses des établissements",
    ],
    cta: "Être accompagné pour mon admission universitaire",
  },
  {
    number: 3,
    value: FORMULE_3_VALUE,
    aliases: [
      "Accompagnement complet (1000€)",
      "Accompagnement complet (500€)",
    ],
    title: "Accompagnement complet",
    subtitle: "Année de chinois + année universitaire",
    shortTitle: "Accompagnement complet",
    audience: "Votre projet d'études en Chine de A à Z",
    badge: "Recommandée",
    featured: true,
    price: "2 000 €",
    priceLabel: "2 000 euros",
    comparePrice: "2 500 €",
    savings: "500 €",
    savingsLabel: "Économisez 500 €",
    savingsText:
      "En choisissant cette formule combinée, vous bénéficiez de l'accompagnement de la Formule 1 et de la Formule 2 pour 2 000 € au lieu de 2 500 €. Vous économisez 500 €, avec un suivi cohérent et un interlocuteur unique.",
    intro:
      "C'est notre accompagnement le plus complet. Vous commencez par une année de chinois en Chine, puis vous préparez votre admission universitaire. L'année de langue vous aide à vous adapter, à mieux communiquer au quotidien et à renforcer votre profil avant l'université.",
    includeGroups: FORMULE_3_GROUPS,
    includes: FORMULE_3_GROUPS.flatMap((group) => group.items),
    matchingIncludes: [
      "Dépôt de jusqu'à 8 candidatures universitaires",
      "Suivi personnalisé pendant toute la procédure",
      "Accompagnement après admission",
      "Aide à la préparation du dossier de visa étudiant chinois",
      "Orientation concernant le logement",
      "Suivi jusqu'à votre départ",
    ],
    footnote:
      "Visa, logement et arrivée : conseils, orientation et vérification des documents. Nous ne réalisons pas les démarches officielles à votre place. La délivrance du visa dépend exclusivement des autorités compétentes.",
    idealIf: [
      "Vous souhaitez apprendre le chinois avant l'université",
      "Vous voulez augmenter vos chances de réussir votre projet en Chine",
      "Vous souhaitez vous adapter progressivement à la vie chinoise",
      "Vous envisagez de poursuivre des études universitaires après l'année de langue",
      "Vous voulez un accompagnement complet et personnalisé",
      "Vous souhaitez économiser 500 € par rapport aux deux formules séparées",
      "Vous voulez gagner du temps grâce à une stratégie préparée dès le départ",
      "Vous préférez un interlocuteur unique pour tout votre projet",
      "Vous souhaitez être accompagné de la première inscription jusqu'au départ",
    ],
    whyChoose: {
      title: "Pourquoi choisir la formule complète ?",
      intro:
        "Avec cette formule, vous ne préparez pas uniquement votre arrivée en Chine. Vous construisez un véritable parcours :",
      steps: [
        "Vous commencez par apprendre le chinois en Chine.",
        "Vous vous adaptez à votre nouvel environnement.",
        "Vous améliorez votre niveau et votre communication.",
        "Vous préparez ensuite votre admission universitaire.",
        "Vous bénéficiez d'un suivi continu jusqu'à votre départ.",
      ],
    },
    cta: "Préparer mon parcours complet en Chine",
  },
];

export const EXTRA_FEES = [
  "Frais de candidature des universités",
  "Frais d'examens de langue",
  "Frais de traduction officielle ou certifiée",
  "Frais de légalisation, authentification ou notarisation",
  "Frais médicaux",
  "Frais de visa",
  "Frais d'envoi des documents",
  "Billet d'avion",
  "Logement",
  "Assurance",
  "Frais d'installation en Chine",
  "Frais administratifs demandés par une université ou une autorité",
];

export const PROCESS_STEPS = [
  {
    title: "Vous choisissez votre formule",
    text: "Vous sélectionnez l'offre qui correspond le mieux à votre projet et à votre niveau d'avancement.",
  },
  {
    title: "Nous échangeons par téléphone",
    text: "Nous analysons votre parcours, vos objectifs, votre budget et la faisabilité de votre projet.",
  },
  {
    title: "Nous validons la formule adaptée",
    text: "Nous confirmons ensemble les services inclus, les étapes prévues et les limites de l'accompagnement.",
  },
  {
    title: "Vous recevez les conditions de service",
    text: "Vous recevez un récapitulatif de l'accompagnement, les conditions de service et les modalités de règlement.",
  },
  {
    title: "L'accompagnement commence",
    text: "L'accompagnement débute après validation des conditions et confirmation du paiement.",
  },
];

export function getFormuleIncludeGroups(formule) {
  if (formule?.includeGroups?.length) return formule.includeGroups;
  if (formule?.includes?.length) {
    return [{ title: "Ce qui est inclus", items: formule.includes }];
  }
  return [];
}

export function getFormuleNumber(formuleLabel) {
  if (!formuleLabel) return null;
  const value = String(formuleLabel).trim();
  const found = FORMULES.find(
    (item) => item.value === value || item.aliases.includes(value),
  );
  if (found) return found.number;
  if (/complet|2000/i.test(value)) return 3;
  if (/admission|candidature|1700/i.test(value)) return 2;
  if (/chinois|langue|[ée]cole|bilan|orientation|premier pas/i.test(value)) {
    return 1;
  }
  return null;
}

export function displayFormuleLabel(formuleLabel) {
  const found = getFormuleByNumber(getFormuleNumber(formuleLabel));
  if (found) {
    return `Formule ${found.number} — ${found.title} (${found.price})`;
  }
  return formuleLabel || "Formule sélectionnée";
}

export function getFormuleByNumber(number) {
  return FORMULES.find((item) => item.number === number) || null;
}

export function canonicalFormuleValue(formuleLabel) {
  const found = getFormuleByNumber(getFormuleNumber(formuleLabel));
  if (found) return found.value;
  return formuleLabel ? String(formuleLabel).trim() : "";
}

export function getFormuleAccess(number) {
  const n = Number(number) || 0;
  if (n >= 3) {
    return {
      number: 3,
      matchLimit: 8,
      depth: "complete",
      documents: true,
      progress: true,
      visa: true,
      applications: 8,
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
      applications: 5,
    };
  }
  if (n >= 1) {
    return {
      number: 1,
      matchLimit: 8,
      depth: "orientation",
      documents: false,
      progress: true,
      visa: false,
      applications: 0,
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

/** Access flags for the unlocked student space, by chosen formula. */
export function getUnlockedStudentAccess(formuleNumber) {
  if (!formuleNumber) return getFormuleAccess(0);
  return getFormuleAccess(formuleNumber);
}

export function displayFormuleFootnote(footnote) {
  if (!footnote) return "";
  const text = String(footnote).trim();
  return text.startsWith("*") ? text : `* ${text}`;
}
