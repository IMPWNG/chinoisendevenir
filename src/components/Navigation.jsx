import { Link, useLocation } from "react-router-dom";
import { useState } from "react";

const Navigation = () => {
  const [menuOpen, setMenuOpen] = useState(false);
  const location = useLocation();

  const isActive = (path) => location.pathname === path;

  const navLinks = [
    { path: "/", label: "Accueil", icon: "🏠" },
    { path: "/bourses", label: "Bourses", icon: "💰" },
    { path: "/processus", label: "Processus", icon: "🔄" },
    { path: "/about", label: "À propos", icon: "ℹ️" },
    { path: "/contact", label: "Contact", icon: "📧" },
  ];

  return (
    <nav className="landing-header">
      <div className="container landing-header-content">
        <Link to="/" className="landing-logo">
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
              to={link.path}
              onClick={() => setMenuOpen(false)}
              className={`flex items-center gap-2 transition-colors ${
                isActive(link.path)
                  ? "text-red-600 font-bold border-b-2 border-red-600"
                  : "text-gray-700 hover:text-red-600"
              }`}
            >
              <span>{link.icon}</span>
              {link.label}
            </Link>
          ))}
          <Link
            to="/#lead-form"
            className="landing-nav-cta"
            onClick={() => setMenuOpen(false)}
          >
            📝 S'inscrire
          </Link>
        </div>
      </div>
    </nav>
  );
};

export default Navigation;
