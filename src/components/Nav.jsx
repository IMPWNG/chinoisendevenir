import { useState } from 'react'
import { Link, useLocation } from 'react-router-dom'

export default function Nav() {
  const [open, setOpen] = useState(false)
  const { pathname } = useLocation()

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
            <Link to="/etude" className={pathname === "/etude" ? "active" : ""}>
              Étudier
            </Link>
          </li>
          <li>
            <Link to="/a-venir">S'expatrier</Link>
          </li>
          <li>
            <Link to="/a-venir">Tourisme</Link>
          </li>
          <li>
            <Link to="/contact">Contact</Link>
          </li>
        </ul>
      </div>
    </nav>
  );
}
