import { NextResponse } from "next/server";
import { processInboundEmail } from "@/lib/api/inbound-email";
import { verifyResendWebhook } from "@/lib/api/resend-webhook";

export const maxDuration = 30;

export async function POST(request) {
  const rawBody = await request.text();
  const verified = verifyResendWebhook({
    rawBody,
    headers: request.headers,
    secret: process.env.RESEND_WEBHOOK_SECRET,
  });

  if (!verified.ok) {
    console.error("❌ Webhook Resend rejeté:", verified.reason);
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body = {};
  try {
    body = JSON.parse(rawBody || "{}");
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  try {
    if (body.type && body.type !== "email.received") {
      return NextResponse.json({
        success: true,
        message: `Event ignored: ${body.type}`,
      });
    }

    const result = await processInboundEmail(body);
    return NextResponse.json(result, { status: result.httpStatus || 200 });
  } catch (error) {
    console.error("❌ Erreur webhook Resend:", error);
    return NextResponse.json(
      { success: false, error: "Webhook error" },
      { status: 500 },
    );
  }
}
