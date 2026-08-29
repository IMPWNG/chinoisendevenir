import Link from "next/link";
import Navigation from "../components/Navigation";
import Footer from "../components/Footer";
import FaqSection from "../components/FaqSection";
import JsonLd from "../components/JsonLd";
import PageBreadcrumbs from "../components/PageBreadcrumbs";
import PageCta from "../components/PageCta";
import { fr } from "../i18n/fr";
import { EXTRA_FEES, FORMULES, PROCESS_STEPS, displayFormuleFootnote } from "../lib/formules";
import { breadcrumbJsonLd, FAQS, faqJsonLd, serviceJsonLd } from "../lib/seo";

const BREADCRUMBS = [
  { name: "Accueil", path: "/" },
  { name: "Tarifs", path: "/tarifs" },
];

function TarifsPage() {
  const t = fr;

  return (
    <div className="app app-page-fill">
      <JsonLd
        data={[
          breadcrumbJsonLd(BREADCRUMBS),
          serviceJsonLd(),
          faqJsonLd(FAQS.tarifs),
        ]}
      />
      <Navigation />

      <section className="landing-programs">
        <div className="container">
          <PageBreadcrumbs items={BREADCRUMBS} />
          <h1 className="landing-section-title">
            Nos formules d'accompagnement
          </h1>
          <p className="landing-section-subtitle mb-12">
            Vous souhaitez étudier en Chine, mais vous ne savez pas par où
            commencer ? Nous vous accompagnons selon votre niveau d'avancement :
            orientation, candidature, bourse, visa et préparation du départ.
          </p>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-16">
            {FORMULES.map((formule) => {
              const featured = formule.number === 2;
              return (
                <article
                  key={formule.number}
                  className={`flex flex-col rounded-2xl border bg-white p-6 shadow-lg h-full ${
                    featured
                      ? "border-red-500 ring-2 ring-red-100"
                      : "border-slate-200"
                  }`}
                >
                  <p className="text-xs font-bold uppercase tracking-widest text-slate-500">
                    Formule {formule.number}
                  </p>
                  <h2 className="text-xl font-bold text-slate-900 mt-2">
                    {formule.title}
                  </h2>
                  <p className="text-3xl font-bold text-red-600 mt-3">
                    {formule.price}
                  </p>
                  <p className="text-slate-600 text-sm mt-3 leading-relaxed">
                    {formule.intro}
                  </p>

                  <p className="text-xs font-bold uppercase tracking-wide text-slate-500 mt-6 mb-2">
                    Inclus
                  </p>
                  <ul className="space-y-2 text-sm text-slate-700 flex-1">
                    {formule.includes.map((item) => (
                      <li key={item} className="flex gap-2">
                        <span className="text-emerald-600 mt-0.5">✓</span>
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                  <p className="text-xs font-bold uppercase tracking-wide text-slate-500 mt-6 mb-2">
                    Idéale si
                  </p>
                  <ul className="space-y-1.5 text-sm text-slate-600 mb-0">
                    {formule.idealIf.map((item) => (
                      <li key={item}>• {item}</li>
                    ))}
                  </ul>

                  <div className="formule-card-cta">
                    <p
                      className="formule-footnote"
                      aria-hidden={!formule.footnote}
                    >
                      {formule.footnote
                        ? displayFormuleFootnote(formule.footnote)
                        : "\u00a0"}
                    </p>
                    <Link
                      href="/#lead-form"
                      className={`landing-btn landing-btn-full formule-card-btn ${
                        featured ? "landing-btn-accent" : "landing-btn-primary"
                      }`}
                    >
                      {formule.cta}
                    </Link>
                  </div>
                </article>
              );
            })}
          </div>

          <div className="grid md:grid-cols-2 gap-6 mb-16">
            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
              <h2 className="text-xl font-bold text-slate-900 mb-3">
                Traduction des documents
              </h2>
              <p className="text-slate-700 text-sm leading-relaxed mb-3">
                Nous vous aidons à identifier les documents à traduire et à
                préparer les versions en anglais ou en chinois, selon les
                exigences des universités.
              </p>
              <p className="text-slate-700 text-sm leading-relaxed">
                Les traductions officielles, certifiées, les légalisations et
                authentications peuvent être facturées à part. Ces frais vous
                sont indiqués avant d'être engagés.
              </p>
            </div>
            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
              <h2 className="text-xl font-bold text-slate-900 mb-3">
                Frais annexes
              </h2>
              <p className="text-slate-700 text-sm leading-relaxed mb-3">
                Nos tarifs correspondent uniquement à l'accompagnement. Peuvent
                rester à votre charge :
              </p>
              <ul className="grid grid-cols-1 gap-1.5 text-sm text-slate-700">
                {EXTRA_FEES.map((item) => (
                  <li key={item}>• {item}</li>
                ))}
              </ul>
            </div>
          </div>

          <div className="bg-slate-50 rounded-2xl border border-slate-200 p-8 mb-16">
            <h2 className="text-2xl font-bold text-slate-900 mb-6">
              Comment fonctionne l'accompagnement ?
            </h2>
            <ol className="grid md:grid-cols-5 gap-4">
              {PROCESS_STEPS.map((step, index) => (
                <li key={step.title} className="bg-white rounded-xl p-4 border border-slate-200">
                  <p className="text-red-600 font-bold mb-2">{index + 1}.</p>
                  <p className="font-semibold text-slate-900 text-sm mb-1">
                    {step.title}
                  </p>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    {step.text}
                  </p>
                </li>
              ))}
            </ol>
            <p className="text-sm text-slate-600 mt-6">
              Le paiement intervient après la première consultation téléphonique
              et après validation de la formule. Aucune démarche ne commence
              avant.
            </p>
          </div>

          <div className="bg-amber-50 border-l-4 border-amber-500 rounded-xl p-6 mb-16">
            <h2 className="text-lg font-bold text-amber-950 mb-2">
              Informations importantes
            </h2>
            <p className="text-amber-900 text-sm leading-relaxed">
              Nous vous aidons à préparer un dossier sérieux et conforme. Nous
              ne pouvons pas garantir une admission, une bourse, un visa ou un
              logement. Ces décisions appartiennent aux universités, aux
              organismes de bourses et aux autorités concernées.
            </p>
          </div>

          <PageCta
            title="Construisons ensemble votre projet d'études en Chine"
            subtitle="Que vous soyez encore au stade de la réflexion ou déjà prêt à déposer vos candidatures, nous vous aidons à avancer avec une méthode claire."
            cta="Prendre contact avec Chinois en Devenir"
          />

          <div className="mt-16 max-w-4xl mx-auto">
            <FaqSection
              items={FAQS.tarifs}
              title="Questions fréquentes sur l'accompagnement"
            />
          </div>
        </div>
      </section>

      <Footer t={t} />
    </div>
  );
}

export default TarifsPage;
