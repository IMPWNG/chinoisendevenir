import { SITE } from "@/lib/seo";

const AI_BOTS = [
  "GPTBot",
  "ChatGPT-User",
  "OAI-SearchBot",
  "ClaudeBot",
  "anthropic-ai",
  "Google-Extended",
  "Google-CloudVertexBot",
  "PerplexityBot",
  "Applebot-Extended",
  "CCBot",
  "meta-externalagent",
  "Bytespider",
  "Amazonbot",
];

export default function robots() {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/admin", "/espace-etudiant", "/api"],
      },
      ...AI_BOTS.map((userAgent) => ({
        userAgent,
        allow: "/",
        disallow: ["/admin", "/espace-etudiant", "/api"],
      })),
    ],
    sitemap: `${SITE.url}/sitemap.xml`,
    host: SITE.url,
    other: {
      "llms-txt": `${SITE.url}/llms.txt`,
      "llms-full-txt": `${SITE.url}/llms-full.txt`,
    },
  };
}
