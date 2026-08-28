import { NextResponse } from "next/server";
import {
  processIncomingWhatsApp,
  verifySubscribeChallenge,
  verifyWhatsAppSignature,
} from "@/lib/api/whatsapp-webhook";
import { getWhatsAppConfig } from "@/lib/whatsapp/cloud";

export const maxDuration = 30;

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const verified = verifySubscribeChallenge(searchParams);
  if (!verified.ok) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  return new NextResponse(verified.challenge, {
    status: 200,
    headers: { "Content-Type": "text/plain" },
  });
}

export async function POST(request) {
  const rawBody = await request.text();
  const config = getWhatsAppConfig();
  const signature = request.headers.get("x-hub-signature-256");

  if (!verifyWhatsAppSignature(rawBody, signature, config.appSecret)) {
    return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
  }

  let body = {};
  try {
    body = JSON.parse(rawBody || "{}");
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  try {
    const result = await processIncomingWhatsApp(body);
    return NextResponse.json(result);
  } catch (error) {
    console.error("❌ Webhook WhatsApp:", error);
    return NextResponse.json(
      { success: false, error: "Webhook error" },
      { status: 500 },
    );
  }
}
