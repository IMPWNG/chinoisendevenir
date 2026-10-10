/**
 * Self-check for agent day-task parsing.
 * Run: npx tsx src/lib/dayTasks.check.ts
 */
import {
  cleanDayTask,
  dayTaskBelongsToday,
  dayTaskListFilter,
  isMissingDayTasksTable,
  parseAgentDayTasks,
  pickVisibleDayTasks,
  whatsappPriorityTasks,
} from "./dayTasks";

function assert(cond: unknown, msg: string): asserts cond {
  if (!cond) throw new Error(msg);
}

assert(cleanDayTask("  rappeler   demain ") === "rappeler demain", "collapse space");
assert(cleanDayTask("x".repeat(600)).length === 500, "cap 500");
assert(cleanDayTask("   ") === "", "blank");

const parsed = parseAgentDayTasks(
  {
    tasks: [
      { contactId: "a", task: "Répondre au mail" },
      { contactId: "a", task: "doublon" },
      { contact_id: "b", task: "  Relancer   le paiement " },
      { contactId: "", task: "vide" },
      { contactId: "c", task: "   " },
    ],
  },
  "2026-10-08",
);
assert(!("error" in parsed), "parse ok");
if (!("error" in parsed)) {
  assert(parsed.day === "2026-10-08", "default day");
  assert(
    parsed.tasks.map((t) => `${t.contactId}:${t.task}`).join("|") ===
      "a:Répondre au mail|b:Relancer le paiement",
    "dedupe and trim",
  );
  assert(parsed.createdBy === "", "no author");
}
const withAuthor = parseAgentDayTasks(
  { createdBy: "  Ada@Exemple.com ", tasks: [{ contactId: "a", task: "x" }] },
  "2026-10-08",
);
assert(!("error" in withAuthor) && withAuthor.createdBy === "ada@exemple.com", "author email");

assert(
  "error" in parseAgentDayTasks({ tasks: [] }, "pas-une-date") ||
    "error" in parseAgentDayTasks({ day: "lundi", tasks: [] }, "2026-10-08"),
  "bad day",
);
assert("error" in parseAgentDayTasks({}, "2026-10-08"), "tasks required");
assert(
  parseAgentDayTasks(
    { tasks: Array.from({ length: 25 }, (_, i) => ({ contactId: String(i), task: "x" })) },
    "2026-10-08",
  ),
  "cap input",
);
{
  const capped = parseAgentDayTasks(
    { tasks: Array.from({ length: 25 }, (_, i) => ({ contactId: String(i), task: "x" })) },
    "2026-10-08",
  );
  assert(!("error" in capped) && capped.tasks.length === 20, "cap 20");
}

assert(
  isMissingDayTasksTable(
    "Could not find the table 'public.day_tasks' in the schema cache",
  ),
  "missing table",
);
assert(!isMissingDayTasksTable("permission denied"), "other error");

const wa = whatsappPriorityTasks(
  [
    { contactId: "a", text: "Je voudrais la formule 2" },
    { contactId: "a", text: "doublon" },
    { contactId: "b", text: "déjà posée" },
    { contactId: "", text: "vide" },
  ],
  "2026-10-08",
  new Set(["b"]),
);
assert(wa.length === 1, "one new whatsapp priority");
assert(wa[0]?.source === "whatsapp", "source");
assert(wa[0]?.task.startsWith("Répondre sur WhatsApp : Je voudrais"), "task text");
assert(wa[0]?.created_by === "WhatsApp", "author");

const today = "2026-10-09";
assert(dayTaskBelongsToday({ day: "2026-10-08", done: false }, today), "open stays");
assert(!dayTaskBelongsToday({ day: "2026-10-08", done: true }, today), "done stays behind");
assert(dayTaskBelongsToday({ day: today, done: true }, today), "done today still listed");
assert(dayTaskBelongsToday({ day: "2026-10-07", done: false }, today), "older open stays");
assert(!dayTaskBelongsToday({ day: "2026-10-10", done: false }, today), "future hidden");
assert(
  dayTaskListFilter(today) ===
    "day.eq.2026-10-09,and(done.eq.false,day.lt.2026-10-09)",
  "list filter",
);
const shown = pickVisibleDayTasks([
  { contact_id: "a", done: false, task: "hier" },
  { contact_id: "a", done: false, task: "aujourd'hui" },
  { contact_id: "b", done: true, task: "faite" },
  { contact_id: "b", done: false, task: "encore" },
]);
assert(
  shown.map((row) => row.task).join("|") === "hier|encore",
  "un étudiant, une tâche ouverte",
);

console.log("dayTasks check ok");
