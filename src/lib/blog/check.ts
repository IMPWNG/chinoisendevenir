/**
 * Runnable check: blog catalog integrity.
 * Run: npx tsx src/lib/blog/check.ts
 */
import {
  BLOG_POSTS,
  listAllPosts,
  listPublishedPosts,
  parisDateString,
} from "./index";

const ALLOWED_HREF =
  /^\/(etudier-en-chine|ecoles-de-langue-chine|bourses|visa-etudiant-chine|processus|faq|tarifs|contact|blog\/[a-z0-9-]+|#lead-form)$|^\/#lead-form$/;

function assert(cond: unknown, message: string): asserts cond {
  if (!cond) throw new Error(message);
}

const slugs = new Set<string>();
assert(BLOG_POSTS.length === 20, `expected 20 posts, got ${BLOG_POSTS.length}`);

for (const post of listAllPosts()) {
  assert(post.slug && !slugs.has(post.slug), `duplicate/missing slug: ${post.slug}`);
  slugs.add(post.slug);
  assert(/^\d{4}-\d{2}-\d{2}$/.test(post.publishedAt), `bad date ${post.slug}`);
  assert(post.problem.split(/\s+/).length >= 15, `problem too short: ${post.slug}`);
  assert(post.solution.split(/\s+/).length >= 15, `solution too short: ${post.slug}`);
  assert(post.promise.split(/\s+/).length >= 8, `promise too short: ${post.slug}`);
  assert(post.sections.length >= 3, `need sections: ${post.slug}`);
  assert(post.faqs.length >= 3, `need faqs: ${post.slug}`);
  assert(post.internalLinks.length >= 1, `need internal links: ${post.slug}`);
  for (const link of post.internalLinks) {
    assert(
      ALLOWED_HREF.test(link.href) || link.href.startsWith("/blog/"),
      `bad href ${link.href} in ${post.slug}`,
    );
  }
}

const today = parisDateString();
const published = listPublishedPosts(today);
assert(published.length >= 1, "at least one post should be published by schedule start");
assert(
  published.every((p) => p.publishedAt <= today),
  "published filter broken",
);

console.log(
  `blog check ok: ${BLOG_POSTS.length} posts, ${published.length} published as of ${today} (Paris)`,
);
