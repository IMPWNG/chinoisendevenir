/* eslint-disable no-undef */
import { Resend } from "resend";
import { createClient } from "@supabase/supabase-js";
import { CONTACT_FROM, CONTACT_FROM_EMAIL, INBOUND_REPLY_TO } from "../emailConfig.js";
import { getAuthenticatedAdmin } from "../studentAuth.js";
import { wrapEmailHtml, SITE_URL, escapeHtml } from "../emailLayout.js";

const resendApiKey =
  process.env.RESEND_API_KEY || process.env.VITE_RESEND_API_KEY;
const supabaseUrl =
  process.env.SUPABASE_URL ||
  process.env.NEXT_PUBLIC_SUPABASE_URL ||
  process.env.VITE_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(supabaseUrl, serviceRoleKey);
const resend = new Resend(resendApiKey);

const STATUS_RANK = {
  mail_bienvenue_envoyé: 0,
  relance_1_envoyée: 1,
  relance_2_envoyée: 2,
  choix_des_formules: 3,
  formule_choisie: 4,
  prospect_à_qualifier: 5,
  offre_envoyée: 6,
  attente_paiement: 7,
  client_payé: 8,
  appel_réservé: 9,
  dossier_préparation: 10,
  candidature_envoyée: 11,
  admission_reçue: 12,
  dossier_terminé: 13,
};

function shouldAdvanceStatus(currentStatus, nextStatus) {
  if (!nextStatus) return false;
  if (!currentStatus) return true;
  const currentRank = STATUS_RANK[currentStatus];
  const nextRank = STATUS_RANK[nextStatus];
  if (currentRank === undefined || nextRank === undefined) return true;
  return nextRank >= currentRank;
}

console.log("✅ Route /api/email/auto-reply démarrée");

function generateRelance1Template(prenom) {
  return wrapEmailHtml({
    title: "Votre projet d'études en Chine",
    subtitle: "Compléter votre dossier",
    prenom,
    bodyHtml: `
            <div class="section">
              <p>Vous nous avez récemment contactés au sujet de votre projet d'études en Chine.</p>
              <p>Afin d'étudier votre profil avec précision, nous vous invitons à renseigner le formulaire disponible sur notre site. Ces informations nous permettront d'identifier les formations, universités et possibilités de financement les plus adaptées à votre situation.</p>
            </div>
            <div class="cta">
              <p>Formulaire à compléter :</p>
              <a href="${SITE_URL}" class="cta-link">${SITE_URL}</a>
            </div>
            <div class="section">
              <p>Si vous avez déjà transmis ces informations, il vous suffit de répondre à cet e-mail pour nous le confirmer.</p>
              <p>Nous restons à votre disposition pour toute question.</p>
            </div>
    `,
  });
}

function generateRelance2Template(prenom) {
  return wrapEmailHtml({
    title: "Votre projet d'études en Chine",
    subtitle: "Confirmation d'intérêt",
    prenom,
    bodyHtml: `
            <div class="section">
              <p>Vous nous avez contactés il y a quelque temps concernant un projet d'études en Chine.</p>
              <p>Nous souhaitons simplement savoir si cette démarche est toujours d'actualité, notamment pour l'orientation, la candidature ou la recherche de bourse.</p>
            </div>
            <div class="cta">
              <p>Si votre projet est toujours d'actualité, répondez à cet e-mail par :</p>
              <div class="cta-choice">Oui</div>
            </div>
            <div class="section">
              <p>Nous reviendrons ensuite vers vous pour vous présenter les prochaines étapes. Si votre projet n'est plus d'actualité, vous pouvez également nous l'indiquer.</p>
            </div>
    `,
  });
}

