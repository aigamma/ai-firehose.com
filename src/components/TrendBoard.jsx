import { memo } from "react";
import { Link } from "react-router-dom";
import Sparkline from "./Sparkline.jsx";

// A ranked "heat board" for one kind: the topics that gained or lost the most
// attention this horizon window, sorted by `delta` (growth in weighted mentions
// versus the prior equal window, computed clamp-free in the worker). It replaces
// the rotation plane, whose Mansfield ratio pinned to its [55, 145] clamp on this
// sparse, recency-heavy corpus and so could not rank what is actually trending.
// Magnitude is the bar (current attention), the move is the signed delta and arrow,
// the shape over time is the sparkline. Breakouts and freshly surfaced topics carry
// a badge rather than living in a separate list. Navigation targets the shared
// concept hub at /technique/:slug, exactly as the old plane did.

const dir = (d) => (d > 0.5 ? "up" : d < -0.5 ? "down" : "flat");
const STROKE = { up: "var(--q-leading)", down: "var(--q-lagging)", flat: "var(--muted)" };
const GLYPH = { up: "▲", down: "▼", flat: "·" };

function TrendBoard({ entities = [], kind, limit, showHead = true }) {
  const ranked = [...entities].sort((a, b) => (b.delta ?? 0) - (a.delta ?? 0));
  const shown = limit ? ranked.slice(0, limit) : ranked;
  if (!shown.length) return null;
  const maxAtt = Math.max(1, ...shown.map((e) => e.attention || 0));
  const accent = kind ? `var(${kind.accentVar})` : "var(--accent)";

  return (
    <div className="heat-board">
      {kind && showHead && (
        <div className="heat-head">
          <span className="badge" style={{ color: accent }}>
            <span className="dot" style={{ background: accent }} />
            {kind.label}
          </span>
          <span className="faint mono">{ranked.length} moving</span>
        </div>
      )}
      <ol className="heat" aria-label={kind ? `${kind.label} ranked by trend` : "Topics ranked by trend"}>
        {shown.map((e, i) => {
          const delta = e.delta ?? 0;
          const d = dir(delta);
          const sign = delta > 0 ? "+" : "";
          return (
            <li className="heat-row" key={`${e.kind || kind?.key || ""}:${e.id}`}>
              <span className="heat-rank mono">{i + 1}</span>
              <span className="heat-main">
                <span className="heat-label">
                  <Link to={`/technique/${e.id}`}>{e.label}</Link>
                  {e.outlier?.breakout && <span className="heat-tag breakout">breakout</span>}
                  {e.outlier?.new_entrant && <span className="heat-tag new">new</span>}
                </span>
                <span className="heat-bar" aria-hidden="true">
                  <span className="heat-bar-fill" style={{ width: `${((e.attention || 0) / maxAtt) * 100}%`, background: accent }} />
                </span>
              </span>
              <Sparkline values={e.sparkline} stroke={STROKE[d]} />
              <span
                className={`heat-trend mono heat-${d}`}
                title={`Growth versus the prior window: ${sign}${delta.toFixed(1)} weighted mentions. Attention now ${e.attention}.`}
              >
                <span aria-hidden="true">{GLYPH[d]}</span>
                <span>{sign}{Math.round(delta)}</span>
              </span>
            </li>
          );
        })}
      </ol>
    </div>
  );
}

export default memo(TrendBoard);
