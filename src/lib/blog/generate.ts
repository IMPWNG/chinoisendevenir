import type { BlogPost, BlogFaq, BlogLink, BlogSection } from "./types";
import { BLOG_POSTS, parisDateString } from "./index";
import {
  countAiPostsOn,
  insertStoredPost,
  listStoredPosts,
} from "./store";

export const BLOG_DAILY_LIMIT = 2;

export type BlogTopic = {
  slug: string;
  title: string;
  context: string;
};

export const BLOG_TOPICS: BlogTopic[] = [
  { slug: "visa-x1-etudiant-chine-demarches", title: "Visa X1 étudiant en Chine : les démarches concrètes", context: "Expliquer le visa X1, les documents JW202/JW201, les délais et ce qui se passe à l’arrivée, sans garantir l’obtention." },
  { slug: "hsk-quel-niveau-pour-etudier-en-chine", title: "Quel niveau HSK faut-il pour étudier en Chine ?", context: "Rappeler les niveaux HSK utiles selon licence, master et année de langue, sans inventer de seuils officiels uniques." },
  { slug: "logement-etudiant-campus-chine", title: "Logement étudiant en Chine : campus, appartement et budget", context: "Comparer résidence universitaire et location, avec fourchettes prudentes." },
  { slug: "csc-bourse-gouvernement-chinois", title: "Bourse CSC : comment ça fonctionne vraiment ?", context: "Présenter la bourse du gouvernement chinois, les voies d’attribution et les limites, sans promettre de résultat." },
  { slug: "master-en-anglais-en-chine", title: "Faire un master en anglais en Chine : pour qui, à quelles conditions ?", context: "Programmes taught in English, IELTS/TOEFL, et place du chinois au quotidien." },
  { slug: "calendrier-rentree-automne-printemps-chine", title: "Rentrée d’automne ou de printemps en Chine : comment choisir ?", context: "Comparer les deux rentrées, les délais de dossier et ce que ça change pour le visa." },
  { slug: "assurance-sante-etudiant-etranger-chine", title: "Assurance santé pour un étudiant étranger en Chine", context: "Expliquer pourquoi une couverture est demandée et ce qu’il faut vérifier, sans vendre d’assurance." },
  { slug: "ou-apprendre-chinois-pekin-shanghai-province", title: "Où apprendre le chinois en Chine : grande ville ou province ?", context: "Comparer coût, immersion, rythme et vie quotidienne." },
  { slug: "dossier-admission-traduction-legalisation", title: "Traductions et légalisations pour un dossier d’admission en Chine", context: "Expliquer pourquoi les documents doivent être traduits et authentifiés, sans figer une procédure unique." },
  { slug: "travailler-pendant-etudes-chine", title: "Peut-on travailler pendant ses études en Chine ?", context: "Rappeler le cadre du visa étudiant et les limites, sans conseiller de contourner la loi." },
  { slug: "climat-adaptation-vie-etudiante-chine", title: "S’adapter à la vie étudiante en Chine : climat, nourriture, rythme", context: "Parler d’adaptation concrète, sans caricature." },
  { slug: "choisir-ville-etudiante-budget-chine", title: "Choisir sa ville étudiante en Chine selon son budget", context: "Comparer des villes types (Pékin, Shanghai, Chengdu, Wuhan, Qingdao) avec fourchettes prudentes." },
  { slug: "lettre-recommandation-universite-chinoise", title: "Lettre de recommandation pour une université chinoise", context: "Qui la demande, quoi y mettre, erreurs fréquentes." },
  { slug: "casier-judiciaire-dossier-chine", title: "Casier judiciaire et certificat de non-condamnation pour étudier en Chine", context: "Expliquer le document souvent demandé, sa durée de validité typique, sans figer un modèle unique." },
  { slug: "examen-medical-etudiant-chine", title: "Examen médical pour partir étudier en Chine", context: "À quoi sert le certificat, quand le faire, ce qui est souvent demandé." },
  { slug: "renouveler-visa-residence-etudiant-chine", title: "Après l’arrivée : titre de séjour étudiant en Chine", context: "Le passage du visa X1 au permis de résidence, délais et pièges courants." },
  { slug: "apprendre-chinois-zero-en-chine", title: "Arriver en Chine à zéro en chinois : comment s’y prendre ?", context: "Année de langue, HSK, vie quotidienne, sans vendre un miracle." },
  { slug: "cout-annee-langue-chinoise", title: "Combien coûte une année de langue chinoise en Chine ?", context: "Frais de scolarité, logement, vie quotidienne — fourchettes prudentes." },
  { slug: "difference-licence-chinoise-europeenne", title: "Licence en Chine vs licence en Europe : ce qui change vraiment", context: "Durée, examens, encadrement, sans hiérarchie caricaturale." },
  { slug: "preparer-entretien-admission-chine", title: "Comment préparer un entretien d’admission pour la Chine", context: "Questions fréquentes, langue de l’entretien, ce que le jury cherche." },
  { slug: "etudier-ingenierie-en-chine", title: "Étudier l’ingénierie en Chine : points de vigilance", context: "Langue d’enseignement, labos, stages — rester factuel." },
  { slug: "etudier-medecine-en-chine", title: "Étudier la médecine en Chine : ce qu’il faut savoir avant", context: "Durée, langue, reconnaissance du diplôme selon les pays — sans promettre l’exercice." },
  { slug: "etudier-business-en-chine", title: "Étudier le business et le commerce en Chine", context: "Programmes, mandarin, débouchés possibles sans garantie d’emploi." },
  { slug: "application-universite-chinoise-delais", title: "Les délais d’une candidature universitaire en Chine", context: "Calendrier type de 6 à 12 mois, pièces qui bloquent le plus souvent." },
  { slug: "bourse-universitaire-vs-csc", title: "Bourse universitaire chinoise ou bourse CSC ?", context: "Comparer couverture, sélectivité et calendrier, sans classer “la meilleure”." },
  { slug: "parents-envoyer-enfant-etudier-chine", title: "Envoyer son enfant étudier en Chine : le point de vue des parents", context: "Sécurité, suivi, communication, coûts — ton rassurant et honnête." },
  { slug: "telephone-banque-arrivee-chine", title: "Téléphone, banque et paiement à l’arrivée en Chine", context: "SIM, WeChat Pay, compte bancaire : les premiers jours pratiques." },
  { slug: "hiver-etudiant-nord-chine", title: "Étudier dans le nord de la Chine : l’hiver, le chauffage, le quotidien", context: "Pékin, Harbin, Shenyang, Changchun — adaptation concrète." },
  { slug: "canton-shanghai-contrastes-etudiants", title: "Shanghai, Canton, Shenzhen : quelle métropole pour un étudiant ?", context: "Coût, rythme, mandarin vs cantonais, débouchés." },
  { slug: "annee-sabbatique-chinois-en-chine", title: "Une année sabbatique pour apprendre le chinois en Chine", context: "Pour qui c’est utile, comment la financer, ce que ça change ensuite." },
  { slug: "double-diplome-chine-france", title: "Double diplôme France–Chine : à quoi s’attendre", context: "Principe, charge de travail, sans lister des partenariats inventés." },
  { slug: "refuser-admission-universite-chinoise", title: "Pourquoi une université chinoise refuse un dossier", context: "Pièces incomplètes, délais, niveau de langue, projet flou." },
  { slug: "suivre-cours-en-chinois-a-luniversite", title: "Suivre des cours en chinois à l’université : le choc réel", context: "Rythme, caractères, prise de notes, comment s’y préparer." },
  { slug: "wechat-vie-etudiante-chine", title: "WeChat, campus et vie étudiante en Chine", context: "Groupes de classe, paiements, administrations — usage concret." },
  { slug: "budget-mensuel-etudiant-chine-2027", title: "Budget mensuel d’un étudiant en Chine en 2027", context: "Fourchettes prudentes nourriture, transport, téléphone, sorties." },
  { slug: "choisir-ecole-langue-chinoise", title: "Comment choisir son école de langue en Chine", context: "Ville, taille, HSK, logement, calendrier de rentrée." },
  { slug: "apres-annee-de-chinois-que-faire", title: "Après une année de chinois en Chine, quelles suites ?", context: "Licence, master, travail, retour — options réalistes." },
  { slug: "pieces-identite-parents-dossier-mineur-chine", title: "Dossier d’un étudiant mineur en Chine : documents des parents", context: "Autorisations, passeports des parents, tutelle — rester général." },
  { slug: "orientation-domaine-etudes-chine", title: "Quel domaine d’études viser en Chine selon son profil", context: "Aider à relier bac / licence actuelle et formations, sans promettre un métier." },
  { slug: "erreurs-budget-etudier-chine", title: "Les erreurs de budget quand on part étudier en Chine", context: "Oublis classiques : dépôt, billet, assurance, premier mois." },
];

