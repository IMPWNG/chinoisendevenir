/**
 * Self-check for language-school intake windows.
 * Run: npx tsx src/lib/matching/constants.check.ts
 */
import { intakeFromRentree, languageIntakeKey } from "./constants";

function assert(cond: unknown, msg: string): asserts cond {
  if (!cond) throw new Error(msg);
}

const spring = intakeFromRentree("printemps_2027");
assert(spring.months.join(",") === "2,3", "printemps months");
assert(spring.label === "Printemps 2027", "printemps label");
assert(languageIntakeKey("mars_2027") === "printemps_2027", "mars maps");
assert(languageIntakeKey("février 2027") === "printemps_2027", "fevrier maps");

const autumn = intakeFromRentree("automne_2027");
assert(autumn.months.join(",") === "8,9", "automne months");
assert(autumn.label === "Automne 2027", "automne label");
assert(languageIntakeKey("septembre_2027") === "automne_2027", "sept maps");
assert(languageIntakeKey("août 2027") === "automne_2027", "aout maps");

const empty = intakeFromRentree("non precisee");
assert(empty.flexible === false && empty.months.length === 0, "unspecified");
assert(languageIntakeKey("") === "", "blank key");
assert(languageIntakeKey("flexible") === "", "flexible dropped");

console.log("language intake ok");
