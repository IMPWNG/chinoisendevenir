import { SITE_URL, wrapEmailHtml, escapeHtml } from "./emailLayout.js";

export const AUTO_REPLY_MARKER = (intentKey) => `[auto:${intentKey}]`;

const BOURSES_URL = `${SITE_URL}bourses`;
const VISA_URL = `${SITE_URL}visa-etudiant-chine`;
const LANGUE_URL = `${SITE_URL}ecoles-de-langue-chine`;
const ETUDIER_URL = `${SITE_URL}etudier-en-chine`;
const PROCESSUS_URL = `${SITE_URL}processus`;
const TARIFS_URL = `${SITE_URL}tarifs`;

function linkHtml(href, label) {
  return `<a href="${href}" class="cta-link">${escapeHtml(label)}</a>`;
}

function formCtaHtml() {
  return `
            <div class="cta">
              <p>Pour étudier votre profil avec précision, complétez le formulaire sur notre site :</p>
              <a href="${SITE_URL}" class="cta-link">${SITE_URL}</a>
              <p style="margin-top:14px;">Si vous souhaitez ensuite recevoir nos formules d'accompagnement, répondez simplement :</p>
              <div class="cta-choice">Je souhaite recevoir les informations sur l'accompagnement.</div>
            </div>`;
}

function pageCtaHtml(href, label) {
  return `
            <div class="cta">
              <p>Plus de détail sur cette question :</p>
              ${linkHtml(href, label)}
            </div>`;
}

