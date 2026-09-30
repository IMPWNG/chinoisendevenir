"use client";

import { useEffect, useState } from "react";
import { adminSupabase } from "../lib/supabase";
import { useAdminI18n } from "../context/AdminI18nContext";
import { CONTACT_FROM_EMAIL } from "../lib/emailConfig";
import { getFormuleNumber } from "../lib/formules";
import { errorMessage } from "../lib/request";
import {
  CONTRACT_PLACE,
  CONTRACT_SITE,
  buildSaleContract,
  clientReady,
  contractClientFromContact,
  contractSendDate,
  emptyPrestataire,
  prestataireReady,
  readPrestataire,
  type PrestataireInfo,
} from "../lib/saleContract";

const STORAGE_KEY = "ced-contract-prestataire";

type ContractContact = {
  id: string;
  prenom?: string | null;
  nom?: string | null;
  email?: string | null;
  phone?: string | null;
  pays?: string | null;
  formule?: string | null;
};

function fieldClass(disabled: boolean) {
  return `mt-2 w-full px-4 py-3 bg-slate-800/80 border border-slate-600/50 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 disabled:opacity-50 ${
    disabled ? "cursor-not-allowed" : ""
  }`;
}

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

export default function AdminSendContract({
  contact,
  onSent,
}: {
  contact: ContractContact;
  onSent?: () => void;
}) {
  const { t } = useAdminI18n();
  const [prestataire, setPrestataire] = useState<PrestataireInfo>(emptyPrestataire);
  const [birth, setBirth] = useState("");
  const [nationality, setNationality] = useState(contact.pays || "");
  const [address, setAddress] = useState("");
  const [phone, setPhone] = useState(contact.phone || "");
  const [formuleNumber, setFormuleNumber] = useState(
    getFormuleNumber(contact.formule) || 0,
  );
  const [preview, setPreview] = useState(false);
  const [sending, setSending] = useState(false);

  useEffect(() => {
    setBirth("");
    setNationality(contact.pays || "");
    setAddress("");
    setPhone(contact.phone || "");
    setFormuleNumber(getFormuleNumber(contact.formule) || 0);
    setPreview(false);
    try {
      const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || "null");
      if (saved) setPrestataire(readPrestataire(saved));
    } catch {
      setPrestataire(emptyPrestataire());
    }
  }, [contact.id, contact.pays, contact.phone, contact.formule]);

  const lockedFormule = getFormuleNumber(contact.formule);
  const client = contractClientFromContact(contact, {
    phone,
    dateNaissance: birth,
    nationalite: nationality,
    adresse: address,
  });
  const ready =
    prestataireReady(prestataire) &&
    clientReady(client) &&
    (formuleNumber === 1 || formuleNumber === 2 || formuleNumber === 3);

  const previewHtml =
    preview && ready
      ? buildSaleContract({
          client,
          prestataire,
          formuleNumber,
          sentAt: new Date(),
        })?.html || ""
      : "";

  function updatePrestataire(key: keyof PrestataireInfo, value: string) {
    const next = readPrestataire({ ...prestataire, [key]: value });
    setPrestataire(next);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    } catch {
      /* ignore private mode */
    }
  }

  async function send() {
    if (!ready) return;
    const confirmed = confirm(
      t("dashboard.contractConfirm", {
        name: `${client.prenom} ${client.nom}`.trim(),
      }),
    );
    if (!confirmed) return;

    setSending(true);
    try {
      const response = await authedFetch("/api/admin/send-contract", {
        method: "POST",
        body: JSON.stringify({
          contactId: contact.id,
          formuleNumber,
          prestataire,
          phone,
          dateNaissance: birth,
          nationalite: nationality,
          adresse: address,
        }),
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok || !data.success) {
        alert("❌ " + (data.error || t("dashboard.contractFail")));
        return;
      }
      alert(`✅ ${t("dashboard.contractOk")}`);
      onSent?.();
    } catch (error: unknown) {
      const message = errorMessage(error);
      alert(
        "❌ " +
          (message === "SESSION" ? t("sessionExpired") : t("dashboard.contractFail")),
      );
    } finally {
      setSending(false);
    }
  }

  const label = "text-xs font-bold text-slate-400 uppercase tracking-wide";

  return (
    <div>
      <p className="text-xs text-slate-400 mb-4">{t("dashboard.contractHint")}</p>

      <p className={`${label} mb-2`}>{t("dashboard.contractClient")}</p>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-4">
        <div>
          <label className={label}>{t("dashboard.contractFirstname")}</label>
          <input readOnly value={client.prenom} className={fieldClass(true)} />
        </div>
        <div>
          <label className={label}>{t("dashboard.contractLastname")}</label>
          <input readOnly value={client.nom} className={fieldClass(true)} />
        </div>
        <div>
          <label className={label}>{t("dashboard.contractEmail")}</label>
          <input readOnly value={client.email} className={fieldClass(true)} />
        </div>
        <div>
          <label className={label}>{t("dashboard.contractPhone")}</label>
          <input
            value={phone}
            readOnly={Boolean(String(contact.phone || "").trim())}
            onChange={(e) => setPhone(e.target.value)}
            className={fieldClass(Boolean(contact.phone))}
          />
        </div>
        <div>
          <label className={label}>{t("dashboard.contractBirth")}</label>
          <input
            value={birth}
            disabled={sending}
            onChange={(e) => setBirth(e.target.value)}
            placeholder="12 mars 2002"
            className={fieldClass(sending)}
          />
        </div>
        <div>
          <label className={label}>{t("dashboard.contractNationality")}</label>
          <input
            value={nationality}
            disabled={sending}
            onChange={(e) => setNationality(e.target.value)}
            className={fieldClass(sending)}
          />
        </div>
        <div className="md:col-span-2">
          <label className={label}>{t("dashboard.contractAddress")}</label>
          <input
            value={address}
            disabled={sending}
            onChange={(e) => setAddress(e.target.value)}
            className={fieldClass(sending)}
          />
        </div>
      </div>

      <p className={`${label} mb-2`}>{t("dashboard.contractProvider")}</p>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-4">
        {(
          [
            ["denomination", "contractDenomination"],
            ["forme", "contractLegalForm"],
            ["adresse", "contractSeat"],
            ["immatriculation", "contractRegistration"],
            ["representant", "contractRepresentative"],
          ] as const
        ).map(([key, i18nKey]) => (
          <div key={key} className={key === "adresse" ? "md:col-span-2" : ""}>
            <label className={label}>{t(`dashboard.${i18nKey}`)}</label>
            <input
              value={prestataire[key]}
              disabled={sending}
              onChange={(e) => updatePrestataire(key, e.target.value)}
              className={fieldClass(sending)}
            />
          </div>
        ))}
        <div>
          <label className={label}>{t("dashboard.contractProviderEmail")}</label>
          <input readOnly value={CONTACT_FROM_EMAIL} className={fieldClass(true)} />
        </div>
        <div>
          <label className={label}>{t("dashboard.contractSite")}</label>
          <input readOnly value={CONTRACT_SITE} className={fieldClass(true)} />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-4">
        <div>
          <label className={label}>{t("dashboard.contractPlace")}</label>
          <input readOnly value={CONTRACT_PLACE} className={fieldClass(true)} />
        </div>
        <div>
          <label className={label}>{t("dashboard.contractDate")}</label>
          <input
            readOnly
            value={contractSendDate(new Date())}
            className={fieldClass(true)}
          />
        </div>
        <div>
          <label className={label}>{t("dashboard.contractFormule")}</label>
          {lockedFormule ? (
            <input
              readOnly
              value={`Formule ${lockedFormule}`}
              className={fieldClass(true)}
            />
          ) : (
            <select
              value={formuleNumber || ""}
              disabled={sending}
              onChange={(e) => setFormuleNumber(Number(e.target.value))}
              className={fieldClass(sending)}
            >
              <option value="">{t("dashboard.contractNeedFormule")}</option>
              <option value="1">Formule 1 — 800 €</option>
              <option value="2">Formule 2 — 1 700 €</option>
              <option value="3">Formule 3 — 2 000 €</option>
            </select>
          )}
        </div>
      </div>
      <p className="text-xs text-slate-500 mb-4">{t("dashboard.contractStampNote")}</p>

      <div className="flex flex-wrap gap-3">
        <button
          type="button"
          disabled={!ready || sending}
          onClick={() => setPreview((open) => !open)}
          className="px-5 py-3 bg-slate-700/70 hover:bg-slate-600 text-white rounded-xl font-bold disabled:opacity-50"
        >
          {preview ? t("dashboard.contractHidePreview") : t("dashboard.contractPreview")}
        </button>
        <button
          type="button"
          disabled={!ready || sending || !client.email}
          onClick={send}
          className="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white rounded-xl font-bold disabled:opacity-50"
        >
          {sending ? `⏳ ${t("sending")}` : `📤 ${t("dashboard.contractSend")}`}
        </button>
      </div>

      {preview && previewHtml ? (
        <iframe
          title={t("dashboard.contractPreview")}
          sandbox=""
          className="mt-4 w-full h-[32rem] rounded-xl border border-slate-700/50 bg-white"
          srcDoc={previewHtml}
        />
      ) : null}
    </div>
  );
}
