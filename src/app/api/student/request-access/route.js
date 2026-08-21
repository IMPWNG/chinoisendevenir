import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabaseAdmin";

export async function POST(request) {
  try {
    const { email } = await request.json();
    const normalized = String(email || "")
      .trim()
      .toLowerCase();

    if (!normalized || !normalized.includes("@")) {
      return NextResponse.json({ error: "Email invalide" }, { status: 400 });
    }

    const admin = getSupabaseAdmin();
    const { data: rows, error } = await admin
      .from("contacts")
      .select("id, email")
      .ilike("email", normalized)
      .limit(1);

    if (error) {
      return NextResponse.json(
        { error: "Erreur de vérification" },
        { status: 500 },
      );
    }

    if (!rows?.[0]) {
      return NextResponse.json(
        {
          error:
            "Aucun dossier trouvé pour cet email. Utilisez l'adresse enregistrée lors de votre inscription.",
        },
        { status: 404 },
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
