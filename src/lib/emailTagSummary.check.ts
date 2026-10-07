/**
 * Self-check: npx tsx src/lib/emailTagSummary.check.ts
 */
import { __test } from "./emailTagSummary";

function assert(cond: unknown, msg: string): asserts cond {
  if (!cond) throw new Error(msg);
}

const chose = __test.heuristicEmailTag({
  id: "1",
  direction: "in",
  subject: "Re: Etude Chine — Nos formules d'accompagnement pour étudier en Chine",
  body: "Je pense que la troisième formule est mieux",
});
assert(chose === "A choisi sa formule", `chose got: ${chose}`);

const waiting = __test.heuristicEmailTag({
  id: "2",
  direction: "out",
  subject: "Etude Chine — Nos formules d'accompagnement pour étudier en Chine",
  body: "Nos formules d'accompagnement… Bonjour Amy,",
  formule: "",
});
assert(waiting === "N'a pas choisi de formule", `waiting got: ${waiting}`);

const tags = __test.extractTagsMap(
  '{"tags":{"a":"A choisi sa formule","b":"N\'a pas choisi de formule"}}',
);
assert(tags.a === "A choisi sa formule", "parse a");
assert(tags.b.includes("formule"), "parse b");

console.log("emailTagSummary check ok");
