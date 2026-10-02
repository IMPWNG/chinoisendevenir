import { generateCustomEmailHtml, SITE_URL } from "./emailLayout";
import { displayFormulePrice, localizeFormules } from "./formules";

export type EmailTemplateDraft = {
  subject: string;
  title: string;
  subtitle: string;
  body: string;
};

export const CARD_EMAIL_TEMPLATE_KEYS = [
  "ouverture_printemps",
  "formules_presentation",
  "espace_etudiant",
  "relance_formules",
  "relance_1",
  "relance_2",
  "reponse_bourses",
  "reponse_visa",
  "reponse_langue",
  "reponse_admission",
  "reponse_processus",
  "reponse_general",
] as const;

export const BULK_EMAIL_TEMPLATE_KEYS = [
  "ouverture_printemps",
  "formules_presentation",
  "relance_formules",
  "relance_1",
  "relance_2",
] as const;

export type CardEmailTemplateKey = (typeof CARD_EMAIL_TEMPLATE_KEYS)[number];

export function formuleChoiceLines() {
  return localizeFormules()
    .map(
      (formule) =>
        `${formule.number} — ${formule.title} : ${displayFormulePrice(formule)}`,
    )
    .join("\n");
}

function printempsBody() {
  return [
    "La période d'ouverture des candidatures pour la rentrée de printemps commence en octobre, novembre et décembre.",
    "Si vous souhaitez étudier en Chine, pour un programme universitaire ou une école de langue, c'est le bon moment pour ouvrir votre dossier.",
    "Pour cela, choisissez parmi nos trois formules d'accompagnement. Cette étape n'engage à rien : aucun paiement n'est demandé. Elle nous sert seulement à mieux comprendre votre besoin.",
    formuleChoiceLines(),
    "Répondez à cet e-mail avec le numéro de la formule. Une fois votre choix indiqué, nous vous appellerons pour faire le point sur votre dossier et avancer dans les meilleurs délais.",
    "Ne perdez pas de temps si vous souhaitez étudier en Chine.",
  ].join("\n\n");
}

function espaceEtudiantBody() {
  const guide = `${SITE_URL}espace-etudiant/guide`;
  const login = `${SITE_URL}espace-etudiant/connexion`;
  return [
    "Vous avez choisi une formule d'accompagnement. Le suivi du dossier se fait dans l'espace étudiant.",
    "Créer le compte :",
    `1. Ouvrez ${login}`,
    "2. Choisissez l'onglet « Créer un compte ».",
    "3. Utilisez la même adresse email que sur le formulaire de projet.",
    "4. Choisissez un mot de passe d'au moins 8 caractères, puis confirmez-le.",
    "Le compte est actif tout de suite. S'il existe déjà, connectez-vous. Mot de passe oublié : le lien sur la même page. La création est refusée si cette adresse n'est pas déjà dans un dossier : répondez à cet email dans ce cas.",
    "Une fois connecté :",
    "— Vos informations se corrigent dans l'espace. L'email du compte ne se change pas ici.",
    "— La formule choisie s'affiche en haut. Le suivi est juste en dessous : déjà payé, reste à payer, et les trois échéances (40 %, 30 %, puis le solde). L'équipe met à jour ce suivi après chaque règlement.",
    "— L'avancement du dossier et l'orientation apparaissent quand l'accompagnement est validé.",
    "— Les documents se déposent au format PDF, JPG ou PNG (10 Mo maximum). Un second bloc permet de télécharger les fichiers envoyés par l'équipe.",
    "— Le bloc visa liste les pièces selon la durée du séjour (X1, X2 ou L).",
    "— Après le visa : préparer l'arrivée en Chine (WeChat, Alipay, et un VPN à installer avant le départ pour Gmail, WhatsApp et les autres services internationaux).",
    `Le guide illustré, écran par écran : ${guide}`,
    "Nous ne garantissons pas une admission, une bourse, un visa, un logement, ni l'ouverture d'un compte WeChat, Alipay ou bancaire. Les décisions appartiennent aux établissements, aux autorités et aux plateformes concernées.",
  ].join("\n\n");
}

