/* eslint-disable no-undef */
import { createHmac, timingSafeEqual } from "crypto";

const MAX_TIMESTAMP_AGE_SECONDS = 5 * 60;

function headerValue(headers, name) {
  if (!headers) return "";
  if (typeof headers.get === "function") {
    return headers.get(name) || "";
  }
  const lower = name.toLowerCase();
  for (const [key, value] of Object.entries(headers)) {
    if (key.toLowerCase() === lower) {
      return Array.isArray(value) ? value[0] : value || "";
    }
  }
  return "";
}

function decodeWebhookSecret(secret) {
  const value = String(secret || "").trim();
  if (!value) return null;
  const payload = value.startsWith("whsec_") ? value.slice(6) : value;
  const decoded = Buffer.from(payload, "base64");
  return decoded.length ? decoded : null;
}

function signaturesMatch(expected, received) {
  const a = Buffer.from(String(expected || ""));
  const b = Buffer.from(String(received || ""));
  if (!a.length || a.length !== b.length) return false;
  return timingSafeEqual(a, b);
}

export function verifyResendWebhook({ rawBody, headers, secret }) {
  const key = decodeWebhookSecret(secret);
  if (!key) {
    return { ok: false, reason: "missing_secret" };
  }

  const svixId = String(headerValue(headers, "svix-id") || "").trim();
  const timestamp = String(headerValue(headers, "svix-timestamp") || "").trim();
  const signatureHeader = String(
    headerValue(headers, "svix-signature") || "",
  ).trim();

  if (!svixId || !timestamp || !signatureHeader) {
    return { ok: false, reason: "missing_headers" };
  }

  const ts = Number(timestamp);
  if (!Number.isFinite(ts)) {
    return { ok: false, reason: "invalid_timestamp" };
  }

  const now = Math.floor(Date.now() / 1000);
  if (Math.abs(now - ts) > MAX_TIMESTAMP_AGE_SECONDS) {
    return { ok: false, reason: "expired_timestamp" };
  }

  const signedContent = `${svixId}.${timestamp}.${rawBody}`;
  const expected = createHmac("sha256", key)
    .update(signedContent, "utf8")
    .digest("base64");

  const candidates = signatureHeader.split(/\s+/).map((item) => {
    const comma = item.indexOf(",");
    return comma === -1 ? "" : item.slice(comma + 1);
  });

  if (!candidates.some((sig) => signaturesMatch(expected, sig))) {
    return { ok: false, reason: "invalid_signature" };
  }

  return { ok: true };
}
