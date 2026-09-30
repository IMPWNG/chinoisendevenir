#!/usr/bin/env node
/**
 * Import 2027 Chinese-language programs from the agency CSV.
 * Existing universities: merge language program only.
 * New universities: create the full admin fiche from CSV + crawled pages.
 *
 * Usage: npx tsx scripts/import-language-programs.ts
 */
import { execFileSync } from "node:child_process";
import { mkdir, writeFile, readFile } from "node:fs/promises";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { createClient } from "@supabase/supabase-js";
import {
  LANGUAGE_UNI_META,
  buildLanguageAdmission,
  dedupeLanguageRecords,
  languageRecordToScanProfile,
  mergeLanguageAdmission,
  parseDocumentLines,
  parseEmails,
  parsePhones,
  parseWebsite,
  type LanguageCsvRecord,
} from "../src/lib/languageProgramImport.ts";
import { profileToRow } from "../src/lib/universityScanImport.ts";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const CSV_PATH = "/Users/matissepro/Desktop/语言班资讯2027.csv";
const USER_AGENT =
  "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36";

async function loadEnv() {
  const text = await readFile(join(ROOT, ".env.local"), "utf8");
  const env: Record<string, string> = {};
  for (const line of text.split("\n")) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#") || !trimmed.includes("=")) continue;
    const i = trimmed.indexOf("=");
    env[trimmed.slice(0, i).trim()] = trimmed.slice(i + 1).trim();
  }
  return env;
}

function parseCsv(): LanguageCsvRecord[] {
  const raw = execFileSync(
    "python3",
    [
      "-c",
      `
import csv, json
from pathlib import Path
p = Path(${JSON.stringify(CSV_PATH)})
with p.open(encoding="utf-8-sig", newline="") as f:
    rows = list(csv.DictReader(f))
out = []
for r in rows:
    out.append({
        "name_zh": (r.get("University ") or r.get("University") or "").strip(),
        "city_raw": (r.get("City") or "").strip(),
        "project": r.get("project") or "",
        "tuition": r.get("Tuition") or "",
        "age": r.get("Age") or "",
        "foundation": r.get("Foundation") or "",
        "dormitory": r.get("Dormitory") or "",
        "deadline": r.get("Deadline") or "",
        "apply_website": (r.get("apply website") or "").strip(),
        "contact": r.get("Contact Information") or "",
        "pathway": r.get("link educational qualifications?") or "",
        "documents": r.get("Documents") or "",
        "note": r.get("Note") or "",
        "scholarship": r.get("scholarship") or "",
    })
print(json.dumps(out, ensure_ascii=False))
`,
    ],
    { encoding: "utf8" },
  );
  return JSON.parse(raw);
}

async function crawlPresentation(urls: string[]) {
  const snippets: string[] = [];
  for (const url of urls.slice(0, 2)) {
    try {
      const page = await fetchPage(url);
      if (page.text.length > 180) {
        snippets.push(page.text.slice(0, 1200));
      }
    } catch {
      /* site down or blocked — CSV remains the source of truth */
    }
  }
  const blob = snippets.join("\n").replace(/\s+/g, " ").trim();
  if (blob.length < 80) return null;
  return blob.slice(0, 700);
}

async function withRetry<T>(label: string, fn: () => Promise<T>) {
  let last: unknown;
  for (let attempt = 1; attempt <= 3; attempt += 1) {
    try {
      return await fn();
    } catch (err) {
      last = err;
      await new Promise((resolve) => setTimeout(resolve, attempt * 800));
    }
  }
  throw new Error(`${label}: ${last}`);
}

