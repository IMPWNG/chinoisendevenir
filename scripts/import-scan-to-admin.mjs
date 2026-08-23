#!/usr/bin/env node
import { readFile } from "node:fs/promises";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { createClient } from "@supabase/supabase-js";
import { importScanCatalog } from "../src/lib/universityScanImport.js";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");

async function loadEnv() {
  const text = await readFile(join(ROOT, ".env.local"), "utf8");
  const env = {};
  for (const line of text.split(/\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#") || !trimmed.includes("=")) continue;
    const i = trimmed.indexOf("=");
    env[trimmed.slice(0, i).trim()] = trimmed.slice(i + 1).trim();
  }
  return env;
}

const env = await loadEnv();
const url = env.SUPABASE_URL || env.NEXT_PUBLIC_SUPABASE_URL;
const key = env.SUPABASE_SERVICE_ROLE_KEY;
if (!url || !key) throw new Error("Variables Supabase manquantes");

const catalog = JSON.parse(
  await readFile(join(ROOT, "data/universities/catalog.json"), "utf8"),
);
const admin = createClient(url, key, {
  auth: { persistSession: false, autoRefreshToken: false },
});

const result = await importScanCatalog(admin, catalog);
console.log(
  `Import OK — ${result.updated} fiches complétées, ${result.inserted} ajoutées (scan ${result.scanned}).`,
);
