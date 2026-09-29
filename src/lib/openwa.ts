import { whatsappMsisdn } from "./whatsappPhone";

const TEXT_MAX = 4096;

export class OpenwaError extends Error {
  status: number;
  code: string;

  constructor(message: string, status: number, code: string) {
    super(message);
    this.status = status;
    this.code = code;
  }
}

type OpenwaConfig = {
  apiRoot: string;
  apiKey: string;
  sessionId: string;
};

function config(): OpenwaConfig {
  const base = String(process.env.OPENWA_BASE_URL || "")
    .trim()
    .replace(/\/+$/, "");
  const apiKey = String(process.env.OPENWA_API_KEY || "").trim();
  const sessionId = String(process.env.OPENWA_SESSION_ID || "").trim();
  if (!base || !apiKey || !sessionId) {
    throw new OpenwaError(
      "WhatsApp n'est pas configuré sur le serveur.",
      503,
      "NOT_CONFIGURED",
    );
  }
  return {
    apiRoot: base.endsWith("/api") ? base : `${base}/api`,
    apiKey,
    sessionId,
  };
}

function nestMessage(body: unknown): string {
  if (!body || typeof body !== "object") return "";
  const message = (body as { message?: unknown }).message;
  if (Array.isArray(message)) return message.map(String).join(" ");
  return typeof message === "string" ? message : "";
}

function publicError(status: number, body: unknown): string {
  const raw = nestMessage(body).replace(/\s+/g, " ").trim().slice(0, 180);
  if (status === 401 || status === 403) {
    return "La clé OpenWA n'a pas le droit d'effectuer cette action.";
  }
  if (
    status === 409 ||
    /not started|not active|not ready|engine/i.test(raw)
  ) {
    return "La session WhatsApp n'est pas connectée. Ouvrez OpenWA et scannez le QR.";
  }
  if (status === 404) return "Session ou contact WhatsApp introuvable.";
  return raw || "OpenWA a refusé la demande.";
}

async function openwa(path: string, init?: RequestInit): Promise<unknown> {
  const { apiRoot, apiKey, sessionId } = config();
  const url = `${apiRoot}/sessions/${encodeURIComponent(sessionId)}${path}`;
  let response: Response;
  try {
    response = await fetch(url, {
      ...init,
      headers: {
        "X-API-Key": apiKey,
        ...(init?.body ? { "Content-Type": "application/json" } : {}),
      },
      cache: "no-store",
      signal: AbortSignal.timeout(15_000),
    });
  } catch {
    throw new OpenwaError("OpenWA ne répond pas.", 502, "UNREACHABLE");
  }

  const text = await response.text();
  let body: unknown = null;
  if (text) {
    try {
      body = JSON.parse(text);
    } catch {
      body = null;
    }
  }
  if (!response.ok) {
    throw new OpenwaError(publicError(response.status, body), 502, "OPENWA");
  }
  return body;
}

async function resolveChat(phone: unknown, country?: string | null) {
  const number = whatsappMsisdn(phone, country);
  if (!number) {
    throw new OpenwaError(
      "Numéro invalide. Enregistrez-le au format international, par exemple +33612345678.",
      400,
      "BAD_PHONE",
    );
  }
  const checked = (await openwa(`/contacts/check/${number}`)) as {
    exists?: boolean;
    whatsappId?: string | null;
  };
  const chatId = String(checked?.whatsappId || "");
  if (!checked?.exists || !/^\d+@c\.us$/.test(chatId)) {
    throw new OpenwaError(
      "Ce numéro n'est pas inscrit sur WhatsApp.",
      400,
      "NOT_ON_WHATSAPP",
    );
  }
  return chatId;
}

export async function sendStudentWhatsapp(input: {
  phone: unknown;
  country?: string | null;
  text: string;
}) {
  const text = input.text.trim();
  if (!text || text.length > TEXT_MAX) {
    throw new OpenwaError(
      text ? `Message trop long (${TEXT_MAX} caractères max).` : "Message vide.",
      400,
      "BAD_TEXT",
    );
  }
  const chatId = await resolveChat(input.phone, input.country);
  const sent = (await openwa("/messages/send-text", {
    method: "POST",
    body: JSON.stringify({ chatId, text }),
  })) as { messageId?: string };
  return { chatId, messageId: sent?.messageId || null };
}

export async function saveStudentWhatsappContact(input: {
  phone: unknown;
  country?: string | null;
  firstName: string;
  lastName?: string;
}) {
  const chatId = await resolveChat(input.phone, input.country);
  const firstName = input.firstName.trim().slice(0, 100) || "Étudiant";
  const lastName = input.lastName?.trim().slice(0, 100) || "";
  const body: { firstName: string; lastName?: string } = { firstName };
  if (lastName) body.lastName = lastName;
  await openwa(`/contacts/${encodeURIComponent(chatId)}`, {
    method: "PUT",
    body: JSON.stringify(body),
  });
  return { chatId };
}
