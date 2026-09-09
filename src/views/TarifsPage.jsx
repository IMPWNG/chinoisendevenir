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
  displayFormuleFootnote,
  displayFormulePrice,
  getFormuleIncludeGroups,
  localizeFormules,
} from "../lib/formules";
import { breadcrumbJsonLd, FAQS, faqJsonLd, serviceJsonLd } from "../lib/seo";

function IncludeList({ items }) {
  return (
    <ul className="space-y-2 text-sm text-slate-700">
      {items.map((item) => (
        <li key={item} className="flex gap-2">
          <span className="text-emerald-600 mt-0.5">✓</span>
          <span>{item}</span>
        </li>
      ))}
    </ul>
  );
}

function FormuleCard({ formule, featured, t }) {
  const groups = getFormuleIncludeGroups(formule);
  const singleGroup = groups.length === 1;

  return (
    <article
      id={`formule-${formule.number}`}
      className={`relative flex flex-col rounded-2xl border bg-white p-6 shadow-lg h-full scroll-mt-28 ${
        featured ? "border-red-500 ring-2 ring-red-100" : "border-slate-200"
      }`}
    >
      <div className="flex items-start justify-between gap-3">
        <p className="text-xs font-bold uppercase tracking-widest text-slate-500">
          {t("tarifs.planLabel", { n: formule.number })}
        </p>
        {formule.badge ? (
          <span
            className={`shrink-0 rounded-full px-2.5 py-1 text-[11px] font-bold uppercase tracking-wide ${
              featured ? "bg-red-600 text-white" : "bg-slate-800 text-white"
            }`}
          >
            {formule.badge}
          </span>
        ) : null}
      </div>
      {formule.audience ? (
        <p className="text-sm font-medium text-slate-500 mt-2">
          {formule.audience}
        </p>
      ) : null}
      <h2 className="text-xl font-bold text-slate-900 mt-2">{formule.title}</h2>
      {formule.subtitle ? (
        <p className="text-sm font-medium text-slate-600 mt-1">
          {formule.subtitle}
        </p>
      ) : null}

      <div className="mt-3">
        <p className="text-3xl font-bold text-red-600">
          {displayFormulePrice(formule)}
        </p>
      </div>
      <p className="text-xs text-slate-500 mt-2 leading-relaxed">
        {t("tarifs.paymentNote")}
      </p>
      {formule.savingsText ? (
        <p className="text-sm text-slate-700 mt-3 leading-relaxed bg-emerald-50 border border-emerald-100 rounded-xl px-3 py-2">
          {formule.savingsText}
        </p>
      ) : null}
      <p className="text-slate-600 text-sm mt-3 leading-relaxed">
        {formule.intro}
      </p>

      {singleGroup ? (
        <>
          <p className="text-xs font-bold uppercase tracking-wide text-slate-500 mt-6 mb-2">
            {t("tarifs.included")}
          </p>
          <div className="flex-1">
            <IncludeList items={groups[0].items} />
          </div>
        </>
      ) : (
        <div className="mt-6 flex-1">
          <p className="text-xs font-bold uppercase tracking-wide text-slate-500 mb-3">
            {t("tarifs.included")}
          </p>
          <div className={featured ? "grid md:grid-cols-3 gap-6" : "space-y-5"}>
            {groups.map((group) => (
              <div key={group.title}>
                <p className="text-sm font-semibold text-slate-900 mb-2">
                  {group.title}
                </p>
                <IncludeList items={group.items} />
              </div>
            ))}
          </div>
        </div>
      )}

      <p className="text-xs font-bold uppercase tracking-wide text-slate-500 mt-6 mb-2">
        {t("tarifs.idealIf")}
      </p>
      <ul className="space-y-1.5 text-sm text-slate-600 mb-0">
        {formule.idealIf.map((item) => (
          <li key={item}>• {item}</li>
        ))}
      </ul>

      <div className="formule-card-cta">
        <p className="formule-footnote" aria-hidden={!formule.footnote}>
          {formule.footnote
            ? displayFormuleFootnote(formule.footnote)
            : "\u00a0"}
        </p>
        <Link
          href="/#lead-form"
          className={`landing-btn landing-btn-full formule-card-btn ${
            featured ? "landing-btn-accent" : "landing-btn-primary"
          }`}
        >
          {formule.cta}
        </Link>
      </div>
    </article>
  );
}

