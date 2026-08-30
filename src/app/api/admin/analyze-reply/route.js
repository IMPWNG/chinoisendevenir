import { NextResponse } from "next/server";
import { getAuthenticatedAdmin } from "@/lib/studentAuth";
import { rateLimit } from "@/lib/httpSecurity";
import { processAppointmentReply } from "@/lib/appointmentReply";

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
      key: `analyze-reply:${auth.user.id}`,
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
    if (!contactId) {
      return NextResponse.json(
        { success: false, error: "contactId manquant" },
        { status: 400 },
      );
    }

    const { data: contact, error } = await auth.admin
      .from("contacts")
      .select("id, prenom, nom, email, domaine_etudes, formule, suivi_statut")
      .eq("id", contactId)
      .maybeSingle();

    if (error) throw error;
    if (!contact) {
      return NextResponse.json(
        { success: false, error: "Contact introuvable" },
        { status: 404 },
      );
    }

    let replyText = String(body.text || "").trim();
    if (!replyText) {
      const { data: actions } = await auth.admin
        .from("suivi_actions")
        .select("description, created_at")
        .eq("contact_id", contactId)
        .eq("action", "reponse_client")
        .order("created_at", { ascending: false })
        .limit(1);
      replyText = String(actions?.[0]?.description || "").trim();
    }

    if (replyText.length < 8) {
      return NextResponse.json(
        {
          success: false,
          error: "Aucune réponse récente à analyser. Collez le message de l'étudiant.",
        },
        { status: 400 },
      );
    }

    const result = await processAppointmentReply({
      client: auth.admin,
      contact,
      replyText,
      userAdmin: auth.user.email,
    });

    if (!result.ok) {
      return NextResponse.json(
        { success: false, error: result.error },
        { status: result.missingTable ? 503 : 502 },
      );
    }

    return NextResponse.json({
      success: true,
      skipped: Boolean(result.skipped),
      isAppointmentReply: Boolean(result.isAppointmentReply),
      appointment: result.appointment || null,
      draft: result.draft || null,
      analysis: result.analysis || null,
    });
  } catch (error) {
    console.error("analyze-reply:", error);
    return NextResponse.json(
      { success: false, error: "Analyse impossible" },
      { status: 500 },
    );
  }
}
