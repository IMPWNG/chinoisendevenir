"use client";

import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { SITE_LANGS, siteTranslations, type SiteCopy, type SiteLang } from "../i18n/site";
import { withCfaDeep, withCfaInText } from "../lib/money";

type TranslateVars = Record<string, string | number>;

export type SiteI18nValue = {
  lang: SiteLang;
  setLang: (next: SiteLang) => void;
  t: (path: string, vars?: TranslateVars) => string;
  dict: SiteCopy;
};

const SiteI18nContext = createContext<SiteI18nValue | null>(null);
const STORAGE_KEY = "site_lang";

function isSiteLang(value: string): value is SiteLang {
  return value in siteTranslations;
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

export function SiteI18nProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<SiteLang>("fr");

  useEffect(() => {
    const saved = window.localStorage.getItem(STORAGE_KEY);
    if (saved && isSiteLang(saved)) {
      setLangState(saved);
      return;
    }
    const browser = window.navigator.language?.slice(0, 2);
    if (browser && isSiteLang(browser)) setLangState(browser);
  }, []);

  useEffect(() => {
    document.documentElement.lang = lang;
  }, [lang]);

  const setLang = (next: SiteLang) => {
    if (!isSiteLang(next)) return;
    setLangState(next);
    window.localStorage.setItem(STORAGE_KEY, next);
  };

  const value = useMemo<SiteI18nValue>(() => {
    const dict = withCfaDeep(siteTranslations[lang] || siteTranslations.fr);
    const frDict = lang === "fr" ? dict : withCfaDeep(siteTranslations.fr);
    const t = (path: string, vars?: TranslateVars) => {
      const fromLang = lookup(dict, path);
      const fromFr = lookup(frDict, path);
      const text = fromLang ?? fromFr ?? path;
      return withCfaInText(
        interpolate(typeof text === "string" ? text : path, vars),
      );
    };
    return { lang, setLang, t, dict };
  }, [lang]);

  return (
    <SiteI18nContext.Provider value={value}>{children}</SiteI18nContext.Provider>
  );
}

export function useSiteI18n(): SiteI18nValue {
  const ctx = useContext(SiteI18nContext);
  if (!ctx) {
    throw new Error("useSiteI18n must be used inside SiteI18nProvider");
  }
  return ctx;
}

export { SITE_LANGS };
