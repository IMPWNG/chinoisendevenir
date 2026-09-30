import { displayFormulePrice, getFormuleAccess, getFormuleByNumber } from "../formules";
import {
  getRequiredStudentDocuments,
  type StudentDocRef,
} from "../studentProgress";
import { CATEGORY_META } from "./constants";
import { canonicalDocuments, isCanonicalDocReceived } from "./documents";
import type { MatchingGap } from "./gaps";
import type { UniversityMatch } from "./narrative";
import type { MatchingStudent } from "./student";

export const NO_GUARANTEE =
  "Aucune admission, bourse ou visa n’est garantie.";

type ReportStudent = Partial<MatchingStudent> & {
  diploma?: unknown;
  dernier_diplome?: unknown;
};

type MixCounts = {
  safety: number;
  match: number;
  reach: number;
  unready: number;
};

type InventoryDoc = {
  key: string;
  name: string;
  status: string;
  note: string | null;
  university: string | null;
};

type FormulaInfo = {
  number: number | null;
  label: string;
  shortTitle?: string;
};

type ProfileFacts = ReturnType<typeof profileFacts>;
type MappedUniversity = ReturnType<typeof mapUniversity>;

export type DualReportsInput = {
  student?: ReportStudent;
  matches?: UniversityMatch[];
  excluded?: UniversityMatch[];
  gaps?: MatchingGap[];
  documents?: StudentDocRef[];
  recommendedFormula?: unknown;
};

export type DualReports = ReturnType<typeof buildDualReports>;

const DEGREE_LABELS: Record<string, string> = {
  bachelor: "Licence / Bachelor",
  master: "Master",
  phd: "Doctorat",
  language: "Année de langue",
};

const DIPLOMA_LABELS: Record<string, string> = {
  bac: "Baccalauréat",
  licence: "Licence",
  master: "Master",
  doctorat: "Doctorat",
  autre: "Autre diplôme",
};

const BREAKDOWN_ORDER: [string, string][] = [
  ["langue", "Langue"],
  ["academique", "Parcours"],
  ["financier", "Budget"],
  ["bourse", "Bourse"],
  ["age", "Âge"],
  ["localisation", "Ville"],
  ["motivation", "Projet"],
];

export const SCORE_WEIGHTS_LINE =
  "Score sur 100, moyenne pondérée : langue 25 %, parcours 25 %, budget 20 %, bourse 15 %, âge 5 %, ville 5 %, projet 5 %. Chaque note mesure l'écart avec les critères connus. Ce n'est pas une probabilité d'admission.";

const GENERIC_SCORE_NOTE =
  /compatibilité linguistique|gpa, diplôme et correspondance|ratio budget|pas de contrainte bourse|marge d'âge|pas de préférence de ville|ville demandée|région proche|hors des villes|clarté du projet|pas assez de texte|niveau de langue comparé/i;

export function blankOr(value: unknown, fallback = "à préciser") {
  if (value == null) return fallback;
  const text = String(value).trim();
  if (!text) return fallback;
  if (/^à (préciser|confirmer|vérifier)/i.test(text)) return fallback;
  if (/^non renseign/i.test(text)) return fallback;
  return text;
}

export function uniMissing(value: unknown) {
  return blankOr(value, "à vérifier auprès de l’université");
}

function degreeLabel(value: unknown) {
  if (!value) return "à préciser";
  const key = String(value);
  return DEGREE_LABELS[key] || key;
}

function diplomaLabel(value: unknown) {
  if (!value) return "à préciser";
  const key = String(value).toLowerCase();
  return DIPLOMA_LABELS[key] || String(value);
}

function formulaInfo(number: unknown): FormulaInfo {
  const n = Number(number) || 0;
  const formule = getFormuleByNumber(n);
  if (!formule) return { number: n || null, label: "à préciser" };
  return {
    number: formule.number,
    label: `Formule ${formule.number} — ${formule.shortTitle} — ${displayFormulePrice(formule)}`,
    shortTitle: formule.shortTitle,
  };
}

function categoryOf(item: UniversityMatch) {
  const key = item.categoryKey;
  const meta = (key && CATEGORY_META[key]) || CATEGORY_META.match;
  return {
    key: meta.key,
    label: meta.label,
    subtitle: meta.subtitle,
  };
}

