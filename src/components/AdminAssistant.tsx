"use client";

import { useEffect, useId, useRef, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useAdminI18n } from "../context/AdminI18nContext";
import { ASSISTANT_TABLE_KEY } from "../lib/assistantDossiers";
import { adminSupabase } from "../lib/supabase";

type ChatContact = { id: string; name: string };
type Turn = { role: "user" | "assistant"; content: string; contacts?: ChatContact[] };

function showContacts(ids: string[], onDashboard: boolean, go: (href: string) => void) {
  const clean = ids.filter(Boolean).slice(0, 100);
  if (!clean.length) return;
  if (onDashboard) {
    window.dispatchEvent(new CustomEvent(ASSISTANT_TABLE_KEY, { detail: { ids: clean } }));
    return;
  }
  sessionStorage.setItem(ASSISTANT_TABLE_KEY, JSON.stringify(clean));
  go("/admin/dashboard");
}

export default function AdminAssistant() {
  const { t } = useAdminI18n();
  const pathname = usePathname();
  const router = useRouter();
  const titleId = useId();
  const listRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState("");
  const [turns, setTurns] = useState<Turn[]>([]);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!open) return;
    inputRef.current?.focus();
  }, [open]);

  useEffect(() => {
    const list = listRef.current;
    if (list) list.scrollTop = list.scrollHeight;
  }, [turns, busy, error, open]);

  useEffect(() => {
    if (!open) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  async function send() {
    const question = draft.trim();
    if (!question || busy) return;
    const next = [...turns, { role: "user" as const, content: question }];
    setTurns(next);
    setDraft("");
    setError("");
    setBusy(true);
    try {
      const {
        data: { session },
      } = await adminSupabase.auth.getSession();
      if (!session?.access_token) throw new Error("SESSION");
      const response = await fetch("/api/admin/assistant", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${session.access_token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ messages: next }),
      });
      const data = (await response.json().catch(() => ({}))) as {
        reply?: unknown;
        error?: unknown;
        contacts?: unknown;
      };
      if (!response.ok || typeof data.reply !== "string" || !data.reply.trim()) {
        throw new Error(typeof data.error === "string" ? data.error : t("assistant.error"));
      }
      const contacts = Array.isArray(data.contacts)
        ? data.contacts.flatMap((item) => {
            if (!item || typeof item !== "object") return [];
            const row = item as { id?: unknown; name?: unknown };
            const id = String(row.id || "").trim();
            if (!id) return [];
            return [{ id, name: String(row.name || "").trim() }];
          })
        : [];
      setTurns((current) => [
        ...current,
        { role: "assistant", content: data.reply as string, contacts },
      ]);
    } catch (err: unknown) {
      setError(err instanceof Error && err.message !== "SESSION" ? err.message : t("assistant.error"));
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="fixed bottom-4 right-4 z-[45] flex flex-col items-end gap-2">
      {open ? (
        <section
          role="dialog"
          aria-modal="false"
          aria-labelledby={titleId}
          className="flex h-[min(32rem,calc(100dvh-6.5rem))] w-[min(24rem,calc(100vw-2rem))] flex-col overflow-hidden rounded-2xl border border-slate-700 bg-slate-900 shadow-2xl"
        >
          <header className="flex items-start justify-between gap-3 border-b border-slate-700/80 px-4 py-3">
            <div>
              <h2 id={titleId} className="text-sm font-bold text-white">
                {t("assistant.title")}
              </h2>
              <p className="mt-0.5 text-xs text-slate-400">{t("assistant.hint")}</p>
            </div>
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="rounded-lg px-2 py-1 text-xs text-slate-300 hover:bg-slate-800 hover:text-white"
            >
              {t("close")}
            </button>
          </header>
          <div ref={listRef} className="flex flex-1 flex-col gap-2 overflow-y-auto px-3 py-3" aria-live="polite">
            {turns.length === 0 ? (
              <p className="px-1 text-sm text-slate-400">{t("assistant.empty")}</p>
            ) : null}
            {turns.map((turn, index) => (
              <div
                key={`${turn.role}-${index}`}
                className={`flex max-w-[90%] flex-col gap-1 ${
                  turn.role === "user" ? "self-end" : "self-start"
                }`}
              >
                <p
                  className={`whitespace-pre-wrap rounded-2xl px-3 py-2 text-sm leading-snug ${
                    turn.role === "user"
                      ? "bg-blue-600 text-white"
                      : "bg-slate-800 text-slate-100"
                  }`}
                >
                  {turn.content}
                </p>
                {turn.role === "assistant" && turn.contacts?.length ? (
                  <button
                    type="button"
                    onClick={() =>
                      showContacts(
                        turn.contacts?.map((contact) => contact.id) || [],
                        Boolean(pathname?.startsWith("/admin/dashboard")),
                        (href) => router.push(href),
                      )
                    }
                    className="self-start rounded-lg bg-white px-2.5 py-1 text-xs font-bold text-slate-900 hover:bg-slate-200"
                  >
                    {t("assistant.showInTable")}
                  </button>
                ) : null}
              </div>
            ))}
            {busy ? <p className="px-1 text-xs text-slate-400">{t("assistant.thinking")}</p> : null}
            {error ? <p className="px-1 text-xs text-red-300">{error}</p> : null}
          </div>
          <form
            className="flex items-end gap-2 border-t border-slate-700/80 p-3"
            onSubmit={(event) => {
              event.preventDefault();
              void send();
            }}
          >
            <label className="sr-only" htmlFor={`${titleId}-q`}>
              {t("assistant.placeholder")}
            </label>
            <textarea
              id={`${titleId}-q`}
              ref={inputRef}
              rows={2}
              value={draft}
              placeholder={t("assistant.placeholder")}
              onChange={(event) => setDraft(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === "Enter" && !event.shiftKey) {
                  event.preventDefault();
                  void send();
                }
              }}
              className="min-h-11 flex-1 resize-none rounded-xl border border-slate-600 bg-slate-950 px-3 py-2 text-sm text-white placeholder:text-slate-500 focus:border-blue-500 focus:outline-none"
            />
            <button
              type="submit"
              disabled={busy || !draft.trim()}
              className="rounded-xl bg-blue-600 px-3 py-2 text-sm font-bold text-white disabled:opacity-40"
            >
              {t("assistant.send")}
            </button>
          </form>
        </section>
      ) : null}
      <button
        type="button"
        aria-expanded={open}
        onClick={() => setOpen((value) => !value)}
        className="rounded-full bg-blue-600 px-4 py-3 text-sm font-bold text-white shadow-lg hover:bg-blue-500"
      >
        {t("assistant.open")}
      </button>
    </div>
  );
}
