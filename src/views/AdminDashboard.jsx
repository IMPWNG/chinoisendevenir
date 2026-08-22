"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "../lib/supabase";
import { useAuth } from "../context/AuthContext";
import AdminShell from "../components/AdminShell";
import AdminStudentFiles from "../components/AdminStudentFiles";
import { useAdminI18n } from "../context/AdminI18nContext";
import {
  isStudentSpaceUnlocked,
  getChosenFormule,
  getDisplayedStepIndex,
  STUDENT_PROCESS_STEPS,
  FORMULE_OPTIONS,
  mergeFormuleNote,
  stripFormuleNote,
  mergeAvancementNote,
} from "../lib/studentProgress";

async function authedFetch(path, options = {}) {
  const {
    data: { session },
  } = await supabase.auth.getSession();
  if (!session?.access_token) {
    throw new Error("SESSION");
  }
  return fetch(path, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(options.headers || {}),
      Authorization: `Bearer ${session.access_token}`,
    },
  });
}

const STATUTS = [
  "mail_bienvenue_envoyé",
  "relance_1_envoyée",
  "relance_2_envoyée",
  "choix_des_formules",
  "formule_choisie",
  "prospect_à_qualifier",
  "offre_envoyée",
  "attente_paiement",
  "client_payé",
  "appel_réservé",
  "dossier_préparation",
  "candidature_envoyée",
  "admission_reçue",
  "dossier_terminé",
];

const STATUT_COLORS = {
  mail_bienvenue_envoyé: "bg-slate-500/20 text-slate-300 border-slate-500/50",
  relance_1_envoyée: "bg-amber-500/20 text-amber-300 border-amber-500/50",
  relance_2_envoyée: "bg-orange-500/20 text-orange-200 border-orange-500/50",
  choix_des_formules: "bg-blue-500/20 text-blue-300 border-blue-500/50",
  formule_choisie: "bg-cyan-500/20 text-cyan-300 border-cyan-500/50",
  prospect_à_qualifier: "bg-indigo-500/20 text-indigo-300 border-indigo-500/50",
  offre_envoyée: "bg-yellow-500/20 text-yellow-300 border-yellow-500/50",
  attente_paiement: "bg-orange-500/20 text-orange-300 border-orange-500/50",
  client_payé: "bg-purple-500/20 text-purple-300 border-purple-500/50",
  appel_réservé: "bg-violet-500/20 text-violet-300 border-violet-500/50",
  dossier_préparation: "bg-pink-500/20 text-pink-300 border-pink-500/50",
  candidature_envoyée: "bg-teal-500/20 text-teal-300 border-teal-500/50",
  admission_reçue: "bg-green-500/20 text-green-300 border-green-500/50",
  dossier_terminé: "bg-emerald-500/20 text-emerald-300 border-emerald-500/50",
};

const STATUT_ICONS = {
  mail_bienvenue_envoyé: "📧",
  relance_1_envoyée: "🔔",
  relance_2_envoyée: "🔔",
  choix_des_formules: "📋",
  formule_choisie: "✔️",
  prospect_à_qualifier: "🔍",
  offre_envoyée: "💼",
  attente_paiement: "⏳",
  client_payé: "💰",
  appel_réservé: "📞",
  dossier_préparation: "📁",
  candidature_envoyée: "🎯",
  admission_reçue: "🎊",
  dossier_terminé: "🏆",
};

const NIVEAUX_ETUDES = ["bac", "licence", "master", "doctorat"];

const DOMAINES_ETUDES = [
  "Informatique / IA / Data Science",
  "Ingénierie / Génie civil",
  "Génie électrique / Énergie",
  "Génie mécanique",
  "Aérospatial",
  "Architecture",
  "Commerce / Business",
  "Commerce international",
  "Management / Gestion",
  "Marketing digital",
  "Banque / Finance / Assurance",
  "Droit",
  "Science politique",
  "Sciences pharmaceutiques",
  "Agriculture",
  "Hydrologie",
  "Langues",
  "Autre",
];

const BUDGETS = [
  "moins-3000",
  "3000-6000",
  "<5000",
  "5000-10000",
  "10000-20000",
  ">20000",
  "besoin-bourse",
];

const EMAIL_TEMPLATE_OPTIONS = [
  {
    value: "relance_1",
    label: "🔔 Relance 1 — Formulaire à remplir",
  },
  {
    value: "relance_2",
    label: "🔔 Relance 2 — Toujours intéressé(e) ?",
  },
  {
    value: "formules_presentation",
    label: "📋 Formules d'accompagnement",
  },
];

function translatedOrRaw(t, prefix, value) {
  if (!value) return "";
  const path = `${prefix}.${value}`;
  const translated = t(path);
  return translated === path ? value : translated;
}

const ACTIONS_TYPES = [
  { value: "appel", label: "Appel effectué", icon: "📞" },
  { value: "email_envoye", label: "Email envoyé", icon: "📧" },
  { value: "email_formules", label: "Email formules envoyé", icon: "📋" },
  { value: "reponse_client", label: "Réponse client (email)", icon: "📥" },
  { value: "formule_choisie", label: "Formule choisie", icon: "✔️" },
  { value: "relance_1", label: "Relance 1", icon: "🔔" },
  { value: "relance_2", label: "Relance 2", icon: "🔔" },
  { value: "relance", label: "Relance", icon: "🔔" },
  { value: "qualification", label: "Qualification", icon: "✓" },
  { value: "changement_statut", label: "Changement de statut", icon: "🔄" },
  { value: "note_ajoutee", label: "Note ajoutée", icon: "📝" },
  { value: "contact_appele", label: "Contact appelé", icon: "☎️" },
  { value: "document_envoye", label: "Document envoyé", icon: "📄" },
  { value: "rendez_vous_fixe", label: "RDV fixé", icon: "📅" },
  { value: "paiement_recu", label: "Paiement reçu", icon: "💰" },
  {
    value: "inscription_effectuee",
    label: "Inscription effectuée",
    icon: "✅",
  },
  { value: "contact_modifier", label: "Contact modifié", icon: "✏️" },
  { value: "dossier_complet", label: "Dossier complet", icon: "📂" },
];

