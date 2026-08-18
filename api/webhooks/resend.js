/* eslint-disable no-undef */
import { Resend } from "resend";
import { createClient } from "@supabase/supabase-js";
import crypto from "crypto";

const resendApiKey = process.env.RESEND_API_KEY;
const supabaseUrl = process.env.VITE_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const resendWebhookSecret = process.env.RESEND_WEBHOOK_SECRET;

const supabase = createClient(supabaseUrl, serviceRoleKey);
const resend = new Resend(resendApiKey);

console.log("✅ Webhook Resend démarrée");

// 🎯 Patterns de détection
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

// 📧 Templates
const EMAIL_TEMPLATES = {
  formules_presentation: {
    subject: "✅ Nos formules d'accompagnement pour étudier en Chine 🇨🇳",
    html: (contact) => `
      <div style="max-width: 700px; margin: 0 auto; font-family: 'Segoe UI', Arial, sans-serif; line-height: 1.6; color: #333;">

        <div style="text-align: center; padding: 20px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); border-radius: 10px 10px 0 0;">
          <h2 style="color: white; margin: 0; font-size: 24px;">🇨🇳 Nos formules d'accompagnement pour étudier en Chine</h2>
        </div>

        <div style="padding: 30px; background: #f9fafb;">
          <p>Bonjour <strong>${contact.prenom}</strong>,</p>
          <p>Merci pour votre retour ! Nous proposons plusieurs formules d'accompagnement selon votre besoin et votre niveau d'assistance.</p>

          <!-- FORMULE 1 -->
          <div style="background: white; padding: 20px; margin: 20px 0; border-left: 5px solid #3b82f6; border-radius: 5px;">
            <h3 style="color: #3b82f6; margin-top: 0; display: flex; align-items: center;">
              <span style="font-size: 24px; margin-right: 10px;">1️⃣</span> Orientation — 50€
            </h3>
            <p style="color: #666; margin: 10px 0; font-weight: bold;">Cette formule comprend :</p>
            <ul style="color: #555; margin: 10px 0 0 0; padding-left: 20px;">
              <li style="margin-bottom: 8px;">✓ Analyse de votre profil</li>
              <li style="margin-bottom: 8px;">✓ Orientation vers les formations adaptées</li>
              <li style="margin-bottom: 8px;">✓ Informations sur les universités et bourses possibles</li>
              <li style="margin-bottom: 8px;">✓ Liste personnalisée des documents à préparer</li>
            </ul>
          </div>

          <!-- FORMULE 2 -->
          <div style="background: white; padding: 20px; margin: 20px 0; border-left: 5px solid #10b981; border-radius: 5px; box-shadow: 0 2px 8px rgba(16, 185, 129, 0.1);">
            <h3 style="color: #10b981; margin-top: 0; display: flex; align-items: center;">
              <span style="font-size: 24px; margin-right: 10px;">2️⃣</span> Accompagnement candidature — 300€
            </h3>
            <p style="color: #666; margin: 10px 0; font-weight: bold;">Cette formule comprend :</p>
            <ul style="color: #555; margin: 10px 0 0 0; padding-left: 20px;">
              <li style="margin-bottom: 8px;">✓ Recherche d'universités adaptées</li>
              <li style="margin-bottom: 8px;">✓ Identification des opportunités de bourses</li>
              <li style="margin-bottom: 8px;">✓ Préparation et vérification du dossier</li>
              <li style="margin-bottom: 8px;">✓ Assistance pour remplir les candidatures</li>
              <li style="margin-bottom: 8px;">✓ Dépôt des candidatures</li>
              <li style="margin-bottom: 8px;">✓ Suivi de votre dossier jusqu'à la réponse des universités</li>
              <li style="margin-bottom: 8px;">✓ Traduction des documents</li>
            </ul>
          </div>

          <!-- FORMULE 3 -->
          <div style="background: white; padding: 20px; margin: 20px 0; border-left: 5px solid #f59e0b; border-radius: 5px; box-shadow: 0 2px 8px rgba(245, 158, 11, 0.1);">
            <h3 style="color: #f59e0b; margin-top: 0; display: flex; align-items: center;">
              <span style="font-size: 24px; margin-right: 10px;">3️⃣</span> Accompagnement complet — 500€
            </h3>
            <p style="color: #666; margin: 10px 0; font-weight: bold;">Cette formule comprend :</p>
            <ul style="color: #555; margin: 10px 0 0 0; padding-left: 20px;">
              <li style="margin-bottom: 8px;">✓ Tous les services de la formule candidature</li>
              <li style="margin-bottom: 8px;">✓ Accompagnement personnalisé pendant toute la procédure</li>
              <li style="margin-bottom: 8px;">✓ Aide pour les documents administratifs</li>
              <li style="margin-bottom: 8px;">✓ Assistance après admission</li>
              <li style="margin-bottom: 8px;">✓ Orientation concernant le logement, le visa et l'arrivée en Chine</li>
              <li style="margin-bottom: 8px;">✓ Suivi jusqu'à votre départ</li>
            </ul>
          </div>

          <!-- CONDITIONS IMPORTANTES -->
          <div style="background: #fef3c7; padding: 20px; border-radius: 5px; margin: 20px 0; border-left: 5px solid #d97706;">
            <h4 style="color: #d97706; margin-top: 0;">⚠️ Conditions importantes</h4>
            <p style="color: #666; margin: 10px 0;"><strong>Les démarches commencent après :</strong></p>
            <ol style="color: #555; margin: 10px 0 0 0; padding-left: 20px;">
              <li style="margin-bottom: 8px;">Le choix de la formule</li>
              <li style="margin-bottom: 8px;">La signature de nos conditions de service</li>
              <li style="margin-bottom: 8px;">Le paiement des frais d'accompagnement</li>
            </ol>
            <p style="color: #666; margin: 15px 0 0 0; font-size: 13px;">
              📌 <strong>Note :</strong> Les frais de candidature, de légalisation, de visa ou autres frais administratifs ne sont pas nécessairement inclus dans ces tarifs.
            </p>
            <p style="color: #666; margin: 10px 0 0 0; font-size: 13px;">
              📌 L'obtention d'une admission ou d'une bourse ne peut pas être garantie. La décision finale appartient aux universités et organismes concernés.
            </p>
          </div>

          <!-- CTA PRINCIPAL -->
          <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 25px; border-radius: 8px; text-align: center; margin: 20px 0;">
            <p style="color: white; margin: 0 0 10px 0; font-size: 16px;">
              <strong>👉 Pour commencer, répondez simplement à cet e-mail avec le numéro de la formule souhaitée :</strong>
            </p>
            <p style="color: white; margin: 10px 0; font-size: 18px; font-weight: bold;">
              <strong>1️⃣ Orientation</strong><br>
              <strong>2️⃣ Accompagnement candidature</strong><br>
              <strong>3️⃣ Accompagnement complet</strong>
            </p>
          </div>

          <p style="color: #666; margin: 20px 0;">Nous vous transmettrons ensuite les modalités de paiement et la liste des documents nécessaires.</p>

          <!-- FOOTER -->
          <div style="border-top: 2px solid #e5e7eb; padding-top: 20px; margin-top: 30px; text-align: center; color: #999;">
            <p style="margin: 5px 0; font-weight: bold;">Cordialement,<br><strong>Chinois en Devenir</strong></p>
            <p style="margin: 10px 0; font-size: 12px;">
              🌎 <a href="https://chinoisendevenir.com/" style="color: #667eea; text-decoration: none;">https://chinoisendevenir.com/</a>
            </p>
            <p style="margin: 5px 0; font-size: 11px; color: #bbb;">Études en Chine • Accompagnement personnalisé • Admissions garanties</p>
          </div>
        </div>

      </div>
    `,
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

// ✉️ Envoyer la réponse automatique
async function sendAutoReply(contact, pattern) {
  const template = EMAIL_TEMPLATES[pattern.emailTemplate];
  if (!template) {
    console.error(`Template non trouvé : ${pattern.emailTemplate}`);
    return false;
  }
  try {
    await resend.emails.send({
      from: "contact@chinoisendevenir.com",
      to: contact.email,
      subject: template.subject,
      html: template.html(contact),
      replyTo: "contact@chinoisendevenir.com",
    });
    console.log(`✅ Auto-reply envoyé à ${contact.email}`);
    return true;
  } catch (error) {
    console.error("❌ Erreur envoi auto-reply:", error);
    return false;
  }
}

// 🔄 Mettre à jour le statut
async function updateContactStatus(contactId, newStatus) {
  const { error } = await supabase
    .from("contacts")
    .update({
      statut: newStatus,
      updated_at: new Date(),
    })
    .eq("id", contactId);

  if (error) {
    console.error("❌ Erreur mise à jour statut:", error);
    return false;
  }
  console.log(`✅ Statut mis à jour : ${newStatus}`);
  return true;
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

    console.log(`✅ Pattern : ${pattern.emailTemplate} → ${pattern.status}`);

    // 📧 Envoyer la réponse
    const replySent = await sendAutoReply(contact, pattern);

    if (!replySent) {
      console.error("❌ Erreur lors de l'envoi");
      return res.status(500).json({ error: "Failed to send reply" });
    }

    // 🔄 Update statut
    const statusUpdated = await updateContactStatus(contact.id, pattern.status);

    if (!statusUpdated) {
      console.error("❌ Erreur lors de la mise à jour du statut");
      return res.status(500).json({ error: "Failed to update status" });
    }

    // 📝 Log
    const { error: logError } = await supabase.from("email_logs").insert({
      contact_id: contact.id,
      from_email: from,
      subject,
      type: "auto_reply",
      pattern_detected: pattern.emailTemplate,
      status_updated_to: pattern.status,
      created_at: new Date(),
    });

    if (logError) {
      console.warn("⚠️ Erreur logging:", logError);
    }

    return res.status(200).json({
      success: true,
      message: "Auto-reply envoyé ✅",
      contact: contact.id,
      pattern: pattern.emailTemplate,
    });
  } catch (error) {
    console.error("❌ Erreur:", error);
    return res.status(500).json({
      success: false,
      error: error.message,
    });
  }
}
