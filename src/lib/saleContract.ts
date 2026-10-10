import { CONTACT_FROM_EMAIL } from "./emailConfig";
import { escapeHtml, withEtudeChineSubject, wrapEmailHtml } from "./emailLayout";
import { eurosToFcfa, formatEurosOnly, formatFcfa } from "./money";
import { getFormuleByNumber } from "./formules";

/** Shown in the provider signature until the company stamp image is set. */
export const CONTRACT_STAMP_SRC = "";
export const CONTRACT_PLACE = "Chongqing";
export const CONTRACT_SITE = "https://chinoisendevenir.com";
/** Legal identity. Not editable from the admin form or the send API. */
export const CONTRACT_COMPANY = "重庆迈程桥国际贸易有限公司";
export const CONTRACT_ADDRESS = "重庆市渝中区石油路街道经纬大道789号10-5#0534";
export const CONTRACT_REGISTRATION = "91500103MAKNA0M76M";

export type ContractClient = {
  prenom: string;
  nom: string;
  email: string;
  phone: string;
  dateNaissance: string;
  nationalite: string;
  adresse: string;
};

type Annex = {
  title: string;
  included: string[];
  excluded: string[];
  triggers: [string, string, string];
  thirdNote: string;
  savings: boolean;
};

const ANNEXES: Record<1 | 2 | 3, Annex> = {
  1: {
    title: "Annexe — Formule 1 — Année de chinois et accompagnement à l'école de langue",
    included: [
      "l'échange initial sur le projet et le profil du Client",
      "l'orientation vers une école de langue adaptée au projet, sous réserve des places et conditions de l'établissement",
      "la communication des informations et documents à préparer",
      "l'aide à la constitution et à la vérification du dossier",
      "l'assistance pour la candidature ou l'inscription auprès de l'école retenue",
      "le suivi du dossier jusqu'à la réception d'une réponse ou d'une lettre de confirmation d'inscription",
      "des informations générales sur les prochaines démarches liées au départ",
    ],
    excluded: [
      "frais de candidature et frais d'inscription de l'école",
      "frais de cours ou de scolarité",
      "frais de visa, de transport, d'assurance ou de logement",
      "traduction, légalisation ou certification de documents",
      "garantie d'admission, de visa ou de logement",
    ],
    triggers: [
      "À l'ouverture du dossier, après signature du contrat",
      "Au dépôt de la candidature à l'école de langue",
      "À la réception de la lettre de confirmation d'inscription ou, au plus tard, 10 jours calendaires après le dépôt de la première candidature",
    ],
    thirdNote:
      "La troisième échéance reste due selon ce calendrier même si l'école refuse la candidature ou ne répond pas, sous réserve des droits impératifs applicables.",
    savings: false,
  },
  2: {
    title: "Annexe — Formule 2 — Recherche d'universités et accompagnement des candidatures",
    included: [
      "l'analyse du projet, du profil et des objectifs du Client",
      "la recherche d'universités et de programmes correspondant au projet",
      "l'information sur les critères de candidature, les documents et les échéances",
      "l'aide à la préparation, à la relecture et à la vérification du dossier",
      "l'aide au remplissage des formulaires de candidature",
      "le dépôt et le suivi de jusqu'à cinq (5) candidatures universitaires",
      "le suivi du dossier jusqu'aux réponses des établissements",
    ],
    excluded: [
      "frais de candidature et frais universitaires",
      "frais de traduction, légalisation ou certification",
      "frais de visa, de transport, d'assurance ou de logement",
      "démarches ou prestations facturées par des tiers",
    ],
    triggers: [
      "À l'ouverture du dossier, après signature du contrat",
      "Au dépôt de la première candidature universitaire",
      "À la réception d'une lettre d'admission ou de confirmation d'inscription ou, au plus tard, 10 jours calendaires après le dépôt de la première candidature universitaire",
    ],
    thirdNote:
      "La troisième échéance reste due selon ce calendrier même si les universités refusent les candidatures ou ne répondent pas, sous réserve des droits impératifs applicables.",
    savings: false,
  },
  3: {
    title: "Annexe — Formule 3 — Parcours complet : année de chinois, puis accompagnement universitaire",
    included: [
      "Étape 1 — orientation vers une école de langue adaptée au projet",
      "Étape 1 — information sur les documents et les étapes de candidature",
      "Étape 1 — aide à la constitution et à la vérification du dossier",
      "Étape 1 — assistance pour la candidature ou l'inscription auprès de l'école retenue",
      "Étape 1 — suivi jusqu'à la réception d'une réponse ou d'une lettre de confirmation d'inscription",
      "Étape 1 — informations générales pour préparer le départ",
      "Étape 2 — recherche d'universités et de programmes adaptés",
      "Étape 2 — vérification des critères, documents et délais",
      "Étape 2 — aide à la préparation et à la relecture du dossier",
      "Étape 2 — aide au remplissage des formulaires",
      "Étape 2 — dépôt et suivi de jusqu'à huit (8) candidatures universitaires",
      "Étape 2 — suivi jusqu'aux réponses des établissements",
    ],
    excluded: [
      "frais de candidature, d'inscription, de cours ou de scolarité",
      "frais de traduction, légalisation ou certification",
      "frais de visa, de transport, d'assurance, de logement ou de vie en Chine",
      "prestations facturées par des tiers",
      "garantie d'admission, de bourse, de visa ou de logement",
    ],
    triggers: [
      "À l'ouverture du dossier, après signature du contrat",
      "Au dépôt de la candidature à l'école de langue",
      "Au début de l'accompagnement universitaire, lors du dépôt de la première candidature universitaire ; si aucune lettre n'est reçue, l'échéance est due au plus tard 10 jours calendaires après ce dépôt",
    ],
    thirdNote:
      "La troisième échéance est liée à l'étape universitaire de l'année suivante, et non à la lettre de l'école de langue. Elle reste due selon le calendrier ci-dessus même si les universités refusent les candidatures ou ne répondent pas, sous réserve des droits impératifs applicables.",
    savings: true,
  },
};

