import { useMemo } from "react";
import { Link } from "react-router-dom";
import useData from "../lib/useData.js";
import useDocumentTitle from "../hooks/useDocumentTitle.js";
import { getKind } from "../data/registry.js";

// Learn: curated paths through the durable glossary, ordered sequences that scaffold an
// area of AI from the ground up. Reads the authored learning-paths.json and the glossary
// index; each step links to its concept hub. The "teach AI" layer over the knowledge
// base. The check_glossary gate validates that every path step resolves to a real hub.
export default function Learn() {
  useDocumentTitle("Learn");
  const { data: pathsData, loading, error } = useData("/data/learning-paths.json");
  const { data: index } = useData("/data/glossary/index.json");

  const bySlug = useMemo(() => {
    const m = new Map();
    for (const c of index?.concepts || []) m.set(c.id, c);
    return m;
  }, [index]);

  const paths = pathsData?.paths || [];

  return (
    <div className="stack" style={{ paddingTop: 24, maxWidth: "82ch" }}>
      <header>
        <p className="eyebrow">Learn</p>
        <h1>Learning Paths</h1>
        <p className="muted">
          Curated routes through the knowledge base. Each path is an ordered sequence of concepts that
          builds an area of AI from the ground up. Follow one end to end, or jump straight to any
          concept's hub.
        </p>
      </header>

      {error ? (
        <div className="card" role="alert">
          <strong style={{ display: "block", marginBottom: 4 }}>Unable to load the learning paths.</strong>
          <span className="muted">Retry shortly.</span>
        </div>
      ) : !paths.length ? (
        <div className="empty">
          <strong>{loading ? "Loading paths" : "No paths yet"}</strong>
          {loading ? "One moment." : "Awaiting content."}
        </div>
      ) : (
        paths.map((p) => (
          <section className="card" key={p.slug}>
            <div className="card-head">
              <h2>{p.title}</h2>
              <span className="faint mono" style={{ marginLeft: "auto" }}>{p.steps.length} steps</span>
            </div>
            {p.blurb && <p className="muted" style={{ margin: "0 0 14px", maxWidth: "74ch" }}>{p.blurb}</p>}
            <ol style={{ listStyle: "none", margin: 0, padding: 0, display: "flex", flexDirection: "column", gap: 0 }}>
              {p.steps.map((slug, i) => {
                const c = bySlug.get(slug);
                const km = c ? getKind(c.kind) : null;
                return (
                  <li
                    key={slug}
                    style={{
                      display: "flex",
                      gap: 12,
                      alignItems: "baseline",
                      padding: "9px 0",
                      borderTop: i === 0 ? "none" : "1px solid var(--border)",
                    }}
                  >
                    <span className="faint mono" style={{ minWidth: "1.4rem", textAlign: "right" }}>{i + 1}</span>
                    <div style={{ minWidth: 0 }}>
                      <span style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
                        <Link to={`/technique/${slug}`} style={{ color: "var(--text)", fontWeight: 600 }}>
                          {c?.label || slug}
                        </Link>
                        {km && (
                          <span className={`badge ${km.badgeClass}`}>
                            <span className="dot" style={{ background: "currentColor" }} />
                            {km.singular}
                          </span>
                        )}
                      </span>
                      {c?.def_snippet && (
                        <p className="muted" style={{ margin: "3px 0 0", fontSize: "0.88rem", lineHeight: 1.5 }}>
                          {c.def_snippet}
                        </p>
                      )}
                    </div>
                  </li>
                );
              })}
            </ol>
          </section>
        ))
      )}
    </div>
  );
}
