import { NextResponse } from "next/server";
import { shanghaiDayString } from "@/lib/dailyReportShared";
import { whatsappPriorityTasks } from "@/lib/dayTasks";
import { recentWhatsappHistories } from "@/lib/openwa";
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
      maxMatches: 80,
      budgetMs: 12_000,
      historyLimit: 5,
    });
    const report = splitWhatsappInbox(contacts, histories);
    const day = shanghaiDayString();
    const { data: existing } = await auth.admin
      .from("day_tasks")
      .select("contact_id")
      .eq("day", day)
      .eq("source", "whatsapp");
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
