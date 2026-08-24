import Link from "next/link";
import Navigation from "../components/Navigation";
import Footer from "../components/Footer";
import FaqSection from "../components/FaqSection";
import JsonLd from "../components/JsonLd";
import PageBreadcrumbs from "../components/PageBreadcrumbs";
import { fr } from "../i18n/fr";
import {
  ALL_FAQS,
  breadcrumbJsonLd,
  FAQ_GROUPS,
  faqJsonLd,
} from "../lib/seo";

const BREADCRUMBS = [
  { name: "Accueil", path: "/" },
  { name: "FAQ", path: "/faq" },
];

function FaqPage() {
  const t = fr;

  return (
    <div className="app app-page-fill">
      <JsonLd data={[breadcrumbJsonLd(BREADCRUMBS), faqJsonLd(ALL_FAQS)]} />
      <Navigation />

      <article className="landing-programs">
        <div className="container seo-article">
          <PageBreadcrumbs items={BREADCRUMBS} />
          <h1 className="landing-section-title is-left">
            FAQ : étudier en Chine
          </h1>
          <p className="seo-lead">
            Réponses courtes pour venir faire ses études en Chine : admission,
            langue, bourses, visa étudiant et accompagnement. Chinois en Devenir
            prépare les dossiers ; les décisions restent celles des universités,
            des organismes de bourses et des consulats.
          </p>

          {FAQ_GROUPS.map((group) => (
            <FaqSection
              key={group.id}
              items={group.items}
              title={group.title}
              headingId={`faq-${group.id}`}
            />
          ))}

          <div className="seo-cta-box">
            <h2>Votre question n'est pas listée ?</h2>
            <p>
              Décrivez votre parcours : nous vous indiquons les options
              réalistes pour étudier en Chine.
            </p>
            <Link href="/#lead-form" className="landing-btn landing-btn-accent">
              Évaluer mon projet
            </Link>
          </div>
        </div>
      </article>

      <Footer t={t} />
    </div>
  );
}

export default FaqPage;