async function fetchPage(url: string) {
  const res = await fetch(url, {
    redirect: "follow",
        signal: AbortSignal.timeout(8000),
    headers: {
      "User-Agent": USER_AGENT,
      Accept: "text/html,application/xhtml+xml",
      "Accept-Language": "en-US,en;q=0.9,zh-CN;q=0.8,fr;q=0.7",
    },
  });
  const buf = Buffer.from(await res.arrayBuffer());
  const contentType = res.headers.get("content-type") || "";
  const head = buf.toString("utf8").slice(0, 2000);
  let encoding = (
    contentType.match(/charset=([^\s;]+)/i)?.[1] ||
    head.match(/charset=["']?([a-z0-9-]+)/i)?.[1] ||
    "utf-8"
  ).toLowerCase();
  if (encoding.includes("gb")) encoding = "gb18030";
  let html = "";
  try {
    html = new TextDecoder(encoding).decode(buf);
  } catch {
    html = buf.toString("utf8");
  }
  const text = html
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/gi, " ")
    .replace(/\s+/g, " ")
    .trim();
  return { html, text, status: res.status };
}

function sqlStr(value: unknown) {
  if (value == null || value === "") return "null";
  return `'${String(value).replace(/'/g, "''")}'`;
}

function sqlNum(value: unknown) {
  if (value == null || value === "") return "null";
  const n = Number(value);
  return Number.isFinite(n) ? String(n) : "null";
}

function sqlTextArray(values: unknown[]) {
  const clean = values.map((v) => String(v).trim()).filter(Boolean);
  if (!clean.length) return "'{}'::text[]";
  return `ARRAY[${clean.map(sqlStr).join(", ")}]::text[]`;
}

function sqlJson(value: unknown) {
  return `$lang$${JSON.stringify(value)}$lang$::jsonb`;
}

function existingPatchSql(
  nameZh: string,
  row: LanguageCsvRecord,
  admission: Record<string, unknown>,
) {
  const emails = parseEmails(row.contact);
  const phone = parsePhones(row.contact)[0] || null;
  const website = parseWebsite(row.contact, row.apply_website);
  const age = (admission.age_max as { language?: number | null } | undefined)?.language;
  const fees = admission.fees as { tuition?: { language?: unknown } };
  return `
UPDATE public.universities SET
  extra = jsonb_set(
    jsonb_set(
      jsonb_set(
        jsonb_set(
          coalesce(extra, '{}'::jsonb),
          '{admission,chinese_language_program_available}', 'true'::jsonb, true
        ),
        '{admission,fees,tuition,language}', ${sqlJson(fees?.tuition?.language || null)}, true
      ),
      '{admission,age_max,language}', ${age == null ? "'null'::jsonb" : `'${age}'::jsonb`}, true
    ),
    '{admission,language_session}', ${sqlJson(admission.language_session || null)}, true
  ),
  majors = CASE WHEN 'Langue chinoise' = ANY (majors) THEN majors ELSE array_append(majors, 'Langue chinoise') END,
  emails = (SELECT ARRAY(SELECT DISTINCT e FROM unnest(coalesce(emails, '{}'::text[]) || ${sqlTextArray(emails)}) AS e WHERE e <> '')),
  phone = COALESCE(NULLIF(phone, ''), ${sqlStr(phone)}),
  website = COALESCE(NULLIF(website, ''), ${sqlStr(website)}),
  updated_at = now()
WHERE name_zh = ${sqlStr(nameZh)};`;
}

function insertSql(row: ReturnType<typeof profileToRow>) {
  return `
INSERT INTO public.universities (
  name_zh, name_en, name_fr, slug, city, province, country, department,
  emails, phone, website, notes, is_partner, is_active, majors, required_documents,
  scholarship_amount, min_hsk_level, language_requirements, tuition_min, tuition_max,
  application_deadline, extra
) VALUES (
  ${sqlStr(row.name_zh)}, ${sqlStr(row.name_en)}, ${sqlStr(row.name_fr)}, ${sqlStr(row.slug)},
  ${sqlStr(row.city)}, ${sqlStr(row.province)}, ${sqlStr(row.country)}, ${sqlStr(row.department)},
  ${sqlTextArray(row.emails || [])}, ${sqlStr(row.phone)}, ${sqlStr(row.website)}, ${sqlStr(row.notes)},
  false, true, ${sqlTextArray(row.majors || [])}, ${sqlTextArray(row.required_documents || [])},
  ${sqlStr(row.scholarship_amount)}, ${sqlNum(row.min_hsk_level)}, ${sqlStr(row.language_requirements)},
  ${sqlNum(row.tuition_min)}, ${sqlNum(row.tuition_max)}, ${sqlStr(row.application_deadline)},
  ${sqlJson(row.extra)}
)
ON CONFLICT (name_zh) DO UPDATE SET
  name_en = COALESCE(public.universities.name_en, EXCLUDED.name_en),
  name_fr = COALESCE(public.universities.name_fr, EXCLUDED.name_fr),
  slug = COALESCE(public.universities.slug, EXCLUDED.slug),
  emails = (SELECT ARRAY(SELECT DISTINCT e FROM unnest(coalesce(public.universities.emails, '{}'::text[]) || EXCLUDED.emails) AS e WHERE e <> '')),
  phone = COALESCE(NULLIF(public.universities.phone, ''), EXCLUDED.phone),
  website = COALESCE(NULLIF(public.universities.website, ''), EXCLUDED.website),
  majors = (SELECT ARRAY(SELECT DISTINCT m FROM unnest(coalesce(public.universities.majors, '{}'::text[]) || EXCLUDED.majors) AS m WHERE m <> '')),
  required_documents = EXCLUDED.required_documents,
  extra = jsonb_set(
    jsonb_set(
      coalesce(public.universities.extra, '{}'::jsonb),
      '{admission,language_session}',
      EXCLUDED.extra #> '{admission,language_session}',
      true
    ),
    '{admission,documents}',
    EXCLUDED.extra #> '{admission,documents}',
    true
  ),
  notes = COALESCE(NULLIF(public.universities.notes, ''), EXCLUDED.notes),
  tuition_min = COALESCE(public.universities.tuition_min, EXCLUDED.tuition_min),
  tuition_max = COALESCE(public.universities.tuition_max, EXCLUDED.tuition_max),
  application_deadline = COALESCE(NULLIF(public.universities.application_deadline, ''), EXCLUDED.application_deadline),
  updated_at = now();`;
}

async function main() {
  const sqlOnly = process.argv.includes("--sql");
  const noCrawl = process.argv.includes("--no-crawl");
  const env = sqlOnly ? {} : await loadEnv();
  const url = env.SUPABASE_URL || env.NEXT_PUBLIC_SUPABASE_URL;
  const key = env.SUPABASE_SERVICE_ROLE_KEY;
  if (!sqlOnly && (!url || !key)) throw new Error("Variables Supabase manquantes");

  const records = dedupeLanguageRecords(parseCsv().filter((r) => r.name_zh));
  const unknown = records.filter((r) => !LANGUAGE_UNI_META[r.name_zh]);
  if (unknown.length) {
    throw new Error(`Universités non mappées : ${unknown.map((r) => r.name_zh).join(", ")}`);
  }

  const admin = sqlOnly
    ? null
    : createClient(url!, key!, {
        auth: { persistSession: false, autoRefreshToken: false },
      });
  const existingRows: Array<Record<string, unknown>> = [];
  if (admin) {
    const { data: existing, error: fetchError } = await admin
      .from("universities")
      .select("*");
    if (fetchError) throw fetchError;
    existingRows.push(...((existing || []) as Array<Record<string, unknown>>));
  }
  const statements: string[] = [];

  const profilesDir = join(ROOT, "data/universities/profiles");
  await mkdir(profilesDir, { recursive: true });

  let inserted = 0;
  let updated = 0;
  const failed: string[] = [];

  for (const row of records) {
    try {
      const meta = LANGUAGE_UNI_META[row.name_zh];
      const match = existingRows.find((u) => u.name_zh === row.name_zh);
      const presentation = noCrawl
        ? null
        : await crawlPresentation(
            [...meta.seed_urls, parseWebsite(row.contact, row.apply_website) || ""].filter(
              Boolean,
            ),
          );
      const admission = buildLanguageAdmission(row, { presentation });

      if (sqlOnly) {
        if (meta.existing) {
          statements.push(existingPatchSql(row.name_zh, row, admission));
          updated += 1;
          console.log(`sql langue  ${row.name_zh}`);
        } else {
          const profile = languageRecordToScanProfile(row, meta, { presentation });
          await writeFile(
            join(profilesDir, `${meta.slug}.json`),
            JSON.stringify(profile, null, 2),
            "utf8",
          );
          const incoming = profileToRow(profile);
          incoming.required_documents = parseDocumentLines(row.documents);
          incoming.extra = {
            ...incoming.extra,
            admission: {
              ...(incoming.extra.admission as Record<string, unknown>),
              ...admission,
              presentation:
                (incoming.extra.admission as { presentation?: string | null })
                  ?.presentation || admission.presentation,
            },
          };
          incoming.notes =
            [row.pathway, row.note].filter(Boolean).join("\n") || incoming.notes;
          incoming.majors = [
            ...new Set([...(incoming.majors || []), "Langue chinoise"]),
          ];
          statements.push(insertSql(incoming));
          inserted += 1;
          console.log(`sql create  ${row.name_zh}`);
        }
        continue;
      }

      if (match?.id && meta.existing) {
        const extra = mergeLanguageAdmission(
          match.extra && typeof match.extra === "object"
            ? (match.extra as Record<string, unknown>)
            : {},
          admission,
        );
        const emails = [
          ...new Set([
            ...((match.emails as string[]) || []),
            ...parseEmails(row.contact),
          ]),
        ];
        await withRetry(`update ${row.name_zh}`, async () => {
          const { error } = await admin!
            .from("universities")
            .update({
              extra,
              emails,
              phone: match.phone || parsePhones(row.contact)[0] || null,
              website: match.website || parseWebsite(row.contact, row.apply_website),
              majors: [
                ...new Set([
                  ...((match.majors as string[]) || []),
                  "Langue chinoise",
                ]),
              ],
              notes: match.notes,
              updated_at: new Date().toISOString(),
            })
            .eq("id", match.id);
          if (error) throw new Error(error.message || JSON.stringify(error));
        });
        updated += 1;
        console.log(`langue  ${row.name_zh}`);
        continue;
      }

      const profile = languageRecordToScanProfile(row, meta, { presentation });
      await writeFile(
        join(profilesDir, `${meta.slug}.json`),
        JSON.stringify(profile, null, 2),
        "utf8",
      );
      const incoming = profileToRow(profile);
      incoming.required_documents = parseDocumentLines(row.documents);
      incoming.extra = {
        ...incoming.extra,
        admission: {
          ...(incoming.extra.admission as Record<string, unknown>),
          ...admission,
          presentation:
            (incoming.extra.admission as { presentation?: string | null })
              ?.presentation || admission.presentation,
        },
      };
      incoming.notes =
        [row.pathway, row.note].filter(Boolean).join("\n") || incoming.notes;
      incoming.majors = [...new Set([...(incoming.majors || []), "Langue chinoise"])];

      if (match?.id) {
        const extra = mergeLanguageAdmission(
          match.extra && typeof match.extra === "object"
            ? (match.extra as Record<string, unknown>)
            : incoming.extra,
          incoming.extra.admission as Record<string, unknown>,
        );
        await withRetry(`update ${row.name_zh}`, async () => {
          const { error } = await admin!
            .from("universities")
            .update({
              ...incoming,
              extra,
              is_partner: match.is_partner === true,
              is_active: match.is_active !== false,
              emails: [
                ...new Set([
                  ...((match.emails as string[]) || []),
                  ...(incoming.emails || []),
                ]),
              ],
              updated_at: new Date().toISOString(),
            })
            .eq("id", match.id);
          if (error) throw new Error(error.message || JSON.stringify(error));
        });
        updated += 1;
        console.log(`update  ${row.name_zh}`);
      } else {
        await withRetry(`insert ${row.name_zh}`, async () => {
          const { error } = await admin!.from("universities").insert({
            ...incoming,
            is_partner: false,
            is_active: true,
          });
          if (error) throw new Error(error.message || JSON.stringify(error));
        });
        inserted += 1;
        console.log(`create  ${row.name_zh}`);
      }
    } catch (err) {
      failed.push(row.name_zh);
      console.error(`FAIL    ${row.name_zh}:`, err instanceof Error ? err.message : err);
    }
  }

  if (sqlOnly) {
    const sqlPath = join(ROOT, "data/universities/raw/language-2027.sql");
    await writeFile(sqlPath, statements.join("\n"), "utf8");
    console.log(`\nSQL écrit : ${sqlPath}`);
  }

  console.log(
    `\nTerminé — ${inserted} créées, ${updated} programmes de langue ajoutés${failed.length ? `, ${failed.length} échecs (${failed.join(", ")})` : ""}.`,
  );
  if (failed.length) process.exitCode = 1;
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
