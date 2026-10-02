/**
 * Self-check for AI blog generation helpers.
 * Run: npx tsx src/lib/blog/generate.check.ts
 */
import { mergeBlogPosts } from "./index";
import {
  extractJsonObject,
  pickTopic,
  slugifyBlogTitle,
  validateGeneratedPost,
  BLOG_TOPICS,
} from "./generate";

function assert(cond: unknown, msg: string): asserts cond {
  if (!cond) throw new Error(msg);
}

assert(slugifyBlogTitle("Visa X1 étudiant") === "visa-x1-etudiant", "slugify accents");
assert(BLOG_TOPICS.length >= 20, "enough topics");

const first = pickTopic([]);
assert(first && first.slug === BLOG_TOPICS[0].slug, "pick first unused");
assert(pickTopic(BLOG_TOPICS.map((topic) => topic.slug)) === null, "pool exhausted");

const parsed = extractJsonObject('prefix {"intro":"ok","n":1} trailing');
assert(parsed.intro === "ok", "extract json object");

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
    internalLinks: [{ href: "/visa-etudiant-chine", label: "Visa" }],
  },
  { slug: "visa-test", title: "Visa test", context: "ctx" },
  "2026-10-02",
);
assert(post.slug === "visa-test", "validated slug");
assert(post.sections.length === 4, "sections kept");

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
    { slug: "x", title: "X", context: "c" },
    "2026-10-02",
  );
  throw new Error("expected labeled intro to fail");
} catch (error) {
  assert(
    error instanceof Error && /labelée|interdit/.test(error.message),
    "reject labeled copy",
  );
}

const merged = mergeBlogPosts(
  [{ slug: "a", title: "A", description: "", publishedAt: "2026-01-01", keywords: [], intro: "", sections: [], faqs: [], internalLinks: [], ctaTitle: "", ctaSubtitle: "" }],
  [
    { slug: "a", title: "dup", description: "", publishedAt: "2026-01-02", keywords: [], intro: "", sections: [], faqs: [], internalLinks: [], ctaTitle: "", ctaSubtitle: "" },
    { slug: "b", title: "B", description: "", publishedAt: "2026-01-03", keywords: [], intro: "", sections: [], faqs: [], internalLinks: [], ctaTitle: "", ctaSubtitle: "" },
  ],
);
assert(merged.map((item) => item.slug).join(",") === "a,b", "merge skips duplicate slug");

console.log("blog generate check ok");
