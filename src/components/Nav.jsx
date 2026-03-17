import { useState } from "react";
import { Link, useLocation } from "react-router-dom";

export default function Nav() {
  const [open, setOpen] = useState(false);
  const { pathname } = useLocation();

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
            <Link
              to="/etudier"
              className={pathname === "/etudier" ? "active" : ""}
            >
              Étudier
            </Link>
          </li>
          <li>
            <Link to="/a-venir">S'expatrier</Link>
          </li>
          <li>
            <Link to="/tourisme">Tourisme</Link>
          </li>
          <li>
            <Link
              to="/indispensables"
              className={pathname === "/indispensables" ? "active" : ""}
              style={{
                color: "var(--gold)",
                border: "1px solid rgba(212,168,83,0.3)",
                padding: "6px 14px",
                fontSize: "11px",
                letterSpacing: "1px",
              }}
            >
              🛠 Indispensables
            </Link>
          </li>
          <li>
            <Link
              to="/contact"
              className={pathname === "/contact" ? "active" : ""}
              style={{
                color: "var(--gold)",
                border: "1px solid rgba(212,168,83,0.3)",
                padding: "6px 14px",
                fontSize: "11px",
                letterSpacing: "1px",
              }}
            >
              Contact
            </Link>
          </li>
        </ul>
      </div>
    </nav>
  );
}
