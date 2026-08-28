import { SITE, SITEMAP_ROUTES } from "@/lib/seo";

export default function sitemap() {
  const lastModified = SITE.contentUpdatedAt;

  return SITEMAP_ROUTES.map((route) => ({
    url: route.path === "/" ? SITE.url : `${SITE.url}${route.path}`,
    lastModified,
    changeFrequency: route.changeFrequency,
    priority: route.priority,
  }));
}
