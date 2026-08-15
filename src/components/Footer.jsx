const Footer = ({ t }) => {
  const year = new Date().getFullYear();

  return (
    <footer className="landing-footer">
      <div className="container landing-footer-content">
        <p>
          © {year} ChinoisEnDevenir — {t.footer_rights}
        </p>
        <div className="landing-footer-links">
          <a href="/politique-confidentialite">Politique de Confidentialité</a>
          <a href="/conditions-utilisation">Conditions d'Utilisation</a>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
