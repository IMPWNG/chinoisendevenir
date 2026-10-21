import { CONTACT_FROM_EMAIL } from "./emailConfig";
import { escapeHtml, withEtudeChineSubject, wrapEmailHtml } from "./emailLayout";
import {
  eurosToFcfa,
  eurosToRmb,
  formatEuroFcfaRate,
  formatEurosOnly,
  formatFcfa,
  formatRmb,
} from "./money";
import { getFormuleByNumber } from "./formules";

/** Company stamp on the provider signature. Served from /public. */
export const CONTRACT_STAMP_SRC = "https://chinoisendevenir.com/tampon-entreprise.png";
export const CONTRACT_REPRESENTATIVE = "Matisse Achéen";
export const CONTRACT_ROLE = "Président";
export const CONTRACT_PLACE = "Chongqing, Chine";
export const CONTRACT_BLANK = "[À COMPLÉTER]";
export const CONTRACT_PRIVACY_URL =
  "https://chinoisendevenir.com/politique-confidentialite";
export const CONTRACT_SITE = "https://chinoisendevenir.com";
/** Legal identity. Not editable from the admin form or the send API. */
export const CONTRACT_COMPANY = "重庆迈程桥国际贸易有限公司";
export const CONTRACT_ADDRESS = "重庆市渝中区石油路街道经纬大道789号10-5#0534";
export const CONTRACT_REGISTRATION = "91500103MAKNA0M76M";

export type LegalRepresentative = {
  nom: string;
  lien: string;
  adresse: string;
  contact: string;
};

export type ContractClient = {
  prenom: string;
  nom: string;
  email: string;
  phone: string;
  dateNaissance: string;
  nationalite: string;
  residence: string;
  adresse: string;
  mineur: boolean;
  representant: LegalRepresentative;
  /** Someone other than the client pays (often a parent of an adult student). */
  tiersPayeur: boolean;
  payeur: LegalRepresentative;
  /** Legal guardians. `representant` stays the first one. */
  representants: LegalRepresentative[];
};

const SCHEDULE_TRIGGERS: [string, string, string] = [
  "À l'ouverture du dossier",
  "À l'envoi des candidatures",
  "À la réception de l'acceptation de l'école et/ou de l'université",
];

const SCHEDULE_NOTE =
  "La troisième échéance correspond au solde. Elle est due à la réception de l'acceptation de l'école et/ou de l'université. Les refus ou absences de réponse ne constituent pas une garantie de remboursement des prestations déjà réalisées. Les droits impératifs applicables au Client demeurent réservés.";

type Annex = {
  title: string;
  included: string[];
  excluded: string[];
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
  },
  3: {
    title: "Annexe — Formule 3 : Parcours complet",
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
      "les démarches qui doivent être réalisées personnellement par le Client ou son représentant légal",
    ],
  },
};

function clip(value: unknown, max: number) {
  return String(value || "")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, max);
}

function blankPerson(): LegalRepresentative {
  return { nom: "", lien: "", adresse: "", contact: "" };
}

function personFrom(value: unknown): LegalRepresentative {
  const row =
    value && typeof value === "object" ? (value as Record<string, unknown>) : {};
  return {
    nom: clip(row.nom, 120),
    lien: clip(row.lien, 80),
    adresse: clip(row.adresse, 240),
    contact: clip(row.contact, 160),
  };
}

function personFilled(person: LegalRepresentative) {
  return Boolean(person.nom || person.lien || person.adresse || person.contact);
}

// ponytail: at most four tutors on one contract. Raise the cap if a file needs more.
export const CONTRACT_TUTOR_CAP = 4;

