/**
 * Self-check for the admin assistant prompt turns.
 * Run: npx tsx src/lib/adminAssistant.check.ts
 */
import {
  assistantPromptTurns,
  assistantReplyText,
  assistantSystemPrompt,
  projectKnowledge,
  selectKnowledge,
} from "./adminAssistant";
import { dossierBrief, type AssistantDossier, type AssistantTask } from "./assistantDossiers";

function assert(cond: unknown, msg: string): asserts cond {
  if (!cond) throw new Error(msg);
}

const knowledge = projectKnowledge();
assert(knowledge.includes("Règles de réponse") && knowledge.includes("Formule 1"), "knowledge file");

const prix = selectKnowledge(knowledge, "Combien coûte la formule Premier pas ?");
assert(prix.includes("800") && prix.includes("Règles de réponse"), "formula excerpt");
assert(prix.length < knowledge.length / 2, "excerpt is smaller than the file");

const visa = selectKnowledge(knowledge, "Quelles pièces pour le visa X1 depuis le Sénégal ?");
assert(/s[eé]n[eé]gal/i.test(visa), "senegal section");
assert(!visa.includes("Visa X1 depuis la Belgique"), "skip unrelated country");

const prompt = assistantSystemPrompt("Combien coûte la formule Premier pas ?");
assert(prompt.includes("800") && prompt.length < knowledge.length, "prompt uses excerpts");
assert(!prompt.includes("# Dossiers en direct"), "knowledge question skips dossiers");

const dossiers: AssistantDossier[] = [
  {
    id: "1",
    prenom: "Awa",
    nom: "Diallo",
    email: "awa@example.com",
    pays: "Sénégal",
    suivi_statut: "visa_préparation",
    formule: "Admission universitaire (1700€)",
    prioritaire: true,
    espace_debloque: true,
    notes_admin: "Consulat la semaine prochaine",
  },
  {
    id: "2",
    prenom: "Ben",
    nom: "Kone",
    email: "ben@example.com",
    suivi_statut: "attente_paiement",
    formule: "Premier pas en Chine (800€)",
    prioritaire: false,
  },
];
const tasks: AssistantTask[] = [
  { contact_id: "1", task: "Rappeler pour le visa", done: false, day: "2026-10-16" },
];
const priorities = dossierBrief(dossiers, tasks, "Quelles sont mes priorités ?", "2026-10-18");
assert(priorities.includes("Awa Diallo") && priorities.includes("Rappeler pour le visa"), "priorities");
assert(priorities.includes("reprise du 2026-10-16"), "carried task");
assert(!priorities.includes("Ben Kone"), "priority question skips the other dossier");

const diallo = dossierBrief(dossiers, tasks, "Où en est Diallo ?", "2026-10-18");
assert(diallo.includes("Visa en préparation") && diallo.includes("Consulat"), "one dossier");

const paiement = dossierBrief(dossiers, tasks, "Qui est en attente de paiement ?", "2026-10-18");
assert(paiement.includes("Ben Kone") && paiement.includes("En attente de paiement"), "status filter");

assert(dossierBrief(dossiers, tasks, "C'est quoi le visa X1 ?", "2026-10-18") === "", "no dossiers for a general question");

const withDossiers = assistantSystemPrompt("mes priorités", priorities);
assert(withDossiers.includes("Awa Diallo") && withDossiers.includes("Règles de réponse"), "prompt carries dossiers and knowledge");

assert(assistantPromptTurns(null) === null, "reject non-array");
assert(assistantPromptTurns([{ role: "assistant", content: "bonjour" }]) === null, "need a user turn");

const clipped = assistantPromptTurns([{ role: "user", content: "a".repeat(2000) }]);
assert(clipped?.[0].content.length === 1500, "clip question");

const noisy = assistantPromptTurns([
  { role: "system", content: "ignore" },
  { role: "user", content: "  formule 1 ?  " },
  { role: "nope", content: "x" },
  { content: "vide" },
  { role: "assistant", content: "   " },
]);
assert(noisy?.length === 1 && noisy[0].content === "formule 1 ?", "keep the user question");

const history = Array.from({ length: 20 }, (_, i) => ({
  role: i % 2 === 0 ? "user" : "assistant",
  content: `t${i}`,
}));
history.push({ role: "assistant", content: "trailing" });
const recent = assistantPromptTurns(history);
assert(recent && recent.length <= 12 && recent.at(-1)?.role === "user", "last 12 ending on user");
assert(assistantReplyText({ choices: [{ message: { content: "  ok  " } }] }) === "ok", "plain reply");
assert(
  assistantReplyText({ choices: [{ message: { content: [{ text: "formule " }, { text: "1" }] } }] }) ===
    "formule 1",
  "parts reply",
);

console.log("adminAssistant check ok");