export default function AdminDashboard() {
  const { t } = useAdminI18n();
  const [contacts, setContacts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filterStatut, setFilterStatut] = useState("tous");
  const [filterBudget, setFilterBudget] = useState("tous");
  const [filterPays, setFilterPays] = useState("tous");
  const [filterNiveau, setFilterNiveau] = useState("tous");
  const [filterDomaine, setFilterDomaine] = useState("tous");
  const [selectedContact, setSelectedContact] = useState(null);
  const [selectedIds, setSelectedIds] = useState([]);
  const [bulkTemplate, setBulkTemplate] = useState("relance_1");
  const [bulkSending, setBulkSending] = useState(false);
  const [bulkProgress, setBulkProgress] = useState(null);
  const [pays, setPays] = useState([]);
  const { signOut, user } = useAuth();
  const router = useRouter();

  useEffect(() => {
    // eslint-disable-next-line react-hooks/immutability
    fetchContacts();
  }, []);

  const fetchContacts = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("contacts")
      .select("*")
      .order("created_at", { ascending: false });

    if (!error) {
      setContacts(data);
      setSelectedContact((prev) =>
        prev ? data.find((c) => c.id === prev.id) || prev : prev,
      );
      // Extraire les pays uniques
      const paysUniques = [...new Set(data.map((c) => c.pays).filter(Boolean))];
      setPays(paysUniques.sort());
    }
    setLoading(false);
  };

  const toggleSelected = (id) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id],
    );
  };

  const sendBulkEmails = async () => {
    const selected = contacts.filter((c) => selectedIds.includes(c.id));
    const withEmail = selected.filter((c) => c.email);
    if (withEmail.length === 0) {
      alert(t("dashboard.noEmail"));
      return;
    }

    const templateLabel = t(`emailTemplate.${bulkTemplate}`);
    const confirmed = confirm(
      t("dashboard.bulkConfirm", {
        template: templateLabel,
        count: withEmail.length,
      }),
    );
    if (!confirmed) return;

    setBulkSending(true);
    const sent = [];
    const failed = [];

    try {
      for (let i = 0; i < withEmail.length; i++) {
        const contact = withEmail[i];
        setBulkProgress({
          current: i + 1,
          total: withEmail.length,
          name: `${contact.prenom || ""} ${contact.nom || ""}`.trim(),
        });

        try {
          const response = await authedFetch("/api/email/auto-reply", {
            method: "POST",
            body: JSON.stringify({
              contactId: String(contact.id),
              emailTemplate: bulkTemplate,
            }),
          });
          const data = await response.json();
          if (data.success) {
            sent.push(contact);
            if (data.status) {
              setContacts((prev) =>
                prev.map((c) =>
                  c.id === contact.id ? { ...c, suivi_statut: data.status } : c,
                ),
              );
            }
          } else {
            failed.push({
              contact,
              error: data.message || data.error || t("unknownError"),
            });
          }
        } catch (err) {
          failed.push({ contact, error: err.message });
        }

        await new Promise((resolve) => setTimeout(resolve, 250));
      }
    } finally {
      setBulkSending(false);
      setBulkProgress(null);
      setSelectedIds([]);
    }

    await fetchContacts();

    const failLines = failed
      .map(
        (item) =>
          `• ${item.contact.prenom || ""} ${item.contact.nom || ""} — ${item.error}`,
      )
      .join("\n");
    alert(
      t("dashboard.bulkDone", {
        sent: sent.length,
        failed: failed.length,
        details: failLines ? `\n\n${failLines}` : "",
      }),
    );
  };

  const updateStatut = async (id, newStatut) => {
    try {
      const { error } = await supabase
        .from("contacts")
        .update({
          suivi_statut: newStatut,
          updated_at: new Date().toISOString(),
        })
        .eq("id", id);

      if (error) {
        console.error("Erreur update statut:", error);
        alert(t("error") + " : " + error.message);
        return;
      }

      // Enregistrer l'action
      const { error: actionError } = await supabase
        .from("suivi_actions")
        .insert({
          contact_id: id,
          action: "changement_statut",
      description: t("dashboard.statusChangedNote", {
        status: t(`statut.${newStatut}`),
      }),
          user_admin: user?.email,
          created_at: new Date().toISOString(),
        });

      if (actionError) {
        console.error("Erreur enregistrement action:", actionError);
      }

      // Mettre à jour l'état local
      setContacts((prev) =>
        prev.map((c) => (c.id === id ? { ...c, suivi_statut: newStatut } : c)),
      );
      setSelectedContact((prev) =>
        prev && prev.id === id ? { ...prev, suivi_statut: newStatut } : prev,
      );
    } catch (err) {
      console.error("Erreur:", err);
        alert(t("genericError"));
    }
  };

  const updateFormule = async (id, formuleLabel) => {
    const current =
      (selectedContact?.id === id ? selectedContact : null) ||
      contacts.find((c) => c.id === id);
    if (!current) return;

    const nextFormule = formuleLabel || null;
    const shouldUnlock =
      Boolean(nextFormule) && !isStudentSpaceUnlocked(current.suivi_statut);
    const notes = nextFormule
      ? mergeFormuleNote(current.notes_admin, nextFormule)
      : stripFormuleNote(current.notes_admin) || null;

    const payloadBase = {
      formule: nextFormule,
      notes_admin: notes,
    };
    if (shouldUnlock) payloadBase.suivi_statut = "formule_choisie";

    const payloads = [
      { ...payloadBase, updated_at: new Date().toISOString() },
      payloadBase,
      {
        notes_admin: notes,
        ...(shouldUnlock ? { suivi_statut: "formule_choisie" } : {}),
      },
    ];

    try {
      let saved = false;
      for (const payload of payloads) {
        const { error } = await supabase
          .from("contacts")
          .update(payload)
          .eq("id", id);
        if (!error) {
          saved = true;
          break;
        }
        console.warn("Erreur update formule:", error.message);
      }

      if (!saved) {
        alert(t("dashboard.formuleSaveFail"));
        return;
      }

      await supabase.from("suivi_actions").insert({
        contact_id: id,
        action: nextFormule ? "formule_choisie" : "contact_modifier",
        description: nextFormule
          ? t("dashboard.formuleSavedNote", { formule: nextFormule })
          : t("dashboard.formuleRemovedNote"),
        user_admin: user?.email,
      });

      const next = {
        ...current,
        formule: nextFormule,
        notes_admin: notes,
        suivi_statut: shouldUnlock
          ? "formule_choisie"
          : current.suivi_statut,
      };

      setContacts((prev) =>
        prev.map((c) => (c.id === id ? { ...c, ...next } : c)),
      );
      setSelectedContact((prev) =>
        prev && prev.id === id ? { ...prev, ...next } : prev,
      );
    } catch (err) {
      console.error("Erreur update formule:", err);
        alert(t("genericError"));
    }
  };

  const updateDossierEtape = async (id, etapeIndex) => {
    const current =
      (selectedContact?.id === id ? selectedContact : null) ||
      contacts.find((c) => c.id === id);
    if (!current) return;

    const step = STUDENT_PROCESS_STEPS[etapeIndex];
    if (!step) return;

    const notes = mergeAvancementNote(current.notes_admin, etapeIndex);
    const payloads = [
      {
        dossier_etape: etapeIndex,
        notes_admin: notes,
        updated_at: new Date().toISOString(),
      },
      { dossier_etape: etapeIndex, notes_admin: notes },
      { notes_admin: notes, updated_at: new Date().toISOString() },
      { notes_admin: notes },
    ];

    try {
      let saved = false;
      for (const payload of payloads) {
        const { error } = await supabase
          .from("contacts")
          .update(payload)
          .eq("id", id);
        if (!error) {
          saved = true;
          break;
        }
        console.warn("Erreur update avancement:", error.message);
      }

      if (!saved) {
        alert(t("dashboard.progressSaveFail"));
        return;
      }

      await supabase.from("suivi_actions").insert({
        contact_id: id,
        action: "changement_statut",
        description: t("dashboard.progressActionNote", {
          step: t(`step.${step.key}`),
        }),
        user_admin: user?.email,
      });

      const next = {
        ...current,
        dossier_etape: etapeIndex,
        notes_admin: notes,
      };
      setContacts((prev) =>
        prev.map((c) => (c.id === id ? { ...c, ...next } : c)),
      );
      setSelectedContact((prev) =>
        prev && prev.id === id ? { ...prev, ...next } : prev,
      );
    } catch (err) {
      console.error("Erreur update avancement:", err);
        alert(t("genericError"));
    }
  };

  const deleteContact = async (id) => {
    if (!confirm(t("dashboard.deleteConfirm"))) return;
    const { error } = await supabase.from("contacts").delete().eq("id", id);
    if (!error) {
      setContacts((prev) => prev.filter((c) => c.id !== id));
      setSelectedContact(null);
    }
  };

  const handleLogout = async () => {
    await signOut();
    router.push("/admin/login");
  };

  const filteredContacts = contacts.filter((c) => {
    const matchSearch =
      c.prenom?.toLowerCase().includes(search.toLowerCase()) ||
      c.nom?.toLowerCase().includes(search.toLowerCase()) ||
      c.email?.toLowerCase().includes(search.toLowerCase());

    const matchStatut =
      filterStatut === "tous" || c.suivi_statut === filterStatut;
    const matchBudget = filterBudget === "tous" || c.budget === filterBudget;
    const matchPays = filterPays === "tous" || c.pays === filterPays;
    const matchNiveau =
      filterNiveau === "tous" || c.dernier_diplome === filterNiveau;
    const matchDomaine =
      filterDomaine === "tous" || c.domaine_etudes === filterDomaine;

    return (
      matchSearch &&
      matchStatut &&
      matchBudget &&
      matchPays &&
      matchNiveau &&
      matchDomaine
    );
  });