export function contractTutors(value: unknown): LegalRepresentative[] {
  const list = Array.isArray(value) ? value : value ? [value] : [];
  return list
    .map(personFrom)
    .filter(personFilled)
    .slice(0, CONTRACT_TUTOR_CAP);
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
    residence?: unknown;
    adresse?: unknown;
    mineur?: unknown;
    representant?: {
      nom?: unknown;
      lien?: unknown;
      adresse?: unknown;
      contact?: unknown;
    } | null;
    representants?: unknown;
    tiersPayeur?: unknown;
    payeur?: {
      nom?: unknown;
      lien?: unknown;
      adresse?: unknown;
      contact?: unknown;
    } | null;
  },
): ContractClient {
  const listed = contractTutors(extras.representants);
  const single = personFrom(extras.representant);
  const representants = listed.length
    ? listed
    : personFilled(single)
      ? [single]
      : [];
  return {
    prenom: clip(contact.prenom, 80),
    nom: clip(contact.nom, 80),
    email: clip(contact.email, 254).toLowerCase(),
    phone: clip(contact.phone, 40) || clip(extras.phone, 40),
    dateNaissance: clip(extras.dateNaissance, 40),
    nationalite: clip(extras.nationalite, 80),
    residence: clip(extras.residence, 80) || clip(contact.pays, 80),
    adresse: clip(extras.adresse, 240),
    mineur: extras.mineur === true,
    representant: representants[0] || blankPerson(),
    representants,
    tiersPayeur: extras.tiersPayeur === true,
    payeur: personFrom(extras.payeur),
  };
}

/** Missing fields that block a signable contract. Residence is never copied from nationality. */
export function contractGaps(client: ContractClient): string[] {
  const gaps: string[] = [];
  if (!client.prenom || !client.nom) gaps.push("Nom et prénom du client");
  if (!client.email) gaps.push("Adresse e-mail du client");
  if (!client.phone) gaps.push("Téléphone du client");
  if (!client.dateNaissance) gaps.push("Date de naissance du client");
  if (!client.nationalite) gaps.push("Nationalité du client");
  if (!client.residence) gaps.push("Pays de résidence habituelle du client");
  if (!client.adresse) gaps.push("Adresse du client");
  if (client.mineur) {
    const tutors = client.representants.length ? client.representants : [blankPerson()];
    const suffix = (index: number) => (tutors.length > 1 ? ` ${index + 1}` : "");
    tutors.forEach((rep, index) => {
      const n = suffix(index);
      if (!rep.nom) gaps.push(`Nom du représentant légal${n}`);
      if (!rep.lien) gaps.push(`Lien du représentant légal avec le client${n}`);
      if (!rep.adresse) gaps.push(`Adresse du représentant légal${n}`);
      if (!rep.contact) gaps.push(`E-mail et téléphone du représentant légal${n}`);
    });
  }
  if (client.tiersPayeur) {
    if (!client.payeur.nom) gaps.push("Nom du payeur");
    if (!client.payeur.lien) gaps.push("Lien du payeur avec le client");
    if (!client.payeur.adresse) gaps.push("Adresse du payeur");
    if (!client.payeur.contact) gaps.push("E-mail et téléphone du payeur");
  }
  return gaps;
}

export function clientReady(client: ContractClient) {
  return contractGaps(client).length === 0;
}

export const CONTRACT_CURRENCIES = ["EUR", "XOF", "CNY"] as const;
export type ContractCurrency = (typeof CONTRACT_CURRENCIES)[number];

const CURRENCY_LABEL: Record<ContractCurrency, string> = {
  EUR: "euros",
  XOF: "francs CFA",
  CNY: "RMB",
};

export function contractCurrency(value: unknown): ContractCurrency {
  const code = String(value || "").trim().toUpperCase();
  return (CONTRACT_CURRENCIES as readonly string[]).includes(code)
    ? (code as ContractCurrency)
    : "EUR";
}

export function contractTerms(value: unknown) {
  const raw =
    value && typeof value === "object"
      ? (value as Record<string, unknown>)
      : {};
  return {
    paymentMode: clip(raw.paymentMode, 240),
    currency: contractCurrency(raw.currency),
  };
}

