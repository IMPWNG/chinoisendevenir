import type { MetadataRoute } from "next";
import { buildSitemapEntries } from "@/lib/sitemap";

/** Request-time so today's blog post is listed without waiting for a deploy. */
export const dynamic = "force-dynamic";

export default function sitemap(): MetadataRoute.Sitemap {
  return buildSitemapEntries();
}
