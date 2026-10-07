import { NextResponse } from "next/server";
import { buildEmailWeekReport } from "@/lib/adminEmailWeek";
import { isValidDayString, shanghaiDayString } from "@/lib/dailyReportShared";
import { getAuthenticatedAdmin } from "@/lib/studentAuth";

export const maxDuration = 60;

export async function GET(request: Request) {
  try {
    const auth = await getAuthenticatedAdmin(request);
    if ("error" in auth) {
      return NextResponse.json({ error: auth.error }, { status: auth.status });
    }

    const url = new URL(request.url);
    const dayParam = String(url.searchParams.get("day") || "").trim();
    const day = isValidDayString(dayParam) ? dayParam : shanghaiDayString();
    const report = await buildEmailWeekReport(auth.admin, { day });
    return NextResponse.json({ success: true, report });
  } catch (error) {
    console.error("emails-week GET:", error);
    return NextResponse.json(
      { error: "Impossible de charger les emails" },
      { status: 500 },
    );
  }
}