const SYSTEM = `Tu es un rédacteur SEO francophone senior pour Chinois en Devenir (https://chinoisendevenir.com), agence d'accompagnement pour étudier en Chine.
Règles absolues:
- Tu n'es PAS une université ni le CSC. Ne promets JAMAIS admission, bourse, visa, logement ou emploi.
- Français clair, concret, utile. Pas de jargon marketing vide. Pas de stats inventées (fourchettes prudentes OK).
- Structure narrative INTERNE: d'abord le problème du lecteur, puis la solution concrète, puis une promesse réaliste — SANS jamais écrire les mots "Problème", "Solution" ou "Promesse" comme titres ou labels.
- Article COMPLET: intro 80–120 mots, puis 5 à 7 sections H2 riches (2–4 paragraphes chacune, listes si utile), 4–5 FAQ utiles.
- Liens internes: choisis 3–5 parmi /etudier-en-chine, /ecoles-de-langue-chine, /bourses, /visa-etudiant-chine, /processus, /faq, /tarifs, /contact, /#lead-form, et /blog/<autres-slugs-pertinents>.
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

export function pickTopic(usedSlugs: Iterable<string>, topics: BlogTopic[] = BLOG_TOPICS) {
  const used = new Set([...usedSlugs].map(String));
  return topics.find((topic) => !used.has(topic.slug)) || null;
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
    internalLinks: internalLinks.slice(0, 6),
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

async function inventTopic(usedSlugs: string[], usedTitles: string[]): Promise<BlogTopic> {
  const content = await mammouth(
    "Tu proposes un sujet de blog unique pour Chinois en Devenir. JSON uniquement.",
    `Propose UN sujet inédit (slug kebab-case FR sans accents, titre, contexte 1 phrase).
