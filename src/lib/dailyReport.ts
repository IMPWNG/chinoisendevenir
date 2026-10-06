/**
 * Daily CRM report (Asia/Shanghai calendar day).
 * Live from contacts / suivi_actions / contact_emails / matching_runs.
 */
import type { AdminClient } from "./supabaseAdmin";
import { getFormuleNumber } from "./formules";
import { canonicalStatut, PAID_STATUSES } from "./suiviStatuts";
import {
  REPORT_HISTORY_DAYS,
  REPORT_TZ,
  addShanghaiDays,
  dayWindow,
  formatDelta,
  isValidDayString,
  shanghaiDayBounds,
  shanghaiDayString,
  type DailyReport,
  type DayTotals,
  type ReportPerson,
} from "./dailyReportShared";

export {
  REPORT_HISTORY_DAYS,
  REPORT_TZ,
  addShanghaiDays,
  dayWindow,
  formatDelta,
  isValidDayString,
  shanghaiDayBounds,
  shanghaiDayString,
};
export type { DailyReport, DayTotals, ReportPerson };

const LIST_CAP = 40;

const CALL_ACTIONS = new Set(["appel", "appel_effectue", "contact_appele"]);
const REPLY_ACTIONS = new Set(["reponse_client", "reponse_whatsapp"]);
const FORMULE_ACTIONS = new Set(["formule_choisie"]);
const RELANCE_ACTIONS = new Set(["relance_formules", "relance_1", "relance_2", "relance"]);
const WHATSAPP_ACTIONS = new Set([
  "whatsapp_envoye",
  "whatsapp_formules",
]);

function emptyTotals(date: string): DayTotals {
  return {
    date,
    newContacts: 0,
    formulesChoisies: 0,
    formulesF1: 0,
    formulesF2: 0,
    formulesF3: 0,
    clientPaye: 0,
    prospectPerdu: 0,
    appels: 0,
    reponsesClient: 0,
    emailsIn: 0,
    emailsOut: 0,
    whatsappOut: 0,
    matchings: 0,
    relancesFormules: 0,
  };
}

function personName(row: {
  prenom?: unknown;
  nom?: unknown;
  email?: unknown;
}): string {
  const name = [row.prenom, row.nom].map((v) => String(v || "").trim()).filter(Boolean).join(" ");
  return name || String(row.email || "").trim() || "Sans nom";
}

function toPerson(
  row: {
    id?: unknown;
    prenom?: unknown;
    nom?: unknown;
    email?: unknown;
    suivi_statut?: unknown;
    formule?: unknown;
    assigned_to?: unknown;
  },
  note?: string,
): ReportPerson {
  return {
    id: String(row.id || ""),
    name: personName(row),
    email: String(row.email || ""),
    statut: canonicalStatut(row.suivi_statut) || String(row.suivi_statut || ""),
    formule: String(row.formule || ""),
    assigned_to: String(row.assigned_to || ""),
    note,
  };
}

function dayKeyFromIso(iso: unknown): string {
  if (!iso) return "";
  return shanghaiDayString(new Date(String(iso)));
}

function looksPaid(action: string, description: string) {
  if (action === "paiement_recu") return true;
  if (action !== "changement_statut") return false;
  return /client_pay[ée]|client pay[ée]/i.test(description);
}

function looksPerdu(action: string, description: string) {
  if (action !== "changement_statut") return false;
  return /prospect_perdu|\bperdu\b/i.test(description);
}

function looksMatching(action: string, description: string) {
  if (action === "matching") return true;
  return (
    action === "note_ajoutee" &&
    (/matching/i.test(description) ||
      description.startsWith("[[MATCHING_JSON]]") ||
      description.startsWith("[[CHINESE_MATCHING_JSON]]"))
  );
}

function deltaTotals(today: DayTotals, yesterday: DayTotals | null) {
  const keys = Object.keys(today).filter((k) => k !== "date") as Array<
    keyof Omit<DayTotals, "date">
  >;
  const out = {} as Record<keyof Omit<DayTotals, "date">, number>;
  for (const key of keys) {
    out[key] = today[key] - (yesterday ? yesterday[key] : 0);
  }
  return out;
}

