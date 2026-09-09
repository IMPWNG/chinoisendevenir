"use client";

import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { SITE_LANGS, siteTranslations } from "../i18n/site";

const SiteI18nContext = createContext(null);
const STORAGE_KEY = "site_lang";

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

export function SiteI18nProvider({ children }) {
  const [lang, setLangState] = useState("fr");

  useEffect(() => {
    const saved = window.localStorage.getItem(STORAGE_KEY);
    if (saved && siteTranslations[saved]) {
      setLangState(saved);
      return;
    }
    const browser = window.navigator.language?.slice(0, 2);
    if (browser && siteTranslations[browser]) setLangState(browser);
  }, []);

  useEffect(() => {
    document.documentElement.lang = lang;
  }, [lang]);

  const setLang = (next) => {
    if (!siteTranslations[next]) return;
    setLangState(next);
    window.localStorage.setItem(STORAGE_KEY, next);
  };

  const value = useMemo(() => {
    const dict = siteTranslations[lang] || siteTranslations.fr;
    const t = (path, vars) => {
      const fromLang = lookup(dict, path);
      const fromFr = lookup(siteTranslations.fr, path);
      const text = fromLang ?? fromFr ?? path;
      return interpolate(typeof text === "string" ? text : path, vars);
    };
    return { lang, setLang, t, dict };
  }, [lang]);

  return (
    <SiteI18nContext.Provider value={value}>{children}</SiteI18nContext.Provider>
  );
}

export function useSiteI18n() {
  const ctx = useContext(SiteI18nContext);
  if (!ctx) {
    throw new Error("useSiteI18n must be used inside SiteI18nProvider");
  }
  return ctx;
}

export { SITE_LANGS };
