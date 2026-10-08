"use client";

import { useEffect, useState } from "react";
import { useAdminI18n } from "../context/AdminI18nContext";
import { adminSupabase } from "../lib/supabase";
import { shanghaiDayString } from "../lib/dailyReportShared";
import { isMissingDayTasksTable, type DayTaskSource } from "../lib/dayTasks";

type TaskRow = {
  id: string;
  contact_id: string;
  task: string;
  source: DayTaskSource;
  done: boolean;
  created_by?: string | null;
};

type NameRow = { id: string; prenom?: string | null; nom?: string | null };

export default function AdminDayTasks({
  contacts,
  refreshKey = 0,
  onOpenContact,
}: {
  contacts: NameRow[];
  refreshKey?: number;
  onOpenContact: (contactId: string) => void;
}) {
  const { t } = useAdminI18n();
  const [rows, setRows] = useState<TaskRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;
    async function load() {
      setLoading(true);
      setError("");
      const { data, error: queryError } = await adminSupabase
        .from("day_tasks")
        .select("id, contact_id, task, source, done, created_by")
        .eq("day", shanghaiDayString())
        .order("created_at", { ascending: true });
      if (cancelled) return;
      if (queryError) {
        setRows([]);
        setError(
          isMissingDayTasksTable(queryError.message)
            ? t("dayTasks.missing")
            : t("dayTasks.loadFail"),
        );
      } else {
        setRows((data || []) as TaskRow[]);
      }
      setLoading(false);
    }
    load();
    return () => {
      cancelled = true;
    };
  }, [refreshKey, t]);

  const names = new Map(
    contacts.map((c) => [c.id, `${c.prenom || ""} ${c.nom || ""}`.trim()]),
  );

  const ordered = [...rows].sort(
    (a, b) => Number(a.done) - Number(b.done),
  );

  const toggleDone = async (row: TaskRow) => {
    const next = !row.done;
    setRows((prev) =>
      prev.map((item) => (item.id === row.id ? { ...item, done: next } : item)),
    );
    const { error: updateError } = await adminSupabase
      .from("day_tasks")
      .update({ done: next })
      .eq("id", row.id);
    if (updateError) {
      setRows((prev) =>
        prev.map((item) =>
          item.id === row.id ? { ...item, done: row.done } : item,
        ),
      );
    }
  };

  return (
    <div className="mb-6 rounded-2xl border border-amber-500/30 bg-slate-800/50 p-5">
      <h2 className="text-lg font-bold text-white">
        {t("dayTasks.title")}
        {!loading && !error ? (
          <span className="ml-2 text-slate-400 font-medium text-base">
            ({rows.filter((row) => !row.done).length})
          </span>
        ) : null}
      </h2>
      <p className="text-sm text-slate-400 mt-1 mb-4">{t("dayTasks.hint")}</p>
      {loading ? (
        <p className="text-sm text-slate-400">{t("loading")}</p>
      ) : error ? (
        <p className="text-sm text-rose-300">{error}</p>
      ) : ordered.length === 0 ? (
        <p className="text-sm text-slate-500">{t("dayTasks.empty")}</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-xs uppercase tracking-wide text-slate-400">
                <th className="py-2 pr-3 font-bold">{t("dayTasks.colDone")}</th>
                <th className="py-2 pr-3 font-bold">{t("dayTasks.colStudent")}</th>
                <th className="py-2 pr-3 font-bold">{t("dayTasks.colTask")}</th>
                <th className="py-2 font-bold">{t("dayTasks.colBy")}</th>
              </tr>
            </thead>
            <tbody>
              {ordered.map((row) => {
                const name = names.get(row.contact_id) || row.contact_id;
                return (
                  <tr
                    key={row.id}
                    className={`border-t border-slate-700/60 ${row.done ? "opacity-50" : ""}`}
                  >
                    <td className="py-2.5 pr-3">
                      <input
                        type="checkbox"
                        checked={row.done}
                        aria-label={t("dayTasks.colDone")}
                        onChange={() => toggleDone(row)}
                        className="h-4 w-4 rounded border-slate-500 bg-slate-700 text-amber-400 cursor-pointer"
                      />
                    </td>
                    <td className="py-2.5 pr-3">
                      <button
                        type="button"
                        onClick={() => onOpenContact(row.contact_id)}
                        className="font-semibold text-white hover:text-blue-300 text-left"
                      >
                        {name}
                      </button>
                    </td>
                    <td
                      className={`py-2.5 pr-3 text-slate-200 ${row.done ? "line-through" : ""}`}
                    >
                      {row.task}
                    </td>
                    <td className="py-2.5 text-slate-400 whitespace-nowrap">
                      {row.source === "grokbot"
                        ? t("dayTasks.sourceGrokbot")
                        : row.created_by || "—"}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
