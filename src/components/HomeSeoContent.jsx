import Link from "next/link";
import FaqSection from "./FaqSection";
import { FAQS } from "@/lib/seo";
import { fr } from "@/i18n/fr";

const WHY_CHINA = [
  {
    title: "Un système universitaire vaste",
    text: "La Chine accueille des étudiants internationaux en licence, master, doctorat et année de langue, avec des formations en chinois ou en anglais.",
  },
  {
    title: "Des bourses possibles, jamais automatiques",
    text: "CSC, bourses d'université, de province ou de ville : un dossier solide peut réduire le coût des études, sans garantie de financement.",
  },
  {
    title: "Un projet à préparer en amont",
    text: "Admission, documents, langue, visa X1 ou X2 : venir faire ses études en Chine demande plusieurs mois de préparation.",
  },
];

const HOW_STEPS = [
  {
    title: "Clarifier le projet",
    text: "Domaine, niveau, langue d'enseignement et budget : on part de votre profil, pas d'une université au hasard.",
    href: "/processus",
  },
  {
    title: "Candidater",
    text: "Dossier, traductions, lettres et suivi auprès des universités chinoises visées.",
    href: "/etudier-en-chine",
  },
  {
    title: "Financer si possible",
    text: "On identifie les bourses réalistes, dont la CSC, sans promettre un résultat.",
    href: "/bourses",
  },
  {
    title: "Obtenir le visa étudiant",
    text: "Après l'admission : JW201/JW202, visa X1 ou X2, puis installation en Chine.",
    href: "/visa-etudiant-chine",
  },
];

const SERVICES = [
  {
    title: fr.service_orientation_title,
    description: fr.service_orientation_description,
  },
  {
    title: fr.service_university_title,
    description: fr.service_university_description,
  },
  {
    title: fr.service_admission_title,
    description: fr.service_admission_description,
  },
  {
    title: fr.service_scholarship_title,
    description: fr.service_scholarship_description,
  },
  {
    title: fr.service_visa_title,
    description: fr.service_visa_description,
  },
  {
    title: fr.service_arrival_title,
    description: fr.service_arrival_description,
  },
];

const PROGRAMS = [
  fr.programs_bachelor,
  fr.programs_master,
  fr.programs_phd,
  fr.programs_language,
  fr.programs_preparatory,
  fr.programs_short_training,
];

export default function HomeSeoContent() {
  return (
    <>
      <section className="landing-programs seo-home-block">
        <div className="container">
          <h2 className="landing-section-title">Pourquoi étudier en Chine</h2>
          <p className="landing-section-subtitle">
            Étudier en Chine, ce n'est pas seulement « partir à l'étranger ».
            C'est viser une université, une langue d'enseignement, un budget et
            un visa, puis relier ces étapes dans le bon ordre.
          </p>
          <div className="grid md:grid-cols-3 gap-6">
            {WHY_CHINA.map((item) => (
              <article
                key={item.title}
                className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100"
              >
                <h3 className="font-bold text-lg text-slate-900 mb-2">
                  {item.title}
                </h3>
                <p className="text-slate-600 text-sm leading-relaxed">
                  {item.text}
                </p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="seo-home-alt">
        <div className="container">
          <h2 className="landing-section-title">
            Comment venir faire ses études en Chine
          </h2>
          <p className="landing-section-subtitle">
            Le parcours type dure souvent 4 à 6 mois : orientation, admission,
            bourse éventuelle, visa, puis départ.{" "}
            <Link href="/etudier-en-chine" className="seo-inline-link">
              Lire le guide complet
            </Link>
            .
          </p>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-5">
            {HOW_STEPS.map((step, index) => (
              <Link
                key={step.title}
                href={step.href}
                className="seo-step-card"
              >
                <span className="seo-step-num">{index + 1}</span>
                <h3>{step.title}</h3>
                <p>{step.text}</p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="landing-programs seo-home-block">
        <div className="container">
          <h2 className="landing-section-title">{fr.services_title}</h2>
          <p className="landing-section-subtitle">{fr.services_subtitle}</p>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {SERVICES.map((service) => (
              <article
                key={service.title}
                className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100"
              >
                <h3 className="font-bold text-lg text-slate-900 mb-2">
                  {service.title}
                </h3>
                <p className="text-slate-600 text-sm leading-relaxed">
                  {service.description}
                </p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="seo-home-alt">
        <div className="container">
          <h2 className="landing-section-title">{fr.programs_title}</h2>
          <p className="landing-section-subtitle">{fr.programs_subtitle}</p>
          <ul className="seo-program-pills">
            {PROGRAMS.map((program) => (
              <li key={program}>{program}</li>
            ))}
          </ul>
          <p className="text-center text-slate-600 mt-8 max-w-2xl mx-auto">
            Vous hésitez encore ? Les{" "}
            <Link href="/tarifs" className="seo-inline-link">
              formules d'accompagnement
            </Link>{" "}
            aident à choisir une école de langue ou une université avant de
            déposer un dossier.
          </p>
        </div>
      </section>

      <section className="landing-programs seo-home-block">
        <div className="container max-w-4xl">
          <FaqSection items={FAQS.home} />
          <p className="text-center mt-8">
            <Link href="/faq" className="seo-inline-link">
              Voir toutes les questions sur les études en Chine
            </Link>
          </p>
        </div>
      </section>
    </>
  );
}
