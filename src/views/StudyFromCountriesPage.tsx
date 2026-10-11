import Link from "next/link";
import Navigation from "../components/Navigation";
import Footer from "../components/Footer";
import JsonLd from "../components/JsonLd";
import PageBreadcrumbs from "../components/PageBreadcrumbs";
import PageCta from "../components/PageCta";
import { articleJsonLd, breadcrumbJsonLd } from "../lib/seo";
import {
  STUDY_COUNTRIES,
  STUDY_FROM_DISCLAIMER,
  STUDY_FROM_HUB_PATH,
  studyCountryPath,
} from "../lib/studyFromCountries";

const HUB_LINKS = [
  { href: "/etudier-en-chine", label: "Guide général : étudier en Chine" },
  { href: "/ecoles-de-langue-chine", label: "Année de langue et préparation linguistique" },
  { href: "/processus", label: "Processus d'admission et préparation du dossier" },
  { href: "/visa-etudiant-chine", label: "Visa étudiant" },
  { href: "/bourses", label: "Bourses d'études" },
  { href: "/tarifs", label: "Formules d'accompagnement" },
  { href: "/contact", label: "Contact" },
  { href: "/#lead-form", label: "Décrire mon projet" },
];

export default function StudyFromCountriesPage() {
  const breadcrumbs = [
    { name: "Accueil", path: "/" },
    { name: "Selon le pays", path: STUDY_FROM_HUB_PATH },
  ];

  return (
    <div className="app app-page-fill">
      <JsonLd
        data={[
          breadcrumbJsonLd(breadcrumbs),
          articleJsonLd({
            title: "Étudier en Chine selon le pays",
            description:
              "Pages pour préparer une candidature en Chine depuis 15 pays francophones : dossier, documents et vérifications officielles.",
            path: STUDY_FROM_HUB_PATH,
            datePublished: "2026-10-11",
          }),
        ]}
      />
      <Navigation />
      <section className="landing-programs">
        <div className="container max-w-4xl">
          <PageBreadcrumbs items={breadcrumbs} />
          <h1 className="landing-section-title">Étudier en Chine selon le pays</h1>
          <p className="landing-section-subtitle mb-8">
            Quinze pages pour préparer un projet d'études en Chine depuis un pays
            précis. Chacune reprend les étapes du dossier et les questions propres à
            ce point de départ. Les conditions se vérifient auprès de l'université et
            des autorités compétentes.
          </p>
          <div className="mb-12 bg-amber-50 border-l-4 border-amber-500 rounded-lg p-6 shadow-sm">
            <p className="text-amber-900 text-sm leading-relaxed">{STUDY_FROM_DISCLAIMER}</p>
          </div>
          <ul className="space-y-4 mb-12">
            {STUDY_COUNTRIES.map((country) => (
              <li key={country.slug} className="bg-white rounded-xl shadow-md p-5">
                <Link href={studyCountryPath(country.slug)} className="seo-inline-link text-lg font-bold">
                  {country.h1}
                </Link>
                <p className="text-gray-600 text-sm mt-2">{country.description}</p>
              </li>
            ))}
          </ul>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Sur le site</h2>
          <ul className="list-disc list-inside space-y-2 text-gray-700">
            {HUB_LINKS.map((link) => (
              <li key={link.href}>
                <Link href={link.href} className="seo-inline-link">
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
          <PageCta
            title="Décrivez votre pays de départ, votre niveau et le programme visé."
            cta="Décrire mon projet"
            href="/#lead-form"
          />
        </div>
      </section>
      <Footer />
    </div>
  );
}
