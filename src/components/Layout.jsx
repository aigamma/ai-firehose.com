import { Suspense } from "react";
import { NavLink, Outlet } from "react-router-dom";
import { SITE, NAV_PRIMARY } from "../data/registry.js";
import useTheme from "../hooks/useTheme.js";
import ScrollToTop from "./ScrollToTop.jsx";
import NavMenu from "./NavMenu.jsx";

// Inline lucide Sun and Moon (the same icons robotlogic.org uses) so the pill
// needs no icon dependency. 24x24 viewBox, stroked with currentColor.
function SunIcon() {
  return (
    <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <circle cx="12" cy="12" r="4" />
      <path d="M12 2v2" />
      <path d="M12 20v2" />
      <path d="m4.93 4.93 1.41 1.41" />
      <path d="m17.66 17.66 1.41 1.41" />
      <path d="M2 12h2" />
      <path d="M20 12h2" />
      <path d="m6.34 17.66-1.41 1.41" />
      <path d="m19.07 4.93-1.41 1.41" />
    </svg>
  );
}

function MoonIcon() {
  return (
    <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z" />
    </svg>
  );
}

export default function Layout() {
  const { theme, toggle } = useTheme();
  const isDark = theme === "dark";
  return (
    <>
      <ScrollToTop />
      <a className="skip-link" href="#main">Skip to content</a>
      <header className="site-header">
        <div className="container bar">
          <NavLink to="/" className="brand">
            <span>
              <span className="spark">⌁</span> {SITE.name}
            </span>
          </NavLink>
          <nav className="nav" aria-label="Primary">
            {NAV_PRIMARY.map((n) => (
              <NavLink
                key={n.route}
                to={n.route}
                end={n.route === "/"}
                className={({ isActive }) => (isActive ? "active" : undefined)}
              >
                {n.label}
              </NavLink>
            ))}
          </nav>
          <div className="header-tools">
            <button
              className="theme-pill"
              onClick={toggle}
              aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
              title={isDark ? "Switch to light mode" : "Switch to dark mode"}
            >
              {isDark ? <SunIcon /> : <MoonIcon />}
              {isDark ? "Light" : "Dark"}
            </button>
            <NavMenu />
          </div>
        </div>
      </header>

      <main id="main" className="container">
        <Suspense fallback={<div className="stack" style={{ paddingTop: 40 }}><p className="muted">Loading…</p></div>}>
          <Outlet />
        </Suspense>
      </main>

      <footer className="site-footer">
        <div className="container">
          A personal instrument for staying organized and courageous on the AI frontier.
          Sibling to <a href="https://worldthought.com" target="_blank" rel="noopener noreferrer">worldthought.com</a> and <a href="https://aigamma.com" target="_blank" rel="noopener noreferrer">aigamma.com</a>. The corpus self-expires at one quarter,
          so nothing here is ever stale. <a href="/feed.xml">RSS</a>.
          <div className="footer-credit">
            Created by <a className="footer-author" href="https://about.aigamma.com/" target="_blank" rel="noopener noreferrer">Eric Allione</a>
          </div>
        </div>
      </footer>
    </>
  );
}
