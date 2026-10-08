import { Resend } from "resend";
import { getFullAdminEmails } from "./adminRoles";
import { CONTACT_FROM } from "./emailConfig";
import {
  buildDailyReport,
  formatDelta,
  reportSummaryLines,
  shanghaiDayString,
  type DailyReport,
} from "./dailyReport";
import { SITE_URL } from "./emailLayout";
import { grokbotDayTasks, isMissingDayTasksTable } from "./dayTasks";
import { getResendApiKey, getSupabaseAdmin, type AdminClient } from "./supabaseAdmin";

function reportUrl(day: string) {
  const base = String(SITE_URL || "https://chinoisendevenir.com").replace(/\/$/, "");
  return `${base}/admin/rapport?day=${encodeURIComponent(day)}`;
}

function htmlEscape(value: unknown) {
  return String(value || "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;");
}

function reportHtml(report: DailyReport) {
  const t = report.today;
  const d = report.delta;
  const link = reportUrl(report.day);
  const priorities = [
    ["Non attribués", report.priorities.unassigned],
    ["Sans 1er contact", report.priorities.noFirstTouch],
    ["Inbox non lue", report.priorities.unreadInbox],
    ["Attente paiement", report.priorities.attentePaiement],
    ["Payés sans matching", report.priorities.payeSansMatching],
    ["Prioritaires", report.priorities.prioritaires],
  ] as const;

  const priorityBlocks = priorities
    .filter(([, list]) => list.length)
    .map(([title, list]) => {
      const items = list
        .slice(0, 8)
        .map(
          (p) =>
            `<li><strong>${htmlEscape(p.name)}</strong> — ${htmlEscape(p.statut || "—")}${
              p.note ? ` · ${htmlEscape(p.note)}` : ""
            }</li>`,
        )
        .join("");
      return `<h3 style="margin:16px 0 6px;font-size:15px;">${htmlEscape(title)} (${list.length})</h3><ul style="margin:0;padding-left:18px;">${items}</ul>`;
    })
    .join("");

  return `<!doctype html><html><body style="font-family:Inter,Segoe UI,sans-serif;color:#1d3557;line-height:1.5;">
  <h1 style="font-size:20px;">Rapport quotidien — ${htmlEscape(t.date)}</h1>
  <p>Heure Pékin. Comparaison vs veille entre parenthèses.</p>
  <ul>
    <li>Nouveaux dossiers : <strong>${t.newContacts}</strong> (${htmlEscape(formatDelta(d.newContacts))})</li>
    <li>Formules choisies : <strong>${t.formulesChoisies}</strong> (F1 ${t.formulesF1} / F2 ${t.formulesF2} / F3 ${t.formulesF3})</li>
    <li>Client payé : <strong>${t.clientPaye}</strong> · Perdus : <strong>${t.prospectPerdu}</strong></li>
    <li>Appels : <strong>${t.appels}</strong> · Réponses clients : <strong>${t.reponsesClient}</strong></li>
    <li>Mails in/out : <strong>${t.emailsIn}/${t.emailsOut}</strong> · WhatsApp : <strong>${t.whatsappOut}</strong></li>
    <li>Matchings : <strong>${t.matchings}</strong> · Relances : <strong>${t.relancesFormules}</strong></li>
  </ul>
  ${priorityBlocks || "<p>Aucune priorité listée.</p>"}
  <p style="margin-top:20px;"><a href="${htmlEscape(link)}" style="display:inline-block;background:#1d3557;color:#fff;text-decoration:none;padding:12px 16px;border-radius:8px;font-weight:700;">Ouvrir le rapport complet</a></p>
  </body></html>`;
}

export async function sendDailyReportEmail(day = shanghaiDayString()) {
  const recipients = [...getFullAdminEmails()];
  if (!recipients.length) {
    return { success: false as const, error: "ADMIN_EMAILS vide" };
  }

  const admin = getSupabaseAdmin();
  const report = await buildDailyReport(admin, { day, historyDays: 14 });
  await syncGrokbotDayTasks(admin, report);
  const resend = new Resend(getResendApiKey());
  const subject = `Etude Chine — Rapport ${report.day}`;
  const text = `${reportSummaryLines(report).join("\n")}\n\n${reportUrl(report.day)}`;

  const { error } = await resend.emails.send({
    from: CONTACT_FROM,
    to: recipients,
    subject,
    html: reportHtml(report),
    text,
  });

  if (error) {
    return {
      success: false as const,
      error: String((error as { message?: string }).message || error),
    };
  }

  return {
    success: true as const,
    day: report.day,
    recipients,
    url: reportUrl(report.day),
  };
}

async function syncGrokbotDayTasks(admin: AdminClient, report: DailyReport) {
  const wanted = grokbotDayTasks(report.priorities);
  if (!wanted.length) return;

  const { data, error } = await admin
    .from("day_tasks")
    .select("contact_id")
    .eq("day", report.day)
    .eq("source", "grokbot");
  if (error) {
    if (!isMissingDayTasksTable(error.message)) {
      console.warn("day tasks read:", error.message);
    }
    return;
  }

  const have = new Set((data || []).map((row) => String(row.contact_id)));
  const fresh = wanted.filter((task) => !have.has(task.contactId));
  if (!fresh.length) return;

  const { error: insertError } = await admin.from("day_tasks").insert(
    fresh.map((task) => ({
      contact_id: task.contactId,
      day: report.day,
      task: task.task,
      source: "grokbot",
      done: false,
    })),
  );
  if (insertError && !isMissingDayTasksTable(insertError.message)) {
    console.warn("day tasks insert:", insertError.message);
  }
}
