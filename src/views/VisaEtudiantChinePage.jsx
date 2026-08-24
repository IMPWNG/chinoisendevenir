import Link from "next/link";
import Navigation from "../components/Navigation";
import Footer from "../components/Footer";
import FaqSection from "../components/FaqSection";
import JsonLd from "../components/JsonLd";
import PageBreadcrumbs from "../components/PageBreadcrumbs";
import { fr } from "../i18n/fr";
import {
  articleJsonLd,
  breadcrumbJsonLd,
  FAQS,
  faqJsonLd,
} from "../lib/seo";

const BREADCRUMBS = [
  { name: "Accueil", path: "/" },
  { name: "Visa étudiant Chine", path: "/visa-etudiant-chine" },
];

function VisaEtudiantChinePage() {
  const t = fr;

  return (
    <div className="app app-page-fill">
      <JsonLd
        data={[
          breadcrumbJsonLd(BREADCRUMBS),
          articleJsonLd({
            title: "Visa étudiant pour étudier en Chine (X1, X2, JW201, JW202)",
            description:
              "Comment obtenir un visa étudiant pour venir faire ses études en Chine.",
            path: "/visa-etudiant-chine",
            datePublished: "2026-08-24",
          }),
          faqJsonLd(FAQS.visa),
        ]}
      />
      <Navigation />

      <article className="landing-programs">
        <div className="container seo-article">
          <PageBreadcrumbs items={BREADCRUMBS} />
          <h1 className="landing-section-title is-left">
            Visa étudiant pour étudier en Chine
          </h1>
          <p className="seo-lead">
            Pour venir faire ses études en Chine, l'admission ne suffit pas : il
            faut ensuite un visa étudiant. Les types les plus courants sont le
            X1 (séjour long) et le X2 (séjour plus court). Le dossier consulaire
            s'appuie sur la lettre d'admission et le formulaire JW201 ou JW202
            délivré après acceptation par l'université. Chinois en Devenir vous
            guide sur ces démarches ; la décision appartient au consulat.
          </p>

          <h2>Visa X1 ou visa X2</h2>
          <p>
            Le visa X1 concerne en principe un séjour d'études de plus de 180
            jours, typiquement une licence, un master, un doctorat ou une année
            de langue. Le visa X2 concerne un séjour plus court, souvent moins
            de 180 jours : semestre, formation brève, ou certains programmes
            d'été. Le type exact dépend de la durée indiquée par l'université,
            pas seulement du diplôme visé.
          </p>

          <h2>JW201 et JW202 : le document clé</h2>
          <p>
            Après l'admission, l'université (ou le CSC pour certaines bourses)
            émet un visa application form, JW201 ou JW202. Sans ce document, le
            consulat ne traite en général pas une demande d'études. Il
            accompagne la lettre d'admission officielle. Les délais de
            délivrance varient selon l'établissement et la période de l'année.
          </p>

          <h2>Pièces souvent demandées</h2>
          <ul>
            <li>Passeport valide, avec des pages libres</li>
            <li>Formulaire de visa et photo aux normes consulaires</li>
            <li>Lettre d'admission de l'université chinoise</li>
            <li>Formulaire JW201 ou JW202</li>
            <li>
              Parfois un certificat médical, une preuve de ressources ou
              d'assurance, selon le consulat
            </li>
          </ul>
          <p>
            Les exigences précises changent d'un pays à l'autre. Il faut suivre
            la liste du consulat ou du centre de visa de votre lieu de
            résidence, pas une liste générique trouvée en ligne.
          </p>

          <h2>Après l'arrivée : permis de séjour</h2>
          <p>
            Avec un visa X1, l'étudiant doit en général se présenter à
            l'université puis à la police locale pour un permis de séjour, dans
            le délai indiqué (souvent autour de 30 jours). Ce permis, et non le
            visa d'entrée, autorise le séjour d'études. Un X2 peut avoir des
            règles différentes. L'université internationale office guide
            généralement ces premières démarches.
          </p>

          <h2>Quand commencer</h2>
          <p>
            Le visa vient en fin de parcours : d'abord{" "}
            <Link href="/etudier-en-chine">le projet d'études en Chine</Link>,
            puis le dossier, l'admission, ensuite seulement JW201/JW202 et le
            rendez-vous consulaire. Réserver un vol non flexible trop tôt est
            risqué. Notre{" "}
            <Link href="/processus">processus d'admission</Link> situe le visa
            après les résultats, avant le départ.
          </p>

          <div className="seo-cta-box">
            <h2>Besoin d'aide pour le visa étudiant ?</h2>
            <p>
              Nous vérifions la cohérence du dossier après admission et vous
              indiquons les étapes jusqu'au dépôt consulaire. Aucune obtention
              de visa n'est garantie.
            </p>
            <Link href="/tarifs" className="landing-btn landing-btn-accent">
              Voir l'accompagnement visa
            </Link>
          </div>

          <FaqSection
            items={FAQS.visa}
            title="Questions fréquentes sur le visa étudiant chinois"
          />
        </div>
      </article>

      <Footer t={t} />
    </div>
  );
}

export default VisaEtudiantChinePage;
