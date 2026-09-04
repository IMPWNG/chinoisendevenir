"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { adminSupabase } from "../lib/supabase";
import { useAdminAuth } from "../context/AdminAuthContext";
import AdminShell from "../components/AdminShell";
import AdminStudentFiles from "../components/AdminStudentFiles";
import AdminMatchingPanel from "../components/AdminMatchingPanel";
import AdminContactInfo from "../components/AdminContactInfo";
import AdminCalendar from "../components/AdminCalendar";
import { isMatchingPayloadAction } from "../lib/matching/persist";
import {
  WHATSAPP_TEMPLATE_OPTIONS,
  generateWhatsAppText,
  whatsappNumberFromContact,
  isValidWhatsAppNumber,
  buildWhatsAppLink,
} from "../lib/whatsapp/messages";
import { useAdminI18n } from "../context/AdminI18nContext";
import { generateCustomEmailHtml } from "../lib/emailLayout";
import {
  isStudentSpaceUnlocked,
  isStudentAccessGranted,
  getChosenFormule,
  getDisplayedStepIndex,
  STUDENT_PROCESS_STEPS,
  mergeFormuleNote,
  stripFormuleNote,
  mergeAvancementNote,
} from "../lib/studentProgress";
import {
  FORMULES,
  canonicalFormuleValue,
  displayFormuleLabel,
  getFormuleNumber,
} from "../lib/formules";

