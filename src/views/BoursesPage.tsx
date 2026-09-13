"use client";

import Link from "next/link";
import Navigation from "../components/Navigation";
import Footer from "../components/Footer";
import FaqSection from "../components/FaqSection";
import JsonLd from "../components/JsonLd";
import PageBreadcrumbs from "../components/PageBreadcrumbs";
import PageCta from "../components/PageCta";
import { useSiteI18n } from "../context/SiteI18nContext";
import { breadcrumbJsonLd, FAQS, faqJsonLd } from "../lib/seo";

function BoursesPage() {
  const { t, dict } = useSiteI18n();
  const breadcrumbs = [
    { name: t("breadcrumbs.home"), path: "/" },
    { name: t("bourses.crumb"), path: "/bourses" },
  ];

  return (
    <div className="app app-page-fill">
      <JsonLd data={[breadcrumbJsonLd(breadcrumbs), faqJsonLd(FAQS.bourses)]} />
      <Navigation />

      <section className="landing-programs">
        <div className="container">
          <PageBreadcrumbs items={breadcrumbs} />
          <h1 className="landing-section-title">{t("bourses.title")}</h1>
          <p className="landing-section-subtitle mb-8">{t("bourses.subtitle")}</p>
          <p className="text-center text-slate-600 max-w-3xl mx-auto mb-12">
            {t("bourses.introBefore")}{" "}
            <Link href="/etudier-en-chine" className="seo-inline-link">
              {t("bourses.introLink")}
            </Link>{" "}
            {t("bourses.introAfter")}
          </p>

          <div className="mb-12 bg-amber-50 border-l-4 border-amber-500 rounded-lg p-6 shadow-sm">
            <div className="flex gap-4">
              <div className="text-3xl mt-1">⚠️</div>
              <div>
                <h2 className="font-bold text-lg text-amber-900 mb-3">
                  {t("bourses.warningTitle")}
                </h2>
                <p className="text-amber-800 mb-3">{t("bourses.warningText")}</p>
                <p className="text-amber-800 font-semibold">
                  {t("bourses.warningNote")}
                </p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {dict.bourses.items.map((bourse) => (
              <div
                key={bourse.nom}
                className="landing-program-card shadow-lg hover:shadow-xl"
              >
                <div className="landing-program-icon text-5xl mb-4">
                  {bourse.icon}
                </div>
                <h2 className="font-bold text-lg text-gray-800 mb-2">
                  {bourse.nom}
                </h2>
                <div className="mb-4 space-y-2 text-sm text-gray-600">
                  <p>
                    <strong>{t("bourses.amount")}</strong> {bourse.montant}
                  </p>
                  <p>
                    <strong>{t("bourses.level")}</strong> {bourse.niveau}
                  </p>
                  <p>
                    <strong>{t("bourses.duration")}</strong> {bourse.duree}
                  </p>
                </div>
                <p className="text-gray-700 text-sm mb-4">{bourse.description}</p>
              </div>
            ))}
          </div>

          <div className="mt-16 bg-blue-50 rounded-xl p-8 border-l-4 border-blue-600">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">
              {t("bourses.howTitle")}
            </h2>
            <div className="grid md:grid-cols-3 gap-6">
              {dict.bourses.how.map((step) => (
                <div key={step.title}>
                  <h3 className="font-bold text-lg text-blue-600 mb-2">
                    {step.title}
                  </h3>
                  <p className="text-gray-700">{step.text}</p>
                </div>
              ))}
            </div>
          </div>

          <PageCta
            title={t("bourses.ctaTitle")}
            subtitle={t("bourses.ctaSubtitle")}
            cta={t("bourses.cta")}
          />

          <div className="mt-16 max-w-4xl mx-auto">
            <FaqSection
              items={dict.faqs.bourses}
              title={t("bourses.faqTitle")}
            />
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}

export default BoursesPage;
