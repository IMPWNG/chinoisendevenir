/* eslint-disable no-undef */
import { Resend } from "resend";
import { createClient } from "@supabase/supabase-js";
import { INBOUND_REPLY_TO } from "../emailConfig.js";

// ✅ Liste standardisée des domaines d'études (doit matcher le front)
const DOMAINES_VALIDES = [
  "Informatique / IA / Data Science",
  "Ingénierie / Génie civil",
  "Génie électrique / Énergie",
  "Génie mécanique",
  "Aérospatial",
  "Architecture",
  "Commerce / Business",
  "Commerce international",
  "Management / Gestion",
  "Marketing digital",
  "Banque / Finance / Assurance",
  "Droit",
  "Science politique",
  "Sciences pharmaceutiques",
  "Agriculture",
  "Hydrologie",
  "Langues",
];

// 📧 Template email
function generateEmailTemplate(prenom) {
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
          .services {
            background: #f9fafb;
            border-left: 4px solid #FF2C00;
            padding: 20px;
            margin: 20px 0;
            border-radius: 4px;
          }
          .services ul {
            list-style: none;
            padding: 0;
          }
          .services li {
            font-size: 14px;
            color: #555;
            margin-bottom: 10px;
            padding-left: 25px;
            position: relative;
          }
          .services li:before {
            content: "✓";
            position: absolute;
            left: 0;
            color: #FF2C00;
            font-weight: bold;
            font-size: 16px;
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
          .cta-section {
            background: #f0f4ff;
            border: 1px solid #dde4ff;
            padding: 20px;
            border-radius: 4px;
            margin: 25px 0;
            text-align: center;
          }
          .cta-section p {
            font-size: 14px;
            margin-bottom: 12px;
            color: #2c3e50;
          }
          .cta-text {
            background: white;
            border: 1px solid #dde4ff;
            padding: 12px;
            border-radius: 4px;
            font-style: italic;
            color: #555;
            font-size: 13px;
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
            <h1>🇨🇳 Bienvenue ${prenom}</h1>
            <p>Votre projet d'études en Chine – Prochaine étape</p>
          </div>
          <div class="content">
            <div class="greeting">
              <p>Bonjour ${prenom},</p>
            </div>
            <div class="section">
              <p>Merci d'avoir soumis votre demande concernant votre projet d'études en Chine.</p>
              <p><strong>Nous avons bien reçu vos informations.</strong></p>
            </div>
            <div class="section">
              <p>Votre profil va maintenant être étudié afin d'identifier les options les plus adaptées à votre parcours :</p>
              <ul style="list-style: none; padding-left: 0; margin: 10px 0;">
                <li style="margin-bottom: 8px;">✓ Universités partenaires</li>
                <li style="margin-bottom: 8px;">✓ Formations disponibles</li>
                <li style="margin-bottom: 8px;">✓ Possibilités de financement</li>
                <li style="margin-bottom: 8px;">✓ Conditions d'admission</li>
              </ul>
            </div>
            <div class="section">
              <div class="section-title">Notre accompagnement comprend :</div>
              <div class="services">
                <ul>
                  <li>L'analyse de votre profil académique</li>
                  <li>La recherche de formations et d'universités adaptées</li>
                  <li>L'orientation concernant les bourses disponibles</li>
                  <li>La préparation et la vérification de votre dossier</li>
                  <li>L'accompagnement pendant la procédure de candidature</li>
                  <li>Le suivi des prochaines étapes administratives</li>
                </ul>
              </div>
            </div>
            <div class="section">
              <p>Après cette première étude, nous vous contacterons rapidement afin de vous présenter les possibilités correspondant à votre situation ainsi que nos formules d'accompagnement.</p>
            </div>
            <div class="warning">
              <strong>⚠️ Important :</strong> Aucune admission ou bourse ne peut être garantie. Les décisions finales dépendent des universités et des organismes concernés.
            </div>
            <div class="cta-section">
              <p><strong>Souhaitez-vous continuer et être recontacté ?</strong></p>
              <p style="font-size: 13px; color: #666;">Répondez simplement à cet e-mail avec :</p>
              <div class="cta-text">
                "Je souhaite recevoir les informations sur l'accompagnement."
              </div>
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

const supabaseUrl =
  process.env.SUPABASE_URL ||
  process.env.NEXT_PUBLIC_SUPABASE_URL ||
  process.env.VITE_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const resendApiKey =
  process.env.RESEND_API_KEY || process.env.VITE_RESEND_API_KEY;

// ✅ Initialiser Supabase et Resend
const supabase = createClient(supabaseUrl, serviceRoleKey);
const resend = new Resend(resendApiKey);

function isFilled(value) {
  if (value === null || value === undefined) return false;
  if (typeof value === "string" && value.trim() === "") return false;
  return true;
}

function pick(formValue, existingValue) {
  return isFilled(formValue) ? formValue : (existingValue ?? null);
}

function mergeNotes(existingNotes, incomingNotes) {
  if (!isFilled(incomingNotes)) return existingNotes || null;
  if (!isFilled(existingNotes)) return incomingNotes;
  if (String(existingNotes).includes(String(incomingNotes))) {
    return existingNotes;
  }
  return `${existingNotes}\n---\n${incomingNotes}`;
}

export default async function handler(req, res) {
  // ✅ DEBUG Variables env
  console.log("🔍 DEBUG Variables env:");
  console.log("SUPABASE_URL:", supabaseUrl ? "✅" : "❌");
  console.log("SUPABASE_SERVICE_ROLE_KEY:", serviceRoleKey ? "✅" : "❌");
  console.log("RESEND_API_KEY:", resendApiKey ? "✅" : "❌");

  // ✅ CORS Headers (Vercel serverless)
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

  // ✅ Handle preflight
  if (req.method === "OPTIONS") {
    res.status(200).end();
    return;
  }

  // ✅ Accepter uniquement POST
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Méthode non autorisée" });
  }

  // ✅ Vérifier les variables d'environnement
  if (!supabaseUrl || !serviceRoleKey || !resendApiKey) {
    return res.status(500).json({
      error: "Variables d'environnement manquantes en Vercel",
      missing: {
        SUPABASE_URL: !supabaseUrl,
        SUPABASE_SERVICE_ROLE_KEY: !serviceRoleKey,
        RESEND_API_KEY: !resendApiKey,
      },
    });
  }

  try {
    const {
      prenom,
      nom,
      email,
      age,
      pays,
      phone,
      domaine_etudes,
      budget,
      date_rentree,
      dernier_diplome,
      notes_admin,
    } = req.body;

    // ✅ Validation stricte
    if (!email || !email.includes("@")) {
      return res.status(400).json({ error: "Email invalide" });
    }

    if (!prenom || !nom || !pays) {
      return res.status(400).json({ error: "Champs obligatoires manquants" });
    }

    // ✅ Validation du domaine d'études
    // On accepte soit une valeur de la liste standardisée,
    // soit du texte libre (cas "Autre" précisé côté front),
    // mais on rejette les valeurs vides ou trop longues.
    let domaineFinal = null;
    if (domaine_etudes) {
      const trimmed = String(domaine_etudes).trim();

      if (trimmed.length === 0) {
        return res
          .status(400)
          .json({ error: "Domaine d'études invalide (vide)" });
      }

      if (trimmed.length > 100) {
        return res
          .status(400)
          .json({ error: "Domaine d'études trop long (max 100 caractères)" });
      }

      // Si ce n'est pas dans la liste standard, on le garde quand même
      // (cas "Autre" avec précision libre), mais on log pour suivi.
      if (!DOMAINES_VALIDES.includes(trimmed)) {
        console.log("ℹ️ Domaine hors liste standard (cas 'Autre'):", trimmed);
      }

      domaineFinal = trimmed;
    }

    const normalizedEmail = String(email).trim().toLowerCase();

    const { data: existingRows, error: lookupError } = await supabase
      .from("contacts")
      .select("*")
      .ilike("email", normalizedEmail)
      .order("created_at", { ascending: true })
      .limit(1);

    if (lookupError) {
      console.error("❌ Erreur recherche contact:", lookupError);
      return res.status(500).json({ error: "Erreur recherche contact" });
    }

    const existing = existingRows?.[0] || null;
    const profilePayload = {
      prenom: pick(prenom, existing?.prenom),
      nom: pick(nom, existing?.nom),
      email: normalizedEmail,
      age: pick(age || null, existing?.age),
      pays: pick(pays, existing?.pays),
      phone: pick(phone || null, existing?.phone),
      domaine_etudes: pick(domaineFinal, existing?.domaine_etudes),
      dernier_diplome: pick(dernier_diplome || null, existing?.dernier_diplome),
      budget: pick(budget || null, existing?.budget),
      date_rentree: pick(date_rentree || null, existing?.date_rentree),
      notes_admin: mergeNotes(existing?.notes_admin, notes_admin),
      updated_at: new Date().toISOString(),
    };

    const earlyStatuses = [
      null,
      "",
      "nouveau_prospect",
      "relance_1_envoyée",
      "relance_2_envoyée",
      "mail_bienvenue_envoyé",
    ];
    if (!existing || earlyStatuses.includes(existing.suivi_statut)) {
      profilePayload.suivi_statut = "mail_bienvenue_envoyé";
    }

    let contact = existing;
    let isUpdate = false;

    if (existing) {
      isUpdate = true;
      const { data: updated, error: updateError } = await supabase
        .from("contacts")
        .update(profilePayload)
        .eq("id", existing.id)
        .select()
        .single();

      if (updateError) {
        console.warn("⚠️ Update avec updated_at échoué, retry:", updateError.message);
    const { updated_at: _ignored, ...withoutUpdatedAt } = profilePayload;
        const { data: retried, error: retryError } = await supabase
          .from("contacts")
          .update(withoutUpdatedAt)
          .eq("id", existing.id)
          .select()
          .single();

        if (retryError) {
          console.error("❌ Erreur update contact:", retryError);
          return res.status(500).json({ error: "Erreur mise à jour contact" });
        }
        contact = retried;
      } else {
        contact = updated;
      }

      console.log("✅ Contact mis à jour (même email):", contact.id, "-", normalizedEmail);
    } else {
      const { data: created, error: insertError } = await supabase
        .from("contacts")
        .insert([
          {
            ...profilePayload,
            source: "website_vercel",
            created_at: new Date().toISOString(),
          },
        ])
        .select()
        .single();

      if (insertError) {
        console.error("❌ Erreur Supabase contacts:", insertError);
        if (insertError.code === "23505") {
          return res
            .status(409)
            .json({ error: "Cet email existe déjà", code: "duplicate" });
        }
        return res.status(500).json({ error: "Erreur insertion contact" });
      }

      contact = created;
      console.log("✅ Contact créé (PROD):", contact.id, "-", normalizedEmail);
    }

    const actionDescription = isUpdate
      ? `Formulaire site complété — profil mis à jour pour ${normalizedEmail}`
      : `Email de bienvenue envoyé à ${normalizedEmail}`;

    // 2️⃣ Enregistrer l'action dans suivi_actions
    try {
      const { error: actionError } = await supabase
        .from("suivi_actions")
        .insert([
          {
            contact_id: contact.id,
            action: isUpdate ? "contact_modifier" : "email_envoye",
            description: actionDescription,
            user_admin: "système_automatique",
          },
        ]);

      if (actionError) {
        console.warn("⚠️ Erreur suivi_actions:", actionError);
      } else {
        console.log("✅ Action loggée: email_envoye");
      }
    } catch (actionError) {
      console.warn("⚠️ Erreur suivi_actions:", actionError.message);
    }

    // 3️⃣ Envoyer l'email de bienvenue (NON BLOQUANT)
    try {
      const emailResponse = await resend.emails.send({
        from: "contact@chinoisendevenir.com",
        replyTo: INBOUND_REPLY_TO,
        to: normalizedEmail,
        subject: `Bienvenue ${prenom} ! 🇨🇳`,
        html: generateEmailTemplate(prenom),
      });

      if (emailResponse.error) {
        console.warn("⚠️ Erreur Resend:", emailResponse.error);
      } else {
        console.log("✅ Email envoyé:", emailResponse.id);
      }
    } catch (emailError) {
      console.warn("⚠️ Erreur Resend (non bloquant):", emailError.message);
    }

    // 🆕 Email de notif pour toi dans Gmail
    try {
      await resend.emails.send({
        from: "contact@chinoisendevenir.com",
        to: "chinoisendevenir@gmail.com",
        subject: isUpdate
          ? `📝 Profil complété : ${prenom} ${nom}`
          : `📧 Nouveau contact : ${prenom} ${nom}`,
        html: `
      <h2>${isUpdate ? "Profil CSV complété via le formulaire 📝" : "Nouveau prospect 🎯"}</h2>
      <p><strong>Nom :</strong> ${prenom} ${nom}</p>
      <p><strong>Email :</strong> ${normalizedEmail}</p>
      <p><strong>Pays :</strong> ${pays}</p>
      <p><strong>Téléphone :</strong> ${phone || "Non fourni"}</p>
      <p><strong>Domaine :</strong> ${domaineFinal || "Non spécifié"}</p>
      <p><strong>Budget :</strong> ${budget || "Non spécifié"}</p>
      <p><strong>Date rentrée :</strong> ${date_rentree || "Non spécifiée"}</p>
      <hr>
      <p style="font-size: 12px; color: #666;">ID Contact: ${contact.id}${isUpdate ? " • mise à jour (pas de doublon)" : ""}</p>
    `,
        replyTo: normalizedEmail,
      });
      console.log("✅ Notif envoyée à ton Gmail");
    } catch (notifError) {
      console.warn("⚠️ Notif Gmail (non bloquant):", notifError.message);
    }

    // ✅ Réponse succès
    return res.status(isUpdate ? 200 : 201).json({
      success: true,
      updated: isUpdate,
      contact_id: contact.id,
      message: `Bienvenue ${prenom} ✅`,
      environment: "vercel_production",
    });
  } catch (error) {
    console.error("❌ Erreur serveur:", error);
    return res.status(500).json({
      error: error.message,
      timestamp: new Date().toISOString(),
    });
  }
}