function formulesBody() {
  return [
    "Merci pour l'intérêt que vous portez à Chinois en Devenir et pour votre projet d'études en Chine.",
    "Ces formules nous aident à comprendre votre besoin. Votre choix n'est pas un engagement, et aucun paiement n'est demandé à cette étape.",
    formuleChoiceLines(),
    "Répondez à cet e-mail avec le numéro de la formule. Nous reviendrons ensuite vers vous pour un appel.",
    "Nous ne pouvons pas garantir une admission, une bourse, un visa ou un logement. Les décisions finales appartiennent aux établissements et aux autorités concernées.",
  ].join("\n\n");
}

const DRAFTS: Record<CardEmailTemplateKey, Omit<EmailTemplateDraft, "body"> & { body: () => string }> = {
  ouverture_printemps: {
    subject: "Rentrée de printemps — candidatures d'octobre à décembre",
    title: "Candidatures de printemps",
    subtitle: "Octobre, novembre et décembre",
    body: printempsBody,
  },
  formules_presentation: {
    subject: "Nos formules d'accompagnement pour étudier en Chine",
    title: "Nos formules d'accompagnement",
    subtitle: "Pour étudier en Chine",
    body: formulesBody,
  },
  espace_etudiant: {
    subject: "Votre espace étudiant — créer votre compte et suivre le dossier",
    title: "Votre espace étudiant",
    subtitle: "Compte, paiements, documents et départ",
    body: espaceEtudiantBody,
  },
  relance_formules: {
    subject: "Avez-vous choisi votre formule d'accompagnement ?",
    title: "Avez-vous choisi votre formule ?",
    subtitle: "Nous relançons votre dossier",
    body: () =>
      [
        "Nous vous avions présenté nos formules d'accompagnement pour étudier en Chine, et nous n'avons pas encore reçu votre retour.",
        "Si votre projet est toujours d'actualité, répondez à cet e-mail en indiquant la formule qui vous correspond le mieux. Nous pourrons ensuite placer un appel pour faire le point sur votre dossier.",
        formuleChoiceLines(),
        "Si vous avez des questions avant de choisir, répondez à cet e-mail.",
      ].join("\n\n"),
  },
  relance_1: {
    subject: "Votre projet d'études en Chine — formulaire à compléter",
    title: "Votre projet d'études en Chine",
    subtitle: "Compléter votre dossier",
    body: () =>
      [
        "Vous nous avez récemment contactés au sujet de votre projet d'études en Chine.",
        "Afin d'étudier votre profil, nous vous invitons à renseigner le formulaire sur notre site. Ces informations nous permettent d'identifier les formations et universités les plus adaptées.",
        `Formulaire : ${SITE_URL}`,
        "Si vous avez déjà transmis ces informations, répondez simplement à cet e-mail pour nous le confirmer.",
      ].join("\n\n"),
  },
  relance_2: {
    subject: "Votre projet d'études en Chine est-il toujours d'actualité ?",
    title: "Votre projet d'études en Chine",
    subtitle: "Confirmation d'intérêt",
    body: () =>
      [
        "Vous nous avez contactés il y a quelque temps concernant un projet d'études en Chine.",
        "Nous souhaitons simplement savoir si cette démarche est toujours d'actualité.",
        'Si oui, répondez à cet e-mail par : Oui',
        "Nous reviendrons ensuite vers vous pour les prochaines étapes. Si le projet n'est plus d'actualité, vous pouvez également nous l'indiquer.",
      ].join("\n\n"),
  },
  reponse_bourses: {
    subject: "Bourses d'études en Chine — ce qu'il faut savoir",
    title: "Bourses d'études en Chine",
    subtitle: "Ce qu'il faut savoir",
    body: () =>
      [
        "Les bourses en Chine dépendent des universités et des organismes concernés. Aucune bourse n'est garantie.",
        "Nous pouvons vous aider à identifier les pistes réalistes selon votre profil, puis à préparer un dossier cohérent.",
        `Plus de détail : ${SITE_URL}bourses`,
      ].join("\n\n"),
  },
  reponse_visa: {
    subject: "Visa étudiant pour la Chine — les étapes à connaître",
    title: "Visa étudiant pour la Chine",
    subtitle: "Les étapes à connaître",
    body: () =>
      [
        "Le visa étudiant est délivré par les autorités compétentes. Nous vous aidons à préparer et vérifier les documents, sans garantir la délivrance.",
        `Plus de détail : ${SITE_URL}visa-etudiant-chine`,
      ].join("\n\n"),
  },
  reponse_langue: {
    subject: "Année de chinois en Chine — un premier pas réaliste",
    title: "Année de chinois en Chine",
    subtitle: "Un premier pas réaliste",
    body: () =>
      [
        "Une année de chinois en école de langue est souvent le premier pas le plus réaliste, surtout sans diplôme universitaire encore en poche.",
        `Plus de détail : ${SITE_URL}ecoles-de-langue-chine`,
      ].join("\n\n"),
  },
  reponse_admission: {
    subject: "Admission en université chinoise — dossier et délais",
    title: "Admission en université chinoise",
    subtitle: "Dossier et délais",
    body: () =>
      [
        "L'admission dépend de l'université. Nous vous aidons à constituer un dossier cohérent et à respecter les calendriers, sans garantir le résultat.",
        `Plus de détail : ${SITE_URL}etudier-en-chine`,
      ].join("\n\n"),
  },
  reponse_processus: {
    subject: "Étudier en Chine — les étapes et le calendrier",
    title: "Étudier en Chine",
    subtitle: "Les étapes et le calendrier",
    body: () =>
      [
        "Le parcours type : orientation, constitution du dossier, candidature, puis visa si une inscription est confirmée.",
        `Plus de détail : ${SITE_URL}processus`,
      ].join("\n\n"),
  },
  reponse_general: {
    subject: "Votre projet d'études en Chine — nous avons bien reçu votre message",
    title: "Votre projet d'études en Chine",
    subtitle: "Nous avons bien reçu votre message",
    body: () =>
      [
        "Merci pour votre message. Nous avons bien reçu votre demande concernant un projet d'études en Chine.",
        `Pour étudier votre profil, complétez le formulaire : ${SITE_URL}`,
      ].join("\n\n"),
  },
};

