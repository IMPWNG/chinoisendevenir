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
          <span /><span /><span />
        </button>
        <ul className={`nav-links${open ? ' open' : ''}`}>
          <li>
            <Link to="/" className={pathname === '/' ? 'active' : ''}>
              Étudier
            </Link>
          </li>
          <li className="soon-tag">
            <Link to="/a-venir">S'expatrier</Link>
          </li>
          <li className="soon-tag">
            <Link to="/a-venir">Tourisme</Link>
          </li>
        </ul>
      </div>
    </nav>
  )
}
