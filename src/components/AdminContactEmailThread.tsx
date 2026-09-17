"use client";

import { useEffect, useRef, useState } from "react";
import { adminSupabase } from "../lib/supabase";
import { useAdminI18n } from "../context/AdminI18nContext";
import type { ContactEmailRow } from "../lib/contactEmails";

function localeFor(lang: string) {
  if (lang === "zh") return "zh-CN";
  if (lang === "en") return "en-GB";
  return "fr-FR";
}

function formatWhen(iso: string, lang: string) {
  try {
    return new Date(iso).toLocaleString(localeFor(lang), {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return iso;
  }
}

export default function AdminContactEmailThread({
  contactId,
  refreshKey = 0,
  onMarkedRead,
}: {
  contactId: string;
  refreshKey?: number;
  onMarkedRead?: () => void;
}) {
  const { t, lang } = useAdminI18n();
  const [emails, setEmails] = useState<ContactEmailRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [missingTable, setMissingTable] = useState(false);
  const bottomRef = useRef<HTMLDivElement | null>(null);
  const markedRef = useRef<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      setLoading(true);
      setMissingTable(false);
      const { data, error } = await adminSupabase
        .from("contact_emails")
        .select("*")
        .eq("contact_id", contactId)
        .order("sent_at", { ascending: true });

      if (cancelled) return;

      if (error) {
        if (/relation|does not exist|schema cache/i.test(error.message)) {
          setMissingTable(true);
        }
        setEmails([]);
        setLoading(false);
        return;
      }

      setEmails((data || []) as ContactEmailRow[]);
      setLoading(false);

      const hasUnread = (data || []).some(
        (row) =>
          (row as ContactEmailRow).direction === "in" &&
          !(row as ContactEmailRow).read_at,
      );
      if (hasUnread && markedRef.current !== contactId) {
        markedRef.current = contactId;
        const now = new Date().toISOString();
        await adminSupabase
          .from("contact_emails")
          .update({ read_at: now })
          .eq("contact_id", contactId)
          .eq("direction", "in")
          .is("read_at", null);
        onMarkedRead?.();
      }
    }
    load();
    return () => {
      cancelled = true;
    };
  }, [contactId, refreshKey]); // onMarkedRead intentional omit — parent inline callback

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [emails.length]);

  return (
    <div className="mb-8 pb-8 border-b border-slate-700/50">
      <label className="text-sm font-bold text-slate-300 block mb-3 uppercase tracking-wide">
        💬 {t("dashboard.emailThreadTitle")}
      </label>

      {missingTable ? (
        <p className="text-sm text-amber-200/90 bg-amber-500/10 border border-amber-500/30 rounded-xl px-4 py-3">
          {t("dashboard.emailThreadMissingTable")}
        </p>
      ) : loading ? (
        <p className="text-sm text-slate-400">{t("dashboard.emailThreadLoading")}</p>
      ) : emails.length === 0 ? (
        <p className="text-sm text-slate-400">{t("dashboard.emailThreadEmpty")}</p>
      ) : (
        <div className="max-h-80 overflow-y-auto space-y-3 pr-1 rounded-xl bg-slate-900/40 border border-slate-700/40 p-4">
          {emails.map((email) => {
            const inbound = email.direction === "in";
            return (
              <div
                key={email.id}
                className={`flex ${inbound ? "justify-start" : "justify-end"}`}
              >
                <div
                  className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm shadow-sm ${
                    inbound
                      ? "bg-slate-700/80 text-slate-100 rounded-bl-md"
                      : "bg-blue-600/90 text-white rounded-br-md"
                  }`}
                >
                  <div
                    className={`text-[11px] font-semibold mb-1 ${
                      inbound ? "text-slate-300" : "text-blue-100"
                    }`}
                  >
                    {inbound
                      ? t("dashboard.emailThreadInbound")
                      : t("dashboard.emailThreadOutbound")}
                    {" · "}
                    {formatWhen(email.sent_at, lang)}
                  </div>
                  {email.subject ? (
                    <p className="font-bold mb-1.5 leading-snug">{email.subject}</p>
                  ) : null}
                  <p className="whitespace-pre-wrap leading-relaxed opacity-95">
                    {email.body_text || "—"}
                  </p>
                </div>
              </div>
            );
          })}
          <div ref={bottomRef} />
        </div>
      )}
    </div>
  );
}
