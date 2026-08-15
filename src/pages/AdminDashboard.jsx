import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabase";
import { useAuth } from "../context/AuthContext";

const STATUTS = [
  "nouveau_prospect",
  "informations_reçues",
  "profil_analyser",
  "appel_réservé",
  "offre_envoyée",
  "attente_paiement",
  "client_payé",
  "dossier_préparation",
  "candidature_envoyée",
  "admission_reçue",
  "dossier_terminé",
];

const STATUT_COLORS = {
  nouveau_prospect: "bg-slate-500/20 text-slate-300 border-slate-500/50",
  informations_reçues: "bg-blue-500/20 text-blue-300 border-blue-500/50",
  profil_analyser: "bg-cyan-500/20 text-cyan-300 border-cyan-500/50",
  appel_réservé: "bg-indigo-500/20 text-indigo-300 border-indigo-500/50",
  offre_envoyée: "bg-yellow-500/20 text-yellow-300 border-yellow-500/50",
  attente_paiement: "bg-orange-500/20 text-orange-300 border-orange-500/50",
  client_payé: "bg-purple-500/20 text-purple-300 border-purple-500/50",
  dossier_préparation: "bg-pink-500/20 text-pink-300 border-pink-500/50",
  candidature_envoyée: "bg-teal-500/20 text-teal-300 border-teal-500/50",
  admission_reçue: "bg-green-500/20 text-green-300 border-green-500/50",
  dossier_terminé: "bg-emerald-500/20 text-emerald-300 border-emerald-500/50",
};

const STATUT_ICONS = {
  nouveau_prospect: "🆕",
  informations_reçues: "📥",
  profil_analyser: "🔍",
  appel_réservé: "📞",
  offre_envoyée: "💌",
  attente_paiement: "💳",
  client_payé: "✅",
  dossier_préparation: "📋",
  candidature_envoyée: "🚀",
  admission_reçue: "🎉",
  dossier_terminé: "🎓",
};

const NIVEAUX_ETUDES = [
  "Licence",
  "Master",
  "Doctorat",
  "Langue chinoise",
  "Formation continue",
];

const DOMAINES_ETUDES = [
  "Finance",
  "Médecine",
  "Informatique",
  "Commerce",
  "Ingénierie",
  "Langues",
  "Arts",
  "Autre",
];

const BUDGETS = ["Faible", "Moyen", "Élevé"];

