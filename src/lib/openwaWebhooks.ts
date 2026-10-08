import { OpenwaError, openwa } from "./openwa";

export const DEFAULT_OPENWA_WEBHOOK_EVENTS = ["message.received"];
const EVENTS_MAX = 20;
const URL_MAX = 2048;
const EVENT_NAME = /^[a-z][a-z0-9._*-]{0,63}$/i;

export const INBOUND_ONLY_FILTER = {
  conditions: [{ field: "fromMe", operator: "is", value: false }],
};

export type OpenwaWebhookCreate = {
  url: string;
  events: string[];
  retryCount: number;
  inboundOnly: boolean;
};

export type OpenwaWebhook = {
  id: string;
  url: string;
  events: string[];
  filters: unknown;
  active: boolean | null;
  retryCount: number | null;
};

function asRecord(value: unknown): Record<string, unknown> | null {
  if (!value || typeof value !== "object" || Array.isArray(value)) return null;
  return value as Record<string, unknown>;
}

export function inboundOnlyFilter() {
  return INBOUND_ONLY_FILTER;
}

export function normalizeWebhookUrl(raw: string): string {
  const url = new URL(raw);
  url.hash = "";
  if (url.pathname.length > 1 && url.pathname.endsWith("/")) {
    url.pathname = url.pathname.slice(0, -1);
  }
  return url.toString();
}

export function parseOpenwaWebhookId(value: unknown): string {
  return String(value || "").trim();
}

export function parseOpenwaWebhookCreate(
  body: unknown,
): OpenwaWebhookCreate | { error: string } {
  if (!body || typeof body !== "object" || Array.isArray(body)) {
    return { error: "JSON invalide" };
  }
  const raw = body as Record<string, unknown>;
  const url = String(raw.url || "").trim();
  if (!url) return { error: "url manquant" };
  if (url.length > URL_MAX) return { error: "url trop longue" };
  let parsed: URL;
  try {
    parsed = new URL(url);
  } catch {
    return { error: "url invalide" };
  }
  if (parsed.protocol !== "https:" && parsed.protocol !== "http:") {
    return { error: "url invalide" };
  }
  if (!parsed.hostname) return { error: "url invalide" };
  if (parsed.username || parsed.password) return { error: "url invalide" };

  let events = DEFAULT_OPENWA_WEBHOOK_EVENTS;
  if (raw.events != null) {
    if (!Array.isArray(raw.events) || raw.events.length === 0) {
      return { error: "events invalide" };
    }
    const cleaned = [
      ...new Set(
        raw.events.map((item) => String(item || "").trim()).filter(Boolean),
      ),
    ];
    if (!cleaned.length || cleaned.length > EVENTS_MAX) {
      return { error: "events invalide" };
    }
    if (cleaned.some((item) => item !== "*" && !EVENT_NAME.test(item))) {
      return { error: "events invalide" };
    }
    events = cleaned;
  }

  let retryCount = 3;
  if (raw.retryCount != null) {
    const n = Number(raw.retryCount);
    if (!Number.isInteger(n) || n < 0 || n > 5) return { error: "retryCount invalide" };
    retryCount = n;
  }

  return {
    url: parsed.toString(),
    events,
    retryCount,
    inboundOnly: raw.inboundOnly !== false,
  };
}

export function webhookRows(body: unknown): OpenwaWebhook[] {
  if (!body) return [];
  const record = asRecord(body);
  const list = Array.isArray(body)
    ? body
    : Array.isArray(record?.data)
      ? record.data
      : Array.isArray(record?.webhooks)
        ? record.webhooks
        : record?.id && record?.url
          ? [body]
          : [];
  return list.flatMap((item) => {
    const row = asRecord(item);
    if (!row) return [];
    const id = String(row.id || "").trim();
    const url = String(row.url || "").trim();
    if (!id || !url) return [];
    const events = Array.isArray(row.events)
      ? row.events.map((event) => String(event || "").trim()).filter(Boolean)
      : [];
    return [
      {
        id,
        url,
        events,
        filters: row.filters ?? null,
        active: typeof row.active === "boolean" ? row.active : null,
        retryCount: Number.isFinite(Number(row.retryCount))
          ? Number(row.retryCount)
          : null,
      },
    ];
  });
}

