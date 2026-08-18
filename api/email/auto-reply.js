/* eslint-disable no-undef */
import { Resend } from "resend";
import { createClient } from "@supabase/supabase-js";

const resendApiKey = process.env.RESEND_API_KEY;
const supabaseUrl = process.env.SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(supabaseUrl, serviceRoleKey);
const resend = new Resend(resendApiKey);

console.log("✅ Route /api/email/auto-reply démarrée");

// 📧 Fonction pour générer le template HTML des formules
function generateFormulesPresentationTemplate(prenom) {
  return `
    <!DOCTYPE html>
    <html lang="fr">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <style>
          * { margin: 0; padding: 0; box-sizing: border-box; }
          body { 
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; 
            line-height: 1.6; 
            color: #2c3e50;
            background: #f5f7fa;
          }
          .container { 
            max-width: 600px; 
            margin: 0 auto; 
            background: white;
            box-shadow: 0 2px 8px rgba(0,0,0,0.1);
            border-radius: 8px;
            overflow: hidden;
          }
          .header { 
            background: linear-gradient(135deg, #FF2C00 0%, #FA694B 100%);
            color: white; 
            padding: 40px 20px;
            text-align: center;
          }
          .header h1 { 
            font-size: 28px;
            margin-bottom: 5px;
            font-weight: 700;
          }
          .header p { 
            font-size: 14px;
            opacity: 0.95;
          }
          .content { 
            padding: 40px 30px;
          }
          .greeting {
            font-size: 16px;
            margin-bottom: 25px;
            color: #2c3e50;
          }
          .section {
            margin-bottom: 25px;
          }
          .section-title {
            font-size: 14px;
            font-weight: 700;
            color: #FF2C00;
            text-transform: uppercase;
            letter-spacing: 0.5px;
            margin-bottom: 12px;
          }
          .section p {
            font-size: 14px;
            line-height: 1.8;
            color: #555;
            margin-bottom: 12px;
          }
          .formule-card {
            background: white;
            border-left: 4px solid #FF2C00;
            padding: 20px;
            margin: 20px 0;
            border-radius: 4px;
            border: 1px solid #e5e7eb;
          }
          .formule-card.highlight {
            background: #f0f4ff;
            border-left-color: #667eea;
            border: 1px solid #dde4ff;
            box-shadow: 0 2px 8px rgba(102, 126, 234, 0.1);
          }
          .formule-title {
            font-size: 16px;
            font-weight: 700;
            color: #2c3e50;
            margin-bottom: 10px;
            display: flex;
            align-items: center;
            gap: 10px;
          }
          .formule-price {
            font-size: 18px;
            font-weight: 700;
            color: #FF2C00;
          }
          .formule-list {
            list-style: none;
            padding: 0;
            margin: 12px 0 0 0;
          }
          .formule-list li {
            font-size: 13px;
            color: #555;
            margin-bottom: 8px;
            padding-left: 20px;
            position: relative;
          }
          .formule-list li:before {
            content: "✓";
            position: absolute;
            left: 0;
            color: #FF2C00;
            font-weight: bold;
          }
          .warning {
            background: #fff3cd;
            border: 1px solid #ffeaa7;
            color: #856404;
            padding: 15px;
            border-radius: 4px;
            font-size: 13px;
            margin: 20px 0;
          }
          .warning h4 {
            margin-bottom: 10px;
            font-size: 14px;
          }
          .warning ol {
            margin-left: 20px;
            margin-top: 10px;
          }
          .warning li {
            margin-bottom: 5px;
            font-size: 13px;
          }
          .cta-section {
            background: linear-gradient(135deg, #FF2C00 0%, #FA694B 100%);
            color: white;
            padding: 25px;
            border-radius: 4px;
            margin: 25px 0;
            text-align: center;
          }
          .cta-section p {
            font-size: 14px;
            margin-bottom: 12px;
            color: white;
          }
          .cta-text {
            background: rgba(255,255,255,0.2);
            border: 1px solid rgba(255,255,255,0.3);
            padding: 12px;
            border-radius: 4px;
            font-style: italic;
            color: white;
            font-size: 14px;
            font-weight: 600;
          }
          .footer {
            background: #f5f7fa;
            padding: 30px;
            text-align: center;
            border-top: 1px solid #e5e7eb;
          }
          .footer p {
            font-size: 13px;
            color: #666;
            margin-bottom: 10px;
          }
          .footer-brand {
            font-size: 16px;
            font-weight: 700;
            color: #FF2C00;
            margin: 15px 0;
          }
          .footer-link {
            color: #FF2C00;
            text-decoration: none;
            font-weight: 600;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>✅ Nos formules d'accompagnement</h1>
            <p>Pour étudier en Chine 🇨🇳</p>
          </div>
          <div class="content">
            <div class="greeting">
              <p>Bonjour <strong>${prenom}</strong>,</p>
            </div>
            <div class="section">
              <p>Merci pour votre retour ! Nous proposons plusieurs formules d'accompagnement selon votre besoin et votre niveau d'assistance.</p>
            </div>

            <!-- FORMULE 1 -->
            <div class="formule-card">
              <div class="formule-title">
                <span>1️⃣</span>
                <span>Orientation</span>
                <span class="formule-price">50€</span>
              </div>
              <p style="font-weight: 600; color: #666; margin: 10px 0; font-size: 13px;">Cette formule comprend :</p>
              <ul class="formule-list">
                <li>Analyse de votre profil</li>
                <li>Orientation vers les formations adaptées</li>
                <li>Informations sur les universités et bourses possibles</li>
                <li>Liste personnalisée des documents à préparer</li>
              </ul>
            </div>

            <!-- FORMULE 2 (HIGHLIGHT) -->
            <div class="formule-card highlight">
              <div class="formule-title">
                <span>2️⃣</span>
                <span>Accompagnement candidature</span>
                <span class="formule-price">300€</span>
              </div>
              <p style="font-weight: 600; color: #666; margin: 10px 0; font-size: 13px;">Cette formule comprend :</p>
              <ul class="formule-list">
                <li>Recherche d'universités adaptées</li>
                <li>Identification des opportunités de bourses</li>
                <li>Préparation et vérification du dossier</li>
                <li>Assistance pour remplir les candidatures</li>
                <li>Dépôt des candidatures</li>
                <li>Suivi de votre dossier jusqu'à la réponse des universités</li>
                <li>Traduction des documents</li>
              </ul>
            </div>

            <!-- FORMULE 3 -->
            <div class="formule-card">
              <div class="formule-title">
                <span>3️⃣</span>
                <span>Accompagnement complet</span>
                <span class="formule-price">500€</span>
              </div>
              <p style="font-weight: 600; color: #666; margin: 10px 0; font-size: 13px;">Cette formule comprend :</p>
              <ul class="formule-list">
                <li>Tous les services de la formule candidature</li>
                <li>Accompagnement personnalisé pendant toute la procédure</li>
                <li>Aide pour les documents administratifs</li>
                <li>Assistance après admission</li>
                <li>Orientation concernant le logement, le visa et l'arrivée en Chine</li>
                <li>Suivi jusqu'à votre départ</li>
              </ul>
            </div>

            <!-- CONDITIONS IMPORTANTES -->
            <div class="warning">
              <h4>⚠️ Conditions importantes</h4>
              <p><strong>Les démarches commencent après :</strong></p>
              <ol>
                <li>Le choix de la formule</li>
                <li>La signature de nos conditions de service</li>
                <li>Le paiement des frais d'accompagnement</li>
              </ol>
              <p style="margin-top: 12px; font-size: 12px;">
                📌 <strong>Note :</strong> Les frais de candidature, de légalisation, de visa ou autres frais administratifs ne sont pas nécessairement inclus dans ces tarifs.
              </p>
              <p style="margin-top: 8px; font-size: 12px;">
                📌 L'obtention d'une admission ou d'une bourse ne peut pas être garantie. La décision finale appartient aux universités et organismes concernés.
              </p>
            </div>

            <!-- CTA PRINCIPAL -->
            <div class="cta-section">
              <p><strong>👉 Pour commencer, répondez simplement à cet e-mail avec le numéro de la formule souhaitée :</strong></p>
              <div class="cta-text">
                1️⃣ Orientation<br>
                2️⃣ Accompagnement candidature<br>
                3️⃣ Accompagnement complet
              </div>
            </div>

            <div class="section">
              <p>Nous vous transmettrons ensuite les modalités de paiement et la liste des documents nécessaires.</p>
            </div>
          </div>
          <div class="footer">
            <p>Cordialement,</p>
            <div class="footer-brand">Chinois en Devenir</div>
            <p>
              <a href="https://chinoisendevenir.com/" class="footer-link">🌐 https://chinoisendevenir.com/</a>
            </p>
            <p style="font-size: 12px; color: #999; margin-top: 20px;">
              © 2026 Chinois en Devenir | Tous droits réservés
            </p>
          </div>
        </div>
      </body>
    </html>
  `;
}

