"use client";

import { useEffect, useState } from "react";
import { adminSupabase } from "../lib/supabase";
import { useAdminI18n } from "../context/AdminI18nContext";

async function adminFetch(path, options = {}) {
  const {
    data: { session },
    } = await adminSupabase.auth.getSession();

  if (!session?.access_token) {
    throw new Error("SESSION");
  }

  const isFormData = options.body instanceof FormData;
  const response = await fetch(path, {
    ...options,
    headers: {
      ...(isFormData ? {} : { "Content-Type": "application/json" }),
      ...(options.headers || {}),
      Authorization: `Bearer ${session.access_token}`,
    },
  });

  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(data.error || "ERROR");
  }
  return data;
}

export default function AdminStudentFiles({ contactId }) {
  const { t } = useAdminI18n();
  const [requiredDocuments, setRequiredDocuments] = useState([]);
  const [adminDocuments, setAdminDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [deletingPath, setDeletingPath] = useState("");
  const [fileToSend, setFileToSend] = useState(null);
  const [error, setError] = useState("");

  const loadFiles = async () => {
    setLoading(true);
    setError("");
    try {
      const data = await adminFetch(
        `/api/admin/student-files?contactId=${encodeURIComponent(contactId)}`,
      );
      setRequiredDocuments(data.requiredDocuments || []);
      setAdminDocuments(data.adminDocuments || []);
    } catch (err) {
      setError(
        err.message === "SESSION" ? t("sessionExpired") : err.message === "ERROR" ? t("genericError") : err.message,
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadFiles();
  }, [contactId]);

  const downloadFile = async (path) => {
    try {
      const data = await adminFetch(
        `/api/admin/student-files?contactId=${encodeURIComponent(contactId)}&path=${encodeURIComponent(path)}`,
      );
      window.open(data.url, "_blank", "noopener,noreferrer");
    } catch (err) {
      alert(err.message === "SESSION" ? t("sessionExpired") : err.message);
    }
  };

  const deleteFile = async (path, name) => {
    if (!confirm(t("files.deleteConfirm", { name }))) return;
    setDeletingPath(path);
    setError("");
    try {
      const data = await adminFetch("/api/admin/student-files", {
        method: "DELETE",
        body: JSON.stringify({ contactId, path }),
      });
      setRequiredDocuments(data.requiredDocuments || []);
      setAdminDocuments(data.adminDocuments || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setDeletingPath("");
    }
  };

  const sendFile = async (e) => {
    e.preventDefault();
    if (!fileToSend) return;
    setUploading(true);
    setError("");
    try {
      const body = new FormData();
      body.append("contactId", contactId);
      body.append("file", fileToSend);
      const data = await adminFetch("/api/admin/student-files", {
        method: "POST",
        body,
      });
      setRequiredDocuments(data.requiredDocuments || []);
      setAdminDocuments(data.adminDocuments || []);
      setFileToSend(null);
      e.target.reset?.();
    } catch (err) {
      setError(err.message);
    } finally {
      setUploading(false);
    }
  };

  const missingCount = requiredDocuments.filter(
    (doc) => doc.status !== "received",
  ).length;

  return (
    <div className="mb-8 pb-8 border-b border-slate-700/50">
      <label className="text-sm font-bold text-slate-300 block mb-3 uppercase tracking-wide">
        📂 {t("files.title")}
      </label>

      {loading ? (
        <p className="text-sm text-slate-400">{t("files.loading")}</p>
      ) : (
        <>
          {error ? (
            <p className="text-sm text-rose-300 mb-4">{error}</p>
          ) : null}

          <p className="text-xs text-slate-400 mb-3">
            {t("files.receivedFromStudent", { count: missingCount })}
          </p>
          <div className="space-y-3 mb-6">
            {requiredDocuments.map((doc) => {
              const missing = doc.status !== "received";
              return (
                <div
                  key={doc.key}
                  className={`rounded-xl border px-4 py-3 ${
                    missing
                      ? "border-rose-500/40 bg-rose-500/10"
                      : "border-emerald-500/40 bg-emerald-500/10"
                  }`}
                >
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div>
                      <p className="text-white font-semibold">
                        {doc.icon}{" "}
                        {t(`docs.${doc.key}`) === `docs.${doc.key}`
                          ? doc.label
                          : t(`docs.${doc.key}`)}
                      </p>
                      <p
                        className={`text-xs font-bold uppercase tracking-wide mt-1 ${
                          missing ? "text-rose-300" : "text-emerald-300"
                        }`}
                      >
                        {missing ? t("files.missing") : t("files.received")}
                      </p>
                      {doc.file ? (
                        <p className="text-xs text-slate-400 mt-1">
                          {doc.file.name}
                        </p>
                      ) : null}
                    </div>
                    {doc.file ? (
                      <button
                        type="button"
                        onClick={() => downloadFile(doc.file.path)}
                        className="px-4 py-2 bg-slate-700/70 hover:bg-slate-600 text-white rounded-lg text-sm font-bold"
                      >
                        {t("download")}
                      </button>
                    ) : null}
                  </div>
                </div>
              );
            })}
          </div>

          <p className="text-xs text-slate-400 mb-3">
            {t("files.sentToStudent")}
          </p>
          <div className="space-y-3 mb-4">
            {adminDocuments.length === 0 ? (
              <p className="text-sm text-slate-500">{t("files.noneSent")}</p>
            ) : (
              adminDocuments.map((doc) => (
                <div
                  key={doc.path}
                  className="rounded-xl border border-cyan-500/30 bg-cyan-500/10 px-4 py-3 flex flex-wrap items-center justify-between gap-3"
                >
                  <p className="text-white text-sm font-semibold">📄 {doc.name}</p>
                  <div className="flex flex-wrap gap-2">
                    <button
                      type="button"
                      onClick={() => downloadFile(doc.path)}
                      className="px-4 py-2 bg-slate-700/70 hover:bg-slate-600 text-white rounded-lg text-sm font-bold"
                    >
                      {t("download")}
                    </button>
                    <button
                      type="button"
                      disabled={deletingPath === doc.path}
                      onClick={() => deleteFile(doc.path, doc.name)}
                      className="px-4 py-2 bg-rose-600/80 hover:bg-rose-500 text-white rounded-lg text-sm font-bold disabled:opacity-50"
                    >
                      {deletingPath === doc.path ? t("deleting") : t("delete")}
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>

          <form onSubmit={sendFile} className="flex flex-col sm:flex-row gap-3">
            <input
              type="file"
              accept=".pdf,.jpg,.jpeg,.png,.webp"
              onChange={(e) => setFileToSend(e.target.files?.[0] || null)}
              className="flex-1 text-sm text-slate-300 file:mr-3 file:px-4 file:py-2 file:rounded-lg file:border-0 file:bg-slate-700 file:text-white file:font-semibold"
            />
            <button
              type="submit"
              disabled={uploading || !fileToSend}
              className="px-6 py-3 bg-gradient-to-r from-cyan-600 to-teal-600 hover:from-cyan-500 hover:to-teal-500 text-white rounded-xl font-bold transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
            >
              {uploading ? `⏳ ${t("sending")}` : `📤 ${t("files.sendToStudent")}`}
            </button>
          </form>
          <p className="text-xs text-slate-500 mt-3">{t("files.hint")}</p>
        </>
      )}
    </div>
  );
}
