"use client";

import { useMemo, useState } from "react";
import { adminSupabase } from "../lib/supabase";
import { useAdminI18n } from "../context/AdminI18nContext";
import { errorMessage } from "../lib/request";

const SEND_PAUSE_MS = 4000;

type BulkContact = {
  id: string;
  phone?: string | null;
  prenom?: string;
  nom?: string;
};

type BulkProgress = { current: number; total: number; name: string };

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

function wait(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function previewMessage(text: string, prenom: string) {
  return text.replaceAll("{prenom}", prenom || "Prénom").replaceAll("{nom}", "").trim();
}

export default function AdminBulkWhatsapp({
  contacts,
  filteredContacts,
  selectedIds,
  onSelectedIdsChange,
  onFinished,
}: {
  contacts: BulkContact[];
  filteredContacts: BulkContact[];
  selectedIds: string[];
  onSelectedIdsChange: (ids: string[] | ((prev: string[]) => string[])) => void;
  onFinished?: () => void | Promise<void>;
}) {
  const { t } = useAdminI18n();
  const [notes, setNotes] = useState("");
  const [message, setMessage] = useState("");
  const [composing, setComposing] = useState(false);
  const [composeError, setComposeError] = useState("");
  const [sending, setSending] = useState(false);
  const [progress, setProgress] = useState<BulkProgress | null>(null);
  const [collapsed, setCollapsed] = useState(true);

  const selected = useMemo(
    () => contacts.filter((contact) => selectedIds.includes(contact.id)),
    [contacts, selectedIds],
  );
  const recipients = useMemo(
    () => selected.filter((contact) => String(contact.phone || "").trim()),
    [selected],
  );
  const previewContact = recipients[0] || { prenom: t("dashboard.bulkPreviewName") };
  const hasDraft = Boolean(message.trim());
  const busy = composing || sending;
  const allFilteredSelected =
    filteredContacts.length > 0 &&
    filteredContacts.every((contact) => selectedIds.includes(contact.id));
  const missingPhone = selected.length - recipients.length;

  const toggleFiltered = () => {
    const filteredIds = filteredContacts.map((contact) => contact.id);
    if (allFilteredSelected) {
      onSelectedIdsChange((prev) => prev.filter((id) => !filteredIds.includes(id)));
      return;
    }
    onSelectedIdsChange((prev) => [...new Set([...prev, ...filteredIds])]);
  };

  async function composeDraft() {
    if (recipients.length === 0) {
      setComposeError(t("dashboard.waBulkNoPhone"));
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
          channel: "whatsapp",
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

  async function sendBulk() {
    if (recipients.length === 0) {
      alert(t("dashboard.waBulkNoPhone"));
      return;
    }
    if (recipients.length > 40) {
      alert(t("dashboard.bulkTooMany"));
      return;
    }
    if (!hasDraft) {
      alert(t("dashboard.bulkNeedDraft"));
      return;
    }

    const confirmed = confirm(
      t("dashboard.waBulkConfirm", { count: recipients.length }),
    );
    if (!confirmed) return;
    await runOnRecipients({
      text: message.trim(),
      save: false,
      label: false,
      pauseMs: SEND_PAUSE_MS,
    });
  }

  async function addToBook() {
    if (recipients.length === 0) {
      alert(t("dashboard.waBulkNoPhone"));
      return;
    }
    if (recipients.length > 40) {
      alert(t("dashboard.bulkTooMany"));
      return;
    }
    const confirmed = confirm(
      t("dashboard.waBulkBookConfirm", { count: recipients.length }),
    );
    if (!confirmed) return;
    await runOnRecipients({ text: "", save: true, label: true, pauseMs: 800 });
  }

  async function runOnRecipients(input: {
    text: string;
    save: boolean;
    label: boolean;
    pauseMs: number;
  }) {
    setSending(true);
    const sent: BulkContact[] = [];
    const failed: { contact: BulkContact; error: string }[] = [];
    try {
      for (let i = 0; i < recipients.length; i += 1) {
        const contact = recipients[i];
        setProgress({
          current: i + 1,
          total: recipients.length,
          name: `${contact.prenom || ""} ${contact.nom || ""}`.trim(),
        });
        try {
          const response = await authedFetch("/api/admin/whatsapp", {
            method: "POST",
            body: JSON.stringify({
              contactId: contact.id,
              action: "bundle",
              text: input.text,
              save: input.save,
              label: input.label,
            }),
          });
          const data = await response.json();
          if (response.ok && data.success) sent.push(contact);
          else failed.push({ contact, error: data.error || t("unknownError") });
        } catch (error: unknown) {
          const reason = errorMessage(error);
          failed.push({
            contact,
            error: reason === "SESSION" ? t("sessionExpired") : reason || t("unknownError"),
          });
        }
        if (i < recipients.length - 1) await wait(input.pauseMs);
      }
    } finally {
      setSending(false);
      setProgress(null);
      onSelectedIdsChange([]);
    }

    await onFinished?.();
    const details = failed
      .map(
        (item) =>
          `• ${item.contact.prenom || ""} ${item.contact.nom || ""} — ${item.error}`,
      )
      .join("\n");
    alert(
      t("dashboard.bulkDone", {
        sent: sent.length,
        failed: failed.length,
        details: details ? `\n\n${details}` : "",
      }),
    );
  }

  return (
    <div
      className={`bg-slate-800/40 backdrop-blur-md rounded-2xl shadow-2xl p-5 mb-8 border border-slate-700/50 ${
        collapsed ? "sticky top-[180px] z-20" : ""
      }`}
    >
      <div className="flex flex-col gap-4">
        <div className="flex flex-col lg:flex-row gap-4 lg:items-start">
          <div className="flex-1 min-w-0">
            <p className="text-white font-bold">
              💬 {t("dashboard.waBulkTitle")}
              {selectedIds.length > 0
                ? ` — ${t("dashboard.bulkSelected", { count: selectedIds.length })}`
                : ""}
            </p>
            <p className="text-xs text-slate-400 mt-1">
              {sending && progress
                ? t("dashboard.bulkProgress", {
                    current: progress.current,
                    total: progress.total,
                    name: progress.name,
                  })
                : collapsed
                  ? t("dashboard.bulkCollapsedHint")
                  : t("dashboard.waBulkHint")}
            </p>
            {sending && progress ? (
              <div className="mt-3 h-2 rounded-full bg-slate-700 overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-emerald-500 to-teal-500 transition-all duration-300"
                  style={{
                    width: `${Math.round((progress.current / progress.total) * 100)}%`,
                  }}
                />
              </div>
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
            <button
              type="button"
              disabled={busy || selectedIds.length === 0 || !hasDraft}
              onClick={sendBulk}
              className="px-6 py-3 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white rounded-xl font-bold transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
            >
              {sending
                ? `⏳ ${t("dashboard.sendingCount", {
                    current: progress?.current || 0,
                    total: progress?.total || 0,
                  })}`
                : `📤 ${t("dashboard.send", { count: selectedIds.length })}`}
            </button>
          </div>
        </div>

        {collapsed ? null : (
          <>
            <div className="rounded-2xl border border-violet-500/30 bg-violet-500/10 p-4 space-y-4">
                <div>
                  <p className="text-xs font-bold uppercase tracking-wide text-violet-200">
                    ✨ {t("dashboard.emailAiSection")}
                  </p>
                  <p className="text-xs text-slate-400 mt-1">{t("dashboard.waBulkHint")}</p>
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
                    className="mt-2 w-full px-4 py-3 bg-slate-800/80 border border-slate-600/50 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-violet-500/50 resize-y disabled:opacity-50"
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
                {hasDraft ? (
                  <MessageDraft
                    message={message}
                    busy={busy}
                    accent="violet"
                    previewName={String(previewContact.prenom || "")}
                    onChange={setMessage}
                    t={t}
                  />
                ) : null}
              </div>

            <div className="flex flex-col sm:flex-row sm:items-center gap-3">
              <p className="text-sm text-slate-200 flex-1">{t("dashboard.waBulkSave")}</p>
              <button
                type="button"
                onClick={addToBook}
                disabled={busy || selectedIds.length === 0}
                className="px-5 py-2.5 bg-slate-700/70 hover:bg-slate-600 text-white rounded-xl font-bold transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
              >
                {t("dashboard.waBulkBookButton")}
              </button>
            </div>
            <div className="flex flex-col gap-3">
              {missingPhone > 0 ? (
                <p className="text-xs text-amber-300">
                  {t("dashboard.waBulkMissingPhone", { count: missingPhone })}
                </p>
              ) : null}
            </div>
          </>
        )}
      </div>
    </div>
  );
}

function MessageDraft({
  message,
  busy,
  accent,
  previewName,
  onChange,
  t,
}: {
  message: string;
  busy: boolean;
  accent: "emerald" | "violet";
  previewName: string;
  onChange: (value: string) => void;
  t: (path: string) => string;
}) {
  const ring = accent === "emerald" ? "focus:ring-emerald-500/50" : "focus:ring-violet-500/50";
  return (
    <div className="space-y-4">
      <div>
        <label className="text-xs font-bold text-slate-400 uppercase tracking-wide">
          {t("dashboard.emailCustomBody")}
        </label>
        <textarea
          value={message}
          disabled={busy}
          onChange={(event) => onChange(event.target.value)}
          rows={8}
          className={`mt-2 w-full px-4 py-3 bg-slate-800/80 border border-slate-600/50 rounded-xl text-white focus:outline-none focus:ring-2 ${ring} resize-y`}
        />
      </div>
      <div>
        <p className="text-xs font-bold text-slate-400 uppercase tracking-wide mb-2">
          {t("dashboard.emailPreview")}
        </p>
        <div className="rounded-xl bg-[#0b141a] p-4">
          <p className="max-w-md ml-auto whitespace-pre-wrap rounded-2xl rounded-tr-sm bg-[#005c4b] px-4 py-3 text-sm leading-relaxed text-white">
            {previewMessage(message, previewName)}
          </p>
        </div>
      </div>
    </div>
  );
}
