"use client";

import { useEffect, useRef, useState } from "react";
import { useSiteI18n } from "../context/SiteI18nContext";
import { formatEurosOnly } from "../lib/money";
import { centsToMajor, type PaymentEventView, type PaymentMode, type PaymentPlanView, type InstallmentQuote } from "../lib/payments";
import { errorMessage } from "../lib/request";
import { studentSupabase } from "../lib/supabase";

type Quote = { full: InstallmentQuote[]; installments: InstallmentQuote[] };

type PaymentState = {
  ready: boolean;
  configured: boolean;
  currency: string;
  quote: Quote | null;
  plan: PaymentPlanView | null;
  events: PaymentEventView[];
};

type CheckoutResponse = {
  env: "demo" | "prod";
  intentId: string;
  clientSecret: string;
  currency: string;
  successUrl: string;
};

type AirwallexPayments = {
  redirectToCheckout: (options: Record<string, string>) => void;
};

declare global {
  interface Window {
    AirwallexComponentsSDK?: {
      init: (options: {
        env: "demo" | "prod";
        enabledElements: string[];
      }) => Promise<{ payments: AirwallexPayments }>;
    };
  }
}

async function studentFetch<T>(path: string, options: RequestInit = {}): Promise<T> {
  const {
    data: { session },
  } = await studentSupabase.auth.getSession();
  if (!session?.access_token) {
    throw new Error("Session expirée. Veuillez vous reconnecter.");
  }
  const response = await fetch(path, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(options.headers || {}),
      Authorization: `Bearer ${session.access_token}`,
    },
  });
  const data: unknown = await response.json().catch(() => ({}));
  const record = data && typeof data === "object" ? (data as Record<string, unknown>) : {};
  if (!response.ok) {
    throw new Error(errorMessage(record.error, "Une erreur est survenue"));
  }
  return data as T;
}

function loadAirwallexSdk() {
  if (window.AirwallexComponentsSDK) return Promise.resolve();
  return new Promise<void>((resolve, reject) => {
    const existing = document.querySelector<HTMLScriptElement>("script[data-airwallex-sdk]");
    const done = () => {
      if (window.AirwallexComponentsSDK) resolve();
      else reject(new Error("Le module de paiement n'a pas pu être chargé."));
    };
    if (existing) {
      existing.addEventListener("load", done, { once: true });
      existing.addEventListener("error", () => reject(new Error("Le module de paiement n'a pas pu être chargé.")), { once: true });
      return;
    }
    const script = document.createElement("script");
    script.src = "https://static.airwallex.com/components/sdk/v1/index.js";
    script.async = true;
    script.dataset.airwallexSdk = "1";
    script.onload = done;
    script.onerror = () => reject(new Error("Le module de paiement n'a pas pu être chargé."));
    document.head.appendChild(script);
  });
}

function euro(cents: number) {
  return formatEurosOnly(centsToMajor(cents));
}

function statusKey(status: string) {
  if (status === "succeeded") return "student.paymentStatusSucceeded";
  if (status === "processing") return "student.paymentStatusProcessing";
  if (status === "failed") return "student.paymentStatusFailed";
  if (status === "cancelled") return "student.paymentStatusCancelled";
  return "student.paymentStatusPending";
}