export function isCardEmailTemplateKey(value: string): value is CardEmailTemplateKey {
  return (CARD_EMAIL_TEMPLATE_KEYS as readonly string[]).includes(value);
}

export function getEmailTemplateDraft(key: string): EmailTemplateDraft | null {
  if (!isCardEmailTemplateKey(key)) return null;
  const draft = DRAFTS[key];
  return {
    subject: draft.subject,
    title: draft.title,
    subtitle: draft.subtitle,
    body: draft.body(),
  };
}

export function generateDraftEmailHtml(
  contact: { prenom?: string | null } | null | undefined,
  draft: EmailTemplateDraft,
) {
  return generateCustomEmailHtml(contact, {
    customSubject: draft.subject,
    customTitle: draft.title,
    customSubtitle: draft.subtitle,
    customMessage: draft.body,
  });
}

export function draftsMatch(
  draft: EmailTemplateDraft,
  extras: {
    customSubject?: string;
    customTitle?: string;
    customSubtitle?: string;
    customMessage?: string;
  },
) {
  return (
    String(extras.customSubject || "").trim() === draft.subject &&
    String(extras.customTitle || "").trim() === draft.title &&
    String(extras.customSubtitle || "").trim() === draft.subtitle &&
    String(extras.customMessage || "").trim() === draft.body
  );
}
