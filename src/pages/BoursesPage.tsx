import Navigation from "../components/Navigation";
import Footer from "../components/Footer";
import { fr } from "../i18n/fr";
import "../App.css";

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
        <div className="app">
            <Navigation />

            <section className="landing-programs py-20">
                <div className="container">
                    <h1 className="landing-section-title">💰 Bourses d'études</h1>
                    <p className="landing-section-subtitle mb-12">
                        Découvrez les différentes opportunités de financement pour étudier en
                        Chine
                    </p>

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
                                <p className="text-gray-700 text-sm mb-4">{bourse.description}</p>
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
                                    Rassemblez vos documents (relevé de notes, lettre de motivation,
                                    recommandations)
                                </p>
                            </div>
                            <div>
                                <h3 className="font-bold text-lg text-blue-600 mb-2">
                                    2️⃣ Candidature
                                </h3>
                                <p className="text-gray-700">
                                    Soumettez votre dossier auprès de l'université ou de l'organisme
                                    de bourse
                                </p>
                            </div>
                            <div>
                                <h3 className="font-bold text-lg text-blue-600 mb-2">
                                    3️⃣ Résultats
                                </h3>
                                <p className="text-gray-700">
                                    Attendez les résultats (généralement 2-3 mois) et préparez votre
                                    arrivée
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            <Footer t={t} />
        </div>
    );
}

export default BoursesPage;