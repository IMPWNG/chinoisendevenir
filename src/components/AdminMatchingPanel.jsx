"use client";

import { useMemo, useState } from "react";
import { supabase } from "../lib/supabase";
import { getFormuleByNumber } from "../lib/formules";

async function authedFetch(path, options = {}) {
  const {
    data: { session },
  } = await supabase.auth.getSession();
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
  "Très bon match": "bg-emerald-500/20 text-emerald-200 border-emerald-500/40",
  "Match intéressant à vérifier": "bg-cyan-500/20 text-cyan-200 border-cyan-500/40",
  "Option possible avec conditions": "bg-amber-500/20 text-amber-200 border-amber-500/40",
  "Faible compatibilité": "bg-rose-500/20 text-rose-200 border-rose-500/40",
};

function Badge({ children, className = "" }) {
  return (
    <span className={`inline-flex px-2 py-0.5 rounded-md border text-[11px] font-bold ${className}`}>
      {children}
    </span>
  );
}

function KindList({ title, items, tone }) {
  if (!items?.length) return null;
  const tones = {
    confirmed: "text-emerald-300",
    estimated: "text-amber-300",
    missing: "text-rose-300",
    verify: "text-cyan-300",
  };
  return (
    <div>
      <p className={`text-xs font-bold uppercase tracking-wide mb-1 ${tones[tone]}`}>
        {title}
      </p>
      <ul className="text-sm text-slate-200 space-y-1">
        {items.map((item) => (
          <li key={item}>• {item}</li>
        ))}
      </ul>
    </div>
  );
}

