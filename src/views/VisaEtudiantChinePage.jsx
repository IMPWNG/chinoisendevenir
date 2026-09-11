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

function VisaEtudiantChinePage() {
  const { t, dict } = useSiteI18n();
  const breadcrumbs = [
    { name: t("breadcrumbs.home"), path: "/" },
    { name: t("visa.crumb"), path: "/visa-etudiant-chine" },
  ];

  const topics = [
    { icon: "🛂", title: t("visa.hX"), text: t("visa.pX") },
    {
      icon: "📋",
      title: t("visa.hDocs"),
      text: t("visa.pDocs"),
      notes: dict.visa.docs,
    },
    { icon: "🏠", title: t("visa.hStay"), text: t("visa.pStay") },
  ];

  return (
    <div className="app app-page-fill">
      <JsonLd
        data={[
          breadcrumbJsonLd(breadcrumbs),
          articleJsonLd({
            title: "Visa étudiant pour étudier en Chine (X1, X2, JW201, JW202)",
            description:
              "Comment obtenir un visa étudiant pour venir faire ses études en Chine.",
            path: "/visa-etudiant-chine",
            datePublished: "2026-08-24",
          }),
          faqJsonLd(FAQS.visa),
        ]}
      />
      <Navigation />

      <section className="landing-programs">
        <div className="container">
          <PageBreadcrumbs items={breadcrumbs} />
          <h1 className="landing-section-title">{t("visa.title")}</h1>
          <p className="landing-section-subtitle mb-12">{t("visa.lead")}</p>

          <div className="mb-12 bg-amber-50 border-l-4 border-amber-500 rounded-lg p-6 shadow-sm">
            <div className="flex gap-4">
              <div className="text-3xl mt-1">📄</div>
              <div>
                <h2 className="font-bold text-lg text-amber-900 mb-3">
                  {t("visa.hJw")}
                </h2>
                <p className="text-amber-800">{t("visa.pJw")}</p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {topics.map((topic) => (
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
                {topic.notes ? (
                  <ul className="text-gray-700 text-sm space-y-1.5 mb-4">
                    {topic.notes.map((item) => (
                      <li key={item}>• {item}</li>
                    ))}
                  </ul>
                ) : null}
                <p className="text-gray-700 text-sm mb-0">{topic.text}</p>
              </div>
            ))}
          </div>

          <div className="mt-16 bg-blue-50 rounded-xl p-8 border-l-4 border-blue-600">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">
              {t("visa.hWhen")}
            </h2>
            <p className="text-gray-700">
              {t("visa.pWhenBefore")}{" "}
              <Link href="/etudier-en-chine" className="seo-inline-link">
                {t("visa.pWhenLink1")}
              </Link>
              {t("visa.pWhenMid")}{" "}
              <Link href="/processus" className="seo-inline-link">
                {t("visa.pWhenLink2")}
              </Link>{" "}
              {t("visa.pWhenAfter")}
            </p>
          </div>

          <PageCta
            title={t("visa.ctaTitle")}
            subtitle={t("visa.ctaText")}
            cta={t("visa.cta")}
            href="/tarifs"
          />

          <div className="mt-16 max-w-4xl mx-auto">
            <FaqSection items={dict.faqs.visa} title={t("visa.faqTitle")} />
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}

export default VisaEtudiantChinePage;
