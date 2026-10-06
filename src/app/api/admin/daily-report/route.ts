import { NextResponse } from "next/server";
import { requireFullAdmin } from "@/lib/adminRoles";
import {
  buildDailyReport,
  isValidDayString,
  shanghaiDayString,
} from "@/lib/dailyReport";
import { getAuthenticatedAdmin } from "@/lib/studentAuth";

export const maxDuration = 60;

export async function GET(request: Request) {
  try {
    const auth = await getAuthenticatedAdmin(request);
    if ("error" in auth) {
      return NextResponse.json({ error: auth.error }, { status: auth.status });
    }
    const forbidden = requireFullAdmin(auth);
    if (forbidden) {
      return NextResponse.json(
        { error: forbidden.error },
        { status: forbidden.status },
      );
    }

    const url = new URL(request.url);
    const dayParam = String(url.searchParams.get("day") || "").trim();
    const day = isValidDayString(dayParam) ? dayParam : shanghaiDayString();
    const history = Number(url.searchParams.get("history") || 14);
    const report = await buildDailyReport(auth.admin, {
      day,
      historyDays: Number.isFinite(history) ? history : 14,
    });
    return NextResponse.json({ success: true, report });
  } catch (error) {
    console.error("daily-report GET:", error);
    return NextResponse.json(
      { error: "Rapport impossible" },
      { status: 500 },
    );
  }
}
