const ALLOWED_ORIGINS = new Set([
  "https://chinoisendevenir.com",
  "https://www.chinoisendevenir.com",
  "http://localhost:3000",
  "http://127.0.0.1:3000",
]);

const buckets = new Map();

function headerValue(headers, name) {
  if (!headers) return "";
  if (typeof headers.get === "function") {
    return headers.get(name) || "";
  }
  const lower = name.toLowerCase();
  for (const [key, value] of Object.entries(headers)) {
    if (key.toLowerCase() === lower) return value || "";
  }
  return "";
}

export function getClientIp(headers) {
  const forwarded = String(headerValue(headers, "x-forwarded-for"))
    .split(",")[0]
    .trim();
  return forwarded || String(headerValue(headers, "x-real-ip")).trim() || "unknown";
}

export function rateLimit({ key, limit, windowMs }) {
  const now = Date.now();
  let entry = buckets.get(key);
  if (!entry || now - entry.start >= windowMs) {
    entry = { start: now, count: 0 };
  }
  entry.count += 1;
  buckets.set(key, entry);

  if (buckets.size > 4000) {
    for (const [storedKey, stored] of buckets) {
      if (now - stored.start >= windowMs) buckets.delete(storedKey);
    }
  }

  const retryAfter = Math.max(
    1,
    Math.ceil((entry.start + windowMs - now) / 1000),
  );
  return {
    ok: entry.count <= limit,
    remaining: Math.max(0, limit - entry.count),
    retryAfter,
  };
}

export function applyCorsHeaders(req, res, { methods = "POST, OPTIONS" } = {}) {
  const origin = headerValue(req.headers, "origin");
  if (origin && ALLOWED_ORIGINS.has(origin)) {
    res.setHeader("Access-Control-Allow-Origin", origin);
    res.setHeader("Vary", "Origin");
  }
  res.setHeader("Access-Control-Allow-Methods", methods);
  res.setHeader(
    "Access-Control-Allow-Headers",
    "Content-Type, Authorization",
  );
}

export function rateLimitExceededResponse(retryAfter) {
  return {
    status: 429,
    body: { error: "Trop de requêtes. Réessayez plus tard." },
    headers: { "Retry-After": String(retryAfter) },
  };
}
