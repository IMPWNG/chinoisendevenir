/**
 * Runnable check: public site language stays French for crawlers.
 * Run: npx tsx src/context/SiteI18nContext.check.ts
 */
import { resolvePublicLang } from "./SiteI18nContext";

function assert(cond: unknown, message: string): asserts cond {
  if (!cond) throw new Error(message);
}

assert(resolvePublicLang(null) === "fr", "no save → French");
assert(resolvePublicLang(undefined) === "fr", "undefined → French");
assert(resolvePublicLang("") === "fr", "empty → French");
assert(resolvePublicLang("fr") === "fr", "saved FR stays FR");
assert(resolvePublicLang("en") === "en", "explicit EN click is kept");
assert(resolvePublicLang("EN") === "fr", "case-sensitive: browser-style EN is ignored");
assert(resolvePublicLang("de") === "fr", "other locales never switch the public site");
assert(resolvePublicLang("zh") === "fr", "Chinese browser locale stays French");

console.log("site lang check ok: crawlers and unknown locales stay French");
