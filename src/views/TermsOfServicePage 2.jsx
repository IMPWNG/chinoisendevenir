"use client";

import Navigation from "../components/Navigation";
import Footer from "../components/Footer";
import { SITE } from "../lib/seo";
import { useSiteI18n } from "../context/SiteI18nContext";

function TermsOfServicePage() {
  const { t, dict } = useSiteI18n();

  return (
    <div className="app app-page-fill">
      <Navigation />

      <section className="landing-programs">
        <div className="container max-w-4xl">
          <div className="text-center mb-16">
            <h1 className="landing-section-title">{t("terms.title")}</h1>
            <p className="text-gray-600 text-sm">{t("legal.updated")}</p>
          </div>

          <div className="space-y-12">
            <div className="bg-white p-8 rounded-xl shadow-md">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                {t("terms.s1Title")}
              </h2>
              <p className="text-gray-700 leading-relaxed">{t("terms.s1")}</p>
            </div>

            <div className="bg-white p-8 rounded-xl shadow-md">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                {t("terms.s2Title")}
              </h2>
              <p className="text-gray-700 leading-relaxed mb-4">{t("terms.s2")}</p>
              <div className="space-y-3">
                <h3 className="font-bold text-gray-900">{t("terms.s2Ban")}</h3>
                <ul className="list-disc list-inside space-y-2 text-gray-700 ml-2">
                  {dict.terms.s2Items.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              </div>
            </div>

            <div className="bg-white p-8 rounded-xl shadow-md">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                {t("terms.s3Title")}
              </h2>
              <p className="text-gray-700 leading-relaxed mb-4">{t("terms.s3")}</p>
              <p className="text-gray-700 leading-relaxed">
                <strong>{t("terms.s3Ban")}</strong>
              </p>
              <ul className="list-disc list-inside space-y-2 text-gray-700 ml-2 mt-2">
                {dict.terms.s3Items.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </div>

            <div className="bg-white p-8 rounded-xl shadow-md">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                {t("terms.s4Title")}
              </h2>
              <p className="text-gray-700 leading-relaxed mb-4">{t("terms.s4")}</p>
              <ul className="list-disc list-inside space-y-2 text-gray-700 ml-2">
                {dict.terms.s4Items.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </div>

            <div className="bg-white p-8 rounded-xl shadow-md">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                {t("terms.s5Title")}
              </h2>
              <p className="text-gray-700 leading-relaxed mb-4">{t("terms.s5")}</p>
              <div className="bg-yellow-50 border-l-4 border-yellow-500 p-4 rounded">
                <p className="text-gray-700 text-sm">
                  <strong>⚠️ {t("terms.s5Responsibility")}</strong> {t("terms.s5Note")}
                </p>
              </div>
            </div>

            <div className="bg-white p-8 rounded-xl shadow-md">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                {t("terms.s6Title")}
              </h2>
              <p className="text-gray-700 leading-relaxed mb-4">{t("terms.s6")}</p>
              <ul className="list-disc list-inside space-y-2 text-gray-700 ml-2">
                {dict.terms.s6Items.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </div>

            <div className="bg-white p-8 rounded-xl shadow-md">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                {t("terms.s7Title")}
              </h2>
              <p className="text-gray-700 leading-relaxed">{t("terms.s7")}</p>
            </div>

            <div className="bg-white p-8 rounded-xl shadow-md">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                {t("terms.s8Title")}
              </h2>
              <p className="text-gray-700 leading-relaxed mb-4">{t("terms.s8")}</p>
              <p className="text-gray-700 leading-relaxed">{t("terms.s8b")}</p>
            </div>

            <div className="bg-white p-8 rounded-xl shadow-md">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                {t("terms.s9Title")}
              </h2>
              <p className="text-gray-700 leading-relaxed">{t("terms.s9")}</p>
            </div>

            <div className="bg-white p-8 rounded-xl shadow-md">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                {t("terms.s10Title")}
              </h2>
              <p className="text-gray-700 leading-relaxed">{t("terms.s10")}</p>
            </div>

            <div className="bg-white p-8 rounded-xl shadow-md">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                {t("terms.s11Title")}
              </h2>
              <p className="text-gray-700 leading-relaxed">{t("terms.s11")}</p>
            </div>

            <div className="bg-white p-8 rounded-xl shadow-md">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                {t("terms.s12Title")}
              </h2>
              <p className="text-gray-700 leading-relaxed mb-4">{t("terms.s12")}</p>
              <div className="bg-slate-50 p-6 rounded-lg space-y-2">
                <p className="text-gray-900">
                  <strong>{t("legal.email")}</strong>{" "}
                  <a
                    href={`mailto:${SITE.email}`}
                    className="text-blue-600 hover:underline"
                  >
                    {SITE.email}
                  </a>
                </p>
                <p className="text-gray-900">
                  <strong>{t("legal.website")}</strong> chinoisendevenir.com
                </p>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-2xl shadow-xl p-8 text-center text-white mt-16">
            <p className="mb-4">{t("terms.accept")}</p>
            <a href="/" className="landing-btn landing-btn-accent">
              {t("legal.back")}
            </a>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}

export default TermsOfServicePage;