type ContactLite = {
  id: string;
  prenom?: string | null;
  nom?: string | null;
  email?: string | null;
  suivi_statut?: string | null;
  formule?: string | null;
  assigned_to?: string | null;
  created_at?: string | null;
  prioritaire?: boolean | null;
};

type ActionLite = {
  id: string;
  contact_id: string;
  action: string;
  description?: string | null;
  created_at?: string | null;
  user_admin?: string | null;
};

async function fetchContactsCreated(
  admin: AdminClient,
  startIso: string,
  endIso: string,
): Promise<ContactLite[]> {
  const { data, error } = await admin
    .from("contacts")
    .select("id, prenom, nom, email, suivi_statut, formule, assigned_to, created_at, prioritaire")
    .gte("created_at", startIso)
    .lt("created_at", endIso)
    .order("created_at", { ascending: false })
    .limit(500);
  if (error) throw error;
  return (data || []) as ContactLite[];
}

async function fetchActionsInRange(
  admin: AdminClient,
  startIso: string,
  endIso: string,
): Promise<ActionLite[]> {
  const { data, error } = await admin
    .from("suivi_actions")
    .select("id, contact_id, action, description, created_at, user_admin")
    .gte("created_at", startIso)
    .lt("created_at", endIso)
    .order("created_at", { ascending: false })
    .limit(3000);
  if (error) throw error;
  return (data || []) as ActionLite[];
}

async function fetchEmailsInRange(
  admin: AdminClient,
  startIso: string,
  endIso: string,
): Promise<Array<{ direction: string; sent_at: string }>> {
  try {
    const { data, error } = await admin
      .from("contact_emails")
      .select("direction, sent_at")
      .gte("sent_at", startIso)
      .lt("sent_at", endIso)
      .limit(3000);
    if (error) {
      if (/does not exist|schema cache/i.test(error.message)) return [];
      throw error;
    }
    return (data || []) as Array<{ direction: string; sent_at: string }>;
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    if (/does not exist|schema cache/i.test(message)) return [];
    throw error;
  }
}

async function fetchMatchingsInRange(
  admin: AdminClient,
  startIso: string,
  endIso: string,
): Promise<Array<{ created_at: string }>> {
  try {
    const { data, error } = await admin
      .from("matching_runs")
      .select("created_at")
      .gte("created_at", startIso)
      .lt("created_at", endIso)
      .limit(1000);
    if (error) {
      if (/does not exist|schema cache/i.test(error.message)) return [];
      throw error;
    }
    return (data || []) as Array<{ created_at: string }>;
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    if (/does not exist|schema cache/i.test(message)) return [];
    throw error;
  }
}

async function mapContactsByIds(
  admin: AdminClient,
  ids: string[],
): Promise<Map<string, ContactLite>> {
  const unique = [...new Set(ids.filter(Boolean))];
  const map = new Map<string, ContactLite>();
  for (let i = 0; i < unique.length; i += 80) {
    const chunk = unique.slice(i, i + 80);
    const { data, error } = await admin
      .from("contacts")
      .select("id, prenom, nom, email, suivi_statut, formule, assigned_to, created_at, prioritaire")
      .in("id", chunk);
    if (error) throw error;
    for (const row of data || []) map.set(String(row.id), row as ContactLite);
  }
  return map;
}

function bumpFormule(totals: DayTotals, formuleLabel: unknown) {
  totals.formulesChoisies += 1;
  const raw = String(formuleLabel || "").trim();
  const digit = /^[123]$/.test(raw) ? Number(raw) : null;
  const n = digit || getFormuleNumber(formuleLabel);
  if (n === 1) totals.formulesF1 += 1;
  else if (n === 2) totals.formulesF2 += 1;
  else if (n === 3) totals.formulesF3 += 1;
}

