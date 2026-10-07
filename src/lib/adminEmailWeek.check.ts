/**
 * Self-check: npx tsx src/lib/adminEmailWeek.check.ts
 */
import { __test } from "./adminEmailWeek";

function assert(cond: unknown, msg: string): asserts cond {
  if (!cond) throw new Error(msg);
}

const latest = __test.latestEmailByContact([
  {
    id: "1",
    contact_id: "a",
    direction: "in",
    sent_at: "2026-10-01T10:00:00.000Z",
  },
  {
    id: "2",
    contact_id: "a",
    direction: "out",
    sent_at: "2026-10-02T10:00:00.000Z",
  },
  {
    id: "3",
    contact_id: "b",
    direction: "in",
    sent_at: "2026-10-03T10:00:00.000Z",
  },
  {
    id: "4",
    contact_id: "c",
    direction: "out",
    sent_at: "2026-10-04T10:00:00.000Z",
  },
]);

assert(latest.length === 3, "one per contact");
const our = latest.filter((r) => r.direction === "in");
const theirs = latest.filter((r) => r.direction !== "in");
assert(our.length === 1 && our[0].contact_id === "b", "we must reply to b");
assert(
  theirs.some((r) => r.contact_id === "a") &&
    theirs.some((r) => r.contact_id === "c"),
  "student must reply a+c",
);
assert(__test.previewText("hello   world").includes("hello world"), "preview");

console.log("adminEmailWeek check ok");
