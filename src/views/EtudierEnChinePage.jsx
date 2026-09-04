import Link from "next/link";
import Navigation from "../components/Navigation";
import Footer from "../components/Footer";
import FaqSection from "../components/FaqSection";
import JsonLd from "../components/JsonLd";
import PageBreadcrumbs from "../components/PageBreadcrumbs";
import PageCta from "../components/PageCta";
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

const TOPICS = [
  {
    icon: "🎓",
    title: "Pourquoi étudier en Chine",
    text: "La Chine propose un large choix d'universités et de domaines : ingénierie, informatique, commerce, médecine, droit, langues, etc. Selon l'établissement, les cours sont en chinois ou en anglais. Pour un étudiant francophone, l'enjeu n'est pas seulement « partir en Chine » : c'est choisir un programme réaliste par rapport au diplôme déjà obtenu, au niveau de langue et au budget.",
  },
  {
    icon: "🗣️",
    title: "Faut-il parler chinois ?",
    text: "Pas forcément. Beaucoup de formations internationales se font en anglais. Les diplômes enseignés en chinois demandent en général un HSK, souvent autour du niveau 4 ou 5. Si le niveau n'est pas encore suffisant, une année de langue dans l'université vise à préparer l'entrée en licence ou en master. Le choix langue / anglais change la liste d'universités et parfois les bourses accessibles.",
  },
  {
    icon: "📅",
    title: "Calendrier : quand candidater",
    text: "La rentrée principale a lieu en septembre. Une rentrée de printemps existe aussi, souvent en février ou mars, avec moins de programmes. Pour un dossier payant, 4 à 6 mois d'avance sont un bon ordre de grandeur. Pour une bourse d'études en Chine, surtout la CSC, il faut souvent commencer plus tôt, car les dates limites tombent plusieurs mois avant la rentrée.",
    link: { href: "/bourses", label: "Voir les bourses d'études" },
  },
  {
    icon: "💰",
    title: "Bourses pour étudier en Chine",
    text: "Les pistes les plus courantes sont la bourse du gouvernement chinois (CSC), les bourses d'université, les bourses provinciales et municipales. Une bourse peut couvrir la scolarité, parfois le logement, l'assurance et une allocation. Elle n'est jamais automatique : le dossier, le quota et le programme décident.",
    link: { href: "/bourses", label: "Bourses d'études en Chine" },
  },
  {
    icon: "🛂",
    title: "Visa étudiant et installation",
    text: "Après l'admission, l'université transmet une lettre d'offre et un formulaire JW201 ou JW202. Ces pièces servent à demander un visa étudiant X1 (séjour long) ou X2 (séjour plus court). Une fois en Chine, un permis de séjour remplace souvent le visa X1. Logement, inscription et premières démarches se préparent avant le vol, pas à l'arrivée.",
    link: { href: "/visa-etudiant-chine", label: "Visa étudiant" },
  },
  {
    icon: "🤝",
    title: "Comment se faire accompagner",
    text: "Le processus va de l'orientation jusqu'à l'installation. Les formules couvrent l'école de langue (500 €), l'admission universitaire (1 000 €) ou un suivi jusqu'au départ (2 000 €). Les frais d'université, de traduction certifiée, de visa et de voyage restent à la charge de l'étudiant.",
    link: { href: "/processus", label: "Voir le processus d'admission" },
    extraLink: { href: "/tarifs", label: "Voir les formules" },
  },
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

      <section className="landing-programs">
        <div className="container">
          <PageBreadcrumbs items={BREADCRUMBS} />
          <h1 className="landing-section-title">
            Étudier en Chine : le guide pour venir faire ses études
          </h1>
          <p className="landing-section-subtitle mb-8">
            Venir étudier en Chine est possible en licence, master, doctorat ou
            année de langue. Le projet tient en cinq points : une formation
            adaptée, une université qui recrute des internationaux, un dossier
            d'admission complet, un financement (bourse ou frais payants), puis
            un visa étudiant.
          </p>
          <p className="text-center text-slate-600 max-w-3xl mx-auto mb-12">
            Chinois en Devenir accompagne les étudiants francophones sur ces
            étapes, sans garantir une admission, une bourse ou un visa.
          </p>

          <div className="mb-12 bg-amber-50 border-l-4 border-amber-500 rounded-lg p-6 shadow-sm">
            <div className="flex gap-4">
              <div className="text-3xl mt-1">📋</div>
              <div>
                <h2 className="font-bold text-lg text-amber-900 mb-3">
                  Conditions pour étudier en Chine
                </h2>
                <p className="text-amber-800 mb-3">
                  Les universités chinoises examinent en général le parcours
                  académique, la cohérence du projet, le passeport, et un niveau
                  de langue. Une licence demande souvent un baccalauréat ou
                  équivalent ; un master demande une licence ; un doctorat un
                  master. L'âge, les places disponibles et le calendrier de la
                  rentrée pèsent aussi.
                </p>
                <ul className="text-amber-800 space-y-1.5 text-sm">
                  <li>• Diplômes et relevés de notes, souvent traduits</li>
                  <li>• Passeport valide et photo d'identité</li>
                  <li>
                    • Lettre de motivation et parfois lettres de recommandation
                  </li>
                  <li>
                    • Certificat de langue : HSK pour le chinois, IELTS ou TOEFL
                    pour l'anglais
                  </li>
                  <li>• Certificat médical selon les universités</li>
                </ul>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {TOPICS.map((topic) => (
              <div
                key={topic.title}
                className="landing-program-card is-left shadow-lg hover:shadow-xl"
              >
                <div className="landing-program-icon text-5xl mb-4">
                  {topic.icon}
                </div>
                <h2 className="font-bold text-lg text-gray-800 mb-2">
                  {topic.title}
                </h2>
                <p className="text-gray-700 text-sm mb-4">{topic.text}</p>
                {topic.link ? (
                  <Link href={topic.link.href} className="seo-inline-link">
                    {topic.link.label}
                  </Link>
                ) : null}
                {topic.extraLink ? (
                  <>
                    {" · "}
                    <Link href={topic.extraLink.href} className="seo-inline-link">
                      {topic.extraLink.label}
                    </Link>
                  </>
                ) : null}
              </div>
            ))}
          </div>

          <PageCta
            title="Prêt à étudier en Chine ?"
            subtitle="Décrivez votre parcours et votre projet : nous vous indiquons les options d'études en Chine les plus réalistes pour votre profil."
            cta="Évaluer mon projet d'études en Chine"
          />

          <div className="mt-16 max-w-4xl mx-auto">
            <FaqSection
              items={FAQS.etudier}
              title="Questions fréquentes pour étudier en Chine"
            />
          </div>
        </div>
      </section>

      <Footer t={t} />
    </div>
  );
}

export default EtudierEnChinePage;