export default function AdminMatchingPanel({ contact, onHistory }) {
  const [hsk, setHsk] = useState("");
  const [english, setEnglish] = useState("");
  const [targetDegree, setTargetDegree] = useState("");
  const [scholarshipGoal, setScholarshipGoal] = useState("");
  const [extraNotes, setExtraNotes] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState(null);
  const [selectedId, setSelectedId] = useState(null);
  const [copied, setCopied] = useState("");

  const selected = useMemo(
    () => result?.matches?.find((item) => item.university_id === selectedId) || result?.matches?.[0],
    [result, selectedId],
  );

  const run = async () => {
    setLoading(true);
    setError("");
    setCopied("");
    try {
      const response = await authedFetch("/api/admin/matching", {
        method: "POST",
        body: JSON.stringify({
          contactId: contact.id,
          overrides: {
            hsk: hsk === "" ? null : Number(hsk),
            english: english || null,
            targetDegree: targetDegree || null,
            scholarshipGoal: scholarshipGoal || null,
            extraNotes: extraNotes || null,
          },
        }),
      });
      const payload = await response.json();
      if (!response.ok) throw new Error(payload.error || "Matching impossible");
      setResult(payload);
      setSelectedId(payload.matches?.[0]?.university_id || null);
      onHistory?.();
    } catch (err) {
      setError(err.message === "SESSION" ? "Session expirée. Reconnectez-vous." : err.message);
    } finally {
      setLoading(false);
    }
  };

  const copy = async (text, key) => {
    await navigator.clipboard.writeText(text);
    setCopied(key);
  };

  const formula = result ? getFormuleByNumber(result.recommended_formula) : null;

  return (
    <div className="mb-8 pb-8 border-b border-slate-700/50">
      <div className="flex items-start justify-between gap-3 mb-3">
        <div>
          <p className="text-sm font-bold text-slate-300 uppercase tracking-wide">
            Matching universités
          </p>
          <p className="text-xs text-slate-500 mt-1">
            Score sur 100 à partir du profil et du catalogue. Les infos manquantes
            n'excluent pas une université : elles apparaissent en « à vérifier ».
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 mb-3">
        <label className="text-xs text-slate-400">
          Niveau visé
          <select
            value={targetDegree}
            onChange={(e) => setTargetDegree(e.target.value)}
            className="mt-1 w-full px-3 py-2 bg-slate-700/50 border border-slate-600/50 rounded-xl text-white text-sm"
          >
            <option value="">Estimé depuis le diplôme</option>
            <option value="bachelor">Licence / Bachelor</option>
            <option value="master">Master</option>
            <option value="phd">Doctorat</option>
            <option value="language">Année de langue</option>
          </select>
        </label>
        <label className="text-xs text-slate-400">
          HSK
          <select
            value={hsk}
            onChange={(e) => setHsk(e.target.value)}
            className="mt-1 w-full px-3 py-2 bg-slate-700/50 border border-slate-600/50 rounded-xl text-white text-sm"
          >
            <option value="">Non renseigné</option>
            {[0, 1, 2, 3, 4, 5, 6].map((level) => (
              <option key={level} value={level}>
                HSK {level}
              </option>
            ))}
          </select>
        </label>
        <label className="text-xs text-slate-400">
          Anglais
          <select
            value={english}
            onChange={(e) => setEnglish(e.target.value)}
            className="mt-1 w-full px-3 py-2 bg-slate-700/50 border border-slate-600/50 rounded-xl text-white text-sm"
          >
            <option value="">Non renseigné</option>
            <option value="none">Aucun</option>
            <option value="A2">A2</option>
            <option value="B1">B1</option>
            <option value="B2">B2 / IELTS 6</option>
            <option value="C1">C1 / IELTS 7</option>
          </select>
        </label>
        <label className="text-xs text-slate-400">
          Objectif bourse
          <select
            value={scholarshipGoal}
            onChange={(e) => setScholarshipGoal(e.target.value)}
            className="mt-1 w-full px-3 py-2 bg-slate-700/50 border border-slate-600/50 rounded-xl text-white text-sm"
          >
            <option value="">Non précisé</option>
            <option value="none">Sans bourse</option>
            <option value="helpful">Souhaitable</option>
            <option value="required">Indispensable</option>
          </select>
        </label>
      </div>
      <textarea
        value={extraNotes}
        onChange={(e) => setExtraNotes(e.target.value)}
        rows={2}
        placeholder="Notes complémentaires pour l'analyse (optionnel)"
        className="w-full mb-3 px-3 py-2 bg-slate-700/50 border border-slate-600/50 rounded-xl text-white text-sm"
      />
      <button
        type="button"
        onClick={run}
        disabled={loading}
        className="px-6 py-3 bg-gradient-to-r from-emerald-600 to-cyan-600 hover:from-emerald-500 hover:to-cyan-500 text-white rounded-xl font-bold disabled:opacity-50"
      >
        {loading ? "Analyse en cours..." : "Lancer le matching"}
      </button>

      {error ? <p className="text-rose-300 text-sm mt-3">{error}</p> : null}

      {result ? (
        <div className="mt-6 space-y-5">
          <div className="bg-slate-900/50 border border-slate-700/50 rounded-2xl p-4">
            <p className="text-white font-semibold">
              {result.matches.length} université{result.matches.length > 1 ? "s" : ""} classée
              {result.matches.length > 1 ? "s" : ""}
              {result.excluded?.length
                ? ` · ${result.excluded.length} exclue(s)`
                : ""}
            </p>
            <p className="text-sm text-slate-300 mt-1">
              Formule recommandée :{" "}
              <span className="text-white font-bold">
                {formula
                  ? `Formule ${formula.number} — ${formula.shortTitle} (${formula.price})`
                  : result.recommended_formula}
              </span>
            </p>
            {result.brief?.top_match ? (
              <p className="text-sm text-slate-400 mt-1">
                Meilleur match : {result.brief.top_match.name} (
                {result.brief.top_match.score}/100)
              </p>
            ) : (
              <p className="text-sm text-amber-300 mt-1">
                Aucun match exploitable avec les données actuelles.
              </p>
            )}
            {result.client_message_ai ? (
              <p className="text-[11px] text-cyan-400 mt-2">
                Réponse client relue par l'IA, à partir des scores (sans invention de faits).
              </p>
            ) : (
              <p className="text-[11px] text-slate-500 mt-2">
                Réponse client générée à partir du score. Relisez avant envoi.
              </p>
            )}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
            <div className="lg:col-span-2 space-y-2">
              {result.matches.map((item) => (
                <button
                  key={item.university_id}
                  type="button"
                  onClick={() => setSelectedId(item.university_id)}
                  className={`w-full text-left rounded-xl border p-3 ${
                    selected?.university_id === item.university_id
                      ? "border-cyan-400 bg-cyan-500/10"
                      : "border-slate-700/50 bg-slate-900/40"
                  }`}
                >
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-white font-semibold text-sm">{item.university_name}</p>
                    <span className="text-lg font-bold text-white">{item.score}</span>
                  </div>
                  <div className="flex flex-wrap gap-1 mt-2">
                    <Badge className={CATEGORY_STYLES[item.category] || "border-slate-600 text-slate-300"}>
                      {item.category}
                    </Badge>
                    <Badge className="border-slate-600 text-slate-300">{item.priority}</Badge>
                  </div>
                </button>
              ))}
            </div>

            {selected ? (
              <div className="lg:col-span-3 bg-slate-900/40 border border-slate-700/50 rounded-2xl p-4 space-y-4">
                <div>
                  <h3 className="text-lg font-bold text-white">{selected.university_name}</h3>
                  <p className="text-sm text-slate-400 mt-1">{selected.summary}</p>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {Object.entries(selected.breakdown || {}).map(([key, value]) => (
                    <div key={key} className="bg-slate-800/80 rounded-lg p-2">
                      <p className="text-[10px] uppercase text-slate-500">{key}</p>
                      <p className="text-white font-bold">
                        {value.points}/{value.max}
                      </p>
                    </div>
                  ))}
                </div>
                <KindList title="Confirmé" items={selected.confirmed_information} tone="confirmed" />
                <KindList title="Estimé" items={selected.estimated_information} tone="estimated" />
                <KindList title="Points forts" items={selected.strengths} tone="confirmed" />
                <KindList title="Points de vigilance" items={selected.warnings} tone="estimated" />
                <KindList title="À vérifier auprès de l'université" items={selected.to_verify} tone="verify" />
                <KindList title="Informations manquantes" items={selected.missing_information} tone="missing" />
                <KindList title="Documents manquants" items={selected.missing_documents} tone="missing" />
                <KindList title="Prochaines actions" items={selected.recommended_actions} tone="verify" />
                <div className="text-sm text-slate-300 space-y-1">
                  <p>Langue : {selected.teaching_language}</p>
                  <p>
                    Frais :{" "}
                    {selected.cost_estimate?.tuition_cny
                      ? `${selected.cost_estimate.tuition_cny} RMB / an (${selected.cost_estimate.status})`
                      : "à vérifier"}
                  </p>
                  <p>Deadline : {selected.deadline}</p>
                  <p>
                    Bourses :{" "}
                    {selected.scholarships_possible?.join(", ") || "à vérifier"}
                  </p>
                </div>
              </div>
            ) : null}
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm font-bold text-slate-300 uppercase tracking-wide">
                Réponse destinée à l'étudiant
              </p>
              <button
                type="button"
                onClick={() => copy(result.client_message, "message")}
                className="text-xs font-bold text-cyan-300 hover:text-cyan-200"
              >
                {copied === "message" ? "Copié" : "Copier"}
              </button>
            </div>
            <textarea
              readOnly
              value={result.client_message}
              rows={16}
              className="w-full px-4 py-3 bg-slate-900/60 border border-slate-700/50 rounded-xl text-slate-100 text-sm leading-relaxed"
            />
          </div>

          {result.excluded?.length ? (
            <details className="text-sm text-slate-400">
              <summary className="cursor-pointer text-slate-300 font-semibold">
                Universités exclues ({result.excluded.length})
              </summary>
              <ul className="mt-2 space-y-1">
                {result.excluded.slice(0, 20).map((item) => (
                  <li key={`${item.university_name}-${item.excludeReason}`}>
                    {item.university_name} — {item.excludeReason}
                  </li>
                ))}
              </ul>
            </details>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
