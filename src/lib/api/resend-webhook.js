/* eslint-disable no-undef */
import { createClient } from "@supabase/supabase-js";
import crypto from "crypto";

const supabaseUrl =
  process.env.SUPABASE_URL ||
  process.env.NEXT_PUBLIC_SUPABASE_URL ||
  process.env.VITE_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const resendWebhookSecret = process.env.RESEND_WEBHOOK_SECRET;

const supabase = createClient(supabaseUrl, serviceRoleKey);

console.log("✅ Webhook Resend démarrée");

// 🎯 Patterns de détection des réponses
const AUTO_REPLY_PATTERNS = {
  welcome_confirm: {
    keywords: [
      "je souhaite recevoir les informations",
      "je veux recevoir",
      "je souhaite l'accompagnement",
      "oui je suis intéressé",
      "intéressé",
      "oui",
    ],
    status: "choix_des_formules",
    emailTemplate: "formules_presentation",
  },
};

// 🔍 Détecter le type de réponse
function detectResponseType(emailText) {
  const text = emailText.toLowerCase();
  for (const pattern of Object.values(AUTO_REPLY_PATTERNS)) {
    if (pattern.keywords.some((keyword) => text.includes(keyword))) {
      return pattern;
    }
  }
  return null;
}

// 🔐 Vérifier la signature (optionnel en dev)
function verifyResendSignature(req, secret) {
  if (!secret) {
    console.warn("⚠️ RESEND_WEBHOOK_SECRET non configuré - Mode DEV");
    return true;
  }

  const timestamp = req.headers["resend-timestamp"];
  const signature = req.headers["resend-signature"];

  if (!timestamp || !signature) {
    console.error("❌ Headers de signature manquants");
    return false;
  }

  const signedContent = `${timestamp}.${JSON.stringify(req.body)}`;
  const hash = crypto
    .createHmac("sha256", secret)
    .update(signedContent)
    .digest("base64");

  const isValid = hash === signature;
  if (!isValid) {
    console.error("❌ Signature du webhook invalide");
  }
  return isValid;
}

// 🎯 Handler Vercel
export default async function handler(req, res) {
  // ✅ Accepter les health checks GET
  if (req.method === "GET") {
    return res.status(200).json({
      success: true,
      message: "Webhook Resend actif ✅",
    });
  }

  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    console.log("📨 Webhook Resend reçu");

    // 🔐 Vérifier la signature (à activer en PROD)
    if (!verifyResendSignature(req, resendWebhookSecret)) {
      console.error("❌ Signature invalide");
      // EN PROD: return res.status(401).json({ error: "Unauthorized" });
      // EN DEV: continuer quand même
    }

    const body = req.body;
    console.log("📨 Payload:", JSON.stringify(body, null, 2));

    // 🔍 Vérifier que c'est un email entrant
    if (body.type !== "email.received") {
      console.log(`ℹ️ Type d'événement non géré: ${body.type}`);
      return res.status(200).json({ success: true, message: "Event ignored" });
    }

    const { data } = body;

    if (!data || !data.from || !data.text) {
      console.error("❌ Données d'email incomplètes");
      return res.status(400).json({ error: "Missing required fields" });
    }

    const { from, subject, text } = data;
    console.log(`📧 Email de ${from} : ${subject}`);

    // 🔍 Chercher le contact
    const { data: contact, error: fetchError } = await supabase
      .from("contacts")
      .select("*")
      .eq("email", from)
      .single();

    if (fetchError || !contact) {
      console.log(`⚠️ Contact non trouvé : ${from}`);
      return res.status(200).json({
        success: false,
        message: "Contact non trouvé",
      });
    }

    // 🎯 Détecter le pattern
    const pattern = detectResponseType(text);

    if (!pattern) {
      console.log(`ℹ️ Pas de pattern pour : ${from}`);
      return res.status(200).json({
        success: false,
        message: "Pas de pattern détecté",
      });
    }

    console.log(
      `✅ Pattern détecté : ${pattern.emailTemplate} → ${pattern.status}`,
    );

    // 🚀 Appeler autoReply.js pour envoyer l'email
    try {
      const baseUrl = process.env.VERCEL_URL
        ? `https://${process.env.VERCEL_URL}`
        : process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
      const autoReplyUrl = `${baseUrl}/api/email/auto-reply`;

      console.log(`🔗 Appel autoReply.js : ${autoReplyUrl}`);

      const autoReplyResponse = await fetch(autoReplyUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contactId: contact.id,
          status: pattern.status,
          source: "webhook_resend",
        }),
      });

      const autoReplyData = await autoReplyResponse.json();

      if (!autoReplyData.success) {
        console.error("❌ Erreur autoReply:", autoReplyData.message);
        return res.status(500).json({
          success: false,
          message: "Erreur lors de l'envoi de l'email",
          error: autoReplyData.message,
        });
      }

      console.log("✅ autoReply.js exécuté avec succès");

      // 📝 Logger l'action dans suivi_actions
      await supabase.from("suivi_actions").insert([
        {
          contact_id: contact.id,
          action: "email_envoye",
          description: `Choix des formules envoyé (détection automatique webhook)`,
          user_admin: "système_automatique",
        },
      ]);

      return res.status(200).json({
        success: true,
        message: "Email envoyé via webhook ✅",
        contact: contact.id,
        pattern: pattern.emailTemplate,
        status: pattern.status,
        source: "webhook_resend",
      });
    } catch (fetchError) {
      console.error("❌ Erreur appel autoReply:", fetchError);
      return res.status(500).json({
        success: false,
        message: "Erreur communication avec autoReply",
        error: fetchError.message,
      });
    }
  } catch (error) {
    console.error("❌ Erreur webhook:", error);
    return res.status(500).json({
      success: false,
      error: error.message,
    });
  }
}
