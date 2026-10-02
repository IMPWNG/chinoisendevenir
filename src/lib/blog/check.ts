/**
 * Runnable check: blog catalog integrity.
 * Run: npx tsx src/lib/blog/check.ts
 */
import {
  BLOG_POSTS,
  isPubliclyVisible,
  listAllPosts,
  listPublishedPosts,
  parisDateString,
} from "./index";

function assert(cond: unknown, message: string): asserts cond {
  if (!cond) throw new Error(message);
}

const slugs = new Set<string>();
assert(BLOG_POSTS.length === 20, `expected 20 posts, got ${BLOG_POSTS.length}`);

for (const post of listAllPosts()) {
  assert(post.slug && !slugs.has(post.slug), `duplicate/missing slug: ${post.slug}`);
  slugs.add(post.slug);
  assert(/^\d{4}-\d{2}-\d{2}$/.test(post.publishedAt), `bad date ${post.slug}`);
  assert(post.intro && post.intro.length >= 80, `intro too short: ${post.slug}`);
  assert(post.sections.length >= 4, `need sections: ${post.slug}`);
  assert(post.faqs.length >= 3, `need faqs: ${post.slug}`);
  assert(post.internalLinks.length >= 1, `need internal links: ${post.slug}`);
  assert(
    !/^(problème|solution|promesse)\b/i.test(post.intro.trim()),
    `intro labeled: ${post.slug}`,
  );
  for (const section of post.sections) {
    assert(
      !/^(problème|solution|promesse)\b/i.test(section.heading.trim()),
      `section labeled: ${post.slug} / ${section.heading}`,
    );
  }
}

const today = parisDateString();
const published = listPublishedPosts(today);
assert(published.length >= 1, "at least one post should be published by schedule start");
assert(
  !isPubliclyVisible(
    { publishedAt: "2099-01-01" } as (typeof BLOG_POSTS)[number],
    true,
    today,
  ),
  "future publishedAt must not look live",
);
assert(
  isPubliclyVisible(published[0], true, today),
  "live + date-due post is on site",
);
assert(
  !isPubliclyVisible(published[0], false, today),
  "hidden live flag is off site even if date is due",
);

console.log(
  `blog check ok: ${BLOG_POSTS.length} posts, ${published.length} published as of ${today} (Paris)`,
);
