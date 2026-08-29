import { getFormuleAccess, getFormuleByNumber } from "../formules";
import { REQUIRED_STUDENT_DOCUMENTS } from "../studentProgress";
import { CATEGORY_META } from "./constants";

export const NO_GUARANTEE =
  "Aucune admission, bourse ou visa n’est garantie.";

const DEGREE_LABELS = {
  bachelor: "Licence / Bachelor",
  master: "Master",
  phd: "Doctorat",
  language: "Année de langue",
};

const DIPLOMA_LABELS = {
  bac: "Baccalauréat",
  licence: "Licence",
  master: "Master",
  doctorat: "Doctorat",
  autre: "Autre diplôme",
};

const BREAKDOWN_ORDER = [
  ["langue", "Langue"],
  ["academique", "Parcours"],
  ["financier", "Budget"],
  ["bourse", "Bourse"],
  ["age", "Âge"],
  ["localisation", "Ville"],
  ["motivation", "Projet"],
];

const SCHOLARSHIP_COPY = {
  csc: {
    type: "csc",
    title: "Bourses gouvernementales (CSC)",
    explanation:
      "Bourse nationale chinoise, très compétitive, dossier à soigner.",
  },
  provincial: {
    type: "provincial",
    title: "Bourses provinciales ou municipales",
    explanation:
      "Souvent plus accessibles, propres à la région de l’université.",
  },
  university: {
    type: "university",
    title: "Bourses universitaires",
    explanation:
      "Décidées par l’établissement lui-même, critères variables.",
  },
};

export function blankOr(value, fallback = "à préciser") {
  if (value == null) return fallback;
  const text = String(value).trim();
  if (!text) return fallback;
  if (/^à (préciser|confirmer|vérifier)/i.test(text)) return fallback;
  if (/^non renseign/i.test(text)) return fallback;
  return text;
}

export function uniMissing(value) {
  return blankOr(value, "à vérifier auprès de l’université");
}

function degreeLabel(value) {
  if (!value) return "à préciser";
  return DEGREE_LABELS[value] || value;
}

function diplomaLabel(value) {
  if (!value) return "à préciser";
  return DIPLOMA_LABELS[String(value).toLowerCase()] || value;
}

function formulaInfo(number) {
  const n = Number(number) || 0;
  const formule = getFormuleByNumber(n);
  if (!formule) return { number: n || null, label: "à préciser" };
  return {
    number: formule.number,
    label: `Formule ${formule.number} — ${formule.shortTitle} (${formule.price})`,
    shortTitle: formule.shortTitle,
  };
}

function categoryOf(item) {
  const key = item.categoryKey;
  const meta = CATEGORY_META[key] || CATEGORY_META.match;
  return {
    key: meta.key,
    label: meta.label,
    subtitle: meta.subtitle,
  };
}

function isHskKnown(student) {
  return (
    (student.hsk === 0 || student.hsk) &&
    student.hskSource &&
    student.hskSource !== "default_beginner"
  );
}

function profileFacts(student) {
  const hskKnown = isHskKnown(student);
  return {
    name: student.prenom || student.name || null,
    field: blankOr(student.fieldPrecis || student.field),
    diploma: diplomaLabel(student.dernierDiplome || student.diploma),
    degree: degreeLabel(student.targetDegree),
    degreeSource: student.targetDegreeSource || null,
    intake: blankOr(student.intake?.label || student.intake),
    hsk: hskKnown ? `HSK ${student.hsk}` : "à préciser",
    hskKnown,
    english: blankOr(student.english),
    budget: blankOr(student.budget?.label || student.budget),
    country: blankOr(student.country),
    age: student.age != null ? `${student.age} ans` : "à préciser",
    gpa: student.gpa != null ? `${student.gpa}/4` : "à préciser",
    completeness:
      student.qualityScore != null ? Number(student.qualityScore) : null,
  };
}

function deadlineOf(item) {
  const raw = item.deadline;
  if (!raw || /^à vérifier/i.test(String(raw))) {
    return "à vérifier auprès de l’université";
  }
  return String(raw);
}

