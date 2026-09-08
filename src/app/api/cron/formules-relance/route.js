import { NextResponse } from "next/server";
import { processFormulesRelances } from "@/lib/api/formules-relance";

export const maxDuration = 60;

function isAuthorizedCron(request) {
  const secret = String(process.env.CRON_SECRET || "").trim();
  if (!secret) return false;
  const header = request.headers.get("authorization") || "";
  return header === `Bearer ${secret}`;
}

async function runCron(request) {
  if (!isAuthorizedCron(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const result = await processFormulesRelances();
    return NextResponse.json(result, {
      status: result.success ? 200 : 500,
    });
  } catch (error) {
    console.error("❌ Cron relance formules:", error);
    return NextResponse.json(
      { success: false, error: "Erreur cron" },
      { status: 500 },
    );
  }
}

export async function GET(request) {
  return runCron(request);
}

export async function POST(request) {
  return runCron(request);
}
