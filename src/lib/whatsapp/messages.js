import { FORMULES, EXTRA_FEES, displayFormuleLabel } from "../formules.js";
import { SITE_URL } from "../emailLayout.js";

const COUNTRY_CALLING_CODES = [
  { code: "33", names: ["france"] },
  { code: "32", names: ["belgique", "belgium"] },
  { code: "41", names: ["suisse", "switzerland"] },
  { code: "352", names: ["luxembourg"] },
  { code: "1", names: ["canada"] },
  { code: "212", names: ["maroc", "morocco"] },
  { code: "213", names: ["algerie", "algérie", "algeria"] },
  { code: "216", names: ["tunisie", "tunisia"] },
  { code: "221", names: ["senegal", "sénégal"] },
  { code: "223", names: ["mali"] },
  { code: "224", names: ["guinee", "guinée", "guinea"] },
  { code: "225", names: ["ivoire", "ivory"] },
  { code: "226", names: ["burkina"] },
  { code: "227", names: ["niger", "nigér"] },
  { code: "228", names: ["togo"] },
  { code: "229", names: ["benin", "bénin"] },
  { code: "230", names: ["maurice", "mauritius"] },
  { code: "231", names: ["liberia"] },
  { code: "232", names: ["sierra"] },
  { code: "233", names: ["ghana"] },
  { code: "234", names: ["nigeria", "nigéria"] },
  { code: "235", names: ["tchad", "chad"] },
  { code: "236", names: ["centrafrique", "centrafricaine"] },
  { code: "237", names: ["cameroun", "cameroon"] },
  { code: "238", names: ["cap-vert", "cap vert"] },
  { code: "239", names: ["principe"] },
  { code: "240", names: ["guinee equatoriale", "guinée équatoriale"] },
  { code: "241", names: ["gabon"] },
  { code: "242", names: ["congo-brazzaville", "brazzaville"] },
  { code: "243", names: ["rdc", "congo-kinshasa", "kinshasa", "congo democratique"] },
  { code: "244", names: ["angola"] },
  { code: "245", names: ["bissau"] },
  { code: "250", names: ["rwanda"] },
  { code: "257", names: ["burundi"] },
  { code: "261", names: ["madagascar"] },
  { code: "262", names: ["reunion", "réunion", "mayotte"] },
  { code: "269", names: ["comores"] },
  { code: "86", names: ["chine", "china"] },
  { code: "852", names: ["hong kong"] },
];

