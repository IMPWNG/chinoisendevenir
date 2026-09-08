import Link from "next/link";
import Navigation from "../components/Navigation";
import Footer from "../components/Footer";
import FaqSection from "../components/FaqSection";
import JsonLd from "../components/JsonLd";
import PageBreadcrumbs from "../components/PageBreadcrumbs";
import PageCta from "../components/PageCta";
import { fr } from "../i18n/fr";
import {
  EXTRA_FEES,
  FORMULES,
  PAYMENT_NOTE,
  PROCESS_STEPS,
  displayFormuleFootnote,
  getFormuleIncludeGroups,
} from "../lib/formules";
import { breadcrumbJsonLd, FAQS, faqJsonLd, serviceJsonLd } from "../lib/seo";

const BREADCRUMBS = [
  { name: "Accueil", path: "/" },
  { name: "Tarifs", path: "/tarifs" },
];

const DISCLAIMERS = [
  "Une admission dans une université",
  "L'obtention d'une bourse",
  "L'obtention d'un visa",
  "L'acceptation dans une école de langue",
  "La disponibilité d'un logement",
];

const CHOOSER = [
  {
    number: 1,
    question: "Je veux d'abord apprendre le chinois",
    detail: "École de langue, visa étudiant et première installation en Chine.",
  },
  {
    number: 2,
    question: "Mon projet universitaire est déjà clair",
    detail:
      "Recherche d'universités, dossier et suivi jusqu'aux réponses des établissements.",
  },
  {
    number: 3,
    question: "Je prépare la langue, puis l'université",
    detail:
      "Les deux accompagnements, un seul interlocuteur, 500 € d'économie.",
  },
];

function IncludeList({ items }) {
  return (
    <ul className="space-y-2 text-sm text-slate-700">
      {items.map((item) => (
        <li key={item} className="flex gap-2">
          <span className="text-emerald-600 mt-0.5">✓</span>
          <span>{item}</span>
        </li>
      ))}
    </ul>
  );
}

