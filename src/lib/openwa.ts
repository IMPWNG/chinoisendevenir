import { unreadChatPhones } from "./inboxPriority";
import {
  isEtudeChineLabel,
  whatsappAddressBookId,
  whatsappChatId,
  whatsappMsisdn,
} from "./whatsappPhone";

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

type ResolvedChat = {
  /** Chat WhatsApp actually uses. Often a privacy id (@lid), not the phone. */
  chatId: string;
  /** Phone key for the address book. */
  addressBookId: string;
};

async function resolveChat(phone: unknown, country?: string | null): Promise<ResolvedChat> {
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
  const chatId = whatsappChatId(number, checked?.whatsappId);
  const addressBookId = whatsappAddressBookId(number);
  if (!checked?.exists || !chatId || !addressBookId) {
    throw new OpenwaError(
      "Ce numéro n'est pas inscrit sur WhatsApp.",
      400,
      "NOT_ON_WHATSAPP",
    );
  }
  return { chatId, addressBookId };
}

function uniqueIds(ids: string[]) {
  return [...new Set(ids.filter(Boolean))];
}

const WA_FEED_MS = 25_000;
const WA_FEED_CONCURRENCY = 8;

function chatList(body: unknown): Record<string, unknown>[] {
  const wrapped = asRecord(body)?.data;
  const rows = Array.isArray(body) ? body : Array.isArray(wrapped) ? wrapped : [];
  return rows.flatMap((item) => {
    const row = asRecord(item);
    return row ? [row] : [];
  });
}

function msisdnFromChatId(id: string): string | null {
  const match = /^(\d+)@(c\.us|s\.whatsapp\.net)$/.exec(id);
  return match?.[1] || null;
}

function isPrivateChat(row: Record<string, unknown>, id: string): boolean {
  if (id.endsWith("@g.us")) return false;
  if (row.isGroup === true) return false;
  const kind = String(row.kind || "");
  return kind !== "group" && kind !== "channel" && kind !== "status" && kind !== "broadcast";
}

async function mapPool<T>(
  items: readonly T[],
  run: (item: T) => Promise<void>,
  deadline: number,
) {
  let cursor = 0;
  const workers = Array.from({ length: Math.min(WA_FEED_CONCURRENCY, items.length) }, async () => {
    while (Date.now() < deadline) {
      const index = cursor;
      cursor += 1;
      if (index >= items.length) return;
      await run(items[index]);
    }
  });
  await Promise.all(workers);
}

/**
 * Last messages per dossier, from OpenWA.
 * ponytail: one chat page (1000) plus a history call per matched chat, 25s ceiling.
 * A down OpenWA returns an empty map so the contact feed still answers.
 * A privacy id (@lid) is resolved only inside that budget.
 */
export async function recentWhatsappHistories(
  contacts: readonly { id: string; phone?: unknown; pays?: string | null }[],
  opts?: { maxMatches?: number; budgetMs?: number; historyLimit?: number },
): Promise<Map<string, unknown[]>> {
  const byPhone = new Map<string, string>();
  for (const contact of contacts) {
    const number = whatsappMsisdn(contact.phone, contact.pays);
    if (number && contact.id) byPhone.set(number, contact.id);
  }
  const out = new Map<string, unknown[]>();
  if (!byPhone.size) return out;

  let chats: unknown;
  try {
    chats = await openwa("/chats?limit=1000", undefined, { timeoutMs: 20_000 });
  } catch {
    return out;
  }
  const deadline = Date.now() + (opts?.budgetMs ?? WA_FEED_MS);
  const cap = opts?.maxMatches && opts.maxMatches > 0 ? opts.maxMatches : Number.POSITIVE_INFINITY;
  const historyLimit = Math.min(40, Math.max(1, opts?.historyLimit ?? 20));

  const jobs: { contactId: string; chatId: string }[] = [];
  const lids: string[] = [];
  const claimed = new Set<string>();
  function claim(phone: string, chatId: string) {
    if (claimed.size >= cap) return;
    const contactId = byPhone.get(phone);
    if (!contactId || claimed.has(contactId)) return;
    claimed.add(contactId);
    jobs.push({ contactId, chatId });
  }

  for (const row of chatList(chats)) {
    if (claimed.size >= cap) break;
    const id = String(row.id || "");
    if (!id || !isPrivateChat(row, id)) continue;
    const phone = msisdnFromChatId(id);
    if (phone) claim(phone, id);
    else if (id.endsWith("@lid") && lids.length + claimed.size < cap) lids.push(id);
  }

  async function loadHistory(job: { contactId: string; chatId: string }) {
    try {
      const history = await openwa(
        `/messages/${encodeURIComponent(job.chatId)}/history?limit=${historyLimit}`,
        undefined,
        { timeoutMs: 8_000 },
      );
      if (Array.isArray(history)) out.set(job.contactId, history);
    } catch {
      /* one chat must not drop the feed */
    }
  }

  const direct = jobs.splice(0);
  await Promise.all([
    mapPool(direct, loadHistory, deadline),
    mapPool(
      lids,
      async (lid) => {
        try {
          const body = asRecord(
            await openwa(`/contacts/${encodeURIComponent(lid)}/phone`, undefined, {
              allowNotFound: true,
              timeoutMs: 8_000,
            }),
          );
          claim(String(body?.phone || "").replace(/\D/g, ""), lid);
        } catch {
          /* unresolved privacy id */
        }
      },
      deadline,
    ),
  ]);
  await mapPool(jobs, loadHistory, deadline);
  return out;
}

