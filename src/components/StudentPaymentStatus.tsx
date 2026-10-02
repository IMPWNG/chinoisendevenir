"use client";

import { formatEurosWithCfa } from "../lib/money";
import { paymentPlan } from "../lib/paymentPlan";
import { useSiteI18n } from "../context/SiteI18nContext";

const KEYS = ["e1", "e2", "e3"] as const;

export default function StudentPaymentStatus({
  formule,
  paiements,
}: {
  formule?: string | null;
  paiements?: unknown;
}) {
  const { t } = useSiteI18n();
  const plan = paymentPlan({ formule, paiements });
  if (!plan) return null;

  const paid = plan.priceEuros - plan.remaining;
  const dues = [t("student.payDue1"), t("student.payDue2"), t("student.payDue3")];

  return (
    <section className="student-card student-card-wide" aria-labelledby="student-pay-title">
      <h2 id="student-pay-title" className="card-title">
        {t("student.payTitle")}
      </h2>
      <p className="card-subtitle">
        {plan.remaining === 0
          ? t("student.paySettled")
          : t("student.paySubtitle", { total: formatEurosWithCfa(plan.priceEuros) })}
      </p>
      <div className="student-pay-grid">
        <div className="student-pay-box is-paid">
          <span>{t("student.payPaid")}</span>
          <strong>{formatEurosWithCfa(paid)}</strong>
        </div>
        <div className="student-pay-box is-left">
          <span>{t("student.payLeft")}</span>
          <strong>{formatEurosWithCfa(plan.remaining)}</strong>
        </div>
      </div>
      <ul className="student-pay-list">
        {KEYS.map((key, index) => {
          const done = plan.flags[key];
          return (
            <li key={key}>
              <span>
                <strong>
                  {t("student.payInstallment", { n: index + 1 })} —{" "}
                  {formatEurosWithCfa(plan.amounts[index])}
                </strong>
                <span className="student-pay-due">{dues[index]}</span>
              </span>
              <span className={done ? "doc-badge-ok" : "doc-badge-missing"}>
                {done ? t("student.payStatePaid") : t("student.payStateDue")}
              </span>
            </li>
          );
        })}
      </ul>
      <p className="student-formule-note">{t("student.payHint")}</p>
    </section>
  );
}
