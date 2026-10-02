import { NextResponse } from "next/server";
import { requireFullAdmin } from "@/lib/adminRoles";
import { DRIP_MAX_BATCH, nextDripSlots } from "@/lib/dripSchedule";
import { rateLimit } from "@/lib/httpSecurity";
import { asString, readJsonObject } from "@/lib/request";
import { getAuthenticatedAdmin } from "@/lib/studentAuth";

const TEXT_MAX = { email: 8000, whatsapp: 4096 } as const;

type Channel = keyof typeof TEXT_MAX;

function uniqueIds(values: unknown[]) {
  const seen = new Set<string>();
  const ids: string[] = [];
  for (const value of values) {
    const id = String(value || "").trim();
    if (!id || seen.has(id)) continue;
    seen.add(id);
    ids.push(id);
  }
  return ids;
}

function isChannel(value: string): value is Channel {
  return value === "email" || value === "whatsapp";
}

async function gate(request: Request) {
  const auth = await getAuthenticatedAdmin(request);
  if ("error" in auth) {
    return NextResponse.json(
      { success: false, error: auth.error },
      { status: auth.status || 403 },
    );
  }
  const forbidden = requireFullAdmin(auth);
  if (forbidden) {
    return NextResponse.json(
      { success: false, error: forbidden.error },
      { status: forbidden.status || 403 },
    );
  }
  const limited = rateLimit({
    key: `drip:${auth.user.id}`,
    limit: 30,
    windowMs: 10 * 60 * 1000,
  });
  if (!limited.ok) {
    return NextResponse.json(
      { success: false, error: "Trop de requêtes. Réessayez plus tard." },
      { status: 429, headers: { "Retry-After": String(limited.retryAfter) } },
    );
  }
  return auth;
}

export async function GET(request: Request) {
  const auth = await gate(request);
  if (auth instanceof NextResponse) return auth;

  const hourAgo = new Date(Date.now() - 60 * 60 * 1000).toISOString();
  const [pending, failed, next, sent] = await Promise.all([
    auth.admin
      .from("outbound_drip")
      .select("id", { count: "exact", head: true })
      .eq("status", "pending"),
    auth.admin
      .from("outbound_drip")
      .select("id", { count: "exact", head: true })
      .eq("status", "failed")
      .gte("updated_at", hourAgo),
    auth.admin
      .from("outbound_drip")
      .select("scheduled_at")
      .eq("status", "pending")
      .order("scheduled_at", { ascending: true })
      .limit(1)
      .maybeSingle(),
    auth.admin
      .from("outbound_drip")
      .select("id", { count: "exact", head: true })
      .eq("status", "sent")
      .gte("sent_at", hourAgo),
  ]);

  const error =
    pending.error || failed.error || next.error || sent.error || null;
  if (error) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 },
    );
  }

  return NextResponse.json({
    success: true,
    pending: pending.count ?? 0,
    failed: failed.count ?? 0,
    nextAt: next.data?.scheduled_at ?? null,
    sentLastHour: sent.count ?? 0,
  });
}

export async function POST(request: Request) {
  const auth = await gate(request);
  if (auth instanceof NextResponse) return auth;

  const body = await readJsonObject(request);
  if (!body) {
    return NextResponse.json({ success: false, error: "JSON invalide" }, { status: 400 });
  }

  if (asString(body.action) === "cancel") {
    const { error } = await auth.admin
      .from("outbound_drip")
      .update({
        status: "cancelled",
        updated_at: new Date().toISOString(),
      })
      .eq("status", "pending");
    if (error) {
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 500 },
      );
    }
    return NextResponse.json({ success: true });
  }

  const channel = asString(body.channel);
  if (!isChannel(channel)) {
    return NextResponse.json(
      { success: false, error: "Choisissez e-mail ou WhatsApp." },
      { status: 400 },
    );
  }

  const message = asString(body.body).trim();
  const subject = asString(body.subject).trim();
  if (!message || message.length > TEXT_MAX[channel]) {
    return NextResponse.json(
      {
        success: false,
        error: message
          ? `Message trop long (${TEXT_MAX[channel]} caractères max).`
          : "Message vide.",
      },
      { status: 400 },
    );
  }
  if (channel === "email" && !subject) {
    return NextResponse.json(
      { success: false, error: "Objet manquant." },
      { status: 400 },
    );
  }

  const ids = uniqueIds(Array.isArray(body.contactIds) ? body.contactIds : []);
  if (ids.length === 0) {
    return NextResponse.json(
      { success: false, error: "Aucun destinataire." },
      { status: 400 },
    );
  }
  if (ids.length > DRIP_MAX_BATCH) {
    return NextResponse.json(
      {
        success: false,
        error: `${DRIP_MAX_BATCH} destinataires maximum par séquence.`,
      },
      { status: 400 },
    );
  }

  const { data: contacts, error: contactError } = await auth.admin
    .from("contacts")
    .select("id, email, phone")
    .in("id", ids);
  if (contactError) {
    return NextResponse.json(
      { success: false, error: contactError.message },
      { status: 500 },
    );
  }

  const reachable = (contacts || []).filter((contact) =>
    channel === "email"
      ? String(contact.email || "").trim()
      : String(contact.phone || "").trim(),
  );
  if (reachable.length === 0) {
    return NextResponse.json(
      { success: false, error: "Aucun destinataire joignable sur ce canal." },
      { status: 400 },
    );
  }

  const { data: already, error: alreadyError } = await auth.admin
    .from("outbound_drip")
    .select("contact_id")
    .eq("status", "pending")
    .eq("channel", channel)
    .in(
      "contact_id",
      reachable.map((contact) => String(contact.id)),
    );
  if (alreadyError) {
    return NextResponse.json(
      { success: false, error: alreadyError.message },
      { status: 500 },
    );
  }

  const pendingIds = new Set(
    (already || []).map((row) => String(row.contact_id)),
  );
  const fresh = reachable.filter(
    (contact) => !pendingIds.has(String(contact.id)),
  );
  if (fresh.length === 0) {
    return NextResponse.json(
      { success: false, error: "Aucun nouveau destinataire à mettre en file." },
      { status: 400 },
    );
  }

  const { data: queued, error: queuedError } = await auth.admin
    .from("outbound_drip")
    .select("scheduled_at")
    .in("status", ["pending", "sending"]);
  if (queuedError) {
    return NextResponse.json(
      { success: false, error: queuedError.message },
      { status: 500 },
    );
  }

  const now = Date.now();
  const slots = nextDripSlots(
    fresh.length,
    (queued || []).map((row) => new Date(row.scheduled_at).getTime()),
    now,
  );
  const createdBy = auth.user.email || null;
  const rows = fresh.map((contact, index) => ({
    contact_id: String(contact.id),
    channel,
    subject: channel === "email" ? subject.slice(0, 180) : null,
    title: asString(body.title).trim().slice(0, 120) || null,
    subtitle: asString(body.subtitle).trim().slice(0, 160) || null,
    body: message,
    status: "pending",
    scheduled_at: new Date(slots[index]).toISOString(),
    created_by: createdBy,
  }));

  const { error: insertError } = await auth.admin.from("outbound_drip").insert(rows);
  if (insertError) {
    return NextResponse.json(
      { success: false, error: insertError.message },
      { status: 500 },
    );
  }

  return NextResponse.json({
    success: true,
    queued: rows.length,
    skipped: ids.length - rows.length,
    firstAt: rows[0].scheduled_at,
    lastAt: rows[rows.length - 1].scheduled_at,
  });
}
