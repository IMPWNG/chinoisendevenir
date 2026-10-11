import Link from "next/link";
import { notFound } from "next/navigation";
import Navigation from "../components/Navigation";
import Footer from "../components/Footer";
import FaqSection from "../components/FaqSection";
import JsonLd from "../components/JsonLd";
import PageBreadcrumbs from "../components/PageBreadcrumbs";
import PageCta from "../components/PageCta";
import {
  articleJsonLd,
  breadcrumbJsonLd,
  faqJsonLd,
} from "../lib/seo";
import {
  getStudyCountry,
  STUDY_FROM_DISCLAIMER,
  STUDY_FROM_HUB_PATH,
  studyCountryLinks,
  studyCountryPath,
} from "../lib/studyFromCountries";

export default function StudyFromCountryPage({ slug }: { slug: string }) {
  const country = getStudyCountry(slug);
  if (!country) notFound();
  const path = studyCountryPath(country.slug);
  const links = studyCountryLinks(country);
  const breadcrumbs = [
    { name: "Accueil", path: "/" },
    { name: "Selon le pays", path: STUDY_FROM_HUB_PATH },
    { name: country.name, path },
  ];

  return (
    <div className="app app-page-fill">
      <JsonLd
        data={[
          breadcrumbJsonLd(breadcrumbs),
          articleJsonLd({
            title: country.title,
            description: country.description,
            path,
            datePublished: "2026-10-11",
          }),
          faqJsonLd(country.faqs),
        ]}
      />
      <Navigation />
      <section className="landing-programs">
        <div className="container max-w-4xl">
          <PageBreadcrumbs items={breadcrumbs} />
          <h1 className="landing-section-title">{country.h1}</h1>
          <p className="landing-section-subtitle mb-8">{country.intro}</p>
          <div className="mb-12 bg-amber-50 border-l-4 border-amber-500 rounded-lg p-6 shadow-sm">
            <p className="text-amber-900 text-sm leading-relaxed">{STUDY_FROM_DISCLAIMER}</p>
          </div>

          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Étapes et documents à vérifier
          </h2>
          <ol className="list-decimal list-inside space-y-3 text-gray-700 mb-12">
            {country.steps.map((step) => (
              <li key={step} className="leading-relaxed">
                {step}
              </li>
            ))}
          </ol>

          <h2 className="text-2xl font-bold text-gray-900 mb-4">{country.angleTitle}</h2>
          <p className="text-gray-700 leading-relaxed mb-12">{country.angle}</p>

          <h2 className="text-2xl font-bold text-gray-900 mb-4">Sur le site</h2>
          <ul className="list-disc list-inside space-y-2 text-gray-700 mb-4">
            {links.map((link) => (
              <li key={link.href}>
                <Link href={link.href} className="seo-inline-link">
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>

          <FaqSection items={country.faqs} title="Questions fréquentes" />
          <PageCta title={country.cta} cta="Décrire mon projet" href="/#lead-form" />
        </div>
      </section>
      <Footer />
    </div>
  );
}