Slugs déjà utilisés: ${usedSlugs.slice(0, 80).join(", ")}
Titres déjà utilisés: ${usedTitles.slice(0, 40).join(" | ")}
Format: {"slug":"...","title":"...","context":"..."}`,
  );
  const parsed = extractJsonObject(content);
  const title = String(parsed.title || "").trim();
  const slug = slugifyBlogTitle(String(parsed.slug || title));
  if (!title || !slug) throw new Error("sujet IA invalide");
  if (usedSlugs.includes(slug)) throw new Error("sujet déjà utilisé");
  return {
    slug,
    title,
    context: String(parsed.context || title),
  };
}

async function generateOne(brief: BlogTopic, allSlugs: string[], publishedAt: string) {
  const user = `Rédige un article de blog COMPLET (équivalent ~1000–1600 mots) pour:

Titre imposé: ${brief.title}
Slug: ${brief.slug}
Contexte: ${brief.context}
Date de publication: ${publishedAt}

Autres slugs blog pour liens internes: ${allSlugs.filter((item) => item !== brief.slug).slice(0, 40).join(", ")}

Format JSON exact:
{
  "description": "meta description FR ~150 caractères",
  "keywords": ["mot1","mot2","mot3"],
  "intro": "paragraphe d'accroche 80-120 mots sans labels",
  "sections": [{"heading":"Titre H2 naturel","paragraphs":["...","..."],"bullets":["optionnel"]}],
  "faqs": [{"question":"...","answer":"..."}],
  "internalLinks": [{"href":"/etudier-en-chine","label":"..."}],
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
  if (!force) {
    const already = await countAiPostsOn(today);
    if (already >= BLOG_DAILY_LIMIT) {
      return { skipped: true as const, reason: "quota", already, today };
    }
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
  const topic = pickTopic(usedSlugs) || (await inventTopic(usedSlugs, usedTitles));
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
  if (usedSlugs.includes(post.slug)) {
    post = { ...post, slug: `${post.slug}-${Date.now().toString(36).slice(-4)}` };
  }
  const saved = await insertStoredPost({ post, createdBy });
  return { skipped: false as const, post: saved.post, id: saved.id, today };
}