function buildSeries(
  days: string[],
  contacts: ContactLite[],
  actions: ActionLite[],
  emails: Array<{ direction: string; sent_at: string }>,
  matchings: Array<{ created_at: string }>,
): DayTotals[] {
  const byDay = new Map(days.map((d) => [d, emptyTotals(d)]));

  for (const contact of contacts) {
    const key = dayKeyFromIso(contact.created_at);
    const row = byDay.get(key);
    if (row) row.newContacts += 1;
  }

  for (const action of actions) {
    const key = dayKeyFromIso(action.created_at);
    const row = byDay.get(key);
    if (!row) continue;
    const kind = String(action.action || "");
    const desc = String(action.description || "");
    if (FORMULE_ACTIONS.has(kind)) {
      const match = desc.match(/formule\s*([123])/i);
      bumpFormule(row, match ? match[1] : desc);
    }
    if (CALL_ACTIONS.has(kind)) row.appels += 1;
    if (REPLY_ACTIONS.has(kind)) row.reponsesClient += 1;
    if (WHATSAPP_ACTIONS.has(kind)) row.whatsappOut += 1;
    if (RELANCE_ACTIONS.has(kind)) row.relancesFormules += 1;
    if (looksPaid(kind, desc)) row.clientPaye += 1;
    if (looksPerdu(kind, desc)) row.prospectPerdu += 1;
    if (looksMatching(kind, desc)) row.matchings += 1;
  }

  for (const email of emails) {
    const key = dayKeyFromIso(email.sent_at);
    const row = byDay.get(key);
    if (!row) continue;
    if (email.direction === "in") row.emailsIn += 1;
    else row.emailsOut += 1;
  }

  for (const matching of matchings) {
    const key = dayKeyFromIso(matching.created_at);
    const row = byDay.get(key);
    if (row) row.matchings += 1;
  }

  // Prefer matching_runs count when available: avoid double-count with journal.
  // If matching_runs had rows, series already counted them; journal matching also
  // increments. Deduplicate by taking max isn't perfect — skip journal matching
  // when matching_runs returned anything in the window.
  if (matchings.length) {
    for (const day of days) {
      const row = byDay.get(day);
      if (!row) continue;
      // recount matchings from matching_runs only for that day
      row.matchings = matchings.filter((m) => dayKeyFromIso(m.created_at) === day).length;
    }
  }

  return days.map((d) => byDay.get(d) || emptyTotals(d));
}

