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
