export type GuideBlock = {
  title: string;
  text: string;
};

export type GuideSectionCopy = {
  id: string;
  title: string;
  paragraphs: string[];
  caption: string;
};

export type StudentSpaceGuideCopy = {
  badge: string;
  title: string;
  intro: string;
  tocLabel: string;
  example: string;
  arrivalTitle: string;
  arrivalIntro: string;
  arrivalBlocks: GuideBlock[];
  arrivalNote: string;
  sections: GuideSectionCopy[];
};

const fr: StudentSpaceGuideCopy = {
  badge: "Guide",
  title: "Comment utiliser l'espace étudiant",
  intro:
    "Cette page reprend chaque écran de l'espace, dans l'ordre où vous le verrez après connexion. Les aperçus sont des exemples : ils ne montrent pas votre dossier.",
  tocLabel: "Sommaire",
  example: "Exemple",
  arrivalTitle: "Préparer son arrivée en Chine",
  arrivalIntro:
    "À faire avant l'avion. WeChat, Alipay et un VPN s'installent chez vous : une fois en Chine, les téléchargements et les sites de ces services sont souvent inaccessibles.",
  arrivalBlocks: [
    {
      title: "Avant de partir",
      text: "Gardez l'espace étudiant à jour (passeport et pièces déjà déposés). Prévenez votre banque que la carte étrangère servira en Chine. Prévoyez un peu d'espèces pour les premiers jours, le temps que les applications de paiement soient actives.",
    },
    {
      title: "Télécharger et installer WeChat",
      text: "WeChat (微信) est l'application du quotidien : groupes de classe, messages avec l'équipe, et souvent le paiement une fois une carte chinoise liée. Téléchargez-la depuis l'App Store ou Google Play, éditeur Tencent, avant le départ. Créez le compte avec le numéro que vous garderez. Les numéros étrangers passent, mais le SMS de confirmation rate parfois : recommencez chez vous, avec du réseau. Un compte neuf doit souvent être validé par quelqu'un qui a déjà WeChat, via un QR code. Demandez ce scan à l'équipe ou à une connaissance avant de partir. Écrivez votre nom en lettres latines et mettez une photo reconnaissable. L'équipe vous enverra son identifiant WeChat à part.",
    },
    {
      title: "Télécharger et installer Alipay",
      text: "Alipay (支付宝, éditeur Ant Group) sert à payer les repas, le métro et les courses. Installez-la avant le départ. Inscrivez-vous avec votre numéro, puis faites reconnaître votre passeport. Le libellé dans l'application change (version internationale, Tour Pass, lier une carte) : l'objectif est le même. Après cette vérification, Alipay permet souvent de lier une carte Visa ou Mastercard étrangère. Tous les commerçants et tous les frais d'école ne l'acceptent pas. Une carte bancaire chinoise, ouverte sur place avec le passeport et un justificatif de résidence, reste le moyen le plus stable.",
    },
    {
      title: "Installer un VPN pour les services internationaux",
      text: "Sur le réseau chinois, Gmail, Google, WhatsApp, Instagram et certains portails universitaires étrangers ne s'ouvrent pas. Installez et testez un VPN payant avant l'avion : les sites des fournisseurs deviennent difficiles à joindre une fois sur place, et un VPN gratuit ne tient en général pas. Des services souvent utilisés par les étudiants : LetsVPN, Astrill, ExpressVPN. Aucun n'est garanti. Chinois en Devenir ne vend pas de VPN et ne promet pas qu'il marchera sur le Wi-Fi du campus. Créez le compte, installez l'application sur le téléphone et sur l'ordinateur, connectez-vous une fois depuis chez vous, puis déconnectez. Notez l'identifiant hors de l'application. Sur place : ouvrez le VPN, connectez-vous, et seulement ensuite Gmail ou WhatsApp. Si le Wi-Fi de l'université bloque, essayez les données mobiles. Téléchargez aussi, avant le départ, les PDF utiles (admission, billet, copie du passeport) et un plan hors ligne.",
    },
    {
      title: "Les premiers jours sur place",
      text: "Une carte SIM chinoise, achetée avec le passeport, débloque souvent les SMS de WeChat et d'Alipay. Gardez le VPN déjà installé : ne comptez pas le télécharger à l'arrivée. L'ouverture d'un compte WeChat, Alipay ou bancaire dépend de ces services, pas de l'agence.",
    },
  ],
  arrivalNote:
    "Ce guide décrit des démarches pratiques. Il ne garantit ni l'admission, ni le visa, ni l'ouverture d'un compte WeChat, Alipay ou bancaire, ni l'accès à un service international. Les décisions appartiennent aux établissements, aux autorités et aux plateformes concernées.",
  sections: [
    {
      id: "compte",
      title: "Créer un compte et se connecter",
      paragraphs: [
        "Ouvrez la page Connexion. Deux onglets : Connexion et Créer un compte. Utilisez la même adresse email que sur le formulaire de projet. Le mot de passe fait au moins 8 caractères ; sur l'onglet création, il faut le saisir une seconde fois.",
        "Le compte est actif tout de suite : aucun email de confirmation n'est envoyé. Si un compte existe déjà, connectez-vous. Mot de passe oublié : le lien sur la même page envoie un email seulement si un dossier existe avec cette adresse.",
        "La création est refusée si cette adresse n'est pas déjà dans un dossier. Dans ce cas, répondez à l'email de l'équipe ou remplissez le formulaire du site avec la même adresse.",
      ],
      caption: "Page de connexion : onglet Créer un compte, même email que le formulaire.",
    },
    {
      id: "informations",
      title: "Mes informations",
      paragraphs: [
        "Une fois le dossier ouvert, le formulaire « Mes informations » reprend le prénom, le nom, le téléphone, le pays, le diplôme, le domaine, le budget et la rentrée. Corrigez ce qui a changé, puis enregistrez.",
        "L'adresse email est affichée mais bloquée : c'est elle qui relie le compte au dossier. Pour la changer, écrivez à l'équipe.",
        "Si aucun dossier ne correspond encore à l'email, l'espace affiche d'abord « Complétez votre projet ». Remplissez ce formulaire avec l'adresse du compte.",
      ],
      caption: "Les champs se modifient ici. L'email reste celui du compte.",
    },
    {
      id: "formule",
      title: "Formule et suivi des paiements",
      paragraphs: [
        "Sans formule choisie, l'espace s'arrête sur les trois accompagnements. Le choix n'est pas un paiement : l'équipe vous recontacte pour valider, puis le règlement se fait selon le contrat.",
        "Dès qu'une formule est enregistrée, le bandeau « Votre accompagnement » s'affiche. Le suivi des paiements est placé juste sous les formules tant que vous pouvez encore en changer, et juste sous ce bandeau une fois l'accompagnement validé. Trois échéances : 40 % à l'ouverture du dossier, 30 % au dépôt de la candidature, puis le solde à la confirmation (ou 10 jours après le dépôt). L'équipe coche chaque échéance après réception. Vous voyez le montant déjà payé, le reste à payer, et l'état de chaque échéance. Vous ne pouvez pas modifier ces cases.",
        "Le paiement en ligne n'est pas encore disponible sur le site. Tant que l'accompagnement n'est pas validé, vous pouvez encore changer de formule.",
      ],
      caption:
        "Exemple pour une formule à 1 700 €, première échéance déjà reçue. Votre montant dépend de la formule choisie.",
    },
    {
      id: "avancement",
      title: "Avancement du dossier",
      paragraphs: [
        "Quand l'accompagnement est validé, une frise indique l'étape en cours. Les étapes déjà passées portent une coche. Le nombre d'étapes dépend de la formule : une année de langue n'affiche pas le même parcours qu'une admission universitaire.",
        "L'étape affichée suit le statut tenu par l'équipe. Vous ne la faites pas avancer vous-même.",
      ],
      caption: "L'étape en cours est encadrée. Les précédentes sont cochées.",
    },
    {
      id: "orientation",
      title: "Orientation",
      paragraphs: [
        "Le compte rendu d'orientation (universités ou école de langue, selon la formule) apparaît ici quand l'équipe l'a préparé. Tant qu'il n'est pas prêt, un message l'indique. Rien à déposer dans ce bloc : il se lit.",
        "Les établissements proposés sont une orientation, pas une promesse d'admission.",
      ],
      caption: "Le compte rendu s'affiche tel que l'équipe l'a rédigé.",
    },
    {
      id: "documents",
      title: "Documents à fournir",
      paragraphs: [
        "La liste dépend du niveau (bac, licence, master) et du compte rendu. Chaque ligne est « Manquant » ou « Reçu ». Choisissez un fichier PDF, JPG ou PNG (10 Mo maximum), puis Envoyer. Un fichier déjà reçu se remplace ou se télécharge.",
        "Un second bloc, « Documents fournis par Chinois en Devenir », regroupe les fichiers que l'équipe dépose pour vous (lettres, modèles). Téléchargez-les depuis cette liste. S'il est vide, rien n'a encore été ajouté.",
      ],
      caption: "Déposez la pièce sur la ligne correspondante. Le badge passe à Reçu après envoi.",
    },
    {
      id: "visa",
      title: "Documents pour le visa",
      paragraphs: [
        "Sous les documents du dossier, le bloc visa rappelle le type de visa selon la durée du séjour : X1 au-delà de 180 jours, X2 en dessous, L pour un programme court d'été ou d'hiver. La liste indique le passeport, la photo, le formulaire, la preuve de séjour, la lettre d'admission, et le JW201 ou JW202 pour le X1.",
        "Les autorités peuvent demander d'autres pièces. La délivrance du visa ne dépend pas de l'agence.",
      ],
      caption: "Aide-mémoire. Les originaux se préparent en plus des fichiers déposés dans l'espace.",
    },
  ],
};

