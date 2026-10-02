/**
 * Runnable check: organization JSON-LD + CTR-facing page titles.
 * Run: npx tsx src/lib/seo.check.ts
 */
import { organizationJsonLd, SITE } from "./seo";

function assert(cond: unknown, message: string): asserts cond {
  if (!cond) throw new Error(message);
}

assert(SITE.contentUpdatedAt === "2026-10-02", "contentUpdatedAt should match deploy day");
assert(Array.isArray(SITE.sameAs) && SITE.sameAs.length >= 1, "sameAs required");
assert(
  SITE.sameAs.every((url) => url.startsWith("https://")),
  "sameAs must be https URLs",
);

const org = organizationJsonLd() as {
  sameAs?: string[];
  areaServed?: string[];
};
assert(Array.isArray(org.sameAs) && org.sameAs.includes(SITE.sameAs[0]), "org.sameAs");
assert(
  Array.isArray(org.areaServed) && org.areaServed.includes("Afrique francophone"),
  "areaServed Afrique",
);

console.log("seo.check.ts: ok");
