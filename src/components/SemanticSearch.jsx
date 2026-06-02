import { useState } from "react";
import { getKind, KINDS } from "../data/registry.js";

// Live semantic search over the corpus. Calls /api/retrieve (the Netlify
// function). In plain `npm run dev` there is no function, so it fails gracefully.
export default function SemanticSearch() {
  const [q, setQ] = useState("");
  const [kind, setKind] = useState("");
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState(null);

  const run = async (e) => {
    e?.preventDefault();
    if (!q.trim()) return;
    setLoading(true);
    setErr(null);
    try {
      const r = await fetch(`/api/retrieve?q=${encodeURIComponent(q)}${kind ? `&kind=${kind}` : ""}`);
      if (!r.ok) throw new Error(`search unavailable (HTTP ${r.status})`);
      const j = await r.json();
      setResults(j.results || []);
    } catch (e2) {
      setErr(e2.message);
      setResults(null);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <form onSubmit={run} style={{ display: "flex", gap: 8 }}>
        <input
          className="search"
          placeholder="Search the corpus by meaning, for example: agents that browse the web"
          value={q}
          onChange={(e) => setQ(e.target.value)}
        />
        <select className="select" value={kind} onChange={(e) => setKind(e.target.value)} aria-label="Filter by kind">
          <option value="">All</option>
          {KINDS.map((k) => (
            <option key={k.key} value={k.key}>{k.label}</option>
          ))}
        </select>
        <button className="btn" type="submit">Search</button>
      </form>
      {loading && <p className="muted" style={{ marginTop: 10 }}>Searching…</p>}
      {err && (
        <p className="faint" style={{ marginTop: 10 }}>
          {err}. Live search runs on the deployed site or via netlify dev.
        </p>
      )}
      {results && (
        <ul className="feed" style={{ marginTop: 10 }}>
          {results.map((x, i) => {
            const k = getKind(x.kind);
            return (
              <li key={i} className="feed-rich">
                <div className="feed-head">
                  {k && <span className={`badge ${k.badgeClass}`}>{k.singular}</span>}
                  <span className="lead-label">
                    <a href={x.url} target="_blank" rel="noreferrer">{x.title}</a>
                  </span>
                  <span className="faint mono">{x.score}</span>
                </div>
                {x.summary && <div className="faint gloss-def">{x.summary}</div>}
              </li>
            );
          })}
          {!results.length && <li className="muted">No matches.</li>}
        </ul>
      )}
    </div>
  );
}
