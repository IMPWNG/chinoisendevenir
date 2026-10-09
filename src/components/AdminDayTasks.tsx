"use client";

import { useEffect, useState } from "react";
import { useAdminI18n } from "../context/AdminI18nContext";
import { adminSupabase } from "../lib/supabase";
import { shanghaiDayString } from "../lib/dailyReportShared";
import {
  cleanAuthorEmail,
  dayTaskListFilter,
  isMissingDayTasksTable,
  type DayTaskSource,
} from "../lib/dayTasks";

type TaskRow = {
  id: string;
  contact_id: string;
  task: string;
  source: DayTaskSource;
  done: boolean;
  created_by?: string | null;
  done_by?: string | null;
};

type NameRow = { id: string; prenom?: string | null; nom?: string | null };

export default function AdminDayTasks({
  contacts,
  refreshKey = 0,
  canDelete = false,
  showWhatsapp = false,
  actorEmail,
  onOpenContact,
}: {
  contacts: NameRow[];
  refreshKey?: number;
  canDelete?: boolean;
  showWhatsapp?: boolean;
  actorEmail?: string | null;
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
        .select("id, contact_id, task, source, done, created_by, done_by")
        .or(dayTaskListFilter(shanghaiDayString()))
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

  const visible = showWhatsapp ? rows : rows.filter((row) => row.source !== "whatsapp");
  const ordered = [...visible].sort(
    (a, b) => Number(a.done) - Number(b.done),
  );

  const toggleDone = async (row: TaskRow) => {
    const next = !row.done;
    const doneBy = next ? cleanAuthorEmail(actorEmail) || null : null;
    setRows((prev) =>
      prev.map((item) =>
        item.id === row.id ? { ...item, done: next, done_by: doneBy } : item,
      ),
    );
    const { error: updateError } = await adminSupabase
      .from("day_tasks")
      .update({ done: next, done_by: doneBy })
      .eq("id", row.id);
    if (updateError) {
      setRows((prev) =>
        prev.map((item) =>
          item.id === row.id
            ? { ...item, done: row.done, done_by: row.done_by }
            : item,
        ),
      );
    }
  };

  const deleteTask = async (row: TaskRow) => {
    if (!canDelete) return;
    if (!confirm(t("dayTasks.deleteConfirm"))) return;
    setRows((prev) => prev.filter((item) => item.id !== row.id));
    setError("");
    const { error: deleteError } = await adminSupabase
      .from("day_tasks")
      .delete()
      .eq("id", row.id);
    if (deleteError) {
      setRows((prev) =>
        prev.some((item) => item.id === row.id) ? prev : [...prev, row],
      );
      setError(t("dayTasks.deleteFail"));
    }
  };

  return (
    <div className="mb-6 rounded-2xl border border-amber-500/30 bg-slate-800/50 p-5">
      <h2 className="text-lg font-bold text-white">
        {t("dayTasks.title")}
        {!loading && !error ? (
          <span className="ml-2 text-slate-400 font-medium text-base">
            ({visible.filter((row) => !row.done).length})
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
                <th className="py-2 pr-3 font-bold">{t("dayTasks.colBy")}</th>
                {canDelete ? <th className="py-2 font-bold" /> : null}
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
                    <td className="py-2.5 pr-3 text-slate-400 whitespace-nowrap">
                      {row.done && row.done_by
                        ? t("dayTasks.doneBy", { email: row.done_by })
                        : row.source === "grokbot"
                          ? t("dayTasks.sourceGrokbot")
                          : row.source === "whatsapp"
                            ? t("dayTasks.sourceWhatsapp")
                            : row.created_by || "—"}
                    </td>
                    {canDelete ? (
                      <td className="py-2.5 text-right">
                        <button
                          type="button"
                          onClick={() => deleteTask(row)}
                          className="text-red-400 hover:text-red-300 hover:bg-red-500/20 px-3 py-1 rounded-lg text-sm font-semibold"
                        >
                          {t("dayTasks.delete")}
                        </button>
                      </td>
                    ) : null}
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
