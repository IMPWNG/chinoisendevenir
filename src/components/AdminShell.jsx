"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAdminI18n } from "../context/AdminI18nContext";
import { ADMIN_LANGS } from "../i18n/admin";

export default function AdminShell({ user, onLogout, children }) {
  const pathname = usePathname();
  const { lang, setLang, t } = useAdminI18n();
  const isUniversities = pathname?.startsWith("/admin/universites");

  const nav = [
    { href: "/admin/dashboard", label: t("nav.contacts"), icon: "👥" },
    { href: "/admin/universites", label: t("nav.universities"), icon: "🏫" },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
      <header className="bg-slate-900/80 backdrop-blur-lg border-b border-slate-700/50 sticky top-0 z-40 shadow-2xl">
        <div className="max-w-7xl mx-auto px-6 py-5 flex flex-wrap justify-between items-center gap-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
              <span className="text-xl">📊</span>
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white">
                {isUniversities ? t("universities.title") : t("dashboard.title")}
              </h1>
              <p className="text-xs text-slate-400">
                {isUniversities
                  ? t("universities.subtitle")
                  : t("dashboard.subtitle")}
              </p>
            </div>
          </div>

          <nav className="flex flex-wrap items-center gap-2">
            {nav.map((item) => {
              const active = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`px-4 py-2 rounded-xl text-sm font-bold transition-all duration-200 ${
                    active
                      ? "bg-blue-600 text-white"
                      : "bg-slate-800 text-slate-300 hover:bg-slate-700"
                  }`}
                >
                  {item.icon} {item.label}
                </Link>
              );
            })}
          </nav>

          <div className="flex items-center gap-3">
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
            <div className="text-right hidden sm:block">
              <p className="text-sm text-white font-medium">{user?.email}</p>
              <p className="text-xs text-slate-400">{t("connected")}</p>
            </div>
            <div className="w-11 h-11 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold text-lg shadow-lg">
              {user?.email?.[0]?.toUpperCase()}
            </div>
            <button
              onClick={onLogout}
              className="text-sm bg-gradient-to-r from-red-600 to-red-500 hover:from-red-700 hover:to-red-600 text-white px-5 py-2 rounded-lg font-semibold transition-all duration-300 shadow-lg hover:shadow-red-500/50"
            >
              🚪 {t("logout")}
            </button>
          </div>
        </div>
      </header>
      <div className="max-w-7xl mx-auto px-6 py-8">{children}</div>
    </div>
  );
}
