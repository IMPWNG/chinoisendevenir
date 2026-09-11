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
  howToJsonLd,
} from "../lib/seo";

function EcolesDeLangueChinePage() {
  const { t, dict } = useSiteI18n();
  const page = dict.langue;
  const breadcrumbs = [
    { name: t("breadcrumbs.home"), path: "/" },
    { name: page.crumb, path: "/ecoles-de-langue-chine" },
  ];

  const topics = [
    { icon: "🏫", title: page.hWhat, text: page.pWhat },
    { icon: "🗣️", title: page.hWhy, text: page.pWhy },
    { icon: "🎓", title: page.hUni, text: page.pUni },
    {
      icon: "📝",
      title: page.hHsk,
      text: page.pHsk,
      notes: page.hskRows.map(([level, use]) => `${level} : ${use}`),
    },
    {
      icon: "✅",
      title: page.hWho,
      text: page.pWho,
      notes: page.whoYes,
      extraNotesTitle: page.whoNoTitle,
      extraNotes: page.whoNo,
    },
    {
      icon: "💰",
      title: page.hCost,
      cost: true,
    },
  ];

  return (
    <div className="app app-page-fill">
      <JsonLd
        data={[
          breadcrumbJsonLd(breadcrumbs),
          articleJsonLd({
            title:
              "Écoles de langue en Chine : commencer par le chinois avant l'université",
            description:
              "Pourquoi faire une année de chinois en Chine avant l'université, surtout sans IELTS, TOEFL ou HSK.",
            path: "/ecoles-de-langue-chine",
            datePublished: "2026-09-11",
          }),
          faqJsonLd(FAQS.langue),
          howToJsonLd({
            name: "Passer d'une école de langue à une université en Chine",
            description:
              "Les étapes pour arriver en Chine sans certificat d'anglais, apprendre le chinois, viser un HSK, puis candidater à une licence ou un master.",
            path: "/ecoles-de-langue-chine",
            steps: page.how.map((step) => ({
              name: step.title,
              text: step.text,
            })),
          }),
        ]}
      />
      <Navigation />

      <section className="landing-programs">
        <div className="container">
          <PageBreadcrumbs items={breadcrumbs} />
          <h1 className="landing-section-title">{page.title}</h1>
          <p className="landing-section-subtitle mb-8">{page.lead}</p>
          <p className="text-center text-slate-600 max-w-3xl mx-auto mb-12">
            {page.disclaimer}
          </p>

          <div className="mb-12 bg-amber-50 border-l-4 border-amber-500 rounded-lg p-6 shadow-sm">
            <div className="flex gap-4">
              <div className="text-3xl mt-1">📋</div>
              <div>
                <h2 className="font-bold text-lg text-amber-900 mb-3">
                  {page.hNoEn}
                </h2>
                <p className="text-amber-800 mb-3">{page.pNoEn}</p>
                <ul className="text-amber-800 space-y-1.5 text-sm">
                  {page.whyItems.map((item) => (
                    <li key={item.title}>• {item.title}</li>
                  ))}
                </ul>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
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
                {topic.cost ? (
                  <>
                    <p className="text-gray-700 text-sm mb-4">
                      {page.pCostBefore}{" "}
                      <Link href="/tarifs" className="seo-inline-link">
                        {page.pCostLink}
                      </Link>{" "}
                      {page.pCostAfter}
                    </p>
                    <p className="text-gray-700 text-sm mb-4">
                      {page.pVisaBefore}{" "}
                      <Link
                        href="/visa-etudiant-chine"
                        className="seo-inline-link"
                      >
                        {page.pVisaLink}
                      </Link>
                      {page.pVisaAfter}
                    </p>
                  </>
                ) : (
                  <p className="text-gray-700 text-sm mb-4">{topic.text}</p>
                )}
                {topic.notes ? (
                  <ul className="text-gray-700 text-sm space-y-1.5 mb-4">
                    {topic.notes.map((item) => (
                      <li key={item}>• {item}</li>
                    ))}
                  </ul>
                ) : null}
                {topic.extraNotes ? (
                  <>
                    <p className="font-semibold text-gray-800 text-sm mb-2">
                      {topic.extraNotesTitle}
                    </p>
                    <ul className="text-gray-700 text-sm space-y-1.5 mb-4">
                      {topic.extraNotes.map((item) => (
                        <li key={item}>• {item}</li>
                      ))}
                    </ul>
                  </>
                ) : null}
              </div>
            ))}
          </div>

          <div className="mt-16 bg-white rounded-xl p-8 shadow-lg border border-slate-100">
            <h2 className="text-2xl font-bold text-gray-800 mb-2">
              {page.hCompare}
            </h2>
            <p className="text-gray-700 mb-6">{page.compareLead}</p>
            <div className="seo-table-wrap">
              <table>
                <caption>{page.compareCaption}</caption>
                <thead>
                  <tr>
                    {page.compareHeaders.map((header) => (
                      <th key={header} scope="col">
                        {header}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {page.compareRows.map((row) => (
                    <tr key={row[0]}>
                      {row.map((cell, index) =>
                        index === 0 ? (
                          <th key={cell} scope="row">
                            {cell}
                          </th>
                        ) : (
                          <td key={`${row[0]}-${index}`}>{cell}</td>
                        ),
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p className="text-gray-700 text-sm mt-4">{page.compareNote}</p>
          </div>

          <div className="mt-16 bg-blue-50 rounded-xl p-8 border-l-4 border-blue-600">
            <h2 className="text-2xl font-bold text-gray-800 mb-3">
              {page.hHow}
            </h2>
            <p className="text-gray-700 mb-6">{page.pHow}</p>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {page.how.map((step, index) => (
                <div key={step.title}>
                  <h3 className="font-bold text-lg text-blue-600 mb-2">
                    {index + 1}. {step.title}
                  </h3>
                  <p className="text-gray-700">{step.text}</p>
                </div>
              ))}
            </div>
            <p className="text-gray-700 text-sm mt-6">
              {page.howAfterBefore}{" "}
              <Link href="/processus" className="seo-inline-link">
                {page.howAfterLink}
              </Link>{" "}
              {page.howAfterAfter}
            </p>
          </div>

          <PageCta
            title={page.ctaTitle}
            subtitle={page.ctaText}
            cta={page.cta}
          />

          <div className="mt-16 max-w-4xl mx-auto">
            <FaqSection items={dict.faqs.langue} title={page.faqTitle} />
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}

export default EcolesDeLangueChinePage;