// ✉️ Envoyer la réponse automatique
async function sendAutoReply(contact) {
  console.log("\n📧 === ENVOI EMAIL ===");
  console.log(`À: ${contact.email}`);
  console.log(`Prenom: ${contact.prenom}`);

  try {
    console.log(`📤 Envoi via Resend...`);
    const response = await resend.emails.send({
      from: "contact@chinoisendevenir.com",
      to: contact.email,
      subject: "✅ Nos formules d'accompagnement pour étudier en Chine 🇨🇳",
      html: generateFormulesPresentationTemplate(contact.prenom),
      replyTo: "chinoisendevenir@gmail.com",
    });

    console.log(`✅ Email envoyé avec ID: ${response.id}`);
    return true;
  } catch (error) {
    console.error("❌ Erreur envoi email:", error.message);
    return false;
  }
}

// 🔄 Mettre à jour le statut dans contacts
// 🔄 Mettre à jour le statut dans contacts
async function updateContactStatus(contactId, newStatus) {
  console.log("\n🔄 === MISE À JOUR STATUT ===");
  console.log(`Contact ID: ${contactId}`);
  console.log(`Ancien statut → Nouveau statut: ${newStatus}`);

  try {
    // ✅ UPDATE avec .select().single() comme ton code de bienvenue
    const { data: updatedContact, error: updateError } = await supabase
      .from("contacts")
      .update({
        suivi_statut: newStatus,
        updated_at: new Date().toISOString(),
      })
      .eq("id", contactId)
      .select()
      .single();

    if (updateError) {
      console.error("❌ Erreur Supabase UPDATE:", updateError);
      return false;
    }

    console.log(`✅ Contact mis à jour:`, updatedContact.id, "-", newStatus);
    return true;
  } catch (error) {
    console.error("❌ Erreur mise à jour:", error.message);
    return false;
  }
}

