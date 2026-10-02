import type { BlogPost, BlogFaq, BlogLink, BlogSection } from "./types";
import { BLOG_POSTS, parisDateString } from "./index";
import {
  countAiPostsOn,
  insertStoredPost,
  listStoredPosts,
} from "./store";

export const BLOG_DAILY_LIMIT = 1;

export const BLOG_PILLARS = [
  "/etudier-en-chine",
  "/ecoles-de-langue-chine",
  "/bourses",
  "/visa-etudiant-chine",
  "/processus",
] as const;

export const BLOG_CONVERSION_HREFS = ["/tarifs", "/contact", "/#lead-form"] as const;

const PILLAR_LABEL: Record<string, string> = {
  "/etudier-en-chine": "Guide : étudier en Chine",
  "/ecoles-de-langue-chine": "Écoles de langue en Chine",
  "/bourses": "Bourses d'études en Chine",
  "/visa-etudiant-chine": "Visa étudiant pour la Chine",
  "/processus": "Processus d'admission",
};

const CONVERSION_LABEL: Record<string, string> = {
  "/tarifs": "Formules d'accompagnement",
  "/contact": "Nous écrire",
  "/#lead-form": "Évaluer mon projet",
};

export type BlogTopic = {
  slug: string;
  title: string;
  context: string;
  pillars: [string, string];
  cta: (typeof BLOG_CONVERSION_HREFS)[number];
};

export const BLOG_TOPICS: BlogTopic[] = [
  {
    slug: "calendrier-csc-2027",
    title: "Calendrier CSC 2027 : dates, voies et pièces à anticiper",
    context:
      "Calendrier type 2026–2027 de la bourse du gouvernement chinois (CSC) : fenêtres de dépôt, voies université / ambassade, pièces qui bloquent. Aucune date n'est garantie : renvoyer vers les sources officielles. Pas de promesse d'obtention.",
    pillars: ["/bourses", "/etudier-en-chine"],
    cta: "/tarifs",
  },
  {
    slug: "visa-x1-senegal-etudes-chine",
    title: "Visa X1 depuis le Sénégal : consulat, pièces et délais",
    context:
      "Demande de visa X1 au Sénégal : où déposer, JW201/JW202, photo, passeport, délais typiques. La délivrance appartient au consulat. Relier au guide visa et au processus.",
    pillars: ["/visa-etudiant-chine", "/processus"],
    cta: "/#lead-form",
  },
  {
    slug: "visa-x1-cote-ivoire-etudes-chine",
    title: "Visa X1 depuis la Côte d'Ivoire : consulat, pièces et délais",
    context:
      "Demande de visa X1 en Côte d'Ivoire : dépôt, documents, délais. Pas de garantie d'obtention. Relier au guide visa et au processus.",
    pillars: ["/visa-etudiant-chine", "/processus"],
    cta: "/#lead-form",
  },
  {
    slug: "visa-x1-france-etudes-chine",
    title: "Visa X1 depuis la France : centre des visas, pièces et délais",
    context:
      "Demande de visa X1 en France : centre des visas, JW201/JW202, photo, passeport, délais. Décision consulaire. Relier au guide visa et au processus.",
    pillars: ["/visa-etudiant-chine", "/processus"],
    cta: "/tarifs",
  },
  {
    slug: "visa-x1-maroc-etudes-chine",
    title: "Visa X1 depuis le Maroc : consulat, pièces et délais",
    context:
      "Demande de visa X1 au Maroc : dépôt, documents, délais. Pas de garantie d'obtention. Relier au guide visa et au processus.",
    pillars: ["/visa-etudiant-chine", "/processus"],
    cta: "/#lead-form",
  },
  {
    slug: "hsk-4-avant-licence-en-chine",
    title: "HSK 4 avant une licence en Chine : quand c'est utile, quand ça ne l'est pas",
    context:
      "Le HSK 4 n'est pas un seuil unique. Distinguer licence en chinois, licence en anglais, et année de langue. Sans inventer d'exigence officielle unique. Relier aux écoles de langue et au guide étudier en Chine.",
    pillars: ["/ecoles-de-langue-chine", "/etudier-en-chine"],
    cta: "/tarifs",
  },
  {
    slug: "cout-reel-etudiant-shanghai-vs-wuhan",
    title: "Coût réel étudiant : Shanghai vs Wuhan",
    context:
      "Comparer logement, repas, transport et premier mois à Shanghai et à Wuhan, avec fourchettes prudentes. Ni palmarès ni garantie de budget. Relier au guide étudier en Chine et au processus.",
    pillars: ["/etudier-en-chine", "/processus"],
    cta: "/tarifs",
  },
];

