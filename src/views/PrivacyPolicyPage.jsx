import Navigation from "../components/Navigation";
import Footer from "../components/Footer";
import { fr } from "../i18n/fr";

function PrivacyPolicyPage() {
  const t = fr;

  return (
    <div className="app app-page-fill">
      <Navigation />

      <section className="landing-programs">
        <div className="container max-w-4xl">
          {/* Titre */}
          <div className="text-center mb-16">
            <h1 className="landing-section-title">
              🔒 Politique de Confidentialité
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
                1. Introduction
              </h2>
              <p className="text-gray-700 leading-relaxed">
                Chinois en Devenir ("nous", "nos", "notre") exploite le site web
                <strong> chinoisendevenir.com</strong>. Cette page vous informe
                de nos politiques concernant la collecte, l'utilisation et la
                divulgation de données personnelles lorsque vous utilisez notre
                service et les choix que vous avez associés à ces données.
              </p>
            </div>

            {/* Section 2 */}
            <div className="bg-white p-8 rounded-xl shadow-md">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                2. Collecte et Utilisation des Données
              </h2>
              <div className="space-y-4">
                <div>
                  <h3 className="font-bold text-gray-900 mb-2">
                    📋 Types de données collectées :
                  </h3>
                  <ul className="list-disc list-inside space-y-2 text-gray-700 ml-2">
                    <li>Nom complet</li>
                    <li>Adresse email</li>
                    <li>Numéro de téléphone</li>
                    <li>Adresse postale</li>
                    <li>Informations académiques</li>
                    <li>Données de localisation (si autorisé)</li>
                  </ul>
                </div>
                <div>
                  <h3 className="font-bold text-gray-900 mb-2">
                    🎯 Utilisation des données :
                  </h3>
                  <ul className="list-disc list-inside space-y-2 text-gray-700 ml-2">
                    <li>Traitement de vos demandes de contact</li>
                    <li>Envoi de newsletters et mises à jour</li>
                    <li>Amélioration de nos services</li>
                    <li>Conformité avec les obligations légales</li>
                    <li>Prévention de la fraude</li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Section 3 */}
            <div className="bg-white p-8 rounded-xl shadow-md">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                3. Sécurité des Données
              </h2>
              <p className="text-gray-700 leading-relaxed mb-4">
                Nous prenons la sécurité de vos données personnelles très au
                sérieux. Nous utilisons des technologies de chiffrement
                (SSL/TLS) pour protéger vos informations en transit.
              </p>
              <div className="bg-blue-50 border-l-4 border-blue-500 p-4 rounded">
                <p className="text-gray-700 text-sm">
                  <strong>⚠️ Important :</strong> Aucune méthode de transmission
                  sur Internet n'est 100% sécurisée. Bien que nous utilisions
                  des mesures de sécurité appropriées, nous ne pouvons pas
                  garantir la sécurité absolue.
                </p>
              </div>
            </div>

            {/* Section 4 */}
            <div className="bg-white p-8 rounded-xl shadow-md">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                4. Partage des Données
              </h2>
              <p className="text-gray-700 leading-relaxed mb-4">
                Nous ne vendons, n'échangeons ni ne louons vos données
                personnelles à des tiers. Nous pouvons partager vos informations
                uniquement dans les cas suivants :
              </p>
              <ul className="list-disc list-inside space-y-2 text-gray-700 ml-2">
                <li>Avec vos consentements explicites</li>
                <li>Avec nos partenaires universitaires en Chine</li>
                <li>Conformément aux exigences légales</li>
                <li>Pour protéger nos droits et votre sécurité</li>
              </ul>
            </div>

            {/* Section 5 */}
            <div className="bg-white p-8 rounded-xl shadow-md">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                5. Cookies
              </h2>
              <p className="text-gray-700 leading-relaxed mb-4">
                Notre site utilise des cookies pour améliorer votre expérience
                utilisateur. Les cookies sont de petits fichiers stockés sur
                votre appareil qui nous aident à :
              </p>
              <ul className="list-disc list-inside space-y-2 text-gray-700 ml-2">
                <li>Mémoriser vos préférences</li>
                <li>Analyser le trafic du site</li>
                <li>Personnaliser le contenu</li>
              </ul>
              <p className="text-gray-700 leading-relaxed mt-4">
                Vous pouvez désactiver les cookies dans les paramètres de votre
                navigateur.
              </p>
            </div>

            {/* Section 6 */}
            <div className="bg-white p-8 rounded-xl shadow-md">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                6. Vos Droits
              </h2>
              <p className="text-gray-700 leading-relaxed mb-4">
                Vous avez le droit de :
              </p>
              <ul className="list-disc list-inside space-y-2 text-gray-700 ml-2">
                <li>Accéder à vos données personnelles</li>
                <li>Corriger les données inexactes</li>
                <li>Demander la suppression de vos données</li>
                <li>Vous opposer au traitement de vos données</li>
                <li>Retirer votre consentement à tout moment</li>
              </ul>
              <p className="text-gray-700 leading-relaxed mt-4">
                Pour exercer ces droits, contactez-nous à :{" "}
                <a
                  href="mailto:chinoisendevenir@gmail.com"
                  className="text-blue-600 hover:underline"
                >
                  chinoisendevenir@gmail.com
                </a>
              </p>
            </div>

            {/* Section 7 */}
            <div className="bg-white p-8 rounded-xl shadow-md">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                7. Modifications de cette Politique
              </h2>
              <p className="text-gray-700 leading-relaxed">
                Nous pouvons mettre à jour cette politique de confidentialité de
                temps à autre. Les modifications seront publiées sur cette page
                avec une date de mise à jour. Votre utilisation continue du site
                après toute modification constitue votre acceptation de la
                politique mise à jour.
              </p>
            </div>

            {/* Section 8 */}
            <div className="bg-white p-8 rounded-xl shadow-md">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                8. Contact
              </h2>
              <p className="text-gray-700 leading-relaxed mb-4">
                Si vous avez des questions concernant cette politique de
                confidentialité, veuillez nous contacter :
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
              En utilisant notre site, vous acceptez cette politique de
              confidentialité
            </p>
            <a href="/" className="landing-btn landing-btn-accent">
              ← Retour à l'accueil
            </a>
          </div>
        </div>
      </section>

      <Footer t={t} />
    </div>
  );
}

export default PrivacyPolicyPage;
