export const EUR_TO_CNY = 8;
export const USD_TO_CNY = 7.2;

export const DOMAIN_KEYS = {
  "Informatique / IA / Data Science": [
    "computer_science",
    "computer",
    "software",
    "ai",
    "artificial_intelligence",
    "data",
    "informatique",
    "intelligence",
  ],
  "Ingénierie / Génie civil": [
    "engineering",
    "civil",
    "civil_engineering",
    "ingenierie",
    "génie civil",
  ],
  "Génie électrique / Énergie": [
    "electrical",
    "energy",
    "electric",
    "power",
    "électrique",
    "energie",
  ],
  "Génie mécanique": ["mechanical", "mécanique", "mecanique"],
  "Aérospatial": ["aerospace", "aeronautic", "aviation", "aérospatial"],
  Architecture: ["architecture"],
  "Commerce / Business": [
    "business",
    "commerce",
    "management",
    "economics",
    "économie",
  ],
  "Commerce international": [
    "international_trade",
    "international_business",
    "commerce international",
    "business",
  ],
  "Management / Gestion": ["management", "gestion", "business", "mba"],
  "Marketing digital": ["marketing", "digital"],
  "Banque / Finance / Assurance": [
    "finance",
    "banking",
    "accounting",
    "banque",
    "assurance",
  ],
  Droit: ["law", "legal", "droit"],
  "Science politique": ["political", "politics", "public_administration"],
  "Sciences pharmaceutiques": [
    "pharmacy",
    "pharmaceutical",
    "medicine",
    "medical",
    "pharmacie",
  ],
  Agriculture: ["agriculture", "agronomy", "forestry"],
  Hydrologie: ["hydrology", "water", "environment", "environmental"],
  Langues: [
    "language",
    "chinese",
    "linguistics",
    "langue",
    "chinese_language",
    "chinese language",
  ],
};

export const DOMAIN_FAMILIES = {
  tech: [
    "Informatique / IA / Data Science",
    "Ingénierie / Génie civil",
    "Génie électrique / Énergie",
    "Génie mécanique",
    "Aérospatial",
  ],
  business: [
    "Commerce / Business",
    "Commerce international",
    "Management / Gestion",
    "Marketing digital",
    "Banque / Finance / Assurance",
  ],
};

export const BUDGET_BANDS = {
  "<5000": {
    minUsd: 0,
    maxUsd: 5000,
    minEur: 0,
    maxEur: 5000,
    label: "moins de 5 000 $ / an",
  },
  "moins-3000": {
    minUsd: 0,
    maxUsd: 3000,
    minEur: 0,
    maxEur: 3000,
    label: "moins de 3 000 $ / an",
  },
  "3000-6000": {
    minUsd: 3000,
    maxUsd: 6000,
    minEur: 3000,
    maxEur: 6000,
    label: "3 000–6 000 $ / an",
  },
  "5000-10000": {
    minUsd: 5000,
    maxUsd: 10000,
    minEur: 5000,
    maxEur: 10000,
    label: "5 000–10 000 $ / an",
  },
  "10000-20000": {
    minUsd: 10000,
    maxUsd: 20000,
    minEur: 10000,
    maxEur: 20000,
    label: "10 000–20 000 $ / an",
  },
  ">20000": {
    minUsd: 20000,
    maxUsd: 50000,
    minEur: 20000,
    maxEur: 50000,
    label: "plus de 20 000 $ / an",
  },
  "besoin-bourse": {
    minUsd: 0,
    maxUsd: 4000,
    minEur: 0,
    maxEur: 4000,
    scholarshipRequired: true,
    label: "besoin d'une bourse",
  },
};

export const CATEGORY_META = {
  safety: {
    key: "safety",
    label: "Sûre",
    subtitle: "Profil bien aligné avec les critères connus",
    clientLabel: "Sûre",
  },
  match: {
    key: "match",
    label: "Réaliste",
    subtitle: "Compatible, quelques points à confirmer",
    clientLabel: "Réaliste",
  },
  reach: {
    key: "reach",
    label: "Ambitieuse",
    subtitle: "Plus exigeante — dossier à renforcer",
    clientLabel: "Ambitieuse",
  },
  unready: {
    key: "unready",
    label: "Non recommandée",
    subtitle: "Pas dans l'état actuel du dossier",
    clientLabel: "Non recommandée en l'état",
  },
};

export function normalizeText(value) {
  return String(value || "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

export function diplomaToTargetDegree(diplome) {
  const value = normalizeText(diplome);
  if (!value) return null;
  if (value.includes("bac") && !value.includes("bachelor")) return "bachelor";
  if (value.includes("licence") || value.includes("bachelor")) return "master";
  if (value.includes("master")) return "phd";
  if (value.includes("doctorat") || value.includes("phd")) return "phd";
  return null;
}

export function intakeFromRentree(dateRentree) {
  const value = normalizeText(dateRentree);
  if (!value || value.includes("flexible")) {
    return { month: null, year: null, flexible: true, label: "Flexible" };
  }
  const yearMatch = value.match(/(20\d{2})/);
  const year = yearMatch ? Number(yearMatch[1]) : null;
  if (value.includes("mars") || value.includes("fevrier") || value.includes("printemps")) {
    return { month: 3, year, flexible: false, label: dateRentree };
  }
  if (value.includes("sept") || value.includes("automne")) {
    return { month: 9, year, flexible: false, label: dateRentree };
  }
  return { month: null, year, flexible: false, label: dateRentree };
}

export function categoryKeyFromScore(score) {
  if (score >= 80) return "safety";
  if (score >= 60) return "match";
  if (score >= 40) return "reach";
  return "unready";
}

export function categoryFromScore(score) {
  return CATEGORY_META[categoryKeyFromScore(score)].label;
}

export function categoryMetaFromScore(score) {
  return CATEGORY_META[categoryKeyFromScore(score)];
}

export function priorityFromScore(score) {
  if (score >= 80) return "Haute";
  if (score >= 60) return "Moyenne";
  if (score >= 40) return "Moyenne-basse";
  return "Basse";
}

export function englishToIelts(english) {
  const value = normalizeText(english);
  if (!value) return null;
  if (value === "none" || value === "aucun") return 0;
  const numeric = value.match(/(\d+(?:[.,]\d+)?)/);
  if (value.includes("ielts") && numeric) return Number(numeric[1].replace(",", "."));
  if (value.includes("c1") || value.includes("c2")) return 7;
  if (value.includes("b2")) return 6;
  if (value.includes("b1")) return 5;
  if (value.includes("a2") || value.includes("a1")) return 4;
  return null;
}

export function englishToToefl(english) {
  const value = normalizeText(english);
  if (!value) return null;
  if (value === "none" || value === "aucun") return 0;
  if (value.includes("toefl")) {
    const numeric = value.match(/(\d{2,3})/);
    if (numeric) return Number(numeric[1]);
  }
  if (value.includes("c1") || value.includes("c2")) return 95;
  if (value.includes("b2")) return 80;
  if (value.includes("b1")) return 60;
  if (value.includes("a2") || value.includes("a1")) return 40;
  return null;
}

export function infoStatus(kind, text) {
  return { kind, text };
}