const SYSTEM = `Tu es un rédacteur SEO francophone senior pour Chinois en Devenir (https://chinoisendevenir.com), agence d'accompagnement pour étudier en Chine.
Règles absolues:
- Tu n'es PAS une université ni le CSC. Ne promets JAMAIS admission, bourse, visa, logement ou emploi.
- Français clair, concret, utile. Pas de jargon marketing vide. Pas de stats inventées (fourchettes prudentes OK).
- Structure narrative INTERNE: d'abord le problème du lecteur, puis la solution concrète, puis une promesse réaliste — SANS jamais écrire les mots "Problème", "Solution" ou "Promesse" comme titres ou labels.
- Article COMPLET: intro 80–120 mots, puis 5 à 7 sections H2 riches (2–4 paragraphes chacune, listes si utile), 4–5 FAQ utiles.
- Liens internes OBLIGATOIRES dans internalLinks: les 2 pages piliers indiquées dans le brief, PLUS un lien /tarifs ou /#lead-form (ou /contact). Tu peux ajouter 1–2 liens /blog/<slug> utiles. Pas d'article orphelin.
- Réponds UNIQUEMENT par un objet JSON valide (pas de markdown, pas de fences).`;

export function slugifyBlogTitle(value: string) {
  return String(value || "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
}

export function topicAlreadyCovered(
  topic: BlogTopic,
  usedSlugs: Iterable<string>,
  usedTitles: Iterable<string> = [],
) {
  const slugs = new Set([...usedSlugs].map(String));
  if (slugs.has(topic.slug)) return true;
  const titleSlug = slugifyBlogTitle(topic.title);
  if (titleSlug && slugs.has(titleSlug)) return true;
  for (const title of usedTitles) {
    const other = slugifyBlogTitle(title);
    if (other && (other === topic.slug || other === titleSlug)) return true;
  }
  return false;
}

export function pickTopic(
  usedSlugs: Iterable<string>,
  topics: BlogTopic[] = BLOG_TOPICS,
  usedTitles: Iterable<string> = [],
) {
  return (
    topics.find((topic) => !topicAlreadyCovered(topic, usedSlugs, usedTitles)) ||
    null
  );
}

export function requiredInternalLinks(topic: BlogTopic): BlogLink[] {
  return [
    { href: topic.pillars[0], label: PILLAR_LABEL[topic.pillars[0]] || topic.pillars[0] },
    { href: topic.pillars[1], label: PILLAR_LABEL[topic.pillars[1]] || topic.pillars[1] },
    { href: topic.cta, label: CONVERSION_LABEL[topic.cta] || topic.cta },
  ];
}

export function mergeInternalLinks(generated: BlogLink[], required: BlogLink[]) {
  const seen = new Set<string>();
  const out: BlogLink[] = [];
  for (const link of [...required, ...generated]) {
    if (!link.href.startsWith("/") || !link.label || seen.has(link.href)) continue;
    seen.add(link.href);
    out.push(link);
  }
  return out.slice(0, 6);
}

function hasClusterLinks(links: BlogLink[], topic: BlogTopic) {
  const hrefs = new Set(links.map((link) => link.href));
  const pillarsOk = topic.pillars.every((href) => hrefs.has(href));
  const conversionOk = BLOG_CONVERSION_HREFS.some((href) => hrefs.has(href));
  return pillarsOk && conversionOk;
}

export function extractJsonObject(text: string): Record<string, unknown> {
  const raw = String(text || "").trim();
  const fence = raw.match(/```(?:json)?\s*([\s\S]*?)```/);
  const body = fence ? fence[1].trim() : raw;
  const start = body.indexOf("{");
  const end = body.lastIndexOf("}");
  if (start < 0 || end <= start) throw new Error("JSON introuvable");
  const parsed: unknown = JSON.parse(body.slice(start, end + 1));
  if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) {
    throw new Error("JSON invalide");
  }
  return parsed as Record<string, unknown>;
}

