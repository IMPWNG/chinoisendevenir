"use client";

import Link from "next/link";
import Footer from "@/components/Footer";
import Navigation from "@/components/Navigation";
import { useSiteI18n } from "@/context/SiteI18nContext";

export default function NotFoundContent() {
  const { t, dict } = useSiteI18n();

  return (
    <div className="app app-page-fill">
      <Navigation />
      <section className="landing-programs">
        <div className="container max-w-4xl text-center">
          <p className="text-sm font-semibold text-red-600 mb-3">
            {t("notFound.code")}
          </p>
          <h1 className="landing-section-title">{t("notFound.title")}</h1>
          <p className="landing-section-subtitle mb-10">
            {t("notFound.subtitle")}
          </p>
          <ul className="flex flex-col sm:flex-row flex-wrap justify-center gap-x-6 gap-y-3 mb-8">
            {dict.notFound.links.map((link) => (
              <li key={link.href}>
                <Link href={link.href} className="seo-inline-link">
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </section>
      <Footer />
    </div>
  );
}
