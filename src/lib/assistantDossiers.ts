import { adminTranslations } from "../i18n/admin";
import { isPrioritaire } from "./contactPriority";
import { shanghaiDayString } from "./dailyReportShared";
import { dayTaskBlocked, dayTaskListFilter, isMissingDayTasksTable, pickVisibleDayTasks } from "./dayTasks";
import { displayFormuleLabel } from "./formules";
import { canonicalStatut } from "./suiviStatuts";
import type { AdminClient } from "./supabaseAdmin";

export type AssistantDossier = {
  id: string;
  prenom?: string | null;
  nom?: string | null;
  email?: string | null;
  phone?: string | null;
  pays?: string | null;
  suivi_statut?: string | null;
  formule?: string | null;
  prioritaire?: boolean | null;
  assigned_to?: string | null;
  espace_debloque?: boolean | null;
  date_rentree?: string | null;
  domaine_etudes?: string | null;
  notes_admin?: string | null;
};

export type AssistantTask = {
  contact_id: string;
  task: string;
  done: boolean;
  day: string;
};

const DETAIL_CAP = 20;
const LIST_CAP = 25;

const STATUT_WORDS: { statut: string; words: string[] }[] = [
  { statut: "attente_paiement", words: ["paiement", "payer", "impaye"] },
  { statut: "client_payé", words: ["paye"] },
  { statut: "visa_préparation", words: ["visa"] },
  { statut: "admission_reçue", words: ["admission", "admis"] },
  { statut: "candidature_envoyée", words: ["candidature"] },
  { statut: "dossier_incomplet", words: ["incomplet"] },
  { statut: "dossier_préparation", words: ["preparation"] },
  { statut: "prospect_perdu", words: ["perdu"] },
  { statut: "client_sans_réponse", words: ["sans reponse"] },
  { statut: "arrive_chine", words: ["arrive en chine"] },
  { statut: "dossier_terminé", words: ["dossier termine"] },
  { statut: "formule_choisie", words: ["formule choisie"] },
  { statut: "formules_présentées", words: ["formules presentees"] },
  { statut: "bienvenue_envoyé", words: ["bienvenue"] },
];

function fold(value: string): string {
  return value
    .normalize("NFD")
    .replace(/\p{M}/gu, "")
    .toLowerCase();
}

function hasWord(hay: string, word: string): boolean {
  const needle = fold(word);
  if (!needle) return false;
  return new RegExp(`(?:^|[^a-z0-9])${needle}(?:[^a-z0-9]|$)`).test(hay);
}

function personName(row: AssistantDossier): string {
  const name = [row.prenom, row.nom].map((part) => String(part || "").trim()).filter(Boolean).join(" ");
  return name || String(row.email || "").trim() || "Sans nom";
}

function statusLabel(value: unknown): string {
  const canonical = canonicalStatut(value);
  const labels = adminTranslations.fr.statut as Record<string, string>;
  return labels[canonical] || labels[String(value || "")] || canonical || "Sans statut";
}

export function wantsDossierState(question: string): boolean {
  return /dossier|priorit|tache|statut|qui est|qui sont|lesquels|liste|prospect|assign|debloqu|en est|paiement|impay|relance/.test(
    fold(question),
  );
}

function nameHit(row: AssistantDossier, question: string): boolean {
  const full = fold(`${row.prenom || ""} ${row.nom || ""}`).trim();
  if (full.length >= 4 && question.includes(full)) return true;
  for (const part of [row.prenom, row.nom]) {
    const token = fold(String(part || "")).trim();
    if (token.length >= 4 && hasWord(question, token)) return true;
  }
  const mail = fold(String(row.email || "")).split("@")[0] || "";
  if (mail.length >= 4 && question.includes(mail)) return true;
  const phone = String(row.phone || "").replace(/\D/g, "");
  const asked = question.replace(/\D/g, "");
  return phone.length >= 8 && asked.includes(phone);
}

function statutHits(question: string): Set<string> {
  const hits = new Set<string>();
  for (const item of STATUT_WORDS) {
    if (item.words.some((word) => (word.includes(" ") ? question.includes(fold(word)) : hasWord(question, word)))) {
      hits.add(item.statut);
    }
  }
  for (const [key, label] of Object.entries(adminTranslations.fr.statut as Record<string, string>)) {
    const folded = fold(label);
    if (folded.length >= 8 && question.includes(folded)) hits.add(canonicalStatut(key));
  }
  return hits;
}

