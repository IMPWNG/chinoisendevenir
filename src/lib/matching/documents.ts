import { normalizeText } from "./constants";
import { getStudentDocumentSpec, studentHasDiplomaUpload } from "../studentProgress";

export type CanonDoc = { key: string; label: string };

const LABELS: Record<string, string> = {
  passeport: "Passeport",
  photo: "Photo d'identité",
  high_school_diploma: "Diplôme de fin d'études secondaires",
  bachelor_degree: "Diplôme de licence",
  master_degree: "Diplôme de master",
  diplome: "Diplôme",
  transcripts: "Relevés de notes",
  hsk: "Certificat HSK",
  ielts_or_toefl: "IELTS ou TOEFL",
  csca: "CSCA",
  formulaire_medical: "Formulaire médical",
  casier_judiciaire: "Extrait de casier judiciaire",
  motivation: "Lettre de motivation",
  recommendation: "Lettres de recommandation",
  video: "Vidéo de présentation",
  financial_proof: "Preuve de financement",
  application_form: "Formulaire de candidature",
  resume: "CV",
};

const DIPLOMA_KEYS = new Set([
  "high_school_diploma",
  "bachelor_degree",
  "master_degree",
  "diplome",
]);

function add(keys: string[], key: string) {
  if (!keys.includes(key)) keys.push(key);
}

/** One raw university string can hide several pieces (HSK + anglais). */
export function classifyDocument(value: unknown) {
  const source = String(value || "");
  const text = normalizeText(
    typeof value === "object" && value && "type" in value
      ? (value as { type?: unknown }).type
      : source,
  );
  const raw =
    typeof value === "object" && value && "type" in value
      ? String((value as { type?: unknown }).type || "")
      : source;
  if (!text && !raw.trim()) return [] as string[];

  const keys: string[] = [];
  const photo =
    /passport photo|photo d identite|photo identite|id photo/.test(text) ||
    (/照片/.test(raw) && !/照片页/.test(raw));
  if (photo) add(keys, "photo");
  if (!photo && (/passport|passeport/.test(text) || /护照/.test(raw))) {
    add(keys, "passeport");
  }
  if (/transcript|releve|marksheet|academic record/.test(text) || /成绩/.test(raw)) {
    add(keys, "transcripts");
  }
  if (/high school|senior high|secondary school|lycee|baccalaureat|\bbac\b/.test(text)) {
    add(keys, "high_school_diploma");
  }
  if (/bachelor|licence|undergraduate degree/.test(text)) add(keys, "bachelor_degree");
  if (/\bmaster\b|maitrise/.test(text)) add(keys, "master_degree");
  const specificDiploma = keys.some((key) => DIPLOMA_KEYS.has(key) && key !== "diplome");
  if (
    !specificDiploma &&
    (/diploma|diplome|degree certificate|highest degree|graduation certificate/.test(text) ||
      /学历|学位/.test(raw))
  ) {
    add(keys, "diplome");
  }
  if (/csca/.test(text)) add(keys, "csca");
  if (
    /\bhsk\b|chinese proficiency|certificat( de)? langue|language certificate|language proficiency/.test(
      text,
    ) ||
    /汉语|中文水平/.test(raw)
  ) {
    add(keys, "hsk");
  }
  if (/ielts|toefl|english test|english proficiency|\banglais\b/.test(text) || /英语/.test(raw)) {
    add(keys, "ielts_or_toefl");
  }
  if (
    /medical|physical exam|health form|examen physique|formulaire medical/.test(text) ||
    /体检/.test(raw)
  ) {
    add(keys, "formulaire_medical");
  }
  if (/criminal|casier|police clearance/.test(text) || /犯罪/.test(raw)) {
    add(keys, "casier_judiciaire");
  }
  if (/recommendation|recommandation/.test(text) || /推荐/.test(raw)) {
    add(keys, "recommendation");
  }
  if (
    /personal statement|study plan|self statement|motivation|lettre de motivation/.test(text) ||
    /学习计划|个人陈述/.test(raw)
  ) {
    add(keys, "motivation");
  }
  if (/\bvideo\b/.test(text) || /视频/.test(raw)) add(keys, "video");
  if (
    /financial|bank statement|guarantee|sponsor|deposit/.test(text) ||
    /存款|财力|担保/.test(raw)
  ) {
    add(keys, "financial_proof");
  }
  if (/application form|formulaire de demande|formulaire demande/.test(text) || /申请表/.test(raw)) {
    add(keys, "application_form");
  }
  if (/\bresume\b|\bcv\b|curriculum/.test(text)) add(keys, "resume");
  return keys;
}

function labelFor(key: string, sample: string) {
  if (LABELS[key]) return LABELS[key];
  const spec = getStudentDocumentSpec(key);
  if (spec) return spec.label;
  const cleaned = sample.replace(/\s+/g, " ").trim();
  if (!cleaned) return "Document";
  const short = cleaned.length > 80 ? `${cleaned.slice(0, 77)}…` : cleaned;
  return short.charAt(0).toUpperCase() + short.slice(1);
}

function asList(value: unknown): unknown[] {
  if (Array.isArray(value)) return value;
  if (value == null || value === "") return [];
  return [value];
}

/** French labels, one row per piece, no passport/passeport/护照 duplicates. */
export function canonicalDocuments(value: unknown): CanonDoc[] {
  const found: CanonDoc[] = [];
  const seen = new Set<string>();
  asList(value).forEach((entry) => {
    const sample =
      typeof entry === "object" && entry && "label" in entry
        ? String((entry as { label?: unknown }).label || "")
        : typeof entry === "object" && entry && "type" in entry
          ? String((entry as { type?: unknown }).type || "")
          : String(entry || "");
    const preset =
      typeof entry === "object" && entry && "key" in entry
        ? String((entry as { key?: unknown }).key || "")
        : "";
    const keys = preset && (LABELS[preset] || getStudentDocumentSpec(preset))
      ? [preset]
      : classifyDocument(entry);
    keys.forEach((key) => {
      if (!key || seen.has(key)) return;
      seen.add(key);
      found.push({ key, label: preset === key && sample ? labelFor(key, sample) : labelFor(key, sample) });
    });
  });
  if (found.some((doc) => doc.key !== "diplome" && DIPLOMA_KEYS.has(doc.key))) {
    return found.filter((doc) => doc.key !== "diplome");
  }
  return found;
}

export function isCanonicalDocReceived(
  key: string,
  uploaded: Array<string | null | undefined> = [],
) {
  const keys = uploaded.filter((item): item is string => Boolean(item));
  if (keys.includes(key)) return true;
  if (!DIPLOMA_KEYS.has(key)) return false;
  if (key === "diplome") return studentHasDiplomaUpload(keys);
  return keys.includes("dernier_diplome") && !keys.some((item) => DIPLOMA_KEYS.has(item));
}

export function uploadKeysFromMatches(matches: unknown) {
  const keys = canonicalDocuments(
    asList(matches).flatMap((match) => {
      const row = match && typeof match === "object" ? (match as Record<string, unknown>) : {};
      const required = asList(row.required_documents);
      return required.length ? required : asList(row.missing_documents);
    }),
  )
    .map((doc) => doc.key)
    .filter((key) => Boolean(getStudentDocumentSpec(key)));
  return [...new Set(keys)];
}
