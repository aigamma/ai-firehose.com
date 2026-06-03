import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import useData from "../lib/useData.js";
import useDocumentTitle from "../hooks/useDocumentTitle.js";
import { getKind } from "../data/registry.js";

// The glossary has two layers: a DURABLE knowledge base (hand-authored and
// Opus-authored foundational, advanced, and exotic concepts that persist) and the
// live TRENDING taxonomy (AI-discovered from the rolling-quarter corpus). The view
// toggle separates them; Knowledge groups by category for learning, Trending ranks
// by attention. Search spans both. Every row links to the concept hub.
export default function Glossary() {
  const { data } = useData("/data/glossary/index.json");
  const [q, setQ] = useState("");
  const [view, setView] = useState("knowledge");
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
    if (view === "knowledge") return c.durable;
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

  return (
    <div className="stack" style={{ paddingTop: 24 }}>
      <h1>Glossary</h1>
      <p className="lede muted">
        A durable knowledge base of {durableCount} authored concepts, from foundations and history to advanced
        mathematics, mechanistic interpretability, frontier architectures, and the philosophy of mind, woven into the
        live trending taxonomy by deep meshed linking. The knowledge layer sticks; the trending layer turns over each quarter.
      </p>
      <input className="search" aria-label="Search concepts and aliases" placeholder="Search concepts, aliases, and definitions..." value={q} onChange={(e) => setQ(e.target.value)} />
      <div style={{ display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
        <div className="segmented" role="group" aria-label="Choose a glossary layer">
          <button aria-pressed={view === "knowledge"} onClick={() => setView("knowledge")}>Knowledge {durableCount}</button>
          <button aria-pressed={view === "trending"} onClick={() => setView("trending")}>Trending {trendingCount}</button>
          <button aria-pressed={view === "all"} onClick={() => setView("all")}>All {all.length}</button>
        </div>
        {q && <span className="faint mono">{pool.length} shown</span>}
      </div>

      {groups ? (
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
          <div className="card"><p className="muted" style={{ margin: 0 }}>No matches.</p></div>
        )
      ) : (
        <div className="card">
          <ul className="feed">
            {flat.map((c) => <Row key={c.id} c={c} />)}
            {!flat.length && <li className="muted">No matches.</li>}
          </ul>
        </div>
      )}
    </div>
  );
}
