"use client";

import { useEffect, useMemo, useState } from "react";
import { adminSupabase } from "../lib/supabase";
import { BUDGET_BANDS } from "../lib/matching/constants";

async function authedFetch(path, options = {}) {
  const {
    data: { session },
  } = await adminSupabase.auth.getSession();
  if (!session?.access_token) throw new Error("SESSION");
  return fetch(path, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(options.headers || {}),
      Authorization: `Bearer ${session.access_token}`,
    },
  });
}

const CATEGORY_STYLES = {
  "Bien alignée": "bg-emerald-500/20 text-emerald-200 border-emerald-500/40",
  Possible: "bg-cyan-500/20 text-cyan-200 border-cyan-500/40",
  Écart: "bg-amber-500/20 text-amber-200 border-amber-500/40",
};

const BREAKDOWN_LABELS = {
  localisation: "Ville",
  financier: "Budget",
  intake: "Rentrée",
};

const BUDGET_OPTIONS = [
  "<5000",
  "moins-3000",
  "3000-6000",
  "5000-10000",
  "10000-20000",
  ">20000",
  "besoin-bourse",
];

const RENTREE_OPTIONS = [
  "septembre_2026",
  "mars_2027",
  "septembre_2027",
  "flexible",
];

const COMMON_CITIES = [
  "Beijing",
  "Shanghai",
  "Guangzhou",
  "Shenzhen",
  "Chengdu",
  "Chongqing",
  "Hangzhou",
  "Nanjing",
  "Wuhan",
  "Xi'an",
  "Xiamen",
  "Kunming",
  "Qingdao",
  "Tianjin",
  "Suzhou",
  "Changsha",
  "Dalian",
  "Harbin",
  "Jinan",
  "Zhengzhou",
];

const RENTREE_LABELS = {
  septembre_2026: "Septembre 2026",
  mars_2027: "Mars 2027",
  septembre_2027: "Septembre 2027",
  flexible: "Flexible",
};

function Badge({ children, className = "" }) {
  return (
    <span
      className={`inline-flex px-2 py-0.5 rounded-md border text-[11px] font-bold ${className}`}
    >
      {children}
    </span>
  );
}

