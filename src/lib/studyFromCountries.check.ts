/**
 * Country pages stay distinct and point back into the site.
 * Run: npx tsx src/lib/studyFromCountries.check.ts
 */
import {
  STUDY_COUNTRIES,
  getStudyCountry,
  studyCountryLinks,
  studyCountryPath,
} from "./studyFromCountries";

function assert(cond: unknown, message: string): asserts cond {
  if (!cond) throw new Error(message);
}

assert(STUDY_COUNTRIES.length === 15, "15 country pages");
const slugs = STUDY_COUNTRIES.map((country) => country.slug);
const paths = slugs.map(studyCountryPath);
assert(new Set(slugs).size === 15, "unique slugs");
assert(new Set(paths).size === 15, "unique paths");
assert(new Set(STUDY_COUNTRIES.map((country) => country.h1)).size === 15, "unique h1");
assert(new Set(STUDY_COUNTRIES.map((country) => country.intro)).size === 15, "unique intros");
assert(new Set(STUDY_COUNTRIES.map((country) => country.angle)).size === 15, "unique angles");

const names = STUDY_COUNTRIES.map((country) => country.name).join("|");
assert(names.includes("Sénégal") && !names.includes("Sénégale"), "Sénégal");
assert(names.includes("Burundi") && !names.toLowerCase().includes("burindi"), "Burundi");
assert(names.includes("République démocratique du Congo"), "RDC name");
assert(names.includes("République du Congo"), "Congo name");

for (const country of STUDY_COUNTRIES) {
  const hrefs = studyCountryLinks(country).map((link) => link.href);
  assert(hrefs.includes("/etudier-en-chine"), `${country.slug} links to the guide`);
  assert(hrefs.includes("/ecoles-de-langue-chine"), `${country.slug} links to language prep`);
  assert(hrefs.includes("/processus"), `${country.slug} links to the file checklist`);
  assert(hrefs.includes("/#lead-form"), `${country.slug} links to the form`);
  assert(getStudyCountry(country.related), `${country.slug} related page exists`);
  assert(country.faqs.length === 3, `${country.slug} has 3 questions`);
}

const markers: [string, string][] = [
  ["le-senegal", "équivalence de son parcours"],
  ["le-senegal", "procédure unique"],
  ["le-burundi", "lisibilité et l'acceptation"],
  ["le-burundi", "sans reproduire une règle non confirmée"],
  ["haiti", "confirmation écrite"],
  ["le-mali", "parcours suivi au Mali"],
  ["le-mali", "équivalence garantie"],
  ["la-rdc", "établissements fréquentés"],
  ["la-rdc", "intitulés de diplômes"],
  ["la-rdc", "relevés issus du parcours en RDC"],
  ["la-rdc", "service qui a compétence"],
  ["la-guinee", "modèle générique"],
  ["le-burkina-faso", "critère suffisant"],
  ["le-cameroun", "procédure nationale unique"],
  ["le-togo", "candidats togolais"],
  ["le-benin", "intitulés exacts des diplômes"],
  ["le-benin", "candidater sereinement"],
  ["la-republique-du-congo", "nationalité déclarée"],
  ["la-france", "nationalité française"],
  ["le-maroc", "équivalence automatique"],
  ["l-algerie", "une formalité est obligatoire dans tous les cas"],
  ["la-tunisie", "sans extrapolation"],
  ["la-tunisie", "guide complet de candidature"],
];

for (const [slug, marker] of markers) {
  const country = getStudyCountry(slug);
  const blob = `${country?.title} ${country?.description} ${country?.angle} ${country?.steps.join(" ")}`;
  assert(blob.includes(marker), `${slug} keeps « ${marker} »`);
}

const algerie = getStudyCountry("l-algerie");
assert(algerie?.angleTable?.headers.length === 4, "Algeria control table");
assert(
  algerie?.angleTable?.headers.join(" / ") ===
    "Document original / Traduction / Certification demandée / Source de confirmation",
  "Algeria table columns",
);

const rdc = studyCountryLinks(getStudyCountry("la-rdc")!);
const congo = studyCountryLinks(getStudyCountry("la-republique-du-congo")!);
assert(
  rdc.some((link) => link.href === studyCountryPath("la-republique-du-congo")),
  "RDC links to Congo",
);
assert(
  congo.some((link) => link.href === studyCountryPath("la-rdc")),
  "Congo links to RDC",
);

console.log("studyFromCountries.check ok");