async function authedFetch(path, options = {}) {
  const {
    data: { session },
  } = await adminSupabase.auth.getSession();
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

const NIVEAUX_ETUDES = ["bac", "licence", "master", "doctorat", "autre"];

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

const CONTACT_EMAIL_TEMPLATE_OPTIONS = [
  ...EMAIL_TEMPLATE_OPTIONS,
  { value: "custom", label: "✏️ Message libre" },
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
  { value: "whatsapp_envoye", label: "WhatsApp envoyé", icon: "📱" },
  { value: "whatsapp_formules", label: "WhatsApp formules envoyé", icon: "📋" },
  { value: "reponse_client", label: "Réponse client (email)", icon: "📥" },
  { value: "reponse_whatsapp", label: "Réponse client (WhatsApp)", icon: "💬" },
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
  { value: "matching", label: "Matching universités", icon: "🎯" },
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
  const [editOnOpen, setEditOnOpen] = useState(false);
  const [selectedIds, setSelectedIds] = useState([]);
  const [bulkTemplate, setBulkTemplate] = useState("relance_1");
  const [bulkChannel, setBulkChannel] = useState("email");
  const [bulkSending, setBulkSending] = useState(false);
  const [bulkProgress, setBulkProgress] = useState(null);
  const [pays, setPays] = useState([]);
  const { signOut, user } = useAdminAuth();
  const router = useRouter();

  useEffect(() => {
    // eslint-disable-next-line react-hooks/immutability
    fetchContacts();
  }, []);

  const fetchContacts = async () => {
    setLoading(true);
    const { data, error } = await adminSupabase
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

  const sendBulkMessages = async () => {
    const selected = contacts.filter((c) => selectedIds.includes(c.id));
    const viaWhatsapp = bulkChannel === "whatsapp";
    const recipients = selected.filter((c) =>
      viaWhatsapp
        ? isValidWhatsAppNumber(whatsappNumberFromContact(c))
        : Boolean(c.email),
    );
    if (recipients.length === 0) {
      alert(viaWhatsapp ? t("dashboard.noPhone") : t("dashboard.noEmail"));
      return;
    }

    const templateLabel = t(`emailTemplate.${bulkTemplate}`);
    const confirmed = confirm(
      t(viaWhatsapp ? "dashboard.bulkConfirmWhatsapp" : "dashboard.bulkConfirm", {
        template: templateLabel,
        count: recipients.length,
      }),
    );
    if (!confirmed) return;

    setBulkSending(true);
    const sent = [];
    const failed = [];

    try {
      for (let i = 0; i < recipients.length; i++) {
        const contact = recipients[i];
        setBulkProgress({
          current: i + 1,
          total: recipients.length,
          name: `${contact.prenom || ""} ${contact.nom || ""}`.trim(),
        });

        try {
          const response = await authedFetch(
            viaWhatsapp ? "/api/whatsapp/send" : "/api/email/auto-reply",
            {
              method: "POST",
              body: JSON.stringify(
                viaWhatsapp
                  ? {
                      contactId: String(contact.id),
                      whatsappTemplate: bulkTemplate,
                    }
                  : {
                      contactId: String(contact.id),
                      emailTemplate: bulkTemplate,
                    },
              ),
            },
          );
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
      const { error } = await adminSupabase
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
      const { error: actionError } = await adminSupabase
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
        const { error } = await adminSupabase
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

      await adminSupabase.from("suivi_actions").insert({
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
        const { error } = await adminSupabase
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

      await adminSupabase.from("suivi_actions").insert({
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
    const { error } = await adminSupabase.from("contacts").delete().eq("id", id);
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

        <AdminCalendar
          contacts={contacts}
          onOpenContact={(contact) => {
            const full =
              contacts.find((c) => String(c.id) === String(contact.id)) ||
              contact;
            setEditOnOpen(false);
            setSelectedContact(full);
          }}
        />

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
                    className={`h-full bg-gradient-to-r transition-all duration-300 ${
                      bulkChannel === "whatsapp"
                        ? "from-emerald-500 to-green-500"
                        : "from-amber-500 to-orange-500"
                    }`}
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
              value={bulkChannel}
              disabled={bulkSending}
              onChange={(e) => setBulkChannel(e.target.value)}
              className="px-5 py-3 bg-slate-700/50 border border-slate-600/50 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-amber-500/50 transition-all duration-300 font-semibold cursor-pointer disabled:opacity-50"
            >
              <option value="email">📧 {t("dashboard.bulkChannelEmail")}</option>
              <option value="whatsapp">
                📱 {t("dashboard.bulkChannelWhatsapp")}
              </option>
            </select>
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
                onClick={sendBulkMessages}
                className={`px-6 py-3 bg-gradient-to-r text-white rounded-xl font-bold transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap ${
                  bulkChannel === "whatsapp"
                    ? "from-emerald-600 to-green-600 hover:from-emerald-500 hover:to-green-500"
                    : "from-amber-600 to-orange-600 hover:from-amber-500 hover:to-orange-500"
                }`}
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
                            onClick={() => {
                              setEditOnOpen(false);
                              setSelectedContact(c);
                            }}
                            className="text-blue-400 hover:text-blue-300 hover:bg-blue-500/20 px-3 py-1 rounded-lg text-sm font-semibold transition-all duration-200"
                          >
                            👁️ {t("dashboard.view")}
                          </button>
                          <button
                            onClick={() => {
                              setEditOnOpen(true);
                              setSelectedContact(c);
                            }}
                            className="text-cyan-400 hover:text-cyan-300 hover:bg-cyan-500/20 px-3 py-1 rounded-lg text-sm font-semibold transition-all duration-200"
                          >
                            ✏️ {t("dashboard.editShort")}
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
          onClose={() => {
            setSelectedContact(null);
            setEditOnOpen(false);
          }}
          onUpdateStatut={updateStatut}
          onUpdateFormule={updateFormule}
          onUpdateDossierEtape={updateDossierEtape}
          userEmail={user?.email}
          onContactUpdated={fetchContacts}
          onContactPatched={(updated) => {
            setContacts((prev) =>
              prev.map((c) =>
                c.id === updated.id ? { ...c, ...updated } : c,
              ),
            );
            setSelectedContact((prev) =>
              prev && prev.id === updated.id ? { ...prev, ...updated } : prev,
            );
          }}
          startEditing={editOnOpen}
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
  onContactPatched,
  startEditing,
}) {
  const { t, lang } = useAdminI18n();
  const [actions, setActions] = useState([]);
  const [newAction, setNewAction] = useState("");
  const [newDescription, setNewDescription] = useState("");
  const [notes, setNotes] = useState(contact.notes_admin || "");
  const [loadingActions, setLoadingActions] = useState(true);
  const [emailTemplate, setEmailTemplate] = useState("formules_presentation");
  const [sendingEmail, setSendingEmail] = useState(false);
  const [customEmailSubject, setCustomEmailSubject] = useState("");
  const [customEmailTitle, setCustomEmailTitle] = useState("");
  const [customEmailSubtitle, setCustomEmailSubtitle] = useState("");
  const [customEmailMessage, setCustomEmailMessage] = useState("");
  const [emailAiNotes, setEmailAiNotes] = useState("");
  const [composingEmail, setComposingEmail] = useState(false);
  const [emailAiError, setEmailAiError] = useState("");
  const [whatsappTemplate, setWhatsappTemplate] = useState(
    "formules_presentation",
  );
  const [customWhatsappMessage, setCustomWhatsappMessage] = useState("");
  const [sendingWhatsapp, setSendingWhatsapp] = useState(false);
  const [selectedFormule, setSelectedFormule] = useState(
    canonicalFormuleValue(getChosenFormule(contact)),
  );
  const [savingFormule, setSavingFormule] = useState(false);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/immutability
    fetchActions();
    setNotes(contact.notes_admin || "");
    setSelectedFormule(canonicalFormuleValue(getChosenFormule(contact)));
  }, [contact.id, contact.formule, contact.notes_admin]);

  useEffect(() => {
    setCustomEmailSubject("");
    setCustomEmailTitle("");
    setCustomEmailSubtitle("");
    setCustomEmailMessage("");
    setEmailAiNotes("");
    setEmailAiError("");
  }, [contact.id]);

  const accessGranted = isStudentAccessGranted(contact);
  const chosenFormuleNumber = getFormuleNumber(getChosenFormule(contact));
  const selectedFormuleNumber = getFormuleNumber(selectedFormule);
  const sameActiveFormule =
    accessGranted &&
    selectedFormuleNumber != null &&
    selectedFormuleNumber === chosenFormuleNumber;

  const saveChosenFormule = async () => {
    const value = canonicalFormuleValue(selectedFormule);
    if (!value) {
      alert(t("dashboard.unlockNeedFormule"));
      return;
    }
    setSavingFormule(true);
    try {
      await onUpdateFormule(contact.id, value);
      fetchActions();
    } finally {
      setSavingFormule(false);
    }
  };

  const fetchActions = async () => {
    setLoadingActions(true);
    const { data, error } = await adminSupabase
      .from("suivi_actions")
      .select("*")
      .eq("contact_id", contact.id)
      .order("created_at", { ascending: false });

    if (!error) {
      setActions(
        (data || []).filter(
          (action) =>
            action.action !== "matching_payload" &&
            !isMatchingPayloadAction(action),
        ),
      );
    }
    setLoadingActions(false);
  };

  const addAction = async (e) => {
    e.preventDefault();
    if (!newAction) return;

    const { error } = await adminSupabase.from("suivi_actions").insert({
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
    await adminSupabase
      .from("contacts")
      .update({ notes_admin: notes })
      .eq("id", contact.id);
  };

  async function composeEmailWithAi() {
    const notes = emailAiNotes.trim();
    if (notes.length < 8) {
      setEmailAiError(t("dashboard.emailAiEmpty"));
      return;
    }

    setComposingEmail(true);
    setEmailAiError("");
    try {
      const response = await authedFetch("/api/admin/compose-email", {
        method: "POST",
        body: JSON.stringify({
          contactId: String(contact.id),
          notes,
        }),
      });
      const data = await response.json();
      if (!response.ok || !data.success) {
        setEmailAiError(
          t("dashboard.emailAiFail", {
            error: data.error || data.message || t("unknownError"),
          }),
        );
        return;
      }
      setCustomEmailSubject(data.subject || "");
      setCustomEmailTitle(data.title || "");
      setCustomEmailSubtitle(data.subtitle || "");
      setCustomEmailMessage(data.body || "");
      setEmailTemplate("custom");
    } catch (error) {
      setEmailAiError(
        t("dashboard.emailAiFail", {
          error:
            error.message === "SESSION"
              ? t("sessionExpired")
              : error.message || t("unknownError"),
        }),
      );
    } finally {
      setComposingEmail(false);
    }
  }

  async function sendSelectedEmail() {
    if (emailTemplate === "custom") {
      if (!customEmailSubject.trim() || !customEmailMessage.trim()) {
        alert(t("dashboard.emailCustomEmpty"));
        return;
      }
    }

    const confirmed = confirm(
      t("dashboard.sendEmailConfirm", {
        template:
          emailTemplate === "custom" && customEmailSubject.trim()
            ? customEmailSubject.trim()
            : t(`emailTemplate.${emailTemplate}`),
        name: contact.prenom,
      }),
    );
    if (!confirmed) return;

    setSendingEmail(true);
    try {
      const payload = {
        contactId: String(contact.id),
        emailTemplate,
        ...(emailTemplate === "custom"
          ? {
              customSubject: customEmailSubject.trim(),
              customTitle: customEmailTitle.trim(),
              customSubtitle: customEmailSubtitle.trim(),
              customMessage: customEmailMessage.trim(),
            }
          : {}),
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

  const whatsappNumber = whatsappNumberFromContact(contact);
  const whatsappReady = isValidWhatsAppNumber(whatsappNumber);
  const whatsappPreview = generateWhatsAppText(whatsappTemplate, contact, {
    customMessage: customWhatsappMessage,
  });
  const whatsappLink = whatsappReady
    ? buildWhatsAppLink(whatsappNumber, whatsappPreview)
    : "";

  async function sendSelectedWhatsapp() {
    if (!whatsappReady) {
      alert(t("dashboard.noPhoneOnContact"));
      return;
    }
    if (whatsappTemplate === "custom" && !customWhatsappMessage.trim()) {
      alert(t("dashboard.whatsappEmpty"));
      return;
    }

    const templateLabel =
      whatsappTemplate === "custom"
        ? t("whatsappTemplate.custom")
        : t(`emailTemplate.${whatsappTemplate}`);
    const confirmed = confirm(
      t("dashboard.sendWhatsappConfirm", {
        template: templateLabel,
        name: contact.prenom,
      }),
    );
    if (!confirmed) return;

    setSendingWhatsapp(true);
    try {
      const response = await authedFetch("/api/whatsapp/send", {
        method: "POST",
        body: JSON.stringify({
          contactId: String(contact.id),
          whatsappTemplate,
          customMessage: customWhatsappMessage,
        }),
      });
      const data = await response.json();

      if (data.success) {
        alert(`✅ ${t("dashboard.whatsappOk")}`);
        fetchActions();
        onContactUpdated?.();
        return data;
      }

      if (data.code === "NOT_CONFIGURED" && data.waLink) {
        const openAnyway = confirm(
          t("dashboard.whatsappOpenFallback", {
            error: data.message || data.error,
          }),
        );
        if (openAnyway) {
          window.open(data.waLink, "_blank", "noopener,noreferrer");
        }
        return null;
      }

      alert(
        "❌ " + t("dashboard.whatsappFail", { error: data.message || data.error }),
      );
      return null;
    } catch (error) {
      console.error("❌ Erreur WhatsApp:", error);
      alert("❌ " + t("dashboard.networkError", { error: error.message }));
      return null;
    } finally {
      setSendingWhatsapp(false);
    }
  }

  return (
    <div
      className="fixed inset-0 bg-black/70 backdrop-blur-xl flex items-center justify-center p-4 z-50"
      onClick={onClose}
    >
      <div
        className="bg-slate-800 rounded-3xl shadow-2xl max-w-5xl w-full max-h-[90vh] overflow-y-auto border border-slate-700/50"
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
          <AdminContactInfo
            contact={contact}
            startEditing={startEditing}
            onSaved={(updated) => {
              onContactPatched?.(updated);
              fetchActions();
            }}
          />

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
                {CONTACT_EMAIL_TEMPLATE_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {t(`emailTemplate.${option.value}`)}
                  </option>
                ))}
              </select>
              <button
                type="button"
                onClick={sendSelectedEmail}
                disabled={
                  sendingEmail ||
                  composingEmail ||
                  (emailTemplate === "custom" &&
                    (!customEmailSubject.trim() || !customEmailMessage.trim()))
                }
                className="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white rounded-xl font-bold transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
              >
                {sendingEmail ? `⏳ ${t("sending")}` : `📤 ${t("dashboard.sendEmail")}`}
              </button>
            </div>
            {emailTemplate === "custom" ? (
              <div className="mt-4 space-y-4">
                <div className="rounded-2xl border border-violet-500/30 bg-violet-500/10 p-4">
                  <p className="text-xs font-bold uppercase tracking-wide text-violet-200">
                    ✨ {t("dashboard.emailAiSection")}
                  </p>
                  <p className="text-xs text-slate-400 mt-1">
                    {t("dashboard.emailAiHint")}
                  </p>
                  <textarea
                    value={emailAiNotes}
                    onChange={(e) => setEmailAiNotes(e.target.value)}
                    placeholder={t("dashboard.emailAiPlaceholder")}
                    rows={4}
                    className="mt-3 w-full px-4 py-3 bg-slate-800/80 border border-slate-600/50 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-violet-500/50 transition-all duration-300 resize-none"
                  />
                  <div className="mt-3 flex flex-col sm:flex-row sm:items-center gap-3">
                    <button
                      type="button"
                      onClick={composeEmailWithAi}
                      disabled={composingEmail}
                      className="px-5 py-2.5 bg-gradient-to-r from-violet-600 to-fuchsia-600 hover:from-violet-500 hover:to-fuchsia-500 text-white rounded-xl font-bold transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
                    >
                      {composingEmail
                        ? `⏳ ${t("dashboard.emailAiWorking")}`
                        : `✨ ${t("dashboard.emailAiButton")}`}
                    </button>
                    {emailAiError ? (
                      <p className="text-sm text-rose-300">{emailAiError}</p>
                    ) : null}
                  </div>
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-wide">
                    {t("dashboard.emailCustomSubject")}
                  </label>
                  <input
                    type="text"
                    value={customEmailSubject}
                    onChange={(e) => setCustomEmailSubject(e.target.value)}
                    placeholder={t("dashboard.emailCustomSubjectPlaceholder")}
                    className="mt-2 w-full px-4 py-3 bg-slate-700/50 border border-slate-600/50 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                  />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-bold text-slate-400 uppercase tracking-wide">
                      {t("dashboard.emailCustomTitle")}
                    </label>
                    <input
                      type="text"
                      value={customEmailTitle}
                      onChange={(e) => setCustomEmailTitle(e.target.value)}
                      placeholder={t("dashboard.emailCustomTitlePlaceholder")}
                      className="mt-2 w-full px-4 py-3 bg-slate-700/50 border border-slate-600/50 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-slate-400 uppercase tracking-wide">
                      {t("dashboard.emailCustomSubtitle")}
                    </label>
                    <input
                      type="text"
                      value={customEmailSubtitle}
                      onChange={(e) => setCustomEmailSubtitle(e.target.value)}
                      placeholder={t(
                        "dashboard.emailCustomSubtitlePlaceholder",
                      )}
                      className="mt-2 w-full px-4 py-3 bg-slate-700/50 border border-slate-600/50 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                    />
                  </div>
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-wide">
                    {t("dashboard.emailCustomBody")}
                  </label>
                  <textarea
                    value={customEmailMessage}
                    onChange={(e) => setCustomEmailMessage(e.target.value)}
                    placeholder={t("dashboard.emailCustomPlaceholder")}
                    rows={8}
                    className="mt-2 w-full px-4 py-3 bg-slate-700/50 border border-slate-600/50 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 resize-y"
                  />
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-wide mb-2">
                    {t("dashboard.emailPreview")}
                  </p>
                  <iframe
                    title={t("dashboard.emailPreview")}
                    sandbox=""
                    className="w-full h-96 rounded-xl border border-slate-700/50 bg-white"
                    srcDoc={generateCustomEmailHtml(contact, {
                      customSubject: customEmailSubject,
                      customTitle: customEmailTitle,
                      customSubtitle: customEmailSubtitle,
                      customMessage: customEmailMessage,
                    })}
                  />
                </div>
              </div>
            ) : null}
            <p className="text-xs text-slate-500 mt-3">
              {emailTemplate === "formules_presentation" &&
                t("dashboard.emailHintFormules")}
              {emailTemplate === "relance_1" &&
                t("dashboard.emailHintRelance1")}
              {emailTemplate === "relance_2" &&
                t("dashboard.emailHintRelance2")}
              {emailTemplate === "custom" && t("dashboard.emailHintCustom")}
            </p>
          </div>

          {/* Envoi WhatsApp */}
          <div className="mb-8 pb-8 border-b border-slate-700/50">
            <label className="text-sm font-bold text-slate-300 block mb-3 uppercase tracking-wide">
              📱 {t("dashboard.whatsappSection")}
            </label>
            <div className="flex flex-col md:flex-row gap-3">
              <select
                value={whatsappTemplate}
                onChange={(e) => setWhatsappTemplate(e.target.value)}
                className="flex-1 px-5 py-3 bg-slate-700/50 border border-slate-600/50 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/50 transition-all duration-300 font-semibold cursor-pointer"
              >
                {WHATSAPP_TEMPLATE_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.value === "custom"
                      ? t("whatsappTemplate.custom")
                      : t(`emailTemplate.${option.value}`)}
                  </option>
                ))}
              </select>
              <button
                type="button"
                onClick={sendSelectedWhatsapp}
                disabled={sendingWhatsapp || !whatsappReady}
                className="px-6 py-3 bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-500 hover:to-green-500 text-white rounded-xl font-bold transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
              >
                {sendingWhatsapp
                  ? `⏳ ${t("sending")}`
                  : `📤 ${t("dashboard.sendWhatsapp")}`}
              </button>
              <button
                type="button"
                disabled={!whatsappReady || !whatsappPreview}
                onClick={() => {
                  if (whatsappLink) {
                    window.open(whatsappLink, "_blank", "noopener,noreferrer");
                  }
                }}
                className="px-6 py-3 bg-slate-700/70 hover:bg-slate-600 text-white rounded-xl font-bold transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
              >
                💬 {t("dashboard.openWhatsapp")}
              </button>
            </div>
            {whatsappTemplate === "custom" ? (
              <textarea
                value={customWhatsappMessage}
                onChange={(e) => setCustomWhatsappMessage(e.target.value)}
                placeholder={t("dashboard.whatsappCustomPlaceholder")}
                rows={5}
                className="mt-3 w-full px-5 py-3 bg-slate-700/50 border border-slate-600/50 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 transition-all duration-300 resize-none"
              />
            ) : null}
            {whatsappPreview ? (
              <pre className="mt-3 whitespace-pre-wrap text-xs text-slate-300 bg-slate-900/50 border border-slate-700/50 rounded-xl p-4 max-h-40 overflow-y-auto">
                {whatsappPreview}
              </pre>
            ) : null}
            <p className="text-xs text-slate-500 mt-3">
              {!whatsappReady
                ? t("dashboard.noPhoneOnContact")
                : whatsappTemplate === "formules_presentation"
                  ? t("dashboard.whatsappHintFormules")
                  : whatsappTemplate === "relance_1"
                    ? t("dashboard.whatsappHintRelance1")
                    : whatsappTemplate === "relance_2"
                      ? t("dashboard.whatsappHintRelance2")
                      : t("dashboard.whatsappHintCustom")}
            </p>
          </div>

          {/* Formule + déblocage espace étudiant */}
          <div className="mb-8 pb-8 border-b border-slate-700/50">
            <label className="text-sm font-bold text-slate-300 block mb-3 uppercase tracking-wide">
              🎓 {t("dashboard.studentSpace")}
            </label>
            {accessGranted ? (
              <p className="text-sm text-emerald-300 mb-4">
                {t("dashboard.unlockedWithFormule", {
                  formule: displayFormuleLabel(getChosenFormule(contact)),
                })}
              </p>
            ) : (
              <p className="text-sm text-slate-400 mb-4">
                {t("dashboard.locked")}
              </p>
            )}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-4">
              {FORMULES.map((formule) => {
                const active =
                  accessGranted && chosenFormuleNumber === formule.number;
                const selected = selectedFormuleNumber === formule.number;
                return (
                  <button
                    key={formule.number}
                    type="button"
                    onClick={() => setSelectedFormule(formule.value)}
                    className={`text-left px-4 py-4 rounded-xl border transition-all duration-200 ${
                      active
                        ? "bg-emerald-500/20 border-emerald-400 text-white"
                        : selected
                          ? "bg-cyan-500/20 border-cyan-400 text-white"
                          : "bg-slate-700/40 border-slate-600/50 text-slate-300 hover:bg-slate-700"
                    }`}
                  >
                    <p className="text-[11px] font-bold uppercase tracking-wide text-slate-400">
                      Formule {formule.number}
                    </p>
                    <p className="font-bold mt-1">{formule.shortTitle}</p>
                    <p className="text-sm mt-1">{formule.price}</p>
                    {active ? (
                      <p className="text-xs text-emerald-300 mt-2">
                        {t("dashboard.formuleActive")}
                      </p>
                    ) : null}
                  </button>
                );
              })}
            </div>
            <div className="flex flex-wrap gap-3">
              <button
                type="button"
                disabled={savingFormule || !selectedFormule || sameActiveFormule}
                onClick={saveChosenFormule}
                className="px-6 py-3 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white rounded-xl font-bold transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {savingFormule
                  ? `⏳ ${t("saving")}`
                  : accessGranted
                    ? t("dashboard.applyFormule")
                    : t("dashboard.unlockSpace")}
              </button>
              {isStudentSpaceUnlocked(contact.suivi_statut) ? (
                <button
                  type="button"
                  onClick={() =>
                    onUpdateStatut(contact.id, "choix_des_formules")
                  }
                  className="px-6 py-3 bg-slate-700/70 hover:bg-slate-600 text-white rounded-xl font-bold transition-all duration-300"
                >
                  {t("dashboard.lockSpace")}
                </button>
              ) : null}
            </div>
            <p className="text-xs text-slate-500 mt-3">
              {t("dashboard.formuleHint")}
            </p>
          </div>

          <AdminMatchingPanel contact={contact} onHistory={fetchActions} />

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
                          {action.created_at
                            ? new Date(action.created_at).toLocaleString(
                                lang === "zh"
                                  ? "zh-CN"
                                  : lang === "en"
                                    ? "en-GB"
                                    : "fr-FR",
                              )
                            : ""}
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
