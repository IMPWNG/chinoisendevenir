#!/usr/bin/env node
/**
 * Scan Chinese university admission sites, extract structured international-student
 * data with Mammouth AI, and write a JSON catalog for matching / RAG.
 *
 * Usage:
 *   node scripts/scan-universities.mjs
 *   node scripts/scan-universities.mjs --only hust,scut
 *   node scripts/scan-universities.mjs --limit 2 --force
 *   node scripts/scan-universities.mjs --concurrency 2
 *
 * Reads MAMMOUTH_API_KEY from .env.local (never hardcode the key).
 */

import { readFile, writeFile, mkdir, access, readdir } from "node:fs/promises";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const TARGETS_PATH = join(ROOT, "scripts", "university-targets.json");
const OUT_DIR = join(ROOT, "data", "universities");
const PROFILES_DIR = join(OUT_DIR, "profiles");
const RAW_DIR = join(OUT_DIR, "raw");
const CATALOG_PATH = join(OUT_DIR, "catalog.json");
const INDEX_PATH = join(OUT_DIR, "matching-index.json");

const MAMMOUTH_URL = "https://api.mammouth.ai/v1/chat/completions";
const DEFAULT_MODEL = process.env.MAMMOUTH_MODEL || "minimax-m3";
const USER_AGENT =
  "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36";

const PAGE_TIMEOUT_MS = 25000;
const MAX_PAGES_PER_UNI = 12;
const MAX_CHARS_PER_PAGE = 12000;
const MAX_CHARS_TOTAL = 36000;
const FETCH_DELAY_MS = 350;
const AI_MAX_TOKENS = 7000;
const AI_RETRIES = 3;

const LINK_KEYWORDS = [
  "admission",
  "apply",
  "application",
  "scholarship",
  "tuition",
  "fee",
  "accommodation",
  "dormitory",
  "housing",
  "visa",
  "international",
  "program",
  "requirement",
  "eligibility",
  "document",
  "language",
  "hsk",
  "undergraduate",
  "postgraduate",
  "bachelor",
  "master",
  "phd",
  "doctoral",
  "prospectus",
  "brochure",
  "degree",
  "foundation",
  "contact",
  "howtoapply",
  "how-to-apply",
  "enroll",
  "招生",
  "留学",
  "奖学金",
  "申请",
  "学费",
  "宿舍",
  "签证",
  "入学",
  "简章",
  "国际",
  "来华",
  "本科",
  "硕士",
  "博士",
  "汉语",
  "语言",
  "住宿",
  "条件",
  "材料",
  "费用",
];

const args = parseArgs(process.argv.slice(2));

main().catch((err) => {
  console.error("\nScan failed:", err.message || err);
  process.exit(1);
});

async function main() {
  const apiKey = await loadApiKey();
  const targets = await loadTargets();
  await mkdir(PROFILES_DIR, { recursive: true });
  await mkdir(RAW_DIR, { recursive: true });

  console.log(`Universités à scanner : ${targets.length}`);
  console.log(`Modèle Mammouth      : ${DEFAULT_MODEL}`);
  console.log(`Sortie               : ${OUT_DIR}\n`);

  const results = [];
  const queue = [...targets];
  const workers = Math.max(1, args.concurrency);

  async function worker() {
    while (queue.length) {
      const uni = queue.shift();
      const profile = await scanUniversity(uni, apiKey);
      results.push(profile);
    }
  }

  await Promise.all(Array.from({ length: workers }, worker));

  const allProfiles = await loadAllProfiles();
  const catalog = {
    generated_at: new Date().toISOString(),
    model: DEFAULT_MODEL,
    university_count: allProfiles.length,
    ok_count: allProfiles.filter((r) => r.scan_status === "ok").length,
    scanned_this_run: results.map((r) => r.slug),
    universities: allProfiles,
  };
  const matchingIndex = allProfiles.map(toMatchingIndexRow);

  await writeFile(CATALOG_PATH, JSON.stringify(catalog, null, 2), "utf8");
  await writeFile(INDEX_PATH, JSON.stringify(matchingIndex, null, 2), "utf8");

  console.log(`\nTerminé.`);
  console.log(`  Catalog         : ${CATALOG_PATH}`);
  console.log(`  Matching index  : ${INDEX_PATH}`);
  console.log(
    `  OK / total      : ${catalog.ok_count}/${catalog.university_count}`,
  );
}

