import { createClient } from "@supabase/supabase-js";

function formatPhone(num) {
  if (!num) return null;
  let clean = num.replace(/\s|-|\./g, "");
  if (clean.startsWith("0")) clean = "+33" + clean.slice(1);
  if (!clean.startsWith("+")) clean = "+" + clean;
  return clean;
}

export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") {
    res.status(204).end();
    return;
  }
  if (req.method !== "POST") {
    res.status(405).json({ error: "Method not allowed" });
    return;
  }

  const { prenom, email, phone, source = "website" } = req.body || {};
  const formattedPhone = formatPhone(phone);

  if (!prenom || !email) {
    res.status(400).json({ error: "Prénom et email requis." });
    return;
  }

  // ── 1. Supabase ──
  try {
    const supabase = createClient(
      process.env.SUPABASE_URL,
      process.env.SUPABASE_ANON_KEY,
    );

    const { error: supabaseError } = await supabase
      .from("contacts")
      .upsert(
        { prenom, email, phone: formattedPhone, source },
        { onConflict: "email" },
      );

    if (supabaseError) {
      console.error("Supabase error:", supabaseError);
      res
        .status(500)
        .json({ error: "Erreur base de données: " + supabaseError.message });
      return;
    }
  } catch (e) {
    console.error("Supabase crash:", e.message);
    res.status(500).json({ error: "Erreur serveur: " + e.message });
    return;
  }

  // ── 2. Brevo via fetch natif (Node 18+) ──
  try {
    await fetch("https://api.brevo.com/v3/contacts", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "api-key": process.env.BREVO_API_KEY,
      },
      body: JSON.stringify({
        email,
        attributes: {
          FIRSTNAME: prenom,
          ...(formattedPhone && { SMS: formattedPhone }),
        },
        listIds: [parseInt(process.env.BREVO_LIST_ID, 10)],
        updateEnabled: true,
      }),
    });
  } catch (e) {
    console.error("Brevo error:", e.message);
    // Supabase a déjà enregistré — on retourne success quand même
  }

  res.status(200).json({ success: true });
}