function convertedParts(
  euros: number[],
  totalEuros: number,
  convert: (amount: number) => number,
): number[] {
  const parts = euros.map(convert);
  parts[2] = convert(totalEuros) - parts[0] - parts[1];
  return parts;
}

function formatInstallment(
  euros: number,
  cfa: number,
  rmb: number,
  currency: ContractCurrency,
): string {
  const cfaLabel = formatFcfa(cfa);
  if (currency === "XOF") return cfaLabel;
  if (currency === "CNY") return `${formatRmb(rmb)} (${cfaLabel})`;
  return `${formatEurosOnly(euros)} (${cfaLabel})`;
}

function bullets(items: string[]) {
  return `<ul class="formule-list">${items.map((item) => `<li>${escapeHtml(item)}</li>`).join("")}</ul>`;
}

function field(label: string, value: string) {
  return `<p><strong>${escapeHtml(label)} :</strong> ${escapeHtml(value)}</p>`;
}

function scheduleTable(
  amounts: string[],
  triggers: [string, string, string],
) {
  const rows = [
    ["1re échéance — 40 %", amounts[0], triggers[0]],
    ["2e échéance — 30 %", amounts[1], triggers[1]],
    ["3e échéance — solde", amounts[2], triggers[2]],
  ];
  const body = rows
    .map(
      ([label, amount, trigger]) => `<tr>
        <td style="padding:8px;border-bottom:1px solid #e6e9ee;vertical-align:top;">${escapeHtml(label)}</td>
        <td style="padding:8px;border-bottom:1px solid #e6e9ee;vertical-align:top;white-space:nowrap;">${escapeHtml(amount)}</td>
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

export type SaleContract =
  | { subject: string; html: string; formuleNumber: 1 | 2 | 3 }
  | { validation: true; gaps: string[] };

function shown(value: string) {
  return escapeHtml(value || CONTRACT_BLANK);
}

function annexIntro(number: 1 | 2 | 3, annex: Annex) {
  if (number !== 3) {
    const note =
      number === 1
        ? `<p>L'accompagnement relatif au visa consiste en une aide à la préparation et à la vérification des documents. La décision de délivrer le visa appartient exclusivement aux autorités compétentes.</p>`
        : `<p>L'obtention d'une admission ou d'une bourse n'est pas garantie.</p>`;
    return `<p><strong>1. Prestations incluses</strong></p>${bullets(annex.included)}${note}`;
  }
  const bare = (item: string) => item.replace(/^Étape [12] — /, "");
  return `
    <p><strong>1. Parcours et prestations incluses</strong></p>
    <p><strong>Étape 1 — Année de langue chinoise</strong></p>
    <p>Le Prestataire accompagne le Client pour :</p>
    ${bullets(annex.included.slice(0, 6).map(bare))}
    <p><strong>Étape 2 — Accompagnement universitaire</strong></p>
    <p>Le Prestataire accompagne le Client pour :</p>
    ${bullets(annex.included.slice(6).map(bare))}
    <p>Le démarrage de l'étape 2 est prévu l'année suivant l'année de langue, selon le calendrier convenu entre les Parties et les échéances des établissements.</p>
    <p>Période ou date indicative de démarrage de l'étape 2 : ${escapeHtml(CONTRACT_BLANK)}</p>
    <p>Le Client devra transmettre les documents requis suffisamment tôt pour respecter les délais des établissements. Les candidatures supplémentaires au-delà des huit incluses ne sont pas comprises, sauf accord écrit sur leur prix et leurs modalités.</p>
  `;
}

