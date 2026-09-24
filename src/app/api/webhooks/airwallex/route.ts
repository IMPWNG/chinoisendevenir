import { NextResponse } from "next/server";
import { airwallexWebhookSecret, verifyAirwallexWebhook } from "@/lib/airwallex";
import { recordAirwallexEvent } from "@/lib/paymentRecords";
import { getSupabaseAdmin } from "@/lib/supabaseAdmin";

export const maxDuration = 30;

export async function POST(request: Request) {
  const rawBody = await request.text();
  const verified = verifyAirwallexWebhook({
    rawBody,
    headers: request.headers,
    secret: airwallexWebhookSecret(),
  });
  if (!verified.ok) {
    console.error("Webhook Airwallex rejeté:", verified.reason);
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let parsed: unknown;
  try {
    parsed = JSON.parse(rawBody || "{}");
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }
  if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  try {
    const result = await recordAirwallexEvent(
      getSupabaseAdmin(),
      parsed as Record<string, unknown>,
    );
    return NextResponse.json({ success: true, ...result });
  } catch (error) {
    console.error("Webhook Airwallex:", error);
    return NextResponse.json({ error: "Webhook error" }, { status: 500 });
  }
}