function eventsKey(events: string[]) {
  return [...new Set(events)].sort().join("\n");
}

function filtersKey(filters: unknown): string {
  if (!filters || typeof filters !== "object") return "";
  try {
    return JSON.stringify(filters);
  } catch {
    return "";
  }
}

export function webhookMatchesCreate(
  webhook: OpenwaWebhook,
  input: OpenwaWebhookCreate,
): boolean {
  if (normalizeWebhookUrl(webhook.url) !== normalizeWebhookUrl(input.url)) {
    return false;
  }
  if (eventsKey(webhook.events) !== eventsKey(input.events)) return false;
  if (webhook.retryCount != null && webhook.retryCount !== input.retryCount) {
    return false;
  }
  const want = input.inboundOnly ? filtersKey(inboundOnlyFilter()) : "";
  return filtersKey(webhook.filters) === want && webhook.active !== false;
}

function createPayload(
  input: OpenwaWebhookCreate,
  withFilters: boolean,
  active?: boolean,
) {
  const payload: Record<string, unknown> = {
    url: input.url,
    events: input.events,
    retryCount: input.retryCount,
    filters: withFilters && input.inboundOnly ? inboundOnlyFilter() : null,
  };
  if (active != null) payload.active = active;
  return payload;
}

function isFilterError(error: unknown) {
  return error instanceof OpenwaError && /filter/i.test(error.message);
}

function isSsrfError(error: unknown) {
  return (
    error instanceof OpenwaError &&
    /ssrf|blocked host|internal or blocked|credentials/i.test(error.message)
  );
}

async function saveWebhook(
  path: string,
  method: "POST" | "PUT",
  input: OpenwaWebhookCreate,
) {
  const init = (payload: unknown): RequestInit => ({
    method,
    body: JSON.stringify(payload),
  });
  const active = method === "PUT" ? true : undefined;
  try {
    return await openwa(path, init(createPayload(input, true, active)));
  } catch (error) {
    if (input.inboundOnly && isFilterError(error)) {
      return await openwa(path, init(createPayload(input, false, active)));
    }
    if (isSsrfError(error)) {
      throw new OpenwaError(
        "OpenWA refuse cette URL (filtre SSRF). Il faut une URL HTTPS publique.",
        400,
        "SSRF",
      );
    }
    throw error;
  }
}

export async function listOpenwaWebhooks(): Promise<OpenwaWebhook[]> {
  return webhookRows(await openwa("/webhooks"));
}

export async function ensureOpenwaWebhook(input: OpenwaWebhookCreate): Promise<{
  created: boolean;
  updated: boolean;
  webhook: OpenwaWebhook;
}> {
  const existing = (await listOpenwaWebhooks()).find(
    (row) => normalizeWebhookUrl(row.url) === normalizeWebhookUrl(input.url),
  );
  if (existing && webhookMatchesCreate(existing, input)) {
    return { created: false, updated: false, webhook: existing };
  }
  const saved = existing
    ? await saveWebhook(
        `/webhooks/${encodeURIComponent(existing.id)}`,
        "PUT",
        input,
      )
    : await saveWebhook("/webhooks", "POST", input);
  const webhook = webhookRows(saved)[0] || existing;
  if (!webhook) {
    throw new OpenwaError("OpenWA n'a pas renvoyé le webhook.", 502, "OPENWA");
  }
  return { created: !existing, updated: Boolean(existing), webhook };
}

export async function deleteOpenwaWebhook(id: string): Promise<void> {
  await openwa(`/webhooks/${encodeURIComponent(id)}`, { method: "DELETE" }, {
    allowNotFound: true,
  });
}