function costOf(item) {
  const tuition = item.cost_estimate?.tuition_cny;
  const tuitionMax = item.cost_estimate?.tuition_cny_max;
  if (tuition == null && tuitionMax == null) {
    return {
      label: "à vérifier auprès de l’université",
      tuition_cny: null,
      tuition_cny_max: null,
      status: item.cost_estimate?.status || "missing",
    };
  }
  const min = Number(tuition).toLocaleString("fr-FR");
  const max =
    tuitionMax != null && tuitionMax !== tuition
      ? Number(tuitionMax).toLocaleString("fr-FR")
      : null;
  return {
    label: max ? `${min} à ${max} RMB / an` : `${min} RMB / an`,
    tuition_cny: tuition ?? null,
    tuition_cny_max: tuitionMax ?? null,
    status: item.cost_estimate?.status || "confirmed",
  };
}

function breakdownBars(item) {
  const breakdown = item.breakdown || {};
  return BREAKDOWN_ORDER.map(([key, label]) => {
    const row = breakdown[key];
    if (!row) {
      return { key, label, points: null, max: null, note: "à préciser" };
    }
    return {
      key,
      label,
      points: row.points,
      max: row.max,
      note: row.note || null,
      status: row.status || null,
    };
  });
}

function scorePhrase(item) {
  const cat = categoryOf(item);
  if (item.score == null) return "Score de compatibilité : à préciser";
  return `${item.score}/100 — ${cat.subtitle}`;
}

function mixCounts(matches) {
  const counts = { safety: 0, match: 0, reach: 0, unready: 0 };
  (matches || []).forEach((item) => {
    const key = item.categoryKey || "match";
    if (counts[key] != null) counts[key] += 1;
  });
  return counts;
}

function sortByScore(matches) {
  return [...(matches || [])].sort(
    (a, b) => (b.score || 0) - (a.score || 0),
  );
}

function documentInventory(documents = [], extraFromUnis = []) {
  const required = (documents || []).map((doc) => ({
    key: doc.key,
    name: doc.label || doc.key,
    status: doc.status === "received" ? "fourni" : "manquant",
    note: null,
    university: null,
  }));
  if (!required.length) {
    REQUIRED_STUDENT_DOCUMENTS.forEach((doc) => {
      required.push({
        key: doc.key,
        name: doc.label,
        status: "manquant",
        note: null,
        university: null,
      });
    });
  }
  const seen = new Set(required.map((doc) => doc.name.toLowerCase()));
  extraFromUnis.forEach((entry) => {
    const name = String(entry.name || "").trim();
    if (!name) return;
    const key = name.toLowerCase();
    if (seen.has(key)) return;
    seen.add(key);
    required.push({
      key: `uni:${key}`,
      name,
      status: "manquant",
      note: entry.university
        ? `Demandé pour ${entry.university}`
        : "Propre à une université",
      university: entry.university || null,
    });
  });
  return required;
}

function extraUniDocuments(matches) {
  const rows = [];
  (matches || []).forEach((item) => {
    (item.missing_documents || []).forEach((name) => {
      rows.push({ name, university: item.university_name });
    });
  });
  return rows;
}

function toVerifyList(matches) {
  const seen = new Set();
  const rows = [];
  (matches || []).forEach((item) => {
    (item.to_verify || []).forEach((line) => {
      const key = `${item.university_name}:${line}`;
      if (seen.has(key)) return;
      seen.add(key);
      rows.push(`${item.university_name} — ${line}`);
    });
  });
  return rows;
}

function detectLimitingFactor(student, gaps, docs) {
  const missingDocs = docs.filter((doc) => doc.status === "manquant");
  const langueGaps = (gaps || []).filter((gap) => gap.type === "langue");
  const budgetUnknown = /préciser/i.test(String(student.budget?.label || student.budget || "à préciser"));
  const hskUnknown = !isHskKnown(student);

  if (hskUnknown || langueGaps.length >= 2) {
    return {
      key: "langue",
      note: hskUnknown
        ? "Le niveau de chinois n’est pas renseigné : impossible de juger les cursus en chinois sans cette info."
        : "Le niveau de langue bloque plusieurs universités du mix.",
    };
  }
  if (budgetUnknown) {
    return {
      key: "budget",
      note: "Le budget est à préciser : sans fourchette annuelle, le conseiller ne peut pas valider la soutenabilité des frais.",
    };
  }
  if (missingDocs.length >= 2) {
    return {
      key: "documents",
      note: `${missingDocs.length} document${missingDocs.length > 1 ? "s" : ""} manquant${missingDocs.length > 1 ? "s" : ""} : le dépôt ne peut pas avancer tant qu’ils ne sont pas reçus.`,
    };
  }
  if (student.gpa == null) {
    return {
      key: "academique",
      note: "La moyenne n’est pas renseignée : les établissements sélectifs ne peuvent pas être tranchés.",
    };
  }
  if (student.age == null) {
    return {
      key: "age",
      note: "L’âge n’est pas renseigné : certaines limites d’âge universitaires restent à vérifier.",
    };
  }
  return {
    key: "documents",
    note: "Le dossier est lisible, mais des confirmations restent à prendre auprès des universités.",
  };
}

