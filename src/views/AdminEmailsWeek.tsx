"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useAdminAuth } from "../context/AdminAuthContext";
import { useAdminI18n } from "../context/AdminI18nContext";
import AdminShell from "../components/AdminShell";
import { adminSupabase } from "../lib/supabase";
import { errorMessage } from "../lib/request";
import type { EmailWeekItem, EmailWeekReport } from "../lib/adminEmailWeek";

async function authedFetch(path: string) {
  const {
    data: { session },
  } = await adminSupabase.auth.getSession();
  if (!session?.access_token) throw new Error("SESSION");
  return fetch(path, {
    headers: { Authorization: `Bearer ${session.access_token}` },
  });
}

function formatWhen(iso: string, lang: string) {
  try {
    return new Date(iso).toLocaleString(
      lang === "zh" ? "zh-CN" : lang === "en" ? "en-GB" : "fr-FR",
      {
        day: "2-digit",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      },
    );
  } catch {
    return iso;
  }
}

function EmailList({
  title,
  items,
  empty,
  onOpen,
  ficheLabel,
  awaitingLabel,
  openLabel,
}: {
  title: string;
  items: EmailWeekItem[];
  empty: string;
  onOpen: (item: EmailWeekItem) => void;
  ficheLabel: string;
  awaitingLabel?: (days: number) => string;
  openLabel: string;
}) {
  return (
    <section className="rounded-2xl border border-slate-700/60 bg-slate-800/40 p-5">
      <h3 className="text-white font-bold mb-3">
        {title}{" "}
        <span className="text-slate-400 font-medium">({items.length})</span>
      </h3>
      {items.length === 0 ? (
        <p className="text-sm text-slate-500">{empty}</p>
      ) : (
        <ul className="space-y-2 max-h-[32rem] overflow-y-auto">
          {items.map((item) => (
            <li
              key={item.id}
              className="flex gap-2 items-stretch border border-slate-700/50 rounded-xl bg-slate-900/40"
            >
              <button
                type="button"
                onClick={() => onOpen(item)}
                className="flex-1 text-left px-3 py-2.5 hover:bg-slate-800/60 rounded-xl transition-colors"
                title={openLabel}
              >
                <p className="text-slate-100 font-semibold text-sm">
                  {item.name}
                  <span className="ml-2 text-xs font-medium text-slate-400">
                    {item.direction === "in" ? "📥" : "📤"}
                  </span>
                </p>
                <p className="text-blue-200/90 text-sm font-medium mt-0.5 line-clamp-1">
                  {item.subject}
                </p>
                <p className="text-slate-400 text-xs mt-0.5">
                  {[item.email, item.statut, item.formule]
                    .filter(Boolean)
                    .join(" · ")}
                </p>
                {item.preview ? (
                  <p className="text-slate-500 text-xs mt-1 line-clamp-2">
                    {item.preview}
                  </p>
                ) : null}
                {typeof item.awaitingDays === "number" && awaitingLabel ? (
                  <p className="text-amber-300/90 text-xs mt-1 font-semibold">
                    {awaitingLabel(item.awaitingDays)}
                  </p>
                ) : null}
              </button>
              <div className="flex items-center pr-2">
                <Link
                  href={`/admin/dashboard?contact=${encodeURIComponent(item.contactId)}`}
                  className="whitespace-nowrap px-3 py-2 rounded-lg text-xs font-bold bg-slate-700 text-slate-100 hover:bg-slate-600 transition-colors"
                  onClick={(e) => e.stopPropagation()}
                >
                  {ficheLabel}
                </Link>
              </div>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

function EmailModal({
  item,
  lang,
  onClose,
  ficheLabel,
  closeLabel,
  receivedLabel,
  sentLabel,
}: {
  item: EmailWeekItem;
  lang: string;
  onClose: () => void;
  ficheLabel: string;
  closeLabel: string;
  receivedLabel: string;
  sentLabel: string;
}) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70"
      onClick={onClose}
    >
      <div
        className="w-full max-w-2xl max-h-[85vh] overflow-y-auto rounded-2xl border border-slate-600 bg-slate-900 shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="sticky top-0 flex justify-between items-start gap-3 px-5 py-4 border-b border-slate-700 bg-slate-900">
          <div>
            <p className="text-xs font-bold uppercase tracking-wide text-slate-400">
              {item.direction === "in" ? receivedLabel : sentLabel} ·{" "}
              {formatWhen(item.sentAt, lang)}
            </p>
            <h2 className="text-lg font-bold text-white mt-1">{item.subject}</h2>
            <p className="text-sm text-slate-300 mt-1">
              {item.name}
              {item.email ? ` · ${item.email}` : ""}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-slate-400 hover:text-white px-2 py-1 rounded-lg"
          >
            ✕
          </button>
        </div>
        <div className="px-5 py-4">
          <p className="text-xs text-slate-500 mb-3">
            {item.fromEmail ? `De : ${item.fromEmail}` : null}
            {item.fromEmail && item.toEmail ? " · " : null}
            {item.toEmail ? `À : ${item.toEmail}` : null}
          </p>
          <pre className="whitespace-pre-wrap text-sm text-slate-100 leading-relaxed font-sans">
            {item.body || "—"}
          </pre>
        </div>
        <div className="sticky bottom-0 flex flex-wrap gap-2 px-5 py-4 border-t border-slate-700 bg-slate-900">
          <Link
            href={`/admin/dashboard?contact=${encodeURIComponent(item.contactId)}`}
            className="px-4 py-2 rounded-xl text-sm font-bold bg-blue-600 text-white hover:bg-blue-500"
          >
            {ficheLabel}
          </Link>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-sm font-bold bg-slate-700 text-slate-200 hover:bg-slate-600"
          >
            {closeLabel}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function AdminEmailsWeek() {
  const { user, signOut } = useAdminAuth();
  const { t, lang } = useAdminI18n();
  const [report, setReport] = useState<EmailWeekReport | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [open, setOpen] = useState<EmailWeekItem | null>(null);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      setLoading(true);
      setError("");
      try {
        const response = await authedFetch("/api/admin/emails-week");
        const data = await response.json();
        if (cancelled) return;
        if (!response.ok || !data.success) {
          setError(data.error || t("emailsWeek.loadFail"));
          setReport(null);
          return;
        }
        setReport(data.report as EmailWeekReport);
      } catch (err) {
        if (cancelled) return;
        const message = errorMessage(err);
        setError(
          message === "SESSION" ? t("sessionExpired") : t("emailsWeek.loadFail"),
        );
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    load();
    return () => {
      cancelled = true;
    };
  }, [t]);

  return (
    <AdminShell user={user} onLogout={signOut}>
      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-white">{t("emailsWeek.title")}</h2>
          <p className="text-slate-400 mt-1">{t("emailsWeek.subtitle")}</p>
          {report ? (
            <p className="text-sm text-slate-500 mt-2">
              {t("emailsWeek.weekRange", {
                start: report.weekStart,
                end: report.weekEnd,
              })}{" "}
              · {t("emailsWeek.timezone")}
            </p>
          ) : null}
        </div>

        {loading ? (
          <p className="text-slate-400">{t("loading")}</p>
        ) : error ? (
          <p className="text-rose-300 bg-rose-500/10 border border-rose-500/30 rounded-xl px-4 py-3">
            {error}
          </p>
        ) : report ? (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
            <EmailList
              title={t("emailsWeek.received")}
              items={report.received}
              empty={t("emailsWeek.empty")}
              onOpen={setOpen}
              ficheLabel={t("emailsWeek.openFiche")}
              openLabel={t("emailsWeek.openMail")}
            />
            <EmailList
              title={t("emailsWeek.sent")}
              items={report.sent}
              empty={t("emailsWeek.empty")}
              onOpen={setOpen}
              ficheLabel={t("emailsWeek.openFiche")}
              openLabel={t("emailsWeek.openMail")}
            />
            <EmailList
              title={t("emailsWeek.awaiting")}
              items={report.awaiting}
              empty={t("emailsWeek.emptyAwaiting")}
              onOpen={setOpen}
              ficheLabel={t("emailsWeek.openFiche")}
              openLabel={t("emailsWeek.openMail")}
              awaitingLabel={(days) =>
                t("emailsWeek.awaitingSince", { days: String(days) })
              }
            />
          </div>
        ) : null}
      </div>

      {open ? (
        <EmailModal
          item={open}
          lang={lang}
          onClose={() => setOpen(null)}
          ficheLabel={t("emailsWeek.openFiche")}
          closeLabel={t("close")}
          receivedLabel={t("emailsWeek.receivedShort")}
          sentLabel={t("emailsWeek.sentShort")}
        />
      ) : null}
    </AdminShell>
  );
}
