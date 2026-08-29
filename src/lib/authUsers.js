import { createClient } from "@supabase/supabase-js";
import { getSupabaseAdmin } from "./supabaseAdmin";

function supabaseUrl() {
  return (
    process.env.SUPABASE_URL ||
    process.env.NEXT_PUBLIC_SUPABASE_URL ||
    process.env.VITE_SUPABASE_URL ||
    ""
  );
}

function supabaseAnonKey() {
  return (
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
    process.env.VITE_SUPABASE_ANON_KEY ||
    ""
  );
}

export function getSupabaseAnonServer() {
  const url = supabaseUrl();
  const key = supabaseAnonKey();
  if (!url || !key) {
    throw new Error("Variables Supabase manquantes");
  }

  return createClient(url, key, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
      detectSessionInUrl: false,
    },
  });
}

function alreadyRegistered(error) {
  const code = String(error?.code || "");
  const message = String(error?.message || "").toLowerCase();
  return (
    code === "email_exists" ||
    code === "user_already_exists" ||
    message.includes("already registered") ||
    message.includes("already been registered") ||
    message.includes("user already registered")
  );
}

function emailNotConfirmed(error) {
  const code = String(error?.code || "");
  const message = String(error?.message || "").toLowerCase();
  return code === "email_not_confirmed" || message.includes("email not confirmed");
}

export async function findAuthUserByEmail(admin, email) {
  const normalized = String(email || "").trim().toLowerCase();
  const url = supabaseUrl();
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) {
    throw new Error("Variables Supabase admin manquantes");
  }

  try {
    const response = await fetch(
      `${url}/auth/v1/admin/users?filter=${encodeURIComponent(normalized)}&page=1&per_page=50`,
      {
        headers: {
          Authorization: `Bearer ${key}`,
          apikey: key,
        },
      },
    );
    if (response.ok) {
      const payload = await response.json();
      const found = (payload.users || []).find(
        (user) => String(user.email || "").toLowerCase() === normalized,
      );
      if (found) return found;
    }
  } catch (error) {
    console.warn("findAuthUserByEmail filter:", error.message);
  }

  let page = 1;
  while (page <= 5) {
    const { data, error } = await admin.auth.admin.listUsers({
      page,
      perPage: 200,
    });
    if (error) throw error;
    const found = (data?.users || []).find(
      (user) => String(user.email || "").toLowerCase() === normalized,
    );
    if (found) return found;
    if (!data?.users?.length || data.users.length < 200) return null;
    page += 1;
  }

  return null;
}

export async function createConfirmedAuthUser(email, password) {
  const admin = getSupabaseAdmin();
  const { data, error } = await admin.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: { source: "espace_etudiant" },
  });

  if (!error) {
    return { user: data.user };
  }

  if (alreadyRegistered(error)) {
    return { exists: true };
  }

  return { error: error.message || "Impossible de créer le compte" };
}

export async function signInAuthUser(email, password) {
  const anon = getSupabaseAnonServer();
  const first = await anon.auth.signInWithPassword({ email, password });

  if (!first.error) {
    return { session: first.data.session, user: first.data.user };
  }

  if (!emailNotConfirmed(first.error)) {
    return { error: first.error };
  }

  const admin = getSupabaseAdmin();
  const pending = await findAuthUserByEmail(admin, email);
  if (!pending?.id) {
    return { error: first.error };
  }

  const { error: confirmError } = await admin.auth.admin.updateUserById(
    pending.id,
    { email_confirm: true },
  );
  if (confirmError) {
    return { error: confirmError };
  }

  const retry = await anon.auth.signInWithPassword({ email, password });
  if (retry.error) {
    return { error: retry.error };
  }

  return { session: retry.data.session, user: retry.data.user };
}

export function publicAuthError(error) {
  const code = String(error?.code || "");
  if (code === "invalid_credentials" || code === "user_not_found") {
    return "Email ou mot de passe incorrect.";
  }
  if (code === "email_not_confirmed") {
    return "Email non confirmé. Réessayez — le compte va être activé.";
  }
  if (code === "over_request_rate_limit") {
    return "Trop de tentatives. Réessayez dans quelques minutes.";
  }
  return error?.message || "Impossible de se connecter.";
}
