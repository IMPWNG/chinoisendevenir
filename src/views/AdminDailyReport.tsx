"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAdminAuth } from "../context/AdminAuthContext";
import { useAdminI18n } from "../context/AdminI18nContext";
import AdminShell from "../components/AdminShell";
import { adminSupabase } from "../lib/supabase";
import { errorMessage } from "../lib/request";
import type { DailyReport, DayTotals, ReportPerson } from "../lib/dailyReportShared";
import { formatDelta, shanghaiDayString } from "../lib/dailyReportShared";

async function authedFetch(path: string) {
  const {
    data: { session },
  } = await adminSupabase.auth.getSession();
  if (!session?.access_token) throw new Error("SESSION");
  return fetch(path, {
    headers: { Authorization: `Bearer ${session.access_token}` },
  });
}

function Metric({
  label,
  value,
  delta,
}: {
  label: string;
  value: number;
  delta?: number;
}) {
  const d = typeof delta === "number" ? delta : 0;
  const color =
    d > 0 ? "text-emerald-300" : d < 0 ? "text-rose-300" : "text-slate-400";
  return (
    <div className="rounded-2xl border border-slate-700/60 bg-slate-800/50 p-4">
      <p className="text-xs uppercase tracking-wide text-slate-400 font-bold">
        {label}
      </p>
      <p className="text-3xl font-bold text-white mt-2">{value}</p>
      <p className={`text-sm mt-1 font-semibold ${color}`}>
        vs veille {formatDelta(d)}
      </p>
    </div>
  );
}

