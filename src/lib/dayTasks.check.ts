/**
 * Self-check for the daily task picker.
 * Run: npx tsx src/lib/dayTasks.check.ts
 */
import { cleanDayTask, grokbotDayTasks, isMissingDayTasksTable } from "./dayTasks";

function assert(cond: unknown, msg: string): asserts cond {
  if (!cond) throw new Error(msg);
}

const person = (id: string) => ({
  id,
  name: id,
  email: "",
  statut: "",
  formule: "",
  assigned_to: "",
});

assert(cleanDayTask("  rappeler   demain ") === "rappeler demain", "collapse space");
assert(cleanDayTask("x".repeat(600)).length === 500, "cap 500");
assert(cleanDayTask("   ") === "", "blank");

const tasks = grokbotDayTasks({
  unreadInbox: [person("a"), person("b")],
  attentePaiement: [person("a"), person("c")],
  noFirstTouch: [person("d")],
});
assert(tasks.map((t) => t.contactId).join(",") === "a,b,c,d", "dedupe, inbox first");
assert(tasks[0].task === "Répondre à l'email reçu", "inbox wording");
assert(tasks[2].source === "grokbot", "source");
assert(grokbotDayTasks({ unreadInbox: [person("a"), person("b")] }, 1).length === 1, "cap");

assert(
  isMissingDayTasksTable(
    "Could not find the table 'public.day_tasks' in the schema cache",
  ),
  "missing table",
);
assert(!isMissingDayTasksTable("permission denied"), "other error");

console.log("dayTasks check ok");
