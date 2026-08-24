import Link from "next/link";
import Navigation from "../components/Navigation";
import Footer from "../components/Footer";
import FaqSection from "../components/FaqSection";
import JsonLd from "../components/JsonLd";
import PageBreadcrumbs from "../components/PageBreadcrumbs";
import { fr } from "../i18n/fr";
import { breadcrumbJsonLd, FAQS, faqJsonLd } from "../lib/seo";

const BREADCRUMBS = [
  { name: "Accueil", path: "/" },
  { name: "Processus d'admission", path: "/processus" },
];

function ProcessusPage() {
  const t = fr;

  const etapes = [
    {
      numero: 1,
      titre: "Consultation initiale",
      description:
        "Évaluation de votre profil et de vos objectifs d'études en Chine.",
      details: [
        "Analyse du dossier académique",
        "Identification des universités adaptées",
        "Étude de faisabilité financière",
      ],
      durée: "1-2 semaines",
      icon: "🤝",
    },
    {
      numero: 2,
      titre: "Choix de l'université et du programme",
      description:
        "Sélection de l'établissement et du domaine d'études qui correspondent à vos aspirations.",
      details: [
        "Présentation de 5-10 universités",
        "Comparaison des programmes",
        "Analyse des perspectives de carrière",
      ],
      durée: "2-3 semaines",
      icon: "🏫",
    },
    {
      numero: 3,
      titre: "Préparation du dossier",
      description:
        "Rassemblement et préparation de tous les documents nécessaires pour la candidature.",
      details: [
        "Traduction des diplômes",
        "Rédaction des lettres de motivation",
        "Organisation des recommandations",
        "Préparation des tests d'admission",
      ],
      durée: "3-4 semaines",
      icon: "📄",
    },
    {
      numero: 4,
      titre: "Soumission de la candidature",
      description: "Envoi du dossier complet aux universités sélectionnées.",
      details: [
        "Vérification finale des documents",
        "Envoi aux universités",
        "Suivi administratif",
        "Communication avec les universités",
      ],
      durée: "1-2 semaines",
      icon: "📤",
    },
    {
      numero: 5,
      titre: "Attente des résultats",
      description:
        "Période d'attente pendant que les universités examinent votre candidature.",
      details: [
        "Suivi régulier",
        "Préparation à l'entretien si nécessaire",
        "Attente de la décision d'admission",
      ],
      durée: "4-8 semaines",
      icon: "⏳",
    },
    {
      numero: 6,
      titre: "Préparation du visa",
      description:
        "Organisation des formalités administratives pour obtenir votre visa étudiant.",
      details: [
        "Obtention de la lettre d'admission officielle",
        "Demande du formulaire JW202",
        "Constitution du dossier de visa",
      ],
      durée: "3-4 semaines",
      icon: "🛂",
    },
    {
      numero: 7,
      titre: "Préparation au départ",
      description:
        "Préparation matérielle et administrative pour votre arrivée en Chine.",
      details: [
        "Réservation du vol",
        "Arrangement de l'hébergement",
        "Obtention du visa",
        "Préparation des bagages",
      ],
      durée: "2-3 semaines",
      icon: "✈️",
    },
    {
      numero: 8,
      titre: "Arrivée et installation",
      description:
        "Bienvenue en Chine ! Nous vous accompagnons dans vos premiers pas.",
      details: [
        "Accueil et premières orientations sur place",
        "Aide aux démarches d'inscription et de résidence",
        "Repères pour le campus, le logement et la vie quotidienne",
      ],
      durée: "1-2 semaines",
      icon: "🎓",
    },
  ];

  return (
    <div className="app app-page-fill">
      <JsonLd
        data={[breadcrumbJsonLd(BREADCRUMBS), faqJsonLd(FAQS.processus)]}
      />
      <Navigation />

      <section className="landing-programs">
        <div className="container">
          <PageBreadcrumbs items={BREADCRUMBS} />
          <h1 className="landing-section-title">
            Venir étudier en Chine : le processus d'admission
          </h1>
          <p className="landing-section-subtitle mb-8">
            De la première évaluation jusqu'à l'installation : orientation,
            université, dossier, résultats,{" "}
            <Link href="/visa-etudiant-chine" className="seo-inline-link">
              visa étudiant
            </Link>{" "}
            et départ. Comptez en général 4 à 6 mois.
          </p>

          {/* Timeline */}
          <div className="relative mb-16">
            <div className="absolute left-1/2 transform -translate-x-1/2 w-1 h-full bg-gradient-to-b from-red-600 to-blue-600 opacity-30"></div>

            <div className="space-y-12">
              {etapes.map((etape, index) => (
                <div
                  key={etape.numero}
                  className={`flex gap-8 ${index % 2 === 0 ? "" : "flex-row-reverse"}`}
                >
                  {/* Card */}
                  <div className="flex-1">
                    <div className="bg-white p-6 rounded-xl shadow-lg border-l-4 border-red-600 hover:shadow-xl transition">
                      <div className="flex items-start gap-4 mb-3">
                        <span className="text-3xl">{etape.icon}</span>
                        <div className="flex-1">
                          <span className="inline-block bg-red-100 text-red-700 text-xs font-bold px-3 py-1 rounded-full mb-2">
                            Étape {etape.numero}
                          </span>
                          <h3 className="text-xl font-bold text-gray-800">
                            {etape.titre}
                          </h3>
                        </div>
                      </div>

                      <p className="text-gray-700 mb-4">{etape.description}</p>

                      <div className="space-y-2 mb-4">
                        {etape.details.map((detail, i) => (
                          <div
                            key={i}
                            className="flex items-center gap-2 text-sm text-gray-600"
                          >
                            <span className="text-green-600">✓</span>
                            {detail}
                          </div>
                        ))}
                      </div>

                      <p className="text-xs text-gray-500 font-semibold">
                        ⏱️ Durée estimée: {etape.durée}
                      </p>
                    </div>
                  </div>

                  {/* Connector */}
                  <div className="flex-none w-16 flex items-center justify-center">
                    <div className="w-12 h-12 rounded-full bg-white border-4 border-red-600 flex items-center justify-center font-bold text-red-600 shadow-lg">
                      {etape.numero}
                    </div>
                  </div>

                  {/* Empty space */}
                  <div className="flex-1"></div>
                </div>
              ))}
            </div>
          </div>

          {/* Summary */}
          <div className="bg-gradient-to-r from-red-50 to-blue-50 rounded-xl p-8 border border-red-200">
            <h2 className="text-2xl font-bold text-gray-800 mb-6">📊 Résumé</h2>
            <div className="grid md:grid-cols-3 gap-6">
              <div className="bg-white p-4 rounded-lg shadow">
                <p className="text-4xl font-bold text-red-600 mb-2">8</p>
                <p className="text-gray-700 font-semibold">Étapes clés</p>
              </div>
              <div className="bg-white p-4 rounded-lg shadow">
                <p className="text-4xl font-bold text-blue-600 mb-2">4-6</p>
                <p className="text-gray-700 font-semibold">
                  Mois de préparation
                </p>
              </div>
              <div className="bg-white p-4 rounded-lg shadow">
                <p className="text-4xl font-bold text-green-600 mb-2">100%</p>
                <p className="text-gray-700 font-semibold">Accompagnement</p>
              </div>
            </div>
          </div>

          <div className="mt-16 max-w-4xl mx-auto">
            <FaqSection
              items={FAQS.processus}
              title="Questions fréquentes sur le processus pour étudier en Chine"
            />
          </div>
        </div>
      </section>

      <Footer t={t} />
    </div>
  );
}

export default ProcessusPage;
