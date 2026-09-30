import { isEtudeChineLabel, whatsappMsisdn } from "./whatsappPhone";

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

async function openwa(
  path: string,
  init?: RequestInit,
  opts?: { allowNotFound?: boolean; timeoutMs?: number },
): Promise<unknown> {
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
      signal: AbortSignal.timeout(opts?.timeoutMs ?? 15_000),
    });
  } catch {
    throw new OpenwaError("OpenWA ne répond pas.", 502, "UNREACHABLE");
  }
  if (response.status === 404 && opts?.allowNotFound) return null;

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

export type WhatsappThreadMessage = {
  id: string;
  body: string;
  fromMe: boolean;
  at: number;
};

export type WhatsappStudentCard = {
  onWhatsapp: boolean;
  saved: boolean;
  onList: boolean;
  listFound: boolean;
  messages: WhatsappThreadMessage[];
};

function asRecord(value: unknown): Record<string, unknown> | null {
  if (!value || typeof value !== "object" || Array.isArray(value)) return null;
  return value as Record<string, unknown>;
}

function labelRows(body: unknown): { id: string; name: string }[] {
  if (!Array.isArray(body)) return [];
  return body.flatMap((item) => {
    if (typeof item === "string") return [{ id: item, name: item }];
    const row = asRecord(item);
    if (!row) return [];
    return [{ id: String(row.id || ""), name: String(row.name || "") }];
  });
}

function messageAt(value: unknown): number {
  const n = Number(value);
  if (!Number.isFinite(n) || n <= 0) return 0;
  return n < 1e12 ? n * 1000 : n;
}

function messageBody(row: Record<string, unknown>): string {
  const body = String(row.body || "").trim();
  if (body) return body.slice(0, 2000);
  const type = String(row.type || "").trim();
  return type && type !== "text" ? `[${type}]` : "";
}

async function etudeChineLabelId(): Promise<string | null> {
  const rows = labelRows(await openwa("/labels"));
  return rows.find((row) => isEtudeChineLabel(row.name))?.id || null;
}

function chatHasLabel(body: unknown, labelId: string | null): boolean {
  return labelRows(body).some(
    (row) =>
      (labelId && row.id === labelId) ||
      isEtudeChineLabel(row.name) ||
      isEtudeChineLabel(row.id),
  );
}

export async function studentWhatsappCard(input: {
  phone: unknown;
  country?: string | null;
}): Promise<WhatsappStudentCard> {
  const empty: WhatsappStudentCard = {
    onWhatsapp: false,
    saved: false,
    onList: false,
    listFound: false,
    messages: [],
  };
  let chatId: string;
  try {
    chatId = await resolveChat(input.phone, input.country);
  } catch (error) {
    if (error instanceof OpenwaError && error.code === "NOT_ON_WHATSAPP") return empty;
    if (error instanceof OpenwaError && error.code === "BAD_PHONE") return empty;
    throw error;
  }

  const encoded = encodeURIComponent(chatId);
  const [contact, labelId, history] = await Promise.all([
    openwa(`/contacts/${encoded}`, undefined, { allowNotFound: true }),
    etudeChineLabelId().catch(() => null),
    openwa(`/messages/${encoded}/history?limit=40`, undefined, { timeoutMs: 20_000 }).catch(
      () => [],
    ),
  ]);
  const chatLabels = labelId
    ? await openwa(`/labels/chat/${encoded}`, undefined, { allowNotFound: true }).catch(
        () => [],
      )
    : [];
  const contactRow = asRecord(contact);
  const messages = (Array.isArray(history) ? history : [])
    .flatMap((item) => {
      const row = asRecord(item);
      if (!row) return [];
      const body = messageBody(row);
      if (!body) return [];
      return [
        {
          id: String(row.id || `${row.timestamp || ""}-${body.slice(0, 12)}`),
          body,
          fromMe: row.fromMe === true,
          at: messageAt(row.timestamp),
        },
      ];
    })
    .sort((a, b) => a.at - b.at);

  return {
    onWhatsapp: true,
    saved: contactRow?.isMyContact === true,
    onList: chatHasLabel(chatLabels, labelId),
    listFound: Boolean(labelId),
    messages,
  };
}

export async function addStudentToEtudeChine(input: {
  phone: unknown;
  country?: string | null;
}) {
  const chatId = await resolveChat(input.phone, input.country);
  const labelId = await etudeChineLabelId();
  if (!labelId) {
    throw new OpenwaError(
      "La liste Étude Chine est introuvable sur ce WhatsApp.",
      404,
      "NO_LIST",
    );
  }
  const encoded = encodeURIComponent(chatId);
  const current = await openwa(`/labels/chat/${encoded}`, undefined, {
    allowNotFound: true,
  });
  if (chatHasLabel(current, labelId)) return { chatId };
  await openwa(`/labels/chat/${encoded}`, {
    method: "POST",
    body: JSON.stringify({ labelId }),
  });
  return { chatId };
}
