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
    console.log("🔍 DEBUG ENV:");
    console.log("SUPABASE_URL:", process.env.SUPABASE_URL);
    console.log(
      "SUPABASE_SERVICE_KEY length:",
      process.env.SUPABASE_SERVICE_KEY?.length,
    );
    console.log("BREVO_API_KEY length:", process.env.BREVO_API_KEY?.length);
    console.log("BREVO_LIST_ID:", process.env.BREVO_LIST_ID);
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

  try {
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

    console.log("📝 Données reçues:", {
      prenom,
      nom,
      email,
      phone,
      age,
      pays,
    });

    const formattedPhone = formatPhone(phone);
    console.log("📱 Phone formaté:", formattedPhone);

    // ── Validation ──
    if (!prenom || !nom || !email || !phone) {
      console.log("❌ Validation échouée - données manquantes");
      return res.status(400).json({
        error: "Prénom, nom, email et téléphone requis.",
      });
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      console.log("❌ Email invalide:", email);
      return res.status(400).json({ error: "Email invalide." });
    }

    // ── Vérifier les variables d'environnement ──
    console.log("🔑 Variables d'environnement:");
    console.log("   SUPABASE_URL:", process.env.SUPABASE_URL ? "✓" : "✗");
    console.log(
      "   SUPABASE_SERVICE_KEY:",
      process.env.SUPABASE_SERVICE_KEY ? "✓" : "✗",
    );
    console.log("   BREVO_API_KEY:", process.env.BREVO_API_KEY ? "✓" : "✗");
    console.log("   BREVO_LIST_ID:", process.env.BREVO_LIST_ID ? "✓" : "✗");

    // ── 1. Supabase ──
    console.log("🚀 Étape 1: Supabase...");
    const supabase = createClient(
      process.env.SUPABASE_URL,
      process.env.SUPABASE_SERVICE_KEY,
    );

    const { data, error: supabaseError } = await supabase
      .from("contacts")
      .upsert(
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
      console.error("❌ Supabase error:", supabaseError);
      return res.status(500).json({
        error: "Erreur base de données.",
        details: supabaseError.message,
      });
    }

    console.log("✅ Supabase OK:", data);

    // ── 2. Brevo ──
    console.log("🚀 Étape 2: Brevo...");

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

    console.log("📤 Payload Brevo:", JSON.stringify(brevoPayload, null, 2));

    try {
      const brevoRes = await fetch("https://api.brevo.com/v3/contacts", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "api-key": process.env.BREVO_API_KEY,
        },
        body: JSON.stringify(brevoPayload),
      });

      const brevoText = await brevoRes.text();

      console.log("🔄 Brevo Response Status:", brevoRes.status);
      console.log("📄 Brevo Response Body:", brevoText);

      if (!brevoRes.ok) {
        console.error("⚠️ Brevo API error (non-bloquant):", brevoText);
      } else {
        console.log("✅ Brevo OK");
      }
    } catch (brevoErr) {
      console.error("⚠️ Brevo request error (non-bloquant):", brevoErr.message);
    }

    // ✅ Réponse réussie
    console.log("🎉 Succès!");
    return res.status(200).json({
      success: true,
      message: "Formulaire soumis avec succès",
    });
  } catch (error) {
    console.error("💥 Handler error:", error);
    console.error("Stack:", error.stack);
    return res.status(500).json({
      error: "Erreur serveur. Veuillez réessayer.",
      details: error.message,
    });
  }
}
