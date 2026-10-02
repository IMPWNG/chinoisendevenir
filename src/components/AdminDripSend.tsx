"use client";

import { useEffect, useMemo, useState } from "react";
import { adminSupabase } from "../lib/supabase";
import { useAdminI18n } from "../context/AdminI18nContext";
import { errorMessage } from "../lib/request";

type Channel = "email" | "whatsapp";

type BulkContact = {
  id: string;
  email?: string | null;
  phone?: string | null;
  prenom?: string;
  nom?: string;
};

type DripStatus = {
  pending: number;
  failed: number;
  nextAt: string | null;
  sentLastHour: number;
};

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

function previewMessage(text: string, prenom: string) {
  return text.replaceAll("{prenom}", prenom || "Prénom").replaceAll("{nom}", "").trim();
}

function formatWhen(iso: string | null) {
  if (!iso) return "";
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "";
  return date.toLocaleString(undefined, {
    day: "2-digit",
    month: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function AdminDripSend({
  contacts,
  filteredContacts,
  selectedIds,
  onSelectedIdsChange,
}: {
  contacts: BulkContact[];
  filteredContacts: BulkContact[];
  selectedIds: string[];
  onSelectedIdsChange: (ids: string[] | ((prev: string[]) => string[])) => void;
}) {
  const { t } = useAdminI18n();
  const [channel, setChannel] = useState<Channel>("whatsapp");
  const [notes, setNotes] = useState("");
  const [subject, setSubject] = useState("");
  const [title, setTitle] = useState("");
  const [subtitle, setSubtitle] = useState("");
  const [message, setMessage] = useState("");
  const [composing, setComposing] = useState(false);
  const [launching, setLaunching] = useState(false);
  const [composeError, setComposeError] = useState("");
  const [collapsed, setCollapsed] = useState(true);
  const [status, setStatus] = useState<DripStatus | null>(null);

  const selected = useMemo(
    () => contacts.filter((contact) => selectedIds.includes(contact.id)),
    [contacts, selectedIds],
  );
  const recipients = useMemo(
    () =>
      selected.filter((contact) =>
        channel === "email"
          ? String(contact.email || "").trim()
          : String(contact.phone || "").trim(),
      ),
    [channel, selected],
  );
  const previewContact = recipients[0] || { prenom: t("dashboard.bulkPreviewName") };
  const hasDraft =
    channel === "email" ? Boolean(subject.trim() && message.trim()) : Boolean(message.trim());
  const busy = composing || launching;
  const allFilteredSelected =
    filteredContacts.length > 0 &&
    filteredContacts.every((contact) => selectedIds.includes(contact.id));
  const missing = selected.length - recipients.length;

  useEffect(() => {
    let stop = false;
    async function load() {
      try {
        const response = await authedFetch("/api/admin/drip");
        const data = await response.json();
        if (!stop && response.ok && data.success) {
          setStatus({
            pending: Number(data.pending) || 0,
            failed: Number(data.failed) || 0,
            nextAt: data.nextAt || null,
            sentLastHour: Number(data.sentLastHour) || 0,
          });
        }
      } catch {
        // The queue card stays on the last known counts.
      }
    }
    void load();
    const timer = setInterval(load, 30_000);
    return () => {
      stop = true;
      clearInterval(timer);
    };
  }, []);

  const toggleFiltered = () => {
    const filteredIds = filteredContacts.map((contact) => contact.id);
    if (allFilteredSelected) {
      onSelectedIdsChange((prev) => prev.filter((id) => !filteredIds.includes(id)));
      return;
    }
    onSelectedIdsChange((prev) => [...new Set([...prev, ...filteredIds])]);
  };

  function pickChannel(next: Channel) {
    if (next === channel) return;
    setChannel(next);
    setSubject("");
    setTitle("");
    setSubtitle("");
    setMessage("");
    setComposeError("");
  }

  async function composeDraft() {
    if (recipients.length === 0) {
      setComposeError(
        channel === "email" ? t("dashboard.noEmail") : t("dashboard.waBulkNoPhone"),
      );
      return;
    }
    if (recipients.length > 40) {
      setComposeError(t("dashboard.bulkTooMany"));
      return;
    }
    if (notes.trim().length < 8) {
      setComposeError(t("dashboard.emailAiEmpty"));
      return;
    }

    setComposing(true);
    setComposeError("");
    try {
      const response = await authedFetch("/api/admin/compose-email", {
        method: "POST",
        body: JSON.stringify({
          channel,
          contactIds: recipients.map((contact) => String(contact.id)),
          topic: "custom",
          notes: notes.trim(),
        }),
      });
      const data = await response.json();
      if (!response.ok || !data.success) {
        setComposeError(
          t("dashboard.emailAiFail", {
            error: data.error || data.message || t("unknownError"),
          }),
        );
        return;
      }
      setSubject(data.subject || "");
      setTitle(data.title || "");
      setSubtitle(data.subtitle || "");
      setMessage(data.body || "");
    } catch (error: unknown) {
      const reason = errorMessage(error);
      setComposeError(
        t("dashboard.emailAiFail", {
          error: reason === "SESSION" ? t("sessionExpired") : reason || t("unknownError"),
        }),
      );
    } finally {
      setComposing(false);
    }
  }

  async function launch() {
    if (recipients.length === 0) {
      alert(channel === "email" ? t("dashboard.noEmail") : t("dashboard.waBulkNoPhone"));
      return;
    }
    if (!hasDraft) {
      alert(t("dashboard.bulkNeedDraft"));
      return;
    }
    const confirmed = confirm(
      t("dashboard.dripConfirm", {
        count: recipients.length,
        channel: channel === "email" ? t("dashboard.dripEmail") : t("dashboard.dripWhatsapp"),
      }),
    );
    if (!confirmed) return;

    setLaunching(true);
    setComposeError("");
    try {
      const response = await authedFetch("/api/admin/drip", {
        method: "POST",
        body: JSON.stringify({
          channel,
          contactIds: recipients.map((contact) => String(contact.id)),
          subject: subject.trim(),
          title: title.trim(),
          subtitle: subtitle.trim(),
          body: message.trim(),
        }),
      });
      const data = await response.json();
      if (!response.ok || !data.success) {
        alert(data.error || t("unknownError"));
        return;
      }
      onSelectedIdsChange([]);
      setStatus((prev) => ({
        pending: (prev?.pending || 0) + Number(data.queued || 0),
        failed: prev?.failed || 0,
        nextAt: data.firstAt || prev?.nextAt || null,
        sentLastHour: prev?.sentLastHour || 0,
      }));
      const skipped = Number(data.skipped) || 0;
      alert(
        t("dashboard.dripQueued", {
          queued: data.queued,
          when: formatWhen(data.firstAt),
          skipped: skipped ? t("dashboard.dripSkipped", { count: skipped }) : "",
        }),
      );
    } catch (error: unknown) {
      const reason = errorMessage(error);
      alert(reason === "SESSION" ? t("sessionExpired") : reason || t("unknownError"));
    } finally {
      setLaunching(false);
    }
  }

  async function stopQueue() {
    if (!confirm(t("dashboard.dripStopConfirm"))) return;
    setLaunching(true);
    try {
      const response = await authedFetch("/api/admin/drip", {
        method: "POST",
        body: JSON.stringify({ action: "cancel" }),
      });
      const data = await response.json();
      if (!response.ok || !data.success) {
        alert(data.error || t("unknownError"));
        return;
      }
      setStatus((prev) => ({
        pending: 0,
        failed: prev?.failed || 0,
        nextAt: null,
        sentLastHour: prev?.sentLastHour || 0,
      }));
      alert(t("dashboard.dripStopped"));
    } catch (error: unknown) {
      const reason = errorMessage(error);
      alert(reason === "SESSION" ? t("sessionExpired") : reason || t("unknownError"));
    } finally {
      setLaunching(false);
    }
  }

  const nextLabel = status?.nextAt
    ? t("dashboard.dripNext", { when: formatWhen(status.nextAt) })
    : "";

  return (
    <div className="bg-slate-800/40 backdrop-blur-md rounded-2xl shadow-2xl p-5 mb-8 border border-slate-700/50">
      <div className="flex flex-col gap-4">
        <div className="flex flex-col lg:flex-row gap-4 lg:items-start">
          <div className="flex-1 min-w-0">
            <p className="text-white font-bold">
              ⏱️ {t("dashboard.dripTitle")}
              {selectedIds.length > 0
                ? ` — ${t("dashboard.bulkSelected", { count: selectedIds.length })}`
                : ""}
            </p>
            <p className="text-xs text-slate-400 mt-1">
              {status
                ? t("dashboard.dripStatus", {
                    pending: status.pending,
                    sent: status.sentLastHour,
                    next: nextLabel,
                  })
                : collapsed
                  ? t("dashboard.bulkCollapsedHint")
                  : t("dashboard.dripHint")}
            </p>
            {status && status.failed > 0 ? (
              <p className="text-xs text-amber-300 mt-1">
                {t("dashboard.dripFailed", { count: status.failed })}
              </p>
            ) : null}
          </div>
          <div className="flex flex-wrap gap-3">
            <button
              type="button"
              onClick={() => setCollapsed((value) => !value)}
              aria-expanded={!collapsed}
              className="px-5 py-3 bg-slate-700/70 hover:bg-slate-600 text-white rounded-xl font-bold transition-all duration-300"
            >
              {collapsed
                ? `▾ ${t("dashboard.bulkExpand")}`
                : `▴ ${t("dashboard.bulkCollapse")}`}
            </button>
            <button
              type="button"
              disabled={busy || filteredContacts.length === 0}
              onClick={toggleFiltered}
              className="px-5 py-3 bg-slate-700/70 hover:bg-slate-600 text-white rounded-xl font-bold transition-all duration-300 disabled:opacity-50"
            >
              {allFilteredSelected
                ? t("dashboard.deselectAll")
                : t("dashboard.selectFiltered")}
            </button>
            {selectedIds.length > 0 ? (
              <button
                type="button"
                disabled={busy}
                onClick={() => onSelectedIdsChange([])}
                className="px-5 py-3 bg-slate-700/70 hover:bg-slate-600 text-white rounded-xl font-bold transition-all duration-300 disabled:opacity-50"
              >
                {t("dashboard.clear")}
              </button>
            ) : null}
            {status && status.pending > 0 ? (
              <button
                type="button"
                disabled={busy}
                onClick={stopQueue}
                className="px-5 py-3 bg-slate-700/70 hover:bg-rose-700 text-white rounded-xl font-bold transition-all duration-300 disabled:opacity-50"
              >
                {t("dashboard.dripStop")}
              </button>
            ) : null}
            <button
              type="button"
              disabled={busy || selectedIds.length === 0 || !hasDraft}
              onClick={launch}
              className="px-6 py-3 bg-gradient-to-r from-sky-600 to-indigo-600 hover:from-sky-500 hover:to-indigo-500 text-white rounded-xl font-bold transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
            >
              {launching
                ? `⏳ ${t("dashboard.dripLaunching")}`
                : `▶️ ${t("dashboard.dripLaunch", { count: selectedIds.length })}`}
            </button>
          </div>
        </div>

        {collapsed ? null : (
          <div className="rounded-2xl border border-sky-500/30 bg-sky-500/10 p-4 space-y-4">
            <div>
              <p className="text-xs font-bold uppercase tracking-wide text-sky-200">
                ✨ {t("dashboard.emailAiSection")}
              </p>
              <p className="text-xs text-slate-400 mt-1">{t("dashboard.dripHint")}</p>
            </div>
            <div className="flex flex-wrap gap-2">
              <span className="text-xs font-bold uppercase tracking-wide text-slate-400 self-center">
                {t("dashboard.dripChannel")}
              </span>
              {(["email", "whatsapp"] as const).map((value) => (
                <button
                  key={value}
                  type="button"
                  disabled={busy}
                  onClick={() => pickChannel(value)}
                  className={`px-4 py-2 rounded-xl text-sm font-bold transition-all ${
                    channel === value
                      ? "bg-sky-500 text-white"
                      : "bg-slate-800/80 text-slate-300 hover:bg-slate-700"
                  }`}
                >
                  {value === "email" ? t("dashboard.dripEmail") : t("dashboard.dripWhatsapp")}
                </button>
              ))}
            </div>
            <div>
              <label className="text-xs font-bold text-slate-400 uppercase tracking-wide">
                {t("dashboard.bulkAiTopicLabel")}
              </label>
              <textarea
                value={notes}
                disabled={busy}
                onChange={(event) => setNotes(event.target.value)}
                placeholder={t("dashboard.bulkAiPlaceholder")}
                rows={3}
                className="mt-2 w-full px-4 py-3 bg-slate-800/80 border border-slate-600/50 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-sky-500/50 resize-y disabled:opacity-50"
              />
            </div>
            <div className="flex flex-col sm:flex-row sm:items-center gap-3">
              <button
                type="button"
                onClick={composeDraft}
                disabled={busy || selectedIds.length === 0}
                className="px-5 py-2.5 bg-gradient-to-r from-violet-600 to-fuchsia-600 hover:from-violet-500 hover:to-fuchsia-500 text-white rounded-xl font-bold transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
              >
                {composing
                  ? `⏳ ${t("dashboard.emailAiWorking")}`
                  : `✨ ${t("dashboard.bulkAiButton")}`}
              </button>
              {composeError ? (
                <p className="text-sm text-rose-300">{composeError}</p>
              ) : hasDraft ? (
                <p className="text-sm text-emerald-300">{t("dashboard.bulkValidateHint")}</p>
              ) : null}
            </div>
            {hasDraft && channel === "email" ? (
              <div>
                <label className="text-xs font-bold text-slate-400 uppercase tracking-wide">
                  {t("dashboard.emailCustomSubject")}
                </label>
                <input
                  value={subject}
                  disabled={busy}
                  onChange={(event) => setSubject(event.target.value)}
                  className="mt-2 w-full px-4 py-3 bg-slate-800/80 border border-slate-600/50 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-sky-500/50 disabled:opacity-50"
                />
              </div>
            ) : null}
            {hasDraft ? (
              <div className="space-y-4">
                <div>
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-wide">
                    {t("dashboard.emailCustomBody")}
                  </label>
                  <textarea
                    value={message}
                    disabled={busy}
                    onChange={(event) => setMessage(event.target.value)}
                    rows={8}
                    className="mt-2 w-full px-4 py-3 bg-slate-800/80 border border-slate-600/50 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-sky-500/50 resize-y"
                  />
                </div>
                {channel === "whatsapp" ? (
                  <div>
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-wide mb-2">
                      {t("dashboard.emailPreview")}
                    </p>
                    <div className="rounded-xl bg-[#0b141a] p-4">
                      <p className="max-w-md ml-auto whitespace-pre-wrap rounded-2xl rounded-tr-sm bg-[#005c4b] px-4 py-3 text-sm leading-relaxed text-white">
                        {previewMessage(message, String(previewContact.prenom || ""))}
                      </p>
                    </div>
                  </div>
                ) : null}
              </div>
            ) : null}
            {missing > 0 ? (
              <p className="text-xs text-amber-300">
                {channel === "email"
                  ? t("dashboard.dripMissingEmail", { count: missing })
                  : t("dashboard.waBulkMissingPhone", { count: missing })}
              </p>
            ) : null}
          </div>
        )}
      </div>
    </div>
  );
}
