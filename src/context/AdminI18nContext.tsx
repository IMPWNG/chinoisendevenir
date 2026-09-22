"use client";

import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { adminTranslations, type AdminLang } from "../i18n/admin";
import { withCfaInText } from "../lib/money";

type TranslateVars = Record<string, string | number>;

export type AdminI18nValue = {
  lang: AdminLang;
  setLang: (next: AdminLang) => void;
  t: (path: string, vars?: TranslateVars) => string;
};

const AdminI18nContext = createContext<AdminI18nValue | null>(null);
const STORAGE_KEY = "admin_lang";

function isAdminLang(value: string): value is AdminLang {
  return value in adminTranslations;
}

function lookup(dict: unknown, path: string): unknown {
  return path.split(".").reduce<unknown>((acc, key) => {
    if (acc && typeof acc === "object" && key in acc) {
      return (acc as Record<string, unknown>)[key];
    }
    return undefined;
  }, dict);
}

function interpolate(text: string, vars?: TranslateVars): string {
  if (!vars) return text;
  return Object.entries(vars).reduce(
    (acc, [key, value]) => acc.replaceAll(`{${key}}`, String(value)),
    text,
  );
}

export function AdminI18nProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<AdminLang>("fr");

  useEffect(() => {
    const saved = window.localStorage.getItem(STORAGE_KEY);
    if (saved && isAdminLang(saved)) setLangState(saved);
  }, []);

  const setLang = (next: AdminLang) => {
    if (!isAdminLang(next)) return;
    setLangState(next);
    window.localStorage.setItem(STORAGE_KEY, next);
  };

  const value = useMemo<AdminI18nValue>(() => {
    const t = (path: string, vars?: TranslateVars) => {
      const fromLang = lookup(adminTranslations[lang], path);
      const fromFr = lookup(adminTranslations.fr, path);
      const text = fromLang || fromFr || path;
      return withCfaInText(
        interpolate(typeof text === "string" ? text : path, vars),
      );
    };
    return { lang, setLang, t };
  }, [lang]);

  return (
    <AdminI18nContext.Provider value={value}>
      {children}
    </AdminI18nContext.Provider>
  );
}

export function useAdminI18n(): AdminI18nValue {
  const ctx = useContext(AdminI18nContext);
  if (!ctx) {
    throw new Error("useAdminI18n must be used inside AdminI18nProvider");
  }
  return ctx;
}
