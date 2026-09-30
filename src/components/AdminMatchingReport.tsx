"use client";

import type { ReactNode } from "react";

const STATUS_LABELS: Record<string, string> = {
  fait: "Fait",
  en_cours: "En cours",
  a_faire: "À faire",
};

const STATUS_CLASS: Record<string, string> = {
  fait: "text-emerald-200 border-emerald-500/40 bg-emerald-500/10",
  en_cours: "text-cyan-200 border-cyan-500/40 bg-cyan-500/10",
  a_faire: "text-amber-200 border-amber-500/40 bg-amber-500/10",
};

const FACTOR_LABELS: Record<string, string> = {
  langue: "Langue",
  budget: "Budget",
  documents: "Documents",
  age: "Âge",
  academique: "Niveau académique",
};

type GuidelineRow = { step: string; status?: string; action?: string };
type FieldNote = { field?: string; note?: string; blocking?: boolean };
type UniversityRisk = { university: string; risk: string };

export type FollowUpItem = { done?: boolean; note?: string };
export type FollowUpMap = Record<string, FollowUpItem>;
export type CheckGroup = {
  id: string;
  name: string;
  items: { key: string; label: string }[];
};

function followKey(section: string, uniId: string, itemKey: string) {
  return `${section}:${uniId}:${itemKey}`;
}

function dedupedRisks(risks: UniversityRisk[]) {
  const kept: UniversityRisk[] = [];
  risks.forEach((row) => {
    const hsk = /hsk/i.test(row.risk);
    if (
      hsk &&
      kept.some(
        (item) => item.university === row.university && /hsk/i.test(item.risk),
      )
    ) {
      return;
    }
    if (
      kept.some(
        (item) => item.university === row.university && item.risk === row.risk,
      )
    ) {
      return;
    }
    kept.push(row);
  });
  return kept;
}

function CheckGroups({
  section,
  groups,
  followUp,
  onFollowUp,
}: {
  section: string;
  groups: CheckGroup[];
  followUp: FollowUpMap;
  onFollowUp?: (key: string, patch: FollowUpItem) => void;
}) {
  if (!groups.length) {
    return <p className="text-sm text-slate-400">Aucune ligne pour l’instant.</p>;
  }
  return (
    <div className="space-y-2">
      {groups.map((group) => (
        <details key={group.id} className="rounded-lg border border-slate-700/70 bg-slate-950/40">
          <summary className="cursor-pointer px-3 py-2 text-sm font-semibold text-white">
            {group.name}
            <span className="ml-2 text-xs font-normal text-slate-400">
              {group.items.length} ligne{group.items.length > 1 ? "s" : ""}
            </span>
          </summary>
          <div className="space-y-2 px-3 pb-3">
            {(group.items.length ? group.items : [{ key: "note", label: "Information à compléter" }]).map(
              (item) => {
                const key = followKey(section, group.id, item.key);
                const saved = followUp[key] || {};
                return (
                  <div key={key} className="grid grid-cols-1 sm:grid-cols-[auto_1fr] gap-2 items-start">
                    <label className="flex items-start gap-2 text-sm text-slate-200">
                      <input
                        type="checkbox"
                        className="mt-1"
                        checked={Boolean(saved.done)}
                        onChange={(event) =>
                          onFollowUp?.(key, { done: event.target.checked, note: saved.note || "" })
                        }
                      />
                      <span>{item.label}</span>
                    </label>
                    <input
                      value={saved.note || ""}
                      onChange={(event) =>
                        onFollowUp?.(key, { done: Boolean(saved.done), note: event.target.value })
                      }
                      placeholder="Information manquante"
                      className="w-full px-2 py-1 bg-slate-800 border border-slate-600 rounded-lg text-sm text-white"
                    />
                  </div>
                );
              },
            )}
          </div>
        </details>
      ))}
    </div>
  );
}

type AdminReport = {
  header?: {
    classified_count?: number;
    excluded_count?: number;
    recommended_formula?: { label?: string };
    purchased_formula?: { label?: string };
    formula_mismatch?: boolean;
    completeness_pct?: number | null;
    mix?: { safety?: number; match?: number; reach?: number };
    best_match?: { name?: string; score?: number; category?: string };
  };
  diagnostic?: {
    limiting_factor?: string;
    limiting_factor_note?: string;
    top_actions?: string[];
    inconsistencies?: FieldNote[];
  };
  guideline?: GuidelineRow[];
  alerts?: {
    blocking_fields?: FieldNote[];
    call_clarifications?: string[];
    university_risks?: UniversityRisk[];
  };
  inconsistency_flag?: boolean;
};