function blockingFields(student) {
  const rows = [];
  if (!student.field) {
    rows.push({ field: "domaine", note: "Domaine d’études à préciser avant de figer la sélection.", blocking: true });
  }
  if (!student.budget?.label && !student.budget) {
    rows.push({ field: "budget", note: "Budget annuel à préciser — bloquant pour avancer.", blocking: true });
  }
  if (!isHskKnown(student) && !student.english) {
    rows.push({
      field: "langue",
      note: "Ni HSK ni anglais renseignés : à demander en priorité à l’appel.",
      blocking: true,
    });
  }
  if (student.targetDegreeSource !== "confirmed") {
    rows.push({
      field: "niveau visé",
      note: "Le niveau visé est estimé depuis le diplôme, pas confirmé par l’étudiant.",
      blocking: false,
    });
  }
  return rows;
}

function topUnlockActions(student, gaps, docs) {
  const actions = [];
  if (!student.budget?.label && !student.budget) {
    actions.push("Obtenir le budget annuel disponible (fourchette réelle, hors bourse).");
  }
  if (!isHskKnown(student)) {
    actions.push("Faire évaluer le chinois (HSK) ou confirmer un cursus enseigné en anglais.");
  }
  const missing = docs.filter((doc) => doc.status === "manquant").slice(0, 2);
  if (missing.length) {
    actions.push(
      `Récupérer les documents manquants : ${missing.map((doc) => doc.name).join(", ")}.`,
    );
  }
  const langue = (gaps || []).find((gap) => gap.type === "langue" && gap.conseil);
  if (langue && actions.length < 3) actions.push(langue.conseil);
  const gpa = (gaps || []).find((gap) => gap.type === "academique");
  if (gpa && actions.length < 3) actions.push(gpa.conseil);
  if (actions.length < 3) {
    actions.push("Confirmer auprès des universités les critères encore marqués « à vérifier ».");
  }
  return actions.slice(0, 3);
}

