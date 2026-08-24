import Link from "next/link";
import Navigation from "../components/Navigation";
import Footer from "../components/Footer";
import FaqSection from "../components/FaqSection";
import JsonLd from "../components/JsonLd";
import PageBreadcrumbs from "../components/PageBreadcrumbs";
import { fr } from "../i18n/fr";
import {
  articleJsonLd,
  breadcrumbJsonLd,
  FAQS,
  faqJsonLd,
} from "../lib/seo";

const BREADCRUMBS = [
  { name: "Accueil", path: "/" },
  { name: "Étudier en Chine", path: "/etudier-en-chine" },
];

function EtudierEnChinePage() {
  const t = fr;

  return (
    <div className="app app-page-fill">
      <JsonLd
        data={[
          breadcrumbJsonLd(BREADCRUMBS),
          articleJsonLd({
            title: "Étudier en Chine : le guide pour les étudiants francophones",
            description:
              "Comment étudier en Chine : admission, langue, bourses, calendrier, budget et visa étudiant.",
            path: "/etudier-en-chine",
            datePublished: "2026-08-24",
          }),
          faqJsonLd(FAQS.etudier),
        ]}
      />
      <Navigation />

      <article className="landing-programs">
        <div className="container seo-article">
          <PageBreadcrumbs items={BREADCRUMBS} />
          <h1 className="landing-section-title is-left">
            Étudier en Chine : le guide pour venir faire ses études
          </h1>
          <p className="seo-lead">
            Venir étudier en Chine est possible en licence, master, doctorat ou
            année de langue. Le projet tient en cinq points : une formation
            adaptée, une université qui recrute des internationaux, un dossier
            d'admission complet, un financement (bourse ou frais payants), puis
            un visa étudiant. Chinois en Devenir accompagne les étudiants
            francophones sur ces étapes, sans garantir une admission, une bourse
            ou un visa.
          </p>

          <h2>Pourquoi étudier en Chine</h2>
          <p>
            La Chine propose un large choix d'universités et de domaines :
            ingénierie, informatique, commerce, médecine, droit, langues, etc.
            Selon l'établissement, les cours sont en chinois ou en anglais. Pour
            un étudiant francophone, l'enjeu n'est pas seulement « partir en
            Chine » : c'est choisir un programme réaliste par rapport au
            diplôme déjà obtenu, au niveau de langue et au budget.
          </p>

          <h2>Conditions pour étudier en Chine</h2>
          <p>
            Les universités chinoises examinent en général le parcours
            académique, la cohérence du projet, le passeport, et un niveau de
            langue. Une licence demande souvent un baccalauréat ou équivalent ;
            un master demande une licence ; un doctorat un master. L'âge, les
            places disponibles et le calendrier de la rentrée pèsent aussi.
          </p>
          <ul>
            <li>Diplômes et relevés de notes, souvent traduits</li>
            <li>Passeport valide et photo d'identité</li>
            <li>Lettre de motivation et parfois lettres de recommandation</li>
            <li>
              Certificat de langue : HSK pour le chinois, IELTS ou TOEFL pour
              l'anglais
            </li>
            <li>Certificat médical selon les universités</li>
          </ul>

          <h2>Faut-il parler chinois ?</h2>
          <p>
            Pas forcément. Beaucoup de formations internationales se font en
            anglais. Les diplômes enseignés en chinois demandent en général un
            HSK, souvent autour du niveau 4 ou 5. Si le niveau n'est pas encore
            suffisant, une année de langue dans l'université vise à préparer
            l'entrée en licence ou en master. Le choix langue / anglais change
            la liste d'universités et parfois les bourses accessibles.
          </p>

          <h2>Calendrier : quand candidater</h2>
          <p>
            La rentrée principale a lieu en septembre. Une rentrée de printemps
            existe aussi, souvent en février ou mars, avec moins de programmes.
            Pour un dossier payant, 4 à 6 mois d'avance sont un bon ordre de
            grandeur. Pour une{" "}
            <Link href="/bourses">bourse d'études en Chine</Link>, surtout la
            CSC, il faut souvent commencer plus tôt, car les dates limites
            tombent plusieurs mois avant la rentrée.
          </p>

          <h2>Bourses pour étudier en Chine</h2>
          <p>
            Les pistes les plus courantes sont la bourse du gouvernement
            chinois (CSC), les bourses d'université, les bourses provinciales
            et municipales. Une bourse peut couvrir la scolarité, parfois le
            logement, l'assurance et une allocation. Elle n'est jamais
            automatique : le dossier, le quota et le programme décident. Notre
            page{" "}
            <Link href="/bourses">Bourses d'études en Chine</Link> détaille ces
            options.
          </p>

          <h2>Visa étudiant et installation</h2>
          <p>
            Après l'admission, l'université transmet une lettre d'offre et un
            formulaire JW201 ou JW202. Ces pièces servent à demander un{" "}
            <Link href="/visa-etudiant-chine">visa étudiant</Link> X1 (séjour
            long) ou X2 (séjour plus court). Une fois en Chine, un permis de
            séjour remplace souvent le visa X1. Logement, inscription et
            premières démarches se préparent avant le vol, pas à l'arrivée.
          </p>

          <h2>Comment se faire accompagner</h2>
          <p>
            Le{" "}
            <Link href="/processus">processus d'admission</Link> va de
            l'orientation jusqu'à l'installation. Les{" "}
            <Link href="/tarifs">formules</Link> couvrent un bilan (100 €), un
            accompagnement candidature (500 €) ou un suivi jusqu'au départ
            (1 000 €). Les frais d'université, de traduction certifiée, de visa
            et de voyage restent à la charge de l'étudiant.
          </p>

          <div className="seo-cta-box">
            <h2>Prêt à étudier en Chine ?</h2>
            <p>
              Décrivez votre parcours et votre projet : nous vous indiquons les
              options d'études en Chine les plus réalistes pour votre profil.
            </p>
            <Link href="/#lead-form" className="landing-btn landing-btn-accent">
              Évaluer mon projet d'études en Chine
            </Link>
          </div>

          <FaqSection
            items={FAQS.etudier}
            title="Questions fréquentes pour étudier en Chine"
          />
        </div>
      </article>

      <Footer t={t} />
    </div>
  );
}

export default EtudierEnChinePage;
