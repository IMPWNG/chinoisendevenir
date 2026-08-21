import Navigation from "../components/Navigation";
import Footer from "../components/Footer";
import { fr } from "../i18n/fr";

function TermsOfServicePage() {
  const t = fr;

  return (
    <div className="app app-page-fill">
      <Navigation />

      <section className="landing-programs">
        <div className="container max-w-4xl">
          {/* Titre */}
          <div className="text-center mb-16">
            <h1 className="landing-section-title">
              📋 Conditions d'Utilisation
            </h1>
            <p className="text-gray-600 text-sm">
              Dernière mise à jour : Août 2026
            </p>
          </div>

          {/* Contenu */}
          <div className="space-y-12">
            {/* Section 1 */}
            <div className="bg-white p-8 rounded-xl shadow-md">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                1. Acceptation des Conditions
              </h2>
              <p className="text-gray-700 leading-relaxed">
                En accédant et en utilisant le site web{" "}
                <strong>chinoisendevenir.com</strong>, vous acceptez d'être lié
                par ces conditions d'utilisation. Si vous n'acceptez pas ces
                conditions, veuillez ne pas utiliser ce site.
              </p>
            </div>

            {/* Section 2 */}
            <div className="bg-white p-8 rounded-xl shadow-md">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                2. Utilisation du Site
              </h2>
              <p className="text-gray-700 leading-relaxed mb-4">
                Vous acceptez d'utiliser ce site uniquement à des fins légales
                et de ne pas l'utiliser d'une manière qui pourrait endommager,
                désactiver, surcharger ou nuire au site.
              </p>
              <div className="space-y-3">
                <h3 className="font-bold text-gray-900">Interdictions :</h3>
                <ul className="list-disc list-inside space-y-2 text-gray-700 ml-2">
                  <li>Harcèlement ou intimidation d'autres utilisateurs</li>
                  <li>Publication de contenu offensant ou illégal</li>
                  <li>Tentative d'accès non autorisé au site</li>
                  <li>Collecte de données sans autorisation</li>
                  <li>Utilisation de robots ou d'outils d'automatisation</li>
                </ul>
              </div>
            </div>

            {/* Section 3 */}
            <div className="bg-white p-8 rounded-xl shadow-md">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                3. Propriété Intellectuelle
              </h2>
              <p className="text-gray-700 leading-relaxed mb-4">
                Tout le contenu du site, y compris les textes, graphiques,
                logos, images et logiciels, est la propriété de EtudierEnChine
                ou de ses fournisseurs de contenu et est protégé par les lois
                internationales sur les droits d'auteur.
              </p>
              <p className="text-gray-700 leading-relaxed">
                <strong>Vous n'êtes pas autorisé à :</strong>
              </p>
              <ul className="list-disc list-inside space-y-2 text-gray-700 ml-2 mt-2">
                <li>Reproduire ou modifier le contenu sans autorisation</li>
                <li>Distribuer le contenu à des fins commerciales</li>
                <li>Utiliser le contenu pour créer des œuvres dérivées</li>
              </ul>
            </div>

            {/* Section 4 */}
            <div className="bg-white p-8 rounded-xl shadow-md">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                4. Comptes Utilisateur
              </h2>
              <p className="text-gray-700 leading-relaxed mb-4">
                Si vous créez un compte sur notre site, vous êtes responsable de
                :
              </p>
              <ul className="list-disc list-inside space-y-2 text-gray-700 ml-2">
                <li>Maintenir la confidentialité de vos identifiants</li>
                <li>Vous déconnecter après chaque session</li>
                <li>Notifier immédiatement tout accès non autorisé</li>
                <li>Fournir des informations exactes et à jour</li>
              </ul>
            </div>

            {/* Section 5 */}
            <div className="bg-white p-8 rounded-xl shadow-md">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                5. Contenu Utilisateur
              </h2>
              <p className="text-gray-700 leading-relaxed mb-4">
                En soumettant du contenu à notre site, vous accordez à
                EtudierEnChine une licence non-exclusive, perpétuelle et
                irrévocable pour utiliser, modifier, publier et distribuer ce
                contenu.
              </p>
              <div className="bg-yellow-50 border-l-4 border-yellow-500 p-4 rounded">
                <p className="text-gray-700 text-sm">
                  <strong>⚠️ Responsabilité :</strong> Vous garantissez que tout
                  contenu que vous soumettez est original, ne viole pas les
                  droits de tiers et n'est pas offensant.
                </p>
              </div>
            </div>

            {/* Section 6 */}
            <div className="bg-white p-8 rounded-xl shadow-md">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                6. Exclusion de Garantie
              </h2>
              <p className="text-gray-700 leading-relaxed mb-4">
                Ce site est fourni "tel quel" sans aucune garantie, explicite ou
                implicite. Nous ne garantissons pas :
              </p>
              <ul className="list-disc list-inside space-y-2 text-gray-700 ml-2">
                <li>L'exactitude ou l'exhaustivité des informations</li>
                <li>Le fonctionnement ininterrompu du site</li>
                <li>L'absence d'erreurs ou de virus</li>
                <li>Le respect de vos attentes spécifiques</li>
              </ul>
            </div>

            {/* Section 7 */}
            <div className="bg-white p-8 rounded-xl shadow-md">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                7. Limitation de Responsabilité
              </h2>
              <p className="text-gray-700 leading-relaxed">
                En aucun cas, EtudierEnChine ne sera responsable des dommages
                indirects, accidentels, spéciaux, consécutifs ou punitifs
                découlant de votre utilisation ou de votre incapacité à utiliser
                ce site, même si nous avons été informés de la possibilité de
                tels dommages.
              </p>
            </div>

            {/* Section 8 */}
            <div className="bg-white p-8 rounded-xl shadow-md">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                8. Liens Externes
              </h2>
              <p className="text-gray-700 leading-relaxed mb-4">
                Notre site peut contenir des liens vers des sites web externes.
                Nous ne sommes pas responsables du contenu, de l'exactitude ou
                des pratiques de ces sites externes.
              </p>
              <p className="text-gray-700 leading-relaxed">
                L'inclusion d'un lien n'implique pas notre approbation du site
                lié.
              </p>
            </div>

            {/* Section 9 */}
            <div className="bg-white p-8 rounded-xl shadow-md">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                9. Suspension de Service
              </h2>
              <p className="text-gray-700 leading-relaxed">
                Nous nous réservons le droit de suspendre ou de résilier l'accès
                au site à tout moment, pour quelque raison que ce soit, y
                compris la violation de ces conditions. Nous pouvons également
                suspendre le service sans préavis en cas d'urgence ou de
                problèmes techniques.
              </p>
            </div>

            {/* Section 10 */}
            <div className="bg-white p-8 rounded-xl shadow-md">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                10. Modifications des Conditions
              </h2>
              <p className="text-gray-700 leading-relaxed">
                Nous pouvons modifier ces conditions à tout moment. Les
                modifications entreront en vigueur immédiatement après leur
                publication. Votre utilisation continue du site après la
                publication des modifications constitue votre acceptation des
                nouvelles conditions.
              </p>
            </div>

            {/* Section 11 */}
            <div className="bg-white p-8 rounded-xl shadow-md">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                11. Droit Applicable
              </h2>
              <p className="text-gray-700 leading-relaxed">
                Ces conditions d'utilisation sont régies par et construites
                conformément aux lois applicables. Tout différend découlant de
                ces conditions sera soumis à la juridiction exclusive des
                tribunaux compétents.
              </p>
            </div>

            {/* Section 12 */}
            <div className="bg-white p-8 rounded-xl shadow-md">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                12. Contact
              </h2>
              <p className="text-gray-700 leading-relaxed mb-4">
                Pour toute question concernant ces conditions d'utilisation,
                veuillez nous contacter :
              </p>
              <div className="bg-slate-50 p-6 rounded-lg space-y-2">
                <p className="text-gray-900">
                  <strong>Email :</strong>{" "}
                  <a
                    href="mailto:chinoisendevenir@gmail.com"
                    className="text-blue-600 hover:underline"
                  >
                    chinoisendevenir@gmail.com
                  </a>
                </p>
                <p className="text-gray-900">
                  <strong>Site Web :</strong> chinoisendevenir.com
                </p>
              </div>
            </div>
          </div>

          {/* CTA Acceptation */}
          <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-2xl shadow-xl p-8 text-center text-white mt-16">
            <p className="mb-4">
              En utilisant notre site, vous acceptez ces conditions
              d'utilisation
            </p>
            <a
              href="/"
              className="inline-block px-8 py-3 bg-white text-blue-600 font-bold rounded-lg hover:shadow-lg transition"
            >
              ← Retour à l'accueil
            </a>
          </div>
        </div>
      </section>

      <Footer t={t} />
    </div>
  );
}

export default TermsOfServicePage;
