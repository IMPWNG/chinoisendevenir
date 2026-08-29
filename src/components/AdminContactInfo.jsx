"use client";

import { useEffect, useState } from "react";
import { adminSupabase } from "../lib/supabase";
import { useAdminI18n } from "../context/AdminI18nContext";
import { DOMAINES_ETUDES } from "../lib/studentProgress";
import {
  whatsappNumberFromContact,
  isValidWhatsAppNumber,
} from "../lib/whatsapp/messages";

const NIVEAUX_ETUDES = ["bac", "licence", "master", "doctorat", "autre"];

const BUDGETS = [
  "moins-3000",
  "3000-6000",
  "<5000",
  "5000-10000",
  "10000-20000",
  ">20000",
  "besoin-bourse",
];

const DATES_RENTREE = [
  "septembre_2026",
  "mars_2027",
  "septembre_2027",
  "flexible",
];

const inputClass =
  "w-full px-4 py-2.5 bg-slate-700/50 border border-slate-600/50 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all duration-300";

function translatedOrRaw(t, prefix, value) {
  if (!value) return "";
  const path = `${prefix}.${value}`;
  const translated = t(path);
  return translated === path ? value : translated;
}

function contactToForm(contact) {
  const domaine = contact.domaine_etudes || "";
  const domaineInList = !domaine || DOMAINES_ETUDES.includes(domaine);
  return {
    prenom: contact.prenom || "",
    nom: contact.nom || "",
    email: contact.email || "",
    phone: contact.phone || "",
    age: contact.age ?? "",
    pays: contact.pays || "",
    dernier_diplome: contact.dernier_diplome || "",
    domaine_etudes: domaineInList ? domaine : "Autre",
    domaine_etudes_precision: domaineInList ? "" : domaine,
    budget: contact.budget || "",
    date_rentree: contact.date_rentree || "",
  };
}

