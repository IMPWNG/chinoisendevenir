#!/usr/bin/env node
/**
 * Régénère les articles blog via Mammouth (OpenAI ChatGPT).
 * Usage: node --env-file=.env.local scripts/generate-blog-posts.mjs
 *        node --env-file=.env.local scripts/generate-blog-posts.mjs <slug>
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, "..");
const OUT = path.join(ROOT, "src/lib/blog/posts.ts");

const API = "https://api.mammouth.ai/v1/chat/completions";
const MODELS = [
  ...new Set(
    [
      process.env.MAMMOUTH_BLOG_MODEL,
      process.env.MAMMOUTH_COMPOSE_MODEL,
      "gpt-4.1",
      "openai/gpt-4.1",
      "gpt-4o",
      "gpt-4.1-mini",
    ].filter(Boolean),
  ),
];

const BRIEFS = [
  {
    slug: "etudier-en-chine-2026-guide",
    publishedAt: "2026-09-15",
    title: "Étudier en Chine en 2026 : tout ce qu’il faut savoir avant de partir",
    context:
      "Présenter les étapes, les documents et les conditions d’admission pour partir étudier en Chine en 2026.",
  },
  {
    slug: "comment-obtenir-bourse-etudes-chine",
    publishedAt: "2026-09-16",
    title: "Comment obtenir une bourse d’études en Chine ?",
    context:
      "Expliquer les différents types de bourses (CSC, universitaires, provinciales) et les critères de sélection.",
  },
  {
    slug: "etudier-gratuitement-en-chine",
    publishedAt: "2026-09-17",
    title: "Étudier gratuitement en Chine, est-ce vraiment possible ?",
    context:
      "Parler des bourses complètes, de ce qu’elles couvrent vraiment, et des possibilités de financement.",
  },
  {
    slug: "5-erreurs-candidature-universite-chinoise",
    publishedAt: "2026-09-18",
    title: "5 erreurs à éviter lorsque vous candidatez dans une université chinoise",
    context:
      "Erreurs liées aux documents, aux délais et au choix de formation.",
  },
  {
    slug: "apprendre-chinois-avant-etudier-en-chine",
    publishedAt: "2026-09-19",
    title: "Pourquoi apprendre le chinois avant de venir étudier en Chine ?",
    context:
      "Expliquer les avantages du mandarin dans les études et la vie quotidienne.",
  },
  {
    slug: "ecole-langue-ou-universite-chine",
    publishedAt: "2026-09-20",
    title: "École de langue chinoise ou université : quelle est la meilleure option ?",
    context:
      "Comparer les objectifs, les coûts et les résultats de chaque parcours.",
  },
  {
    slug: "cout-vie-etudiante-chine",
    publishedAt: "2026-09-21",
    title: "Combien coûte réellement la vie étudiante en Chine ?",
    context:
      "Présenter le logement, la nourriture, le transport et les dépenses mensuelles (fourchettes prudentes).",
  },
  {
    slug: "villes-chine-etudiants-etrangers",
    publishedAt: "2026-09-22",
    title: "Les villes chinoises les plus adaptées aux étudiants étrangers",
    context:
      "Comparer Pékin, Shanghai, Guangzhou, Wuhan, Xi’an, Hangzhou, etc.",
  },
  {
    slug: "etudier-en-chine-sans-parler-chinois",
    publishedAt: "2026-09-23",
    title: "Peut-on étudier en Chine sans parler chinois ?",
    context:
      "Expliquer les formations en anglais et l’importance progressive du chinois.",
  },
  {
    slug: "documents-indispensables-etudier-en-chine",
    publishedAt: "2026-09-24",
    title: "Voici les documents indispensables pour étudier en Chine",
    context:
      "Passeport, diplômes, relevés de notes, certificat médical, lettre de motivation, etc.",
  },
  {
    slug: "choisir-universite-chinoise",
    publishedAt: "2026-09-25",
    title: "Comment choisir la bonne université chinoise ?",
    context:
      "Spécialité, ville, budget, classement et conditions d’admission.",
  },
  {
    slug: "avantages-etudier-chine-carriere",
    publishedAt: "2026-09-26",
    title: "Les avantages d’étudier en Chine pour votre carrière",
    context:
      "Opportunités professionnelles, réseau et expérience internationale — sans promettre un emploi.",
  },
  {
    slug: "annee-de-chinois-avant-licence-master",
    publishedAt: "2026-09-27",
    title: "Pourquoi suivre une année de chinois avant votre licence ou votre master ?",
    context:
      "Montrer comment une année linguistique facilite l’intégration académique.",
  },
  {
    slug: "etudier-chine-vs-afrique-europe",
    publishedAt: "2026-09-28",
    title: "Étudier en Chine : les différences avec les études en Afrique ou en Europe",
    context:
      "Comparer méthodes d’enseignement, discipline, campus et examens.",
  },
  {
    slug: "verite-etudes-en-chine-avantages-difficultes",
    publishedAt: "2026-09-29",
    title: "La vérité sur les études en Chine : avantages et difficultés",
    context:
      "Regard honnête sur l’adaptation, la culture, la langue et le climat.",
  },
  {
    slug: "lettre-motivation-universite-chinoise",
    publishedAt: "2026-09-30",
    title: "Comment rédiger une lettre de motivation pour une université chinoise ?",
    context:
      "Donner une structure simple et les éléments à mettre en avant.",
  },
  {
    slug: "bourse-complete-ou-autofinancement",
    publishedAt: "2026-10-01",
    title: "Bourse complète ou autofinancement : quelle option choisir ?",
    context:
      "Comparer avantages, risques et démarches de chaque solution.",
  },
  {
    slug: "journee-etudiant-etranger-chine",
    publishedAt: "2026-10-02",
    title: "Une journée dans la vie d’un étudiant étranger en Chine",
    context:
      "Cours, repas, transports, activités et vie sur le campus.",
  },
  {
    slug: "pourquoi-agence-etudier-en-chine",
    publishedAt: "2026-10-03",
    title: "Pourquoi passer par une agence pour étudier en Chine ?",
    context:
      "Expliquer l’accompagnement dans le choix de l’école, l’admission, le visa et l’arrivée. Chinois en Devenir est une agence, pas une université.",
  },
  {
    slug: "inscription-au-depart-etudier-en-chine",
    publishedAt: "2026-10-04",
    title: "De l’inscription au départ : les étapes pour venir étudier en Chine",
    context:
      "Présenter le parcours complet sous forme de calendrier simple et rassurant.",
  },
];

const SYSTEM = `Tu es un rédacteur SEO francophone senior pour Chinois en Devenir (https://chinoisendevenir.com), agence d'accompagnement pour étudier en Chine.
Règles absolues:
- Tu n'es PAS une université ni le CSC. Ne promets JAMAIS admission, bourse, visa, logement ou emploi.
- Français clair, concret, utile. Pas de jargon marketing vide. Pas de stats inventées (fourchettes prudentes OK).
- Structure narrative INTERNE: d'abord le problème du lecteur, puis la solution concrète, puis une promesse réaliste — SANS jamais écrire les mots "Problème", "Solution" ou "Promesse" comme titres ou labels.
- Article COMPLET: intro 80–120 mots, puis 5 à 7 sections H2 riches (2–4 paragraphes chacune, listes si utile), 4–5 FAQ utiles.
- Liens internes: choisis 3–5 parmi /etudier-en-chine, /ecoles-de-langue-chine, /bourses, /visa-etudiant-chine, /processus, /faq, /tarifs, /contact, /#lead-form, et /blog/<autres-slugs-pertinents>.
- Réponds UNIQUEMENT par un objet JSON valide (pas de markdown, pas de fences).`;

function extractJson(text) {
  const raw = String(text || "").trim();
  const fence = raw.match(/```(?:json)?\s*([\s\S]*?)```/);
  const body = fence ? fence[1].trim() : raw;
  const start = body.indexOf("{");
  const end = body.lastIndexOf("}");
  if (start < 0 || end <= start) throw new Error("JSON introuvable");
  return JSON.parse(body.slice(start, end + 1));
}

async function mammouth(system, user) {
  const apiKey = process.env.MAMMOUTH_API_KEY;
  if (!apiKey) throw new Error("MAMMOUTH_API_KEY manquante");

  let last = "échec";
  for (const model of MODELS) {
    const res = await fetch(API, {
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
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      last =
        data?.error?.message || data?.message || `HTTP ${res.status} (${model})`;
      console.warn(`  model ${model} failed:`, last);
      continue;
    }
    const msg = data?.choices?.[0]?.message;
    const content =
      (typeof msg?.content === "string" && msg.content) ||
      (Array.isArray(msg?.content)
        ? msg.content.map((p) => p?.text || p).join("\n")
        : "") ||
      "";
    if (!content) {
      last = `vide (${model})`;
      continue;
    }
    return { model, content };
  }
  throw new Error(last);
}

function validate(post, brief) {
  if (!post.intro || post.intro.length < 120) throw new Error("intro trop courte");
  if (!Array.isArray(post.sections) || post.sections.length < 5)
    throw new Error("besoin de ≥5 sections");
  for (const s of post.sections) {
    if (!s.heading || !Array.isArray(s.paragraphs) || s.paragraphs.length < 2)
      throw new Error(`section faible: ${s.heading}`);
  }
  if (!Array.isArray(post.faqs) || post.faqs.length < 4)
    throw new Error("besoin de ≥4 FAQ");
  if (!Array.isArray(post.internalLinks) || post.internalLinks.length < 3)
    throw new Error("besoin de ≥3 liens internes");
  const banned = /^(problème|solution|promesse)\b/i;
  if (banned.test(post.intro.trim())) throw new Error("intro labelée");
  for (const s of post.sections) {
    if (banned.test(s.heading.trim())) throw new Error(`titre interdit: ${s.heading}`);
  }
  return {
    slug: brief.slug,
    title: brief.title,
    description: String(post.description || "").slice(0, 160),
    publishedAt: brief.publishedAt,
    keywords: Array.isArray(post.keywords) ? post.keywords.slice(0, 6) : [],
    intro: post.intro,
    sections: post.sections.map((s) => ({
      heading: s.heading,
      paragraphs: s.paragraphs,
      ...(Array.isArray(s.bullets) && s.bullets.length
        ? { bullets: s.bullets }
        : {}),
    })),
    faqs: post.faqs.slice(0, 5),
    internalLinks: post.internalLinks.slice(0, 5),
    ctaTitle: post.ctaTitle || "Besoin d’y voir clair sur votre projet Chine ?",
    ctaSubtitle:
      post.ctaSubtitle ||
      "Décrivez votre profil : nous vous aidons à prioriser les prochaines étapes réalistes.",
  };
}

async function generateOne(brief, allSlugs) {
  const user = `Rédige un article de blog COMPLET et long (équivalent ~1200–1800 mots) pour:

Titre imposé: ${brief.title}
Slug: ${brief.slug}
Contexte: ${brief.context}
Date de publication prévue: ${brief.publishedAt}

Autres slugs blog disponibles pour liens internes: ${allSlugs.filter((s) => s !== brief.slug).join(", ")}

Format JSON exact:
{
  "description": "meta description FR ~150 caractères",
  "keywords": ["mot1","mot2","mot3"],
  "intro": "paragraphe d'accroche 80-120 mots sans labels",
  "sections": [
    {
      "heading": "Titre H2 naturel",
      "paragraphs": ["...", "..."],
      "bullets": ["optionnel"]
    }
  ],
  "faqs": [{"question":"...","answer":"..."}],
  "internalLinks": [{"href":"/etudier-en-chine","label":"..."}],
  "ctaTitle": "...",
  "ctaSubtitle": "..."
}`;

  const { model, content } = await mammouth(SYSTEM, user);
  const parsed = extractJson(content);
  const post = validate(parsed, brief);
  console.log(
    `  OK via ${model} — ${post.sections.length} sections, intro ${post.intro.length} chars`,
  );
  return post;
}

async function loadExisting() {
  if (!fs.existsSync(OUT)) return [];
  try {
    const mod = await import(`${pathToFileURL(OUT).href}?t=${Date.now()}`);
    return Array.isArray(mod.BLOG_POSTS) ? mod.BLOG_POSTS : [];
  } catch {
    return [];
  }
}

async function main() {
  const only = process.argv[2];
  const briefs = only ? BRIEFS.filter((b) => b.slug === only) : BRIEFS;
  if (!briefs.length) throw new Error(`slug inconnu: ${only}`);

  const allSlugs = BRIEFS.map((b) => b.slug);
  const map = new Map((await loadExisting()).map((p) => [p.slug, p]));

  for (const brief of briefs) {
    console.log(`\n→ ${brief.slug}`);
    let post = null;
    for (let attempt = 1; attempt <= 3; attempt += 1) {
      try {
        post = await generateOne(brief, allSlugs);
        break;
      } catch (err) {
        console.warn(`  attempt ${attempt} failed:`, err.message);
        await new Promise((r) => setTimeout(r, 1500 * attempt));
      }
    }
    if (!post) throw new Error(`échec définitif: ${brief.slug}`);
    map.set(brief.slug, post);
    await new Promise((r) => setTimeout(r, 800));
  }

  const posts = BRIEFS.map((b) => map.get(b.slug)).filter(Boolean);
  if (posts.length !== BRIEFS.length && !only) {
    throw new Error(`attendu ${BRIEFS.length} posts, got ${posts.length}`);
  }

  const ordered = only
    ? BRIEFS.map((b) => map.get(b.slug)).filter(Boolean)
    : posts;

  const file = `import type { BlogPost } from "./types";\n\nexport const BLOG_POSTS: BlogPost[] = ${JSON.stringify(ordered, null, 2)};\n`;
  fs.writeFileSync(OUT, file);
  console.log(`\nWrote ${ordered.length} posts → ${OUT}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
