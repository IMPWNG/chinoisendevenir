/* eslint-disable no-undef */
import { Resend } from "resend";
import { createClient } from "@supabase/supabase-js";
import { CONTACT_FROM_EMAIL, INBOUND_REPLY_TO } from "../emailConfig.js";

const resendApiKey =
  process.env.RESEND_API_KEY || process.env.VITE_RESEND_API_KEY;
const supabaseUrl =
  process.env.SUPABASE_URL ||
  process.env.NEXT_PUBLIC_SUPABASE_URL ||
  process.env.VITE_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(supabaseUrl, serviceRoleKey);
const resend = new Resend(resendApiKey);

console.log("✅ Route /api/email/auto-reply démarrée");

const EMAIL_BASE_STYLES = `
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
          .cta-link {
            display: inline-block;
            margin-top: 8px;
            color: white;
            font-weight: 700;
            text-decoration: none;
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
`;

function wrapEmailTemplate({ headerTitle, headerSubtitle, prenom, innerHtml }) {
  return `
    <!DOCTYPE html>
    <html lang="fr">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <style>
          ${EMAIL_BASE_STYLES}
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>${headerTitle}</h1>
            <p>${headerSubtitle}</p>
          </div>
          <div class="content">
            <div class="greeting">
              <p>Bonjour <strong>${prenom}</strong>,</p>
            </div>
            ${innerHtml}
          </div>
          <div class="footer">
            <p>Cordialement,</p>
            <div class="footer-brand">L'équipe Chinois en Devenir</div>
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

function generateRelance1Template(prenom) {
  return wrapEmailTemplate({
    headerTitle: "Votre projet d'études en Chine 🇨🇳",
    headerSubtitle: "Souhaitez-vous poursuivre ?",
    prenom,
    innerHtml: `
            <div class="section">
              <p>Vous nous avez récemment contactés au sujet de votre projet d'études en Chine.</p>
              <p>Nous souhaitons savoir si vous êtes toujours intéressé(e) par ce projet. Si c'est le cas, nous vous invitons à remplir soigneusement le formulaire disponible sur notre site :</p>
            </div>
            <div class="cta-section">
              <p><strong>🌐 Remplir le formulaire</strong></p>
              <a href="https://chinoisendevenir.com/" class="cta-link">https://chinoisendevenir.com/</a>
            </div>
            <div class="section">
              <p>Ces informations nous permettront de mieux étudier votre profil, vos objectifs et les possibilités adaptées à votre situation.</p>
              <p>Si vous avez déjà rempli le formulaire, vous pouvez simplement répondre à cet e-mail en nous le confirmant.</p>
              <p>Nous restons à votre disposition pour toute question.</p>
            </div>
    `,
  });
}

function generateRelance2Template(prenom) {
  return wrapEmailTemplate({
    headerTitle: "Êtes-vous toujours intéressé(e) ?",
    headerSubtitle: "Votre projet d'études en Chine",
    prenom,
    innerHtml: `
            <div class="section">
              <p>Vous nous avez sollicités il y a quelque temps concernant votre projet d'études en Chine.</p>
              <p>Nous souhaitons savoir si vous êtes toujours intéressé(e) par un accompagnement pour votre admission, la recherche de formation ou les opportunités de bourses.</p>
            </div>
            <div class="cta-section">
              <p><strong>Si votre projet est toujours d'actualité, répondez simplement à cet e-mail par :</strong></p>
              <div class="cta-text">Oui</div>
            </div>
            <div class="section">
              <p>Notre équipe vous recontactera afin de vous présenter les prochaines étapes.</p>
              <p>Si votre projet n'est plus d'actualité, vous pouvez également nous le signaler.</p>
            </div>
    `,
  });
}

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

function generateFormuleConfirmeeTemplate(contact, formuleLabel) {
  const greeting = [contact.prenom, contact.nom].filter(Boolean).join(" ");
  return wrapEmailTemplate({
    headerTitle: "Formule confirmée",
    headerSubtitle: "Étude de votre projet d'études en Chine",
    prenom: greeting || "bonjour",
    innerHtml: `
            <div class="section">
              <p>Nous vous remercions pour votre retour et confirmons votre intérêt pour la formule :</p>
            </div>
            <div class="formule-card highlight">
              <div class="formule-title">${formuleLabel || "Formule sélectionnée"}</div>
            </div>
            <div class="section">
              <p>Nous allons maintenant vérifier les informations communiquées dans votre formulaire et préparer une première étude de votre projet d'études en Chine.</p>
              <p>Cette étude nous permettra notamment de rechercher :</p>
              <ul class="formule-list">
                <li>Les formations correspondant à votre parcours</li>
                <li>Les universités adaptées à votre profil</li>
                <li>Les conditions d'admission</li>
                <li>Les possibilités de bourses ou de réduction</li>
                <li>Les documents nécessaires pour votre candidature</li>
              </ul>
            </div>
            <div class="section">
              <p>Le délai estimatif de cette analyse est de <strong>7 à 14 jours ouvrables</strong>, selon la complexité de votre profil et les informations disponibles.</p>
              <p>Notre équipe pourra vous contacter par e-mail ou WhatsApp si des informations ou documents supplémentaires sont nécessaires. Nous pourrons également organiser un appel afin de mieux comprendre votre projet.</p>
            </div>
            <div class="section">
              <p>À la fin de l'étude, nous vous présenterons les options identifiées ainsi que les prochaines étapes. Après validation de votre part, nous vous transmettrons les conditions de service et les modalités de paiement.</p>
              <p>Les démarches officielles commenceront après confirmation du paiement.</p>
            </div>
            <div class="warning">
              <p>Veuillez noter qu'une admission ou l'obtention d'une bourse ne peut pas être garantie, car la décision finale appartient aux universités et aux organismes concernés.</p>
            </div>
            <div class="section">
              <p>Merci de rester disponible sur le numéro indiqué dans votre formulaire.</p>
            </div>
    `,
  });
}

const EMAIL_TEMPLATES = {
  formules_presentation: {
    subject: "✅ Nos formules d'accompagnement pour étudier en Chine 🇨🇳",
    generateHtml: (contact) =>
      generateFormulesPresentationTemplate(contact.prenom || ""),
    action: "email_formules",
    description: "Email formules d'accompagnement envoyé",
    status: "choix_des_formules",
  },
  relance_1: {
    subject: "Votre projet d'études en Chine 🇨🇳",
    generateHtml: (contact) => generateRelance1Template(contact.prenom || ""),
    action: "relance_1",
    description: "Relance 1 envoyée — formulaire à remplir",
    status: "relance_1_envoyée",
  },
  relance_2: {
    subject: "Êtes-vous toujours intéressé(e) par des études en Chine ?",
    generateHtml: (contact) => generateRelance2Template(contact.prenom || ""),
    action: "relance_2",
    description: "Relance 2 envoyée — confirmation d'intérêt",
    status: "relance_2_envoyée",
  },
  formule_confirmee: {
    subject: "Nous confirmons votre formule d'accompagnement 🇨🇳",
    generateHtml: (contact, extras = {}) =>
      generateFormuleConfirmeeTemplate(contact, extras.formuleLabel),
    action: "email_envoye",
    description: "Confirmation de la formule choisie",
    status: "formule_choisie",
  },
};

// ✉️ Envoyer un email selon le template choisi
async function sendTemplatedEmail(
  contact,
  templateKey = "formules_presentation",
  extras = {},
) {
  const template = EMAIL_TEMPLATES[templateKey];
  if (!template) {
    console.error(`❌ Template inconnu: ${templateKey}`);
    return { success: false, error: "Template inconnu" };
  }

  console.log("\n📧 === ENVOI EMAIL ===");
  console.log(`Template: ${templateKey}`);
  console.log(`À: ${contact.email}`);
  console.log(`Prenom: ${contact.prenom}`);

  try {
    console.log(`📤 Envoi via Resend...`);
    const response = await resend.emails.send({
      from: CONTACT_FROM_EMAIL,
      to: contact.email,
      subject: template.subject,
      html: template.generateHtml(contact, extras),
      replyTo: INBOUND_REPLY_TO,
      headers: {
        "Auto-Submitted": "auto-replied",
        "X-Auto-Response-Suppress": "All",
      },
    });

    if (response.error) {
      console.error("❌ Erreur Resend:", response.error);
      return { success: false, error: response.error };
    }

    console.log(`✅ Email envoyé avec ID: ${response.id || response.data?.id}`);
    return { success: true, template };
  } catch (error) {
    console.error("❌ Erreur envoi email:", error.message);
    return { success: false, error: error.message };
  }
}

// 🔄 Mettre à jour le statut dans contacts
async function updateContactStatus(contactId, newStatus) {
  console.log("\n🔄 === MISE À JOUR STATUT ===");
  console.log(`Contact ID: ${contactId}`);
  console.log(`Nouveau statut: ${newStatus}`);

  const payloads = [
    {
      suivi_statut: newStatus,
      updated_at: new Date().toISOString(),
    },
    { suivi_statut: newStatus },
  ];

  try {
    for (const payload of payloads) {
      const { data: updatedContact, error: updateError } = await supabase
        .from("contacts")
        .update(payload)
        .eq("id", contactId)
        .select()
        .single();

      if (!updateError && updatedContact) {
        console.log(`✅ Contact mis à jour:`, updatedContact.id, "-", newStatus);
        return true;
      }

      console.warn("⚠️ Tentative update statut échouée:", updateError?.message);
    }

    return false;
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

  const fallbacks = {
    relance_1: "relance",
    relance_2: "relance",
    email_formules: "email_envoye",
    reponse_client: "note_ajoutee",
    formule_choisie: "changement_statut",
  };

  const actionCandidates = [actionType, fallbacks[actionType]].filter(
    (value, index, list) => value && list.indexOf(value) === index,
  );

  try {
    for (const action of actionCandidates) {
      const { error } = await supabase.from("suivi_actions").insert([
        {
          contact_id: contactId,
          action,
          description: description,
          user_admin: "système_automatique",
          created_at: new Date().toISOString(),
        },
      ]);

      if (!error) {
        console.log(`✅ Action loggée: ${action}`);
        return true;
      }

      console.warn("⚠️ Erreur logging:", error.message);

      const { error: retryError } = await supabase.from("suivi_actions").insert([
        {
          contact_id: contactId,
          action,
          description: description,
          user_admin: "système_automatique",
        },
      ]);

      if (!retryError) {
        console.log(`✅ Action loggée (sans created_at): ${action}`);
        return true;
      }

      console.warn("⚠️ Erreur logging retry:", retryError.message);
    }

    return false;
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
      const { processInboundEmail } = await import("./inbound-email.js");
      const result = await processInboundEmail(body);
      return res.status(result.httpStatus || 200).json(result);
    }

    // 🔍 CAS 2 : Appel manuel (BOUTON DASHBOARD)
    if (body.contactId) {
      console.log("\n🎯 CAS 2 : APPEL MANUEL DÉTECTÉ");
      console.log(`contactId: ${body.contactId}`);
      console.log(`emailTemplate: ${body.emailTemplate}`);
      console.log(`status: ${body.status}`);

      const { contactId } = body;
      const emailTemplate = body.emailTemplate || "formules_presentation";
      const template = EMAIL_TEMPLATES[emailTemplate];

      if (!template) {
        return res.status(400).json({
          success: false,
          message: "Template email inconnu",
        });
      }

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

      const replySent = await sendTemplatedEmail(contact, emailTemplate);
      if (!replySent.success) {
        return res.status(500).json({
          success: false,
          message: "Erreur envoi email",
        });
      }

      const nextStatus = template.status;
      if (nextStatus) {
        const statusUpdated = await updateContactStatus(contactId, nextStatus);
        if (!statusUpdated) {
          console.warn(
            "⚠️ Statut non mis à jour (contrainte BDD probable). L'email a bien été envoyé.",
          );
        }
      }

      await logAction(
        contactId,
        contact.email,
        template.action,
        nextStatus
          ? `${template.description} - Statut visé: ${nextStatus}`
          : template.description,
      );

      console.log("\n" + "✅".repeat(40));
      console.log("SUCCÈS COMPLET - MANUEL");
      console.log("✅".repeat(40));

      return res.status(200).json({
        success: true,
        message: `${template.description} ✅`,
        contact: contactId,
        emailTemplate,
        status: nextStatus || contact.suivi_statut,
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

export {
  sendTemplatedEmail,
  updateContactStatus,
  logAction,
  EMAIL_TEMPLATES,
  CONTACT_FROM_EMAIL,
};
