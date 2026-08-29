export const MATCHING_JSON_PREFIX = "[[MATCHING_JSON]]";

export function compactMatchingResult(result, overrides = {}) {
  const student = result.student
    ? { ...result.student, notes: String(result.student.notes || "").slice(0, 800) }
    : result.student;
  return {
    version: 2,
    mix: result.mix || null,
    gaps: result.gaps || [],
    generated_at: result.generated_at,
    recommended_formula: result.recommended_formula,
    client_message: result.client_message,
    client_message_ai: Boolean(result.client_message_ai),
    orientation_bilan: result.orientation_bilan || result.formule1_bilan || null,
    formule1_bilan: result.formule1_bilan || null,
    brief: result.brief,
    student,
    matches: result.matches,
    excluded: (result.excluded || []).slice(0, 30).map((item) => ({
      university_name: item.university_name,
      excludeReason: item.excludeReason,
    })),
    overrides,
  };
}

export function matchingSummary(payload) {
  const top = payload?.matches?.[0];
  const count = payload?.matches?.length || 0;
  if (!top) {
    return "Matching sauvegardé : aucune université compatible.";
  }
  return `Matching sauvegardé (${count} université${count > 1 ? "s" : ""}). Top : ${top.university_name} (${top.score}/100, ${top.category}). Formule recommandée : ${payload.recommended_formula}.`;
}

export function isMatchingPayloadAction(action) {
  return String(action?.description || "").startsWith(MATCHING_JSON_PREFIX);
}

function parseStoredPayload(description) {
  const raw = String(description || "");
  if (!raw.startsWith(MATCHING_JSON_PREFIX)) return null;
  return JSON.parse(raw.slice(MATCHING_JSON_PREFIX.length));
}

async function insertHistoryRow(admin, { contactId, createdBy, description }) {
  const { data, error } = await admin
    .from("suivi_actions")
    .insert({
      contact_id: contactId,
      action: "note_ajoutee",
      description,
      user_admin: createdBy || "admin",
    })
    .select("id, created_at")
    .maybeSingle();
  if (error) throw error;
  return data;
}

export async function saveMatchingRun(admin, { contactId, createdBy, payload }) {
  const row = {
    contact_id: String(contactId),
    created_by: createdBy || "admin",
    recommended_formula: payload.recommended_formula || null,
    top_university: payload.matches?.[0]?.university_name || null,
    top_score: payload.matches?.[0]?.score ?? null,
    client_message: payload.client_message || null,
    payload,
  };

  try {
    const { data, error } = await admin
      .from("matching_runs")
      .insert(row)
      .select("id, created_at")
      .maybeSingle();

    if (!error && data?.id) {
      return { id: data.id, created_at: data.created_at, storage: "matching_runs" };
    }
  } catch {
    // Table matching_runs absente : on bascule sur le journal.
  }

  const encoded = `${MATCHING_JSON_PREFIX}${JSON.stringify(payload)}`;
  const action = await insertHistoryRow(admin, {
    contactId,
    createdBy,
    description: encoded,
  });

  return {
    id: action?.id || null,
    created_at: action?.created_at || new Date().toISOString(),
    storage: "suivi_actions",
  };
}

export async function listMatchingRuns(admin, contactId) {
  try {
    const { data: rows, error } = await admin
      .from("matching_runs")
      .select("id, created_at, created_by, recommended_formula, top_university, top_score, client_message, payload")
      .eq("contact_id", String(contactId))
      .order("created_at", { ascending: false })
      .limit(20);

    if (!error && rows?.length) {
      return rows.map((row) => ({
        id: row.id,
        created_at: row.created_at,
        created_by: row.created_by,
        recommended_formula: row.recommended_formula,
        top_university: row.top_university,
        top_score: row.top_score,
        result: {
          ...(row.payload || {}),
          client_message: row.client_message || row.payload?.client_message,
          recommended_formula:
            row.recommended_formula || row.payload?.recommended_formula,
        },
      }));
    }
  } catch {
    // Table matching_runs absente : lecture via le journal.
  }

  const { data: actions, error: actionsError } = await admin
    .from("suivi_actions")
    .select("id, created_at, user_admin, description")
    .eq("contact_id", contactId)
    .eq("action", "note_ajoutee")
    .like("description", `${MATCHING_JSON_PREFIX}%`)
    .order("created_at", { ascending: false })
    .limit(20);

  if (actionsError) return [];
  return (actions || [])
    .map((action) => {
      try {
        const payload = parseStoredPayload(action.description);
        if (!payload?.matches) return null;
        return {
          id: action.id,
          created_at: action.created_at,
          created_by: action.user_admin,
          recommended_formula: payload.recommended_formula,
          top_university: payload.matches?.[0]?.university_name || null,
          top_score: payload.matches?.[0]?.score ?? null,
          result: payload,
        };
      } catch {
        return null;
      }
    })
    .filter(Boolean)
    .slice(0, 20);
}

export async function appendMessageToNotes(admin, contactId, message) {
  const { data: contact, error } = await admin
    .from("contacts")
    .select("notes_admin")
    .eq("id", contactId)
    .maybeSingle();
  if (error) throw error;

  const stamp = new Date().toLocaleString("fr-FR");
  const block = `\n\n--- Matching ${stamp} ---\n${message.trim()}\n--- Fin matching ---`;
  const notes = `${contact?.notes_admin || ""}${block}`.trim();

  const { error: updateError } = await admin
    .from("contacts")
    .update({ notes_admin: notes })
    .eq("id", contactId);
  if (updateError) throw updateError;
  return notes;
}
