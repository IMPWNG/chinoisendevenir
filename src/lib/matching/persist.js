export function compactMatchingResult(result, overrides = {}) {
  return {
    version: 1,
    generated_at: result.generated_at,
    recommended_formula: result.recommended_formula,
    client_message: result.client_message,
    client_message_ai: Boolean(result.client_message_ai),
    brief: result.brief,
    student: result.student,
    matches: result.matches,
    excluded: (result.excluded || []).slice(0, 30),
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

  const { data, error } = await admin
    .from("matching_runs")
    .insert(row)
    .select("id, created_at")
    .maybeSingle();

  if (!error && data) {
    return { id: data.id, created_at: data.created_at, storage: "matching_runs" };
  }

  const { data: action, error: actionError } = await admin
    .from("suivi_actions")
    .insert({
      contact_id: contactId,
      action: "matching_payload",
      description: JSON.stringify(payload),
      user_admin: createdBy || "admin",
    })
    .select("id, created_at")
    .maybeSingle();

  if (actionError) throw actionError;
  return {
    id: action.id,
    created_at: action.created_at,
    storage: "suivi_actions",
  };
}

export async function listMatchingRuns(admin, contactId) {
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
        ...row.payload,
        client_message: row.client_message || row.payload?.client_message,
        recommended_formula:
          row.recommended_formula || row.payload?.recommended_formula,
      },
    }));
  }

  const { data: actions, error: actionsError } = await admin
    .from("suivi_actions")
    .select("id, created_at, user_admin, description")
    .eq("contact_id", contactId)
    .eq("action", "matching_payload")
    .order("created_at", { ascending: false })
    .limit(20);

  if (actionsError) return [];
  return (actions || [])
    .map((action) => {
      try {
        const payload = JSON.parse(action.description || "{}");
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
    .filter(Boolean);
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
