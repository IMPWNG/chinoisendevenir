import { createClient } from "@supabase/supabase-js";
import { getSupabaseAdmin } from "./supabaseAdmin";

export function getSupabaseUrl() {
  return (
    process.env.SUPABASE_URL ||
    process.env.NEXT_PUBLIC_SUPABASE_URL ||
    process.env.VITE_SUPABASE_URL ||
    ""
  );
}

export function getSupabaseAnonKey() {
  return (
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
    process.env.VITE_SUPABASE_ANON_KEY ||
    ""
  );
}

export function getSupabaseAnonClient() {
  const url = getSupabaseUrl();
  const key = getSupabaseAnonKey();
  if (!url || !key) {
    throw new Error("Variables Supabase manquantes");
  }
  return createClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

export function normalizeAuthEmail(email) {
  return String(email || "")
    .trim()
    .toLowerCase();
}

export function isValidAuthEmail(email) {
  return Boolean(email) && email.includes("@") && email.length <= 254;
}

export function isValidAuthPassword(password) {
  const value = String(password || "");
  return value.length >= 8 && value.length <= 72;
}

export function isEmailNotConfirmedError(error) {
  const code = String(error?.code || "").toLowerCase();
  const message = String(error?.message || "").toLowerCase();
  return (
    code === "email_not_confirmed" ||
    message.includes("email not confirmed") ||
    message.includes("not confirmed")
  );
}

export function isAlreadyRegisteredError(error) {
  const code = String(error?.code || "").toLowerCase();
  const message = String(error?.message || "").toLowerCase();
  return (
    code === "user_already_exists" ||
    code === "email_exists" ||
    message.includes("already registered") ||
    message.includes("already been registered") ||
    message.includes("user already exists") ||
    message.includes("user already registered")
  );
}

export async function findAuthUserByEmail(admin, email) {
  const target = normalizeAuthEmail(email);
  for (let page = 1; page <= 10; page += 1) {
    const { data, error } = await admin.auth.admin.listUsers({
      page,
      perPage: 200,
    });
    if (error) throw error;
    const users = data?.users || [];
    const found = users.find(
      (user) => String(user.email || "").toLowerCase() === target,
    );
    if (found) return found;
    if (users.length < 200) return null;
  }
  return null;
}

export async function confirmAuthUserByEmail(admin, email) {
  const user = await findAuthUserByEmail(admin, email);
  if (!user?.id) return null;
  if (user.email_confirmed_at) return user;
  const { data, error } = await admin.auth.admin.updateUserById(user.id, {
    email_confirm: true,
  });
  if (error) throw error;
  return data?.user || user;
}

export async function createConfirmedAuthUser(email, password) {
  const admin = getSupabaseAdmin();
  const { data, error } = await admin.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
  });
  return { user: data?.user || null, error };
}

export async function signInWithPasswordServer(email, password) {
  const anon = getSupabaseAnonClient();
  return anon.auth.signInWithPassword({ email, password });
}
