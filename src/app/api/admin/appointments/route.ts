import { NextResponse } from "next/server";
import { getAuthenticatedAdmin } from "@/lib/studentAuth";
import { rateLimit } from "@/lib/httpSecurity";
import {
  attachContacts,
  createAppointment,
  deleteAppointment,
  listAppointments,
  updateAppointment,
} from "@/lib/appointments";
import { addDaysYmd, formatYmd, startOfWeekYmd, zonedLocalToUtc } from "@/lib/calendar";
import { asString, readJsonObject } from "@/lib/request";
import type { User } from "@supabase/supabase-js";

function limited(auth: { user: User }) {
  return rateLimit({
    key: `appointments:${auth.user.id}`,
    limit: 80,
    windowMs: 10 * 60 * 1000,
  });
}

function searchParams(request: Request) {
  return new URL(request.url).searchParams;
}

export async function GET(request: Request) {
  try {
    const auth = await getAuthenticatedAdmin(request);
    if ("error" in auth) {
      return NextResponse.json(
        { success: false, error: auth.error },
        { status: auth.status || 403 },
      );
    }

    const params = searchParams(request);
    const contactId = String(params.get("contactId") || "").trim();
    let from = params.get("from");
    let to = params.get("to");

    if (!from || !to) {
      const weekStart = startOfWeekYmd(formatYmd(new Date()));
      from = zonedLocalToUtc(weekStart, "00:00").toISOString();
      to = zonedLocalToUtc(addDaysYmd(weekStart, 7), "00:00").toISOString();
    }

    const listed = await listAppointments(auth.admin, {
      from,
      to,
      contactId: contactId || undefined,
    });
    if (listed.missingTable) {
      return NextResponse.json({
        success: false,
        missingTable: true,
        error: "Table appointments absente. Exécutez sql/appointments.sql dans Supabase.",
        events: [],
      });
    }

    const events = await attachContacts(auth.admin, listed.events);
    return NextResponse.json({ success: true, events, from, to });
  } catch (error) {
    console.error("appointments GET:", error);
    return NextResponse.json(
      { success: false, error: "Lecture impossible" },
      { status: 500 },
    );
  }
}

export async function POST(request: Request) {
  try {
    const auth = await getAuthenticatedAdmin(request);
    if ("error" in auth) {
      return NextResponse.json(
        { success: false, error: auth.error },
        { status: auth.status || 403 },
      );
    }

    const quota = limited(auth);
    if (!quota.ok) {
      return NextResponse.json(
        { success: false, error: "Trop de requêtes. Réessayez plus tard." },
        { status: 429, headers: { "Retry-After": String(quota.retryAfter) } },
      );
    }

    const body = await readJsonObject(request);
    if (!body) {
      return NextResponse.json({ error: "JSON invalide" }, { status: 400 });
    }
    const created = await createAppointment(auth.admin, {
      ...body,
      source: asString(body.source, "manual") || "manual",
    });
    if (!created.ok || !created.event) {
      return NextResponse.json(
        { success: false, error: created.error, clash: created.clash || null },
        { status: created.status || 400 },
      );
    }

    const attached = (await attachContacts(auth.admin, [created.event])) ?? [];
    const event = attached[0];
    await auth.admin.from("suivi_actions").insert({
      contact_id: created.event.contact_id,
      action: "rendez_vous_fixe",
      description: `RDV ${created.event.kind} le ${created.event.starts_at}`,
      user_admin: auth.user.email,
    });

    return NextResponse.json({ success: true, event });
  } catch (error) {
    console.error("appointments POST:", error);
    return NextResponse.json(
      { success: false, error: "Création impossible" },
      { status: 500 },
    );
  }
}

export async function PATCH(request: Request) {
  try {
    const auth = await getAuthenticatedAdmin(request);
    if ("error" in auth) {
      return NextResponse.json(
        { success: false, error: auth.error },
        { status: auth.status || 403 },
      );
    }

    const quota = limited(auth);
    if (!quota.ok) {
      return NextResponse.json(
        { success: false, error: "Trop de requêtes. Réessayez plus tard." },
        { status: 429 },
      );
    }

    const body = await readJsonObject(request);
    if (!body) {
      return NextResponse.json({ error: "JSON invalide" }, { status: 400 });
    }
    const updated = await updateAppointment(auth.admin, body.id, body);
    if (!updated.ok || !updated.event) {
      return NextResponse.json(
        { success: false, error: updated.error, clash: updated.clash || null },
        { status: updated.status || 400 },
      );
    }

    const attached = (await attachContacts(auth.admin, [updated.event])) ?? [];
    const event = attached[0];
    return NextResponse.json({ success: true, event });
  } catch (error) {
    console.error("appointments PATCH:", error);
    return NextResponse.json(
      { success: false, error: "Mise à jour impossible" },
      { status: 500 },
    );
  }
}

export async function DELETE(request: Request) {
  try {
    const auth = await getAuthenticatedAdmin(request);
    if ("error" in auth) {
      return NextResponse.json(
        { success: false, error: auth.error },
        { status: auth.status || 403 },
      );
    }

    const body = (await readJsonObject(request)) ?? {};
    const id = String(
      asString(body.id) || searchParams(request).get("id") || "",
    ).trim();
    const removed = await deleteAppointment(auth.admin, id);
    if (!removed.ok) {
      return NextResponse.json(
        { success: false, error: removed.error },
        { status: removed.status || 400 },
      );
    }
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("appointments DELETE:", error);
    return NextResponse.json(
      { success: false, error: "Suppression impossible" },
      { status: 500 },
    );
  }
}
