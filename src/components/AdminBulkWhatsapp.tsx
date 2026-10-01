"use client";

import { useMemo, useState } from "react";
import { adminSupabase } from "../lib/supabase";
import { useAdminI18n } from "../context/AdminI18nContext";
import { errorMessage } from "../lib/request";

const MAX_RECIPIENTS = 40;
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

export default function AdminBulkWhatsapp({
  contacts,
  selectedIds,
  onSelectedIdsChange,
  onFinished,
}: {
  contacts: BulkContact[];
  selectedIds: string[];
  onSelectedIdsChange: (ids: string[]) => void;
  onFinished?: () => void | Promise<void>;
}) {
  const { t } = useAdminI18n();
  const [text, setText] = useState("");
  const [saveContact, setSaveContact] = useState(false);
  const [addList, setAddList] = useState(false);
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
  const missingPhone = selected.length - recipients.length;

  async function sendBulk() {
    const message = text.trim();
    if (!message && !saveContact && !addList) {
      alert(t("dashboard.waBulkEmpty"));
      return;
    }
    if (recipients.length === 0) {
      alert(t("dashboard.waBulkNoPhone"));
      return;
    }
    if (recipients.length > MAX_RECIPIENTS) {
      alert(t("dashboard.bulkTooMany"));
      return;
    }
    const confirmed = confirm(
      t("dashboard.waBulkConfirm", {
        count: recipients.length,
        extra: [
          saveContact ? t("dashboard.waBulkSave") : "",
          addList ? t("dashboard.waBulkList") : "",
        ]
          .filter(Boolean)
          .join("\n"),
      }),
    );
    if (!confirmed) return;

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
              text: message,
              save: saveContact,
              label: addList,
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
        if (i < recipients.length - 1) await wait(message ? SEND_PAUSE_MS : 800);
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
    <div className="bg-slate-800/40 backdrop-blur-md rounded-2xl shadow-2xl p-5 mb-8 border border-slate-700/50">
      <div className="flex flex-col gap-4">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-white font-bold">
              💬 {t("dashboard.waBulkTitle")}
              {selectedIds.length > 0
                ? ` — ${t("dashboard.bulkSelected", { count: selectedIds.length })}`
                : ""}
            </p>
            <p className="text-xs text-slate-400 mt-1">
              {sending && progress
                ? t("dashboard.bulkProgress", progress)
                : t("dashboard.waBulkHint")}
            </p>
          </div>
          <button
            type="button"
            onClick={() => setCollapsed((value) => !value)}
            className="text-xs font-bold text-slate-300 px-3 py-2 rounded-lg border border-slate-600/60"
          >
            {collapsed ? t("dashboard.bulkExpand") : t("dashboard.bulkCollapse")}
          </button>
        </div>

        {collapsed ? null : (
          <>
            <textarea
              value={text}
              onChange={(event) => setText(event.target.value)}
              rows={5}
              disabled={sending}
              placeholder={t("dashboard.waBulkPlaceholder")}
              className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600/50 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/40 resize-y"
            />
            <label className="flex items-start gap-3 text-sm text-slate-200">
              <input
                type="checkbox"
                checked={saveContact}
                disabled={sending}
                onChange={(event) => setSaveContact(event.target.checked)}
                className="mt-1"
              />
              <span>{t("dashboard.waBulkSave")}</span>
            </label>
            <label className="flex items-start gap-3 text-sm text-slate-200">
              <input
                type="checkbox"
                checked={addList}
                disabled={sending}
                onChange={(event) => setAddList(event.target.checked)}
                className="mt-1"
              />
              <span>{t("dashboard.waBulkList")}</span>
            </label>
            {missingPhone > 0 ? (
              <p className="text-xs text-amber-300">
                {t("dashboard.waBulkMissingPhone", { count: missingPhone })}
              </p>
            ) : null}
            <button
              type="button"
              onClick={sendBulk}
              disabled={sending || recipients.length === 0}
              className="self-start px-5 py-3 bg-gradient-to-r from-emerald-600 to-teal-600 text-white rounded-xl font-bold disabled:opacity-50"
            >
              {sending && progress
                ? t("dashboard.sendingCount", progress)
                : t("dashboard.send", { count: recipients.length })}
            </button>
          </>
        )}
      </div>
    </div>
  );
}