function parseArgs(argv) {
  const out = { only: null, limit: null, force: false, concurrency: 1 };
  for (let i = 0; i < argv.length; i += 1) {
    const a = argv[i];
    if (a === "--force") out.force = true;
    else if (a === "--only") out.only = String(argv[++i] || "")
      .split(",")
      .map((s) => s.trim().toLowerCase())
      .filter(Boolean);
    else if (a === "--limit") out.limit = Number(argv[++i]);
    else if (a === "--concurrency") out.concurrency = Number(argv[++i]) || 1;
    else if (a.startsWith("--only=")) {
      out.only = a
        .slice(7)
        .split(",")
        .map((s) => s.trim().toLowerCase())
        .filter(Boolean);
    }
  }
  return out;
}

async function loadApiKey() {
  const env = await loadEnvLocal();
  const key = process.env.MAMMOUTH_API_KEY || env.MAMMOUTH_API_KEY;
  if (!key) {
    throw new Error(
      "MAMMOUTH_API_KEY manquante. Ajoute-la dans .env.local puis relance.",
    );
  }
  return key;
}

async function loadEnvLocal() {
  const envPath = join(ROOT, ".env.local");
  try {
    const text = await readFile(envPath, "utf8");
    const env = {};
    for (const line of text.split(/\r?\n/)) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith("#")) continue;
      const eq = trimmed.indexOf("=");
      if (eq === -1) continue;
      env[trimmed.slice(0, eq).trim()] = trimmed.slice(eq + 1).trim();
    }
    return env;
  } catch {
    return {};
  }
}

async function loadTargets() {
  const list = JSON.parse(await readFile(TARGETS_PATH, "utf8"));
  let selected = list;
  if (args.only?.length) {
    selected = list.filter((u) => {
      const blob = [u.slug, u.name_en, ...(u.aliases || [])]
        .join(" ")
        .toLowerCase();
      return args.only.some((q) => blob.includes(q) || u.slug.includes(q));
    });
    if (!selected.length) {
      throw new Error(`Aucune université ne correspond à --only ${args.only}`);
    }
  }
  if (Number.isFinite(args.limit) && args.limit > 0) {
    selected = selected.slice(0, args.limit);
  }
  return selected;
}

async function scanUniversity(uni, apiKey) {
  const profilePath = join(PROFILES_DIR, `${uni.slug}.json`);
  if (!args.force && (await exists(profilePath))) {
    console.log(`↷  ${uni.name_en} (déjà scanné, utilise --force pour refaire)`);
    return JSON.parse(await readFile(profilePath, "utf8"));
  }

  console.log(`→  ${uni.name_en}`);
  const started = Date.now();
  const pages = await crawlUniversity(uni);
  const rawPath = join(RAW_DIR, `${uni.slug}.json`);
  await writeFile(
    rawPath,
    JSON.stringify(
      {
        slug: uni.slug,
        fetched_at: new Date().toISOString(),
        pages: pages.map((p) => ({
          url: p.url,
          title: p.title,
          status: p.status,
          error: p.error || null,
          text: p.text,
        })),
      },
      null,
      2,
    ),
    "utf8",
  );

  const usable = pages.filter((p) => p.text && p.text.length > 80);
  if (!usable.length) {
    const empty = emptyProfile(uni, {
      scan_status: "no_pages",
      notes: "Aucun contenu HTML exploitable. Vérifier les URLs manuellement.",
      sources: pages.map((p) => ({ url: p.url, title: p.title, status: p.status })),
    });
    await writeFile(profilePath, JSON.stringify(empty, null, 2), "utf8");
    console.log(`   ✗ aucun contenu (${Math.round((Date.now() - started) / 1000)}s)`);
    return empty;
  }

  let profile;
  try {
    profile = await extractWithMammouth(uni, usable, apiKey);
    profile.scan_status = "ok";
  } catch (err) {
    profile = emptyProfile(uni, {
      scan_status: "ai_error",
      notes: `Erreur Mammouth: ${err.message}`,
    });
  }

  profile.confidence = normalizeConfidence(profile.confidence);
  profile.slug = uni.slug;
  profile.scraped_at = new Date().toISOString();
  profile.model = DEFAULT_MODEL;
  profile.pages_fetched = pages.length;
  profile.pages_used = usable.length;
  profile.sources = usable.map((p) => ({
    url: p.url,
    title: p.title || null,
    chars: p.text.length,
  }));
  profile.db_row = toDbRow(uni, profile);

  await writeFile(profilePath, JSON.stringify(profile, null, 2), "utf8");
  const conf = profile.confidence ?? "?";
  console.log(
    `   ✓ ${usable.length} pages, confiance ${conf} (${Math.round((Date.now() - started) / 1000)}s)`,
  );
  return profile;
}

