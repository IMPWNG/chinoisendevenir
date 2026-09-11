import { NextResponse } from "next/server";
import { getClientIp, rateLimit } from "@/lib/httpSecurity";
import { getFormuleByNumber } from "@/lib/formules";
import {
  canStudentChooseFormule,
  getChosenFormule,
  hasFilledLeadForm,
  mergeFormuleNote,
} from "@/lib/studentProgress";
import {
  getAuthenticatedContact,
  publicStudentProfile,
} from "@/lib/studentAuth";
import { shouldAdvanceStatus, toStoredStatut } from "@/lib/suiviStatuts";

export async function POST(request) {
  try {
    const auth = await getAuthenticatedContact(request);
    if (auth.error) {
      return NextResponse.json({ error: auth.error }, { status: auth.status });
    }

    const limited = rateLimit({
      key: `student-formule:${auth.user.id || getClientIp(request.headers)}`,
      limit: 20,
      windowMs: 15 * 60 * 1000,
    });
    if (!limited.ok) {
      return NextResponse.json(
        { error: "Trop de requêtes. Réessayez plus tard." },
        { status: 429, headers: { "Retry-After": String(limited.retryAfter) } },
      );
    }

    if (!auth.contact || !hasFilledLeadForm(auth.contact)) {
      return NextResponse.json(
        { error: "Complétez d'abord le formulaire de projet." },
        { status: 400 },
      );
    }

    if (!canStudentChooseFormule(auth.contact)) {
      return NextResponse.json(
        { error: "La formule ne peut plus être modifiée." },
        { status: 409 },
      );
    }

    const body = await request.json().catch(() => ({}));
    const formule = getFormuleByNumber(Number(body.number));
    if (!formule) {
      return NextResponse.json(
        { error: "Formule invalide." },
        { status: 400 },
      );
    }

    const currentFormule = getChosenFormule(auth.contact);
    if (currentFormule === formule.value) {
      return NextResponse.json({
        success: true,
        profile: publicStudentProfile(auth.contact, auth.user.email),
      });
    }

    const notes = mergeFormuleNote(auth.contact.notes_admin, formule.value);
    const payloadBase = {
      formule: formule.value,
      notes_admin: notes,
    };

    if (shouldAdvanceStatus(auth.contact.suivi_statut, "formules_présentées")) {
      payloadBase.suivi_statut = toStoredStatut("formules_présentées");
    }

    const payloads = [
      { ...payloadBase, updated_at: new Date().toISOString() },
      payloadBase,
      {
        notes_admin: notes,
        ...(payloadBase.suivi_statut
          ? { suivi_statut: payloadBase.suivi_statut }
          : {}),
      },
    ];

    let updated = null;
    let lastError = null;
    for (const payload of payloads) {
      const result = await auth.admin
        .from("contacts")
        .update(payload)
        .eq("id", auth.contact.id)
        .select()
        .single();
      if (!result.error && result.data) {
        updated = result.data;
        break;
      }
      lastError = result.error;
    }

    if (!updated) {
      console.error("student formule:", lastError?.message);
      return NextResponse.json(
        { error: "Impossible d'enregistrer la formule." },
        { status: 500 },
      );
    }

    try {
      await auth.admin.from("suivi_actions").insert({
        contact_id: auth.contact.id,
        action: "formule_choisie",
        description: `Formule ${formule.number} choisie depuis l'espace étudiant`,
        user_admin: auth.user.email,
      });
    } catch (_error) {
      // L'historique n'est pas bloquant pour le choix de formule.
    }

    return NextResponse.json({
      success: true,
      profile: publicStudentProfile(updated, auth.user.email),
    });
  } catch (error) {
    console.error("student formule:", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
