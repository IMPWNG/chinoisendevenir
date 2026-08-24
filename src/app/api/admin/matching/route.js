import { NextResponse } from "next/server";
import { getAuthenticatedAdmin } from "@/lib/studentAuth";
import { getRequiredDocumentsStatus } from "@/lib/studentDocuments";
import { runMatching } from "@/lib/matching/run";

export async function POST(request) {
  try {
    const auth = await getAuthenticatedAdmin(request);
    if (auth.error) {
      return NextResponse.json({ error: auth.error }, { status: auth.status });
    }

    const body = await request.json().catch(() => ({}));
    const contactId = String(body.contactId || "").trim();
    if (!contactId) {
      return NextResponse.json({ error: "contactId manquant" }, { status: 400 });
    }

    const [{ data: contact, error: contactError }, { data: universities, error: uniError }] =
      await Promise.all([
        auth.admin.from("contacts").select("*").eq("id", contactId).maybeSingle(),
        auth.admin.from("universities").select("*").order("name_zh", { ascending: true }),
      ]);

    if (contactError) throw contactError;
    if (!contact) {
      return NextResponse.json({ error: "Étudiant introuvable" }, { status: 404 });
    }
    if (uniError) throw uniError;
    if (!universities?.length) {
      return NextResponse.json(
        { error: "Aucune université en base. Importez d'abord le catalogue." },
        { status: 400 },
      );
    }

    let documents = [];
    try {
      documents = await getRequiredDocumentsStatus(auth.admin, contactId);
    } catch {
      documents = [];
    }
    const result = await runMatching({
      contact,
      universities,
      documents,
      overrides: body.overrides || {},
    });

    try {
      const top = result.matches[0];
      await auth.admin.from("suivi_actions").insert({
        contact_id: contactId,
        action: "matching",
        description: top
          ? `Matching ${result.matches.length} universités. Top : ${top.university_name} (${top.score}/100, ${top.category}). Formule recommandée : ${result.recommended_formula}.`
          : "Matching lancé : aucune université compatible.",
        user_admin: auth.user?.email || "admin",
      });
    } catch {
      // history is optional
    }

    return NextResponse.json({ success: true, ...result });
  } catch (error) {
    return NextResponse.json(
      { error: error.message || "Matching impossible" },
      { status: 500 },
    );
  }
}
