/** Canonical country names (French) for the lead form and CRM. */
export const COUNTRIES = [
  "Afrique du Sud",
  "Algérie",
  "Angola",
  "Bénin",
  "Burkina Faso",
  "Burundi",
  "Cameroun",
  "Cap-Vert",
  "Chine",
  "Comores",
  "Côte d'Ivoire",
  "Djibouti",
  "Égypte",
  "Éthiopie",
  "France",
  "Gabon",
  "Gambie",
  "Ghana",
  "Guinée",
  "Guinée équatoriale",
  "Guinée-Bissau",
  "Haïti",
  "Kenya",
  "Liberia",
  "Libye",
  "Madagascar",
  "Mali",
  "Maroc",
  "Maurice",
  "Mauritanie",
  "Mozambique",
  "Niger",
  "Nigeria",
  "Ouganda",
  "République centrafricaine",
  "République démocratique du Congo",
  "République du Congo",
  "Rwanda",
  "Sénégal",
  "Sierra Leone",
  "Tchad",
  "Tanzanie",
  "Togo",
  "Tunisie",
] as const;

const ALIASES: Record<string, (typeof COUNTRIES)[number]> = {
  rdc: "République démocratique du Congo",
  drc: "République démocratique du Congo",
  "la rdc": "République démocratique du Congo",
  "rdc congo": "République démocratique du Congo",
  rdcongo: "République démocratique du Congo",
  "rd congo": "République démocratique du Congo",
  "congo rdc": "République démocratique du Congo",
  "congo dr": "République démocratique du Congo",
  chad: "Tchad",
  cameroon: "Cameroun",
  brazzaville: "République du Congo",
  congo: "République du Congo",
  "republique democratique du congo": "République démocratique du Congo",
  "congo brazzaville": "République du Congo",
  "le mali": "Mali",
  "guinee conakry": "Guinée",
  "guinee-conakry": "Guinée",
  rca: "République centrafricaine",
  centrafrique: "République centrafricaine",
  tanzania: "Tanzanie",
};

function fold(value: string): string {
  return value
    .replace(/\p{Extended_Pictographic}|\p{Regional_Indicator}/gu, "")
    .normalize("NFD")
    .replace(/\p{M}/gu, "")
    .toLowerCase()
    .replace(/['’]/g, "'")
    .replace(/[^a-z0-9' ]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

const BY_FOLD = new Map<string, string>();
for (const country of COUNTRIES) BY_FOLD.set(fold(country), country);
for (const [alias, country] of Object.entries(ALIASES)) {
  BY_FOLD.set(fold(alias), country);
}

/** Official name, or null if the value is empty / unknown. */
export function canonicalCountry(value: unknown): string | null {
  const raw = String(value || "").trim();
  if (!raw) return null;
  if (raw.includes("🇨🇬")) return "République du Congo";
  if (raw.includes("🇨🇩")) return "République démocratique du Congo";
  return BY_FOLD.get(fold(raw)) || null;
}

export function isKnownCountry(value: unknown): boolean {
  return canonicalCountry(value) !== null;
}
