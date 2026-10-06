/**
 * Self-check for Shanghai day bounds and series aggregation.
 * Run: npx tsx src/lib/dailyReport.check.ts
 */
import { __test } from "./dailyReport";
import {
  addShanghaiDays,
  dayWindow,
  formatDelta,
  isValidDayString,
  shanghaiDayBounds,
  shanghaiDayString,
} from "./dailyReportShared";

function assert(cond: unknown, msg: string): asserts cond {
  if (!cond) throw new Error(msg);
}

assert(isValidDayString("2026-10-06"), "valid day");
assert(!isValidDayString("06-10-2026"), "reject EU format");

const bounds = shanghaiDayBounds("2026-10-06");
assert(bounds.startIso === "2026-10-05T16:00:00.000Z", "Shanghai midnight = UTC 16:00 prev");
assert(bounds.endIso === "2026-10-06T16:00:00.000Z", "next midnight");

assert(addShanghaiDays("2026-10-06", -1) === "2026-10-05", "prev day");
assert(dayWindow("2026-10-06", 3).join(",") === "2026-10-04,2026-10-05,2026-10-06", "window");

assert(__test.looksPaid("paiement_recu", ""), "paiement_recu");
assert(__test.looksPaid("changement_statut", "Status changed to Client payé"), "paid label");
assert(__test.looksPerdu("changement_statut", "prospect_perdu"), "perdu");
assert(__test.looksMatching("note_ajoutee", "Matching sauvegardé (3 universités)"), "matching note");

const series = __test.buildSeries(
  ["2026-10-05", "2026-10-06"],
  [
    {
      id: "c1",
      created_at: "2026-10-05T18:00:00.000Z", // Shanghai 2026-10-06 02:00
    } as never,
  ],
  [
    {
      id: "a1",
      contact_id: "c1",
      action: "appel",
      created_at: "2026-10-05T18:30:00.000Z",
    },
    {
      id: "a2",
      contact_id: "c1",
      action: "formule_choisie",
      description: "Formule 2 choisie",
      created_at: "2026-10-05T19:00:00.000Z",
    },
    {
      id: "a3",
      contact_id: "c2",
      action: "reponse_client",
      created_at: "2026-10-04T20:00:00.000Z", // Shanghai Oct 5
    },
  ],
  [
    { direction: "in", sent_at: "2026-10-05T17:00:00.000Z" },
    { direction: "out", sent_at: "2026-10-05T17:05:00.000Z" },
  ],
  [],
);

const day6 = series.find((d) => d.date === "2026-10-06");
const day5 = series.find((d) => d.date === "2026-10-05");
assert(day6?.newContacts === 1, "new contact on Shanghai day");
assert(day6?.appels === 1, "call counted");
assert(day6?.formulesChoisies === 1 && day6.formulesF2 === 1, "formule 2");
assert(day6?.emailsIn === 1 && day6?.emailsOut === 1, "emails");
assert(day5?.reponsesClient === 1, "reply previous day");

assert(formatDelta(3) === "+3", "plus delta");
assert(formatDelta(-1) === "-1", "minus delta");
assert(shanghaiDayString(new Date("2026-10-05T16:00:00.000Z")) === "2026-10-06", "tz day");

console.log("dailyReport check ok");
