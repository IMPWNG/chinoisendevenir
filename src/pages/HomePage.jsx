import Navigation from "../components/Navigation";
import VacationAlert from "../components/VacationAlert";
import Hero from "../components/Hero";
import Stats from "../components/Stats";
import LeadForm from "../components/LeadForm";
import Footer from "../components/Footer";
import { fr } from "../i18n/fr";
import "../App.css";

function HomePage() {
  const t = fr;

  return (
    <div className="app">
      <Navigation />
      <VacationAlert t={t} />
      <Hero t={t} />
      <Stats t={t} />
      <LeadForm t={t} />
      <Footer t={t} />
    </div>
  );
}

export default HomePage;
