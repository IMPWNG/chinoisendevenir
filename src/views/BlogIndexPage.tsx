"use client";

import Link from "next/link";
import Navigation from "../components/Navigation";
import Footer from "../components/Footer";
import JsonLd from "../components/JsonLd";
import PageBreadcrumbs from "../components/PageBreadcrumbs";
import PageCta from "../components/PageCta";
import { useSiteI18n } from "../context/SiteI18nContext";
import { blogPath, type BlogPost } from "../lib/blog";
import { withCfaInText } from "../lib/money";
import { breadcrumbJsonLd } from "../lib/seo";

function formatDate(isoDate: string, lang: string): string {
  const locale = lang === "en" ? "en-GB" : "fr-FR";
  return new Intl.DateTimeFormat(locale, {
    year: "numeric",
    month: "long",
    day: "numeric",
    timeZone: "Europe/Paris",
  }).format(new Date(`${isoDate}T12:00:00+02:00`));
}

export default function BlogIndexPage({ posts }: { posts: BlogPost[] }) {
  const { t, lang } = useSiteI18n();
  const breadcrumbs = [
    { name: t("breadcrumbs.home"), path: "/" },
    { name: t("blog.crumb"), path: "/blog" },
  ];

  return (
    <div className="app app-page-fill">
      <JsonLd data={breadcrumbJsonLd(breadcrumbs)} />
      <Navigation />

      <section className="landing-programs">
        <div className="container">
          <PageBreadcrumbs items={breadcrumbs} />
          <h1 className="landing-section-title">{t("blog.title")}</h1>
          <p className="landing-section-subtitle mb-10">{t("blog.lead")}</p>

          {posts.length === 0 ? (
            <p className="text-gray-600">{t("blog.empty")}</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-5xl mx-auto">
              {posts.map((post) => (
                <Link
                  key={post.slug}
                  href={blogPath(post.slug)}
                  className="landing-program-card shadow-lg hover:shadow-xl block no-underline text-left"
                >
                  <p className="text-xs text-gray-500 mb-2">
                    {formatDate(post.publishedAt, lang)}
                  </p>
                  <h2 className="font-bold text-lg text-gray-800 mb-2">
                    {post.title}
                  </h2>
                  <p className="text-gray-600 text-sm">
                    {withCfaInText(post.description)}
                  </p>
                </Link>
              ))}
            </div>
          )}

          <PageCta
            title={t("blog.indexCtaTitle")}
            subtitle={t("blog.indexCtaSubtitle")}
          />
        </div>
      </section>

      <Footer />
    </div>
  );
}
