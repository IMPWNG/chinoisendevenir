import Link from "next/link";
import Navigation from "../components/Navigation";
import Footer from "../components/Footer";
import FaqSection from "../components/FaqSection";
import JsonLd from "../components/JsonLd";
import PageBreadcrumbs from "../components/PageBreadcrumbs";
import PageCta from "../components/PageCta";
import { fr } from "../i18n/fr";
import { breadcrumbJsonLd, FAQS, faqJsonLd } from "../lib/seo";

const BREADCRUMBS = [
  { name: "Accueil", path: "/" },
  { name: "Bourses d'études en Chine", path: "/bourses" },
];

function BoursesPage() {
  const t = fr;

  const bourses = [
    {
      id: 1,
      nom: "Bourse du gouvernement chinois — CSC",
      montant: "Partielle ou complète",
      niveau: "Licence, Master & Doctorat",
      durée: "Selon le programme",
      description:
        "Une bourse nationale pouvant couvrir les frais de scolarité, le logement, l'assurance médicale et une allocation mensuelle.",
      icon: "🇨🇳",
    },
    {
      id: 2,
      nom: "Bourse universitaire",
      montant: "Partielle ou complète",
      niveau: "Licence, Master & Doctorat",
      durée: "1 à 4 ans",
      description:
        "Une aide proposée directement par les universités chinoises pour attirer les meilleurs étudiants internationaux.",
      icon: "🎓",
    },
    {
      id: 3,
      nom: "Bourse provinciale",
      montant: "Selon la province",
      niveau: "Licence, Master & Doctorat",
      durée: "Selon le programme",
      description:
        "Une bourse financée par une province chinoise pour soutenir les étudiants internationaux inscrits dans ses établissements.",
      icon: "🏛️",
    },
    {
      id: 4,
      nom: "Bourse municipale",
      montant: "Selon la ville",
      niveau: "Licence, Master & Doctorat",
      durée: "Selon le programme",
      description:
        "Une aide accordée par certaines villes chinoises pour financer une partie ou la totalité des études des étudiants internationaux.",
      icon: "🏙️",
    },
  ];

  return (
    <div className="app app-page-fill">
      <JsonLd data={[breadcrumbJsonLd(BREADCRUMBS), faqJsonLd(FAQS.bourses)]} />
      <Navigation />

      <section className="landing-programs">
        <div className="container">
          <PageBreadcrumbs items={BREADCRUMBS} />
          <h1 className="landing-section-title">
            Bourses d'études en Chine
          </h1>
          <p className="landing-section-subtitle mb-8">
            Financer ses études en Chine est possible via la bourse CSC, une
            bourse d'université, de province ou de ville. L'obtention dépend du
            dossier : rien n'est automatique.
          </p>
          <p className="text-center text-slate-600 max-w-3xl mx-auto mb-12">
            Nous vous aidons à identifier les options réalistes pour{" "}
            <Link href="/etudier-en-chine" className="seo-inline-link">
              étudier en Chine
            </Link>{" "}
            et à préparer un dossier cohérent. Nous ne garantissons pas
            l'attribution d'une bourse.
          </p>

          {/* Section Attention */}
          <div className="mb-12 bg-amber-50 border-l-4 border-amber-500 rounded-lg p-6 shadow-sm">
            <div className="flex gap-4">
              <div className="text-3xl mt-1">⚠️</div>
              <div>
                <h3 className="font-bold text-lg text-amber-900 mb-3">
                  À savoir avant de postuler
                </h3>
                <p className="text-amber-800 mb-3">
                  Bien que de nombreuses bourses soient accessibles, l'obtention
                  d'un financement dépend de plusieurs critères importants : vos
                  résultats académiques, votre âge, le programme choisi, la
                  qualité de votre dossier, votre niveau de chinois et le nombre
                  de candidats.
                </p>
                <p className="text-amber-800 font-semibold">
                  💡 Nous ne garantissons pas l'obtention d'une bourse, mais
                  nous vous accompagnons pour identifier les options adaptées à
                  votre profil et optimiser votre candidature.
                </p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {bourses.map((bourse) => (
              <div
                key={bourse.id}
                className="landing-program-card shadow-lg hover:shadow-xl"
              >
                <div className="landing-program-icon text-5xl mb-4">
                  {bourse.icon}
                </div>
                <h3 className="font-bold text-lg text-gray-800 mb-2">
                  {bourse.nom}
                </h3>
                <div className="mb-4 space-y-2 text-sm text-gray-600">
                  <p>
                    <strong>Montant:</strong> {bourse.montant}
                  </p>
                  <p>
                    <strong>Niveau:</strong> {bourse.niveau}
                  </p>
                  <p>
                    <strong>Durée:</strong> {bourse.durée}
                  </p>
                </div>
                <p className="text-gray-700 text-sm mb-4">
                  {bourse.description}
                </p>
              </div>
            ))}
          </div>

          <div className="mt-16 bg-blue-50 rounded-xl p-8 border-l-4 border-blue-600">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">
              📋 Comment candidater ?
            </h2>
            <div className="grid md:grid-cols-3 gap-6">
              <div>
                <h3 className="font-bold text-lg text-blue-600 mb-2">
                  1️⃣ Préparation
                </h3>
                <p className="text-gray-700">
                  Rassemblez vos documents (relevé de notes, lettre de
                  motivation, recommandations)
                </p>
              </div>
              <div>
                <h3 className="font-bold text-lg text-blue-600 mb-2">
                  2️⃣ Candidature
                </h3>
                <p className="text-gray-700">
                  Soumettez votre dossier auprès de l'université ou de
                  l'organisme de bourse
                </p>
              </div>
              <div>
                <h3 className="font-bold text-lg text-blue-600 mb-2">
                  3️⃣ Résultats
                </h3>
                <p className="text-gray-700">
                  Attendez les résultats (généralement 2-3 mois) et préparez
                  votre arrivée
                </p>
              </div>
            </div>
          </div>

          <PageCta
            title="Besoin d'aide pour trouver la bourse adaptée à votre profil ?"
            subtitle="Nous vous orientons vers les options les plus réalistes pour votre dossier."
            cta="Demander un conseil personnalisé"
          />

          <div className="mt-16 max-w-4xl mx-auto">
            <FaqSection
              items={FAQS.bourses}
              title="Questions fréquentes sur les bourses pour étudier en Chine"
            />
          </div>
        </div>
      </section>

      <Footer t={t} />
    </div>
  );
}

export default BoursesPage;