function universityRisks(matches, student) {
  const rows = [];
  (matches || []).forEach((item) => {
    const hskReq = item.hsk_required;
    if (isHskKnown(student) && hskReq != null && student.hsk < hskReq) {
      rows.push({
        university: item.university_name,
        risk: `HSK ${student.hsk} pour un seuil connu HSK ${hskReq}.`,
      });
    }
    (item.warnings || []).slice(0, 1).forEach((line) => {
      rows.push({ university: item.university_name, risk: line });
    });
  });
  const seen = new Set();
  return rows.filter((row) => {
    const key = `${row.university}:${row.risk}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  }).slice(0, 8);
}

function applicationCap(formuleNumber) {
  return getFormuleAccess(formuleNumber).applications || 0;
}

function applicationMixAdvice(formuleNumber, counts) {
  const cap = applicationCap(formuleNumber);
  if (!cap) {
    return "Cette formule ne comprend pas le dépôt de candidatures. Les établissements ci-dessous servent à cadrer le projet.";
  }
  if (counts.safety === 0) {
    return `Jusqu’à ${cap} candidature${cap > 1 ? "s" : ""} : aucune piste classée « sûre » pour l’instant. On vise d’abord les réalistes, et on renforce le dossier avant d’ajouter une ambitieuse.`;
  }
  if (cap >= 5) {
    return `Avec jusqu’à ${cap} candidatures, une répartition utile est 1 sûre, 3 réalistes et 1 ambitieuse — à ajuster selon les places réellement ouvertes.`;
  }
  return `Avec jusqu’à ${cap} candidatures, visez 1 sûre et ${Math.max(cap - 1, 1)} réaliste${cap - 1 > 1 ? "s" : ""}, plus une ambitieuse seulement si le dossier le permet.`;
}

function constructiveVigilance(item, student) {
  const lines = [];
  const hskReq = item.hsk_required;
  if (isHskKnown(student) && hskReq != null && student.hsk < hskReq) {
    lines.push(
      `Un renforcement du chinois est recommandé avant candidature (HSK ${hskReq} visé, HSK ${student.hsk} actuel).`,
    );
  }
  (item.warnings || []).forEach((line) => {
    const text = String(line);
    const hskMatch = text.match(/HSK\s*(\d).*HSK\s*(\d)/i);
    if (hskMatch) {
      lines.push(
        `Un renforcement du niveau de chinois est recommandé avant candidature (HSK ${hskMatch[2]} visé, HSK ${hskMatch[1]} actuel).`,
      );
      return;
    }
    lines.push(text.replace(/insuffisant/gi, "à renforcer").replace(/bloque/gi, "peut retarder"));
  });
  return [...new Set(lines)].slice(0, 4);
}

function mapUniversity(item, { best = false, student }) {
  const cat = categoryOf(item);
  const cost = costOf(item);
  return {
    id: item.university_id,
    name: item.university_name,
    city: item.city || "à vérifier auprès de l’université",
    score: item.score,
    score_phrase: scorePhrase(item),
    best_match: best,
    categoryKey: cat.key,
    category: cat.label,
    category_subtitle: cat.subtitle,
    language: uniMissing(item.teaching_language),
    deadline: deadlineOf(item),
    cost,
    scholarships: item.scholarships_possible?.length
      ? item.scholarships_possible
      : [],
    strengths: (item.strengths || []).slice(0, 4),
    vigilance: constructiveVigilance(item, student),
    documents: item.missing_documents || [],
    to_verify: item.to_verify || [],
    confirmed: item.confirmed_information || [],
    breakdown: breakdownBars(item),
    qualitative: item.qualitative || cat.subtitle,
  };
}

function groupScholarships(matches) {
  const names = [
    ...new Set((matches || []).flatMap((item) => item.scholarships_possible || [])),
  ];
  const groups = {
    csc: { ...SCHOLARSHIP_COPY.csc, names: [] },
    provincial: { ...SCHOLARSHIP_COPY.provincial, names: [] },
    university: { ...SCHOLARSHIP_COPY.university, names: [] },
  };
  names.forEach((name) => {
    const key = String(name).toLowerCase();
    if (/csc|gouvernement|china scholarship/i.test(key)) groups.csc.names.push(name);
    else if (/provinc|municip|ville|city|local/i.test(key)) groups.provincial.names.push(name);
    else groups.university.names.push(name);
  });
  return Object.values(groups);
}

function adminGuideline({ formuleNumber, matches, docs, toVerify }) {
  const n = Number(formuleNumber) || 1;
  const cap = applicationCap(n);
  const received = docs.filter((doc) => doc.status === "fourni").length;
  const total = docs.length;
  const missing = docs.filter((doc) => doc.status === "manquant");
  const steps = [
    {
      step: "Analyse du profil",
      status: "fait",
      action: "Générée par l’algorithme — à valider avec l’étudiant à l’appel.",
    },
    {
      step: "Sélection d’universités",
      status: matches.length ? "fait" : "a_faire",
      action: matches.length
        ? `${matches.length} université${matches.length > 1 ? "s" : ""} retenue${matches.length > 1 ? "s" : ""}.`
        : "Aucune université retenue — préciser domaine, langue ou budget.",
    },
    {
      step: "Vérification des critères",
      status: toVerify.length ? "a_faire" : "en_cours",
      action: toVerify.length
        ? `${toVerify.length} point${toVerify.length > 1 ? "s" : ""} à confirmer auprès de l’université : ${toVerify.slice(0, 4).join(" · ")}`
        : "Aucun critère « à vérifier » listé dans le catalogue — recouper quand même les pages admission.",
    },
    {
      step: "Documents",
      status: missing.length ? "a_faire" : received ? "fait" : "a_faire",
      action: total
        ? `${received} document${received > 1 ? "s" : ""} sur ${total} reçu${received > 1 ? "s" : ""}${
            missing.length
              ? ` — manquent : ${missing.map((doc) => doc.name).join(", ")}`
              : ""
          }.`
        : "Liste de pièces encore à établir.",
    },
  ];
  if (n >= 2) {
    steps.push({
      step: "Candidatures déposées",
      status: "a_faire",
      action: `0/${cap} candidature${cap > 1 ? "s" : ""} déposée${cap > 1 ? "s" : ""} pour l’instant.`,
    });
    steps.push({
      step: "Suivi des réponses",
      status: "a_faire",
      action: "Pas encore de dépôt : le suivi commencera après envoi des dossiers.",
    });
  }
  if (n >= 3) {
    steps.push({
      step: "Visa",
      status: "a_faire",
      action: "Orientation visa après une offre d’admission — démarches officielles à la charge de l’étudiant.",
    });
    steps.push({
      step: "Logement et départ",
      status: "a_faire",
      action: "Orientation logement / arrivée après admission — réservations à la charge de l’étudiant.",
    });
  }
  return steps;
}

function studentRoadmap({ formuleNumber, student, docs, gaps, matches }) {
  const n = Number(formuleNumber) || 1;
  const cap = applicationCap(n);
  const missing = docs.filter((doc) => doc.status === "manquant");
  const budgetMissing = /préciser/i.test(String(student.budget?.label || student.budget || "à préciser"));
  const steps = [];
  let index = 1;

  const push = (row) => {
    steps.push({ n: index, ...row });
    index += 1;
  };

  if (budgetMissing) {
    push({
      step: "Préciser le budget prévisionnel",
      status: "bloquant",
      you: "Indiquez votre budget annuel disponible.",
      we: "Nous recoupons ensuite les frais connus des universités.",
    });
  } else {
    push({
      step: "Budget prévisionnel",
      status: "fait",
      you: "Fourchette déjà indiquée — dites-nous s’il faut la mettre à jour.",
      we: "Nous l’avons croisée avec les frais connus du catalogue.",
    });
  }

  if (!isHskKnown(student)) {
    push({
      step: "Préciser le niveau de chinois",
      status: "bloquant",
      you: "Faites évaluer le HSK, ou confirmez un cursus en anglais.",
      we: "Nous ajustons la sélection dès que le niveau est connu.",
    });
  } else {
    const langueGap = (gaps || []).find((gap) => gap.type === "langue");
    push({
      step: "Niveau de chinois",
      status: langueGap ? "a_venir" : "fait",
      you: langueGap
        ? langueGap.conseil
        : "Niveau renseigné — signalez-nous un nouveau score HSK s’il change.",
      we: "Nous indiquons où un renforcement est utile avant de candidater.",
    });
  }

  push({
    step: "Rassembler les documents manquants",
    status: missing.length ? "a_venir" : "fait",
    you: missing.length
      ? `À fournir : ${missing.map((doc) => doc.name).join(", ")}.`
      : "Les pièces demandées dans l’espace sont reçues.",
    we: "Nous vérifions la cohérence dès réception.",
  });

  push({
    step: "Sélection finale des universités",
    status: matches.length ? "en_cours" : "a_venir",
    you: "Notez vos préférences (ville, langue, budget) avant l’appel.",
    we: "Nous vous conseillons lors de l’échange pour figer la liste.",
  });

  if (n >= 2) {
    push({
      step: "Dépôt des candidatures",
      status: "a_venir",
      you: "Validez la liste et transmettez les pièces demandées.",
      we: `Nous préparons et déposons jusqu’à ${cap} candidature${cap > 1 ? "s" : ""}.`,
    });
    push({
      step: "Suivi des réponses",
      status: "a_venir",
      you: "Surveillez votre boîte mail et les portails universitaires.",
      we: "Nous suivons les réponses et vous aidons à les lire.",
    });
  }

  if (n >= 3) {
    push({
      step: "Visa, logement, départ",
      status: "a_venir",
      you: "Les démarches officielles restent à votre charge.",
      we: "Nous vous orientons (pièces, calendrier, points de vigilance).",
    });
  }

  return steps;
}

function profileBlurb(facts) {
  const field = facts.field === "à préciser" ? "un domaine encore à préciser" : facts.field;
  const degree = facts.degree === "à préciser" ? "un niveau encore à préciser" : `un ${facts.degree}`;
  const hsk =
    facts.hsk === "à préciser"
      ? "le niveau de chinois reste à préciser"
      : `un niveau de chinois ${facts.hsk}`;
  const english =
    facts.english === "à préciser"
      ? "l’anglais n’est pas encore renseigné"
      : `un anglais ${facts.english}`;
  const intake =
    facts.intake === "à préciser"
      ? "la rentrée souhaitée reste à préciser"
      : `pour une rentrée ${facts.intake}`;
  return `Vous visez ${degree} en ${field}, avec ${hsk} et ${english} — ${intake}.`;
}

function completenessNote(facts, docs) {
  const pct = facts.completeness;
  const missing = docs.filter((doc) => doc.status === "manquant");
  if (pct == null) {
    return missing.length
      ? `Il reste ${missing.length} pièce${missing.length > 1 ? "s" : ""} à rassembler : ${missing.map((doc) => doc.name).join(", ")}.`
      : "Précisez les champs encore vides pour affiner les recommandations.";
  }
  if (missing.length) {
    return `Votre dossier est complété à ${pct} % — il reste à rassembler : ${missing.map((doc) => doc.name).join(", ")}.`;
  }
  return `Votre dossier est complété à ${pct} %.`;
}

function whyTop(top) {
  if (!top) {
    return "Aucune université assez compatible n’a été retenue avec les données actuelles. Précisez le domaine, la langue ou le budget pour relancer la sélection.";
  }
  return `${top.name} ressort en tête (${top.score_phrase}). ${top.strengths[0] || top.category_subtitle}`;
}

function closingText(student, formule) {
  const name = student.prenom ? `${student.prenom}, ` : "";
  const title = formule.shortTitle || formule.label || "votre accompagnement";
  return `${name}nous restons disponibles pour relire ce compte rendu ensemble. Vous avez souscrit ${title}. Écrivez-nous ou prenons un appel pour caler les prochaines étapes.`;
}

function draftClientResponse({ student, facts, matches, formule, mixAdvice }) {
  const name = student.prenom || "Bonjour";
  const top = matches[0];
  const lines = [
    `${name},`,
    "",
    profileBlurb(facts),
    "",
    top
      ? `Parmi les établissements retenus, ${top.name} est le mieux aligné avec votre profil aujourd’hui (${top.score_phrase}).`
      : "Nous n’avons pas encore d’établissement assez compatible avec les données actuelles.",
    "",
    mixAdvice,
    "",
    NO_GUARANTEE,
    "",
    closingText(student, formule),
  ];
  return lines.join("\n");
}

function stripGuarantees(text) {
  return String(text || "")
    .replace(/\b(garanti|garantie|garanties|garantir)\b/gi, "visé")
    .replace(/forte probabilité d[’']admission/gi, "bon alignement avec les critères connus")
    .replace(/vous serez admis/gi, "une admission pourra être visée")
    .replace(/\s{2,}/g, " ")
    .trim();
}

export function buildDualReports({
  student = {},
  matches = [],
  excluded = [],
  gaps = [],
  documents = [],
  recommendedFormula = null,
} = {}) {
  const purchased = formulaInfo(student.formuleNumber);
  const recommended = formulaInfo(recommendedFormula || student.formuleNumber);
  const facts = profileFacts(student);
  const ranked = sortByScore(matches);
  const counts = mixCounts(ranked);
  const extraDocs = extraUniDocuments(ranked);
  const docs = documentInventory(documents, extraDocs);
  const toVerify = toVerifyList(ranked);
  const best = ranked[0] || null;
  const mapped = ranked.map((item, index) =>
    mapUniversity(item, { best: index === 0, student }),
  );
  const limiting = detectLimitingFactor(student, gaps, docs);
  const inconsistencies = blockingFields(student);
  const mixAdvice = applicationMixAdvice(student.formuleNumber, counts);
  const noSafety =
    counts.safety === 0
      ? "Aucune université n’est classée « sûre » pour l’instant. On peut élargir la zone géographique, confirmer un cursus en anglais, ou renforcer le dossier avant de candidater."
      : null;

  const header = {
    classified_count: ranked.length,
    excluded_count: (excluded || []).length,
    recommended_formula: recommended,
    purchased_formula: purchased,
    formula_mismatch:
      Boolean(purchased.number && recommended.number && purchased.number !== recommended.number),
    completeness_pct: facts.completeness,
    mix: {
      safety: counts.safety,
      match: counts.match,
      reach: counts.reach,
    },
    best_match: best
      ? {
          name: best.university_name,
          score: best.score,
          category: categoryOf(best).label,
        }
      : null,
  };

  const admin = {
    generated_at: new Date().toISOString(),
    ai: false,
    header,
    diagnostic: {
      limiting_factor: limiting.key,
      limiting_factor_note: limiting.note,
      top_actions: topUnlockActions(student, gaps, docs),
      inconsistencies,
    },
    guideline: adminGuideline({
      formuleNumber: student.formuleNumber,
      matches: ranked,
      docs,
      toVerify,
    }),
    alerts: {
      call_clarifications: inconsistencies.map((row) => row.note),
      university_risks: universityRisks(ranked, student),
      blocking_fields: inconsistencies.filter((row) => row.blocking),
    },
    draft_client_response: draftClientResponse({
      student,
      facts,
      matches: mapped,
      formule: purchased,
      mixAdvice,
    }),
    inconsistency_flag: inconsistencies.some((row) => row.blocking),
    universities: ranked,
  };

  const studentReport = {
    generated_at: admin.generated_at,
    ai: false,
    disclaimer: NO_GUARANTEE,
    profile_blurb: profileBlurb(facts),
    completeness: {
      pct: facts.completeness,
      remaining_note: completenessNote(facts, docs),
    },
    facts,
    formule: purchased,
    universities: mapped,
    options_synthesis: {
      why_top: whyTop(mapped[0]),
      application_mix: mixAdvice,
      no_safety_note: noSafety,
    },
    roadmap: studentRoadmap({
      formuleNumber: student.formuleNumber,
      student,
      docs,
      gaps,
      matches: ranked,
    }),
    documents: docs,
    scholarships: {
      groups: groupScholarships(ranked),
      disclaimer:
        "Aucune de ces bourses n’est automatique — elles seront visées lors de la constitution du dossier.",
    },
    closing: closingText(student, purchased),
  };

  return { admin_report: admin, student_report: studentReport };
}

export function mergePolishedReports(draft, polished) {
  if (!polished || typeof polished !== "object") return draft;
  const admin = { ...draft.admin_report, ai: true };
  const student = { ...draft.student_report, ai: true };
  const diag = polished.diagnostic || {};
  if (diag.limiting_factor) admin.diagnostic.limiting_factor = diag.limiting_factor;
  if (diag.limiting_factor_note) {
    admin.diagnostic.limiting_factor_note = stripGuarantees(diag.limiting_factor_note);
  }
  if (Array.isArray(diag.top_actions) && diag.top_actions.length) {
    admin.diagnostic.top_actions = diag.top_actions
      .map((item) => stripGuarantees(item))
      .filter(Boolean)
      .slice(0, 3);
  }
  if (Array.isArray(diag.inconsistencies) && diag.inconsistencies.length) {
    admin.diagnostic.inconsistencies = diag.inconsistencies.slice(0, 6);
  }
  if (polished.draft_client_response) {
    admin.draft_client_response = stripGuarantees(polished.draft_client_response);
  }
  if (polished.profile_blurb) student.profile_blurb = stripGuarantees(polished.profile_blurb);
  if (polished.completeness_remaining_note) {
    student.completeness = {
      ...student.completeness,
      remaining_note: stripGuarantees(polished.completeness_remaining_note),
    };
  }
  if (polished.why_top) {
    student.options_synthesis = {
      ...student.options_synthesis,
      why_top: stripGuarantees(polished.why_top),
    };
  }
  if (polished.application_mix) {
    student.options_synthesis = {
      ...student.options_synthesis,
      application_mix: stripGuarantees(polished.application_mix),
    };
  }
  if (polished.no_safety_note != null) {
    student.options_synthesis = {
      ...student.options_synthesis,
      no_safety_note: polished.no_safety_note
        ? stripGuarantees(polished.no_safety_note)
        : student.options_synthesis.no_safety_note,
    };
  }
  if (polished.closing) student.closing = stripGuarantees(polished.closing);
  if (polished.vigilance_rewrite && typeof polished.vigilance_rewrite === "object") {
    student.universities = student.universities.map((uni) => {
      const lines = polished.vigilance_rewrite[uni.name];
      if (!Array.isArray(lines) || !lines.length) return uni;
      return {
        ...uni,
        vigilance: lines.map(stripGuarantees).filter(Boolean).slice(0, 4),
      };
    });
  }
  return { admin_report: admin, student_report: student };
}

export function reportsFromStored(result, { documents = [] } = {}) {
  if (result?.admin_report && result?.student_report) {
    return {
      admin_report: result.admin_report,
      student_report: result.student_report,
    };
  }
  return buildDualReports({
    student: result?.student || {},
    matches: result?.matches || [],
    excluded: result?.excluded || [],
    gaps: result?.gaps || [],
    documents,
    recommendedFormula: result?.recommended_formula,
  });
}
