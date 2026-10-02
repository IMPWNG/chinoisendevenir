import { NextResponse } from "next/server";
import { processOutboundDrip } from "@/lib/dripQueue";

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
    const result = await processOutboundDrip();
    return NextResponse.json(result, { status: result.success ? 200 : 500 });
  } catch (error) {
    console.error("Cron envoi automatique:", error);
    return NextResponse.json(
      { success: false, error: "Erreur cron" },
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
