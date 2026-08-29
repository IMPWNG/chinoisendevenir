"use client";

const STATUS_LABELS = {
  fait: "Fait",
  en_cours: "En cours",
  a_faire: "À faire",
};

const STATUS_CLASS = {
  fait: "text-emerald-200 border-emerald-500/40 bg-emerald-500/10",
  en_cours: "text-cyan-200 border-cyan-500/40 bg-cyan-500/10",
  a_faire: "text-amber-200 border-amber-500/40 bg-amber-500/10",
};

const FACTOR_LABELS = {
  langue: "Langue",
  budget: "Budget",
  documents: "Documents",
  age: "Âge",
  academique: "Niveau académique",
};

function Flag({ children }) {
  return (
    <span className="inline-flex items-center gap-1 text-amber-200 font-bold">
      ⚠️ {children}
    </span>
  );
}

export default function AdminMatchingReport({ report }) {
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
            {FACTOR_LABELS[diagnostic.limiting_factor] ||
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
            {diagnostic.top_actions.map((action) => (
              <li key={action}>{action}</li>
            ))}
          </ol>
        ) : null}
        {diagnostic.inconsistencies?.length ? (
          <ul className="mt-3 space-y-1 text-sm text-amber-100">
            {diagnostic.inconsistencies.map((row) => (
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
            {guideline.map((row) => (
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
                      STATUS_CLASS[row.status] || STATUS_CLASS.a_faire
                    }`}
                  >
                    {STATUS_LABELS[row.status] || row.status}
                  </span>
                </td>
                <td className="py-2 text-slate-300">{row.action}</td>
              </tr>
            ))}
          </tbody>
        </table>
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
              {alerts.blocking_fields.map((row) => (
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
              {alerts.call_clarifications.map((note) => (
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
              {alerts.university_risks.map((row) => (
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
