/* eslint-disable no-undef */
import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { getAuthenticatedAdmin } from "../studentAuth.js";
import {
  logAction,
  updateContactStatus,
  shouldAdvanceStatus,
} from "./auto-reply.js";
import {
  WHATSAPP_TEMPLATES,
  generateWhatsAppText,
  whatsappNumberFromContact,
  isValidWhatsAppNumber,
  buildWhatsAppLink,
} from "../whatsapp/messages.js";
import {
  getWhatsAppConfig,
  sendWhatsAppText,
  sendWhatsAppTemplate,
  metaTemplateName,
  isOutsideWindowError,
} from "../whatsapp/cloud.js";

const supabaseUrl =
  process.env.SUPABASE_URL ||
  process.env.NEXT_PUBLIC_SUPABASE_URL ||
  process.env.VITE_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabase = createClient(supabaseUrl, serviceRoleKey);

async function deliverWhatsApp(contact, templateKey, text) {
  const to = whatsappNumberFromContact(contact);
  const config = getWhatsAppConfig();
  const templateName = metaTemplateName(templateKey);
  const preferTemplate =
    templateKey !== "custom" && (config.useTemplates || Boolean(templateName));

  if (preferTemplate && templateName) {
    const sent = await sendWhatsAppTemplate({
      to,
      name: templateName,
      bodyParams: [contact.prenom || "Bonjour"],
    });
    if (sent.success) return { ...sent, mode: "template" };
    if (!isOutsideWindowError(sent)) return sent;
  }

  const sentText = await sendWhatsAppText({ to, text });
  if (sentText.success) return { ...sentText, mode: "text" };

  if (isOutsideWindowError(sentText) && templateName && !preferTemplate) {
    const retry = await sendWhatsAppTemplate({
      to,
      name: templateName,
      bodyParams: [contact.prenom || "Bonjour"],
    });
    if (retry.success) return { ...retry, mode: "template" };
    return {
      ...sentText,
      error:
        "WhatsApp n'autorise un message libre que si le contact vous a écrit dans les 24 h. Créez un modèle (template) dans Meta Business Manager, ou utilisez « Ouvrir WhatsApp ».",
    };
  }

  if (isOutsideWindowError(sentText)) {
    return {
      ...sentText,
      error:
        "WhatsApp n'autorise un message libre que si le contact vous a écrit dans les 24 h. Configurez WHATSAPP_USE_TEMPLATES et les noms de modèles, ou utilisez « Ouvrir WhatsApp ».",
    };
  }

  return sentText;
}

export async function sendWhatsAppToContact(
  contact,
  templateKey,
  extras = {},
) {
  const template = WHATSAPP_TEMPLATES[templateKey];
  if (!template) {
    return { success: false, error: "Modèle WhatsApp inconnu" };
  }

  const to = whatsappNumberFromContact(contact);
  if (!isValidWhatsAppNumber(to)) {
    return {
      success: false,
      code: "INVALID_PHONE",
      error:
        "Numéro WhatsApp invalide. Utilisez le format international (+225..., +221...).",
    };
  }

  const text = generateWhatsAppText(templateKey, contact, extras);
  if (!text) {
    return { success: false, error: "Message WhatsApp vide" };
  }

  const waLink = buildWhatsAppLink(to, text);
  const config = getWhatsAppConfig();
  if (!config.configured) {
    return {
      success: false,
      code: "NOT_CONFIGURED",
      error:
        "WhatsApp Cloud API non configurée. Ajoutez WHATSAPP_ACCESS_TOKEN et WHATSAPP_PHONE_NUMBER_ID dans .env.local (et Vercel).",
      waLink,
      preview: text,
      to,
    };
  }

  const sent = await deliverWhatsApp(contact, templateKey, text);
  if (!sent.success) {
    return { ...sent, waLink, preview: text, to };
  }

  return { ...sent, waLink, preview: text, to, template };
}

export async function handleWhatsAppSend(request) {
  const auth = await getAuthenticatedAdmin(request);
  if (auth.error) {
    return NextResponse.json(
      { success: false, message: auth.error },
      { status: auth.status || 403 },
    );
  }

  if (request.method === "GET") {
    return NextResponse.json({
      success: true,
      configured: getWhatsAppConfig().configured,
    });
  }

  let body = {};
  try {
    body = await request.json();
  } catch {
    body = {};
  }

  const contactId = body.contactId;
  const templateKey = body.whatsappTemplate || body.emailTemplate || "custom";
  const customMessage = body.customMessage || "";
  const template = WHATSAPP_TEMPLATES[templateKey];

  if (!contactId) {
    return NextResponse.json(
      { success: false, message: "contactId manquant" },
      { status: 400 },
    );
  }

  if (!template) {
    return NextResponse.json(
      { success: false, message: "Modèle WhatsApp inconnu" },
      { status: 400 },
    );
  }

  const { data: contact, error: fetchError } = await supabase
    .from("contacts")
    .select("*")
    .eq("id", contactId)
    .single();

  if (fetchError || !contact) {
    return NextResponse.json(
      { success: false, message: "Contact non trouvé" },
      { status: 404 },
    );
  }

  const extras = { customMessage };
  const result = await sendWhatsAppToContact(contact, templateKey, extras);
  if (!result.success) {
    const status =
      result.code === "NOT_CONFIGURED"
        ? 503
        : result.code === "INVALID_PHONE"
          ? 400
          : 500;
    return NextResponse.json(
      {
        success: false,
        message: result.error,
        code: result.code || null,
        waLink: result.waLink || null,
        preview: result.preview || null,
      },
      { status },
    );
  }

  const nextStatus = template.status;
  const canAdvance = shouldAdvanceStatus(contact.suivi_statut, nextStatus);
  if (nextStatus && canAdvance) {
    await updateContactStatus(contactId, nextStatus);
  }

  await logAction(
    contactId,
    contact.email,
    template.action,
    nextStatus && canAdvance
      ? `${template.description} - Statut visé: ${nextStatus}`
      : template.description,
    auth.user?.email || "admin",
  );

  return NextResponse.json({
    success: true,
    message: `${template.description} ✅`,
    contact: contactId,
    whatsappTemplate: templateKey,
    status: canAdvance
      ? nextStatus || contact.suivi_statut
      : contact.suivi_statut,
    to: result.to,
    mode: result.mode,
  });
}