function fold(value) {
  return String(value || "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
}

export function digitsOnly(value) {
  return String(value || "").replace(/\D/g, "");
}

const KEEP_NATIONAL_ZERO = new Set(["225"]);

export function callingCodeFromCountry(pays) {
  const haystack = fold(pays);
  if (!haystack) return "";
  const match = COUNTRY_CALLING_CODES.find((item) =>
    item.names.some((name) => haystack.includes(name)),
  );
  if (match) return match.code;
  if (haystack.includes("congo")) return "242";
  return "";
}

function withCountryCode(digits, countryCode) {
  if (!countryCode) return digits.replace(/^0+/, "") || digits;
  let rest = digits;
  if (rest.startsWith(countryCode)) {
    rest = rest.slice(countryCode.length);
  }
  if (!KEEP_NATIONAL_ZERO.has(countryCode)) {
    rest = rest.replace(/^0+/, "");
  }
  return rest ? `${countryCode}${rest}` : countryCode;
}

export function normalizeWhatsAppNumber(phone, pays) {
  const raw = String(phone || "").trim();
  if (!raw) return "";

  const international = raw.startsWith("+") || raw.startsWith("00");
  const digits = digitsOnly(international && raw.startsWith("00") ? raw.slice(2) : raw);
  if (!digits) return "";

  const fromNumber = COUNTRY_CALLING_CODES.find((item) =>
    digits.startsWith(item.code),
  )?.code;
  const fromCountry = callingCodeFromCountry(pays);
  const countryCode = fromNumber || fromCountry;

  if (international || fromNumber) {
    return withCountryCode(digits, countryCode || fromNumber);
  }

  if (fromCountry) {
    return withCountryCode(digits, fromCountry);
  }

  if (digits.startsWith("0") && digits.length >= 9 && digits.length <= 11) {
    return "";
  }

  return digits.replace(/^0+/, "") || digits;
}

export function isValidWhatsAppNumber(digits) {
  return /^\d{8,15}$/.test(String(digits || ""));
}

export function whatsappNumberFromContact(contact) {
  return normalizeWhatsAppNumber(contact?.phone, contact?.pays);
}

export function phonesMatch(storedPhone, incomingWaId, pays) {
  const incoming = digitsOnly(incomingWaId);
  if (!incoming) return false;

  const normalized = normalizeWhatsAppNumber(storedPhone, pays);
  if (normalized && normalized === incoming) return true;

  const stored = digitsOnly(storedPhone);
  if (!stored) return false;
  if (stored === incoming) return true;

  const a = stored.replace(/^0+/, "").slice(-8);
  const b = incoming.slice(-8);
  return a.length >= 8 && a === b;
}

export function buildWhatsAppLink(phoneDigits, text) {
  const phone = digitsOnly(phoneDigits);
  const encoded = encodeURIComponent(String(text || ""));
  if (!phone) return "";
  return encoded
    ? `https://wa.me/${phone}?text=${encoded}`
    : `https://wa.me/${phone}`;
}

function greeting(prenom) {
  const name = String(prenom || "").trim();
  return name ? `Bonjour ${name},` : "Bonjour,";
}

function generateRelance1Text(contact) {
  return `${greeting(contact?.prenom)}

Vous nous avez récemment contactés au sujet de votre projet d'études en Chine.

Afin d'étudier votre profil avec précision, merci de renseigner le formulaire sur notre site :
${SITE_URL}

Si vous avez déjà transmis ces informations, répondez simplement à ce message pour nous le confirmer.

Nous restons à votre disposition.
Chinois en Devenir`;
}

function generateRelance2Text(contact) {
  return `${greeting(contact?.prenom)}

Vous nous avez contactés concernant un projet d'études en Chine.

Votre projet est-il toujours d'actualité (orientation, candidature ou bourse) ?

Si oui, répondez *Oui* à ce message. Nous reviendrons ensuite vers vous pour les prochaines étapes.

Chinois en Devenir`;
}

function generateFormulesText(contact) {
  const cards = FORMULES.map((formule) => {
    return `*Formule ${formule.number} — ${formule.shortTitle}* — ${formule.price}
${formule.intro}`;
  }).join("\n\n");

  const extras = EXTRA_FEES.slice(0, 5)
    .map((item) => `• ${item}`)
    .join("\n");

  return `${greeting(contact?.prenom)}

Merci pour votre projet d'études en Chine. Voici nos formules d'accompagnement :

${cards}

_Les frais universitaires, traductions officielles, visa, logement et billets restent à votre charge._
${extras}

Répondez par *1*, *2* ou *3* selon la formule qui vous correspond. Ce choix n'est pas un engagement : nous vous proposons ensuite un appel pour confirmer ensemble.

Chinois en Devenir
${SITE_URL}`;
}

function generateFormuleConfirmeeText(contact, extras = {}) {
  const displayed = displayFormuleLabel(extras.formuleLabel);
  return `${greeting(contact?.prenom)}

Nous avons bien noté votre intérêt pour :
*${displayed}*

Ce choix n'est pas encore un engagement. Il nous permet de préparer un appel pour étudier votre projet et confirmer ensemble la formule.

Nous revenons vers vous rapidement. Merci de rester joignable sur ce numéro.

Chinois en Devenir`;
}

export const WHATSAPP_TEMPLATES = {
  formules_presentation: {
    action: "whatsapp_formules",
    description: "WhatsApp formules d'accompagnement envoyé",
    status: "choix_des_formules",
    generateText: (contact) => generateFormulesText(contact),
  },
  relance_1: {
    action: "relance_1",
    description: "Relance 1 WhatsApp envoyée — formulaire à remplir",
    status: "relance_1_envoyée",
    generateText: (contact) => generateRelance1Text(contact),
  },
  relance_2: {
    action: "relance_2",
    description: "Relance 2 WhatsApp envoyée — confirmation d'intérêt",
    status: "relance_2_envoyée",
    generateText: (contact) => generateRelance2Text(contact),
  },
  formule_confirmee: {
    action: "whatsapp_envoye",
    description: "Confirmation WhatsApp de la formule choisie",
    status: "formule_choisie",
    generateText: (contact, extras = {}) =>
      generateFormuleConfirmeeText(contact, extras),
  },
  custom: {
    action: "whatsapp_envoye",
    description: "Message WhatsApp envoyé",
    status: null,
    generateText: (_contact, extras = {}) =>
      String(extras.customMessage || "").trim(),
  },
};

export function generateWhatsAppText(templateKey, contact, extras = {}) {
  const template = WHATSAPP_TEMPLATES[templateKey];
  if (!template) return "";
  return String(template.generateText(contact, extras) || "").trim();
}

export const WHATSAPP_TEMPLATE_OPTIONS = [
  { value: "relance_1", label: "🔔 Relance 1 — Formulaire à remplir" },
  { value: "relance_2", label: "🔔 Relance 2 — Toujours intéressé(e) ?" },
  {
    value: "formules_presentation",
    label: "📋 Formules d'accompagnement",
  },
  { value: "custom", label: "✏️ Message libre" },
];
