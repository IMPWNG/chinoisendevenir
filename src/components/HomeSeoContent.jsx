"use client";

import Link from "next/link";
import FaqSection from "./FaqSection";
import { useSiteI18n } from "@/context/SiteI18nContext";

export default function HomeSeoContent() {
  const { t, dict } = useSiteI18n();
  const programs = dict.programs.list;
  const [before, after] = t("programs.hesitate").split("{link}");

  return (
    <>
      <section className="landing-programs seo-home-block">
        <div className="container">
          <h2 className="landing-section-title">{t("home.whyTitle")}</h2>
          <p className="landing-section-subtitle">{t("home.whySubtitle")}</p>
          <div className="grid md:grid-cols-3 gap-6">
            {dict.home.why.map((item) => (
              <article
                key={item.title}
                className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100"
              >
                <h3 className="font-bold text-lg text-slate-900 mb-2">
                  {item.title}
                </h3>
                <p className="text-slate-600 text-sm leading-relaxed">
                  {item.text}
                </p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="seo-home-alt">
        <div className="container">
          <h2 className="landing-section-title">{t("home.howTitle")}</h2>
          <p className="landing-section-subtitle">
            {t("home.howSubtitle")}{" "}
            <Link href="/etudier-en-chine" className="seo-inline-link">
              {t("home.howLink")}
            </Link>
            .
          </p>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-5">
            {dict.home.how.map((step, index) => (
              <Link
                key={step.title}
                href={step.href}
                className="seo-step-card"
              >
                <span className="seo-step-num">{index + 1}</span>
                <h3>{step.title}</h3>
                <p>{step.text}</p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="landing-programs seo-home-block">
        <div className="container">
          <h2 className="landing-section-title">{t("services.title")}</h2>
          <p className="landing-section-subtitle">{t("services.subtitle")}</p>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {dict.services.items.map((service) => (
              <article
                key={service.title}
                className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100"
              >
                <h3 className="font-bold text-lg text-slate-900 mb-2">
                  {service.title}
                </h3>
                <p className="text-slate-600 text-sm leading-relaxed">
                  {service.description}
                </p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="seo-home-alt">
        <div className="container">
          <h2 className="landing-section-title">{t("programs.title")}</h2>
          <p className="landing-section-subtitle">{t("programs.subtitle")}</p>
          <ul className="seo-program-pills">
            {programs.map((program) => (
              <li key={program}>{program}</li>
            ))}
          </ul>
          <p className="text-center text-slate-600 mt-8 max-w-2xl mx-auto">
            {before}
            <Link href="/tarifs" className="seo-inline-link">
              {t("programs.formulasLink")}
            </Link>{" "}
            {after}
          </p>
        </div>
      </section>

      <section className="landing-programs seo-home-block">
        <div className="container max-w-4xl">
          <FaqSection items={dict.faqs.home} title={t("home.faqTitle")} />
          <p className="text-center mt-8">
            <Link href="/faq" className="seo-inline-link">
              {t("home.allFaqs")}
            </Link>
          </p>
        </div>
      </section>
    </>
  );
}
