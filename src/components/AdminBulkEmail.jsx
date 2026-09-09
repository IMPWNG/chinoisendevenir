"use client";

import { useMemo, useState } from "react";
import { adminSupabase } from "../lib/supabase";
import { useAdminI18n } from "../context/AdminI18nContext";
import { generateCustomEmailHtml } from "../lib/emailLayout";

const TEMPLATE_OPTIONS = [
  "relance_1",
  "relance_2",
  "relance_formules",
  "formules_presentation",
];

const AI_TOPICS = [
  "langue_sans_diplome",
  "annee_chinois",
  "bourses",
  "formules",
  "custom",
];

async function authedFetch(path, options = {}) {
  const {
    data: { session },
  } = await adminSupabase.auth.getSession();
  if (!session?.access_token) {
    throw new Error("SESSION");
  }
  return fetch(path, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(options.headers || {}),
      Authorization: `Bearer ${session.access_token}`,
    },
  });
}

export default function AdminBulkEmail({
  contacts,
  filteredContacts,
  selectedIds,
  onSelectedIdsChange,
  onContactStatus,
  onFinished,
}) {
  const { t } = useAdminI18n();
  const [mode, setMode] = useState("ai");
  const [template, setTemplate] = useState("relance_1");
  const [topic, setTopic] = useState("langue_sans_diplome");
  const [notes, setNotes] = useState("");
  const [subject, setSubject] = useState("");
  const [title, setTitle] = useState("");
  const [subtitle, setSubtitle] = useState("");
  const [message, setMessage] = useState("");
  const [composing, setComposing] = useState(false);
  const [composeError, setComposeError] = useState("");
  const [sending, setSending] = useState(false);
  const [progress, setProgress] = useState(null);

  const selected = useMemo(
    () => contacts.filter((contact) => selectedIds.includes(contact.id)),
    [contacts, selectedIds],
  );
  const recipients = useMemo(
    () => selected.filter((contact) => Boolean(contact.email)),
    [selected],
  );
  const previewContact = recipients[0] || { prenom: t("dashboard.bulkPreviewName") };
  const hasDraft = Boolean(subject.trim() && message.trim());
  const busy = composing || sending;
  const allFilteredSelected =
    filteredContacts.length > 0 &&
    filteredContacts.every((contact) => selectedIds.includes(contact.id));

  const toggleFiltered = () => {
    const filteredIds = filteredContacts.map((contact) => contact.id);
    if (allFilteredSelected) {
      onSelectedIdsChange((prev) =>
        prev.filter((id) => !filteredIds.includes(id)),
      );
      return;
    }
    onSelectedIdsChange((prev) => [...new Set([...prev, ...filteredIds])]);
  };

  async function composeDraft() {
    if (recipients.length === 0) {
      setComposeError(t("dashboard.noEmail"));
      return;
    }
    if (recipients.length > 40) {
      setComposeError(t("dashboard.bulkTooMany"));
      return;
    }
    if (topic === "custom" && notes.trim().length < 8) {
      setComposeError(t("dashboard.emailAiEmpty"));
      return;
    }

    setComposing(true);
    setComposeError("");
    try {
      const response = await authedFetch("/api/admin/compose-email", {
        method: "POST",
        body: JSON.stringify({
          contactIds: recipients.map((contact) => String(contact.id)),
          topic,
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
    } catch (error) {
      setComposeError(
        t("dashboard.emailAiFail", {
          error:
            error.message === "SESSION"
              ? t("sessionExpired")
              : error.message || t("unknownError"),
        }),
      );
    } finally {
      setComposing(false);
    }
  }

  async function sendBulk() {
    if (recipients.length === 0) {
      alert(t("dashboard.noEmail"));
      return;
    }
    if (recipients.length > 40) {
      alert(t("dashboard.bulkTooMany"));
      return;
    }
    if (mode === "ai" && !hasDraft) {
      alert(t("dashboard.bulkNeedDraft"));
      return;
    }

    const templateLabel =
      mode === "ai"
        ? subject.trim() || t(`dashboard.bulkAiTopic.${topic}`)
        : t(`emailTemplate.${template}`);
    const confirmed = confirm(
      t(mode === "ai" ? "dashboard.bulkConfirmAi" : "dashboard.bulkConfirm", {
        template: templateLabel,
        count: recipients.length,
      }),
    );
    if (!confirmed) return;

    setSending(true);
    const sent = [];
    const failed = [];

    try {
      for (let i = 0; i < recipients.length; i += 1) {
        const contact = recipients[i];
        setProgress({
          current: i + 1,
          total: recipients.length,
          name: `${contact.prenom || ""} ${contact.nom || ""}`.trim(),
        });
        try {
          const payload =
            mode === "ai"
              ? {
                  contactId: String(contact.id),
                  emailTemplate: "custom",
                  customSubject: subject.trim(),
                  customTitle: title.trim(),
                  customSubtitle: subtitle.trim(),
                  customMessage: message.trim(),
                }
              : {
                  contactId: String(contact.id),
                  emailTemplate: template,
                };
          const response = await authedFetch("/api/email/auto-reply", {
            method: "POST",
            body: JSON.stringify(payload),
          });
          const data = await response.json();
          if (data.success) {
            sent.push(contact);
            if (data.status) onContactStatus?.(contact.id, data.status);
          } else {
            failed.push({
              contact,
              error: data.message || data.error || t("unknownError"),
            });
          }
        } catch (error) {
          failed.push({
            contact,
            error:
              error.message === "SESSION"
                ? t("sessionExpired")
                : error.message || t("unknownError"),
          });
        }
        await new Promise((resolve) => setTimeout(resolve, 250));
      }
    } finally {
      setSending(false);
      setProgress(null);
      onSelectedIdsChange([]);
    }

    await onFinished?.();

    const failLines = failed
      .map(
        (item) =>
          `• ${item.contact.prenom || ""} ${item.contact.nom || ""} — ${item.error}`,
      )
      .join("\n");
    alert(
      t("dashboard.bulkDone", {
        sent: sent.length,
        failed: failed.length,
        details: failLines ? `\n\n${failLines}` : "",
      }),
    );
  }

  return (
    <div className="bg-slate-800/40 backdrop-blur-md rounded-2xl shadow-2xl p-5 mb-8 border border-slate-700/50 sticky top-[88px] z-30">
      <div className="flex flex-col gap-4">
        <div className="flex flex-col lg:flex-row gap-4 lg:items-start">
          <div className="flex-1 min-w-0">
            <p className="text-white font-bold">
              📬 {t("dashboard.bulkTitle")}
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
                : t("dashboard.bulkHint")}
            </p>
            {sending && progress ? (
              <div className="mt-3 h-2 rounded-full bg-slate-700 overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-amber-500 to-orange-500 transition-all duration-300"
                  style={{
                    width: `${Math.round(
                      (progress.current / progress.total) * 100,
                    )}%`,
                  }}
                />
              </div>
            ) : null}
          </div>
          <div className="flex flex-wrap gap-3">
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
              disabled={
                busy ||
                selectedIds.length === 0 ||
                (mode === "ai" && !hasDraft)
              }
              onClick={sendBulk}
              className="px-6 py-3 bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-500 hover:to-orange-500 text-white rounded-xl font-bold transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
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

        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            disabled={busy}
            onClick={() => setMode("ai")}
            className={`px-4 py-2 rounded-xl text-sm font-bold transition-all duration-200 ${
              mode === "ai"
                ? "bg-violet-600 text-white"
                : "bg-slate-700/70 text-slate-300 hover:bg-slate-600"
            }`}
          >
            ✨ {t("dashboard.bulkModeAi")}
          </button>
          <button
            type="button"
            disabled={busy}
            onClick={() => setMode("template")}
            className={`px-4 py-2 rounded-xl text-sm font-bold transition-all duration-200 ${
              mode === "template"
                ? "bg-amber-600 text-white"
                : "bg-slate-700/70 text-slate-300 hover:bg-slate-600"
            }`}
          >
            📋 {t("dashboard.bulkModeTemplate")}
          </button>
        </div>

        {mode === "template" ? (
          <select
            value={template}
            disabled={busy}
            onChange={(e) => setTemplate(e.target.value)}
            className="max-w-xl px-5 py-3 bg-slate-700/50 border border-slate-600/50 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-amber-500/50 font-semibold cursor-pointer disabled:opacity-50"
          >
            {TEMPLATE_OPTIONS.map((value) => (
              <option key={value} value={value}>
                {t(`emailTemplate.${value}`)}
              </option>
            ))}
          </select>
        ) : (
          <div className="rounded-2xl border border-violet-500/30 bg-violet-500/10 p-4 space-y-4">
            <div>
              <p className="text-xs font-bold uppercase tracking-wide text-violet-200">
                ✨ {t("dashboard.emailAiSection")}
              </p>
              <p className="text-xs text-slate-400 mt-1">
                {t("dashboard.bulkAiHint")}
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-bold text-slate-400 uppercase tracking-wide">
                  {t("dashboard.bulkAiTopicLabel")}
                </label>
                <select
                  value={topic}
                  disabled={busy}
                  onChange={(e) => setTopic(e.target.value)}
                  className="mt-2 w-full px-4 py-3 bg-slate-800/80 border border-slate-600/50 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-violet-500/50 font-semibold cursor-pointer disabled:opacity-50"
                >
                  {AI_TOPICS.map((key) => (
                    <option key={key} value={key}>
                      {t(`dashboard.bulkAiTopic.${key}`)}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-xs font-bold text-slate-400 uppercase tracking-wide">
                  {t("dashboard.bulkAiNotes")}
                </label>
                <textarea
                  value={notes}
                  disabled={busy}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder={t("dashboard.bulkAiPlaceholder")}
                  rows={3}
                  className="mt-2 w-full px-4 py-3 bg-slate-800/80 border border-slate-600/50 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-violet-500/50 resize-none disabled:opacity-50"
                />
              </div>
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
                <p className="text-sm text-emerald-300">
                  {t("dashboard.bulkValidateHint")}
                </p>
              ) : null}
            </div>

            {hasDraft ? (
              <div className="space-y-4 pt-2">
                <div>
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-wide">
                    {t("dashboard.emailCustomSubject")}
                  </label>
                  <input
                    type="text"
                    value={subject}
                    disabled={busy}
                    onChange={(e) => setSubject(e.target.value)}
                    className="mt-2 w-full px-4 py-3 bg-slate-800/80 border border-slate-600/50 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-violet-500/50"
                  />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-bold text-slate-400 uppercase tracking-wide">
                      {t("dashboard.emailCustomTitle")}
                    </label>
                    <input
                      type="text"
                      value={title}
                      disabled={busy}
                      onChange={(e) => setTitle(e.target.value)}
                      className="mt-2 w-full px-4 py-3 bg-slate-800/80 border border-slate-600/50 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-violet-500/50"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-slate-400 uppercase tracking-wide">
                      {t("dashboard.emailCustomSubtitle")}
                    </label>
                    <input
                      type="text"
                      value={subtitle}
                      disabled={busy}
                      onChange={(e) => setSubtitle(e.target.value)}
                      className="mt-2 w-full px-4 py-3 bg-slate-800/80 border border-slate-600/50 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-violet-500/50"
                    />
                  </div>
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-wide">
                    {t("dashboard.emailCustomBody")}
                  </label>
                  <textarea
                    value={message}
                    disabled={busy}
                    onChange={(e) => setMessage(e.target.value)}
                    rows={8}
                    className="mt-2 w-full px-4 py-3 bg-slate-800/80 border border-slate-600/50 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-violet-500/50 resize-y"
                  />
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-wide mb-2">
                    {t("dashboard.emailPreview")}
                  </p>
                  <iframe
                    title={t("dashboard.emailPreview")}
                    sandbox=""
                    className="w-full h-80 rounded-xl border border-slate-700/50 bg-white"
                    srcDoc={generateCustomEmailHtml(previewContact, {
                      customSubject: subject,
                      customTitle: title,
                      customSubtitle: subtitle,
                      customMessage: message,
                    })}
                  />
                </div>
              </div>
            ) : null}
          </div>
        )}
      </div>
    </div>
  );
}
