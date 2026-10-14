"use client";

import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { browserUrlToProxy } from "./supabaseProxy";

const MISSING_ENV_URL = "https://placeholder.supabase.co";
// Valid-shaped JWT so createClient accepts it; auth calls fail soft when env is missing.
const MISSING_ENV_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24ifQ.placeholder";

function proxiedFetch(supabaseUrl: string): typeof fetch {
  return (input, init) => {
    const raw =
      typeof input === "string" ? input : input instanceof URL ? input.href : input.url;
    const proxied = browserUrlToProxy(supabaseUrl, raw);
    if (!proxied || (typeof input !== "string" && !(input instanceof URL))) {
      return fetch(input, init);
    }
    return fetch(proxied, init);
  };
}

function createScopedBrowserClient(
  storageKey: string,
  detectSessionInUrl: boolean,
): SupabaseClient {
  let client: SupabaseClient | undefined;

  const getClient = () => {
    if (client) return client;

    const supabaseUrl =
      process.env.NEXT_PUBLIC_SUPABASE_URL ||
      process.env.VITE_SUPABASE_URL ||
      "";
    const supabaseAnonKey =
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
      process.env.VITE_SUPABASE_ANON_KEY ||
      "";
    if (!supabaseUrl || !supabaseAnonKey) {
      console.error(
        "Configuration Supabase manquante (NEXT_PUBLIC_SUPABASE_URL / ANON_KEY)",
      );
      client = createClient(MISSING_ENV_URL, MISSING_ENV_KEY, {
        auth: {
          persistSession: false,
          autoRefreshToken: false,
          detectSessionInUrl: false,
          storageKey,
        },
      });
      return client;
    }

    client = createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl,
        storageKey,
      },
      global: { fetch: proxiedFetch(supabaseUrl) },
    });
    return client;
  };

  // Lazy: Next prerender imports this via Providers before env is always available.
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