function clip(value: unknown, max: number) {
  return String(value || "")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, max);
}

export function contractInstallments(priceEuros: number) {
  const first = Math.round(priceEuros * 0.4);
  const second = Math.round(priceEuros * 0.3);
  const third = priceEuros - first - second;
  return [first, second, third];
}

export function contractSendDate(sentAt: Date) {
  return new Intl.DateTimeFormat("fr-FR", {
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "Asia/Shanghai",
  }).format(sentAt);
}

export function contractClientFromContact(
  contact: {
    prenom?: string | null;
    nom?: string | null;
    email?: string | null;
    phone?: string | null;
    pays?: string | null;
  },
  extras: {
    phone?: unknown;
    dateNaissance?: unknown;
    nationalite?: unknown;
    adresse?: unknown;
  },
): ContractClient {
  return {
    prenom: clip(contact.prenom, 80),
    nom: clip(contact.nom, 80),
    email: clip(contact.email, 254).toLowerCase(),
    phone: clip(contact.phone, 40) || clip(extras.phone, 40),
    dateNaissance: clip(extras.dateNaissance, 40),
    nationalite: clip(extras.nationalite, 80) || clip(contact.pays, 80),
    adresse: clip(extras.adresse, 240),
  };
}

export function clientReady(client: ContractClient) {
  return Object.values(client).every((item) => item.length > 0);
}

function bullets(items: string[]) {
  return `<ul class="formule-list">${items.map((item) => `<li>${escapeHtml(item)}</li>`).join("")}</ul>`;
}

function field(label: string, value: string) {
  return `<p><strong>${escapeHtml(label)} :</strong> ${escapeHtml(value)}</p>`;
}

function scheduleTable(amounts: number[], triggers: [string, string, string]) {
  const rows = [
    ["1re échéance — 40 %", amounts[0], triggers[0]],
    ["2e échéance — 30 %", amounts[1], triggers[1]],
    ["3e échéance — 30 %", amounts[2], triggers[2]],
  ];
  const body = rows
    .map(
      ([label, amount, trigger]) => `<tr>
        <td style="padding:8px;border-bottom:1px solid #e6e9ee;vertical-align:top;">${escapeHtml(label)}</td>
        <td style="padding:8px;border-bottom:1px solid #e6e9ee;vertical-align:top;white-space:nowrap;">${escapeHtml(formatEurosOnly(amount as number))}</td>
        <td style="padding:8px;border-bottom:1px solid #e6e9ee;vertical-align:top;">${escapeHtml(trigger)}</td>
      </tr>`,
    )
    .join("");
  return `<table style="width:100%;border-collapse:collapse;font-size:13px;margin:12px 0;">
    <thead>
      <tr>
        <th style="text-align:left;padding:8px;border-bottom:1px solid #1d3557;">Échéance</th>
        <th style="text-align:left;padding:8px;border-bottom:1px solid #1d3557;">Montant</th>
        <th style="text-align:left;padding:8px;border-bottom:1px solid #1d3557;">Déclencheur</th>
      </tr>
    </thead>
    <tbody>${body}</tbody>
  </table>`;
}

