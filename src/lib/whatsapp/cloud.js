/* eslint-disable no-undef */

const TEMPLATE_ENV = {
  relance_1: "WHATSAPP_TEMPLATE_RELANCE_1",
  relance_2: "WHATSAPP_TEMPLATE_RELANCE_2",
  formules_presentation: "WHATSAPP_TEMPLATE_FORMULES",
  formule_confirmee: "WHATSAPP_TEMPLATE_FORMULE_CONFIRMEE",
};

export function getWhatsAppConfig() {
  const accessToken = String(process.env.WHATSAPP_ACCESS_TOKEN || "").trim();
  const phoneNumberId = String(
    process.env.WHATSAPP_PHONE_NUMBER_ID || "",
  ).trim();
  const apiVersion = String(
    process.env.WHATSAPP_API_VERSION || "v21.0",
  ).trim();
  const verifyToken = String(process.env.WHATSAPP_VERIFY_TOKEN || "").trim();
  const appSecret = String(process.env.WHATSAPP_APP_SECRET || "").trim();
  const templateLanguage = String(
    process.env.WHATSAPP_TEMPLATE_LANGUAGE || "fr",
  ).trim();
  const useTemplates = /^(1|true|yes)$/i.test(
    String(process.env.WHATSAPP_USE_TEMPLATES || ""),
  );

  return {
    accessToken,
    phoneNumberId,
    apiVersion,
    verifyToken,
    appSecret,
    templateLanguage,
    useTemplates,
    configured: Boolean(accessToken && phoneNumberId),
  };
}

function graphUrl(phoneNumberId, apiVersion) {
  return `https://graph.facebook.com/${apiVersion}/${phoneNumberId}/messages`;
}

function parseGraphError(payload, fallback) {
  const err = payload?.error;
  if (!err) return { message: fallback || "Erreur WhatsApp", code: null };
  const details = err.error_data?.details || err.error_user_msg || "";
  const message = [err.message, details].filter(Boolean).join(" — ");
  return { message: message || fallback || "Erreur WhatsApp", code: err.code };
}

async function graphSend(body) {
  const config = getWhatsAppConfig();
  if (!config.configured) {
    return {
      success: false,
      code: "NOT_CONFIGURED",
      error:
        "WhatsApp Cloud API non configurée. Ajoutez WHATSAPP_ACCESS_TOKEN et WHATSAPP_PHONE_NUMBER_ID.",
    };
  }

  const response = await fetch(
    graphUrl(config.phoneNumberId, config.apiVersion),
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${config.accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        messaging_product: "whatsapp",
        recipient_type: "individual",
        ...body,
      }),
    },
  );

  const payload = await response.json().catch(() => ({}));
  if (!response.ok || payload.error) {
    const parsed = parseGraphError(payload, "Erreur d'envoi WhatsApp");
    return { success: false, ...parsed, payload };
  }

  return {
    success: true,
    messageId: payload.messages?.[0]?.id || null,
    payload,
  };
}

export async function sendWhatsAppText({ to, text }) {
  const body = String(text || "").trim();
  if (!to || !body) {
    return { success: false, error: "Numéro ou message manquant" };
  }

  return graphSend({
    to,
    type: "text",
    text: { preview_url: true, body: body.slice(0, 4096) },
  });
}

export function metaTemplateName(templateKey) {
  const envName = TEMPLATE_ENV[templateKey];
  if (!envName) return "";
  return String(process.env[envName] || "").trim();
}

export async function sendWhatsAppTemplate({
  to,
  name,
  language,
  bodyParams = [],
}) {
  if (!to || !name) {
    return { success: false, error: "Modèle WhatsApp manquant" };
  }

  const config = getWhatsAppConfig();
  const components =
    bodyParams.length > 0
      ? [
          {
            type: "body",
            parameters: bodyParams.map((text) => ({
              type: "text",
              text: String(text || "Bonjour").slice(0, 1024),
            })),
          },
        ]
      : undefined;

  return graphSend({
    to,
    type: "template",
    template: {
      name,
      language: { code: language || config.templateLanguage || "fr" },
      ...(components ? { components } : {}),
    },
  });
}

export function isOutsideWindowError(result) {
  const code = Number(result?.code);
  const message = String(result?.error || result?.message || "").toLowerCase();
  return (
    code === 131047 ||
    code === 470 ||
    message.includes("24 hour") ||
    message.includes("re-engagement") ||
    (message.includes("outside") && message.includes("window"))
  );
}
