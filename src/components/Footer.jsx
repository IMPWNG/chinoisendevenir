import Link from "next/link";

const Footer = ({ t }) => {
  const year = new Date().getFullYear();

  return (
    <footer className="landing-footer">
      <div className="container landing-footer-content">
        <p>
          © {year} ChinoisEnDevenir — {t.footer_rights}
        </p>
        <div className="landing-footer-links">
          <Link href="/politique-confidentialite">
            Politique de Confidentialité
          </Link>
          <Link href="/conditions-utilisation">Conditions d'Utilisation</Link>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
