"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import type { User } from "@supabase/supabase-js";
import { useAdminI18n } from "../context/AdminI18nContext";
import { useAdminAccess } from "../context/AdminAccessContext";
import { ADMIN_LANGS } from "../i18n/admin";

type NavItem = { href: string; label: string; icon: string };

const LARGE_TYPE_KEY = "ced-admin-large-type";

export default function AdminShell({
  user,
  onLogout,
  children,
}: {
  user?: User | null;
  onLogout?: () => void;
  children?: React.ReactNode;
}) {
  const pathname = usePathname();
  const { lang, setLang, t } = useAdminI18n();
  const access = useAdminAccess();
  const limited = access.role !== "full";
  const [largeType, setLargeType] = useState(false);
  const isUniversities = pathname?.startsWith("/admin/universites");
  const isBlog = pathname?.startsWith("/admin/blog");
  const isReport = pathname?.startsWith("/admin/rapport");

  useEffect(() => {
    if (limited && lang !== "fr") setLang("fr");
  }, [limited, lang, setLang]);

  useEffect(() => {
    if (!limited) return;
    setLargeType(window.localStorage.getItem(LARGE_TYPE_KEY) === "1");
  }, [limited]);

  const nav = (
    [
      { href: "/admin/dashboard", label: t("nav.contacts"), icon: "👥" },
      access.universities
        ? { href: "/admin/universites", label: t("nav.universities"), icon: "🏫" }
        : null,
      access.blog
        ? { href: "/admin/blog", label: t("nav.blog"), icon: "✍️" }
        : null,
      access.blog
        ? { href: "/admin/rapport", label: t("nav.report"), icon: "📈" }
        : null,
    ] as Array<NavItem | null>
  ).filter((item): item is NavItem => item != null);

  const title = isReport
    ? t("report.title")
    : isBlog
      ? t("blog.title")
      : isUniversities
        ? t("universities.title")
        : t("dashboard.title");
  const subtitle = isReport
    ? t("report.subtitle")
    : isBlog
      ? t("blog.subtitle")
      : isUniversities
        ? t("universities.subtitle")
        : t("dashboard.subtitle");

  return (
    <div
      className={`min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950${
        limited && largeType ? " admin-large-type" : ""
      }`}
    >
      <header className="bg-slate-900/80 backdrop-blur-lg border-b border-slate-700/50 sticky top-0 z-40 shadow-2xl">
        <div className="max-w-7xl mx-auto flex flex-col gap-3 px-4 pt-3 sm:flex-row sm:items-center sm:justify-between sm:px-6 sm:pt-5">
          <div className="flex min-w-0 items-center gap-2.5 sm:gap-3">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 shadow-lg sm:h-12 sm:w-12">
              <span className="text-base sm:text-xl">📊</span>
            </div>
            <div className="min-w-0">
              <h1 className="truncate text-lg font-bold text-white sm:text-2xl">{title}</h1>
              <p className="hidden truncate text-xs text-slate-400 sm:block">{subtitle}</p>
            </div>
          </div>

          <div className="flex items-center justify-end gap-2 sm:gap-3">
            {limited ? null : (
              <div className="flex overflow-hidden rounded-lg border border-slate-600/60 sm:rounded-xl">
                {ADMIN_LANGS.map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setLang(item.id)}
                    className={`px-2.5 py-2 text-xs font-bold sm:px-3 sm:py-1.5 ${
                      lang === item.id
                        ? "bg-blue-600 text-white"
                        : "bg-slate-800 text-slate-300 hover:bg-slate-700"
                    }`}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            )}
            <div className="hidden min-w-0 flex-col items-end md:flex">
              <p className="max-w-[220px] truncate text-sm text-slate-200">
                {user?.email}
              </p>
              {limited ? null : (
                <p className="text-xs text-slate-500">{t("connected")}</p>
              )}
            </div>
            {limited ? (
              <button
                type="button"
                aria-pressed={largeType}
                aria-label={largeType ? t("a11yNormalType") : t("a11yLargeType")}
                onClick={() => {
                  const next = !largeType;
                  setLargeType(next);
                  window.localStorage.setItem(LARGE_TYPE_KEY, next ? "1" : "0");
                }}
                className={`whitespace-nowrap rounded-lg border px-2.5 py-2 text-xs font-bold transition-colors sm:px-3.5 sm:text-sm ${
                  largeType
                    ? "border-blue-500 bg-blue-600 text-white"
                    : "border-slate-600 text-slate-300 hover:border-slate-400 hover:text-white"
                }`}
              >
                <span className="sm:hidden">{largeType ? "A−" : "A+"}</span>
                <span className="hidden sm:inline">
                  {largeType ? `A− ${t("a11yNormalType")}` : `A+ ${t("a11yLargeType")}`}
                </span>
              </button>
            ) : null}
            <button
              type="button"
              onClick={onLogout}
              className="whitespace-nowrap rounded-lg border border-slate-600 px-2.5 py-2 text-xs text-slate-300 transition-colors hover:border-slate-400 hover:text-white sm:px-3.5 sm:text-sm"
            >
              {t("logout")}
            </button>
          </div>
        </div>

        <nav
          className={`mx-auto grid max-w-7xl gap-2 px-4 pb-3 pt-3 sm:flex sm:flex-wrap sm:justify-center sm:px-6 sm:pb-5 ${
            nav.length > 1 ? "grid-cols-2" : "grid-cols-1"
          }`}
        >
          {nav.map((item) => {
            const active =
              pathname === item.href ||
              (item.href !== "/admin/dashboard" &&
                Boolean(pathname?.startsWith(item.href)));
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex min-h-11 w-full items-center justify-center gap-1.5 rounded-xl px-3 py-2 text-sm font-bold transition-colors sm:w-auto sm:min-h-0 sm:px-4 ${
                  active
                    ? "bg-blue-600 text-white"
                    : "bg-slate-800 text-slate-300 hover:bg-slate-700"
                }`}
              >
                <span aria-hidden>{item.icon}</span>
                {item.label}
              </Link>
            );
          })}
        </nav>
      </header>
      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 sm:py-8">{children}</div>
    </div>
  );
}
