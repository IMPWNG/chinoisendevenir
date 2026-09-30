/**
 * Runnable check: public sitemap entries.
 * Run: npx tsx src/lib/sitemap.check.ts
 */
import { listPublishedPosts } from "./blog";
import { SITE, SITEMAP_ROUTES } from "./seo";
import { buildSitemapEntries, pageUrl } from "./sitemap";

function assert(cond: unknown, message: string): asserts cond {
  if (!cond) throw new Error(message);
}

const today = "2026-09-30";
const entries = buildSitemapEntries(today);
const urls = entries.map((entry) => entry.url);

assert(new Set(urls).size === urls.length, "duplicate sitemap urls");
assert(
  urls.every((url) => url.startsWith(`${SITE.url}/`) || url === SITE.url),
  "sitemap urls must be absolute https://chinoisendevenir.com",
);
assert(
  !urls.some(
    (url) =>
      url.includes("/admin") ||
      url.includes("/espace-etudiant") ||
      url.includes("/api") ||
      url.endsWith("/about"),
  ),
  "private or redirect urls must stay out of the sitemap",
);

for (const route of SITEMAP_ROUTES) {
  assert(urls.includes(pageUrl(route.path)), `missing static page ${route.path}`);
}

assert(urls.includes(pageUrl("/blog")), "missing /blog");

const published = listPublishedPosts(today);
assert(published.length >= 1, "expected published posts on 2026-09-30");
for (const post of published) {
  assert(
    urls.includes(pageUrl(`/blog/${post.slug}`)),
    `missing published article ${post.slug}`,
  );
}

const future = listPublishedPosts("2026-10-05").filter(
  (post) => post.publishedAt > today,
);
assert(future.length >= 1, "fixture needs at least one unpublished post");
for (const post of future) {
  assert(
    !urls.includes(pageUrl(`/blog/${post.slug}`)),
    `unpublished article leaked: ${post.slug}`,
  );
}

const beforeBlog = buildSitemapEntries("2026-09-14");
assert(
  beforeBlog.some((entry) => entry.url === pageUrl("/blog")),
  "blog index stays listed before the first article",
);
assert(
  beforeBlog.filter((entry) => entry.url.includes("/blog/")).length === 0,
  "no article urls before the first publishedAt",
);

const firstDay = buildSitemapEntries("2026-09-15");
assert(
  firstDay.some((entry) =>
    entry.url.endsWith("/blog/etudier-en-chine-2026-guide"),
  ),
  "first article appears on its publishedAt day",
);

const blogIndex = entries.find((entry) => entry.url === pageUrl("/blog"));
assert(blogIndex, "blog index entry");
assert(
  blogIndex.lastModified.toISOString().startsWith("2026-09-30"),
  `blog lastmod should follow the latest published post, got ${blogIndex.lastModified.toISOString()}`,
);

console.log(`sitemap check ok: ${entries.length} urls as of ${today}`);
