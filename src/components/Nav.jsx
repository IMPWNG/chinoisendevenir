import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { useLanguage } from "../context/LanguageContext.jsx";
import translations from "../translations.js";

export default function Nav() {
  const [open, setOpen] = useState(false);
  const { pathname } = useLocation();
  const { lang, toggleLang } = useLanguage();
  const t = translations[lang];

  return (
    <nav>
      <div className="nav-inner">
        <Link to="/" className="nav-logo">
          🇨🇳 <span>Chinois</span> en Devenir
        </Link>
        <button
          className="nav-burger"
          onClick={() => setOpen(!open)}
          aria-label="Menu"
        >
          <span />
          <span />
          <span />
        </button>
        <ul className={`nav-links${open ? " open" : ""}`}>
          <li>
            <Link to="/" className={pathname === "/" ? "active" : ""}>
              {t.nav_home}
            </Link>
          </li>
          <li>
            <button onClick={toggleLang} className="nav-lang-btn">
              {lang === "fr" ? "ENG" : "FR"}
            </button>
          </li>
        </ul>
      </div>
    </nav>
  );
}
