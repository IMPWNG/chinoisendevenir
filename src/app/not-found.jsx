import Link from "next/link";
import Footer from "@/components/Footer";
import Navigation from "@/components/Navigation";
import { fr } from "@/i18n/fr";

export const metadata = {
  title: "Page introuvable",
  description:
    "Cette page n'existe pas. Consultez nos guides pour étudier en Chine : admission, bourses, visa étudiant, ou contactez-nous.",
  robots: { index: false, follow: false },
};

const LINKS = [
  { href: "/", label: "Accueil" },
  { href: "/etudier-en-chine", label: "Guide étudier en Chine" },
  { href: "/bourses", label: "Bourses" },
  { href: "/visa-etudiant-chine", label: "Visa étudiant" },
  { href: "/contact", label: "Contact" },
];

export default function NotFound() {
  return (
    <div className="app app-page-fill">
      <Navigation />
      <section className="landing-programs">
        <div className="container max-w-4xl text-center">
          <p className="text-sm font-semibold text-red-600 mb-3">Erreur 404</p>
          <h1 className="landing-section-title">Page introuvable</h1>
          <p className="landing-section-subtitle mb-10">
            Ce lien n'existe pas ou a été déplacé. Voici les pages les plus
            utiles pour un projet d'études en Chine.
          </p>
          <ul className="flex flex-col sm:flex-row flex-wrap justify-center gap-x-6 gap-y-3 mb-8">
            {LINKS.map((link) => (
              <li key={link.href}>
                <Link href={link.href} className="seo-inline-link">
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </section>
      <Footer t={fr} />
    </div>
  );
}
