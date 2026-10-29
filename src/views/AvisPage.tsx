"use client";

import Navigation from "../components/Navigation";
import Footer from "../components/Footer";
import PageBreadcrumbs from "../components/PageBreadcrumbs";
import PageCta from "../components/PageCta";
import JsonLd from "../components/JsonLd";
import { useSiteI18n } from "../context/SiteI18nContext";
import { avisByLang } from "../lib/avis";
import { breadcrumbJsonLd } from "../lib/seo";

function AvisPage() {
  const { lang, t } = useSiteI18n();
  const items = avisByLang[lang] ?? avisByLang.fr;
  const breadcrumbs = [
    { name: t("breadcrumbs.home"), path: "/" },
    { name: t("avisPage.crumb"), path: "/avis" },
  ];

  return (
    <div className="app app-page-fill">
      <JsonLd data={breadcrumbJsonLd(breadcrumbs)} />
      <Navigation />
      <section className="landing-programs">
        <div className="container">
          <PageBreadcrumbs items={breadcrumbs} />
          <h1 className="landing-section-title">{t("avisPage.title")}</h1>
          <p className="landing-section-subtitle">{t("avisPage.lead")}</p>
          <div className="avis-grid">
            {items.map((item) => (
              <article key={item.name} className="avis-card">
                <p>{item.text}</p>
                <footer>
                  <strong>{item.name}</strong>
                  <span>{item.place}</span>
                </footer>
              </article>
            ))}
          </div>
          <PageCta
            title={t("avisPage.ctaTitle")}
            subtitle={t("avisPage.ctaText")}
            cta={t("avisPage.cta")}
          />
        </div>
      </section>
      <Footer />
    </div>
  );
}

export default AvisPage;
