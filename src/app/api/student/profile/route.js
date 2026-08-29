import { NextResponse } from "next/server";
import {
  getAuthenticatedContact,
  publicStudentProfile,
} from "@/lib/studentAuth";

function filled(value) {
  if (value === null || value === undefined) return null;
  const text = String(value).trim();
  return text === "" ? null : text;
}

export async function PATCH(request) {
  try {
    const auth = await getAuthenticatedContact(request);
    if (auth.error) {
      return NextResponse.json({ error: auth.error }, { status: auth.status });
    }

    if (!auth.contact) {
      return NextResponse.json(
        { error: "Complétez d'abord le formulaire de projet." },
        { status: 404 },
      );
    }

    const body = await request.json();
    const payload = {
      prenom: filled(body.prenom),
      nom: filled(body.nom),
      age: body.age ? Number(body.age) : null,
      phone: filled(body.phone),
      pays: filled(body.pays),
      dernier_diplome: filled(body.dernier_diplome),
      domaine_etudes: filled(body.domaine_etudes),
      budget: filled(body.budget),
      date_rentree: filled(body.date_rentree),
      updated_at: new Date().toISOString(),
    };

    if (payload.prenom && payload.prenom.length > 80) {
      return NextResponse.json({ error: "Prénom trop long" }, { status: 400 });
    }
    if (payload.nom && payload.nom.length > 80) {
      return NextResponse.json({ error: "Nom trop long" }, { status: 400 });
    }
    if (
      payload.age !== null &&
      (!Number.isFinite(payload.age) || payload.age < 15 || payload.age > 60)
    ) {
      return NextResponse.json({ error: "Âge invalide" }, { status: 400 });
    }

    if (!payload.prenom || !payload.nom || !payload.pays) {
      return NextResponse.json(
        { error: "Prénom, nom et pays sont obligatoires" },
        { status: 400 },
      );
    }
    if (!payload.dernier_diplome || !payload.domaine_etudes) {
      return NextResponse.json(
        { error: "Diplôme et domaine d'études sont obligatoires" },
        { status: 400 },
      );
    }

    let { data: updated, error } = await auth.admin
      .from("contacts")
      .update(payload)
      .eq("id", auth.contact.id)
      .select()
      .single();

    if (error) {
      const { updated_at: _ignored, ...withoutUpdatedAt } = payload;
      const retry = await auth.admin
        .from("contacts")
        .update(withoutUpdatedAt)
        .eq("id", auth.contact.id)
        .select()
        .single();
      updated = retry.data;
      error = retry.error;
    }

    if (error) {
      return NextResponse.json(
        { error: "Impossible d'enregistrer les modifications" },
        { status: 500 },
      );
    }

    await auth.admin.from("suivi_actions").insert({
      contact_id: auth.contact.id,
      action: "contact_modifier",
      description: "Profil mis à jour depuis l'espace étudiant",
      user_admin: auth.user.email,
    });

    return NextResponse.json({
      success: true,
      profile: publicStudentProfile(updated, auth.user.email),
    });
  } catch (error) {
    console.error("student profile:", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
