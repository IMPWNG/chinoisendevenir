"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { SITE_LANGS, useSiteI18n } from "../context/SiteI18nContext";

const Navigation = () => {
  const [menuOpen, setMenuOpen] = useState(false);
  const pathname = usePathname();
  const { t, lang, setLang } = useSiteI18n();

  const isActive = (path) => pathname === path;

  const navLinks = [
    { path: "/", label: t("nav.home") },
    { path: "/etudier-en-chine", label: t("nav.study") },
    { path: "/ecoles-de-langue-chine", label: t("nav.language") },
    { path: "/bourses", label: t("nav.scholarships") },
    { path: "/tarifs", label: t("nav.pricing") },
  ];

  return (
    <nav className="landing-header">
      <div className="container landing-header-content">
        <Link href="/" className="landing-logo">
          🎓 Chinois en Devenir
        </Link>

        <button
          className="landing-mobile-toggle"
          onClick={() => setMenuOpen(!menuOpen)}
          aria-label={t("nav.menu")}
        >
          ☰
        </button>

        <div className={`landing-nav ${menuOpen ? "landing-nav-open" : ""}`}>
          {navLinks.map((link) => (
            <Link
              key={link.path}
              href={link.path}
              onClick={() => setMenuOpen(false)}
              className={`landing-nav-link ${isActive(link.path) ? "is-active" : ""}`}
            >
              {link.label}
            </Link>
          ))}
          <Link
            href="/#lead-form"
            className="landing-nav-cta"
            onClick={() => setMenuOpen(false)}
          >
            {t("nav.signup")}
          </Link>
          <div className="landing-lang-switch" role="group" aria-label="Language">
            {SITE_LANGS.map((item) => (
              <button
                key={item.id}
                type="button"
                className={lang === item.id ? "is-active" : ""}
                onClick={() => setLang(item.id)}
              >
                {item.label}
              </button>
            ))}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navigation;
