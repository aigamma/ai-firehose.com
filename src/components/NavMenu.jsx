import { useCallback, useEffect, useRef, useState } from "react";
import { NavLink, useLocation } from "react-router-dom";
import { NAV_MORE } from "../data/registry.js";

/*
  The right-anchored overflow Menu. Only a few primary destinations live as pills
  in the header bar; everything else (the registry's NAV_MORE) is reachable here,
  nothing is removed. The trigger sits at the FAR RIGHT of the bar on purpose: a
  dropdown panel cascades leftward (right: 0), so anchoring it rightmost keeps the
  panel on-screen instead of spilling off the left edge.

  The panel is an OPAQUE surface, never a translucent glass. A see-through dropdown
  bleeds the page content behind it and collides into an unreadable overlap, which
  is exactly the bug that retired the old command palette (see LESSONS_LEARNED).

  Accessibility: aria-haspopup/expanded on the trigger, role="menu"/"menuitem" on
  the panel, Escape returns focus to the trigger, click-outside and route changes
  close it, and Arrow/Home/End move a roving focus through the items.
*/
export default function NavMenu() {
  const [open, setOpen] = useState(false);
  const triggerRef = useRef(null);
  const panelRef = useRef(null);
  const itemRefs = useRef([]);
  const { pathname } = useLocation();

  const close = useCallback((returnFocus) => {
    setOpen(false);
    if (returnFocus) triggerRef.current?.focus();
  }, []);

  // A followed menu item changes the route; close on every navigation.
  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (!open) return undefined;
    const onPointerDown = (e) => {
      if (
        panelRef.current && !panelRef.current.contains(e.target) &&
        triggerRef.current && !triggerRef.current.contains(e.target)
      ) {
        close(false);
      }
    };
    const onKeyDown = (e) => {
      const items = itemRefs.current.filter(Boolean);
      if (!items.length) return;
      const here = items.indexOf(document.activeElement);
      if (e.key === "Escape") {
        e.preventDefault();
        close(true);
      } else if (e.key === "ArrowDown") {
        e.preventDefault();
        (items[here + 1] || items[0]).focus();
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        (items[here - 1] || items[items.length - 1]).focus();
      } else if (e.key === "Home") {
        e.preventDefault();
        items[0].focus();
      } else if (e.key === "End") {
        e.preventDefault();
        items[items.length - 1].focus();
      }
    };
    document.addEventListener("mousedown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("mousedown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open, close]);

  const onTrigger = () => {
    setOpen((v) => {
      const next = !v;
      if (next) requestAnimationFrame(() => itemRefs.current[0]?.focus());
      return next;
    });
  };

  return (
    <div className="app-menu">
      <button
        ref={triggerRef}
        type="button"
        className="app-menu-trigger"
        onClick={onTrigger}
        aria-haspopup="menu"
        aria-expanded={open}
        aria-label="More pages"
      >
        <span>Menu</span>
        <span className={`app-menu-caret${open ? " is-open" : ""}`} aria-hidden="true">▾</span>
      </button>
      {open && (
        <div ref={panelRef} className="app-menu-panel" role="menu" aria-label="More pages">
          {NAV_MORE.map((n, i) => (
            <NavLink
              key={n.route}
              to={n.route}
              role="menuitem"
              ref={(el) => { itemRefs.current[i] = el; }}
              className={({ isActive }) => `app-menu-item${isActive ? " is-active" : ""}`}
              onClick={() => close(false)}
            >
              <span className="app-menu-item-label">{n.label}</span>
              {n.desc && <span className="app-menu-item-desc">{n.desc}</span>}
            </NavLink>
          ))}
        </div>
      )}
    </div>
  );
}