function Flag({ children }: { children?: ReactNode }) {
  return (
    <span className="inline-flex items-center gap-1 text-amber-200 font-bold">
      ⚠️ {children}
    </span>
  );
}

export default function AdminMatchingReport({
  report,
  criteria = [],
  documents = [],
  followUp = {},
  onFollowUp,
  onSaveFollowUp,
  savingFollowUp = false,
}: {
  report?: AdminReport | null;
  criteria?: CheckGroup[];
  documents?: CheckGroup[];
  followUp?: FollowUpMap;
  onFollowUp?: (key: string, patch: FollowUpItem) => void;
  onSaveFollowUp?: () => void;
  savingFollowUp?: boolean;
}) {
  if (!report) return null;
  const header = report.header || {};
  const diagnostic = report.diagnostic || {};
  const guideline = report.guideline || [];
  const alerts = report.alerts || {};

  return (
    <div className="space-y-5">
      <div className="bg-slate-900/50 border border-slate-700/50 rounded-2xl p-4">
        <p className="text-sm font-bold text-slate-300 uppercase tracking-wide">
          Synthèse
        </p>
        <p className="text-white font-semibold mt-2">
          {header.classified_count ?? 0} université
          {(header.classified_count || 0) > 1 ? "s" : ""} classée
          {(header.classified_count || 0) > 1 ? "s" : ""}
          {header.excluded_count
            ? ` · ${header.excluded_count} exclue${header.excluded_count > 1 ? "s" : ""}`
            : ""}
        </p>
        <p className="text-sm text-slate-300 mt-1">
          Formule recommandée :{" "}
          <span className="text-white font-bold">
            {header.recommended_formula?.label || "à préciser"}
          </span>
        </p>
        <p className="text-sm text-slate-300 mt-1">
          Formule achetée :{" "}
          <span className="text-white font-bold">
            {header.purchased_formula?.label || "à préciser"}
          </span>
          {header.formula_mismatch ? (
            <>
              {" "}
              <Flag>écart recommandée / achetée</Flag>
            </>
          ) : null}
        </p>
        <p className="text-sm text-slate-400 mt-1">
          Complétude du dossier :{" "}
          {header.completeness_pct != null
            ? `${header.completeness_pct} %`
            : "à préciser"}
        </p>
        {header.mix ? (
          <p className="text-sm text-slate-400 mt-1">
            Mix : {header.mix.safety} sûre(s) · {header.mix.match} réaliste(s) ·{" "}
            {header.mix.reach} ambitieuse(s)
          </p>
        ) : null}
        {header.best_match ? (
          <p className="text-sm text-slate-400 mt-1">
            Meilleur match : {header.best_match.name} (
            {header.best_match.score}/100, {header.best_match.category})
          </p>
        ) : (
          <p className="text-sm text-amber-300 mt-1">
            Aucun match exploitable avec les données actuelles.
          </p>
        )}
        {report.inconsistency_flag ? (
          <p className="text-sm text-amber-200 mt-3">
            ⚠️ Incohérence bloquante : appeler avant tout envoi au client.
          </p>
        ) : null}
      </div>

      <div className="bg-slate-900/40 border border-violet-700/40 rounded-2xl p-4">
        <p className="text-sm font-bold text-violet-200 uppercase tracking-wide">
          Diagnostic du dossier
        </p>
        <p className="text-white mt-2">
          Facteur limitant :{" "}
          <span className="font-bold">
            {FACTOR_LABELS[diagnostic.limiting_factor || ""] ||
              diagnostic.limiting_factor ||
              "à préciser"}
          </span>
        </p>
        {diagnostic.limiting_factor_note ? (
          <p className="text-sm text-slate-300 mt-1">
            {diagnostic.limiting_factor_note}
          </p>
        ) : null}
        {diagnostic.top_actions?.length ? (
          <ol className="mt-3 space-y-1 text-sm text-slate-200 list-decimal pl-5">
            {diagnostic.top_actions.map((action: string) => (
              <li key={action}>{action}</li>
            ))}
          </ol>
        ) : null}
        {diagnostic.inconsistencies?.length ? (
          <ul className="mt-3 space-y-1 text-sm text-amber-100">
            {diagnostic.inconsistencies.map((row: FieldNote) => (
              <li key={`${row.field}-${row.note}`}>
                {row.blocking ? "⚠️ " : ""}
                {row.field ? `${row.field} — ` : ""}
                {row.note}
              </li>
            ))}
          </ul>
        ) : null}
      </div>

      <div className="bg-slate-900/40 border border-slate-700/50 rounded-2xl p-4 overflow-x-auto">
        <p className="text-sm font-bold text-slate-300 uppercase tracking-wide mb-3">
          Guideline — fait / reste à faire
        </p>
        <table className="w-full text-sm text-left">
          <thead>
            <tr className="text-[11px] uppercase tracking-wide text-slate-500">
              <th className="pb-2 pr-3 font-bold">Étape</th>
              <th className="pb-2 pr-3 font-bold">Statut</th>
              <th className="pb-2 font-bold">Action conseiller</th>
            </tr>
          </thead>
          <tbody>
            {guideline.map((row: GuidelineRow) => (
              <tr
                key={row.step}
                className="border-t border-slate-700/60 align-top"
              >
                <td className="py-2 pr-3 text-white font-semibold whitespace-nowrap">
                  {row.step}
                </td>
                <td className="py-2 pr-3">
                  <span
                    className={`inline-flex px-2 py-0.5 rounded-md border text-[11px] font-bold ${
                      STATUS_CLASS[row.status || "a_faire"] || STATUS_CLASS.a_faire
                    }`}
                  >
                    {STATUS_LABELS[row.status || "a_faire"] || row.status}
                  </span>
                </td>
                <td className="py-2 text-slate-300">
                  {row.step === "Vérification des critères" ? (
                    <CheckGroups
                      section="criteria"
                      groups={criteria}
                      followUp={followUp}
                      onFollowUp={onFollowUp}
                    />
                  ) : row.step === "Documents" ? (
                    <CheckGroups
                      section="documents"
                      groups={documents}
                      followUp={followUp}
                      onFollowUp={onFollowUp}
                    />
                  ) : (
                    row.action
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {onSaveFollowUp ? (
          <button
            type="button"
            onClick={onSaveFollowUp}
            disabled={savingFollowUp}
            className="mt-3 px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-sm font-bold disabled:opacity-50"
          >
            {savingFollowUp ? "Enregistrement..." : "Enregistrer le suivi"}
          </button>
        ) : null}
      </div>

      <div className="bg-slate-900/40 border border-amber-700/40 rounded-2xl p-4 space-y-3">
        <p className="text-sm font-bold text-amber-200 uppercase tracking-wide">
          Alertes et points de vigilance
        </p>
        {alerts.blocking_fields?.length ? (
          <div>
            <p className="text-xs font-bold uppercase tracking-wide text-rose-300">
              Champs bloquants
            </p>
            <ul className="mt-1 text-sm text-slate-200 space-y-1">
              {alerts.blocking_fields.map((row: FieldNote) => (
                <li key={row.field}>
                  ⚠️ {row.field} — {row.note}
                </li>
              ))}
            </ul>
          </div>
        ) : null}
        {alerts.call_clarifications?.length ? (
          <div>
            <p className="text-xs font-bold uppercase tracking-wide text-amber-300">
              À clarifier à l’appel
            </p>
            <ul className="mt-1 text-sm text-slate-200 space-y-1">
              {alerts.call_clarifications.map((note: string) => (
                <li key={note}>• {note}</li>
              ))}
            </ul>
          </div>
        ) : null}
        {alerts.university_risks?.length ? (
          <div>
            <p className="text-xs font-bold uppercase tracking-wide text-amber-300">
              Risques par université
            </p>
            <ul className="mt-1 text-sm text-slate-200 space-y-1">
              {dedupedRisks(alerts.university_risks).map((row: UniversityRisk) => (
                <li key={`${row.university}-${row.risk}`}>
                  {row.university} — {row.risk}
                </li>
              ))}
            </ul>
          </div>
        ) : null}
      </div>
    </div>
  );
}
