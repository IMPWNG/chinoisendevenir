"use client";

import Link from "next/link";
import Navigation from "../components/Navigation";
import Footer from "../components/Footer";
import FaqSection from "../components/FaqSection";
import JsonLd from "../components/JsonLd";
import PageBreadcrumbs from "../components/PageBreadcrumbs";
import PageCta from "../components/PageCta";
import { useSiteI18n } from "../context/SiteI18nContext";
import {
  articleJsonLd,
  breadcrumbJsonLd,
  FAQS,
  faqJsonLd,
} from "../lib/seo";

function EtudierEnChinePage() {
  const { t, dict } = useSiteI18n();
  const breadcrumbs = [
    { name: t("breadcrumbs.home"), path: "/" },
    { name: t("etudier.crumb"), path: "/etudier-en-chine" },
  ];

  return (
    <div className="app app-page-fill">
      <JsonLd
        data={[
          breadcrumbJsonLd(breadcrumbs),
          articleJsonLd({
            title: "Étudier en Chine : le guide pour les étudiants francophones",
            description:
              "Comment étudier en Chine : admission, langue, bourses, calendrier, budget et visa étudiant.",
            path: "/etudier-en-chine",
            datePublished: "2026-08-24",
          }),
          faqJsonLd(FAQS.etudier),
        ]}
      />
      <Navigation />

      <section className="landing-programs">
        <div className="container">
          <PageBreadcrumbs items={breadcrumbs} />
          <h1 className="landing-section-title">{t("etudier.title")}</h1>
          <p className="landing-section-subtitle mb-8">{t("etudier.subtitle")}</p>
          <p className="text-center text-slate-600 max-w-3xl mx-auto mb-12">
            {t("etudier.disclaimer")}
          </p>

          <div className="mb-12 bg-amber-50 border-l-4 border-amber-500 rounded-lg p-6 shadow-sm">
            <div className="flex gap-4">
              <div className="text-3xl mt-1">📋</div>
              <div>
                <h2 className="font-bold text-lg text-amber-900 mb-3">
                  {t("etudier.conditionsTitle")}
                </h2>
                <p className="text-amber-800 mb-3">{t("etudier.conditionsText")}</p>
                <ul className="text-amber-800 space-y-1.5 text-sm">
                  {dict.etudier.conditions.map((item) => (
                    <li key={item}>• {item}</li>
                  ))}
                </ul>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {dict.etudier.topics.map((topic) => (
              <div
                key={topic.title}
                className="landing-program-card is-left shadow-lg hover:shadow-xl"
              >
                <div className="landing-program-icon text-5xl mb-4">
                  {topic.icon}
                </div>
                <h2 className="font-bold text-lg text-gray-800 mb-2">
                  {topic.title}
                </h2>
                <p className="text-gray-700 text-sm mb-4">{topic.text}</p>
                {topic.link ? (
                  <Link href={topic.link.href} className="seo-inline-link">
                    {topic.link.label}
                  </Link>
                ) : null}
                {topic.extraLink ? (
                  <>
                    {" · "}
                    <Link href={topic.extraLink.href} className="seo-inline-link">
                      {topic.extraLink.label}
                    </Link>
                  </>
                ) : null}
              </div>
            ))}
          </div>

          <PageCta
            title={t("etudier.ctaTitle")}
            subtitle={t("etudier.ctaSubtitle")}
            cta={t("etudier.cta")}
          />

          <div className="mt-16 max-w-4xl mx-auto">
            <FaqSection
              items={dict.faqs.etudier}
              title={t("etudier.faqTitle")}
            />
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}

export default EtudierEnChinePage;
