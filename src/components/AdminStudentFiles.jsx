"use client";

import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";

async function adminFetch(path, options = {}) {
  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session?.access_token) {
    throw new Error("Session expirée. Reconnectez-vous.");
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
    throw new Error(data.error || "Une erreur est survenue");
  }
  return data;
}

export default function AdminStudentFiles({ contactId }) {
  const [requiredDocuments, setRequiredDocuments] = useState([]);
  const [adminDocuments, setAdminDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
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
      setError(err.message);
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
      alert(err.message);
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
        📂 Documents du dossier
      </label>

      {loading ? (
        <p className="text-sm text-slate-400">Chargement des documents...</p>
      ) : (
        <>
          {error ? (
            <p className="text-sm text-rose-300 mb-4">{error}</p>
          ) : null}

          <p className="text-xs text-slate-400 mb-3">
            Reçus de l'étudiant — {missingCount} manquant
            {missingCount > 1 ? "s" : ""}
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
                        {doc.icon} {doc.label}
                      </p>
                      <p
                        className={`text-xs font-bold uppercase tracking-wide mt-1 ${
                          missing ? "text-rose-300" : "text-emerald-300"
                        }`}
                      >
                        {missing ? "Manquant" : "Reçu"}
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
                        Télécharger
                      </button>
                    ) : null}
                  </div>
                </div>
              );
            })}
          </div>

          <p className="text-xs text-slate-400 mb-3">
            Envoyés à l'étudiant
          </p>
          <div className="space-y-3 mb-4">
            {adminDocuments.length === 0 ? (
              <p className="text-sm text-slate-500">
                Aucun document envoyé pour le moment.
              </p>
            ) : (
              adminDocuments.map((doc) => (
                <div
                  key={doc.path}
                  className="rounded-xl border border-cyan-500/30 bg-cyan-500/10 px-4 py-3 flex flex-wrap items-center justify-between gap-3"
                >
                  <p className="text-white text-sm font-semibold">📄 {doc.name}</p>
                  <button
                    type="button"
                    onClick={() => downloadFile(doc.path)}
                    className="px-4 py-2 bg-slate-700/70 hover:bg-slate-600 text-white rounded-lg text-sm font-bold"
                  >
                    Télécharger
                  </button>
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
              {uploading ? "⏳ Envoi..." : "📤 Envoyer à l'étudiant"}
            </button>
          </form>
          <p className="text-xs text-slate-500 mt-3">
            PDF, JPG ou PNG — 10 Mo max. Le fichier apparaîtra dans l'espace
            étudiant.
          </p>
        </>
      )}
    </div>
  );
}
