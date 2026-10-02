import { BLOG_POSTS } from "./posts";
import type { BlogPost } from "./types";

export type { BlogPost, BlogFaq, BlogLink, BlogSection } from "./types";
export { BLOG_POSTS } from "./posts";

/** Calendar YYYY-MM-DD in Europe/Paris. */
export function parisDateString(date: Date = new Date()): string {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "Europe/Paris",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(date);
}

export function isPublished(
  post: BlogPost,
  today: string = parisDateString(),
): boolean {
  return post.publishedAt <= today;
}

/** On the public /blog: date gate plus optional admin live flag. */
export function isPubliclyVisible(
  post: BlogPost,
  live: boolean = true,
  today: string = parisDateString(),
): boolean {
  return live && isPublished(post, today);
}

export function listAllPosts(): BlogPost[] {
  return [...BLOG_POSTS].sort((a, b) =>
    a.publishedAt === b.publishedAt
      ? a.slug.localeCompare(b.slug)
      : a.publishedAt < b.publishedAt
        ? -1
        : 1,
  );
}

export function listPublishedPosts(
  today: string = parisDateString(),
): BlogPost[] {
  return listAllPosts().filter((post) => isPublished(post, today));
}

export function getPostBySlug(slug: string): BlogPost | undefined {
  return BLOG_POSTS.find((post) => post.slug === slug);
}

export function getPublishedPostBySlug(
  slug: string,
  today: string = parisDateString(),
): BlogPost | undefined {
  const post = getPostBySlug(slug);
  if (!post || !isPublished(post, today)) return undefined;
  return post;
}

export function blogPath(slug: string): string {
  return `/blog/${slug}`;
}

export function mergeBlogPosts(base: BlogPost[], extra: BlogPost[]): BlogPost[] {
  const seen = new Set(base.map((post) => post.slug));
  const added = extra.filter((post) => post.slug && !seen.has(post.slug));
  return [...base, ...added].sort((a, b) =>
    a.publishedAt === b.publishedAt
      ? a.slug.localeCompare(b.slug)
      : a.publishedAt < b.publishedAt
        ? -1
        : 1,
  );
}

export function listPublishedMerged(
  extra: BlogPost[],
  today: string = parisDateString(),
): BlogPost[] {
  return mergeBlogPosts(listAllPosts(), extra).filter((post) =>
    isPublished(post, today),
  );
}

export function getPublishedMergedBySlug(
  slug: string,
  extra: BlogPost[],
  today: string = parisDateString(),
): BlogPost | undefined {
  return listPublishedMerged(extra, today).find((post) => post.slug === slug);
}
