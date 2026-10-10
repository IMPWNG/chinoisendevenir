"use client";

import { useEffect, useState } from "react";
import { useAdminI18n } from "../context/AdminI18nContext";
import { adminSupabase } from "../lib/supabase";
import { errorMessage } from "../lib/request";
import type { WhatsappInboxItem, WhatsappInboxReport } from "../lib/whatsappInbox";

async function authedFetch(path: string, options: RequestInit = {}) {
  const {
    data: { session },
  } = await adminSupabase.auth.getSession();
  if (!session?.access_token) throw new Error("SESSION");
  return fetch(path, {
    ...options,
    headers: {
      Authorization: `Bearer ${session.access_token}`,
      ...(options.body ? { "Content-Type": "application/json" } : {}),
      ...(options.headers || {}),
    },
    cache: "no-store",
  });
}

function formatWhen(iso: string, lang: string) {
  try {
    return new Date(iso).toLocaleString(
      lang === "zh" ? "zh-CN" : lang === "en" ? "en-GB" : "fr-FR",
      { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" },
    );
  } catch {
    return iso;
  }
}

function MessageModal({
  item,
  lang,
  onClose,
  onOpenFiche,
}: {
  item: WhatsappInboxItem;
  lang: string;
  onClose: () => void;
  onOpenFiche: (contactId: string) => void;
}) {
  const { t } = useAdminI18n();
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70" onClick={onClose}>
      <div
        className="w-full max-w-2xl max-h-[85vh] overflow-y-auto rounded-2xl border border-slate-600 bg-slate-900 shadow-xl"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="sticky top-0 flex justify-between items-start gap-3 px-5 py-4 border-b border-slate-700 bg-slate-900">
          <div>
            <p className="text-xs font-bold uppercase tracking-wide text-slate-400">
              {item.direction === "in" ? t("emailsWeek.receivedShort") : t("emailsWeek.sentShort")}
              {" · "}
              {formatWhen(item.sentAt, lang)}
            </p>
            <h2 className="text-lg font-bold text-white mt-1">{item.name}</h2>
            {item.phone ? <p className="text-sm text-slate-300 mt-1">{item.phone}</p> : null}
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-slate-400 hover:text-white px-2 py-1 rounded-lg text-lg"
            aria-label={t("close")}
          >
            ✕
          </button>
        </div>
        <div className="px-5 py-4">
          <pre className="whitespace-pre-wrap text-sm text-slate-100 leading-relaxed font-sans">
            {item.body || "—"}
          </pre>
        </div>
        <div className="sticky bottom-0 flex flex-wrap gap-2 px-5 py-4 border-t border-slate-700 bg-slate-900">
          <button
            type="button"
            onClick={() => {
              onOpenFiche(item.contactId);
              onClose();
            }}
            className="px-5 py-2.5 rounded-xl text-sm font-bold bg-emerald-600 text-white hover:bg-emerald-500"
          >
            👤 {t("emailsWeek.openFiche")}
          </button>
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2.5 rounded-xl text-sm font-bold bg-slate-700 text-slate-200 hover:bg-slate-600"
          >
            {t("close")}
          </button>
        </div>
      </div>
    </div>
  );
}