export default function StudentPayment({ onActivity }: { onActivity?: () => void }) {
  const { t } = useSiteI18n();
  const [state, setState] = useState<PaymentState | null>(null);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState<PaymentMode | null>(null);
  const [returned, setReturned] = useState(false);
  const onActivityRef = useRef(onActivity);

  useEffect(() => {
    onActivityRef.current = onActivity;
  });

  useEffect(() => {
    let cancelled = false;
    const back = new URLSearchParams(window.location.search).get("paiement") === "retour";
    if (back) setReturned(true);
    (async () => {
      try {
        const data = await studentFetch<PaymentState>("/api/student/payment");
        if (!cancelled) setState(data);
      } catch (err) {
        if (!cancelled) setError(errorMessage(err));
      }
    })();
    const timer = back
      ? window.setTimeout(() => {
          studentFetch<PaymentState>("/api/student/payment")
            .then((data) => {
              if (cancelled) return;
              setState(data);
              onActivityRef.current?.();
            })
            .catch(() => undefined);
        }, 4000)
      : 0;
    return () => {
      cancelled = true;
      if (timer) window.clearTimeout(timer);
    };
  }, []);

  const pay = async (mode: PaymentMode) => {
    if (!state?.configured || !state.ready || busy) return;
    setBusy(mode);
    setError("");
    try {
      const checkout = await studentFetch<CheckoutResponse>("/api/student/payment", {
        method: "POST",
        body: JSON.stringify({ mode }),
      });
      await loadAirwallexSdk();
      const sdk = window.AirwallexComponentsSDK;
      if (!sdk) throw new Error("Le module de paiement n'a pas pu être chargé.");
      const { payments } = await sdk.init({
        env: checkout.env,
        enabledElements: ["payments"],
      });
      payments.redirectToCheckout({
        env: checkout.env,
        mode: "payment",
        currency: checkout.currency,
        intent_id: checkout.intentId,
        client_secret: checkout.clientSecret,
        successUrl: checkout.successUrl,
      });
    } catch (err) {
      setError(errorMessage(err));
      setBusy(null);
    }
  };

  if (!state && !error) {
    return (
      <div className="student-card student-card-wide">
        <p className="card-subtitle">{t("student.loadingFile")}</p>
      </div>
    );
  }

  const plan = state?.plan;
  const locked = Boolean(plan?.installments.some((row) => row.status === "succeeded"));
  const rows = plan?.installments || [];
  const next = rows.find((row) => row.status !== "succeeded");
  const allPaid = rows.length > 0 && rows.every((row) => row.status === "succeeded");
  const quote = state?.quote;
  const blockedReason = !state
    ? ""
    : !state.ready
      ? t("student.paymentNotReady")
      : !state.configured
        ? t("student.paymentNotConfigured")
        : "";

  return (
    <div className="student-card student-card-wide">
      <h2 className="card-title">{t("student.paymentTitle")}</h2>
      <p className="card-subtitle">{t("student.paymentIntro")}</p>
      {returned ? <p className="student-formule-note">{t("student.paymentReturn")}</p> : null}
      {error ? <div className="landing-alert landing-alert-error">{error}</div> : null}
      {blockedReason ? <p className="student-formule-note">{blockedReason}</p> : null}

      {rows.length ? (
        <ul className="student-formule-list">
          {rows.map((row) => (
            <li key={row.sequence}>
              {t("student.paymentInstallment", { n: row.sequence })} — {euro(row.amountCents)} — {t(statusKey(row.status))}
            </li>
          ))}
        </ul>
      ) : quote ? (
        <div className="landing-form-row">
          <div>
            <p className="student-formule-label">{t("student.paymentFull")}</p>
            <p>{euro(quote.full[0]?.amountCents || 0)}</p>
          </div>
          <div>
            <p className="student-formule-label">{t("student.paymentInstallments")}</p>
            <ul className="student-formule-list">
              {quote.installments.map((row) => (
                <li key={row.sequence}>
                  {t("student.paymentInstallment", { n: row.sequence })} — {euro(row.amountCents)}
                </li>
              ))}
            </ul>
          </div>
        </div>
      ) : (
        <p className="card-subtitle">{t("student.paymentEmpty")}</p>
      )}

      {state?.ready && state.configured && quote && !allPaid ? (
        <div className="landing-form-row">
          {(!plan || plan.mode === "full" || !locked) && (
            <button
              type="button"
              className="landing-btn landing-btn-primary"
              disabled={Boolean(busy) || (plan?.mode === "installments" && locked)}
              onClick={() => pay("full")}
            >
              {busy === "full"
                ? t("student.paymentWorking")
                : t("student.paymentPayNext", {
                    amount: euro((plan?.mode === "full" ? next?.amountCents : quote.full[0]?.amountCents) || 0),
                  })}
            </button>
          )}
          {(!locked || plan?.mode === "installments") && (
            <button
              type="button"
              className="landing-btn landing-btn-secondary"
              disabled={Boolean(busy)}
              onClick={() => pay("installments")}
            >
              {busy === "installments"
                ? t("student.paymentWorking")
                : plan?.mode === "installments" && next
                  ? t("student.paymentPayNext", { amount: euro(next.amountCents) })
                  : t("student.paymentInstallments")}
            </button>
          )}
        </div>
      ) : null}

      {allPaid ? (
        <p className="student-formule-note">{t("student.paymentAllPaid")}</p>
      ) : null}

      <h3 className="card-title">{t("student.paymentHistory")}</h3>
      {state?.events.length ? (
        <ul className="student-formule-list">
          {state.events.map((event) => (
            <li key={event.id}>
              {new Intl.DateTimeFormat("fr-FR", { dateStyle: "medium", timeStyle: "short" }).format(new Date(event.at))}
              {" — "}
              {event.label}
              {event.sequence ? ` — ${t("student.paymentInstallment", { n: event.sequence })}` : ""}
              {event.amountCents ? ` — ${euro(event.amountCents)}` : ""}
            </li>
          ))}
        </ul>
      ) : (
        <p className="card-subtitle">{t("student.paymentEmpty")}</p>
      )}
    </div>
  );
}
