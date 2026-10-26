/**
 * Self-check for admin clock lines.
 * Run: npx tsx src/lib/adminClocks.check.ts
 */
import { adminClockLines } from "./adminClocks";

function assert(cond: unknown, msg: string): asserts cond {
  if (!cond) throw new Error(msg);
}

const winter = adminClockLines(new Date("2026-01-15T11:00:00Z"));
assert(winter[0]?.label.startsWith("France"), "france first");
assert(winter[0]?.time === "12:00", "paris winter");
assert(winter[0]?.label.includes("Cameroun"), "central africa shares paris in winter");
assert(!winter[0]?.label.includes("Sénégal"), "dakar is not paris in winter");
assert(
  winter.some((line) => line.label.includes("Sénégal") && line.time === "11:00"),
  "west africa winter",
);
assert(
  winter.some((line) => line.label.includes("Cap-Vert") && line.time === "10:00"),
  "cape verde",
);
assert(
  winter.some((line) => line.label.includes("Maurice") && line.time === "15:00"),
  "mauritius",
);

const summer = adminClockLines(new Date("2026-07-15T10:00:00Z"));
const paris = summer.find((line) => line.label.includes("France"));
assert(paris?.time === "12:00" && paris.label.includes("Afrique du Sud"), "summer paris matches johannesburg");
assert(
  summer.some((line) => line.label.includes("Sénégal") && line.time === "10:00"),
  "dakar stays behind paris in summer",
);
assert(new Set(summer.map((line) => line.time)).size === summer.length, "one line per hour");

console.log("admin clocks check ok");
