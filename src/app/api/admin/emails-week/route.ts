import { NextResponse } from "next/server";
import { buildUnansweredEmailsReport } from "@/lib/adminEmailWeek";
import { asString, readJsonObject } from "@/lib/request";
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

export async function PATCH(request: Request) {
  try {
    const auth = await getAuthenticatedAdmin(request);
    if ("error" in auth) {
      return NextResponse.json({ error: auth.error }, { status: auth.status });
    }
    const body = await readJsonObject(request);
    const id = asString(body?.id).trim();
    if (!id) {
      return NextResponse.json({ error: "Requête invalide" }, { status: 400 });
    }
    const now = new Date().toISOString();
    const { error } = await auth.admin
      .from("contact_emails")
      .update({ dismissed_at: now, read_at: now })
      .eq("id", id);
    if (error) {
      return NextResponse.json({ error: "Retrait impossible" }, { status: 500 });
    }
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("emails-week PATCH:", error);
    return NextResponse.json({ error: "Retrait impossible" }, { status: 500 });
  }
}
