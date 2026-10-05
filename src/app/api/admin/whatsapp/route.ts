import { NextResponse } from "next/server";
import { requireFullAdmin } from "@/lib/adminRoles";
import {
  OpenwaError,
  addStudentToEtudeChine,
  applyStudentWhatsapp,
  saveStudentWhatsappContact,
  markStudentWhatsappRead,
  sendStudentWhatsapp,
  studentWhatsappCard,
} from "@/lib/openwa";
import { rateLimit } from "@/lib/httpSecurity";
import { asString, readJsonObject } from "@/lib/request";
import { getAuthenticatedAdmin } from "@/lib/studentAuth";

const TEXT_MAX = 4096;

async function guard(request: Request) {
  const auth = await getAuthenticatedAdmin(request);
  if ("error" in auth) {
    return { error: NextResponse.json({ error: auth.error }, { status: auth.status || 403 }) };
  }
  const forbidden = requireFullAdmin(auth);
  if (forbidden) {
    return {
      error: NextResponse.json(
        { error: forbidden.error },
        { status: forbidden.status || 403 },
      ),
    };
  }
  const limited = rateLimit({
    key: `whatsapp:${auth.user.id}`,
    limit: 50,
    windowMs: 10 * 60 * 1000,
  });
  if (!limited.ok) {
    return {
      error: NextResponse.json(
        { error: "Trop de requêtes. Réessayez plus tard." },
        { status: 429, headers: { "Retry-After": String(limited.retryAfter) } },
      ),
    };
  }
  return { auth };
}

export async function GET(request: Request) {
  try {
    const gated = await guard(request);
    if ("error" in gated && gated.error) return gated.error;
    const contactId = new URL(request.url).searchParams.get("contactId")?.trim() || "";
    if (!contactId) {
      return NextResponse.json({ error: "Requête invalide" }, { status: 400 });
    }
    const { data: contact, error } = await gated.auth.admin
      .from("contacts")
      .select("phone, pays")
      .eq("id", contactId)
      .maybeSingle();
    if (error || !contact) {
      return NextResponse.json({ error: "Dossier introuvable" }, { status: 404 });
    }
    const card = await studentWhatsappCard({
      phone: contact.phone,
      country: contact.pays,
    });
    if (card.onWhatsapp) {
      void markStudentWhatsappRead({
        phone: contact.phone,
        country: contact.pays,
      }).catch(() => {});
    }
    return NextResponse.json(card);
  } catch (error) {
    if (error instanceof OpenwaError) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }
    console.error("admin whatsapp:", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const gated = await guard(request);
    if ("error" in gated && gated.error) return gated.error;
    const auth = gated.auth;

    const body = await readJsonObject(request);
    if (!body) {
      return NextResponse.json({ error: "JSON invalide" }, { status: 400 });
    }
    const contactId = asString(body.contactId).trim();
    const action = asString(body.action).trim();
    const text = asString(body.text);
    if (
      !contactId ||
      (action !== "send" && action !== "save" && action !== "label" && action !== "bundle")
    ) {
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
    let bundleNote = "";
    if (action === "bundle") {
      const result = await applyStudentWhatsapp({
        phone: contact.phone,
        country: contact.pays,
        firstName: prenom || nom,
        lastName: prenom ? nom : "",
        prenom,
        nom,
        text,
        save: body.save === true,
        label: body.label === true,
      });
      const bits = [
        result.sent ? "Message envoyé" : "",
        result.saved ? "ajouté au carnet" : "",
        result.labeled ? "ajouté à Étude Chine" : "",
      ].filter(Boolean);
      bundleNote = bits.join(", ");
    } else if (action === "save") {
      await saveStudentWhatsappContact({
        phone: contact.phone,
        country: contact.pays,
        firstName: prenom || nom,
        lastName: prenom ? nom : "",
      });
    } else if (action === "label") {
      await addStudentToEtudeChine({
        phone: contact.phone,
        country: contact.pays,
      });
    } else {
      await sendStudentWhatsapp({
        phone: contact.phone,
        country: contact.pays,
        text,
      });
    }

    const logged =
      action === "bundle"
        ? {
            action: text.trim() ? "whatsapp_envoye" : "whatsapp_contact",
            description: [bundleNote, text.trim().slice(0, 160)].filter(Boolean).join(" — ").slice(0, 240),
          }
        : action === "send"
        ? { action: "whatsapp_envoye", description: text.trim().slice(0, 240) }
        : action === "label"
          ? { action: "whatsapp_liste", description: "Ajouté à la liste Étude Chine" }
          : { action: "whatsapp_contact", description: "Ajouté au carnet WhatsApp" };
    const { error: historyError } = await auth.admin.from("suivi_actions").insert({
      contact_id: contactId,
      action: logged.action,
      description: logged.description,
      user_admin: auth.user.email,
    });
    if (historyError) {
      console.warn("whatsapp history:", historyError.message);
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    if (error instanceof OpenwaError) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }
    console.error("admin whatsapp:", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
