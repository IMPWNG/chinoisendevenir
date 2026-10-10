"use client";

import { useEffect, useState, type ComponentProps, type FormEvent, type ReactNode } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { adminSupabase } from "../lib/supabase";
import { useAdminAuth } from "../context/AdminAuthContext";
import AdminShell from "../components/AdminShell";
import AdminStudentFiles from "../components/AdminStudentFiles";
import AdminMatchingPanel from "../components/AdminMatchingPanel";
import AdminChineseMatchingPanel from "../components/AdminChineseMatchingPanel";
import AdminContactInfo from "../components/AdminContactInfo";
import AdminContactEmail from "../components/AdminContactEmail";
import AdminContactWhatsApp from "../components/AdminContactWhatsApp";
import AdminSendContract from "../components/AdminSendContract";
import AdminContactEmailThread from "../components/AdminContactEmailThread";
import AdminUnansweredEmails from "../components/AdminUnansweredEmails";
import AdminWhatsappInbox from "../components/AdminWhatsappInbox";
import AdminDayTasks from "../components/AdminDayTasks";
import AdminBulkEmail from "../components/AdminBulkEmail";
import AdminBulkWhatsapp from "../components/AdminBulkWhatsapp";
import AdminPaymentSchedule from "../components/AdminPaymentSchedule";
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
  espaceDebloquePatch,
  isMissingEspaceDebloqueColumn,
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
import {
  isMissingPriorityColumn,
  isPrioritaire,
  priorityPatch,
  sortPriorityFirst,
} from "../lib/contactPriority";
import { cleanDayTask, cleanAuthorEmail, isMissingDayTasksTable } from "../lib/dayTasks";
import { shanghaiDayString } from "../lib/dailyReportShared";
import { isInboxPending, sortInboxFirst } from "../lib/inboxPriority";
import { formatEuros, revenueForViewer } from "../lib/contactRevenue";
import { formatEurosOnly } from "../lib/money";
import { paymentPlan } from "../lib/paymentPlan";
import {
  formatHistoryDescription,
  historyActorKind,
} from "../lib/suiviHistory";

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
  { value: "whatsapp_envoye", label: "WhatsApp envoyé", icon: "💬" },
  { value: "whatsapp_contact", label: "Ajouté au carnet WhatsApp", icon: "👤" },
  { value: "whatsapp_liste", label: "Ajouté à Étude Chine", icon: "🏷️" },
  { value: "whatsapp_formules", label: "WhatsApp formules envoyé", icon: "💬" },
  { value: "reponse_client", label: "Réponse client (email)", icon: "📥" },
  { value: "reponse_whatsapp", label: "Réponse client (WhatsApp)", icon: "💬" },
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
  const [whatsappPending, setWhatsappPending] = useState<Set<string>>(
    () => new Set(),
  );
  const [priorityOnly, setPriorityOnly] = useState(false);
  const [inboxTick, setInboxTick] = useState(0);
  const [selectedContact, setSelectedContact] = useState<DashboardContact | null>(null);
  const [emailThreadKey, setEmailThreadKey] = useState(0);
  const [dayTaskKey, setDayTaskKey] = useState(0);
  const [editOnOpen, setEditOnOpen] = useState(false);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [pays, setPays] = useState<string[]>([]);
  const { signOut, user } = useAdminAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const openContactId = String(searchParams.get("contact") || "").trim();

  useEffect(() => {
    // eslint-disable-next-line react-hooks/immutability
    fetchContacts();
  }, []);

  useEffect(() => {
    if (!openContactId || loading || !contacts.length) return;
    const found = contacts.find((c) => c.id === openContactId);
    if (!found) return;
    setSelectedContact(found);
    router.replace("/admin/dashboard", { scroll: false });
  }, [openContactId, contacts, loading, router]);

  useEffect(() => {
    if (!access.whatsapp) return;
    let cancelled = false;
    (async () => {
      try {
        const {
          data: { session },
        } = await adminSupabase.auth.getSession();
        if (!session?.access_token || cancelled) return;
        const response = await fetch("/api/admin/inbox-priority", {
          headers: { Authorization: `Bearer ${session.access_token}` },
          cache: "no-store",
        });
        const data = await response.json().catch(() => ({}));
        if (cancelled || !response.ok) return;
        const ids = Array.isArray(data.contactIds)
          ? data.contactIds.map((id: unknown) => String(id))
          : [];
        setWhatsappPending(new Set(ids));
      } catch {
        if (!cancelled) setWhatsappPending(new Set());
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [access.whatsapp, inboxTick]);

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
    setInboxTick((n) => n + 1);
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
      access.unlockStudentSpace &&
      Boolean(nextFormule) &&
      !isStudentSpaceUnlocked(current);
    const notes = nextFormule
      ? mergeFormuleNote(current.notes_admin, nextFormule)
      : stripFormuleNote(current.notes_admin) || null;

    const payloadBase: {
      formule: string | null;
      notes_admin: string | null;
      espace_debloque?: boolean;
    } = {
      formule: nextFormule,
      notes_admin: notes,
    };
    if (shouldUnlock) Object.assign(payloadBase, espaceDebloquePatch(true));

    const payloads = [
      { ...payloadBase, updated_at: new Date().toISOString() },
      payloadBase,
      {
        notes_admin: notes,
        ...(shouldUnlock ? espaceDebloquePatch(true) : {}),
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
        if (isMissingEspaceDebloqueColumn(error.message)) {
          alert(t("dashboard.espaceDebloqueMissingColumn"));
          return;
        }
      }

      if (!saved) {
        alert(t("dashboard.formuleSaveFail"));
        return;
      }

      await adminSupabase.from("suivi_actions").insert({
        contact_id: id,
        action: nextFormule ? "formule_choisie" : "contact_modifier",
        description: shouldUnlock
          ? t("dashboard.formuleUnlockedNote", { formule: nextFormule || "" })
          : nextFormule
            ? t("dashboard.formuleSavedNote", { formule: nextFormule })
            : t("dashboard.formuleRemovedNote"),
        user_admin: user?.email,
      });

      const next = {
        ...current,
        formule: nextFormule,
        notes_admin: notes,
        ...(shouldUnlock ? espaceDebloquePatch(true) : {}),
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

  const lockStudentSpace = async (id: string) => {
    const current =
      (selectedContact?.id === id ? selectedContact : null) ||
      contacts.find((c) => c.id === id);
    if (!current) return;
    const patch = espaceDebloquePatch(false);
    let { error } = await adminSupabase
      .from("contacts")
      .update({ ...patch, updated_at: new Date().toISOString() })
      .eq("id", id);
    if (error) {
      const retry = await adminSupabase.from("contacts").update(patch).eq("id", id);
      error = retry.error;
    }
    if (error) {
      alert(
        isMissingEspaceDebloqueColumn(error.message)
          ? t("dashboard.espaceDebloqueMissingColumn")
          : t("error") + " : " + error.message,
      );
      return;
    }
    setContacts((prev) =>
      prev.map((c) => (c.id === id ? { ...c, ...patch } : c)),
    );
    setSelectedContact((prev) =>
      prev && prev.id === id ? { ...prev, ...patch } : prev,
    );
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

  const togglePriority = async (id: string, on: boolean) => {
    const patch = priorityPatch(on);
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
      console.error("Erreur suivi prioritaire:", error);
      alert(
        isMissingPriorityColumn(error.message)
          ? t("dashboard.priorityMissingColumn")
          : t("error") + " : " + error.message,
      );
      setContacts((prev) => [...prev]);
      return;
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

  const pending = (row: { id: string }) =>
    isInboxPending(row.id, unreadByContact, whatsappPending);
  const filteredContacts = sortInboxFirst(
    sortPriorityFirst(contacts.filter((c) => {
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
  })),
    pending,
  );
  const listedContacts = priorityOnly
    ? filteredContacts.filter(pending)
    : filteredContacts;

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
        <div className="bg-slate-800/40 backdrop-blur-md rounded-2xl shadow-2xl p-6 mb-6 border border-slate-700/50">
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

        <AdminUnansweredEmails
          refreshKey={emailThreadKey}
          onOpenContact={(contactId) => {
            const found = contacts.find((c) => c.id === contactId);
            if (found) setSelectedContact(found);
          }}
        />

        {access.whatsapp ? (
          <AdminWhatsappInbox
            refreshKey={inboxTick}
            onSynced={() => setDayTaskKey((n) => n + 1)}
            onOpenContact={(contactId) => {
              const found = contacts.find((c) => c.id === contactId);
              if (found) setSelectedContact(found);
            }}
          />
        ) : null}

        <AdminDayTasks
          contacts={contacts}
          refreshKey={dayTaskKey}
          canDelete={access.role === "full"}
          showWhatsapp={access.whatsapp}
          actorEmail={user?.email}
          onOpenContact={(contactId) => {
            const found = contacts.find((c) => c.id === contactId);
            if (found) setSelectedContact(found);
          }}
        />

        {access.bulkSend ? (
          <>
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
          <AdminBulkWhatsapp
            contacts={contacts as ComponentProps<typeof AdminBulkWhatsapp>["contacts"]}
            filteredContacts={
              filteredContacts as ComponentProps<typeof AdminBulkWhatsapp>["filteredContacts"]
            }
            selectedIds={selectedIds}
            onSelectedIdsChange={setSelectedIds}
            onFinished={fetchContacts}
          />
          </>
        ) : null}

        <div className="mb-4">
          <button
            type="button"
            onClick={() => setPriorityOnly((on) => !on)}
            className={`px-4 py-2 rounded-xl text-sm font-semibold border transition-colors ${
              priorityOnly
                ? "bg-amber-400 text-slate-900 border-amber-300"
                : "bg-slate-800/60 text-amber-200 border-amber-500/40 hover:bg-slate-700"
            }`}
          >
            {priorityOnly
              ? t("dashboard.priorityInboxAll")
              : t("dashboard.priorityInbox")}
            {filteredContacts.filter(pending).length > 0
              ? ` · ${filteredContacts.filter(pending).length}`
              : ""}
          </button>
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
          ) : listedContacts.length === 0 ? (
            <div className="p-16 text-center">
              <p className="text-slate-300 text-xl font-semibold mb-2">
                😔{" "}
                {priorityOnly
                  ? t("dashboard.priorityInboxEmpty")
                  : t("dashboard.noContacts")}
              </p>
              {priorityOnly ? null : (
                <p className="text-slate-500">{t("dashboard.adjustFilters")}</p>
              )}
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
                            listedContacts.length > 0 &&
                            listedContacts.every((c) =>
                              selectedIds.includes(c.id),
                            )
                          }
                          onChange={() => {
                            const filteredIds = listedContacts.map(
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
                      ⚑ {t("dashboard.priorityFollow")}
                    </th>
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
                  {listedContacts.map((c) => (
                    <tr
                      key={c.id}
                      onClick={() => {
                        setEditOnOpen(false);
                        setSelectedContact(c);
                      }}
                      className={`cursor-pointer hover:bg-slate-700/30 transition-all duration-200 group ${
                        selectedIds.includes(c.id)
                          ? "bg-amber-500/10"
                          : isPrioritaire(c)
                            ? "bg-amber-400/10"
                            : ""
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
                        <input
                          type="checkbox"
                          checked={isPrioritaire(c)}
                          aria-label={t("dashboard.priorityFollow")}
                          onChange={(e) => togglePriority(c.id, e.target.checked)}
                          onClick={(e) => e.stopPropagation()}
                          className="h-4 w-4 rounded border-slate-500 bg-slate-700 text-amber-400 focus:ring-amber-400/50 cursor-pointer"
                        />
                      </td>
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
                          {whatsappPending.has(c.id) ? (
                            <span
                              className="inline-flex items-center h-5 px-1.5 rounded-full bg-emerald-600 text-white text-[11px] font-bold leading-none"
                              title={t("dashboard.priorityWhatsapp")}
                            >
                              WA
                            </span>
                          ) : null}
                        </span>
                        {getChosenFormule(c) ? (
                          <p className="text-xs text-cyan-300 mt-1 font-semibold">
                            📋 {translatedOrRaw(t, "formule", getChosenFormule(c))}
                          </p>
                        ) : null}
                        {(() => {
                          const plan = paymentPlan(c);
                          if (!plan) return null;
                          return (
                            <p className="text-xs text-amber-200 mt-1 font-semibold">
                              {plan.remaining === 0
                                ? t("dashboard.paySettled")
                                : t("dashboard.payRemaining", {
                                    amount: formatEurosOnly(plan.remaining),
                                    count: plan.paidCount,
                                  })}
                            </p>
                          );
                        })()}
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
                filtered: listedContacts.length,
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
          onLockStudentSpace={lockStudentSpace}
          onUpdateDossierEtape={updateDossierEtape}
          onToggleAssign={toggleAssign}
          onTogglePriority={togglePriority}
          onDayTaskSaved={() => setDayTaskKey((k) => k + 1)}
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
          onWhatsappTreated={() => {
            setWhatsappPending((prev) => {
              if (!prev.has(selectedContact.id)) return prev;
              const next = new Set(prev);
              next.delete(selectedContact.id);
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

function FilePanel({
  title,
  children,
  persist = false,
}: {
  title: string;
  children: ReactNode;
  persist?: boolean;
}) {
  const [open, setOpen] = useState(false);
  const shown = open || persist;
  return (
    <div className="mb-4 rounded-2xl border border-slate-700/50 bg-slate-900/30">
      <button
        type="button"
        aria-expanded={open}
        onClick={() => setOpen((value) => !value)}
        className="flex w-full items-center justify-between gap-3 px-5 py-4 text-left"
      >
        <span className="text-sm font-bold uppercase tracking-wide text-slate-200">
          {title}
        </span>
        <span className="text-slate-400" aria-hidden="true">
          {open ? "▾" : "▸"}
        </span>
      </button>
      {shown ? (
        <div className={open ? "px-5 pb-5" : "hidden"}>{children}</div>
      ) : null}
    </div>
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
          <p className="mt-1 text-2xl font-bold text-white leading-snug sm:text-3xl">
            {hypothetic}
          </p>
          <p className="mt-1 text-sm text-amber-100/70">{hypoHint}</p>
        </div>
        <div className="rounded-xl bg-emerald-500/15 px-5 py-4">
          <p className="text-xs font-semibold uppercase tracking-wide text-emerald-200">
            {realLabel}
          </p>
          <p className="mt-1 text-2xl font-bold text-white leading-snug sm:text-3xl">
            {real}
          </p>
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
  onLockStudentSpace,
  onUpdateDossierEtape,
  onToggleAssign,
  onTogglePriority,
  onDayTaskSaved,
  userEmail,
  onContactUpdated,
  onContactPatched,
  startEditing,
  emailThreadKey = 0,
  onEmailThreadRefresh,
  onEmailsMarkedRead,
  onWhatsappTreated,
}: {
  contact: DashboardContact;
  onClose: () => void;
  onUpdateStatut: (id: string, status: string) => Promise<void>;
  onUpdateFormule: (id: string, formuleLabel: string) => Promise<void>;
  onLockStudentSpace: (id: string) => Promise<void>;
  onUpdateDossierEtape: (id: string, etapeIndex: number) => Promise<void>;
  onToggleAssign: (id: string, assign: boolean) => Promise<void>;
  onTogglePriority: (id: string, on: boolean) => Promise<void>;
  onDayTaskSaved: () => void;
  userEmail?: string | null;
  onContactUpdated: () => void;
  onContactPatched: (updated: DashboardContact) => void;
  startEditing?: boolean;
  emailThreadKey?: number;
  onEmailThreadRefresh?: () => void;
  onEmailsMarkedRead?: () => void;
  onWhatsappTreated?: () => void;
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
  const [taskOpen, setTaskOpen] = useState(false);
  const [taskText, setTaskText] = useState("");
  const [savingTask, setSavingTask] = useState(false);

  const openDayTask = async () => {
    setTaskOpen(true);
    setTaskText("");
    const { data } = await adminSupabase
      .from("day_tasks")
      .select("task")
      .eq("contact_id", contact.id)
      .eq("done", false)
      .order("created_at", { ascending: true })
      .limit(1)
      .maybeSingle();
    if (data?.task) setTaskText(String(data.task));
  };

  const saveDayTask = async () => {
    const task = cleanDayTask(taskText);
    if (!task) return;
    setSavingTask(true);
    const { data: open } = await adminSupabase
      .from("day_tasks")
      .select("id")
      .eq("contact_id", contact.id)
      .eq("done", false)
      .order("created_at", { ascending: true })
      .limit(1)
      .maybeSingle();
    const { error } = open?.id
      ? await adminSupabase.from("day_tasks").update({ task }).eq("id", open.id)
      : await adminSupabase.from("day_tasks").upsert(
      {
        contact_id: contact.id,
        day: shanghaiDayString(),
        task,
        source: "admin",
        done: false,
        created_by: cleanAuthorEmail(userEmail) || null,
      },
      { onConflict: "contact_id,day,source" },
    );
    setSavingTask(false);
    if (error) {
      alert(
        isMissingDayTasksTable(error.message)
          ? t("dayTasks.missing")
          : t("error") + " : " + error.message,
      );
      return;
    }
    if (!isPrioritaire(contact)) await onTogglePriority(contact.id, true);
    setTaskOpen(false);
    onDayTaskSaved();
  };

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
  const sameChosenFormule =
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

  const clearChosenFormule = async () => {
    if (!getChosenFormule(contact)) return;
    if (!confirm(t("dashboard.removeFormuleConfirm"))) return;
    setSavingFormule(true);
    try {
      await onUpdateFormule(contact.id, "");
      setSelectedFormule("");
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
        <div className="bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 p-8 flex flex-wrap justify-between items-start gap-4 sticky top-0 z-10">
          <div className="min-w-0 flex-1">
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
            <div className="mt-3 flex flex-wrap gap-2">
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
              <label className="inline-flex items-center gap-2 bg-amber-400/20 text-white px-3 py-1.5 rounded-lg cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={isPrioritaire(contact)}
                  onChange={(e) => onTogglePriority(contact.id, e.target.checked)}
                  className="h-4 w-4 rounded border-white/40 bg-white/20 text-amber-400 focus:ring-amber-400/50 cursor-pointer"
                />
                <span>{t("dashboard.priorityFollow")}</span>
              </label>
              <button
                type="button"
                onClick={openDayTask}
                className="inline-flex items-center bg-white/90 text-slate-900 px-3 py-1.5 rounded-lg text-sm font-bold hover:bg-white"
              >
                {t("dayTasks.add")}
              </button>
            </div>
          </div>

          <div className="flex items-start gap-3 shrink-0">
            {!access.unlockStudentSpace ? (
              <div className="bg-white/15 rounded-xl px-3 py-2.5 border border-white/20 min-w-[11rem]">
                <p className="text-[11px] font-bold uppercase tracking-wide text-white/80 mb-2">
                  📋 {t("dashboard.formuleSection")}
                </p>
                <div className="flex flex-col gap-1.5">
                  {FORMULES.map((formule) => {
                    const active = chosenFormuleNumber === formule.number;
                    const selected = selectedFormuleNumber === formule.number;
                    return (
                      <label
                        key={formule.number}
                        className={`inline-flex items-center gap-2 text-sm text-white px-2 py-1 rounded-lg cursor-pointer select-none ${
                          selected ? "bg-white/25" : "hover:bg-white/10"
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={selected}
                          onChange={() =>
                            setSelectedFormule(selected ? "" : formule.value)
                          }
                          className="h-4 w-4 rounded border-white/40 bg-white/20 text-amber-400 focus:ring-amber-400/50 cursor-pointer"
                        />
                        <span>
                          {formule.number}. {formule.shortTitle}
                          {active ? " ✓" : ""}
                        </span>
                      </label>
                    );
                  })}
                </div>
                <button
                  type="button"
                  disabled={
                    savingFormule || !selectedFormule || sameChosenFormule
                  }
                  onClick={saveChosenFormule}
                  className="mt-2 w-full px-3 py-1.5 rounded-lg bg-white/90 text-slate-900 text-xs font-bold hover:bg-white disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {savingFormule ? t("saving") : t("dashboard.applyFormule")}
                </button>
              </div>
            ) : null}
            <button
              onClick={onClose}
              className="text-white hover:bg-white/20 rounded-xl p-2 transition-all duration-200 hover:scale-110 active:scale-95"
            >
              ✕
            </button>
          </div>
        </div>

        <div className="p-8">
          <div className="mb-8 pb-8 border-b border-cyan-500/30">
            <AdminContactEmailThread
              contactId={contact.id}
              refreshKey={emailThreadKey}
              onMarkedRead={onEmailsMarkedRead}
              prominent
            />
          </div>

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
              {statutKey && !STATUTS.includes(statutKey) ? (
                <option value={statutKey}>
                  {STATUT_ICONS[statutKey] || "•"}{" "}
                  {translatedOrRaw(t, "statut", statutKey) || statutKey}
                </option>
              ) : null}
              {STATUTS.map((s) => (
                <option key={s} value={s}>
                  {STATUT_ICONS[s]} {t(`statut.${s}`)}
                </option>
              ))}
            </select>
          </div>

          <FilePanel title={`👤 ${t("dashboard.studentInfo")}`} persist>
            <AdminContactInfo
              embedded
              contact={contact}
              startEditing={startEditing}
              onSaved={(updated: DashboardContact) => {
                onContactPatched?.(updated);
                fetchActions();
              }}
            />
          </FilePanel>

          <FilePanel title={`💳 ${t("dashboard.payTitle")}`} persist>
            <AdminPaymentSchedule
              contact={contact}
              onPatched={(paiements) =>
                onContactPatched({ ...contact, paiements })
              }
            />
          </FilePanel>

          <FilePanel title={`📝 ${t("dashboard.internalNotes")}`} persist>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              onBlur={saveNotes}
              rows={4}
              className="w-full px-5 py-3 bg-slate-700/50 border border-slate-600/50 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all duration-300 resize-none"
              placeholder={t("dashboard.notesPlaceholder")}
            />
          </FilePanel>

          <FilePanel title={`📧 ${t("dashboard.emailSection")}`}>
            <AdminContactEmail
              contact={contact}
              allowTemplates
              onSent={() => {
                fetchActions();
                onContactUpdated?.();
                onEmailThreadRefresh?.();
              }}
            />
          </FilePanel>

          {access.whatsapp ? (
            <FilePanel title={`💬 ${t("dashboard.whatsappSection")}`}>
              <AdminContactWhatsApp
                contact={contact}
                onDone={fetchActions}
                onTreated={onWhatsappTreated}
              />
            </FilePanel>
          ) : null}

          {access.unlockStudentSpace ? (
            <div className="mb-8 pb-8 border-b border-cyan-500/30">
              <label className="text-sm font-bold text-slate-300 block mb-3 uppercase tracking-wide">
                📋 {t("dashboard.formuleSection")}
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
                  const active = chosenFormuleNumber === formule.number;
                  const selected = selectedFormuleNumber === formule.number;
                  return (
                    <button
                      key={formule.number}
                      type="button"
                      onClick={() => setSelectedFormule(formule.value)}
                      className={`text-left px-4 py-4 rounded-xl border transition-all duration-200 ${
                        active && selected
                          ? "bg-emerald-500/20 border-emerald-400 text-white"
                          : selected
                            ? "bg-cyan-500/20 border-cyan-400 text-white"
                            : active
                              ? "bg-emerald-500/10 border-emerald-500/50 text-white"
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
                {getChosenFormule(contact) ? (
                  <button
                    type="button"
                    disabled={savingFormule}
                    onClick={clearChosenFormule}
                    className="px-6 py-3 bg-rose-700/80 hover:bg-rose-600 text-white rounded-xl font-bold transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {t("dashboard.removeFormule")}
                  </button>
                ) : null}
                {isStudentSpaceUnlocked(contact) ? (
                  <button
                    type="button"
                    onClick={() => onLockStudentSpace(contact.id)}
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
          ) : null}

          <FilePanel title={`📄 ${t("dashboard.contractSection")}`}>
            <AdminSendContract
              contact={contact}
              onSent={() => {
                fetchActions();
                onContactUpdated?.();
                onEmailThreadRefresh?.();
              }}
            />
          </FilePanel>

          <FilePanel title="🎯 Matching" persist>
            <AdminMatchingPanel
              contact={contact}
              onHistory={fetchActions}
              readOnly={!access.matching}
            />
            <AdminChineseMatchingPanel
              contact={contact}
              onHistory={fetchActions}
              readOnly={!access.matching}
            />
          </FilePanel>

          <FilePanel title={`📈 ${t("dashboard.progressSection")}`}>
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
          </FilePanel>

          <FilePanel title={`📂 ${t("files.title")}`}>
            <AdminStudentFiles contactId={contact.id} />
          </FilePanel>

          <FilePanel title={`➕ ${t("dashboard.logAction")}`} persist>
          <form onSubmit={addAction}>
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
          </FilePanel>

          <FilePanel title={`📜 ${t("dashboard.history")} (${actions.length})`}>
            <div className="space-y-3 max-h-96 overflow-y-auto">
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
                          {formatHistoryDescription(action.description, t)}
                        </p>
                      )}
                      {(() => {
                        const kind = historyActorKind(
                          action.action,
                          action.user_admin,
                          action.description,
                        );
                        if (!kind) return null;
                        if (kind === "student") {
                          return (
                            <p className="text-xs text-emerald-400/90">
                              🎓 {t("dashboard.historyActorStudent")}
                            </p>
                          );
                        }
                        if (kind === "auto") {
                          return (
                            <p className="text-xs text-slate-500">
                              👤 {t("dashboard.historyActorAuto")}
                            </p>
                          );
                        }
                        return (
                          <p className="text-xs text-slate-600">
                            👤 {action.user_admin}
                          </p>
                        );
                      })()}
                    </div>
                  );
                })
              )}
            </div>
          </FilePanel>
        </div>
      </div>
      {taskOpen ? (
        <div
          className="fixed inset-0 z-[80] flex items-center justify-center p-4 bg-black/70"
          onClick={(e) => {
            e.stopPropagation();
            setTaskOpen(false);
          }}
        >
          <div
            className="w-full max-w-md rounded-2xl border border-slate-600 bg-slate-900 p-5"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-lg font-bold text-white">{t("dayTasks.popupTitle")}</h3>
            <p className="text-sm text-slate-400 mt-1">{t("dayTasks.popupHint")}</p>
            <textarea
              value={taskText}
              onChange={(e) => setTaskText(e.target.value)}
              rows={4}
              placeholder={t("dayTasks.placeholder")}
              className="mt-4 w-full px-4 py-3 bg-slate-800 border border-slate-600 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-400/50 resize-none"
            />
            <div className="mt-4 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setTaskOpen(false)}
                className="px-4 py-2 rounded-lg text-sm text-slate-300 border border-slate-600 hover:text-white"
              >
                {t("close")}
              </button>
              <button
                type="button"
                disabled={savingTask || !cleanDayTask(taskText)}
                onClick={saveDayTask}
                className="px-4 py-2 rounded-lg text-sm font-bold bg-amber-400 text-slate-900 disabled:opacity-50"
              >
                {savingTask ? t("saving") : t("dayTasks.save")}
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
