/* eslint-disable no-undef */
import { Resend } from "resend";
import { createClient } from "@supabase/supabase-js";
import { CONTACT_FROM, INBOUND_REPLY_TO } from "../emailConfig.js";
import { wrapEmailHtml, sanitizeEmailSubject } from "../emailLayout.js";
import { applyCorsHeaders, getClientIp, rateLimit } from "../httpSecurity.js";

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

function generateEmailTemplate(prenom) {
  return wrapEmailHtml({
    title: "Nous avons bien reçu votre demande",
    subtitle: "Projet d'études en Chine",
    prenom,
    bodyHtml: `
            <div class="section">
              <p>Merci d'avoir transmis votre demande concernant un projet d'études en Chine. Nous avons bien reçu vos informations.</p>
              <p>Votre profil va maintenant être examiné afin d'identifier les options les plus adaptées à votre parcours : formations, universités, conditions d'admission et possibilités de financement.</p>
            </div>
            <div class="section">
              <div class="section-title">Notre accompagnement</div>
              <ul class="formule-list">
                <li>Analyse de votre profil académique</li>
                <li>Recherche de formations et d'universités adaptées</li>
                <li>Orientation concernant les bourses disponibles</li>
                <li>Préparation et vérification du dossier</li>
                <li>Accompagnement pendant la procédure de candidature</li>
                <li>Suivi des étapes administratives</li>
              </ul>
            </div>
            <div class="section">
              <p>Après cette première lecture, nous reviendrons vers vous pour vous présenter les possibilités correspondant à votre situation, ainsi que nos formules d'accompagnement.</p>
            </div>
            <div class="note">
              <p>Aucune admission ni bourse ne peut être garantie. Les décisions finales appartiennent aux universités et aux organismes concernés.</p>
            </div>
            <div class="cta">
              <p>Si vous souhaitez poursuivre, répondez simplement à cet e-mail par :</p>
              <div class="cta-choice">Je souhaite recevoir les informations sur l'accompagnement.</div>
            </div>
    `,
  });
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
  applyCorsHeaders(req, res, { methods: "POST, OPTIONS" });

  // ✅ Handle preflight
  if (req.method === "OPTIONS") {
    res.status(200).end();
    return;
  }

  // ✅ Accepter uniquement POST
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Méthode non autorisée" });
  }

  const limited = rateLimit({
    key: `contact-submit:${getClientIp(req.headers)}`,
    limit: 8,
    windowMs: 15 * 60 * 1000,
  });
  if (!limited.ok) {
    res.setHeader("Retry-After", String(limited.retryAfter));
    return res.status(429).json({
      error: "Trop de requêtes. Réessayez plus tard.",
    });
  }

  if (!supabaseUrl || !serviceRoleKey || !resendApiKey) {
    console.error("❌ Variables d'environnement manquantes pour contact-submit");
    return res.status(500).json({
      error: "Service temporairement indisponible",
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

    if (!email || !email.includes("@") || String(email).length > 254) {
      return res.status(400).json({ error: "Email invalide" });
    }

    if (
      !prenom ||
      !nom ||
      !pays ||
      String(prenom).length > 80 ||
      String(nom).length > 80 ||
      String(pays).length > 80
    ) {
      return res.status(400).json({ error: "Champs obligatoires manquants" });
    }

    if (notes_admin && String(notes_admin).length > 2000) {
      return res.status(400).json({ error: "Message trop long" });
    }

    if (phone && String(phone).length > 30) {
      return res.status(400).json({ error: "Téléphone invalide" });
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
        from: CONTACT_FROM,
        replyTo: INBOUND_REPLY_TO,
        to: normalizedEmail,
        subject: sanitizeEmailSubject(
          `Nous avons bien reçu votre demande, ${prenom}`,
        ),
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

    // ✅ Réponse succès
    return res.status(isUpdate ? 200 : 201).json({
      success: true,
      updated: isUpdate,
      message: `Bienvenue ${String(prenom).trim()} ✅`,
    });
  } catch (error) {
    console.error("❌ Erreur serveur:", error);
    return res.status(500).json({
      error: "Erreur serveur",
    });
  }
}
