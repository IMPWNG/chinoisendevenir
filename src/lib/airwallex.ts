import { createHmac, timingSafeEqual } from "crypto";

/**
 * Server-side Airwallex REST client.
 * Hosted Payment Page still redirects in the browser with Airwallex.js
 * (https://static.airwallex.com/components/sdk/v1/index.js) — no npm SDK.
 *
 * Sandbox host: https://api-demo.airwallex.com (integration checklist).
 * The 2026 quickstart also cites https://api.sandbox.airwallex.com — set
 * AIRWALLEX_API_BASE if the account's docs use that host.
 * Production: https://api.airwallex.com
 *
 * Auth: POST /api/v1/authentication/login with x-client-id and x-api-key.
 * Intent: POST /api/v1/pa/payment_intents/create
 * Webhook: HMAC-SHA256 hex of `${x-timestamp}${rawBody}` vs x-signature.
 */

const TOKEN_SKEW_MS = 60_000;
const WEBHOOK_MAX_AGE_MS = 5 * 60 * 1000;

type CachedToken = { token: string; expiresAt: number };

let cachedToken: CachedToken | null = null;

export type AirwallexEnv = "demo" | "prod";

export function airwallexEnv(): AirwallexEnv {
  const value = String(process.env.AIRWALLEX_ENV || "demo").trim().toLowerCase();
  return value === "prod" || value === "production" ? "prod" : "demo";
}

export function airwallexApiBase(): string {
  const override = String(process.env.AIRWALLEX_API_BASE || "").trim().replace(/\/$/, "");
  if (override) return override;
  return airwallexEnv() === "prod"
    ? "https://api.airwallex.com"
    : "https://api-demo.airwallex.com";
}

export function isAirwallexConfigured(): boolean {
  return Boolean(airwallexClientId() && airwallexApiKey());
}

function airwallexClientId() {
  return String(process.env.AIRWALLEX_CLIENT_ID || "").trim();
}

function airwallexApiKey() {
  return String(process.env.AIRWALLEX_API_KEY || "").trim();
}

export function airwallexWebhookSecret() {
  return String(process.env.AIRWALLEX_WEBHOOK_SECRET || "").trim();
}

type HeaderSource =
  | Headers
  | Record<string, string | string[] | undefined>
  | { get?: (name: string) => string | null | undefined };

function headerValue(headers: HeaderSource | null | undefined, name: string) {
  if (!headers) return "";
  if (typeof headers.get === "function") {
    return headers.get(name) || "";
  }
  const lower = name.toLowerCase();
  for (const [key, value] of Object.entries(headers)) {
    if (key.toLowerCase() === lower) {
      return Array.isArray(value) ? value[0] || "" : value || "";
    }
  }
  return "";
}

function signaturesMatch(expected: string, received: string) {
  const a = Buffer.from(expected);
  const b = Buffer.from(received);
  if (!a.length || a.length !== b.length) return false;
  return timingSafeEqual(a, b);
}

export function verifyAirwallexWebhook({
  rawBody,
  headers,
  secret,
  now = Date.now(),
}: {
  rawBody: string;
  headers: HeaderSource;
  secret: unknown;
  now?: number;
}): { ok: true } | { ok: false; reason: string } {
  const key = String(secret || "").trim();
  if (!key) return { ok: false, reason: "missing_secret" };

  const timestamp = String(headerValue(headers, "x-timestamp") || "").trim();
  const signature = String(headerValue(headers, "x-signature") || "")
    .trim()
    .toLowerCase();
  if (!timestamp || !signature) return { ok: false, reason: "missing_headers" };

  const ts = Number(timestamp);
  if (!Number.isFinite(ts)) return { ok: false, reason: "invalid_timestamp" };
  const tsMs = ts < 1e12 ? ts * 1000 : ts;
  if (Math.abs(now - tsMs) > WEBHOOK_MAX_AGE_MS) {
    return { ok: false, reason: "expired_timestamp" };
  }

  const expected = createHmac("sha256", key)
    .update(`${timestamp}${rawBody}`, "utf8")
    .digest("hex");
  if (!signaturesMatch(expected, signature)) {
    return { ok: false, reason: "invalid_signature" };
  }
  return { ok: true };
}

type AirwallexErrorBody = { code?: unknown; message?: unknown };

export class AirwallexError extends Error {
  status: number;
  constructor(message: string, status: number) {
    super(message);
    this.status = status;
  }
}

