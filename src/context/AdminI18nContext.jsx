"use client";

import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { adminTranslations } from "../i18n/admin";

const AdminI18nContext = createContext(null);
const STORAGE_KEY = "admin_lang";

function lookup(dict, path) {
  return path.split(".").reduce((acc, key) => acc?.[key], dict);
}

function interpolate(text, vars) {
  if (!vars) return text;
  return Object.entries(vars).reduce(
    (acc, [key, value]) => acc.replaceAll(`{${key}}`, String(value)),
    text,
  );
}

export function AdminI18nProvider({ children }) {
  const [lang, setLangState] = useState("fr");

  useEffect(() => {
    const saved = window.localStorage.getItem(STORAGE_KEY);
    if (saved && adminTranslations[saved]) setLangState(saved);
  }, []);

  const setLang = (next) => {
    setLangState(next);
    window.localStorage.setItem(STORAGE_KEY, next);
  };

  const value = useMemo(() => {
    const t = (path, vars) => {
      const fromLang = lookup(adminTranslations[lang], path);
      const fromFr = lookup(adminTranslations.fr, path);
      const text = fromLang || fromFr || path;
      return interpolate(typeof text === "string" ? text : path, vars);
    };
    return { lang, setLang, t };
  }, [lang]);

  return (
    <AdminI18nContext.Provider value={value}>
      {children}
    </AdminI18nContext.Provider>
  );
}

export function useAdminI18n() {
  const ctx = useContext(AdminI18nContext);
  if (!ctx) {
    throw new Error("useAdminI18n must be used inside AdminI18nProvider");
  }
  return ctx;
}
