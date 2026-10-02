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

/**
 * File de sujets IA : angles précis, utiles, variés.
 * Les exemples CSC / visa pays / HSK / villes donnent le niveau attendu ;
 * la liste doit rester large pour éviter la cannibalisation des 20 guides piliers.
 */
export const BLOG_TOPICS: BlogTopic[] = [
  {
    slug: "calendrier-csc-2027",
    title: "Calendrier CSC 2027 : dates, voies et pièces à anticiper",
    context:
      "Calendrier type 2026–2027 de la bourse CSC : fenêtres de dépôt, voies université / ambassade, pièces qui bloquent. Aucune date garantie. Pas de promesse d'obtention.",
    pillars: ["/bourses", "/etudier-en-chine"],
    cta: "/tarifs",
  },
  {
    slug: "visa-x1-senegal-etudes-chine",
    title: "Visa X1 depuis le Sénégal : consulat, pièces et délais",
    context:
      "Demande de visa X1 au Sénégal : dépôt, JW201/JW202, photo, passeport, délais. Décision consulaire.",
    pillars: ["/visa-etudiant-chine", "/processus"],
    cta: "/#lead-form",
  },
  {
    slug: "visa-x1-cote-ivoire-etudes-chine",
    title: "Visa X1 depuis la Côte d'Ivoire : consulat, pièces et délais",
    context:
      "Demande de visa X1 en Côte d'Ivoire : dépôt, documents, délais. Pas de garantie d'obtention.",
    pillars: ["/visa-etudiant-chine", "/processus"],
    cta: "/#lead-form",
  },
  {
    slug: "visa-x1-france-etudes-chine",
    title: "Visa X1 depuis la France : centre des visas, pièces et délais",
    context:
      "Demande de visa X1 en France : centre des visas, JW201/JW202, délais. Décision consulaire.",
    pillars: ["/visa-etudiant-chine", "/processus"],
    cta: "/tarifs",
  },
  {
    slug: "visa-x1-maroc-etudes-chine",
    title: "Visa X1 depuis le Maroc : consulat, pièces et délais",
    context:
      "Demande de visa X1 au Maroc : dépôt, documents, délais. Pas de garantie d'obtention.",
    pillars: ["/visa-etudiant-chine", "/processus"],
    cta: "/#lead-form",
  },
  {
    slug: "visa-x1-cameroun-etudes-chine",
    title: "Visa X1 depuis le Cameroun : consulat, pièces et délais",
    context:
      "Demande de visa X1 au Cameroun : où déposer, pièces fréquentes, délais. Décision consulaire.",
    pillars: ["/visa-etudiant-chine", "/processus"],
    cta: "/#lead-form",
  },
  {
    slug: "visa-x1-congo-rdc-etudes-chine",
    title: "Visa X1 depuis la RDC : consulat, pièces et délais",
    context:
      "Demande de visa X1 depuis la RDC : dépôt, documents, délais typiques. Pas de garantie.",
    pillars: ["/visa-etudiant-chine", "/processus"],
    cta: "/#lead-form",
  },
  {
    slug: "visa-x1-tunisie-etudes-chine",
    title: "Visa X1 depuis la Tunisie : consulat, pièces et délais",
    context:
      "Demande de visa X1 en Tunisie : centre de dépôt, JW201/JW202, délais. Décision consulaire.",
    pillars: ["/visa-etudiant-chine", "/processus"],
    cta: "/tarifs",
  },
  {
    slug: "visa-x1-algerie-etudes-chine",
    title: "Visa X1 depuis l'Algérie : consulat, pièces et délais",
    context:
      "Demande de visa X1 en Algérie : dépôt, documents, délais. Pas de garantie d'obtention.",
    pillars: ["/visa-etudiant-chine", "/processus"],
    cta: "/#lead-form",
  },
  {
    slug: "visa-x1-belgique-etudes-chine",
    title: "Visa X1 depuis la Belgique : centre des visas, pièces et délais",
    context:
      "Demande de visa X1 en Belgique : centre des visas, pièces, délais. Décision consulaire.",
    pillars: ["/visa-etudiant-chine", "/processus"],
    cta: "/tarifs",
  },
  {
    slug: "visa-x1-canada-etudes-chine",
    title: "Visa X1 depuis le Canada : centre des visas, pièces et délais",
    context:
      "Demande de visa X1 au Canada : dépôt, JW201/JW202, délais. Pas de garantie.",
    pillars: ["/visa-etudiant-chine", "/processus"],
    cta: "/#lead-form",
  },
  {
    slug: "hsk-4-avant-licence-en-chine",
    title: "HSK 4 avant une licence en Chine : quand c'est utile, quand ça ne l'est pas",
    context:
      "Distinguer licence en chinois, licence en anglais, année de langue. Pas de seuil officiel unique inventé.",
    pillars: ["/ecoles-de-langue-chine", "/etudier-en-chine"],
    cta: "/tarifs",
  },
  {
    slug: "hsk-5-master-en-chinois",
    title: "HSK 5 pour un master enseigné en chinois : à quoi s'attendre",
    context:
      "Niveau souvent demandé pour un master en chinois, écart avec le cours réel, alternatives. Sans inventer de seuil unique.",
    pillars: ["/ecoles-de-langue-chine", "/etudier-en-chine"],
    cta: "/tarifs",
  },
  {
    slug: "hsk-3-annee-de-langue",
    title: "HSK 3 avant une année de langue en Chine : utile ou superflu ?",
    context:
      "Ce que le HSK 3 change (ou non) pour une école de langue, placement, rythme. Ton factuel.",
    pillars: ["/ecoles-de-langue-chine", "/processus"],
    cta: "/#lead-form",
  },
  {
    slug: "cout-reel-etudiant-shanghai-vs-wuhan",
    title: "Coût réel étudiant : Shanghai vs Wuhan",
    context:
      "Comparer logement, repas, transport et premier mois, fourchettes prudentes. Ni palmarès ni garantie.",
    pillars: ["/etudier-en-chine", "/processus"],
    cta: "/tarifs",
  },
  {
    slug: "cout-reel-etudiant-pekin-vs-chengdu",
    title: "Coût réel étudiant : Pékin vs Chengdu",
    context:
      "Comparer budget mensuel, logement, transport. Fourchettes prudentes, pas de classement absolu.",
    pillars: ["/etudier-en-chine", "/processus"],
    cta: "/tarifs",
  },
  {
    slug: "cout-reel-etudiant-guangzhou-vs-nanjing",
    title: "Coût réel étudiant : Canton vs Nanjing",
    context:
      "Comparer coût de la vie, climat urbain, transport. Fourchettes prudentes.",
    pillars: ["/etudier-en-chine", "/processus"],
    cta: "/#lead-form",
  },
  {
    slug: "rentree-printemps-2027-chine",
    title: "Rentrée de printemps 2027 en Chine : pour qui, avec quels délais",
    context:
      "Fenêtre candidature automne 2026, écoles de langue vs université, visa. Pas de date figée inventée.",
    pillars: ["/processus", "/etudier-en-chine"],
    cta: "/tarifs",
  },
  {
    slug: "rentree-automne-2027-chine",
    title: "Rentrée d'automne 2027 en Chine : calendrier type et pièces qui bloquent",
    context:
      "Calendrier type candidature, délais JW/visa, pièces. Sans garantir une admission.",
    pillars: ["/processus", "/etudier-en-chine"],
    cta: "/tarifs",
  },
  {
    slug: "jw202-jw201-difference-pratique",
    title: "JW201 et JW202 : à quoi ça sert concrètement pour le visa",
    context:
      "Différence pratique, qui délivre le formulaire, lien avec X1. Décision visa = autorités.",
    pillars: ["/visa-etudiant-chine", "/processus"],
    cta: "/#lead-form",
  },
  {
    slug: "permis-sejour-etudiant-30-jours",
    title: "Les 30 jours après l'arrivée : convertir le X1 en permis de séjour",
    context:
      "Délai, pièces fréquentes, rôle de l'université. Pas de garantie de délai local.",
    pillars: ["/visa-etudiant-chine", "/processus"],
    cta: "/tarifs",
  },
  {
    slug: "master-en-anglais-chine-ielts-toefl",
    title: "Master en anglais en Chine : IELTS, TOEFL et place du chinois au quotidien",
    context:
      "Scores souvent demandés, vie hors cours en chinois, sans inventer de seuil unique.",
    pillars: ["/etudier-en-chine", "/processus"],
    cta: "/tarifs",
  },
  {
    slug: "bourse-universitaire-vs-csc-2027",
    title: "Bourse universitaire chinoise ou CSC en 2027 : comment choisir",
    context:
      "Comparer couverture, calendrier, sélectivité. Sans classer « la meilleure » ni promettre.",
    pillars: ["/bourses", "/etudier-en-chine"],
    cta: "/tarifs",
  },
  {
    slug: "traduction-legalisation-dossier-chine-afrique",
    title: "Traductions et légalisations depuis l'Afrique pour un dossier Chine",
    context:
      "Ordre typique traduction / légalisation / apostille selon pays, délais. Procédure non unique.",
    pillars: ["/processus", "/etudier-en-chine"],
    cta: "/#lead-form",
  },
  {
    slug: "casier-judiciaire-validite-dossier-chine",
    title: "Casier judiciaire pour la Chine : validité et pièges de timing",
    context:
      "Durée de validité typique, quand le demander, refus si trop vieux. Pas de modèle unique.",
    pillars: ["/processus", "/visa-etudiant-chine"],
    cta: "/#lead-form",
  },
  {
    slug: "examen-medical-foreigner-chine",
    title: "Examen médical pour étudier en Chine : quand le faire, quoi vérifier",
    context:
      "Formulaire souvent demandé, validité, labo. Sans vendre de service médical.",
    pillars: ["/processus", "/visa-etudiant-chine"],
    cta: "/tarifs",
  },
  {
    slug: "logement-campus-vs-appart-premiere-annee",
    title: "Première année en Chine : campus ou appartement ?",
    context:
      "Avantages résidence, dépôt location, budget. Fourchettes prudentes, pas de promesse de place.",
    pillars: ["/etudier-en-chine", "/processus"],
    cta: "/#lead-form",
  },
  {
    slug: "wechat-alipay-avant-depart-chine",
    title: "WeChat et Alipay avant le départ : ce qu'il faut installer chez soi",
    context:
      "Installer avant l'avion, validation compte, carte étrangère. Pas de garantie d'ouverture.",
    pillars: ["/processus", "/etudier-en-chine"],
    cta: "/#lead-form",
  },
  {
    slug: "vpn-etudiant-chine-gmail-whatsapp",
    title: "VPN pour un étudiant en Chine : Gmail, WhatsApp et portails étrangers",
    context:
      "Pourquoi installer avant l'arrivée, limites, pas de marque garantie. L'agence ne vend pas de VPN.",
    pillars: ["/processus", "/etudier-en-chine"],
    cta: "/tarifs",
  },
  {
    slug: "assurance-sante-etudiant-arrivee-chine",
    title: "Assurance santé à l'arrivée en Chine : ce que l'université demande souvent",
    context:
      "Couverture campus vs internationale, timing. Sans vendre d'assurance ni garantir l'acceptation.",
    pillars: ["/processus", "/visa-etudiant-chine"],
    cta: "/#lead-form",
  },
  {
    slug: "lettre-recommandation-master-chine",
    title: "Lettre de recommandation pour un master en Chine : qui, quoi, erreurs",
    context:
      "Qui la signe, contenu utile, erreurs fréquentes. Sans modèle miracle.",
    pillars: ["/etudier-en-chine", "/processus"],
    cta: "/tarifs",
  },
  {
    slug: "entretien-admission-universite-chinoise",
    title: "Entretien d'admission pour une université chinoise : questions fréquentes",
    context:
      "Langue de l'entretien, motivation, projet. Pas de script qui « marchera ».",
    pillars: ["/etudier-en-chine", "/processus"],
    cta: "/#lead-form",
  },
  {
    slug: "annee-langue-puis-licence-chine",
    title: "Année de chinois puis licence : le parcours en deux temps",
    context:
      "Pourquoi beaucoup passent par une école de langue, calendrier, HSK. Sans promesse d'admission ensuite.",
    pillars: ["/ecoles-de-langue-chine", "/etudier-en-chine"],
    cta: "/tarifs",
  },
  {
    slug: "etudier-ingenierie-en-anglais-chine",
    title: "Ingénierie en anglais en Chine : points de vigilance",
    context:
      "Langue d'enseignement, labos, stages. Factuel, sans inventer d'établissements.",
    pillars: ["/etudier-en-chine", "/processus"],
    cta: "/tarifs",
  },
  {
    slug: "etudier-business-mandarin-chine",
    title: "Business et commerce en Chine : anglais, mandarin ou les deux ?",
    context:
      "Programmes, utilité du chinois au quotidien, débouchés possibles sans garantie d'emploi.",
    pillars: ["/etudier-en-chine", "/ecoles-de-langue-chine"],
    cta: "/#lead-form",
  },
  {
    slug: "parents-budget-envoyer-enfant-chine",
    title: "Parents : budget réaliste pour envoyer un enfant étudier en Chine",
    context:
      "Scolarité, logement, premier mois, imprévus. Fourchettes prudentes, ton honnête.",
    pillars: ["/etudier-en-chine", "/processus"],
    cta: "/tarifs",
  },
  {
    slug: "refuser-dossier-pieces-incompletes",
    title: "Pourquoi un dossier Chine est refusé pour pièces incomplètes",
    context:
      "Traduction, dates, casier, photo. Pas de liste exhaustive inventée.",
    pillars: ["/processus", "/etudier-en-chine"],
    cta: "/#lead-form",
  },
  {
    slug: "sim-chinoise-premiere-semaine",
    title: "Carte SIM chinoise la première semaine : passeport, forfait, SMS",
    context:
      "Achat avec passeport, utilité pour WeChat/Alipay. Procédure locale variable.",
    pillars: ["/processus", "/etudier-en-chine"],
    cta: "/#lead-form",
  },
  {
    slug: "hiver-nord-chine-etudiant",
    title: "Étudier dans le nord de la Chine en hiver : froid, chauffage, quotidien",
    context:
      "Pékin, Harbin, Shenyang : adaptation concrète, sans caricature.",
    pillars: ["/etudier-en-chine", "/processus"],
    cta: "/tarifs",
  },
  {
    slug: "choisir-ecole-langue-hsk-ville",
    title: "Choisir une école de langue : ville, HSK et calendrier de rentrée",
    context:
      "Critères concrets taille, logement, sessions. Sans classer « la meilleure ».",
    pillars: ["/ecoles-de-langue-chine", "/processus"],
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
