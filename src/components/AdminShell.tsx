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

  return (
    <div
      className={`min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950${
        limited && largeType ? " admin-large-type" : ""
      }`}
    >
      <header className="bg-slate-900/80 backdrop-blur-lg border-b border-slate-700/50 sticky top-0 z-40 shadow-2xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 sm:py-4">
          <div className="flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between xl:gap-4">
            <div className="flex items-center justify-between gap-3 min-w-0 xl:contents">
              <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
                <div className="w-10 h-10 sm:w-12 sm:h-12 shrink-0 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
                  <span className="text-lg sm:text-xl">📊</span>
                </div>
                <div className="min-w-0">
                  <h1 className="text-lg sm:text-xl xl:text-2xl font-bold text-white truncate">
                    {title}
                  </h1>
                  <p className="hidden sm:block text-xs text-slate-400 truncate max-w-[18rem] md:max-w-md">
                    {subtitle}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0 xl:hidden">
                {limited ? (
                  <button
                    type="button"
                    aria-pressed={largeType}
                    onClick={() => {
                      const next = !largeType;
                      setLargeType(next);
                      window.localStorage.setItem(LARGE_TYPE_KEY, next ? "1" : "0");
                    }}
                    className={`text-sm font-bold px-3 py-2 rounded-lg border transition-colors ${
                      largeType
                        ? "bg-blue-600 text-white border-blue-500"
                        : "text-slate-300 border-slate-600 hover:border-slate-400 hover:text-white"
                    }`}
                  >
                    {largeType ? "A−" : "A+"}
                  </button>
                ) : null}
                <button
                  type="button"
                  onClick={onLogout}
                  className="text-sm text-slate-300 hover:text-white border border-slate-600 hover:border-slate-400 px-3 py-2 rounded-lg transition-colors"
                >
                  {t("logout")}
                </button>
              </div>
            </div>

            <nav
              aria-label={title}
              className="-mx-4 px-4 sm:mx-0 sm:px-0 flex items-center gap-2 overflow-x-auto overscroll-x-contain [scrollbar-width:none] [&::-webkit-scrollbar]:hidden sm:flex-wrap sm:overflow-visible"
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
                    aria-current={active ? "page" : undefined}
                    className={`shrink-0 whitespace-nowrap px-3.5 py-2.5 sm:px-4 sm:py-2 rounded-xl text-sm font-bold transition-all duration-200 ${
                      active
                        ? "bg-blue-600 text-white"
                        : "bg-slate-800 text-slate-300 hover:bg-slate-700"
                    }`}
                  >
                    {item.icon} {item.label}
                  </Link>
                );
              })}
              {limited ? null : (
                <div className="flex shrink-0 rounded-xl overflow-hidden border border-slate-600/60 xl:hidden">
                  {ADMIN_LANGS.map((item) => (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => setLang(item.id)}
                      className={`px-2.5 py-2.5 text-xs font-bold ${
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
            </nav>

            <div className="hidden xl:flex items-center gap-3">
              {limited ? null : (
                <div className="flex rounded-xl overflow-hidden border border-slate-600/60">
                  {ADMIN_LANGS.map((item) => (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => setLang(item.id)}
                      className={`px-3 py-1.5 text-xs font-bold ${
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
              <div className="flex flex-col items-end min-w-0">
                <p className="text-sm text-slate-200 truncate max-w-[220px]">
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
                  onClick={() => {
                    const next = !largeType;
                    setLargeType(next);
                    window.localStorage.setItem(LARGE_TYPE_KEY, next ? "1" : "0");
                  }}
                  className={`text-sm font-bold px-3.5 py-2 rounded-lg border transition-colors ${
                    largeType
                      ? "bg-blue-600 text-white border-blue-500"
                      : "text-slate-300 border-slate-600 hover:border-slate-400 hover:text-white"
                  }`}
                >
                  {largeType ? `A− ${t("a11yNormalType")}` : `A+ ${t("a11yLargeType")}`}
                </button>
              ) : null}
              <button
                type="button"
                onClick={onLogout}
                className="text-sm text-slate-300 hover:text-white border border-slate-600 hover:border-slate-400 px-3.5 py-2 rounded-lg transition-colors"
              >
                {t("logout")}
              </button>
            </div>
          </div>
        </div>
      </header>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-8">{children}</div>
    </div>
  );
}
