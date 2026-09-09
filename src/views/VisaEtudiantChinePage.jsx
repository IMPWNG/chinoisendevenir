"use client";

import Link from "next/link";
import Navigation from "../components/Navigation";
import Footer from "../components/Footer";
import FaqSection from "../components/FaqSection";
import JsonLd from "../components/JsonLd";
import PageBreadcrumbs from "../components/PageBreadcrumbs";
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

      <article className="landing-programs">
        <div className="container seo-article">
          <PageBreadcrumbs items={breadcrumbs} />
          <h1 className="landing-section-title is-left">{t("visa.title")}</h1>
          <p className="seo-lead">{t("visa.lead")}</p>

          <h2>{t("visa.hX")}</h2>
          <p>{t("visa.pX")}</p>

          <h2>{t("visa.hJw")}</h2>
          <p>{t("visa.pJw")}</p>

          <h2>{t("visa.hDocs")}</h2>
          <ul>
            {dict.visa.docs.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
          <p>{t("visa.pDocs")}</p>

          <h2>{t("visa.hStay")}</h2>
          <p>{t("visa.pStay")}</p>

          <h2>{t("visa.hWhen")}</h2>
          <p>
            {t("visa.pWhenBefore")}{" "}
            <Link href="/etudier-en-chine">{t("visa.pWhenLink1")}</Link>
            {t("visa.pWhenMid")}{" "}
            <Link href="/processus">{t("visa.pWhenLink2")}</Link>{" "}
            {t("visa.pWhenAfter")}
          </p>

          <div className="seo-cta-box">
            <h2>{t("visa.ctaTitle")}</h2>
            <p>{t("visa.ctaText")}</p>
            <Link href="/tarifs" className="landing-btn landing-btn-accent">
              {t("visa.cta")}
            </Link>
          </div>

          <FaqSection items={dict.faqs.visa} title={t("visa.faqTitle")} />
        </div>
      </article>

      <Footer />
    </div>
  );
}

export default VisaEtudiantChinePage;
