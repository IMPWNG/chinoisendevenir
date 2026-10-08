import { NextResponse } from "next/server";
import { shanghaiDayString } from "@/lib/dailyReportShared";
import { isMissingDayTasksTable, parseAgentDayTasks } from "@/lib/dayTasks";
import { readJsonObject } from "@/lib/request";
import { getSupabaseAdmin } from "@/lib/supabaseAdmin";

export const maxDuration = 30;

function isAuthorizedAgent(request: Request) {
  const secret = String(process.env.CRON_SECRET || "").trim();
  if (!secret) return false;
  return request.headers.get("authorization") === `Bearer ${secret}`;
}

export async function POST(request: Request) {
  if (!isAuthorizedAgent(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await readJsonObject(request);
  const parsed = parseAgentDayTasks(body, shanghaiDayString());
  if ("error" in parsed) {
    return NextResponse.json({ error: parsed.error }, { status: 400 });
  }
  if (!parsed.tasks.length) {
    return NextResponse.json({ success: true, day: parsed.day, inserted: 0 });
  }

  try {
    const admin = getSupabaseAdmin();
    const { data, error } = await admin
      .from("day_tasks")
      .select("contact_id")
      .eq("day", parsed.day)
      .eq("source", "grokbot");
    if (error) {
      return NextResponse.json(
        {
          error: isMissingDayTasksTable(error.message)
            ? "Table day_tasks absente"
            : "Lecture impossible",
        },
        { status: 500 },
      );
    }

    const have = new Set((data || []).map((row) => String(row.contact_id)));
    const fresh = parsed.tasks.filter((task) => !have.has(task.contactId));
    if (!fresh.length) {
      return NextResponse.json({ success: true, day: parsed.day, inserted: 0 });
    }

    const { error: insertError } = await admin.from("day_tasks").insert(
      fresh.map((task) => ({
        contact_id: task.contactId,
        day: parsed.day,
        task: task.task,
        source: "grokbot",
        done: false,
        created_by: parsed.createdBy || null,
      })),
    );
    if (insertError) {
      return NextResponse.json({ error: "Écriture impossible" }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      day: parsed.day,
      inserted: fresh.length,
    });
  } catch (error) {
    console.error("agent day-tasks:", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
