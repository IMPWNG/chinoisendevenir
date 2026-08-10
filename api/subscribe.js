import https from "https";
import { createClient } from "@supabase/supabase-js";

function formatPhone(num) {
  if (!num) return null;
  let clean = num.replace(/\s|-|\./g, "");
  if (clean.startsWith("0")) clean = "+33" + clean.slice(1);
  if (!clean.startsWith("+")) clean = "+" + clean;
  return clean;
}

export default async function handler(req, res) {
  // ── CORS Headers ──
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

  // ── Récupérer les données ──
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

  const formattedPhone = formatPhone(phone);

  // ── Validation ──
  if (!prenom || !nom || !email || !phone) {
    return res.status(400).json({
      error: "Prénom, nom, email et téléphone requis.",
    });
  }

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return res.status(400).json({ error: "Email invalide." });
  }

  try {
    // ── 1. Supabase ──
    const supabase = createClient(
      process.env.SUPABASE_URL,
      process.env.SUPABASE_SERVICE_KEY,
    );

    const { error: supabaseError } = await supabase.from("contacts").upsert(
      {
        prenom,
        nom,
        age: age ? parseInt(age, 10) : null,
        pays,
        email,
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

    // ── 2. Brevo (async avec fetch moderne) ──
    try {
      const brevoPayload = {
        email,
        attributes: {
          FIRSTNAME: prenom,
          LASTNAME: nom,
          ...(age && { AGE: parseInt(age, 10) }),
          ...(pays && { PAYS: pays }),
          ...(formattedPhone && { SMS: formattedPhone }),
          ...(domaineEtudes && { DOMAINE_ETUDES: domaineEtudes }),
          ...(budget && { BUDGET: budget }),
          ...(dateRentree && { DATE_RENTREE: dateRentree }),
        },
        listIds: [parseInt(process.env.BREVO_LIST_ID, 10)],
        updateEnabled: true,
      };

      const brevoRes = await fetch("https://api.brevo.com/v3/contacts", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "api-key": process.env.BREVO_API_KEY,
        },
        body: JSON.stringify(brevoPayload),
      });

      if (!brevoRes.ok) {
        const brevoError = await brevoRes.text();
        console.error("Brevo API error:", brevoError);
        // On ne bloque pas si Brevo échoue
      }
    } catch (brevoErr) {
      console.error("Brevo request error:", brevoErr.message);
      // On continue quand même
    }

    // ✅ Réponse réussie
    return res.status(200).json({
      success: true,
      message: "Formulaire soumis avec succès",
    });
  } catch (error) {
    console.error("Handler error:", error);
    return res.status(500).json({
      error: "Erreur serveur. Veuillez réessayer.",
    });
  }
}
