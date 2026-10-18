/**
 * Rebuild docs/chatbot-knowledge.md from the public site copy, formulas, and blog.
 * Run: npx tsx scripts/build-chatbot-knowledge.mjs
 */
import { writeFileSync } from "node:fs";

const { siteTranslations } = await import("../src/i18n/site.ts");
const { FORMULES, EXTRA_FEES, PAYMENT_NOTE, displayFormulePrice } = await import(
  "../src/lib/formules.ts"
);
const {
  STUDY_COUNTRIES,
  STUDY_FROM_DISCLAIMER,
  STUDY_FROM_HUB_PATH,
  studyCountryPath,
} = await import("../src/lib/studyFromCountries.ts");
const { BLOG_POSTS, mergeBlogPosts } = await import("../src/lib/blog/index.ts");
const { SITE } = await import("../src/lib/seo.ts");

const fr = siteTranslations.fr;
const lines = [];
const push = (...parts) => lines.push(...parts);

function h(level, text) {
  push("", `${"#".repeat(level)} ${text}`, "");
}

function p(text) {
  if (text) push(text, "");
}

function bullets(items) {
  for (const item of items || []) push(`- ${item}`);
  if (items?.length) push("");
}

function qa(question, answer) {
  push(`**${question}**`, "", answer, "");
}

function table(headers, rows) {
  push(`| ${headers.join(" | ")} |`);
  push(`| ${headers.map(() => "---").join(" | ")} |`);
  for (const row of rows) push(`| ${row.join(" | ")} |`);
  push("");
}

function postBody(post) {
  h(3, post.title);
  push(`- URL : ${SITE.url}/blog/${post.slug}`);
  push(`- Publié le : ${post.publishedAt}`);
  if (post.keywords?.length) push(`- Mots-clés : ${post.keywords.join(", ")}`);
  push("");
  p(post.description);
  p(post.intro);
  for (const section of post.sections || []) {
    h(4, section.heading);
    for (const paragraph of section.paragraphs || []) p(paragraph);
    bullets(section.bullets);
  }
  if (post.faqs?.length) {
    h(4, "Questions de l'article");
    for (const item of post.faqs) qa(item.question, item.answer);
  }
}

