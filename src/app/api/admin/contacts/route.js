import { NextResponse } from "next/server";
import { getAuthenticatedAdmin } from "@/lib/studentAuth";

const FIELD_LABELS = {
  prenom: "prénom",
  nom: "nom",
  email: "email",
  phone: "téléphone",
  age: "âge",
  pays: "pays",
  dernier_diplome: "diplôme",
  domaine_etudes: "domaine",
  budget: "budget",
  date_rentree: "rentrée",
};

function filled(value) {
  if (value === null || value === undefined) return null;
  const text = String(value).trim();
  return text === "" ? null : text;
}

function sameValue(a, b) {
  return String(a ?? "") === String(b ?? "");
}

export async function PATCH(request) {
  try {
    const auth = await getAuthenticatedAdmin(request);
    if (auth.error) {
      return NextResponse.json({ error: auth.error }, { status: auth.status });
    }

    const body = await request.json().catch(() => ({}));
    const contactId = String(body.contactId || "").trim();
    if (!contactId) {
      return NextResponse.json(
        { error: "MISSING_CONTACT_ID" },
        { status: 400 },
      );
    }

    const email = filled(body.email)?.toLowerCase() || null;
    const ageRaw = body.age;
    const age =
      ageRaw === "" || ageRaw === null || ageRaw === undefined
        ? null
        : Number(ageRaw);

    if (age !== null && (!Number.isFinite(age) || age < 15 || age > 60)) {
      return NextResponse.json({ error: "INVALID_AGE" }, { status: 400 });
    }

    if (email && !email.includes("@")) {
      return NextResponse.json({ error: "INVALID_EMAIL" }, { status: 400 });
    }

    const payload = {
      prenom: filled(body.prenom),
      nom: filled(body.nom),
      email,
      age,
      phone: filled(body.phone),
      pays: filled(body.pays),
      dernier_diplome: filled(body.dernier_diplome),
      domaine_etudes: filled(body.domaine_etudes),
      budget: filled(body.budget),
      date_rentree: filled(body.date_rentree),
      updated_at: new Date().toISOString(),
    };

    if (!payload.prenom || !payload.nom || !payload.pays || !payload.email) {
      return NextResponse.json({ error: "REQUIRED_FIELDS" }, { status: 400 });
    }

    const { data: existing, error: existingError } = await auth.admin
      .from("contacts")
      .select("*")
      .eq("id", contactId)
      .maybeSingle();

    if (existingError) throw existingError;
    if (!existing) {
      return NextResponse.json({ error: "NOT_FOUND" }, { status: 404 });
    }

    if (!sameValue(existing.email, payload.email)) {
      const { data: duplicates, error: dupError } = await auth.admin
        .from("contacts")
        .select("id")
        .ilike("email", payload.email)
        .neq("id", contactId)
        .limit(1);

      if (dupError) throw dupError;
      if (duplicates?.length) {
        return NextResponse.json({ error: "DUPLICATE_EMAIL" }, { status: 409 });
      }
    }

    const changed = Object.keys(FIELD_LABELS).filter(
      (key) => !sameValue(existing[key], payload[key]),
    );

    if (changed.length === 0) {
      return NextResponse.json({ success: true, contact: existing });
    }

    let { data: updated, error } = await auth.admin
      .from("contacts")
      .update(payload)
      .eq("id", contactId)
      .select()
      .single();

    if (error) {
      const { updated_at: _ignored, ...withoutUpdatedAt } = payload;
      const retry = await auth.admin
        .from("contacts")
        .update(withoutUpdatedAt)
        .eq("id", contactId)
        .select()
        .single();
      updated = retry.data;
      error = retry.error;
    }

    if (error) {
      return NextResponse.json({ error: "SAVE_FAILED" }, { status: 500 });
    }

    const labels = changed.map((key) => FIELD_LABELS[key]).join(", ");
    await auth.admin.from("suivi_actions").insert({
      contact_id: contactId,
      action: "contact_modifier",
      description: `Informations étudiant mises à jour : ${labels}`,
      user_admin: auth.user.email,
    });

    return NextResponse.json({ success: true, contact: updated });
  } catch (error) {
    console.error("Admin contact update failed:", error);
    return NextResponse.json({ error: "SAVE_FAILED" }, { status: 500 });
  }
}
