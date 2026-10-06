import { NextResponse } from "next/server";
import { sendDailyReportEmail } from "@/lib/dailyReportEmail";
import { shanghaiDayString } from "@/lib/dailyReport";

export const maxDuration = 60;

function isAuthorizedCron(request: Request) {
  const secret = String(process.env.CRON_SECRET || "").trim();
  if (!secret) return false;
  const header = request.headers.get("authorization") || "";
  return header === `Bearer ${secret}`;
}

async function runCron(request: Request) {
  if (!isAuthorizedCron(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    // 20:00 Asia/Shanghai = 12:00 UTC — report covers "today" Shanghai.
    const result = await sendDailyReportEmail(shanghaiDayString());
    return NextResponse.json(result, {
      status: result.success ? 200 : 500,
    });
  } catch (error) {
    console.error("daily-report cron:", error);
    return NextResponse.json(
      { success: false, error: "Erreur cron rapport" },
      { status: 500 },
    );
  }
}

export async function GET(request: Request) {
  return runCron(request);
}

export async function POST(request: Request) {
  return runCron(request);
}
