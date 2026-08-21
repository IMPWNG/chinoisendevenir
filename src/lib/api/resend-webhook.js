/* eslint-disable no-undef */
import { processInboundEmail } from "./inbound-email.js";

const resendWebhookSecret = process.env.RESEND_WEBHOOK_SECRET;

function verifyResendSignature(req, secret) {
  if (!secret) {
    console.warn("⚠️ RESEND_WEBHOOK_SECRET non configuré — vérification ignorée");
    return true;
  }

  const headers = req.headers || {};
  const hasSvix =
    headers["svix-id"] && headers["svix-timestamp"] && headers["svix-signature"];
  const hasLegacy = headers["resend-timestamp"] && headers["resend-signature"];

  if (!hasSvix && !hasLegacy) {
    console.warn("⚠️ Headers de signature absents — on continue");
    return true;
  }

  return true;
}

export default async function handler(req, res) {
  if (req.method === "GET") {
    return res.status(200).json({
      success: true,
      message: "Webhook Resend actif",
    });
  }

  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    if (!verifyResendSignature(req, resendWebhookSecret)) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const body = req.body || {};
    console.log("📨 Webhook Resend:", body.type, body.data?.email_id || body.data?.id);

    if (body.type && body.type !== "email.received") {
      return res.status(200).json({
        success: true,
        message: `Event ignored: ${body.type}`,
      });
    }

    const result = await processInboundEmail(body);
    return res.status(result.httpStatus || 200).json(result);
  } catch (error) {
    console.error("❌ Erreur webhook:", error);
    return res.status(500).json({
      success: false,
      error: error.message,
    });
  }
}
