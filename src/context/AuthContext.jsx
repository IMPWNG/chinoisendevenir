"use client";

import { studentSupabase } from "../lib/supabase";
import { createScopedAuth } from "./createScopedAuth";

const { AuthProvider, useScopedAuth } = createScopedAuth(studentSupabase, {
  allowRegister: true,
  resetPath: "/espace-etudiant/auth/callback?next=password",
});

export const StudentAuthProvider = AuthProvider;
export const useStudentAuth = useScopedAuth;
export { AuthProvider };
export const useAuth = useScopedAuth;
