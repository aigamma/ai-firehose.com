import { useEffect, useMemo, useRef, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { NAV } from "../data/registry.js";
import useData from "../lib/useData.js";

/*
  Command palette for fast navigation of the firehose (Cmd/Ctrl+K, or "/").

  Self-contained by design: this component owns its open-state, its own global
  key listener, and its own data loading. Layout renders it once and adds a
  header trigger; nothing else in the app needs to know it exists.

  Search is instant and LOCAL (no network). Two content sources:
    - glossary concepts from /data/glossary/index.json (label + aliases), and
    - the site nav routes derived from the registry.
  Pressing Enter on a query with no exact match hands off to /explore for a
  full semantic search.

  Accessibility follows the WAI-ARIA combobox pattern: the text input keeps DOM
  focus at all times; the active row is tracked with aria-activedescendant and
  highlighted visually (ArrowUp/ArrowDown move the highlight, not focus).
*/

// Per-group cap so one source cannot crowd out the other.
const CONCEPT_CAP = 8;
const NAV_CAP = 12;

// Diacritic- and case-insensitive fold, so "rene" matches "René" and the
// matcher compares apples to apples. Unicode property escapes need the /u flag.
const fold = (s) =>
  (s || "")
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .toLowerCase()
    .trim();

// Rank a folded haystack against a folded needle. Lower is better; -1 = no
// match. prefix (0) beats a word-boundary hit (1) beats a bare substring (2).
function rankText(hay, needle) {
  if (!needle) return 3; // empty query: everything ties, keep stable order
  if (!hay) return -1;
  if (hay.startsWith(needle)) return 0;
  const idx = hay.indexOf(needle);
  if (idx < 0) return -1;
  // Word boundary: the char before the match is a separator (space, dash, etc).
  const before = hay[idx - 1];
  if (before === undefined || /[\s\-/_.,:()]/.test(before)) return 1;
  return 2;
}

// Best (lowest) rank across a concept's label and its aliases.
function rankConcept(c, needle) {
  let best = rankText(fold(c.label), needle);
  for (const a of c.aliases || []) {
    const r = rankText(fold(a), needle);
    if (r >= 0 && (best < 0 || r < best)) best = r;
  }
  return best;
}

// The nav routes the palette can jump to: the registry NAV (Home, the three
// kinds, Glossary, Explore, Methodology) plus About, which is a route but not
// in the top nav. Deduped by route, order preserved.
const NAV_ROUTES = (() => {
  const seen = new Set();
  const out = [];
  for (const n of [...NAV, { label: "About", route: "/about" }]) {
    if (seen.has(n.route)) continue;
    seen.add(n.route);
    out.push(n);
  }
  return out;
})();

export default function CommandPalette() {
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [active, setActive] = useState(0);
  // Whether the user has deliberately moved the highlight with the arrow keys
  // (or hovered a row). This disambiguates Enter: a deliberately chosen row is
  // opened; a free-text query the user just typed hands off to semantic search.
  const [movedSelection, setMovedSelection] = useState(false);

  const inputRef = useRef(null);
  const listRef = useRef(null);
  // The element focused before the palette opened, restored on close so the
  // keyboard user lands back where they were.
  const restoreFocusRef = useRef(null);

  // Concepts load once (module-level cache in useData dedupes the fetch). A 404
  // before the worker has run yields null, which we treat as an empty list.
  const { data: glossary } = useData("/data/glossary/index.json");
  const concepts = useMemo(() => glossary?.concepts || [], [glossary]);

  const close = useCallback(() => {
    setOpen(false);
    setQuery("");
    setActive(0);
    setMovedSelection(false);
  }, []);

  // Global shortcuts: Cmd/Ctrl+K toggles; "/" opens, but only when the user is
  // not typing into a field (so "/" stays usable inside inputs and textareas).
  useEffect(() => {
    const isTypingTarget = (el) => {
      if (!el) return false;
      const tag = el.tagName;
      return (
        tag === "INPUT" ||
        tag === "TEXTAREA" ||
        tag === "SELECT" ||
        el.isContentEditable === true
      );
    };
    const onKeyDown = (e) => {
      const k = e.key;
      if ((e.metaKey || e.ctrlKey) && (k === "k" || k === "K")) {
        e.preventDefault();
        setOpen((v) => {
          if (!v) restoreFocusRef.current = document.activeElement;
          return !v;
        });
        return;
      }
      if (k === "/" && !e.metaKey && !e.ctrlKey && !e.altKey) {
        if (isTypingTarget(document.activeElement)) return;
        e.preventDefault();
        setOpen((v) => {
          if (!v) restoreFocusRef.current = document.activeElement;
          return true;
        });
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  // On open, move focus into the input. On close, restore focus to wherever it
  // was. Both run from the same effect so the order is deterministic.
  useEffect(() => {
    if (open) {
      // Defer to the paint that mounts the input.
      const id = requestAnimationFrame(() => inputRef.current?.focus());
      return () => cancelAnimationFrame(id);
    }
    const prev = restoreFocusRef.current;
    restoreFocusRef.current = null;
    if (prev && typeof prev.focus === "function") prev.focus();
  }, [open]);

  // Ranked, capped results. Concepts first (the firehose's real content), then
  // nav routes. Each group keeps a flat global index so a single active cursor
  // can sweep across both.
  const needle = fold(query);
  const { conceptHits, navHits, options } = useMemo(() => {
    const cHits = concepts
      .map((c) => ({ c, rank: rankConcept(c, needle) }))
      .filter((x) => x.rank >= 0)
      .sort(
        (a, b) =>
          a.rank - b.rank ||
          (b.c.attention || 0) - (a.c.attention || 0) ||
          a.c.label.localeCompare(b.c.label)
      )
      .slice(0, CONCEPT_CAP)
      .map((x) => x.c);

    const nHits = NAV_ROUTES.map((n) => ({ n, rank: rankText(fold(n.label), needle) }))
      .filter((x) => x.rank >= 0)
      .sort((a, b) => a.rank - b.rank || a.n.label.localeCompare(b.n.label))
      .slice(0, NAV_CAP)
      .map((x) => x.n);

    // Flat option list, in the same visual order as render, for arrow nav.
    const opts = [
      ...cHits.map((c) => ({ type: "concept", id: c.id, label: c.label, data: c })),
      ...nHits.map((n) => ({ type: "nav", id: n.route, label: n.label, data: n })),
    ];
    return { conceptHits: cHits, navHits: nHits, options: opts };
  }, [concepts, needle]);

  // Keep the active cursor in range whenever the result set changes.
  useEffect(() => {
    setActive((a) => (options.length === 0 ? 0 : Math.min(a, options.length - 1)));
  }, [options.length]);

  // Keep the highlighted row scrolled into view (nearest = minimal movement).
  useEffect(() => {
    if (!open) return;
    const el = listRef.current?.querySelector(`#cp-opt-${active}`);
    if (el) el.scrollIntoView({ block: "nearest" });
  }, [active, open, options.length]);

  // True when the query exactly equals the highlighted option's label or one of
  // its aliases. An exact name match means Enter should open that row even if
  // the user never touched the arrow keys (typing the full name IS selecting).
  const activeIsExact = useMemo(() => {
    if (!needle) return false;
    const opt = options[active];
    if (!opt) return false;
    if (fold(opt.label) === needle) return true;
    if (opt.type === "concept") {
      return (opt.data.aliases || []).some((a) => fold(a) === needle);
    }
    return false;
  }, [options, active, needle]);

  const go = useCallback(
    (to) => {
      close();
      navigate(to);
    },
    [close, navigate]
  );

  const activate = useCallback(
    (opt) => {
      if (!opt) return;
      if (opt.type === "concept") go(`/technique/${opt.id}`);
      else go(opt.data.route);
    },
    [go]
  );

  // Enter with no actionable row but a non-empty query runs a full semantic
  // search on the Explore page.
  const runSearch = useCallback(() => {
    const term = query.trim();
    if (!term) return;
    go(`/explore?q=${encodeURIComponent(term)}`);
  }, [query, go]);

  const onInputKeyDown = (e) => {
    const k = e.key;
    if (k === "Escape") {
      e.preventDefault();
      close();
      return;
    }
    if (k === "ArrowDown") {
      e.preventDefault();
      if (options.length) {
        setActive((a) => (a + 1) % options.length);
        setMovedSelection(true);
      }
      return;
    }
    if (k === "ArrowUp") {
      e.preventDefault();
      if (options.length) {
        setActive((a) => (a - 1 + options.length) % options.length);
        setMovedSelection(true);
      }
      return;
    }
    if (k === "Home" && options.length) {
      e.preventDefault();
      setActive(0);
      setMovedSelection(true);
      return;
    }
    if (k === "End" && options.length) {
      e.preventDefault();
      setActive(options.length - 1);
      setMovedSelection(true);
      return;
    }
    if (k === "Enter") {
      e.preventDefault();
      const opt = options[active];
      // Open the highlighted row when the user deliberately chose it (arrows or
      // hover) or typed an exact name; otherwise a free-text query hands off to
      // a full semantic search on Explore.
      if (opt && (movedSelection || activeIsExact)) {
        activate(opt);
      } else if (query.trim()) {
        runSearch();
      } else if (opt) {
        // Empty query, untouched selection: open the first item (Home).
        activate(opt);
      }
    }
  };

  const activeId = options.length ? `cp-opt-${active}` : undefined;

  return (
    <CommandPaletteStyle>
      <button
        type="button"
        className="cp-trigger"
        onClick={() => {
          restoreFocusRef.current = document.activeElement;
          setOpen(true);
        }}
        aria-haspopup="dialog"
        aria-expanded={open}
        aria-label="Search and jump to anything"
        title="Search (Ctrl K)"
      >
        <span className="cp-trigger-icon" aria-hidden="true">⌕</span>
        <span className="cp-trigger-label">Search</span>
        <span className="cp-kbd mono" aria-hidden="true">Ctrl K</span>
      </button>

      {open && (
        <div
          className="cp-overlay"
          role="presentation"
          onMouseDown={(e) => {
            // Click on the backdrop (not the panel) closes.
            if (e.target === e.currentTarget) close();
          }}
        >
          <div
            className="cp-panel card"
            role="dialog"
            aria-modal="true"
            aria-label="Search and jump to anything"
          >
            <div className="cp-input-row">
              <span className="cp-input-icon" aria-hidden="true">⌕</span>
              <input
                ref={inputRef}
                className="cp-input"
                type="text"
                role="combobox"
                aria-expanded="true"
                aria-controls="cp-listbox"
                aria-autocomplete="list"
                aria-activedescendant={activeId}
                aria-label="Search concepts and pages"
                placeholder="Search concepts, jump to a page, or press Enter to search the corpus"
                value={query}
                onChange={(e) => {
                  setQuery(e.target.value);
                  setActive(0);
                  // A fresh keystroke resets the deliberate-selection flag, so
                  // Enter on the new query hands off to search unless the user
                  // re-navigates or types an exact name.
                  setMovedSelection(false);
                }}
                onKeyDown={onInputKeyDown}
                autoComplete="off"
                spellCheck="false"
              />
              <kbd className="cp-esc mono" aria-hidden="true">Esc</kbd>
            </div>

            <ul
              ref={listRef}
              id="cp-listbox"
              className="cp-list"
              role="listbox"
              aria-label="Results"
            >
              {conceptHits.length > 0 && (
                <li className="cp-group eyebrow" role="presentation" aria-hidden="true">
                  Concepts
                </li>
              )}
              {conceptHits.map((c, i) => {
                const idx = i; // concepts occupy the first slots
                return (
                  <Row
                    key={`c-${c.id}`}
                    idx={idx}
                    active={active === idx}
                    onActivate={() => activate(options[idx])}
                    onHover={() => { setActive(idx); setMovedSelection(true); }}
                  >
                    <span className="cp-row-label">{c.label}</span>
                    {c.def_snippet && <span className="cp-row-sub faint">{c.def_snippet}</span>}
                  </Row>
                );
              })}

              {navHits.length > 0 && (
                <li className="cp-group eyebrow" role="presentation" aria-hidden="true">
                  Go To
                </li>
              )}
              {navHits.map((n, i) => {
                const idx = conceptHits.length + i;
                return (
                  <Row
                    key={`n-${n.route}`}
                    idx={idx}
                    active={active === idx}
                    onActivate={() => activate(options[idx])}
                    onHover={() => { setActive(idx); setMovedSelection(true); }}
                  >
                    <span className="cp-row-label">{n.label}</span>
                    <span className="cp-row-route mono faint">{n.route}</span>
                  </Row>
                );
              })}

              {options.length === 0 && (
                <li className="cp-empty muted" role="presentation">
                  {query.trim()
                    ? <>No local match. Press <kbd className="cp-inline-kbd mono">Enter</kbd> to search the corpus.</>
                    : "Type to search concepts and pages."}
                </li>
              )}
            </ul>

            <div className="cp-foot faint">
              <span><kbd className="cp-inline-kbd mono">↑</kbd><kbd className="cp-inline-kbd mono">↓</kbd> to navigate</span>
              <span><kbd className="cp-inline-kbd mono">Enter</kbd> to open</span>
              <span><kbd className="cp-inline-kbd mono">Esc</kbd> to close</span>
            </div>
          </div>
        </div>
      )}
    </CommandPaletteStyle>
  );
}

// A single result row. role=option with a stable id so aria-activedescendant on
// the input can point at it. mousedown (not click) activates so the input never
// loses focus to a transient blur before navigation.
function Row({ idx, active, onActivate, onHover, children }) {
  return (
    <li
      id={`cp-opt-${idx}`}
      role="option"
      aria-selected={active}
      className={`cp-row${active ? " is-active" : ""}`}
      onMouseDown={(e) => {
        e.preventDefault();
        onActivate();
      }}
      onMouseEnter={onHover}
    >
      {children}
    </li>
  );
}

// Scoped styles, injected once. Uses the existing design tokens so the palette
// matches the site: glass-blur like .site-header, the .card surface, mono/
// eyebrow labels. Transitions are dropped under prefers-reduced-motion.
function CommandPaletteStyle({ children }) {
  return (
    <>
      <style>{CSS}</style>
      {children}
    </>
  );
}

const CSS = `
/* The header control cluster (palette trigger + theme toggle). Lives here, not
   in theme.css, because Layout mounts this component and theme.css is owned by
   another agent; keeping the rule with its markup avoids a cross-file edit. */
.header-tools { display: flex; align-items: center; gap: 10px; }
@media (max-width: 640px) { .header-tools { gap: 8px; } }

.cp-trigger {
  display: inline-flex; align-items: center; gap: 8px;
  height: 36px; padding: 0 10px 0 11px; border-radius: var(--radius-sm);
  background: var(--surface-2); border: 1px solid var(--border);
  color: var(--muted); cursor: pointer; font-family: inherit; font-size: 0.86rem;
  transition: background var(--motion-mid) var(--ease-out), border-color var(--motion-mid) var(--ease-out), color var(--motion-mid) var(--ease-out);
}
.cp-trigger:hover { background: var(--surface-3); border-color: var(--border-strong); color: var(--text); }
.cp-trigger-icon { font-size: 1.05rem; line-height: 1; }
.cp-trigger-label { font-weight: 550; }
.cp-kbd {
  border: 1px solid var(--border); border-radius: 5px; padding: 1px 6px;
  font-size: 0.66rem; color: var(--faint); background: var(--surface);
  text-transform: uppercase; letter-spacing: 0.08em; line-height: 1.4;
}
@media (max-width: 640px) {
  .cp-trigger-label, .cp-kbd { display: none; }
  .cp-trigger { padding: 0; width: 36px; justify-content: center; }
}

.cp-overlay {
  position: fixed; inset: 0; z-index: 100;
  display: flex; align-items: flex-start; justify-content: center;
  padding: clamp(40px, 12vh, 140px) 16px 16px;
  background: color-mix(in oklab, var(--bg) 55%, rgba(0,0,0,0.45));
  backdrop-filter: blur(4px);
  animation: cpFade var(--motion-fast) var(--ease-out);
}
.cp-panel {
  width: 100%; max-width: 620px; padding: 0; overflow: hidden;
  /* Glass surface echoing .site-header, raised above the wash. */
  background: color-mix(in oklab, var(--surface) 86%, transparent);
  backdrop-filter: blur(14px);
  border: 1px solid var(--border-strong);
  box-shadow: 0 18px 50px rgba(0, 0, 0, 0.45);
  animation: cpRise var(--motion-mid) var(--ease-out);
}
.cp-input-row { display: flex; align-items: center; gap: 10px; padding: 14px 14px; border-bottom: 1px solid var(--border); }
.cp-input-icon { font-size: 1.2rem; color: var(--muted); line-height: 1; }
.cp-input {
  flex: 1; background: transparent; border: 0; outline: none;
  color: var(--text); font-family: inherit; font-size: 1.02rem; padding: 2px 0;
}
.cp-input::placeholder { color: var(--faint); }
.cp-esc {
  border: 1px solid var(--border); border-radius: 5px; padding: 2px 7px;
  font-size: 0.66rem; color: var(--faint); text-transform: uppercase; letter-spacing: 0.08em;
}

.cp-list { list-style: none; margin: 0; padding: 6px; max-height: min(56vh, 460px); overflow-y: auto; }
.cp-group { padding: 10px 10px 5px; }
.cp-row {
  display: flex; flex-direction: column; gap: 2px; align-items: stretch;
  padding: 8px 10px; border-radius: var(--radius-sm); cursor: pointer;
  border: 1px solid transparent;
}
.cp-row.is-active { background: var(--accent-soft); border-color: color-mix(in oklab, var(--accent) 30%, var(--border)); }
.cp-row-label { color: var(--text); font-weight: 550; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.cp-row.is-active .cp-row-label { color: var(--text-strong); }
.cp-row-sub { font-size: 0.8rem; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.cp-row-route { font-size: 0.78rem; }
.cp-empty { padding: 18px 12px; font-size: 0.9rem; }
.cp-inline-kbd, .cp-empty kbd {
  border: 1px solid var(--border); border-radius: 4px; padding: 0 5px;
  font-size: 0.72rem; color: var(--faint); background: var(--surface-2);
}

.cp-foot {
  display: flex; gap: 16px; flex-wrap: wrap;
  padding: 9px 14px; border-top: 1px solid var(--border);
  font-size: 0.74rem;
}
.cp-foot span { display: inline-flex; align-items: center; gap: 5px; }

@keyframes cpFade { from { opacity: 0; } to { opacity: 1; } }
@keyframes cpRise { from { opacity: 0; transform: translateY(-8px); } to { opacity: 1; transform: none; } }

@media (prefers-reduced-motion: reduce) {
  .cp-overlay, .cp-panel { animation: none; }
}
`;
