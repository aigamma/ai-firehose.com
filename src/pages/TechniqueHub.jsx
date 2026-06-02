import { Link, useParams } from "react-router-dom";
import useData from "../lib/useData.js";
import useDocumentTitle from "../hooks/useDocumentTitle.js";
import { getKind } from "../data/registry.js";

export default function TechniqueHub() {
  const { slug } = useParams();
  const { data: c, loading } = useData(`/data/glossary/c/${slug}.json`);
  useDocumentTitle(c?.label || "Technique");

  if (loading) return <div className="stack" style={{ paddingTop: 40 }}><h1>Loading…</h1></div>;
  if (!c) {
    return (
      <div className="stack" style={{ paddingTop: 40 }}>
        <h1>Unknown concept</h1>
        <p className="muted">
          Back to the <Link to="/glossary">glossary</Link>.
        </p>
      </div>
    );
  }

  const k = getKind(c.kind);
  return (
    <div className="stack" style={{ paddingTop: 24 }}>
      <h1>{c.label}</h1>
      <div style={{ display: "flex", gap: 10, alignItems: "center", flexWrap: "wrap" }}>
        {k && (
          <span className={`badge ${k.badgeClass}`}>
            <span className="dot" style={{ background: `var(${k.accentVar})` }} />
            {k.singular}
          </span>
        )}
        <span className="faint mono">attention {c.attention}</span>
        {c.aliases?.length > 0 && <span className="faint">also: {c.aliases.join(", ")}</span>}
      </div>

      {c.definition && <p className="lede">{c.definition}</p>}

      <div className="grid cols-2">
        <section className="card">
          <div className="card-head"><h2>Where It Sits</h2></div>
          {c.axis_positions?.length ? (
            c.axis_positions.map((a) => (
              <div key={a.slug} className="axis-row">
                <div className="faint">{a.title}</div>
                <div className="spectrum-track mini">
                  <span className="spectrum-dot" style={{ left: `${((a.position + 1) / 2) * 100}%` }} />
                </div>
              </div>
            ))
          ) : (
            <p className="muted">No axis data.</p>
          )}
        </section>
        <section className="card">
          <div className="card-head"><h2>Neighbors</h2></div>
          {c.neighbors?.length ? (
            <ul className="feed">
              {c.neighbors.map((n) => (
                <li key={n.id}>
                  <span className="lead-label"><Link to={`/technique/${n.id}`}>{n.label}</Link></span>
                  <span className="faint mono">{n.score}</span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="muted">None yet.</p>
          )}
        </section>
      </div>

      <section className="card">
        <div className="card-head"><h2>Recent Items</h2></div>
        {c.top_items?.length ? (
          <ul className="feed">
            {c.top_items.map((it, i) => {
              const ik = getKind(it.kind);
              return (
                <li key={i}>
                  {ik && <span className={`badge ${ik.badgeClass}`}>{ik.singular}</span>}
                  <span className="lead-label">
                    <a href={it.url} target="_blank" rel="noreferrer">{it.title}</a>
                  </span>
                  <span className="faint mono">{it.author_or_channel}</span>
                </li>
              );
            })}
          </ul>
        ) : (
          <p className="muted">No items in the window.</p>
        )}
      </section>

      <p><Link to="/glossary">← Glossary</Link></p>
    </div>
  );
}