function TarifsPage() {
  const { t, dict } = useSiteI18n();
  const formules = localizeFormules(dict);
  const standaloneFormules = formules.filter((formule) => !formule.featured);
  const featuredFormule = formules.find((formule) => formule.featured);
  const breadcrumbs = [
    { name: t("breadcrumbs.home"), path: "/" },
    { name: t("tarifs.crumb"), path: "/tarifs" },
  ];

  return (
    <div className="app app-page-fill">
      <JsonLd
        data={[
          breadcrumbJsonLd(breadcrumbs),
          serviceJsonLd(),
          faqJsonLd(FAQS.tarifs),
        ]}
      />
      <Navigation />

      <section className="landing-programs">
        <div className="container">
          <PageBreadcrumbs items={breadcrumbs} />
          <h1 className="landing-section-title">{t("tarifs.title")}</h1>
          <p className="landing-section-subtitle mb-10">{t("tarifs.subtitle")}</p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-10">
            {dict.tarifs.chooser.map((item, index) => {
              const formule = formules.find(
                (entry) => entry.number === index + 1,
              );
              return (
                <a
                  key={item.question}
                  href={`#formule-${index + 1}`}
                  className={`rounded-2xl border p-5 transition-shadow hover:shadow-md ${
                    formule?.featured
                      ? "border-red-200 bg-red-50/70"
                      : "border-slate-200 bg-white"
                  }`}
                >
                  <p className="text-xs font-bold uppercase tracking-widest text-slate-500">
                    {t("tarifs.planLabel", { n: index + 1 })}
                    {formule?.featured ? ` · ${t("tarifs.recommended")}` : ""}
                  </p>
                  <p className="text-base font-bold text-slate-900 mt-2">
                    {item.question}
                  </p>
                  <p className="text-sm text-slate-600 mt-2 leading-relaxed">
                    {item.detail}
                  </p>
                  <p className="text-sm font-semibold text-red-600 mt-3">
                    {displayFormulePrice(formule)}
                  </p>
                </a>
              );
            })}
          </div>

          <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-6 py-5 mb-12">
            <p className="text-sm font-bold uppercase tracking-wide text-emerald-800 mb-2">
              {t("tarifs.savingsTitle")}
            </p>
            <p className="text-slate-800 text-sm md:text-base leading-relaxed">
              {t("tarifs.savingsTextBefore")}{" "}
              <span className="font-bold text-emerald-800">
                {t("tarifs.savingsHighlight")}
              </span>
              {t("tarifs.savingsTextAfter")}
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:items-stretch mb-8">
            {standaloneFormules.map((formule) => (
              <FormuleCard
                key={formule.number}
                formule={formule}
                featured={false}
                t={t}
              />
            ))}
          </div>

          {featuredFormule ? (
            <div className="mb-16">
              <FormuleCard formule={featuredFormule} featured t={t} />
            </div>
          ) : null}

          {featuredFormule?.whyChoose ? (
            <div className="grid md:grid-cols-2 gap-6 mb-16">
              <div className="bg-white rounded-2xl border border-red-100 p-6 shadow-sm">
                <h2 className="text-xl font-bold text-slate-900 mb-3">
                  {featuredFormule.whyChoose.title}
                </h2>
                <p className="text-slate-700 text-sm leading-relaxed mb-4">
                  {featuredFormule.whyChoose.intro}
                </p>
                <ol className="space-y-2 text-sm text-slate-700">
                  {featuredFormule.whyChoose.steps.map((step, index) => (
                    <li key={step} className="flex gap-2">
                      <span className="font-bold text-red-600">
                        {index + 1}.
                      </span>
                      <span>{step}</span>
                    </li>
                  ))}
                </ol>
              </div>
              <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
                <h2 className="text-xl font-bold text-slate-900 mb-3">
                  {t("tarifs.keep1and2Title")}
                </h2>
                {dict.tarifs.keep1and2.map((paragraph, index) => (
                  <p
                    key={paragraph}
                    className={`text-slate-700 text-sm leading-relaxed ${
                      index < dict.tarifs.keep1and2.length - 1 ? "mb-3" : ""
                    }`}
                  >
                    {paragraph}
                  </p>
                ))}
              </div>
            </div>
          ) : null}

          <div className="grid md:grid-cols-2 gap-6 mb-16">
            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
              <h2 className="text-xl font-bold text-slate-900 mb-3">
                {t("tarifs.translationTitle")}
              </h2>
              <p className="text-slate-700 text-sm leading-relaxed mb-3">
                {t("tarifs.translationP1")}
              </p>
              <p className="text-slate-700 text-sm leading-relaxed">
                {t("tarifs.translationP2")}
              </p>
            </div>
            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
              <h2 className="text-xl font-bold text-slate-900 mb-3">
                {t("tarifs.extraTitle")}
              </h2>
              <p className="text-slate-700 text-sm leading-relaxed mb-3">
                {t("tarifs.extraIntro")}
              </p>
              <ul className="grid grid-cols-1 gap-1.5 text-sm text-slate-700">
                {dict.tarifs.extraFees.map((item) => (
                  <li key={item}>• {item}</li>
                ))}
              </ul>
            </div>
          </div>

          <div className="bg-slate-50 rounded-2xl border border-slate-200 p-8 mb-16">
            <h2 className="text-2xl font-bold text-slate-900 mb-6">
              {t("tarifs.howTitle")}
            </h2>
            <ol className="grid md:grid-cols-5 gap-4">
              {dict.tarifs.processSteps.map((step, index) => (
                <li
                  key={step.title}
                  className="bg-white rounded-xl p-4 border border-slate-200"
                >
                  <p className="text-red-600 font-bold mb-2">{index + 1}.</p>
                  <p className="font-semibold text-slate-900 text-sm mb-1">
                    {step.title}
                  </p>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    {step.text}
                  </p>
                </li>
              ))}
            </ol>
            <p className="text-sm text-slate-600 mt-6">{t("tarifs.howPay")}</p>
          </div>

          <div className="bg-amber-50 border-l-4 border-amber-500 rounded-xl p-6 mb-16">
            <h2 className="text-lg font-bold text-amber-950 mb-2">
              {t("tarifs.infoTitle")}
            </h2>
            <p className="text-amber-900 text-sm leading-relaxed mb-3">
              {t("tarifs.infoIntro")}
            </p>
            <ul className="space-y-1 text-sm text-amber-900 mb-3">
              {dict.tarifs.disclaimers.map((item) => (
                <li key={item}>• {item}</li>
              ))}
            </ul>
            <p className="text-amber-900 text-sm leading-relaxed">
              {t("tarifs.infoOutro")}
            </p>
          </div>

          <PageCta
            title={t("tarifs.ctaTitle")}
            subtitle={t("tarifs.ctaSubtitle")}
            cta={t("tarifs.cta")}
          />

          <div className="mt-16 max-w-4xl mx-auto">
            <FaqSection items={dict.faqs.tarifs} title={t("tarifs.faqTitle")} />
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}

export default TarifsPage;
