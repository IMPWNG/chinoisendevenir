import {
  DEFAULT_DURATION_MINUTES,
  overlaps,
  parseIso,
} from "./calendar";

const APPOINTMENT_FIELDS =
  "id, contact_id, title, kind, starts_at, ends_at, status, notes, source, created_at, updated_at";

export function isMissingTableError(error) {
  const message = String(error?.message || "").toLowerCase();
  const code = String(error?.code || "");
  return (
    code === "42P01" ||
    code === "PGRST205" ||
    message.includes("does not exist") ||
    message.includes("schema cache")
  );
}

export async function listAppointments(
  client,
  { from, to, contactId, includeCancelled = false } = {},
) {
  let query = client
    .from("appointments")
    .select(APPOINTMENT_FIELDS)
    .order("starts_at", { ascending: true });

  const rangeStart = parseIso(from);
  const rangeEnd = parseIso(to);
  if (rangeStart && rangeEnd) {
    query = query
      .lt("starts_at", rangeEnd.toISOString())
      .gt("ends_at", rangeStart.toISOString());
  } else if (rangeStart) {
    query = query.gte("starts_at", rangeStart.toISOString());
  } else if (rangeEnd) {
    query = query.lte("starts_at", rangeEnd.toISOString());
  }

  if (contactId) query = query.eq("contact_id", String(contactId));
  if (!includeCancelled) query = query.neq("status", "cancelled");

  const { data, error } = await query;
  if (error) {
    if (isMissingTableError(error)) return { ok: false, missingTable: true, events: [] };
    throw error;
  }
  return { ok: true, events: data || [] };
}

export async function findOverlappingAppointment(
  client,
  { startsAt, endsAt, excludeId } = {},
) {
  const start = parseIso(startsAt);
  const end = parseIso(endsAt);
  if (!start || !end) return null;

  let query = client
    .from("appointments")
    .select(APPOINTMENT_FIELDS)
    .lt("starts_at", end.toISOString())
    .gt("ends_at", start.toISOString())
    .neq("status", "cancelled")
    .limit(8);

  if (excludeId) query = query.neq("id", excludeId);

  const { data, error } = await query;
  if (error) {
    if (isMissingTableError(error)) return null;
    throw error;
  }
  return (data || []).find((event) =>
    overlaps(
      start.getTime(),
      end.getTime(),
      new Date(event.starts_at).getTime(),
      new Date(event.ends_at).getTime(),
    ),
  ) || null;
}

export function normalizeAppointmentInput(body = {}) {
  const startsAt = parseIso(body.startsAt || body.starts_at);
  const explicitEnd = parseIso(body.endsAt || body.ends_at);
  const duration = Number(body.durationMinutes || body.duration_minutes);
  const endsAt =
    explicitEnd ||
    (startsAt
      ? new Date(
          startsAt.getTime() +
            (Number.isFinite(duration) && duration > 0
              ? duration
              : DEFAULT_DURATION_MINUTES) *
              60 *
              1000,
        )
      : null);

  const kind = ["appel", "visio", "autre"].includes(body.kind)
    ? body.kind
    : "appel";
  const status = ["proposed", "confirmed", "cancelled"].includes(body.status)
    ? body.status
    : "confirmed";
  const source = ["manual", "ai_offer", "ai_reply"].includes(body.source)
    ? body.source
    : "manual";

  return {
    contact_id: String(body.contactId || body.contact_id || "").trim(),
    title: String(body.title || "").trim() || defaultTitle(kind),
    kind,
    starts_at: startsAt ? startsAt.toISOString() : null,
    ends_at: endsAt ? endsAt.toISOString() : null,
    status,
    notes: String(body.notes || "").trim() || null,
    source,
  };
}

function defaultTitle(kind) {
  if (kind === "visio") return "Visio";
  if (kind === "autre") return "Rendez-vous";
  return "Appel téléphonique";
}

