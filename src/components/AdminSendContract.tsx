"use client";

import { useEffect, useRef, useState } from "react";
import { adminSupabase } from "../lib/supabase";
import { useAdminI18n } from "../context/AdminI18nContext";
import { CONTACT_FROM_EMAIL } from "../lib/emailConfig";
import { getFormuleNumber } from "../lib/formules";
import { errorMessage } from "../lib/request";
import {
  CONTRACT_ADDRESS,
  CONTRACT_COMPANY,
  CONTRACT_PLACE,
  CONTRACT_REGISTRATION,
  CONTRACT_CURRENCIES,
  CONTRACT_SITE,
  type ContractCurrency,
  buildSaleContract,
  clientReady,
  contractClientFromContact,
  contractGaps,
  contractSendDate,
  CONTRACT_TUTOR_CAP,
  readContractDraft,
  type ContractDraft,
} from "../lib/saleContract";

type TutorFields = { nom: string; lien: string; adresse: string; contact: string };

function emptyTutor(): TutorFields {
  return { nom: "", lien: "", adresse: "", contact: "" };
}

type ContractContact = {
  id: string;
  prenom?: string | null;
  nom?: string | null;
  email?: string | null;
  phone?: string | null;
  pays?: string | null;
  formule?: string | null;
  contrat?: unknown;
};

function fieldClass(disabled: boolean) {
  return `mt-2 w-full px-4 py-3 bg-slate-800/80 border border-slate-600/50 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 disabled:opacity-50 ${
    disabled ? "cursor-not-allowed" : ""
  }`;
}

function fillContractPdf(frame: Window, html: string) {
  frame.document.open();
  frame.document.write(
    html.replace(
      "</head>",
      "<style>@page{margin:16mm} @media print{body{background:#fff!important}}</style></head>",
    ),
  );
  frame.document.close();
  const images = [...frame.document.images];
  const go = () => {
    frame.focus();
    frame.print();
  };
  if (!images.length) {
    go();
    return;
  }
  let pending = images.length;
  const done = () => {
    pending -= 1;
    if (pending <= 0) go();
  };
  for (const img of images) {
    if (img.complete) done();
    else {
      img.addEventListener("load", done);
      img.addEventListener("error", done);
    }
  }
}

