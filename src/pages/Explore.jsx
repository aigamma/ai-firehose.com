import { useState } from "react";
import { Link } from "react-router-dom";
import useData from "../lib/useData.js";
import SemanticSearch from "../components/SemanticSearch.jsx";
import useDocumentTitle from "../hooks/useDocumentTitle.js";
import { KINDS } from "../data/registry.js";

// A distinct load-failure notice, visually separate from the dashed ".empty"
// awaiting-ingestion box, so a real error is never read as "no data yet".
function LoadError({ label }) {
  return (
    <div
      role="alert"
      style={{
        border: "1px solid var(--q-lagging)",
        borderLeftWidth: 3,
        borderRadius: "var(--radius)",
        padding: 16,
        color: "var(--muted)",
        background: "color-mix(in oklab, var(--q-lagging) 8%, transparent)",
      }}
    >
      <strong style={{ display: "block", marginBottom: 4, color: "var(--text)" }}>{label}</strong>
      Unable to load. Retry shortly.
    </div>
  );
}

function SpectrumView({ axis }) {
  const pts = axis.positions || [];
  return (
    <div>
      <div className="spectrum-poles">
        <span>{axis.pole_b}</span>
        <span>{axis.pole_a}</span>
      </div>
      <div className="spectrum-track">
        {pts.map((p) => (
          <Link
            key={p.id}
            to={`/technique/${p.id}`}
            className="spectrum-dot"
            title={`${p.label} (${p.position_normalized})`}
            aria-label={`${p.label} (${p.position_normalized})`}
            style={{ left: `${((p.position_normalized + 1) / 2) * 100}%` }}
          />
        ))}
      </div>
      <div className="spectrum-ends">
        <div>
          <strong>{axis.pole_b}</strong>
          <div className="faint">{pts.slice(-5).reverse().map((p) => p.label).join(", ")}</div>
        </div>
        <div style={{ textAlign: "right" }}>
          <strong>{axis.pole_a}</strong>
          <div className="faint">{pts.slice(0, 5).map((p) => p.label).join(", ")}</div>
        </div>
      </div>
    </div>
  );
}

export default function Explore() {
  const { data: clustersD, loading: clustersLoading, error: clustersError } = useData("/data/clusters.json");
  const { data: spectrumsD, loading: spectrumsLoading, error: spectrumsError } = useData("/data/spectrums.json");
  const { data: influenceD, loading: influenceLoading, error: influenceError } = useData("/data/influence.json");
  const { data: stats } = useData("/data/stats.json");
  useDocumentTitle("Explore");
  const axes = spectrumsD?.axes || [];
  const [axisSlug, setAxisSlug] = useState(null);
  const axis = axes.find((a) => a.slug === axisSlug) || axes[0];
  const nodeLabel = (id) => (influenceD?.nodes || []).find((n) => n.id === id)?.label || id;

  return (
    <div className="stack" style={{ paddingTop: 24 }}>
      <h1>Explore</h1>
      <p className="lede muted">
        The shape of the conversation: the themes it clusters into, where ideas sit on the axes of AI discourse, and which ideas travel together.
      </p>

      {stats && (
        <div className="muted" style={{ display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
          <span>{stats.total_items} items, {stats.concepts} concepts, updated {stats.generated}</span>
          <span className="kindbar" style={{ width: 160 }}>
            {KINDS.map((k) => {
              const total = Object.values(stats.by_kind || {}).reduce((a, b) => a + b, 0) || 1;
              const n = stats.by_kind?.[k.key] || 0;
              return <span key={k.key} title={`${k.label} ${n}`} style={{ width: `${(n / total) * 100}%`, background: `var(${k.accentVar})` }} />;
            })}
          </span>
        </div>
      )}

      <section className="card">
        <div className="card-head">
          <h2>Semantic Search</h2>
          <span className="faint mono" style={{ marginLeft: "auto" }}>Pinecone + Voyage rerank</span>
        </div>
        <SemanticSearch />
      </section>

      <section className="card">
        <div className="card-head">
          <h2>Themes</h2>
          <span className="eyebrow" style={{ marginLeft: "auto" }}>k-means clusters</span>
        </div>
        {clustersError ? (
          <LoadError label="Themes" />
        ) : clustersD?.clusters?.length ? (
          <div className="grid cols-2">
            {clustersD.clusters.map((c) => (
              <div key={c.cluster_id} className="theme">
                <div className="theme-label">{c.label}</div>
                <div className="chips">
                  {c.members.slice(0, 8).map((m) => (
                    <Link key={m.id} className="chip" to={`/technique/${m.id}`}>
                      {m.label}
                    </Link>
                  ))}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="empty"><strong>Themes</strong>{clustersLoading ? "Loading…" : "Awaiting ingestion."}</div>
        )}
      </section>

      <section className="card">
        <div className="card-head">
          <h2>Concept Spectrums</h2>
          {axes.length > 0 && (
            <select className="select" aria-label="Select a discourse axis" value={axis?.slug} onChange={(e) => setAxisSlug(e.target.value)} style={{ marginLeft: "auto" }}>
              {axes.map((a) => (
                <option key={a.slug} value={a.slug}>{a.title}</option>
              ))}
            </select>
          )}
        </div>
        {spectrumsError ? (
          <LoadError label="Spectrums" />
        ) : axis ? (
          <SpectrumView axis={axis} />
        ) : (
          <div className="empty"><strong>Spectrums</strong>{spectrumsLoading ? "Loading…" : "Awaiting ingestion."}</div>
        )}
      </section>

      <section className="card">
        <div className="card-head">
          <h2>Strongest Connections</h2>
          <span className="eyebrow" style={{ marginLeft: "auto" }}>co-mention</span>
        </div>
        {influenceError ? (
          <LoadError label="Connections" />
        ) : influenceD?.edges?.length ? (
          <ul className="feed">
            {influenceD.edges.slice(0, 12).map((e, i) => (
              <li key={i}>
                <span className="lead-label">
                  <Link to={`/technique/${e.from}`}>{nodeLabel(e.from)}</Link>
                  <span className="faint"> and </span>
                  <Link to={`/technique/${e.to}`}>{nodeLabel(e.to)}</Link>
                </span>
                <span className="faint mono">x{e.count}</span>
              </li>
            ))}
          </ul>
        ) : (
          <div className="empty"><strong>Connections</strong>{influenceLoading ? "Loading…" : "Not enough co-mentions yet."}</div>
        )}
      </section>
    </div>
  );
}
