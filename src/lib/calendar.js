export const CALENDAR_TZ = "Asia/Shanghai";
export const WORK_DAYS = [1, 2, 3, 4, 5];
export const WORK_START_MINUTES = 9 * 60;
export const WORK_END_MINUTES = 18 * 60;
export const SLOT_MINUTES = 30;
export const DEFAULT_DURATION_MINUTES = 30;
export const LOOKAHEAD_DAYS = 21;

const WEEKDAY_FR = [
  "dimanche",
  "lundi",
  "mardi",
  "mercredi",
  "jeudi",
  "vendredi",
  "samedi",
];

function pad2(value) {
  return String(value).padStart(2, "0");
}

function zonedParts(date, timeZone = CALENDAR_TZ) {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    weekday: "short",
    hourCycle: "h23",
  }).formatToParts(date);
  const map = {};
  for (const part of parts) {
    if (part.type !== "literal") map[part.type] = part.value;
  }
  return {
    year: Number(map.year),
    month: Number(map.month),
    day: Number(map.day),
    hour: Number(map.hour),
    minute: Number(map.minute),
    weekday: map.weekday,
  };
}

export function zonedLocalToUtc(ymd, hm, timeZone = CALENDAR_TZ) {
  const [year, month, day] = String(ymd).split("-").map(Number);
  const [hour, minute] = String(hm).split(":").map(Number);
  const utc = Date.UTC(year, month - 1, day, hour, minute, 0);
  const asZone = zonedParts(new Date(utc), timeZone);
  const asIfUtc = Date.UTC(
    asZone.year,
    asZone.month - 1,
    asZone.day,
    asZone.hour,
    asZone.minute,
  );
  return new Date(utc - (asIfUtc - utc));
}

export function formatYmd(date, timeZone = CALENDAR_TZ) {
  const p = zonedParts(date, timeZone);
  return `${p.year}-${pad2(p.month)}-${pad2(p.day)}`;
}

export function formatHm(date, timeZone = CALENDAR_TZ) {
  const p = zonedParts(date, timeZone);
  return `${pad2(p.hour)}:${pad2(p.minute)}`;
}

export function addDaysYmd(ymd, days) {
  const [year, month, day] = String(ymd).split("-").map(Number);
  const next = new Date(Date.UTC(year, month - 1, day + days));
  return `${next.getUTCFullYear()}-${pad2(next.getUTCMonth() + 1)}-${pad2(next.getUTCDate())}`;
}

export function startOfWeekYmd(ymd) {
  const [year, month, day] = String(ymd).split("-").map(Number);
  const utc = new Date(Date.UTC(year, month - 1, day));
  const weekday = utc.getUTCDay();
  const mondayOffset = weekday === 0 ? -6 : 1 - weekday;
  utc.setUTCDate(utc.getUTCDate() + mondayOffset);
  return `${utc.getUTCFullYear()}-${pad2(utc.getUTCMonth() + 1)}-${pad2(utc.getUTCDate())}`;
}

export function weekdayIndex(ymd) {
  const [year, month, day] = String(ymd).split("-").map(Number);
  return new Date(Date.UTC(year, month - 1, day)).getUTCDay();
}

export function minutesOfDay(date, timeZone = CALENDAR_TZ) {
  const p = zonedParts(date, timeZone);
  return p.hour * 60 + p.minute;
}

export function overlaps(aStart, aEnd, bStart, bEnd) {
  return aStart < bEnd && aEnd > bStart;
}

export function formatSlotLabel(startsAt, endsAt, timeZone = CALENDAR_TZ, locale = "fr-FR") {
  const start = new Date(startsAt);
  const end = new Date(endsAt);
  const dateLabel = start.toLocaleDateString(locale, {
    timeZone,
    weekday: "long",
    day: "numeric",
    month: "long",
  });
  return `${dateLabel} de ${formatHm(start, timeZone)} à ${formatHm(end, timeZone)}`;
}

