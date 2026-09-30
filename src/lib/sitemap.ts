import { listPublishedPosts, parisDateString } from "./blog";
import { SITE, SITEMAP_ROUTES } from "./seo";

export type SitemapEntry = {
  url: string;
  lastModified: Date;
  changeFrequency:
    | "always"
    | "hourly"
    | "daily"
    | "weekly"
    | "monthly"
    | "yearly"
    | "never";
  priority: number;
};

export function pageUrl(path: string): string {
  return path === "/" ? SITE.url : `${SITE.url}${path}`;
}

/** Paris calendar day → Date, noon UTC+2 so lastmod does not slip to the previous day. */
export function sitemapDate(isoDay: string): Date {
  return new Date(`${isoDay}T12:00:00+02:00`);
}

export function buildSitemapEntries(
  today: string = parisDateString(),
): SitemapEntry[] {
  const posts = listPublishedPosts(today);
  const latestPostDay = posts.reduce(
    (latest, post) => (post.publishedAt > latest ? post.publishedAt : latest),
    SITE.contentUpdatedAt,
  );
  const staticDay = sitemapDate(SITE.contentUpdatedAt);

  const staticEntries: SitemapEntry[] = SITEMAP_ROUTES.map((route) => ({
    url: pageUrl(route.path),
    lastModified: staticDay,
    changeFrequency: route.changeFrequency,
    priority: route.priority,
  }));

  const blogIndex: SitemapEntry = {
    url: pageUrl("/blog"),
    lastModified: sitemapDate(latestPostDay),
    changeFrequency: "daily",
    priority: 0.85,
  };

  const articles: SitemapEntry[] = posts.map((post) => ({
    url: pageUrl(`/blog/${post.slug}`),
    lastModified: sitemapDate(post.publishedAt),
    changeFrequency: "monthly",
    priority: 0.7,
  }));

  return [...staticEntries, blogIndex, ...articles];
}