function asStringArray(value: unknown) {
  return Array.isArray(value) ? value.map((item) => String(item || "").trim()).filter(Boolean) : [];
}

export function validateGeneratedPost(
  raw: Record<string, unknown>,
  brief: BlogTopic,
  publishedAt: string,
): BlogPost {
  const intro = String(raw.intro || "").trim();
  if (intro.length < 80) throw new Error("intro trop courte");
  const sections = Array.isArray(raw.sections) ? raw.sections : [];
  if (sections.length < 4) throw new Error("besoin de ≥4 sections");
  const normalizedSections: BlogSection[] = sections.map((item) => {
    const section = item && typeof item === "object" ? (item as Record<string, unknown>) : {};
    const heading = String(section.heading || "").trim();
    const paragraphs = asStringArray(section.paragraphs);
    if (!heading || paragraphs.length < 1) throw new Error(`section faible: ${heading}`);
    const bullets = asStringArray(section.bullets);
    return bullets.length ? { heading, paragraphs, bullets } : { heading, paragraphs };
  });
  const faqs: BlogFaq[] = (Array.isArray(raw.faqs) ? raw.faqs : [])
    .map((item) => {
      const row = item && typeof item === "object" ? (item as Record<string, unknown>) : {};
      return {
        question: String(row.question || "").trim(),
        answer: String(row.answer || "").trim(),
      };
    })
    .filter((item) => item.question && item.answer);
  if (faqs.length < 3) throw new Error("besoin de ≥3 FAQ");
  const internalLinks: BlogLink[] = (Array.isArray(raw.internalLinks) ? raw.internalLinks : [])
    .map((item) => {
      const row = item && typeof item === "object" ? (item as Record<string, unknown>) : {};
      return {
        href: String(row.href || "").trim(),
        label: String(row.label || "").trim(),
      };
    })
    .filter((item) => item.href.startsWith("/") && item.label);
  if (internalLinks.length < 1) throw new Error("besoin de liens internes");
  const clustered = mergeInternalLinks(internalLinks, requiredInternalLinks(brief));
  if (!hasClusterLinks(clustered, brief)) {
    throw new Error("liens piliers ou conversion manquants");
  }
  const banned = /^(problème|solution|promesse)\b/i;
  if (banned.test(intro)) throw new Error("intro labelée");
  for (const section of normalizedSections) {
    if (banned.test(section.heading)) throw new Error(`titre interdit: ${section.heading}`);
  }
  const slug = slugifyBlogTitle(brief.slug || String(raw.slug || brief.title));
  if (!slug) throw new Error("slug manquant");
  return {
    slug,
    title: brief.title,
    description: String(raw.description || "").trim().slice(0, 170),
    publishedAt,
    keywords: asStringArray(raw.keywords).slice(0, 8),
    intro,
    sections: normalizedSections,
    faqs: faqs.slice(0, 6),
    internalLinks: clustered,
    ctaTitle: String(raw.ctaTitle || "Besoin d’y voir clair sur votre projet Chine ?"),
    ctaSubtitle:
      String(raw.ctaSubtitle || "").trim() ||
      "Décrivez votre profil : nous vous aidons à prioriser les prochaines étapes réalistes.",
  };
}

