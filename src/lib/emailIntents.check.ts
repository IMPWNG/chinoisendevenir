/**
 * Self-check: a thanks must not count as a request for the formulas email.
 * Run: npx tsx src/lib/emailIntents.check.ts
 */
import { detectInterest, isCourtesyReply } from "./emailIntents";

function assert(cond: unknown, msg: string): asserts cond {
  if (!cond) throw new Error(msg);
}

const thanks = "Ok Merçi de me courage";
assert(isCourtesyReply(thanks), "thanks is a courtesy reply");
assert(!detectInterest(thanks), "thanks does not ask for formulas");
assert(!detectInterest("ok"), "bare ok is not a request");
assert(!detectInterest("Oui merci"), "oui merci is not a request");
assert(!detectInterest("Je ne suis pas intéressé"), "refusal is not a request");

assert(
  detectInterest("Je souhaite recevoir les informations sur l'accompagnement."),
  "explicit sentence still asks",
);
assert(detectInterest("Oui je suis intéressé"), "explicit interest still asks");
assert(detectInterest("Envoyez-moi les formules"), "envoyez-moi still asks");

console.log("email intents check ok");
