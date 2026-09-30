import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { getSupabaseAnonKey, getSupabaseUrl } from "./supabaseAdmin";

export { getSupabaseAnonKey, getSupabaseUrl };

export function getSupabaseAnonClient(): SupabaseClient {
  const url = getSupabaseUrl();
  const key = getSupabaseAnonKey();
  if (!url || !key) {
    throw new Error("Variables Supabase manquantes");
  }
  return createClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

export function normalizeAuthEmail(email: unknown): string {
  return String(email || "")
    .trim()
    .toLowerCase();
}

export function isValidAuthPassword(password: unknown): boolean {
  const value = String(password || "");
  return value.length >= 8 && value.length <= 72;
}

const RECOVERY_PATH = "/espace-etudiant/auth/callback?next=password";
const RECOVERY_SITE = "https://chinoisendevenir.com";

/** Absolute Supabase redirect. Unknown origins fall back to the public site. */
export function studentRecoveryRedirect(origin: unknown): string {
  const fallback = `${RECOVERY_SITE}${RECOVERY_PATH}`;
  let url: URL;
  try {
    url = new URL(String(origin || ""));
  } catch {
    return fallback;
  }
  const host = url.host.toLowerCase();
  const local =
    (host === "localhost:3000" || host === "127.0.0.1:3000") &&
    url.protocol === "http:";
  const site =
    (host === "chinoisendevenir.com" || host === "www.chinoisendevenir.com") &&
    url.protocol === "https:";
  const preview = url.protocol === "https:" && host.endsWith(".vercel.app");
  if (!local && !site && !preview) return fallback;
  return `${url.origin}${RECOVERY_PATH}`;
}
