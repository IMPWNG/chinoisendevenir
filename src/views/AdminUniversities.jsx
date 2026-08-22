"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "../lib/supabase";
import { useAuth } from "../context/AuthContext";
import AdminShell from "../components/AdminShell";
import { UNIVERSITY_SEED, toUniversityInsert } from "../lib/universitySeed";
import { useAdminI18n } from "../context/AdminI18nContext";

const EMPTY_FORM = {
  name_zh: "",
  name_en: "",
  name_fr: "",
  slug: "",
  city: "",
  province: "",
  country: "Chine",
  department: "",
  emails_text: "",
  phone: "",
  wechat: "",
  website: "",
  last_contact_at: "",
  last_contact_note: "",
  reply_status: "",
  notes: "",
  is_partner: true,
  is_active: true,
  majors_text: "",
  required_documents_text: "",
  scholarship_amount: "",
  scholarship_min: "",
  scholarship_max: "",
  min_hsk_level: "",
  language_requirements: "",
  tuition_min: "",
  tuition_max: "",
  application_deadline: "",
};

const REPLY_STYLES = {
  replied: "bg-emerald-500/20 text-emerald-300 border-emerald-500/40",
  no_reply: "bg-rose-500/20 text-rose-300 border-rose-500/40",
  pending: "bg-amber-500/20 text-amber-300 border-amber-500/40",
};

function splitList(value) {
  return String(value || "")
    .split(/[\n,;/]+/)
    .map((item) => item.trim())
    .filter(Boolean);
}

function universityToForm(row) {
  return {
    ...EMPTY_FORM,
    ...row,
    emails_text: (row.emails || []).join("\n"),
    majors_text: (row.majors || []).join("\n"),
    required_documents_text: (row.required_documents || []).join("\n"),
    last_contact_at: row.last_contact_at || "",
    reply_status: row.reply_status || "",
    scholarship_min: row.scholarship_min ?? "",
    scholarship_max: row.scholarship_max ?? "",
    min_hsk_level: row.min_hsk_level ?? "",
    tuition_min: row.tuition_min ?? "",
    tuition_max: row.tuition_max ?? "",
    is_partner: row.is_partner !== false,
    is_active: row.is_active !== false,
  };
}

function formToPayload(form) {
  const numberOrNull = (value) => {
    if (value === "" || value === null || value === undefined) return null;
    const n = Number(value);
    return Number.isFinite(n) ? n : null;
  };

  return {
    name_zh: form.name_zh.trim(),
    name_en: form.name_en.trim() || null,
    name_fr: form.name_fr.trim() || null,
    slug: form.slug.trim() || null,
    city: form.city.trim() || null,
    province: form.province.trim() || null,
    country: form.country.trim() || "Chine",
    department: form.department.trim() || null,
    emails: splitList(form.emails_text),
    phone: form.phone.trim() || null,
    wechat: form.wechat.trim() || null,
    website: form.website.trim() || null,
    last_contact_at: form.last_contact_at || null,
    last_contact_note: form.last_contact_note.trim() || null,
    reply_status: form.reply_status || null,
    notes: form.notes.trim() || null,
    is_partner: Boolean(form.is_partner),
    is_active: Boolean(form.is_active),
    majors: splitList(form.majors_text),
    required_documents: splitList(form.required_documents_text),
    scholarship_amount: form.scholarship_amount.trim() || null,
    scholarship_min: numberOrNull(form.scholarship_min),
    scholarship_max: numberOrNull(form.scholarship_max),
    min_hsk_level: numberOrNull(form.min_hsk_level),
    language_requirements: form.language_requirements.trim() || null,
    tuition_min: numberOrNull(form.tuition_min),
    tuition_max: numberOrNull(form.tuition_max),
    application_deadline: form.application_deadline.trim() || null,
    updated_at: new Date().toISOString(),
  };
}

function tableMissing(error) {
  const message = String(error?.message || "").toLowerCase();
  return (
    message.includes("universities") &&
    (message.includes("does not exist") ||
      message.includes("schema cache") ||
      message.includes("could not find"))
  );
}