function PersonList({
  title,
  people,
}: {
  title: string;
  people: ReportPerson[];
}) {
  return (
    <section className="rounded-2xl border border-slate-700/60 bg-slate-800/40 p-5">
      <h3 className="text-white font-bold mb-3">
        {title}{" "}
        <span className="text-slate-400 font-medium">({people.length})</span>
      </h3>
      {people.length === 0 ? (
        <p className="text-sm text-slate-500">Aucun</p>
      ) : (
        <ul className="space-y-2 max-h-72 overflow-y-auto">
          {people.map((p) => (
            <li
              key={`${title}-${p.id}-${p.note || ""}`}
              className="text-sm border border-slate-700/50 rounded-xl px-3 py-2 bg-slate-900/40"
            >
              <p className="text-slate-100 font-semibold">{p.name}</p>
              <p className="text-slate-400 text-xs">
                {[p.email, p.statut, p.formule].filter(Boolean).join(" · ")}
              </p>
              {p.note ? (
                <p className="text-slate-500 text-xs mt-1">{p.note}</p>
              ) : null}
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

function EvolutionChart({
  series,
  metric,
  label,
}: {
  series: DayTotals[];
  metric: keyof Omit<DayTotals, "date">;
  label: string;
}) {
  const values = series.map((row) => Number(row[metric] || 0));
  const max = Math.max(1, ...values);
  const width = 560;
  const height = 160;
  const padX = 28;
  const padY = 20;
  const innerW = width - padX * 2;
  const innerH = height - padY * 2;
  const points = values.map((v, i) => {
    const x =
      padX + (values.length <= 1 ? innerW / 2 : (i / (values.length - 1)) * innerW);
    const y = padY + innerH - (v / max) * innerH;
    return { x, y, v, date: series[i]?.date || "" };
  });
  const line = points.map((p) => `${p.x},${p.y}`).join(" ");

  return (
    <div className="rounded-2xl border border-slate-700/60 bg-slate-800/40 p-4">
      <p className="text-sm font-bold text-slate-200 mb-2">{label}</p>
      <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-40">
        <polyline
          fill="none"
          stroke="#38bdf8"
          strokeWidth="3"
          points={line}
        />
        {points.map((p) => (
          <g key={p.date}>
            <circle cx={p.x} cy={p.y} r="4" fill="#7dd3fc" />
            <text
              x={p.x}
              y={height - 4}
              textAnchor="middle"
              fontSize="9"
              fill="#94a3b8"
            >
              {p.date.slice(5)}
            </text>
            <text
              x={p.x}
              y={Math.max(12, p.y - 8)}
              textAnchor="middle"
              fontSize="10"
              fill="#e2e8f0"
            >
              {p.v}
            </text>
          </g>
        ))}
      </svg>
    </div>
  );
}

export default function AdminDailyReport() {
  const { user, signOut } = useAdminAuth();
  const { t } = useAdminI18n();
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialDay = searchParams.get("day") || shanghaiDayString();
  const [day, setDay] = useState(initialDay);
  const [report, setReport] = useState<DailyReport | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const load = async (targetDay: string) => {
    setLoading(true);
    setError("");
    try {
      const response = await authedFetch(
        `/api/admin/daily-report?day=${encodeURIComponent(targetDay)}&history=14`,
      );
      const payload = await response.json();
      if (!response.ok) throw new Error(payload.error || "Lecture impossible");
      setReport(payload.report as DailyReport);
    } catch (err: unknown) {
      setError(
        errorMessage(err) === "SESSION" ? t("sessionExpired") : errorMessage(err),
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load(day);
    // eslint-disable-next-line react-hooks/set-state-in-effect, react-hooks/exhaustive-deps
  }, [day]);

  const handleLogout = async () => {
    await signOut();
    router.push("/admin/login");
  };

  const pipelineEntries = useMemo(() => {
    if (!report) return [];
    return Object.entries(report.pipeline)
      .filter(([, n]) => n > 0)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 12);
  }, [report]);

  return (
    <AdminShell user={user} onLogout={handleLogout}>
      <div className="flex flex-col gap-6">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold text-white">
              {t("report.title")}
            </h2>
            <p className="text-sm text-slate-400 mt-1">{t("report.subtitle")}</p>
          </div>
          <label className="text-sm text-slate-300">
            {t("report.day")}
            <input
              type="date"
              value={day}
              onChange={(e) => {
                setDay(e.target.value);
                router.replace(`/admin/rapport?day=${e.target.value}`);
              }}
              className="ml-3 px-3 py-2 rounded-xl bg-slate-800 border border-slate-600 text-white"
            />
          </label>
        </div>

        {error ? (
          <p className="text-rose-300 bg-rose-500/10 border border-rose-500/30 rounded-xl px-4 py-3">
            {error}
          </p>
        ) : null}

        {loading || !report ? (
          <p className="text-slate-400">{t("loading")}</p>
        ) : (
          <>
            <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-5 gap-3">
              <Metric
                label={t("report.newContacts")}
                value={report.today.newContacts}
                delta={report.delta.newContacts}
              />
              <Metric
                label={t("report.formules")}
                value={report.today.formulesChoisies}
                delta={report.delta.formulesChoisies}
              />
              <Metric
                label={t("report.paid")}
                value={report.today.clientPaye}
                delta={report.delta.clientPaye}
              />
              <Metric
                label={t("report.calls")}
                value={report.today.appels}
                delta={report.delta.appels}
              />
              <Metric
                label={t("report.replies")}
                value={report.today.reponsesClient}
                delta={report.delta.reponsesClient}
              />
              <Metric
                label={t("report.emailsIn")}
                value={report.today.emailsIn}
                delta={report.delta.emailsIn}
              />
              <Metric
                label={t("report.emailsOut")}
                value={report.today.emailsOut}
                delta={report.delta.emailsOut}
              />
              <Metric
                label={t("report.whatsapp")}
                value={report.today.whatsappOut}
                delta={report.delta.whatsappOut}
              />
              <Metric
                label={t("report.matchings")}
                value={report.today.matchings}
                delta={report.delta.matchings}
              />
              <Metric
                label={t("report.lost")}
                value={report.today.prospectPerdu}
                delta={report.delta.prospectPerdu}
              />
            </div>

            <p className="text-sm text-slate-400">
              {t("report.formuleSplit", {
                f1: report.today.formulesF1,
                f2: report.today.formulesF2,
                f3: report.today.formulesF3,
              })}
            </p>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <EvolutionChart
                series={report.series}
                metric="newContacts"
                label={t("report.chartNew")}
              />
              <EvolutionChart
                series={report.series}
                metric="formulesChoisies"
                label={t("report.chartFormules")}
              />
              <EvolutionChart
                series={report.series}
                metric="appels"
                label={t("report.chartCalls")}
              />
              <EvolutionChart
                series={report.series}
                metric="reponsesClient"
                label={t("report.chartReplies")}
              />
              <EvolutionChart
                series={report.series}
                metric="emailsIn"
                label={t("report.chartEmailsIn")}
              />
              <EvolutionChart
                series={report.series}
                metric="clientPaye"
                label={t("report.chartPaid")}
              />
            </div>

            <h3 className="text-xl font-bold text-white mt-2">
              {t("report.dayLists")}
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
              <PersonList
                title={t("report.newContacts")}
                people={report.lists.newContacts}
              />
              <PersonList
                title={t("report.formules")}
                people={report.lists.formulesChoisies}
              />
              <PersonList title={t("report.paid")} people={report.lists.clientPaye} />
              <PersonList title={t("report.calls")} people={report.lists.appels} />
              <PersonList
                title={t("report.replies")}
                people={report.lists.reponsesClient}
              />
              <PersonList title={t("report.lost")} people={report.lists.prospectPerdu} />
            </div>

            <h3 className="text-xl font-bold text-white mt-2">
              {t("report.priorities")}
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
              <PersonList
                title={t("report.unassigned")}
                people={report.priorities.unassigned}
              />
              <PersonList
                title={t("report.noFirstTouch")}
                people={report.priorities.noFirstTouch}
              />
              <PersonList
                title={t("report.unreadInbox")}
                people={report.priorities.unreadInbox}
              />
              <PersonList
                title={t("report.awaitingPayment")}
                people={report.priorities.attentePaiement}
              />
              <PersonList
                title={t("report.formulesWaiting")}
                people={report.priorities.formulesSansReponse}
              />
              <PersonList
                title={t("report.paidNoMatching")}
                people={report.priorities.payeSansMatching}
              />
              <PersonList
                title={t("report.priorityFlag")}
                people={report.priorities.prioritaires}
              />
            </div>

            <section className="rounded-2xl border border-slate-700/60 bg-slate-800/40 p-5">
              <h3 className="text-white font-bold mb-3">{t("report.pipeline")}</h3>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
                {pipelineEntries.map(([statut, count]) => (
                  <div
                    key={statut}
                    className="rounded-xl bg-slate-900/50 border border-slate-700/50 px-3 py-2"
                  >
                    <p className="text-xs text-slate-400">{statut}</p>
                    <p className="text-lg font-bold text-white">{count}</p>
                  </div>
                ))}
              </div>
            </section>
          </>
        )}
      </div>
    </AdminShell>
  );
}
