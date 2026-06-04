import { Link, useParams } from "react-router-dom";
import useData from "../lib/useData.js";
import LoadError from "../components/LoadError.jsx";
import useDocumentTitle from "../hooks/useDocumentTitle.js";
import Sparkline from "../components/Sparkline.jsx";
import RichText from "../components/RichText.jsx";
import { getKind, quadrantOf } from "../data/registry.js";

// A concept hub. Durable authored entries lead with a rich, wiki-linked body and a
// curated Related mesh; corpus-derived signal (momentum, neighbors, recent items)
// renders only when the concept has it, so a purely-authored entry is never padded
// with empty boxes. A concept can be both: authored knowledge plus live trending data.
export default function TechniqueHub() {
  const { slug } = useParams();
  const { data: c, loading, error } = useData(`/data/glossary/c/${slug}.json`);
  useDocumentTitle(c?.label || "Concept");

  if (loading) return <div className="stack" style={{ paddingTop: 40 }}><h1>Loading…</h1></div>;
  // A transient network error on a valid slug must not claim the concept does not
  // exist. Surface the failure distinctly, and reserve "Unknown concept" for the
  // genuine resolved-but-not-found case (useData reports a missing hub as c === null
  // with no error).
  if (error) {
    return (
      <div className="stack" style={{ paddingTop: 40 }}>
        <h1>Concept</h1>
        <LoadError label="Concept" />
        <p className="muted">Back to the <Link to="/glossary">glossary</Link>.</p>
      </div>
    );
  }
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
    <div className="stack" style={{ paddingTop: 24, "--tile-accent": k ? `var(${k.accentVar})` : "var(--accent)" }}>
      <h1 className="hub-title">{c.label}</h1>
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

      {c.definition && <p className="hub-def">{c.definition}</p>}

      {c.image?.url && (
        <figure className="hub-figure">
          <img src={c.image.url} alt={c.image.alt || c.label} loading="lazy" />
          <figcaption className="faint">
            {c.image.alt ? `${c.image.alt}. ` : ""}
            <a href={c.image.source} target="_blank" rel="noreferrer">{c.image.credit || "Source"}</a>
          </figcaption>
        </figure>
      )}

      {c.body?.length > 0 && <RichText blocks={c.body} currentSlug={slug} className="prose" />}

      {c.related?.length > 0 && (
        <div className="related-mesh">
          <span className="eyebrow">Related</span>
          <div className="chips">
            {c.related.map((r) => (
              <Link key={r.slug} to={`/technique/${r.slug}`} className={`chip chip-${r.kind || "default"}`}>{r.label}</Link>
            ))}
          </div>
        </div>
      )}

      {c.rotation && (() => {
        const quad = quadrantOf(c.rotation.quadrant);
        return (
        <section className="card">
          <div className="card-head">
            <h2>Momentum</h2>
            <span className="faint mono" style={{ marginLeft: "auto" }}>past {c.rotation.horizon}</span>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 16, flexWrap: "wrap" }}>
            <span className="badge" title={quad.note}>
              <span className="dot" style={{ background: `var(${quad.colorVar})` }} />
              {quad.label}
            </span>
            <Sparkline values={c.rotation.sparkline} width={120} height={32} stroke={`var(${quad.colorVar})`} />
            <span className="faint mono">ratio {c.rotation.ratio} · momentum {c.rotation.momentum}</span>
          </div>
        </section>
        );
      })()}

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
