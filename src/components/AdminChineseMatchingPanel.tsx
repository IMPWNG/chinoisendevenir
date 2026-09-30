"use client";

import { useEffect, useMemo, useState, type ReactNode } from "react";
import { adminSupabase } from "../lib/supabase";
import { languageIntakeKey } from "../lib/matching/constants";
import { errorMessage } from "../lib/request";

async function authedFetch(path: string, options: RequestInit = {}) {
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

const CATEGORY_STYLES: Record<string, string> = {
  "Bien alignée": "bg-emerald-500/20 text-emerald-200 border-emerald-500/40",
  Possible: "bg-cyan-500/20 text-cyan-200 border-cyan-500/40",
  Écart: "bg-amber-500/20 text-amber-200 border-amber-500/40",
};

const BREAKDOWN_LABELS: Record<string, string> = {
  localisation: "Ville",
  financier: "Budget",
  intake: "Rentrée",
};

const RENTREE_OPTIONS = [
  { key: "printemps_2027", label: "Printemps 2027" },
  { key: "automne_2027", label: "Automne 2027" },
  { key: "rentree_libre", label: "Rentrée libre" },
] as const;

type ScoreParts = { points?: number | string; max?: number | string };

type ChineseMatch = {
  university_id: string;
  university_name: string;
  program_name?: string;
  score?: number;
  category?: string;
  city?: string;
  province?: string;
  website?: string;
  breakdown?: Record<string, ScoreParts>;
  cost?: { label?: string; lines?: string[] };
  intake_label?: string;
  facts?: string[];
  deadline_raw?: string | null;
  why?: string[];
  vigilance?: string[];
};

type ChineseResult = {
  matches?: ChineseMatch[];
  excluded?: { university_name: string; excludeReason: string }[];
  overrides?: {
    preferredCity?: string;
    budgetKey?: string;
    dateRentree?: string;
  };
};

type ChineseRun = {
  id: string;
  created_at?: string;
  top_university?: string;
  top_score?: number | null;
  result?: ChineseResult;
};

type ChineseContact = {
  id: string;
  budget?: string | null;
  date_rentree?: string | null;
};

function Badge({
  children,
  className = "",
}: {
  children?: ReactNode;
  className?: string;
}) {
  return (
    <span
      className={`inline-flex px-2 py-0.5 rounded-md border text-[11px] font-bold ${className}`}
    >
      {children}
    </span>
  );
}

export default function AdminChineseMatchingPanel({
  contact,
  onHistory,
}: {
  contact: ChineseContact;
  onHistory?: () => void;
}) {
  const [preferredCity, setPreferredCity] = useState("");
  const [dateRentree, setDateRentree] = useState(
    languageIntakeKey(contact.date_rentree),
  );
  const [cities, setCities] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState<ChineseResult | null>(null);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [savedInfo, setSavedInfo] = useState("");
  const [runs, setRuns] = useState<ChineseRun[]>([]);

  const selected = useMemo(
    () =>
      result?.matches?.find((item: ChineseMatch) => item.university_id === selectedId) ||
      result?.matches?.[0],
    [result, selectedId],
  );

  const applyResult = (
    payload: ChineseResult | null | undefined,
    meta?: ChineseRun | { created_at?: string },
  ) => {
    if (!payload) return;
    setResult(payload);
    setSelectedId(payload.matches?.[0]?.university_id || null);
    const ov = payload.overrides || {};
    if (ov.preferredCity) setPreferredCity(ov.preferredCity);
    if (ov.dateRentree) setDateRentree(languageIntakeKey(ov.dateRentree));
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
    } catch (error) {
      console.warn("chinese matching runs load:", error);
    }
  };

  useEffect(() => {
    setResult(null);
    setRuns([]);
    setSavedInfo("");
    setError("");
    setPreferredCity("");
    setDateRentree(languageIntakeKey(contact.date_rentree));
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
    } catch (err: unknown) {
      setError(
        errorMessage(err) === "SESSION"
          ? "Session expirée. Reconnectez-vous."
          : errorMessage(err),
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
          Matching pour une année de chinois : ville et rentrée. Les frais des
          écoles de langue sont proches, ils ne servent pas à classer. Le
          résultat s’affiche dans l’espace étudiant, section « Étude du chinois
          en Chine ».
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-3">
        <label className="text-xs text-slate-400">
          Ville souhaitée
          <select
            value={preferredCity}
            onChange={(e) => setPreferredCity(e.target.value)}
            className="mt-1 w-full px-3 py-2 bg-slate-700/50 border border-slate-600/50 rounded-xl text-white text-sm"
          >
            <option value="">Toutes les villes du catalogue</option>
            {preferredCity && !cities.includes(preferredCity) ? (
              <option value={preferredCity}>{preferredCity}</option>
            ) : null}
            {cities.map((city: string) => (
              <option key={city} value={city}>
                {city}
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
            <option value="">Non précisée</option>
            {RENTREE_OPTIONS.map((option) => (
              <option key={option.key} value={option.key}>
                {option.label}
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
              const run = runs.find((item: ChineseRun) => String(item.id) === e.target.value);
              if (run?.result) applyResult(run.result, run);
            }}
            className="mt-1 w-full px-3 py-2 bg-slate-700/50 border border-slate-600/50 rounded-xl text-white text-sm"
          >
            {runs.map((item: ChineseRun) => (
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
            <div className="lg:col-span-2 max-h-96 space-y-2 overflow-y-auto pr-1">
              {result.matches.map((item: ChineseMatch) => (
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
                        CATEGORY_STYLES[item.category || ""] ||
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
              <div className="lg:col-span-3 max-h-96 overflow-y-auto bg-slate-900/40 border border-slate-700/50 rounded-2xl p-4 space-y-4">
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
                  {Object.entries(selected.breakdown || {}).map(([key, value]: [string, ScoreParts]) => (
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
                {(selected.cost?.lines?.length
                  ? selected.cost.lines
                  : selected.cost?.label
                    ? [selected.cost.label]
                    : []
                ).map((line) => (
                  <p key={line} className="text-sm text-slate-200">
                    {line}
                  </p>
                ))}
                <p className="text-sm text-slate-300">
                  Rentrée connue : {selected.intake_label}
                </p>
                {selected.facts?.map((line) => (
                  <p key={line} className="text-sm text-slate-300">
                    {line}
                  </p>
                ))}
                {selected.deadline_raw && /[\u4e00-\u9fff]/.test(selected.deadline_raw) ? (
                  <p className="text-sm text-slate-400">{selected.deadline_raw}</p>
                ) : null}
                {selected.why?.length ? (
                  <ul className="text-sm text-emerald-200 space-y-1">
                    {selected.why.map((line: string) => (
                      <li key={line}>• {line}</li>
                    ))}
                  </ul>
                ) : null}
                {selected.vigilance?.length ? (
                  <ul className="text-sm text-amber-200 space-y-1">
                    {selected.vigilance.map((line: string) => (
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
            {result.excluded.slice(0, 12).map(
              (item: { university_name: string; excludeReason: string }) => (
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
