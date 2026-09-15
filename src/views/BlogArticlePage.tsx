"use client";

import Link from "next/link";
import Navigation from "../components/Navigation";
import Footer from "../components/Footer";
import JsonLd from "../components/JsonLd";
import PageBreadcrumbs from "../components/PageBreadcrumbs";
import PageCta from "../components/PageCta";
import { useSiteI18n } from "../context/SiteI18nContext";
import { blogPath, type BlogPost } from "../lib/blog";
import { articleJsonLd, breadcrumbJsonLd, faqJsonLd } from "../lib/seo";

function formatDate(isoDate: string, lang: string): string {
  const locale = lang === "en" ? "en-GB" : "fr-FR";
  return new Intl.DateTimeFormat(locale, {
    year: "numeric",
    month: "long",
    day: "numeric",
    timeZone: "Europe/Paris",
  }).format(new Date(`${isoDate}T12:00:00+02:00`));
}

export default function BlogArticlePage({
  post,
  related,
}: {
  post: BlogPost;
  related: BlogPost[];
}) {
  const { t, lang } = useSiteI18n();
  const path = blogPath(post.slug);
  const breadcrumbs = [
    { name: t("breadcrumbs.home"), path: "/" },
    { name: t("blog.crumb"), path: "/blog" },
    { name: post.title, path },
  ];

  return (
    <div className="app app-page-fill">
      <JsonLd
        data={[
          breadcrumbJsonLd(breadcrumbs),
          articleJsonLd({
            title: post.title,
            description: post.description,
            path,
            datePublished: post.publishedAt,
            dateModified: post.publishedAt,
          }),
          faqJsonLd(post.faqs),
        ]}
      />
      <Navigation />

      <article className="landing-programs">
        <div className="container max-w-3xl">
          <PageBreadcrumbs items={breadcrumbs} />
          <p className="text-sm text-gray-500 mb-3">
            {formatDate(post.publishedAt, lang)}
          </p>
          <h1 className="landing-section-title text-left">{post.title}</h1>
          <p className="landing-section-subtitle text-left mb-8">
            {post.description}
          </p>

          <div className="space-y-4 mb-10 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <section>
              <h2 className="text-base font-bold text-slate-900 mb-2">
                {t("blog.problem")}
              </h2>
              <p className="text-gray-700 text-sm leading-relaxed">
                {post.problem}
              </p>
            </section>
            <section>
              <h2 className="text-base font-bold text-slate-900 mb-2">
                {t("blog.solution")}
              </h2>
              <p className="text-gray-700 text-sm leading-relaxed">
                {post.solution}
              </p>
            </section>
            <section>
              <h2 className="text-base font-bold text-slate-900 mb-2">
                {t("blog.promise")}
              </h2>
              <p className="text-gray-700 text-sm leading-relaxed">
                {post.promise}
              </p>
            </section>
          </div>

          <div className="prose-blog space-y-8">
            {post.sections.map((section) => (
              <section key={section.heading}>
                <h2 className="text-xl font-bold text-gray-900 mb-3">
                  {section.heading}
                </h2>
                {section.paragraphs.map((paragraph) => (
                  <p
                    key={paragraph.slice(0, 48)}
                    className="text-gray-700 text-sm leading-relaxed mb-3"
                  >
                    {paragraph}
                  </p>
                ))}
                {section.bullets && section.bullets.length > 0 ? (
                  <ul className="list-disc pl-5 space-y-1 text-gray-700 text-sm">
                    {section.bullets.map((item) => (
                      <li key={item}>{item}</li>
                    ))}
                  </ul>
                ) : null}
              </section>
            ))}
          </div>

          <section className="mt-10">
            <h2 className="text-xl font-bold text-gray-900 mb-4">
              {t("blog.faqTitle")}
            </h2>
            <div className="space-y-4">
              {post.faqs.map((faq) => (
                <div
                  key={faq.question}
                  className="rounded-xl border border-slate-200 bg-white p-4"
                >
                  <h3 className="font-semibold text-gray-900 text-sm mb-2">
                    {faq.question}
                  </h3>
                  <p className="text-gray-700 text-sm leading-relaxed">
                    {faq.answer}
                  </p>
                </div>
              ))}
            </div>
          </section>

          <section className="mt-10">
            <h2 className="text-xl font-bold text-gray-900 mb-3">
              {t("blog.relatedGuides")}
            </h2>
            <ul className="space-y-2">
              {post.internalLinks.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-blue-700 text-sm font-medium hover:underline"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </section>

          {related.length > 0 ? (
            <section className="mt-10">
              <h2 className="text-xl font-bold text-gray-900 mb-3">
                {t("blog.relatedArticles")}
              </h2>
              <ul className="space-y-2">
                {related.map((item) => (
                  <li key={item.slug}>
                    <Link
                      href={blogPath(item.slug)}
                      className="text-blue-700 text-sm font-medium hover:underline"
                    >
                      {item.title}
                    </Link>
                  </li>
                ))}
              </ul>
            </section>
          ) : null}

          <PageCta title={post.ctaTitle} subtitle={post.ctaSubtitle} />
        </div>
      </article>

      <Footer />
    </div>
  );
}
