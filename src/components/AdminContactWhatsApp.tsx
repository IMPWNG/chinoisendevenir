"use client";

import { useEffect, useRef, useState } from "react";
import { useAdminI18n } from "../context/AdminI18nContext";
import { adminSupabase } from "../lib/supabase";
import { errorMessage } from "../lib/request";

type WhatsappContact = {
  id: string;
  phone?: string | null;
  prenom?: string | null;
  nom?: string | null;
};

type ThreadMessage = {
  id: string;
  body: string;
  fromMe: boolean;
  at: number;
};

type WhatsappCard = {
  onWhatsapp: boolean;
  saved: boolean;
  onList: boolean;
  listFound: boolean;
  messages: ThreadMessage[];
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

function localeFor(lang: string) {
  if (lang === "zh") return "zh-CN";
  if (lang === "en") return "en-GB";
  return "fr-FR";
}

export default function AdminContactWhatsApp({
  contact,
  onDone,
  onTreated,
}: {
  contact: WhatsappContact;
  onDone?: () => void;
  onTreated?: () => void;
}) {
  const { t, lang } = useAdminI18n();
  const [text, setText] = useState("");
  const [aiNotes, setAiNotes] = useState("");
  const [composing, setComposing] = useState(false);
  const [aiError, setAiError] = useState("");
  const [busy, setBusy] = useState<"send" | "save" | "label" | null>(null);
  const [notice, setNotice] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [card, setCard] = useState<WhatsappCard | null>(null);
  const bottomRef = useRef<HTMLDivElement | null>(null);
  const requestRef = useRef(0);
  const phone = String(contact.phone || "").trim();

  async function loadCard() {
    if (!phone) {
      setCard(null);
      return;
    }
    const requestId = ++requestRef.current;
    setLoading(true);
    try {
      const response = await authedFetch(
        `/api/admin/whatsapp?contactId=${encodeURIComponent(contact.id)}`,
      );
      const data = await response.json().catch(() => ({}));
      if (requestRef.current !== requestId) return;
      if (!response.ok) {
        setCard(null);
        setError(
          t("dashboard.whatsappFail", {
            error: data.error || t("unknownError"),
          }),
        );
        return;
      }
      setCard(data as WhatsappCard);
    } catch (caught) {
      if (requestRef.current !== requestId) return;
      const message = errorMessage(caught);
      setError(
        t("dashboard.whatsappFail", {
          error: message === "SESSION" ? t("sessionExpired") : message || t("unknownError"),
        }),
      );
    } finally {
      if (requestRef.current === requestId) setLoading(false);
    }
  }

  useEffect(() => {
    setText("");
    setAiNotes("");
    setAiError("");
    setNotice("");
    setError("");
    setCard(null);
    void loadCard();
    // reload when the open file changes
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [contact.id]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ block: "nearest" });
  }, [card?.messages.length]);

  useEffect(() => {
    if (!card?.onWhatsapp) return;
    onTreated?.();
  }, [card?.onWhatsapp, contact.id, onTreated]);

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
          channel: "whatsapp",
          contactId: contact.id,
          notes,
        }),
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok || !data.success) {
        setAiError(
          t("dashboard.whatsappAiFail", {
            error: data.error || t("unknownError"),
          }),
        );
        return;
      }
      setText(String(data.body || "").slice(0, 500));
    } catch (caught) {
      const message = errorMessage(caught);
      setAiError(
        t("dashboard.whatsappAiFail", {
          error: message === "SESSION" ? t("sessionExpired") : message || t("unknownError"),
        }),
      );
    } finally {
      setComposing(false);
    }
  }

  async function run(action: "send" | "save" | "label") {
    if (!phone) {
      setError(t("dashboard.whatsappNoPhone"));
      return;
    }
    if (action === "send" && !text.trim()) {
      setError(t("dashboard.whatsappEmpty"));
      return;
    }
    if (action === "send") {
      const name = [contact.prenom, contact.nom].filter(Boolean).join(" ") || phone;
      if (!confirm(t("dashboard.whatsappConfirm", { name }))) return;
    }

    setBusy(action);
    setError("");
    setNotice("");
    try {
      const response = await authedFetch("/api/admin/whatsapp", {
        method: "POST",
        body: JSON.stringify({
          contactId: contact.id,
          action,
          text: action === "send" ? text.trim() : "",
        }),
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok || !data.success) {
        setError(
          t("dashboard.whatsappFail", {
            error: data.error || t("unknownError"),
          }),
        );
        return;
      }
      if (action === "send") setText("");
      setNotice(
        action === "send"
          ? t("dashboard.whatsappSent")
          : action === "label"
            ? t("dashboard.whatsappListSaved")
            : t("dashboard.whatsappSaved"),
      );
      onDone?.();
      await loadCard();
    } catch (caught) {
      const message = errorMessage(caught);
      setError(
        t("dashboard.whatsappFail", {
          error: message === "SESSION" ? t("sessionExpired") : message || t("unknownError"),
        }),
      );
    } finally {
      setBusy(null);
    }
  }

  const onWhatsapp = card?.onWhatsapp === true;
  const messages = card?.messages || [];

  return (
    <div>
      <p className="text-xs text-slate-400 mb-4">{t("dashboard.whatsappHint")}</p>
      <div className="mb-4">
        <label
          htmlFor="admin-whatsapp-phone"
          className="text-xs font-bold text-slate-400 uppercase tracking-wide"
        >
          {t("dashboard.whatsappTo")}
        </label>
        <input
          id="admin-whatsapp-phone"
          type="text"
          readOnly
          value={phone}
          placeholder={t("dashboard.whatsappNoPhone")}
          className="mt-2 w-full px-4 py-3 bg-slate-800/80 border border-slate-600/50 rounded-xl text-slate-300"
        />
      </div>

      {card?.onWhatsapp ? (
        <div className="mb-4 flex flex-wrap gap-2">
          <span
            className={`px-3 py-1 rounded-full text-xs font-bold ${
              card.saved
                ? "bg-emerald-500/20 text-emerald-200"
                : "bg-slate-700 text-slate-300"
            }`}
          >
            {card.saved ? t("dashboard.whatsappInContacts") : t("dashboard.whatsappNotInContacts")}
          </span>
          <span
            className={`px-3 py-1 rounded-full text-xs font-bold ${
              card.onList
                ? "bg-emerald-500/20 text-emerald-200"
                : "bg-slate-700 text-slate-300"
            }`}
          >
            {card.onList ? t("dashboard.whatsappOnList") : t("dashboard.whatsappNotOnList")}
          </span>
        </div>
      ) : null}

      <div className="mb-4">
        <p className="text-xs font-bold text-slate-400 uppercase tracking-wide mb-2">
          {t("dashboard.whatsappHistory")}
        </p>
        {loading && !card ? (
          <p className="text-sm text-slate-400">{t("dashboard.whatsappHistoryLoading")}</p>
        ) : card && !onWhatsapp ? (
          <p className="text-sm text-slate-400">{t("dashboard.whatsappNotOnWhatsapp")}</p>
        ) : messages.length === 0 ? (
          <p className="text-sm text-slate-400">{t("dashboard.whatsappHistoryEmpty")}</p>
        ) : (
          <div className="max-h-80 overflow-y-auto space-y-3 pr-1 rounded-xl bg-slate-900/40 border border-slate-700/40 p-4">
            {messages.map((message, index) => (
              <div
                key={`${message.id}-${index}`}
                className={`flex ${message.fromMe ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm ${
                    message.fromMe
                      ? "bg-emerald-600/90 text-white rounded-br-md"
                      : "bg-slate-700/80 text-slate-100 rounded-bl-md"
                  }`}
                >
                  <p
                    className={`text-[11px] font-semibold mb-1 ${
                      message.fromMe ? "text-emerald-100" : "text-slate-300"
                    }`}
                  >
                    {message.fromMe
                      ? t("dashboard.whatsappHistoryYou")
                      : t("dashboard.whatsappHistoryThem")}
                    {message.at
                      ? ` · ${new Date(message.at).toLocaleString(localeFor(lang), {
                          day: "2-digit",
                          month: "short",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}`
                      : ""}
                  </p>
                  <p className="whitespace-pre-wrap leading-relaxed">{message.body}</p>
                </div>
              </div>
            ))}
            <div ref={bottomRef} />
          </div>
        )}
      </div>

      <div className="mb-4 rounded-2xl border border-violet-500/30 bg-violet-500/10 p-4">
        <p className="text-xs font-bold uppercase tracking-wide text-violet-200">
          ✨ {t("dashboard.emailAiSection")}
        </p>
        <p className="text-xs text-slate-400 mt-1">{t("dashboard.whatsappAiHint")}</p>
        <textarea
          value={aiNotes}
          disabled={busy !== null || composing}
          onChange={(e) => setAiNotes(e.target.value)}
          placeholder={t("dashboard.whatsappAiPlaceholder")}
          rows={2}
          className="mt-3 w-full px-4 py-3 bg-slate-800/80 border border-slate-600/50 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-violet-500/50 resize-none disabled:opacity-50"
        />
        <div className="mt-3 flex flex-col sm:flex-row sm:items-center gap-3">
          <button
            type="button"
            onClick={composeWithAi}
            disabled={busy !== null || composing}
            className="px-5 py-2.5 bg-gradient-to-r from-violet-600 to-fuchsia-600 hover:from-violet-500 hover:to-fuchsia-500 text-white rounded-xl font-bold transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
          >
            {composing
              ? `⏳ ${t("dashboard.emailAiWorking")}`
              : `✨ ${t("dashboard.whatsappAiButton")}`}
          </button>
          {aiError ? <p className="text-sm text-rose-300">{aiError}</p> : null}
        </div>
      </div>

      <div className="mb-4">
        <label
          htmlFor="admin-whatsapp-text"
          className="text-xs font-bold text-slate-400 uppercase tracking-wide"
        >
          {t("dashboard.whatsappMessage")}
        </label>
        <textarea
          id="admin-whatsapp-text"
          value={text}
          disabled={busy !== null || composing || !onWhatsapp}
          onChange={(e) => setText(e.target.value)}
          rows={4}
          maxLength={4096}
          placeholder={t("dashboard.whatsappPlaceholder")}
          className="mt-2 w-full px-4 py-3 bg-slate-800/80 border border-slate-600/50 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 resize-none disabled:opacity-50"
        />
      </div>
      <div className="flex flex-col sm:flex-row sm:flex-wrap sm:items-center gap-3">
        <button
          type="button"
          disabled={busy !== null || !phone || !onWhatsapp}
          onClick={() => run("send")}
          className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-bold transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {busy === "send" ? t("sending") : t("dashboard.whatsappSend")}
        </button>
        {onWhatsapp && card && !card.saved ? (
          <button
            type="button"
            disabled={busy !== null}
            onClick={() => run("save")}
            className="px-5 py-2.5 bg-slate-700 hover:bg-slate-600 text-white rounded-xl font-bold transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {busy === "save" ? t("saving") : t("dashboard.whatsappSave")}
          </button>
        ) : null}
        {onWhatsapp && card?.listFound && !card.onList ? (
          <button
            type="button"
            disabled={busy !== null}
            onClick={() => run("label")}
            className="px-5 py-2.5 bg-slate-700 hover:bg-slate-600 text-white rounded-xl font-bold transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {busy === "label" ? t("saving") : t("dashboard.whatsappAddList")}
          </button>
        ) : null}
      </div>
      {onWhatsapp && card && !card.listFound ? (
        <p className="mt-3 text-sm text-amber-200">{t("dashboard.whatsappListMissing")}</p>
      ) : null}
      {notice ? (
        <p className="mt-3 text-sm text-emerald-300" role="status">
          {notice}
        </p>
      ) : null}
      {error ? (
        <p className="mt-3 text-sm text-rose-300" role="alert">
          {error}
        </p>
      ) : null}
    </div>
  );
}
