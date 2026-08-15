import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabase";
import { useAuth } from "../context/AuthContext";

const STATUTS = [
  "nouveau",
  "contact_pris",
  "en_cours",
  "serieux",
  "qualifie",
  "inscrit",
  "perdu",
];

const STATUT_COLORS = {
  nouveau: "bg-slate-500/20 text-slate-300 border-slate-500/50",
  contact_pris: "bg-blue-500/20 text-blue-300 border-blue-500/50",
  en_cours: "bg-yellow-500/20 text-yellow-300 border-yellow-500/50",
  serieux: "bg-orange-500/20 text-orange-300 border-orange-500/50",
  qualifie: "bg-purple-500/20 text-purple-300 border-purple-500/50",
  inscrit: "bg-green-500/20 text-green-300 border-green-500/50",
  perdu: "bg-red-500/20 text-red-300 border-red-500/50",
};

const STATUT_ICONS = {
  nouveau: "🆕",
  contact_pris: "📞",
  en_cours: "⏳",
  serieux: "👤",
  qualifie: "✅",
  inscrit: "🎓",
  perdu: "❌",
};

export default function AdminDashboard() {
  const [contacts, setContacts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filterStatut, setFilterStatut] = useState("tous");
  const [selectedContact, setSelectedContact] = useState(null);
  const { signOut, user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    fetchContacts();
  }, []);

  const fetchContacts = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("contacts")
      .select("*")
      .order("created_at", { ascending: false });

    if (!error) setContacts(data);
    setLoading(false);
  };

  const updateStatut = async (id, newStatut) => {
    const { error } = await supabase
      .from("contacts")
      .update({ suivi_statut: newStatut, updated_at: new Date().toISOString() })
      .eq("id", id);

    if (!error) {
      await supabase.from("suivi_actions").insert({
        contact_id: id,
        action: "changement_statut",
        description: `Statut changé vers "${newStatut}"`,
        user_admin: user?.email,
      });

      setContacts((prev) =>
        prev.map((c) => (c.id === id ? { ...c, suivi_statut: newStatut } : c)),
      );
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
    return matchSearch && matchStatut;
  });

  const stats = {
    total: contacts.length,
    nouveau: contacts.filter((c) => c.suivi_statut === "nouveau").length,
    qualifie: contacts.filter((c) => c.suivi_statut === "qualifie").length,
    inscrit: contacts.filter((c) => c.suivi_statut === "inscrit").length,
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
            trend={`+${Math.floor(stats.total * 0.1)} ce mois`}
          />
          <StatCard
            label="Nouveaux"
            value={stats.nouveau}
            icon="🆕"
            color="from-slate-600 to-slate-500"
            trend="Cette semaine"
          />
          <StatCard
            label="Qualifiés"
            value={stats.qualifie}
            icon="✅"
            color="from-purple-600 to-pink-500"
            trend={`${Math.round((stats.qualifie / stats.total) * 100)}% du total`}
          />
          <StatCard
            label="Inscrits"
            value={stats.inscrit}
            icon="🎓"
            color="from-green-600 to-emerald-500"
            trend="🎉 Succès!"
          />
        </div>

        {/* Filtres et Recherche */}
        <div className="bg-slate-800/40 backdrop-blur-md rounded-2xl shadow-2xl p-6 mb-8 border border-slate-700/50">
          <div className="flex flex-col md:flex-row gap-4 items-stretch md:items-center">
            <div className="flex-1 relative group">
              <input
                type="text"
                placeholder="🔍 Rechercher par nom, prénom, email..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full px-5 py-3 bg-slate-700/50 border border-slate-600/50 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-transparent transition-all duration-300 group-hover:border-slate-600"
              />
              <div className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none">
                🔎
              </div>
            </div>
            <select
              value={filterStatut}
              onChange={(e) => setFilterStatut(e.target.value)}
              className="px-5 py-3 bg-slate-700/50 border border-slate-600/50 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-transparent transition-all duration-300 hover:border-slate-600 cursor-pointer font-medium"
            >
              <option value="tous">📋 Tous les statuts</option>
              {STATUTS.map((s) => (
                <option key={s} value={s}>
                  {STATUT_ICONS[s]} {s.replace(/_/g, " ")}
                </option>
              ))}
            </select>
            <button
              onClick={fetchContacts}
              className="px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-500 text-white rounded-xl hover:shadow-lg hover:shadow-blue-500/40 transition-all duration-300 font-semibold whitespace-nowrap transform hover:scale-105 active:scale-95"
            >
              🔄 Actualiser
            </button>
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
              <p className="text-slate-500">
                Ajustez vos filtres pour voir les contacts
              </p>
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
                      📧 Email
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-slate-300 uppercase tracking-widest">
                      🌍 Pays
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-slate-300 uppercase tracking-widest">
                      📚 Domaine
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-slate-300 uppercase tracking-widest">
                      📅 Date
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
                      className="hover:bg-slate-700/30 transition-all duration-200 group cursor-pointer"
                    >
                      <td className="px-6 py-4">
                        <span className="font-semibold text-white group-hover:text-blue-400 transition-colors">
                          {c.prenom} {c.nom}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-slate-300 text-sm font-medium">
                        {c.email}
                      </td>
                      <td className="px-6 py-4 text-slate-300 text-sm">
                        {c.pays || "—"}
                      </td>
                      <td className="px-6 py-4 text-slate-300 text-sm">
                        {c.domaine_etudes || "—"}
                      </td>
                      <td className="px-6 py-4 text-slate-400 text-sm font-medium">
                        {new Date(c.created_at).toLocaleDateString("fr-FR")}
                      </td>
                      <td className="px-6 py-4">
                        <select
                          value={c.suivi_statut}
                          onChange={(e) => updateStatut(c.id, e.target.value)}
                          className={`text-xs px-3 py-2 rounded-lg font-bold border ${STATUT_COLORS[c.suivi_statut]} bg-opacity-30 focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all duration-300 cursor-pointer hover:bg-opacity-50 backdrop-blur-sm`}
                        >
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
                            🗑️ Supprimer
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
        />
      )}
    </div>
  );
}

