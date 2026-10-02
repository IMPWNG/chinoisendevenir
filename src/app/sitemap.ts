import type { MetadataRoute } from "next";
import { listLiveDbPosts } from "@/lib/blog/store";
import { buildSitemapEntries } from "@/lib/sitemap";

/** Request-time so today's blog post is listed without waiting for a deploy. */
export const dynamic = "force-dynamic";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const extra = await listLiveDbPosts();
  return buildSitemapEntries(undefined, extra);
}
