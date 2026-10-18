/**
 * Self-check for the admin assistant prompt turns.
 * Run: npx tsx src/lib/adminAssistant.check.ts
 */
import {
  assistantPromptTurns,
  assistantReplyText,
  assistantSystemPrompt,
  projectKnowledge,
} from "./adminAssistant";

function assert(cond: unknown, msg: string): asserts cond {
  if (!cond) throw new Error(msg);
}

const knowledge = projectKnowledge();
assert(knowledge.includes("espace_debloque"), "brief loaded");
assert(assistantSystemPrompt().includes(knowledge), "prompt carries the brief");

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
