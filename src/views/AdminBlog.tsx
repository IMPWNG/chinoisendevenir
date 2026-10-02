"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAdminAuth } from "../context/AdminAuthContext";
import { useAdminI18n } from "../context/AdminI18nContext";
import AdminShell from "../components/AdminShell";
import { adminSupabase } from "../lib/supabase";
import { blogPath, type BlogPost } from "../lib/blog";
import { errorMessage } from "../lib/request";

type CatalogRow = {
  id: string | null;
  source: "ai" | "static";
  live: boolean;
  created_at: string;
  created_by: string | null;
  post: BlogPost;
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

export default function AdminBlog() {
  const { user, signOut } = useAdminAuth();
  const router = useRouter();
  const { t } = useAdminI18n();
  const [posts, setPosts] = useState<CatalogRow[]>([]);
  const [today, setToday] = useState("");
  const [generatedToday, setGeneratedToday] = useState(0);
  const [dailyLimit, setDailyLimit] = useState(2);
  const [loading, setLoading] = useState(true);
  const [working, setWorking] = useState("");
  const [error, setError] = useState("");
  const [info, setInfo] = useState("");

  const applyCatalog = (payload: {
    posts?: CatalogRow[];
    today?: string;
    generatedToday?: number;
    dailyLimit?: number;
  }) => {
    const rows = [...(payload.posts || [])].sort((a, b) =>
      a.post.publishedAt === b.post.publishedAt
        ? a.post.slug.localeCompare(b.post.slug)
        : a.post.publishedAt < b.post.publishedAt
          ? 1
          : -1,
    );
    setPosts(rows);
    if (payload.today) setToday(payload.today);
    if (typeof payload.generatedToday === "number") {
      setGeneratedToday(payload.generatedToday);
    }
    if (typeof payload.dailyLimit === "number") setDailyLimit(payload.dailyLimit);
  };

  const load = async () => {
    setError("");
    try {
      const response = await authedFetch("/api/admin/blog");
      const payload = await response.json();
      if (!response.ok) throw new Error(payload.error || "Lecture impossible");
      applyCatalog(payload);
    } catch (err: unknown) {
      setError(
        errorMessage(err) === "SESSION" ? t("sessionExpired") : errorMessage(err),
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleLogout = async () => {
    await signOut();
    router.push("/admin/login");
  };

  const generate = async () => {
    setWorking("generate");
    setError("");
    setInfo("");
    try {
      const response = await authedFetch("/api/admin/blog", { method: "POST" });
      const payload = await response.json();
      if (!response.ok) throw new Error(payload.error || "Génération impossible");
      applyCatalog(payload);
      setInfo(
        payload.post?.title
          ? `Publié : ${payload.post.title}`
          : "Article généré et publié.",
      );
    } catch (err: unknown) {
      setError(
        errorMessage(err) === "SESSION" ? t("sessionExpired") : errorMessage(err),
      );
    } finally {
      setWorking("");
    }
  };

  const setLive = async (id: string, live: boolean) => {
    setWorking(id);
    setError("");
    try {
      const response = await authedFetch("/api/admin/blog", {
        method: "PATCH",
        body: JSON.stringify({ id, live }),
      });
      const payload = await response.json();
      if (!response.ok) throw new Error(payload.error || "Mise à jour impossible");
      applyCatalog(payload);
    } catch (err: unknown) {
      setError(errorMessage(err));
    } finally {
      setWorking("");
    }
  };

  const remove = async (id: string, title: string) => {
    if (!confirm(`Supprimer « ${title} » du blog ?`)) return;
    setWorking(id);
    setError("");
    try {
      const response = await authedFetch("/api/admin/blog", {
        method: "DELETE",
        body: JSON.stringify({ id }),
      });
      const payload = await response.json();
      if (!response.ok) throw new Error(payload.error || "Suppression impossible");
      applyCatalog(payload);
    } catch (err: unknown) {
      setError(errorMessage(err));
    } finally {
      setWorking("");
    }
  };

  const aiCount = posts.filter((row) => row.source === "ai").length;
  const liveCount = posts.filter(
    (row) => row.source === "static" || row.live,
  ).length;

  return (
    <AdminShell user={user} onLogout={handleLogout}>
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-8">
        <div>
          <p className="text-sm text-slate-400 max-w-xl">
            Deux articles IA sont générés et publiés chaque jour (matin et
            après-midi, heure de Paris). Vous pouvez aussi en lancer un ici.
            Les 20 premiers guides restent dans le code.
          </p>
          {today ? (
            <p className="text-xs text-slate-500 mt-2">
              Aujourd’hui ({today}) : {generatedToday}/{dailyLimit} article
              {generatedToday > 1 ? "s" : ""} IA
            </p>
          ) : null}
        </div>
        <button
          type="button"
          onClick={generate}
          disabled={Boolean(working)}
          className="px-5 py-3 rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-bold disabled:opacity-50"
        >
          {working === "generate" ? "Rédaction en cours…" : "Générer un article"}
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        <div className="bg-slate-800/60 border border-slate-700/50 rounded-2xl p-5">
          <p className="text-3xl font-bold text-white">{liveCount}</p>
          <p className="text-sm text-slate-400 mt-1">Visibles sur le site</p>
        </div>
        <div className="bg-slate-800/60 border border-slate-700/50 rounded-2xl p-5">
          <p className="text-3xl font-bold text-white">{aiCount}</p>
          <p className="text-sm text-slate-400 mt-1">Générés par l’IA</p>
        </div>
        <div className="bg-slate-800/60 border border-slate-700/50 rounded-2xl p-5">
          <p className="text-3xl font-bold text-white">{posts.length - aiCount}</p>
          <p className="text-sm text-slate-400 mt-1">Guides du fichier</p>
        </div>
      </div>

      {error ? <p className="text-rose-300 text-sm mb-4">{error}</p> : null}
      {info ? <p className="text-emerald-300 text-sm mb-4">{info}</p> : null}

      {loading ? (
        <p className="text-slate-400">{t("loading")}</p>
      ) : (
        <div className="overflow-x-auto rounded-2xl border border-slate-700/50">
          <table className="w-full text-sm">
            <thead className="bg-slate-800/80 text-slate-400 text-left">
              <tr>
                <th className="px-4 py-3 font-semibold">Date</th>
                <th className="px-4 py-3 font-semibold">Article</th>
                <th className="px-4 py-3 font-semibold">Source</th>
                <th className="px-4 py-3 font-semibold">Statut</th>
                <th className="px-4 py-3 font-semibold" />
              </tr>
            </thead>
            <tbody>
              {posts.map((row) => (
                <tr
                  key={row.id || row.post.slug}
                  className="border-t border-slate-800 text-slate-200"
                >
                  <td className="px-4 py-3 whitespace-nowrap text-slate-400">
                    {row.post.publishedAt}
                  </td>
                  <td className="px-4 py-3">
                    <p className="font-semibold text-white">{row.post.title}</p>
                    <p className="text-xs text-slate-500 mt-1">{row.post.slug}</p>
                  </td>
                  <td className="px-4 py-3">
                    {row.source === "ai" ? "IA" : "Fichier"}
                  </td>
                  <td className="px-4 py-3">
                    {row.source === "static" || row.live ? (
                      <span className="text-emerald-300">En ligne</span>
                    ) : (
                      <span className="text-amber-300">Masqué</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-right whitespace-nowrap">
                    <Link
                      href={blogPath(row.post.slug)}
                      target="_blank"
                      className="text-cyan-300 hover:text-cyan-200 font-semibold mr-3"
                    >
                      Voir
                    </Link>
                    {row.source === "ai" && row.id ? (
                      <>
                        <button
                          type="button"
                          disabled={Boolean(working)}
                          onClick={() => setLive(row.id as string, !row.live)}
                          className="text-slate-300 hover:text-white font-semibold mr-3 disabled:opacity-50"
                        >
                          {row.live ? "Masquer" : "Publier"}
                        </button>
                        <button
                          type="button"
                          disabled={Boolean(working)}
                          onClick={() => remove(row.id as string, row.post.title)}
                          className="text-rose-300 hover:text-rose-200 font-semibold disabled:opacity-50"
                        >
                          {t("delete")}
                        </button>
                      </>
                    ) : null}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </AdminShell>
  );
}
