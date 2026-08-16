import { resendLog } from "../lib/resend";
import { supabase } from "../lib/supabase";

export default async function handler(req, res) {
  // ✅ Accepter les requêtes POST uniquement
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Méthode non autorisée" });
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
      source,
    } = req.body;

    // ✅ Validation
    if (!email || !email.includes("@")) {
      return res.status(400).json({ error: "Email invalide" });
    }

    if (!prenom || !nom || !phone || !pays) {
      return res
        .status(400)
        .json({ error: "Remplissez tous les champs obligatoires" });
    }

    // 1️⃣ Créer le contact dans Supabase
    const { data: contact, error: insertError } = await supabase
      .from("contacts")
      .insert([
        {
          prenom,
          nom,
          email,
          age: age || null,
          pays,
          phone,
          domaine_etudes,
          budget,
          date_rentree: date_rentree || null,
          source,
          suivi_statut: "Informations reçues",
          created_at: new Date().toISOString(),
        },
      ])
      .select()
      .single();

    if (insertError) {
      console.error("Erreur Supabase:", insertError);
      return res
        .status(500)
        .json({ error: "Erreur lors de la création du contact" });
    }

    // 2️⃣ Envoyer l'email
    const emailResult = await resendLog.emails.send({
      from: "contact@chinoisendevenir.com",
      replyTo: "chinoisendevenir@gmail.com",
      to: email,
      subject: "Votre projet d'études en Chine 🇨🇳 – prochaine étape",
      html: generateEmailTemplate(prenom),
    });

    if (emailResult.error) {
      console.error("Erreur Resend:", emailResult.error);
      return res
        .status(500)
        .json({ error: "Erreur lors de l'envoi de l'email" });
    }

    // 3️⃣ Logger l'action
    await supabase.from("suivi_actions").insert([
      {
        contact_id: contact.id,
        action: "email_bienvenue_envoye",
        description: `Email de bienvenue envoyé à ${email}`,
        date_action: new Date().toISOString(),
        user_admin: "système_automatique",
      },
    ]);

    // ✅ Réponse succès
    return res.status(201).json({
      success: true,
      contact_id: contact.id,
      message: `Bienvenue ${prenom} ! Email envoyé avec succès ✅`,
    });
  } catch (error) {
    console.error("❌ Erreur:", error);
    return res.status(500).json({ error: `Erreur serveur : ${error.message}` });
  }
}

// Template email
function generateEmailTemplate(prenom) {
  return `
    <!DOCTYPE html>
    <html lang="fr">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <style>
        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }
        body {
          font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
          line-height: 1.6;
          color: #333;
          background-color: #f9f9f9;
        }
        .container {
          max-width: 600px;
          margin: 0 auto;
          background-color: #ffffff;
          padding: 40px;
          border-radius: 8px;
          box-shadow: 0 2px 8px rgba(0,0,0,0.1);
        }
        .header {
          border-bottom: 3px solid #dc143c;
          padding-bottom: 20px;
          margin-bottom: 30px;
        }
        h2 {
          color: #1a1a1a;
          font-size: 24px;
          margin: 0;
        }
        .content {
          margin-bottom: 30px;
        }
        .welcome {
          font-weight: bold;
          font-size: 18px;
          margin-bottom: 15px;
        }
        p {
          margin: 15px 0;
          font-size: 16px;
          line-height: 1.8;
        }
        .features {
          background-color: #f5f5f5;
          padding: 20px;
          border-left: 4px solid #dc143c;
          margin: 25px 0;
          border-radius: 4px;
        }
        .features ul {
          list-style: none;
          margin: 0;
        }
        .features li {
          padding: 8px 0;
          padding-left: 25px;
          position: relative;
          font-size: 15px;
        }
        .features li:before {
          content: "✓";
          position: absolute;
          left: 0;
          color: #dc143c;
          font-weight: bold;
        }
        .footer {
          border-top: 1px solid #e0e0e0;
          padding-top: 20px;
          margin-top: 30px;
          text-align: center;
        }
        .signature {
          font-size: 16px;
          color: #333;
          margin-bottom: 10px;
        }
        .website a {
          color: #dc143c;
          text-decoration: none;
          font-weight: bold;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h2>Votre projet d'études en Chine 🇨🇳</h2>
        </div>

        <div class="content">
          <p class="welcome">Bonjour ${prenom},</p>
          
          <p>Merci d'avoir soumis votre demande concernant votre projet d'études en Chine.</p>
          
          <p style="font-weight: 600; color: #dc143c;">✅ Nous avons bien reçu vos informations.</p>
          
          <p>Votre profil va maintenant être étudié afin d'identifier les options les plus adaptées à votre parcours : universités, formations disponibles, possibilités de financement et conditions d'admission.</p>

          <div class="features">
            <p style="margin: 0 0 15px 0; font-weight: bold; color: #333;">Notre accompagnement comprend notamment :</p>
            <ul>
              <li>L'analyse de votre profil académique</li>
              <li>La recherche de formations et d'universités adaptées</li>
              <li>L'orientation concernant les bourses disponibles</li>
              <li>La préparation et la vérification de votre dossier</li>
              <li>L'accompagnement pendant la procédure de candidature</li>
            </ul>
          </div>

          <p>Nous vous contacterons rapidement pour vous présenter les possibilités adaptées à votre situation.</p>
        </div>

        <div class="footer">
          <p class="signature">
            Cordialement,<br>
            <strong>Chinois en Devenir</strong>
          </p>
          <div class="website">
            🌐 <a href="https://chinoisendevenir.com/">https://chinoisendevenir.com/</a>
          </div>
        </div>
      </div>
    </body>
    </html>
  `;
}
