import { useState } from "react";
import { Link } from "react-router-dom";
import HorizonSwitch from "../components/HorizonSwitch.jsx";
import RotationChart from "../components/RotationChart.jsx";
import Sparkline from "../components/Sparkline.jsx";
import useData from "../lib/useData.js";
import useDocumentTitle from "../hooks/useDocumentTitle.js";
import { getKind, QUADRANTS, quadrantOf, DEFAULT_HORIZON, getHorizon } from "../data/registry.js";

// Per-kind deep view: the full rotation plane plus the complete leaderboard for
// one kind (Techniques, Tools, or Opinions) at the chosen horizon.
export default function KindView({ kindKey }) {
  const kind = getKind(kindKey);
  const [horizon, setHorizon] = useState(DEFAULT_HORIZON);
  const h = getHorizon(horizon);
  const { data } = useData(`/data/attention/${kindKey}_${horizon}.json`);
  const entities = data?.entities || [];
  useDocumentTitle(kind?.label);
  if (!kind) return null;

  return (
    <div className="stack" style={{ paddingTop: 24 }}>
      <h1>
        <span className={`badge ${kind.badgeClass}`}>
          <span className="dot" style={{ background: `var(${kind.accentVar})` }} />
          {kind.label}
        </span>
      </h1>
      <p className="lede muted">
        Rotating by {kind.entity}. The {kind.label.toLowerCase()} rotation plane for the past {h.label.toLowerCase()},
        using the Mansfield Relative Performance normalization.
      </p>

      <div style={{ display: "flex", alignItems: "center", gap: 16, flexWrap: "wrap" }}>
        <HorizonSwitch value={horizon} onChange={setHorizon} />
        <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
          {Object.values(QUADRANTS).map((q) => (
            <span key={q.key} className="badge" title={q.note}>
              <span className="dot" style={{ background: `var(${q.colorVar})` }} />
              {q.label}
            </span>
          ))}
        </div>
      </div>

      {entities.length ? (
        <div className="grid cols-2">
          <section className="card" style={{ "--tile-accent": `var(${kind.accentVar})` }}>
            <div className="card-head"><h2>Rotation Plane</h2></div>
            <RotationChart entities={entities} />
          </section>
          <section className="card" style={{ "--tile-accent": `var(${kind.accentVar})` }}>
            <div className="card-head">
              <h2>Leaderboard</h2>
              <span className="faint mono" style={{ marginLeft: "auto" }}>{entities.length} entities</span>
            </div>
            <ul className="feed">
              {entities.map((e) => (
                <li key={e.id}>
                  <span className="dot" style={{ background: `var(${quadrantOf(e.quadrant).colorVar})` }} />
                  <span className="lead-label"><Link to={`/technique/${e.id}`}>{e.label}</Link></span>
                  <Sparkline values={e.sparkline} stroke={`var(${quadrantOf(e.quadrant).colorVar})`} />
                  <span className="faint mono">att {e.attention} · m {e.momentum}</span>
                </li>
              ))}
            </ul>
          </section>
        </div>
      ) : (
        <div className="empty">
          <strong>{kind.label}</strong>
          Awaiting ingestion for the past {h.label.toLowerCase()}.
        </div>
      )}
    </div>
  );
}
