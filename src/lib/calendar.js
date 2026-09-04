export const CALENDAR_TZ = "Asia/Shanghai";
export const WORK_DAYS = [1, 2, 3, 4, 5];
export const WORK_START_MINUTES = 9 * 60;
export const WORK_END_MINUTES = 18 * 60;
export const SLOT_MINUTES = 30;
export const DEFAULT_DURATION_MINUTES = 30;
export const LOOKAHEAD_DAYS = 21;

export const APPOINTMENT_TIMEZONES = [
  { id: "Asia/Shanghai", fr: "Pékin (Chine)", en: "Beijing (China)", zh: "北京（中国）" },
  { id: "Europe/Paris", fr: "Paris (France, Belgique, Suisse)", en: "Paris (France, Belgium, Switzerland)", zh: "巴黎（法国/比利时/瑞士）" },
  { id: "Europe/London", fr: "Londres (Royaume-Uni)", en: "London (UK)", zh: "伦敦（英国）" },
  { id: "Africa/Casablanca", fr: "Casablanca (Maroc)", en: "Casablanca (Morocco)", zh: "卡萨布兰卡（摩洛哥）" },
  { id: "Africa/Algiers", fr: "Alger (Algérie)", en: "Algiers (Algeria)", zh: "阿尔及尔（阿尔及利亚）" },
  { id: "Africa/Tunis", fr: "Tunis (Tunisie)", en: "Tunis (Tunisia)", zh: "突尼斯" },
  { id: "Africa/Abidjan", fr: "Dakar / Abidjan (GMT)", en: "Dakar / Abidjan (GMT)", zh: "达喀尔 / 阿比让（GMT）" },
  { id: "Africa/Lagos", fr: "Lagos / Yaoundé (WAT)", en: "Lagos / Yaoundé (WAT)", zh: "拉各斯 / 雅温得（WAT）" },
  { id: "Africa/Johannesburg", fr: "Johannesburg (Afrique du Sud)", en: "Johannesburg (South Africa)", zh: "约翰内斯堡（南非）" },
  { id: "Indian/Antananarivo", fr: "Antananarivo (Madagascar)", en: "Antananarivo (Madagascar)", zh: "塔那那利佛（马达加斯加）" },
  { id: "Indian/Mauritius", fr: "Maurice / La Réunion", en: "Mauritius / Réunion", zh: "毛里求斯 / 留尼汪" },
  { id: "America/Montreal", fr: "Montréal (Canada Est)", en: "Montreal (Eastern Canada)", zh: "蒙特利尔（加拿大东部）" },
  { id: "America/New_York", fr: "New York (Est US)", en: "New York (US East)", zh: "纽约（美国东部）" },
  { id: "America/Chicago", fr: "Chicago (Centre US)", en: "Chicago (US Central)", zh: "芝加哥（美国中部）" },
  { id: "America/Denver", fr: "Denver (Montagnes US)", en: "Denver (US Mountain)", zh: "丹佛（美国山地）" },
  { id: "America/Los_Angeles", fr: "Los Angeles (Pacifique)", en: "Los Angeles (US Pacific)", zh: "洛杉矶（美国太平洋）" },
  { id: "America/Mexico_City", fr: "Mexico", en: "Mexico City", zh: "墨西哥城" },
  { id: "America/Sao_Paulo", fr: "São Paulo (Brésil)", en: "São Paulo (Brazil)", zh: "圣保罗（巴西）" },
  { id: "Asia/Dubai", fr: "Dubaï", en: "Dubai", zh: "迪拜" },
  { id: "Asia/Kolkata", fr: "New Delhi (Inde)", en: "New Delhi (India)", zh: "新德里（印度）" },
  { id: "Asia/Singapore", fr: "Singapour", en: "Singapore", zh: "新加坡" },
  { id: "Asia/Tokyo", fr: "Tokyo (Japon)", en: "Tokyo (Japan)", zh: "东京（日本）" },
  { id: "Asia/Seoul", fr: "Séoul (Corée)", en: "Seoul (Korea)", zh: "首尔（韩国）" },
  { id: "Australia/Sydney", fr: "Sydney (Australie)", en: "Sydney (Australia)", zh: "悉尼（澳大利亚）" },
  { id: "Pacific/Auckland", fr: "Auckland (Nouvelle-Zélande)", en: "Auckland (New Zealand)", zh: "奥克兰（新西兰）" },
  { id: "UTC", fr: "UTC", en: "UTC", zh: "UTC" },
];

