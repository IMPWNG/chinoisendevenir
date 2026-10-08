"use client";

import { useEffect, useState, type ChangeEvent, type FormEvent } from "react";
import { adminSupabase } from "../lib/supabase";
import { useAdminI18n } from "../context/AdminI18nContext";
import { errorMessage } from "../lib/request";

type RequiredFile = { name: string; path: string };

type RequiredDoc = {
  key: string;
  label: string;
  icon?: string;
  status: string;
  file?: RequiredFile | null;
};

type AdminDoc = { path: string; name: string };

type CatalogDoc = { key: string; label: string; description?: string };

type FilesPayload = {
  catalog?: CatalogDoc[];
  requestedKeys?: string[];
  requiredDocuments?: RequiredDoc[];
  adminDocuments?: AdminDoc[];
  url?: string;
  error?: string;
};

async function adminFetch(path: string, options: RequestInit = {}): Promise<FilesPayload> {
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

  const data = (await response.json().catch(() => ({}))) as FilesPayload;
  if (!response.ok) {
    throw new Error(data.error || "ERROR");
  }
  return data;
}

export default function AdminStudentFiles({ contactId }: { contactId: string }) {
  const { t } = useAdminI18n();
  const [catalog, setCatalog] = useState<CatalogDoc[]>([]);
  const [requestedKeys, setRequestedKeys] = useState<string[]>([]);
  const [requiredDocuments, setRequiredDocuments] = useState<RequiredDoc[]>([]);
  const [adminDocuments, setAdminDocuments] = useState<AdminDoc[]>([]);
  const [loading, setLoading] = useState(true);
  const [savingKeys, setSavingKeys] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [deletingPath, setDeletingPath] = useState("");
  const [fileToSend, setFileToSend] = useState<File | null>(null);
  const [error, setError] = useState("");

  const loadFiles = async () => {
    setLoading(true);
    setError("");
    try {
      const data = await adminFetch(
        `/api/admin/student-files?contactId=${encodeURIComponent(contactId)}`,
      );
      applyFiles(data);
    } catch (err: unknown) {
      const message = errorMessage(err);
      setError(
        message === "SESSION" ? t("sessionExpired") : message === "ERROR" ? t("genericError") : message,
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadFiles();
  }, [contactId]);

  const downloadFile = async (path: string) => {
    try {
      const data = await adminFetch(
        `/api/admin/student-files?contactId=${encodeURIComponent(contactId)}&path=${encodeURIComponent(path)}`,
      );
      window.open(data.url, "_blank", "noopener,noreferrer");
    } catch (err: unknown) {
      const message = errorMessage(err);
      alert(message === "SESSION" ? t("sessionExpired") : message);
    }
  };

  const deleteFile = async (path: string, name: string) => {
    if (!confirm(t("files.deleteConfirm", { name }))) return;
    setDeletingPath(path);
    setError("");
    try {
      const data = await adminFetch("/api/admin/student-files", {
        method: "DELETE",
        body: JSON.stringify({ contactId, path }),
      });
      applyFiles(data);
    } catch (err: unknown) {
      setError(errorMessage(err));
    } finally {
      setDeletingPath("");
    }
  };

  const sendFile = async (e: FormEvent<HTMLFormElement>) => {
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
      applyFiles(data);
      setFileToSend(null);
      e.currentTarget.reset();
    } catch (err: unknown) {
      setError(errorMessage(err));
    } finally {
      setUploading(false);
    }
  };

  const applyFiles = (data: FilesPayload) => {
    setCatalog(data.catalog || []);
    setRequestedKeys(data.requestedKeys || []);
    setRequiredDocuments(data.requiredDocuments || []);
    setAdminDocuments(data.adminDocuments || []);
  };

  const toggleRequested = async (key: string) => {
    const next = requestedKeys.includes(key)
      ? requestedKeys.filter((item) => item !== key)
      : [...requestedKeys, key];
    const previous = requestedKeys;
    setRequestedKeys(next);
    setSavingKeys(true);
    setError("");
    try {
      const data = await adminFetch("/api/admin/student-files", {
        method: "PATCH",
        body: JSON.stringify({ contactId, requestedKeys: next }),
      });
      applyFiles(data);
    } catch (err: unknown) {
      setRequestedKeys(previous);
      const message = errorMessage(err);
      setError(
        message === "SESSION" ? t("sessionExpired") : message === "ERROR" ? t("genericError") : message,
      );
    } finally {
      setSavingKeys(false);
    }
  };

  const docLabel = (key: string, fallback: string) => {
    const translated = t(`docs.${key}`);
    return translated === `docs.${key}` ? fallback : translated;
  };

  const missingCount = requiredDocuments.filter(
    (doc: RequiredDoc) => doc.status !== "received",
  ).length;

  return (
    <div>

      {loading ? (
        <p className="text-sm text-slate-400">{t("files.loading")}</p>
      ) : (
        <>
          {error ? (
            <p className="text-sm text-rose-300 mb-4">{error}</p>
          ) : null}

          <p className="text-sm font-semibold text-white mb-1">
            {t("files.requestTitle")}
          </p>
          <p className="text-xs text-slate-400 mb-3">{t("files.requestHint")}</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mb-6">
            {catalog.map((doc) => {
              const checked = requestedKeys.includes(doc.key);
              return (
                <label
                  key={doc.key}
                  title={doc.description || ""}
                  className={`flex items-start gap-2 rounded-lg border px-3 py-2 text-sm cursor-pointer ${
                    checked
                      ? "border-cyan-500/50 bg-cyan-500/10 text-white"
                      : "border-slate-700 bg-slate-900/40 text-slate-300"
                  }`}
                >
                  <input
                    type="checkbox"
                    className="mt-1"
                    checked={checked}
                    disabled={savingKeys}
                    onChange={() => toggleRequested(doc.key)}
                  />
                  <span className="font-medium">{docLabel(doc.key, doc.label)}</span>
                </label>
              );
            })}
          </div>

          <p className="text-xs text-slate-400 mb-3">
            {requestedKeys.length === 0
              ? t("files.noneRequested")
              : t("files.receivedFromStudent", { count: missingCount })}
          </p>
          <div className="space-y-3 mb-6">
            {requiredDocuments.map((doc: RequiredDoc) => {
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
                        {docLabel(doc.key, doc.label)}
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
                        onClick={() => {
                          const file = doc.file;
                          if (file) downloadFile(file.path);
                        }}
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
              adminDocuments.map((doc: AdminDoc) => (
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
              onChange={(e: ChangeEvent<HTMLInputElement>) =>
                setFileToSend(e.target.files?.[0] || null)
              }
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
