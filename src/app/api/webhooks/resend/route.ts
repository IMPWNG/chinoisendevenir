import { NextResponse } from "next/server";
import { processInboundEmail } from "@/lib/api/inbound-email";
import { verifyResendWebhook } from "@/lib/api/resend-webhook";
import { asString } from "@/lib/request";

export const maxDuration = 30;

export async function POST(request: Request) {
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

  let parsed: unknown;
  try {
    parsed = JSON.parse(rawBody || "{}");
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  try {
    const type =
      parsed && typeof parsed === "object" && "type" in parsed
        ? asString((parsed as { type?: unknown }).type)
        : "";
    if (type && type !== "email.received") {
      return NextResponse.json({
        success: true,
        message: `Event ignored: ${type}`,
      });
    }

    const result = await processInboundEmail(parsed);
    return NextResponse.json(result, { status: result.httpStatus || 200 });
  } catch (error) {
    console.error("❌ Erreur webhook Resend:", error);
    return NextResponse.json(
      { success: false, error: "Webhook error" },
      { status: 500 },
    );
  }
}
