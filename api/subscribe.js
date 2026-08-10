import { createClient } from "@supabase/supabase-js";

function formatPhone(num) {
  if (!num) return null;
  let clean = num.replace(/\s|-|\./g, "");
  if (clean.startsWith("0")) clean = "+33" + clean.slice(1);
  if (!clean.startsWith("+")) clean = "+" + clean;
  return clean;
}

export default async function handler(req, res) {
  // ── CORS ──
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

  try {
    // ── Vérifier les env vars ──
    if (!process.env.SUPABASE_URL || !process.env.SUPABASE_SERVICE_KEY) {
      throw new Error("Supabase env vars manquantes");
    }
    if (!process.env.BREVO_API_KEY || !process.env.BREVO_LIST_ID) {
      throw new Error("Brevo env vars manquantes");
    }

    const {
      prenom,
      nom,
      age,
      pays,
      email,
      phone,
      domaineEtudes,
      budget,
      dateRentree,
      source = "website",
    } = req.body || {};

    // ── Validation ──
    if (!prenom?.trim() || !nom?.trim() || !email?.trim() || !phone?.trim()) {
      return res
        .status(400)
        .json({ error: "Prénom, nom, email et téléphone requis." });
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return res.status(400).json({ error: "Email invalide." });
    }

    const formattedPhone = formatPhone(phone);

    // ── 1. Supabase ──
    const supabase = createClient(
      process.env.SUPABASE_URL,
      process.env.SUPABASE_SERVICE_KEY,
    );

    const { error: supabaseError } = await supabase.from("contacts").upsert(
      {
        prenom: prenom.trim(),
        nom: nom.trim(),
        age: age ? parseInt(age, 10) : null,
        pays,
        email: email.trim(),
        phone: formattedPhone,
        domaine_etudes: domaineEtudes || null,
        budget: budget || null,
        date_rentree: dateRentree || null,
        source,
      },
      { onConflict: "email" },
    );

    if (supabaseError) {
      console.error("Supabase error:", supabaseError);
      return res.status(500).json({ error: "Erreur base de données." });
    }

    // ── 2. Brevo (non-bloquant) ──
    const listId = parseInt(process.env.BREVO_LIST_ID, 10);
    if (!isNaN(listId)) {
      try {
        await fetch("https://api.brevo.com/v3/contacts", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "api-key": process.env.BREVO_API_KEY,
          },
          body: JSON.stringify({
            email: email.trim(),
            attributes: {
              FIRSTNAME: prenom.trim(),
              LASTNAME: nom.trim(),
              ...(age && { AGE: parseInt(age, 10) }),
              ...(pays && { PAYS: pays }),
              ...(formattedPhone && { SMS: formattedPhone }),
              ...(domaineEtudes && { DOMAINE_ETUDES: domaineEtudes }),
              ...(budget && { BUDGET: budget }),
              ...(dateRentree && { DATE_RENTREE: dateRentree }),
            },
            listIds: [listId],
            updateEnabled: true,
          }),
        });
      } catch (brevoErr) {
        console.error("Brevo error (non-bloquant):", brevoErr.message);
      }
    }

    // ✅ Succès
    return res
      .status(200)
      .json({ success: true, message: "Formulaire soumis avec succès" });
  } catch (error) {
    console.error("Handler error:", error);
    return res
      .status(500)
      .json({ error: "Erreur serveur. Veuillez réessayer." });
  }
}
