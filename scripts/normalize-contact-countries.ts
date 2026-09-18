/**
 * Rewrite contacts.pays to the canonical French name.
 * Run: npx tsx --env-file=.env.local scripts/normalize-contact-countries.ts
 */
import { createClient } from "@supabase/supabase-js";
import { canonicalCountry } from "../src/lib/countries";

const url =
  process.env.SUPABASE_URL ||
  process.env.NEXT_PUBLIC_SUPABASE_URL ||
  process.env.VITE_SUPABASE_URL ||
  "";
const key = process.env.SUPABASE_SERVICE_ROLE_KEY || "";

if (!url || !key) {
  console.error("Variables Supabase admin manquantes");
  process.exit(1);
}

const supabase = createClient(url, key, {
  auth: { persistSession: false, autoRefreshToken: false },
});

async function main() {
  const { data, error } = await supabase.from("contacts").select("id, pays");
  if (error) {
    console.error(error.message);
    process.exit(1);
  }

  let updated = 0;
  let unknown = 0;
  for (const row of data || []) {
    const current = String(row.pays || "").trim();
    if (!current) continue;
    const next = canonicalCountry(current);
    if (!next) {
      unknown += 1;
      console.log("inconnu:", current);
      continue;
    }
    if (next === current) continue;
    const { error: updateError } = await supabase
      .from("contacts")
      .update({ pays: next })
      .eq("id", row.id);
    if (updateError) {
      console.error("update", row.id, updateError.message);
      process.exit(1);
    }
    updated += 1;
    console.log(`${current} -> ${next}`);
  }

  console.log(`pays normalisés: ${updated}, inconnus laissés tels quels: ${unknown}`);
}

main();
