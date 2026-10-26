/**
 * Notes on Chinese matching should lift a language school that also teaches the later field.
 * Run: npx tsx src/lib/matching/chinese.check.ts
 */
import { runChineseMatching } from "./chinese";

function assert(cond: unknown, msg: string): asserts cond {
  if (!cond) throw new Error(msg);
}

function school(name: string, majors: string[]) {
  return {
    id: name,
    name_fr: name,
    city: "Shanghai",
    is_active: true,
    majors,
    extra: {
      admission: {
        chinese_language_program_available: true,
        degrees: majors.length ? ["language", "bachelor"] : ["language"],
        fields: majors.length ? ["chinese_language", "medicine"] : ["chinese_language"],
        programs: [
          { level: "language", name: "Chinois", field: "chinese_language" },
          ...(majors.length
            ? [{ level: "bachelor", name: majors[0], field: "medicine" }]
            : []),
        ],
        language_session: { intake_months: [9] },
      },
    },
  };
}

const contact = { prenom: "Awa", nom: "Diallo", date_rentree: "automne_2027" };
const universities = [school("Langue seule", []), school("Langue et médecine", ["Clinical Medicine"])];
const plain = runChineseMatching({
  contact,
  universities,
  overrides: { preferredCity: "Shanghai", dateRentree: "automne_2027" },
});
assert(!plain.matches[0]?.breakdown || !("continuation" in (plain.matches[0].breakdown || {})), "sans notes, pas de poursuite");

const noted = runChineseMatching({
  contact,
  universities,
  overrides: {
    preferredCity: "Shanghai",
    dateRentree: "automne_2027",
    extraNotes: "Après la langue, poursuivre en médecine dans la même école.",
  },
});
assert(noted.matches[0]?.university_name === "Langue et médecine", "l'école avec médecine passe devant");
assert(
  noted.matches[0]?.why?.some((line) => String(line).includes("Clinical Medicine")),
  "la formation ensuite est citée",
);
assert(
  (noted.matches[1]?.score || 0) < (noted.matches[0]?.score || 0),
  "l'école sans diplôme correspondant est derrière",
);

console.log("chinese matching check ok");
