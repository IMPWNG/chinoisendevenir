"use client";

import { createContext, useContext, useEffect, useState } from "react";

const emptyAuth = {
  user: null,
  loading: true,
  signIn: async () => ({ error: new Error("Auth indisponible") }),
  signUp: async () => ({ data: null, error: new Error("Auth indisponible") }),
  signOut: async () => {},
  resetPassword: async () => ({ error: new Error("Auth indisponible") }),
};

export function createScopedAuth(client, { allowRegister = false, resetPath } = {}) {
  const AuthContext = createContext(emptyAuth);

  async function applySession(accessToken, refreshToken) {
    return client.auth.setSession({
      access_token: accessToken,
      refresh_token: refreshToken,
    });
  }

  function AuthProvider({ children }) {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
      let cancelled = false;

      client.auth
        .getSession()
        .then(({ data: { session } }) => {
          if (!cancelled) setUser(session?.user ?? null);
        })
        .catch((error) => {
          console.error("session:", error);
          if (!cancelled) setUser(null);
        })
        .finally(() => {
          if (!cancelled) setLoading(false);
        });

      const {
        data: { subscription },
      } = client.auth.onAuthStateChange((_event, session) => {
        if (!cancelled) setUser(session?.user ?? null);
      });

      return () => {
        cancelled = true;
        subscription.unsubscribe();
      };
    }, []);

    const signIn = async (email, password) => {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const payload = await response.json().catch(() => ({}));
      if (!response.ok) {
        return {
          data: { user: null, session: null },
          error: new Error(payload.error || "Email ou mot de passe incorrect."),
        };
      }

      const applied = await applySession(
        payload.access_token,
        payload.refresh_token,
      );
      if (applied.error) {
        return { data: { user: null, session: null }, error: applied.error };
      }

      setUser(applied.data?.session?.user ?? applied.data?.user ?? null);

      return {
        data: applied.data,
        error: null,
      };
    };

    const signUp = async (email, password) => {
      if (!allowRegister) {
        return {
          data: { user: null, session: null },
          error: new Error("Inscription indisponible."),
        };
      }

      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const payload = await response.json().catch(() => ({}));
      if (!response.ok && response.status !== 409) {
        return {
          data: { user: null, session: null },
          error: new Error(payload.error || "Impossible de créer le compte."),
        };
      }

      const signed = await signIn(email, password);
      if (signed.error && response.status === 409) {
        return {
          data: { user: null, session: null },
          error: new Error(
            "Un compte existe déjà avec cet email. Connectez-vous.",
          ),
        };
      }
      return signed;
    };

    const signOut = async () => {
      await client.auth.signOut();
      setUser(null);
    };

    const resetPassword = (email) => {
      if (!resetPath) {
        return Promise.resolve({
          error: new Error("Réinitialisation indisponible."),
        });
      }
      return client.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}${resetPath}`,
      });
    };

    return (
      <AuthContext.Provider
        value={{ user, loading, signIn, signUp, signOut, resetPassword }}
      >
        {children}
      </AuthContext.Provider>
    );
  }

  const useScopedAuth = () => useContext(AuthContext);

  return { AuthProvider, useScopedAuth };
}
