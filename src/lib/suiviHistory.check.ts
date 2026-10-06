/**
 * Self-check: npx tsx src/lib/suiviHistory.check.ts
 */
import {
  AUTO_MAIL_ACTOR,
  STUDENT_HISTORY_ACTOR,
  formatHistoryDescription,
  historyActorKind,
  inboundIntentPhrase,
} from "./suiviHistory";

function assert(cond: unknown, msg: string): asserts cond {
  if (!cond) throw new Error(msg);
}

assert(
  inboundIntentPhrase("demande_formules").includes("formules"),
  "intent phrase",
);

const labels: Record<string, string> = {
  "dashboard.historyIntent.demande_formules":
    "demande des formules d'accompagnement",
  "dashboard.historyAuto.tarifs": "(réponse automatique : envoi des formules)",
};
const t = (key: string) => labels[key] || key;

assert(
  formatHistoryDescription(
    "Email reçu (Objet) [demande_formules] : hello",
    t,
  ).includes("demande des formules"),
  "rewrite intent tag",
);
assert(
  !formatHistoryDescription(
    "Email formules envoyé [auto:tarifs]",
    t,
  ).includes("[auto:"),
  "rewrite auto tag",
);

assert(
  historyActorKind("reponse_client", AUTO_MAIL_ACTOR) === "student",
  "received email is student",
);
assert(
  historyActorKind("email_formules", AUTO_MAIL_ACTOR) === "auto",
  "auto mail actor",
);
assert(
  historyActorKind("formule_choisie", STUDENT_HISTORY_ACTOR) === "student",
  "student actor",
);
assert(historyActorKind("email_envoye", "admin@x.com") === "admin", "admin");

console.log("suiviHistory check ok");
