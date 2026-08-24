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
  is_partner: false,
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
  extra: {},
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
    is_partner: row.is_partner === true,
    is_active: row.is_active !== false,
    extra: row.extra || {},
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
  const [importingScan, setImportingScan] = useState(false);

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

  const cities = useMemo(
    () => [...new Set(universities.map((u) => u.city).filter(Boolean))].sort(),
    [universities],
  );

  const cscCount = universities.filter(
    (u) =>
      u.extra?.admission?.has_csc ||
      /csc|china scholarship/i.test(String(u.scholarship_amount || "")),
  ).length;
  const englishCount = universities.filter((u) => {
    if (u.extra?.admission?.english_programs_available) return true;
    const lang = String(u.language_requirements || "").toLowerCase();
    return /anglais|english/.test(lang);
  }).length;

  const filtered = universities.filter((u) => {
    const q = search.toLowerCase();
    const matchSearch =
      !q ||
      u.name_zh?.toLowerCase().includes(q) ||
      u.name_en?.toLowerCase().includes(q) ||
      u.city?.toLowerCase().includes(q) ||
      u.emails?.some((email) => email.toLowerCase().includes(q)) ||
      u.majors?.some((major) => String(major).toLowerCase().includes(q)) ||
      u.application_deadline?.toLowerCase().includes(q);
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

  const importScan = async () => {
    if (!confirm(t("universities.importScanConfirm"))) return;
    setImportingScan(true);
    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (!session?.access_token) throw new Error("SESSION");
      const response = await fetch("/api/admin/universities/import-scan", {
        method: "POST",
        headers: { Authorization: `Bearer ${session.access_token}` },
      });
      const payload = await response.json();
      if (!response.ok) throw new Error(payload.error || "Import impossible");
      alert(
        t("universities.importScanDone", {
          updated: payload.updated,
          inserted: payload.inserted,
        }),
      );
      await fetchUniversities();
    } catch (err) {
      alert(err.message);
    } finally {
      setImportingScan(false);
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
          <div className="grid grid-cols-1 md:grid-cols-4 gap-5 mb-8">
            <div className="bg-gradient-to-br from-blue-600 to-cyan-500 rounded-2xl p-6 text-white">
              <p className="text-4xl font-bold">{universities.length}</p>
              <p className="text-sm text-white/80 mt-1">{t("universities.count")}</p>
            </div>
            <div className="bg-gradient-to-br from-cyan-600 to-blue-500 rounded-2xl p-6 text-white">
              <p className="text-4xl font-bold">{cities.length}</p>
              <p className="text-sm text-white/80 mt-1">
                {t("universities.cities")}
              </p>
            </div>
            <div className="bg-gradient-to-br from-emerald-600 to-teal-500 rounded-2xl p-6 text-white">
              <p className="text-4xl font-bold">{cscCount}</p>
              <p className="text-sm text-white/80 mt-1">
                {t("universities.cscCount")}
              </p>
            </div>
            <div className="bg-gradient-to-br from-violet-600 to-purple-500 rounded-2xl p-6 text-white">
              <p className="text-4xl font-bold">{englishCount}</p>
              <p className="text-sm text-white/80 mt-1">
                {t("universities.englishPrograms")}
              </p>
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
                disabled={importingScan}
                onClick={importScan}
                className="px-5 py-3 bg-gradient-to-r from-cyan-600 to-indigo-600 text-white rounded-xl font-bold disabled:opacity-50"
              >
                {importingScan
                  ? t("universities.importing")
                  : `📚 ${t("universities.importScan")}`}
              </button>
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
                            <AdmissionChips university={u} />
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

function chipClass(tone = "slate") {
  const tones = {
    slate: "bg-slate-700/80 text-slate-200 border-slate-600/60",
    cyan: "bg-cyan-500/15 text-cyan-200 border-cyan-500/30",
    emerald: "bg-emerald-500/15 text-emerald-200 border-emerald-500/30",
    amber: "bg-amber-500/15 text-amber-200 border-amber-500/30",
    violet: "bg-violet-500/15 text-violet-200 border-violet-500/30",
  };
  return `inline-flex items-center px-2 py-0.5 rounded-md border text-[10px] font-bold ${tones[tone]}`;
}

function AdmissionChips({ university }) {
  const admission = university.extra?.admission;
  const chips = [];
  if (university.is_partner) chips.push({ label: "Partenaire", tone: "emerald" });
  if (university.min_hsk_level) {
    chips.push({ label: `HSK ${university.min_hsk_level}+`, tone: "cyan" });
  }
  if (admission?.english_programs_available) {
    chips.push({ label: "EN", tone: "violet" });
  }
  if (admission?.has_csc) chips.push({ label: "CSC", tone: "amber" });
  if (university.tuition_min || university.tuition_max) {
    const min = university.tuition_min ? `${university.tuition_min}` : "";
    const max = university.tuition_max ? `${university.tuition_max}` : "";
    chips.push({
      label: [min, max].filter(Boolean).join("–") + " RMB",
      tone: "slate",
    });
  }
  if (!chips.length) return null;
  return (
    <div className="flex flex-wrap gap-1 mt-2">
      {chips.map((chip) => (
        <span key={chip.label} className={chipClass(chip.tone)}>
          {chip.label}
        </span>
      ))}
    </div>
  );
}

function InfoBlock({ title, children }) {
  if (!children) return null;
  return (
    <div className="bg-slate-900/40 border border-slate-700/50 rounded-xl p-4">
      <p className="text-xs font-bold text-slate-400 uppercase tracking-wide mb-2">
        {title}
      </p>
      <div className="text-sm text-slate-200 space-y-1">{children}</div>
    </div>
  );
}

function AdmissionPanel({ extra }) {
  const admission = extra?.admission;
  if (!admission) return null;
  const reqs = admission.requirements || {};
  const programs = admission.programs || [];
  const scholarships = admission.scholarships || [];
  const docs = admission.documents || [];

  return (
    <div className="mb-6 space-y-3">
      {admission.presentation ? (
        <p className="text-sm text-slate-300 leading-relaxed">
          {admission.presentation}
        </p>
      ) : null}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <InfoBlock title="Candidature">
          {admission.application?.platform_name ? (
            <p>Plateforme : {admission.application.platform_name}</p>
          ) : null}
          {admission.application?.platform_url ? (
            <a
              href={admission.application.platform_url}
              target="_blank"
              rel="noreferrer"
              className="text-cyan-300 hover:underline break-all"
            >
              {admission.application.platform_url}
            </a>
          ) : null}
          {admission.application?.deadline ? (
            <p>Deadline : {admission.application.deadline}</p>
          ) : null}
          {(admission.application?.intake_months || []).length ? (
            <p>
              Rentrée :{" "}
              {admission.application.intake_months
                .map((m) => `${String(m).padStart(2, "0")}`)
                .join(", ")}
            </p>
          ) : null}
          {admission.application?.application_fee_cny ? (
            <p>Frais de dossier : {admission.application.application_fee_cny} RMB</p>
          ) : null}
        </InfoBlock>
        <InfoBlock title="Langue & âge">
          {admission.language?.hsk_bachelor ? (
            <p>HSK bachelor : {admission.language.hsk_bachelor}</p>
          ) : null}
          {admission.language?.ielts_min ? (
            <p>IELTS : {admission.language.ielts_min}</p>
          ) : null}
          {admission.language?.toefl_min ? (
            <p>TOEFL : {admission.language.toefl_min}</p>
          ) : null}
          {admission.english_programs_available ? <p>Programmes en anglais</p> : null}
          {admission.chinese_language_program_available ? (
            <p>Programme de langue chinoise</p>
          ) : null}
          {admission.age_max?.bachelor ? (
            <p>Âge max bachelor : {admission.age_max.bachelor} ans</p>
          ) : null}
          {admission.age_max?.master ? (
            <p>Âge max master : {admission.age_max.master} ans</p>
          ) : null}
        </InfoBlock>
        <InfoBlock title="Conditions d'admission">
          {["bachelor", "master", "phd"].map((level) => {
            const req = reqs[level];
            if (!req?.academic && !req?.hsk_level) return null;
            return (
              <p key={level}>
                <span className="text-slate-400 uppercase text-[10px] font-bold mr-2">
                  {level}
                </span>
                {[req.academic, req.hsk_level ? `HSK ${req.hsk_level}` : null]
                  .filter(Boolean)
                  .join(" · ")}
              </p>
            );
          })}
        </InfoBlock>
        <InfoBlock title="Frais / logement">
          {admission.fees?.tuition?.bachelor?.min ? (
            <p>
              Bachelor : {admission.fees.tuition.bachelor.min}
              {admission.fees.tuition.bachelor.max
                ? `–${admission.fees.tuition.bachelor.max}`
                : ""}{" "}
              RMB / an
            </p>
          ) : null}
          {admission.fees?.tuition?.master?.min ? (
            <p>
              Master : {admission.fees.tuition.master.min}
              {admission.fees.tuition.master.max
                ? `–${admission.fees.tuition.master.max}`
                : ""}{" "}
              RMB / an
            </p>
          ) : null}
          {(admission.fees?.housing || []).map((h) => (
            <p key={`${h.type}-${h.price_cny_year}`}>
              Dortoir {h.type || ""} {h.price_cny_year ? `: ${h.price_cny_year} RMB` : ""}
            </p>
          ))}
        </InfoBlock>
      </div>
      {scholarships.length ? (
        <InfoBlock title="Bourses">
          {scholarships.slice(0, 8).map((s) => (
            <p key={s.name}>
              {s.name}
              {s.coverage ? ` · ${s.coverage}` : ""}
              {s.stipend_cny_month ? ` · ${s.stipend_cny_month} RMB/mois` : ""}
            </p>
          ))}
        </InfoBlock>
      ) : null}
      {docs.length ? (
        <InfoBlock title="Documents requis">
          <p>{docs.map((d) => d.type).filter(Boolean).join(" · ")}</p>
        </InfoBlock>
      ) : null}
      {programs.length ? (
        <InfoBlock title="Programmes (extrait)">
          {programs.slice(0, 10).map((p) => (
            <p key={`${p.level}-${p.name}`}>
              {p.level ? `${p.level} · ` : ""}
              {p.name}
              {p.language ? ` (${p.language})` : ""}
            </p>
          ))}
        </InfoBlock>
      ) : null}
    </div>
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
            <AdmissionPanel extra={form.extra} />
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
