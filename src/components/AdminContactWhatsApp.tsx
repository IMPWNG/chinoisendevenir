"use client";

import { useEffect, useState } from "react";
import { useAdminI18n } from "../context/AdminI18nContext";
import { adminSupabase } from "../lib/supabase";
import { errorMessage } from "../lib/request";

type WhatsappContact = {
  id: string;
  phone?: string | null;
  prenom?: string | null;
  nom?: string | null;
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

export default function AdminContactWhatsApp({
  contact,
  onDone,
}: {
  contact: WhatsappContact;
  onDone?: () => void;
}) {
  const { t } = useAdminI18n();
  const [text, setText] = useState("");
  const [busy, setBusy] = useState<"send" | "save" | null>(null);
  const [notice, setNotice] = useState("");
  const [error, setError] = useState("");
  const phone = String(contact.phone || "").trim();

  useEffect(() => {
    setText("");
    setNotice("");
    setError("");
  }, [contact.id]);

  async function run(action: "send" | "save") {
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
        action === "send" ? t("dashboard.whatsappSent") : t("dashboard.whatsappSaved"),
      );
      onDone?.();
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

  return (
    <div className="mb-8 pb-8 border-b border-slate-700/50">
      <label className="text-sm font-bold text-slate-300 block mb-3 uppercase tracking-wide">
        💬 {t("dashboard.whatsappSection")}
      </label>
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
          disabled={busy !== null}
          onChange={(e) => setText(e.target.value)}
          rows={4}
          maxLength={4096}
          placeholder={t("dashboard.whatsappPlaceholder")}
          className="mt-2 w-full px-4 py-3 bg-slate-800/80 border border-slate-600/50 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 resize-none disabled:opacity-50"
        />
      </div>
      <div className="flex flex-col sm:flex-row sm:items-center gap-3">
        <button
          type="button"
          disabled={busy !== null || !phone}
          onClick={() => run("send")}
          className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-bold transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {busy === "send" ? t("sending") : t("dashboard.whatsappSend")}
        </button>
        <button
          type="button"
          disabled={busy !== null || !phone}
          onClick={() => run("save")}
          className="px-5 py-2.5 bg-slate-700 hover:bg-slate-600 text-white rounded-xl font-bold transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {busy === "save" ? t("saving") : t("dashboard.whatsappSave")}
        </button>
      </div>
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