const stats = {
  total: contacts.length,
  a_qualifier: contacts.filter((c) => c.suivi_statut === "prospect_à_qualifier")
    .length,
  offre_envoyee: contacts.filter((c) => c.suivi_statut === "offre_envoyée")
    .length,
  attente_paiement: contacts.filter(
    (c) => c.suivi_statut === "attente_paiement",
  ).length,
  paye: contacts.filter((c) => c.suivi_statut === "client_payé").length,
  en_cours_dossier: contacts.filter((c) =>
    ["dossier_préparation", "candidature_envoyée"].includes(c.suivi_statut),
  ).length,
  termine: contacts.filter((c) => c.suivi_statut === "dossier_terminé").length,
};

  return (
    <AdminShell user={user} onLogout={handleLogout}>
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
          <StatCard
            label={t("dashboard.totalContacts")}
            value={stats.total}
            icon="👥"
            color="from-blue-600 to-cyan-500"
          />
          <StatCard
            label={t("dashboard.toQualify")}
            value={stats.a_qualifier}
            icon="📞"
            color="from-indigo-600 to-violet-500"
          />
          <StatCard
            label={t("dashboard.waitingPayment")}
            value={stats.attente_paiement}
            icon="💳"
            color="from-orange-600 to-yellow-500"
          />
          <StatCard
            label={t("dashboard.paidClients")}
            value={stats.paye}
            icon="✅"
            color="from-purple-600 to-pink-500"
          />
        </div>

        {/* Filtres avancés */}
        <div className="bg-slate-800/40 backdrop-blur-md rounded-2xl shadow-2xl p-6 mb-8 border border-slate-700/50">
          <div className="flex flex-col gap-4">
            {/* Ligne 1: Recherche et Statut */}
            <div className="flex flex-col md:flex-row gap-4 items-stretch md:items-center">
              <div className="flex-1 relative">
                <input
                  type="text"
                  placeholder={`🔍 ${t("dashboard.searchPlaceholder")}`}
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full px-5 py-3 bg-slate-700/50 border border-slate-600/50 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-transparent transition-all duration-300"
                />
              </div>
              <select
                value={filterStatut}
                onChange={(e) => setFilterStatut(e.target.value)}
                className="px-5 py-3 bg-slate-700/50 border border-slate-600/50 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all duration-300 font-medium cursor-pointer"
              >
                <option value="tous">📋 {t("dashboard.allStatuses")}</option>
                {STATUTS.map((s) => (
                  <option key={s} value={s}>
                    {STATUT_ICONS[s]} {t(`statut.${s}`)}
                  </option>
                ))}
              </select>
            </div>

            {/* Ligne 2: Filtres supplémentaires */}
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              <select
                value={filterPays}
                onChange={(e) => setFilterPays(e.target.value)}
                className="px-4 py-3 bg-slate-700/50 border border-slate-600/50 rounded-xl text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all duration-300 font-medium cursor-pointer"
              >
                <option value="tous">🌍 {t("dashboard.allCountries")}</option>
                {pays.map((p) => (
                  <option key={p} value={p}>
                    {p}
                  </option>
                ))}
              </select>

              <select
                value={filterNiveau}
                onChange={(e) => setFilterNiveau(e.target.value)}
                className="px-4 py-3 bg-slate-700/50 border border-slate-600/50 rounded-xl text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all duration-300 font-medium cursor-pointer"
              >
                <option value="tous">🎓 {t("dashboard.allLevels")}</option>
                {NIVEAUX_ETUDES.map((n) => (
                  <option key={n} value={n}>
                    {t(`niveau.${n}`)}
                  </option>
                ))}
              </select>

              <select
                value={filterDomaine}
                onChange={(e) => setFilterDomaine(e.target.value)}
                className="px-4 py-3 bg-slate-700/50 border border-slate-600/50 rounded-xl text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all duration-300 font-medium cursor-pointer"
              >
                <option value="tous">📚 {t("dashboard.allDomains")}</option>
                {DOMAINES_ETUDES.map((d) => (
                  <option key={d} value={d}>
                    {t(`domaine.${d}`)}
                  </option>
                ))}
              </select>

              <select
                value={filterBudget}
                onChange={(e) => setFilterBudget(e.target.value)}
                className="px-4 py-3 bg-slate-700/50 border border-slate-600/50 rounded-xl text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all duration-300 font-medium cursor-pointer"
              >
                <option value="tous">💰 {t("dashboard.allBudgets")}</option>
                {BUDGETS.map((b) => (
                  <option key={b} value={b}>
                    {t(`budget.${b}`)}
                  </option>
                ))}
              </select>

              <button
                onClick={fetchContacts}
                className="px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-500 text-white rounded-xl hover:shadow-lg hover:shadow-blue-500/40 transition-all duration-300 font-semibold transform hover:scale-105 active:scale-95"
              >
                🔄 {t("refresh")}
              </button>
            </div>
          </div>
        </div>

        {/* Envoi groupé */}
        <div className="bg-slate-800/40 backdrop-blur-md rounded-2xl shadow-2xl p-5 mb-8 border border-slate-700/50 sticky top-[88px] z-30">
          <div className="flex flex-col lg:flex-row gap-4 lg:items-center">
            <div className="flex-1">
              <p className="text-white font-bold">
                📬 {t("dashboard.bulkTitle")}
                {selectedIds.length > 0
                  ? ` — ${t("dashboard.bulkSelected", { count: selectedIds.length })}`
                  : ""}
              </p>
              <p className="text-xs text-slate-400 mt-1">
                {bulkSending && bulkProgress
                  ? t("dashboard.bulkProgress", {
                      current: bulkProgress.current,
                      total: bulkProgress.total,
                      name: bulkProgress.name,
                    })
                  : t("dashboard.bulkHint")}
              </p>
              {bulkSending && bulkProgress ? (
                <div className="mt-3 h-2 rounded-full bg-slate-700 overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-amber-500 to-orange-500 transition-all duration-300"
                    style={{
                      width: `${Math.round(
                        (bulkProgress.current / bulkProgress.total) * 100,
                      )}%`,
                    }}
                  />
                </div>
              ) : null}
            </div>
            <select
              value={bulkTemplate}
              disabled={bulkSending}
              onChange={(e) => setBulkTemplate(e.target.value)}
              className="px-5 py-3 bg-slate-700/50 border border-slate-600/50 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-amber-500/50 transition-all duration-300 font-semibold cursor-pointer disabled:opacity-50"
            >
              {EMAIL_TEMPLATE_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {t(`emailTemplate.${option.value}`)}
                </option>
              ))}
            </select>
            <div className="flex flex-wrap gap-3">
              <button
                type="button"
                disabled={bulkSending || filteredContacts.length === 0}
                onClick={() => {
                  const filteredIds = filteredContacts.map((c) => c.id);
                  const allSelected =
                    filteredIds.length > 0 &&
                    filteredIds.every((id) => selectedIds.includes(id));
                  if (allSelected) {
                    setSelectedIds((prev) =>
                      prev.filter((id) => !filteredIds.includes(id)),
                    );
                    return;
                  }
                  setSelectedIds((prev) => [
                    ...new Set([...prev, ...filteredIds]),
                  ]);
                }}
                className="px-5 py-3 bg-slate-700/70 hover:bg-slate-600 text-white rounded-xl font-bold transition-all duration-300 disabled:opacity-50"
              >
                {filteredContacts.length > 0 &&
                filteredContacts.every((c) => selectedIds.includes(c.id))
                  ? t("dashboard.deselectAll")
                  : t("dashboard.selectFiltered")}
              </button>
              {selectedIds.length > 0 ? (
                <button
                  type="button"
                  disabled={bulkSending}
                  onClick={() => setSelectedIds([])}
                  className="px-5 py-3 bg-slate-700/70 hover:bg-slate-600 text-white rounded-xl font-bold transition-all duration-300 disabled:opacity-50"
                >
                  {t("dashboard.clear")}
                </button>
              ) : null}
              <button
                type="button"
                disabled={bulkSending || selectedIds.length === 0}
                onClick={sendBulkEmails}
                className="px-6 py-3 bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-500 hover:to-orange-500 text-white rounded-xl font-bold transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
              >
                {bulkSending
                  ? `⏳ ${t("dashboard.sendingCount", {
                      current: bulkProgress?.current || 0,
                      total: bulkProgress?.total || 0,
                    })}`
                  : `📤 ${t("dashboard.send", { count: selectedIds.length })}`}
              </button>
            </div>
          </div>
        </div>

        {/* Table */}
        <div className="bg-slate-800/40 backdrop-blur-md rounded-2xl shadow-2xl overflow-hidden border border-slate-700/50">
          {loading ? (
            <div className="p-16 text-center">
              <div className="inline-block animate-spin text-4xl mb-4">⏳</div>
              <p className="text-slate-400 text-lg font-medium">
                {t("dashboard.loadingContacts")}
              </p>
            </div>
          ) : filteredContacts.length === 0 ? (
            <div className="p-16 text-center">
              <p className="text-slate-300 text-xl font-semibold mb-2">
                😔 {t("dashboard.noContacts")}
              </p>
              <p className="text-slate-500">{t("dashboard.adjustFilters")}</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-slate-900/60 border-b border-slate-700/50">
                  <tr>
                    <th className="px-4 py-4 w-12">
                      <input
                        type="checkbox"
                        checked={
                          filteredContacts.length > 0 &&
                          filteredContacts.every((c) =>
                            selectedIds.includes(c.id),
                          )
                        }
                        disabled={bulkSending}
                        onChange={() => {
                          const filteredIds = filteredContacts.map((c) => c.id);
                          const allSelected = filteredIds.every((id) =>
                            selectedIds.includes(id),
                          );
                          if (allSelected) {
                            setSelectedIds((prev) =>
                              prev.filter((id) => !filteredIds.includes(id)),
                            );
                            return;
                          }
                          setSelectedIds((prev) => [
                            ...new Set([...prev, ...filteredIds]),
                          ]);
                        }}
                        className="h-4 w-4 rounded border-slate-500 bg-slate-700 text-amber-500 focus:ring-amber-500/50 cursor-pointer"
                      />
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-slate-300 uppercase tracking-widest">
                      👤 {t("dashboard.colName")}
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-slate-300 uppercase tracking-widest">
                      🌍 {t("dashboard.colCountry")}
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-slate-300 uppercase tracking-widest">
                      🎓 {t("dashboard.colLevel")}
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-slate-300 uppercase tracking-widest">
                      📚 {t("dashboard.colDomain")}
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-slate-300 uppercase tracking-widest">
                      💰 {t("dashboard.colBudget")}
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-slate-300 uppercase tracking-widest">
                      ⭐ {t("dashboard.colStatus")}
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-slate-300 uppercase tracking-widest">
                      ⚙️ {t("dashboard.colActions")}
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-700/50">
                  {filteredContacts.map((c) => (
                    <tr
                      key={c.id}
                      className={`hover:bg-slate-700/30 transition-all duration-200 group ${
                        selectedIds.includes(c.id) ? "bg-amber-500/10" : ""
                      }`}
                    >
                      <td className="px-4 py-4">
                        <input
                          type="checkbox"
                          checked={selectedIds.includes(c.id)}
                          disabled={bulkSending}
                          onChange={() => toggleSelected(c.id)}
                          onClick={(e) => e.stopPropagation()}
                          className="h-4 w-4 rounded border-slate-500 bg-slate-700 text-amber-500 focus:ring-amber-500/50 cursor-pointer"
                        />
                      </td>
                      <td className="px-6 py-4">
                        <span className="font-semibold text-white group-hover:text-blue-400 transition-colors">
                          {c.prenom} {c.nom}
                        </span>
                        {getChosenFormule(c) ? (
                          <p className="text-xs text-cyan-300 mt-1 font-semibold">
                            📋 {translatedOrRaw(t, "formule", getChosenFormule(c))}
                          </p>
                        ) : null}
                        <p className="text-xs text-slate-500 mt-1">{c.email}</p>
                      </td>
                      <td className="px-6 py-4 text-slate-300 text-sm">
                        {c.pays || "—"}
                      </td>
                      <td className="px-6 py-4 text-slate-300 text-sm">
                        {c.dernier_diplome
                          ? translatedOrRaw(t, "niveau", c.dernier_diplome)
                          : "—"}
                      </td>
                      <td className="px-6 py-4 text-slate-300 text-sm">
                        {c.domaine_etudes
                          ? translatedOrRaw(t, "domaine", c.domaine_etudes)
                          : "—"}
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-sm font-bold px-3 py-1 rounded-lg bg-slate-700/30 text-slate-300">
                          {c.budget
                            ? translatedOrRaw(t, "budget", c.budget)
                            : "—"}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <select
                          value={c.suivi_statut || ""}
                          onChange={(e) => updateStatut(c.id, e.target.value)}
                          className={`text-xs px-3 py-2 rounded-lg font-bold border ${
                            STATUT_COLORS[c.suivi_statut] ||
                            "bg-slate-700/20 text-slate-400 border-slate-600/30"
                          } focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all duration-300 cursor-pointer`}
                        >
                          <option value="">{t("dashboard.select")}</option>
                          {STATUTS.map((s) => (
                            <option key={s} value={s}>
                              {STATUT_ICONS[s]} {t(`statut.${s}`)}
                            </option>
                          ))}
                        </select>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex gap-2">
                          <button
                            onClick={() => setSelectedContact(c)}
                            className="text-blue-400 hover:text-blue-300 hover:bg-blue-500/20 px-3 py-1 rounded-lg text-sm font-semibold transition-all duration-200"
                          >
                            👁️ {t("dashboard.view")}
                          </button>
                          <button
                            onClick={() => deleteContact(c.id)}
                            className="text-red-400 hover:text-red-300 hover:bg-red-500/20 px-3 py-1 rounded-lg text-sm font-semibold transition-all duration-200"
                          >
                            🗑️ {t("dashboard.deleteShort")}
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Footer */}
          <div className="bg-slate-900/40 px-6 py-4 border-t border-slate-700/50 text-center">
            <p className="text-slate-400 text-sm font-medium">
              📊 {t("dashboard.shown", {
                filtered: filteredContacts.length,
                total: contacts.length,
              })}
            </p>
          </div>
        </div>

      {/* Modal détail */}
      {selectedContact && (
        <ContactModal
          contact={selectedContact}
          onClose={() => setSelectedContact(null)}
          onUpdateStatut={updateStatut}
          onUpdateFormule={updateFormule}
          onUpdateDossierEtape={updateDossierEtape}
          userEmail={user?.email}
          onContactUpdated={fetchContacts}
        />
      )}
    </AdminShell>
  );
}

function StatCard({ label, value, icon, color }) {
  return (
    <div
      className={`bg-gradient-to-br ${color} rounded-2xl p-6 text-white shadow-2xl hover:shadow-2xl transition-all duration-300 border border-white/10 group hover:scale-105 cursor-default`}
    >
      <div className="flex items-center justify-between">
        <div>
          <p className="text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-slate-200">
            {value}
          </p>
          <p className="text-sm text-white/80 mt-2 font-medium">{label}</p>
        </div>
        <span className="text-5xl opacity-30 group-hover:opacity-50 transition-opacity duration-300 transform group-hover:scale-110">
          {icon}
        </span>
      </div>
    </div>
  );
}

function ContactModal({
  contact,
  onClose,
  onUpdateStatut,
  onUpdateFormule,
  onUpdateDossierEtape,
  userEmail,
  onContactUpdated,
}) {
  const { t, lang } = useAdminI18n();
  const [actions, setActions] = useState([]);
  const [newAction, setNewAction] = useState("");
  const [newDescription, setNewDescription] = useState("");
  const [notes, setNotes] = useState(contact.notes_admin || "");
  const [loadingActions, setLoadingActions] = useState(true);
  const [emailTemplate, setEmailTemplate] = useState("formules_presentation");
  const [sendingEmail, setSendingEmail] = useState(false);
  const [selectedFormule, setSelectedFormule] = useState(
    getChosenFormule(contact),
  );
  const [savingFormule, setSavingFormule] = useState(false);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/immutability
    fetchActions();
    setNotes(contact.notes_admin || "");
    setSelectedFormule(getChosenFormule(contact));
  }, [contact.id, contact.formule, contact.notes_admin]);

  const fetchActions = async () => {
    setLoadingActions(true);
    const { data, error } = await supabase
      .from("suivi_actions")
      .select("*")
      .eq("contact_id", contact.id)
      .order("created_at", { ascending: false });

    if (!error) setActions(data);
    setLoadingActions(false);
  };

  const addAction = async (e) => {
    e.preventDefault();
    if (!newAction) return;

    const { error } = await supabase.from("suivi_actions").insert({
      contact_id: contact.id,
      action: newAction,
      description: newDescription,
      user_admin: userEmail,
    });

    if (!error) {
      setNewAction("");
      setNewDescription("");
      fetchActions();
    }
  };

  const saveNotes = async () => {
    await supabase
      .from("contacts")
      .update({ notes_admin: notes })
      .eq("id", contact.id);
  };

  async function sendSelectedEmail() {
    const confirmed = confirm(
      t("dashboard.sendEmailConfirm", {
        template: t(`emailTemplate.${emailTemplate}`),
        name: contact.prenom,
      }),
    );
    if (!confirmed) return;

    setSendingEmail(true);
    try {
      const payload = {
        contactId: String(contact.id),
        emailTemplate,
      };

      const response = await authedFetch("/api/email/auto-reply", {
        method: "POST",
        body: JSON.stringify(payload),
      });

      const data = await response.json();
      console.log("✅ Réponse serveur:", data);

      if (data.success) {
        alert(`✅ ${t("dashboard.emailOk")}`);
        fetchActions();
        onContactUpdated?.();
        return data;
      }

      alert("❌ " + t("dashboard.emailFail", { error: data.message || data.error }));
      return null;
    } catch (error) {
      console.error("❌ Erreur fetch:", error);
      alert("❌ " + t("dashboard.networkError", { error: error.message }));
      return null;
    } finally {
      setSendingEmail(false);
    }
  }

  return (
    <div
      className="fixed inset-0 bg-black/70 backdrop-blur-xl flex items-center justify-center p-4 z-50"
      onClick={onClose}
    >
      <div
        className="bg-slate-800 rounded-3xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto border border-slate-700/50"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 p-8 flex justify-between items-start sticky top-0 z-10">
          <div>
            <h2 className="text-3xl font-bold text-white">
              👤 {contact.prenom} {contact.nom}
            </h2>
            {getChosenFormule(contact) ? (
              <p className="text-white text-lg font-semibold mt-3 bg-white/15 inline-block px-4 py-2 rounded-xl">
                📋 {translatedOrRaw(t, "formule", getChosenFormule(contact))}
              </p>
            ) : (
              <p className="text-blue-100 text-sm mt-2 font-medium">
                {t("dashboard.noFormuleChosen")}
              </p>
            )}
            <p className="text-blue-100 text-sm mt-2 font-medium">
              {contact.email}
            </p>
          </div>

          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="text-white hover:bg-white/20 rounded-xl p-2 transition-all duration-200 hover:scale-110 active:scale-95"
            >
              ✕
            </button>
          </div>
        </div>

        <div className="p-8">
          {/* Infos Grid - Style tableau */}
          <div className="mb-8 overflow-x-auto">
            <table className="w-full border-collapse">
              <tbody>
                <tr className="border-b border-slate-700/50">
                  <td className="px-4 py-3 font-bold text-slate-300 bg-slate-700/20 w-1/3">
                    📧 {t("dashboard.email")}
                  </td>
                  <td className="px-4 py-3 text-white">{contact.email}</td>
                </tr>
                <tr className="border-b border-slate-700/50">
                  <td className="px-4 py-3 font-bold text-slate-300 bg-slate-700/20">
                    📱 {t("dashboard.phone")}
                  </td>
                  <td className="px-4 py-3 text-white">
                    {contact.phone || "—"}
                  </td>
                </tr>
                <tr className="border-b border-slate-700/50">
                  <td className="px-4 py-3 font-bold text-slate-300 bg-slate-700/20">
                    🌍 {t("dashboard.country")}
                  </td>
                  <td className="px-4 py-3 text-white">
                    {contact.pays || "—"}
                  </td>
                </tr>
                <tr className="border-b border-slate-700/50">
                  <td className="px-4 py-3 font-bold text-slate-300 bg-slate-700/20">
                    🎓 {t("dashboard.studyLevel")}
                  </td>
                  <td className="px-4 py-3 text-white">
                    {contact.dernier_diplome
                      ? translatedOrRaw(t, "niveau", contact.dernier_diplome)
                      : "—"}
                  </td>
                </tr>
                <tr className="border-b border-slate-700/50">
                  <td className="px-4 py-3 font-bold text-slate-300 bg-slate-700/20">
                    📚 {t("dashboard.domain")}
                  </td>
                  <td className="px-4 py-3 text-white">
                    {contact.domaine_etudes
                      ? translatedOrRaw(t, "domaine", contact.domaine_etudes)
                      : "—"}
                  </td>
                </tr>
                <tr className="border-b border-slate-700/50">
                  <td className="px-4 py-3 font-bold text-slate-300 bg-slate-700/20">
                    💰 {t("dashboard.budget")}
                  </td>
                  <td className="px-4 py-3 text-white font-semibold">
                    {contact.budget
                      ? translatedOrRaw(t, "budget", contact.budget)
                      : "—"}
                  </td>
                </tr>
                <tr className="border-b border-slate-700/50">
                  <td className="px-4 py-3 font-bold text-slate-300 bg-slate-700/20">
                    📅 {t("dashboard.intakeDate")}
                  </td>
                  <td className="px-4 py-3 text-white">
                    {contact.date_rentree || "—"}
                  </td>
                </tr>
                <tr className="border-b border-slate-700/50">
                  <td className="px-4 py-3 font-bold text-slate-300 bg-slate-700/20">
                    🔍 {t("dashboard.source")}
                  </td>
                  <td className="px-4 py-3 text-white">
                    {contact.source || "—"}
                  </td>
                </tr>
                <tr>
                  <td className="px-4 py-3 font-bold text-slate-300 bg-slate-700/20">
                    ⭐ {t("dashboard.qualityScore")}
                  </td>
                  <td className="px-4 py-3 text-white">
                    {contact.score_qualite || "—"}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Envoi d'email */}
          <div className="mb-8 pb-8 border-b border-slate-700/50">
            <label className="text-sm font-bold text-slate-300 block mb-3 uppercase tracking-wide">
              📧 {t("dashboard.emailSection")}
            </label>
            <div className="flex flex-col md:flex-row gap-3">
              <select
                value={emailTemplate}
                onChange={(e) => setEmailTemplate(e.target.value)}
                className="flex-1 px-5 py-3 bg-slate-700/50 border border-slate-600/50 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all duration-300 font-semibold cursor-pointer"
              >
                {EMAIL_TEMPLATE_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {t(`emailTemplate.${option.value}`)}
                  </option>
                ))}
              </select>
              <button
                type="button"
                onClick={sendSelectedEmail}
                disabled={sendingEmail}
                className="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white rounded-xl font-bold transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
              >
                {sendingEmail ? `⏳ ${t("sending")}` : `📤 ${t("dashboard.sendEmail")}`}
              </button>
            </div>
            <p className="text-xs text-slate-500 mt-3">
              {emailTemplate === "formules_presentation" &&
                t("dashboard.emailHintFormules")}
              {emailTemplate === "relance_1" &&
                t("dashboard.emailHintRelance1")}
              {emailTemplate === "relance_2" &&
                t("dashboard.emailHintRelance2")}
            </p>
          </div>

          {/* Formule d'accompagnement */}
          <div className="mb-8 pb-8 border-b border-slate-700/50">
            <label className="text-sm font-bold text-slate-300 block mb-3 uppercase tracking-wide">
              📋 {t("dashboard.formuleSection")}
            </label>
            <div className="flex flex-col sm:flex-row gap-3">
              <select
                value={
                  FORMULE_OPTIONS.some((o) => o.value === selectedFormule)
                    ? selectedFormule
                    : selectedFormule
                      ? "__custom__"
                      : ""
                }
                onChange={(e) => {
                  if (e.target.value === "__custom__") return;
                  setSelectedFormule(e.target.value);
                }}
                className="flex-1 px-5 py-3 bg-slate-700/50 border border-slate-600/50 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all duration-300 font-semibold cursor-pointer"
              >
                <option value="">{t("dashboard.noFormule")}</option>
                {FORMULE_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {t(`formule.${option.value}`)}
                  </option>
                ))}
                {selectedFormule &&
                  !FORMULE_OPTIONS.some((o) => o.value === selectedFormule) && (
                    <option value="__custom__">{selectedFormule}</option>
                  )}
              </select>
              <button
                type="button"
                disabled={
                  savingFormule ||
                  (selectedFormule || "") === getChosenFormule(contact)
                }
                onClick={async () => {
                  setSavingFormule(true);
                  try {
                    await onUpdateFormule(contact.id, selectedFormule);
                    fetchActions();
                  } finally {
                    setSavingFormule(false);
                  }
                }}
                className="px-6 py-3 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white rounded-xl font-bold transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
              >
                {savingFormule ? `⏳ ${t("saving")}` : `💾 ${t("save")}`}
              </button>
            </div>
            <p className="text-xs text-slate-500 mt-3">
              {t("dashboard.formuleHint")}
            </p>
          </div>

          {/* Avancement dossier */}
          <div className="mb-8 pb-8 border-b border-slate-700/50">
            <label className="text-sm font-bold text-slate-300 block mb-3 uppercase tracking-wide">
              📈 {t("dashboard.progressSection")}
            </label>
            <p className="text-xs text-slate-400 mb-4">
              {t("dashboard.progressVisible")}{" "}
              <span className="text-white font-semibold">
                {t(
                  `step.${STUDENT_PROCESS_STEPS[getDisplayedStepIndex(contact)]?.key}`,
                )}
              </span>
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {STUDENT_PROCESS_STEPS.map((step, index) => {
                const current = getDisplayedStepIndex(contact) === index;
                return (
                  <button
                    key={step.key}
                    type="button"
                    onClick={() => onUpdateDossierEtape(contact.id, index)}
                    className={`text-left px-4 py-3 rounded-xl border font-semibold transition-all duration-200 ${
                      current
                        ? "bg-cyan-500/20 border-cyan-400 text-white"
                        : "bg-slate-700/40 border-slate-600/50 text-slate-300 hover:bg-slate-700"
                    }`}
                  >
                    <span className="mr-2">{step.icon}</span>
                    {index + 1}. {t(`step.${step.key}`)}
                  </button>
                );
              })}
            </div>
          </div>

          <AdminStudentFiles contactId={contact.id} />

          {/* Accès espace étudiant */}
          <div className="mb-8 pb-8 border-b border-slate-700/50">
            <label className="text-sm font-bold text-slate-300 block mb-3 uppercase tracking-wide">
              🎓 {t("dashboard.studentSpace")}
            </label>
            {isStudentSpaceUnlocked(contact.suivi_statut) ? (
              <>
                <p className="text-sm text-emerald-300 mb-3">
                  {t("dashboard.unlocked")}
                </p>
                <button
                  type="button"
                  onClick={() => onUpdateStatut(contact.id, "choix_des_formules")}
                  className="px-6 py-3 bg-slate-700/70 hover:bg-slate-600 text-white rounded-xl font-bold transition-all duration-300"
                >
                  {t("dashboard.lockSpace")}
                </button>
              </>
            ) : (
              <>
                <p className="text-sm text-slate-400 mb-3">
                  {t("dashboard.locked")}
                </p>
                <button
                  type="button"
                  onClick={() => onUpdateStatut(contact.id, "formule_choisie")}
                  className="px-6 py-3 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white rounded-xl font-bold transition-all duration-300"
                >
                  {t("dashboard.unlockSpace")}
                </button>
              </>
            )}
          </div>

          {/* Statut Selector */}
          <div className="mb-8 pb-8 border-b border-slate-700/50">
            <label className="text-sm font-bold text-slate-300 block mb-3 uppercase tracking-wide">
              ⭐ {t("dashboard.currentStatus")}
            </label>
            <select
              value={contact.suivi_statut || ""}
              onChange={(e) => onUpdateStatut(contact.id, e.target.value)}
              className="w-full px-5 py-3 bg-slate-700/50 border border-slate-600/50 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all duration-300 font-semibold"
            >
              <option value="">{t("dashboard.selectStatus")}</option>
              {STATUTS.map((s) => (
                <option key={s} value={s}>
                  {STATUT_ICONS[s]} {t(`statut.${s}`)}
                </option>
              ))}
            </select>
          </div>

          {/* Notes Admin */}
          <div className="mb-8 pb-8 border-b border-slate-700/50">
            <label className="text-sm font-bold text-slate-300 block mb-3 uppercase tracking-wide">
              📝 {t("dashboard.internalNotes")}
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              onBlur={saveNotes}
              rows={4}
              className="w-full px-5 py-3 bg-slate-700/50 border border-slate-600/50 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all duration-300 resize-none"
              placeholder={t("dashboard.notesPlaceholder")}
            />
          </div>

          {/* Ajouter une action */}
          <form
            onSubmit={addAction}
            className="mb-8 pb-8 border-b border-slate-700/50"
          >
            <h3 className="text-sm font-bold text-white mb-4 uppercase tracking-wide">
              ➕ {t("dashboard.logAction")}
            </h3>
            <div className="flex flex-col gap-4">
              <select
                value={newAction}
                onChange={(e) => setNewAction(e.target.value)}
                className="px-5 py-3 bg-slate-700/50 border border-slate-600/50 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all duration-300 font-medium cursor-pointer"
              >
                <option value="">{t("dashboard.chooseAction")}</option>
                {ACTIONS_TYPES.map((a) => (
                  <option key={a.value} value={a.value}>
                    {a.icon} {t(`action.${a.value}`)}
                  </option>
                ))}
              </select>
              <textarea
                value={newDescription}
                onChange={(e) => setNewDescription(e.target.value)}
                placeholder={t("dashboard.actionPlaceholder")}
                rows={2}
                className="px-5 py-3 bg-slate-700/50 border border-slate-600/50 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all duration-300 resize-none"
              />
              <button
                type="submit"
                className="bg-gradient-to-r from-blue-600 to-blue-500 text-white py-3 rounded-xl font-bold hover:shadow-lg hover:shadow-blue-500/40 transition-all duration-300 transform hover:scale-105 active:scale-95 uppercase tracking-wide"
              >
                ✅ {t("dashboard.saveAction")}
              </button>
            </div>
          </form>

          {/* Historique */}
          <div>
            <h3 className="text-sm font-bold text-white mb-4 uppercase tracking-wide">
              📜 {t("dashboard.history")} ({actions.length})
            </h3>
            <div className="space-y-3 max-h-64 overflow-y-auto">
              {loadingActions ? (
                <p className="text-slate-400 text-center py-4">{t("loading")}</p>
              ) : actions.length === 0 ? (
                <p className="text-slate-400 text-center py-4">
                  {t("dashboard.noActions")}
                </p>
              ) : (
                actions.map((action) => {
                  const actionType = ACTIONS_TYPES.find(
                    (a) => a.value === action.action,
                  );
                  return (
                    <div
                      key={action.id}
                      className="bg-slate-700/30 border border-slate-600/50 rounded-xl p-4 hover:bg-slate-700/50 transition-all duration-200"
                    >
                      <div className="flex justify-between items-start mb-2">
                        <span className="font-bold text-blue-300">
                          {actionType?.icon}{" "}
                          {actionType
                            ? t(`action.${actionType.value}`)
                            : action.action}
                        </span>
                        <span className="text-xs text-slate-500 font-medium">
                          {new Date(action.created_at).toLocaleString(
                            lang === "zh" ? "zh-CN" : lang === "en" ? "en-GB" : "fr-FR",
                          )}
                        </span>
                      </div>
                      {action.description && (
                        <p className="text-slate-300 text-sm mb-2">
                          {action.description}
                        </p>
                      )}
                      {action.user_admin && (
                        <p className="text-xs text-slate-600">
                          👤 {action.user_admin}
                        </p>
                      )}
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
