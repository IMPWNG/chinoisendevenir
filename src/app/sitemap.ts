import { listPublishedPosts } from "@/lib/blog";
import { SITE, SITEMAP_ROUTES } from "@/lib/seo";

export default function sitemap() {
  const lastModified = SITE.contentUpdatedAt;
  const staticEntries = SITEMAP_ROUTES.map((route) => ({
    url: route.path === "/" ? SITE.url : `${SITE.url}${route.path}`,
    lastModified,
    changeFrequency: route.changeFrequency,
    priority: route.priority,
  }));

  const blogIndex = {
    url: `${SITE.url}/blog`,
    lastModified,
    changeFrequency: "daily" as const,
    priority: 0.85,
  };

  const articles = listPublishedPosts().map((post) => ({
    url: `${SITE.url}/blog/${post.slug}`,
    lastModified: post.publishedAt,
    changeFrequency: "monthly" as const,
    priority: 0.7,
  }));

  return [...staticEntries, blogIndex, ...articles];
}
