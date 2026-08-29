"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { useAuth } from "../context/AuthContext";

const Navigation = () => {
  const [menuOpen, setMenuOpen] = useState(false);
  const pathname = usePathname();
  const { user } = useAuth();

  const isActive = (path) =>
    path.startsWith("/espace-etudiant")
      ? pathname.startsWith("/espace-etudiant")
      : pathname === path;

  const navLinks = [
    { path: "/", label: "Accueil" },
    { path: "/etudier-en-chine", label: "Étudier en Chine" },
    { path: "/bourses", label: "Bourses" },
    { path: "/visa-etudiant-chine", label: "Visa" },
    { path: "/processus", label: "Processus" },
    { path: "/faq", label: "FAQ" },
    { path: "/tarifs", label: "Tarifs" },
    { path: "/contact", label: "Contact" },
  ];

  const studentPath = user ? "/espace-etudiant" : "/espace-etudiant/connexion";
  const studentLabel = user ? "Mon espace" : "Espace étudiant";

  return (
    <nav className="landing-header">
      <div className="container landing-header-content">
        <Link href="/" className="landing-logo">
          🎓 Chinois en Devenir
        </Link>

        <button
          className="landing-mobile-toggle"
          onClick={() => setMenuOpen(!menuOpen)}
          aria-label="Menu"
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
            href={studentPath}
            className={`landing-nav-cta landing-nav-cta-student ${
              isActive(studentPath) ? "is-active" : ""
            }`}
            onClick={() => setMenuOpen(false)}
          >
            {studentLabel}
          </Link>
          <Link
            href="/#lead-form"
            className="landing-nav-cta"
            onClick={() => setMenuOpen(false)}
          >
            S'inscrire
          </Link>
        </div>
      </div>
    </nav>
  );
};

export default Navigation;
