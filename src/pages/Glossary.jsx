import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import useData from "../lib/useData.js";
import LoadError from "../components/LoadError.jsx";
import useDocumentTitle from "../hooks/useDocumentTitle.js";
import { getKind } from "../data/registry.js";

// The glossary has two layers: a DURABLE knowledge base (hand-authored and
// Opus-authored foundational, advanced, and exotic concepts that persist) and the
// live TRENDING taxonomy (AI-discovered from the rolling-quarter corpus). The view
// toggle separates them; Knowledge groups by category for learning, Trending ranks
// by attention, Atlas maps the whole field as a category constellation. Search spans
// the list views. Every row links to the concept hub.
export default function Glossary() {
  const { data, loading, error } = useData("/data/glossary/index.json");
  const { data: atlas, error: atlasError } = useData("/data/glossary/atlas.json");
  const [q, setQ] = useState("");
  const [view, setView] = useState("knowledge");
  const [catFilter, setCatFilter] = useState(null);
  useDocumentTitle("Glossary");

  const all = data?.concepts || [];
  const durableCount = useMemo(() => all.filter((c) => c.durable).length, [all]);
  const trendingCount = all.length - durableCount;

  const matches = (c) => {
    if (!q) return true;
    const s = q.toLowerCase();
    return c.label.toLowerCase().includes(s) || (c.aliases || []).some((a) => a.toLowerCase().includes(s)) || (c.def_snippet || "").toLowerCase().includes(s);
  };

  const pool = all.filter(matches).filter((c) => {
    if (view === "knowledge") return c.durable && (!catFilter || c.category === catFilter);
    if (view === "trending") return !c.durable || c.attention > 0;
    return true;
  });

  // Knowledge view groups by category; the others are a flat list (trending by
  // attention, all alphabetical, the order the index is already sorted in).
  const groups = useMemo(() => {
    if (view !== "knowledge") return null;
    const byCat = new Map();
    for (const c of pool) {
      const cat = c.category || "Other";
      if (!byCat.has(cat)) byCat.set(cat, []);
      byCat.get(cat).push(c);
    }
    return [...byCat.entries()].sort((a, b) => a[0].localeCompare(b[0]));
  }, [pool, view]);

  const flat = view === "trending" ? [...pool].sort((a, b) => (b.attention || 0) - (a.attention || 0)) : pool;

  // Jump from the atlas into the focused Knowledge list for one category.
  const pickCategory = (name) => {
    setCatFilter(name);
    setQ("");
    setView("knowledge");
  };

  const Row = ({ c }) => {
    const k = getKind(c.kind);
    return (
      <li className="gloss-row">
        <div className="gloss-head">
          {k && (
            <span className={`badge ${k.badgeClass}`}>
              <span className="dot" style={{ background: `var(${k.accentVar})` }} />
              {k.singular}
            </span>
          )}
          <span className="lead-label">
            <Link to={`/technique/${c.id}`}>{c.label}</Link>
            {c.aliases?.length ? <span className="faint mono"> +{c.aliases.length}</span> : null}
          </span>
          {c.durable ? <span className="faint mono">{c.category}</span> : <span className="faint mono">att {c.attention}</span>}
        </div>
        {c.def_snippet && <div className="faint gloss-def">{c.def_snippet}</div>}
      </li>
    );
  };

  // A genuine fetch error for the index (not a missing artifact, which useData
  // reports as data === null) must not render as "0 authored concepts". Surface it
  // honestly and stop, so the counts and "No matches" never masquerade as real.
  if (error) {
    return (
      <div className="stack" style={{ paddingTop: 24 }}>
        <h1>Glossary</h1>
        <LoadError label="Glossary" />
      </div>
    );
  }

  return (
    <div className="stack" style={{ paddingTop: 24 }}>
      <h1>Glossary</h1>
      <p className="lede muted">
        A durable knowledge base of {durableCount} authored concepts, from foundations and history to advanced
        mathematics, mechanistic interpretability, frontier architectures, and the philosophy of mind, woven into the
        live trending taxonomy by deep meshed linking. The knowledge layer sticks; the trending layer turns over each quarter.
      </p>
      {view !== "atlas" && (
        <input className="search" aria-label="Search concepts and aliases" placeholder="Search concepts, aliases, and definitions..." value={q} onChange={(e) => setQ(e.target.value)} />
      )}
      <div style={{ display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
        <div className="segmented" role="group" aria-label="Choose a glossary view">
          <button aria-pressed={view === "knowledge"} onClick={() => setView("knowledge")}>Knowledge {durableCount}</button>
          <button aria-pressed={view === "trending"} onClick={() => setView("trending")}>Trending {trendingCount}</button>
          <button aria-pressed={view === "all"} onClick={() => setView("all")}>All {all.length}</button>
          <button aria-pressed={view === "atlas"} onClick={() => setView("atlas")}>Atlas</button>
        </div>
        {view !== "atlas" && q && <span className="faint mono">{pool.length} shown</span>}
        {view === "knowledge" && catFilter && (
          <button className="chip-clear" onClick={() => setCatFilter(null)} aria-label={`Clear the ${catFilter} filter`}>
            {catFilter} <span aria-hidden="true">x</span>
          </button>
        )}
      </div>

      {view === "atlas" ? (
        <Atlas atlas={atlas} atlasError={atlasError} onPick={pickCategory} />
      ) : groups ? (
        groups.length ? (
          groups.map(([cat, items]) => (
            <section key={cat} className="card">
              <div className="card-head">
                <h2>{cat}</h2>
                <span className="faint mono" style={{ marginLeft: "auto" }}>{items.length}</span>
              </div>
              <ul className="feed">
                {items.map((c) => <Row key={c.id} c={c} />)}
              </ul>
            </section>
          ))
        ) : (
          <div className="card"><p className="muted" style={{ margin: 0 }}>{loading ? "Loading…" : "No matches."}</p></div>
        )
      ) : (
        <div className="card">
          <ul className="feed">
            {flat.map((c) => <Row key={c.id} c={c} />)}
            {!flat.length && <li className="muted">{loading ? "Loading…" : "No matches."}</li>}
          </ul>
        </div>
      )}
    </div>
  );
}

// The Atlas view: a category constellation. Each of the ~31 knowledge categories is a
// node placed on a ring (deterministic positions precomputed in atlas.json), sized by
// concept count and colored by a stable hue. Curved edges, weighted by the count of
// cross-category `related` links, show how the field connects. The SVG is the visual;
// the legend below is the readable, keyboard-accessible, clickable index, hovering or
// clicking either side cross-highlights, and a click drops into that category's list.
function Atlas({ atlas, atlasError, onPick }) {
  const [hover, setHover] = useState(null);

  // Degrade gracefully on an atlas-only error: the rest of the Glossary still
  // works, so surface a small notice here instead of a perpetual "Mapping..." or
  // a blanked page.
  if (atlasError) return <LoadError label="Knowledge Atlas" />;
  if (!atlas) return <div className="card"><p className="muted" style={{ margin: 0 }}>Mapping the knowledge base...</p></div>;

  const W = 900;
  const C = W / 2;
  const RAD = 330;
  const cats = atlas.categories || [];
  const edges = atlas.edges || [];
  const maxW = atlas.maxEdgeWeight || 1;
  const byName = new Map(cats.map((c) => [c.name, c]));
  const px = (c) => ({ x: C + c.x * RAD, y: C + c.y * RAD, r: Math.max(14, c.r * 330) });
  const touches = (e, name) => e.a === name || e.b === name;
  const hot = hover; // currently highlighted category name
  const active = hot ? byName.get(hot) : null;
  const legend = [...cats].sort((a, b) => a.name.localeCompare(b.name));

  return (
    <div className="atlas-wrap">
      <svg
        className="atlas-svg"
        viewBox={`0 0 ${W} ${W}`}
        role="img"
        aria-label={`Knowledge atlas: ${atlas.categoryCount} categories connected by ${edges.length} cross-category links`}
      >
        <g className="atlas-edges" fill="none">
          {edges.map((e, i) => {
            const a = byName.get(e.a);
            const b = byName.get(e.b);
            if (!a || !b) return null;
            const pa = px(a);
            const pb = px(b);
            // Control point bowed toward the center for a clean arc instead of a chord.
            const mx = (pa.x + pb.x) / 2;
            const my = (pa.y + pb.y) / 2;
            const k = 0.45;
            const qx = C + (mx - C) * k;
            const qy = C + (my - C) * k;
            const lit = hot && touches(e, hot);
            const dim = hot && !lit;
            const base = e.weight / maxW;
            return (
              <path
                key={i}
                d={`M ${pa.x} ${pa.y} Q ${qx} ${qy} ${pb.x} ${pb.y}`}
                stroke={lit ? "var(--accent)" : "var(--text)"}
                strokeWidth={0.6 + 3 * base}
                strokeOpacity={dim ? 0.04 : lit ? 0.55 : 0.05 + 0.4 * base}
              />
            );
          })}
        </g>
        <g className="atlas-nodes">
          {cats.map((c) => {
            const p = px(c);
            const lit = !hot || hot === c.name || edges.some((e) => touches(e, hot) && touches(e, c.name));
            return (
              <circle
                key={c.name}
                cx={p.x}
                cy={p.y}
                r={p.r}
                fill={`hsl(${c.hue} 60% 56%)`}
                fillOpacity={lit ? 0.92 : 0.22}
                stroke={hot === c.name ? "var(--text-strong)" : "var(--bg)"}
                strokeWidth={hot === c.name ? 3 : 1.5}
                style={{ cursor: "pointer" }}
                onMouseEnter={() => setHover(c.name)}
                onMouseLeave={() => setHover(null)}
                onClick={() => onPick(c.name)}
              >
                <title>{`${c.name}: ${c.count} concepts`}</title>
              </circle>
            );
          })}
        </g>
      </svg>

      <div className="atlas-caption faint mono" aria-live="polite">
        {active ? (
          <span>
            <strong style={{ color: "var(--text-strong)" }}>{active.name}</strong> &middot; {active.count} concepts &middot; {active.internalLinks} internal links
            {active.top?.length ? <> &middot; {active.top.map((t) => t.label).join(", ")}</> : null}
          </span>
        ) : (
          <span>{atlas.categoryCount} categories, {atlas.crossLinks} cross-category links. Hover a node, click to open its concepts.</span>
        )}
      </div>

      <div className="atlas-legend" role="list" aria-label="Knowledge categories">
        {legend.map((c) => (
          <button
            key={c.name}
            type="button"
            role="listitem"
            className={`atlas-chip${hot === c.name ? " is-on" : ""}`}
            onMouseEnter={() => setHover(c.name)}
            onMouseLeave={() => setHover(null)}
            onFocus={() => setHover(c.name)}
            onBlur={() => setHover(null)}
            onClick={() => onPick(c.name)}
          >
            <span className="swatch" style={{ background: `hsl(${c.hue} 60% 56%)` }} aria-hidden="true" />
            {c.name}
            <span className="faint mono">{c.count}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
