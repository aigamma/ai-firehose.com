import useData from "../lib/useData.js";
import { getKind, QUADRANTS } from "../data/registry.js";
import RotationChart from "./RotationChart.jsx";
import Sparkline from "./Sparkline.jsx";

// One per-kind rotation board: the RRG scatter plus a short leaderboard of the
// strongest movers. Loads its own attention artifact for the given horizon.
export default function RotationBoard({ kindKey, horizon }) {
  const kind = getKind(kindKey);
  const { data } = useData(`/data/attention/${kindKey}_${horizon}.json`);
  const entities = data?.entities || [];
  const leaders = [...entities].sort((a, b) => b.momentum - a.momentum).slice(0, 4);

  return (
    <div>
      <h3>
        <span className={`badge ${kind.badgeClass}`}>
          <span className="dot" style={{ background: `var(${kind.accentVar})` }} />
          {kind.label}
        </span>
      </h3>
      <p className="faint" style={{ margin: "4px 0 8px" }}>rotating by {kind.entity}</p>
      {entities.length ? (
        <>
          <RotationChart entities={entities} />
          <ul className="leaders">
            {leaders.map((e) => (
              <li key={e.id}>
                <span className="dot" style={{ background: `var(${QUADRANTS[e.quadrant].colorVar})` }} />
                <span className="lead-label" title={`${e.quadrant} · ratio ${e.ratio} · momentum ${e.momentum}`}>
                  {e.label}
                </span>
                <Sparkline values={e.sparkline} stroke={`var(${QUADRANTS[e.quadrant].colorVar})`} />
              </li>
            ))}
          </ul>
        </>
      ) : (
        <div className="empty">
          <strong>{kind.label} rotation</strong>
          Awaiting ingestion.
        </div>
      )}
    </div>
  );
}