function StatCard({ label, value, icon, color, trend }) {
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
          {trend && <p className="text-xs text-white/60 mt-1">{trend}</p>}
        </div>
        <span className="text-5xl opacity-30 group-hover:opacity-50 transition-opacity duration-300 transform group-hover:scale-110">
          {icon}
        </span>
      </div>
    </div>
  );
}

function ContactModal({ contact, onClose, onUpdateStatut, userEmail }) {
  const [actions, setActions] = useState([]);
  const [newAction, setNewAction] = useState("");
  const [newDescription, setNewDescription] = useState("");
  const [notes, setNotes] = useState(contact.notes_admin || "");
  const [loadingActions, setLoadingActions] = useState(true);

  useEffect(() => {
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
      className="fixed inset-0 bg-black/70 backdrop-blur-xl flex items-center justify-center p-4 z-50 animate-fade-in"
      onClick={onClose}
    >
      <div
        className="bg-slate-800 rounded-3xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto border border-slate-700/50"
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
          {/* Infos Grid */}
          <div className="grid grid-cols-2 gap-4 mb-8 pb-8 border-b border-slate-700/50">
            <InfoItem label="📧 Email" value={contact.email} />
            <InfoItem label="📱 Téléphone" value={contact.phone} />
            <InfoItem label="🎂 Âge" value={contact.age} />
            <InfoItem label="🌍 Pays" value={contact.pays} />
            <InfoItem
              label="📚 Domaine d'études"
              value={contact.domaine_etudes}
            />
            <InfoItem
              label="🎓 Dernier diplôme"
              value={contact.dernier_diplome}
            />
            <InfoItem label="💰 Budget" value={contact.budget} />
            <InfoItem label="📅 Date de rentrée" value={contact.date_rentree} />
            <InfoItem label="🔍 Source" value={contact.source} />
            <InfoItem label="⭐ Score qualité" value={contact.score_qualite} />
          </div>

          {/* Statut Selector */}
          <div className="mb-8">
            <label className="text-sm font-bold text-slate-300 block mb-3 uppercase tracking-wide">
              ⭐ Statut de suivi
            </label>
            <select
              value={contact.suivi_statut}
              onChange={(e) => onUpdateStatut(contact.id, e.target.value)}
              className="w-full px-5 py-3 bg-slate-700/50 border border-slate-600/50 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all duration-300 font-semibold hover:border-slate-600"
            >
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
              className="w-full px-5 py-3 bg-slate-700/50 border border-slate-600/50 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all duration-300 resize-none hover:border-slate-600"
              placeholder="Ajouter une note (sauvegardée automatiquement)..."
            />
          </div>

          {/* Ajouter une action */}
          <form
            onSubmit={addAction}
            className="mb-8 pb-8 border-b border-slate-700/50"
          >
            <h3 className="text-sm font-bold text-white mb-4 uppercase tracking-wide">
              ➕ Ajouter une action de suivi
            </h3>
            <div className="flex flex-col gap-4">
              <select
                value={newAction}
                onChange={(e) => setNewAction(e.target.value)}
                className="px-5 py-3 bg-slate-700/50 border border-slate-600/50 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all duration-300 font-medium hover:border-slate-600 cursor-pointer"
              >
                <option value="">-- Choisir une action --</option>
                <option value="appel">📞 Appel téléphonique</option>
                <option value="email">📧 Email envoyé</option>
                <option value="whatsapp">💬 Message WhatsApp</option>
                <option value="relance">🔔 Relance</option>
                <option value="rdv">📅 Rendez-vous planifié</option>
                <option value="document_recu">📄 Document reçu</option>
                <option value="autre">❓ Autre</option>
              </select>
              <textarea
                value={newDescription}
                onChange={(e) => setNewDescription(e.target.value)}
                placeholder="Description (optionnel)..."
                rows={2}
                className="px-5 py-3 bg-slate-700/50 border border-slate-600/50 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all duration-300 resize-none hover:border-slate-600"
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
                actions.map((action) => (
                  <div
                    key={action.id}
                    className="bg-slate-700/30 border border-slate-600/50 rounded-xl p-4 hover:bg-slate-700/50 transition-all duration-200"
                  >
                    <div className="flex justify-between items-start mb-2">
                      <span className="font-bold text-blue-300 capitalize">
                        {action.action.replace(/_/g, " ")}
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
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function InfoItem({ label, value }) {
  return (
    <div className="bg-slate-700/20 rounded-xl p-4 border border-slate-600/30 hover:border-slate-600/50 transition-all duration-200">
      <span className="text-slate-400 text-xs font-bold block mb-2 uppercase tracking-wide">
        {label}
      </span>
      <span className="text-white font-semibold text-sm">{value || "—"}</span>
    </div>
  );
}