function FormuleCard({ formule, featured }) {
  const groups = getFormuleIncludeGroups(formule);
  const singleGroup = groups.length === 1;

  return (
    <article
      id={`formule-${formule.number}`}
      className={`relative flex flex-col rounded-2xl border bg-white p-6 shadow-lg h-full scroll-mt-28 ${
        featured
          ? "border-red-500 ring-2 ring-red-100"
          : "border-slate-200"
      }`}
    >
      <div className="flex items-start justify-between gap-3">
        <p className="text-xs font-bold uppercase tracking-widest text-slate-500">
          Formule {formule.number}
        </p>
        {formule.badge ? (
          <span
            className={`shrink-0 rounded-full px-2.5 py-1 text-[11px] font-bold uppercase tracking-wide ${
              featured ? "bg-red-600 text-white" : "bg-slate-800 text-white"
            }`}
          >
            {formule.badge}
          </span>
        ) : null}
      </div>
      {formule.audience ? (
        <p className="text-sm font-medium text-slate-500 mt-2">
          {formule.audience}
        </p>
      ) : null}
      <h2 className="text-xl font-bold text-slate-900 mt-2">{formule.title}</h2>
      {formule.subtitle ? (
        <p className="text-sm font-medium text-slate-600 mt-1">
          {formule.subtitle}
        </p>
      ) : null}

      <div className="mt-3">
        {formule.comparePrice ? (
          <p className="text-sm text-slate-400 line-through">
            {formule.comparePrice}
          </p>
        ) : null}
        <p className="text-3xl font-bold text-red-600">{formule.price}</p>
        {formule.savingsLabel ? (
          <p className="mt-1 inline-flex rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-bold text-emerald-800">
            {formule.savingsLabel}
          </p>
        ) : null}
      </div>
      <p className="text-xs text-slate-500 mt-2 leading-relaxed">
        {PAYMENT_NOTE}
      </p>
      {formule.savingsText ? (
        <p className="text-sm text-slate-700 mt-3 leading-relaxed bg-emerald-50 border border-emerald-100 rounded-xl px-3 py-2">
          {formule.savingsText}
        </p>
      ) : null}
      <p className="text-slate-600 text-sm mt-3 leading-relaxed">
        {formule.intro}
      </p>

      {singleGroup ? (
        <>
          <p className="text-xs font-bold uppercase tracking-wide text-slate-500 mt-6 mb-2">
            Ce qui est inclus
          </p>
          <div className="flex-1">
            <IncludeList items={groups[0].items} />
          </div>
        </>
      ) : (
        <div className="mt-6 flex-1">
          <p className="text-xs font-bold uppercase tracking-wide text-slate-500 mb-3">
            Ce qui est inclus
          </p>
          <div
            className={
              featured
                ? "grid md:grid-cols-3 gap-6"
                : "space-y-5"
            }
          >
            {groups.map((group) => (
              <div key={group.title}>
                <p className="text-sm font-semibold text-slate-900 mb-2">
                  {group.title}
                </p>
                <IncludeList items={group.items} />
              </div>
            ))}
          </div>
        </div>
      )}

      <p className="text-xs font-bold uppercase tracking-wide text-slate-500 mt-6 mb-2">
        Cette formule est idéale si
      </p>
      <ul className="space-y-1.5 text-sm text-slate-600 mb-0">
        {formule.idealIf.map((item) => (
          <li key={item}>• {item}</li>
        ))}
      </ul>

      <div className="formule-card-cta">
        <p className="formule-footnote" aria-hidden={!formule.footnote}>
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
}

function TarifsPage() {
  const t = fr;
  const standaloneFormules = FORMULES.filter((formule) => !formule.featured);
  const featuredFormule = FORMULES.find((formule) => formule.featured);

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
            Trois formules, selon là où vous en êtes
          </h1>
          <p className="landing-section-subtitle mb-10">
            Année de chinois, admission universitaire, ou les deux. Chaque
            formule est un accompagnement complet pour son objectif. Si vous
            combinez langue et université, vous économisez 500 €.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-10">
            {CHOOSER.map((item) => {
              const formule = FORMULES.find(
                (entry) => entry.number === item.number,
              );
              return (
                <a
                  key={item.number}
                  href={`#formule-${item.number}`}
                  className={`rounded-2xl border p-5 transition-shadow hover:shadow-md ${
                    formule?.featured
                      ? "border-red-200 bg-red-50/70"
                      : "border-slate-200 bg-white"
                  }`}
                >
                  <p className="text-xs font-bold uppercase tracking-widest text-slate-500">
                    Formule {item.number}
                    {formule?.featured ? " · recommandée" : ""}
                  </p>
                  <p className="text-base font-bold text-slate-900 mt-2">
                    {item.question}
                  </p>
                  <p className="text-sm text-slate-600 mt-2 leading-relaxed">
                    {item.detail}
                  </p>
                  <p className="text-sm font-semibold text-red-600 mt-3">
                    {formule?.price}
                    {formule?.savings
                      ? ` · économisez ${formule.savings}`
                      : ""}
                  </p>
                </a>
              );
            })}
          </div>

          <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-6 py-5 mb-12">
            <p className="text-sm font-bold uppercase tracking-wide text-emerald-800 mb-2">
              L'économie de la formule complète
            </p>
            <p className="text-slate-800 text-sm md:text-base leading-relaxed">
              Formule 1 + Formule 2 ={" "}
              <span className="line-through text-slate-500">2 500 €</span>
              {" · "}
              Formule 3 ={" "}
              <span className="font-bold text-emerald-800">2 000 €</span>
              {" · "}
              vous économisez <span className="font-bold">500 €</span>, avec
              jusqu'à 8 candidatures universitaires au lieu de 5, et un suivi
              jusqu'au départ.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:items-stretch mb-8">
            {standaloneFormules.map((formule) => (
              <FormuleCard
                key={formule.number}
                formule={formule}
                featured={false}
              />
            ))}
          </div>

          {featuredFormule ? (
            <div className="mb-16">
              <FormuleCard formule={featuredFormule} featured />
            </div>
          ) : null}

          {featuredFormule?.whyChoose ? (
            <div className="grid md:grid-cols-2 gap-6 mb-16">
              <div className="bg-white rounded-2xl border border-red-100 p-6 shadow-sm">
                <h2 className="text-xl font-bold text-slate-900 mb-3">
                  {featuredFormule.whyChoose.title}
                </h2>
                <p className="text-slate-700 text-sm leading-relaxed mb-4">
                  {featuredFormule.whyChoose.intro}
                </p>
                <ol className="space-y-2 text-sm text-slate-700">
                  {featuredFormule.whyChoose.steps.map((step, index) => (
                    <li key={step} className="flex gap-2">
                      <span className="font-bold text-red-600">
                        {index + 1}.
                      </span>
                      <span>{step}</span>
                    </li>
                  ))}
                </ol>
              </div>
              <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
                <h2 className="text-xl font-bold text-slate-900 mb-3">
                  Les formules 1 et 2 restent le bon choix
                </h2>
                <p className="text-slate-700 text-sm leading-relaxed mb-3">
                  La formule complète n'est pas obligatoire. Elle est la plus
                  cohérente si votre projet va de l'année de chinois jusqu'à
                  l'université.
                </p>
                <p className="text-slate-700 text-sm leading-relaxed mb-3">
                  Si vous voulez seulement une année de langue, la Formule 1
                  couvre l'école, l'inscription et l'aide au visa étudiant.
                </p>
                <p className="text-slate-700 text-sm leading-relaxed">
                  Si votre projet universitaire est déjà défini et que votre
                  niveau de langue suffit, la Formule 2 vous accompagne jusqu'aux
                  réponses des universités, sans payer pour une année de chinois
                  dont vous n'avez pas besoin.
                </p>
              </div>
            </div>
          ) : null}

          <div className="grid md:grid-cols-2 gap-6 mb-16">
            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
              <h2 className="text-xl font-bold text-slate-900 mb-3">
                Traduction et préparation des documents
              </h2>
              <p className="text-slate-700 text-sm leading-relaxed mb-3">
                Nous vous aidons à identifier les documents qui doivent être
                traduits et à préparer les versions nécessaires en anglais ou
                en chinois, selon les exigences des universités ou des
                autorités concernées.
              </p>
              <p className="text-slate-700 text-sm leading-relaxed">
                Les traductions officielles, certifiées, les légalisations,
                authentifications et notarisation peuvent être facturées
                séparément. Ces frais vous seront communiqués avant toute
                commande.
              </p>
            </div>
            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
              <h2 className="text-xl font-bold text-slate-900 mb-3">
                Frais qui restent à votre charge
              </h2>
              <p className="text-slate-700 text-sm leading-relaxed mb-3">
                Nos tarifs couvrent uniquement les services d'accompagnement et
                de conseil. Certains frais supplémentaires peuvent rester à
                votre charge, notamment :
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
                <li
                  key={step.title}
                  className="bg-white rounded-xl p-4 border border-slate-200"
                >
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
              Le paiement intervient après la première consultation
              téléphonique et après validation de la formule. Aucune démarche
              ne commence avant la confirmation de l'accompagnement.
            </p>
          </div>

          <div className="bg-amber-50 border-l-4 border-amber-500 rounded-xl p-6 mb-16">
            <h2 className="text-lg font-bold text-amber-950 mb-2">
              Informations importantes
            </h2>
            <p className="text-amber-900 text-sm leading-relaxed mb-3">
              Nous vous aidons à construire un dossier sérieux, cohérent et
              conforme aux exigences des établissements. Cependant, nous ne
              pouvons pas garantir :
            </p>
            <ul className="space-y-1 text-sm text-amber-900 mb-3">
              {DISCLAIMERS.map((item) => (
                <li key={item}>• {item}</li>
              ))}
            </ul>
            <p className="text-amber-900 text-sm leading-relaxed">
              Les décisions finales appartiennent aux universités, aux
              organismes de bourses, aux écoles de langue et aux autorités
              compétentes.
            </p>
          </div>

          <PageCta
            title="Vous ne savez pas encore quelle formule choisir ?"
            subtitle="La première consultation sert à confirmer l'offre adaptée à votre projet. Le paiement n'intervient qu'après cet échange."
            cta="Demander un échange téléphonique"
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
