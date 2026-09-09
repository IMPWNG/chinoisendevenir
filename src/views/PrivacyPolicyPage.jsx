"use client";

import Navigation from "../components/Navigation";
import Footer from "../components/Footer";
import { SITE } from "../lib/seo";
import { useSiteI18n } from "../context/SiteI18nContext";

function PrivacyPolicyPage() {
  const { t, dict } = useSiteI18n();

  return (
    <div className="app app-page-fill">
      <Navigation />

      <section className="landing-programs">
        <div className="container max-w-4xl">
          <div className="text-center mb-16">
            <h1 className="landing-section-title">{t("privacy.title")}</h1>
            <p className="text-gray-600 text-sm">{t("legal.updated")}</p>
          </div>

          <div className="space-y-12">
            <div className="bg-white p-8 rounded-xl shadow-md">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                {t("privacy.s1Title")}
              </h2>
              <p className="text-gray-700 leading-relaxed">{t("privacy.s1")}</p>
            </div>

            <div className="bg-white p-8 rounded-xl shadow-md">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                {t("privacy.s2Title")}
              </h2>
              <div className="space-y-4">
                <div>
                  <h3 className="font-bold text-gray-900 mb-2">
                    {t("privacy.s2Types")}
                  </h3>
                  <ul className="list-disc list-inside space-y-2 text-gray-700 ml-2">
                    {dict.privacy.s2TypeItems.map((item) => (
                      <li key={item}>{item}</li>
                    ))}
                  </ul>
                </div>
                <div>
                  <h3 className="font-bold text-gray-900 mb-2">
                    {t("privacy.s2Use")}
                  </h3>
                  <ul className="list-disc list-inside space-y-2 text-gray-700 ml-2">
                    {dict.privacy.s2UseItems.map((item) => (
                      <li key={item}>{item}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>

            <div className="bg-white p-8 rounded-xl shadow-md">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                {t("privacy.s3Title")}
              </h2>
              <p className="text-gray-700 leading-relaxed mb-4">
                {t("privacy.s3")}
              </p>
              <div className="bg-blue-50 border-l-4 border-blue-500 p-4 rounded">
                <p className="text-gray-700 text-sm">
                  <strong>⚠️ {t("privacy.s3Important")}</strong> {t("privacy.s3Note")}
                </p>
              </div>
            </div>

            <div className="bg-white p-8 rounded-xl shadow-md">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                {t("privacy.s4Title")}
              </h2>
              <p className="text-gray-700 leading-relaxed mb-4">{t("privacy.s4")}</p>
              <ul className="list-disc list-inside space-y-2 text-gray-700 ml-2">
                {dict.privacy.s4Items.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </div>

            <div className="bg-white p-8 rounded-xl shadow-md">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                {t("privacy.s5Title")}
              </h2>
              <p className="text-gray-700 leading-relaxed mb-4">{t("privacy.s5")}</p>
              <ul className="list-disc list-inside space-y-2 text-gray-700 ml-2">
                {dict.privacy.s5Items.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
              <p className="text-gray-700 leading-relaxed mt-4">
                {t("privacy.s5Outro")}
              </p>
            </div>

            <div className="bg-white p-8 rounded-xl shadow-md">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                {t("privacy.s6Title")}
              </h2>
              <p className="text-gray-700 leading-relaxed mb-4">{t("privacy.s6")}</p>
              <ul className="list-disc list-inside space-y-2 text-gray-700 ml-2">
                {dict.privacy.s6Items.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
              <p className="text-gray-700 leading-relaxed mt-4">
                {t("privacy.s6Contact")}{" "}
                <a
                  href={`mailto:${SITE.email}`}
                  className="text-blue-600 hover:underline"
                >
                  {SITE.email}
                </a>
              </p>
            </div>

            <div className="bg-white p-8 rounded-xl shadow-md">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                {t("privacy.s7Title")}
              </h2>
              <p className="text-gray-700 leading-relaxed">{t("privacy.s7")}</p>
            </div>

            <div className="bg-white p-8 rounded-xl shadow-md">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                {t("privacy.s8Title")}
              </h2>
              <p className="text-gray-700 leading-relaxed mb-4">{t("privacy.s8")}</p>
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
            <p className="mb-4">{t("privacy.accept")}</p>
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

export default PrivacyPolicyPage;
