/**
 * Country landing pages. Copy stays factual: no admission, scholarship, or visa promise.
 * Each page keeps the same outline and a different intro, angle, FAQ, and internal links.
 */

export const STUDY_FROM_HUB_PATH = "/etudier-en-chine-depuis";

export const STUDY_FROM_DISCLAIMER =
  "Les procédures varient selon la nationalité, l'université, le niveau d'études et l'année de candidature. Les informations relatives à l'admission, aux documents, au séjour, au visa, à la reconnaissance des diplômes, aux examens médicaux et aux éventuelles aides financières doivent être vérifiées auprès de l'université concernée et des autorités officielles compétentes. Ce contenu ne constitue ni une promesse d'admission, ni une promesse de bourse, ni un avis juridique ou administratif.";

export type StudyLink = { href: string; label: string };

const LINK = {
  guide: {
    href: "/etudier-en-chine",
    label: "Guide général : étudier en Chine (licence, master, doctorat)",
  },
  langue: {
    href: "/ecoles-de-langue-chine",
    label: "Année de langue et préparation linguistique",
  },
  processus: {
    href: "/processus",
    label: "Préparer le dossier : processus d'admission",
  },
  visa: { href: "/visa-etudiant-chine", label: "Visa étudiant : ce qu'il faut vérifier" },
  bourses: { href: "/bourses", label: "Bourses d'études : dispositifs à vérifier" },
  tarifs: { href: "/tarifs", label: "Formules d'accompagnement" },
  faq: { href: "/faq", label: "Questions fréquentes" },
  blog: { href: "/blog", label: "Guides du blog" },
  contact: { href: "/contact", label: "Page contact" },
  projet: { href: "/#lead-form", label: "Décrire mon projet" },
} as const;

type LinkKey = keyof typeof LINK;

export type StudyCountry = {
  slug: string;
  name: string;
  title: string;
  h1: string;
  description: string;
  intro: string;
  steps: string[];
  angleTitle: string;
  angle: string;
  faqs: { question: string; answer: string }[];
  cta: string;
  extras: LinkKey[];
  related: string;
};

