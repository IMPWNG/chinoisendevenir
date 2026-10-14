import { NextResponse } from "next/server";
import { getClientIp, rateLimit } from "@/lib/httpSecurity";
import { supabaseProxyPath } from "@/lib/supabaseProxy";
import { getSupabaseUrl } from "@/lib/supabaseAdmin";

export const dynamic = "force-dynamic";

const REQUEST_HEADERS = [
  "apikey",
  "authorization",
  "content-type",
  "accept",
  "prefer",
  "range",
  "accept-profile",
  "content-profile",
  "x-client-info",
];

const RESPONSE_HEADERS = [
  "content-type",
  "content-range",
  "content-location",
  "preference-applied",
];

async function forward(
  request: Request,
  context: { params: Promise<{ path: string[] }> },
) {
  const site = request.headers.get("sec-fetch-site");
  if (site && site !== "same-origin" && site !== "same-site" && site !== "none") {
    return NextResponse.json({ error: "Origine refusée" }, { status: 403 });
  }

  const limited = rateLimit({
    key: `sb-proxy:${getClientIp(request.headers)}`,
    limit: 240,
    windowMs: 60_000,
  });
  if (!limited.ok) {
    return NextResponse.json(
      { error: "Trop de requêtes." },
      { status: 429, headers: { "Retry-After": String(limited.retryAfter) } },
    );
  }

  const { path } = await context.params;
  const safe = supabaseProxyPath(path);
  const base = getSupabaseUrl().replace(/\/$/, "");
  if (!safe || !base) {
    return NextResponse.json({ error: "Requête refusée" }, { status: 400 });
  }

  const service = process.env.SUPABASE_SERVICE_ROLE_KEY || "";
  const apikey = request.headers.get("apikey") || "";
  const authorization = request.headers.get("authorization") || "";
  if (service && (apikey === service || authorization === `Bearer ${service}`)) {
    return NextResponse.json({ error: "Requête refusée" }, { status: 403 });
  }

  const headers = new Headers();
  for (const name of REQUEST_HEADERS) {
    const value = request.headers.get(name);
    if (value) headers.set(name, value);
  }

  const hasBody = request.method !== "GET" && request.method !== "HEAD";
  let upstream: Response;
  try {
    upstream = await fetch(`${base}/${safe}${new URL(request.url).search}`, {
      method: request.method,
      headers,
      body: hasBody ? await request.arrayBuffer() : undefined,
      redirect: "manual",
    });
  } catch (error) {
    console.error("supabase proxy:", error instanceof Error ? error.message : "fetch failed");
    return NextResponse.json({ error: "Supabase injoignable" }, { status: 502 });
  }

  const responseHeaders = new Headers();
  for (const name of RESPONSE_HEADERS) {
    const value = upstream.headers.get(name);
    if (value) responseHeaders.set(name, value);
  }

  return new Response(upstream.body, {
    status: upstream.status,
    headers: responseHeaders,
  });
}

export const GET = forward;
export const POST = forward;
export const PATCH = forward;
export const PUT = forward;
export const DELETE = forward;
export const HEAD = forward;
