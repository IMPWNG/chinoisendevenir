"use client";

import { useState } from "react";
import { adminSupabase } from "../lib/supabase";
import { useAdminI18n } from "../context/AdminI18nContext";
import { formatEurosOnly, moneyAsideForRole } from "../lib/money";
import { paymentPlan, type PaymentFlags } from "../lib/paymentPlan";
import { useAdminAccess } from "../context/AdminAccessContext";

type PaymentContact = {
  id: string;
  formule?: string | null;
  notes_admin?: string | null;
  paiements?: unknown;
};

const KEYS = ["e1", "e2", "e3"] as const;

export default function AdminPaymentSchedule({
  contact,
  onPatched,
}: {
  contact: PaymentContact;
  onPatched: (paiements: PaymentFlags) => void;
}) {
  const { t } = useAdminI18n();
  const access = useAdminAccess();
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const plan = paymentPlan(contact);

  if (!plan) {
    return <p className="text-sm text-slate-400">{t("dashboard.payNeedFormule")}</p>;
  }

  const schedule = plan;
  const labels = [
    t("dashboard.payDue1"),
    t("dashboard.payDue2"),
    t("dashboard.payDue3"),
  ];

  async function toggle(key: (typeof KEYS)[number]) {
    const next: PaymentFlags = { ...schedule.flags, [key]: !schedule.flags[key] };
    setSaving(true);
    setError("");
    const { error: updateError } = await adminSupabase
      .from("contacts")
      .update({ paiements: next })
      .eq("id", contact.id);
    setSaving(false);
    if (updateError) {
      setError(updateError.message);
      return;
    }
    onPatched(next);
  }

  return (
    <div className="space-y-4">
      <p className="text-sm text-slate-300">
        {plan.remaining === 0
          ? t("dashboard.paySettled")
          : moneyAsideForRole(
              access.role,
              t("dashboard.payRemaining", {
                amount: formatEurosOnly(plan.remaining),
                count: plan.paidCount,
              }),
            )}
      </p>
      <ul className="space-y-3">
        {KEYS.map((key, index) => (
          <li key={key}>
            <label className="flex items-start gap-3 cursor-pointer">
              <input
                type="checkbox"
                className="mt-1 h-4 w-4 rounded border-slate-500 bg-slate-700 text-emerald-400 focus:ring-emerald-400/50"
                checked={plan.flags[key]}
                disabled={saving}
                onChange={() => toggle(key)}
              />
              <span>
                <span className="block text-sm font-semibold text-white">
                  {t("dashboard.payInstallment", { n: index + 1 })} —{" "}
                  {formatEurosOnly(plan.amounts[index])}
                </span>
                <span className="block text-xs text-slate-400">{labels[index]}</span>
              </span>
            </label>
          </li>
        ))}
      </ul>
      <p className="text-xs text-slate-500">{t("dashboard.payHint")}</p>
      {error ? <p className="text-sm text-rose-300">{error}</p> : null}
    </div>
  );
}
