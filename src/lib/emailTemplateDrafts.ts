import {
  escapeHtml,
  generateCustomEmailHtml,
  SITE_URL,
  wrapEmailHtml,
} from "./emailLayout";
import {
  displayFormulePrice,
  getFormuleIncludeGroups,
  localizeFormules,
} from "./formules";

const TARIFS_URL = `${SITE_URL}tarifs`;

export type EmailTemplateDraft = {
  subject: string;
  title: string;
  subtitle: string;
  body: string;
};

export const CARD_EMAIL_TEMPLATE_KEYS = [
  "reponse_general",
  "formules_presentation",
  "espace_etudiant",
] as const;

export type CardEmailTemplateKey = (typeof CARD_EMAIL_TEMPLATE_KEYS)[number];

export function formuleChoiceLines() {
  return localizeFormules()
    .map((formule) => {
      const lines = [
        `${formule.number} — ${formule.title} : ${displayFormulePrice(formule)}`,
      ];
      if (formule.subtitle) lines.push(formule.subtitle);
      const groups = getFormuleIncludeGroups(formule);
      for (const group of groups) {
        if (groups.length > 1 && group.title) lines.push(group.title);
        for (const item of group.items) lines.push(`— ${item}`);
      }
      return lines.join("\n");
    })
    .join("\n\n");
}

function bienvenueBody() {
  return [
    "Merci pour votre message. Nous avons bien reçu votre demande concernant un projet d'études en Chine.",
    `Pour étudier votre profil, complétez le formulaire : ${SITE_URL}`,
    "Nous reviendrons vers vous ensuite pour les prochaines étapes.",
  ].join("\n\n");
}

function formulesBody() {
  return [
    "Merci pour l'intérêt que vous portez à Chinois en Devenir et pour votre projet d'études en Chine.",
    "Ces formules nous aident à comprendre votre besoin. Votre choix n'est pas un engagement, et aucun paiement n'est demandé à cette étape.",
    formuleChoiceLines(),
    `Le détail de chaque formule est sur notre site : ${TARIFS_URL}`,
    "Répondez à cet e-mail avec le numéro de la formule. Nous reviendrons ensuite vers vous pour un appel.",
    "Nous ne pouvons pas garantir une admission, une bourse, un visa ou un logement. Les décisions finales appartiennent aux établissements et aux autorités concernées.",
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
    "Nous ne garantissons pas une admission, une bourse, un visa ou un logement. Les décisions appartiennent aux établissements, aux autorités et aux plateformes concernées.",
  ].join("\n\n");
}

const DRAFTS: Record<
  CardEmailTemplateKey,
  Omit<EmailTemplateDraft, "body"> & { body: () => string }
> = {
  reponse_general: {
    subject: "Votre projet d'études en Chine — nous avons bien reçu votre message",
    title: "Votre projet d'études en Chine",
    subtitle: "Nous avons bien reçu votre message",
    body: bienvenueBody,
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

function formuleDetailHtml(formule: ReturnType<typeof localizeFormules>[number]) {
  const groups = getFormuleIncludeGroups(formule);
  return groups
    .map((group) => {
      const heading =
        groups.length > 1
          ? `<p style="margin:12px 0 6px;font-size:13px;font-weight:700;color:#1d3557;">${escapeHtml(group.title)}</p>`
          : "";
      const items = group.items
        .map(
          (item) =>
            `<li style="margin:0 0 6px;font-size:13.5px;line-height:1.5;color:#3d4d5c;">${escapeHtml(item)}</li>`,
        )
        .join("");
      return `${heading}<ul style="margin:0;padding-left:18px;">${items}</ul>`;
    })
    .join("");
}

export function generateFormulesEmailHtml(
  contact: { prenom?: string | null } | null | undefined,
) {
  const formules = localizeFormules();
  const details = formules
    .map((formule) => {
      const border = formule.featured ? "#e63946" : "#1d3557";
      const bg = formule.featured ? "#fff8f8" : "#ffffff";
      const badge = formule.featured
        ? `<p style="margin:0 0 8px;font-size:12px;font-weight:700;letter-spacing:0.06em;text-transform:uppercase;color:#e63946;">Recommandée</p>`
        : "";
      return `<tr><td style="background:${bg};border:1px solid #e6e9ee;border-left:4px solid ${border};padding:16px 18px;">
        ${badge}
        <p style="margin:0 0 8px;font-size:17px;font-weight:700;text-decoration:underline;color:#1d3557;">${formule.number} — ${escapeHtml(formule.title)}</p>
        <p style="margin:0 0 6px;font-size:14px;font-weight:700;color:#243447;">${escapeHtml(displayFormulePrice(formule))}</p>
        ${formule.subtitle ? `<p style="margin:0 0 10px;font-size:14px;color:#3d4d5c;">${escapeHtml(formule.subtitle)}</p>` : ""}
        ${formuleDetailHtml(formule)}
      </td></tr>`;
    })
    .join("");

  return wrapEmailHtml({
    title: "Nos formules d'accompagnement",
    subtitle: "Pour étudier en Chine",
    prenom: contact?.prenom || "",
    bodyHtml: `
      <div class="section">
        <p>Merci pour l'intérêt que vous portez à Chinois en Devenir et pour votre projet d'études en Chine.</p>
        <p>Ces formules nous aident à comprendre votre besoin. Votre choix n'est pas un engagement, et aucun paiement n'est demandé à cette étape.</p>
      </div>
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border-collapse:separate;border-spacing:0 14px;">
        ${details}
      </table>
      <div class="section">
        <p>Le détail de chaque formule est sur notre site : <a class="body-link" href="${TARIFS_URL}">${TARIFS_URL}</a></p>
        <p><strong>Répondez à cet e-mail avec le numéro de la formule.</strong> Nous reviendrons ensuite vers vous pour un appel.</p>
      </div>
      <div class="note">
        <p>Nous ne pouvons pas garantir une admission, une bourse, un visa ou un logement. Les décisions finales appartiennent aux établissements et aux autorités concernées.</p>
      </div>
    `,
  });
}

export function renderEditableEmailHtml(
  contact: { prenom?: string | null } | null | undefined,
  extras: {
    customSubject?: string;
    customTitle?: string;
    customSubtitle?: string;
    customMessage?: string;
  },
) {
  const draft = getEmailTemplateDraft("formules_presentation");
  if (draft && draftsMatch(draft, extras)) return generateFormulesEmailHtml(contact);
  return generateCustomEmailHtml(contact, extras);
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