async function adminFetch(path, options = {}) {
  const {
    data: { session },
    } = await adminSupabase.auth.getSession();
  if (!session?.access_token) {
    throw new Error("SESSION");
  }
  const response = await fetch(path, {
    ...options,
    headers: {
      "Content-Type": "application/json",
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

function InfoRow({ label, children }) {
  return (
    <tr className="border-b border-slate-700/50 last:border-b-0">
      <td className="px-4 py-3 font-bold text-slate-300 bg-slate-700/20 w-1/3">
        {label}
      </td>
      <td className="px-4 py-3 text-white">{children}</td>
    </tr>
  );
}

function Field({ id, label, children }) {
  return (
    <div>
      <label
        htmlFor={id}
        className="block text-xs font-bold text-slate-400 mb-1.5 uppercase tracking-wide"
      >
        {label}
      </label>
      {children}
    </div>
  );
}

export default function AdminContactInfo({ contact, onSaved, startEditing = false }) {
  const { t } = useAdminI18n();
  const [editing, setEditing] = useState(() => Boolean(startEditing));
  const [form, setForm] = useState(() => contactToForm(contact));
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    setForm(contactToForm(contact));
    setEditing(Boolean(startEditing));
    setError("");
  }, [contact.id, startEditing]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const cancelEdit = () => {
    setForm(contactToForm(contact));
    setEditing(false);
    setError("");
  };

  const saveInfo = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError("");
    try {
      const domaine =
        form.domaine_etudes === "Autre" && form.domaine_etudes_precision.trim()
          ? form.domaine_etudes_precision.trim()
          : form.domaine_etudes;
      const data = await adminFetch("/api/admin/contacts", {
        method: "PATCH",
        body: JSON.stringify({
          contactId: contact.id,
          prenom: form.prenom,
          nom: form.nom,
          email: form.email,
          phone: form.phone,
          age: form.age,
          pays: form.pays,
          dernier_diplome: form.dernier_diplome,
          domaine_etudes: domaine,
          budget: form.budget,
          date_rentree: form.date_rentree,
        }),
      });
      setForm(contactToForm(data.contact));
      setEditing(false);
      onSaved?.(data.contact);
    } catch (err) {
      const code = err.message;
      if (code === "SESSION") {
        setError(t("sessionExpired"));
      } else {
        const path = `dashboard.contactError.${code}`;
        const translated = t(path);
        setError(translated === path ? t("genericError") : translated);
      }
    } finally {
      setSaving(false);
    }
  };

  const diplomeOptions = [...NIVEAUX_ETUDES];
  if (
    form.dernier_diplome &&
    !diplomeOptions.includes(form.dernier_diplome)
  ) {
    diplomeOptions.push(form.dernier_diplome);
  }

  const budgetOptions = [...BUDGETS];
  if (form.budget && !budgetOptions.includes(form.budget)) {
    budgetOptions.push(form.budget);
  }

  const rentreeOptions = [...DATES_RENTREE];
  if (form.date_rentree && !rentreeOptions.includes(form.date_rentree)) {
    rentreeOptions.push(form.date_rentree);
  }

  return (
    <div className="mb-8 pb-8 border-b border-slate-700/50">
      <div className="flex flex-wrap items-center justify-between gap-3 mb-3">
        <label className="text-sm font-bold text-slate-300 uppercase tracking-wide">
          👤 {t("dashboard.studentInfo")}
        </label>
        {!editing ? (
          <button
            type="button"
            onClick={() => {
              setForm(contactToForm(contact));
              setError("");
              setEditing(true);
            }}
            className="px-4 py-2 bg-slate-700/70 hover:bg-slate-600 text-white rounded-xl text-sm font-bold transition-all duration-200"
          >
            ✏️ {t("dashboard.editInfo")}
          </button>
        ) : null}
      </div>

      {editing ? (
        <form onSubmit={saveInfo} className="space-y-4">
          <p className="text-xs text-slate-400">{t("dashboard.editInfoHint")}</p>
          {error ? <p className="text-sm text-rose-300">{error}</p> : null}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Field id="admin-prenom" label={`${t("dashboard.firstName")} *`}>
              <input
                id="admin-prenom"
                name="prenom"
                value={form.prenom}
                onChange={handleChange}
                required
                className={inputClass}
              />
            </Field>
            <Field id="admin-nom" label={`${t("dashboard.lastName")} *`}>
              <input
                id="admin-nom"
                name="nom"
                value={form.nom}
                onChange={handleChange}
                required
                className={inputClass}
              />
            </Field>
            <Field id="admin-email" label={`${t("dashboard.email")} *`}>
              <input
                id="admin-email"
                type="email"
                name="email"
                value={form.email}
                onChange={handleChange}
                required
                className={inputClass}
              />
            </Field>
            <Field id="admin-phone" label={t("dashboard.phone")}>
              <input
                id="admin-phone"
                type="tel"
                name="phone"
                value={form.phone}
                onChange={handleChange}
                placeholder="+225 07 00 00 00 00"
                className={inputClass}
              />
            </Field>
            <Field id="admin-age" label={t("dashboard.age")}>
              <input
                id="admin-age"
                type="number"
                name="age"
                min="15"
                max="60"
                value={form.age}
                onChange={handleChange}
                className={inputClass}
              />
            </Field>
            <Field id="admin-pays" label={`${t("dashboard.country")} *`}>
              <input
                id="admin-pays"
                name="pays"
                value={form.pays}
                onChange={handleChange}
                required
                className={inputClass}
              />
            </Field>
            <Field id="admin-diplome" label={t("dashboard.studyLevel")}>
              <select
                id="admin-diplome"
                name="dernier_diplome"
                value={form.dernier_diplome}
                onChange={handleChange}
                className={inputClass}
              >
                <option value="">{t("dashboard.select")}</option>
                {diplomeOptions.map((n) => (
                  <option key={n} value={n}>
                    {translatedOrRaw(t, "niveau", n) || n}
                  </option>
                ))}
              </select>
            </Field>
            <Field id="admin-domaine" label={t("dashboard.domain")}>
              <select
                id="admin-domaine"
                name="domaine_etudes"
                value={form.domaine_etudes}
                onChange={handleChange}
                className={inputClass}
              >
                <option value="">{t("dashboard.select")}</option>
                {DOMAINES_ETUDES.map((d) => (
                  <option key={d} value={d}>
                    {translatedOrRaw(t, "domaine", d)}
                  </option>
                ))}
              </select>
              {form.domaine_etudes === "Autre" ? (
                <input
                  name="domaine_etudes_precision"
                  value={form.domaine_etudes_precision}
                  onChange={handleChange}
                  placeholder={t("dashboard.domainOtherPlaceholder")}
                  className={`${inputClass} mt-2`}
                />
              ) : null}
            </Field>
            <Field id="admin-budget" label={t("dashboard.budget")}>
              <select
                id="admin-budget"
                name="budget"
                value={form.budget}
                onChange={handleChange}
                className={inputClass}
              >
                <option value="">{t("dashboard.select")}</option>
                {budgetOptions.map((b) => (
                  <option key={b} value={b}>
                    {translatedOrRaw(t, "budget", b) || b}
                  </option>
                ))}
              </select>
            </Field>
            <Field id="admin-rentree" label={t("dashboard.intakeDate")}>
              <select
                id="admin-rentree"
                name="date_rentree"
                value={form.date_rentree}
                onChange={handleChange}
                className={inputClass}
              >
                <option value="">{t("dashboard.select")}</option>
                {rentreeOptions.map((r) => (
                  <option key={r} value={r}>
                    {translatedOrRaw(t, "rentree", r) || r}
                  </option>
                ))}
              </select>
            </Field>
          </div>

          <div className="flex flex-wrap gap-3">
            <button
              type="submit"
              disabled={saving}
              className="px-6 py-3 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 text-white rounded-xl font-bold transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {saving ? `⏳ ${t("saving")}` : `💾 ${t("save")}`}
            </button>
            <button
              type="button"
              disabled={saving}
              onClick={cancelEdit}
              className="px-6 py-3 bg-slate-700/70 hover:bg-slate-600 text-white rounded-xl font-bold transition-all duration-300 disabled:opacity-50"
            >
              {t("cancel")}
            </button>
          </div>
        </form>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <tbody>
              <InfoRow label={`📧 ${t("dashboard.email")}`}>
                {contact.email || "—"}
              </InfoRow>
              <InfoRow label={`📱 ${t("dashboard.phone")}`}>
                {contact.phone ? (
                  isValidWhatsAppNumber(whatsappNumberFromContact(contact)) ? (
                    <a
                      href={`https://wa.me/${whatsappNumberFromContact(contact)}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-emerald-300 hover:text-emerald-200 underline-offset-2 hover:underline"
                    >
                      {contact.phone}
                    </a>
                  ) : (
                    contact.phone
                  )
                ) : (
                  "—"
                )}
              </InfoRow>
              <InfoRow label={`🎂 ${t("dashboard.age")}`}>
                {contact.age || "—"}
              </InfoRow>
              <InfoRow label={`🌍 ${t("dashboard.country")}`}>
                {contact.pays || "—"}
              </InfoRow>
              <InfoRow label={`🎓 ${t("dashboard.studyLevel")}`}>
                {contact.dernier_diplome
                  ? translatedOrRaw(t, "niveau", contact.dernier_diplome)
                  : "—"}
              </InfoRow>
              <InfoRow label={`📚 ${t("dashboard.domain")}`}>
                {contact.domaine_etudes
                  ? translatedOrRaw(t, "domaine", contact.domaine_etudes)
                  : "—"}
              </InfoRow>
              <InfoRow label={`💰 ${t("dashboard.budget")}`}>
                <span className="font-semibold">
                  {contact.budget
                    ? translatedOrRaw(t, "budget", contact.budget)
                    : "—"}
                </span>
              </InfoRow>
              <InfoRow label={`📅 ${t("dashboard.intakeDate")}`}>
                {contact.date_rentree
                  ? translatedOrRaw(t, "rentree", contact.date_rentree)
                  : "—"}
              </InfoRow>
              <InfoRow label={`🔍 ${t("dashboard.source")}`}>
                {contact.source || "—"}
              </InfoRow>
              <InfoRow label={`⭐ ${t("dashboard.qualityScore")}`}>
                {contact.score_qualite || "—"}
              </InfoRow>
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