async function airwallexFetch(path: string, init: RequestInit & { token?: string }) {
  const headers = new Headers(init.headers);
  headers.set("Content-Type", "application/json");
  headers.set("Accept", "application/json");
  if (init.token) headers.set("Authorization", `Bearer ${init.token}`);
  const { token: _token, headers: _headers, ...rest } = init;
  const response = await fetch(`${airwallexApiBase()}${path}`, {
    ...rest,
    headers,
  });
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
    const record = body && typeof body === "object" ? (body as AirwallexErrorBody) : {};
    const code = typeof record.code === "string" ? record.code : "";
    throw new AirwallexError(
      code ? `Airwallex a refusé l'appel (${code}).` : "Airwallex a refusé l'appel.",
      response.status,
    );
  }
  return body;
}

export async function getAirwallexToken(): Promise<string> {
  if (!isAirwallexConfigured()) {
    throw new AirwallexError("Paiement non configuré", 503);
  }
  const now = Date.now();
  if (cachedToken && cachedToken.expiresAt - TOKEN_SKEW_MS > now) {
    return cachedToken.token;
  }
  const body = await airwallexFetch("/api/v1/authentication/login", {
    method: "POST",
    headers: {
      "x-client-id": airwallexClientId(),
      "x-api-key": airwallexApiKey(),
    },
  });
  const record = body && typeof body === "object" ? (body as { token?: unknown; expires_at?: unknown }) : {};
  const token = typeof record.token === "string" ? record.token : "";
  if (!token) throw new AirwallexError("Jeton Airwallex manquant", 502);
  const expiresAt = Date.parse(String(record.expires_at || ""));
  cachedToken = {
    token,
    expiresAt: Number.isFinite(expiresAt) ? expiresAt : now + 25 * 60 * 1000,
  };
  return token;
}

export type CreatedPaymentIntent = {
  id: string;
  clientSecret: string;
  status: string;
};

export async function createPaymentIntent(input: {
  requestId: string;
  amount: number;
  currency: string;
  merchantOrderId: string;
  returnUrl: string;
  descriptor?: string;
  metadata?: Record<string, string>;
  customer?: {
    email?: string;
    firstName?: string;
    lastName?: string;
    merchantCustomerId?: string;
  };
}): Promise<CreatedPaymentIntent> {
  const token = await getAirwallexToken();
  const customer = input.customer
    ? {
        ...(input.customer.email ? { email: input.customer.email } : {}),
        ...(input.customer.firstName ? { first_name: input.customer.firstName } : {}),
        ...(input.customer.lastName ? { last_name: input.customer.lastName } : {}),
        ...(input.customer.merchantCustomerId
          ? { merchant_customer_id: input.customer.merchantCustomerId }
          : {}),
      }
    : undefined;
  const body = await airwallexFetch("/api/v1/pa/payment_intents/create", {
    method: "POST",
    token,
    body: JSON.stringify({
      request_id: input.requestId,
      amount: input.amount,
      currency: input.currency,
      merchant_order_id: input.merchantOrderId,
      return_url: input.returnUrl,
      descriptor: input.descriptor || "Chinois en Devenir",
      ...(input.metadata ? { metadata: input.metadata } : {}),
      ...(customer && Object.keys(customer).length ? { customer } : {}),
    }),
  });
  const record = body && typeof body === "object"
    ? (body as { id?: unknown; client_secret?: unknown; status?: unknown })
    : {};
  const id = typeof record.id === "string" ? record.id : "";
  const clientSecret = typeof record.client_secret === "string" ? record.client_secret : "";
  if (!id || !clientSecret) {
    throw new AirwallexError("Réponse PaymentIntent incomplète", 502);
  }
  return {
    id,
    clientSecret,
    status: typeof record.status === "string" ? record.status : "",
  };
}

export async function retrievePaymentIntent(id: string): Promise<{
  id: string;
  status: string;
  amount: number;
  currency: string;
}> {
  const token = await getAirwallexToken();
  const body = await airwallexFetch(
    `/api/v1/pa/payment_intents/${encodeURIComponent(id)}`,
    { method: "GET", token },
  );
  const record = body && typeof body === "object"
    ? (body as { id?: unknown; status?: unknown; amount?: unknown; currency?: unknown })
    : {};
  return {
    id: typeof record.id === "string" ? record.id : id,
    status: typeof record.status === "string" ? record.status : "",
    amount: Number(record.amount),
    currency: typeof record.currency === "string" ? record.currency : "",
  };
}

export async function cancelPaymentIntent(id: string) {
  const token = await getAirwallexToken();
  await airwallexFetch(
    `/api/v1/pa/payment_intents/${encodeURIComponent(id)}/cancel`,
    {
      method: "POST",
      token,
      body: JSON.stringify({
        request_id: crypto.randomUUID(),
        cancellation_reason: "Remplacé par une nouvelle tentative",
      }),
    },
  );
}

/** Test hook: drop the cached login token. */
export function clearAirwallexTokenCache() {
  cachedToken = null;
}
