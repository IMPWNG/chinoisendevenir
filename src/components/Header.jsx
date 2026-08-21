"use client";

import { useState } from "react";

const Header = ({ t }) => {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <header className="landing-header">
      <div className="container landing-header-content">
        <div className="landing-logo">🎓 EtudierEnChine</div>

        <button
          className="landing-mobile-toggle"
          onClick={() => setMenuOpen(!menuOpen)}
          aria-label="Menu"
        >
          ☰
        </button>

        <nav className={`landing-nav ${menuOpen ? "landing-nav-open" : ""}`}>
          <a href="#home" onClick={() => setMenuOpen(false)}>
            {t.nav_home}
          </a>
          <a href="#programs" onClick={() => setMenuOpen(false)}>
            {t.nav_programs}
          </a>
          <a href="#universities" onClick={() => setMenuOpen(false)}>
            {t.nav_universities}
          </a>
          <a href="#scholarships" onClick={() => setMenuOpen(false)}>
            {t.nav_scholarships}
          </a>
          <a href="#process" onClick={() => setMenuOpen(false)}>
            {t.nav_process}
          </a>
          <a
            href="#lead-form"
            className="landing-nav-cta"
            onClick={() => setMenuOpen(false)}
          >
            {t.nav_contact}
          </a>
        </nav>
      </div>
    </header>
  );
};

export default Header;
