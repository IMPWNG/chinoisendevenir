/** Pondérations du matching — fichier de config, pas hardcodé dans le score. */

export const MATCHING_WEIGHTS = {
  langue: 0.25,
  academique: 0.25,
  financier: 0.2,
  bourse: 0.15,
  age: 0.05,
  localisation: 0.05,
  motivation: 0.05,
};

export const CATEGORY_THRESHOLDS = {
  safety: 80,
  match: 60,
  reach: 40,
};

export const MIX_TARGETS = {
  safety: 2,
  match: 2,
  reach: 1,
};

export const MIX_SIZE = { min: 5, max: 8 };

export const USD_TO_CNY = 7.2;

export const DEFAULT_LIVING_COST_CNY = 35000;

export const DEFAULT_AGE_MIN = 17;

export const DOMAIN_SIMILARITY_MIN = 0.32;

export const QUALITY_FIELDS = [
  "age",
  "country",
  "field",
  "dernierDiplome",
  "targetDegree",
  "budget",
  "intake",
  "hskKnown",
  "english",
  "gpa",
  "motivationText",
  "besoinBourseKnown",
];
