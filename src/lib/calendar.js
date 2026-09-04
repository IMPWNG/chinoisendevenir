export const CALENDAR_TZ = "Asia/Shanghai";
export const WORK_START_MINUTES = 9 * 60;
export const WORK_END_MINUTES = 18 * 60;
export const DEFAULT_DURATION_MINUTES = 30;

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

export function parseIso(value) {
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
}