async function mammouth(system: string, user: string) {
  const apiKey = process.env.MAMMOUTH_API_KEY;
  if (!apiKey) throw new Error("MAMMOUTH_API_KEY manquante");
  const models = [
    ...new Set(
      [
        process.env.MAMMOUTH_BLOG_MODEL,
        process.env.MAMMOUTH_COMPOSE_MODEL,
        "gpt-4.1",
        "openai/gpt-4.1",
        "gpt-4o",
        "gpt-4.1-mini",
      ].filter(Boolean) as string[],
    ),
  ];
  let last = "échec";
  for (const model of models) {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 90000);
    try {
      const res = await fetch("https://api.mammouth.ai/v1/chat/completions", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model,
          temperature: 0.55,
          max_tokens: 8000,
          messages: [
            { role: "system", content: system },
            { role: "user", content: user },
          ],
        }),
        signal: controller.signal,
      });
      const data = (await res.json().catch(() => ({}))) as {
        error?: { message?: string };
        message?: string;
        choices?: Array<{ message?: { content?: unknown } }>;
      };
      if (!res.ok) {
        last = data?.error?.message || data?.message || `HTTP ${res.status} (${model})`;
        continue;
      }
      const msg = data?.choices?.[0]?.message;
      const content =
        (typeof msg?.content === "string" && msg.content) ||
        (Array.isArray(msg?.content)
          ? (msg.content as Array<{ text?: string }>).map((part) => part?.text || "").join("\n")
          : "") ||
        "";
      if (!content) {
        last = `vide (${model})`;
        continue;
      }
      return content;
    } catch (error) {
      last = error instanceof Error ? error.message : String(error);
    } finally {
      clearTimeout(timer);
    }
  }
  throw new Error(last);
}

async function generateOne(brief: BlogTopic, allSlugs: string[], publishedAt: string) {
  const required = requiredInternalLinks(brief);
  const user = `Rédige un article de blog COMPLET (équivalent ~1000–1600 mots) pour:

Titre imposé: ${brief.title}
Slug: ${brief.slug}
Contexte: ${brief.context}
Date de publication: ${publishedAt}

Liens internes OBLIGATOIRES (reprends-les dans internalLinks, labels naturels OK):
${required.map((link) => `- ${link.href} (${link.label})`).join("\n")}

Autres slugs blog pour 0–2 liens /blog/... : ${allSlugs.filter((item) => item !== brief.slug).slice(0, 40).join(", ")}

Format JSON exact:
{
  "description": "meta description FR ~150 caractères",
  "keywords": ["mot1","mot2","mot3"],
  "intro": "paragraphe d'accroche 80-120 mots sans labels",
  "sections": [{"heading":"Titre H2 naturel","paragraphs":["...","..."],"bullets":["optionnel"]}],
  "faqs": [{"question":"...","answer":"..."}],
  "internalLinks": [{"href":"${required[0].href}","label":"${required[0].label}"}],
  "ctaTitle": "...",
  "ctaSubtitle": "..."
}`;
  const content = await mammouth(SYSTEM, user);
  return validateGeneratedPost(extractJsonObject(content), brief, publishedAt);
}

export async function generateDailyBlogPost({
  force = false,
  createdBy = "cron",
}: {
  force?: boolean;
  createdBy?: string;
} = {}) {
  const today = parisDateString();
  const already = await countAiPostsOn(today);
  if (!force && already >= BLOG_DAILY_LIMIT) {
    return { skipped: true as const, reason: "quota", already, today };
  }

  const stored = await listStoredPosts();
  const usedSlugs = [
    ...BLOG_POSTS.map((post) => post.slug),
    ...stored.map((row) => row.post.slug),
  ];
  const usedTitles = [
    ...BLOG_POSTS.map((post) => post.title),
    ...stored.map((row) => row.post.title),
  ];
  const topic = pickTopic(usedSlugs, BLOG_TOPICS, usedTitles);
  if (!topic) {
    return { skipped: true as const, reason: "no-new-topic", already, today };
  }
  let post: BlogPost | null = null;
  let lastError = "génération impossible";
  for (let attempt = 1; attempt <= 2; attempt += 1) {
    try {
      post = await generateOne(topic, usedSlugs, today);
      break;
    } catch (error) {
      lastError = error instanceof Error ? error.message : String(error);
    }
  }
  if (!post) throw new Error(lastError);
  if (usedSlugs.includes(post.slug) || topicAlreadyCovered(topic, usedSlugs, usedTitles)) {
    return { skipped: true as const, reason: "no-new-topic", already, today };
  }
  const saved = await insertStoredPost({ post, createdBy });
  return { skipped: false as const, post: saved.post, id: saved.id, today };
}
