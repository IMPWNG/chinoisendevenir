"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";

const Navigation = () => {
  const [menuOpen, setMenuOpen] = useState(false);
  const pathname = usePathname();

  const isActive = (path) =>
    path.startsWith("/espace-etudiant")
      ? pathname.startsWith("/espace-etudiant")
      : pathname === path;

  const navLinks = [
    { path: "/", label: "Accueil", icon: "🏠" },
    { path: "/etudier-en-chine", label: "Étudier en Chine", icon: "📘" },
    { path: "/bourses", label: "Bourses", icon: "💰" },
    { path: "/processus", label: "Processus", icon: "🔄" },
    { path: "/tarifs", label: "Tarifs", icon: "💶" },
    { path: "/contact", label: "Contact", icon: "📧" },
    { path: "/espace-etudiant", label: "Espace étudiant", icon: "🎓" },
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
              <span>{link.icon}</span>
              {link.label}
            </Link>
          ))}
          <Link
            href="/#lead-form"
            className="landing-nav-cta"
            onClick={() => setMenuOpen(false)}
          >
            <span aria-hidden="true">📝</span>
            S'inscrire
          </Link>
        </div>
      </div>
    </nav>
  );
};

export default Navigation;