function stampHtml() {
  if (!CONTRACT_STAMP_SRC) {
    return `<div style="margin-top:8px;border:1px dashed #94a3b8;padding:18px;text-align:center;color:#64748b;">Tampon de l'entreprise</div>`;
  }
  return `<img src="${escapeHtml(CONTRACT_STAMP_SRC)}" alt="Tampon de l'entreprise" style="max-width:180px;height:auto;margin-top:8px;" />`;
}

export function buildSaleContract(input: {
  client: ContractClient;
  formuleNumber: number;
  sentAt: Date;
}) {
  const formule = getFormuleByNumber(input.formuleNumber);
  const annex = ANNEXES[input.formuleNumber as 1 | 2 | 3];
  if (!formule || !annex || formule.priceEuros == null) return null;

  const amounts = contractInstallments(formule.priceEuros);
  const fullName = `${input.client.prenom} ${input.client.nom}`.trim();
  const dateLabel = contractSendDate(input.sentAt);
  const total = `${formatEurosOnly(formule.priceEuros)} — équivalent indicatif : ${formatFcfa(eurosToFcfa(formule.priceEuros))}`;
  const savings = annex.savings
    ? `<p>Économie par rapport aux deux formules séparées : ${escapeHtml(formatEurosOnly(500))}, soit environ ${escapeHtml(formatFcfa(eurosToFcfa(500)))}.</p>`
    : "";
  const visaNote =
    input.formuleNumber === 1
      ? `<p>L'accompagnement relatif au visa consiste en une aide à la préparation et à la vérification des documents. La décision de délivrer le visa appartient exclusivement aux autorités compétentes.</p>`
      : input.formuleNumber === 2
        ? `<p>L'obtention d'une admission ou d'une bourse n'est pas garantie.</p>`
        : `<p>Le démarrage de la deuxième étape est prévu l'année suivant celle de langue, selon le calendrier convenu entre les Parties et les échéances des établissements.</p>`;

  const bodyHtml = `
    <div class="section">
      <p>Contrat de prestation d'accompagnement — projet d'études en Chine.</p>
    </div>
    <div class="section">
      <div class="section-title">Le Prestataire</div>
      ${field("Dénomination sociale", CONTRACT_COMPANY)}
      ${field("Adresse du siège social", CONTRACT_ADDRESS)}
      ${field("Numéro d'immatriculation", CONTRACT_REGISTRATION)}
      ${field("Adresse e-mail", CONTACT_FROM_EMAIL)}
      ${field("Nom commercial / site", `Chinois en Devenir — ${CONTRACT_SITE}`)}
      <p>Ci-après « le Prestataire ».</p>
    </div>
    <div class="section">
      <div class="section-title">Le Client</div>
      ${field("Nom et prénom", fullName)}
      ${field("Date de naissance", input.client.dateNaissance)}
      ${field("Nationalité", input.client.nationalite)}
      ${field("Adresse", input.client.adresse)}
      ${field("Adresse e-mail", input.client.email)}
      ${field("Téléphone", input.client.phone)}
      <p>Ci-après « le Client ». Le Prestataire et le Client sont désignés ensemble « les Parties ».</p>
    </div>
    <div class="section">
      <div class="section-title">Article 1 — Objet</div>
      <p>Le présent contrat définit les conditions d'accompagnement du Client dans la préparation de son projet d'études en Chine, selon la formule choisie dans l'annexe signée avec ce contrat.</p>
      <p>Le Prestataire fournit des prestations d'information, de conseil, de préparation et de suivi administratif. Il n'est ni une université, ni une école de langue, ni une autorité consulaire, ni un organisme de bourses.</p>
    </div>
    <div class="section">
      <div class="section-title">Article 2 — Obligations du Prestataire</div>
      <p>Le Prestataire s'engage à :</p>
      ${bullets([
        "fournir les services correspondant à la formule choisie et décrits dans son annexe",
        "informer le Client des documents et informations nécessaires à son dossier",
        "accompagner le Client dans la préparation des candidatures prévues",
        "signaler au Client les démarches qui relèvent de lui ou d'un tiers",
        "informer le Client des étapes importantes du suivi, dans des délais raisonnables",
      ])}
      <p>Le Prestataire est tenu à une obligation de moyens, et non à une obligation de résultat.</p>
    </div>
    <div class="section">
      <div class="section-title">Article 3 — Obligations du Client</div>
      <p>Le Client s'engage à :</p>
      ${bullets([
        "fournir des informations exactes, complètes et à jour",
        "transmettre les documents demandés dans les délais indiqués",
        "vérifier les documents préparés et confirmer leur exactitude avant leur envoi",
        "effectuer les démarches personnelles ou officielles qui lui incombent",
        "payer les échéances prévues dans l'annexe choisie",
        "prévenir le Prestataire de tout changement susceptible d'affecter son projet",
      ])}
      <p>Les retards, omissions ou informations inexactes du Client peuvent retarder ou compromettre les candidatures. Le Prestataire ne peut être tenu responsable des conséquences imputables à ces faits.</p>
    </div>
    <div class="section">
      <div class="section-title">Article 4 — Absence de garantie de résultat</div>
      <p>Le Prestataire ne garantit pas :</p>
      ${bullets([
        "l'admission dans une école ou une université",
        "l'obtention d'une bourse",
        "la délivrance d'un visa",
        "l'obtention d'un logement",
        "la disponibilité d'une formation ou d'une place",
        "une réponse favorable ou une réponse dans un délai déterminé",
      ])}
      <p>Les décisions finales appartiennent aux établissements, organismes de bourses et autorités compétentes.</p>
    </div>
    <div class="section">
      <div class="section-title">Article 5 — Prix et paiement</div>
      <p>Le prix, les montants des échéances et leurs déclencheurs sont indiqués dans l'annexe de la formule choisie.</p>
      <p>Sauf indication contraire dans l'annexe :</p>
      ${bullets([
        "les paiements sont effectués en euros ou en F CFA",
        "les frais bancaires ou frais de transfert éventuels sont à la charge du Client",
        "le Prestataire remet un justificatif ou une preuve de paiement",
        "les frais facturés directement par les écoles, universités, autorités, traducteurs, assureurs ou autres prestataires tiers ne sont pas compris dans le prix du présent contrat",
      ])}
      <p>Lorsqu'une échéance est liée au dépôt d'une candidature, le dépôt de référence est le dépôt de la première candidature comprise dans la formule.</p>
      <p>Si la lettre attendue n'est pas reçue, l'échéance concernée reste due au plus tard dix (10) jours calendaires après ce dépôt, sans que l'admission ou une réponse de l'établissement soit garantie.</p>
    </div>
    <div class="section">
      <div class="section-title">Article 6 — Étapes de service et remboursement</div>
      <p>Les Parties reconnaissent que le prix rémunère les étapes de service décrites dans l'annexe.</p>
      <p>Les paiements rémunèrent des étapes de service clairement définies et déjà réalisées ; aucun remboursement n'est dû pour ces étapes, sous réserve des droits impératifs éventuellement applicables.</p>
      <p>Cette clause ne supprime pas les droits auxquels la loi applicable interdit de renoncer. En cas de fin anticipée du contrat, les Parties tiennent compte des services effectivement réalisés, des sommes déjà payées et des règles impératives applicables.</p>
    </div>
    <div class="section">
      <div class="section-title">Article 7 — Refus ou absence de réponse d'un établissement</div>
      <p>Le refus d'une candidature ou l'absence de réponse d'un établissement ne constitue pas, à lui seul, un manquement du Prestataire, dès lors que celui-ci a exécuté les prestations prévues.</p>
      <p>Les échéances dont le déclencheur est défini dans l'annexe restent dues selon les conditions prévues, y compris lorsqu'un établissement refuse la candidature ou ne répond pas.</p>
    </div>
    <div class="section">
      <div class="section-title">Article 8 — Prestataires tiers et frais non inclus</div>
      <p>Sauf mention écrite contraire, le prix du contrat ne comprend pas les frais facturés par des tiers, notamment :</p>
      ${bullets([
        "frais de candidature ou d'inscription",
        "frais de scolarité ou de cours de langue",
        "frais de traduction, légalisation ou certification",
        "frais de visa, de transport ou d'assurance",
        "logement, dépôt de garantie et dépenses de vie sur place",
      ])}
      <p>Le Client demeure responsable du paiement de ces frais directement aux organismes concernés.</p>
    </div>
    <div class="section">
      <div class="section-title">Article 9 — Données et documents du Client</div>
      <p>Le Client autorise le Prestataire à utiliser les documents et informations nécessaires à l'exécution des prestations et à les transmettre aux établissements ou organismes concernés, uniquement dans le cadre de son projet d'études.</p>
      <p>Le Client doit éviter d'envoyer des documents qui ne sont pas nécessaires à son dossier. Les modalités détaillées de traitement et de conservation des données devront être précisées dans la politique de confidentialité du Prestataire.</p>
    </div>
    <div class="section">
      <div class="section-title">Article 10 — Communication et suivi</div>
      <p>Les échanges peuvent avoir lieu par e-mail, téléphone ou messagerie. Le Client doit maintenir des coordonnées valides et consulter régulièrement les messages reçus.</p>
      <p>Adresse de contact du Prestataire : ${escapeHtml(CONTACT_FROM_EMAIL)}</p>
    </div>
    <div class="section">
      <div class="section-title">Article 11 — Durée et fin du contrat</div>
      <p>Le contrat prend effet à sa signature par les Parties et au paiement de la première échéance, selon les modalités de l'annexe.</p>
      <p>Il prend fin lorsque les prestations prévues dans l'annexe ont été réalisées, sauf fin anticipée convenue par écrit ou imposée par les règles applicables.</p>
      <p>En cas de manquement important d'une Partie, l'autre Partie peut lui adresser une demande écrite de régularisation. Les conséquences financières d'une fin anticipée sont déterminées selon les prestations effectivement réalisées et les règles impératives applicables.</p>
    </div>
    <div class="section">
      <div class="section-title">Article 12 — Réclamations</div>
      <p>Toute réclamation relative à l'exécution du contrat peut être adressée à ${escapeHtml(CONTACT_FROM_EMAIL)}. Le Client est invité à décrire sa demande et à joindre les éléments utiles.</p>
    </div>
    <div class="section">
      <div class="section-title">Article 13 — Droit applicable et litiges</div>
      <p>Droit choisi par les Parties : Chine.</p>
      <p>Le choix d'un droit applicable ne prive pas le Client des protections impératives qui pourraient s'appliquer à sa situation. En cas de litige, les Parties chercheront d'abord une solution amiable. À défaut, le litige sera soumis aux juridictions compétentes selon les règles applicables.</p>
    </div>
    <div class="section">
      <div class="section-title">Article 14 — Acceptation du contrat</div>
      <p>Le Client reconnaît avoir reçu et lu le présent socle contractuel, l'annexe correspondant à la formule choisie, et les informations sur les prestations incluses et non incluses.</p>
      <p><strong>Fait à :</strong> ${escapeHtml(CONTRACT_PLACE)}<br><strong>Le :</strong> ${escapeHtml(dateLabel)}</p>
      <p><strong>Le Prestataire</strong></p>
      ${stampHtml()}
      <p style="margin-top:16px;"><strong>Le Client</strong><br>Nom : ${escapeHtml(fullName)}<br>Signature précédée de la mention « Lu et approuvé » :</p>
    </div>
    <div class="section">
      <div class="section-title">${escapeHtml(annex.title)}</div>
      <p><strong>1. Prestations incluses</strong></p>
      ${bullets(annex.included)}
      ${visaNote}
      <p><strong>2. Prestations non incluses</strong></p>
      <p>Sauf accord écrit contraire, ne sont pas inclus :</p>
      ${bullets(annex.excluded)}
      <p><strong>3. Prix et échéancier</strong></p>
      <p>Prix total : ${escapeHtml(total)}</p>
      ${scheduleTable(amounts, annex.triggers)}
      <p>${escapeHtml(annex.thirdNote)}</p>
      ${savings}
    </div>
  `;

  const subject = withEtudeChineSubject(
    `Contrat d'accompagnement — ${fullName}`,
  );
  const html = wrapEmailHtml({
    title: "Contrat de prestation d'accompagnement",
    subtitle: "Projet d'études en Chine",
    prenom: input.client.prenom,
    bodyHtml,
  });

  return { subject, html, formuleNumber: input.formuleNumber as 1 | 2 | 3 };
}
