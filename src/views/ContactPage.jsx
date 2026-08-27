import Navigation from "../components/Navigation";
import Footer from "../components/Footer";
import JsonLd from "../components/JsonLd";
import PageBreadcrumbs from "../components/PageBreadcrumbs";
import PageCta from "../components/PageCta";
import { fr } from "../i18n/fr";
import { breadcrumbJsonLd } from "../lib/seo";

const BREADCRUMBS = [
  { name: "Accueil", path: "/" },
  { name: "Contact", path: "/contact" },
];

function ContactPage() {
  const t = fr;

  const contactMethods = [
    {
      icon: "📍",
      title: "Adresse",
      details: ["Chongqing", "Chengdu", "Shanghai", "Beijing"],
    },
    {
      icon: "📞",
      title: "Téléphone",
      details: ["+86 (136) 4050 5272", "Lun-Ven : 9h-18h"],
    },
    {
      icon: "📧",
      title: "Email",
      details: ["chinoisendevenir@gmail.com"],
      href: "mailto:chinoisendevenir@gmail.com",
    },
  ];

  const socialLinks = [
    { icon: "💬", name: "WeChat", handle: "@MCisec" },
    { icon: "📱", name: "WhatsApp", handle: "+33767523361" },
  ];

  const faqs = [
    {
      q: "Quel est le temps de réponse ?",
      a: "Nous répondons généralement sous 24-48h",
    },
    {
      q: "Avez-vous un support en direct ?",
      a: "Oui, via WeChat et WhatsApp pendant les heures de bureau",
    },
    {
      q: "Pouvez-vous m'aider avec mon visa ?",
      a: "Absolument ! C'est l'une de nos spécialités",
    },
    {
      q: "Quels sont vos horaires ?",
      a: "Lun-Ven 9h-18h (heure de Pékin)",
    },
  ];

  return (
    <div className="app app-page-fill">
      <JsonLd data={breadcrumbJsonLd(BREADCRUMBS)} />
      <Navigation />

      <section className="landing-programs">
        <div className="container">
          <PageBreadcrumbs items={BREADCRUMBS} />
          <h1 className="landing-section-title">
            Contact pour étudier en Chine
          </h1>
          <p className="landing-section-subtitle mb-8">
            Une question sur l'admission, une bourse ou le visa étudiant ?
            Écrivez-nous : nous vous aidons à y voir clair sur votre projet
            d'études en Chine.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
            {contactMethods.map((method) => {
              const content = (
                <>
                  <div className="landing-program-icon text-5xl mb-4">
                    {method.icon}
                  </div>
                  <h2 className="font-bold text-lg text-gray-800 mb-2">
                    {method.title}
                  </h2>
                  {method.details.map((detail) => (
                    <p key={detail} className="text-gray-600 text-sm">
                      {detail}
                    </p>
                  ))}
                </>
              );

              if (method.href) {
                return (
                  <a
                    key={method.title}
                    href={method.href}
                    className="landing-program-card shadow-lg hover:shadow-xl block no-underline"
                  >
                    {content}
                  </a>
                );
              }

              return (
                <div
                  key={method.title}
                  className="landing-program-card shadow-lg hover:shadow-xl"
                >
                  {content}
                </div>
              );
            })}
          </div>

          <div className="mt-12 bg-blue-50 rounded-xl p-8 border-l-4 border-blue-600">
            <h2 className="text-2xl font-bold text-gray-800 mb-6">
              🌐 Suivez-nous sur les réseaux
            </h2>
            <div className="grid md:grid-cols-2 gap-6">
              {socialLinks.map((social) => (
                <div
                  key={social.name}
                  className="flex items-center gap-4 bg-white rounded-xl p-6 shadow-sm"
                >
                  <p className="text-4xl">{social.icon}</p>
                  <div>
                    <p className="font-bold text-gray-800">{social.name}</p>
                    <p className="text-gray-600 text-sm">{social.handle}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <PageCta
            title="Une question sur votre projet d'études ?"
            subtitle="Décrivez votre parcours : notre équipe vous recontacte pour une première orientation."
            cta="Évaluer mon projet d'études en Chine"
          />

          <div className="mt-16">
            <h2 className="text-2xl font-bold text-center mb-8 text-gray-800">
              ❓ Questions fréquentes
            </h2>
            <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto">
              {faqs.map((faq) => (
                <div
                  key={faq.q}
                  className="bg-white p-6 rounded-xl shadow-md border-l-4 border-blue-500"
                >
                  <p className="font-bold text-gray-800 mb-2">{faq.q}</p>
                  <p className="text-gray-600 text-sm">{faq.a}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <Footer t={t} />
    </div>
  );
}

export default ContactPage;
