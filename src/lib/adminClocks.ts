export type ClockPlace = { label: string; timeZone: string };

/** France plus African countries from the CRM list. Same current hour shares one line. */
export const ADMIN_CLOCK_PLACES: readonly ClockPlace[] = [
  { label: "France", timeZone: "Europe/Paris" },
  { label: "Cap-Vert", timeZone: "Atlantic/Cape_Verde" },
  { label: "Burkina Faso", timeZone: "Africa/Abidjan" },
  { label: "Côte d'Ivoire", timeZone: "Africa/Abidjan" },
  { label: "Gambie", timeZone: "Africa/Banjul" },
  { label: "Ghana", timeZone: "Africa/Accra" },
  { label: "Guinée", timeZone: "Africa/Conakry" },
  { label: "Guinée-Bissau", timeZone: "Africa/Bissau" },
  { label: "Liberia", timeZone: "Africa/Monrovia" },
  { label: "Mali", timeZone: "Africa/Bamako" },
  { label: "Mauritanie", timeZone: "Africa/Nouakchott" },
  { label: "Sénégal", timeZone: "Africa/Dakar" },
  { label: "Sierra Leone", timeZone: "Africa/Freetown" },
  { label: "Togo", timeZone: "Africa/Lome" },
  { label: "Algérie", timeZone: "Africa/Algiers" },
  { label: "Angola", timeZone: "Africa/Luanda" },
  { label: "Bénin", timeZone: "Africa/Porto-Novo" },
  { label: "Cameroun", timeZone: "Africa/Douala" },
  { label: "Gabon", timeZone: "Africa/Libreville" },
  { label: "Guinée équatoriale", timeZone: "Africa/Malabo" },
  { label: "Maroc", timeZone: "Africa/Casablanca" },
  { label: "Niger", timeZone: "Africa/Niamey" },
  { label: "Nigeria", timeZone: "Africa/Lagos" },
  { label: "République centrafricaine", timeZone: "Africa/Bangui" },
  // ponytail: RDC shown at Kinshasa (UTC+1). Lubumbashi is UTC+2.
  { label: "République démocratique du Congo", timeZone: "Africa/Kinshasa" },
  { label: "République du Congo", timeZone: "Africa/Brazzaville" },
  { label: "Tchad", timeZone: "Africa/Ndjamena" },
  { label: "Tunisie", timeZone: "Africa/Tunis" },
  { label: "Afrique du Sud", timeZone: "Africa/Johannesburg" },
  { label: "Burundi", timeZone: "Africa/Bujumbura" },
  { label: "Égypte", timeZone: "Africa/Cairo" },
  { label: "Libye", timeZone: "Africa/Tripoli" },
  { label: "Mozambique", timeZone: "Africa/Maputo" },
  { label: "Rwanda", timeZone: "Africa/Kigali" },
  { label: "Comores", timeZone: "Indian/Comoro" },
  { label: "Djibouti", timeZone: "Africa/Djibouti" },
  { label: "Éthiopie", timeZone: "Africa/Addis_Ababa" },
  { label: "Kenya", timeZone: "Africa/Nairobi" },
  { label: "Madagascar", timeZone: "Indian/Antananarivo" },
  { label: "Ouganda", timeZone: "Africa/Kampala" },
  { label: "Tanzanie", timeZone: "Africa/Dar_es_Salaam" },
  { label: "Maurice", timeZone: "Indian/Mauritius" },
];

export type ClockLine = { time: string; label: string; offset: number };

function parts(now: Date, timeZone: string) {
  return new Intl.DateTimeFormat("en-GB", {
    timeZone,
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
    timeZoneName: "shortOffset",
  }).formatToParts(now);
}

function clockTime(now: Date, timeZone: string) {
  const list = parts(now, timeZone);
  const hour = list.find((part) => part.type === "hour")?.value || "00";
  const minute = list.find((part) => part.type === "minute")?.value || "00";
  return `${hour}:${minute}`;
}

function offsetMinutes(now: Date, timeZone: string) {
  const name = parts(now, timeZone).find((part) => part.type === "timeZoneName")?.value || "GMT";
  const match = name.match(/GMT(?:([+-])(\d{1,2})(?::(\d{2}))?)?/);
  if (!match?.[1]) return 0;
  const sign = match[1] === "-" ? -1 : 1;
  return sign * (Number(match[2]) * 60 + Number(match[3] || 0));
}

export function adminClockLines(
  now: Date,
  places: readonly ClockPlace[] = ADMIN_CLOCK_PLACES,
): ClockLine[] {
  const groups = new Map<number, { time: string; labels: string[]; france: boolean }>();
  for (const place of places) {
    const offset = offsetMinutes(now, place.timeZone);
    const current = groups.get(offset) || {
      time: clockTime(now, place.timeZone),
      labels: [],
      france: false,
    };
    current.labels.push(place.label);
    if (place.label === "France") current.france = true;
    groups.set(offset, current);
  }
  return [...groups.entries()]
    .sort((a, b) => Number(b[1].france) - Number(a[1].france) || a[0] - b[0])
    .map(([offset, group]) => ({
      offset,
      time: group.time,
      label: [
        ...group.labels.filter((label) => label === "France"),
        ...group.labels.filter((label) => label !== "France").sort((a, b) => a.localeCompare(b, "fr")),
      ].join(", "),
    }));
}