function replyLabel(status, t) {
  if (status === "replied") return t("universities.replyReplied");
  if (status === "no_reply") return t("universities.replyNoReply");
  if (status === "pending") return t("universities.replyPending");
  return "";
}

export default function AdminUniversities() {
  const { signOut, user } = useAuth();
  const { t } = useAdminI18n();
  const router = useRouter();
  const [universities, setUniversities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [missingTable, setMissingTable] = useState(false);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [filterProvince, setFilterProvince] = useState("tous");
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [importing, setImporting] = useState(false);

  const fetchUniversities = async () => {
    setLoading(true);
    setError("");
    const { data, error: fetchError } = await supabase
      .from("universities")
      .select("*")
      .order("name_zh", { ascending: true });

    if (fetchError) {
      setMissingTable(tableMissing(fetchError));
      setError(fetchError.message);
      setUniversities([]);
    } else {
      setMissingTable(false);
      setUniversities(data || []);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchUniversities();
  }, []);

  const provinces = useMemo(
    () =>
      [...new Set(universities.map((u) => u.province).filter(Boolean))].sort(),
    [universities],
  );

  const filtered = universities.filter((u) => {
    const q = search.toLowerCase();
    const matchSearch =
      !q ||
      u.name_zh?.toLowerCase().includes(q) ||
      u.name_en?.toLowerCase().includes(q) ||
      u.city?.toLowerCase().includes(q) ||
      u.emails?.some((email) => email.toLowerCase().includes(q));
    const matchProvince =
      filterProvince === "tous" || u.province === filterProvince;
    return matchSearch && matchProvince;
  });

  const handleLogout = async () => {
    await signOut();
    router.push("/admin/login");
  };

  const openCreate = () => {
    setEditing("new");
    setForm({ ...EMPTY_FORM });
  };

  const openEdit = (row) => {
    setEditing(row.id);
    setForm(universityToForm(row));
  };

  const saveUniversity = async (e) => {
    e.preventDefault();
    const payload = formToPayload(form);
    if (!payload.name_zh) {
      alert(t("universities.nameRequired"));
      return;
    }

    setSaving(true);
    try {
      if (editing === "new") {
        const { updated_at: _ignored, ...insertPayload } = payload;
        const { error: insertError } = await supabase
          .from("universities")
          .insert(insertPayload);
        if (insertError) throw insertError;
      } else {
        const { error: updateError } = await supabase
          .from("universities")
          .update(payload)
          .eq("id", editing);
        if (updateError) {
          const { updated_at: _ignored, ...withoutUpdatedAt } = payload;
          const retry = await supabase
            .from("universities")
            .update(withoutUpdatedAt)
            .eq("id", editing);
          if (retry.error) throw retry.error;
        }
      }
      setEditing(null);
      await fetchUniversities();
    } catch (err) {
      alert(err.message);
    } finally {
      setSaving(false);
    }
  };

  const deleteUniversity = async (row) => {
    if (!confirm(t("universities.deleteConfirm", { name: row.name_zh }))) return;
    const { error: deleteError } = await supabase
      .from("universities")
      .delete()
      .eq("id", row.id);
    if (deleteError) {
      alert(deleteError.message);
      return;
    }
    await fetchUniversities();
  };

  const importSeed = async () => {
    if (
      !confirm(
        t("universities.importConfirm", { count: UNIVERSITY_SEED.length }),
      )
    ) {
      return;
    }
    setImporting(true);
    try {
      const payload = UNIVERSITY_SEED.map(toUniversityInsert);
      const { error: insertError } = await supabase
        .from("universities")
        .upsert(payload, { onConflict: "name_zh" });
      if (insertError) throw insertError;
      await fetchUniversities();
    } catch (err) {
      alert(err.message);
    } finally {
      setImporting(false);
    }
  };

  const tableHeaders = [
    t("universities.colUniversity"),
    t("universities.colCity"),
    t("universities.colDepartment"),
    t("universities.colEmail"),
    t("universities.colPhone"),
    t("universities.colLastContact"),
    t("universities.colReply"),
    t("universities.colWebsite"),
    "",
  ];

  return (
    <AdminShell user={user} onLogout={handleLogout}>
      {missingTable ? (
        <div className="bg-amber-500/10 border border-amber-500/40 rounded-2xl p-6 text-amber-100">
          <h2 className="text-xl font-bold mb-2">{t("universities.missingTable")}</h2>
          <p className="text-sm text-amber-200/90 mb-4">
            {t("universities.missingTableHint")}
          </p>
          <button
            type="button"
            onClick={fetchUniversities}
            className="px-5 py-2 bg-amber-600 hover:bg-amber-500 text-white rounded-xl font-bold"
          >
            🔄 {t("refresh")}
          </button>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-8">
            <div className="bg-gradient-to-br from-blue-600 to-cyan-500 rounded-2xl p-6 text-white">
              <p className="text-4xl font-bold">{universities.length}</p>
              <p className="text-sm text-white/80 mt-1">{t("universities.count")}</p>
            </div>
            <div className="bg-gradient-to-br from-emerald-600 to-teal-500 rounded-2xl p-6 text-white">
              <p className="text-4xl font-bold">
                {universities.filter((u) => u.reply_status === "replied").length}
              </p>
              <p className="text-sm text-white/80 mt-1">{t("universities.replied")}</p>
            </div>
            <div className="bg-gradient-to-br from-violet-600 to-purple-500 rounded-2xl p-6 text-white">
              <p className="text-4xl font-bold">{provinces.length}</p>
              <p className="text-sm text-white/80 mt-1">{t("universities.provinces")}</p>
            </div>
          </div>

          {error ? (
            <p className="text-rose-300 text-sm mb-4">{error}</p>
          ) : null}

          <div className="bg-slate-800/40 rounded-2xl p-6 mb-6 border border-slate-700/50">
            <div className="flex flex-col lg:flex-row gap-4">
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder={`🔍 ${t("universities.searchPlaceholder")}`}
                className="flex-1 px-5 py-3 bg-slate-700/50 border border-slate-600/50 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
              />
              <select
                value={filterProvince}
                onChange={(e) => setFilterProvince(e.target.value)}
                className="px-5 py-3 bg-slate-700/50 border border-slate-600/50 rounded-xl text-white"
              >
                <option value="tous">🌍 {t("universities.allProvinces")}</option>
                {provinces.map((p) => (
                  <option key={p} value={p}>
                    {p}
                  </option>
                ))}
              </select>
              <button
                type="button"
                onClick={fetchUniversities}
                className="px-5 py-3 bg-slate-700 hover:bg-slate-600 text-white rounded-xl font-bold"
              >
                🔄 {t("refresh")}
              </button>
              {universities.length === 0 ? (
                <button
                  type="button"
                  disabled={importing}
                  onClick={importSeed}
                  className="px-5 py-3 bg-gradient-to-r from-cyan-600 to-blue-600 text-white rounded-xl font-bold disabled:opacity-50"
                >
                  {importing
                    ? t("universities.importing")
                    : `📥 ${t("universities.importList")}`}
                </button>
              ) : null}
              <button
                type="button"
                onClick={openCreate}
                className="px-5 py-3 bg-gradient-to-r from-emerald-600 to-teal-600 text-white rounded-xl font-bold"
              >
                ➕ {t("universities.add")}
              </button>
            </div>
          </div>

          <div className="bg-slate-800/40 rounded-2xl overflow-hidden border border-slate-700/50">
            {loading ? (
              <p className="p-12 text-center text-slate-400">{t("loading")}</p>
            ) : filtered.length === 0 ? (
              <div className="p-12 text-center">
                <p className="text-slate-300 font-semibold mb-2">
                  {t("universities.none")}
                </p>
                <p className="text-slate-500 text-sm">
                  {t("universities.noneHint")}
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full min-w-[1100px]">
                  <thead className="bg-slate-900/60 border-b border-slate-700/50">
                    <tr>
                      {tableHeaders.map((label, index) => (
                        <th
                          key={label || `actions-${index}`}
                          className="px-4 py-3 text-left text-xs font-bold text-slate-300 uppercase tracking-widest"
                        >
                          {label}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-700/50">
                    {filtered.map((u) => {
                      const replyText = replyLabel(u.reply_status, t);
                      return (
                        <tr
                          key={u.id}
                          className="hover:bg-slate-700/30 cursor-pointer"
                          onClick={() => openEdit(u)}
                        >
                          <td className="px-4 py-4">
                            <p className="text-white font-semibold">{u.name_zh}</p>
                            <p className="text-xs text-slate-400">{u.name_en}</p>
                          </td>
                          <td className="px-4 py-4 text-slate-300 text-sm">
                            {u.city || "—"}
                            {u.province ? (
                              <span className="block text-xs text-slate-500">
                                {u.province}
                              </span>
                            ) : null}
                          </td>
                          <td className="px-4 py-4 text-slate-300 text-sm max-w-[220px]">
                            {u.department || "—"}
                          </td>
                          <td className="px-4 py-4 text-cyan-300 text-xs">
                            {(u.emails || []).length
                              ? u.emails.map((email) => (
                                  <div key={email}>{email}</div>
                                ))
                              : "—"}
                          </td>
                          <td className="px-4 py-4 text-slate-300 text-xs whitespace-nowrap">
                            {u.phone || "—"}
                          </td>
                          <td className="px-4 py-4 text-slate-300 text-sm">
                            {u.last_contact_at || "—"}
                            {u.last_contact_note ? (
                              <span className="block text-xs text-amber-300">
                                {u.last_contact_note}
                              </span>
                            ) : null}
                          </td>
                          <td className="px-4 py-4">
                            {replyText ? (
                              <span
                                className={`text-xs px-2 py-1 rounded-lg border font-bold ${REPLY_STYLES[u.reply_status]}`}
                              >
                                {replyText}
                              </span>
                            ) : (
                              <span className="text-slate-500 text-xs">—</span>
                            )}
                          </td>
                          <td className="px-4 py-4">
                            {u.website ? (
                              <a
                                href={u.website}
                                target="_blank"
                                rel="noreferrer"
                                onClick={(e) => e.stopPropagation()}
                                className="text-blue-400 text-xs hover:underline"
                              >
                                {t("universities.site")}
                              </a>
                            ) : (
                              "—"
                            )}
                          </td>
                          <td className="px-4 py-4">
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                deleteUniversity(u);
                              }}
                              className="text-red-400 hover:text-red-300 text-sm font-semibold"
                            >
                              {t("delete")}
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
            <div className="bg-slate-900/40 px-6 py-4 border-t border-slate-700/50 text-center text-slate-400 text-sm">
              {t("universities.shown", { count: filtered.length })}
            </div>
          </div>
        </>
      )}

      {editing ? (
        <UniversityModal
          form={form}
          setForm={setForm}
          saving={saving}
          isNew={editing === "new"}
          onClose={() => setEditing(null)}
          onSubmit={saveUniversity}
        />
      ) : null}
    </AdminShell>
  );
}

function Field({ label, children }) {
  return (
    <label className="block">
      <span className="text-xs font-bold text-slate-400 uppercase tracking-wide">
        {label}
      </span>
      <div className="mt-1">{children}</div>
    </label>
  );
}

function inputClass() {
  return "w-full px-4 py-2.5 bg-slate-700/50 border border-slate-600/50 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50";
}

function UniversityModal({ form, setForm, saving, isNew, onClose, onSubmit }) {
  const { t } = useAdminI18n();
  const update = (name, value) =>
    setForm((prev) => ({ ...prev, [name]: value }));

  return (
    <div
      className="fixed inset-0 bg-black/70 backdrop-blur-xl flex items-center justify-center p-4 z-50"
      onClick={onClose}
    >
      <form
        onSubmit={onSubmit}
        onClick={(e) => e.stopPropagation()}
        className="bg-slate-800 rounded-3xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto border border-slate-700/50"
      >
        <div className="bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 p-6 flex justify-between items-start sticky top-0">
          <div>
            <h2 className="text-2xl font-bold text-white">
              {isNew
                ? t("universities.newTitle")
                : form.name_zh || t("universities.editTitle")}
            </h2>
            <p className="text-blue-100 text-sm mt-1">
              {t("universities.editHint")}
            </p>
          </div>
          <button type="button" onClick={onClose} className="text-white text-xl">
            ✕
          </button>
        </div>

        <div className="p-6 space-y-8">
          <section>
            <h3 className="text-sm font-bold text-slate-300 uppercase tracking-wide mb-4">
              {t("universities.identity")}
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Field label={t("universities.nameZh")}>
                <input
                  className={inputClass()}
                  value={form.name_zh}
                  onChange={(e) => update("name_zh", e.target.value)}
                  required
                />
              </Field>
              <Field label={t("universities.nameEn")}>
                <input
                  className={inputClass()}
                  value={form.name_en}
                  onChange={(e) => update("name_en", e.target.value)}
                />
              </Field>
              <Field label={t("universities.nameFr")}>
                <input
                  className={inputClass()}
                  value={form.name_fr}
                  onChange={(e) => update("name_fr", e.target.value)}
                />
              </Field>
              <Field label={t("universities.slug")}>
                <input
                  className={inputClass()}
                  value={form.slug}
                  onChange={(e) => update("slug", e.target.value)}
                />
              </Field>
              <Field label={t("universities.city")}>
                <input
                  className={inputClass()}
                  value={form.city}
                  onChange={(e) => update("city", e.target.value)}
                />
              </Field>
              <Field label={t("universities.province")}>
                <input
                  className={inputClass()}
                  value={form.province}
                  onChange={(e) => update("province", e.target.value)}
                />
              </Field>
              <label className="flex items-center gap-3 text-slate-200 font-semibold mt-7">
                <input
                  type="checkbox"
                  checked={form.is_active}
                  onChange={(e) => update("is_active", e.target.checked)}
                />
                {t("universities.active")}
              </label>
              <label className="flex items-center gap-3 text-slate-200 font-semibold mt-7">
                <input
                  type="checkbox"
                  checked={form.is_partner}
                  onChange={(e) => update("is_partner", e.target.checked)}
                />
                {t("universities.partner")}
              </label>
            </div>
          </section>

          <section>
            <h3 className="text-sm font-bold text-slate-300 uppercase tracking-wide mb-4">
              {t("universities.contact")}
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Field label={t("universities.department")}>
                <input
                  className={inputClass()}
                  value={form.department}
                  onChange={(e) => update("department", e.target.value)}
                />
              </Field>
              <Field label={t("universities.phone")}>
                <input
                  className={inputClass()}
                  value={form.phone}
                  onChange={(e) => update("phone", e.target.value)}
                />
              </Field>
              <Field label={t("universities.emails")}>
                <textarea
                  rows={3}
                  className={inputClass()}
                  value={form.emails_text}
                  onChange={(e) => update("emails_text", e.target.value)}
                />
              </Field>
              <Field label={t("universities.wechat")}>
                <input
                  className={inputClass()}
                  value={form.wechat}
                  onChange={(e) => update("wechat", e.target.value)}
                />
              </Field>
              <Field label={t("universities.website")}>
                <input
                  className={inputClass()}
                  value={form.website}
                  onChange={(e) => update("website", e.target.value)}
                />
              </Field>
              <Field label={t("universities.lastContact")}>
                <input
                  type="date"
                  className={inputClass()}
                  value={form.last_contact_at}
                  onChange={(e) => update("last_contact_at", e.target.value)}
                />
              </Field>
              <Field label={t("universities.contactNote")}>
                <input
                  className={inputClass()}
                  value={form.last_contact_note}
                  onChange={(e) => update("last_contact_note", e.target.value)}
                />
              </Field>
              <Field label={t("universities.reply")}>
                <select
                  className={inputClass()}
                  value={form.reply_status}
                  onChange={(e) => update("reply_status", e.target.value)}
                >
                  <option value="">—</option>
                  <option value="replied">{t("universities.replyReplied")}</option>
                  <option value="no_reply">{t("universities.replyNoReply")}</option>
                  <option value="pending">{t("universities.replyPending")}</option>
                </select>
              </Field>
              <div className="md:col-span-2">
                <Field label={t("universities.notes")}>
                  <textarea
                    rows={2}
                    className={inputClass()}
                    value={form.notes}
                    onChange={(e) => update("notes", e.target.value)}
                  />
                </Field>
              </div>
            </div>
          </section>

          <section>
            <h3 className="text-sm font-bold text-slate-300 uppercase tracking-wide mb-4">
              {t("universities.matching")}
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Field label={t("universities.majors")}>
                <textarea
                  rows={3}
                  className={inputClass()}
                  value={form.majors_text}
                  onChange={(e) => update("majors_text", e.target.value)}
                  placeholder={t("universities.majorsPlaceholder")}
                />
              </Field>
              <Field label={t("universities.requiredDocs")}>
                <textarea
                  rows={3}
                  className={inputClass()}
                  value={form.required_documents_text}
                  onChange={(e) =>
                    update("required_documents_text", e.target.value)
                  }
                  placeholder={t("universities.docsPlaceholder")}
                />
              </Field>
              <Field label={t("universities.scholarshipText")}>
                <input
                  className={inputClass()}
                  value={form.scholarship_amount}
                  onChange={(e) => update("scholarship_amount", e.target.value)}
                  placeholder={t("universities.scholarshipPlaceholder")}
                />
              </Field>
              <Field label={t("universities.minHsk")}>
                <input
                  type="number"
                  min="1"
                  max="9"
                  className={inputClass()}
                  value={form.min_hsk_level}
                  onChange={(e) => update("min_hsk_level", e.target.value)}
                />
              </Field>
              <Field label={t("universities.scholarshipMin")}>
                <input
                  type="number"
                  className={inputClass()}
                  value={form.scholarship_min}
                  onChange={(e) => update("scholarship_min", e.target.value)}
                />
              </Field>
              <Field label={t("universities.scholarshipMax")}>
                <input
                  type="number"
                  className={inputClass()}
                  value={form.scholarship_max}
                  onChange={(e) => update("scholarship_max", e.target.value)}
                />
              </Field>
              <Field label={t("universities.tuitionMin")}>
                <input
                  type="number"
                  className={inputClass()}
                  value={form.tuition_min}
                  onChange={(e) => update("tuition_min", e.target.value)}
                />
              </Field>
              <Field label={t("universities.tuitionMax")}>
                <input
                  type="number"
                  className={inputClass()}
                  value={form.tuition_max}
                  onChange={(e) => update("tuition_max", e.target.value)}
                />
              </Field>
              <Field label={t("universities.languageReq")}>
                <input
                  className={inputClass()}
                  value={form.language_requirements}
                  onChange={(e) =>
                    update("language_requirements", e.target.value)
                  }
                />
              </Field>
              <Field label={t("universities.deadline")}>
                <input
                  className={inputClass()}
                  value={form.application_deadline}
                  onChange={(e) =>
                    update("application_deadline", e.target.value)
                  }
                />
              </Field>
            </div>
          </section>

          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-3 bg-slate-700 text-white rounded-xl font-bold"
            >
              {t("cancel")}
            </button>
            <button
              type="submit"
              disabled={saving}
              className="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl font-bold disabled:opacity-50"
            >
              {saving ? t("saving") : t("save")}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