function generateFormulesPresentationTemplate(prenom) {
  return wrapEmailHtml({
    title: "Formules d'accompagnement",
    subtitle: "Études en Chine",
    prenom,
    bodyHtml: `
            <div class="section">
              <p>Merci pour l'intérêt que vous portez à notre accompagnement pour votre projet d'études en Chine.</p>
              <p>Afin de vous orienter au mieux, nous proposons plusieurs formules. Votre choix nous permet de comprendre vos besoins, votre niveau d'avancement et les étapes pour lesquelles vous souhaitez être accompagné(e).</p>
              <p>Notre objectif est de vous aider à préparer un dossier cohérent, complet et adapté aux exigences des universités et des organismes concernés.</p>
            </div>

            <div class="formule-card">
              <div class="formule-title">Formule 1 — Orientation</div>
              <div class="formule-price">50 euros</div>
              <p class="formule-intro">Destinée aux personnes qui souhaitent obtenir des informations claires et personnalisées avant de commencer leurs démarches.</p>
              <p class="formule-intro">Elle comprend :</p>
              <ul class="formule-list">
                <li>L'analyse de votre profil et de votre projet d'études</li>
                <li>Des conseils concernant le choix du domaine et du niveau d'études</li>
                <li>Une orientation vers les formations et universités adaptées</li>
                <li>Des informations sur les possibilités de bourses</li>
                <li>Une présentation des principales étapes de la procédure</li>
                <li>Une liste personnalisée des documents à préparer</li>
                <li>Des recommandations pour améliorer vos chances de réussite</li>
              </ul>
              <p class="formule-intro" style="margin-top:12px;">Cette formule vous permet d'avoir une vision plus claire de votre projet et d'organiser efficacement vos prochaines démarches.</p>
            </div>

            <div class="formule-card featured">
              <div class="formule-title">Formule 2 — Accompagnement à la candidature</div>
              <div class="formule-price">300 euros</div>
              <p class="formule-intro">Destinée aux candidats qui souhaitent être accompagnés dans la préparation et le dépôt de leur dossier de candidature.</p>
              <p class="formule-intro">Elle comprend :</p>
              <ul class="formule-list">
                <li>L'étude approfondie de votre profil</li>
                <li>La recherche d'universités et de formations correspondant à votre projet</li>
                <li>L'identification des opportunités de bourses adaptées</li>
                <li>La préparation et la vérification de votre dossier</li>
                <li>Des conseils pour la rédaction et l'amélioration des documents nécessaires</li>
                <li>L'assistance lors du remplissage des formulaires de candidature</li>
                <li>La traduction des documents selon les besoins du dossier</li>
                <li>Le dépôt des candidatures auprès des établissements sélectionnés</li>
                <li>Le suivi de votre dossier jusqu'à la réception des réponses des universités</li>
                <li>Des échanges réguliers pour vous informer de l'avancement de la procédure</li>
              </ul>
              <p class="formule-intro" style="margin-top:12px;">Cette formule convient particulièrement aux personnes qui souhaitent mener les démarches de candidature avec un accompagnement professionnel, tout en restant impliquées dans leur projet.</p>
            </div>

            <div class="formule-card">
              <div class="formule-title">Formule 3 — Accompagnement complet</div>
              <div class="formule-price">500 euros</div>
              <p class="formule-intro">Un accompagnement personnalisé, de l'analyse de votre projet jusqu'à la préparation de votre départ pour la Chine.</p>
              <p class="formule-intro">Elle comprend :</p>
              <ul class="formule-list">
                <li>L'ensemble des services inclus dans la formule « Accompagnement à la candidature »</li>
                <li>Un suivi personnalisé pendant toutes les étapes de la procédure</li>
                <li>Une assistance renforcée pour la préparation des documents administratifs</li>
                <li>Des conseils concernant les démarches après admission</li>
                <li>Une orientation pour la demande de visa étudiant</li>
                <li>Des informations concernant le logement et l'organisation de votre arrivée</li>
                <li>Des conseils pratiques pour préparer votre installation en Chine</li>
                <li>Un accompagnement jusqu'à la préparation de votre départ</li>
              </ul>
              <p class="formule-intro" style="margin-top:12px;">Cette formule s'adresse aux personnes qui souhaitent être guidées de manière plus complète et bénéficier d'un suivi continu tout au long de leur projet.</p>
            </div>

            <div class="note">
              <h4>Informations importantes</h4>
              <p>Le choix d'une formule ne constitue pas un engagement définitif. Il nous permet d'identifier le niveau d'accompagnement le plus adapté à votre situation et de préparer notre premier échange dans de bonnes conditions.</p>
              <p>Après réception de votre choix, nous vous proposerons une première consultation téléphonique. Cet échange permettra notamment de :</p>
              <ul>
                <li>Mieux comprendre votre parcours et vos objectifs</li>
                <li>Vérifier la cohérence de votre projet</li>
                <li>Évaluer les démarches nécessaires dans votre situation</li>
                <li>Répondre à vos principales questions</li>
                <li>Vous expliquer le déroulement de l'accompagnement</li>
                <li>Confirmer ensemble la formule la plus adaptée</li>
              </ul>
              <p style="margin-top:12px;">À l'issue de cette consultation, si vous souhaitez poursuivre avec notre agence, nous vous présenterons les conditions de service ainsi que les prochaines étapes. Le règlement des frais d'accompagnement intervient uniquement après cet échange et après validation de la formule choisie.</p>
              <p>Les frais liés aux candidatures, aux examens, à la traduction officielle, à la légalisation des documents, au visa ou à d'autres démarches administratives peuvent être facturés séparément et ne sont pas nécessairement inclus dans les tarifs indiqués.</p>
              <p>L'admission dans une université ou l'obtention d'une bourse ne peut pas être garantie. La décision finale appartient exclusivement aux universités et aux organismes concernés. Notre rôle est de vous conseiller, de vous aider à constituer un dossier sérieux et de vous accompagner dans vos démarches.</p>
            </div>

            <div class="cta">
              <p>Pour nous faire part de votre choix, répondez simplement à cet e-mail en indiquant la formule qui correspond le mieux à votre besoin :</p>
              <div class="cta-choice">
                1 — Formule Orientation<br>
                2 — Accompagnement à la candidature<br>
                3 — Accompagnement complet
              </div>
            </div>
            <div class="section">
              <p>Nous reviendrons ensuite vers vous afin de convenir d'un échange téléphonique et de faire le point sur votre projet.</p>
              <p>Nous restons à votre disposition pour toute question complémentaire.</p>
            </div>
    `,
  });
}

