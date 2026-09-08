export const SUIVI_STATUTS = [
  "nouveau_prospect",
  "bienvenue_envoyé",
  "a_qualifier",
  "appel_réservé",
  "formules_présentées",
  "formule_choisie",
  "offre_envoyée",
  "relance_en_cours",
  "attente_paiement",
  "client_payé",
  "dossier_préparation",
  "dossier_incomplet",
  "candidature_envoyée",
  "admission_reçue",
  "visa_préparation",
  "arrive_chine",
  "dossier_terminé",
  "prospect_perdu",
];

export const STATUT_ICONS = {
  nouveau_prospect: "🆕",
  bienvenue_envoyé: "👋",
  a_qualifier: "🔍",
  appel_réservé: "📞",
  formules_présentées: "📋",
  formule_choisie: "🎯",
  offre_envoyée: "💼",
  relance_en_cours: "🔔",
  attente_paiement: "💳",
  client_payé: "💰",
  dossier_préparation: "📁",
  dossier_incomplet: "⚠️",
  candidature_envoyée: "🚀",
  admission_reçue: "🎉",
  visa_préparation: "🛂",
  arrive_chine: "🇨🇳",
  dossier_terminé: "🏆",
  prospect_perdu: "❌",
};

export const STATUT_COLORS = {
  nouveau_prospect: "bg-slate-500/20 text-slate-300 border-slate-500/50",
  bienvenue_envoyé: "bg-sky-500/20 text-sky-300 border-sky-500/50",
  a_qualifier: "bg-indigo-500/20 text-indigo-300 border-indigo-500/50",
  appel_réservé: "bg-violet-500/20 text-violet-300 border-violet-500/50",
  formules_présentées: "bg-blue-500/20 text-blue-300 border-blue-500/50",
  formule_choisie: "bg-cyan-500/20 text-cyan-300 border-cyan-500/50",
  offre_envoyée: "bg-yellow-500/20 text-yellow-300 border-yellow-500/50",
  relance_en_cours: "bg-amber-500/20 text-amber-300 border-amber-500/50",
  attente_paiement: "bg-orange-500/20 text-orange-300 border-orange-500/50",
  client_payé: "bg-purple-500/20 text-purple-300 border-purple-500/50",
  dossier_préparation: "bg-pink-500/20 text-pink-300 border-pink-500/50",
  dossier_incomplet: "bg-rose-500/20 text-rose-300 border-rose-500/50",
  candidature_envoyée: "bg-teal-500/20 text-teal-300 border-teal-500/50",
  admission_reçue: "bg-green-500/20 text-green-300 border-green-500/50",
  visa_préparation: "bg-lime-500/20 text-lime-300 border-lime-500/50",
  arrive_chine: "bg-red-500/20 text-red-200 border-red-500/50",
  dossier_terminé: "bg-emerald-500/20 text-emerald-300 border-emerald-500/50",
  prospect_perdu: "bg-zinc-500/20 text-zinc-400 border-zinc-500/50",
};

export const LEGACY_STATUT_MAP = {
  mail_bienvenue_envoyé: "bienvenue_envoyé",
  relance_1_envoyée: "relance_en_cours",
  relance_2_envoyée: "relance_en_cours",
  choix_des_formules: "formules_présentées",
  prospect_à_qualifier: "a_qualifier",
};

export const STATUS_RANK = {
  nouveau_prospect: 0,
  bienvenue_envoyé: 1,
  a_qualifier: 2,
  appel_réservé: 3,
  formules_présentées: 4,
  relance_en_cours: 5,
  formule_choisie: 6,
  offre_envoyée: 7,
  attente_paiement: 8,
  client_payé: 9,
  dossier_préparation: 10,
  dossier_incomplet: 10,
  candidature_envoyée: 11,
  admission_reçue: 12,
  visa_préparation: 13,
  arrive_chine: 14,
  dossier_terminé: 15,
  prospect_perdu: 16,
};

export const FORMULE_ALREADY_CHOSEN = new Set([
  "formule_choisie",
  "offre_envoyée",
  "attente_paiement",
  "client_payé",
  "dossier_préparation",
  "dossier_incomplet",
  "candidature_envoyée",
  "admission_reçue",
  "visa_préparation",
  "arrive_chine",
  "dossier_terminé",
]);

export const STUDENT_UNLOCKED_STATUSES = new Set([
  "formule_choisie",
  "offre_envoyée",
  "attente_paiement",
  "client_payé",
  "dossier_préparation",
  "dossier_incomplet",
  "candidature_envoyée",
  "admission_reçue",
  "visa_préparation",
  "arrive_chine",
  "dossier_terminé",
]);

export const PAID_STATUSES = new Set([
  "client_payé",
  "dossier_préparation",
  "dossier_incomplet",
  "candidature_envoyée",
  "admission_reçue",
  "visa_préparation",
  "arrive_chine",
  "dossier_terminé",
]);

export const EARLY_STATUSES = new Set([
  "nouveau_prospect",
  "bienvenue_envoyé",
]);

export const FORMULES_AWAITING_REPLY = new Set([
  "formules_présentées",
  "choix_des_formules",
]);

export function canonicalStatut(value) {
  const statut = String(value || "").trim();
  if (!statut) return "";
  if (LEGACY_STATUT_MAP[statut]) return LEGACY_STATUT_MAP[statut];
  if (SUIVI_STATUTS.includes(statut)) return statut;
  return statut;
}

export function shouldAdvanceStatus(currentStatus, nextStatus) {
  if (!nextStatus) return false;
  if (!currentStatus) return true;
  const current = canonicalStatut(currentStatus);
  const next = canonicalStatut(nextStatus);
  if (current === "prospect_perdu") return false;
  const currentRank = STATUS_RANK[current];
  const nextRank = STATUS_RANK[next];
  if (currentRank === undefined || nextRank === undefined) return true;
  return nextRank >= currentRank;
}

export function isFormuleAlreadyChosen(statut) {
  return FORMULE_ALREADY_CHOSEN.has(canonicalStatut(statut));
}

export function isFormulesAwaitingReply(statut) {
  return FORMULES_AWAITING_REPLY.has(statut) ||
    canonicalStatut(statut) === "formules_présentées";
}
