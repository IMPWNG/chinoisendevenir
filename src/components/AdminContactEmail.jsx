"use client";

import { useEffect, useMemo, useState } from "react";
import { adminSupabase } from "../lib/supabase";
import { useAdminI18n } from "../context/AdminI18nContext";
import { generateCustomEmailHtml } from "../lib/emailLayout";
import { CONTACT_FROM_EMAIL, CONTACT_FROM_NAME } from "../lib/emailConfig";

const TEMPLATE_OPTIONS = [
  { value: "relance_1" },
  { value: "relance_2" },
  { value: "relance_formules" },
  { value: "formules_presentation" },
  { value: "reponse_bourses" },
  { value: "reponse_visa" },
  { value: "reponse_langue" },
  { value: "reponse_admission" },
  { value: "reponse_processus" },
  { value: "reponse_general" },
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

function fieldClass(disabled) {
  return `mt-2 w-full px-4 py-3 bg-slate-800/80 border border-slate-600/50 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 disabled:opacity-50 ${
    disabled ? "cursor-not-allowed" : ""
  }`;
}

export default function AdminContactEmail({ contact, onSent }) {
  const { t } = useAdminI18n();
  const [mode, setMode] = useState("write");
  const [template, setTemplate] = useState("formules_presentation");
  const [subject, setSubject] = useState("");
  const [title, setTitle] = useState("");
  const [subtitle, setSubtitle] = useState("");
  const [message, setMessage] = useState("");
  const [aiNotes, setAiNotes] = useState("");
  const [aiError, setAiError] = useState("");
  const [composing, setComposing] = useState(false);
  const [sending, setSending] = useState(false);

  useEffect(() => {
    setMode("write");
    setTemplate("formules_presentation");
    setSubject("");
    setTitle("");
    setSubtitle("");
    setMessage("");
    setAiNotes("");
    setAiError("");
  }, [contact.id]);

  const previewHtml = useMemo(
    () =>
      generateCustomEmailHtml(contact, {
        customSubject: subject,
        customTitle: title,
        customSubtitle: subtitle,
        customMessage: message,
      }),
    [contact, subject, title, subtitle, message],
  );

  const busy = composing || sending;
  const hasEmail = Boolean(String(contact.email || "").trim());
  const canSendWrite = Boolean(subject.trim() && message.trim());
  const sendLabel =
    mode === "write" && subject.trim()
      ? subject.trim()
      : t(`emailTemplate.${template}`);

  async function composeWithAi() {
    const notes = aiNotes.trim();
    if (notes.length < 8) {
      setAiError(t("dashboard.emailAiEmpty"));
      return;
    }

    setComposing(true);
    setAiError("");
    try {
      const response = await authedFetch("/api/admin/compose-email", {
        method: "POST",
        body: JSON.stringify({
          contactId: String(contact.id),
          notes,
        }),
      });
      const data = await response.json();
      if (!response.ok || !data.success) {
        setAiError(
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
      setMode("write");
    } catch (error) {
      setAiError(
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

  async function sendEmail() {
    if (!hasEmail) {
      alert(t("dashboard.emailNoAddress"));
      return;
    }
    if (mode === "write" && !canSendWrite) {
      alert(t("dashboard.emailCustomEmpty"));
      return;
    }

    const confirmed = confirm(
      t("dashboard.sendEmailConfirm", {
        template: sendLabel,
        name: contact.prenom,
      }),
    );
    if (!confirmed) return;

    setSending(true);
    try {
      const payload =
        mode === "write"
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
        alert(`✅ ${t("dashboard.emailOk")}`);
        onSent?.();
        return;
      }
      alert("❌ " + t("dashboard.emailFail", { error: data.message || data.error }));
    } catch (error) {
      alert(
        "❌ " +
          t("dashboard.networkError", {
            error:
              error.message === "SESSION"
                ? t("sessionExpired")
                : error.message,
          }),
      );
    } finally {
      setSending(false);
    }
  }

  return (
    <div className="mb-8 pb-8 border-b border-slate-700/50">
      <label className="text-sm font-bold text-slate-300 block mb-3 uppercase tracking-wide">
        📧 {t("dashboard.emailSection")}
      </label>

      <div className="flex flex-wrap gap-2 mb-4">
        <button
          type="button"
          disabled={busy}
          onClick={() => setMode("write")}
          className={`px-4 py-2 rounded-xl text-sm font-bold transition-all duration-200 ${
            mode === "write"
              ? "bg-blue-600 text-white"
              : "bg-slate-700/70 text-slate-300 hover:bg-slate-600"
          }`}
        >
          ✏️ {t("dashboard.emailWriteTab")}
        </button>
        <button
          type="button"
          disabled={busy}
          onClick={() => setMode("template")}
          className={`px-4 py-2 rounded-xl text-sm font-bold transition-all duration-200 ${
            mode === "template"
              ? "bg-blue-600 text-white"
              : "bg-slate-700/70 text-slate-300 hover:bg-slate-600"
          }`}
        >
          📋 {t("dashboard.emailTemplateTab")}
        </button>
      </div>

      {mode === "write" ? (
        <div className="space-y-4">
          <p className="text-xs text-slate-400">{t("dashboard.emailEditorHint")}</p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-bold text-slate-400 uppercase tracking-wide">
                {t("dashboard.emailFrom")}
              </label>
              <input
                type="text"
                readOnly
                value={`${CONTACT_FROM_NAME} <${CONTACT_FROM_EMAIL}>`}
                className={`${fieldClass(true)} text-slate-300`}
              />
            </div>
            <div>
              <label className="text-xs font-bold text-slate-400 uppercase tracking-wide">
                {t("dashboard.emailTo")}
              </label>
              <input
                type="email"
                readOnly
                value={contact.email || ""}
                placeholder={t("dashboard.emailNoAddress")}
                className={`${fieldClass(true)} text-slate-300`}
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-bold text-slate-400 uppercase tracking-wide">
              {t("dashboard.emailCustomSubject")}
            </label>
            <input
              type="text"
              value={subject}
              disabled={busy}
              onChange={(e) => setSubject(e.target.value)}
              placeholder={t("dashboard.emailCustomSubjectPlaceholder")}
              className={fieldClass(busy)}
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
                placeholder={t("dashboard.emailCustomTitlePlaceholder")}
                className={fieldClass(busy)}
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
                placeholder={t("dashboard.emailCustomSubtitlePlaceholder")}
                className={fieldClass(busy)}
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
              placeholder={t("dashboard.emailCustomPlaceholder")}
              rows={10}
              className={`${fieldClass(busy)} resize-y min-h-[180px]`}
            />
          </div>

          <div className="rounded-2xl border border-violet-500/30 bg-violet-500/10 p-4">
            <p className="text-xs font-bold uppercase tracking-wide text-violet-200">
              ✨ {t("dashboard.emailAiSection")}
            </p>
            <p className="text-xs text-slate-400 mt-1">{t("dashboard.emailAiHint")}</p>
            <textarea
              value={aiNotes}
              disabled={busy}
              onChange={(e) => setAiNotes(e.target.value)}
              placeholder={t("dashboard.emailAiPlaceholder")}
              rows={3}
              className="mt-3 w-full px-4 py-3 bg-slate-800/80 border border-slate-600/50 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-violet-500/50 resize-none disabled:opacity-50"
            />
            <div className="mt-3 flex flex-col sm:flex-row sm:items-center gap-3">
              <button
                type="button"
                onClick={composeWithAi}
                disabled={busy}
                className="px-5 py-2.5 bg-gradient-to-r from-violet-600 to-fuchsia-600 hover:from-violet-500 hover:to-fuchsia-500 text-white rounded-xl font-bold transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
              >
                {composing
                  ? `⏳ ${t("dashboard.emailAiWorking")}`
                  : `✨ ${t("dashboard.emailAiButton")}`}
              </button>
              {aiError ? <p className="text-sm text-rose-300">{aiError}</p> : null}
            </div>
          </div>

          <div>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wide mb-2">
              {t("dashboard.emailPreview")}
            </p>
            <iframe
              title={t("dashboard.emailPreview")}
              sandbox=""
              className="w-full h-96 rounded-xl border border-slate-700/50 bg-white"
              srcDoc={previewHtml}
            />
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          <select
            value={template}
            disabled={busy}
            onChange={(e) => setTemplate(e.target.value)}
            className="w-full px-5 py-3 bg-slate-700/50 border border-slate-600/50 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 font-semibold cursor-pointer disabled:opacity-50"
          >
            {TEMPLATE_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {t(`emailTemplate.${option.value}`)}
              </option>
            ))}
          </select>
          <p className="text-xs text-slate-500">
            {template === "relance_1" && t("dashboard.emailHintRelance1")}
            {template === "relance_2" && t("dashboard.emailHintRelance2")}
            {template === "relance_formules" &&
              t("dashboard.emailHintRelanceFormules")}
            {template === "formules_presentation" &&
              t("dashboard.emailHintFormules")}
            {(template === "reponse_bourses" ||
              template === "reponse_visa" ||
              template === "reponse_langue" ||
              template === "reponse_admission" ||
              template === "reponse_processus" ||
              template === "reponse_general") &&
              t("dashboard.emailHintAutoReply")}
          </p>
        </div>
      )}

      <div className="mt-4">
        <button
          type="button"
          onClick={sendEmail}
          disabled={
            busy ||
            !hasEmail ||
            (mode === "write" && !canSendWrite)
          }
          className="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white rounded-xl font-bold transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
        >
          {sending ? `⏳ ${t("sending")}` : `📤 ${t("dashboard.sendEmail")}`}
        </button>
        {mode === "write" ? (
          <p className="text-xs text-slate-500 mt-3">
            {t("dashboard.emailHintCustom")}
          </p>
        ) : null}
      </div>
    </div>
  );
}