function generateFormuleConfirmeeTemplate(contact, formuleLabel) {
  const prenom = contact.prenom || "";
  const displayed = displayFormuleLabel(formuleLabel);
  return wrapEmailHtml({
    title: "Confirmation de votre choix",
    subtitle: "Prochaine étape : un échange téléphonique",
    prenom,
    bodyHtml: `
            <div class="section">
              <p>Nous vous remercions pour votre retour. Nous avons bien pris en compte votre intérêt pour la formule suivante :</p>
            </div>
            <div class="formule-card featured">
              <div class="formule-title">${escapeHtml(displayed)}</div>
            </div>
            <div class="section">
              <p>Ce choix n'est pas encore un engagement définitif. Il nous permet de préparer une première consultation téléphonique, afin d'étudier votre projet et de confirmer ensemble le niveau d'accompagnement le plus adapté.</p>
              <p>Lors de cet échange, nous pourrons notamment :</p>
              <ul class="formule-list">
                <li>Revenir sur votre parcours et vos objectifs</li>
                <li>Vérifier la cohérence de votre projet</li>
                <li>Préciser les démarches nécessaires dans votre situation</li>
                <li>Répondre à vos questions</li>
                <li>Vous expliquer le déroulement de l'accompagnement</li>
              </ul>
            </div>
            <div class="section">
              <p>À l'issue de cette consultation, si vous souhaitez poursuivre avec notre agence, nous vous présenterons les conditions de service ainsi que les prochaines étapes. Le règlement des frais d'accompagnement n'intervient qu'après cet échange et après validation de la formule.</p>
            </div>
            <div class="note">
              <p>L'admission dans une université ou l'obtention d'une bourse ne peut pas être garantie. La décision finale appartient aux universités et aux organismes concernés.</p>
            </div>
            <div class="section">
              <p>Nous reviendrons vers vous rapidement afin de convenir d'un créneau. Merci de rester joignable sur le numéro indiqué dans votre formulaire.</p>
            </div>
    `,
  });
}