export const EMAIL_INTENTS = {
  bourses: {
    key: "bourses",
    templateKey: "reponse_bourses",
    label: "Bourses d'études",
    weight: 12,
    patterns: [
      /\bbourse(s)?\b/i,
      /\bscholarship(s)?\b/i,
      /\bcsc\b/i,
      /\bfinancement\b/i,
      /\baide(s)?\s+financi[eè]re(s)?\b/i,
      /\betudes?\s+gratuites?\b/i,
      /\bfrais\s+de\s+scolarite\s+gratuit/i,
      /\bprise\s+en\s+charge\b/i,
    ],
  },
  visa: {
    key: "visa",
    templateKey: "reponse_visa",
    label: "Visa étudiant",
    weight: 10,
    patterns: [
      /\bvisa\b/i,
      /\bx1\b/i,
      /\bx2\b/i,
      /\bjw\s?201\b/i,
      /\bjw\s?202\b/i,
      /\bconsulat\b/i,
      /\bambassade\b/i,
      /\bpermis\s+de\s+s[eé]jour\b/i,
      /\bpreuve\s+de\s+fonds?\b/i,
      /\bpreuve\s+de\s+fond(s)?\b/i,
    ],
  },
  langue: {
    key: "langue",
    templateKey: "reponse_langue",
    label: "École de langue / année de chinois",
    weight: 9,
    patterns: [
      /\b[eé]cole(s)?\s+de\s+langue\b/i,
      /\bann[eé]e\s+de\s+chinois\b/i,
      /\bann[eé]e\s+de\s+langue\b/i,
      /\bapprendre\s+le\s+chinois\b/i,
      /\bcours\s+de\s+chinois\b/i,
      /\bhsk\b/i,
      /\bsans\s+(ielts|toefl|hsk)\b/i,
      /\bpr[eé]paratoire\b/i,
    ],
  },
  tarifs: {
    key: "tarifs",
    templateKey: "formules_presentation",
    label: "Tarifs / formules",
    weight: 8,
    patterns: [
      /\btarif(s)?\b/i,
      /\bprix\b/i,
      /\bcombien\s+(co[uû]te|faut[- ]il|est[- ]ce)/i,
      /\bformules?\s+d['’]?accompagnement\b/i,
      /\bhonoraires?\b/i,
      /\bco[uû]t\s+(de\s+l['’]accompagnement|de\s+vos\s+services)\b/i,
    ],
  },
  admission: {
    key: "admission",
    templateKey: "reponse_admission",
    label: "Admission universitaire",
    weight: 6,
    patterns: [
      /\badmission\b/i,
      /\bcandidature(s)?\b/i,
      /\buniversit[eé](s)?\b/i,
      /\binscription\s+(en|à|a)\s+(licence|master|doctorat|universit)/i,
      /\bdossier\s+d['’]admission\b/i,
      /\bconditions?\s+d['’]admission\b/i,
    ],
  },
  processus: {
    key: "processus",
    templateKey: "reponse_processus",
    label: "Processus / délais",
    weight: 5,
    patterns: [
      /\bprocessus\b/i,
      /\b[eé]tapes?\b/i,
      /\bd[eé]lais?\b/i,
      /\bcombien\s+de\s+temps\b/i,
      /\bquand\s+(faut[- ]il|commencer|candidater)\b/i,
      /\brentr[eé]e\b/i,
      /\bseptembre\s+20\d{2}\b/i,
    ],
  },
  general: {
    key: "general",
    templateKey: "reponse_general",
    label: "Premier contact",
    weight: 2,
    patterns: [
      /\b[eé]tudier\s+en\s+chine\b/i,
      /\bvenir\s+(faire\s+)?(mes\s+)?[eé]tudes\s+en\s+chine\b/i,
      /\bprojet\s+d['’][eé]tudes\b/i,
      /\bje\s+(souhaite|voudrais|aimerais|veux)\s+(venir|partir|m['’]inscrire|etudier)/i,
    ],
  },
};

const INTENT_ORDER = [
  "bourses",
  "visa",
  "langue",
  "tarifs",
  "admission",
  "processus",
  "general",
];

export function normalizeIntentText(text) {
  return String(text || "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/['’]/g, "'");
}

export function detectEmailIntent(text, subject = "") {
  const normalized = normalizeIntentText(`${subject}\n${text}`);
  let best = null;
  let bestScore = 0;

  for (const key of INTENT_ORDER) {
    const intent = EMAIL_INTENTS[key];
    let hits = 0;
    for (const pattern of intent.patterns) {
      pattern.lastIndex = 0;
      if (pattern.test(normalized)) hits += 1;
    }
    if (!hits) continue;
    const score = hits * intent.weight;
    if (score > bestScore) {
      bestScore = score;
      best = intent;
    }
  }

  return best;
}

export function autoReplyMarker(intentKey) {
  return AUTO_REPLY_MARKER(intentKey);
}

export function descriptionHasAutoMarker(description, intentKey) {
  return String(description || "").includes(AUTO_REPLY_MARKER(intentKey));
}

export function alreadySentIntentReply(actions, intentKey) {
  const rows = Array.isArray(actions) ? actions : [];
  if (intentKey === "tarifs") {
    return rows.some((row) => {
      const action = String(row?.action || "");
      const description = String(row?.description || "");
      return (
        action === "email_formules" ||
        descriptionHasAutoMarker(description, "tarifs") ||
        /formules d['’]accompagnement envoy/i.test(description)
      );
    });
  }

  return rows.some((row) =>
    descriptionHasAutoMarker(row?.description, intentKey),
  );
}

const THANKS_OR_SCHEDULING = [
  /^(merci|ok|d'accord|daccord|oui|je suis partant|c'est note)\b/i,
  /\brendez[- ]vous\b/i,
  /\bdisponible\b/i,
  /\bcreneau\b/i,
  /\bhoraire\b/i,
  /\bappelez[- ]moi\b/i,
];

export function isThanksOrScheduling(text) {
  const value = normalizeIntentText(text).trim();
  if (!value) return false;
  if (value.length > 280) return false;
  return THANKS_OR_SCHEDULING.some((pattern) => pattern.test(value));
}

export function shouldSkipIntentAutoReply(intentKey, text) {
  if (!intentKey) return true;
  const value = String(text || "").trim();
  if (value.length < 12) return true;
  if (intentKey === "general" && (value.length < 60 || isThanksOrScheduling(value))) {
    return true;
  }
  if (intentKey === "processus" && isThanksOrScheduling(value)) {
    return true;
  }
  return false;
}

function titleCaseWord(word) {
  const value = String(word || "");
  if (!value) return "";
  if (value.includes("-")) {
    return value
      .split("-")
      .map((part) => titleCaseWord(part))
      .join("-");
  }
  return value.charAt(0).toUpperCase() + value.slice(1).toLowerCase();
}

export function splitPersonName(fullName) {
  const parts = String(fullName || "")
    .replace(/["']/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .split(" ")
    .filter(Boolean)
    .filter((part) => !part.includes("@"));

  if (!parts.length) return { prenom: "", nom: "" };
  if (parts.length === 1) {
    return { prenom: titleCaseWord(parts[0]), nom: "" };
  }

  const caps = parts.filter(
    (part) => part === part.toUpperCase() && /[A-ZÀ-Ÿ]{2,}/.test(part),
  );
  if (caps.length === 1) {
    const nom = caps[0];
    const prenom = parts.filter((part) => part !== nom).join(" ");
    return { prenom: titleCaseWord(prenom), nom: titleCaseWord(nom) };
  }

  return {
    prenom: titleCaseWord(parts[0]),
    nom: parts.slice(1).map((part) => titleCaseWord(part)).join(" "),
  };
}

export function displayNameFromFrom(from) {
  if (!from) return "";
  if (Array.isArray(from)) return displayNameFromFrom(from[0]);
  if (typeof from === "object") {
    return String(from.name || from.displayName || "").trim();
  }
  const value = String(from).trim();
  const match = value.match(/^(.*?)\s*<[^>]+>/);
  const name = (match ? match[1] : "").replace(/["']/g, "").trim();
  if (!name || name.includes("@")) return "";
  return name;
}

export function nameFromBody(text) {
  const body = String(text || "");
  const match = body.match(
    /\b[Jj]e suis\s+([A-ZÀ-Ÿ][A-Za-zÀ-ÿ'’-]+(?:\s+[A-ZÀ-Ÿ][A-Za-zÀ-ÿ'’-]+){0,3})/,
  );
  return match ? match[1].trim() : "";
}

export function extractPersonName({ fromHeader, text } = {}) {
  const fromName = displayNameFromFrom(fromHeader);
  if (fromName) return splitPersonName(fromName);
  const bodyName = nameFromBody(text);
  if (bodyName) return splitPersonName(bodyName);
  return { prenom: "", nom: "" };
}

export function shouldCreateContactFromInbound(text, subject = "") {
  const body = String(text || "").trim();
  if (body.length >= 40) return true;
  return Boolean(detectEmailIntent(body, subject));
}

export function generateBoursesReplyTemplate(prenom) {
  return wrapEmailHtml({
    title: "Bourses d'études en Chine",
    subtitle: "Une aide possible, jamais automatique",
    prenom,
    bodyHtml: `
            <div class="section">
              <p>Merci pour votre message au sujet des bourses d'études en Chine.</p>
              <p>Les bourses ne sont pas automatiques. Une mention au baccalauréat, même bien, ne déclenche aucun financement. L'attribution dépend de plusieurs éléments, notamment :</p>
              <ul class="formule-list">
                <li>Vos notes et la cohérence de votre dossier scolaire</li>
                <li>Votre projet d'études et le programme visé en Chine</li>
                <li>L'université, le niveau (licence, master, doctorat ou année de langue)</li>
                <li>Votre niveau de langue (chinois ou anglais selon le cursus)</li>
                <li>Votre âge, le calendrier, et le nombre de places / quotas</li>
              </ul>
            </div>
            <div class="note">
              <h4>Un point important</h4>
              <p>Si vous avez absolument besoin d'une bourse pour pouvoir venir étudier en Chine, ce n'est pas une base solide. Les bourses viennent uniquement en aide : elles peuvent réduire le coût, parfois largement, mais rien n'est dû, et rien n'est garanti.</p>
              <p>Pour le visa étudiant chinois, les autorités demanderont une preuve de fonds dans tous les cas, même si une bourse est ensuite obtenue. Il faut donc pouvoir montrer que le projet est finançable, bourse ou non.</p>
            </div>
            <div class="section">
              <p>Les pistes les plus courantes sont la bourse du gouvernement chinois (CSC), les bourses d'université, de province ou de ville. Selon les cas, elles peuvent couvrir la scolarité, parfois le logement, l'assurance et une allocation. Le calendrier CSC est en général plus précoce qu'une candidature payante.</p>
              <p>Beaucoup d'étudiants internationaux étudient en Chine sans bourse, avec un calendrier souvent plus souple. Notre rôle est de vous aider à identifier les options réalistes pour votre profil, puis à préparer un dossier cohérent. Nous ne garantissons aucune attribution.</p>
            </div>
            ${pageCtaHtml(BOURSES_URL, "Voir les bourses d'études en Chine")}
            ${formCtaHtml()}
    `,
  });
}

export function generateVisaReplyTemplate(prenom) {
  return wrapEmailHtml({
    title: "Visa étudiant pour la Chine",
    subtitle: "Après l'admission, pas avant",
    prenom,
    bodyHtml: `
            <div class="section">
              <p>Merci pour votre question sur le visa étudiant chinois.</p>
              <p>Le visa vient en fin de parcours : d'abord un projet d'études réaliste, puis le dossier, l'admission, ensuite seulement le formulaire JW201 ou JW202 et le rendez-vous consulaire. Sans lettre d'admission et sans JW201/JW202, le consulat ne traite en général pas une demande d'études.</p>
            </div>
            <div class="section">
              <div class="section-title">Les points essentiels</div>
              <ul class="formule-list">
                <li>Visa X1 : séjour d'études de plus de 180 jours (licence, master, doctorat ou année de langue)</li>
                <li>Visa X2 : séjour plus court, souvent moins de 180 jours</li>
                <li>Pièces fréquentes : passeport, formulaire, photo, lettre d'admission, JW201 ou JW202</li>
                <li>Une preuve de fonds, un certificat médical ou une assurance peuvent aussi être demandés, selon le consulat</li>
              </ul>
              <p>Les exigences précises dépendent du consulat de votre pays de résidence. La décision appartient aux autorités chinoises : nous préparons un dossier cohérent, nous ne garantissons pas l'obtention du visa.</p>
            </div>
            ${pageCtaHtml(VISA_URL, "Voir le guide du visa étudiant")}
            ${formCtaHtml()}
    `,
  });
}

export function generateLangueReplyTemplate(prenom) {
  return wrapEmailHtml({
    title: "Année de chinois en Chine",
    subtitle: "Un premier pas réaliste, surtout sans HSK",
    prenom,
    bodyHtml: `
            <div class="section">
              <p>Merci pour votre message au sujet d'une école de langue ou d'une année de chinois en Chine.</p>
              <p>Sans HSK, une licence ou un master enseigné en chinois est en général inaccessible. Sans IELTS ou TOEFL, les programmes enseignés en anglais le sont aussi le plus souvent. Dans ce cas, une année (ou un semestre) de chinois dans une université chinoise est souvent le meilleur premier pas : immersion, visa étudiant, puis candidature universitaire ensuite.</p>
            </div>
            <div class="note">
              <h4>À retenir</h4>
              <p>L'inscription en langue et l'admission en licence ou master sont deux dossiers distincts. L'année de chinois améliore le profil et le HSK, mais elle ne mène pas automatiquement à l'université.</p>
            </div>
            <div class="section">
              <p>Les programmes de chinois pour internationaux acceptent en général les débutants. Le format le plus courant est un an, avec une rentrée principale en septembre. Notre formule 1 accompagne l'inscription en école de langue et la préparation du visa. La formule 3 combine cette année de chinois puis l'admission universitaire.</p>
            </div>
            ${pageCtaHtml(LANGUE_URL, "Voir les écoles de langue en Chine")}
            ${formCtaHtml()}
    `,
  });
}

export function generateAdmissionReplyTemplate(prenom) {
  return wrapEmailHtml({
    title: "Admission dans une université chinoise",
    subtitle: "Un dossier complet, une décision de l'université",
    prenom,
    bodyHtml: `
            <div class="section">
              <p>Merci pour votre question sur l'admission en Chine.</p>
              <p>Les universités examinent en général le parcours académique, la cohérence du projet, le passeport, et un niveau de langue. Une licence demande souvent un baccalauréat ou équivalent ; un master demande une licence. L'âge, les places disponibles et le calendrier de la rentrée pèsent aussi.</p>
            </div>
            <div class="section">
              <div class="section-title">Documents souvent demandés</div>
              <ul class="formule-list">
                <li>Diplômes et relevés de notes, souvent traduits</li>
                <li>Passeport valide et photo</li>
                <li>Lettre de motivation, CV, parfois lettres de recommandation</li>
                <li>Certificat de langue : HSK, IELTS ou TOEFL selon le programme</li>
                <li>Certificat médical selon les établissements</li>
              </ul>
              <p>Comptez en général 4 à 6 mois entre le premier échange et le départ, davantage pour une bourse CSC. Nous préparons un dossier sérieux et conforme. La décision d'admission appartient à l'université : elle n'est jamais garantie.</p>
            </div>
            ${pageCtaHtml(ETUDIER_URL, "Voir le guide pour étudier en Chine")}
            ${formCtaHtml()}
    `,
  });
}

export function generateProcessusReplyTemplate(prenom) {
  return wrapEmailHtml({
    title: "Le processus pour étudier en Chine",
    subtitle: "En général 4 à 6 mois",
    prenom,
    bodyHtml: `
            <div class="section">
              <p>Merci pour votre question sur les étapes et les délais.</p>
              <p>Le parcours type dure souvent 4 à 6 mois : orientation, université, dossier, résultats, puis visa et départ. La rentrée principale a lieu en septembre ; une rentrée de printemps existe aussi, souvent en février ou mars. Pour une bourse CSC, il faut en général commencer plus tôt.</p>
            </div>
            <div class="section">
              <div class="section-title">Ordre des démarches</div>
              <ul class="formule-list">
                <li>Analyse du profil et choix d'un projet réaliste</li>
                <li>Candidature universitaire ou inscription en école de langue</li>
                <li>Réponses des établissements</li>
                <li>JW201/JW202, visa étudiant, puis départ</li>
              </ul>
              <p>Le visa ne se demande pas en premier. Réserver un vol non flexible trop tôt est risqué. Nous vous guidons sur ces étapes ; les décisions restent celles des universités, des organismes de bourses et des consulats.</p>
            </div>
            ${pageCtaHtml(PROCESSUS_URL, "Voir le processus d'admission")}
            ${formCtaHtml()}
    `,
  });
}

export function generateGeneralReplyTemplate(prenom) {
  return wrapEmailHtml({
    title: "Votre projet d'études en Chine",
    subtitle: "Nous avons bien reçu votre message",
    prenom,
    bodyHtml: `
            <div class="section">
              <p>Merci de nous avoir écrits au sujet d'un projet d'études en Chine.</p>
              <p>Venir étudier en Chine est possible en licence, master, doctorat ou année de langue. Le projet tient en cinq points : une formation adaptée, une université qui recrute des internationaux, un dossier d'admission complet, un financement (bourse éventuelle ou frais payants), puis un visa étudiant.</p>
            </div>
            <div class="note">
              <p>Aucune admission, bourse ou visa n'est automatique. Les décisions finales appartiennent aux universités, aux organismes de bourses et aux autorités concernées. Notre rôle : vous conseiller et vous aider à constituer un dossier cohérent.</p>
            </div>
            <div class="section">
              <p>Pour vous répondre précisément, nous avons besoin de votre parcours, de votre diplôme, de votre domaine, de votre calendrier et de votre budget. Le formulaire ci-dessous nous permet de faire cette première lecture.</p>
            </div>
            ${pageCtaHtml(TARIFS_URL, "Voir nos formules d'accompagnement")}
            ${formCtaHtml()}
    `,
  });
}

export const INTENT_TEMPLATE_GENERATORS = {
  reponse_bourses: generateBoursesReplyTemplate,
  reponse_visa: generateVisaReplyTemplate,
  reponse_langue: generateLangueReplyTemplate,
  reponse_admission: generateAdmissionReplyTemplate,
  reponse_processus: generateProcessusReplyTemplate,
  reponse_general: generateGeneralReplyTemplate,
};
