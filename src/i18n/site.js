export const SITE_LANGS = [
  { id: "fr", label: "FR" },
  { id: "en", label: "EN" },
];

const STUDY_DOMAIN_VALUES = [
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

const fr = {
  nav: {
    home: "Accueil",
    study: "Étudier en Chine",
    language: "Écoles de langue",
    scholarships: "Bourses",
    visa: "Visa",
    process: "Processus",
    faq: "FAQ",
    pricing: "Tarifs",
    contact: "Contact",
    student: "Espace étudiant",
    mySpace: "Mon espace",
    signup: "S'inscrire",
    menu: "Menu",
  },
  footer: {
    description:
      "Accompagnement francophone pour étudier en Chine : orientation, admission universitaire, bourses et visa étudiant.",
    rights: "Tous droits réservés",
    colStudy: "Étudier en Chine",
    guide: "Guide : étudier en Chine",
    languageSchools: "Écoles de langue",
    studentVisa: "Visa étudiant",
    scholarships: "Bourses d'études",
    admissionProcess: "Processus d'admission",
    faq: "FAQ",
    colSupport: "Accompagnement",
    pricing: "Tarifs",
    contact: "Contact",
    evaluate: "Évaluer mon projet",
    studentSpace: "Espace étudiant",
    colContact: "Contact",
    contactLead:
      "Une question sur une année de chinois, une université ou un visa ? Écrivez-nous.",
    contactPage: "Page contact",
    colInfo: "Informations",
    privacy: "Politique de confidentialité",
    terms: "Conditions d'utilisation",
  },
  hero: {
    badge: "🎓 Votre projet d'études en Chine commence ici",
    title: "Étudier en Chine : admission, bourse et visa, accompagnés de A à Z",
    subtitle:
      "Vous voulez venir faire vos études en Chine ? Nous vous guidons à chaque étape : choix de la formation, université chinoise, dossier d'admission, bourses d'études et visa étudiant.",
    ctaPrimary: "Évaluer mon projet",
    ctaSecondary: "Voir nos tarifs",
  },
  stats: {
    students: "Étudiants accompagnés",
    universities: "Universités partenaires",
    dossiers: "Dossiers accompagnés",
    years: "Années d'expérience",
  },
  services: {
    title: "Un accompagnement complet pour votre réussite",
    subtitle:
      "De la première consultation jusqu'à votre installation en Chine, notre équipe vous guide avec des conseils adaptés à votre profil et à vos objectifs.",
    items: [
      {
        title: "Orientation académique",
        description:
          "Nous analysons votre profil, vos objectifs et votre budget afin de vous aider à choisir la formation la plus adaptée.",
      },
      {
        title: "Choix de l'université",
        description:
          "Nous vous aidons à identifier les universités chinoises correspondant à votre niveau, votre domaine d'études et vos ambitions.",
      },
      {
        title: "Candidature et admission",
        description:
          "Nous vous accompagnons dans la préparation de votre dossier, la traduction des documents et le dépôt de votre candidature.",
      },
      {
        title: "Recherche de bourse",
        description:
          "Nous vous informons sur les possibilités de bourses d'études et vous aidons à préparer un dossier solide.",
      },
      {
        title: "Accompagnement visa",
        description:
          "Après votre admission, nous vous guidons dans la préparation de votre dossier de visa étudiant.",
      },
      {
        title: "Préparation au départ",
        description:
          "Nous vous aidons à préparer votre arrivée : logement, inscription, accueil et premières démarches en Chine.",
      },
    ],
  },
  programs: {
    title: "Trouvez la formation qui vous correspond",
    subtitle:
      "Que vous souhaitiez apprendre le chinois, obtenir un diplôme ou poursuivre vos études supérieures, nous vous aidons à construire un projet adapté.",
    list: [
      "Licence / Bachelor",
      "Master",
      "Doctorat / PhD",
      "Cours de chinois",
      "Année préparatoire",
      "Formations professionnelles",
    ],
    hesitate:
      "Vous hésitez encore ? Les {link} aident à choisir une école de langue ou une université avant de déposer un dossier.",
    formulasLink: "formules d'accompagnement",
    languageCta: "Pas d'IELTS ni de TOEFL ? Voir les écoles de langue en Chine",
  },
  home: {
    whyTitle: "Pourquoi étudier en Chine",
    whySubtitle:
      "Étudier en Chine, ce n'est pas seulement « partir à l'étranger ». C'est viser une université, une langue d'enseignement, un budget et un visa, puis relier ces étapes dans le bon ordre.",
    why: [
      {
        title: "Un système universitaire vaste",
        text: "La Chine accueille des étudiants internationaux en licence, master, doctorat et année de langue, avec des formations en chinois ou en anglais.",
      },
      {
        title: "Des bourses possibles, jamais automatiques",
        text: "CSC, bourses d'université, de province ou de ville : un dossier solide peut réduire le coût des études, sans garantie de financement.",
      },
      {
        title: "Un projet à préparer en amont",
        text: "Admission, documents, langue, visa X1 ou X2 : venir faire ses études en Chine demande plusieurs mois de préparation.",
      },
    ],
    howTitle: "Comment venir faire ses études en Chine",
    howSubtitle:
      "Le parcours type dure souvent 4 à 6 mois : orientation, admission, bourse éventuelle, visa, puis départ.",
    howLink: "Lire le guide complet",
    how: [
      {
        title: "Clarifier le projet",
        text: "Domaine, niveau, langue d'enseignement et budget : on part de votre profil, pas d'une université au hasard.",
        href: "/processus",
      },
      {
        title: "Candidater",
        text: "Dossier, traductions, lettres et suivi auprès des universités chinoises visées.",
        href: "/etudier-en-chine",
      },
      {
        title: "Financer si possible",
        text: "On identifie les bourses réalistes, dont la CSC, sans promettre un résultat.",
        href: "/bourses",
      },
      {
        title: "Obtenir le visa étudiant",
        text: "Après l'admission : JW201/JW202, visa X1 ou X2, puis installation en Chine.",
        href: "/visa-etudiant-chine",
      },
    ],
    faqTitle: "Questions fréquentes sur les études en Chine",
    allFaqs: "Voir toutes les questions sur les études en Chine",
  },
  form: {
    title: "Parlons de votre projet d'études",
    subtitle:
      "Remplissez le formulaire ci-dessous. Notre équipe analysera votre profil et vous contactera rapidement pour vous présenter les options adaptées.",
    firstname: "Prénom",
    lastname: "Nom",
    age: "Âge",
    email: "Adresse e-mail",
    phone: "Numéro de téléphone",
    country: "Pays de résidence",
    level: "Dernier diplôme obtenu",
    field: "Domaine d'études souhaité",
    budget: "Budget annuel estimé",
    intake: "Période de rentrée souhaitée",
    message: "Parlez-nous de votre projet ou posez-nous votre question",
    messagePlaceholder: "Parlez-nous de votre projet d'études...",
    otherFieldPlaceholder: "Précisez votre domaine",
    select: "-- Sélectionner --",
    submit: "Obtenir une première orientation",
    submitting: "Analyse de votre demande...",
    success:
      "Merci pour votre demande ! Notre équipe va étudier votre profil et vous contactera prochainement.",
    createSpace: "Créer mon espace étudiant",
    error: "L'envoi n'a pas abouti. Réessayez dans un instant.",
    errorRateLimit:
      "Trop de demandes pour le moment. Réessayez dans quelques minutes.",
    duplicate:
      "Cette adresse e-mail a déjà été enregistrée. Notre équipe vous contactera prochainement.",
    required: "Veuillez remplir ce champ",
    errorEmail: "Veuillez saisir une adresse e-mail valide",
    errorPhone: "Veuillez saisir un numéro de téléphone valide",
    errorAge: "Veuillez saisir un âge valide",
    diplomas: {
      bac: "Baccalauréat",
      licence: "Licence",
      master: "Master",
      doctorat: "Doctorat",
      autre: "Autre",
    },
    budgets: {
      lt5000: "Moins de 5 000 $",
      "5000-10000": "5 000 - 10 000 $",
      "10000-20000": "10 000 - 20 000 $",
      gt20000: "Plus de 20 000 $",
    },
    intakes: {
      septembre_2026: "Septembre 2026",
      mars_2027: "Mars 2027",
      septembre_2027: "Septembre 2027",
      flexible: "Flexible",
    },
    domains: [
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
    ],
  },
  breadcrumbs: {
    home: "Accueil",
    aria: "Fil d'Ariane",
  },
  etudier: {
    crumb: "Étudier en Chine",
    title: "Étudier en Chine : le guide pour venir faire ses études",
    subtitle:
      "Venir étudier en Chine est possible en licence, master, doctorat ou année de langue. Le projet tient en cinq points : une formation adaptée, une université qui recrute des internationaux, un dossier d'admission complet, un financement (bourse ou frais payants), puis un visa étudiant.",
    disclaimer:
      "Chinois en Devenir accompagne les étudiants francophones sur ces étapes, sans garantir une admission, une bourse ou un visa.",
    conditionsTitle: "Conditions pour étudier en Chine",
    conditionsText:
      "Les universités chinoises examinent en général le parcours académique, la cohérence du projet, le passeport, et un niveau de langue. Une licence demande souvent un baccalauréat ou équivalent ; un master demande une licence ; un doctorat un master. L'âge, les places disponibles et le calendrier de la rentrée pèsent aussi.",
    conditions: [
      "Diplômes et relevés de notes, souvent traduits",
      "Passeport valide et photo d'identité",
      "Lettre de motivation et parfois lettres de recommandation",
      "Certificat de langue : HSK pour le chinois, IELTS ou TOEFL pour l'anglais",
      "Certificat médical selon les universités",
    ],
    topics: [
      {
        icon: "🎓",
        title: "Pourquoi étudier en Chine",
        text: "La Chine propose un large choix d'universités et de domaines : ingénierie, informatique, commerce, médecine, droit, langues, etc. Selon l'établissement, les cours sont en chinois ou en anglais. Pour un étudiant francophone, l'enjeu n'est pas seulement « partir en Chine » : c'est choisir un programme réaliste par rapport au diplôme déjà obtenu, au niveau de langue et au budget.",
      },
      {
        icon: "🗣️",
        title: "Faut-il parler chinois ?",
        text: "Pas forcément. Beaucoup de formations internationales se font en anglais. Les diplômes enseignés en chinois demandent en général un HSK, souvent autour du niveau 4 ou 5. Si le niveau n'est pas encore suffisant, une année de langue dans l'université vise à préparer l'entrée en licence ou en master. Le choix langue / anglais change la liste d'universités et parfois les bourses accessibles.",
        link: {
          href: "/ecoles-de-langue-chine",
          label: "Écoles de langue et année de chinois",
        },
      },
      {
        icon: "📅",
        title: "Calendrier : quand candidater",
        text: "La rentrée principale a lieu en septembre. Une rentrée de printemps existe aussi, souvent en février ou mars, avec moins de programmes. Pour un dossier payant, 4 à 6 mois d'avance sont un bon ordre de grandeur. Pour une bourse d'études en Chine, surtout la CSC, il faut souvent commencer plus tôt, car les dates limites tombent plusieurs mois avant la rentrée.",
        link: { href: "/bourses", label: "Voir les bourses d'études" },
      },
      {
        icon: "💰",
        title: "Bourses pour étudier en Chine",
        text: "Les pistes les plus courantes sont la bourse du gouvernement chinois (CSC), les bourses d'université, les bourses provinciales et municipales. Une bourse peut couvrir la scolarité, parfois le logement, l'assurance et une allocation. Elle n'est jamais automatique : le dossier, le quota et le programme décident.",
        link: { href: "/bourses", label: "Bourses d'études en Chine" },
      },
      {
        icon: "🛂",
        title: "Visa étudiant et installation",
        text: "Après l'admission, l'université transmet une lettre d'offre et un formulaire JW201 ou JW202. Ces pièces servent à demander un visa étudiant X1 (séjour long) ou X2 (séjour plus court). Une fois en Chine, un permis de séjour remplace souvent le visa X1. Logement, inscription et premières démarches se préparent avant le vol, pas à l'arrivée.",
        link: { href: "/visa-etudiant-chine", label: "Visa étudiant" },
      },
      {
        icon: "🤝",
        title: "Comment se faire accompagner",
        text: "Le processus va de l'orientation jusqu'à l'installation. Les formules couvrent l'année de chinois (800 €), l'admission universitaire (1 700 €) ou le parcours complet (2 000 €, 500 € d'économie). Les frais d'université, de traduction certifiée, de visa et de voyage restent à la charge de l'étudiant.",
        link: { href: "/processus", label: "Voir le processus d'admission" },
        extraLink: { href: "/tarifs", label: "Voir les formules" },
      },
    ],
    ctaTitle: "Prêt à étudier en Chine ?",
    ctaSubtitle:
      "Décrivez votre parcours et votre projet : nous vous indiquons les options d'études en Chine les plus réalistes pour votre profil.",
    cta: "Évaluer mon projet d'études en Chine",
    faqTitle: "Questions fréquentes pour étudier en Chine",
  },
  langue: {
    crumb: "Écoles de langue en Chine",
    updated: "Mis à jour : septembre 2026",
    title:
      "Écoles de langue en Chine : commencer par le chinois avant l'université",
    lead: "Une école de langue en Chine est un programme de chinois pour étudiants internationaux, le plus souvent hébergé par une université. Vous partez sans IELTS, sans TOEFL et souvent sans HSK, vous apprenez en immersion, puis vous visez une licence ou un master enseigné en chinois. Pour beaucoup de francophones, c'est le chemin le plus réaliste.",
    disclaimer:
      "Chinois en Devenir accompagne le choix d'une école de langue et le visa étudiant, sans garantir une inscription, un HSK ou une admission universitaire ensuite.",
    hWhat: "Qu'est-ce qu'une école de langue en Chine ?",
    pWhat:
      "En pratique, « école de langue » désigne surtout les cours de chinois d'une université chinoise (汉语进修), pas une école privée type Alliance. Vous êtes étudiant international, avec un visa étudiant, un campus, un dortoir possible, et une rentrée en septembre ou au printemps. L'objectif n'est pas seulement quelques phrases de survie : c'est poser le niveau HSK qui ouvre ensuite un diplôme.",
    hWhy: "Pourquoi venir d'abord étudier le chinois en Chine ?",
    pWhy:
      "Les licences et masters en anglais demandent en général un IELTS ou un TOEFL. Les diplômes en chinois demandent un HSK, souvent autour du niveau 4 ou 5. Sans l'un ni l'autre, candidater directement à l'université bloque. Une année de langue lève ce verrou : vous arrivez débutant, vous construisez le HSK sur place, puis vous postulez à un diplôme — souvent dans la même université.",
    whyItems: [
      {
        title: "Pas besoin d'IELTS ni de TOEFL pour partir",
        text: "L'année de chinois n'exige pas un certificat d'anglais. Vous partez avec un passeport, un diplôme de fin d'études secondaires ou plus, et un dossier d'inscription en langue.",
      },
      {
        title: "Le HSK se construit en immersion",
        text: "En classe, le chinois reste un cours. En Chine, c'est la langue du campus, du dortoir et de la ville. Le même volume d'heures avance plus vite.",
      },
      {
        title: "Le diplôme ensuite se fait en chinois",
        text: "Une fois le HSK obtenu, le choix de licences et de masters s'élargit nettement par rapport aux programmes en anglais, souvent plus rares et plus sélectifs sur la langue.",
      },
      {
        title: "Vous testez la Chine avant de vous engager sur 3 ou 4 ans",
        text: "Une année de langue permet de voir le rythme, la ville et le quotidien avant de signer pour une licence ou un master.",
      },
    ],
    hNoEn: "Étudier en Chine sans diplôme d'anglais",
    pNoEn:
      "Sans IELTS ni TOEFL, les formations enseignées en anglais restent en général fermées. Deux portes restent ouvertes : l'année de langue, puis un diplôme enseigné en chinois. Beaucoup d'étudiants francophones choisissent donc le chinois comme langue d'études, plutôt que de passer un an à préparer un test d'anglais en Europe pour viser un programme international plus étroit.",
    hCompare:
      "Année de langue, programme en anglais ou diplôme en chinois",
    compareLead:
      "Le bon point de départ dépend de vos certificats, pas seulement de votre envie.",
    compareCaption:
      "Comparaison des trois voies pour un étudiant francophone qui veut étudier en Chine",
    compareHeaders: [
      "Critère",
      "Diplôme en anglais",
      "Diplôme en chinois tout de suite",
      "Année de langue d'abord",
    ],
    compareRows: [
      [
        "IELTS ou TOEFL",
        "Souvent exigé",
        "Non",
        "Non",
      ],
      [
        "HSK à l'entrée",
        "Non",
        "Souvent HSK 4 ou 5",
        "Aucun, ou niveau débutant",
      ],
      [
        "Niveau de chinois au départ",
        "Faible ou nul possible",
        "Déjà suffisant",
        "Débutant accepté",
      ],
      [
        "Objectif de l'année 1",
        "Cours du diplôme",
        "Cours du diplôme",
        "Chinois + HSK, puis candidature",
      ],
      [
        "Visa",
        "X1 (séjour long)",
        "X1 (séjour long)",
        "X1 pour une année de langue",
      ],
      [
        "Pour qui",
        "Profil avec certificat d'anglais",
        "Profil déjà HSK 4 ou 5",
        "Francophone sans certificat de langue",
      ],
    ],
    compareNote:
      "Sans certificat d'anglais, l'année de langue est le chemin le plus ouvert. Un diplôme en anglais reste possible plus tard, si vous passez un IELTS ou un TOEFL. Un diplôme en chinois devient accessible une fois le HSK obtenu. L'admission n'est jamais automatique.",
    hHow: "Comment passer de l'école de langue à l'université",
    pHow:
      "Le parcours type dure souvent un an de chinois, parfois un semestre si le niveau avance vite, puis une candidature en licence ou master pour la rentrée suivante.",
    how: [
      {
        title: "Clarifier le projet",
        text: "Domaine visé, budget, ville, durée : l'année de langue n'empêche pas d'avoir déjà une idée de diplôme. Elle évite seulement de candidater trop tôt, sans le niveau de langue.",
      },
      {
        title: "Choisir l'établissement",
        text: "On privilégie un centre de langue universitaire si vous voulez enchaîner sur un diplôme, parfois dans le même campus. L'école privée convient davantage à un court séjour linguistique.",
      },
      {
        title: "S'inscrire et demander le visa",
        text: "Lettre d'admission, formulaire JW201 ou JW202, puis visa étudiant X1 pour une année. Les frais d'école, de visa et de voyage restent à votre charge.",
      },
      {
        title: "Atteindre le HSK visé",
        text: "HSK 4 ouvre beaucoup de licences enseignées en chinois. HSK 5 est fréquent en master, parfois avec un score minimum. Le niveau exact dépend de l'université et de la filière.",
      },
      {
        title: "Candidater au diplôme",
        text: "Pendant l'année de chinois, on prépare le dossier universitaire, une bourse éventuelle, puis un changement de programme ou de permis de séjour selon les règles de l'établissement.",
      },
    ],
    howAfterBefore: "Le détail des étapes, du premier échange jusqu'au départ, est décrit dans le",
    howAfterLink: "processus d'admission",
    howAfterAfter:
      ". L'année de langue et l'admission en licence ou master restent deux dossiers distincts.",
    hUni: "Université ou école privée : que choisir ?",
    pUni:
      "Si l'objectif est un diplôme ensuite, un programme de chinois universitaire est en général plus cohérent. Le statut d'étudiant, le visa X1, le campus et la possibilité de postuler en interne simplifient la suite. Une école privée peut convenir pour un court séjour, moins pour un projet licence ou master.",
    hHsk: "Quel HSK viser pendant l'année de langue ?",
    pHsk:
      "Le HSK (Hanyu Shuiping Kaoshi) est le test de chinois le plus souvent demandé par les universités. On ne vise pas « un HSK » en l'air : on vise le niveau exigé par le diplôme et l'établissement visés.",
    hskCaption: "Niveaux HSK les plus utiles pour enchaîner sur un diplôme en Chine",
    hskHeaders: ["Niveau", "À quoi il sert en général"],
    hskRows: [
      [
        "HSK 1–2",
        "Découverte. Insuffisant pour une licence enseignée en chinois.",
      ],
      [
        "HSK 3",
        "Seuil parfois accepté pour certains programmes préparatoires ou bourses de langue, rarement pour une licence complète.",
      ],
      [
        "HSK 4",
        "Niveau le plus souvent demandé pour une licence enseignée en chinois, parfois avec un score minimum.",
      ],
      [
        "HSK 5",
        "Niveau fréquent pour un master, parfois exigé avec un score (par exemple 180). Certaines filières demandent davantage.",
      ],
    ],
    hskNote:
      "Les exigences varient. Une université peut demander HSK 4, une autre HSK 5. Mieux vaut choisir l'établissement, puis le niveau, pas l'inverse.",
    hWho: "Cette voie est-elle faite pour vous ?",
    pWho:
      "L'année de langue n'est pas un détour pour tout le monde. Elle est surtout utile si la langue, et non le diplôme déjà obtenu, est ce qui bloque l'université.",
    whoYesTitle: "Oui, surtout si",
    whoYes: [
      "Vous n'avez pas d'IELTS, de TOEFL ni de HSK",
      "Vous voulez un diplôme en Chine, pas seulement un séjour linguistique",
      "Vous acceptez d'étudier ensuite en chinois plutôt qu'en anglais",
      "Vous préférez tester la Chine pendant un an avant une licence ou un master",
      "Vous êtes débutant ou presque débutant en chinois",
    ],
    whoNoTitle: "Moins adaptée si",
    whoNo: [
      "Vous avez déjà IELTS ou TOEFL et un projet de diplôme en anglais clair",
      "Vous avez déjà HSK 4 ou 5 et pouvez candidater directement",
      "Vous voulez seulement deux semaines de cours, sans visa étudiant",
      "Vous attendez une admission universitaire automatique après l'année de langue",
    ],
    hCost: "Combien coûte une année de chinois en Chine ?",
    pCostBefore:
      "Les frais de scolarité d'un programme de langue universitaire varient selon la ville et l'établissement, en plus du logement, de l'assurance, du visa et de la vie quotidienne. Une bourse de langue existe parfois, mais elle n'est jamais automatique. L'accompagnement",
    pCostLink: "Premier pas en Chine (800 €)",
    pCostAfter:
      "couvre l'orientation, le choix d'école, l'inscription et l'aide au visa ; les frais d'école et de voyage restent à votre charge.",
    pVisaBefore: "Le visa d'une année de langue est le même type que pour un diplôme :",
    pVisaLink: "visa étudiant X1, JW201 ou JW202",
    pVisaAfter:
      ". L'obtention n'est pas garantie. Nous préparons un dossier cohérent ; la décision appartient au consulat.",
    ctaTitle: "Vous partez sans IELTS, TOEFL ou HSK ?",
    ctaText:
      "Décrivez votre parcours : nous vous indiquons si une année de chinois en Chine est le bon premier pas, et dans quel type d'établissement.",
    cta: "Évaluer une année de chinois en Chine",
    faqTitle: "Questions fréquentes sur les écoles de langue en Chine",
  },
  bourses: {
    crumb: "Bourses d'études en Chine",
    title: "Bourses d'études en Chine",
    subtitle:
      "Financer ses études en Chine est possible via la bourse CSC, une bourse d'université, de province ou de ville. L'obtention dépend du dossier : rien n'est automatique.",
    introBefore: "Nous vous aidons à identifier les options réalistes pour",
    introLink: "étudier en Chine",
    introAfter:
      "et à préparer un dossier cohérent. Nous ne garantissons pas l'attribution d'une bourse.",
    warningTitle: "À savoir avant de postuler",
    warningText:
      "Bien que de nombreuses bourses soient accessibles, l'obtention d'un financement dépend de plusieurs critères importants : vos résultats académiques, votre âge, le programme choisi, la qualité de votre dossier, votre niveau de chinois et le nombre de candidats.",
    warningNote:
      "💡 Nous ne garantissons pas l'obtention d'une bourse, mais nous vous accompagnons pour identifier les options adaptées à votre profil et optimiser votre candidature.",
    amount: "Montant:",
    level: "Niveau:",
    duration: "Durée:",
    items: [
      {
        nom: "Bourse du gouvernement chinois — CSC",
        montant: "Partielle ou complète",
        niveau: "Licence, Master & Doctorat",
        duree: "Selon le programme",
        description:
          "Une bourse nationale pouvant couvrir les frais de scolarité, le logement, l'assurance médicale et une allocation mensuelle.",
        icon: "🇨🇳",
      },
      {
        nom: "Bourse universitaire",
        montant: "Partielle ou complète",
        niveau: "Licence, Master & Doctorat",
        duree: "1 à 4 ans",
        description:
          "Une aide proposée directement par les universités chinoises pour attirer les meilleurs étudiants internationaux.",
        icon: "🎓",
      },
      {
        nom: "Bourse provinciale",
        montant: "Selon la province",
        niveau: "Licence, Master & Doctorat",
        duree: "Selon le programme",
        description:
          "Une bourse financée par une province chinoise pour soutenir les étudiants internationaux inscrits dans ses établissements.",
        icon: "🏛️",
      },
      {
        nom: "Bourse municipale",
        montant: "Selon la ville",
        niveau: "Licence, Master & Doctorat",
        duree: "Selon le programme",
        description:
          "Une aide accordée par certaines villes chinoises pour financer une partie ou la totalité des études des étudiants internationaux.",
        icon: "🏙️",
      },
    ],
    howTitle: "📋 Comment candidater ?",
    how: [
      {
        title: "1️⃣ Préparation",
        text: "Rassemblez vos documents (relevé de notes, lettre de motivation, recommandations)",
      },
      {
        title: "2️⃣ Candidature",
        text: "Soumettez votre dossier auprès de l'université ou de l'organisme de bourse",
      },
      {
        title: "3️⃣ Résultats",
        text: "Attendez les résultats (généralement 2-3 mois) et préparez votre arrivée",
      },
    ],
    ctaTitle: "Besoin d'aide pour trouver la bourse adaptée à votre profil ?",
    ctaSubtitle:
      "Nous vous orientons vers les options les plus réalistes pour votre dossier.",
    cta: "Demander un conseil personnalisé",
    faqTitle: "Questions fréquentes sur les bourses pour étudier en Chine",
  },
  visa: {
    crumb: "Visa étudiant Chine",
    title: "Visa étudiant pour étudier en Chine",
    lead: "Pour venir faire ses études en Chine, l'admission ne suffit pas : il faut ensuite un visa étudiant. Les types les plus courants sont le X1 (séjour long) et le X2 (séjour plus court). Le dossier consulaire s'appuie sur la lettre d'admission et le formulaire JW201 ou JW202 délivré après acceptation par l'université. Chinois en Devenir vous guide sur ces démarches ; la décision appartient au consulat.",
    hX: "Visa X1 ou visa X2",
    pX: "Le visa X1 concerne en principe un séjour d'études de plus de 180 jours, typiquement une licence, un master, un doctorat ou une année de langue. Le visa X2 concerne un séjour plus court, souvent moins de 180 jours : semestre, formation brève, ou certains programmes d'été. Le type exact dépend de la durée indiquée par l'université, pas seulement du diplôme visé.",
    hJw: "JW201 et JW202 : le document clé",
    pJw: "Après l'admission, l'université (ou le CSC pour certaines bourses) émet un visa application form, JW201 ou JW202. Sans ce document, le consulat ne traite en général pas une demande d'études. Il accompagne la lettre d'admission officielle. Les délais de délivrance varient selon l'établissement et la période de l'année.",
    hDocs: "Pièces souvent demandées",
    docs: [
      "Passeport valide, avec des pages libres",
      "Formulaire de visa et photo aux normes consulaires",
      "Lettre d'admission de l'université chinoise",
      "Formulaire JW201 ou JW202",
      "Parfois un certificat médical, une preuve de ressources ou d'assurance, selon le consulat",
    ],
    pDocs:
      "Les exigences précises changent d'un pays à l'autre. Il faut suivre la liste du consulat ou du centre de visa de votre lieu de résidence, pas une liste générique trouvée en ligne.",
    hStay: "Après l'arrivée : permis de séjour",
    pStay:
      "Avec un visa X1, l'étudiant doit en général se présenter à l'université puis à la police locale pour un permis de séjour, dans le délai indiqué (souvent autour de 30 jours). Ce permis, et non le visa d'entrée, autorise le séjour d'études. Un X2 peut avoir des règles différentes. L'université internationale office guide généralement ces premières démarches.",
    hWhen: "Quand commencer",
    pWhenBefore: "Le visa vient en fin de parcours : d'abord",
    pWhenLink1: "le projet d'études en Chine",
    pWhenMid:
      ", puis le dossier, l'admission, ensuite seulement JW201/JW202 et le rendez-vous consulaire. Réserver un vol non flexible trop tôt est risqué. Notre",
    pWhenLink2: "processus d'admission",
    pWhenAfter: "situe le visa après les résultats, avant le départ.",
    ctaTitle: "Besoin d'aide pour le visa étudiant ?",
    ctaText:
      "Nous vérifions la cohérence du dossier après admission et vous indiquons les étapes jusqu'au dépôt consulaire. Aucune obtention de visa n'est garantie.",
    cta: "Voir l'accompagnement visa",
    faqTitle: "Questions fréquentes sur le visa étudiant chinois",
  },
  processus: {
    crumb: "Processus d'admission",
    title: "Venir étudier en Chine : le processus d'admission",
    subtitleBefore:
      "De la première évaluation jusqu'à l'installation : orientation, université, dossier, résultats,",
    visaLink: "visa étudiant",
    subtitleAfter: "et départ. Comptez en général 4 à 6 mois.",
    stepsHeading: "Les 8 étapes",
    stepLabel: "Étape {n}",
    duration: "⏱️ Durée estimée: {duration}",
    summaryTitle: "📊 Résumé",
    summarySteps: "Étapes clés",
    summaryMonths: "Mois de préparation",
    summarySupport: "Accompagnement",
    ctaTitle: "Prêt à lancer votre admission en Chine ?",
    ctaSubtitle:
      "Décrivez votre parcours : nous vous indiquons les étapes réalistes, du choix de formation jusqu'au visa étudiant.",
    cta: "Évaluer mon projet d'études en Chine",
    faqTitle: "Questions fréquentes sur le processus pour étudier en Chine",
    steps: [
      {
        titre: "Consultation initiale",
        description:
          "Évaluation de votre profil et de vos objectifs d'études en Chine.",
        details: [
          "Analyse du dossier académique",
          "Identification des universités adaptées",
          "Étude de faisabilité financière",
        ],
        duree: "1-2 semaines",
        icon: "🤝",
      },
      {
        titre: "Choix de l'université et du programme",
        description:
          "Sélection de l'établissement et du domaine d'études qui correspondent à vos aspirations.",
        details: [
          "Présentation de 5-10 universités",
          "Comparaison des programmes",
          "Analyse des perspectives de carrière",
        ],
        duree: "2-3 semaines",
        icon: "🏫",
      },
      {
        titre: "Préparation du dossier",
        description:
          "Rassemblement et préparation de tous les documents nécessaires pour la candidature.",
        details: [
          "Traduction des diplômes",
          "Rédaction des lettres de motivation",
          "Organisation des recommandations",
          "Préparation des tests d'admission",
        ],
        duree: "3-4 semaines",
        icon: "📄",
      },
      {
        titre: "Soumission de la candidature",
        description: "Envoi du dossier complet aux universités sélectionnées.",
        details: [
          "Vérification finale des documents",
          "Envoi aux universités",
          "Suivi administratif",
          "Communication avec les universités",
        ],
        duree: "1-2 semaines",
        icon: "📤",
      },
      {
        titre: "Attente des résultats",
        description:
          "Période d'attente pendant que les universités examinent votre candidature.",
        details: [
          "Suivi régulier",
          "Préparation à l'entretien si nécessaire",
          "Attente de la décision d'admission",
        ],
        duree: "4-8 semaines",
        icon: "⏳",
      },
      {
        titre: "Préparation du visa",
        description:
          "Organisation des formalités administratives pour obtenir votre visa étudiant.",
        details: [
          "Obtention de la lettre d'admission officielle",
          "Demande du formulaire JW202",
          "Constitution du dossier de visa",
        ],
        duree: "3-4 semaines",
        icon: "🛂",
      },
      {
        titre: "Préparation au départ",
        description:
          "Préparation matérielle et administrative pour votre arrivée en Chine.",
        details: [
          "Réservation du vol",
          "Arrangement de l'hébergement",
          "Obtention du visa",
          "Préparation des bagages",
        ],
        duree: "2-3 semaines",
        icon: "✈️",
      },
      {
        titre: "Arrivée et installation",
        description:
          "Bienvenue en Chine ! Nous vous accompagnons dans vos premiers pas.",
        details: [
          "Accueil et premières orientations sur place",
          "Aide aux démarches d'inscription et de résidence",
          "Repères pour le campus, le logement et la vie quotidienne",
        ],
        duree: "1-2 semaines",
        icon: "🎓",
      },
    ],
  },
  tarifs: {
    crumb: "Tarifs",
    title: "Trois formules, selon là où vous en êtes",
    subtitle:
      "Année de chinois, admission universitaire, ou les deux. Chaque formule est un accompagnement complet pour son objectif. La formule complète : 2 000 € (500 € d'économie).",
    planLabel: "Formule {n}",
    recommended: "recommandée",
    included: "Ce qui est inclus",
    idealIf: "Cette formule est idéale si",
    savingsTitle: "L'économie de la formule complète",
    savingsTextBefore: "La formule 3 est à",
    savingsHighlight: "2 000 € (500 € d'économie)",
    savingsTextAfter:
      ", avec jusqu'à 8 candidatures universitaires au lieu de 5, et un suivi jusqu'au départ.",
    keep1and2Title: "Les formules 1 et 2 restent le bon choix",
    keep1and2: [
      "La formule complète n'est pas obligatoire. Elle est la plus cohérente si votre projet va de l'année de chinois jusqu'à l'université.",
      "Si vous voulez seulement une année de langue, la Formule 1 couvre l'école, l'inscription et l'aide au visa étudiant.",
      "Si votre projet universitaire est déjà défini et que votre niveau de langue suffit, la Formule 2 vous accompagne jusqu'aux réponses des universités, sans payer pour une année de chinois dont vous n'avez pas besoin.",
    ],
    translationTitle: "Traduction et préparation des documents",
    translationP1:
      "Nous vous aidons à identifier les documents qui doivent être traduits et à préparer les versions nécessaires en anglais ou en chinois, selon les exigences des universités ou des autorités concernées.",
    translationP2:
      "Les traductions officielles, certifiées, les légalisations, authentifications et notarisation peuvent être facturées séparément. Ces frais vous seront communiqués avant toute commande.",
    extraTitle: "Frais qui restent à votre charge",
    extraIntro:
      "Nos tarifs couvrent uniquement les services d'accompagnement et de conseil. Certains frais supplémentaires peuvent rester à votre charge, notamment :",
    extraFees: [
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
    ],
    howTitle: "Comment fonctionne l'accompagnement ?",
    howPay:
      "Le paiement intervient après la première consultation téléphonique et après validation de la formule. Aucune démarche ne commence avant la confirmation de l'accompagnement.",
    processSteps: [
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
    ],
    infoTitle: "Informations importantes",
    infoIntro:
      "Nous vous aidons à construire un dossier sérieux, cohérent et conforme aux exigences des établissements. Cependant, nous ne pouvons pas garantir :",
    disclaimers: [
      "Une admission dans une université",
      "L'obtention d'une bourse",
      "L'obtention d'un visa",
      "L'acceptation dans une école de langue",
      "La disponibilité d'un logement",
    ],
    infoOutro:
      "Les décisions finales appartiennent aux universités, aux organismes de bourses, aux écoles de langue et aux autorités compétentes.",
    chooser: [
      {
        question: "Je veux d'abord apprendre le chinois",
        detail:
          "École de langue, visa étudiant et première installation en Chine.",
      },
      {
        question: "Mon projet universitaire est déjà clair",
        detail:
          "Recherche d'universités, dossier et suivi jusqu'aux réponses des établissements.",
      },
      {
        question: "Je prépare la langue, puis l'université",
        detail:
          "Les deux accompagnements, un seul interlocuteur, 500 € d'économie.",
      },
    ],
    ctaTitle: "Vous ne savez pas encore quelle formule choisir ?",
    ctaSubtitle:
      "La première consultation sert à confirmer l'offre adaptée à votre projet. Le paiement n'intervient qu'après cet échange.",
    cta: "Demander un échange téléphonique",
    faqTitle: "Questions fréquentes sur l'accompagnement",
    paymentNote:
      "Paiement possible en plusieurs fois selon les conditions convenues.",
  },
  formules: {
    1: {
      title: "Premier pas en Chine",
      subtitle: "Apprendre le chinois en Chine + aide au visa étudiant",
      audience: "Pour une première année de chinois",
      intro:
        "Vous souhaitez faire vos premiers pas en Chine, apprendre le chinois en immersion et communiquer plus vite au quotidien ? Cette formule vous accompagne pour choisir une école de langue et préparer votre départ, y compris le dossier de visa étudiant.",
      footnote:
        "L'aide au visa comprend des conseils, une vérification et une orientation. Les décisions finales et la délivrance du visa relèvent des autorités compétentes.",
      cta: "Commencer mon projet en Chine",
      includes: [
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
      ],
      idealIf: [
        "Vous souhaitez apprendre le chinois en Chine",
        "Vous voulez vous immerger dans la langue et la culture chinoise",
        "Vous êtes débutant ou souhaitez améliorer votre niveau",
        "Vous voulez développer vos chances de parler chinois au quotidien",
        "Vous souhaitez vivre une première expérience en Chine",
        "Vous préférez commencer par une année de langue avant l'université",
        "Vous avez besoin d'aide pour votre inscription et votre visa étudiant",
      ],
    },
    2: {
      title: "Admission universitaire",
      subtitle: "Accompagnement universitaire complet",
      audience: "Pour un projet d'études déjà défini",
      intro:
        "Vous avez déjà un projet universitaire et souhaitez intégrer une université en Chine ? Cette formule est consacrée exclusivement à votre admission, de la recherche des formations jusqu'à la réception des réponses des établissements.",
      footnote:
        "Cette formule concerne uniquement la partie universitaire. L'année de langue et l'accompagnement spécifique pour le visa ne sont pas inclus.",
      cta: "Être accompagné pour mon admission universitaire",
      includes: [
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
      ],
      idealIf: [
        "Votre projet universitaire est déjà défini",
        "Vous souhaitez intégrer directement une université en Chine",
        "Vous avez déjà un niveau de langue suffisant pour votre formation",
        "Vous voulez présenter un dossier solide et bien organisé",
        "Vous avez besoin d'aide pour choisir les bonnes universités",
        "Vous souhaitez gagner du temps et éviter les erreurs",
        "Vous voulez être accompagné jusqu'aux réponses des établissements",
      ],
    },
    3: {
      title: "Accompagnement complet",
      subtitle: "Année de chinois + année universitaire",
      audience: "Votre projet d'études en Chine de A à Z",
      badge: "Recommandée",
      savingsLabel: "500 € d'économie",
      savingsText:
        "En choisissant cette formule combinée, vous bénéficiez de l'accompagnement de la Formule 1 et de la Formule 2 pour 2 000 € (500 € d'économie), avec un suivi cohérent et un interlocuteur unique.",
      intro:
        "C'est notre accompagnement le plus complet. Vous commencez par une année de chinois en Chine, puis vous préparez votre admission universitaire. L'année de langue vous aide à vous adapter, à mieux communiquer au quotidien et à renforcer votre profil avant l'université.",
      footnote:
        "Visa, logement et arrivée : conseils, orientation et vérification des documents. Nous ne réalisons pas les démarches officielles à votre place. La délivrance du visa dépend exclusivement des autorités compétentes.",
      cta: "Préparer mon parcours complet en Chine",
      groups: [
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
      ],
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
    },
  },
  faqPage: {
    crumb: "FAQ",
    title: "FAQ : étudier en Chine",
    lead: "Réponses courtes pour venir faire ses études en Chine : admission, langue, bourses, visa étudiant et accompagnement. Chinois en Devenir prépare les dossiers ; les décisions restent celles des universités, des organismes de bourses et des consulats.",
    groups: {
      etudier: "Étudier en Chine",
      langue: "Écoles de langue et HSK",
      visa: "Visa étudiant",
      bourses: "Bourses d'études",
      processus: "Processus et accompagnement",
    },
    ctaTitle: "Votre question n'est pas listée ?",
    ctaText:
      "Décrivez votre parcours : nous vous indiquons les options réalistes pour étudier en Chine.",
    cta: "Évaluer mon projet",
  },
  contact: {
    crumb: "Contact",
    title: "Contact pour étudier en Chine",
    subtitle:
      "Une question sur l'admission, une bourse ou le visa étudiant ? Écrivez-nous : nous vous aidons à y voir clair sur votre projet d'études en Chine.",
    presence: "Présence en Chine",
    phone: "Téléphone",
    hours: "Lun-Ven : 9h-18h",
    email: "Email",
    socialTitle: "🌐 Suivez-nous sur les réseaux",
    ctaTitle: "Une question sur votre projet d'études ?",
    ctaSubtitle:
      "Décrivez votre parcours : notre équipe vous recontacte pour une première orientation.",
    cta: "Évaluer mon projet d'études en Chine",
    faqsTitle: "❓ Questions fréquentes",
    faqs: [
      {
        q: "Quel est le temps de réponse ?",
        a: "Nous répondons généralement sous 24 à 48 heures, selon le fuseau horaire et le volume de demandes.",
      },
      {
        q: "Avez-vous un support en direct ?",
        a: "Vous pouvez nous écrire par e-mail, WeChat ou WhatsApp pendant les heures de bureau (heure de Pékin).",
      },
      {
        q: "Pouvez-vous m'aider avec mon visa ?",
        a: "Oui : nous vous guidons pour constituer un dossier cohérent (X1 ou X2, JW201 ou JW202). L'octroi du visa reste une décision du consulat.",
      },
      {
        q: "Quels sont vos horaires ?",
        a: "Lun-Ven 9h-18h (heure de Pékin)",
      },
    ],
  },
  notFound: {
    code: "Erreur 404",
    title: "Page introuvable",
    subtitle:
      "Ce lien n'existe pas ou a été déplacé. Voici les pages les plus utiles pour un projet d'études en Chine.",
    links: [
      { href: "/", label: "Accueil" },
      { href: "/etudier-en-chine", label: "Guide étudier en Chine" },
      { href: "/ecoles-de-langue-chine", label: "Écoles de langue" },
      { href: "/bourses", label: "Bourses" },
      { href: "/visa-etudiant-chine", label: "Visa étudiant" },
      { href: "/contact", label: "Contact" },
    ],
  },
  legal: {
    updated: "Dernière mise à jour : août 2026",
    email: "Email :",
    website: "Site Web :",
    back: "← Retour à l'accueil",
  },
  privacy: {
    title: "Politique de Confidentialité",
    s1Title: "1. Introduction",
    s1: 'Chinois en Devenir ("nous", "nos", "notre") exploite le site web chinoisendevenir.com. Cette page vous informe de nos politiques concernant la collecte, l\'utilisation et la divulgation de données personnelles lorsque vous utilisez notre service et les choix que vous avez associés à ces données.',
    s2Title: "2. Collecte et Utilisation des Données",
    s2Types: "📋 Types de données collectées :",
    s2TypeItems: [
      "Nom complet",
      "Adresse email",
      "Numéro de téléphone",
      "Adresse postale",
      "Informations académiques",
      "Données de localisation (si autorisé)",
    ],
    s2Use: "🎯 Utilisation des données :",
    s2UseItems: [
      "Traitement de vos demandes de contact",
      "Envoi de newsletters et mises à jour",
      "Amélioration de nos services",
      "Conformité avec les obligations légales",
      "Prévention de la fraude",
    ],
    s3Title: "3. Sécurité des Données",
    s3: "Nous prenons la sécurité de vos données personnelles très au sérieux. Nous utilisons des technologies de chiffrement (SSL/TLS) pour protéger vos informations en transit.",
    s3Note:
      "Aucune méthode de transmission sur Internet n'est 100% sécurisée. Bien que nous utilisions des mesures de sécurité appropriées, nous ne pouvons pas garantir la sécurité absolue.",
    s3Important: "Important :",
    s4Title: "4. Partage des Données",
    s4: "Nous ne vendons, n'échangeons ni ne louons vos données personnelles à des tiers. Nous pouvons partager vos informations uniquement dans les cas suivants :",
    s4Items: [
      "Avec vos consentements explicites",
      "Avec nos partenaires universitaires en Chine",
      "Conformément aux exigences légales",
      "Pour protéger nos droits et votre sécurité",
    ],
    s5Title: "5. Cookies",
    s5: "Notre site utilise des cookies pour améliorer votre expérience utilisateur. Les cookies sont de petits fichiers stockés sur votre appareil qui nous aident à :",
    s5Items: [
      "Mémoriser vos préférences",
      "Analyser le trafic du site",
      "Personnaliser le contenu",
    ],
    s5Outro:
      "Vous pouvez désactiver les cookies dans les paramètres de votre navigateur.",
    s6Title: "6. Vos Droits",
    s6: "Vous avez le droit de :",
    s6Items: [
      "Accéder à vos données personnelles",
      "Corriger les données inexactes",
      "Demander la suppression de vos données",
      "Vous opposer au traitement de vos données",
      "Retirer votre consentement à tout moment",
    ],
    s6Contact: "Pour exercer ces droits, contactez-nous à :",
    s7Title: "7. Modifications de cette Politique",
    s7: "Nous pouvons mettre à jour cette politique de confidentialité de temps à autre. Les modifications seront publiées sur cette page avec une date de mise à jour. Votre utilisation continue du site après toute modification constitue votre acceptation de la politique mise à jour.",
    s8Title: "8. Contact",
    s8: "Si vous avez des questions concernant cette politique de confidentialité, veuillez nous contacter :",
    accept:
      "En utilisant notre site, vous acceptez cette politique de confidentialité",
  },
  terms: {
    title: "Conditions d'Utilisation",
    s1Title: "1. Acceptation des Conditions",
    s1: "En accédant et en utilisant le site web chinoisendevenir.com, vous acceptez d'être lié par ces conditions d'utilisation. Si vous n'acceptez pas ces conditions, veuillez ne pas utiliser ce site.",
    s2Title: "2. Utilisation du Site",
    s2: "Vous acceptez d'utiliser ce site uniquement à des fins légales et de ne pas l'utiliser d'une manière qui pourrait endommager, désactiver, surcharger ou nuire au site.",
    s2Ban: "Interdictions :",
    s2Items: [
      "Harcèlement ou intimidation d'autres utilisateurs",
      "Publication de contenu offensant ou illégal",
      "Tentative d'accès non autorisé au site",
      "Collecte de données sans autorisation",
      "Utilisation de robots ou d'outils d'automatisation",
    ],
    s3Title: "3. Propriété Intellectuelle",
    s3: "Tout le contenu du site, y compris les textes, graphiques, logos, images et logiciels, est la propriété de Chinois en Devenir ou de ses fournisseurs de contenu et est protégé par les lois internationales sur les droits d'auteur.",
    s3Ban: "Vous n'êtes pas autorisé à :",
    s3Items: [
      "Reproduire ou modifier le contenu sans autorisation",
      "Distribuer le contenu à des fins commerciales",
      "Utiliser le contenu pour créer des œuvres dérivées",
    ],
    s4Title: "4. Comptes Utilisateur",
    s4: "Si vous créez un compte sur notre site, vous êtes responsable de :",
    s4Items: [
      "Maintenir la confidentialité de vos identifiants",
      "Vous déconnecter après chaque session",
      "Notifier immédiatement tout accès non autorisé",
      "Fournir des informations exactes et à jour",
    ],
    s5Title: "5. Contenu Utilisateur",
    s5: "En soumettant du contenu à notre site, vous accordez à Chinois en Devenir une licence non-exclusive, perpétuelle et irrévocable pour utiliser, modifier, publier et distribuer ce contenu.",
    s5Note:
      "Vous garantissez que tout contenu que vous soumettez est original, ne viole pas les droits de tiers et n'est pas offensant.",
    s5Responsibility: "Responsabilité :",
    s6Title: "6. Exclusion de Garantie",
    s6: 'Ce site est fourni "tel quel" sans aucune garantie, explicite ou implicite. Nous ne garantissons pas :',
    s6Items: [
      "L'exactitude ou l'exhaustivité des informations",
      "Le fonctionnement ininterrompu du site",
      "L'absence d'erreurs ou de virus",
      "Le respect de vos attentes spécifiques",
    ],
    s7Title: "7. Limitation de Responsabilité",
    s7: "En aucun cas, Chinois en Devenir ne sera responsable des dommages indirects, accidentels, spéciaux, consécutifs ou punitifs découlant de votre utilisation ou de votre incapacité à utiliser ce site, même si nous avons été informés de la possibilité de tels dommages.",
    s8Title: "8. Liens Externes",
    s8: "Notre site peut contenir des liens vers des sites web externes. Nous ne sommes pas responsables du contenu, de l'exactitude ou des pratiques de ces sites externes.",
    s8b: "L'inclusion d'un lien n'implique pas notre approbation du site lié.",
    s9Title: "9. Suspension de Service",
    s9: "Nous nous réservons le droit de suspendre ou de résilier l'accès au site à tout moment, pour quelque raison que ce soit, y compris la violation de ces conditions. Nous pouvons également suspendre le service sans préavis en cas d'urgence ou de problèmes techniques.",
    s10Title: "10. Modifications des Conditions",
    s10: "Nous pouvons modifier ces conditions à tout moment. Les modifications entreront en vigueur immédiatement après leur publication. Votre utilisation continue du site après la publication des modifications constitue votre acceptation des nouvelles conditions.",
    s11Title: "11. Droit Applicable",
    s11: "Ces conditions d'utilisation sont régies par et construites conformément aux lois applicables. Tout différend découlant de ces conditions sera soumis à la juridiction exclusive des tribunaux compétents.",
    s12Title: "12. Contact",
    s12: "Pour toute question concernant ces conditions d'utilisation, veuillez nous contacter :",
    accept: "En utilisant notre site, vous acceptez ces conditions d'utilisation",
  },
  student: {
    space: "Espace étudiant",
    loading: "Chargement de votre espace...",
    loadingFile: "Chargement de votre dossier...",
    login: "Connexion",
    register: "Créer un compte",
    loginSubtitle: "Connectez-vous avec l'email utilisé dans le formulaire.",
    registerSubtitle:
      "Créez un compte avec votre email et un mot de passe. Utilisez la même adresse que sur le formulaire de projet.",
    password: "Mot de passe",
    confirmPassword: "Confirmer le mot de passe",
    signIn: "Se connecter",
    signingIn: "Connexion...",
    createAccount: "Créer mon compte",
    creating: "Création...",
    forgot: "Mot de passe oublié ?",
    logout: "Se déconnecter",
    hello: "Bonjour {name}",
    newPassword: "Nouveau mot de passe",
    newPasswordSubtitle: "Choisissez un mot de passe pour accéder à votre dossier.",
    saving: "Enregistrement...",
    save: "Enregistrer",
    callbackLoading: "Connexion en cours...",
    callbackFail: "Connexion impossible",
    errors: {
      credentials: "Email ou mot de passe incorrect.",
      generic: "Une erreur est survenue.",
      passwordLength: "Le mot de passe doit contenir au moins 8 caractères.",
      passwordMatch: "Les mots de passe ne correspondent pas.",
      exists: "Un compte existe déjà avec cet email. Connectez-vous.",
      createFail: "Impossible de créer le compte.",
      resetEmail: "Entrez votre email pour réinitialiser le mot de passe.",
      resetFail: "Impossible d'envoyer l'email.",
      resetSent:
        "Un email de réinitialisation vous a été envoyé si un compte existe.",
      session: "Session expirée. Veuillez vous reconnecter.",
      passwordUpdate: "Impossible de mettre à jour le mot de passe.",
    },
    noFile:
      "Aucun dossier ne correspond à cet email. Complétez le formulaire pour continuer.",
    unlockedSubtitle:
      "Consultez vos informations, mettez à jour votre profil et suivez votre dossier.",
    lockedSubtitle:
      "Votre dossier est enregistré. Choisissez une formule pour continuer.",
    chosenPendingSubtitle:
      "Votre choix est enregistré. L'équipe vous recontactera pour valider et convenir du paiement avant le début de l'accompagnement.",
    completeTitle: "Complétez votre projet",
    completeText:
      "Connecté avec {email}. Utilisez cet email : s'il a déjà été renseigné dans le formulaire, votre dossier sera associé automatiquement.",
    infoTitle: "Mes informations",
    infoSubtitle:
      "Connecté avec {email}. L'adresse email ne peut pas être modifiée ici.",
    saved: "Vos informations ont été enregistrées.",
    docSent: "Document envoyé avec succès.",
    saveInfo: "Enregistrer mes informations",
    progressTitle: "Avancement de votre dossier",
    progressSubtitle: "Étape {current} sur {total}",
    docsTitle: "Documents à fournir",
    schoolDocs: "Documents pour l'école",
    missingCount:
      "{count} document manquant. Déposez-les ci-dessous (PDF, JPG ou PNG — 10 Mo max).",
    missingCountPlural:
      "{count} documents manquants. Déposez-les ci-dessous (PDF, JPG ou PNG — 10 Mo max).",
    allReceived: "Tous les documents demandés ont été reçus.",
    missing: "Manquant",
    received: "Reçu",
    currentFile: "Fichier actuel :",
    sending: "Envoi...",
    replace: "Remplacer",
    send: "Envoyer",
    download: "Télécharger",
    visaPrep:
      "Préparez les pièces nécessaires à votre demande de visa étudiant.",
    adminDocsTitle: "Documents fournis par Chinois en Devenir",
    adminDocsSubtitle:
      "Fichiers transmis par Chinois en Devenir pour votre dossier.",
    noAdminDocs: "Aucun document n'a encore été envoyé par l'équipe.",
    formulasTitle: "Choisissez votre formule",
    formulasSubtitle:
      "Sélectionnez l'accompagnement adapté à votre projet avant de continuer. L'orientation, le suivi et les documents s'ouvrent après validation et paiement.",
    formulasChooseSubtitle:
      "Sélectionnez l'accompagnement adapté à votre projet avant de continuer. L'orientation, le suivi et les documents s'ouvrent après validation et paiement.",
    formulasChangeSubtitle:
      "Vous pouvez encore changer de formule jusqu'à la validation de votre accompagnement.",
    chooseFormula: "Choisir cette formule",
    chosenFormula: "Formule choisie",
    formuleSaved: "Votre formule a été enregistrée.",
    pay: "Payer {price}",
    paySoon:
      "Le paiement en ligne sera bientôt disponible. Pour l'instant, enregistrez votre choix : l'équipe vous recontactera.",
    yourSupport: "Votre accompagnement",
    formula: "Formule",
    formulaN: "Formule {n}",
    steps: {
      inscription: {
        label: "Inscription",
        description: "Votre profil a été enregistré.",
      },
      consultation: {
        label: "Consultation initiale",
        short: "Consultation",
        description: "Analyse de votre projet d'études.",
      },
      formation: {
        label: "Choix de la formation",
        description: "Université et programme adaptés.",
      },
      dossier: {
        label: "Préparation du dossier",
        description: "Documents et candidature en cours.",
      },
      envoi: {
        label: "Candidature envoyée",
        description: "Dossier transmis aux universités.",
      },
      admission: {
        label: "Admission",
        description: "Réponse des universités.",
      },
      visa: {
        label: "Visa et départ",
        description: "Formalités avant l'arrivée en Chine.",
      },
      termine: {
        label: "Arrivée",
        description: "Dossier finalisé.",
      },
    },
    docsCatalog: {
      passeport: {
        label: "Passeport",
        description: "Passeport en cours de validité (PDF, JPG ou PNG — 10 Mo max.).",
      },
      high_school_diploma: {
        label: "Diplôme de fin d'études secondaires",
        description:
          "Baccalauréat ou équivalent, avec traduction si besoin (PDF, JPG ou PNG — 10 Mo max.).",
      },
      bachelor_degree: {
        label: "Diplôme de licence (bachelor)",
        description:
          "Diplôme de licence / bachelor, avec relevés de notes si possible (PDF, JPG ou PNG — 10 Mo max.).",
      },
      master_degree: {
        label: "Diplôme de master",
        description:
          "Diplôme de master, avec relevés de notes si possible (PDF, JPG ou PNG — 10 Mo max.).",
      },
      hsk: {
        label: "Certificat HSK",
        description:
          "Pour un programme enseigné en chinois (PDF, JPG ou PNG — 10 Mo max.).",
      },
      ielts_or_toefl: {
        label: "IELTS ou TOEFL",
        description:
          "Pour un programme enseigné en anglais. Un des deux certificats suffit (PDF, JPG ou PNG — 10 Mo max.).",
      },
      csca: {
        label: "CSCA",
        description:
          "China Scholastic Competency Assessment, souvent demandé pour une licence en Chine (PDF, JPG ou PNG — 10 Mo max.).",
      },
      formulaire_medical: {
        label: "Formulaire médical",
        description:
          "Formulaire d'examen médical pour étrangers (Foreigner Physical Examination Form), daté et tamponné (PDF, JPG ou PNG — 10 Mo max.).",
      },
      casier_judiciaire: {
        label: "Extrait de casier judiciaire",
        description:
          "Certificat de non-condamnation (No Criminal Record), récent (PDF, JPG ou PNG — 10 Mo max.).",
      },
    },
    docsIntro: {
      bac: "Pour une licence en Chine, les universités demandent le plus souvent le passeport, le bac, le CSCA, un certificat de langue, le formulaire médical et un extrait de casier judiciaire.",
      licence:
        "Pour un master, les universités demandent le plus souvent le passeport, le diplôme de licence, un certificat de langue, le formulaire médical et un extrait de casier judiciaire.",
      master:
        "Pour un doctorat, les universités demandent le plus souvent le passeport, les diplômes de licence et de master, un certificat de langue, le formulaire médical et un extrait de casier judiciaire.",
      autre:
        "Les universités chinoises demandent le plus souvent le passeport, le diplôme du dernier niveau, un certificat de langue, le formulaire médical et un extrait de casier judiciaire.",
    },
    visaGuide: {
      title: "Documents pour le visa",
      intro:
        "Les étudiants qui souhaitent étudier en Chine doivent demander un visa. La démarche est simple. Commencez par identifier le type de visa adapté à votre séjour :",
      types: [
        { name: "Visa X1", description: "pour un séjour d'études de plus de 180 jours." },
        { name: "Visa X2", description: "pour un séjour d'études de moins de 180 jours." },
        { name: "Visa L", description: "pour un programme d'été ou d'hiver." },
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
    },
    matching: {
      untilDeparture: "Jusqu’au départ",
      application: "Candidature",
      bilan: "Bilan",
      orientation: "Votre orientation",
      notReady:
        "Votre compte rendu n’est pas encore prêt. Il apparaîtra ici dès qu’il aura été établi.",
      bestFit: "Meilleur alignement",
      toSpecify: "à préciser",
      strengths: "Points forts",
      prepare: "À préparer",
      fees: "Frais :",
      feesFallback: "à vérifier auprès de l’université",
      deadline: "Deadline :",
      language: "Langue :",
      listedScholarships: "Bourses listées :",
      scholarshipsFallback: "Bourses : à vérifier auprès de l’université",
      extraDocs: "Pièces propres à cet établissement :",
      seeDetail: "Voir le détail",
      unis: "Universités retenues",
      noUnis:
        "Aucune université assez compatible n’a été retenue avec les données actuelles. Précisez le domaine, la langue ou le budget pour affiner les recommandations.",
      bestOptions: "Quelles sont les meilleures options pour vous",
      nextSteps: "Prochaines étapes",
      you: "Vous :",
      we: "Nous :",
      docsToPrep: "Documents à préparer",
      provided: "Fourni",
      toProvide: "À fournir",
      possibleScholarships: "Bourses possibles",
      noGrant: "Aucune piste nommée dans le catalogue pour l’instant.",
      disclaimer: "Aucune admission, bourse ou visa n’est garantie.",
      status: {
        fait: "Fait",
        en_cours: "En cours",
        a_venir: "À venir",
        bloquant: "Bloquant",
      },
      languageYear: "Année de langue",
      chineseStudy: "Étude du chinois en Chine",
      chineseNotReady:
        "Les écoles de langue correspondant à votre ville, votre budget et votre rentrée apparaîtront ici dès qu’elles auront été sélectionnées.",
      whySchool: "Pourquoi cette école",
      toConfirm: "À confirmer",
      schoolFeesFallback: "à confirmer auprès de l’école",
      intake: "Rentrée :",
      city: "Ville :",
      budget: "Budget :",
      schools: "Écoles de langue retenues",
      noSchools:
        "Aucune école assez compatible n’a été retenue avec les données actuelles. Précisez la ville, le budget ou la date de rentrée.",
      chineseDisclaimer: "Aucune inscription, bourse ou visa n’est garantie.",
    },
  },
  faqs: {
    home: [
      {
        question: "Comment étudier en Chine quand on est francophone ?",
        answer:
          "Pour étudier en Chine, il faut choisir une formation (licence, master, doctorat ou année de langue), viser des universités adaptées à votre profil, constituer un dossier d'admission, puis demander un visa étudiant une fois l'admission obtenue. Un accompagnement francophone aide à relier ces étapes : orientation, candidature, bourse éventuelle et visa.",
      },
      {
        question: "Faut-il parler chinois pour venir faire ses études en Chine ?",
        answer:
          "Non, pas forcément. De nombreuses universités chinoises proposent des programmes en anglais. Les formations en chinois demandent en général un niveau HSK, souvent autour de HSK 4 ou 5 selon le diplôme. Une année de langue est aussi possible avant d'entrer en licence ou en master.",
      },
      {
        question: "Quand faut-il commencer les démarches pour étudier en Chine ?",
        answer:
          "Il est prudent de commencer 4 à 8 mois avant la rentrée. La rentrée principale a lieu en septembre ; une rentrée de printemps existe aussi, souvent en février ou mars. Les bourses, surtout la bourse CSC, ont des calendriers plus précoces que les candidatures payantes.",
      },
      {
        question: "Peut-on obtenir une bourse pour étudier en Chine ?",
        answer:
          "Oui, selon le profil. Les principales pistes sont la bourse du gouvernement chinois (CSC), les bourses universitaires, provinciales et municipales. L'obtention n'est jamais garantie : elle dépend du dossier, du niveau, du programme et du nombre de places.",
      },
      {
        question: "Quel visa faut-il pour étudier en Chine ?",
        answer:
          "Les étudiants internationaux utilisent en général un visa X1 (séjour de plus de 180 jours) ou X2 (séjour plus court). Après l'admission, l'université délivre une lettre d'admission et un formulaire JW201 ou JW202, nécessaires pour le consulat. Sur place, un permis de séjour remplace souvent le visa X1.",
      },
    ],
    etudier: [
      {
        question: "Quelles formations peut-on suivre en Chine ?",
        answer:
          "Les étudiants internationaux peuvent viser une licence, un master, un doctorat, une année préparatoire ou des cours de chinois. Selon l'université, les enseignements se font en chinois ou en anglais, dans des domaines comme l'ingénierie, le commerce, l'informatique, le droit ou les langues.",
      },
      {
        question: "Quels documents sont demandés pour une admission en Chine ?",
        answer:
          "Le dossier comprend en général diplômes, relevés de notes, passeport, photo, lettre de motivation, CV, et parfois lettres de recommandation, certificat de langue (HSK, IELTS ou TOEFL) et certificat médical. Les documents non rédigés en chinois ou en anglais doivent souvent être traduits.",
      },
      {
        question: "Combien coûtent les études en Chine ?",
        answer:
          "Les frais varient selon l'université, la ville et le programme. Hors bourse, il faut prévoir scolarité, logement, assurance, visa et vie quotidienne. Une bourse peut couvrir une partie ou la totalité de ces frais. Un bilan de projet permet d'estimer un budget réaliste avant de candidater.",
      },
      {
        question: "Chinois en Devenir garantit-il une admission ?",
        answer:
          "Non. Nous préparons un dossier sérieux et conforme, puis nous suivons la candidature. La décision d'admission, de bourse ou de visa appartient à l'université, à l'organisme financeur et aux autorités consulaires.",
      },
    ],
    langue: [
      {
        question: "Peut-on étudier en Chine sans IELTS ni TOEFL ?",
        answer:
          "Oui. Sans IELTS ni TOEFL, les programmes enseignés en anglais sont en général fermés. Deux voies restent ouvertes : une année de chinois dans une université, puis un diplôme enseigné en chinois une fois le HSK obtenu. C'est souvent le chemin le plus réaliste pour un étudiant francophone.",
      },
      {
        question: "Faut-il déjà parler chinois pour une école de langue en Chine ?",
        answer:
          "Non. Les programmes de chinois pour internationaux acceptent les débutants. L'année de langue sert précisément à construire le niveau, en général jusqu'à un HSK 4 ou 5, avant une licence ou un master.",
      },
      {
        question: "Une année de langue mène-t-elle automatiquement à l'université ?",
        answer:
          "Non. L'inscription en langue et l'admission en licence ou master sont deux dossiers distincts. L'année de chinois améliore le profil et le HSK, mais l'université décide ensuite selon les places, les notes et les conditions du diplôme visé.",
      },
      {
        question: "Quelle est la différence entre une école de langue et une université en Chine ?",
        answer:
          "Pour les étudiants internationaux, « école de langue » désigne le plus souvent le programme de chinois d'une université (汉语进修), pas une école privée. Vous êtes étudiant, avec un visa X1, un campus, et la possibilité de candidater ensuite à un diplôme, parfois dans le même établissement.",
      },
      {
        question: "Quel visa faut-il pour une année de chinois en Chine ?",
        answer:
          "Une année de langue demande en général un visa étudiant X1, comme une licence. Après l'inscription, l'établissement délivre une lettre d'admission et un JW201 ou JW202, puis le consulat traite la demande. L'obtention du visa n'est jamais garantie.",
      },
      {
        question: "Combien de temps dure une année de langue en Chine ?",
        answer:
          "Le format le plus courant est un an, parfois un semestre. La rentrée principale est en septembre ; une rentrée de printemps existe souvent en février ou mars. Le temps nécessaire pour viser HSK 4 ou 5 dépend du niveau de départ et du rythme de travail.",
      },
    ],
    visa: [
      {
        question: "Quelle est la différence entre le visa X1 et le visa X2 ?",
        answer:
          "Le visa X1 concerne en principe un séjour d'études de plus de 180 jours. Le visa X2 concerne un séjour plus court, souvent moins de 180 jours. Après l'arrivée avec un X1, il faut généralement convertir le visa en permis de séjour auprès de la police locale, dans les délais indiqués par l'université.",
      },
      {
        question: "Qu'est-ce que le formulaire JW201 ou JW202 ?",
        answer:
          "Le JW201 ou JW202 est le visa application form délivré après admission, souvent via l'université ou le CSC. Il fait partie du dossier consulaire, avec la lettre d'admission, le passeport et les autres pièces demandées par le consulat de Chine de votre pays de résidence.",
      },
      {
        question: "Combien de temps faut-il pour obtenir un visa étudiant chinois ?",
        answer:
          "Le délai dépend du consulat, de la période et de la complétude du dossier. Il faut d'abord l'admission et le JW201/JW202, puis déposer la demande. Prévoyez plusieurs semaines après l'admission, sans réserver un vol définitif trop tôt.",
      },
      {
        question: "Pouvez-vous garantir l'obtention du visa ?",
        answer:
          "Non. Nous vous guidons pour constituer un dossier cohérent. La décision appartient au consulat ou à l'ambassade de Chine. Un visa refusé, un document manquant ou un délai trop court restent possibles.",
      },
    ],
    bourses: [
      {
        question: "Qu'est-ce que la bourse CSC pour étudier en Chine ?",
        answer:
          "La bourse du China Scholarship Council (CSC) est une bourse nationale destinée aux étudiants internationaux. Selon le type, elle peut couvrir les frais de scolarité, le logement, l'assurance et une allocation mensuelle. Les critères, quotas et calendriers varient selon le programme et l'université.",
      },
      {
        question: "Faut-il un excellent dossier pour une bourse en Chine ?",
        answer:
          "Un dossier solide aide nettement : résultats, cohérence du projet, lettres, niveau de langue. Certaines bourses universitaires ou municipales sont plus accessibles que la CSC, mais aucune n'est automatique. Mieux vaut viser des options réalistes plutôt qu'une seule bourse très compétitive.",
      },
      {
        question: "Peut-on étudier en Chine sans bourse ?",
        answer:
          "Oui. Beaucoup d'étudiants internationaux paient les frais de scolarité. Dans ce cas, le calendrier est souvent plus souple que pour les bourses. Il reste essentiel d'anticiper le budget, le logement et le visa.",
      },
    ],
    processus: [
      {
        question: "Combien de temps dure un accompagnement pour étudier en Chine ?",
        answer:
          "Comptez en général 4 à 6 mois entre le premier échange et le départ, parfois davantage pour une bourse CSC ou un doctorat. Le délai dépend de votre dossier, des rentrées visées et des réponses des universités.",
      },
      {
        question: "Faut-il déjà savoir quelle université choisir ?",
        answer:
          "Non. L'orientation fait partie du processus : analyse du profil, du domaine, du budget et du niveau de langue, puis sélection d'établissements et de programmes réalistes.",
      },
      {
        question: "Que se passe-t-il après l'admission ?",
        answer:
          "Après la lettre d'admission, viennent le JW201/JW202, la demande de visa étudiant, la préparation du départ (vol, logement, documents) puis l'installation : inscription, résidence et premières démarches sur place.",
      },
    ],
    tarifs: [
      {
        question: "Quelle formule choisir pour étudier en Chine ?",
        answer:
          "La formule 1 (800 €) convient si vous voulez d'abord une année de chinois en Chine, avec l'inscription en école de langue et l'aide au visa étudiant. La formule 2 (1 700 €) convient si votre projet universitaire est déjà défini et que votre niveau de langue suffit : jusqu'à 5 candidatures, jusqu'aux réponses. La formule 3 (2 000 €, 500 € d'économie) combine les deux, avec jusqu'à 8 candidatures et un suivi jusqu'au départ.",
      },
      {
        question: "Que comprennent les formules pour étudier en Chine ?",
        answer:
          "La formule 1 (800 €) accompagne l'inscription en école de langue et la préparation du visa étudiant. La formule 2 (1 700 €) couvre uniquement l'admission universitaire, jusqu'à 5 candidatures. La formule 3 (2 000 €) combine année de chinois et admission universitaire, jusqu'à 8 candidatures, puis le suivi jusqu'au départ. Les frais universitaires, traductions certifiées, visa et vol restent à votre charge.",
      },
      {
        question: "Pourquoi la formule complète coûte-t-elle 2 000 € ?",
        answer:
          "La formule 3 est à 2 000 € (500 € d'économie). Elle combine l'année de chinois et l'admission universitaire, avec un interlocuteur unique et jusqu'à 8 candidatures universitaires au lieu de 5.",
      },
      {
        question: "Quand faut-il payer ?",
        answer:
          "Le paiement intervient après la première consultation téléphonique et après validation de la formule. Aucune démarche d'accompagnement ne commence avant. Un paiement en plusieurs fois est possible selon les conditions convenues.",
      },
    ],
  },
};

const en = {
  nav: {
    home: "Home",
    study: "Study in China",
    language: "Language schools",
    scholarships: "Scholarships",
    visa: "Visa",
    process: "Process",
    faq: "FAQ",
    pricing: "Pricing",
    contact: "Contact",
    student: "Student space",
    mySpace: "My space",
    signup: "Get started",
    menu: "Menu",
  },
  footer: {
    description:
      "Guidance for studying in China: academic orientation, university admission, scholarships, and student visa support.",
    rights: "All rights reserved",
    colStudy: "Study in China",
    guide: "Guide: studying in China",
    languageSchools: "Language schools",
    studentVisa: "Student visa",
    scholarships: "Scholarships",
    admissionProcess: "Admission process",
    faq: "FAQ",
    colSupport: "Support",
    pricing: "Pricing",
    contact: "Contact",
    evaluate: "Assess my project",
    studentSpace: "Student space",
    colContact: "Contact",
    contactLead:
      "A question about a Chinese-language year, a university, or a visa? Write to us.",
    contactPage: "Contact page",
    colInfo: "Information",
    privacy: "Privacy policy",
    terms: "Terms of use",
  },
  hero: {
    badge: "🎓 Your China study project starts here",
    title: "Study in China: admission, scholarship, and visa — guided from A to Z",
    subtitle:
      "Want to study in China? We guide you at every step: choosing a program, a Chinese university, your admission file, scholarships, and the student visa.",
    ctaPrimary: "Assess my project",
    ctaSecondary: "See our pricing",
  },
  stats: {
    students: "Students supported",
    universities: "Partner universities",
    dossiers: "Applications supported",
    years: "Years of experience",
  },
  services: {
    title: "Complete support for a successful project",
    subtitle:
      "From the first consultation to settling in China, our team guides you with advice tailored to your profile and goals.",
    items: [
      {
        title: "Academic orientation",
        description:
          "We review your profile, goals, and budget to help you choose the program that fits you best.",
      },
      {
        title: "University selection",
        description:
          "We help you identify Chinese universities that match your level, field of study, and ambitions.",
      },
      {
        title: "Application and admission",
        description:
          "We support you in preparing your file, translating documents, and submitting your application.",
      },
      {
        title: "Scholarship search",
        description:
          "We explain scholarship options and help you prepare a strong application.",
      },
      {
        title: "Visa support",
        description:
          "After admission, we guide you through preparing your student visa file.",
      },
      {
        title: "Departure preparation",
        description:
          "We help you prepare your arrival: housing, registration, welcome, and first steps in China.",
      },
    ],
  },
  programs: {
    title: "Find the program that fits you",
    subtitle:
      "Whether you want to learn Chinese, earn a degree, or continue graduate studies, we help you build a realistic plan.",
    list: [
      "Bachelor's degree",
      "Master's",
      "PhD / Doctorate",
      "Chinese language courses",
      "Preparatory year",
      "Professional programs",
    ],
    hesitate:
      "Still unsure? The {link} help you choose a language school or a university before you apply.",
    formulasLink: "support plans",
    languageCta: "No IELTS or TOEFL? See language schools in China",
  },
  home: {
    whyTitle: "Why study in China",
    whySubtitle:
      "Studying in China is more than “going abroad”. It means targeting a university, a language of instruction, a budget, and a visa — then connecting those steps in the right order.",
    why: [
      {
        title: "A vast university system",
        text: "China welcomes international students for bachelor's, master's, PhD, and language programs, taught in Chinese or English.",
      },
      {
        title: "Scholarships are possible, never automatic",
        text: "CSC, university, provincial, or city scholarships: a strong file can lower the cost of studies, with no funding guarantee.",
      },
      {
        title: "A project to prepare in advance",
        text: "Admission, documents, language, X1 or X2 visa: studying in China takes several months of preparation.",
      },
    ],
    howTitle: "How to come and study in China",
    howSubtitle:
      "A typical path lasts 4 to 6 months: orientation, admission, a possible scholarship, visa, then departure.",
    howLink: "Read the full guide",
    how: [
      {
        title: "Clarify the project",
        text: "Field, level, language of instruction, and budget: we start from your profile, not a random university.",
        href: "/processus",
      },
      {
        title: "Apply",
        text: "File, translations, letters, and follow-up with the Chinese universities you target.",
        href: "/etudier-en-chine",
      },
      {
        title: "Fund it if possible",
        text: "We identify realistic scholarships, including CSC, without promising an outcome.",
        href: "/bourses",
      },
      {
        title: "Get the student visa",
        text: "After admission: JW201/JW202, X1 or X2 visa, then settling in China.",
        href: "/visa-etudiant-chine",
      },
    ],
    faqTitle: "Frequently asked questions about studying in China",
    allFaqs: "See all questions about studying in China",
  },
  form: {
    title: "Let's talk about your study project",
    subtitle:
      "Fill in the form below. Our team will review your profile and contact you quickly with options that fit.",
    firstname: "First name",
    lastname: "Last name",
    age: "Age",
    email: "Email address",
    phone: "Phone number",
    country: "Country of residence",
    level: "Highest diploma obtained",
    field: "Intended field of study",
    budget: "Estimated annual budget",
    intake: "Preferred intake period",
    message: "Tell us about your project or ask your question",
    messagePlaceholder: "Tell us about your study project...",
    otherFieldPlaceholder: "Please specify your field",
    select: "-- Select --",
    submit: "Get a first orientation",
    submitting: "Reviewing your request...",
    success:
      "Thank you for your request! Our team will review your profile and contact you shortly.",
    createSpace: "Create my student space",
    error: "The request could not be sent. Please try again in a moment.",
    errorRateLimit:
      "Too many requests right now. Please try again in a few minutes.",
    duplicate:
      "This email address is already registered. Our team will contact you shortly.",
    required: "Please fill in this field",
    errorEmail: "Please enter a valid email address",
    errorPhone: "Please enter a valid phone number",
    errorAge: "Please enter a valid age",
    diplomas: {
      bac: "High school diploma",
      licence: "Bachelor's",
      master: "Master's",
      doctorat: "Doctorate",
      autre: "Other",
    },
    budgets: {
      lt5000: "Under $5,000",
      "5000-10000": "$5,000 - $10,000",
      "10000-20000": "$10,000 - $20,000",
      gt20000: "Over $20,000",
    },
    intakes: {
      septembre_2026: "September 2026",
      mars_2027: "March 2027",
      septembre_2027: "September 2027",
      flexible: "Flexible",
    },
    domains: [
      "Computer science / AI / Data science",
      "Engineering / Civil engineering",
      "Electrical engineering / Energy",
      "Mechanical engineering",
      "Aerospace",
      "Architecture",
      "Business",
      "International business",
      "Management",
      "Digital marketing",
      "Banking / Finance / Insurance",
      "Law",
      "Political science",
      "Pharmaceutical sciences",
      "Agriculture",
      "Hydrology",
      "Languages",
      "Other",
    ],
  },
  breadcrumbs: {
    home: "Home",
    aria: "Breadcrumb",
  },
  etudier: {
    crumb: "Study in China",
    title: "Study in China: the guide to coming for your studies",
    subtitle:
      "You can study in China for a bachelor's, master's, PhD, or language year. The project comes down to five points: a suitable program, a university that recruits internationals, a complete admission file, funding (scholarship or tuition), then a student visa.",
    disclaimer:
      "Chinois en Devenir supports French-speaking students through these steps, without guaranteeing admission, a scholarship, or a visa.",
    conditionsTitle: "Requirements to study in China",
    conditionsText:
      "Chinese universities typically review your academic background, the coherence of your project, your passport, and a language level. A bachelor's often requires a high-school diploma or equivalent; a master's requires a bachelor's; a PhD requires a master's. Age, available places, and the intake calendar also matter.",
    conditions: [
      "Diplomas and transcripts, often translated",
      "Valid passport and ID photo",
      "Statement of purpose and sometimes recommendation letters",
      "Language certificate: HSK for Chinese, IELTS or TOEFL for English",
      "Medical certificate, depending on the university",
    ],
    topics: [
      {
        icon: "🎓",
        title: "Why study in China",
        text: "China offers a wide range of universities and fields: engineering, computer science, business, medicine, law, languages, and more. Depending on the school, courses are in Chinese or English. For a French-speaking student, the point is not just “going to China”: it is choosing a realistic program given your diploma, language level, and budget.",
      },
      {
        icon: "🗣️",
        title: "Do you need to speak Chinese?",
        text: "Not necessarily. Many international programs are taught in English. Degrees taught in Chinese usually require HSK, often around level 4 or 5. If your level is not high enough yet, a language year at the university prepares entry into a bachelor's or master's. The Chinese / English choice changes the list of universities and sometimes the scholarships available.",
        link: {
          href: "/ecoles-de-langue-chine",
          label: "Language schools and Chinese-language year",
        },
      },
      {
        icon: "📅",
        title: "Timeline: when to apply",
        text: "The main intake is in September. A spring intake also exists, often in February or March, with fewer programs. For a self-funded file, 4 to 6 months ahead is a good rule of thumb. For a scholarship in China, especially CSC, you often need to start earlier, because deadlines fall several months before the intake.",
        link: { href: "/bourses", label: "See scholarships" },
      },
      {
        icon: "💰",
        title: "Scholarships to study in China",
        text: "The most common tracks are the Chinese government scholarship (CSC), university scholarships, and provincial or municipal awards. A scholarship may cover tuition, sometimes housing, insurance, and a stipend. It is never automatic: the file, the quota, and the program decide.",
        link: { href: "/bourses", label: "Scholarships in China" },
      },
      {
        icon: "🛂",
        title: "Student visa and settling in",
        text: "After admission, the university issues an offer letter and a JW201 or JW202 form. These documents are used to apply for an X1 student visa (long stay) or X2 (shorter stay). Once in China, a residence permit often replaces the X1 visa. Housing, registration, and first steps should be prepared before the flight, not on arrival.",
        link: { href: "/visa-etudiant-chine", label: "Student visa" },
      },
      {
        icon: "🤝",
        title: "How to get support",
        text: "The process runs from orientation to settling in. Plans cover a Chinese-language year (€800), university admission (€1,700), or the full path (€2,000, €500 savings). University fees, certified translation, visa, and travel remain the student's responsibility.",
        link: { href: "/processus", label: "See the admission process" },
        extraLink: { href: "/tarifs", label: "See the plans" },
      },
    ],
    ctaTitle: "Ready to study in China?",
    ctaSubtitle:
      "Describe your background and your project: we will outline the most realistic study-in-China options for your profile.",
    cta: "Assess my China study project",
    faqTitle: "Frequently asked questions about studying in China",
  },
  langue: {
    crumb: "Language schools in China",
    updated: "Last updated: September 2026",
    title:
      "Language schools in China: start with Chinese before university",
    lead: "A language school in China is a Chinese program for international students, most often hosted by a university. You leave without IELTS, TOEFL, and often without HSK, you learn through immersion, then you aim for a Chinese-taught bachelor's or master's. For many French speakers, that is the most realistic path.",
    disclaimer:
      "Chinois en Devenir helps you choose a language program and prepare the student visa, without guaranteeing enrollment, an HSK result, or later university admission.",
    hWhat: "What is a language school in China?",
    pWhat:
      "In practice, “language school” usually means a Chinese university's Chinese-language program (汉语进修), not a private Alliance-style school. You are an international student, with a student visa, a campus, possible dorm housing, and an intake in September or in spring. The goal is not a few survival phrases: it is reaching the HSK level that then opens a degree.",
    hWhy: "Why study Chinese in China first?",
    pWhy:
      "English-taught bachelor's and master's degrees usually require IELTS or TOEFL. Chinese-taught degrees require HSK, often around level 4 or 5. Without either, applying straight to university stalls. A language year removes that block: you arrive as a beginner, you build HSK on site, then you apply for a degree — often at the same university.",
    whyItems: [
      {
        title: "No IELTS or TOEFL needed to leave",
        text: "A Chinese-language year does not require an English certificate. You leave with a passport, a high-school diploma or higher, and a language-program file.",
      },
      {
        title: "HSK is built through immersion",
        text: "At home, Chinese stays a class. In China, it is the language of campus, the dorm, and the city. The same hours move faster.",
      },
      {
        title: "The degree afterwards is in Chinese",
        text: "Once you have HSK, the range of bachelor's and master's programs widens a lot compared with English-taught options, which are fewer and more selective on language.",
      },
      {
        title: "You test China before a 3- or 4-year commitment",
        text: "A language year lets you see the pace, the city, and daily life before you sign up for a bachelor's or master's.",
      },
    ],
    hNoEn: "Studying in China without an English diploma",
    pNoEn:
      "Without IELTS or TOEFL, English-taught programs generally stay closed. Two doors remain open: a language year, then a Chinese-taught degree. Many French-speaking students therefore choose Chinese as their language of study, instead of spending a year in Europe preparing an English test for a narrower set of international programs.",
    hCompare: "Language year, English-taught degree, or Chinese-taught degree",
    compareLead:
      "The right starting point depends on your certificates, not only on what you want.",
    compareCaption:
      "Comparison of three paths for a French-speaking student who wants to study in China",
    compareHeaders: [
      "Criterion",
      "English-taught degree",
      "Chinese-taught degree now",
      "Language year first",
    ],
    compareRows: [
      ["IELTS or TOEFL", "Often required", "No", "No"],
      [
        "HSK on entry",
        "No",
        "Often HSK 4 or 5",
        "None, or beginner level",
      ],
      [
        "Chinese level at the start",
        "Low or none possible",
        "Already enough",
        "Beginners accepted",
      ],
      [
        "Goal of year 1",
        "Degree courses",
        "Degree courses",
        "Chinese + HSK, then apply",
      ],
      [
        "Visa",
        "X1 (long stay)",
        "X1 (long stay)",
        "X1 for a language year",
      ],
      [
        "Best for",
        "Profile with an English certificate",
        "Profile already at HSK 4 or 5",
        "French speaker with no language certificate",
      ],
    ],
    compareNote:
      "Without an English certificate, a language year is the most open path. An English-taught degree remains possible later if you take IELTS or TOEFL. A Chinese-taught degree becomes accessible once HSK is obtained. Admission is never automatic.",
    hHow: "How to go from a language school to university",
    pHow:
      "The typical path is often one year of Chinese, sometimes a semester if the level moves fast, then a bachelor's or master's application for the next intake.",
    how: [
      {
        title: "Clarify the project",
        text: "Target field, budget, city, duration: a language year does not stop you from already having a degree in mind. It only avoids applying too early, without the language level.",
      },
      {
        title: "Choose the school",
        text: "A university language center is usually better if you want to continue to a degree, sometimes on the same campus. A private school fits a short language stay more than a bachelor's or master's project.",
      },
      {
        title: "Register and apply for the visa",
        text: "Admission letter, JW201 or JW202 form, then an X1 student visa for a year. School, visa, and travel costs remain yours.",
      },
      {
        title: "Reach the target HSK",
        text: "HSK 4 opens many Chinese-taught bachelor's programs. HSK 5 is common for a master's, sometimes with a minimum score. The exact level depends on the university and the major.",
      },
      {
        title: "Apply for the degree",
        text: "During the language year, you prepare the university file, a possible scholarship, then a program or residence-permit change according to the school's rules.",
      },
    ],
    howAfterBefore:
      "The full sequence, from the first call through departure, is described in the",
    howAfterLink: "admission process",
    howAfterAfter:
      ". The language year and bachelor's or master's admission remain two separate files.",
    hUni: "University or private school: which should you choose?",
    pUni:
      "If the goal is a degree afterwards, a university Chinese program is generally more coherent. Student status, an X1 visa, a campus, and the option to apply internally simplify the next step. A private school can fit a short stay, less so a bachelor's or master's project.",
    hHsk: "Which HSK should you aim for during the language year?",
    pHsk:
      "HSK (Hanyu Shuiping Kaoshi) is the Chinese test universities ask for most often. You do not aim for “an HSK” in the abstract: you aim for the level required by the degree and the university you want.",
    hskCaption:
      "HSK levels most useful for moving on to a degree in China",
    hskHeaders: ["Level", "What it is generally used for"],
    hskRows: [
      [
        "HSK 1–2",
        "Discovery. Not enough for a Chinese-taught bachelor's.",
      ],
      [
        "HSK 3",
        "A threshold sometimes accepted for some preparatory programs or language scholarships, rarely for a full bachelor's.",
      ],
      [
        "HSK 4",
        "The level most often required for a Chinese-taught bachelor's, sometimes with a minimum score.",
      ],
      [
        "HSK 5",
        "A common level for a master's, sometimes required with a score (for example 180). Some majors ask for more.",
      ],
    ],
    hskNote:
      "Requirements vary. One university may ask for HSK 4, another for HSK 5. Choose the school first, then the level — not the other way around.",
    hWho: "Is this path for you?",
    pWho:
      "A language year is not a detour for everyone. It is most useful when language, not the diploma you already have, is what blocks university.",
    whoYesTitle: "Yes, especially if",
    whoYes: [
      "You have no IELTS, TOEFL, or HSK",
      "You want a degree in China, not only a language stay",
      "You are willing to study in Chinese afterwards rather than in English",
      "You prefer to test China for a year before a bachelor's or master's",
      "You are a beginner or near-beginner in Chinese",
    ],
    whoNoTitle: "Less suitable if",
    whoNo: [
      "You already have IELTS or TOEFL and a clear English-taught degree plan",
      "You already have HSK 4 or 5 and can apply directly",
      "You only want two weeks of classes, with no student visa",
      "You expect automatic university admission after the language year",
    ],
    hCost: "How much does a Chinese-language year in China cost?",
    pCostBefore:
      "Tuition for a university language program varies by city and school, on top of housing, insurance, visa, and daily life. A language scholarship sometimes exists, but it is never automatic. The",
    pCostLink: "First steps in China plan (€800)",
    pCostAfter:
      "covers orientation, school choice, registration, and visa support; school and travel costs remain yours.",
    pVisaBefore:
      "The visa for a language year is the same type as for a degree:",
    pVisaLink: "X1 student visa, JW201 or JW202",
    pVisaAfter:
      ". Obtaining it is not guaranteed. We prepare a coherent file; the decision belongs to the consulate.",
    ctaTitle: "Leaving without IELTS, TOEFL, or HSK?",
    ctaText:
      "Describe your background: we will tell you whether a Chinese-language year in China is the right first step, and in what kind of school.",
    cta: "Assess a Chinese-language year in China",
    faqTitle: "Frequently asked questions about language schools in China",
  },
  bourses: {
    crumb: "Scholarships in China",
    title: "Scholarships to study in China",
    subtitle:
      "Funding studies in China is possible through the CSC scholarship, a university award, or a provincial or city scholarship. The outcome depends on your file: nothing is automatic.",
    introBefore: "We help you identify realistic options to",
    introLink: "study in China",
    introAfter:
      "and prepare a coherent file. We do not guarantee that a scholarship will be awarded.",
    warningTitle: "What to know before you apply",
    warningText:
      "Although many scholarships exist, funding depends on several important criteria: your academic results, your age, the program you choose, the quality of your file, your Chinese level, and the number of applicants.",
    warningNote:
      "💡 We do not guarantee a scholarship, but we help you identify options that fit your profile and strengthen your application.",
    amount: "Amount:",
    level: "Level:",
    duration: "Duration:",
    items: [
      {
        nom: "Chinese government scholarship — CSC",
        montant: "Partial or full",
        niveau: "Bachelor's, Master's & PhD",
        duree: "Depends on the program",
        description:
          "A national scholarship that can cover tuition, housing, medical insurance, and a monthly stipend.",
        icon: "🇨🇳",
      },
      {
        nom: "University scholarship",
        montant: "Partial or full",
        niveau: "Bachelor's, Master's & PhD",
        duree: "1 to 4 years",
        description:
          "Support offered directly by Chinese universities to attract strong international students.",
        icon: "🎓",
      },
      {
        nom: "Provincial scholarship",
        montant: "Depends on the province",
        niveau: "Bachelor's, Master's & PhD",
        duree: "Depends on the program",
        description:
          "A scholarship funded by a Chinese province to support international students enrolled in its institutions.",
        icon: "🏛️",
      },
      {
        nom: "Municipal scholarship",
        montant: "Depends on the city",
        niveau: "Bachelor's, Master's & PhD",
        duree: "Depends on the program",
        description:
          "Support granted by some Chinese cities to fund part or all of an international student's studies.",
        icon: "🏙️",
      },
    ],
    howTitle: "📋 How to apply?",
    how: [
      {
        title: "1️⃣ Preparation",
        text: "Gather your documents (transcripts, statement of purpose, recommendations)",
      },
      {
        title: "2️⃣ Application",
        text: "Submit your file to the university or scholarship body",
      },
      {
        title: "3️⃣ Results",
        text: "Wait for results (usually 2–3 months) and prepare your arrival",
      },
    ],
    ctaTitle: "Need help finding a scholarship that fits your profile?",
    ctaSubtitle: "We point you toward the most realistic options for your file.",
    cta: "Ask for personalized advice",
    faqTitle: "Frequently asked questions about scholarships to study in China",
  },
  visa: {
    crumb: "China student visa",
    title: "Student visa to study in China",
    lead: "Admission is not enough to come and study in China: you then need a student visa. The most common types are X1 (long stay) and X2 (shorter stay). The consular file relies on the admission letter and the JW201 or JW202 form issued after the university accepts you. Chinois en Devenir guides you through these steps; the decision belongs to the consulate.",
    hX: "X1 visa or X2 visa",
    pX: "The X1 visa is generally for a study stay of more than 180 days — typically a bachelor's, master's, PhD, or language year. The X2 visa is for a shorter stay, often under 180 days: a semester, a short program, or some summer programs. The exact type depends on the duration stated by the university, not only on the degree you aim for.",
    hJw: "JW201 and JW202: the key document",
    pJw: "After admission, the university (or CSC for some scholarships) issues a visa application form, JW201 or JW202. Without this document, the consulate generally will not process a study application. It goes with the official admission letter. Issuance times vary by institution and time of year.",
    hDocs: "Documents often required",
    docs: [
      "Valid passport, with blank pages",
      "Visa form and photo meeting consular specifications",
      "Admission letter from the Chinese university",
      "JW201 or JW202 form",
      "Sometimes a medical certificate, proof of funds, or insurance, depending on the consulate",
    ],
    pDocs:
      "Exact requirements differ from country to country. Follow the list from the Chinese consulate or visa center where you live, not a generic list found online.",
    hStay: "After arrival: residence permit",
    pStay:
      "With an X1 visa, students generally must go to the university and then to the local police for a residence permit, within the stated deadline (often around 30 days). That permit, not the entry visa, authorizes the study stay. An X2 may follow different rules. The university international office usually guides these first steps.",
    hWhen: "When to start",
    pWhenBefore: "The visa comes at the end of the path: first",
    pWhenLink1: "the China study project",
    pWhenMid:
      ", then the file, admission, and only then JW201/JW202 and the consular appointment. Booking a non-flexible flight too early is risky. Our",
    pWhenLink2: "admission process",
    pWhenAfter: "places the visa after results, before departure.",
    ctaTitle: "Need help with the student visa?",
    ctaText:
      "We check that the file is coherent after admission and outline the steps up to the consular submission. No visa is guaranteed.",
    cta: "See visa support",
    faqTitle: "Frequently asked questions about the Chinese student visa",
  },
  processus: {
    crumb: "Admission process",
    title: "Coming to study in China: the admission process",
    subtitleBefore:
      "From the first assessment to settling in: orientation, university, file, results,",
    visaLink: "student visa",
    subtitleAfter: "and departure. Plan on 4 to 6 months in most cases.",
    stepsHeading: "The 8 steps",
    stepLabel: "Step {n}",
    duration: "⏱️ Estimated duration: {duration}",
    summaryTitle: "📊 Summary",
    summarySteps: "Key steps",
    summaryMonths: "Months of preparation",
    summarySupport: "Support",
    ctaTitle: "Ready to start your admission to China?",
    ctaSubtitle:
      "Describe your background: we will outline realistic steps, from choosing a program to the student visa.",
    cta: "Assess my China study project",
    faqTitle: "Frequently asked questions about the process to study in China",
    steps: [
      {
        titre: "Initial consultation",
        description: "We assess your profile and your study goals in China.",
        details: [
          "Review of your academic file",
          "Identification of suitable universities",
          "Financial feasibility check",
        ],
        duree: "1–2 weeks",
        icon: "🤝",
      },
      {
        titre: "Choosing the university and program",
        description:
          "We select the institution and field of study that match your aims.",
        details: [
          "Presentation of 5–10 universities",
          "Program comparison",
          "Career outlook analysis",
        ],
        duree: "2–3 weeks",
        icon: "🏫",
      },
      {
        titre: "Preparing the file",
        description: "We gather and prepare all documents needed for the application.",
        details: [
          "Diploma translation",
          "Writing statements of purpose",
          "Organizing recommendations",
          "Preparing admission tests",
        ],
        duree: "3–4 weeks",
        icon: "📄",
      },
      {
        titre: "Submitting the application",
        description: "We send the complete file to the selected universities.",
        details: [
          "Final document check",
          "Sending to universities",
          "Administrative follow-up",
          "Communication with universities",
        ],
        duree: "1–2 weeks",
        icon: "📤",
      },
      {
        titre: "Waiting for results",
        description: "The universities review your application.",
        details: [
          "Regular follow-up",
          "Interview preparation if needed",
          "Waiting for the admission decision",
        ],
        duree: "4–8 weeks",
        icon: "⏳",
      },
      {
        titre: "Visa preparation",
        description: "We organize the administrative steps for your student visa.",
        details: [
          "Obtaining the official admission letter",
          "Requesting the JW202 form",
          "Building the visa file",
        ],
        duree: "3–4 weeks",
        icon: "🛂",
      },
      {
        titre: "Departure preparation",
        description: "Practical and administrative preparation for your arrival in China.",
        details: [
          "Flight booking",
          "Housing arrangements",
          "Obtaining the visa",
          "Packing",
        ],
        duree: "2–3 weeks",
        icon: "✈️",
      },
      {
        titre: "Arrival and settling in",
        description: "Welcome to China. We support your first steps.",
        details: [
          "On-site welcome and first orientation",
          "Help with registration and residence procedures",
          "Landmarks for campus, housing, and daily life",
        ],
        duree: "1–2 weeks",
        icon: "🎓",
      },
    ],
  },
  tarifs: {
    crumb: "Pricing",
    title: "Three plans, depending on where you stand",
    subtitle:
      "A Chinese-language year, university admission, or both. Each plan is complete for its goal. The full plan: €2,000 (€500 savings).",
    planLabel: "Plan {n}",
    recommended: "recommended",
    included: "What's included",
    idealIf: "This plan is a good fit if",
    savingsTitle: "Savings on the full plan",
    savingsTextBefore: "Plan 3 is",
    savingsHighlight: "€2,000 (€500 savings)",
    savingsTextAfter:
      ", with up to 8 university applications instead of 5, and follow-up until departure.",
    keep1and2Title: "Plans 1 and 2 remain the right choice",
    keep1and2: [
      "The full plan is not mandatory. It is the most coherent if your project runs from a Chinese-language year through university.",
      "If you only want a language year, Plan 1 covers the school, registration, and student-visa support.",
      "If your university project is already defined and your language level is enough, Plan 2 supports you until university replies, without paying for a Chinese-language year you do not need.",
    ],
    translationTitle: "Translation and document preparation",
    translationP1:
      "We help you identify which documents must be translated and prepare the English or Chinese versions required by universities or authorities.",
    translationP2:
      "Official or certified translations, legalizations, authentications, and notarization may be billed separately. These fees are communicated before any order.",
    extraTitle: "Costs that remain yours",
    extraIntro:
      "Our prices cover support and advisory services only. Additional costs may remain yours, including:",
    extraFees: [
      "University application fees",
      "Language exam fees",
      "Official or certified translation fees",
      "Legalization, authentication, or notarization fees",
      "Medical fees",
      "Visa fees",
      "Document shipping fees",
      "Airfare",
      "Housing",
      "Insurance",
      "Settling-in costs in China",
      "Administrative fees charged by a university or authority",
    ],
    howTitle: "How does the support work?",
    howPay:
      "Payment happens after the first phone consultation and after you confirm the plan. No work starts before the support is confirmed.",
    processSteps: [
      {
        title: "You choose your plan",
        text: "You select the offer that best matches your project and how far along you are.",
      },
      {
        title: "We talk on the phone",
        text: "We review your background, goals, budget, and whether the project is feasible.",
      },
      {
        title: "We confirm the right plan",
        text: "Together we confirm included services, planned steps, and the limits of the support.",
      },
      {
        title: "You receive the service terms",
        text: "You receive a summary of the support, the service terms, and payment details.",
      },
      {
        title: "Support begins",
        text: "Support starts after the terms are validated and payment is confirmed.",
      },
    ],
    infoTitle: "Important information",
    infoIntro:
      "We help you build a serious, coherent file that matches institutional requirements. We cannot, however, guarantee:",
    disclaimers: [
      "Admission to a university",
      "Being awarded a scholarship",
      "Obtaining a visa",
      "Acceptance at a language school",
      "Housing availability",
    ],
    infoOutro:
      "Final decisions belong to universities, scholarship bodies, language schools, and the relevant authorities.",
    chooser: [
      {
        question: "I first want to learn Chinese",
        detail: "Language school, student visa, and first settling-in in China.",
      },
      {
        question: "My university project is already clear",
        detail:
          "University search, application file, and follow-up until the institutions reply.",
      },
      {
        question: "I am preparing language, then university",
        detail: "Both types of support, one contact person, €500 savings.",
      },
    ],
    ctaTitle: "Not sure which plan to choose yet?",
    ctaSubtitle:
      "The first consultation confirms the offer that fits your project. Payment only comes after that conversation.",
    cta: "Request a phone call",
    faqTitle: "Frequently asked questions about the support",
    paymentNote: "Payment in several installments is possible under agreed terms.",
  },
  formules: {
    1: {
      title: "First steps in China",
      subtitle: "Learn Chinese in China + student visa support",
      audience: "For a first year of Chinese",
      intro:
        "Want to take your first steps in China, learn Chinese in immersion, and communicate faster day to day? This plan helps you choose a language school and prepare your departure, including the student visa file.",
      footnote:
        "Visa support includes advice, a check, and guidance. Final decisions and visa issuance belong to the competent authorities.",
      cta: "Start my project in China",
      includes: [
        "Review of your profile, background, and goals",
        "Assessment of your current Chinese or English level",
        "Advice on duration and the right type of program",
        "Personalized search for language schools in China",
        "School selection based on your budget, city, and preferences",
        "Check of admission requirements",
        "Information on intake dates and available programs",
        "Help preparing the required documents",
        "Check and organization of your file",
        "Support through the registration steps",
        "Help preparing the Chinese student visa file",
        "Check of documents needed for the visa",
        "Advice on the visa application procedure",
        "Guidance on housing, travel, and arrival in China",
        "Follow-up until your registration is confirmed",
      ],
      idealIf: [
        "You want to learn Chinese in China",
        "You want to immerse yourself in the language and Chinese culture",
        "You are a beginner or want to improve your level",
        "You want better chances of speaking Chinese day to day",
        "You want a first experience in China",
        "You prefer to start with a language year before university",
        "You need help with registration and your student visa",
      ],
    },
    2: {
      title: "University admission",
      subtitle: "Complete university support",
      audience: "For a study project that is already defined",
      intro:
        "You already have a university project and want to join a university in China? This plan is dedicated exclusively to your admission, from searching for programs to receiving the institutions' replies.",
      footnote:
        "This plan covers the university part only. The language year and specific visa support are not included.",
      cta: "Get support for my university admission",
      includes: [
        "Full review of your background and project",
        "Definition of your study strategy in China",
        "Personalized search for universities and programs",
        "Search for available scholarship opportunities",
        "Check of admission requirements",
        "Assessment of how well your profile matches the target programs",
        "Selection of universities suited to your level and goals",
        "Preparation and organization of documents",
        "Review and improvement of your file",
        "Help writing or improving your study plan",
        "Check of your CV and statement of purpose",
        "Help filling in application forms",
        "Submission of up to 5 university applications",
        "Follow-up on application progress",
        "Regular exchanges during the procedure",
        "Follow-up until university replies are received",
      ],
      idealIf: [
        "Your university project is already defined",
        "You want to enter a university in China directly",
        "You already have a sufficient language level for your program",
        "You want to present a solid, well-organized file",
        "You need help choosing the right universities",
        "You want to save time and avoid mistakes",
        "You want support until the institutions reply",
      ],
    },
    3: {
      title: "Full support",
      subtitle: "Chinese-language year + university year",
      audience: "Your China study project from A to Z",
      badge: "Recommended",
      savingsLabel: "€500 savings",
      savingsText:
        "By choosing this combined plan, you get Plan 1 and Plan 2 support for €2,000 (€500 savings), with coherent follow-up and a single contact person.",
      intro:
        "This is our most complete support. You start with a Chinese-language year in China, then prepare your university admission. The language year helps you adapt, communicate better day to day, and strengthen your profile before university.",
      footnote:
        "Visa, housing, and arrival: advice, guidance, and document checks. We do not complete official procedures on your behalf. Visa issuance depends exclusively on the competent authorities.",
      cta: "Prepare my full path in China",
      groups: [
        {
          title: "First stage: Chinese-language year",
          items: [
            "In-depth review of your profile and project",
            "Personalized search for a language school",
            "Selection based on your city, budget, and goals",
            "Check of admission requirements",
            "Help preparing the registration file",
            "Support for language-school registration",
            "Advice on housing and arrival in China",
            "Help preparing the Chinese student visa file",
            "Advice on documents and visa application steps",
          ],
        },
        {
          title: "Second stage: university admission",
          items: [
            "A personalized study strategy in China",
            "Search for universities, programs, and scholarships",
            "Selection of the institutions that best fit your profile",
            "Check of admission criteria and deadlines",
            "Complete preparation of the application file",
            "Review and improvement of key documents",
            "Help writing the study plan and required letters",
            "Help filling in platforms and forms",
            "Submission of up to 8 university applications",
            "Personalized follow-up throughout the procedure",
            "Follow-up on exchanges with universities",
            "Follow-up until the institutions reply",
          ],
        },
        {
          title: "Support after admission",
          items: [
            "Explanation of documents sent by the university",
            "Advice on the next steps",
            "Guidance on housing",
            "Advice on organizing your trip",
            "A checklist of steps before departure",
            "Advice to prepare settling in China",
            "Follow-up until you leave",
          ],
        },
      ],
      idealIf: [
        "You want to learn Chinese before university",
        "You want to increase your chances of succeeding in China",
        "You want to adapt gradually to life in China",
        "You plan to continue university studies after the language year",
        "You want complete, personalized support",
        "You want to save €500 compared with the two separate plans",
        "You want to save time with a strategy prepared from the start",
        "You prefer a single contact person for the whole project",
        "You want support from first registration through departure",
      ],
      whyChoose: {
        title: "Why choose the full plan?",
        intro:
          "With this plan, you are not only preparing your arrival in China. You are building a real path:",
        steps: [
          "You start by learning Chinese in China.",
          "You adapt to your new environment.",
          "You improve your level and your communication.",
          "You then prepare your university admission.",
          "You get continuous follow-up until departure.",
        ],
      },
    },
  },
  faqPage: {
    crumb: "FAQ",
    title: "FAQ: studying in China",
    lead: "Short answers for coming to study in China: admission, language, scholarships, student visa, and support. Chinois en Devenir prepares the files; decisions remain those of universities, scholarship bodies, and consulates.",
    groups: {
      etudier: "Study in China",
      langue: "Language schools and HSK",
      visa: "Student visa",
      bourses: "Scholarships",
      processus: "Process and support",
    },
    ctaTitle: "Don't see your question?",
    ctaText:
      "Describe your background: we will outline realistic options for studying in China.",
    cta: "Assess my project",
  },
  contact: {
    crumb: "Contact",
    title: "Contact us about studying in China",
    subtitle:
      "A question about admission, a scholarship, or the student visa? Write to us: we will help you see your China study project clearly.",
    presence: "Presence in China",
    phone: "Phone",
    hours: "Mon–Fri: 9am–6pm",
    email: "Email",
    socialTitle: "🌐 Follow us",
    ctaTitle: "A question about your study project?",
    ctaSubtitle:
      "Describe your background: our team will get back to you with a first orientation.",
    cta: "Assess my China study project",
    faqsTitle: "❓ Frequently asked questions",
    faqs: [
      {
        q: "How fast do you reply?",
        a: "We usually reply within 24 to 48 hours, depending on the time zone and the volume of requests.",
      },
      {
        q: "Do you offer live support?",
        a: "You can write to us by email, WeChat, or WhatsApp during office hours (Beijing time).",
      },
      {
        q: "Can you help with my visa?",
        a: "Yes: we guide you in building a coherent file (X1 or X2, JW201 or JW202). The visa decision remains the consulate's.",
      },
      {
        q: "What are your hours?",
        a: "Mon–Fri 9am–6pm (Beijing time)",
      },
    ],
  },
  notFound: {
    code: "Error 404",
    title: "Page not found",
    subtitle:
      "This link does not exist or has moved. Here are the most useful pages for a China study project.",
    links: [
      { href: "/", label: "Home" },
      { href: "/etudier-en-chine", label: "Study-in-China guide" },
      { href: "/ecoles-de-langue-chine", label: "Language schools" },
      { href: "/bourses", label: "Scholarships" },
      { href: "/visa-etudiant-chine", label: "Student visa" },
      { href: "/contact", label: "Contact" },
    ],
  },
  legal: {
    updated: "Last updated: August 2026",
    email: "Email:",
    website: "Website:",
    back: "← Back to home",
  },
  privacy: {
    title: "Privacy Policy",
    s1Title: "1. Introduction",
    s1: 'Chinois en Devenir ("we", "our") operates the website chinoisendevenir.com. This page informs you of our policies regarding the collection, use, and disclosure of personal data when you use our service, and the choices you have associated with that data.',
    s2Title: "2. Data Collection and Use",
    s2Types: "📋 Types of data collected:",
    s2TypeItems: [
      "Full name",
      "Email address",
      "Phone number",
      "Postal address",
      "Academic information",
      "Location data (if authorized)",
    ],
    s2Use: "🎯 Use of data:",
    s2UseItems: [
      "Processing your contact requests",
      "Sending newsletters and updates",
      "Improving our services",
      "Compliance with legal obligations",
      "Fraud prevention",
    ],
    s3Title: "3. Data Security",
    s3: "We take the security of your personal data seriously. We use encryption technologies (SSL/TLS) to protect your information in transit.",
    s3Note:
      "No method of transmission over the Internet is 100% secure. Although we use appropriate security measures, we cannot guarantee absolute security.",
    s3Important: "Important:",
    s4Title: "4. Data Sharing",
    s4: "We do not sell, trade, or rent your personal data to third parties. We may share your information only in the following cases:",
    s4Items: [
      "With your explicit consent",
      "With our university partners in China",
      "In accordance with legal requirements",
      "To protect our rights and your safety",
    ],
    s5Title: "5. Cookies",
    s5: "Our site uses cookies to improve your experience. Cookies are small files stored on your device that help us:",
    s5Items: [
      "Remember your preferences",
      "Analyze site traffic",
      "Personalize content",
    ],
    s5Outro: "You can disable cookies in your browser settings.",
    s6Title: "6. Your Rights",
    s6: "You have the right to:",
    s6Items: [
      "Access your personal data",
      "Correct inaccurate data",
      "Request deletion of your data",
      "Object to the processing of your data",
      "Withdraw your consent at any time",
    ],
    s6Contact: "To exercise these rights, contact us at:",
    s7Title: "7. Changes to This Policy",
    s7: "We may update this privacy policy from time to time. Changes will be published on this page with an update date. Your continued use of the site after any change constitutes acceptance of the updated policy.",
    s8Title: "8. Contact",
    s8: "If you have questions about this privacy policy, please contact us:",
    accept: "By using our site, you accept this privacy policy",
  },
  terms: {
    title: "Terms of Use",
    s1Title: "1. Acceptance of Terms",
    s1: "By accessing and using the website chinoisendevenir.com, you agree to be bound by these terms of use. If you do not accept these terms, please do not use this site.",
    s2Title: "2. Use of the Site",
    s2: "You agree to use this site only for lawful purposes and not in a way that could damage, disable, overload, or harm the site.",
    s2Ban: "Prohibited:",
    s2Items: [
      "Harassment or intimidation of other users",
      "Posting offensive or illegal content",
      "Attempting unauthorized access to the site",
      "Collecting data without authorization",
      "Using robots or automation tools",
    ],
    s3Title: "3. Intellectual Property",
    s3: "All site content, including text, graphics, logos, images, and software, is the property of Chinois en Devenir or its content providers and is protected by international copyright laws.",
    s3Ban: "You are not allowed to:",
    s3Items: [
      "Reproduce or modify the content without authorization",
      "Distribute the content for commercial purposes",
      "Use the content to create derivative works",
    ],
    s4Title: "4. User Accounts",
    s4: "If you create an account on our site, you are responsible for:",
    s4Items: [
      "Keeping your credentials confidential",
      "Signing out after each session",
      "Immediately reporting any unauthorized access",
      "Providing accurate and up-to-date information",
    ],
    s5Title: "5. User Content",
    s5: "By submitting content to our site, you grant Chinois en Devenir a non-exclusive, perpetual, irrevocable license to use, modify, publish, and distribute that content.",
    s5Note:
      "You warrant that any content you submit is original, does not infringe third-party rights, and is not offensive.",
    s5Responsibility: "Responsibility:",
    s6Title: "6. Disclaimer of Warranty",
    s6: 'This site is provided "as is" without any warranty, express or implied. We do not guarantee:',
    s6Items: [
      "The accuracy or completeness of the information",
      "Uninterrupted operation of the site",
      "The absence of errors or viruses",
      "That the site will meet your specific expectations",
    ],
    s7Title: "7. Limitation of Liability",
    s7: "In no event shall Chinois en Devenir be liable for indirect, incidental, special, consequential, or punitive damages arising from your use of or inability to use this site, even if we have been advised of the possibility of such damages.",
    s8Title: "8. External Links",
    s8: "Our site may contain links to external websites. We are not responsible for the content, accuracy, or practices of those external sites.",
    s8b: "The inclusion of a link does not imply our endorsement of the linked site.",
    s9Title: "9. Service Suspension",
    s9: "We reserve the right to suspend or terminate access to the site at any time, for any reason, including a breach of these terms. We may also suspend the service without notice in an emergency or in case of technical issues.",
    s10Title: "10. Changes to the Terms",
    s10: "We may change these terms at any time. Changes take effect immediately after publication. Your continued use of the site after publication constitutes acceptance of the new terms.",
    s11Title: "11. Governing Law",
    s11: "These terms of use are governed by and construed in accordance with applicable law. Any dispute arising from these terms shall be submitted to the exclusive jurisdiction of the competent courts.",
    s12Title: "12. Contact",
    s12: "For any question about these terms of use, please contact us:",
    accept: "By using our site, you accept these terms of use",
  },
  student: {
    space: "Student space",
    loading: "Loading your space...",
    loadingFile: "Loading your file...",
    login: "Sign in",
    register: "Create an account",
    loginSubtitle: "Sign in with the email used in the form.",
    registerSubtitle:
      "Create an account with your email and a password. Use the same address as on the project form.",
    password: "Password",
    confirmPassword: "Confirm password",
    signIn: "Sign in",
    signingIn: "Signing in...",
    createAccount: "Create my account",
    creating: "Creating...",
    forgot: "Forgot password?",
    logout: "Sign out",
    hello: "Hello {name}",
    newPassword: "New password",
    newPasswordSubtitle: "Choose a password to access your file.",
    saving: "Saving...",
    save: "Save",
    callbackLoading: "Signing you in...",
    callbackFail: "Unable to sign in",
    errors: {
      credentials: "Incorrect email or password.",
      generic: "Something went wrong.",
      passwordLength: "The password must contain at least 8 characters.",
      passwordMatch: "Passwords do not match.",
      exists: "An account already exists with this email. Please sign in.",
      createFail: "Unable to create the account.",
      resetEmail: "Enter your email to reset the password.",
      resetFail: "Unable to send the email.",
      resetSent:
        "A reset email has been sent if an account exists.",
      session: "Session expired. Please sign in again.",
      passwordUpdate: "Unable to update the password.",
    },
    noFile:
      "No file matches this email. Complete the form to continue.",
    unlockedSubtitle:
      "View your information, update your profile, and follow your file.",
    lockedSubtitle:
      "Your file is registered. Choose a plan to continue.",
    chosenPendingSubtitle:
      "Your choice is saved. The team will contact you to confirm it and agree on payment before support begins.",
    completeTitle: "Complete your project",
    completeText:
      "Signed in as {email}. Use this email: if it was already entered in the form, your file will be linked automatically.",
    infoTitle: "My information",
    infoSubtitle:
      "Signed in as {email}. The email address cannot be changed here.",
    saved: "Your information has been saved.",
    docSent: "Document sent successfully.",
    saveInfo: "Save my information",
    progressTitle: "Progress of your file",
    progressSubtitle: "Step {current} of {total}",
    docsTitle: "Documents to provide",
    schoolDocs: "Documents for the school",
    missingCount:
      "{count} document missing. Upload it below (PDF, JPG, or PNG — 10 MB max).",
    missingCountPlural:
      "{count} documents missing. Upload them below (PDF, JPG, or PNG — 10 MB max).",
    allReceived: "All requested documents have been received.",
    missing: "Missing",
    received: "Received",
    currentFile: "Current file:",
    sending: "Sending...",
    replace: "Replace",
    send: "Send",
    download: "Download",
    visaPrep: "Prepare the documents needed for your student visa application.",
    adminDocsTitle: "Documents provided by Chinois en Devenir",
    adminDocsSubtitle:
      "Files sent by Chinois en Devenir for your application.",
    noAdminDocs: "No document has been sent by the team yet.",
    formulasTitle: "Choose your plan",
    formulasSubtitle:
      "Select the support that fits your project before continuing. Orientation, follow-up, and documents open after confirmation and payment.",
    formulasChooseSubtitle:
      "Select the support that fits your project before continuing. Orientation, follow-up, and documents open after confirmation and payment.",
    formulasChangeSubtitle:
      "You can still change your plan until your support is confirmed.",
    chooseFormula: "Choose this plan",
    chosenFormula: "Plan selected",
    formuleSaved: "Your plan has been saved.",
    pay: "Pay {price}",
    paySoon:
      "Online payment will be available soon. For now, save your choice: the team will contact you.",
    yourSupport: "Your support",
    formula: "Plan",
    formulaN: "Plan {n}",
    steps: {
      inscription: {
        label: "Registration",
        description: "Your profile has been recorded.",
      },
      consultation: {
        label: "Initial consultation",
        short: "Consultation",
        description: "Review of your study project.",
      },
      formation: {
        label: "Choosing the program",
        description: "A suitable university and program.",
      },
      dossier: {
        label: "Preparing the file",
        description: "Documents and application in progress.",
      },
      envoi: {
        label: "Application sent",
        description: "File submitted to universities.",
      },
      admission: {
        label: "Admission",
        description: "University replies.",
      },
      visa: {
        label: "Visa and departure",
        description: "Formalities before arriving in China.",
      },
      termine: {
        label: "Arrival",
        description: "File completed.",
      },
    },
    docsCatalog: {
      passeport: {
        label: "Passport",
        description: "Valid passport (PDF, JPG, or PNG — 10 MB max).",
      },
      high_school_diploma: {
        label: "High school diploma",
        description:
          "High school diploma or equivalent, with translation if needed (PDF, JPG, or PNG — 10 MB max).",
      },
      bachelor_degree: {
        label: "Bachelor's diploma",
        description:
          "Bachelor's diploma, with transcripts if possible (PDF, JPG, or PNG — 10 MB max).",
      },
      master_degree: {
        label: "Master's diploma",
        description:
          "Master's diploma, with transcripts if possible (PDF, JPG, or PNG — 10 MB max).",
      },
      hsk: {
        label: "HSK certificate",
        description:
          "For a program taught in Chinese (PDF, JPG, or PNG — 10 MB max).",
      },
      ielts_or_toefl: {
        label: "IELTS or TOEFL",
        description:
          "For a program taught in English. Either certificate is enough (PDF, JPG, or PNG — 10 MB max).",
      },
      csca: {
        label: "CSCA",
        description:
          "China Scholastic Competency Assessment, often required for a bachelor's in China (PDF, JPG, or PNG — 10 MB max).",
      },
      formulaire_medical: {
        label: "Medical form",
        description:
          "Foreigner Physical Examination Form, dated and stamped (PDF, JPG, or PNG — 10 MB max).",
      },
      casier_judiciaire: {
        label: "Criminal record extract",
        description:
          "No Criminal Record certificate, recent (PDF, JPG, or PNG — 10 MB max).",
      },
    },
    docsIntro: {
      bac: "For a bachelor's in China, universities most often ask for the passport, high school diploma, CSCA, a language certificate, the medical form, and a criminal record extract.",
      licence:
        "For a master's, universities most often ask for the passport, bachelor's diploma, a language certificate, the medical form, and a criminal record extract.",
      master:
        "For a PhD, universities most often ask for the passport, bachelor's and master's diplomas, a language certificate, the medical form, and a criminal record extract.",
      autre:
        "Chinese universities most often ask for the passport, the diploma of your latest level, a language certificate, the medical form, and a criminal record extract.",
    },
    visaGuide: {
      title: "Documents for the visa",
      intro:
        "Students who want to study in China must apply for a visa. The process is straightforward. Start by identifying the visa type that fits your stay:",
      types: [
        { name: "X1 visa", description: "for a study stay of more than 180 days." },
        { name: "X2 visa", description: "for a study stay of less than 180 days." },
        { name: "L visa", description: "for a summer or winter program." },
      ],
      documentsTitle: "Documents to provide",
      documents: [
        "Original passport",
        "ID photo",
        "A completed visa application form",
        "Proof of legal stay or residence",
        "Admission letter: original and photocopy",
        "Original and photocopy of the “Visa Application for Study in China” form (JW201 or JW202). Required for the X1 visa only.",
      ],
      note: "In addition to the documents above, consular officers may require other items, case by case, when deciding whether to issue the visa. The final decision belongs to the competent authorities.",
    },
    matching: {
      untilDeparture: "Until departure",
      application: "Application",
      bilan: "Review",
      orientation: "Your orientation",
      notReady:
        "Your report is not ready yet. It will appear here once it has been prepared.",
      bestFit: "Best match",
      toSpecify: "to confirm",
      strengths: "Strengths",
      prepare: "To prepare",
      fees: "Fees:",
      feesFallback: "to check with the university",
      deadline: "Deadline:",
      language: "Language:",
      listedScholarships: "Listed scholarships:",
      scholarshipsFallback: "Scholarships: to check with the university",
      extraDocs: "Documents specific to this institution:",
      seeDetail: "See details",
      unis: "Shortlisted universities",
      noUnis:
        "No university was compatible enough with the current data. Specify the field, language, or budget to refine recommendations.",
      bestOptions: "What are the best options for you",
      nextSteps: "Next steps",
      you: "You:",
      we: "We:",
      docsToPrep: "Documents to prepare",
      provided: "Provided",
      toProvide: "To provide",
      possibleScholarships: "Possible scholarships",
      noGrant: "No named option in the catalog for now.",
      disclaimer: "No admission, scholarship, or visa is guaranteed.",
      status: {
        fait: "Done",
        en_cours: "In progress",
        a_venir: "Upcoming",
        bloquant: "Blocking",
      },
      languageYear: "Language year",
      chineseStudy: "Studying Chinese in China",
      chineseNotReady:
        "Language schools matching your city, budget, and intake will appear here once they have been selected.",
      whySchool: "Why this school",
      toConfirm: "To confirm",
      schoolFeesFallback: "to confirm with the school",
      intake: "Intake:",
      city: "City:",
      budget: "Budget:",
      schools: "Shortlisted language schools",
      noSchools:
        "No school was compatible enough with the current data. Specify the city, budget, or intake date.",
      chineseDisclaimer: "No registration, scholarship, or visa is guaranteed.",
    },
  },
  faqs: {
    home: [
      {
        question: "How can I study in China as a French speaker?",
        answer:
          "To study in China, you choose a program (bachelor's, master's, PhD, or language year), target universities that fit your profile, build an admission file, then apply for a student visa once admitted. French-speaking support helps connect these steps: orientation, application, a possible scholarship, and the visa.",
      },
      {
        question: "Do I need to speak Chinese to study in China?",
        answer:
          "Not necessarily. Many Chinese universities offer English-taught programs. Chinese-taught programs usually require HSK, often around HSK 4 or 5 depending on the degree. A language year is also possible before entering a bachelor's or master's.",
      },
      {
        question: "When should I start the process to study in China?",
        answer:
          "It is wise to start 4 to 8 months before the intake. The main intake is in September; a spring intake also exists, often in February or March. Scholarships, especially CSC, have earlier calendars than self-funded applications.",
      },
      {
        question: "Can I get a scholarship to study in China?",
        answer:
          "Yes, depending on your profile. The main tracks are the Chinese government scholarship (CSC) and university, provincial, and municipal scholarships. An award is never guaranteed: it depends on the file, the level, the program, and the number of places.",
      },
      {
        question: "Which visa do I need to study in China?",
        answer:
          "International students generally use an X1 visa (stay of more than 180 days) or X2 (shorter stay). After admission, the university issues an admission letter and a JW201 or JW202 form, required by the consulate. On site, a residence permit often replaces the X1 visa.",
      },
    ],
    etudier: [
      {
        question: "Which programs can I follow in China?",
        answer:
          "International students can aim for a bachelor's, master's, PhD, preparatory year, or Chinese language courses. Depending on the university, teaching is in Chinese or English, in fields such as engineering, business, computer science, law, or languages.",
      },
      {
        question: "Which documents are required for admission in China?",
        answer:
          "The file generally includes diplomas, transcripts, passport, photo, statement of purpose, CV, and sometimes recommendation letters, a language certificate (HSK, IELTS, or TOEFL), and a medical certificate. Documents not written in Chinese or English often need to be translated.",
      },
      {
        question: "How much do studies in China cost?",
        answer:
          "Costs vary by university, city, and program. Without a scholarship, plan for tuition, housing, insurance, visa, and daily life. A scholarship may cover part or all of these costs. A project review helps estimate a realistic budget before you apply.",
      },
      {
        question: "Does Chinois en Devenir guarantee admission?",
        answer:
          "No. We prepare a serious, compliant file and follow the application. Admission, scholarship, and visa decisions belong to the university, the funding body, and the consular authorities.",
      },
    ],
    langue: [
      {
        question: "Can I study in China without IELTS or TOEFL?",
        answer:
          "Yes. Without IELTS or TOEFL, English-taught programs are generally closed. Two paths remain open: a Chinese-language year at a university, then a Chinese-taught degree once HSK is obtained. That is often the most realistic path for a French-speaking student.",
      },
      {
        question: "Do I already need to speak Chinese for a language school in China?",
        answer:
          "No. Chinese programs for internationals accept beginners. The language year exists precisely to build the level, usually toward HSK 4 or 5, before a bachelor's or master's.",
      },
      {
        question: "Does a language year automatically lead to university?",
        answer:
          "No. Language enrollment and bachelor's or master's admission are two separate files. The Chinese year improves the profile and HSK, but the university then decides based on places, grades, and the degree requirements.",
      },
      {
        question: "What is the difference between a language school and a university in China?",
        answer:
          "For international students, “language school” most often means a university's Chinese program (汉语进修), not a private school. You are a student, with an X1 visa, a campus, and the option to apply later for a degree, sometimes at the same institution.",
      },
      {
        question: "Which visa do I need for a Chinese-language year in China?",
        answer:
          "A language year generally requires an X1 student visa, like a bachelor's. After registration, the school issues an admission letter and a JW201 or JW202, then the consulate processes the application. A visa is never guaranteed.",
      },
      {
        question: "How long does a language year in China last?",
        answer:
          "The most common format is one year, sometimes a semester. The main intake is in September; a spring intake often exists in February or March. Time needed to aim for HSK 4 or 5 depends on your starting level and work pace.",
      },
    ],
    visa: [
      {
        question: "What is the difference between the X1 and X2 visa?",
        answer:
          "The X1 visa is generally for a study stay of more than 180 days. The X2 visa is for a shorter stay, often under 180 days. After arriving with an X1, you usually convert it into a residence permit with the local police, within the deadline given by the university.",
      },
      {
        question: "What is the JW201 or JW202 form?",
        answer:
          "JW201 or JW202 is the visa application form issued after admission, often via the university or CSC. It is part of the consular file, with the admission letter, passport, and other documents required by the Chinese consulate in your country of residence.",
      },
      {
        question: "How long does it take to get a Chinese student visa?",
        answer:
          "The timeline depends on the consulate, the period, and how complete the file is. You first need admission and JW201/JW202, then you submit the application. Allow several weeks after admission, and do not book a final flight too early.",
      },
      {
        question: "Can you guarantee the visa?",
        answer:
          "No. We guide you in building a coherent file. The decision belongs to the Chinese consulate or embassy. A refused visa, a missing document, or a deadline that is too short remain possible.",
      },
    ],
    bourses: [
      {
        question: "What is the CSC scholarship to study in China?",
        answer:
          "The China Scholarship Council (CSC) scholarship is a national award for international students. Depending on the type, it can cover tuition, housing, insurance, and a monthly stipend. Criteria, quotas, and calendars vary by program and university.",
      },
      {
        question: "Do I need an excellent file for a scholarship in China?",
        answer:
          "A strong file helps a lot: results, a coherent project, letters, language level. Some university or municipal scholarships are more accessible than CSC, but none is automatic. It is better to target realistic options than a single highly competitive award.",
      },
      {
        question: "Can I study in China without a scholarship?",
        answer:
          "Yes. Many international students pay tuition. In that case, the calendar is often more flexible than for scholarships. You still need to plan the budget, housing, and visa.",
      },
    ],
    processus: [
      {
        question: "How long does support to study in China take?",
        answer:
          "Plan on 4 to 6 months between the first conversation and departure, sometimes more for a CSC scholarship or a PhD. The timeline depends on your file, the intakes you target, and university replies.",
      },
      {
        question: "Do I already need to know which university to choose?",
        answer:
          "No. Orientation is part of the process: we review your profile, field, budget, and language level, then select realistic institutions and programs.",
      },
      {
        question: "What happens after admission?",
        answer:
          "After the admission letter come JW201/JW202, the student visa application, departure preparation (flight, housing, documents), then settling in: registration, residence, and first on-site steps.",
      },
    ],
    tarifs: [
      {
        question: "Which plan should I choose to study in China?",
        answer:
          "Plan 1 (€800) fits if you first want a Chinese-language year in China, with language-school registration and student-visa support. Plan 2 (€1,700) fits if your university project is already defined and your language level is enough: up to 5 applications, until replies. Plan 3 (€2,000, €500 savings) combines both, with up to 8 applications and follow-up until departure.",
      },
      {
        question: "What do the plans to study in China include?",
        answer:
          "Plan 1 (€800) supports language-school registration and student visa preparation. Plan 2 (€1,700) covers university admission only, up to 5 applications. Plan 3 (€2,000) combines a Chinese-language year and university admission, up to 8 applications, then follow-up until departure. University fees, certified translations, visa, and airfare remain yours.",
      },
      {
        question: "Why does the full plan cost €2,000?",
        answer:
          "Plan 3 is €2,000 (€500 savings). It combines the Chinese-language year and university admission, with a single contact person and up to 8 university applications instead of 5.",
      },
      {
        question: "When do I need to pay?",
        answer:
          "Payment happens after the first phone consultation and after you confirm the plan. No support work starts before that. Payment in several installments is possible under agreed terms.",
      },
    ],
  },
};

export const STUDY_DOMAIN_VALUE_BY_INDEX = STUDY_DOMAIN_VALUES;

export const siteTranslations = { fr, en };