const COUNTRY_TIMEZONES = [
  { tz: "Europe/Paris", names: ["france", "belgique", "belgium", "suisse", "switzerland", "luxembourg", "monaco"] },
  { tz: "Europe/London", names: ["royaume-uni", "united kingdom", "angleterre", "england", "britain", "uk"] },
  { tz: "Africa/Casablanca", names: ["maroc", "morocco"] },
  { tz: "Africa/Algiers", names: ["algerie", "algeria"] },
  { tz: "Africa/Tunis", names: ["tunisie", "tunisia"] },
  { tz: "Africa/Abidjan", names: ["senegal", "cote d", "ivoire", "ivory", "mali", "burkina", "togo", "benin", "guinee", "guinea", "niger", "mauritanie", "gambia"] },
  { tz: "Africa/Lagos", names: ["cameroun", "cameroon", "nigeria", "gabon", "congo", "tchad", "chad", "centrafrique", "angola"] },
  { tz: "Africa/Johannesburg", names: ["afrique du sud", "south africa"] },
  { tz: "Indian/Antananarivo", names: ["madagascar"] },
  { tz: "Indian/Mauritius", names: ["maurice", "mauritius", "reunion", "réunion"] },
  { tz: "America/Montreal", names: ["canada"] },
  { tz: "America/New_York", names: ["etats-unis", "etats unis", "united states", "usa"] },
  { tz: "America/Mexico_City", names: ["mexique", "mexico"] },
  { tz: "America/Sao_Paulo", names: ["bresil", "brazil"] },
  { tz: "Asia/Shanghai", names: ["chine", "china"] },
  { tz: "Asia/Dubai", names: ["emirats", "dubai", "uae"] },
  { tz: "Asia/Kolkata", names: ["inde", "india"] },
  { tz: "Asia/Singapore", names: ["singapour", "singapore"] },
  { tz: "Asia/Tokyo", names: ["japon", "japan"] },
  { tz: "Asia/Seoul", names: ["coree", "korea"] },
  { tz: "Australia/Sydney", names: ["australie", "australia"] },
];

const WEEKDAY_FR = [
  "dimanche",
  "lundi",
  "mardi",
  "mercredi",
  "jeudi",
  "vendredi",
  "samedi",
];

export function pad2(value) {
  return String(value).padStart(2, "0");
}

export function normalizeHm(hm) {
  const [hourRaw, minuteRaw] = String(hm || "00:00").split(":");
  const hour = Number(hourRaw);
  const minute = Number(minuteRaw);
  if (!Number.isFinite(hour) || !Number.isFinite(minute)) return "00:00";
  return `${pad2(Math.min(23, Math.max(0, hour)))}:${pad2(Math.min(59, Math.max(0, minute)))}`;
}

function foldCountry(value) {
  return String(value || "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/\p{M}/gu, "");
}

export function timezoneLabel(timeZone, lang = "fr") {
  const row = APPOINTMENT_TIMEZONES.find((item) => item.id === timeZone);
  if (!row) return timeZone || CALENDAR_TZ;
  if (lang === "zh") return row.zh;
  if (lang === "en") return row.en;
  return row.fr;
}

export function guessTimeZoneFromCountry(pays) {
  const haystack = foldCountry(pays);
  if (!haystack) return CALENDAR_TZ;
  const match = COUNTRY_TIMEZONES.find((item) =>
    item.names.some((name) => haystack.includes(name)),
  );
  return match?.tz || CALENDAR_TZ;
}

function zonedParts(date, timeZone = CALENDAR_TZ) {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "numeric",
    minute: "2-digit",
    weekday: "short",
    hour12: false,
    hourCycle: "h23",
  }).formatToParts(date);
  const map = {};
  for (const part of parts) {
    if (part.type !== "literal") map[part.type] = part.value;
  }
  let hour = Number(map.hour);
  if (hour === 24) hour = 0;
  const period = String(map.dayPeriod || "");
  if (/p/i.test(period) && hour < 12) hour += 12;
  if (/a/i.test(period) && hour === 12) hour = 0;
  return {
    year: Number(map.year),
    month: Number(map.month),
    day: Number(map.day),
    hour,
    minute: Number(map.minute),
    weekday: map.weekday,
  };
}

