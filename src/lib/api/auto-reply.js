/* eslint-disable no-undef */
import { Resend } from "resend";
import { createClient } from "@supabase/supabase-js";
import { CONTACT_FROM, CONTACT_FROM_EMAIL, INBOUND_REPLY_TO } from "../emailConfig.js";
import { getAuthenticatedAdmin } from "../studentAuth.js";
import {
  wrapEmailHtml,
  SITE_URL,
  escapeHtml,
  generateCustomEmailHtml,
  sanitizeEmailSubject,
} from "../emailLayout.js";
import { FORMULES, EXTRA_FEES, displayFormuleLabel } from "../formules.js";
import { applyCorsHeaders } from "../httpSecurity.js";

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

export function shouldAdvanceStatus(currentStatus, nextStatus) {
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
  const cards = FORMULES.map((formule, index) => {
    const featured = index === 1 ? " featured" : "";
    const items = formule.includes
      .map((item) => `<li>${escapeHtml(item)}</li>`)
      .join("");
    const footnote = formule.footnote
      ? `<p class="formule-intro" style="margin-top:12px;">${escapeHtml(formule.footnote)}</p>`
      : "";
    return `
            <div class="formule-card${featured}">
              <div class="formule-title">Formule ${formule.number} — ${escapeHtml(formule.title)}</div>
              <div class="formule-price">${escapeHtml(formule.priceLabel)}</div>
              <p class="formule-intro">${escapeHtml(formule.intro)}</p>
              <p class="formule-intro">Inclus :</p>
              <ul class="formule-list">${items}</ul>
              ${footnote}
            </div>`;
  }).join("");

  const extraFees = EXTRA_FEES.map((item) => `<li>${escapeHtml(item)}</li>`).join(
    "",
  );
  const choices = FORMULES.map(
    (formule) =>
      `${formule.number} — ${escapeHtml(formule.title)} : ${escapeHtml(formule.price)}`,
  ).join("<br>");

  return wrapEmailHtml({
    title: "Nos formules d'accompagnement",
    subtitle: "Pour étudier en Chine",
    prenom,
    bodyHtml: `
            <div class="section">
              <p>Merci pour l'intérêt que vous portez à Chinois en Devenir et pour votre projet d'études en Chine.</p>
              <p>Chaque projet est différent. Ces formules nous aident à comprendre votre besoin, à préparer notre premier appel et à vous proposer un accompagnement adapté.</p>
              <p>Notre objectif : un projet cohérent et un dossier sérieux, complet, aligné avec les exigences des universités chinoises.</p>
            </div>

            ${cards}

            <div class="note">
              <h4>Traduction des documents</h4>
              <p>Selon la formule, nous vous aidons à identifier les documents à traduire, les langues acceptées, et à préparer les versions en anglais ou en chinois.</p>
              <p>Les traductions officielles, certifiées ou réalisées par un prestataire externe peuvent être facturées en plus. Elles vous sont toujours indiquées avant d'être engagées.</p>
            </div>

            <div class="note">
              <h4>Frais qui restent à votre charge</h4>
              <p>Nos tarifs couvrent l'accompagnement. Les frais des universités, administrations ou prestataires externes ne sont pas inclus, notamment :</p>
              <ul>${extraFees}</ul>
              <p style="margin-top:12px;">Lorsque c'est possible, nous vous les signalons à l'avance pour que vous puissiez prévoir votre budget.</p>
            </div>

            <div class="note">
              <h4>Comment ça se passe</h4>
              <p>Votre choix n'est pas un engagement définitif. Après votre réponse, nous vous proposons un appel pour comprendre votre parcours, évaluer le projet, préciser les services inclus et confirmer la formule.</p>
              <p>Si vous poursuivez, vous recevez les conditions de service et les modalités de règlement. Aucune démarche ne commence avant signature et confirmation du paiement. Le paiement intervient après cette première consultation.</p>
            </div>

            <div class="note">
              <h4>À retenir</h4>
              <p>Nous ne pouvons pas garantir une admission, une bourse ou un visa. La décision finale appartient aux universités et aux organismes concernés. Notre rôle : vous conseiller et vous aider à constituer un dossier cohérent et complet.</p>
            </div>

            <div class="cta">
              <p>Répondez à cet e-mail en indiquant la formule qui vous correspond le mieux :</p>
              <div class="cta-choice">${choices}</div>
            </div>
            <div class="section">
              <p>Nous reviendrons ensuite vers vous pour convenir d'un échange téléphonique.</p>
              <p>Merci pour votre confiance. Nous restons à votre disposition.</p>
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

const EMAIL_TEMPLATES = {
  formules_presentation: {
    subject: "Nos formules d'accompagnement pour étudier en Chine",
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
  custom: {
    subject: (_contact, extras = {}) =>
      String(extras.customSubject || "").trim() ||
      "Votre projet d'études en Chine",
    generateHtml: (contact, extras = {}) =>
      generateCustomEmailHtml(contact, extras),
    action: "email_envoye",
    description: "Email libre envoyé",
    status: null,
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

  if (templateKey === "custom") {
    extras.customSubject = sanitizeEmailSubject(extras.customSubject, 180);
    extras.customTitle = sanitizeEmailSubject(extras.customTitle, 120);
    extras.customSubtitle = sanitizeEmailSubject(extras.customSubtitle, 160);
    extras.customMessage = String(extras.customMessage || "").slice(0, 8000);
    if (!String(extras.customMessage || "").trim()) {
      return { success: false, error: "Message vide" };
    }
    if (!extras.customSubject) {
      return { success: false, error: "Objet manquant" };
    }
  }

  const subject = sanitizeEmailSubject(
    typeof template.subject === "function"
      ? template.subject(contact, extras)
      : template.subject,
  );

  try {
    console.log(`📤 Envoi via Resend...`);
    const payload = {
      from: CONTACT_FROM,
      to: contact.email,
      subject,
      html: template.generateHtml(contact, extras),
      replyTo: INBOUND_REPLY_TO,
    };
    if (templateKey !== "custom") {
      payload.headers = {
        "Auto-Submitted": "auto-replied",
        "X-Auto-Response-Suppress": "All",
      };
    }
    const response = await resend.emails.send(payload);

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
async function logAction(
  contactId,
  email,
  actionType,
  description,
  userAdmin = "système_automatique",
) {
  console.log("\n📝 === LOGGING ACTION ===");
  console.log(`Action: ${actionType}`);
  console.log(`Description: ${description}`);

  const fallbacks = {
    relance_1: "relance",
    relance_2: "relance",
    email_formules: "email_envoye",
    reponse_client: "note_ajoutee",
    formule_choisie: "changement_statut",
    whatsapp_envoye: "email_envoye",
    whatsapp_formules: "email_formules",
    reponse_whatsapp: "reponse_client",
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
          user_admin: userAdmin,
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
          user_admin: userAdmin,
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

  applyCorsHeaders(req, res, { methods: "POST, OPTIONS" });

  if (req.method === "OPTIONS") {
    res.status(200).end();
    return;
  }

  if (req.method === "GET") {
    return res.status(405).json({ error: "Method not allowed" });
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
      const extras = {
        customSubject: String(body.customSubject || "").trim(),
        customTitle: String(body.customTitle || "").trim(),
        customSubtitle: String(body.customSubtitle || "").trim(),
        customMessage: String(body.customMessage || "").trim(),
        formuleLabel: body.formuleLabel,
      };

      if (!template) {
        return res.status(400).json({
          success: false,
          message: "Template email inconnu",
        });
      }

      if (emailTemplate === "custom") {
        if (!extras.customSubject) {
          return res.status(400).json({
            success: false,
            message: "L'objet de l'email est manquant",
          });
        }
        if (!extras.customMessage) {
          return res.status(400).json({
            success: false,
            message: "Le message est vide",
          });
        }
        if (extras.customMessage.length > 8000) {
          return res.status(400).json({
            success: false,
            message: "Le message est trop long",
          });
        }
        extras.customSubject = extras.customSubject.slice(0, 180);
        extras.customTitle = extras.customTitle.slice(0, 120);
        extras.customSubtitle = extras.customSubtitle.slice(0, 160);
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

      const replySent = await sendTemplatedEmail(
        contact,
        emailTemplate,
        extras,
      );
      if (!replySent.success) {
        console.error("❌ Échec envoi email:", replySent.error);
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

      const actionDescription =
        emailTemplate === "custom"
          ? `${template.description} — ${extras.customSubject}\n${String(extras.customMessage || "").slice(0, 500)}`
          : nextStatus && canAdvance
            ? `${template.description} - Statut visé: ${nextStatus}`
            : template.description;

      await logAction(
        contactId,
        contact.email,
        template.action,
        actionDescription,
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
      error: "Erreur serveur",
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
