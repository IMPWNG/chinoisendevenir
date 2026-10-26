import { stripAvancementNote, stripFormuleNote } from "../studentProgress";
import { getSupabaseAdmin } from "../supabaseAdmin";
import type { BlogTopic } from "./generate";

const PILLARS = [
  "/etudier-en-chine",
  "/ecoles-de-langue-chine",
  "/bourses",
  "/visa-etudiant-chine",
  "/processus",
] as const;

export type FicheAsk = {
  text: string;
  at: string;
  key: string;
  title: string;
};

/** Drop emails, phones and "je m'appelle …" before a question can become a public title. */
export function redactPersonal(value: unknown): string {
  let text = stripFormuleNote(stripAvancementNote(value));
  text = text.split(/message d['’]origine/i)[0];
  text = text.split(/\n-{6,}/)[0];
  text = text.split(/\nOn .+wrote:/i)[0];
  text = text.split(/\nLe .+ a écrit\s*:/i)[0];
  const lines = text.split("\n").filter((line) => !line.trim().startsWith(">"));
  text = lines.join(" ");
  text = text
    .replace(/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/gi, " ")
    .replace(/\+?\d[\d\s().-]{7,}\d/g, " ")
    .replace(/https?:\/\/\S+/gi, " ")
    .replace(/\bje m['’]appelle\s+[A-Za-zÀ-ÿ'’-]+(?:\s+[A-Za-zÀ-ÿ'’-]+){0,2}/gi, " ")
    .replace(/\bmon nom est\s+[A-Za-zÀ-ÿ'’-]+(?:\s+[A-Za-zÀ-ÿ'’-]+){0,2}/gi, " ")
    .replace(/\s+/g, " ")
    .trim();
  return text.slice(0, 600);
}

function fold(value: string): string {
  return value
    .normalize("NFD")
    .replace(/\p{M}/gu, "")
    .toLowerCase();
}

export function askKey(value: string): string {
  const text = fold(value).replace(/[^a-z0-9]+/g, "");
  let hash = 5381;
  for (let i = 0; i < text.length; i += 1) hash = Math.imul(hash, 33) ^ text.charCodeAt(i);
  return (hash >>> 0).toString(16);
}

/** Student messages often arrive in SMS French. The public title must not. */
export function polishStudentFrench(value: string): string {
  let text = value.replace(/\s+---\s+.*$/, "").replace(/\s+/g, " ").trim();
  text = text
    .replace(/\bcommmerce\b/gi, "commerce")
    .replace(/\bcommerce internationale\b/gi, "commerce international")
    .replace(/\bd\s+autrui\b/gi, "d'autrui")
    .replace(/\bc\s+un\b/gi, "c'est un")
    .replace(/\bc\s+est\b/gi, "c'est")
    .replace(/\b([jnl])\s+(?=[aeiouhéèêàùœæ])/gi, "$1'")
    .replace(/\bqu\s+(?=[aeiouhéèêàùœæ])/gi, "qu'")
    .replace(
      /([a-zàâäéèêëïîôùûüç])\s+([A-ZÀÂÄÉÈÊËÏÎÔÙÛÜÇ][a-zàâäéèêëïîôùûüç])/g,
      "$1. $2",
    )
    .replace(/\bles moyens ne sont pas présents\b/gi, "Je n'ai pas les moyens")
    .replace(/([^,]) mais /g, "$1, mais ");
  return text.replace(/\s+/g, " ").trim();
}

/** One public question, or null when the message is too thin or still identifying. */
export function publicFaqTitle(raw: unknown): string | null {
  const text = redactPersonal(raw);
  if (text.length < 20) return null;
  const folded = fold(text);
  if (/^(ok|d'accord|merci|oui|bien recu)\b/.test(folded) && folded.length < 40) return null;
  const sentences = text.split(/(?<=[.!?])\s+/);
  let title = polishStudentFrench(
    (sentences.find((item) => item.includes("?")) || sentences[0] || "").trim(),
  );
  if (title.length > 110) title = title.slice(0, 107).replace(/\s+\S*$/, "").trim();
  if (!title.endsWith("?")) title = `${title.replace(/[.!]+$/, "")} ?`;
  title = title.charAt(0).toUpperCase() + title.slice(1);
  if (title.length < 20 || /@|\d{8,}/.test(title)) return null;
  return title;
}

export function pillarsForAsk(title: string): [string, string] {
  const text = fold(title);
  const hits: string[] = [];
  if (/bourse|csc|financ/.test(text)) hits.push("/bourses");
  if (/visa|jw201|jw202|consulat/.test(text)) hits.push("/visa-etudiant-chine");
  if (/langue|hsk|mandarin/.test(text)) hits.push("/ecoles-de-langue-chine");
  if (/admission|dossier|universit|candidat/.test(text)) hits.push("/processus");
  if (/ville|shanghai|pekin|chengdu|wuhan|logement|cout/.test(text)) hits.push("/etudier-en-chine");
  const unique = [...new Set(hits)].filter((href) =>
    (PILLARS as readonly string[]).includes(href),
  );
  const first = unique[0] || "/etudier-en-chine";
  const second = unique.find((href) => href !== first) || (first === "/etudier-en-chine" ? "/processus" : "/etudier-en-chine");
  return [first, second];
}

export function pickFreshFicheAsk(
  asks: Array<{ text: string; at: string }>,
  usedKeys: Iterable<string>,
): FicheAsk | null {
  const used = new Set(usedKeys);
  const ordered = [...asks].sort((a, b) => (a.at < b.at ? 1 : -1));
  for (const ask of ordered) {
    const title = publicFaqTitle(ask.text);
    if (!title) continue;
    const key = askKey(redactPersonal(ask.text));
    if (used.has(key)) continue;
    used.add(key);
    return { text: redactPersonal(ask.text), at: ask.at, key, title };
  }
  return null;
}

/**
 * Curated topics run until one leading article (bourses, admission, villes) exists.
 * After that, a fiche question and a curated topic take turns.
 */
export function shouldUseFicheFaq(input: {
  leadPublished: boolean;
  lastWasFaq: boolean;
  hasFreshAsk: boolean;
}) {
  return input.leadPublished && !input.lastWasFaq && input.hasFreshAsk;
}

export function topicFromFiche(
  ask: FicheAsk,
  slug: string,
): BlogTopic {
  const pillars = pillarsForAsk(ask.title);
  const price = /tarif|prix|formule|accompagnement/.test(fold(ask.title));
  return {
    slug,
    title: ask.title,
    faq: true,
    context:
      `Question publique, déjà réécrite en français correct, sans nom, email ni téléphone : « ${ask.title} ». ` +
      "Garde ce français. Ne reprends pas le style SMS du message d'origine. " +
      "Réponds uniquement à cette question. Ne dis pas qu'un client l'a posée. " +
      "Faits du site : une bourse n'est jamais garantie ; la CSC peut couvrir scolarité, logement, assurance et une allocation selon le type ; " +
      "le parcours d'admission dure souvent 4 à 6 mois ; la rentrée principale est en septembre ; " +
      "un diplôme en chinois demande souvent un HSK 4 ou 5 ; sans IELTS, TOEFL ou HSK, l'année de langue est le premier pas réaliste ; " +
      "le visa vient après l'admission. Pas de statistique inventée, pas de promesse.",
    pillars,
    cta: price ? "/tarifs" : "/#lead-form",
  };
}

export async function loadFicheAsks(): Promise<Array<{ text: string; at: string }>> {
  try {
    const admin = getSupabaseAdmin();
    const [notes, emails] = await Promise.all([
      admin
        .from("contacts")
        .select("notes_admin, updated_at")
        .not("notes_admin", "is", null)
        .order("updated_at", { ascending: false })
        .limit(80),
      admin
        .from("contact_emails")
        .select("body_text, subject, sent_at")
        .eq("direction", "in")
        .order("sent_at", { ascending: false })
        .limit(80),
    ]);
    const out: Array<{ text: string; at: string }> = [];
    for (const row of notes.data || []) {
      const text = String(row.notes_admin || "").trim();
      if (text) out.push({ text, at: String(row.updated_at || "") });
    }
    for (const row of emails.data || []) {
      const subject = String(row.subject || "").trim();
      const body = String(row.body_text || "").trim();
      const text = body.length >= 20 ? body : `${subject} ${body}`.trim();
      if (text) out.push({ text, at: String(row.sent_at || "") });
    }
    return out;
  } catch (error) {
    console.warn("fiche asks:", error instanceof Error ? error.message : error);
    return [];
  }
}
