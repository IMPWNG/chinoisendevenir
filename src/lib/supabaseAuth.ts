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