async function buildPriorities(admin: AdminClient): Promise<DailyReport["priorities"]> {
  const { data: active, error } = await admin
    .from("contacts")
    .select("id, prenom, nom, email, suivi_statut, formule, assigned_to, created_at, prioritaire")
    .not("suivi_statut", "eq", "prospect_perdu")
    .not("suivi_statut", "eq", "perdu")
    .order("created_at", { ascending: false })
    .limit(800);
  if (error) throw error;
  const contacts = (active || []) as ContactLite[];

  const unassigned: ReportPerson[] = [];
  const attentePaiement: ReportPerson[] = [];
  const formulesSansReponse: ReportPerson[] = [];
  const prioritaires: ReportPerson[] = [];
  const payeSansMatching: ReportPerson[] = [];
  const noFirstTouch: ReportPerson[] = [];

  const paidIds: string[] = [];
  const newishIds: string[] = [];

  for (const contact of contacts) {
    const statut = canonicalStatut(contact.suivi_statut);
    if (!String(contact.assigned_to || "").trim() && unassigned.length < LIST_CAP) {
      unassigned.push(toPerson(contact));
    }
    if (contact.prioritaire === true && prioritaires.length < LIST_CAP) {
      prioritaires.push(toPerson(contact, "Prioritaire"));
    }
    if (statut === "attente_paiement" && attentePaiement.length < LIST_CAP) {
      attentePaiement.push(toPerson(contact));
    }
    if (
      (statut === "formules_présentées" || statut === "formule_choisie" || statut === "offre_envoyée") &&
      formulesSansReponse.length < LIST_CAP
    ) {
      formulesSansReponse.push(toPerson(contact));
    }
    if (PAID_STATUSES.has(statut)) paidIds.push(String(contact.id));
    const ageMs = Date.now() - new Date(String(contact.created_at || 0)).getTime();
    if (ageMs < 7 * 86400000 && EARLY_NO_TOUCH.has(statut)) {
      newishIds.push(String(contact.id));
    }
  }

  if (paidIds.length) {
    const matched = new Set<string>();
    try {
      const { data: runs } = await admin
        .from("matching_runs")
        .select("contact_id")
        .in("contact_id", paidIds.slice(0, 200));
      for (const row of runs || []) matched.add(String(row.contact_id));
    } catch {
      // table optional
    }
    for (const contact of contacts) {
      if (!PAID_STATUSES.has(canonicalStatut(contact.suivi_statut))) continue;
      if (matched.has(String(contact.id))) continue;
      if (payeSansMatching.length >= LIST_CAP) break;
      payeSansMatching.push(toPerson(contact, "Payé, pas de matching"));
    }
  }

  if (newishIds.length) {
    const touched = new Set<string>();
    const { data: actions } = await admin
      .from("suivi_actions")
      .select("contact_id, action")
      .in("contact_id", newishIds.slice(0, 200))
      .in("action", [
        "appel",
        "appel_effectue",
        "contact_appele",
        "email_envoye",
        "email_formules",
        "whatsapp_envoye",
        "reponse_client",
      ]);
    for (const row of actions || []) touched.add(String(row.contact_id));
    for (const contact of contacts) {
      if (!newishIds.includes(String(contact.id))) continue;
      if (touched.has(String(contact.id))) continue;
      if (noFirstTouch.length >= LIST_CAP) break;
      noFirstTouch.push(toPerson(contact, "Aucun contact sortant"));
    }
  }

  let unreadInbox: ReportPerson[] = [];
  try {
    const { data: unread } = await admin
      .from("contact_emails")
      .select("contact_id")
      .eq("direction", "in")
      .is("read_at", null)
      .limit(200);
    const unreadIds = [...new Set((unread || []).map((r) => String(r.contact_id)))];
    if (unreadIds.length) {
      const map = await mapContactsByIds(admin, unreadIds);
      unreadInbox = unreadIds
        .map((id) => map.get(id))
        .filter(Boolean)
        .slice(0, LIST_CAP)
        .map((c) => toPerson(c as ContactLite, "Mail non lu"));
    }
  } catch {
    unreadInbox = [];
  }

  return {
    unassigned,
    noFirstTouch,
    formulesSansReponse,
    attentePaiement,
    unreadInbox,
    payeSansMatching,
    prioritaires,
  };
}

const EARLY_NO_TOUCH = new Set([
  "nouveau_prospect",
  "bienvenue_envoyé",
  "a_qualifier",
  "",
]);

async function buildPipeline(admin: AdminClient): Promise<Record<string, number>> {
  const keys = [
    "nouveau_prospect",
    "bienvenue_envoyé",
    "a_qualifier",
    "formules_présentées",
    "formule_choisie",
    "attente_paiement",
    "client_payé",
    "dossier_préparation",
    "prospect_perdu",
  ];
  const out: Record<string, number> = {};
  for (const key of keys) out[key] = 0;

  const { data, error } = await admin
    .from("contacts")
    .select("suivi_statut")
    .limit(5000);
  if (error) throw error;
  for (const row of data || []) {
    const statut = canonicalStatut(row.suivi_statut) || "inconnu";
    out[statut] = (out[statut] || 0) + 1;
  }
  return out;
}

function listFromActions(
  actions: ActionLite[],
  contacts: Map<string, ContactLite>,
  predicate: (a: ActionLite) => boolean,
): ReportPerson[] {
  const out: ReportPerson[] = [];
  const seen = new Set<string>();
  for (const action of actions) {
    if (!predicate(action)) continue;
    const id = String(action.contact_id);
    if (seen.has(id)) continue;
    seen.add(id);
    const contact = contacts.get(id);
    if (!contact) continue;
    out.push(
      toPerson(contact, String(action.description || action.action || "").slice(0, 120)),
    );
    if (out.length >= LIST_CAP) break;
  }
  return out;
}