function line(parts: Array<string | false | undefined>): string {
  return parts.filter((part): part is string => Boolean(part)).join(" — ");
}

function taskFor(tasks: Map<string, AssistantTask>, id: string, today: string): string {
  const task = tasks.get(id);
  if (!task || task.done) return "";
  const reprise = task.day < today ? ` (reprise du ${task.day})` : "";
  return `${task.task}${reprise}`;
}

export function dossierBrief(
  rows: readonly AssistantDossier[],
  taskRows: readonly AssistantTask[],
  question: string,
  today = "2026-10-18",
): string {
  const q = fold(question);
  const named = rows.filter((row) => nameHit(row, q));
  if (!named.length && !wantsDossierState(question)) return "";

  const visible = pickVisibleDayTasks(taskRows);
  const byId = new Map(rows.map((row) => [row.id, row]));
  const openTasks = new Map<string, AssistantTask>();
  for (const task of visible) {
    if (task.done) continue;
    const owner = byId.get(task.contact_id);
    if (owner && dayTaskBlocked(owner.suivi_statut)) continue;
    openTasks.set(task.contact_id, task);
  }

  const counts = new Map<string, number>();
  for (const row of rows) {
    const label = statusLabel(row.suivi_statut);
    counts.set(label, (counts.get(label) || 0) + 1);
  }
  const countLine = [...counts.entries()]
    .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0], "fr"))
    .map(([label, count]) => `${label} ${count}`)
    .join(", ");

  const priorityAll = rows.filter((row) => isPrioritaire(row));
  const priority = priorityAll.slice(0, LIST_CAP);
  const priorityLines = priority.map((row) => {
    const task = taskFor(openTasks, row.id, today);
    return line([
      personName(row),
      statusLabel(row.suivi_statut),
      row.formule ? displayFormuleLabel(row.formule) : "",
      task ? `tâche: ${task}` : "",
    ]);
  });

  const taskLines = [...openTasks.entries()].slice(0, LIST_CAP).map(([id, task]) => {
    const row = byId.get(id);
    const reprise = task.day < today ? ` (reprise du ${task.day})` : "";
    return `${row ? personName(row) : id} — ${task.task}${reprise}`;
  });

  const statuses = statutHits(q);
  let details: readonly AssistantDossier[] = [];
  if (named.length) details = named;
  else if (statuses.size) {
    details = rows.filter((row) => statuses.has(canonicalStatut(row.suivi_statut)));
  } else if (/liste|tous|toutes|lesquels/.test(q) && !/priorit/.test(q)) {
    details = rows.slice(0, DETAIL_CAP);
  }

  const shown = details.slice(0, DETAIL_CAP);
  const detailLines = shown.map((row) => {
    const note = String(row.notes_admin || "").trim().replace(/\s+/g, " ").slice(0, 160);
    return line([
      personName(row),
      row.email || "",
      row.phone || "",
      row.pays || "",
      statusLabel(row.suivi_statut),
      row.formule ? displayFormuleLabel(row.formule) : "",
      isPrioritaire(row) ? "prioritaire" : "",
      row.espace_debloque ? "espace ouvert" : "espace fermé",
      row.date_rentree ? `rentrée ${row.date_rentree}` : "",
      row.domaine_etudes || "",
      row.assigned_to ? `assigné ${row.assigned_to}` : "",
      taskFor(openTasks, row.id, today) ? `tâche: ${taskFor(openTasks, row.id, today)}` : "",
      note ? `note: ${note}` : "",
    ]);
  });

  const blocks = [
    `# Dossiers en direct (${today}, heure de Pékin)`,
    `${rows.length} dossiers.`,
    countLine ? `Statuts : ${countLine}.` : "",
    priorityLines.length
      ? `Prioritaires (${priorityAll.length}) :\n- ${priorityLines.join("\n- ")}`
      : "Prioritaires : aucun.",
    taskLines.length ? `Tâches ouvertes :\n- ${taskLines.join("\n- ")}` : "Tâches ouvertes : aucune.",
  ];
  if (detailLines.length) {
    const more = details.length > shown.length ? ` ${details.length - shown.length} de plus, précise un nom.` : "";
    blocks.push(
      `Dossiers demandés :\n- ${detailLines.join("\n- ")}${more ? `\n${more.trim()}` : ""}`,
    );
  }
  return blocks.filter(Boolean).join("\n");
}

