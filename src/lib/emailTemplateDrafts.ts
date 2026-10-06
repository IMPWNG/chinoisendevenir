import { generateCustomEmailHtml, SITE_URL } from "./emailLayout";

export type EmailTemplateDraft = {
  subject: string;
  title: string;
  subtitle: string;
  body: string;
};

export const CARD_EMAIL_TEMPLATE_KEYS = ["espace_etudiant"] as const;

export type CardEmailTemplateKey = (typeof CARD_EMAIL_TEMPLATE_KEYS)[number];

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

const DRAFTS: Record<
  CardEmailTemplateKey,
  Omit<EmailTemplateDraft, "body"> & { body: () => string }
> = {
  espace_etudiant: {
    subject: "Votre espace étudiant — créer votre compte et suivre le dossier",
    title: "Votre espace étudiant",
    subtitle: "Compte, paiements, documents et départ",
    body: espaceEtudiantBody,
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