export async function createAppointment(client, input) {
  const payload = normalizeAppointmentInput(input);
  if (!payload.contact_id) {
    return { ok: false, error: "contactId manquant", status: 400 };
  }
  if (!payload.starts_at || !payload.ends_at) {
    return { ok: false, error: "Créneau invalide", status: 400 };
  }
  if (new Date(payload.ends_at) <= new Date(payload.starts_at)) {
    return { ok: false, error: "L'heure de fin doit être après le début", status: 400 };
  }

  if (payload.status !== "cancelled") {
    const clash = await findOverlappingAppointment(client, {
      startsAt: payload.starts_at,
      endsAt: payload.ends_at,
    });
    if (clash) {
      return {
        ok: false,
        error: "Ce créneau est déjà pris",
        status: 409,
        clash,
      };
    }
  }

  const { data, error } = await client
    .from("appointments")
    .insert({
      ...payload,
      updated_at: new Date().toISOString(),
    })
    .select(APPOINTMENT_FIELDS)
    .single();

  if (error) {
    if (isMissingTableError(error)) {
      return {
        ok: false,
        missingTable: true,
        error: "Table appointments absente. Exécutez sql/appointments.sql.",
        status: 503,
      };
    }
    throw error;
  }
  return { ok: true, event: data };
}

export async function updateAppointment(client, id, input) {
  const appointmentId = String(id || "").trim();
  if (!appointmentId) {
    return { ok: false, error: "id manquant", status: 400 };
  }

  const { data: existing, error: existingError } = await client
    .from("appointments")
    .select(APPOINTMENT_FIELDS)
    .eq("id", appointmentId)
    .maybeSingle();

  if (existingError) {
    if (isMissingTableError(existingError)) {
      return {
        ok: false,
        missingTable: true,
        error: "Table appointments absente. Exécutez sql/appointments.sql.",
        status: 503,
      };
    }
    throw existingError;
  }
  if (!existing) return { ok: false, error: "RDV introuvable", status: 404 };

  const merged = normalizeAppointmentInput({
    ...existing,
    ...input,
    contactId: input.contactId || input.contact_id || existing.contact_id,
    startsAt: input.startsAt || input.starts_at || existing.starts_at,
    endsAt: input.endsAt || input.ends_at || existing.ends_at,
    kind: input.kind || existing.kind,
    status: input.status || existing.status,
    source: input.source || existing.source,
    title: input.title ?? existing.title,
    notes: input.notes === undefined ? existing.notes : input.notes,
  });

  if (merged.status !== "cancelled") {
    const clash = await findOverlappingAppointment(client, {
      startsAt: merged.starts_at,
      endsAt: merged.ends_at,
      excludeId: appointmentId,
    });
    if (clash) {
      return {
        ok: false,
        error: "Ce créneau est déjà pris",
        status: 409,
        clash,
      };
    }
  }

  const { data, error } = await client
    .from("appointments")
    .update({
      ...merged,
      updated_at: new Date().toISOString(),
    })
    .eq("id", appointmentId)
    .select(APPOINTMENT_FIELDS)
    .single();

  if (error) throw error;
  return { ok: true, event: data };
}

export async function deleteAppointment(client, id) {
  const appointmentId = String(id || "").trim();
  if (!appointmentId) {
    return { ok: false, error: "id manquant", status: 400 };
  }

  const { error } = await client.from("appointments").delete().eq("id", appointmentId);
  if (error) {
    if (isMissingTableError(error)) {
      return {
        ok: false,
        missingTable: true,
        error: "Table appointments absente. Exécutez sql/appointments.sql.",
        status: 503,
      };
    }
    throw error;
  }
  return { ok: true };
}

export async function attachContacts(client, events) {
  const ids = [
    ...new Set((events || []).map((event) => String(event.contact_id || "")).filter(Boolean)),
  ];
  if (!ids.length) return events || [];

  const { data: contacts, error } = await client
    .from("contacts")
    .select("id, prenom, nom, email, phone")
    .in("id", ids);

  if (error) {
    console.warn("appointments attachContacts:", error.message);
    return events;
  }

  const byId = new Map((contacts || []).map((contact) => [String(contact.id), contact]));
  return (events || []).map((event) => ({
    ...event,
    contact: byId.get(String(event.contact_id)) || null,
  }));
}
