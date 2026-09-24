"use client";

import { useEffect, useState } from "react";
import { useAdminI18n } from "../context/AdminI18nContext";
import { adminSupabase } from "../lib/supabase";
import { centsToMajor, type PaymentEventView, type PaymentPlanView } from "../lib/payments";
import { formatEurosOnly } from "../lib/money";

type PaymentState = {
  ready: boolean;
  plan: PaymentPlanView | null;
  events: PaymentEventView[];
};

function euro(cents: number) {
  return formatEurosOnly(centsToMajor(cents));
}

function statusLabel(t: (path: string) => string, status: string) {
  if (status === "succeeded") return t("dashboard.paymentStatusSucceeded");
  if (status === "processing") return t("dashboard.paymentStatusProcessing");
  if (status === "failed") return t("dashboard.paymentStatusFailed");
  if (status === "cancelled") return t("dashboard.paymentStatusCancelled");
  return t("dashboard.paymentStatusPending");
}

export default function AdminContactPayments({ contactId }: { contactId: string }) {
  const { t } = useAdminI18n();
  const [state, setState] = useState<PaymentState | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const {
        data: { session },
      } = await adminSupabase.auth.getSession();
      if (!session?.access_token) return;
      const response = await fetch(`/api/admin/payments?contactId=${encodeURIComponent(contactId)}`, {
        headers: { Authorization: `Bearer ${session.access_token}` },
      });
      const data = await response.json().catch(() => ({}));
      if (cancelled) return;
      if (!response.ok) {
        setError(data.error || t("dashboard.paymentsUnavailable"));
        return;
      }
      setState(data);
    })().catch(() => {
      if (!cancelled) setError(t("dashboard.paymentsUnavailable"));
    });
    return () => {
      cancelled = true;
    };
  }, [contactId, t]);

  const when = (value: string) =>
    new Intl.DateTimeFormat("fr-FR", { dateStyle: "medium", timeStyle: "short" }).format(new Date(value));

  return (
    <div className="mb-8 pb-8 border-b border-slate-700/50">
      <h3 className="text-sm font-bold text-slate-300 mb-3 uppercase tracking-wide">
        💳 {t("dashboard.paymentsTitle")}
      </h3>
      {error ? <p className="text-sm text-rose-300">{error}</p> : null}
      {!state && !error ? <p className="text-sm text-slate-400">{t("loading")}</p> : null}
      {state && !state.ready ? (
        <p className="text-sm text-slate-400">{t("dashboard.paymentsUnavailable")}</p>
      ) : null}
      {state?.plan ? (
        <>
          <p className="text-sm text-slate-300 mb-3">
            {state.plan.mode === "full"
              ? t("dashboard.paymentsModeFull")
              : t("dashboard.paymentsModeInstallments")}
            {" — "}
            {euro(state.plan.totalCents)}
          </p>
          <ul className="space-y-2 mb-4">
            {state.plan.installments.map((row) => (
              <li
                key={row.sequence}
                className="flex flex-wrap justify-between gap-2 rounded-xl border border-slate-600/50 bg-slate-700/40 px-4 py-3 text-sm text-white"
              >
                <span>
                  {t("dashboard.paymentsSequence", { n: row.sequence })} — {euro(row.amountCents)}
                </span>
                <span className="text-slate-300">{statusLabel(t, row.status)}</span>
              </li>
            ))}
          </ul>
        </>
      ) : state?.ready ? (
        <p className="text-sm text-slate-400 mb-4">{t("dashboard.paymentsEmpty")}</p>
      ) : null}
      {state?.events.length ? (
        <ul className="space-y-2">
          {state.events.map((event) => (
            <li key={event.id} className="text-sm text-slate-300">
              <span className="text-slate-500">{when(event.at)}</span>
              {" — "}
              {event.label}
              {event.sequence ? ` — ${t("dashboard.paymentsSequence", { n: event.sequence })}` : ""}
              {event.amountCents ? ` — ${euro(event.amountCents)}` : ""}
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}