const CONTACT_FIELDS =
  "id, prenom, nom, email, phone, pays, suivi_statut, formule, prioritaire, assigned_to, espace_debloque, date_rentree, domaine_etudes, notes_admin";

export async function loadDossierBrief(admin: AdminClient, question: string): Promise<string> {
  const today = shanghaiDayString();
  const [contacts, tasks] = await Promise.all([
    admin.from("contacts").select(CONTACT_FIELDS).order("created_at", { ascending: false }).limit(1000),
    admin
      .from("day_tasks")
      .select("contact_id, task, done, day")
      .or(dayTaskListFilter(today))
      .order("day", { ascending: true })
      .order("created_at", { ascending: true })
      .limit(300),
  ]);
  if (contacts.error) {
    return wantsDossierState(question) ? "Dossiers : lecture impossible." : "";
  }
  const taskError = tasks.error?.message || "";
  const taskRows = taskError ? [] : ((tasks.data || []) as AssistantTask[]);
  const brief = dossierBrief((contacts.data || []) as AssistantDossier[], taskRows, question, today);
  if (!brief) return "";
  if (taskError && !isMissingDayTasksTable(taskError)) {
    return `${brief}\nTâches : lecture impossible.`;
  }
  return brief;
}

export type AssistantMail = {
  contact_id?: string | null;
  direction?: string | null;
  subject?: string | null;
  body_text?: string | null;
  from_email?: string | null;
  sent_at?: string | null;
};

const MAIL_CAP = 40;
const MAIL_BODY = 240;

export function wantsMailReport(question: string): boolean {
  return /mail|email|courriel/.test(fold(question));
}

export function mailWindowDays(question: string): number {
  const match = fold(question).match(/(\d{1,3})\s*(?:dernier|jour)/);
  const days = match ? Number(match[1]) : 10;
  if (!Number.isFinite(days) || days < 1) return 10;
  return Math.min(31, days);
}

export function mailBrief(
  rows: readonly AssistantMail[],
  names: ReadonlyMap<string, string>,
  days: number,
  total = rows.length,
): string {
  const inbound = rows.filter((row) => String(row.direction || "") === "in");
  const shown = inbound.slice(0, MAIL_CAP);
  const lines = shown.map((row) => {
    const when = String(row.sent_at || "").replace("T", " ").slice(0, 16);
    const who = names.get(String(row.contact_id || "")) || String(row.from_email || "").trim() || "Expéditeur inconnu";
    const subject = String(row.subject || "").trim() || "(sans objet)";
    const body = String(row.body_text || "").trim().replace(/\s+/g, " ").slice(0, MAIL_BODY);
    return [when, who, subject, body].filter(Boolean).join(" — ");
  });
  const more = total > shown.length ? `\n${shown.length} affichés sur ${total}, les plus récents.` : "";
  const list = lines.length ? `\n- ${lines.join("\n- ")}` : "\nAucun mail reçu sur cette période.";
  return `# Mails reçus (${days} derniers jours)\n${total} messages.${list}${more}`;
}

export async function loadMailBrief(admin: AdminClient, question: string): Promise<string> {
  if (!wantsMailReport(question)) return "";
  const days = mailWindowDays(question);
  const since = new Date(Date.now() - days * 86400000).toISOString();
  const { data, error, count } = await admin
    .from("contact_emails")
    .select("contact_id, direction, subject, body_text, from_email, sent_at", { count: "exact" })
    .eq("direction", "in")
    .gte("sent_at", since)
    .order("sent_at", { ascending: false })
    .limit(MAIL_CAP);
  if (error) return "Mails reçus : lecture impossible.";

  const mails = (data || []) as AssistantMail[];
  const ids = [...new Set(mails.map((row) => String(row.contact_id || "")).filter(Boolean))];
  const names = new Map<string, string>();
  if (ids.length) {
    const contacts = await admin.from("contacts").select("id, prenom, nom, suivi_statut").in("id", ids);
    if (!contacts.error) {
      for (const row of (contacts.data || []) as AssistantDossier[]) {
        names.set(row.id, line([personName(row), statusLabel(row.suivi_statut)]));
      }
    }
  }
  return mailBrief(mails, names, days, count ?? mails.length);
}