const ACTIONS_TYPES = [
  { value: "appel", label: "Appel effectué", icon: "📞" },
  { value: "email_envoye", label: "Email envoyé", icon: "📧" },
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
  const [contacts, setContacts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filterStatut, setFilterStatut] = useState("tous");
  const [filterBudget, setFilterBudget] = useState("tous");
  const [filterPays, setFilterPays] = useState("tous");
  const [filterNiveau, setFilterNiveau] = useState("tous");
  const [filterDomaine, setFilterDomaine] = useState("tous");
  const [selectedContact, setSelectedContact] = useState(null);
  const [pays, setPays] = useState([]);
  const { signOut, user } = useAuth();
  const navigate = useNavigate();

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
      // Extraire les pays uniques
      const paysUniques = [...new Set(data.map((c) => c.pays).filter(Boolean))];
      setPays(paysUniques.sort());
    }
    setLoading(false);
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
      alert("Erreur : " + error.message);
      return;
    }

    // Enregistrer l'action
    const { error: actionError } = await supabase.from("suivi_actions").insert({
      contact_id: id,
      action: "changement_statut",
      description: `Statut changé vers "${newStatut}"`,
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
  } catch (err) {
    console.error("Erreur:", err);
    alert("Une erreur est survenue");
  }
};

  const deleteContact = async (id) => {
    if (!confirm("Supprimer définitivement ce contact ?")) return;
    const { error } = await supabase.from("contacts").delete().eq("id", id);
    if (!error) {
      setContacts((prev) => prev.filter((c) => c.id !== id));
      setSelectedContact(null);
    }
  };

  const handleLogout = async () => {
    await signOut();
    navigate("/admin/login");
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
    nouveau: contacts.filter((c) => c.suivi_statut === "nouveau_prospect")
      .length,
    en_attente: contacts.filter((c) => c.suivi_statut === "attente_paiement")
      .length,
    paye: contacts.filter((c) => c.suivi_statut === "client_payé").length,
    termine: contacts.filter((c) => c.suivi_statut === "dossier_terminé")
      .length,
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
      {/* Header */}
      <header className="bg-slate-900/80 backdrop-blur-lg border-b border-slate-700/50 sticky top-0 z-40 shadow-2xl">
        <div className="max-w-7xl mx-auto px-6 py-6 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
              <span className="text-xl">📊</span>
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white">Dashboard Admin</h1>
              <p className="text-xs text-slate-400">Étudier en Chine</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-right">
              <p className="text-sm text-white font-medium">{user?.email}</p>
              <p className="text-xs text-slate-400">Connecté</p>
            </div>
            <div className="w-11 h-11 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold text-lg shadow-lg">
              {user?.email?.[0].toUpperCase()}
            </div>
            <button
              onClick={handleLogout}
              className="text-sm bg-gradient-to-r from-red-600 to-red-500 hover:from-red-700 hover:to-red-600 text-white px-5 py-2 rounded-lg font-semibold transition-all duration-300 shadow-lg hover:shadow-red-500/50"
            >
              🚪 Déconnexion
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
          <StatCard
            label="Total contacts"
            value={stats.total}
            icon="👥"
            color="from-blue-600 to-cyan-500"
          />
          <StatCard
            label="Nouveaux"
            value={stats.nouveau}
            icon="🆕"
            color="from-slate-600 to-slate-500"
          />
          <StatCard
            label="Payés"
            value={stats.paye}
            icon="💳"
            color="from-purple-600 to-pink-500"
          />
          <StatCard
            label="Terminés"
            value={stats.termine}
            icon="🎓"
            color="from-green-600 to-emerald-500"
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
                  placeholder="🔍 Rechercher par nom, email..."
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
                <option value="tous">📋 Tous les statuts</option>
                {STATUTS.map((s) => (
                  <option key={s} value={s}>
                    {STATUT_ICONS[s]} {s.replace(/_/g, " ")}
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
                <option value="tous">🌍 Tous les pays</option>
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
                <option value="tous">🎓 Tous les niveaux</option>
                {NIVEAUX_ETUDES.map((n) => (
                  <option key={n} value={n}>
                    {n}
                  </option>
                ))}
              </select>

              <select
                value={filterDomaine}
                onChange={(e) => setFilterDomaine(e.target.value)}
                className="px-4 py-3 bg-slate-700/50 border border-slate-600/50 rounded-xl text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all duration-300 font-medium cursor-pointer"
              >
                <option value="tous">📚 Tous les domaines</option>
                {DOMAINES_ETUDES.map((d) => (
                  <option key={d} value={d}>
                    {d}
                  </option>
                ))}
              </select>

              <select
                value={filterBudget}
                onChange={(e) => setFilterBudget(e.target.value)}
                className="px-4 py-3 bg-slate-700/50 border border-slate-600/50 rounded-xl text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all duration-300 font-medium cursor-pointer"
              >
                <option value="tous">💰 Tous les budgets</option>
                {BUDGETS.map((b) => (
                  <option key={b} value={b}>
                    {b}
                  </option>
                ))}
              </select>

              <button
                onClick={fetchContacts}
                className="px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-500 text-white rounded-xl hover:shadow-lg hover:shadow-blue-500/40 transition-all duration-300 font-semibold transform hover:scale-105 active:scale-95"
              >
                🔄 Actualiser
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
                Chargement des contacts...
              </p>
            </div>
          ) : filteredContacts.length === 0 ? (
            <div className="p-16 text-center">
              <p className="text-slate-300 text-xl font-semibold mb-2">
                😔 Aucun contact trouvé
              </p>
              <p className="text-slate-500">Ajustez vos filtres</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-slate-900/60 border-b border-slate-700/50">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-bold text-slate-300 uppercase tracking-widest">
                      👤 Nom
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-slate-300 uppercase tracking-widest">
                      🌍 Pays
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-slate-300 uppercase tracking-widest">
                      🎓 Niveau
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-slate-300 uppercase tracking-widest">
                      📚 Domaine
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-slate-300 uppercase tracking-widest">
                      💰 Budget
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-slate-300 uppercase tracking-widest">
                      ⭐ Statut
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-slate-300 uppercase tracking-widest">
                      ⚙️ Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-700/50">
                  {filteredContacts.map((c) => (
                    <tr
                      key={c.id}
                      className="hover:bg-slate-700/30 transition-all duration-200 group"
                    >
                      <td className="px-6 py-4">
                        <span className="font-semibold text-white group-hover:text-blue-400 transition-colors">
                          {c.prenom} {c.nom}
                        </span>
                        <p className="text-xs text-slate-500 mt-1">{c.email}</p>
                      </td>
                      <td className="px-6 py-4 text-slate-300 text-sm">
                        {c.pays || "—"}
                      </td>
                      <td className="px-6 py-4 text-slate-300 text-sm">
                        {c.dernier_diplome || "—"}
                      </td>
                      <td className="px-6 py-4 text-slate-300 text-sm">
                        {c.domaine_etudes || "—"}
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-sm font-bold px-3 py-1 rounded-lg bg-slate-700/30 text-slate-300">
                          {c.budget || "—"}
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
                          <option value="">-- Sélectionner --</option>
                          {STATUTS.map((s) => (
                            <option key={s} value={s}>
                              {STATUT_ICONS[s]} {s.replace(/_/g, " ")}
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
                            👁️ Voir
                          </button>
                          <button
                            onClick={() => deleteContact(c.id)}
                            className="text-red-400 hover:text-red-300 hover:bg-red-500/20 px-3 py-1 rounded-lg text-sm font-semibold transition-all duration-200"
                          >
                            🗑️ Sup
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
              📊 {filteredContacts.length} contact
              {filteredContacts.length > 1 ? "s" : ""} affichés sur{" "}
              {contacts.length}
            </p>
          </div>
        </div>
      </div>

      {/* Modal détail */}
      {selectedContact && (
        <ContactModal
          contact={selectedContact}
          onClose={() => setSelectedContact(null)}
          onUpdateStatut={updateStatut}
          userEmail={user?.email}
          onContactUpdated={fetchContacts}
        />
      )}
    </div>
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
  userEmail,
}) {
  const [actions, setActions] = useState([]);
  const [newAction, setNewAction] = useState("");
  const [newDescription, setNewDescription] = useState("");
  const [notes, setNotes] = useState(contact.notes_admin || "");
  const [loadingActions, setLoadingActions] = useState(true);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/immutability
    fetchActions();
  }, [contact.id]);

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
            <p className="text-blue-100 text-sm mt-2 font-medium">
              {contact.email}
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-white hover:bg-white/20 rounded-xl p-2 transition-all duration-200 hover:scale-110 active:scale-95"
          >
            ✕
          </button>
        </div>

        <div className="p-8">
          {/* Infos Grid - Style tableau */}
          <div className="mb-8 overflow-x-auto">
            <table className="w-full border-collapse">
              <tbody>
                <tr className="border-b border-slate-700/50">
                  <td className="px-4 py-3 font-bold text-slate-300 bg-slate-700/20 w-1/3">
                    📧 Email
                  </td>
                  <td className="px-4 py-3 text-white">{contact.email}</td>
                </tr>
                <tr className="border-b border-slate-700/50">
                  <td className="px-4 py-3 font-bold text-slate-300 bg-slate-700/20">
                    📱 Téléphone
                  </td>
                  <td className="px-4 py-3 text-white">
                    {contact.phone || "—"}
                  </td>
                </tr>
                <tr className="border-b border-slate-700/50">
                  <td className="px-4 py-3 font-bold text-slate-300 bg-slate-700/20">
                    🌍 Pays
                  </td>
                  <td className="px-4 py-3 text-white">
                    {contact.pays || "—"}
                  </td>
                </tr>
                <tr className="border-b border-slate-700/50">
                  <td className="px-4 py-3 font-bold text-slate-300 bg-slate-700/20">
                    🎓 Niveau d'études
                  </td>
                  <td className="px-4 py-3 text-white">
                    {contact.dernier_diplome || "—"}
                  </td>
                </tr>
                <tr className="border-b border-slate-700/50">
                  <td className="px-4 py-3 font-bold text-slate-300 bg-slate-700/20">
                    📚 Domaine
                  </td>
                  <td className="px-4 py-3 text-white">
                    {contact.domaine_etudes || "—"}
                  </td>
                </tr>
                <tr className="border-b border-slate-700/50">
                  <td className="px-4 py-3 font-bold text-slate-300 bg-slate-700/20">
                    💰 Budget
                  </td>
                  <td className="px-4 py-3 text-white font-semibold">
                    {contact.budget || "—"}
                  </td>
                </tr>
                <tr className="border-b border-slate-700/50">
                  <td className="px-4 py-3 font-bold text-slate-300 bg-slate-700/20">
                    📅 Date de rentrée
                  </td>
                  <td className="px-4 py-3 text-white">
                    {contact.date_rentree || "—"}
                  </td>
                </tr>
                <tr className="border-b border-slate-700/50">
                  <td className="px-4 py-3 font-bold text-slate-300 bg-slate-700/20">
                    🔍 Source
                  </td>
                  <td className="px-4 py-3 text-white">
                    {contact.source || "—"}
                  </td>
                </tr>
                <tr>
                  <td className="px-4 py-3 font-bold text-slate-300 bg-slate-700/20">
                    ⭐ Score qualité
                  </td>
                  <td className="px-4 py-3 text-white">
                    {contact.score_qualite || "—"}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Statut Selector */}
          <div className="mb-8 pb-8 border-b border-slate-700/50">
            <label className="text-sm font-bold text-slate-300 block mb-3 uppercase tracking-wide">
              ⭐ Statut actuel
            </label>
            <select
              value={contact.suivi_statut || ""}
              onChange={(e) => onUpdateStatut(contact.id, e.target.value)}
              className="w-full px-5 py-3 bg-slate-700/50 border border-slate-600/50 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all duration-300 font-semibold"
            >
              <option value="">-- Sélectionner un statut --</option>
              {STATUTS.map((s) => (
                <option key={s} value={s}>
                  {STATUT_ICONS[s]} {s.replace(/_/g, " ")}
                </option>
              ))}
            </select>
          </div>

          {/* Notes Admin */}
          <div className="mb-8 pb-8 border-b border-slate-700/50">
            <label className="text-sm font-bold text-slate-300 block mb-3 uppercase tracking-wide">
              📝 Notes internes
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              onBlur={saveNotes}
              rows={4}
              className="w-full px-5 py-3 bg-slate-700/50 border border-slate-600/50 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all duration-300 resize-none"
              placeholder="Ajouter une note (sauvegardée automatiquement)..."
            />
          </div>

          {/* Ajouter une action */}
          <form
            onSubmit={addAction}
            className="mb-8 pb-8 border-b border-slate-700/50"
          >
            <h3 className="text-sm font-bold text-white mb-4 uppercase tracking-wide">
              ➕ Enregistrer une action
            </h3>
            <div className="flex flex-col gap-4">
              <select
                value={newAction}
                onChange={(e) => setNewAction(e.target.value)}
                className="px-5 py-3 bg-slate-700/50 border border-slate-600/50 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all duration-300 font-medium cursor-pointer"
              >
                <option value="">-- Choisir une action --</option>
                {ACTIONS_TYPES.map((a) => (
                  <option key={a.value} value={a.value}>
                    {a.icon} {a.label}
                  </option>
                ))}
              </select>
              <textarea
                value={newDescription}
                onChange={(e) => setNewDescription(e.target.value)}
                placeholder="Description (optionnel)..."
                rows={2}
                className="px-5 py-3 bg-slate-700/50 border border-slate-600/50 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all duration-300 resize-none"
              />
              <button
                type="submit"
                className="bg-gradient-to-r from-blue-600 to-blue-500 text-white py-3 rounded-xl font-bold hover:shadow-lg hover:shadow-blue-500/40 transition-all duration-300 transform hover:scale-105 active:scale-95 uppercase tracking-wide"
              >
                ✅ Enregistrer l'action
              </button>
            </div>
          </form>

          {/* Historique */}
          <div>
            <h3 className="text-sm font-bold text-white mb-4 uppercase tracking-wide">
              📜 Historique ({actions.length})
            </h3>
            <div className="space-y-3 max-h-64 overflow-y-auto">
              {loadingActions ? (
                <p className="text-slate-400 text-center py-4">Chargement...</p>
              ) : actions.length === 0 ? (
                <p className="text-slate-400 text-center py-4">
                  Aucune action enregistrée
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
                          {actionType?.label || action.action}
                        </span>
                        <span className="text-xs text-slate-500 font-medium">
                          {new Date(action.created_at).toLocaleString("fr-FR")}
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
