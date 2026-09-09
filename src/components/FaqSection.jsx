"use client";

import { useSiteI18n } from "../context/SiteI18nContext";

export default function FaqSection({
  items,
  title,
  headingId = "faq-heading",
}) {
  const { t } = useSiteI18n();
  const heading = title || t("home.faqTitle");
  if (!items?.length) return null;

  return (
    <section className="seo-faq" aria-labelledby={headingId}>
      <h2 id={headingId} className="seo-faq-title">
        {heading}
      </h2>
      <div className="seo-faq-list">
        {items.map((faq) => (
          <details key={faq.question} className="seo-faq-item">
            <summary>{faq.question}</summary>
            <p>{faq.answer}</p>
          </details>
        ))}
      </div>
    </section>
  );
}
