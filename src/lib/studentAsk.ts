import { stripAvancementNote, stripFormuleNote } from "./studentProgress";

/** The student's own words, without quoted replies or CRM lines. */
export function studentAskText(value: unknown): string {
  let text = stripFormuleNote(stripAvancementNote(value));
  text = text.split(/message d['’]origine/i)[0];
  text = text.split(/\n-{6,}/)[0];
  text = text.split(/\nOn .+wrote:/i)[0];
  text = text.split(/\nLe .+ a écrit\s*:/i)[0];
  const lines = text.split("\n").filter((line) => !line.trim().startsWith(">"));
  return lines.join(" ").replace(/\s+/g, " ").trim().slice(0, 1500);
}

function fold(value: string): string {
  return value
    .normalize("NFD")
    .replace(/\p{M}/gu, "")
    .toLowerCase()
    .replace(/['’]/g, "'")
    .replace(/[^a-z0-9' ]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

/** A real request. A bare thanks or "ok" is not one. */
export function shouldAnswerStudentAsk(value: unknown): boolean {
  const text = studentAskText(value);
  if (text.length < 20) return false;
  const folded = fold(text);
  return !/^(ok|d'accord|merci|oui|cc|bien recu|je vous attends)( (merci|beaucoup|je vous attends|pour ces informations|pour les informations))*$/.test(
    folded,
  );
}

/** Same wording → same key. The send itself is once per dossier, not per key. */
export const PERSONAL_REPLY_PREFIX = "Réponse personnelle à la demande";

export function hasPersonalReply(descriptions: readonly unknown[]): boolean {
  return descriptions.some((line) =>
    String(line || "").startsWith(PERSONAL_REPLY_PREFIX),
  );
}

export function studentAskKey(value: unknown): string {
  const text = fold(studentAskText(value)).replace(/[^a-z0-9]+/g, "");
  let hash = 5381;
  for (let i = 0; i < text.length; i += 1) {
    hash = Math.imul(hash, 33) ^ text.charCodeAt(i);
  }
  return (hash >>> 0).toString(16);
}
