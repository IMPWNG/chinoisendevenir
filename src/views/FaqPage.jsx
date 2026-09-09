"use client";

import Link from "next/link";
import Navigation from "../components/Navigation";
import Footer from "../components/Footer";
import FaqSection from "../components/FaqSection";
import JsonLd from "../components/JsonLd";
import PageBreadcrumbs from "../components/PageBreadcrumbs";
import { useSiteI18n } from "../context/SiteI18nContext";
import { ALL_FAQS, breadcrumbJsonLd, faqJsonLd } from "../lib/seo";

function FaqPage() {
  const { t, dict } = useSiteI18n();
  const breadcrumbs = [
    { name: t("breadcrumbs.home"), path: "/" },
    { name: t("faqPage.crumb"), path: "/faq" },
  ];
  const groups = [
    {
      id: "etudier",
      title: t("faqPage.groups.etudier"),
      items: [...dict.faqs.home, ...dict.faqs.etudier],
    },
    { id: "visa", title: t("faqPage.groups.visa"), items: dict.faqs.visa },
    {
      id: "bourses",
      title: t("faqPage.groups.bourses"),
      items: dict.faqs.bourses,
    },
    {
      id: "processus",
      title: t("faqPage.groups.processus"),
      items: [...dict.faqs.processus, ...dict.faqs.tarifs],
    },
  ];

  return (
    <div className="app app-page-fill">
      <JsonLd data={[breadcrumbJsonLd(breadcrumbs), faqJsonLd(ALL_FAQS)]} />
      <Navigation />

      <article className="landing-programs">
        <div className="container seo-article">
          <PageBreadcrumbs items={breadcrumbs} />
          <h1 className="landing-section-title is-left">{t("faqPage.title")}</h1>
          <p className="seo-lead">{t("faqPage.lead")}</p>

          {groups.map((group) => (
            <FaqSection
              key={group.id}
              items={group.items}
              title={group.title}
              headingId={`faq-${group.id}`}
            />
          ))}

          <div className="seo-cta-box">
            <h2>{t("faqPage.ctaTitle")}</h2>
            <p>{t("faqPage.ctaText")}</p>
            <Link href="/#lead-form" className="landing-btn landing-btn-accent">
              {t("faqPage.cta")}
            </Link>
          </div>
        </div>
      </article>

      <Footer />
    </div>
  );
}

export default FaqPage;