function decodeHtml(value) {
  return value
    .replace(/<[^>]+>/g, "")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/&#x27;|&apos;/g, "'")
    .replace(/&#(\d+);/g, (_, code) => String.fromCharCode(Number(code)))
    .replace(/\s+/g, " ")
    .trim();
}

function parseLiveArticle(html, slug) {
  const publishedAt = html.match(/"datePublished":"(\d{4}-\d{2}-\d{2})"/)?.[1] || "";
  const start = html.indexOf("<article");
  const end = html.indexOf("</article>");
  if (start < 0 || end < start || !publishedAt) return null;
  const article = html.slice(start, end);
  const tokens = [];
  const re = /<(h1|h2|h3|p|li)\b[^>]*>([\s\S]*?)<\/\1>/g;
  let match;
  while ((match = re.exec(article))) {
    const text = decodeHtml(match[2]);
    if (text) tokens.push({ tag: match[1], text });
  }
  const title = tokens.find((token) => token.tag === "h1")?.text || "";
  if (!title) return null;
  const paragraphs = tokens
    .filter((token) => token.tag === "p")
    .filter((token) => !/^\d{1,2}\s+\p{L}+\s+\d{4}$/u.test(token.text));
  const description = paragraphs[0]?.text || "";
  const intro = paragraphs[1]?.text || "";
  const sections = [];
  const faqs = [];
  let mode = "body";
  let current = null;
  let pendingQuestion = "";
  for (const token of tokens) {
    if (token.tag === "h1" || token.text === "Accueil" || token.text === "Blog") continue;
    if (token.tag === "h2" && (token.text === "Guides à lire aussi" || token.text === "Articles liés")) {
      break;
    }
    if (token.tag === "h2" && token.text === "Questions fréquentes") {
      mode = "faq";
      current = null;
      continue;
    }
    if (mode === "faq") {
      if (token.tag === "h3") pendingQuestion = token.text;
      else if (token.tag === "p" && pendingQuestion) {
        faqs.push({ question: pendingQuestion, answer: token.text });
        pendingQuestion = "";
      }
      continue;
    }
    if (token.tag === "h2") {
      current = { heading: token.text, paragraphs: [], bullets: [] };
      sections.push(current);
      continue;
    }
    if (!current) continue;
    if (token.tag === "li") current.bullets.push(token.text);
    else if (token.tag === "p" && token.text !== description && token.text !== intro) {
      current.paragraphs.push(token.text);
    }
  }
  return {
    slug,
    title,
    description,
    publishedAt,
    keywords: [],
    intro,
    sections,
    faqs,
    internalLinks: [],
    ctaTitle: "",
    ctaSubtitle: "",
  };
}

async function liveBlogPosts() {
  const known = new Set(BLOG_POSTS.map((post) => post.slug));
  try {
    const sitemap = await fetch(`${SITE.url}/sitemap.xml`).then((res) => {
      if (!res.ok) throw new Error(`sitemap ${res.status}`);
      return res.text();
    });
    const slugs = [...sitemap.matchAll(/\/blog\/([a-z0-9-]+)/g)]
      .map((item) => item[1])
      .filter((slug) => slug && !known.has(slug));
    const unique = [...new Set(slugs)];
    const posts = [];
    for (const slug of unique) {
      const res = await fetch(`${SITE.url}/blog/${slug}`);
      if (!res.ok) continue;
      const parsed = parseLiveArticle(await res.text(), slug);
      if (parsed) posts.push(parsed);
    }
    if (!unique.length) return { posts: [], note: "" };
    if (posts.length !== unique.length) {
      return {
        posts,
        note: `${unique.length - posts.length} article(s) en ligne non lus. Le reste du blog publié est inclus.`,
      };
    }
    return { posts, note: "" };
  } catch (error) {
    const message = error instanceof Error ? error.message : "lecture impossible";
    return { posts: [], note: `Articles en ligne non chargés (${message}). Guides du code inclus.` };
  }
}

const live = await liveBlogPosts();
const posts = mergeBlogPosts(BLOG_POSTS, live.posts).filter(
  (post) => post.publishedAt <= new Date().toISOString().slice(0, 10),
);

h(1, "Base de connaissance — Chinois en Devenir");
p(
  `Document pour un chatbot. Généré le ${new Date().toISOString().slice(0, 10)} depuis les textes publics du site, les formules et le blog. Source : ${SITE.url}.`,
);
if (live.note) p(live.note);

h(2, "Règles de réponse");
bullets([
  "Tu réponds aux questions sur les études en Chine et sur les services de Chinois en Devenir.",
  "Tu t'appuies sur ce document. Si un fait n'y figure pas (montant de scolarité d'une université, quota de bourse, délai d'un consulat précis), tu le dis et tu renvoies vers l'université, le consulat ou la page contact.",
  "Langue : français par défaut, sinon la langue de la question.",
  "Chinois en Devenir est une agence d'accompagnement francophone. Ce n'est pas une université, pas le China Scholarship Council (CSC), pas un consulat.",
  "Ne jamais garantir une admission, une bourse, un visa, un logement, un HSK, ni un emploi.",
  "Les seuls prix de l'agence sont les trois formules ci-dessous. Les fourchettes de frais de scolarité ou de vie dans les articles sont des ordres de grandeur éditoriaux, pas des tarifs de l'agence.",
  "En cas de contradiction, les pages du site et les formules priment sur le blog. Ne pas reprendre une phrase de blog qui présenterait le visa ou l'admission comme une formalité ou une quasi-certitude.",
  `Contact : ${SITE.email} — WhatsApp ${SITE.whatsapp} — WeChat @MCisec — ${SITE.url}/contact`,
  "Horaires indiqués sur le site : lun-ven 9h-18h, heure de Pékin. Réponse habituelle sous 24 à 48 heures.",
]);

h(2, "Identité");
bullets([
  `Nom : ${SITE.name}`,
  `Société : ${SITE.legalName}`,
  "Adresse affichée : 重庆市渝中区石油路街道, 经纬大道789号10-5#0534 (Chongqing, Chine)",
  `Site : ${SITE.url}`,
  `E-mail : ${SITE.email}`,
  `WhatsApp : ${SITE.whatsapp}`,
  "WeChat : @MCisec",
  "TikTok : https://www.tiktok.com/@chinoisendevenir",
  SITE.tagline,
  SITE.description,
  "Public : étudiants francophones (France, Belgique, Suisse, Canada, Afrique francophone, et ailleurs) qui veulent étudier en Chine.",
  "Langue de service : français. Les dossiers universitaires se traitent en chinois ou en anglais selon le programme.",
]);

h(2, "Ce que l'agence fait");
p(fr.services.subtitle);
p(fr.footer.description);
for (const item of fr.services.items) {
  push(`**${item.title}.** ${item.description}`, "");
}
p(fr.programs.subtitle);
p(`Formations accompagnées : ${fr.programs.list.join(", ")}.`);
p(
  "Domaines souvent demandés au formulaire : " +
    fr.form.domains.join(", ") +
    ".",
);
p(
  "Rentrées proposées au formulaire : " +
    Object.values(fr.form.intakes).join(", ") +
    ".",
);
p(
  "Niveaux de diplôme au formulaire : " +
    Object.values(fr.form.diplomas).join(", ") +
    ".",
);

h(2, "Ce que l'agence ne fait pas");
p(fr.tarifs.infoIntro);
bullets(fr.tarifs.disclaimers);
p(fr.tarifs.infoOutro);
p(fr.etudier.disclaimer);

h(2, "Formules et tarifs");
p(fr.tarifs.title);
p(fr.tarifs.subtitle);
p(
  "Le paiement intervient après un premier échange téléphonique et après validation de la formule. Aucune démarche d'accompagnement ne commence avant. " +
    PAYMENT_NOTE,
);
for (const formule of FORMULES) {
  h(3, `Formule ${formule.number} — ${formule.title} — ${displayFormulePrice(formule)}`);
  p(formule.subtitle);
  p(`Pour qui : ${formule.audience}`);
  p(formule.intro);
  if (formule.savingsText) p(formule.savingsText);
  if (formule.includeGroups?.length) {
    for (const group of formule.includeGroups) {
      push(`**${group.title}**`, "");
      bullets(group.items);
    }
  } else {
    push("**Inclus**", "");
    bullets(formule.includes);
  }
  push("**Cette formule est adaptée si**", "");
  bullets(formule.idealIf);
  if (formule.whyChoose) {
    p(formule.whyChoose.intro);
    bullets(formule.whyChoose.steps);
  }
  p(formule.footnote);
}
p(fr.tarifs.savingsTitle);
p(
  `${fr.tarifs.savingsTextBefore} ${fr.tarifs.savingsHighlight}${fr.tarifs.savingsTextAfter}`,
);
for (const item of fr.tarifs.keep1and2) p(item);
p("Choisir selon le projet :");
for (const item of fr.tarifs.chooser) qa(item.question, item.detail);
h(3, "Frais qui restent à l'étudiant");
p(fr.tarifs.translationP1);
p(fr.tarifs.translationP2);
p(fr.tarifs.extraIntro);
bullets(EXTRA_FEES);
h(3, "Comment démarre l'accompagnement");
for (const step of fr.tarifs.processSteps) {
  push(`**${step.title}.** ${step.text}`, "");
}
h(3, "Questions sur les tarifs");
for (const item of fr.faqs.tarifs) qa(item.question, item.answer);

h(2, "Pourquoi étudier en Chine, et le parcours type");
p(fr.home.whySubtitle);
for (const item of fr.home.why) push(`**${item.title}.** ${item.text}`, "");
p(fr.home.howSubtitle);
for (const item of fr.home.how) push(`**${item.title}.** ${item.text}`, "");

h(2, "Comment étudier en Chine");
p(`Page : ${SITE.url}/etudier-en-chine`);
p(fr.etudier.subtitle);
p(fr.etudier.disclaimer);
h(3, fr.etudier.conditionsTitle);
p(fr.etudier.conditionsText);
bullets(fr.etudier.conditions);
for (const topic of fr.etudier.topics) {
  push(`**${topic.title}.** ${topic.text}`, "");
}
h(3, "Questions — étudier en Chine");
for (const item of fr.faqs.etudier) qa(item.question, item.answer);
h(3, "Questions — accueil");
for (const item of fr.faqs.home) qa(item.question, item.answer);

h(2, "Écoles de langue et année de chinois");
p(`Page : ${SITE.url}/ecoles-de-langue-chine`);
p(`${fr.langue.title}. ${fr.langue.lead}`);
p(fr.langue.disclaimer);
p(fr.langue.pWhat);
p(fr.langue.pWhy);
for (const item of fr.langue.whyItems) push(`**${item.title}.** ${item.text}`, "");
h(3, fr.langue.hNoEn);
p(fr.langue.pNoEn);
p(fr.langue.compareLead);
table(fr.langue.compareHeaders, fr.langue.compareRows);
p(fr.langue.compareNote);
h(3, fr.langue.hHow);
p(fr.langue.pHow);
for (const item of fr.langue.how) push(`**${item.title}.** ${item.text}`, "");
p(
  "L'année de langue et l'admission en licence ou master restent deux dossiers distincts.",
);
h(3, fr.langue.hUni);
p(fr.langue.pUni);
h(3, fr.langue.hHsk);
p(fr.langue.pHsk);
table(fr.langue.hskHeaders, fr.langue.hskRows);
p(fr.langue.hskNote);
p(fr.langue.pWho);
push(`**${fr.langue.whoYesTitle}**`, "");
bullets(fr.langue.whoYes);
push(`**${fr.langue.whoNoTitle}**`, "");
bullets(fr.langue.whoNo);
h(3, fr.langue.hCost);
p(
  `${fr.langue.pCostBefore} ${fr.langue.pCostLink} ${fr.langue.pCostAfter}`,
);
p(`${fr.langue.pVisaBefore} ${fr.langue.pVisaLink}. ${fr.langue.pVisaAfter}`);
h(3, "Questions — langue");
for (const item of fr.faqs.langue) qa(item.question, item.answer);

h(2, "Bourses");
p(`Page : ${SITE.url}/bourses`);
p(fr.bourses.subtitle);
p(
  `${fr.bourses.introBefore} étudier en Chine ${fr.bourses.introAfter}`,
);
p(fr.bourses.warningText);
p(
  "L'agence ne garantit pas l'obtention d'une bourse. Elle aide à identifier les options adaptées au profil et à préparer le dossier.",
);
for (const item of fr.bourses.items) {
  push(
    `**${item.nom}.** ${item.description} Montant : ${item.montant}. Niveau : ${item.niveau}. Durée : ${item.duree}.`,
    "",
  );
}
p("Candidater : préparer les documents, déposer le dossier auprès de l'université ou de l'organisme, attendre les résultats (souvent cités à 2-3 mois, sans date garantie).");
h(3, "Questions — bourses");
for (const item of fr.faqs.bourses) qa(item.question, item.answer);

h(2, "Visa étudiant");
p(`Page : ${SITE.url}/visa-etudiant-chine`);
p(fr.visa.lead);
h(3, fr.visa.hX);
p(fr.visa.pX);
h(3, fr.visa.hJw);
p(fr.visa.pJw);
h(3, fr.visa.hDocs);
bullets(fr.visa.docs);
p(fr.visa.pDocs);
h(3, fr.visa.hStay);
p(fr.visa.pStay);
h(3, fr.visa.hWhen);
p(
  "Le visa vient en fin de parcours : d'abord le projet et le dossier, puis l'admission, ensuite seulement le JW201 ou JW202 et le rendez-vous consulaire. Réserver un vol non flexible trop tôt est risqué.",
);
h(3, "Questions — visa");
for (const item of fr.faqs.visa) qa(item.question, item.answer);
h(3, "Questions — contact");
for (const item of fr.contact.faqs) qa(item.q, item.a);

h(2, "Processus d'admission");
p(`Page : ${SITE.url}/processus`);
p(
  `${fr.processus.title}. ${fr.processus.subtitleBefore} visa étudiant ${fr.processus.subtitleAfter}`,
);
for (const [index, step] of fr.processus.steps.entries()) {
  push(`**Étape ${index + 1} — ${step.titre}** (${step.duree}). ${step.description}`, "");
  bullets(step.details);
}
h(3, "Questions — processus");
for (const item of fr.faqs.processus) qa(item.question, item.answer);

h(2, "Étudier en Chine selon le pays");
p(`Hub : ${SITE.url}${STUDY_FROM_HUB_PATH}`);
p(STUDY_FROM_DISCLAIMER);
p(
  "Chaque page pays reprend la même méthode : définir le niveau, la discipline, la langue et les universités ; vérifier les critères et les dates sur le site de l'établissement ; préparer les pièces demandées ; vérifier traduction, certification ou légalisation ; après admission, vérifier séjour, visa et inscription auprès de l'université et des autorités. Les conditions ne sont pas les mêmes d'un pays, d'un diplôme ou d'une année à l'autre.",
);
for (const country of STUDY_COUNTRIES) {
  h(3, country.h1);
  push(`- URL : ${SITE.url}${studyCountryPath(country.slug)}`, "");
  p(country.intro);
  push(`**${country.angleTitle}**`, "");
  p(country.angle);
  if (country.steps?.length) bullets(country.steps);
  if (country.angleTable) table(country.angleTable.headers, country.angleTable.rows);
  for (const item of country.faqs) qa(item.question, item.answer);
}

h(2, `Blog — ${posts.length} articles publiés`);
p(
  `Index : ${SITE.url}/blog. Les articles développent les mêmes sujets (admission, bourses, langue, visa, vie étudiante, services). Ils ne créent pas de nouveau tarif ni de nouvelle promesse.`,
);
for (const post of posts) postBody(post);

const markdown = `${lines.join("\n").replace(/\n{3,}/g, "\n\n").trim()}\n`;

const required = [
  "800 €",
  "1 700 €",
  "2 000 €",
  "ne jamais garantir",
  "etudier-en-chine-2026-guide",
  "bourse-csc-ce-quelle-peut-couvrir",
  "visa-x1-france-etudes-chine",
  "JW201",
  "HSK 4",
  SITE.email,
];
for (const needle of required) {
  if (!markdown.toLowerCase().includes(needle.toLowerCase())) {
    throw new Error(`Base incomplète, manque : ${needle}`);
  }
}
if (markdown.includes("nous garantissons une admission")) {
  throw new Error("Promesse d'admission glissée dans la base");
}

const out = new URL("../docs/chatbot-knowledge.md", import.meta.url);
writeFileSync(out, markdown);
const words = markdown.split(/\s+/).filter(Boolean).length;
console.log(
  `chatbot knowledge: ${posts.length} articles (${BLOG_POSTS.length} guides + ${live.posts.length} en base), ${STUDY_COUNTRIES.length} pays, ${words} mots`,
);
