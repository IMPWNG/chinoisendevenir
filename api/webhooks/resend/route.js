/* eslint-disable no-undef */
import { Resend } from "resend";
import { createClient } from "@supabase/supabase-js";
import crypto from "crypto";

const resendApiKey = process.env.RESEND_API_KEY;
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const webhookSecret = process.env.RESEND_WEBHOOK_SECRET;

const supabase = createClient(supabaseUrl, serviceRoleKey);
const resend = new Resend(resendApiKey);

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
  formula_chosen: {
    keywords: [
      "formule 1",
      "formule 2",
      "formule 3",
      "je choisissez la formule",
      "je prends la formule",
      "je veux la formule",
    ],
    status: "formule_choisie",
    emailTemplate: "formula_confirmation",
  },
  payment_ready: {
    keywords: [
      "prêt à payer",
      "ready to pay",
      "je suis prêt",
      "je veux procéder au paiement",
      "comment payer",
    ],
    status: "attente_paiement",
    emailTemplate: "payment_instructions",
  },
};

// 📧 Templates d'emails
const EMAIL_TEMPLATES = {
  formules_presentation: {
    subject: "✅ Nos formules d'accompagnement pour étudier en Chine 🇨🇳",
    html: (contact) => `
      <div style="max-width: 700px; margin: 0 auto; font-family: 'Segoe UI', Arial, sans-serif;">
        <h2>Bonjour ${contact.prenom} ! 👋</h2>
        <p>Merci pour votre intérêt ! Voici nos 3 formules :</p>
        
        <div style="background: #f0f9ff; padding: 15px; border-radius: 5px; margin: 15px 0;">
          <h3>1️⃣ Orientation — 50€</h3>
          <p>✓ Analyse de profil<br>✓ Orientation formations<br>✓ Liste universités & bourses</p>
        </div>
        
        <div style="background: #f0fdf4; padding: 15px; border-radius: 5px; margin: 15px 0;">
          <h3>2️⃣ Accompagnement candidature — 300€</h3>
          <p>✓ Tout d'orientation<br>✓ Aide dossier candidature<br>✓ Suivi universités</p>
        </div>
        
        <div style="background: #fef3c7; padding: 15px; border-radius: 5px; margin: 15px 0;">
          <h3>3️⃣ Accompagnement complet — 500€</h3>
          <p>✓ Tout d'accompagnement<br>✓ Support 24/7<br>✓ Aide visa & logement</p>
        </div>

        <p><strong>👉 Répondez avec le numéro (1, 2 ou 3) de votre choix</strong></p>
        <p style="color: #999; font-size: 12px;">Chinois en Devenir 🇨🇳</p>
      </div>
    `,
  },

  formula_confirmation: {
    subject: "🎯 Formule confirmée ! Prochaines étapes",
    html: (contact) => `
      <div style="max-width: 600px; margin: 0 auto; font-family: Arial, sans-serif;">
        <h2>Parfait ${contact.prenom} ! 🎉</h2>
        <p>Votre formule a bien été enregistrée.</p>
        <div style="background: #f0fdf4; padding: 15px; border-radius: 5px;">
          <h3>⏭️ Prochaines étapes :</h3>
          <ol>
            <li>Modalités de paiement</li>
            <li>Documents à préparer</li>
            <li>Signature du contrat</li>
            <li>Commencement de l'accompagnement</li>
          </ol>
        </div>
        <p>📧 Les modalités de paiement vous seront communiquées dans les 24h.</p>
        <p style="color: #999; font-size: 12px;">Chinois en Devenir 🇨🇳</p>
      </div>
    `,
  },

  payment_instructions: {
    subject: "💳 Modalités de paiement",
    html: (contact) => `
      <div style="max-width: 600px; margin: 0 auto; font-family: Arial, sans-serif;">
        <h2>💳 Instructions de paiement</h2>
        <p>Bonjour ${contact.prenom},</p>
        <div style="background: #f3e8ff; padding: 15px; border-radius: 5px;">
          <p><a href="https://paiement.chinoisendevenir.com" style="display: inline-block; padding: 10px 20px; background: #7c3aed; color: white; text-decoration: none; border-radius: 5px;">Procéder au paiement</a></p>
        </div>
        <p>Des questions ? Répondez à cet email !</p>
        <p style="color: #999; font-size: 12px;">Chinois en Devenir 🇨🇳</p>
      </div>
    `,
  },
};

// 🔐 Vérifier la signature Resend
function verifyResendSignature(body, signature) {
  const hash = crypto
    .createHmac("sha256", webhookSecret)
    .update(body)
    .digest("base64");
  return hash === signature;
}

// 🔍 Détecter le pattern
function detectResponseType(emailText) {
  const text = emailText.toLowerCase();
  for (const pattern of Object.values(AUTO_REPLY_PATTERNS)) {
    if (pattern.keywords.some((keyword) => text.includes(keyword))) {
      return pattern;
    }
  }
  return null;
}

// ✉️ Envoyer auto-reply
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

// 🔄 Mettre à jour statut
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

// 🎯 Webhook principal
export async function POST(request) {
  try {
    // 🔐 Vérifier la signature
    const signature = request.headers.get("x-resend-signature");
    if (!signature || !verifyResendSignature(await request.text(), signature)) {
      console.error("❌ Signature invalide");
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { from, subject, text: textBody } = body;

    if (!from || !textBody) {
      return Response.json({
        success: false,
        message: "Données incomplètes",
      });
    }

    // 🔍 Chercher le contact
    const { data: contact, error: fetchError } = await supabase
      .from("contacts")
      .select("*")
      .eq("email", from)
      .single();

    if (fetchError || !contact) {
      console.log(`⚠️ Contact non trouvé : ${from}`);
      return Response.json({
        success: false,
        message: "Contact non trouvé",
      });
    }

    // 🎯 Détecter le pattern
    const pattern = detectResponseType(textBody);

    if (!pattern) {
      console.log(`ℹ️ Pas de pattern détecté pour : ${from}`);
      return Response.json({
        success: false,
        message: "Pas de réponse automatique applicable",
      });
    }

    // 📧 Envoyer auto-reply
    const replySent = await sendAutoReply(contact, pattern);

    // 🔄 Mettre à jour statut
    const statusUpdated = await updateContactStatus(contact.id, pattern.status);

    // 📝 Logger
    await supabase.from("email_logs").insert({
      contact_id: contact.id,
      from_email: from,
      subject,
      type: "auto_reply",
      pattern_detected: pattern.emailTemplate,
      status_updated_to: pattern.status,
      created_at: new Date(),
    });

    if (!replySent || !statusUpdated) {
      return Response.json({
        success: false,
        message: "Erreur lors du traitement",
      });
    }

    return Response.json({
      success: true,
      message: "Auto-reply envoyé avec succès",
      contact: contact.id,
      pattern: pattern.emailTemplate,
    });
  } catch (error) {
    console.error("❌ Erreur webhook:", error);
    return Response.json(
      { success: false, error: error.message },
      { status: 500 },
    );
  }
}
