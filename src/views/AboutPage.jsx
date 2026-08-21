import Navigation from "../components/Navigation";
import Footer from "../components/Footer";
import { fr } from "../i18n/fr";

function AboutPage() {
  const t = fr;

  return (
    <div className="app app-page-fill">
      <Navigation />

      <section className="landing-programs">
        <div className="container">
          <h1 className="landing-section-title">ℹ️ À propos de nous</h1>
          <p className="landing-section-subtitle mb-12">
            Votre partenaire de confiance pour étudier en Chine
          </p>

          <div className="grid md:grid-cols-2 gap-12 mb-16">
            <div>
              <h2 className="text-2xl font-bold text-gray-800 mb-4">
                Notre mission
              </h2>
              <p className="text-gray-700 mb-4">
                Chinois en Devenir est une plateforme d'accompagnement pour les
                étudiants francophones qui souhaitent poursuivre leurs études en
                Chine.
              </p>
              <p className="text-gray-700 mb-4">
                Notre mission est de faciliter l'accès à l'enseignement
                supérieur chinois de qualité en offrant des services
                d'orientation, de préparation et de suivi.
              </p>
            </div>
            <div className="bg-blue-50 p-8 rounded-xl">
              <h2 className="text-2xl font-bold text-gray-800 mb-4">
                Nos valeurs
              </h2>
              <ul className="space-y-3 text-gray-700">
                <li>✅ Transparence et honnêteté</li>
                <li>✅ Excellence académique</li>
                <li>✅ Accompagnement personnalisé</li>
                <li>✅ Résultats prouvés</li>
              </ul>
            </div>
          </div>

          <div className="bg-gradient-to-r from-red-600 to-blue-600 text-white p-12 rounded-xl mb-16">
            <h2 className="text-3xl font-bold mb-6">Nos chiffres</h2>
            <div className="grid md:grid-cols-4 gap-8 text-center">
              <div>
                <p className="text-4xl font-bold mb-2">250+</p>
                <p>Étudiants accompagnés</p>
              </div>
              <div>
                <p className="text-4xl font-bold mb-2">20+</p>
                <p>Universités partenaires</p>
              </div>
              <div>
                <p className="text-4xl font-bold mb-2">95%</p>
                <p>Taux de réussite</p>
              </div>
              <div>
                <p className="text-4xl font-bold mb-2">2+</p>
                <p>Années d'expérience</p>
              </div>
            </div>
          </div>

          {/* <div>
            <h2 className="text-2xl font-bold text-gray-800 mb-8 text-center">
              Notre équipe
            </h2>
            <div className="grid md:grid-cols-3 gap-8">
              {[
                {
                  nom: "Marie Dubois",
                  titre: "Directrice",
                  bio: "15 ans d'expérience en éducation internationale",
                },
                {
                  nom: "Li Wei",
                  titre: "Conseiller académique",
                  bio: "Expert des universités chinoises depuis 2010",
                },
                {
                  nom: "Ahmed Mansour",
                  titre: "Coordinateur administratif",
                  bio: "Spécialiste des visas et démarches administratives",
                },
              ].map((membre, i) => (
                <div
                  key={i}
                  className="bg-white p-6 rounded-xl shadow-lg text-center hover:shadow-xl transition"
                >
                  <div className="w-20 h-20 rounded-full bg-gradient-to-br from-red-400 to-blue-400 mx-auto mb-4"></div>
                  <h3 className="font-bold text-lg text-gray-800 mb-1">
                    {membre.nom}
                  </h3>
                  <p className="text-red-600 font-semibold mb-2">
                    {membre.titre}
                  </p>
                  <p className="text-gray-600 text-sm">{membre.bio}</p>
                </div>
              ))}
            </div>
          </div> */}
        </div>
      </section>

      <Footer t={t} />
    </div>
  );
}

export default AboutPage;
