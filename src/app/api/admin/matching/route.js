import { NextResponse } from "next/server";
import { getAuthenticatedAdmin } from "@/lib/studentAuth";
import { requireFullAdmin } from "@/lib/adminRoles";
import {
  getRequiredDocumentsStatus,
  listAdminSentDocuments,
} from "@/lib/studentDocuments";
import { runMatching } from "@/lib/matching/run";
import {
  appendMessageToNotes,
  compactMatchingResult,
  listMatchingRuns,
  matchingSummary,
  saveMatchingRun,
} from "@/lib/matching/persist";

export async function GET(request) {
  try {
    const auth = await getAuthenticatedAdmin(request);
    if (auth.error) {
      return NextResponse.json({ error: auth.error }, { status: auth.status });
    }
    const forbidden = requireFullAdmin(auth);
    if (forbidden) {
      return NextResponse.json(
        { error: forbidden.error },
        { status: forbidden.status },
      );
    }

    const contactId = String(
      request.nextUrl.searchParams.get("contactId") || "",
    ).trim();
    if (!contactId) {
      return NextResponse.json({ error: "contactId manquant" }, { status: 400 });
    }

    const runs = await listMatchingRuns(auth.admin, contactId);
    return NextResponse.json({
      success: true,
      runs,
      latest: runs[0] || null,
    });
  } catch (error) {
    console.error("matching GET:", error);
    return NextResponse.json(
      { error: "Lecture impossible" },
      { status: 500 },
    );
  }
}

export async function POST(request) {
  try {
    const auth = await getAuthenticatedAdmin(request);
    if (auth.error) {
      return NextResponse.json({ error: auth.error }, { status: auth.status });
    }
    const forbidden = requireFullAdmin(auth);
    if (forbidden) {
      return NextResponse.json(
        { error: forbidden.error },
        { status: forbidden.status },
      );
    }

    const body = await request.json().catch(() => ({}));
    const contactId = String(body.contactId || "").trim();
    if (!contactId) {
      return NextResponse.json({ error: "contactId manquant" }, { status: 400 });
    }

    if (body.saveNotes) {
      const message = String(body.client_message || "").trim();
      if (!message) {
        return NextResponse.json(
          { error: "Aucun message à enregistrer" },
          { status: 400 },
        );
      }
      const notes = await appendMessageToNotes(auth.admin, contactId, message);
      await auth.admin.from("suivi_actions").insert({
        contact_id: contactId,
        action: "note_ajoutee",
        description: "Réponse matching enregistrée dans les notes.",
        user_admin: auth.user?.email || "admin",
      });
      return NextResponse.json({ success: true, notes_admin: notes });
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
    let adminDocuments = [];
    try {
      [documents, adminDocuments] = await Promise.all([
        getRequiredDocumentsStatus(auth.admin, contactId),
        listAdminSentDocuments(auth.admin, contactId),
      ]);
    } catch {
      documents = [];
      adminDocuments = [];
    }
    const result = await runMatching({
      contact,
      universities,
      documents,
      adminDocuments,
      overrides: body.overrides || {},
      forceBilan: Boolean(body.forceBilan),
    });

    const payload = compactMatchingResult(result, body.overrides || {});
    let saved = null;
    try {
      saved = await saveMatchingRun(auth.admin, {
        contactId,
        createdBy: auth.user?.email || "admin",
        payload,
      });
    } catch (saveError) {
      console.warn("Matching save failed:", saveError.message);
      return NextResponse.json({
        success: true,
        saved: null,
        save_error: saveError.message,
        ...result,
      });
    }

    try {
      await auth.admin.from("suivi_actions").insert({
        contact_id: contactId,
        action: "note_ajoutee",
        description: matchingSummary(payload),
        user_admin: auth.user?.email || "admin",
      });
    } catch {
      // history is optional
    }

    return NextResponse.json({
      success: true,
      saved,
      ...result,
    });
  } catch (error) {
    console.error("matching POST:", error);
    return NextResponse.json(
      { error: "Matching impossible" },
      { status: 500 },
    );
  }
}
