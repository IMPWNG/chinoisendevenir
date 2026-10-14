const ALLOWED_ROOTS = new Set(["auth", "rest", "storage"]);

/** Path under the Supabase host that the browser may relay through /api/sb. */
export function supabaseProxyPath(segments: string[]): string | null {
  if (segments.length < 2) return null;
  if (segments.some((part) => !part || part === "." || part === ".." || part.includes("\\"))) {
    return null;
  }
  if (!ALLOWED_ROOTS.has(segments[0]) || segments[1] !== "v1") return null;
  return segments.map((part) => encodeURIComponent(part)).join("/");
}

/** Rewrite a Supabase URL to a same-origin proxy path. Other URLs stay untouched. */
export function browserUrlToProxy(supabaseUrl: string, raw: string): string | null {
  const base = supabaseUrl.replace(/\/$/, "");
  if (!raw.startsWith(`${base}/`)) return null;
  const rest = raw.slice(base.length);
  const queryAt = rest.indexOf("?");
  const path = queryAt === -1 ? rest : rest.slice(0, queryAt);
  const query = queryAt === -1 ? "" : rest.slice(queryAt);
  if (query.includes("\n") || query.includes("\r")) return null;
  const safe = supabaseProxyPath(path.split("/").filter(Boolean));
  if (!safe) return null;
  return `/api/sb/${safe}${query}`;
}