/** Blank window opened in the click, then filled. `noopener` would return null and block the PDF. */
function openContractPdfWindow() {
  return window.open("", "_blank");
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
  onDraftSaved,
}: {
  contact: ContractContact;
  onSent?: () => void;
  onDraftSaved?: (contrat: ContractDraft) => void;
}) {
  const { t } = useAdminI18n();
  const [birth, setBirth] = useState("");
  const [nationality, setNationality] = useState("");
  const [residence, setResidence] = useState(contact.pays || "");
  const [address, setAddress] = useState("");
  const [phone, setPhone] = useState(contact.phone || "");
  const [minor, setMinor] = useState(false);
  const [tutors, setTutors] = useState<TutorFields[]>([emptyTutor()]);
  const [otherPayer, setOtherPayer] = useState(false);
  const [payerName, setPayerName] = useState("");
  const [payerLink, setPayerLink] = useState("");
  const [payerAddress, setPayerAddress] = useState("");
  const [payerContact, setPayerContact] = useState("");
  const [paymentMode, setPaymentMode] = useState("");
  const [currency, setCurrency] = useState<ContractCurrency>("EUR");
  const [copyAdmin, setCopyAdmin] = useState(true);
  const [draftNote, setDraftNote] = useState("");
  const [formuleNumber, setFormuleNumber] = useState(
    getFormuleNumber(contact.formule) || 0,
  );
  const [preview, setPreview] = useState(false);
  const [sending, setSending] = useState(false);
  const [epoch, setEpoch] = useState(0);
  const saveSeq = useRef(0);

  useEffect(() => {
    const saved = readContractDraft(contact.contrat);
    setBirth(saved?.dateNaissance || "");
    setNationality(saved?.nationalite || "");
    setResidence(saved?.residence || contact.pays || "");
    setAddress(saved?.adresse || "");
    setPhone(saved?.phone || contact.phone || "");
    setMinor(saved?.mineur === true);
    setTutors(saved?.representants || [emptyTutor()]);
    setOtherPayer(saved?.tiersPayeur === true);
    setPayerName(saved?.payeur.nom || "");
    setPayerLink(saved?.payeur.lien || "");
    setPayerAddress(saved?.payeur.adresse || "");
    setPayerContact(saved?.payeur.contact || "");
    setPaymentMode(saved?.paymentMode || "");
    setCurrency(saved?.currency || "EUR");
    setCopyAdmin(saved ? saved.copyAdmin : true);
    setFormuleNumber(
      getFormuleNumber(contact.formule) || saved?.formuleNumber || 0,
    );
    setPreview(false);
    setDraftNote("");
    setEpoch((value) => value + 1);
    // ponytail: reload only when the fiche changes. A parent patch of `contrat` must not reset the fields mid-typing.
  }, [contact.id]);

  const lockedFormule = getFormuleNumber(contact.formule);
  const client = contractClientFromContact(contact, {
    phone,
    dateNaissance: birth,
    nationalite: nationality,
    residence,
    adresse: address,
    mineur: minor,
    representants: tutors,
    representant: tutors[0],
    tiersPayeur: otherPayer,
    payeur: {
      nom: payerName,
      lien: payerLink,
      adresse: payerAddress,
      contact: payerContact,
    },
  });
  const gaps = contractGaps(client);
  const ready =
    clientReady(client) &&
    (formuleNumber === 1 || formuleNumber === 2 || formuleNumber === 3);

  const terms = { paymentMode, currency };
  const built =
    preview && ready
      ? buildSaleContract({
          client,
          formuleNumber,
          sentAt: new Date(),
          terms,
        })
      : null;
  const previewHtml = built && "html" in built ? built.html : "";

  function contractHtml() {
    const doc = buildSaleContract({
      client,
      formuleNumber,
      sentAt: new Date(),
      terms,
    });
    return doc && "html" in doc ? doc.html : "";
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
          phone,
          dateNaissance: birth,
          nationalite: nationality,
          residence,
          adresse: address,
          mineur: minor,
          representants: tutors,
          representant: tutors[0],
          tiersPayeur: otherPayer,
          payeur: {
            nom: payerName,
            lien: payerLink,
            adresse: payerAddress,
            contact: payerContact,
          },
          terms: { paymentMode, currency },
          copyAdmin,
        }),
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok || !data.success) {
        alert(
          "❌ " +
            (data.error || t("dashboard.contractFail")) +
            (Array.isArray(data.gaps) && data.gaps.length
              ? "\n" + data.gaps.join("\n")
              : ""),
        );
        return;
      }
      alert(
        `✅ ${t("dashboard.contractOk")}${
          copyAdmin && !data.copyError ? `\n${t("dashboard.contractCopyOk")}` : ""
        }`,
      );
      if (data.copyError) alert(`❌ ${t("dashboard.contractCopyFail")}`);
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

  function currentDraft(): ContractDraft {
    return {
      v: 1,
      phone,
      dateNaissance: birth,
      nationalite: nationality,
      residence,
      adresse: address,
      mineur: minor,
      representants: tutors,
      tiersPayeur: otherPayer,
      payeur: {
        nom: payerName,
        lien: payerLink,
        adresse: payerAddress,
        contact: payerContact,
      },
      paymentMode,
      currency,
      formuleNumber,
      copyAdmin,
    };
  }

  useEffect(() => {
    if (epoch === 0) return;
    const id = contact.id;
    const draft = currentDraft();
    const seq = ++saveSeq.current;
    const timer = setTimeout(() => {
      void adminSupabase
        .from("contacts")
        .update({ contrat: draft })
        .eq("id", id)
        .then(({ error }) => {
          if (saveSeq.current !== seq) return;
          if (error) {
            setDraftNote(t("dashboard.contractDraftFail"));
            return;
          }
          setDraftNote(t("dashboard.contractDraftSaved"));
          onDraftSaved?.(draft);
        });
    }, 700);
    return () => clearTimeout(timer);
  }, [
    epoch,
    contact.id,
    phone,
    birth,
    nationality,
    residence,
    address,
    minor,
    tutors,
    otherPayer,
    payerName,
    payerLink,
    payerAddress,
    payerContact,
    paymentMode,
    currency,
    formuleNumber,
    copyAdmin,
  ]);

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
            placeholder={t("dashboard.contractBirthHint")}
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
        <div>
          <label className={label}>{t("dashboard.contractResidence")}</label>
          <input
            value={residence}
            disabled={sending}
            onChange={(e) => setResidence(e.target.value)}
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
        <label className="md:col-span-2 flex items-center gap-2 text-sm text-slate-200">
          <input
            type="checkbox"
            checked={minor}
            disabled={sending}
            onChange={(e) => setMinor(e.target.checked)}
          />
          {t("dashboard.contractMinor")}
        </label>
        <div className="md:col-span-2 space-y-3">
            {tutors.map((tutor, index) => (
              <div key={index} className="rounded-xl border border-slate-700 bg-slate-900/40 p-3">
                <div className="mb-2 flex items-center justify-between gap-2">
                  <p className="text-sm font-semibold text-white">
                    {t(
                      minor
                        ? "dashboard.contractTutorHeading"
                        : "dashboard.contractRelatedHeading",
                      { n: String(index + 1) },
                    )}
                  </p>
                  {tutors.length > 1 ? (
                    <button
                      type="button"
                      disabled={sending}
                      onClick={() =>
                        setTutors((current) => current.filter((_, item) => item !== index))
                      }
                      className="text-xs font-bold text-slate-300 hover:text-white"
                    >
                      {t("dashboard.contractTutorRemove")}
                    </button>
                  ) : null}
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div>
                    <label className={label}>
                      {t(minor ? "dashboard.contractRepName" : "dashboard.contractRelatedName")}
                    </label>
                    <input
                      value={tutor.nom}
                      disabled={sending}
                      onChange={(e) =>
                        setTutors((current) =>
                          current.map((item, itemIndex) =>
                            itemIndex === index ? { ...item, nom: e.target.value } : item,
                          ),
                        )
                      }
                      className={fieldClass(sending)}
                    />
                  </div>
                  <div>
                    <label className={label}>{t("dashboard.contractRepLink")}</label>
                    <input
                      value={tutor.lien}
                      disabled={sending}
                      onChange={(e) =>
                        setTutors((current) =>
                          current.map((item, itemIndex) =>
                            itemIndex === index ? { ...item, lien: e.target.value } : item,
                          ),
                        )
                      }
                      className={fieldClass(sending)}
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className={label}>
                      {t(
                        minor
                          ? "dashboard.contractRepAddress"
                          : "dashboard.contractRelatedAddress",
                      )}
                    </label>
                    <input
                      value={tutor.adresse}
                      disabled={sending}
                      onChange={(e) =>
                        setTutors((current) =>
                          current.map((item, itemIndex) =>
                            itemIndex === index ? { ...item, adresse: e.target.value } : item,
                          ),
                        )
                      }
                      className={fieldClass(sending)}
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className={label}>
                      {t(
                        minor
                          ? "dashboard.contractRepContact"
                          : "dashboard.contractRelatedContact",
                      )}
                    </label>
                    <input
                      value={tutor.contact}
                      disabled={sending}
                      onChange={(e) =>
                        setTutors((current) =>
                          current.map((item, itemIndex) =>
                            itemIndex === index ? { ...item, contact: e.target.value } : item,
                          ),
                        )
                      }
                      className={fieldClass(sending)}
                    />
                  </div>
                </div>
              </div>
            ))}
            {tutors.length < CONTRACT_TUTOR_CAP ? (
              <button
                type="button"
                disabled={sending}
                onClick={() => setTutors((current) => [...current, emptyTutor()])}
                className="rounded-lg border border-slate-600 px-3 py-2 text-sm font-bold text-slate-200 hover:border-slate-400 hover:text-white"
              >
                {t(minor ? "dashboard.contractTutorAdd" : "dashboard.contractRelatedAdd")}
              </button>
            ) : null}
          </div>
      </div>

      <p className={`${label} mb-2`}>{t("dashboard.contractProvider")}</p>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-4">
        <div className="md:col-span-2">
          <label className={label}>{t("dashboard.contractDenomination")}</label>
          <input readOnly value={CONTRACT_COMPANY} className={fieldClass(true)} />
        </div>
        <div className="md:col-span-2">
          <label className={label}>{t("dashboard.contractSeat")}</label>
          <input readOnly value={CONTRACT_ADDRESS} className={fieldClass(true)} />
        </div>
        <div>
          <label className={label}>{t("dashboard.contractRegistration")}</label>
          <input readOnly value={CONTRACT_REGISTRATION} className={fieldClass(true)} />
        </div>
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
      <p className="text-xs text-slate-500 mb-3">{t("dashboard.contractPayHint")}</p>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-4">
        <div>
          <label className={label}>{t("dashboard.contractCurrency")}</label>
          <select
            value={currency}
            disabled={sending}
            onChange={(e) => setCurrency(e.target.value as ContractCurrency)}
            className={fieldClass(sending)}
          >
            {CONTRACT_CURRENCIES.map((code) => (
              <option key={code} value={code}>
                {t(`dashboard.contractCurrency${code}`)}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className={label}>{t("dashboard.contractPayMode")}</label>
          <input
            value={paymentMode}
            disabled={sending}
            onChange={(e) => setPaymentMode(e.target.value)}
            placeholder={t("dashboard.contractPayModeHint")}
            className={fieldClass(sending)}
          />
        </div>
      </div>
      <label className="mb-3 flex items-center gap-2 text-sm text-slate-200">
        <input
          type="checkbox"
          checked={otherPayer}
          disabled={sending}
          onChange={(e) => setOtherPayer(e.target.checked)}
        />
        {t("dashboard.contractPayer")}
      </label>
      {otherPayer ? (
        <>
          <p className="text-xs text-slate-500 mb-3">{t("dashboard.contractPayerHint")}</p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-4">
            <div>
              <label className={label}>{t("dashboard.contractPayerName")}</label>
              <input
                value={payerName}
                disabled={sending}
                onChange={(e) => setPayerName(e.target.value)}
                className={fieldClass(sending)}
              />
            </div>
            <div>
              <label className={label}>{t("dashboard.contractPayerLink")}</label>
              <input
                value={payerLink}
                disabled={sending}
                onChange={(e) => setPayerLink(e.target.value)}
                className={fieldClass(sending)}
              />
            </div>
            <div className="md:col-span-2">
              <label className={label}>{t("dashboard.contractPayerAddress")}</label>
              <input
                value={payerAddress}
                disabled={sending}
                onChange={(e) => setPayerAddress(e.target.value)}
                className={fieldClass(sending)}
              />
            </div>
            <div className="md:col-span-2">
              <label className={label}>{t("dashboard.contractPayerContact")}</label>
              <input
                value={payerContact}
                disabled={sending}
                onChange={(e) => setPayerContact(e.target.value)}
                className={fieldClass(sending)}
              />
            </div>
          </div>
        </>
      ) : null}
      {gaps.length ? (
        <div className="mb-4 rounded-xl border border-amber-500/40 bg-amber-500/10 p-4">
          <p className="text-sm font-bold text-amber-200">VALIDATION HUMAINE REQUISE</p>
          <ul className="mt-2 list-disc pl-5 text-sm text-amber-100">
            {gaps.map((gap) => (
              <li key={gap}>{gap}</li>
            ))}
          </ul>
        </div>
      ) : null}
      <p className="text-xs text-slate-500 mb-4">{t("dashboard.contractStampNote")}</p>
      <label className="mb-4 flex items-center gap-2 text-sm text-slate-200">
        <input
          type="checkbox"
          checked={copyAdmin}
          disabled={sending}
          onChange={(e) => setCopyAdmin(e.target.checked)}
        />
        {t("dashboard.contractCopyAdmin")}
      </label>
      {draftNote ? <p className="mb-3 text-xs text-slate-400">{draftNote}</p> : null}

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
          disabled={!ready || sending}
          onClick={() => {
            const html = contractHtml();
            if (!html) return;
            const frame = openContractPdfWindow();
            if (!frame) {
              alert(t("dashboard.contractPdfBlocked"));
              return;
            }
            fillContractPdf(frame, html);
          }}
          className="px-5 py-3 bg-slate-700/70 hover:bg-slate-600 text-white rounded-xl font-bold disabled:opacity-50"
        >
          {t("dashboard.contractPdf")}
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
