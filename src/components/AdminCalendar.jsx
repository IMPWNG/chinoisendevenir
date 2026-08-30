"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { adminSupabase } from "../lib/supabase";
import { useAdminI18n } from "../context/AdminI18nContext";
import {
  CALENDAR_TZ,
  DEFAULT_DURATION_MINUTES,
  WORK_END_MINUTES,
  WORK_START_MINUTES,
  addDaysYmd,
  formatHm,
  formatYmd,
  minutesOfDay,
  startOfWeekYmd,
  weekdayIndex,
  zonedLocalToUtc,
} from "../lib/calendar";

async function authedFetch(path, options = {}) {
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

const HOUR_START = 8;
const HOUR_END = 19;
const PX_PER_HOUR = 44;
const GRID_HEIGHT = (HOUR_END - HOUR_START) * PX_PER_HOUR;

const KIND_STYLES = {
  appel: "bg-cyan-500/90 border-cyan-300/40 text-white",
  visio: "bg-violet-500/90 border-violet-300/40 text-white",
  autre: "bg-amber-500/90 border-amber-300/40 text-white",
};

function localeFor(lang) {
  if (lang === "zh") return "zh-CN";
  if (lang === "en") return "en-GB";
  return "fr-FR";
}

function contactLabel(contact) {
  if (!contact) return "";
  return `${contact.prenom || ""} ${contact.nom || ""}`.trim() || contact.email || "";
}

export default function AdminCalendar({ contacts = [], onOpenContact }) {
  const { t, lang } = useAdminI18n();
  const locale = localeFor(lang);
  const todayYmd = formatYmd(new Date());
  const [weekStart, setWeekStart] = useState(() => startOfWeekYmd(todayYmd));
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [missingTable, setMissingTable] = useState(false);
  const [error, setError] = useState("");
  const [draft, setDraft] = useState(null);
  const [activeEvent, setActiveEvent] = useState(null);
  const [saving, setSaving] = useState(false);

  const days = useMemo(
    () => Array.from({ length: 7 }, (_, i) => addDaysYmd(weekStart, i)),
    [weekStart],
  );

  const weekFrom = useMemo(
    () => zonedLocalToUtc(weekStart, "00:00").toISOString(),
    [weekStart],
  );
  const weekTo = useMemo(
    () => zonedLocalToUtc(addDaysYmd(weekStart, 7), "00:00").toISOString(),
    [weekStart],
  );

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const response = await authedFetch(
        `/api/admin/appointments?from=${encodeURIComponent(weekFrom)}&to=${encodeURIComponent(weekTo)}`,
      );
      const data = await response.json();
      if (data.missingTable) {
        setMissingTable(true);
        setEvents([]);
        return;
      }
      setMissingTable(false);
      if (!response.ok || data.success === false) {
        setError(data.error || t("genericError"));
        setEvents([]);
        return;
      }
      setEvents(data.events || []);
    } catch (err) {
      setError(
        err.message === "SESSION" ? t("sessionExpired") : t("genericError"),
      );
    } finally {
      setLoading(false);
    }
  }, [weekFrom, weekTo, t]);

  useEffect(() => {
    load();
  }, [load]);

  const hours = useMemo(
    () => Array.from({ length: HOUR_END - HOUR_START }, (_, i) => HOUR_START + i),
    [],
  );

  const eventsByDay = useMemo(() => {
    const map = Object.fromEntries(days.map((day) => [day, []]));
    for (const event of events) {
      const ymd = formatYmd(new Date(event.starts_at));
      if (map[ymd]) map[ymd].push(event);
    }
    return map;
  }, [days, events]);

  function openCreate(ymd, hour, minute = 0) {
    const hm = `${String(hour).padStart(2, "0")}:${String(minute).padStart(2, "0")}`;
    setActiveEvent(null);
    setDraft({
      ymd,
      startHm: hm,
      duration: DEFAULT_DURATION_MINUTES,
      kind: "appel",
      contactId: "",
      query: "",
      notes: "",
    });
  }

  function positionFor(event) {
    const startMin = minutesOfDay(new Date(event.starts_at));
    const endMin = minutesOfDay(new Date(event.ends_at));
    const top = ((startMin - HOUR_START * 60) / 60) * PX_PER_HOUR;
    const height = Math.max(22, ((endMin - startMin) / 60) * PX_PER_HOUR);
    return { top, height };
  }

  async function saveDraft(event) {
    event?.preventDefault();
    if (!draft?.contactId) {
      alert(t("calendar.needStudent"));
      return;
    }
    setSaving(true);
    try {
      const startsAt = zonedLocalToUtc(draft.ymd, draft.startHm).toISOString();
      const response = await authedFetch("/api/admin/appointments", {
        method: "POST",
        body: JSON.stringify({
          contactId: draft.contactId,
          startsAt,
          durationMinutes: Number(draft.duration) || DEFAULT_DURATION_MINUTES,
          kind: draft.kind,
          notes: draft.notes,
        }),
      });
      const data = await response.json();
      if (!response.ok || !data.success) {
        alert(data.error || t("genericError"));
        return;
      }
      setDraft(null);
      await load();
    } catch (err) {
      alert(err.message === "SESSION" ? t("sessionExpired") : t("genericError"));
    } finally {
      setSaving(false);
    }
  }

  async function removeEvent(id) {
    if (!confirm(t("calendar.deleteConfirm"))) return;
    setSaving(true);
    try {
      const response = await authedFetch("/api/admin/appointments", {
        method: "DELETE",
        body: JSON.stringify({ id }),
      });
      const data = await response.json();
      if (!response.ok || !data.success) {
        alert(data.error || t("genericError"));
        return;
      }
      setActiveEvent(null);
      await load();
    } catch (err) {
      alert(err.message === "SESSION" ? t("sessionExpired") : t("genericError"));
    } finally {
      setSaving(false);
    }
  }

  const filteredContacts = useMemo(() => {
    const q = (draft?.query || "").trim().toLowerCase();
    const list = contacts || [];
    if (!q) return list.slice(0, 8);
    return list
      .filter((c) =>
        `${c.prenom || ""} ${c.nom || ""} ${c.email || ""}`
          .toLowerCase()
          .includes(q),
      )
      .slice(0, 8);
  }, [contacts, draft?.query]);

  const weekLabel = new Date(zonedLocalToUtc(weekStart, "12:00")).toLocaleDateString(
    locale,
    { timeZone: CALENDAR_TZ, day: "numeric", month: "long", year: "numeric" },
  );

  return (
    <div className="bg-slate-800/40 backdrop-blur-md rounded-2xl shadow-2xl p-5 mb-8 border border-slate-700/50">
      <div className="flex flex-col lg:flex-row lg:items-center gap-4 mb-5">
        <div className="flex-1">
          <p className="text-white font-bold">📅 {t("calendar.title")}</p>
          <p className="text-xs text-slate-400 mt-1">{t("calendar.hint")}</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => setWeekStart(addDaysYmd(weekStart, -7))}
            className="px-3 py-2 bg-slate-700/70 hover:bg-slate-600 text-white rounded-xl text-sm font-bold"
          >
            ← {t("calendar.prev")}
          </button>
          <p className="text-sm text-slate-200 font-semibold min-w-[10rem] text-center">
            {weekLabel}
          </p>
          <button
            type="button"
            onClick={() => setWeekStart(addDaysYmd(weekStart, 7))}
            className="px-3 py-2 bg-slate-700/70 hover:bg-slate-600 text-white rounded-xl text-sm font-bold"
          >
            {t("calendar.next")} →
          </button>
          <button
            type="button"
            onClick={() => setWeekStart(startOfWeekYmd(todayYmd))}
            className="px-3 py-2 bg-slate-700/70 hover:bg-slate-600 text-white rounded-xl text-sm font-bold"
          >
            {t("calendar.today")}
          </button>
          <button
            type="button"
            onClick={() => openCreate(todayYmd, 10, 0)}
            className="px-4 py-2 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white rounded-xl text-sm font-bold"
          >
            + {t("calendar.add")}
          </button>
        </div>
      </div>

      {missingTable ? (
        <p className="text-sm text-amber-200 bg-amber-500/10 border border-amber-500/30 rounded-xl px-4 py-3">
          {t("calendar.missingTable")}
        </p>
      ) : error ? (
        <p className="text-sm text-rose-300">{error}</p>
      ) : (
        <div className="overflow-x-auto">
          <div className="min-w-[720px]">
            <div className="grid grid-cols-[56px_repeat(7,minmax(0,1fr))] gap-px mb-1">
              <div />
              {days.map((ymd) => {
                const isToday = ymd === todayYmd;
                const label = zonedLocalToUtc(ymd, "12:00").toLocaleDateString(
                  locale,
                  {
                    timeZone: CALENDAR_TZ,
                    weekday: "short",
                    day: "numeric",
                    month: "short",
                  },
                );
                return (
                  <div
                    key={ymd}
                    className={`text-center text-xs font-bold py-2 rounded-lg ${
                      isToday
                        ? "bg-cyan-500/20 text-cyan-200"
                        : "text-slate-400"
                    }`}
                  >
                    {label}
                  </div>
                );
              })}
            </div>
            <div className="grid grid-cols-[56px_repeat(7,minmax(0,1fr))] gap-px relative">
              <div className="relative" style={{ height: GRID_HEIGHT }}>
                {hours.map((hour) => (
                  <div
                    key={hour}
                    className="absolute right-1 text-[10px] text-slate-500 font-semibold"
                    style={{ top: (hour - HOUR_START) * PX_PER_HOUR - 6 }}
                  >
                    {String(hour).padStart(2, "0")}:00
                  </div>
                ))}
              </div>
              {days.map((ymd) => (
                <div
                  key={ymd}
                  className="relative bg-slate-900/40 border border-slate-700/40 rounded-lg overflow-hidden"
                  style={{ height: GRID_HEIGHT }}
                  onClick={(e) => {
                    const rect = e.currentTarget.getBoundingClientRect();
                    const y = e.clientY - rect.top;
                    const minutesFromStart = (y / PX_PER_HOUR) * 60;
                    const abs = HOUR_START * 60 + minutesFromStart;
                    const snapped = Math.round(abs / 30) * 30;
                    const hour = Math.min(
                      18,
                      Math.max(8, Math.floor(snapped / 60)),
                    );
                    const minute = snapped % 60 === 30 ? 30 : 0;
                    openCreate(ymd, hour, minute);
                  }}
                >
                  {hours.map((hour) => {
                    const work =
                      hour * 60 >= WORK_START_MINUTES &&
                      hour * 60 < WORK_END_MINUTES &&
                      weekdayIndex(ymd) !== 0 &&
                      weekdayIndex(ymd) !== 6;
                    return (
                      <div
                        key={hour}
                        className={`absolute left-0 right-0 border-t ${
                          work ? "border-slate-700/70" : "border-slate-800/80"
                        }`}
                        style={{
                          top: (hour - HOUR_START) * PX_PER_HOUR,
                          height: PX_PER_HOUR,
                          background: work ? "transparent" : "rgba(15,23,42,0.35)",
                        }}
                      />
                    );
                  })}
                  {(eventsByDay[ymd] || []).map((event) => {
                    const pos = positionFor(event);
                    const name = contactLabel(event.contact) || t("calendar.unknown");
                    return (
                      <button
                        key={event.id}
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setDraft(null);
                          setActiveEvent(event);
                        }}
                        className={`absolute left-1 right-1 rounded-md border px-1.5 py-0.5 text-left shadow-lg overflow-hidden ${
                          KIND_STYLES[event.kind] || KIND_STYLES.appel
                        }`}
                        style={{ top: pos.top, height: pos.height }}
                        title={name}
                      >
                        <p className="text-[10px] font-bold leading-tight truncate">
                          {formatHm(new Date(event.starts_at))} {name}
                        </p>
                      </button>
                    );
                  })}
                </div>
              ))}
            </div>
          </div>
          {loading ? (
            <p className="text-xs text-slate-500 mt-3">{t("loading")}</p>
          ) : null}
        </div>
      )}

      {draft ? (
        <form
          onSubmit={saveDraft}
          className="mt-5 rounded-2xl border border-cyan-500/30 bg-slate-900/70 p-4 space-y-3"
        >
          <p className="text-sm font-bold text-white">{t("calendar.newTitle")}</p>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
            <input
              type="date"
              value={draft.ymd}
              onChange={(e) => setDraft((prev) => ({ ...prev, ymd: e.target.value }))}
              className="px-3 py-2 bg-slate-800 border border-slate-600 rounded-xl text-white text-sm"
            />
            <input
              type="time"
              value={draft.startHm}
              onChange={(e) =>
                setDraft((prev) => ({ ...prev, startHm: e.target.value }))
              }
              className="px-3 py-2 bg-slate-800 border border-slate-600 rounded-xl text-white text-sm"
            />
            <select
              value={draft.duration}
              onChange={(e) =>
                setDraft((prev) => ({ ...prev, duration: Number(e.target.value) }))
              }
              className="px-3 py-2 bg-slate-800 border border-slate-600 rounded-xl text-white text-sm"
            >
              <option value={30}>30 min</option>
              <option value={45}>45 min</option>
              <option value={60}>60 min</option>
            </select>
            <select
              value={draft.kind}
              onChange={(e) => setDraft((prev) => ({ ...prev, kind: e.target.value }))}
              className="px-3 py-2 bg-slate-800 border border-slate-600 rounded-xl text-white text-sm"
            >
              <option value="appel">{t("calendar.kindAppel")}</option>
              <option value="visio">{t("calendar.kindVisio")}</option>
              <option value="autre">{t("calendar.kindAutre")}</option>
            </select>
          </div>
          <input
            type="text"
            value={draft.query}
            onChange={(e) =>
              setDraft((prev) => ({
                ...prev,
                query: e.target.value,
                contactId: "",
              }))
            }
            placeholder={t("calendar.searchStudent")}
            className="w-full px-3 py-2 bg-slate-800 border border-slate-600 rounded-xl text-white text-sm placeholder-slate-500"
          />
          <div className="flex flex-wrap gap-2">
            {filteredContacts.map((c) => (
              <button
                key={c.id}
                type="button"
                onClick={() =>
                  setDraft((prev) => ({
                    ...prev,
                    contactId: c.id,
                    query: contactLabel(c),
                  }))
                }
                className={`px-3 py-1.5 rounded-lg text-xs font-bold border ${
                  String(draft.contactId) === String(c.id)
                    ? "bg-cyan-500/20 border-cyan-400 text-white"
                    : "bg-slate-800 border-slate-600 text-slate-300 hover:bg-slate-700"
                }`}
              >
                {contactLabel(c)}
              </button>
            ))}
          </div>
          <div className="flex gap-3">
            <button
              type="submit"
              disabled={saving}
              className="px-5 py-2 bg-gradient-to-r from-cyan-600 to-blue-600 text-white rounded-xl font-bold disabled:opacity-50"
            >
              {saving ? t("saving") : t("calendar.save")}
            </button>
            <button
              type="button"
              onClick={() => setDraft(null)}
              className="px-5 py-2 bg-slate-700 text-white rounded-xl font-bold"
            >
              {t("cancel")}
            </button>
          </div>
        </form>
      ) : null}

      {activeEvent ? (
        <div className="mt-5 rounded-2xl border border-slate-600/50 bg-slate-900/70 p-4 flex flex-col sm:flex-row sm:items-center gap-3">
          <div className="flex-1">
            <p className="text-white font-bold">
              {contactLabel(activeEvent.contact) || t("calendar.unknown")}
            </p>
            <p className="text-sm text-slate-300 mt-1">
              {new Date(activeEvent.starts_at).toLocaleString(locale, {
                timeZone: CALENDAR_TZ,
                weekday: "long",
                day: "numeric",
                month: "long",
                hour: "2-digit",
                minute: "2-digit",
              })}{" "}
              → {formatHm(new Date(activeEvent.ends_at))} ({t("calendar.paris")})
            </p>
            <p className="text-xs text-slate-500 mt-1">
              {t(`calendar.kind${activeEvent.kind === "visio" ? "Visio" : activeEvent.kind === "autre" ? "Autre" : "Appel"}`)}
              {activeEvent.source === "ai_reply" ? ` · ${t("calendar.fromAi")}` : ""}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            {activeEvent.contact && onOpenContact ? (
              <button
                type="button"
                onClick={() => onOpenContact(activeEvent.contact)}
                className="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-xl text-sm font-bold"
              >
                {t("dashboard.view")}
              </button>
            ) : null}
            <button
              type="button"
              disabled={saving}
              onClick={() => removeEvent(activeEvent.id)}
              className="px-4 py-2 bg-rose-600/80 hover:bg-rose-500 text-white rounded-xl text-sm font-bold disabled:opacity-50"
            >
              {t("delete")}
            </button>
            <button
              type="button"
              onClick={() => setActiveEvent(null)}
              className="px-4 py-2 bg-slate-700 text-white rounded-xl text-sm font-bold"
            >
              {t("close")}
            </button>
          </div>
        </div>
      ) : null}
    </div>
  );
}