/** Newest chats only. A down OpenWA throws; the caller treats that as no WhatsApp queue. */
export async function unreadWhatsappPhones(): Promise<string[]> {
  const body = await openwa("/chats?limit=200", undefined, { timeoutMs: 20_000 });
  return unreadChatPhones(body);
}

export async function markStudentWhatsappRead(input: {
  phone: unknown;
  country?: string | null;
}) {
  const { addressBookId } = await resolveChat(input.phone, input.country);
  await openwa("/chats/read", {
    method: "POST",
    body: JSON.stringify({ chatId: addressBookId }),
  });
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
  const { chatId, addressBookId } = await resolveChat(input.phone, input.country);
  const sent = (await openwa("/messages/send-text", {
    method: "POST",
    body: JSON.stringify({ chatId, text }),
  }).catch(async (error) => {
    if (chatId === addressBookId) throw error;
    return openwa("/messages/send-text", {
      method: "POST",
      body: JSON.stringify({ chatId: addressBookId, text }),
    });
  })) as { messageId?: string };
  return { chatId, messageId: sent?.messageId || null };
}

export async function saveStudentWhatsappContact(input: {
  phone: unknown;
  country?: string | null;
  firstName: string;
  lastName?: string;
}) {
  const resolved = await resolveChat(input.phone, input.country);
  await saveNamedContact(resolved, input.firstName, input.lastName || "");
  return { chatId: resolved.chatId };
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
  const record = asRecord(body);
  const list = Array.isArray(body)
    ? body
    : Array.isArray(record?.data)
      ? record.data
      : Array.isArray(record?.labels)
        ? record.labels
        : [];
  return list.flatMap((item) => {
    if (typeof item === "string") return [{ id: item, name: item }];
    const row = asRecord(item);
    if (!row) return [];
    return [{
      id: String(row.id || row.labelId || ""),
      name: String(row.name || row.title || ""),
    }];
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

function namePayload(firstName: string, lastName: string) {
  const first = firstName.trim().slice(0, 100) || "Étudiant";
  const last = lastName.trim().slice(0, 100);
  const body: { firstName: string; lastName?: string } = { firstName: first };
  // An empty lastName makes WhatsApp save the number and drop both names.
  if (last) body.lastName = last;
  return body;
}

async function saveNamedContact(resolved: ResolvedChat, firstName: string, lastName: string) {
  const body = JSON.stringify(namePayload(firstName, lastName));
  const ids = uniqueIds(
    resolved.chatId.endsWith("@lid")
      ? [resolved.chatId, resolved.addressBookId]
      : [resolved.addressBookId],
  );
  let saved = false;
  let lastError: unknown;
  for (const id of ids) {
    try {
      await openwa(`/contacts/${encodeURIComponent(id)}`, {
        method: "PUT",
        body,
      });
      saved = true;
    } catch (error) {
      lastError = error;
    }
  }
  if (!saved) throw lastError;
}

async function labelIds(ids: string[]) {
  const labelId = await etudeChineLabelId();
  if (!labelId) {
    throw new OpenwaError(
      "La liste Étude Chine est introuvable sur ce WhatsApp.",
      404,
      "NO_LIST",
    );
  }
  let lastError: unknown = null;
  for (const id of uniqueIds(ids)) {
    const encoded = encodeURIComponent(id);
    try {
      const current = await openwa(`/labels/chat/${encoded}`, undefined, {
        allowNotFound: true,
      });
      if (chatHasLabel(current, labelId)) return;
      await openwa(`/labels/chat/${encoded}`, {
        method: "POST",
        body: JSON.stringify({ labelId }),
      });
      return;
    } catch (error) {
      lastError = error;
    }
  }
  throw lastError instanceof Error
    ? lastError
    : new OpenwaError("La liste Étude Chine n'a pas été appliquée à ce contact.", 502, "LABEL");
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
  let resolved: ResolvedChat;
  try {
    resolved = await resolveChat(input.phone, input.country);
  } catch (error) {
    if (error instanceof OpenwaError && error.code === "NOT_ON_WHATSAPP") return empty;
    if (error instanceof OpenwaError && error.code === "BAD_PHONE") return empty;
    throw error;
  }

  const ids = uniqueIds([resolved.chatId, resolved.addressBookId]);
  const encoded = encodeURIComponent(resolved.chatId);
  const [contacts, labelId, history] = await Promise.all([
    Promise.all(
      ids.map((id) =>
        openwa(`/contacts/${encodeURIComponent(id)}`, undefined, { allowNotFound: true }).catch(
          () => null,
        ),
      ),
    ),
    etudeChineLabelId().catch(() => null),
    openwa(`/messages/${encoded}/history?limit=40`, undefined, { timeoutMs: 20_000 }).catch(
      () => [],
    ),
  ]);
  const chatLabels = labelId
    ? (
        await Promise.all(
          ids.map((id) =>
            openwa(`/labels/chat/${encodeURIComponent(id)}`, undefined, {
              allowNotFound: true,
            }).catch(() => []),
          ),
        )
      ).flat()
    : [];
  const contactRow = contacts.map(asRecord).find((row) => row?.isMyContact === true) || null;
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

export function fillWhatsappText(text: string, prenom: string, nom: string) {
  return text.replaceAll("{prenom}", prenom.trim()).replaceAll("{nom}", nom.trim()).trim();
}

export async function applyStudentWhatsapp(input: {
  phone: unknown;
  country?: string | null;
  firstName: string;
  lastName?: string;
  prenom?: string;
  nom?: string;
  text?: string;
  save?: boolean;
  label?: boolean;
}) {
  const text = fillWhatsappText(
    input.text || "",
    input.prenom ?? input.firstName,
    input.nom ?? input.lastName ?? "",
  );
  if (!input.save && !input.label && !text) {
    throw new OpenwaError(
      "Écrivez un message, ou cochez le carnet ou la liste Étude Chine.",
      400,
      "EMPTY",
    );
  }
  if (text.length > TEXT_MAX) {
    throw new OpenwaError(`Message trop long (${TEXT_MAX} caractères max).`, 400, "BAD_TEXT");
  }
  const resolved = await resolveChat(input.phone, input.country);
  if (input.save) {
    await saveNamedContact(resolved, input.firstName, input.lastName || "");
  }
  if (input.label) {
    await labelIds([resolved.chatId, resolved.addressBookId]);
  }
  if (text) {
    await openwa("/messages/send-text", {
      method: "POST",
      body: JSON.stringify({ chatId: resolved.chatId, text }),
    }).catch(async (error) => {
      if (resolved.chatId === resolved.addressBookId) throw error;
      await openwa("/messages/send-text", {
        method: "POST",
        body: JSON.stringify({ chatId: resolved.addressBookId, text }),
      });
    });
  }
  return {
    chatId: resolved.chatId,
    sent: Boolean(text),
    saved: Boolean(input.save),
    labeled: Boolean(input.label),
  };
}

export async function addStudentToEtudeChine(input: {
  phone: unknown;
  country?: string | null;
}) {
  const resolved = await resolveChat(input.phone, input.country);
  await labelIds([resolved.chatId, resolved.addressBookId]);
  return { chatId: resolved.chatId };
}
