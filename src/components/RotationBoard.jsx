import { memo } from "react";
import { Link } from "react-router-dom";
import useData from "../lib/useData.js";
import { getKind, quadrantOf } from "../data/registry.js";
import RotationChart from "./RotationChart.jsx";
import Sparkline from "./Sparkline.jsx";

// A distinct load-failure notice, visually separate from the dashed ".empty"
// awaiting-ingestion box: a solid card tinted toward the lagging color so a
// real error never masquerades as "no data yet".
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

// One per-kind rotation board: the rotation scatter plus a short leaderboard of the
// strongest movers. Loads its own attention artifact for the given horizon.
function RotationBoard({ kindKey, horizon }) {
  const kind = getKind(kindKey);
  const { data, loading, error } = useData(`/data/attention/${kindKey}_${horizon}.json`);
  const entities = data?.entities || [];
  const leaders = [...entities].sort((a, b) => b.momentum - a.momentum).slice(0, 4);

  return (
    <div>
      <h3>
        <Link to={kind.route} className={`badge ${kind.badgeClass}`}>
          <span className="dot" style={{ background: `var(${kind.accentVar})` }} />
          {kind.label}
        </Link>
      </h3>
      <p className="faint" style={{ margin: "4px 0 8px" }}>rotating by {kind.entity}</p>
      {error ? (
        <LoadError label={`${kind.label} rotation`} />
      ) : entities.length ? (
        <>
          <RotationChart entities={entities} />
          <ul className="leaders">
            {leaders.map((e) => (
              <li key={e.id}>
                <span className="dot" style={{ background: `var(${quadrantOf(e.quadrant).colorVar})` }} />
                <span className="lead-label" title={`${e.quadrant} · ratio ${e.ratio} · momentum ${e.momentum}`}>
                  <Link to={`/technique/${e.id}`}>{e.label}</Link>
                </span>
                <Sparkline values={e.sparkline} stroke={`var(${quadrantOf(e.quadrant).colorVar})`} />
              </li>
            ))}
          </ul>
        </>
      ) : (
        <div className="empty">
          <strong>{kind.label} rotation</strong>
          {loading ? "Loading…" : "Awaiting ingestion."}
        </div>
      )}
    </div>
  );
}

export default memo(RotationBoard);
