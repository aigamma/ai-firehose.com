import { NavLink, Outlet } from "react-router-dom";
import { SITE, NAV } from "../data/registry.js";
import useTheme from "../hooks/useTheme.js";

export default function Layout() {
  const { theme, toggle } = useTheme();
  return (
    <>
      <a className="skip-link" href="#main">Skip to content</a>
      <header className="site-header">
        <div className="container bar">
          <NavLink to="/" className="brand">
            <span>
              <span className="spark">⌁</span> {SITE.name}
            </span>
            <span className="tag">{SITE.tagline}</span>
          </NavLink>
          <nav className="nav">
            {NAV.map((n) => (
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
          <button
            className="icon-btn"
            onClick={toggle}
            aria-label="Toggle light and dark theme"
            title="Toggle theme"
          >
            {theme === "dark" ? "☀" : "☾"}
          </button>
        </div>
      </header>

      <main id="main" className="container">
        <Outlet />
      </main>

      <footer className="site-footer">
        <div className="container">
          A personal instrument for staying organized and courageous on the AI frontier.
          Sibling to worldthought.com and aigamma.com. The corpus self-expires at one quarter,
          so nothing here is ever stale. <a href="/feed.xml">RSS</a>.
        </div>
      </footer>
    </>
  );
}
