"use client";

import { adminSupabase } from "../lib/supabase";
import { createScopedAuth } from "./createScopedAuth";

const { AuthProvider, useScopedAuth } = createScopedAuth(adminSupabase, {
  allowRegister: false,
});

export const AdminAuthProvider = AuthProvider;
export const useAdminAuth = useScopedAuth;
