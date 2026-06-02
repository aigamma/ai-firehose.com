import { useState } from "react";
import { Link } from "react-router-dom";
import useData from "../lib/useData.js";
import useDocumentTitle from "../hooks/useDocumentTitle.js";
import { getKind, KINDS } from "../data/registry.js";

export default function Glossary() {
  const { data } = useData("/data/glossary/index.json");
  const [q, setQ] = useState("");
  const [kind, setKind] = useState("");
  useDocumentTitle("Glossary");
  const all = data?.concepts || [];
  const concepts = all.filter((c) => {
    if (kind && c.kind !== kind) return false;
    if (!q) return true;
    const s = q.toLowerCase();
    return c.label.toLowerCase().includes(s) || (c.aliases || []).some((a) => a.toLowerCase().includes(s));
  });
  const counts = {};
  for (const c of all) counts[c.kind] = (counts[c.kind] || 0) + 1;

  return (
    <div className="stack" style={{ paddingTop: 24 }}>
      <h1>Glossary of Techniques</h1>
      <p className="lede muted">
        {data?.count || 0} concepts, AI-discovered and self-organizing. Near-duplicate names are merged; each links to its hub.
      </p>
      <input className="search" aria-label="Search concepts and aliases" placeholder="Search concepts and aliases..." value={q} onChange={(e) => setQ(e.target.value)} />
      <div style={{ display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
        <div className="segmented" role="group" aria-label="Filter by kind">
          <button aria-pressed={kind === ""} onClick={() => setKind("")}>All {all.length}</button>
          {KINDS.map((k) => (
            <button key={k.key} aria-pressed={kind === k.key} onClick={() => setKind(k.key)}>
              {k.label} {counts[k.key] || 0}
            </button>
          ))}
        </div>
        {(q || kind) && <span className="faint mono">{concepts.length} shown</span>}
      </div>
      <div className="card">
        <ul className="feed">
          {concepts.map((c) => {
            const k = getKind(c.kind);
            return (
              <li key={c.id} className="gloss-row">
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
                  <span className="faint mono">att {c.attention}</span>
                </div>
                {c.def_snippet && <div className="faint gloss-def">{c.def_snippet}</div>}
              </li>
            );
          })}
          {!concepts.length && <li className="muted">No matches.</li>}
        </ul>
      </div>
    </div>
  );
}