export function buildSaleContract(input: {
  client: ContractClient;
  formuleNumber: number;
  sentAt: Date;
  terms?: unknown;
}): SaleContract | null {
  const formuleNumber = input.formuleNumber as 1 | 2 | 3;
  const formule = getFormuleByNumber(formuleNumber);
  const annex = ANNEXES[formuleNumber];
  if (!formule || !annex || formule.priceEuros == null) return null;

  const gaps = contractGaps(input.client);
  if (gaps.length) return { validation: true, gaps };

  const pay = contractTerms(input.terms);

  const client = input.client;
  const euroParts = contractInstallments(formule.priceEuros);
  const cfaParts = convertedParts(euroParts, formule.priceEuros, eurosToFcfa);
  const rmbParts = convertedParts(euroParts, formule.priceEuros, eurosToRmb);
  const amounts = euroParts.map((euros, index) =>
    formatInstallment(euros, cfaParts[index], rmbParts[index], pay.currency),
  );
  const totalLabel = formatInstallment(
    formule.priceEuros,
    eurosToFcfa(formule.priceEuros),
    eurosToRmb(formule.priceEuros),
    pay.currency,
  );
  const fullName = `${client.prenom} ${client.nom}`.trim();
  const dateLabel = contractSendDate(input.sentAt);
  const tutors = client.representants;
  const severalTutors = tutors.length > 1;
  const minorBlock = client.mineur
    ? `<div class="section">
      <div class="section-title">Si le Client est mineur</div>
      <p>Le présent contrat est signé pour le Client mineur par ${severalTutors ? "ses représentants légaux" : "son représentant légal"} :</p>
      ${tutors
        .map(
          (rep, index) => `${severalTutors ? `<p><strong>Personne tutrice ${index + 1}</strong></p>` : ""}
      ${field("Nom et prénom du représentant légal", rep.nom)}
      ${field("Lien avec le Client", rep.lien)}
      ${field("Adresse", rep.adresse)}
      ${field("E-mail et téléphone", rep.contact)}`,
        )
        .join("")}
      <p>Document établissant la qualité de représentant légal : ${escapeHtml(CONTRACT_BLANK)}</p>
      <p>${severalTutors ? "Chaque représentant légal déclare être habilité" : "Le représentant légal déclare être habilité"} à conclure le présent contrat au nom du Client mineur et s'engage à participer aux démarches lorsque cela est nécessaire.</p>
    </div>`
    : "";
  const minorSign = client.mineur
    ? tutors
        .map(
          (rep) =>
            `<p style="margin-top:16px;"><strong>Le représentant légal</strong><br>Nom : ${shown(rep.nom)}<br>Qualité : ${shown(rep.lien)}<br>Signature précédée de la mention « Agissant en qualité de représentant légal du Client mineur » :</p>`,
        )
        .join("")
    : "";
  const payer = client.payeur;
  const payerBlock = client.tiersPayeur
    ? `<div class="section">
      <div class="section-title">Personne qui règle l'accompagnement</div>
      <p>Les sommes dues au titre du présent contrat sont réglées par une personne autre que le Client, y compris lorsque le Client est majeur. Le Client demeure le bénéficiaire des prestations et reste partie au contrat. Le paiement par un tiers ne transfère pas au Payeur la qualité de Client.</p>
      ${field("Nom et prénom du payeur", payer.nom)}
      ${field("Lien avec le Client", payer.lien)}
      ${field("Adresse", payer.adresse)}
      ${field("E-mail et téléphone", payer.contact)}
      <p>Le Payeur s'engage à régler les échéances prévues à l'annexe, selon le mode de paiement indiqué. À défaut de paiement par le Payeur, les sommes restent dues dans les conditions du présent contrat.</p>
    </div>`
    : "";
  const payerSign = client.tiersPayeur
    ? `<p style="margin-top:16px;"><strong>Le payeur</strong><br>Nom : ${shown(payer.nom)}<br>Qualité : ${shown(payer.lien)}<br>Signature :</p>`
    : "";

  const bodyHtml = `
    <div class="section">
      <p>Contrat de prestation d'accompagnement — projet d'études en Chine.</p>
      <p>Entre les soussignés.</p>
    </div>
    <div class="section">
      <div class="section-title">Le Prestataire</div>
      ${field("Dénomination sociale", CONTRACT_COMPANY)}
      ${field("Adresse du siège social", CONTRACT_ADDRESS)}
      ${field("Numéro d'immatriculation", CONTRACT_REGISTRATION)}
      ${field("Adresse e-mail", CONTACT_FROM_EMAIL)}
      ${field("Nom commercial / site internet", `Chinois en Devenir — ${CONTRACT_SITE}`)}
      <p>Ci-après dénommé le « Prestataire ».</p>
    </div>
    <div class="section">
      <div class="section-title">Le Client</div>
      ${field("Nom et prénom", fullName)}
      ${field("Date de naissance", client.dateNaissance)}
      ${field("Nationalité", client.nationalite)}
      ${field("Pays de résidence habituelle", client.residence)}
      ${field("Adresse complète", client.adresse)}
      ${field("Adresse e-mail", client.email)}
      ${field("Téléphone", client.phone)}
      <p>Ci-après dénommé le « Client ».</p>
    </div>
    ${minorBlock}
    ${payerBlock}
    <div class="section">
      <p>Le Prestataire et le Client${client.mineur ? (severalTutors ? ", représenté par ses représentants légaux," : ", représenté par son représentant légal,") : ""} sont ci-après désignés ensemble les « Parties ».</p>
      ${client.tiersPayeur ? "<p>Le Payeur désigné ci-dessus règle les sommes dues. Les prestations restent fournies au Client.</p>" : ""}
    </div>
    <div class="section">
      <div class="section-title">Article 1 — Objet du contrat</div>
      <p>Le présent contrat définit les conditions de l'accompagnement du Client dans la préparation de son projet d'études en Chine, selon la formule décrite dans l'annexe jointe et acceptée par les Parties.</p>
      <p>Le Prestataire fournit des services d'information, de conseil, de préparation et de suivi administratif. Il n'est ni un établissement d'enseignement, ni une autorité consulaire, ni un organisme de bourses, ni le représentant officiel des établissements auxquels le Client souhaite candidater.</p>
      <p>Le Prestataire ne prend aucune décision à la place des universités, écoles, organismes de bourses, autorités consulaires ou autres tiers.</p>
    </div>
    <div class="section">
      <div class="section-title">Article 2 — Prestations du Prestataire</div>
      <p>Le Prestataire s'engage à fournir les services expressément décrits dans l'annexe de la formule choisie, notamment, selon la formule :</p>
      ${bullets([
        "informer le Client sur les documents nécessaires",
        "l'aider à organiser et préparer son dossier",
        "relire les informations et documents fournis par le Client",
        "l'accompagner dans la préparation des candidatures incluses dans la formule",
        "lui signaler les démarches qu'il doit réaliser personnellement ou auprès d'un tiers",
        "l'informer des principales étapes de suivi, dans des délais raisonnables",
      ])}
      <p>Le Prestataire est tenu à une obligation de moyens. Il ne garantit pas l'obtention d'un résultat déterminé.</p>
      <p>Toute prestation non décrite dans l'annexe est exclue, sauf accord écrit entre les Parties.</p>
    </div>
    <div class="section">
      <div class="section-title">Article 3 — Obligations du Client</div>
      <p>Le Client s'engage à :</p>
      ${bullets([
        "fournir des informations exactes, complètes et à jour",
        "transmettre les documents demandés dans des délais compatibles avec les calendriers des établissements",
        "vérifier les documents préparés et confirmer leur exactitude avant tout envoi",
        "signer les formulaires et réaliser les démarches personnelles ou officielles qui lui incombent",
        "répondre aux demandes raisonnables du Prestataire",
        "payer les sommes prévues dans l'annexe",
        "informer rapidement le Prestataire de tout changement concernant son identité, son projet, ses coordonnées ou sa situation",
        "conserver des copies de ses documents et échanges importants",
      ])}
      <p>Les retards, omissions, informations inexactes ou documents non conformes transmis par le Client peuvent retarder ou compromettre les candidatures. Le Prestataire n'est pas responsable des conséquences directement imputables à ces faits.</p>
      <p>Le Prestataire ne peut pas transmettre une candidature contenant une déclaration qu'il sait inexacte. Le Client demeure responsable de l'authenticité et de la légalité des documents fournis.</p>
    </div>
    <div class="section">
      <div class="section-title">Article 4 — Absence de garantie de résultat</div>
      <p>Le Prestataire ne garantit pas :</p>
      ${bullets([
        "l'admission dans une école ou une université",
        "l'obtention d'une bourse",
        "la délivrance d'un visa ou d'un titre de séjour",
        "l'obtention d'un logement",
        "la disponibilité d'une formation, d'une place ou d'un financement",
        "une réponse favorable ou une réponse dans un délai déterminé",
        "la reconnaissance d'un diplôme ou d'une qualification par une autorité ou un organisme",
      ])}
      <p>Les décisions finales appartiennent aux établissements, organismes de bourses, autorités consulaires et autres organismes compétents.</p>
    </div>
    <div class="section">
      <div class="section-title">Article 5 — Prix, devise et paiement</div>
      <p>Le prix, la devise de facturation, les échéances et leurs déclencheurs sont indiqués dans l'annexe de la formule choisie.</p>
      <p>Sauf indication contraire dans l'annexe :</p>
      ${bullets([
        "le montant facturé est celui indiqué dans la devise contractuelle",
        "toute équivalence dans une autre devise est donnée à titre indicatif",
        "les frais bancaires, de paiement ou de transfert peuvent rester à la charge du Client",
        "le Prestataire remet une confirmation ou une preuve du paiement reçu",
        "les paiements dus à des établissements ou à d'autres tiers ne sont pas inclus dans le prix du contrat",
      ])}
      <p>Lorsqu'une échéance dépend du dépôt d'une candidature, le dépôt de référence est celui de la candidature expressément défini dans l'annexe. Le Prestataire confirme au Client, par écrit, la date de ce dépôt ou la date à laquelle il est prêt à être effectué, selon les modalités prévues dans l'annexe.</p>
      <p>Une échéance liée à une étape de service ne constitue pas une garantie d'admission, de réponse ou de réception d'une lettre. Elle demeure cependant soumise aux règles impératives applicables et aux dispositions du présent contrat relatives à l'arrêt des prestations et aux remboursements.</p>
    </div>
    <div class="section">
      <div class="section-title">Article 6 — Durée, report et fin du contrat</div>
      <p>Le contrat prend effet à la date de sa signature par les Parties et, lorsque l'annexe le prévoit, à la réception du premier paiement.</p>
      <p>Il prend fin lorsque les prestations définies dans l'annexe ont été réalisées, sauf fin anticipée, report convenu par écrit ou application d'une règle impérative.</p>
      <p>Le Client peut demander l'arrêt des prestations par écrit à l'adresse e-mail du Prestataire. Le Prestataire peut également mettre fin au contrat en cas de manquement important du Client, après lui avoir envoyé une demande écrite de régularisation et lui avoir laissé un délai raisonnable pour répondre ou corriger le manquement.</p>
      <p>En cas de fin anticipée :</p>
      ${bullets([
        "le Prestataire indique au Client les prestations déjà réalisées et celles qui restent à réaliser",
        "les sommes dues sont calculées en tenant compte des prestations effectivement réalisées et des frais éventuellement engagés et justifiés",
        "les montants payés au titre de prestations non réalisées sont traités conformément aux règles impératives applicables et aux conditions particulières figurant dans l'annexe",
        "aucune clause du présent contrat ne vaut renonciation à un droit auquel le Client ne peut renoncer en vertu de la loi applicable",
      ])}
    </div>
    <div class="section">
      <div class="section-title">Article 7 — Refus ou absence de réponse d'un établissement</div>
      <p>Le refus d'une candidature ou l'absence de réponse d'un établissement ne constitue pas, à lui seul, un manquement du Prestataire si celui-ci a réalisé les prestations prévues au contrat.</p>
      <p>Les échéances correspondant à des prestations effectivement réalisées peuvent rester dues, même si un établissement refuse une candidature ou ne répond pas, sous réserve des règles impératives applicables et des dispositions relatives à la fin anticipée du contrat.</p>
    </div>
    <div class="section">
      <div class="section-title">Article 8 — Frais de tiers</div>
      <p>Sauf mention écrite contraire dans l'annexe, le prix du contrat ne comprend pas notamment :</p>
      ${bullets([
        "les frais de candidature, d'inscription ou de scolarité",
        "les frais de cours de langue",
        "les frais de traduction, légalisation, certification ou authentification",
        "les frais de visa, de transport ou d'assurance",
        "le logement, le dépôt de garantie et les dépenses de vie en Chine",
        "les frais facturés par les établissements, administrations ou autres prestataires",
      ])}
      <p>Le Client demeure responsable du paiement de ces sommes aux organismes concernés. Le Prestataire doit informer le Client, dans la mesure des informations dont il dispose, lorsqu'un frais tiers est susceptible d'être nécessaire.</p>
    </div>
    <div class="section">
      <div class="section-title">Article 9 — Données personnelles et documents</div>
      <p>Le Prestataire utilise les informations et documents du Client dans la mesure nécessaire à la préparation et au suivi du projet d'études, à la gestion du contrat et au respect de ses obligations applicables.</p>
      <p>Lorsque cela est nécessaire à la candidature, les documents peuvent être communiqués aux établissements ou organismes concernés. Le Prestataire ne doit transmettre que les informations utiles au projet et doit éviter les usages sans rapport avec la prestation.</p>
      <p>Le Prestataire met à disposition du Client sa politique de confidentialité : ${escapeHtml(CONTRACT_PRIVACY_URL)}. Elle précise les catégories de données, les finalités, la conservation, les accès, les demandes du Client et les informations sur les transferts, dans la mesure où ces éléments y figurent. Elle ne remplace pas les consentements distincts éventuellement requis par les règles applicables.</p>
      <p>Le Client est invité à ne pas transmettre de documents non demandés ou qui ne sont pas nécessaires à son dossier.</p>
    </div>
    <div class="section">
      <div class="section-title">Article 10 — Communication et suivi</div>
      <p>Les échanges peuvent avoir lieu par e-mail, téléphone ou messagerie.</p>
      <p>Adresse de contact du Prestataire : ${escapeHtml(CONTACT_FROM_EMAIL)}</p>
      <p>Le Client doit maintenir des coordonnées valides et consulter régulièrement ses messages. Les demandes, avis de report, demandes d'arrêt et réclamations doivent être envoyés par écrit afin de permettre leur suivi.</p>
    </div>
    <div class="section">
      <div class="section-title">Article 11 — Réclamations et tentative de résolution amiable</div>
      <p>Toute réclamation relative au contrat peut être adressée à ${escapeHtml(CONTACT_FROM_EMAIL)}.</p>
      <p>Le Client est invité à indiquer son nom, la date du contrat, l'objet de sa demande et les éléments utiles à son examen.</p>
      <p>Les Parties cherchent d'abord à résoudre leur différend à l'amiable. Cette démarche ne prive pas le Client du droit de saisir une autorité, un organisme de médiation ou une juridiction compétente lorsque ces voies sont disponibles ou applicables dans son pays.</p>
    </div>
    <div class="section">
      <div class="section-title">Article 12 — Droit applicable et règlement des litiges</div>
      <p>Les Parties choisissent le droit de la République populaire de Chine comme droit régissant le présent contrat, sous réserve des règles impératives qui pourraient s'appliquer en raison du pays de résidence du Client ou de la situation des Parties.</p>
      <p>Le choix du droit chinois ne peut pas avoir pour effet de priver le Client des protections auxquelles il ne peut renoncer en vertu des règles impératives applicables à sa situation.</p>
      <p>En cas de différend, les Parties tenteront d'abord de parvenir à une solution amiable par échanges écrits. À défaut d'accord, le différend pourra être soumis à la juridiction compétente conformément aux règles applicables. Aucune disposition du présent contrat ne limite le droit du Client de saisir une juridiction qui serait compétente en vertu de règles impératives applicables.</p>
    </div>
    <div class="section">
      <div class="section-title">Article 13 — Langue et documents contractuels</div>
      <p>Le présent contrat et son annexe sont rédigés en français.</p>
      <p>Version faisant foi : français.</p>
      <p>Le contrat comprend le présent texte, l'annexe de la formule choisie, la politique de confidentialité et tout avenant écrit accepté par les Parties.</p>
      <p>En cas de contradiction entre le présent contrat et l'annexe concernant le contenu ou le prix de la formule, l'annexe prévaut pour ces seuls éléments. Les règles impératives applicables prévalent dans tous les cas.</p>
    </div>
    <div class="section">
      <div class="section-title">Article 14 — Acceptation et signatures</div>
      <p>Le Client reconnaît avoir reçu, lu et accepté le présent contrat et l'annexe correspondant à la formule choisie. Il reconnaît également avoir reçu ou avoir pu consulter la politique de confidentialité.</p>
      ${client.mineur ? `<p>${severalTutors ? "Ses représentants légaux déclarent signer" : "Son représentant légal déclare signer"} le contrat en son nom et l'avoir informé de ses principales conditions, dans la mesure adaptée à son âge.</p>` : ""}
      ${client.tiersPayeur ? "<p>Le Payeur reconnaît avoir pris connaissance des échéances et s'engage à les régler.</p>" : ""}
      <p><strong>Fait à :</strong> ${escapeHtml(CONTRACT_PLACE)}<br><strong>Le :</strong> ${escapeHtml(dateLabel)}</p>
      <p><strong>Le Prestataire</strong><br>Nom du représentant : ${escapeHtml(CONTRACT_REPRESENTATIVE)}<br>Fonction : ${escapeHtml(CONTRACT_ROLE)}</p>
      ${stampHtml()}
      <p style="margin-top:16px;"><strong>Le Client</strong><br>Nom : ${escapeHtml(fullName)}<br>Signature précédée de la mention « Lu et approuvé » :</p>
      ${minorSign}
      ${payerSign}
    </div>
    <div class="section">
      <div class="section-title">${escapeHtml(annex.title)}</div>
      ${annexIntro(formuleNumber, annex)}
      <p><strong>2. Prestations non incluses</strong></p>
      <p>Sauf accord écrit contraire, ne sont pas inclus :</p>
      ${bullets(annex.excluded)}
      <p><strong>3. Prix et échéancier</strong></p>
      <p>Devise de paiement : ${escapeHtml(CURRENCY_LABEL[pay.currency])}</p>
      <p>Prix total : ${escapeHtml(totalLabel)}</p>
      <p>Taux appliqué : ${escapeHtml(formatEuroFcfaRate())}.</p>
      ${scheduleTable(amounts, SCHEDULE_TRIGGERS)}
      <p>${escapeHtml(SCHEDULE_NOTE)}</p>
      <p>Mode de paiement : ${escapeHtml(pay.paymentMode || CONTRACT_BLANK)}</p>
      ${
        client.tiersPayeur
          ? `<p>Les échéances sont réglées par ${escapeHtml(payer.nom)}, ${escapeHtml(payer.lien)}.</p>`
          : ""
      }
      <p>Conditions particulières :</p>
    </div>
  `;

  const subject = withEtudeChineSubject(`Contrat d'accompagnement — ${fullName}`);
  const html = wrapEmailHtml({
    title: "Contrat de prestation d'accompagnement",
    subtitle: "Projet d'études en Chine",
    prenom: client.prenom,
    bodyHtml,
  });

  return { subject, html, formuleNumber };
}