const en: StudentSpaceGuideCopy = {
  badge: "Guide",
  title: "How to use the student space",
  intro:
    "This page walks through each screen of the space, in the order you see after signing in. The previews are examples: they are not your file.",
  tocLabel: "Contents",
  example: "Example",
  arrivalTitle: "Prepare your arrival in China",
  arrivalIntro:
    "Do this before the flight. WeChat, Alipay, and a VPN are installed at home: once in China, the downloads and the providers' websites are often unreachable.",
  arrivalBlocks: [
    {
      title: "Before you leave",
      text: "Keep the student space up to date (passport and documents already uploaded). Tell your bank the foreign card will be used in China. Keep some cash for the first days, until the payment apps are active.",
    },
    {
      title: "Download and install WeChat",
      text: "WeChat (微信) is the everyday app: class groups, messages with the team, and often payments once a Chinese card is linked. Download it from the App Store or Google Play, publisher Tencent, before departure. Create the account with the number you will keep. Foreign numbers work, but the confirmation SMS sometimes fails: try again at home, with a signal. A new account often has to be approved by someone who already uses WeChat, via a QR code. Ask the team or someone you know for that scan before you leave. Write your name in Latin letters and add a recognizable photo. The team will send its WeChat ID separately.",
    },
    {
      title: "Download and install Alipay",
      text: "Alipay (支付宝, publisher Ant Group) pays for meals, the metro, and shops. Install it before departure. Register with your number, then verify your passport. The label in the app changes (international version, Tour Pass, link a card): the goal is the same. After that check, Alipay often lets you link a foreign Visa or Mastercard. Not every shop or university fee accepts it. A Chinese bank card, opened on site with your passport and proof of residence, is the more stable option.",
    },
    {
      title: "Install a VPN for international services",
      text: "On the Chinese network, Gmail, Google, WhatsApp, Instagram, and some foreign university portals do not open. Install and test a paid VPN before the flight: provider websites become hard to reach once you land, and a free VPN usually fails. Services students often use: LetsVPN, Astrill, ExpressVPN. None is guaranteed. Chinois en Devenir does not sell a VPN and does not promise it will work on campus Wi-Fi. Create the account, install the app on your phone and computer, connect once from home, then disconnect. Write the login down outside the app. On site: open the VPN, connect, and only then open Gmail or WhatsApp. If the university Wi-Fi blocks it, try mobile data. Also download useful PDFs (admission, ticket, passport copy) and an offline map before you leave.",
    },
    {
      title: "The first days on site",
      text: "A Chinese SIM, bought with your passport, often unlocks WeChat and Alipay SMS codes. Keep the VPN already installed: do not plan to download it on arrival. Opening a WeChat, Alipay, or bank account depends on those services, not on the agency.",
    },
  ],
  arrivalNote:
    "This guide describes practical steps. It does not guarantee admission, a visa, a WeChat, Alipay, or bank account, or access to an international service. Those decisions belong to the institutions, the authorities, and the platforms concerned.",
  sections: [
    {
      id: "compte",
      title: "Create an account and sign in",
      paragraphs: [
        "Open the sign-in page. Two tabs: Sign in and Create an account. Use the same email address as on the project form. The password is at least 8 characters; on the create tab, type it a second time.",
        "The account is active immediately: no confirmation email is sent. If an account already exists, sign in. Forgot password: the link on the same page sends an email only if a file exists for that address.",
        "Creation is refused if this address is not already in a file. In that case, reply to the team's email or complete the site form with the same address.",
      ],
      caption: "Sign-in page: Create an account tab, same email as the form.",
    },
    {
      id: "informations",
      title: "My information",
      paragraphs: [
        "Once the file is open, “My information” shows first name, last name, phone, country, diploma, field, budget, and intake. Correct what changed, then save.",
        "The email is shown but locked: it links the account to the file. To change it, write to the team.",
        "If no file matches the email yet, the space first shows “Complete your project”. Fill that form with the account address.",
      ],
      caption: "Fields are edited here. The email stays the account address.",
    },
    {
      id: "formule",
      title: "Plan and payment tracking",
      paragraphs: [
        "Without a chosen plan, the space stops on the three packages. Choosing is not a payment: the team contacts you to confirm, then payment follows the contract.",
        "As soon as a plan is saved, the “Your support” banner appears. Payment tracking sits just under the plans while you can still change, and just under that banner once support is confirmed. Three installments: 40% when the file opens, 30% when the application is submitted, then the balance on confirmation (or 10 days after submission). The team marks each installment after it is received. You see the amount already paid, the amount left, and the status of each installment. You cannot edit those boxes.",
        "Online payment is not available on the site yet. Until support is confirmed, you can still change plan.",
      ],
      caption:
        "Example for a €1,700 plan, first installment already received. Your amount depends on the plan you chose.",
    },
    {
      id: "avancement",
      title: "File progress",
      paragraphs: [
        "Once support is confirmed, a timeline shows the current step. Completed steps have a check. The number of steps depends on the plan: a language year does not show the same path as a university admission.",
        "The step shown follows the status kept by the team. You do not move it yourself.",
      ],
      caption: "The current step is highlighted. Earlier ones are checked.",
    },
    {
      id: "orientation",
      title: "Orientation",
      paragraphs: [
        "The orientation report (universities or language school, depending on the plan) appears here when the team has prepared it. Until then, a message says so. Nothing to upload in this block: you read it.",
        "The institutions listed are guidance, not a promise of admission.",
      ],
      caption: "The report appears as the team wrote it.",
    },
    {
      id: "documents",
      title: "Documents to provide",
      paragraphs: [
        "The list depends on your level (high school, bachelor, master) and on the report. Each row is “Missing” or “Received”. Choose a PDF, JPG, or PNG (10 MB maximum), then Send. A file already received can be replaced or downloaded.",
        "A second block, “Documents provided by Chinois en Devenir”, lists files the team uploads for you (letters, templates). Download them from that list. If it is empty, nothing has been added yet.",
      ],
      caption: "Upload the file on the matching row. The badge switches to Received after sending.",
    },
    {
      id: "visa",
      title: "Visa documents",
      paragraphs: [
        "Under the file documents, the visa block recalls the visa type by length of stay: X1 beyond 180 days, X2 below, L for a short summer or winter program. The list includes the passport, photo, form, proof of stay, admission letter, and JW201 or JW202 for the X1.",
        "Authorities may ask for other items. Issuing the visa does not depend on the agency.",
      ],
      caption: "Checklist. Originals are prepared in addition to files uploaded in the space.",
    },
  ],
};

export function getStudentSpaceGuide(lang: string): StudentSpaceGuideCopy {
  return lang === "en" ? en : fr;
}