export const STUDY_COUNTRIES: StudyCountry[] = [
  {
    slug: "le-senegal",
    name: "Sénégal",
    title: "Étudier en Chine depuis le Sénégal : admissions et dossier",
    h1: "Étudier en Chine depuis le Sénégal",
    description:
      "Étudier en Chine depuis le Sénégal : étapes, documents à vérifier et conseils pour préparer une candidature selon votre niveau et votre université.",
    intro:
      "Vous résidez au Sénégal et envisagez une licence, un master, un doctorat ou une formation en Chine ? Cette page présente une méthode de préparation du projet : choisir un programme, comparer les exigences, constituer un dossier cohérent et vérifier chaque formalité auprès des sources officielles. Les conditions ne sont pas identiques d'une université ou d'un niveau à l'autre.",
    steps: [
      "Définir le niveau, la discipline, la langue d'enseignement et les universités ciblées.",
      "Vérifier les critères d'admission, les échéances de candidature et le mode de dépôt sur le site officiel de chaque établissement.",
      "Préparer, selon les exigences reçues : pièce d'identité, passeport, diplômes, relevés de notes, CV, lettre de motivation, projet d'études ou de recherche, recommandations et justificatifs linguistiques.",
      "Demander si les documents doivent être traduits, certifiés, légalisés ou accompagnés d'une authentification particulière.",
      "Après admission, vérifier auprès de l'université et des autorités compétentes les formalités applicables au séjour, au visa et à l'inscription.",
    ],
    angleTitle: "Ce qu'un candidat au Sénégal clarifie avant le dépôt",
    angle:
      "Équivalence du parcours, format des relevés, langue des pièces, interlocuteur officiel à contacter : ces points se confirment au cas par cas. Il n'existe pas une procédure unique pour tous les candidats sénégalais.",
    faqs: [
      {
        question: "Quel niveau faut-il pour partir ?",
        answer:
          "Les conditions dépendent du programme et de l'université. Consultez la fiche officielle du cursus.",
      },
      {
        question: "Faut-il parler chinois ?",
        answer:
          "Cela dépend de la langue du programme et des exigences annoncées par l'établissement.",
      },
      {
        question: "Une agence garantit-elle l'admission ?",
        answer:
          "Non. Une agence peut aider à préparer le dossier, mais la décision appartient à l'établissement.",
      },
    ],
    cta: "Faites analyser votre projet d'études et la liste de vos pièces avant de contacter les universités ciblées.",
    extras: ["bourses", "tarifs"],
    related: "le-mali",
  },
  {
    slug: "le-burundi",
    name: "Burundi",
    title: "Étudier en Chine depuis le Burundi : guide de candidature",
    h1: "Comment étudier en Chine depuis le Burundi ?",
    description:
      "Guide pour étudier en Chine depuis le Burundi : choix du programme, documents, vérifications officielles et préparation de candidature.",
    intro:
      "Un projet d'études en Chine se prépare à partir du parcours du candidat, du niveau visé et des exigences propres au programme. Depuis le Burundi, ce guide sert à organiser la recherche, à identifier les documents à confirmer et à distinguer l'accompagnement administratif d'une décision d'admission universitaire.",
    steps: [
      "Établir une liste restreinte de programmes compatibles avec votre diplôme, vos résultats et votre projet.",
      "Vérifier sur chaque portail officiel les conditions pour les candidats internationaux, la langue d'enseignement, les tests éventuels et le calendrier.",
      "Rassembler passeport, diplômes, relevés, CV, lettre de motivation, recommandations et justificatifs demandés par le programme.",
      "Confirmer les règles de traduction, certification, légalisation, format des photos et validité des documents.",
      "Une fois la réponse universitaire reçue, vérifier les démarches de séjour et de visa auprès des sources officielles.",
    ],
    angleTitle: "Lisibilité des documents scolaires depuis le Burundi",
    angle:
      "L'acceptation d'un relevé, d'un diplôme ou d'une traduction dépend du document et de l'établissement. La réponse se demande aux services concernés, pas à un modèle générique.",
    faqs: [
      {
        question: "Puis-je candidater à plusieurs universités ?",
        answer:
          "C'est à vérifier dans les règles de chaque programme et dans les plateformes utilisées.",
      },
      {
        question: "Quels documents sont toujours obligatoires ?",
        answer:
          "Il n'existe pas une liste universelle. Demandez la checklist officielle du cursus.",
      },
      {
        question: "L'accompagnement remplace-t-il l'université ?",
        answer:
          "Non. L'université reste la source de la décision et des exigences d'admission.",
      },
    ],
    cta: "Envoyez votre parcours et votre objectif pour une première vérification de cohérence du dossier, sans garantie de résultat.",
    extras: ["visa", "faq"],
    related: "la-rdc",
  },
  {
    slug: "haiti",
    name: "Haïti",
    title: "Étudier en Chine depuis Haïti : préparer son admission",
    h1: "Étudier en Chine depuis Haïti",
    description:
      "Préparez vos études en Chine depuis Haïti : programme, admission, documents à vérifier et démarches à confirmer auprès des sources officielles.",
    intro:
      "Vous souhaitez poursuivre vos études en Chine depuis Haïti ? Une candidature solide commence par un programme adapté et des documents vérifiés. Cette page aide à structurer les recherches et à préparer les questions à poser à l'université et aux autorités compétentes.",
    steps: [
      "Préciser le diplôme recherché, la spécialité, le niveau d'entrée et la langue d'enseignement.",
      "Lire la fiche officielle du programme : prérequis académiques, langue, tests, pièces, calendrier et procédure de dépôt.",
      "Préparer les documents demandés : identité, passeport, diplômes, relevés, CV, motivation, recommandations et attestations linguistiques si elles sont requises.",
      "Faire confirmer les traductions, certifications et éventuelles authentifications acceptées pour chaque pièce.",
      "Vérifier séparément les formalités post-admission et les conditions de séjour applicables à votre nationalité et à votre situation.",
    ],
    angleTitle: "Préparer ses questions depuis Haïti",
    angle:
      "Comment présenter un parcours scolaire ou universitaire, quelle version des documents transmettre, quel service officiel valide chaque étape : ne déduisez pas une équivalence ou une formalité sans confirmation écrite.",
    faqs: [
      {
        question: "Quel diplôme haïtien est accepté ?",
        answer:
          "La décision dépend du niveau et de l'université. Demandez l'évaluation exigée.",
      },
      {
        question: "Peut-on choisir un programme en anglais ?",
        answer:
          "Vérifiez la langue officielle du programme et les justificatifs demandés.",
      },
      {
        question: "Une bourse est-elle automatique ?",
        answer:
          "Non. Toute aide doit être identifiée et vérifiée dans une source officielle.",
      },
    ],
    cta: "Faites examiner votre projet, vos diplômes et la checklist de l'université avant tout dépôt.",
    extras: ["bourses", "blog"],
    related: "la-france",
  },
  {
    slug: "le-mali",
    name: "Mali",
    title: "Étudier en Chine depuis le Mali : étapes et documents",
    h1: "Votre projet d'études en Chine depuis le Mali",
    description:
      "Étudier en Chine depuis le Mali : choisissez votre programme, préparez les documents et vérifiez les étapes auprès de l'université.",
    intro:
      "Pour étudier en Chine depuis le Mali, reliez le projet académique aux critères précis du programme visé. Ce guide présente les principales étapes de préparation. Les règles changent selon la nationalité, l'université, le niveau et l'année.",
    steps: [
      "Comparer plusieurs cursus et vérifier leur adéquation avec vos études antérieures.",
      "Confirmer les conditions de candidature directement sur la page officielle de l'université.",
      "Préparer les pièces indiquées : identité, passeport, diplômes, relevés, CV, motivation, recommandations, projet de recherche et preuve de langue si demandés.",
      "Vérifier avec l'établissement les exigences de traduction, de certification et de présentation des relevés.",
      "Après la décision d'admission, suivre uniquement les instructions officielles concernant l'inscription, le séjour et le visa.",
    ],
    angleTitle: "Relier le parcours suivi au Mali à la formation visée",
    angle:
      "Décrivez clairement le lien entre les études déjà suivies et la formation demandée en Chine. Cette présentation reste fidèle aux documents et aux critères du programme. Elle n'annonce pas une équivalence garantie.",
    faqs: [
      {
        question: "Un diplôme malien suffit-il pour candidater ?",
        answer: "Il doit être évalué selon les exigences du programme choisi.",
      },
      {
        question: "Dois-je faire traduire toutes mes pièces ?",
        answer: "Demandez la règle applicable à chaque document.",
      },
      {
        question: "L'agence peut-elle choisir à ma place ?",
        answer:
          "Elle peut informer et accompagner. Le choix et la décision relèvent du candidat et de l'université.",
      },
    ],
    cta: "Faites vérifier votre orientation et votre dossier avant de transmettre des documents aux établissements.",
    extras: ["tarifs", "faq"],
    related: "le-burkina-faso",
  },
  {
    slug: "la-rdc",
    name: "République démocratique du Congo",
    title: "Étudier en Chine depuis la RDC : guide d'admission",
    h1: "Étudier en Chine depuis la République démocratique du Congo",
    description:
      "Guide pour étudier en Chine depuis la RDC : admission, documents scolaires, traductions et vérifications officielles.",
    intro:
      "La préparation d'une candidature depuis la République démocratique du Congo commence par une vérification précise du cursus, du niveau et des documents acceptés. Cette page sert de base pour préparer le dossier et dialoguer avec les services officiels, sans promettre d'admission ni de financement.",
    steps: [
      "Définir l'objectif : formation diplômante, spécialité, niveau et langue du programme.",
      "Vérifier l'accréditation et les conditions publiées par l'université ciblée, ainsi que la plateforme de candidature indiquée.",
      "Organiser les documents : passeport, diplômes, relevés, CV, lettre de motivation, recommandations, projet de recherche et preuve linguistique éventuelle.",
      "Faire confirmer les modalités propres aux documents délivrés en RDC : traduction, certification, légalisation ou authentification, selon la demande officielle.",
      "Vérifier ensuite les documents et délais liés au séjour auprès de l'établissement et des autorités compétentes.",
    ],
    angleTitle: "Présenter diplômes et relevés obtenus en RDC",
    angle:
      "Établissements fréquentés, intitulés de diplômes, relevés : toute question d'équivalence ou d'authentification se soumet au service qui a compétence pour y répondre. La République démocratique du Congo et la République du Congo ne se traitent pas comme un seul pays.",
    faqs: [
      {
        question: "Comment savoir si mon diplôme est recevable ?",
        answer: "Demandez une confirmation à l'université visée.",
      },
      {
        question: "Les exigences sont-elles les mêmes pour licence et master ?",
        answer: "Non nécessairement. Le niveau et le programme peuvent modifier la checklist.",
      },
      {
        question: "Peut-on promettre une bourse ?",
        answer:
          "Non. Une aide éventuelle dépend d'un dispositif et de critères officiellement publiés.",
      },
    ],
    cta: "Partagez votre niveau et votre spécialité pour préparer une liste de vérifications adaptée à vos universités cibles.",
    extras: ["bourses", "visa"],
    related: "la-republique-du-congo",
  },
  {
    slug: "la-guinee",
    name: "Guinée",
    title: "Étudier en Chine depuis la Guinée : candidature et démarches",
    h1: "Étudier en Chine depuis la Guinée",
    description:
      "Découvrez comment préparer une candidature pour étudier en Chine depuis la Guinée : étapes, documents et vérifications.",
    intro:
      "Vous préparez un projet d'études en Chine depuis la Guinée ? Partez d'un objectif précis, vérifiez les critères de chaque université et conservez une preuve des réponses officielles obtenues. Les formalités ne sont pas uniformes selon les situations.",
    steps: [
      "Choisir le domaine, le niveau, la langue et le type de programme recherchés.",
      "Contrôler les conditions d'admission et la procédure sur le site officiel de chaque établissement.",
      "Constituer les pièces requises : identité, passeport, diplômes, relevés, CV, motivation, recommandations et justificatifs linguistiques éventuels.",
      "Vérifier les exigences de format, de traduction, de certification et d'authentification avant l'envoi.",
      "Après admission, confirmer les étapes d'inscription et les formalités de séjour auprès des sources compétentes.",
    ],
    angleTitle: "Classer les pièces par niveau et par université",
    angle:
      "Une checklist de travail permet de ranger les documents par niveau d'études et par établissement. Les pièces réellement exigées se reprennent de la source officielle, pas d'un modèle générique valable pour toute la Guinée.",
    faqs: [
      {
        question: "Existe-t-il une procédure unique pour la Guinée ?",
        answer: "Non. Les exigences dépendent notamment de l'université et du programme.",
      },
      {
        question: "Quel test de langue faut-il fournir ?",
        answer: "Celui indiqué par le cursus ciblé, s'il y en a un.",
      },
      {
        question: "Quand demander de l'aide ?",
        answer: "Avant le dépôt, pour repérer les pièces manquantes et les incohérences.",
      },
    ],
    cta: "Demandez une revue de votre dossier et de vos sources avant toute candidature.",
    extras: ["faq", "blog"],
    related: "le-senegal",
  },
  {
    slug: "le-burkina-faso",
    name: "Burkina Faso",
    title: "Étudier en Chine depuis le Burkina Faso : guide pratique",
    h1: "Étudier en Chine depuis le Burkina Faso",
    description:
      "Étudier en Chine depuis le Burkina Faso : préparez votre projet, vos documents et vos vérifications auprès des universités.",
    intro:
      "Une candidature en Chine depuis le Burkina Faso se construit autour d'un programme précis et de documents contrôlés. Utilisez cette base pour planifier les démarches et identifier ce qui doit être confirmé avec l'université et les autorités officielles.",
    steps: [
      "Définir le projet et vérifier les prérequis académiques du niveau visé.",
      "Comparer les programmes et consulter leurs pages officielles, notamment la langue, les tests et les dates annoncées.",
      "Préparer passeport, diplômes, relevés, CV, motivation, recommandations et projet de recherche le cas échéant.",
      "Demander les règles applicables aux traductions, signatures, certifications, légalisations et formats numériques.",
      "Contrôler les instructions post-admission concernant l'inscription, le séjour et le visa, auprès des sources habilitées.",
    ],
    angleTitle: "Cohérence du projet, sans en faire un critère suffisant",
    angle:
      "Le lien entre le projet professionnel au Burkina Faso et la formation sollicitée aide à rédiger le dossier. Cette cohérence ne suffit pas à elle seule et ne garantit pas l'issue de la candidature.",
    faqs: [
      {
        question: "Puis-je candidater sans avoir choisi ma spécialité ?",
        answer: "Il est préférable de préciser le domaine avant de comparer les critères.",
      },
      {
        question: "Les relevés doivent-ils être traduits ?",
        answer: "Vérifiez la consigne de l'université et les autorités concernées.",
      },
      {
        question: "Un accompagnement garantit-il une place ?",
        answer: "Non. Aucune agence ne décide à la place de l'établissement.",
      },
    ],
    cta: "Faites cadrer votre projet et contrôler vos pièces avec une checklist liée aux programmes visés.",
    extras: ["tarifs", "contact"],
    related: "le-mali",
  },
  {
    slug: "le-cameroun",
    name: "Cameroun",
    title: "Étudier en Chine depuis le Cameroun : admission et documents",
    h1: "Étudier en Chine depuis le Cameroun",
    description:
      "Guide pour étudier en Chine depuis le Cameroun : admission, pièces à préparer et vérifications selon l'université.",
    intro:
      "Depuis le Cameroun, préparez le projet en vérifiant séparément les critères académiques, linguistiques et administratifs du programme choisi. Cette page sert à organiser le dossier. Elle n'est pas une garantie d'admission ou de financement.",
    steps: [
      "Identifier le niveau et le programme correspondant à votre parcours et à votre objectif.",
      "Lire les instructions officielles : prérequis, langue, tests, documents, calendrier et dépôt en ligne ou selon le canal indiqué.",
      "Préparer les pièces demandées : passeport, diplômes, relevés, CV, motivation, recommandations, projet de recherche et certificats de langue éventuels.",
      "Faire confirmer les exigences de traduction, certification, légalisation et vérification des diplômes.",
      "Vérifier les formalités applicables après admission auprès de l'université et des autorités compétentes.",
    ],
    angleTitle: "Un ordre de lecture, pas une procédure nationale",
    angle:
      "Mon niveau, mes documents, la langue du programme, puis les formalités à confirmer : cet ordre aide à lire une candidature camerounaise. Il ne décrit pas une procédure unique pour tout le Cameroun.",
    faqs: [
      {
        question: "Les conditions sont-elles identiques pour toutes les universités ?",
        answer: "Non. Chaque établissement peut fixer ses propres exigences.",
      },
      {
        question: "Quel document prouve le niveau de langue ?",
        answer: "Celui accepté par le programme ciblé, à confirmer officiellement.",
      },
      {
        question: "Une aide financière est-elle incluse ?",
        answer: "Non. Toute bourse doit faire l'objet d'une vérification séparée.",
      },
    ],
    cta: "Faites vérifier la compatibilité de votre parcours camerounais avec les programmes ciblés.",
    extras: ["visa", "bourses"],
    related: "le-togo",
  },
  {
    slug: "le-togo",
    name: "Togo",
    title: "Étudier en Chine depuis le Togo : préparer sa candidature",
    h1: "Préparer ses études en Chine depuis le Togo",
    description:
      "Étudier en Chine depuis le Togo : étapes de candidature, documents à vérifier et conseils pour un dossier organisé.",
    intro:
      "Pour construire une candidature depuis le Togo, commencez par le programme et la liste officielle des pièces. Ce guide aide à éviter les dossiers incomplets et à distinguer les informations générales des formalités à confirmer pour chaque candidat.",
    steps: [
      "Définir le diplôme, la spécialité et la langue d'enseignement recherchés.",
      "Comparer les universités et noter leurs exigences, échéances et modalités de candidature.",
      "Réunir les documents demandés : identité, passeport, diplômes, relevés, CV, motivation, recommandations et justificatifs de langue si nécessaires.",
      "Confirmer la forme des documents : traduction, certification, légalisation, authentification et transmission numérique.",
      "Suivre les instructions officielles pour l'inscription, le séjour et le visa après décision de l'université.",
    ],
    angleTitle: "Organiser le dossier depuis le Togo",
    angle:
      "Nommer les fichiers, conserver les versions originales et demander les confirmations par écrit. Ces conseils d'organisation n'impliquent aucune règle administrative commune à tous les candidats togolais.",
    faqs: [
      {
        question: "Quelle université choisir ?",
        answer:
          "Celle dont les conditions correspondent à votre profil et à votre projet. Comparez les sources officielles.",
      },
      {
        question: "Les documents en français sont-ils acceptés tels quels ?",
        answer: "Demandez la règle du programme.",
      },
      {
        question: "Peut-on déposer un dossier incomplet ?",
        answer: "Ne le supposez pas. Vérifiez les possibilités auprès du service d'admission.",
      },
    ],
    cta: "Faites contrôler vos pièces et votre calendrier avant le dépôt de candidature.",
    extras: ["visa", "contact"],
    related: "le-benin",
  },
  {
    slug: "le-benin",
    name: "Bénin",
    title: "Étudier en Chine depuis le Bénin : dossier et admission",
    h1: "Étudier en Chine depuis le Bénin",
    description:
      "Préparez vos études en Chine depuis le Bénin : choix du programme, documents et vérifications pour candidater.",
    intro:
      "Un projet d'études en Chine depuis le Bénin demande une recherche ciblée et une vérification des sources. Ces étapes aident à sélectionner un cursus, à préparer des documents cohérents et à contacter les bons interlocuteurs avant le dépôt.",
    steps: [
      "Déterminer le niveau, le domaine, la durée et la langue du cursus recherché.",
      "Vérifier les prérequis, la procédure, le calendrier et les pièces sur le site officiel de chaque université.",
      "Préparer les documents demandés, notamment identité, passeport, diplômes, relevés, CV, motivation et recommandations.",
      "Confirmer les exigences relatives aux traductions, certifications, légalisations ou authentifications.",
      "Vérifier les formalités consécutives à l'admission auprès de l'université et des autorités compétentes.",
    ],
    angleTitle: "Rendre le parcours lisible",
    angle:
      "Chronologie des études, intitulés exacts des diplômes, objectif de formation : le dossier doit être lisible. Toute interprétation de diplôme se fait valider par l'université concernée.",
    faqs: [
      {
        question: "Les candidatures se font-elles toutes en ligne ?",
        answer: "Le canal dépend du programme. Utilisez celui indiqué officiellement.",
      },
      {
        question: "Faut-il fournir un projet d'études ?",
        answer: "Seulement si le programme le demande, ou selon ses instructions.",
      },
      {
        question: "Une agence peut-elle modifier mes diplômes ?",
        answer: "Non. Les informations doivent rester exactes et vérifiables.",
      },
    ],
    cta: "Faites relire votre dossier pour vérifier sa cohérence, son exactitude et sa conformité aux instructions.",
    extras: ["tarifs", "faq"],
    related: "le-togo",
  },
  {
    slug: "la-republique-du-congo",
    name: "République du Congo",
    title: "Étudier en Chine depuis la République du Congo : guide",
    h1: "Étudier en Chine depuis la République du Congo",
    description:
      "Étudier en Chine depuis la République du Congo : guide de candidature, documents et vérifications officielles selon le programme.",
    intro:
      "Cette page s'adresse aux candidats de la République du Congo qui préparent un projet d'études en Chine. Elle propose une méthode pour vérifier l'adéquation du programme, les documents requis et les formalités à confirmer, sans confondre accompagnement et décision universitaire.",
    steps: [
      "Clarifier le niveau d'études, la discipline, la langue du programme et le projet professionnel.",
      "Vérifier auprès de chaque université les conditions d'accès, échéances, tests et modalités de candidature.",
      "Préparer les pièces demandées : passeport, diplômes, relevés, CV, motivation, recommandations et projet de recherche si applicable.",
      "Faire confirmer la nécessité de traductions, certifications, légalisations ou authentifications.",
      "Suivre les instructions officielles après admission pour l'inscription et les démarches de séjour.",
    ],
    angleTitle: "Ne pas confondre la République du Congo et la RDC",
    angle:
      "Les formulaires, les URL et les demandes de pièces doivent porter l'intitulé exact du pays et des documents. La nationalité déclarée et le pays de délivrance des diplômes se vérifient sur les pièces, sans les regrouper avec la République démocratique du Congo.",
    faqs: [
      {
        question: "La République du Congo et la RDC suivent-elles la même procédure ?",
        answer:
          "Il ne faut pas le supposer. Vérifiez selon la nationalité et le dossier concernés.",
      },
      {
        question: "Puis-je utiliser une même lettre pour tous les programmes ?",
        answer: "Adaptez-la aux exigences et au projet de chaque candidature.",
      },
      {
        question: "Les frais sont-ils les mêmes partout ?",
        answer: "Ne vous fiez à aucun montant sans source officielle et à jour.",
      },
    ],
    cta: "Faites vérifier votre dossier et vos informations d'état civil avant de candidater.",
    extras: ["visa", "faq"],
    related: "la-rdc",
  },
  {
    slug: "la-france",
    name: "France",
    title: "Étudier en Chine depuis la France : admissions et démarches",
    h1: "Étudier en Chine depuis la France",
    description:
      "Étudier en Chine depuis la France : préparez votre candidature selon votre nationalité, votre niveau, vos diplômes et l'université visée.",
    intro:
      "Un candidat qui réside en France distingue son pays de résidence, sa nationalité et les documents de son parcours lorsqu'il prépare des études en Chine. Cette page aide à organiser une candidature internationale en vérifiant les règles propres au programme et à la situation administrative.",
    steps: [
      "Préciser votre nationalité, votre lieu de résidence, votre niveau et le diplôme visé.",
      "Vérifier les exigences de l'université : prérequis, langue, tests, calendrier et procédure pour candidats internationaux.",
      "Préparer passeport, diplômes, relevés, CV, motivation, recommandations et justificatifs demandés.",
      "Demander quelles traductions, certifications ou authentifications sont nécessaires pour les diplômes obtenus en France ou ailleurs.",
      "Vérifier séparément les formalités de séjour et de visa en fonction de la nationalité déclarée et des instructions officielles.",
    ],
    angleTitle: "Résidence en France et nationalité ne sont pas la même chose",
    angle:
      "« Depuis la France » ne signifie pas automatiquement « de nationalité française ». Le parcours scolaire, le pays de délivrance des diplômes et la nationalité peuvent entraîner des vérifications différentes.",
    faqs: [
      {
        question: "Résider en France suffit-il pour appliquer les mêmes règles qu'un Français ?",
        answer:
          "Ne le supposez pas. Vérifiez selon votre nationalité et les instructions officielles.",
      },
      {
        question: "Les diplômes français sont-ils automatiquement reconnus ?",
        answer: "La recevabilité relève de l'université et du programme.",
      },
      {
        question: "Puis-je candidater en français ?",
        answer: "Utilisez la langue et les formats demandés par l'établissement.",
      },
    ],
    cta: "Faites analyser votre situation — nationalité, résidence et diplômes — avant de sélectionner les procédures à suivre.",
    extras: ["tarifs", "blog"],
    related: "le-maroc",
  },
  {
    slug: "le-maroc",
    name: "Maroc",
    title: "Étudier en Chine depuis le Maroc : guide de candidature",
    h1: "Étudier en Chine depuis le Maroc",
    description:
      "Étudier en Chine depuis le Maroc : étapes, documents, langue et vérifications officielles pour préparer votre candidature.",
    intro:
      "Depuis le Maroc, préparez le projet en vérifiant la compatibilité du parcours avec le programme visé. Ce guide structure les étapes et signale les éléments que l'université ou les autorités officielles doivent confirmer.",
    steps: [
      "Choisir le niveau, le domaine et la langue d'enseignement correspondant au projet.",
      "Examiner les conditions officielles : diplôme requis, résultats, langue, tests, échéances et procédure.",
      "Réunir les documents demandés : passeport, diplômes, relevés, CV, motivation, recommandations et pièces linguistiques éventuelles.",
      "Confirmer les règles de traduction, certification, légalisation ou authentification des documents délivrés au Maroc.",
      "Vérifier les démarches post-admission et les règles de séjour applicables à votre situation.",
    ],
    angleTitle: "Intitulés de diplômes, sans équivalence automatique",
    angle:
      "Comparer un intitulé marocain et un niveau d'entrée chinois aide à préparer les questions. L'université confirme l'admissibilité du parcours et les pièces acceptées. Rien n'est équivalent automatiquement.",
    faqs: [
      {
        question: "Comment vérifier l'équivalence de mon diplôme ?",
        answer: "Demandez la procédure officielle de l'établissement visé.",
      },
      {
        question: "Quel justificatif linguistique fournir ?",
        answer: "Celui explicitement accepté pour le programme.",
      },
      {
        question: "Une bourse est-elle incluse dans l'accompagnement ?",
        answer:
          "Non. Les dispositifs d'aide et leurs critères se vérifient séparément.",
      },
    ],
    cta: "Faites examiner vos diplômes et votre sélection de programmes avant le dépôt.",
    extras: ["langue", "tarifs"],
    related: "l-algerie",
  },
  {
    slug: "l-algerie",
    name: "Algérie",
    title: "Étudier en Chine depuis l'Algérie : admission et dossier",
    h1: "Étudier en Chine depuis l'Algérie",
    description:
      "Préparez vos études en Chine depuis l'Algérie : admission, documents, traductions et formalités à vérifier officiellement.",
    intro:
      "Pour préparer des études en Chine depuis l'Algérie, partez d'un programme clairement identifié et de la checklist publiée par l'université. Les documents et formalités peuvent varier selon la nationalité, le niveau, l'établissement d'origine et l'année de candidature.",
    steps: [
      "Définir la formation, le niveau et la langue souhaités.",
      "Vérifier auprès de chaque université les prérequis, tests, dates et modalités de candidature.",
      "Préparer les pièces demandées : passeport, diplômes, relevés, CV, lettre de motivation, recommandations et projet de recherche le cas échéant.",
      "Confirmer les traductions, certifications, légalisations ou authentifications nécessaires pour chaque document algérien ou étranger.",
      "Après admission, vérifier les instructions officielles relatives à l'inscription et au séjour.",
    ],
    angleTitle: "Suivre chaque pièce et sa source de confirmation",
    angle:
      "Document original, traduction, certification demandée, source de confirmation : ce suivi aide à ne pas traiter une formalité comme obligatoire dans tous les cas. La règle se lit sur la checklist du programme.",
    faqs: [
      {
        question: "Dois-je traduire mes diplômes ?",
        answer: "Demandez la règle au programme et à l'autorité compétente.",
      },
      {
        question: "Les conditions changent-elles selon le niveau ?",
        answer: "Oui. Elles peuvent différer entre les cycles et les spécialités.",
      },
      {
        question: "L'agence peut-elle garantir un visa ?",
        answer: "Non. La décision dépend des autorités compétentes.",
      },
    ],
    cta: "Faites vérifier la liste de vos pièces et les sources associées avant toute transmission.",
    extras: ["visa", "contact"],
    related: "la-tunisie",
  },
  {
    slug: "la-tunisie",
    name: "Tunisie",
    title: "Étudier en Chine depuis la Tunisie : guide de candidature",
    h1: "Étudier en Chine depuis la Tunisie",
    description:
      "Étudier en Chine depuis la Tunisie : choisissez un programme, préparez vos documents et vérifiez les formalités officielles.",
    intro:
      "Vous êtes en Tunisie et souhaitez construire un projet d'études en Chine ? La démarche consiste à cibler les programmes, à vérifier la recevabilité du parcours et à préparer les pièces demandées. Les informations se confirment pour l'année et l'université concernées.",
    steps: [
      "Déterminer le niveau, la spécialité, la langue d'études et l'objectif.",
      "Comparer les programmes et consulter les pages officielles consacrées aux candidats internationaux.",
      "Réunir passeport, diplômes, relevés, CV, motivation, recommandations, projet de recherche et justificatifs de langue si demandés.",
      "Vérifier les consignes relatives aux traductions, certifications, légalisations, authentifications et formats de dépôt.",
      "Après la décision universitaire, contrôler les formalités d'inscription, de séjour et de visa auprès des sources officielles.",
    ],
    angleTitle: "Parcours académique, résidence et nationalité",
    angle:
      "Les documents du parcours tunisien ne se confondent pas avec les pièces liées à la résidence ou à la nationalité. Cette distinction se vérifie avec l'établissement et les autorités concernées, sans extrapolation.",
    faqs: [
      {
        question: "Quel parcours permet d'intégrer une université chinoise ?",
        answer: "Cela dépend du programme, du niveau et des critères publiés.",
      },
      {
        question: "Puis-je envoyer des copies non certifiées ?",
        answer: "Vérifiez la checklist officielle avant tout dépôt.",
      },
      {
        question: "Une agence promet-elle une admission ?",
        answer:
          "Non. Elle peut accompagner la préparation, mais l'université décide.",
      },
    ],
    cta: "Faites valider votre stratégie de candidature et votre liste de pièces avant de déposer le dossier.",
    extras: ["bourses", "langue"],
    related: "le-maroc",
  },
];

export function studyCountryPath(slug: string) {
  return `/etudier-en-chine-depuis-${slug}`;
}

export function getStudyCountry(slug: string) {
  return STUDY_COUNTRIES.find((country) => country.slug === slug) || null;
}

export function studyCountryLinks(country: StudyCountry): StudyLink[] {
  const keys: LinkKey[] = ["guide", "langue", "processus", "projet", ...country.extras];
  const seen = new Set<string>();
  const links: StudyLink[] = [];
  for (const key of keys) {
    const link = LINK[key];
    if (seen.has(link.href)) continue;
    seen.add(link.href);
    links.push(link);
  }
  links.push({ href: STUDY_FROM_HUB_PATH, label: "Toutes les pages par pays" });
  const related = getStudyCountry(country.related);
  if (related) {
    links.push({
      href: studyCountryPath(related.slug),
      label: related.h1,
    });
  }
  return links;
}

export function studySitemapRoutes() {
  return [
    {
      path: STUDY_FROM_HUB_PATH,
      changeFrequency: "monthly" as const,
      priority: 0.8,
    },
    ...STUDY_COUNTRIES.map((country) => ({
      path: studyCountryPath(country.slug),
      changeFrequency: "monthly" as const,
      priority: 0.7,
    })),
  ];
}
