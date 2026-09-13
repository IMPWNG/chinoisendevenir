"use client";

import { createClient, type SupabaseClient } from "@supabase/supabase-js";

function createScopedBrowserClient(
  storageKey: string,
  detectSessionInUrl: boolean,
): SupabaseClient {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";
  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error(
      "Configuration Supabase manquante (NEXT_PUBLIC_SUPABASE_URL / ANON_KEY)",
    );
  }

  return createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl,
      storageKey,
    },
  });
}

export const studentSupabase = createScopedBrowserClient(
  "ced-student-auth",
  true,
);

export const adminSupabase = createScopedBrowserClient(
  "ced-admin-auth",
  false,
);
