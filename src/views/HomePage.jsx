import Navigation from "../components/Navigation";
import Hero from "../components/Hero";
import Stats from "../components/Stats";
import HomeSeoContent from "../components/HomeSeoContent";
import LeadForm from "../components/LeadForm";
import Footer from "../components/Footer";
import JsonLd from "../components/JsonLd";
import { fr } from "../i18n/fr";
import { FAQS, faqJsonLd } from "../lib/seo";

function HomePage() {
  const t = fr;

  return (
    <div className="app app-page-fill">
      <JsonLd data={faqJsonLd(FAQS.home)} />
      <Navigation />
      <Hero t={t} />
      <Stats t={t} />
      <HomeSeoContent />
      <LeadForm t={t} />
      <Footer t={t} />
    </div>
  );
}

export default HomePage;
