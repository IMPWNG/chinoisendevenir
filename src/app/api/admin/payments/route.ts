import { NextResponse } from "next/server";
import { getAuthenticatedAdmin } from "@/lib/studentAuth";
import { readPaymentState } from "@/lib/paymentRecords";

export async function GET(request: Request) {
  try {
    const auth = await getAuthenticatedAdmin(request);
    if ("error" in auth) {
      return NextResponse.json({ error: auth.error }, { status: auth.status });
    }

    const contactId = new URL(request.url).searchParams.get("contactId")?.trim() || "";
    if (!contactId) {
      return NextResponse.json({ error: "Dossier manquant." }, { status: 400 });
    }

    const contactResult = await auth.admin
      .from("contacts")
      .select("id, email, prenom, nom, formule, notes_admin, suivi_statut")
      .eq("id", contactId)
      .maybeSingle();
    if (contactResult.error || !contactResult.data) {
      return NextResponse.json({ error: "Dossier introuvable." }, { status: 404 });
    }

    const state = await readPaymentState(auth.admin, contactResult.data);
    return NextResponse.json({ success: true, ...state });
  } catch (error) {
    console.error("admin payments:", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
