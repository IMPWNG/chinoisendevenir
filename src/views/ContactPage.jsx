"use client";

import Navigation from "../components/Navigation";
import Footer from "../components/Footer";
import JsonLd from "../components/JsonLd";
import PageBreadcrumbs from "../components/PageBreadcrumbs";
import PageCta from "../components/PageCta";
import { useSiteI18n } from "../context/SiteI18nContext";
import { breadcrumbJsonLd, SITE } from "../lib/seo";

function ContactPage() {
  const { t, dict } = useSiteI18n();
  const breadcrumbs = [
    { name: t("breadcrumbs.home"), path: "/" },
    { name: t("contact.crumb"), path: "/contact" },
  ];

  const contactMethods = [
    {
      icon: "📍",
      title: t("contact.presence"),
      details: ["Chongqing", "Chengdu", "Shanghai", "Beijing"],
    },
    {
      icon: "📞",
      title: t("contact.phone"),
      details: [SITE.phone, t("contact.hours")],
    },
    {
      icon: "📧",
      title: t("contact.email"),
      details: [SITE.email],
      href: `mailto:${SITE.email}`,
    },
  ];

  const socialLinks = [
    { icon: "💬", name: "WeChat", handle: "@MCisec" },
    { icon: "📱", name: "WhatsApp", handle: SITE.whatsapp },
  ];

  return (
    <div className="app app-page-fill">
      <JsonLd data={breadcrumbJsonLd(breadcrumbs)} />
      <Navigation />

      <section className="landing-programs">
        <div className="container">
          <PageBreadcrumbs items={breadcrumbs} />
          <h1 className="landing-section-title">{t("contact.title")}</h1>
          <p className="landing-section-subtitle mb-8">{t("contact.subtitle")}</p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
            {contactMethods.map((method) => {
              const content = (
                <>
                  <div className="landing-program-icon text-5xl mb-4">
                    {method.icon}
                  </div>
                  <h2 className="font-bold text-lg text-gray-800 mb-2">
                    {method.title}
                  </h2>
                  {method.details.map((detail) => (
                    <p key={detail} className="text-gray-600 text-sm">
                      {detail}
                    </p>
                  ))}
                </>
              );

              if (method.href) {
                return (
                  <a
                    key={method.title}
                    href={method.href}
                    className="landing-program-card shadow-lg hover:shadow-xl block no-underline"
                  >
                    {content}
                  </a>
                );
              }

              return (
                <div
                  key={method.title}
                  className="landing-program-card shadow-lg hover:shadow-xl"
                >
                  {content}
                </div>
              );
            })}
          </div>

          <div className="mt-12 bg-blue-50 rounded-xl p-8 border-l-4 border-blue-600">
            <h2 className="text-2xl font-bold text-gray-800 mb-6">
              {t("contact.socialTitle")}
            </h2>
            <div className="grid md:grid-cols-2 gap-6">
              {socialLinks.map((social) => (
                <div
                  key={social.name}
                  className="flex items-center gap-4 bg-white rounded-xl p-6 shadow-sm"
                >
                  <p className="text-4xl">{social.icon}</p>
                  <div>
                    <p className="font-bold text-gray-800">{social.name}</p>
                    <p className="text-gray-600 text-sm">{social.handle}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <PageCta
            title={t("contact.ctaTitle")}
            subtitle={t("contact.ctaSubtitle")}
            cta={t("contact.cta")}
          />

          <div className="mt-16">
            <h2 className="text-2xl font-bold text-center mb-8 text-gray-800">
              {t("contact.faqsTitle")}
            </h2>
            <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto">
              {dict.contact.faqs.map((faq) => (
                <div
                  key={faq.q}
                  className="bg-white p-6 rounded-xl shadow-md border-l-4 border-blue-500"
                >
                  <p className="font-bold text-gray-800 mb-2">{faq.q}</p>
                  <p className="text-gray-600 text-sm">{faq.a}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}

export default ContactPage;
