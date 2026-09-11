"use client";

import Link from "next/link";
import { useSiteI18n } from "../context/SiteI18nContext";

export default function PageCta({ title, subtitle, cta, href = "/#lead-form" }) {
  const { t } = useSiteI18n();
  const label = cta || t("hero.ctaPrimary");

  return (
    <div className="mt-16 text-center bg-[#1d3557] rounded-2xl p-10">
      <h2 className="text-white text-lg font-semibold mb-2">{title}</h2>
      {subtitle ? <p className="text-white/80 mb-6">{subtitle}</p> : null}
      <Link href={href} className="landing-btn landing-btn-accent">
        {label}
      </Link>
    </div>
  );
}
