"use client";

import { useEffect, useId, useState } from "react";
import { usePathname } from "next/navigation";
import LeadForm from "./LeadForm";
import { useSiteI18n } from "../context/SiteI18nContext";

function isPublicPage(path: string) {
  return !path.startsWith("/admin") && !path.startsWith("/espace-etudiant");
}

export default function IntakePopup() {
  const pathname = usePathname() || "/";
  const { t } = useSiteI18n();
  const titleId = useId();
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!isPublicPage(pathname)) return;
    const timer = window.setTimeout(() => setOpen(true), 6000);
    return () => window.clearTimeout(timer);
  }, [pathname]);

  useEffect(() => {
    if (!open) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") close();
    };
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = previous;
      window.removeEventListener("keydown", onKey);
    };
  }, [open]);

  function close() {
    setOpen(false);
  }

  if (!open || !isPublicPage(pathname)) return null;

  return (
    <div className="intake-popup" role="presentation">
      <button type="button" className="intake-popup-backdrop" aria-label={t("intakePopup.close")} onClick={close} />
      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        className="intake-popup-card"
      >
        <header className="intake-popup-head">
          <button type="button" className="intake-popup-close" aria-label={t("intakePopup.close")} onClick={close}>
            ×
          </button>
          <h2 id={titleId}>{t("intakePopup.title")}</h2>
          <p>{t("intakePopup.p1")}</p>
        </header>
        <div className="intake-popup-body">
          <p>{t("intakePopup.p2")}</p>
          <p className="intake-popup-note">{t("intakePopup.p3")}</p>
          <div className="intake-popup-form">
            <h3>{t("form.title")}</h3>
            <LeadForm embedded initialValues={{ date_rentree: "septembre_2027" }} />
          </div>
        </div>
      </section>
    </div>
  );
}
