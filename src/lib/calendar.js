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

const DAY_NAME_TO_INDEX = {
  dimanche: 0,
  lundi: 1,
  mardi: 2,
  mercredi: 3,
  jeudi: 4,
  vendredi: 5,
  samedi: 6,
};

function foldFr(text) {
  return String(text || "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/\p{M}/gu, "");
}

function parseHourToMinutes(raw) {
  const match = String(raw || "").match(/(\d{1,2})(?:[:h](\d{2}))?/);
  if (!match) return null;
  const hour = Number(match[1]);
  const minute = Number(match[2] || 0);
  if (!Number.isFinite(hour) || hour > 23) return null;
  return hour * 60 + (Number.isFinite(minute) ? minute : 0);
}

function weekdayRange(from, to) {
  const out = [];
  let current = from;
  for (let i = 0; i < 7; i += 1) {
    out.push(current);
    if (current === to) break;
    current = (current + 1) % 7;
  }
  return out;
}

export function parseAvailabilityHints(notes, now = new Date()) {
  const text = foldFr(notes);
  const today = formatYmd(now);
  const monday = startOfWeekYmd(today);

  const dayNames = Object.keys(DAY_NAME_TO_INDEX);
  const foundDays = [];
  const dayRe = new RegExp(`\\b(${dayNames.join("|")})s?\\b`, "g");
  let match;
  while ((match = dayRe.exec(text))) {
    const index = DAY_NAME_TO_INDEX[match[1]];
    if (!foundDays.includes(index)) foundDays.push(index);
  }

  const range = text.match(
    new RegExp(
      `entre(?:\\s+le)?\\s+(${dayNames.join("|")})s?\\s+et(?:\\s+le)?\\s+(${dayNames.join("|")})s?`,
    ),
  );
  let weekdays = foundDays;
  if (range) {
    weekdays = weekdayRange(
      DAY_NAME_TO_INDEX[range[1]],
      DAY_NAME_TO_INDEX[range[2]],
    );
  }

  const hours = text.match(
    /(?:entre|de)\s+(\d{1,2}(?:[:h]\d{2})?)\s*h?\s+(?:et|a|à)\s+(\d{1,2}(?:[:h]\d{2})?)\s*h?\b/,
  );
  const minMinutes = hours ? parseHourToMinutes(hours[1]) : null;
  const maxMinutes = hours ? parseHourToMinutes(hours[2]) : null;

  let fromYmd = today;
  let toYmd = addDaysYmd(monday, 13);
  if (/\bcette semaine\b/.test(text)) {
    toYmd = addDaysYmd(monday, 6);
  } else if (/\bsemaine prochaine\b/.test(text)) {
    fromYmd = addDaysYmd(monday, 7);
    toYmd = addDaysYmd(monday, 13);
  }

  return {
    weekdays,
    minMinutes,
    maxMinutes,
    fromYmd,
    toYmd,
    hasHints: Boolean(
      weekdays.length || minMinutes != null || /\bcette semaine|semaine prochaine\b/.test(text),
    ),
  };
}

export function filterSlotsByHints(slots, hints) {
  if (!hints?.hasHints) return slots || [];
  return (slots || []).filter((slot) => {
    if (hints.fromYmd && slot.ymd < hints.fromYmd) return false;
    if (hints.toYmd && slot.ymd > hints.toYmd) return false;
    if (hints.weekdays?.length && !hints.weekdays.includes(weekdayIndex(slot.ymd))) {
      return false;
    }
    const [hour, minute] = String(slot.startHm || "00:00").split(":").map(Number);
    const startMin = hour * 60 + minute;
    if (hints.minMinutes != null && startMin < hints.minMinutes) return false;
    if (hints.maxMinutes != null && startMin > hints.maxMinutes) return false;
    return true;
  });
}

export function pickSpreadSlots(slots, limit = 4) {
  if (!Array.isArray(slots) || slots.length === 0) return [];
  const byDay = new Map();
  for (const slot of slots) {
    const list = byDay.get(slot.ymd) || [];
    list.push(slot);
    byDay.set(slot.ymd, list);
  }
  const days = [...byDay.keys()].sort();
  const picked = [];
  const seen = new Set();
  let round = 0;
  while (picked.length < limit) {
    let added = false;
    for (const day of days) {
      const candidate = byDay.get(day)[round];
      if (!candidate || seen.has(candidate.starts_at)) continue;
      seen.add(candidate.starts_at);
      picked.push(candidate);
      added = true;
      if (picked.length >= limit) break;
    }
    if (!added) break;
    round += 1;
  }
  return picked;
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
