"use client";

import Navigation from "../components/Navigation";
import Footer from "../components/Footer";
import { fr } from "../i18n/fr";

function ContactPage() {
  const t = fr;

  const contactMethods = [
    {
      icon: "📍",
      title: "Adresse",
      details: ["Chongqing", "Chengdu", "Shanghai"],
    },
    {
      icon: "📞",
      title: "Téléphone",
      details: ["+86 (0) XXX XXX XXXX", "Lun-Ven : 9h-18h"],
    },
    {
      icon: "📧",
      title: "Email",
      details: ["chinoisendevenir@gmail.com"],
      link: "mailto:chinoisendevenir@gmail.com",
    },
  ];

          const socialLinks = [
    { icon: "💬", name: "WeChat", handle: "@chinoisendevenir" },
    { icon: "📱", name: "WhatsApp", handle: "Nous contacter" },
  ];

  return (
    <div className="app app-page-fill">
      <Navigation />

      <section className="landing-programs">
        <div className="container">
          {/* Titre */}
          <div className="text-center mb-16">
            <h1 className="landing-section-title">Contact pour étudier en Chine</h1>
            <p className="landing-section-subtitle">
              Une question sur l'admission, une bourse ou le visa étudiant ?
              Écrivez-nous : nous vous aidons à y voir clair sur votre projet
              d'études en Chine.
            </p>
          </div>

          {/* Cartes de contact */}
          <div className="grid md:grid-cols-3 gap-8 mb-20">
            {contactMethods.map((method, index) => (
              <div
                key={index}
                className={`p-8 rounded-2xl shadow-lg text-center transition-all duration-300 hover:shadow-xl hover:-translate-y-1 ${
                  method.link
                    ? "bg-gradient-to-br from-blue-500 to-blue-600 text-white cursor-pointer"
                    : "bg-white text-gray-900"
                }`}
                onClick={() =>
                  method.link && (window.location.href = method.link)
                }
              >
                <p className="text-5xl mb-4">{method.icon}</p>
                <h3 className="font-bold text-xl mb-3">{method.title}</h3>
                {method.details.map((detail, i) => (
                  <p
                    key={i}
                    className={
                      method.link
                        ? "text-blue-100 text-sm"
                        : "text-gray-600 text-sm"
                    }
                  >
                    {detail}
                  </p>
                ))}
              </div>
            ))}
          </div>

          {/* Réseaux sociaux */}
          <div className="bg-white rounded-2xl shadow-lg p-12 mb-20">
            <h2 className="text-2xl font-bold text-center mb-12 text-gray-900">
              🌐 Suivez-nous sur les réseaux
            </h2>
            <div className="grid md:grid-cols-2 gap-6 max-w-2xl mx-auto">
              {socialLinks.map((social, index) => (
                <div
                  key={index}
                  className="flex items-center gap-4 p-6 bg-gradient-to-r from-slate-100 to-slate-50 rounded-xl hover:shadow-md transition"
                >
                  <p className="text-4xl">{social.icon}</p>
                  <div className="text-left">
                    <p className="font-bold text-gray-900">{social.name}</p>
                    <p className="text-gray-600 text-sm">{social.handle}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* CTA */}
          <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-2xl shadow-xl p-12 text-center text-white">
            <h2 className="text-3xl font-bold mb-4">
              💡 Une question urgente ?
            </h2>
            <p className="text-blue-100 mb-8 text-lg">
              Contactez-nous directement par téléphone
            </p>
            <a href="tel:+86XXXXXXXXXX" className="landing-btn landing-btn-accent">
              📞 Nous appeler
            </a>
          </div>

          {/* FAQ rapide */}
          <div className="mt-20">
            <h2 className="text-2xl font-bold text-center mb-12 text-gray-900">
              ❓ Questions fréquentes
            </h2>
            <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto">
              {[
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
              ].map((faq, index) => (
                <div
                  key={index}
                  className="bg-white p-6 rounded-xl shadow-md border-l-4 border-blue-500"
                >
                  <p className="font-bold text-gray-900 mb-2">{faq.q}</p>
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
