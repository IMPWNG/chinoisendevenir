/**
 * Self-check for AI blog generation helpers.
 * Run: npx tsx src/lib/blog/generate.check.ts
 */
import { BLOG_POSTS, mergeBlogPosts } from "./index";
import {
  BLOG_DAILY_LIMIT,
  BLOG_TOPICS,
  extractJsonObject,
  mergeInternalLinks,
  pickTopic,
  requiredInternalLinks,
  slugifyBlogTitle,
  topicAlreadyCovered,
  validateGeneratedPost,
} from "./generate";

function assert(cond: unknown, msg: string): asserts cond {
  if (!cond) throw new Error(msg);
}

assert(slugifyBlogTitle("Visa X1 étudiant") === "visa-x1-etudiant", "slugify accents");
assert(BLOG_DAILY_LIMIT === 1, "one AI article per day");
assert(BLOG_TOPICS.length >= 7, "focused topic pool");
assert(
  BLOG_TOPICS.every((topic) => topic.pillars.length === 2 && topic.cta),
  "each topic has 2 pillars and a conversion link",
);

const fileSlugs = BLOG_POSTS.map((post) => post.slug);
const first = pickTopic(fileSlugs, BLOG_TOPICS, BLOG_POSTS.map((post) => post.title));
assert(first && first.slug === "calendrier-csc-2027", "first unused is CSC 2027");
assert(
  pickTopic(BLOG_TOPICS.map((topic) => topic.slug)) === null,
  "pool exhausted",
);
assert(
  topicAlreadyCovered(BLOG_TOPICS[0], [BLOG_TOPICS[0].slug]),
  "same slug is covered",
);

const parsed = extractJsonObject('prefix {"intro":"ok","n":1} trailing');
assert(parsed.intro === "ok", "extract json object");

const brief = {
  slug: "visa-test",
  title: "Visa test",
  context: "ctx",
  pillars: ["/visa-etudiant-chine", "/processus"] as [string, string],
  cta: "/tarifs" as const,
};
const post = validateGeneratedPost(
  {
    description: "Meta",
    keywords: ["visa"],
    intro: "A".repeat(90),
    sections: [
      { heading: "Les documents", paragraphs: ["un", "deux"] },
      { heading: "Les délais", paragraphs: ["un"] },
      { heading: "À l’arrivée", paragraphs: ["un"] },
      { heading: "Ensuite", paragraphs: ["un"] },
    ],
    faqs: [
      { question: "Q1", answer: "A1" },
      { question: "Q2", answer: "A2" },
      { question: "Q3", answer: "A3" },
    ],
    internalLinks: [{ href: "/faq", label: "FAQ" }],
  },
  brief,
  "2026-10-02",
);
assert(post.slug === "visa-test", "validated slug");
assert(
  post.internalLinks.some((link) => link.href === "/visa-etudiant-chine") &&
    post.internalLinks.some((link) => link.href === "/processus") &&
    post.internalLinks.some((link) => link.href === "/tarifs"),
  "required cluster links injected",
);

const required = requiredInternalLinks(BLOG_TOPICS[0]);
assert(required.length === 3, "2 pillars + conversion");
const merged = mergeInternalLinks(
  [{ href: "/blog/etudier-en-chine-2026-guide", label: "Guide 2026" }],
  required,
);
assert(merged[0].href === required[0].href, "required links first");

try {
  validateGeneratedPost(
    {
      intro: "Problème : trop court mais assez " + "x".repeat(80),
      sections: [
        { heading: "Problème", paragraphs: ["a"] },
        { heading: "B", paragraphs: ["a"] },
        { heading: "C", paragraphs: ["a"] },
        { heading: "D", paragraphs: ["a"] },
      ],
      faqs: [
        { question: "Q1", answer: "A1" },
        { question: "Q2", answer: "A2" },
        { question: "Q3", answer: "A3" },
      ],
      internalLinks: [{ href: "/faq", label: "FAQ" }],
    },
    brief,
    "2026-10-02",
  );
  throw new Error("expected labeled intro to fail");
} catch (error) {
  assert(
    error instanceof Error && /labelée|interdit/.test(error.message),
    "reject labeled copy",
  );
}

const catalog = mergeBlogPosts(
  [{ slug: "a", title: "A", description: "", publishedAt: "2026-01-01", keywords: [], intro: "", sections: [], faqs: [], internalLinks: [], ctaTitle: "", ctaSubtitle: "" }],
  [
    { slug: "a", title: "dup", description: "", publishedAt: "2026-01-02", keywords: [], intro: "", sections: [], faqs: [], internalLinks: [], ctaTitle: "", ctaSubtitle: "" },
    { slug: "b", title: "B", description: "", publishedAt: "2026-01-03", keywords: [], intro: "", sections: [], faqs: [], internalLinks: [], ctaTitle: "", ctaSubtitle: "" },
  ],
);
assert(catalog.map((item) => item.slug).join(",") === "a,b", "merge skips duplicate slug");

console.log("blog generate check ok");
