/** History row actors and human labels for cryptic inbound tags. */

export const AUTO_MAIL_ACTOR = "système_automatique";
export const STUDENT_HISTORY_ACTOR = "étudiant";

const AUTO_MAIL_ACTIONS = new Set([
  "email_envoye",
  "email_formules",
  "relance_formules",
  "relance",
  "relance_1",
  "relance_2",
]);

const INTENT_KEYS = [
  "choix_formule",
  "demande_formules",
  "question",
  "reponse_libre",
  "bourses",
  "visa",
  "langue",
  "tarifs",
  "admission",
  "processus",
  "general",
] as const;

export type HistoryActorKind = "student" | "auto" | "admin";

export function inboundIntentPhrase(intent: string): string {
  switch (intent) {
    case "choix_formule":
      return "l'étudiant indique une formule";
    case "demande_formules":
      return "l'étudiant demande les formules d'accompagnement";
    case "question":
      return "question détectée, pas d'email automatique";
    case "reponse_libre":
      return "message libre";
    case "bourses":
      return "sujet détecté : bourses";
    case "visa":
      return "sujet détecté : visa";
    case "langue":
      return "sujet détecté : école de langue";
    case "tarifs":
      return "sujet détecté : tarifs / formules";
    case "admission":
      return "sujet détecté : admission";
    case "processus":
      return "sujet détecté : processus";
    case "general":
      return "premier contact / message général";
    default:
      return intent ? `classement : ${intent}` : "email reçu";
  }
}

/** Rewrite old `[demande_formules]` / `[auto:tarifs]` tags for the history UI. */
export function formatHistoryDescription(
  raw: string,
  t: (key: string) => string,
): string {
  let text = String(raw || "");
  text = text.replace(/\[auto:([a-z0-9_]+)\]/gi, (_all, key: string) => {
    const path = `dashboard.historyAuto.${key}`;
    const label = t(path);
    return label === path ? `(envoi automatique : ${key})` : label;
  });
  for (const key of INTENT_KEYS) {
    const path = `dashboard.historyIntent.${key}`;
    const label = t(path);
    const shown = label === path ? key : label;
    text = text.replaceAll(`[${key}]`, shown);
  }
  return text;
}

export function historyActorKind(
  action: string | null | undefined,
  userAdmin: string | null | undefined,
  description?: string | null,
): HistoryActorKind | null {
  const act = String(action || "");
  const actor = String(userAdmin || "").trim();
  const desc = String(description || "");

  if (act === "reponse_client" || act === "reponse_whatsapp") return "student";
  if (actor === STUDENT_HISTORY_ACTOR) return "student";
  if (actor === AUTO_MAIL_ACTOR) {
    if (AUTO_MAIL_ACTIONS.has(act)) return "auto";
    if (/échec envoi|relance automatique|envoyé automatiquement/i.test(desc)) {
      return "auto";
    }
    return "student";
  }
  if (actor) return "admin";
  return null;
}
