import { NextResponse } from "next/server";
import { getAuthenticatedAdmin } from "@/lib/studentAuth";
import { requireFullAdmin } from "@/lib/adminRoles";
import {
  BULK_AI_TOPICS,
  BULK_AI_TOPIC_KEYS,
  MAX_BULK_COMPOSE_CONTACTS,
  composeBulkEmailWithAi,
  composeEmailWithAi,
} from "@/lib/emailCompose";
import { rateLimit } from "@/lib/httpSecurity";

const CONTACT_COMPOSE_FIELDS =
  "id, prenom, nom, email, domaine_etudes, dernier_diplome, budget, date_rentree, formule, suivi_statut, notes_admin";

function uniqueIds(values) {
  const seen = new Set();
  const ids = [];
  for (const value of values) {
    const id = String(value || "").trim();
    if (!id || seen.has(id)) continue;
    seen.add(id);
    ids.push(id);
  }
  return ids;
}

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
    const notes = String(body.notes || "").trim();
    const bulkIds = uniqueIds(
      Array.isArray(body.contactIds) ? body.contactIds : [],
    );
    const isBulk = bulkIds.length > 0;

    if (notes.length > 4000) {
      return NextResponse.json(
        { success: false, error: "Le texte est trop long (4000 caractères max)." },
        { status: 400 },
      );
    }

    if (isBulk) {
      const forbidden = requireFullAdmin(auth);
      if (forbidden) {
        return NextResponse.json(
          { success: false, error: forbidden.error },
          { status: forbidden.status || 403 },
        );
      }
      if (bulkIds.length > MAX_BULK_COMPOSE_CONTACTS) {
        return NextResponse.json(
          {
            success: false,
            error: `40 destinataires maximum par rédaction (${bulkIds.length} sélectionnés).`,
          },
          { status: 400 },
        );
      }

      const topic = String(body.topic || "custom").trim();
      if (!BULK_AI_TOPIC_KEYS.includes(topic)) {
        return NextResponse.json(
          { success: false, error: "Sujet de relance inconnu" },
          { status: 400 },
        );
      }
      if (topic === "custom" && notes.length < 8) {
        return NextResponse.json(
          { success: false, error: "Écrivez d'abord ce que vous voulez dire." },
          { status: 400 },
        );
      }

      const { data: contacts, error } = await auth.admin
        .from("contacts")
        .select(CONTACT_COMPOSE_FIELDS)
        .in("id", bulkIds);

      if (error) throw error;
      const found = contacts || [];
      if (found.length === 0) {
        return NextResponse.json(
          { success: false, error: "Aucun contact trouvé" },
          { status: 404 },
        );
      }

      const composed = await composeBulkEmailWithAi({
        notes,
        topic,
        contacts: found,
      });
      if (!composed.ok) {
        return NextResponse.json(
          { success: false, error: composed.error },
          { status: 502 },
        );
      }

      return NextResponse.json({
        success: true,
        topic,
        topicTitle: BULK_AI_TOPICS[topic].title,
        recipientCount: found.length,
        subject: composed.subject,
        title: composed.title,
        subtitle: composed.subtitle,
        body: composed.body,
      });
    }

    const contactId = String(body.contactId || "").trim();
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
