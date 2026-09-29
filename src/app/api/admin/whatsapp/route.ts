import { NextResponse } from "next/server";
import { requireFullAdmin } from "@/lib/adminRoles";
import { OpenwaError, saveStudentWhatsappContact, sendStudentWhatsapp } from "@/lib/openwa";
import { rateLimit } from "@/lib/httpSecurity";
import { asString, readJsonObject } from "@/lib/request";
import { getAuthenticatedAdmin } from "@/lib/studentAuth";

const TEXT_MAX = 4096;

export async function POST(request: Request) {
  try {
    const auth = await getAuthenticatedAdmin(request);
    if ("error" in auth) {
      return NextResponse.json({ error: auth.error }, { status: auth.status || 403 });
    }
    const forbidden = requireFullAdmin(auth);
    if (forbidden) {
      return NextResponse.json(
        { error: forbidden.error },
        { status: forbidden.status || 403 },
      );
    }

    const limited = rateLimit({
      key: `whatsapp:${auth.user.id}`,
      limit: 20,
      windowMs: 10 * 60 * 1000,
    });
    if (!limited.ok) {
      return NextResponse.json(
        { error: "Trop de requêtes. Réessayez plus tard." },
        { status: 429, headers: { "Retry-After": String(limited.retryAfter) } },
      );
    }

    const body = await readJsonObject(request);
    if (!body) {
      return NextResponse.json({ error: "JSON invalide" }, { status: 400 });
    }
    const contactId = asString(body.contactId).trim();
    const action = asString(body.action).trim();
    const text = asString(body.text);
    if (!contactId || (action !== "send" && action !== "save")) {
      return NextResponse.json({ error: "Requête invalide" }, { status: 400 });
    }
    if (action === "send" && text.trim().length > TEXT_MAX) {
      return NextResponse.json(
        { error: `Message trop long (${TEXT_MAX} caractères max).` },
        { status: 400 },
      );
    }

    const { data: contact, error } = await auth.admin
      .from("contacts")
      .select("id, prenom, nom, phone, pays")
      .eq("id", contactId)
      .maybeSingle();
    if (error || !contact) {
      return NextResponse.json({ error: "Dossier introuvable" }, { status: 404 });
    }

    const prenom = String(contact.prenom || "").trim();
    const nom = String(contact.nom || "").trim();
    if (action === "save") {
      await saveStudentWhatsappContact({
        phone: contact.phone,
        country: contact.pays,
        firstName: prenom || nom,
        lastName: prenom ? nom : "",
      });
    } else {
      await sendStudentWhatsapp({
        phone: contact.phone,
        country: contact.pays,
        text,
      });
    }

    await auth.admin.from("suivi_actions").insert({
      contact_id: contactId,
      action: action === "send" ? "whatsapp_envoye" : "whatsapp_contact",
      description:
        action === "send"
          ? text.trim().slice(0, 240)
          : "Ajouté au carnet WhatsApp",
      user_admin: auth.user.email,
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    if (error instanceof OpenwaError) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }
    console.error("admin whatsapp:", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
