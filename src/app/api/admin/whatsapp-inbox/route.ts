import { NextResponse } from "next/server";
import { shanghaiDayString } from "@/lib/dailyReportShared";
import { dayTaskListFilter, whatsappPriorityTasks } from "@/lib/dayTasks";
import { recentWhatsappHistories } from "@/lib/openwa";
import { asString, readJsonObject } from "@/lib/request";
import { getAuthenticatedAdmin } from "@/lib/studentAuth";
import { splitWhatsappInbox } from "@/lib/whatsappInbox";

export const maxDuration = 30;

const empty = { needOurReply: [], needStudentReply: [] };

export async function GET(request: Request) {
  const auth = await getAuthenticatedAdmin(request);
  if ("error" in auth) {
    return NextResponse.json({ error: auth.error }, { status: auth.status || 403 });
  }
  if (auth.role !== "full") {
    return NextResponse.json({ success: true, report: empty });
  }

  try {
    const { data, error } = await auth.admin
      .from("contacts")
      .select("id, prenom, nom, phone, pays");
    if (error) {
      return NextResponse.json({ error: "Lecture impossible" }, { status: 500 });
    }
    const contacts = data || [];
    const histories = await recentWhatsappHistories(contacts, {
      maxMatches: 500,
      budgetMs: 22_000,
      historyLimit: 1,
    });
    const { data: cleared } = await auth.admin
      .from("whatsapp_inbox_dismissals")
      .select("contact_id, message_at");
    const dismissed = new Map(
      (cleared || []).map((row) => [String(row.contact_id), String(row.message_at)]),
    );
    const report = splitWhatsappInbox(contacts, histories, Date.now(), dismissed);
    const day = shanghaiDayString();
    const { data: existing } = await auth.admin
      .from("day_tasks")
      .select("contact_id")
      .or(dayTaskListFilter(day));
    const rows = whatsappPriorityTasks(
      report.needOurReply.map((item) => ({
        contactId: item.contactId,
        text: item.preview || item.body,
      })),
      day,
      new Set((existing || []).map((row) => String(row.contact_id))),
    );
    if (rows.length) {
      const { error: insertError } = await auth.admin.from("day_tasks").insert(rows);
      if (insertError) console.warn("whatsapp day tasks:", insertError.message);
    }
    return NextResponse.json({ success: true, report });
  } catch (error) {
    console.error("whatsapp-inbox:", error);
    return NextResponse.json({ success: true, report: empty });
  }
}

export async function PATCH(request: Request) {
  const auth = await getAuthenticatedAdmin(request);
  if ("error" in auth) {
    return NextResponse.json({ error: auth.error }, { status: auth.status || 403 });
  }
  if (auth.role !== "full") {
    return NextResponse.json({ error: "Interdit" }, { status: 403 });
  }
  const body = await readJsonObject(request);
  const contactId = asString(body?.contactId || body?.id).trim();
  const sentAt = asString(body?.sentAt).trim();
  if (!contactId || !sentAt || Number.isNaN(Date.parse(sentAt))) {
    return NextResponse.json({ error: "Requête invalide" }, { status: 400 });
  }
  const { error } = await auth.admin.from("whatsapp_inbox_dismissals").upsert(
    {
      contact_id: contactId,
      message_at: sentAt,
      dismissed_at: new Date().toISOString(),
    },
    { onConflict: "contact_id" },
  );
  if (error) {
    console.error("whatsapp dismiss:", error.message);
    return NextResponse.json({ error: "Retrait impossible" }, { status: 500 });
  }
  return NextResponse.json({ success: true });
}
