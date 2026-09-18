"use client";

import { useEffect, useState, type ComponentProps, type FormEvent, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { adminSupabase } from "../lib/supabase";
import { useAdminAuth } from "../context/AdminAuthContext";
import AdminShell from "../components/AdminShell";
import AdminStudentFiles from "../components/AdminStudentFiles";
import AdminMatchingPanel from "../components/AdminMatchingPanel";
import AdminChineseMatchingPanel from "../components/AdminChineseMatchingPanel";
import AdminContactInfo from "../components/AdminContactInfo";
import AdminContactEmail from "../components/AdminContactEmail";
import AdminContactEmailThread from "../components/AdminContactEmailThread";
import AdminBulkEmail from "../components/AdminBulkEmail";
import { isMatchingPayloadAction } from "../lib/matching/persist";
import { useAdminI18n } from "../context/AdminI18nContext";
import type { AdminI18nValue } from "../context/AdminI18nContext";
import { useAdminAccess } from "../context/AdminAccessContext";
import {
  isStudentSpaceUnlocked,
  isStudentAccessGranted,
  getChosenFormule,
  getDisplayedStepIndex,
  STUDENT_PROCESS_STEPS,
  mergeFormuleNote,
  stripFormuleNote,
  mergeAvancementNote,
  type ContactRow,
} from "../lib/studentProgress";
import {
  FORMULES,
  canonicalFormuleValue,
  displayFormuleLabel,
  displayFormulePrice,
  getFormuleNumber,
} from "../lib/formules";
import {
  SUIVI_STATUTS,
  STATUT_COLORS,
  STATUT_ICONS,
  canonicalStatut,
  toStoredStatut,
} from "../lib/suiviStatuts";
import {
  contactAssignPatch,
  contactUnassignPatch,
  isAssignedTo,
  shortAdminLabel,
} from "../lib/contactOwner";
import { formatEuros, revenueForViewer } from "../lib/contactRevenue";

const STATUTS = SUIVI_STATUTS;

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

type DashboardContact = Omit<
  ContactRow,
  "id" | "prenom" | "nom" | "email" | "phone"
> & {
  id: string;
  prenom?: string | null;
  nom?: string | null;
  email?: string | null;
  phone?: string | null;
};

type SuiviAction = {
  id: string;
  action?: string | null;
  created_at?: string | null;
  description?: string | null;
  user_admin?: string | null;
};

type StatutColorKey = keyof typeof STATUT_COLORS;

function translatedOrRaw(
  t: AdminI18nValue["t"],
  prefix: string,
  value: unknown,
) {
  if (!value) return "";
  const path = `${prefix}.${value}`;
  const translated = t(path);
  return translated === path ? String(value) : translated;
}

const ACTIONS_TYPES = [
  { value: "appel", label: "Appel effectué", icon: "📞" },
  { value: "email_envoye", label: "Email envoyé", icon: "📧" },
  { value: "email_formules", label: "Email formules envoyé", icon: "📋" },
  { value: "reponse_client", label: "Réponse client (email)", icon: "📥" },
  { value: "formule_choisie", label: "Formule choisie", icon: "🎯" },
  { value: "relance_1", label: "Relance 1", icon: "🔔" },
  { value: "relance_2", label: "Relance 2", icon: "🔔" },
  { value: "relance_formules", label: "Relance 3", icon: "🔔" },
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
  { value: "attribution", label: "Attribution dossier", icon: "👤" },
  { value: "contact_modifier", label: "Contact modifié", icon: "✏️" },
  { value: "dossier_complet", label: "Dossier complet", icon: "📂" },
];

export default function AdminDashboard() {
  const { t } = useAdminI18n();
  const access = useAdminAccess();
  const [contacts, setContacts] = useState<DashboardContact[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filterStatut, setFilterStatut] = useState("tous");
  const [filterBudget, setFilterBudget] = useState("tous");
  const [filterPays, setFilterPays] = useState("tous");
  const [filterNiveau, setFilterNiveau] = useState("tous");
  const [filterDomaine, setFilterDomaine] = useState("tous");
  const [filterOwner, setFilterOwner] = useState("tous");
  const [unreadByContact, setUnreadByContact] = useState<Record<string, number>>(
    {},
  );
  const [selectedContact, setSelectedContact] = useState<DashboardContact | null>(null);
  const [emailThreadKey, setEmailThreadKey] = useState(0);
  const [editOnOpen, setEditOnOpen] = useState(false);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [pays, setPays] = useState<string[]>([]);
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
      const rows = (data ?? []) as DashboardContact[];
      setContacts(rows);
      setSelectedContact((prev) =>
        prev ? rows.find((c) => c.id === prev.id) || prev : prev,
      );
      const paysUniques = [
        ...new Set(
          rows
            .map((c) => c.pays)
            .filter((value): value is string => Boolean(value)),
        ),
      ];
      setPays(paysUniques.sort());

      const ids = rows.map((c) => c.id).filter(Boolean);
      if (ids.length) {
        const { data: unreadRows } = await adminSupabase
          .from("contact_emails")
          .select("contact_id")
          .in("contact_id", ids)
          .eq("direction", "in")
          .is("read_at", null);
        const counts: Record<string, number> = {};
        for (const row of unreadRows || []) {
          const id = String(
            (row as { contact_id?: string }).contact_id || "",
          );
          if (!id) continue;
          counts[id] = (counts[id] || 0) + 1;
        }
        setUnreadByContact(counts);
      } else {
        setUnreadByContact({});
      }
    }
    setLoading(false);
  };

  const toggleSelected = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id],
    );
  };

  const updateStatut = async (id: string, newStatut: string) => {
    try {
      const payload = {
        suivi_statut: toStoredStatut(newStatut),
        updated_at: new Date().toISOString(),
      };

      let { error } = await adminSupabase
        .from("contacts")
        .update(payload)
        .eq("id", id);

      if (error) {
        const bare = await adminSupabase
          .from("contacts")
          .update({ suivi_statut: toStoredStatut(newStatut) })
          .eq("id", id);
        error = bare.error;
      }

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

      setContacts((prev) =>
        prev.map((c) =>
          c.id === id ? { ...c, suivi_statut: newStatut } : c,
        ),
      );
      setSelectedContact((prev) =>
        prev && prev.id === id
          ? { ...prev, suivi_statut: newStatut }
          : prev,
      );
    } catch (err) {
      console.error("Erreur:", err);
      alert(t("genericError"));
    }
  };

  const updateFormule = async (id: string, formuleLabel: string) => {
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

    const payloadBase: {
      formule: string | null;
      notes_admin: string | null;
      suivi_statut?: string;
    } = {
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

  const updateDossierEtape = async (id: string, etapeIndex: number) => {
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

  const deleteContact = async (id: string) => {
    if (!access.deleteContacts) return;
    if (!confirm(t("dashboard.deleteConfirm"))) return;
    const { error } = await adminSupabase.from("contacts").delete().eq("id", id);
    if (!error) {
      setContacts((prev) => prev.filter((c) => c.id !== id));
      setSelectedContact(null);
    }
  };

  const toggleAssign = async (id: string, assign: boolean) => {
    const patch = assign
      ? contactAssignPatch(user?.email)
      : contactUnassignPatch();
    if (assign && Object.keys(patch).length === 0) return;

    let { error } = await adminSupabase
      .from("contacts")
      .update({ ...patch, updated_at: new Date().toISOString() })
      .eq("id", id);

    if (error) {
      const retry = await adminSupabase
        .from("contacts")
        .update(patch)
        .eq("id", id);
      error = retry.error;
    }

    if (error) {
      console.error("Erreur assignation:", error);
      alert(t("error") + " : " + error.message);
      return;
    }

    const who =
      ("assigned_to" in patch && patch.assigned_to) ||
      user?.email ||
      "";
    const description = assign
      ? t("dashboard.assignHistoryOn", {
          name: shortAdminLabel(String(who)),
        })
      : t("dashboard.assignHistoryOff", {
          name: shortAdminLabel(user?.email),
        });

    const actionPayload = {
      contact_id: id,
      action: "attribution",
      description,
      user_admin: user?.email,
      created_at: new Date().toISOString(),
    };
    const { error: actionError } = await adminSupabase
      .from("suivi_actions")
      .insert(actionPayload);
    if (actionError) {
      await adminSupabase.from("suivi_actions").insert({
        ...actionPayload,
        action: "contact_modifier",
      });
    }

    setContacts((prev) =>
      prev.map((c) => (c.id === id ? { ...c, ...patch } : c)),
    );
    setSelectedContact((prev) =>
      prev && prev.id === id ? { ...prev, ...patch } : prev,
    );
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
      filterStatut === "tous" ||
      canonicalStatut(c.suivi_statut) === filterStatut;
    const matchBudget = filterBudget === "tous" || c.budget === filterBudget;
    const matchPays = filterPays === "tous" || c.pays === filterPays;
    const matchNiveau =
      filterNiveau === "tous" || c.dernier_diplome === filterNiveau;
    const matchDomaine =
      filterDomaine === "tous" || c.domaine_etudes === filterDomaine;
    const matchOwner =
      filterOwner === "tous" ||
      (filterOwner === "moi" && isAssignedTo(c, user?.email)) ||
      (filterOwner === "restreint" &&
        access.role === "full" &&
        Boolean((c.assigned_to || "").trim()) &&
        !isAssignedTo(c, user?.email));

    return (
      matchSearch &&
      matchStatut &&
      matchBudget &&
      matchPays &&
      matchNiveau &&
      matchDomaine &&
      matchOwner
    );
  });

  const stats = {
    total: contacts.length,
    attente_paiement: contacts.filter(
      (c) => canonicalStatut(c.suivi_statut) === "attente_paiement",
    ).length,
    paye: contacts.filter(
      (c) => canonicalStatut(c.suivi_statut) === "client_payé",
    ).length,
    dossier_preparation: contacts.filter(
      (c) => canonicalStatut(c.suivi_statut) === "dossier_préparation",
    ).length,
    myAssigned: contacts.filter((c) => isAssignedTo(c, user?.email)).length,
  };
  const revenue = revenueForViewer(contacts, access.role, user?.email);

  return (
    <AdminShell user={user} onLogout={handleLogout}>
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-5 mb-5">
          <StatCard
            label={t("dashboard.totalContacts")}
            value={stats.total}
            icon="👥"
            color="from-blue-600 to-cyan-500"
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
          <StatCard
            label={t("dashboard.filesInPrep")}
            value={stats.dossier_preparation}
            icon="📁"
            color="from-pink-600 to-rose-500"
          />
          <StatCard
            label={t("dashboard.myTouchesStat")}
            value={stats.myAssigned}
            icon="🖐️"
            color="from-teal-600 to-emerald-500"
          />
        </div>
        <RevenueCard
          title={t("dashboard.revenueTitle")}
          hint={
            access.role === "full"
              ? t("dashboard.revenueShareFull")
              : t("dashboard.revenueShareLimited")
          }
          hypoLabel={t("dashboard.revenueHypo")}
          realLabel={t("dashboard.revenueReal")}
          hypoHint={t("dashboard.revenueHypoHint", {
            count: revenue.hypotheticCount,
          })}
          realHint={t("dashboard.revenueRealHint", {
            count: revenue.realCount,
          })}
          hypothetic={formatEuros(revenue.hypothetic)}
          real={formatEuros(revenue.real)}
        />

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
              <select
                value={filterOwner}
                onChange={(e) => setFilterOwner(e.target.value)}
                className="px-5 py-3 bg-slate-700/50 border border-slate-600/50 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all duration-300 font-medium cursor-pointer"
              >
                <option value="tous">👤 {t("dashboard.allOwners")}</option>
                <option value="moi">{t("dashboard.filterOwnerMine")}</option>
                {access.role === "full" ? (
                  <option value="restreint">
                    {t("dashboard.filterOwnerLimited")}
                  </option>
                ) : null}
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

        {access.bulkSend ? (
          <AdminBulkEmail
            contacts={contacts as ComponentProps<typeof AdminBulkEmail>["contacts"]}
            filteredContacts={
              filteredContacts as ComponentProps<typeof AdminBulkEmail>["filteredContacts"]
            }
            selectedIds={selectedIds}
            onSelectedIdsChange={setSelectedIds}
            onContactStatus={(id: string, status: string) =>
              setContacts((prev) =>
                prev.map((c) =>
                  c.id === id ? { ...c, suivi_statut: status } : c,
                ),
              )
            }
            onFinished={fetchContacts}
          />
        ) : null}

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
                    {access.bulkSend ? (
                      <th className="px-3 py-4 w-12 whitespace-nowrap">
                        <input
                          type="checkbox"
                          checked={
                            filteredContacts.length > 0 &&
                            filteredContacts.every((c) =>
                              selectedIds.includes(c.id),
                            )
                          }
                          onChange={() => {
                            const filteredIds = filteredContacts.map(
                              (c) => c.id,
                            );
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
                    ) : null}
                    <th className="px-4 py-4 text-left text-xs font-bold text-slate-300 uppercase tracking-widest whitespace-nowrap">
                      👤 {t("dashboard.colName")}
                    </th>
                    <th className="px-4 py-4 text-left text-xs font-bold text-slate-300 uppercase tracking-widest whitespace-nowrap">
                      🌍 {t("dashboard.colCountry")}
                    </th>
                    <th className="px-4 py-4 text-left text-xs font-bold text-slate-300 uppercase tracking-widest whitespace-nowrap">
                      🎓 {t("dashboard.colLevel")}
                    </th>
                    <th className="px-4 py-4 text-left text-xs font-bold text-slate-300 uppercase tracking-widest whitespace-nowrap">
                      📚 {t("dashboard.colDomain")}
                    </th>
                    <th className="px-4 py-4 text-left text-xs font-bold text-slate-300 uppercase tracking-widest whitespace-nowrap">
                      💰 {t("dashboard.colBudget")}
                    </th>
                    <th className="px-4 py-4 text-left text-xs font-bold text-slate-300 uppercase tracking-widest whitespace-nowrap">
                      ⭐ {t("dashboard.colStatus")}
                    </th>
                    <th className="px-4 py-4 text-left text-xs font-bold text-slate-300 uppercase tracking-widest whitespace-nowrap">
                      👤 {t("dashboard.colOwner")}
                    </th>
                    <th className="px-4 py-4 text-left text-xs font-bold text-slate-300 uppercase tracking-widest whitespace-nowrap">
                      ⚙️ {t("dashboard.colActions")}
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-700/50">
                  {filteredContacts.map((c) => (
                    <tr
                      key={c.id}
                      onClick={() => {
                        setEditOnOpen(false);
                        setSelectedContact(c);
                      }}
                      className={`cursor-pointer hover:bg-slate-700/30 transition-all duration-200 group ${
                        selectedIds.includes(c.id) ? "bg-amber-500/10" : ""
                      }`}
                    >
                      {access.bulkSend ? (
                        <td className="px-3 py-4">
                          <input
                            type="checkbox"
                            checked={selectedIds.includes(c.id)}
                            onChange={() => toggleSelected(c.id)}
                            onClick={(e) => e.stopPropagation()}
                            className="h-4 w-4 rounded border-slate-500 bg-slate-700 text-amber-500 focus:ring-amber-500/50 cursor-pointer"
                          />
                        </td>
                      ) : null}
                      <td className="px-4 py-4">
                        <span className="inline-flex items-center gap-2 font-semibold text-white group-hover:text-blue-400 transition-colors">
                          <span>
                            {c.prenom} {c.nom}
                          </span>
                          {(unreadByContact[c.id] || 0) > 0 ? (
                            <span
                              className="inline-flex items-center justify-center min-w-[1.25rem] h-5 px-1.5 rounded-full bg-red-500 text-white text-[11px] font-bold leading-none"
                              title={t("dashboard.emailUnreadBadge", {
                                count: unreadByContact[c.id],
                              })}
                            >
                              {(unreadByContact[c.id] || 0) > 9
                                ? "9+"
                                : unreadByContact[c.id]}
                            </span>
                          ) : null}
                        </span>
                        {getChosenFormule(c) ? (
                          <p className="text-xs text-cyan-300 mt-1 font-semibold">
                            📋 {translatedOrRaw(t, "formule", getChosenFormule(c))}
                          </p>
                        ) : null}
                        <p className="text-xs text-slate-500 mt-1">{c.email}</p>
                      </td>
                      <td className="px-4 py-4 text-slate-300 text-sm">
                        {c.pays || "—"}
                      </td>
                      <td className="px-4 py-4 text-slate-300 text-sm">
                        {c.dernier_diplome
                          ? translatedOrRaw(t, "niveau", c.dernier_diplome)
                          : "—"}
                      </td>
                      <td className="px-4 py-4 text-slate-300 text-sm">
                        {c.domaine_etudes
                          ? translatedOrRaw(t, "domaine", c.domaine_etudes)
                          : "—"}
                      </td>
                      <td className="px-4 py-4">
                        <span className="text-sm font-bold px-3 py-1 rounded-lg bg-slate-700/30 text-slate-300">
                          {c.budget
                            ? translatedOrRaw(t, "budget", c.budget)
                            : "—"}
                        </span>
                      </td>
                      <td className="px-4 py-4">
                        <select
                          value={canonicalStatut(c.suivi_statut) || ""}
                          onChange={(e) => updateStatut(c.id, e.target.value)}
                          onClick={(e) => e.stopPropagation()}
                          className={`text-xs px-3 py-2 rounded-lg font-bold border ${
                            STATUT_COLORS[canonicalStatut(c.suivi_statut) as StatutColorKey] ||
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
                      <td className="px-4 py-4">
                        <p className="text-sm font-semibold text-slate-200">
                          {shortAdminLabel(c.assigned_to)}
                        </p>
                      </td>
                      <td className="px-4 py-4">
                        <div
                          className="flex gap-2"
                          onClick={(e) => e.stopPropagation()}
                        >
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
                          {access.deleteContacts ? (
                          <button
                            onClick={() => deleteContact(c.id)}
                            className="text-red-400 hover:text-red-300 hover:bg-red-500/20 px-3 py-1 rounded-lg text-sm font-semibold transition-all duration-200"
                          >
                            🗑️ {t("dashboard.deleteShort")}
                          </button>
                          ) : null}
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
          onToggleAssign={toggleAssign}
          userEmail={user?.email}
          onContactUpdated={fetchContacts}
          emailThreadKey={emailThreadKey}
          onEmailThreadRefresh={() => setEmailThreadKey((k) => k + 1)}
          onEmailsMarkedRead={() => {
            setUnreadByContact((prev) => {
              if (!prev[selectedContact.id]) return prev;
              const next = { ...prev };
              delete next[selectedContact.id];
              return next;
            });
          }}
          onContactPatched={(updated: DashboardContact) => {
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

function RevenueCard({
  title,
  hint,
  hypoLabel,
  realLabel,
  hypoHint,
  realHint,
  hypothetic,
  real,
}: {
  title: string;
  hint: string;
  hypoLabel: string;
  realLabel: string;
  hypoHint: string;
  realHint: string;
  hypothetic: string;
  real: string;
}) {
  return (
    <div className="mb-8 w-full rounded-2xl border border-white/10 bg-slate-900/70 px-6 py-5 text-white shadow-2xl">
      <div className="mb-4 flex flex-col gap-1 sm:flex-row sm:items-baseline sm:justify-between">
        <p className="text-sm font-bold uppercase tracking-wide text-slate-200">
          {title}
        </p>
        <p className="text-xs text-slate-400">{hint}</p>
      </div>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="rounded-xl bg-amber-500/15 px-5 py-4">
          <p className="text-xs font-semibold uppercase tracking-wide text-amber-200">
            {hypoLabel}
          </p>
          <p className="mt-1 text-3xl font-bold text-white">{hypothetic}</p>
          <p className="mt-1 text-sm text-amber-100/70">{hypoHint}</p>
        </div>
        <div className="rounded-xl bg-emerald-500/15 px-5 py-4">
          <p className="text-xs font-semibold uppercase tracking-wide text-emerald-200">
            {realLabel}
          </p>
          <p className="mt-1 text-3xl font-bold text-white">{real}</p>
          <p className="mt-1 text-sm text-emerald-100/70">{realHint}</p>
        </div>
      </div>
    </div>
  );
}

function StatCard({
  label,
  value,
  icon,
  color,
}: {
  label: string;
  value: ReactNode;
  icon: ReactNode;
  color: string;
}) {
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
  onToggleAssign,
  userEmail,
  onContactUpdated,
  onContactPatched,
  startEditing,
  emailThreadKey = 0,
  onEmailThreadRefresh,
  onEmailsMarkedRead,
}: {
  contact: DashboardContact;
  onClose: () => void;
  onUpdateStatut: (id: string, status: string) => Promise<void>;
  onUpdateFormule: (id: string, formuleLabel: string) => Promise<void>;
  onUpdateDossierEtape: (id: string, etapeIndex: number) => Promise<void>;
  onToggleAssign: (id: string, assign: boolean) => Promise<void>;
  userEmail?: string | null;
  onContactUpdated: () => void;
  onContactPatched: (updated: DashboardContact) => void;
  startEditing?: boolean;
  emailThreadKey?: number;
  onEmailThreadRefresh?: () => void;
  onEmailsMarkedRead?: () => void;
}) {
  const { t, lang } = useAdminI18n();
  const access = useAdminAccess();
  const [actions, setActions] = useState<SuiviAction[]>([]);
  const [newAction, setNewAction] = useState("");
  const [newDescription, setNewDescription] = useState("");
  const [notes, setNotes] = useState(contact.notes_admin || "");
  const [loadingActions, setLoadingActions] = useState(true);
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
        ((data || []) as SuiviAction[]).filter(
          (action) =>
            action.action !== "matching_payload" &&
            !isMatchingPayloadAction(action),
        ),
      );
    }
    setLoadingActions(false);
  };

  const addAction = async (e: FormEvent<HTMLFormElement>) => {
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
    const { error } = await adminSupabase
      .from("contacts")
      .update({ notes_admin: notes })
      .eq("id", contact.id);
    if (!error) {
      onContactPatched({ ...contact, notes_admin: notes });
    }
  };

  const statutKey = canonicalStatut(contact.suivi_statut);
  const assignedToMe = isAssignedTo(contact, userEmail);
  const assignedOtherLabel =
    contact.assigned_to && !assignedToMe
      ? shortAdminLabel(contact.assigned_to)
      : null;

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
            <div className="mt-3">
              <label className="inline-flex items-center gap-2 bg-white/15 text-white px-3 py-1.5 rounded-lg cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={assignedToMe}
                  onChange={async (e) => {
                    await onToggleAssign(contact.id, e.target.checked);
                    fetchActions();
                  }}
                  className="h-4 w-4 rounded border-white/40 bg-white/20 text-amber-400 focus:ring-amber-400/50 cursor-pointer"
                />
                <span>
                  {assignedOtherLabel
                    ? t("dashboard.assignedToOther", {
                        name: assignedOtherLabel,
                      })
                    : t("dashboard.assignToMe")}
                </span>
              </label>
            </div>
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
          <div className="mb-8 pb-8 border-b border-slate-700/50">
            <label className="text-sm font-bold text-slate-300 block mb-3 uppercase tracking-wide">
              ⭐ {t("dashboard.currentStatus")}
            </label>
            <select
              value={statutKey || ""}
              onChange={(e) => onUpdateStatut(contact.id, e.target.value)}
              className={`w-full px-5 py-3 bg-slate-700/50 border rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all duration-300 font-semibold ${
                STATUT_COLORS[statutKey as StatutColorKey] || "border-slate-600/50"
              }`}
            >
              <option value="">{t("dashboard.selectStatus")}</option>
              {STATUTS.map((s) => (
                <option key={s} value={s}>
                  {STATUT_ICONS[s]} {t(`statut.${s}`)}
                </option>
              ))}
            </select>
          </div>

          <AdminContactInfo
            contact={contact}
            startEditing={startEditing}
            onSaved={(updated: DashboardContact) => {
              onContactPatched?.(updated);
              fetchActions();
            }}
          />

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

          <AdminContactEmailThread
            contactId={contact.id}
            refreshKey={emailThreadKey}
            onMarkedRead={onEmailsMarkedRead}
          />

          <AdminContactEmail
            contact={contact}
            allowTemplates={access.role === "full"}
            onSent={() => {
              fetchActions();
              onContactUpdated?.();
              onEmailThreadRefresh?.();
            }}
          />

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
                    <p className="text-sm mt-1">{displayFormulePrice(formule)}</p>
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
                    onUpdateStatut(contact.id, "formules_présentées")
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

          {access.matching ? (
            <>
              <AdminMatchingPanel contact={contact} onHistory={fetchActions} />
              <AdminChineseMatchingPanel
                contact={contact}
                onHistory={fetchActions}
              />
            </>
          ) : null}

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
                {(access.matching
                  ? ACTIONS_TYPES
                  : ACTIONS_TYPES.filter((a) => a.value !== "matching")
                ).map((a) => (
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
                          {actionType?.icon || "•"}{" "}
                          {translatedOrRaw(t, "action", action.action) ||
                            action.action}
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
