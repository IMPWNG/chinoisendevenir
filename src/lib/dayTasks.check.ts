/**
 * Self-check for agent day-task parsing.
 * Run: npx tsx src/lib/dayTasks.check.ts
 */
import {
  cleanDayTask,
  isMissingDayTasksTable,
  parseAgentDayTasks,
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
}

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

console.log("dayTasks check ok");
