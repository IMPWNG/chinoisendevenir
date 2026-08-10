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
    res.status(400).json({ error: "Prénom, nom, email et téléphone requis." });
    return;
  }

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    res.status(400).json({ error: "Email invalide." });
    return;
  }

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
    res.status(500).json({ error: "Erreur base de données." });
    return;
  }

  // ── 2. Brevo ──
  const payload = JSON.stringify({
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
  });

  return new Promise((resolve) => {
    const options = {
      hostname: "api.brevo.com",
      path: "/v3/contacts",
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "api-key": process.env.BREVO_API_KEY,
        "Content-Length": Buffer.byteLength(payload),
      },
    };

    const brevoReq = https.request(options, (brevoRes) => {
      let data = "";
      brevoRes.on("data", (chunk) => (data += chunk));
      brevoRes.on("end", () => {
        res.status(200).json({ success: true });
        resolve();
      });
    });

    brevoReq.on("error", (e) => {
      console.error("Brevo error:", e.message);
      res.status(200).json({ success: true });
      resolve();
    });

    brevoReq.write(payload);
    brevoReq.end();
  });
}
