/**
 * Self-check for which student messages get a personal reply.
 * Run: npx tsx src/lib/studentAsk.check.ts
 */
import { shouldAnswerStudentAsk, studentAskKey, studentAskText } from "./studentAsk";

function assert(cond: unknown, msg: string): asserts cond {
  if (!cond) throw new Error(msg);
}

assert(
  studentAskText("Je veux une bourse\nFormule choisie: Premier pas\n> ancien mail").includes(
    "bourse",
  ) && !studentAskText("Je veux une bourse\nFormule choisie: Premier pas").includes("Formule"),
  "strip crm line",
);
assert(
  !studentAskText("Question\n-------- Message d'origine --------\nDe : agence").includes(
    "agence",
  ),
  "drop quoted reply",
);
assert(!shouldAnswerStudentAsk("Ok, je vous attends"), "ack");
assert(!shouldAnswerStudentAsk("Merci beaucoup"), "thanks");
assert(!shouldAnswerStudentAsk("3"), "short");
assert(
  shouldAnswerStudentAsk(
    "Est-ce que la bourse couvre le logement et les frais ?",
  ),
  "scholarship question",
);
assert(
  shouldAnswerStudentAsk(
    "Je souhaite recevoir les informations sur l'accompagnement",
  ),
  "asks for accompaniment",
);
const again = "Comment faire pour avoir une bourse complète ?";
assert(studentAskKey(again) === studentAskKey(`  ${again}  `), "stable key");
assert(studentAskKey(again) !== studentAskKey(`${again} et le visa`), "new ask");

console.log("studentAsk check ok");
