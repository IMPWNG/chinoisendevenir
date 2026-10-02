/**
 * Run: npx tsx src/lib/dripSchedule.check.ts
 */
import { DRIP_GAP_MS, DRIP_PER_HOUR, dripSendAllowed, nextDripSlots } from "./dripSchedule";

function assert(cond: unknown, msg: string): asserts cond {
  if (!cond) throw new Error(msg);
}

const now = 1_700_000_000_000;

const fresh = nextDripSlots(3, [], now);
assert(fresh[0] === now, "first slot is now");
assert(fresh[1] - fresh[0] === DRIP_GAP_MS, "gap is 12 minutes");
assert(fresh[2] - fresh[1] === DRIP_GAP_MS, "second gap is 12 minutes");

const queued = nextDripSlots(1, [now + DRIP_GAP_MS], now);
assert(queued[0] === now + DRIP_GAP_MS * 2, "appends after the last queued slot");

const backlog = nextDripSlots(1, [now - DRIP_GAP_MS * 4], now);
assert(backlog[0] === now, "a late backlog does not push new slots into the past");

assert(DRIP_PER_HOUR === 5, "five per hour");
assert(
  dripSendAllowed({ now, sentInLastHour: 4, lastSentAt: now - DRIP_GAP_MS }) === true,
  "fourth send in the hour is allowed once the gap has passed",
);
assert(
  dripSendAllowed({ now, sentInLastHour: 5, lastSentAt: now - DRIP_GAP_MS }) === false,
  "hourly cap",
);
assert(
  dripSendAllowed({ now, sentInLastHour: 0, lastSentAt: now - 1000 }) === false,
  "gap blocks a burst",
);

console.log("drip schedule check ok");
