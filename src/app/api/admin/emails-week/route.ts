import { NextResponse } from "next/server";
import { buildUnansweredEmailsReport } from "@/lib/adminEmailWeek";
import { getAuthenticatedAdmin } from "@/lib/studentAuth";

export const maxDuration = 60;

export async function GET(request: Request) {
  try {
    const auth = await getAuthenticatedAdmin(request);
    if ("error" in auth) {
      return NextResponse.json({ error: auth.error }, { status: auth.status });
    }

    const report = await buildUnansweredEmailsReport(auth.admin);
    return NextResponse.json({ success: true, report });
  } catch (error) {
    console.error("emails-week GET:", error);
    return NextResponse.json(
      { error: "Impossible de charger les emails" },
      { status: 500 },
    );
  }
}
