import { useState } from "react";
import HorizonSwitch from "../components/HorizonSwitch.jsx";
import useData from "../lib/useData.js";
import { SITE, KINDS, QUADRANTS, DEFAULT_HORIZON, getHorizon } from "../data/registry.js";

function QuadrantLegend() {
  return (
    <div style={{ display: "flex", gap: 14, flexWrap: "wrap" }}>
      {Object.values(QUADRANTS).map((q) => (
        <span key={q.key} className="badge" title={q.note}>
          <span className="dot" style={{ background: `var(${q.colorVar})` }} />
          {q.label}
        </span>
      ))}
    </div>
  );
}

function EmptyBoard({ label }) {
  return (
    <div className="empty">
      <strong>{label}</strong>
      Awaiting the first ingestion run. Start the Fly worker to populate this board.
    </div>
  );
}

export default function Home() {
  const [horizon, setHorizon] = useState(DEFAULT_HORIZON);
  const h = getHorizon(horizon);
  const { data: digest, loading } = useData(`/data/digests/${horizon}.json`);
  const hasData = digest && !loading;

  return (
    <div className="stack">
      <section className="hero">
        <h1>{SITE.tagline}</h1>
        <p className="lede">{SITE.description}</p>
      </section>

      <div style={{ display: "flex", alignItems: "center", gap: 16, flexWrap: "wrap" }}>
        <HorizonSwitch value={horizon} onChange={setHorizon} />
        <span className="muted">
          What is new in the past <strong>{h.label.toLowerCase()}</strong>.
        </span>
      </div>

      <section className="card">
        <div className="card-head">
          <h2>Relative Rotation</h2>
          <span className="faint mono" style={{ marginLeft: "auto" }}>
            three boards, one quadrant model
          </span>
        </div>
        <QuadrantLegend />
        <div className="grid cols-3" style={{ marginTop: 16 }}>
          {KINDS.map((k) => (
            <div key={k.key}>
              <h3>
                <span className={`badge ${k.badgeClass}`}>
                  <span className="dot" style={{ background: `var(${k.accentVar})` }} />
                  {k.label}
                </span>
              </h3>
              <p className="faint" style={{ margin: "4px 0 8px" }}>
                rotating by {k.entity}
              </p>
              <EmptyBoard label={`${k.label} rotation`} />
            </div>
          ))}
        </div>
      </section>

      <div className="grid cols-2">
        <section className="card">
          <div className="card-head">
            <h2>Constellation</h2>
          </div>
          <EmptyBoard label="Idea-space map" />
        </section>
        <section className="card">
          <div className="card-head">
            <h2>Outliers</h2>
          </div>
          <EmptyBoard label="Breakouts, new entrants, quadrant jumps" />
        </section>
      </div>

      <section className="card">
        <div className="card-head">
          <h2>What Is New</h2>
        </div>
        {hasData ? (
          <p className="muted">Digest loaded for {h.label}. Rendering arrives in Phase 4.</p>
        ) : (
          <EmptyBoard label={`New in the past ${h.label.toLowerCase()}`} />
        )}
      </section>
    </div>
  );
}
