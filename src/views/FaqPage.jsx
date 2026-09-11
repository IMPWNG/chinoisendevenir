"use client";

import Navigation from "../components/Navigation";
import Footer from "../components/Footer";
import FaqSection from "../components/FaqSection";
import JsonLd from "../components/JsonLd";
import PageBreadcrumbs from "../components/PageBreadcrumbs";
import PageCta from "../components/PageCta";
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
      icon: "🎓",
      title: t("faqPage.groups.etudier"),
      items: [...dict.faqs.home, ...dict.faqs.etudier],
    },
    {
      id: "langue",
      icon: "🗣️",
      title: t("faqPage.groups.langue"),
      items: dict.faqs.langue,
    },
    {
      id: "visa",
      icon: "🛂",
      title: t("faqPage.groups.visa"),
      items: dict.faqs.visa,
    },
    {
      id: "bourses",
      icon: "💰",
      title: t("faqPage.groups.bourses"),
      items: dict.faqs.bourses,
    },
    {
      id: "processus",
      icon: "📋",
      title: t("faqPage.groups.processus"),
      items: [...dict.faqs.processus, ...dict.faqs.tarifs],
    },
  ];

  return (
    <div className="app app-page-fill">
      <JsonLd data={[breadcrumbJsonLd(breadcrumbs), faqJsonLd(ALL_FAQS)]} />
      <Navigation />

      <section className="landing-programs">
        <div className="container">
          <PageBreadcrumbs items={breadcrumbs} />
          <h1 className="landing-section-title">{t("faqPage.title")}</h1>
          <p className="landing-section-subtitle mb-12">{t("faqPage.lead")}</p>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 mb-4">
            {groups.map((group) => (
              <a
                key={group.id}
                href={`#faq-${group.id}`}
                className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition-shadow hover:shadow-md no-underline"
              >
                <p className="text-3xl mb-3">{group.icon}</p>
                <p className="text-base font-bold text-slate-900">
                  {group.title}
                </p>
              </a>
            ))}
          </div>

          <div className="mt-8 max-w-4xl mx-auto">
            {groups.map((group) => (
              <FaqSection
                key={group.id}
                items={group.items}
                title={group.title}
                headingId={`faq-${group.id}`}
              />
            ))}
          </div>

          <PageCta
            title={t("faqPage.ctaTitle")}
            subtitle={t("faqPage.ctaText")}
            cta={t("faqPage.cta")}
          />
        </div>
      </section>

      <Footer />
    </div>
  );
}

export default FaqPage;
