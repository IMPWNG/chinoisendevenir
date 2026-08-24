export const EUR_TO_CNY = 8;

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
  Langues: ["language", "chinese", "linguistics", "langue"],
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
  "<5000": { minEur: 0, maxEur: 5000, label: "moins de 5 000 € / an" },
  "moins-3000": { minEur: 0, maxEur: 3000, label: "moins de 3 000 € / an" },
  "3000-6000": { minEur: 3000, maxEur: 6000, label: "3 000–6 000 € / an" },
  "5000-10000": { minEur: 5000, maxEur: 10000, label: "5 000–10 000 € / an" },
  "10000-20000": { minEur: 10000, maxEur: 20000, label: "10 000–20 000 € / an" },
  ">20000": { minEur: 20000, maxEur: 50000, label: "plus de 20 000 € / an" },
  "besoin-bourse": {
    minEur: 0,
    maxEur: 4000,
    scholarshipRequired: true,
    label: "besoin d'une bourse",
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

export function categoryFromScore(score) {
  if (score >= 80) return "Très bon match";
  if (score >= 65) return "Match intéressant à vérifier";
  if (score >= 50) return "Option possible avec conditions";
  return "Faible compatibilité";
}

export function priorityFromScore(score) {
  if (score >= 80) return "Haute";
  if (score >= 65) return "Moyenne";
  if (score >= 50) return "Moyenne-basse";
  return "Basse";
}

export function infoStatus(kind, text) {
  return { kind, text };
}