function Column({
  title,
  hint,
  items,
  accent,
  onRead,
  onFiche,
  onDismiss,
}: {
  title: string;
  hint: string;
  items: WhatsappInboxItem[];
  accent: "amber" | "sky";
  onRead: (item: WhatsappInboxItem) => void;
  onFiche: (contactId: string) => void;
  onDismiss: (item: WhatsappInboxItem) => void;
}) {
  const { t, lang } = useAdminI18n();
  const border = accent === "amber" ? "border-amber-500/40" : "border-sky-500/40";
  const head = accent === "amber" ? "text-amber-200" : "text-sky-200";
  return (
    <section className={`rounded-2xl border ${border} bg-slate-900/50 p-4 flex-1 min-w-0`}>
      <h3 className={`font-bold text-base ${head}`}>
        {title} <span className="text-slate-400 font-medium">({items.length})</span>
      </h3>
      <p className="text-xs text-slate-400 mt-1 mb-3">{hint}</p>
      {items.length === 0 ? (
        <p className="text-sm text-slate-500">{t("emailsWeek.emptyAwaiting")}</p>
      ) : (
        <ul className="space-y-3 max-h-80 overflow-y-auto pr-1">
          {items.map((item) => (
            <li key={item.id} className="rounded-xl border border-slate-600/60 bg-slate-800/70 p-3">
              <p className="text-white font-semibold text-sm">{item.name}</p>
              <p className="text-slate-500 text-xs mt-0.5">
                {formatWhen(item.sentAt, lang)}
                {` · ${t("emailsWeek.awaitingSince", { days: String(item.awaitingDays) })}`}
              </p>
              {item.preview ? (
                <p className="text-slate-400 text-xs mt-1.5 line-clamp-2">{item.preview}</p>
              ) : null}
              <div className="mt-3 flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => onRead(item)}
                  className="flex-1 min-w-[8rem] px-3 py-2.5 rounded-xl text-sm font-bold bg-emerald-700 text-white hover:bg-emerald-600 shadow-sm"
                >
                  💬 {t("whatsappInbox.openMessage")}
                </button>
                <button
                  type="button"
                  onClick={() => onFiche(item.contactId)}
                  className="flex-1 min-w-[8rem] px-3 py-2.5 rounded-xl text-sm font-bold bg-emerald-600 text-white hover:bg-emerald-500 shadow-sm"
                >
                  👤 {t("emailsWeek.openFiche")}
                </button>
                <button
                  type="button"
                  onClick={() => onDismiss(item)}
                  className="w-full px-3 py-2.5 rounded-xl text-sm font-bold bg-slate-700 text-slate-200 hover:bg-slate-600"
                >
                  {t("emailsWeek.dismiss")}
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

export default function AdminWhatsappInbox({
  refreshKey = 0,
  onOpenContact,
  onSynced,
}: {
  refreshKey?: number;
  onOpenContact: (contactId: string) => void;
  onSynced?: () => void;
}) {
  const { t, lang } = useAdminI18n();
  const [report, setReport] = useState<WhatsappInboxReport | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [open, setOpen] = useState<WhatsappInboxItem | null>(null);
  const [dismissing, setDismissing] = useState("");

  async function dismiss(item: WhatsappInboxItem) {
    if (dismissing || !item.sentAt) return;
    const previous = report;
    setDismissing(item.id);
    setError("");
    setReport((prev) =>
      prev
        ? {
            ...prev,
            needOurReply: prev.needOurReply.filter((row) => row.id !== item.id),
            needStudentReply: prev.needStudentReply.filter((row) => row.id !== item.id),
          }
        : prev,
    );
    if (open?.id === item.id) setOpen(null);
    try {
      const response = await authedFetch("/api/admin/whatsapp-inbox", {
        method: "PATCH",
        body: JSON.stringify({ contactId: item.contactId, sentAt: item.sentAt }),
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok || !data.success) {
        setReport(previous);
        setError(data.error || t("whatsappInbox.dismissFail"));
      }
    } catch (err) {
      setReport(previous);
      const message = errorMessage(err);
      setError(message === "SESSION" ? t("sessionExpired") : t("whatsappInbox.dismissFail"));
    } finally {
      setDismissing("");
    }
  }

  useEffect(() => {
    let cancelled = false;
    async function load() {
      setLoading(true);
      setError("");
      try {
        const response = await authedFetch("/api/admin/whatsapp-inbox");
        const data = await response.json();
        if (cancelled) return;
        if (!response.ok || !data.success) {
          setError(data.error || t("whatsappInbox.loadFail"));
          setReport(null);
          return;
        }
        setReport(data.report as WhatsappInboxReport);
        onSynced?.();
      } catch (err) {
        if (cancelled) return;
        const message = errorMessage(err);
        setError(message === "SESSION" ? t("sessionExpired") : t("whatsappInbox.loadFail"));
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    load();
    return () => {
      cancelled = true;
    };
  }, [t, refreshKey]);

  const total = (report?.needOurReply.length || 0) + (report?.needStudentReply.length || 0);

  return (
    <div className="mb-6 rounded-2xl border border-emerald-500/30 bg-slate-800/50 p-5 shadow-xl">
      <div className="mb-4">
        <h2 className="text-lg font-bold text-white">
          💬 {t("whatsappInbox.homeTitle")}
          {!loading && report ? (
            <span className="ml-2 text-slate-400 font-medium text-base">({total})</span>
          ) : null}
        </h2>
        <p className="text-sm text-slate-400 mt-1">{t("whatsappInbox.homeHint")}</p>
      </div>
      {loading ? (
        <p className="text-sm text-slate-400">{t("loading")}</p>
      ) : error ? (
        <p className="text-sm text-rose-300">{error}</p>
      ) : report ? (
        <div className="flex flex-col lg:flex-row gap-4">
          <Column
            title={t("emailsWeek.needOurReply")}
            hint={t("emailsWeek.needOurReplyHint")}
            items={report.needOurReply}
            accent="amber"
            onRead={setOpen}
            onFiche={onOpenContact}
            onDismiss={dismiss}
          />
          <Column
            title={t("emailsWeek.needStudentReply")}
            hint={t("emailsWeek.needStudentReplyHint")}
            items={report.needStudentReply}
            accent="sky"
            onRead={setOpen}
            onFiche={onOpenContact}
            onDismiss={dismiss}
          />
        </div>
      ) : null}
      {open ? (
        <MessageModal item={open} lang={lang} onClose={() => setOpen(null)} onOpenFiche={onOpenContact} />
      ) : null}
    </div>
  );
}