export async function buildDailyReport(
  admin: AdminClient,
  {
    day = shanghaiDayString(),
    historyDays = REPORT_HISTORY_DAYS,
  }: { day?: string; historyDays?: number } = {},
): Promise<DailyReport> {
  const reportDay = isValidDayString(day) ? day : shanghaiDayString();
  const days = dayWindow(reportDay, historyDays);
  const rangeStart = shanghaiDayBounds(days[0]).startIso;
  const rangeEnd = shanghaiDayBounds(reportDay).endIso;
  const dayStart = shanghaiDayBounds(reportDay).startIso;
  const dayEnd = shanghaiDayBounds(reportDay).endIso;

  const [contactsRange, actionsRange, emailsRange, matchingsRange, dayContacts] =
    await Promise.all([
      fetchContactsCreated(admin, rangeStart, rangeEnd),
      fetchActionsInRange(admin, rangeStart, rangeEnd),
      fetchEmailsInRange(admin, rangeStart, rangeEnd),
      fetchMatchingsInRange(admin, rangeStart, rangeEnd),
      fetchContactsCreated(admin, dayStart, dayEnd),
    ]);

  const series = buildSeries(
    days,
    contactsRange,
    actionsRange,
    emailsRange,
    matchingsRange,
  );
  const today = series[series.length - 1] || emptyTotals(reportDay);
  const yesterday = series.length > 1 ? series[series.length - 2] : null;

  const dayActions = actionsRange.filter((a) => dayKeyFromIso(a.created_at) === reportDay);
  const contactIds = [
    ...dayContacts.map((c) => String(c.id)),
    ...dayActions.map((a) => String(a.contact_id)),
  ];
  const contactMap = await mapContactsByIds(admin, contactIds);
  for (const c of dayContacts) contactMap.set(String(c.id), c);

  const lists = {
    newContacts: dayContacts.slice(0, LIST_CAP).map((c) => toPerson(c)),
    formulesChoisies: listFromActions(dayActions, contactMap, (a) =>
      FORMULE_ACTIONS.has(String(a.action)),
    ),
    clientPaye: listFromActions(dayActions, contactMap, (a) =>
      looksPaid(String(a.action), String(a.description || "")),
    ),
    prospectPerdu: listFromActions(dayActions, contactMap, (a) =>
      looksPerdu(String(a.action), String(a.description || "")),
    ),
    appels: listFromActions(dayActions, contactMap, (a) =>
      CALL_ACTIONS.has(String(a.action)),
    ),
    reponsesClient: listFromActions(dayActions, contactMap, (a) =>
      REPLY_ACTIONS.has(String(a.action)),
    ),
  };

  // Enrich formules count from description when formule on contact known
  for (const person of lists.formulesChoisies) {
    const n = getFormuleNumber(person.formule);
    // already counted in series; leave as is
    void n;
  }

  const [priorities, pipeline] = await Promise.all([
    buildPriorities(admin),
    buildPipeline(admin),
  ]);

  return {
    timezone: REPORT_TZ,
    day: reportDay,
    generatedAt: new Date().toISOString(),
    today,
    yesterday,
    delta: deltaTotals(today, yesterday),
    series,
    lists,
    priorities,
    pipeline,
  };
}

export function reportSummaryLines(report: DailyReport): string[] {
  const t = report.today;
  const d = report.delta;
  return [
    `Rapport ${t.date} (heure Pékin)`,
    `Nouveaux dossiers: ${t.newContacts} (${formatDelta(d.newContacts)})`,
    `Formules choisies: ${t.formulesChoisies} (F1 ${t.formulesF1} / F2 ${t.formulesF2} / F3 ${t.formulesF3})`,
    `Client payé: ${t.clientPaye} · Perdus: ${t.prospectPerdu}`,
    `Appels: ${t.appels} · Réponses clients: ${t.reponsesClient}`,
    `Mails in/out: ${t.emailsIn}/${t.emailsOut} · WhatsApp: ${t.whatsappOut}`,
    `Matchings: ${t.matchings} · Relances: ${t.relancesFormules}`,
    `Priorités: non attribués ${report.priorities.unassigned.length}, inbox ${report.priorities.unreadInbox.length}, attente paiement ${report.priorities.attentePaiement.length}`,
  ];
}

// Exported for checks
export const __test = {
  emptyTotals,
  looksPaid,
  looksPerdu,
  looksMatching,
  bumpFormule,
  buildSeries,
  dayKeyFromIso,
};
