import Link from "next/link";
import { SITE } from "@/lib/seo";

const Footer = ({ t }) => {
  const year = new Date().getFullYear();

  return (
    <footer className="landing-footer">
      <div className="container">
        <div className="landing-footer-grid">
          <div className="landing-footer-brand">
            <p className="landing-footer-name">🎓 {SITE.name}</p>
            <p>{t.footer_description}</p>
          </div>
          <div className="landing-footer-col">
            <p className="landing-footer-heading">Étudier en Chine</p>
            <Link href="/etudier-en-chine">Guide : étudier en Chine</Link>
            <Link href="/visa-etudiant-chine">Visa étudiant</Link>
            <Link href="/bourses">Bourses d'études</Link>
            <Link href="/processus">Processus d'admission</Link>
          </div>
          <div className="landing-footer-col">
            <p className="landing-footer-heading">Accompagnement</p>
            <Link href="/tarifs">Tarifs</Link>
            <Link href="/contact">Contact</Link>
            <Link href="/#lead-form">Évaluer mon projet</Link>
            <Link href="/espace-etudiant">Espace étudiant</Link>
          </div>
          <div className="landing-footer-col">
            <p className="landing-footer-heading">Informations</p>
            <Link href="/politique-confidentialite">
              Politique de confidentialité
            </Link>
            <Link href="/conditions-utilisation">Conditions d'utilisation</Link>
            <a href={`mailto:${SITE.email}`}>{SITE.email}</a>
          </div>
        </div>
        <div className="landing-footer-bottom">
          <p>
            © {year} {SITE.name} — {t.footer_rights}
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
