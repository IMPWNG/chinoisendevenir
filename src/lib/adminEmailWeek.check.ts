/**
 * Self-check: npx tsx src/lib/adminEmailWeek.check.ts
 */
import { __test } from "./adminEmailWeek";

function assert(cond: unknown, msg: string): asserts cond {
  if (!cond) throw new Error(msg);
}

// 2026-10-07 is a Wednesday in Shanghai → Monday is 2026-10-05
assert(__test.shanghaiWeekdayMon0("2026-10-07") === 2, "Wed = 2");
const week = __test.shanghaiWeekBounds("2026-10-07");
assert(week.weekStart === "2026-10-05", "week monday");
assert(week.weekEnd === "2026-10-11", "week sunday");

const awaiting = __test.pickAwaitingReply([
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
assert(awaiting.length === 1 && awaiting[0].contact_id === "b", "only b awaits");
assert(__test.previewText("hello   world").includes("hello world"), "preview");

console.log("adminEmailWeek check ok");