export function nowInCalendar() {
  return {
    now: new Date(),
    ymd: formatYmd(new Date()),
    hm: formatHm(new Date()),
    tz: CALENDAR_TZ,
    label: new Date().toLocaleString("fr-FR", {
      timeZone: CALENDAR_TZ,
      weekday: "long",
      day: "numeric",
      month: "long",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }),
  };
}

function isWorkday(ymd) {
  return WORK_DAYS.includes(weekdayIndex(ymd));
}

export function listFreeSlots({
  booked = [],
  from = new Date(),
  days = LOOKAHEAD_DAYS,
  durationMinutes = DEFAULT_DURATION_MINUTES,
  timeZone = CALENDAR_TZ,
} = {}) {
  const busy = booked
    .filter((event) => event.status !== "cancelled")
    .map((event) => ({
      start: new Date(event.starts_at).getTime(),
      end: new Date(event.ends_at).getTime(),
    }));

  const slots = [];
  const startYmd = formatYmd(from, timeZone);
  const now = from.getTime();

  for (let day = 0; day < days; day += 1) {
    const ymd = addDaysYmd(startYmd, day);
    if (!isWorkday(ymd)) continue;

    for (
      let minute = WORK_START_MINUTES;
      minute + durationMinutes <= WORK_END_MINUTES;
      minute += SLOT_MINUTES
    ) {
      const startHm = `${pad2(Math.floor(minute / 60))}:${pad2(minute % 60)}`;
      const endMinute = minute + durationMinutes;
      const endHm = `${pad2(Math.floor(endMinute / 60))}:${pad2(endMinute % 60)}`;
      const start = zonedLocalToUtc(ymd, startHm, timeZone);
      const end = zonedLocalToUtc(ymd, endHm, timeZone);
      if (start.getTime() <= now) continue;

      const taken = busy.some((event) =>
        overlaps(start.getTime(), end.getTime(), event.start, event.end),
      );
      if (taken) continue;

      slots.push({
        starts_at: start.toISOString(),
        ends_at: end.toISOString(),
        label: formatSlotLabel(start, end, timeZone),
        ymd,
        startHm,
        endHm,
      });
    }
  }

  return slots;
}

export function pickSlotsForPrompt(slots, limit = 16) {
  if (!Array.isArray(slots) || slots.length === 0) return [];
  const morning = [];
  const afternoon = [];
  for (const slot of slots) {
    const hour = Number(String(slot.startHm || "").split(":")[0]);
    if (hour < 13) morning.push(slot);
    else afternoon.push(slot);
  }
  const mixed = [];
  let i = 0;
  while (mixed.length < limit && (i < morning.length || i < afternoon.length)) {
    if (i < morning.length) mixed.push(morning[i]);
    if (mixed.length >= limit) break;
    if (i < afternoon.length) mixed.push(afternoon[i]);
    i += 1;
  }
  return mixed.slice(0, limit);
}

export function compactSlot(slot) {
  if (!slot?.starts_at) return null;
  return {
    starts_at: slot.starts_at,
    ends_at: slot.ends_at,
    label: slot.label || formatSlotLabel(slot.starts_at, slot.ends_at),
  };
}

export function slotsEqual(a, b, toleranceMs = 14 * 60 * 1000) {
  if (!a || !b) return false;
  const aStart = new Date(a.starts_at).getTime();
  const bStart = new Date(b.starts_at).getTime();
  if (!Number.isFinite(aStart) || !Number.isFinite(bStart)) return false;
  return Math.abs(aStart - bStart) <= toleranceMs;
}

export function findMatchingFreeSlot(chosen, freeSlots) {
  if (!chosen?.starts_at) return null;
  return (
    freeSlots.find((slot) => slotsEqual(slot, chosen)) ||
    null
  );
}

export function weekdayNameFr(ymd) {
  return WEEKDAY_FR[weekdayIndex(ymd)] || "";
}

export function parseIso(value) {
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
}