// 📝 Logger l'action dans suivi_actions
async function logAction(contactId, email, actionType, description) {
  console.log("\n📝 === LOGGING ACTION ===");
  console.log(`Action: ${actionType}`);
  console.log(`Description: ${description}`);

  try {
    const { error } = await supabase.from("suivi_actions").insert({
      contact_id: contactId,
      action: actionType,
      description: description,
      user_admin: "système_automatique",
      created_at: new Date().toISOString(),
    });

    if (error) {
      console.warn("⚠️ Erreur logging:", error.message);
      return false;
    }
    console.log(`✅ Action loggée`);
    return true;
  } catch (error) {
    console.warn("⚠️ Erreur logging:", error.message);
    return false;
  }
}

// 🎯 Handler Vercel
export default async function handler(req, res) {
  console.log("\n" + "=".repeat(80));
  console.log(`⏰ ${new Date().toISOString()}`);
  console.log("=".repeat(80));

  // ✅ CORS Headers
  res.setHeader("Access-Control-Allow-Credentials", "true");
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader(
    "Access-Control-Allow-Methods",
    "GET,OPTIONS,PATCH,DELETE,POST,PUT",
  );
  res.setHeader(
    "Access-Control-Allow-Headers",
    "X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version",
  );

  if (req.method === "OPTIONS") {
    res.status(200).end();
    return;
  }

  // ✅ Accepter GET
  if (req.method === "GET") {
    return res.status(200).json({
      success: true,
      message: "Endpoint auto-reply actif ✅",
    });
  }

  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    console.log("\n📨 REQUÊTE REÇUE");
    console.log(JSON.stringify(req.body, null, 2));

    const body = req.body;

    // 🔍 CAS 1 : Webhook Resend (AUTOMATIQUE)
    if (body.type === "email.received") {
      console.log("\n🎯 CAS 1 : WEBHOOK RESEND DÉTECTÉ");

      const { data } = body;

      if (!data) {
        console.error("❌ Pas de data dans le webhook");
        return res.status(400).json({
          success: false,
          message: "Pas de data",
        });
      }

      const { from, subject, text } = data;

      if (!from || !text) {
        console.error("❌ Données Resend incomplètes");
        return res.status(400).json({
          success: false,
          message: "Données incomplètes",
        });
      }

      console.log(`📧 Email reçu de: ${from}`);
      console.log(`📧 Sujet: ${subject}`);

      // 🔍 Chercher le contact
      console.log("\n🔎 Recherche du contact...");
      const { data: contact, error: fetchError } = await supabase
        .from("contacts")
        .select("*")
        .eq("email", from)
        .single();

      if (fetchError || !contact) {
        console.error(`❌ Contact non trouvé : ${from}`);
        return res.status(404).json({
          success: false,
          message: "Contact non trouvé",
        });
      }

      console.log(`✅ Contact trouvé: ${contact.prenom} ${contact.nom}`);

      // 🎯 Détecter si c'est une demande de formules
      const textLower = text.toLowerCase();
      const isFormuleRequest = Object.values(
        AUTO_REPLY_PATTERNS,
      )[0].keywords.some((keyword) => textLower.includes(keyword));

      if (!isFormuleRequest) {
        console.log(`ℹ️ Pas de pattern détecté pour : ${from}`);
        return res.status(200).json({
          success: false,
          message: "Pas de pattern détecté",
        });
      }

      console.log(`\n✅ Pattern détecté → Envoi des formules`);

      // 📧 Envoyer email
      const replySent = await sendAutoReply(contact);
      if (!replySent) {
        return res.status(500).json({
          success: false,
          message: "Erreur envoi email",
        });
      }

      // 🔄 ✅ METTRE À JOUR LE STATUT AUTOMATIQUEMENT
      const statusUpdated = await updateContactStatus(
        contact.id,
        "choix_des_formules", // ✅ Exact comme dans ta table CHECK
      );
      if (!statusUpdated) {
        return res.status(500).json({
          success: false,
          message: "Erreur mise à jour statut",
        });
      }

      // 📝 Logger l'action
      await logAction(
        contact.id,
        contact.email,
        "email_envoye",
        "Email des formules envoyé - Statut changé en 'choix_des_formules'",
      );

      console.log("\n" + "✅".repeat(40));
      console.log("SUCCÈS COMPLET - WEBHOOK");
      console.log("✅".repeat(40));

      return res.status(200).json({
        success: true,
        message: "Auto-reply envoyé (webhook Resend)",
        contact: contact.id,
        source: "webhook_automatique",
      });
    }

    // 🔍 CAS 2 : Appel manuel (BOUTON DASHBOARD)
    if (body.contactId && body.status) {
      console.log("\n🎯 CAS 2 : APPEL MANUEL DÉTECTÉ");
      console.log(`contactId: ${body.contactId}`);
      console.log(`status: ${body.status}`);

      const { contactId, status } = body;

      // Chercher le contact
      console.log("\n🔎 Recherche du contact...");
      const { data: contact, error: fetchError } = await supabase
        .from("contacts")
        .select("*")
        .eq("id", contactId)
        .single();

      if (fetchError || !contact) {
        console.error(`❌ Contact non trouvé : ${contactId}`);
        return res.status(404).json({
          success: false,
          message: "Contact non trouvé",
        });
      }

      console.log(`✅ Contact trouvé: ${contact.prenom} ${contact.nom}`);

      // 📧 Envoyer l'email des formules
      const replySent = await sendAutoReply(contact);
      if (!replySent) {
        return res.status(500).json({
          success: false,
          message: "Erreur envoi email",
        });
      }

      // 🔄 Mettre à jour le statut dans contacts
      const statusUpdated = await updateContactStatus(contactId, status);
      if (!statusUpdated) {
        return res.status(500).json({
          success: false,
          message: "Erreur mise à jour statut",
        });
      }

      // 📝 Logger l'action
      await logAction(
        contactId,
        contact.email,
        "email_envoye",
        "Choix des formules envoyé (clic manuel dashboard)",
      );

      console.log("\n" + "✅".repeat(40));
      console.log("SUCCÈS COMPLET - MANUEL");
      console.log("✅".repeat(40));

      return res.status(200).json({
        success: true,
        message: "Email des formules envoyé ✅",
        contact: contactId,
        status: status,
        source: "bouton_dashboard",
      });
    }

    console.error("❌ Format de requête non reconnu");
    return res.status(400).json({
      success: false,
      message: "Format non reconnu",
    });
  } catch (error) {
    console.error("\n❌ ERREUR GÉNÉRALE:", error.message);
    return res.status(500).json({
      success: false,
      error: error.message,
    });
  }
}
