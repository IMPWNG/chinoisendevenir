const DEFAULT_SUBJECT = "Votre projet d'études en Chine";

function extractJsonObject(text) {
  const trimmed = String(text || "").trim();
  const fenced = trimmed.match(/```(?:json)?\s*([\s\S]*?)```/i);
  const raw = (fenced ? fenced[1] : trimmed).trim();
  const start = raw.indexOf("{");
  const end = raw.lastIndexOf("}");
  if (start === -1 || end === -1 || end <= start) return null;
  try {
    return JSON.parse(raw.slice(start, end + 1));
  } catch {
    return null;
  }
}

function stripGreetingAndSignoff(body) {
  let text = String(body || "").replace(/\r\n/g, "\n").trim();
  text = text.replace(
    /^(bonjour|bonsoir|hello|hi)(\s+[^,\n]+)?[,\s]*/i,
    "",
  );
  text = text.replace(
    /\n+(cordialement|bien à vous|belle journée|l['’]équipe chinois en devenir)[\s\S]*$/i,
    "",
  );
  return text.trim();
}

function clip(value, max) {
  return String(value || "").trim().slice(0, max);
}

function compactContact(contact) {
  if (!contact) return {};
  return {
    prenom: clip(contact.prenom, 40),
    domaine_etudes: clip(contact.domaine_etudes, 80),
    formule: clip(contact.formule, 80),
    suivi_statut: clip(contact.suivi_statut, 40),
  };
}

function sanitizeComposeLine(value, maxLen) {
  return clip(value, maxLen)
    .replace(/[\r\n\u0000-\u001f\u007f\u2028\u2029]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function sanitizeComposeBody(value) {
  return String(value || "")
    .replace(/\r\n/g, "\n")
    .replace(/[\u0000-\u0008\u000b\u000c\u000e-\u001f\u007f]/g, "")
    .trim()
    .slice(0, 6000);
}

export async function composeEmailWithAi({ notes, contact }) {
  const apiKey = process.env.MAMMOUTH_API_KEY;
  if (!apiKey) {
    return { ok: false, error: "Clé MAMMOUTH_API_KEY manquante" };
  }

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 30000);

  try {
    const response = await fetch("https://api.mammouth.ai/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: process.env.MAMMOUTH_MODEL || "minimax-m3",
        temperature: 0.3,
        max_tokens: 1600,
        messages: [
          {
            role: "system",
            content: `Tu rédiges des e-mails pour Chinois en Devenir, agence francophone d'accompagnement pour étudier en Chine.

Transforme les notes de l'administrateur en un e-mail professionnel, clair, chaleureux et rassurant.

Règles :
- Rédige dans la langue des notes (français par défaut).
- Ne jamais garantir une admission, une bourse ou un visa.
- Ne pas inventer de frais, dates, HSK, universités, programmes ou faits absents des notes ou du profil.
- Ne pas écrire « Bonjour » ni la signature : le template HTML les ajoute déjà.
- Paragraphes courts, sans markdown, sans listes à puces markdown.
- Le bandeau (title) est court. Le sous-titre est optionnel.

Réponds uniquement par un JSON valide :
{"subject":"...","title":"...","subtitle":"...","body":"..."}

body : paragraphes séparés par une ligne vide.`,
          },
          {
            role: "user",
            content: `Profil étudiant (JSON) :\n${JSON.stringify(compactContact(contact))}\n\nNotes de l'administrateur :\n${notes}`,
          },
        ],
      }),
      signal: controller.signal,
    });

    if (!response.ok) {
      return { ok: false, error: "Le service IA n'a pas répondu" };
    }

    const data = await response.json();
    const text = data?.choices?.[0]?.message?.content?.trim();
    if (!text) {
      return { ok: false, error: "Réponse IA vide" };
    }

    const parsed = extractJsonObject(text);
    const body = stripGreetingAndSignoff(parsed?.body || (!parsed ? text : ""));
    if (!body || body.length < 20) {
      return { ok: false, error: "Réponse IA inutilisable" };
    }

    const subject =
      sanitizeComposeLine(parsed?.subject, 180) || DEFAULT_SUBJECT;
    const title = sanitizeComposeLine(parsed?.title, 120) || subject;
    const subtitle = sanitizeComposeLine(parsed?.subtitle, 160);

    return {
      ok: true,
      subject,
      title,
      subtitle,
      body: sanitizeComposeBody(body),
    };
  } catch (error) {
    if (error?.name === "AbortError") {
      return { ok: false, error: "Délai dépassé. Réessayez." };
    }
    return { ok: false, error: "Erreur IA" };
  } finally {
    clearTimeout(timer);
  }
}