function isHskKnown(student: ReportStudent) {
  return Boolean(
    (student.hsk === 0 || student.hsk) &&
      student.hskSource &&
      student.hskSource !== "default_beginner",
  );
}

function profileFacts(student: ReportStudent) {
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

function deadlineOf(item: UniversityMatch) {
  const raw = item.deadline;
  if (!raw || /^à vérifier/i.test(String(raw))) {
    return "à vérifier auprès de l’université";
  }
  return String(raw);
}

function costOf(item: UniversityMatch) {
  const tuition = item.cost_estimate?.tuition_cny;
  const tuitionMax = item.cost_estimate?.tuition_cny_max;
  if (tuition == null && tuitionMax == null) {
    return {
      label: "à vérifier auprès de l’université",
      tuition_cny: null as number | null,
      tuition_cny_max: null as number | null,
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

function breakdownBars(item: UniversityMatch) {
  const breakdown = item.breakdown || {};
  return BREAKDOWN_ORDER.map(([key, label]) => {
    const row = breakdown[key];
    if (!row) {
      return { key, label, points: null as number | null, max: null as number | null, note: "à préciser" as string | null };
    }
    return {
      key,
      label,
      points: row.points ?? null,
      max: row.max ?? null,
      note: row.note || null,
      status: row.status || null,
    };
  });
}

export function explainScore(
  key: string,
  row?: { points?: number | null; note?: string | null },
) {
  const note = String(row?.note || "").trim();
  if (note && !GENERIC_SCORE_NOTE.test(note)) {
    return /[.!?]$/.test(note) ? note : `${note}.`;
  }
  const points = row?.points;
  if (points == null) return "Ce critère ne peut pas être lu : l'information manque.";
  if (key === "langue") {
    if (points >= 70) return "Le niveau de langue atteint le seuil connu du programme.";
    if (points >= 40) return "Le niveau de langue est partiel : un renforcement est utile avant de candidater.";
    return "Le niveau de langue est en dessous du seuil du programme.";
  }
  if (key === "academique") {
    if (points >= 70) return "Le diplôme et le domaine correspondent à ce cursus.";
    if (points >= 40) return "Le parcours est proche, avec un diplôme ou une moyenne encore fragiles.";
    return "Le diplôme actuel est peu aligné avec le niveau visé.";
  }
  if (key === "financier") {
    if (points >= 80) return "Le budget indiqué couvre les frais connus.";
    if (points >= 50) return "Le budget est juste par rapport aux frais connus.";
    if (points >= 40) return "Le budget ou les frais ne sont pas assez renseignés pour trancher.";
    return "Le budget indiqué ne couvre pas les frais estimés sans bourse.";
  }
  if (key === "bourse") {
    if (points >= 100) return "Pas de besoin de bourse indiqué.";
    if (points >= 60) return "Des bourses sont listées. Leur obtention n'est pas automatique.";
    return "Peu de bourses sont documentées pour ce besoin de financement.";
  }
  if (key === "age") {
    if (points >= 80) return "L'âge est dans la limite connue, avec de la marge.";
    if (points >= 60) return "L'âge est proche de la limite, ou la limite n'est pas publiée.";
    return "L'âge dépasse la limite publiée.";
  }
  if (key === "localisation") {
    if (points >= 100) return "La ville fait partie de celles que vous avez indiquées.";
    if (points >= 80) return "Aucune ville de préférence n'est indiquée dans votre dossier.";
    if (points >= 70) return "La région est proche d'une ville que vous avez indiquée.";
    return "La ville est éloignée de celles que vous avez indiquées.";
  }
  if (key === "motivation") {
    if (points >= 70) return "Le projet écrit est assez clair pour être lu par une université.";
    return "Le texte de projet est trop court : le préciser rend le dossier plus lisible.";
  }
  return note || "Critère non détaillé.";
}

function scorePhrase(item: UniversityMatch) {
  const cat = categoryOf(item);
  if (item.score == null) return "Score de compatibilité : à préciser";
  return `${item.score}/100 — ${cat.subtitle}`;
}

function mixCounts(matches: UniversityMatch[] | null | undefined): MixCounts {
  const counts: MixCounts = { safety: 0, match: 0, reach: 0, unready: 0 };
  (matches || []).forEach((item) => {
    const key = item.categoryKey || "match";
    if (key === "safety" || key === "match" || key === "reach" || key === "unready") {
      counts[key] += 1;
    }
  });
  return counts;
}

function sortByScore(matches: UniversityMatch[] | null | undefined) {
  return [...(matches || [])].sort(
    (a, b) => (b.score || 0) - (a.score || 0),
  );
}

function documentInventory(
  documents: StudentDocRef[] = [],
  extraFromUnis: { name?: unknown; university?: string | null }[] = [],
  student: ReportStudent = {},
): InventoryDoc[] {
  const required: InventoryDoc[] = (documents || []).map((doc) => ({
    key: String(doc.key || ""),
    name: String(doc.label || doc.key || ""),
    status: doc.status === "received" ? "fourni" : "manquant",
    note: null,
    university: null,
  }));
  if (!required.length) {
    getRequiredStudentDocuments(student).forEach((doc) => {
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

function receivedUploadKeys(documents: StudentDocRef[] = []) {
  return documents
    .filter((doc) => doc.status === "received" || doc.status === "fourni")
    .map((doc) => String(doc.key || ""));
}

function groupStudentDocuments(
  matches: UniversityMatch[],
  documents: StudentDocRef[] = [],
) {
  const uploaded = receivedUploadKeys(documents);
  const seen = new Set<string>();
  const flat: InventoryDoc[] = [];
  const groups: { name: string; documents: InventoryDoc[] }[] = [];
  matches.forEach((item) => {
    const source = item.required_documents?.length
      ? item.required_documents
      : item.missing_documents;
    const fresh: InventoryDoc[] = [];
    canonicalDocuments(source).forEach((doc) => {
      const status = isCanonicalDocReceived(doc.key, uploaded) ? "fourni" : "manquant";
      const row: InventoryDoc = {
        key: doc.key,
        name: doc.label,
        status,
        note: null,
        university: item.university_name || null,
      };
      const existing = flat.find((entry) => entry.key === doc.key);
      if (existing) existing.status = status;
      else flat.push(row);
      if (seen.has(doc.key)) return;
      seen.add(doc.key);
      fresh.push(row);
    });
    if (fresh.length) {
      groups.push({
        name: item.university_name || "Université",
        documents: fresh,
      });
    }
  });
  return { flat, groups };
}

function toVerifyList(matches: UniversityMatch[] | null | undefined) {
  const seen = new Set<string>();
  const rows: string[] = [];
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

function detectLimitingFactor(
  student: ReportStudent,
  gaps: MatchingGap[] | null | undefined,
  docs: InventoryDoc[],
) {
  const missingDocs = docs.filter((doc) => doc.status === "manquant");
  const langueGaps = (gaps || []).filter((gap) => gap.type === "langue");
  const budgetUnknown = /préciser/i.test(
    String(student.budget?.label || student.budget || "à préciser"),
  );
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

function blockingFields(student: ReportStudent) {
  const rows: { field: string; note: string; blocking: boolean }[] = [];
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

function topUnlockActions(
  student: ReportStudent,
  gaps: MatchingGap[] | null | undefined,
  docs: InventoryDoc[],
) {
  const actions: string[] = [];
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

function universityRisks(
  matches: UniversityMatch[] | null | undefined,
  student: ReportStudent,
) {
  const rows: { university: string | null | undefined; risk: string }[] = [];
  (matches || []).forEach((item) => {
    const hskReq = item.hsk_required;
    const hskGap =
      isHskKnown(student) &&
      hskReq != null &&
      student.hsk != null &&
      student.hsk < hskReq;
    if (hskGap) {
      rows.push({
        university: item.university_name,
        risk: `HSK ${student.hsk} pour un seuil connu HSK ${hskReq}.`,
      });
    }
    (item.warnings || []).forEach((line) => {
      if (hskGap && /hsk/i.test(String(line))) return;
      rows.push({ university: item.university_name, risk: String(line) });
    });
  });
  const seen = new Set<string>();
  return rows
    .filter((row) => {
      const key = `${row.university}:${row.risk}`.toLowerCase();
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    })
    .slice(0, 8);
}

function applicationCap(formuleNumber: unknown) {
  return getFormuleAccess(formuleNumber).applications || 0;
}

function applicationMixAdvice(
  formuleNumber: unknown,
  counts: MixCounts,
  matches: MappedUniversity[] = [],
) {
  const cap = applicationCap(formuleNumber);
  const names = matches.slice(0, cap || matches.length).map((item) => item.name);
  const order = names.length ? ` Ordre proposé : ${names.join(", ")}.` : "";
  if (!cap) {
    return `Cet accompagnement cadre le projet. Il ne comprend pas le dépôt des candidatures.${order}`;
  }
  if (counts.safety === 0) {
    return `Jusqu’à ${cap} candidature${cap > 1 ? "s" : ""}. Aucune piste n’est encore confortable : commencez par les plus réalistes, et renforcez le dossier avant une université plus exigeante.${order}`;
  }
  return `Jusqu’à ${cap} candidature${cap > 1 ? "s" : ""}. Déposez d’abord l’établissement le mieux aligné, puis les options réalistes. Gardez une université plus exigeante seulement si le chinois et le diplôme suivent.${order}`;
}

function sentence(text: string) {
  const clean = String(text || "").replace(/\s+/g, " ").trim();
  if (!clean) return "";
  const cased = clean.charAt(0).toUpperCase() + clean.slice(1);
  return /[.!?]$/.test(cased) ? cased : `${cased}.`;
}

function studentStrengths(item: UniversityMatch, student: ReportStudent) {
  const lines: string[] = [];
  if (
    Number(student.formuleNumber) === 3 &&
    item.university?.chineseLanguageProgram &&
    (item.university.degrees || []).includes(String(student.targetDegree || ""))
  ) {
    lines.push(
      "Cette université propose une année de langue, puis le cursus indiqué dans votre dossier.",
    );
  }
  const hskReq = item.hsk_required;
  if (
    isHskKnown(student) &&
    hskReq != null &&
    student.hsk != null &&
    student.hsk >= hskReq
  ) {
    lines.push(
      `Le HSK ${student.hsk} atteint le seuil connu de ce programme, qui est HSK ${hskReq}.`,
    );
  }
  if (/anglais/i.test(String(item.teaching_language || "")) || item.university?.englishAvailable) {
    lines.push("Des programmes enseignés en anglais sont identifiés.");
  }
  const city = String(item.city || "").trim();
    if (city && !/^à vérifier/i.test(city)) {
      const province = String(item.province || "").trim();
      lines.push(
        province && province.toLowerCase() !== city.toLowerCase()
          ? `L'établissement est à ${city} (${province}).`
          : `L'établissement est à ${city}.`,
      );
    }
  if ((item.breakdown?.academique?.points || 0) >= 70) {
    lines.push("Le parcours correspond au niveau et au domaine visés.");
  }
  if ((item.breakdown?.financier?.points || 0) >= 80) {
    lines.push("Le budget indiqué couvre les frais connus.");
  }
  if (!lines.length) {
    lines.push("Peu d'éléments publiés confirment un alignement fort. Le détail est à vérifier avec nous.");
  }
  return lines.slice(0, 4);
}

function studentPrepare(item: UniversityMatch, student: ReportStudent) {
  const lines: string[] = [];
  const hskReq = item.hsk_required;
  const hskGap =
    isHskKnown(student) &&
    hskReq != null &&
    student.hsk != null &&
    student.hsk < hskReq;
  if (hskGap) {
    lines.push(
      `Avant de candidater, le chinois doit atteindre le HSK ${hskReq}. Le niveau actuel est HSK ${student.hsk}.`,
    );
  }
  (item.warnings || []).forEach((line) => {
    const text = String(line);
    if (/hsk/i.test(text)) return;
    if (/dipl[oô]me actuel peu align/i.test(text)) {
      lines.push("Le diplôme actuel est en dessous du niveau demandé pour ce cursus.");
      return;
    }
    if (/linguistique|peut bloquer|langue insuffisante/i.test(text)) {
      if (!lines.some((row) => /langue|chinois|hsk/i.test(row))) {
        lines.push("Le niveau de langue peut retarder une admission directe.");
      }
      return;
    }
    if (/budget insuffisant/i.test(text)) {
      lines.push("Sans bourse, le budget indiqué ne couvre pas les frais estimés.");
      return;
    }
    if (/âge proche|age proche/i.test(text)) {
      lines.push("L'âge est proche de la limite publiée par l'établissement.");
      return;
    }
    if (/gpa|moyenne/i.test(text)) {
      lines.push(sentence(text));
    }
  });
  if (
    (item.breakdown?.langue?.points || 100) <= 40 &&
    !lines.some((row) => /langue|chinois|hsk/i.test(row))
  ) {
    lines.push("Le niveau de langue peut retarder une admission directe.");
  }
  return [...new Set(lines)].slice(0, 4);
}

function factLines(item: UniversityMatch, cost: ReturnType<typeof costOf>) {
  const deadline = deadlineOf(item);
  const language = uniMissing(item.teaching_language);
  const grants = (item.scholarships_possible || []).map((name) => String(name));
  return [
    cost.tuition_cny == null && cost.tuition_cny_max == null
      ? "Frais connus : à vérifier auprès de l'université."
      : `Frais connus : ${cost.label}.`,
    /^à vérifier/i.test(deadline)
      ? "Date limite : à vérifier auprès de l'université."
      : `Date limite : ${deadline}.`,
    /^à vérifier/i.test(language)
      ? "Langue d'enseignement : à vérifier auprès de l'université."
      : `Langue d'enseignement : ${language}.`,
    grants.length
      ? `Bourses mentionnées : ${grants.join(", ")}. L'obtention n'est pas automatique.`
      : "Bourses mentionnées : aucune piste listée pour cet établissement.",
  ];
}

function mapUniversity(
  item: UniversityMatch,
  { best = false, student }: { best?: boolean; student: ReportStudent },
) {
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
    strengths: studentStrengths(item, student),
    vigilance: studentPrepare(item, student),
    documents: [] as string[],
    fact_lines: factLines(item, cost),
    to_verify: item.to_verify || [],
    confirmed: item.confirmed_information || [],
    breakdown: breakdownBars(item),
    readings: breakdownBars(item).map((row) => ({
      key: row.key,
      label: row.label,
      text: explainScore(row.key, row),
    })),
    qualitative: item.qualitative || cat.subtitle,
  };
}

function adminGuideline({
  formuleNumber,
  matches,
  docs,
  toVerify,
}: {
  formuleNumber: unknown;
  matches: UniversityMatch[];
  docs: InventoryDoc[];
  toVerify: string[];
}) {
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
        ? `${toVerify.length} point${toVerify.length > 1 ? "s" : ""} à confirmer, université par université.`
        : "Aucun critère automatique. Recoupez quand même chaque page d'admission.",
    },
    {
      step: "Documents",
      status: missing.length ? "a_faire" : received ? "fait" : "a_faire",
      action: total
        ? `${received} document${received > 1 ? "s" : ""} sur ${total} reçu${received > 1 ? "s" : ""}. Le détail est par université.`
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

function studentRoadmap({
  formuleNumber,
  student,
  docs,
  gaps,
  matches,
}: {
  formuleNumber: unknown;
  student: ReportStudent;
  docs: InventoryDoc[];
  gaps: MatchingGap[];
  matches: UniversityMatch[];
}) {
  const n = Number(formuleNumber) || 1;
  const cap = applicationCap(n);
  const missing = docs.filter((doc) => doc.status === "manquant");
  const budgetMissing = /préciser/i.test(
    String(student.budget?.label || student.budget || "à préciser"),
  );
  const steps: {
    n: number;
    step: string;
    status: string;
    you: string;
    we: string;
  }[] = [];
  let index = 1;

  const push = (row: { step: string; status: string; you: string; we: string }) => {
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

function fieldPhrase(field: string) {
  if (field === "à préciser") return "un domaine encore à préciser";
  if (field.length <= 5 && field === field.toUpperCase()) return field;
  return field.charAt(0).toLowerCase() + field.slice(1);
}

function degreePhrase(degree: string) {
  if (degree === "à préciser") return "un niveau encore à préciser";
  const lower = degree.toLowerCase();
  const article = /licence|année/.test(lower) ? "une" : "un";
  return `${article} ${lower}`;
}

function intakePhrase(value: string) {
  if (value === "à préciser") return "la rentrée souhaitée reste à préciser";
  const text = value.replace(/_/g, " ").replace(/\bseptembre\b/i, "automne");
  if (/^automne\b/i.test(text)) {
    return `la rentrée d'automne ${text.replace(/^automne\s*/i, "")}`.trim();
  }
  if (/^printemps\b/i.test(text)) {
    return `la rentrée de printemps ${text.replace(/^printemps\s*/i, "")}`.trim();
  }
  if (/^flexible$/i.test(text)) return "une rentrée flexible";
  return `la rentrée ${text}`;
}

function profileBlurb(facts: ProfileFacts) {
  const hsk =
    facts.hsk === "à préciser"
      ? "un niveau de chinois encore à préciser"
      : `un chinois ${facts.hsk}`;
  const english =
    facts.english === "à préciser"
      ? "un anglais encore à préciser"
      : `un anglais ${facts.english}`;
  return `Vous visez ${degreePhrase(facts.degree)} en ${fieldPhrase(facts.field)}, avec ${hsk} et ${english}, pour ${intakePhrase(facts.intake)}.`;
}

function joinFr(items: string[]) {
  if (items.length <= 1) return items[0] || "";
  return `${items.slice(0, -1).join(", ")} et ${items[items.length - 1]}`;
}

function analysisNote(
  facts: ProfileFacts,
  docs: InventoryDoc[],
  matches: MappedUniversity[],
  student: ReportStudent,
) {
  const parts: string[] = [];
  if (facts.completeness != null) {
    parts.push(`Votre dossier est renseigné à ${facts.completeness} %.`);
  }
  const top = matches[0];
  if (!top) {
    parts.push(
      "Aucune université n'est assez alignée pour être proposée. Il faut préciser le domaine, la langue ou le budget.",
    );
  } else {
    const weak = (top.readings || [])
      .filter((row) => {
        const source = top.breakdown?.find((item) => item.key === row.key);
        return source?.points != null && source.points < 45;
      })
      .map((row) => row.label.toLowerCase());
    parts.push(
      `${top.name} est la piste la plus proche de votre projet (${top.category.toLowerCase()}).`,
    );
    parts.push(
      weak.length
        ? `Le frein principal porte sur ${joinFr(weak)}.`
        : "Aucun critère majeur ne bloque cette piste.",
    );
  }
  const missing = docs.filter((doc) => doc.status === "manquant").length;
  if (missing > 1) {
    parts.push(`Il reste ${missing} pièces à déposer.`);
  } else if (missing === 1) {
    parts.push("Il reste une pièce à déposer.");
  } else if (docs.length) {
    parts.push("Les pièces demandées par ces universités sont déjà déposées.");
  }
  if (Number(student.formuleNumber) === 3) {
    parts.push(
      "Votre accompagnement commence par une année de langue, puis le cursus. Les établissements qui proposent les deux sont placés en premier.",
    );
  }
  return parts.join(" ");
}

function whyTop(matches: MappedUniversity[]) {
  const top = matches[0];
  if (!top) {
    return "Aucune université n'est assez alignée pour être proposée. Précisez le domaine, la langue ou le budget, puis relancez la sélection.";
  }
  const reason = (top.strengths?.[0] || top.category_subtitle || "").replace(/\.$/, "");
  const next = matches[1];
  const second = next ? ` ${next.name} vient ensuite, comme option ${next.category.toLowerCase()}.` : "";
  return `${top.name} est la piste à regarder en premier. ${sentence(reason)}${second} Ce classement compare votre profil aux critères publiés. Il ne promet pas une admission.`;
}

function draftClientResponse({
  student,
  facts,
  matches,
  mixAdvice,
}: {
  student: ReportStudent;
  facts: ProfileFacts;
  matches: MappedUniversity[];
  mixAdvice: string;
}) {
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
  ];
  return lines.join("\n");
}

function stripGuarantees(text: unknown) {
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
}: DualReportsInput = {}) {
  const purchased = formulaInfo(student.formuleNumber);
  const recommended = formulaInfo(recommendedFormula || student.formuleNumber);
  const facts = profileFacts(student);
  const ranked = sortByScore(matches);
  const counts = mixCounts(ranked);
  const groupedDocs = groupStudentDocuments(ranked, documents);
  const docs = groupedDocs.flat.length
    ? groupedDocs.flat
    : documentInventory(documents, [], student);
  const toVerify = toVerifyList(ranked);
  const best = ranked[0] || null;
  const mapped = ranked.map((item, index) =>
    mapUniversity(item, { best: index === 0, student }),
  );
  const limiting = detectLimitingFactor(student, gaps, docs);
  const inconsistencies = blockingFields(student);
  const mixAdvice = applicationMixAdvice(student.formuleNumber, counts, mapped);
  const noSafety =
    counts.safety === 0
      ? "Aucune piste n'est encore confortable. Élargir la zone, confirmer un cursus en anglais, ou renforcer le chinois et le diplôme avant de candidater."
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
      remaining_note: analysisNote(facts, docs, mapped, student),
    },
    facts,
    formule: purchased,
    universities: mapped,
    options_synthesis: {
      why_top: whyTop(mapped),
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
    documents_by_university: groupedDocs.groups,
    scholarships: { groups: [], disclaimer: "" },
    closing: "",
  };

  return { admin_report: admin, student_report: studentReport };
}

export function mergePolishedReports(
  draft: DualReports,
  polished: Record<string, unknown> | null | undefined,
) {
  if (!polished || typeof polished !== "object") return draft;
  const admin = { ...draft.admin_report, ai: true };
  const student = { ...draft.student_report, ai: true };
  const diag =
    polished.diagnostic &&
    typeof polished.diagnostic === "object" &&
    !Array.isArray(polished.diagnostic)
      ? (polished.diagnostic as Record<string, unknown>)
      : {};
  if (diag.limiting_factor) {
    admin.diagnostic.limiting_factor = String(diag.limiting_factor);
  }
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
    admin.diagnostic.inconsistencies = diag.inconsistencies.slice(
      0,
      6,
    ) as typeof admin.diagnostic.inconsistencies;
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
  if (
    polished.vigilance_rewrite &&
    typeof polished.vigilance_rewrite === "object" &&
    !Array.isArray(polished.vigilance_rewrite)
  ) {
    const rewrite = polished.vigilance_rewrite as Record<string, unknown>;
    student.universities = student.universities.map((uni) => {
      const lines = uni.name != null ? rewrite[String(uni.name)] : undefined;
      if (!Array.isArray(lines) || !lines.length) return uni;
      return {
        ...uni,
        vigilance: lines.map(stripGuarantees).filter(Boolean).slice(0, 4),
      };
    });
  }
  return { admin_report: admin, student_report: student };
}

export function reportsFromStored(
  result: {
    admin_report?: unknown;
    student_report?: unknown;
    student?: ReportStudent;
    matches?: UniversityMatch[] | Array<Record<string, unknown>>;
    excluded?: UniversityMatch[] | Array<Record<string, unknown>>;
    gaps?: MatchingGap[];
    recommended_formula?: unknown;
  } | null
    | undefined,
  { documents = [] }: { documents?: StudentDocRef[] } = {},
) {
  const built = buildDualReports({
    student: result?.student || {},
    matches: (result?.matches || []) as UniversityMatch[],
    excluded: (result?.excluded || []) as UniversityMatch[],
    gaps: result?.gaps || [],
    documents,
    recommendedFormula: result?.recommended_formula,
  });
  if (result?.admin_report && result?.student_report) {
    const storedAdmin = result.admin_report as DualReports["admin_report"];
    return {
      admin_report: {
        ...storedAdmin,
        alerts: built.admin_report.alerts,
        guideline: built.admin_report.guideline,
      },
      student_report: {
        ...built.student_report,
        disclaimer: built.student_report.disclaimer,
        roadmap: [],
      },
    };
  }
  return built;
}