export function zonedLocalToUtc(ymd, hm, timeZone = CALENDAR_TZ) {
  const [year, month, day] = String(ymd).split("-").map(Number);
  const [hour, minute] = normalizeHm(hm).split(":").map(Number);
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

export function formatHm12(hm) {
  const [hour, minute] = normalizeHm(hm).split(":").map(Number);
  const suffix = hour >= 12 ? "PM" : "AM";
  const hour12 = hour % 12 || 12;
  return `${hour12}:${pad2(minute)} ${suffix}`;
}

export function convertWallClock(
  ymd,
  hm,
  fromTimeZone,
  toTimeZone = CALENDAR_TZ,
  durationMinutes = DEFAULT_DURATION_MINUTES,
  locale = "fr-FR",
) {
  const utc = zonedLocalToUtc(ymd, hm, fromTimeZone || CALENDAR_TZ);
  const end = new Date(
    utc.getTime() +
      (Number.isFinite(durationMinutes) && durationMinutes > 0
        ? durationMinutes
        : DEFAULT_DURATION_MINUTES) *
        60 *
        1000,
  );
  const targetYmd = formatYmd(utc, toTimeZone);
  return {
    utc,
    iso: utc.toISOString(),
    ymd: targetYmd,
    hm: formatHm(utc, toTimeZone),
    endHm: formatHm(end, toTimeZone),
    label: formatSlotLabel(utc, end, toTimeZone, locale),
    dateShift: targetYmd !== String(ymd),
  };
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
  dimanch: 0,
  lundi: 1,
  lund: 1,
  mardi: 2,
  mard: 2,
  mercredi: 3,
  mecredi: 3,
  mercred: 3,
  jeudi: 4,
  jeud: 4,
  vendredi: 5,
  vendred: 5,
  samedi: 6,
  samed: 6,
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
  const duAu = text.match(
    new RegExp(
      `(?:du|de)\\s+(?:le\\s+)?(${dayNames.join("|")})s?\\s+au\\s+(?:le\\s+)?(${dayNames.join("|")})s?`,
    ),
  );
  let weekdays = foundDays;
  if (duAu) {
    weekdays = weekdayRange(
      DAY_NAME_TO_INDEX[duAu[1]],
      DAY_NAME_TO_INDEX[duAu[2]],
    );
  } else if (range) {
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
  const hasSpan = Boolean(duAu || range);
  if (/\bcette semaine\b/.test(text) || (hasSpan && !/\bsemaine prochaine\b/.test(text))) {
    toYmd = addDaysYmd(monday, 6);
    if (weekdays.length) {
      const lastWanted = Math.max(...weekdays);
      if (weekdayIndex(today) > lastWanted) {
        fromYmd = addDaysYmd(monday, 7);
        toYmd = addDaysYmd(monday, 13);
      }
    }
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
    if (hints.maxMinutes != null && startMin >= hints.maxMinutes) return false;
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

  days.forEach((day, dayIndex) => {
    if (picked.length >= limit) return;
    const list = byDay.get(day);
    const idx = Math.min(dayIndex * 2, list.length - 1);
    const candidate = list[idx];
    if (!candidate || seen.has(candidate.starts_at)) return;
    seen.add(candidate.starts_at);
    picked.push(candidate);
  });

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
