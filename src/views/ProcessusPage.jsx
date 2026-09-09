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

function ProcessusPage() {
  const { t, dict } = useSiteI18n();
  const breadcrumbs = [
    { name: t("breadcrumbs.home"), path: "/" },
    { name: t("processus.crumb"), path: "/processus" },
  ];
  const etapes = dict.processus.steps;

  return (
    <div className="app app-page-fill">
      <JsonLd
        data={[breadcrumbJsonLd(breadcrumbs), faqJsonLd(FAQS.processus)]}
      />
      <Navigation />

      <section className="landing-programs">
        <div className="container">
          <PageBreadcrumbs items={breadcrumbs} />
          <h1 className="landing-section-title">{t("processus.title")}</h1>
          <p className="landing-section-subtitle mb-8">
            {t("processus.subtitleBefore")}{" "}
            <Link href="/visa-etudiant-chine" className="seo-inline-link">
              {t("processus.visaLink")}
            </Link>{" "}
            {t("processus.subtitleAfter")}
          </p>

          <h2 className="text-2xl font-bold text-gray-800 mb-10 text-center">
            {t("processus.stepsHeading")}
          </h2>

          <div className="relative mb-16">
            <div className="absolute left-1/2 transform -translate-x-1/2 w-1 h-full bg-gradient-to-b from-red-600 to-blue-600 opacity-30"></div>

            <div className="space-y-12">
              {etapes.map((etape, index) => (
                <div
                  key={etape.titre}
                  className={`flex gap-8 ${index % 2 === 0 ? "" : "flex-row-reverse"}`}
                >
                  <div className="flex-1">
                    <div className="bg-white p-6 rounded-xl shadow-lg border-l-4 border-red-600 hover:shadow-xl transition">
                      <div className="flex items-start gap-4 mb-3">
                        <span className="text-3xl">{etape.icon}</span>
                        <div className="flex-1">
                          <span className="inline-block bg-red-100 text-red-700 text-xs font-bold px-3 py-1 rounded-full mb-2">
                            {t("processus.stepLabel", { n: index + 1 })}
                          </span>
                          <h3 className="text-xl font-bold text-gray-800">
                            {etape.titre}
                          </h3>
                        </div>
                      </div>

                      <p className="text-gray-700 mb-4">{etape.description}</p>

                      <div className="space-y-2 mb-4">
                        {etape.details.map((detail) => (
                          <div
                            key={detail}
                            className="flex items-center gap-2 text-sm text-gray-600"
                          >
                            <span className="text-green-600">✓</span>
                            {detail}
                          </div>
                        ))}
                      </div>

                      <p className="text-xs text-gray-500 font-semibold">
                        {t("processus.duration", { duration: etape.duree })}
                      </p>
                    </div>
                  </div>

                  <div className="flex-none w-16 flex items-center justify-center">
                    <div className="w-12 h-12 rounded-full bg-white border-4 border-red-600 flex items-center justify-center font-bold text-red-600 shadow-lg">
                      {index + 1}
                    </div>
                  </div>

                  <div className="flex-1"></div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-gradient-to-r from-red-50 to-blue-50 rounded-xl p-8 border border-red-200">
            <h2 className="text-2xl font-bold text-gray-800 mb-6">
              {t("processus.summaryTitle")}
            </h2>
            <div className="grid md:grid-cols-3 gap-6">
              <div className="bg-white p-4 rounded-lg shadow">
                <p className="text-4xl font-bold text-red-600 mb-2">8</p>
                <p className="text-gray-700 font-semibold">
                  {t("processus.summarySteps")}
                </p>
              </div>
              <div className="bg-white p-4 rounded-lg shadow">
                <p className="text-4xl font-bold text-blue-600 mb-2">4-6</p>
                <p className="text-gray-700 font-semibold">
                  {t("processus.summaryMonths")}
                </p>
              </div>
              <div className="bg-white p-4 rounded-lg shadow">
                <p className="text-4xl font-bold text-green-600 mb-2">100%</p>
                <p className="text-gray-700 font-semibold">
                  {t("processus.summarySupport")}
                </p>
              </div>
            </div>
          </div>

          <PageCta
            title={t("processus.ctaTitle")}
            subtitle={t("processus.ctaSubtitle")}
            cta={t("processus.cta")}
          />

          <div className="mt-16 max-w-4xl mx-auto">
            <FaqSection
              items={dict.faqs.processus}
              title={t("processus.faqTitle")}
            />
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}

export default ProcessusPage;
