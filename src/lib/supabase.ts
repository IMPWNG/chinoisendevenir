"use client";

import { createClient, type SupabaseClient } from "@supabase/supabase-js";

function createScopedBrowserClient(
  storageKey: string,
  detectSessionInUrl: boolean,
): SupabaseClient {
  let client: SupabaseClient | undefined;

  const getClient = () => {
    if (client) return client;

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";
    if (!supabaseUrl || !supabaseAnonKey) {
      throw new Error(
        "Configuration Supabase manquante (NEXT_PUBLIC_SUPABASE_URL / ANON_KEY)",
      );
    }

    client = createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl,
        storageKey,
      },
    });
    return client;
  };

  // Lazy: Next prerender imports this via Providers; env may be absent at build.
  return new Proxy({} as SupabaseClient, {
    get(_target, prop) {
      const scoped = getClient();
      const value = Reflect.get(scoped, prop, scoped);
      return typeof value === "function" ? value.bind(scoped) : value;
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