function displayFormuleLabel(formuleLabel) {
  const labels = {
    "Orientation (50€)": "Formule 1 — Orientation (50 euros)",
    "Accompagnement candidature (300€)":
      "Formule 2 — Accompagnement à la candidature (300 euros)",
    "Accompagnement complet (500€)":
      "Formule 3 — Accompagnement complet (500 euros)",
  };
  return labels[formuleLabel] || formuleLabel || "Formule sélectionnée";
}

const EMAIL_TEMPLATES = {
  formules_presentation: {
    subject:
      "Choisissez la formule d'accompagnement qui correspond à votre projet d'études en Chine",
    generateHtml: (contact) =>
      generateFormulesPresentationTemplate(contact.prenom || ""),
    action: "email_formules",
    description: "Email formules d'accompagnement envoyé",
    status: "choix_des_formules",
  },
  relance_1: {
    subject: "Votre projet d'études en Chine — formulaire à compléter",
    generateHtml: (contact) => generateRelance1Template(contact.prenom || ""),
    action: "relance_1",
    description: "Relance 1 envoyée — formulaire à remplir",
    status: "relance_1_envoyée",
  },
  relance_2: {
    subject: "Votre projet d'études en Chine est-il toujours d'actualité ?",
    generateHtml: (contact) => generateRelance2Template(contact.prenom || ""),
    action: "relance_2",
    description: "Relance 2 envoyée — confirmation d'intérêt",
    status: "relance_2_envoyée",
  },
  formule_confirmee: {
    subject: "Nous confirmons votre choix de formule — prochaine étape",
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
      from: CONTACT_FROM,
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
function requestFromNodeHeaders(headers) {
  return {
    headers: {
      get(name) {
        const lower = String(name).toLowerCase();
        const bag = headers || {};
        for (const [key, value] of Object.entries(bag)) {
          if (key.toLowerCase() === lower) return value;
        }
        return null;
      },
    },
  };
}

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
    "X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization",
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

    // Inbound emails go through /api/webhooks/resend — not this admin endpoint.
    if (body.type === "email.received") {
      return res.status(401).json({
        success: false,
        message: "Webhook inbound non autorisé ici",
      });
    }

    // 🔍 Appel manuel (BOUTON DASHBOARD) — admins only
    if (body.contactId) {
      const auth = await getAuthenticatedAdmin(requestFromNodeHeaders(req.headers));
      if (auth.error) {
        return res.status(auth.status || 403).json({
          success: false,
          message: auth.error,
        });
      }

      console.log("\n🎯 APPEL MANUEL DÉTECTÉ");
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
      const canAdvance = shouldAdvanceStatus(
        contact.suivi_statut,
        nextStatus,
      );
      if (nextStatus && canAdvance) {
        const statusUpdated = await updateContactStatus(contactId, nextStatus);
        if (!statusUpdated) {
          console.warn(
            "⚠️ Statut non mis à jour (contrainte BDD probable). L'email a bien été envoyé.",
          );
        }
      } else if (nextStatus && !canAdvance) {
        console.log(
          `ℹ️ Statut conservé (${contact.suivi_statut}) — pas de recul vers ${nextStatus}`,
        );
      }

      await logAction(
        contactId,
        contact.email,
        template.action,
        nextStatus && canAdvance
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
        status: canAdvance
          ? nextStatus || contact.suivi_statut
          : contact.suivi_statut,
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
