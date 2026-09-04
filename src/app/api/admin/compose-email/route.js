import { NextResponse } from "next/server";
import { getAuthenticatedAdmin } from "@/lib/studentAuth";
import { composeEmailWithAi } from "@/lib/emailCompose";
import { rateLimit } from "@/lib/httpSecurity";

export async function POST(request) {
  try {
    const auth = await getAuthenticatedAdmin(request);
    if (auth.error) {
      return NextResponse.json(
        { success: false, error: auth.error },
        { status: auth.status || 403 },
      );
    }

    const limited = rateLimit({
      key: `compose-email:${auth.user.id}`,
      limit: 20,
      windowMs: 10 * 60 * 1000,
    });
    if (!limited.ok) {
      return NextResponse.json(
        { success: false, error: "Trop de requêtes. Réessayez plus tard." },
        { status: 429, headers: { "Retry-After": String(limited.retryAfter) } },
      );
    }

    const body = await request.json().catch(() => ({}));
    const contactId = String(body.contactId || "").trim();
    const notes = String(body.notes || "").trim();

    if (!contactId) {
      return NextResponse.json(
        { success: false, error: "contactId manquant" },
        { status: 400 },
      );
    }
    if (notes.length < 8) {
      return NextResponse.json(
        { success: false, error: "Écrivez d'abord ce que vous voulez dire." },
        { status: 400 },
      );
    }
    if (notes.length > 4000) {
      return NextResponse.json(
        { success: false, error: "Le texte est trop long (4000 caractères max)." },
        { status: 400 },
      );
    }

    const { data: contact, error } = await auth.admin
      .from("contacts")
      .select("id, prenom, nom, domaine_etudes, formule, suivi_statut")
      .eq("id", contactId)
      .maybeSingle();

    if (error) throw error;
    if (!contact) {
      return NextResponse.json(
        { success: false, error: "Contact introuvable" },
        { status: 404 },
      );
    }

    const composed = await composeEmailWithAi({ notes, contact });
    if (!composed.ok) {
      return NextResponse.json(
        { success: false, error: composed.error },
        { status: 502 },
      );
    }

    return NextResponse.json({
      success: true,
      subject: composed.subject,
      title: composed.title,
      subtitle: composed.subtitle,
      body: composed.body,
    });
  } catch (error) {
    console.error("compose-email:", error);
    return NextResponse.json(
      { success: false, error: "Rédaction impossible" },
      { status: 500 },
    );
  }
}