export default function AdminChineseMatchingPanel({ contact, onHistory }) {
  const [preferredCity, setPreferredCity] = useState("");
  const [budgetKey, setBudgetKey] = useState(contact.budget || "");
  const [dateRentree, setDateRentree] = useState(contact.date_rentree || "");
  const [cities, setCities] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState(null);
  const [selectedId, setSelectedId] = useState(null);
  const [savedInfo, setSavedInfo] = useState("");
  const [runs, setRuns] = useState([]);

  const selected = useMemo(
    () =>
      result?.matches?.find((item) => item.university_id === selectedId) ||
      result?.matches?.[0],
    [result, selectedId],
  );

  const applyResult = (payload, meta) => {
    if (!payload) return;
    setResult(payload);
    setSelectedId(payload.matches?.[0]?.university_id || null);
    const ov = payload.overrides || {};
    if (ov.preferredCity) setPreferredCity(ov.preferredCity);
    if (ov.budgetKey) setBudgetKey(ov.budgetKey);
    if (ov.dateRentree) setDateRentree(ov.dateRentree);
    if (meta?.created_at) {
      setSavedInfo(
        `Sauvegardé le ${new Date(meta.created_at).toLocaleString("fr-FR")}`,
      );
    }
  };

  const loadRuns = async ({ restore = false } = {}) => {
    try {
      const response = await authedFetch(
        `/api/admin/matching/chinese?contactId=${encodeURIComponent(contact.id)}`,
      );
      const payload = await response.json();
      if (!response.ok) return;
      setRuns(payload.runs || []);
      setCities(payload.cities || []);
      if (restore && payload.latest?.result) {
        applyResult(payload.latest.result, payload.latest);
      }
    } catch {
      // ignore
    }
  };

  useEffect(() => {
    setResult(null);
    setRuns([]);
    setSavedInfo("");
    setError("");
    setPreferredCity("");
    setBudgetKey(contact.budget || "");
    setDateRentree(contact.date_rentree || "");
    loadRuns({ restore: true });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [contact.id]);

  const run = async () => {
    setLoading(true);
    setError("");
    try {
      const response = await authedFetch("/api/admin/matching/chinese", {
        method: "POST",
        body: JSON.stringify({
          contactId: contact.id,
          overrides: {
            preferredCity: preferredCity || null,
            budgetKey: budgetKey || null,
            dateRentree: dateRentree || null,
          },
        }),
      });
      const payload = await response.json();
      if (!response.ok) throw new Error(payload.error || "Matching impossible");
      applyResult(payload, payload.saved || {});
      setCities(payload.cities || cities);
      setSavedInfo(
        payload.saved?.created_at
          ? `Sauvegardé automatiquement le ${new Date(payload.saved.created_at).toLocaleString("fr-FR")}`
          : payload.save_error
            ? `Matching terminé, mais la sauvegarde a échoué : ${payload.save_error}`
            : payload.warning ||
              "Matching terminé. La sauvegarde automatique n'a pas abouti.",
      );
      await loadRuns();
      onHistory?.();
    } catch (err) {
      setError(
        err.message === "SESSION"
          ? "Session expirée. Reconnectez-vous."
          : err.message,
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mb-8 pb-8 border-b border-slate-700/50">
      <div className="mb-3">
        <p className="text-sm font-bold text-slate-300 uppercase tracking-wide">
          Matching chinois — écoles de langue
        </p>
        <p className="text-xs text-slate-500 mt-1">
          Matching simple pour une année de chinois : ville, budget annuel et
          date de rentrée. Le résultat s’affiche dans l’espace étudiant, section
          « Étude du chinois en Chine ».
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-3">
        <label className="text-xs text-slate-400">
          Ville souhaitée
          <input
            list="chinese-matching-cities"
            value={preferredCity}
            onChange={(e) => setPreferredCity(e.target.value)}
            placeholder="Ex. Shanghai, Chengdu…"
            className="mt-1 w-full px-3 py-2 bg-slate-700/50 border border-slate-600/50 rounded-xl text-white text-sm"
          />
          <datalist id="chinese-matching-cities">
            {[...new Set([...COMMON_CITIES, ...cities])].map((city) => (
              <option key={city} value={city} />
            ))}
          </datalist>
        </label>
        <label className="text-xs text-slate-400">
          Budget
          <select
            value={budgetKey}
            onChange={(e) => setBudgetKey(e.target.value)}
            className="mt-1 w-full px-3 py-2 bg-slate-700/50 border border-slate-600/50 rounded-xl text-white text-sm"
          >
            <option value="">Fiche étudiant</option>
            {BUDGET_OPTIONS.map((key) => (
              <option key={key} value={key}>
                {BUDGET_BANDS[key]?.label || key}
              </option>
            ))}
          </select>
        </label>
        <label className="text-xs text-slate-400">
          Rentrée souhaitée
          <select
            value={dateRentree}
            onChange={(e) => setDateRentree(e.target.value)}
            className="mt-1 w-full px-3 py-2 bg-slate-700/50 border border-slate-600/50 rounded-xl text-white text-sm"
          >
            <option value="">Fiche étudiant</option>
            {RENTREE_OPTIONS.map((key) => (
              <option key={key} value={key}>
                {RENTREE_LABELS[key] || key}
              </option>
            ))}
          </select>
        </label>
      </div>

      <button
        type="button"
        onClick={run}
        disabled={loading}
        className="px-6 py-3 bg-gradient-to-r from-rose-700 to-amber-600 hover:from-rose-600 hover:to-amber-500 text-white rounded-xl font-bold disabled:opacity-50"
      >
        {loading ? "Analyse en cours..." : "Lancer le matching chinois"}
      </button>

      {savedInfo ? (
        <p
          className={`text-sm mt-3 ${
            savedInfo.includes("échoué") ||
            savedInfo.includes("n'a pas abouti") ||
            savedInfo.includes("Aucune école")
              ? "text-amber-300"
              : "text-emerald-300"
          }`}
        >
          {savedInfo}
        </p>
      ) : null}

      {runs.length ? (
        <label className="block text-xs text-slate-400 mt-3">
          Matchings chinois sauvegardés
          <select
            defaultValue={runs[0]?.id || ""}
            onChange={(e) => {
              const run = runs.find((item) => String(item.id) === e.target.value);
              if (run?.result) applyResult(run.result, run);
            }}
            className="mt-1 w-full px-3 py-2 bg-slate-700/50 border border-slate-600/50 rounded-xl text-white text-sm"
          >
            {runs.map((item) => (
              <option key={item.id} value={item.id}>
                {item.created_at
                  ? new Date(item.created_at).toLocaleString("fr-FR")
                  : "Matching chinois"}
                {item.top_university
                  ? ` — ${item.top_university} (${item.top_score}/100)`
                  : ""}
              </option>
            ))}
          </select>
        </label>
      ) : null}

      {error ? <p className="text-rose-300 text-sm mt-3">{error}</p> : null}

      {result?.matches?.length ? (
        <div className="mt-6 space-y-4">
          <p className="text-sm font-bold text-slate-300 uppercase tracking-wide">
            Écoles de langue retenues
          </p>
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
            <div className="lg:col-span-2 space-y-2">
              {result.matches.map((item) => (
                <button
                  key={item.university_id}
                  type="button"
                  onClick={() => setSelectedId(item.university_id)}
                  className={`w-full text-left rounded-xl border p-3 ${
                    selected?.university_id === item.university_id
                      ? "border-amber-400 bg-amber-500/10"
                      : "border-slate-700/50 bg-slate-900/40"
                  }`}
                >
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-white font-semibold text-sm">
                      {item.university_name}
                    </p>
                    <span className="text-lg font-bold text-white">
                      {item.score}
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 mt-1">
                    {item.city || "Ville à confirmer"}
                  </p>
                  <div className="flex flex-wrap gap-1 mt-2">
                    <Badge
                      className={
                        CATEGORY_STYLES[item.category] ||
                        "border-slate-600 text-slate-300"
                      }
                    >
                      {item.category}
                    </Badge>
                  </div>
                </button>
              ))}
            </div>

            {selected ? (
              <div className="lg:col-span-3 bg-slate-900/40 border border-slate-700/50 rounded-2xl p-4 space-y-4">
                <div>
                  <h3 className="text-lg font-bold text-white">
                    {selected.university_name}
                  </h3>
                  <p className="text-sm text-slate-400 mt-1">
                    {selected.city}
                    {selected.province ? ` · ${selected.province}` : ""}
                  </p>
                </div>
                <div className="grid grid-cols-3 gap-2">
                  {Object.entries(selected.breakdown || {}).map(([key, value]) => (
                    <div key={key} className="bg-slate-800/80 rounded-lg p-2">
                      <p className="text-[10px] uppercase text-slate-500">
                        {BREAKDOWN_LABELS[key] || key}
                      </p>
                      <p className="text-white font-bold">
                        {value.points}/{value.max}
                      </p>
                    </div>
                  ))}
                </div>
                <p className="text-sm text-slate-300">{selected.cost?.label}</p>
                <p className="text-sm text-slate-300">
                  Rentrée : {selected.intake_label}
                </p>
                {selected.why?.length ? (
                  <ul className="text-sm text-emerald-200 space-y-1">
                    {selected.why.map((line) => (
                      <li key={line}>• {line}</li>
                    ))}
                  </ul>
                ) : null}
                {selected.vigilance?.length ? (
                  <ul className="text-sm text-amber-200 space-y-1">
                    {selected.vigilance.map((line) => (
                      <li key={line}>• {line}</li>
                    ))}
                  </ul>
                ) : null}
              </div>
            ) : null}
          </div>
        </div>
      ) : null}

      {result?.excluded?.length ? (
        <details className="text-sm text-slate-400 mt-4">
          <summary className="cursor-pointer text-slate-300 font-semibold">
            Établissements sans programme langue ({result.excluded.length})
          </summary>
          <ul className="mt-2 space-y-1">
            {result.excluded.slice(0, 12).map((item) => (
              <li key={`${item.university_name}-${item.excludeReason}`}>
                {item.university_name} — {item.excludeReason}
              </li>
            ))}
          </ul>
        </details>
      ) : null}
    </div>
  );
}
