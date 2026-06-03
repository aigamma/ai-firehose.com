import { Link, useParams } from "react-router-dom";
import useData from "../lib/useData.js";
import useDocumentTitle from "../hooks/useDocumentTitle.js";
import Sparkline from "../components/Sparkline.jsx";
import RichText from "../components/RichText.jsx";
import { getKind, QUADRANTS } from "../data/registry.js";

// A concept hub. Durable authored entries lead with a rich, wiki-linked body and a
// curated Related mesh; corpus-derived signal (momentum, neighbors, recent items)
// renders only when the concept has it, so a purely-authored entry is never padded
// with empty boxes. A concept can be both: authored knowledge plus live trending data.
export default function TechniqueHub() {
  const { slug } = useParams();
  const { data: c, loading } = useData(`/data/glossary/c/${slug}.json`);
  useDocumentTitle(c?.label || "Concept");

  if (loading) return <div className="stack" style={{ paddingTop: 40 }}><h1>Loading…</h1></div>;
  if (!c) {
    return (
      <div className="stack" style={{ paddingTop: 40 }}>
        <h1>Unknown concept</h1>
        <p className="muted">Back to the <Link to="/glossary">glossary</Link>.</p>
      </div>
    );
  }

  const k = getKind(c.kind);
  const hasSidecards = c.axis_positions?.length || c.neighbors?.length;
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
        {c.durable && <span className="badge durable-badge" title="A durable knowledge entry; it persists while trending items expire">Knowledge</span>}
        {c.category && <span className="faint mono">{c.category}</span>}
        {c.attention > 0 && <span className="faint mono">attention {c.attention}</span>}
        {c.aliases?.length > 0 && <span className="faint">also: {c.aliases.join(", ")}</span>}
      </div>

      {c.definition && <p className="lede">{c.definition}</p>}

      {c.body?.length > 0 && <RichText blocks={c.body} currentSlug={slug} className="prose" />}

      {c.related?.length > 0 && (
        <div className="related-mesh">
          <span className="eyebrow">Related</span>
          <div className="chips">
            {c.related.map((r) => (
              <Link key={r.slug} to={`/technique/${r.slug}`} className="chip">{r.label}</Link>
            ))}
          </div>
        </div>
      )}

      {c.rotation && (
        <section className="card">
          <div className="card-head">
            <h2>Momentum</h2>
            <span className="faint mono" style={{ marginLeft: "auto" }}>past {c.rotation.horizon}</span>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 16, flexWrap: "wrap" }}>
            <span className="badge" title={QUADRANTS[c.rotation.quadrant]?.note}>
              <span className="dot" style={{ background: `var(${QUADRANTS[c.rotation.quadrant]?.colorVar})` }} />
              {QUADRANTS[c.rotation.quadrant]?.label}
            </span>
            <Sparkline values={c.rotation.sparkline} width={120} height={32} stroke={`var(${QUADRANTS[c.rotation.quadrant]?.colorVar})`} />
            <span className="faint mono">ratio {c.rotation.ratio} · momentum {c.rotation.momentum}</span>
          </div>
        </section>
      )}

      {hasSidecards ? (
        <div className="grid cols-2">
          {c.axis_positions?.length ? (
            <section className="card">
              <div className="card-head"><h2>Where It Sits</h2></div>
              {c.axis_positions.map((a) => (
                <div key={a.slug} className="axis-row">
                  <div className="faint">{a.title}</div>
                  <div className="spectrum-track mini">
                    <span className="spectrum-dot" style={{ left: `${((a.position + 1) / 2) * 100}%` }} />
                  </div>
                </div>
              ))}
            </section>
          ) : null}
          {c.neighbors?.length ? (
            <section className="card">
              <div className="card-head"><h2>Neighbors</h2></div>
              <ul className="feed">
                {c.neighbors.map((n) => (
                  <li key={n.id}>
                    <span className="lead-label"><Link to={`/technique/${n.id}`}>{n.label}</Link></span>
                    <span className="faint mono">{n.score}</span>
                  </li>
                ))}
              </ul>
            </section>
          ) : null}
        </div>
      ) : null}

      {c.top_items?.length > 0 && (
        <section className="card">
          <div className="card-head"><h2>Recent Items</h2></div>
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
        </section>
      )}

      <p><Link to="/glossary">← Glossary</Link></p>
    </div>
  );
}