async function crawlUniversity(uni) {
  const seen = new Set();
  const pages = [];
  const queue = [];

  if (uni.seed_text && String(uni.seed_text).trim().length > 80) {
    pages.push({
      url: (uni.seed_urls && uni.seed_urls[0]) || uni.website || "seed-text",
      finalUrl: "seed-text",
      status: 200,
      title: "Extraits officiels (admission / frais / bourses)",
      html: "",
      text: String(uni.seed_text).slice(0, MAX_CHARS_PER_PAGE),
      error: null,
    });
  }

  for (const url of uni.seed_urls || []) enqueue(url, 0);

  const allowedHosts = new Set(
    (uni.seed_urls || [])
      .map((u) => {
        try {
          return new URL(u).hostname.replace(/^www\./, "");
        } catch {
          return null;
        }
      })
      .filter(Boolean),
  );

  const discovered = await discoverUrls(uni, allowedHosts);
  for (const url of discovered) enqueue(url, 0);

  while (queue.length && pages.length < MAX_PAGES_PER_UNI) {
    const item = queue.shift();
    const page = await fetchPage(item.url);
    pages.push(page);
    await sleep(FETCH_DELAY_MS);

    if (page.html && item.depth < 2) {
      const links = extractLinks(page.finalUrl || item.url, page.html)
        .map((l) => ({ ...l, score: scoreLink(l, allowedHosts) }))
        .filter((l) => l.score > 0)
        .sort((a, b) => b.score - a.score)
        .slice(0, 10);
      for (const link of links) enqueue(link.url, item.depth + 1);
    }
  }

  return pages;

  function enqueue(url, depth) {
    const normalized = normalizeUrl(url);
    if (!normalized || seen.has(normalized)) return;
    if (!/^https?:\/\//i.test(normalized)) return;
    if (/\.(pdf|docx?|xlsx?|zip|rar|jpg|png|gif|mp4)(\?|$)/i.test(normalized)) {
      return;
    }
    seen.add(normalized);
    queue.push({ url: normalized, depth });
  }
}

async function discoverUrls(uni, allowedHosts) {
  const query = `"${uni.name_en}" international students admission scholarship tuition site:.edu.cn`;
  try {
    const html = await fetchHtml(
      `https://html.duckduckgo.com/html/?q=${encodeURIComponent(query)}`,
    );
    if (!html) return [];
    const urls = [];
    const re = /uddg=([^&"]+)/gi;
    let m;
    while ((m = re.exec(html))) {
      try {
        urls.push(decodeURIComponent(m[1]));
      } catch {
        /* ignore */
      }
    }
    const hrefRe = /href="(https?:\/\/[^"]+\.edu\.cn[^"]*)"/gi;
    while ((m = hrefRe.exec(html))) urls.push(m[1]);
    return [...new Set(urls.map(normalizeUrl).filter(Boolean))]
      .filter((url) => {
        try {
          const host = new URL(url).hostname.replace(/^www\./, "");
          return (
            [...allowedHosts].some((h) => host.endsWith(h) || h.endsWith(host)) ||
            scoreLink({ url, text: "" }, allowedHosts) >= 4
          );
        } catch {
          return false;
        }
      })
      .slice(0, 6);
  } catch {
    return [];
  }
}

async function fetchPage(url) {
  try {
    const { html, finalUrl, status } = await fetchHtmlDetailed(url);
    const title = extractTitle(html);
    const text = htmlToText(html).slice(0, MAX_CHARS_PER_PAGE);
    return { url, finalUrl, status, title, html, text, error: null };
  } catch (err) {
    return {
      url,
      finalUrl: url,
      status: 0,
      title: null,
      html: "",
      text: "",
      error: err.message,
    };
  }
}

async function fetchHtml(url) {
  const { html } = await fetchHtmlDetailed(url);
  return html;
}

async function fetchHtmlDetailed(url) {
  try {
    return await fetchHtmlOnce(url);
  } catch (err) {
    if (url.startsWith("https://")) {
      try {
        return await fetchHtmlOnce(url.replace("https://", "http://"));
      } catch {
        throw err;
      }
    }
    throw err;
  }
}

async function fetchHtmlOnce(url) {
  const res = await fetch(url, {
    redirect: "follow",
    signal: AbortSignal.timeout(PAGE_TIMEOUT_MS),
    headers: {
      "User-Agent": USER_AGENT,
      Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
      "Accept-Language": "en-US,en;q=0.9,zh-CN;q=0.8,fr;q=0.7",
    },
  });
  const buf = Buffer.from(await res.arrayBuffer());
  const contentType = res.headers.get("content-type") || "";
  if (
    contentType.includes("pdf") ||
    contentType.includes("octet-stream") ||
    contentType.includes("image/")
  ) {
    throw new Error(`Type non HTML: ${contentType}`);
  }
  const html = decodeHtml(buf, contentType, buf.toString("utf8").slice(0, 2000));
  return { html, finalUrl: res.url || url, status: res.status };
}

function decodeHtml(buf, contentType, headUtf8) {
  let encoding = "utf-8";
  const headerCharset = contentType.match(/charset=([^\s;]+)/i)?.[1];
  const metaCharset =
    headUtf8.match(/charset=["']?([a-z0-9-]+)/i)?.[1] ||
    headUtf8.match(/encoding=["']([a-z0-9-]+)/i)?.[1];
  encoding = (headerCharset || metaCharset || "utf-8").toLowerCase();
  if (encoding.includes("gb")) encoding = "gb18030";
  try {
    return new TextDecoder(encoding).decode(buf);
  } catch {
    return buf.toString("utf8");
  }
}

function htmlToText(html) {
  return html
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<noscript[\s\S]*?<\/noscript>/gi, " ")
    .replace(/<!--[\s\S]*?-->/g, " ")
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<\/(p|div|h[1-6]|li|tr|table|section|article|header|footer)>/gi, "\n")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/gi, " ")
    .replace(/&amp;/gi, "&")
    .replace(/&lt;/gi, "<")
    .replace(/&gt;/gi, ">")
    .replace(/&quot;/gi, '"')
    .replace(/&#(\d+);/g, (_, n) => String.fromCharCode(Number(n)))
    .replace(/\s+\n/g, "\n")
    .replace(/\n{3,}/g, "\n\n")
    .replace(/[ \t]{2,}/g, " ")
    .trim();
}

function extractTitle(html) {
  const m = html.match(/<title[^>]*>([\s\S]*?)<\/title>/i);
  return m ? htmlToText(m[1]).slice(0, 180) : null;
}

function extractLinks(baseUrl, html) {
  const links = [];
  const re = /href\s*=\s*["']([^"'#]+)["']/gi;
  let m;
  while ((m = re.exec(html))) {
    try {
      const url = new URL(m[1], baseUrl).toString();
      const textMatch = html
        .slice(m.index, m.index + 200)
        .match(/>([^<]{0,80})</);
      links.push({ url, text: textMatch ? htmlToText(textMatch[1]) : "" });
    } catch {
      /* ignore invalid urls */
    }
  }
  return links;
}

function scoreLink(link, allowedHosts = new Set()) {
  const blob = `${link.url} ${link.text}`.toLowerCase();
  if (/javascript:|mailto:|tel:/i.test(link.url)) return 0;
  let score = 0;
  try {
    const host = new URL(link.url).hostname.replace(/^www\./, "");
    if ([...allowedHosts].some((h) => host.endsWith(h) || h.endsWith(host))) {
      score += 3;
    }
  } catch {
    return 0;
  }
  for (const kw of LINK_KEYWORDS) {
    if (blob.includes(kw.toLowerCase())) score += 2;
  }
  if (/en\/|\/en|english|intl|iso|sie|cie|admission|study|lxs|gjy/i.test(link.url)) {
    score += 2;
  }
  return score;
}

function normalizeUrl(url) {
  if (!url) return null;
  try {
    const u = new URL(url);
    u.hash = "";
    if (u.pathname.endsWith("/index.htm") || u.pathname.endsWith("/index.html")) {
      u.pathname = u.pathname.replace(/\/index\.html?$/, "/");
    }
    return u.toString();
  } catch {
    return null;
  }
}

const SYSTEM_PROMPT = `Tu extrais des données d'admission en Chine pour étudiants étrangers.
Réponds UNIQUEMENT avec un JSON valide, sans markdown.
N'invente rien. Si une info n'est pas dans les sources: null, [] ou "".
Chiffres exacts (CNY, HSK, IELTS, TOEFL, dates, âges).
matching.fields: business, economics, finance, computer_science, engineering, sciences, medicine, dentistry, pharmacy, chinese_language, arts, design, music, law, education, agriculture, other.
matching.degrees: bachelor, master, phd, language, foundation, exchange.
Langues: zh, en, bilingual. Montants en CNY.
Textes libres en français, noms officiels conservés.`;

async function extractWithMammouth(uni, pages, apiKey) {
  const corpus = pages
    .map((p, i) => `----- SOURCE ${i + 1}: ${p.title || "sans titre"} | ${p.url} -----\n${p.text}`)
    .join("\n\n")
    .slice(0, MAX_CHARS_TOTAL);

  const meta = JSON.stringify(
    {
      slug: uni.slug,
      name_en: uni.name_en,
      name_zh: uni.name_zh,
      name_fr: uni.name_fr,
      aliases: uni.aliases,
      city: uni.city,
      province: uni.province,
      notes: uni.notes || null,
    },
    null,
    2,
  );

  const pass1Schema = `{
  "identity": {"name_en":"","name_zh":"","name_fr":"","aliases":[],"website":"","international_website":"","application_portal_url":""},
  "general": {"presentation":"","history":"","rankings":[],"strengths":[],"teaching_languages":[],"location":{"city":"","province":"","country":"Chine"},"cost_of_living_cny_month":{"min":null,"max":null,"notes":""},"campuses":[{"name":"","city":"","description":""}]},
  "programs": [{"level":"bachelor","name":"","field":"engineering","language":"en","duration_years":null,"start_months":[9],"academic_calendar":"semester","notes":""}],
  "admission_requirements": {
    "bachelor": {"academic":"","min_gpa":null,"age_max":null,"age_min":null,"hsk_level":null,"hsk_score_min":null,"ielts_min":null,"toefl_min":null,"preparatory_if_insufficient":null,"other":[]},
    "master": {"academic":"","min_gpa":null,"age_max":null,"age_min":null,"hsk_level":null,"hsk_score_min":null,"ielts_min":null,"toefl_min":null,"preparatory_if_insufficient":null,"other":[]},
    "phd": {"academic":"","min_gpa":null,"age_max":null,"age_min":null,"hsk_level":null,"hsk_score_min":null,"ielts_min":null,"toefl_min":null,"preparatory_if_insufficient":null,"other":[]},
    "language": {"academic":"","age_max":null,"other":[]}
  },
  "contacts": {"office_name":"","iso_email":"","admissions_email":"","wechat":"","phone":"","address":""},
  "matching": {"fields":[],"degrees":[],"languages":[],"english_programs_available":null,"chinese_language_program_available":null,"min_hsk_level":null,"min_ielts":null,"min_toefl":null,"age_max_bachelor":null,"age_max_master":null,"age_max_phd":null,"has_csc":null,"has_university_scholarship":null,"has_provincial_scholarship":null,"tuition_cny_min":null,"tuition_cny_max":null,"housing_cny_year_min":null,"deadline_typical":"","intake_months":[],"city":"","province":"","tags":[]},
  "confidence": 0,
  "missing_fields": [],
  "notes": ""
}`;

  const pass2Schema = `{
  "documents": [{"type":"passport","required":true,"count":null,"who":"","applies_to":["all"],"notes":""}],
  "application": {"platform_name":"","platform_url":"","steps":[],"opens_at":"","deadline":"","results_at":"","intake_months":[9],"application_fee_cny":null,"application_fee_refundable":null,"payment_methods":[]},
  "fees": {"tuition_cny_year":{"bachelor":{"min":null,"max":null},"master":{"min":null,"max":null},"phd":{"min":null,"max":null},"language":{"min":null,"max":null},"english_taught_premium":null},"insurance_cny_year":null,"other_fees":[],"housing":{"on_campus":[{"type":"double","price_cny_year":null,"included":""}],"deposit_cny":null,"off_campus_allowed":null},"living_cost_cny_month":{"food":null,"transport":null,"other":null,"notes":""}},
  "scholarships": [{"name":"","type":"csc","coverage":"full","covers":["tuition"],"stipend_cny_month":null,"conditions":"","apply_via":"university","deadline":"","renewal":""}],
  "language": {"hsk_bachelor":null,"hsk_master":null,"hsk_phd":null,"ielts_min":null,"toefl_min":null,"preparatory_chinese":{"available":null,"duration":"","leads_to_degree":null},"foundation":{"available":null,"description":""}},
  "visa": {"visa_types":[],"documents_from_university":[],"instructions":"","arrival_and_residence_permit":""},
  "housing_and_services": {"housing_types":[],"rules":"","international_office":"","orientation":"","english_support":null,"clubs":""},
  "country_specific": [{"region_or_country":"","notes":""}]
}`;

  const settled = await Promise.allSettled([
    callMammouthJson(
      apiKey,
      `${SYSTEM_PROMPT}\nFocus: identité, programmes (max 12), conditions d'admission, contacts, matching. JSON compact, chaque string < 350 caractères.`,
      `Université:\n${meta}\n\nRemplis exactement ce JSON, compact:\n${pass1Schema}\n\nSOURCES:\n${corpus}`,
    ),
    callMammouthJson(
      apiKey,
      `${SYSTEM_PROMPT}\nFocus: documents, procédure, frais, bourses, langue, visa, logement. JSON compact, chaque string < 350 caractères.`,
      `Université:\n${meta}\n\nRemplis exactement ce JSON, compact:\n${pass2Schema}\n\nSOURCES:\n${corpus}`,
    ),
  ]);

  const part1 = settled[0].status === "fulfilled" ? settled[0].value : {};
  const part2 = settled[1].status === "fulfilled" ? settled[1].value : {};
  const errors = settled
    .filter((s) => s.status === "rejected")
    .map((s) => s.reason?.message)
    .filter(Boolean);
  if (!Object.keys(part1).length && !Object.keys(part2).length) {
    throw new Error(errors.join(" | ") || "Extraction vide");
  }
  return {
    ...part1,
    ...part2,
    notes: [part1.notes, part2.notes, errors.length ? `partial: ${errors.join(" | ")}` : ""]
      .filter(Boolean)
      .join(" | "),
    missing_fields: [
      ...new Set([...(part1.missing_fields || []), ...(part2.missing_fields || [])]),
    ],
    confidence: Number.isFinite(part1.confidence)
      ? part1.confidence
      : Object.keys(part1).length && Object.keys(part2).length
        ? 0.6
        : 0.35,
  };
}

async function callMammouthJson(apiKey, system, user) {
  let lastError = null;
  for (let attempt = 1; attempt <= AI_RETRIES; attempt += 1) {
    try {
      const res = await fetch(MAMMOUTH_URL, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: DEFAULT_MODEL,
          temperature: 0.1,
          max_tokens: AI_MAX_TOKENS,
          messages: [
            { role: "system", content: system },
            { role: "user", content: user },
          ],
        }),
        signal: AbortSignal.timeout(90000),
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(
          `HTTP ${res.status}: ${json?.error?.message || json?.message || res.statusText}`,
        );
      }
      const message = json?.choices?.[0]?.message || {};
      const content = message.content || message.reasoning_content;
      if (!content) throw new Error("Réponse Mammouth vide");
      try {
        return parseJsonFromModel(content);
      } catch (parseErr) {
        lastError = parseErr;
        const compactAsk = await fetch(MAMMOUTH_URL, {
          method: "POST",
          headers: {
            Authorization: `Bearer ${apiKey}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            model: DEFAULT_MODEL,
            temperature: 0,
            max_tokens: AI_MAX_TOKENS,
            messages: [
              { role: "system", content: system },
              { role: "user", content: user },
              { role: "assistant", content: String(content).slice(0, 8000) },
              {
                role: "user",
                content:
                  "Le JSON était invalide. Renvoie le MÊME contenu en JSON compact valide, sans markdown, sans commentaires, strings courtes.",
              },
            ],
          }),
          signal: AbortSignal.timeout(90000),
        });
        const compactJson = await compactAsk.json().catch(() => ({}));
        const compactContent =
          compactJson?.choices?.[0]?.message?.content ||
          compactJson?.choices?.[0]?.message?.reasoning_content;
        if (!compactContent) throw parseErr;
        return parseJsonFromModel(compactContent);
      }
    } catch (err) {
      lastError = err;
      const retryable = /524|429|500|503|timeout|vide/i.test(String(err.message));
      if (!retryable || attempt === AI_RETRIES) break;
      await sleep(1500 * attempt);
    }
  }
  throw lastError || new Error("Mammouth indisponible");
}

function normalizeConfidence(value) {
  const n = Number(value);
  if (!Number.isFinite(n)) return 0;
  if (n > 1 && n <= 100) return Math.round(n) / 100;
  return Math.min(1, Math.max(0, n));
}

function parseJsonFromModel(content) {
  let text = String(content).trim();
  const fenced = text.match(/```(?:json)?\s*([\s\S]*?)```/i);
  if (fenced) text = fenced[1].trim();
  const start = text.indexOf("{");
  const end = text.lastIndexOf("}");
  if (start === -1) throw new Error("JSON introuvable dans la réponse");
  const slice = end > start ? text.slice(start, end + 1) : text.slice(start);
  const candidates = [
    slice,
    slice.replace(/,\s*([}\]])/g, "$1"),
    closeTruncatedJson(slice.replace(/,\s*([}\]])/g, "$1")),
  ];
  let lastErr;
  for (const candidate of candidates) {
    try {
      return JSON.parse(candidate);
    } catch (err) {
      lastErr = err;
    }
  }
  throw lastErr || new Error("JSON invalide");
}

function closeTruncatedJson(input) {
  let inStr = false;
  let escape = false;
  const stack = [];
  let out = "";
  for (const ch of input) {
    out += ch;
    if (inStr) {
      if (escape) escape = false;
      else if (ch === "\\") escape = true;
      else if (ch === '"') inStr = false;
      continue;
    }
    if (ch === '"') inStr = true;
    else if (ch === "{") stack.push("}");
    else if (ch === "[") stack.push("]");
    else if (ch === "}" || ch === "]") stack.pop();
  }
  if (inStr) out += '"';
  while (stack.length) out += stack.pop();
  return out;
}

function emptyProfile(uni, extra = {}) {
  return {
    slug: uni.slug,
    identity: {
      name_en: uni.name_en,
      name_zh: uni.name_zh,
      name_fr: uni.name_fr,
      aliases: uni.aliases || [],
      website: uni.seed_urls?.[0] || "",
      international_website: uni.seed_urls?.[0] || "",
      application_portal_url: "",
    },
    general: {
      presentation: "",
      history: "",
      rankings: [],
      strengths: [],
      teaching_languages: [],
      location: {
        city: uni.city,
        province: uni.province,
        country: "Chine",
      },
      cost_of_living_cny_month: { min: null, max: null, notes: "" },
      campuses: [],
    },
    programs: [],
    admission_requirements: {},
    documents: [],
    application: {},
    fees: {},
    scholarships: [],
    language: {},
    visa: {},
    housing_and_services: {},
    country_specific: [],
    contacts: {},
    matching: {
      fields: [],
      degrees: [],
      languages: [],
      city: uni.city,
      province: uni.province,
      tags: [],
    },
    confidence: 0,
    missing_fields: ["all"],
    notes: extra.notes || "",
    scan_status: extra.scan_status || "empty",
    sources: extra.sources || [],
    db_row: toDbRow(uni, { matching: {}, contacts: {}, application: {}, fees: {}, language: {} }),
  };
}

function toDbRow(uni, profile) {
  const matching = profile.matching || {};
  const contacts = profile.contacts || {};
  const fees = profile.fees || {};
  const emails = [
    contacts.iso_email,
    contacts.admissions_email,
  ].filter(Boolean);
  const docs = (profile.documents || [])
    .filter((d) => d?.required)
    .map((d) => d.type)
    .filter(Boolean);
  const scholarships = profile.scholarships || [];
  return {
    name_zh: profile.identity?.name_zh || uni.name_zh,
    name_en: profile.identity?.name_en || uni.name_en,
    name_fr: profile.identity?.name_fr || uni.name_fr,
    slug: uni.slug,
    city: matching.city || uni.city,
    province: matching.province || uni.province,
    country: "Chine",
    department: contacts.office_name || null,
    emails,
    phone: contacts.phone || null,
    wechat: contacts.wechat || null,
    website:
      profile.identity?.international_website ||
      profile.identity?.website ||
      uni.seed_urls?.[0] ||
      null,
    majors: matching.fields || [],
    required_documents: docs,
    scholarship_amount: scholarships
      .map((s) => s.name)
      .filter(Boolean)
      .join(" / ") || null,
    scholarship_min: matching.tuition_cny_min ?? null,
    scholarship_max: matching.tuition_cny_max ?? null,
    min_hsk_level: matching.min_hsk_level ?? null,
    language_requirements: summarizeLanguage(matching, profile.language || {}),
    tuition_min: matching.tuition_cny_min ?? fees.tuition_cny_year?.bachelor?.min ?? null,
    tuition_max: matching.tuition_cny_max ?? fees.tuition_cny_year?.bachelor?.max ?? null,
    application_deadline: matching.deadline_typical || profile.application?.deadline || null,
  };
}

function summarizeLanguage(matching, language) {
  const parts = [];
  if (matching.min_hsk_level || language.hsk_bachelor) {
    parts.push(`HSK ${matching.min_hsk_level || language.hsk_bachelor}+`);
  }
  if (matching.min_ielts || language.ielts_min) {
    parts.push(`IELTS ${matching.min_ielts || language.ielts_min}`);
  }
  if (matching.min_toefl || language.toefl_min) {
    parts.push(`TOEFL ${matching.min_toefl || language.toefl_min}`);
  }
  return parts.join(" / ") || null;
}

function toMatchingIndexRow(profile) {
  const matching = profile.matching || {};
  return {
    slug: profile.slug,
    name_en: profile.identity?.name_en || null,
    name_zh: profile.identity?.name_zh || null,
    city: matching.city || profile.general?.location?.city || null,
    province: matching.province || profile.general?.location?.province || null,
    fields: matching.fields || [],
    degrees: matching.degrees || [],
    languages: matching.languages || [],
    english_programs_available: matching.english_programs_available ?? null,
    chinese_language_program_available:
      matching.chinese_language_program_available ?? null,
    min_hsk_level: matching.min_hsk_level ?? null,
    min_ielts: matching.min_ielts ?? null,
    min_toefl: matching.min_toefl ?? null,
    age_max_bachelor: matching.age_max_bachelor ?? null,
    age_max_master: matching.age_max_master ?? null,
    age_max_phd: matching.age_max_phd ?? null,
    has_csc: matching.has_csc ?? null,
    has_university_scholarship: matching.has_university_scholarship ?? null,
    has_provincial_scholarship: matching.has_provincial_scholarship ?? null,
    tuition_cny_min: matching.tuition_cny_min ?? null,
    tuition_cny_max: matching.tuition_cny_max ?? null,
    housing_cny_year_min: matching.housing_cny_year_min ?? null,
    deadline_typical: matching.deadline_typical || null,
    intake_months: matching.intake_months || [],
    tags: matching.tags || [],
    application_url: profile.application?.platform_url || profile.identity?.application_portal_url || null,
    contact_email:
      profile.contacts?.iso_email || profile.contacts?.admissions_email || null,
    confidence: profile.confidence ?? 0,
    scan_status: profile.scan_status || null,
  };
}

async function loadAllProfiles() {
  let files = [];
  try {
    files = (await readdir(PROFILES_DIR)).filter((f) => f.endsWith(".json"));
  } catch {
    return [];
  }
  const profiles = [];
  for (const file of files) {
    try {
      profiles.push(
        JSON.parse(await readFile(join(PROFILES_DIR, file), "utf8")),
      );
    } catch {
      /* skip broken profile */
    }
  }
  return profiles.sort((a, b) => String(a.slug).localeCompare(String(b.slug)));
}

async function exists(path) {
  try {
    await access(path);
    return true;
  } catch {
    return false;
  }
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
