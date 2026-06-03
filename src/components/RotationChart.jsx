import { memo, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { quadrantOf, TRAIL_PALETTE } from "../data/registry.js";
import { clampVal, truncate, trailPoints, onPointKey, axisExtent } from "../lib/rotationGeo.js";

// A lean SVG rotation plane (the "rotation plane"). ratio on x, momentum on y,
// both centered at 100. The normalization is Mansfield Relative Performance
// (Roy Mansfield, 1979), the prior-art math aigamma.com cites; "RRG" is a
// trademark and is avoided. Hand-rolled in SVG, no Plotly, to keep the bundle
// small. Mirrors aigamma's proven RotationChart: each topic is one trace of a
// thin trailing line plus small tail dots, a larger head dot, and a head label,
// over tinted quadrant zones, with a pill row that is both legend and per-topic
// show/hide control. aigamma colors trails by current quadrant because it draws
// 14 topics; we draw only the top 6, so we color by IDENTITY (one hue per
// trail) which is easier to follow at low item counts. The clamp, trail, label,
// and axis-extent helpers are shared with UnifiedRotationChart via rotationGeo.js
// so the two planes cannot drift.
const S = 320;
const PAD = 30;
const HEAD_LIMIT = 6;

function RotationChart({ entities = [] }) {
  const navigate = useNavigate();

  // The plotted set: the top entities by attention (already sorted descending in
  // the artifact) that are NOT new entrants. New entrants have one mention and no
  // trajectory; plotting them would pin a dot to the clamp corner and mislead, so
  // they are surfaced separately in a "Just surfaced" line instead.
  const plotted = useMemo(
    () => entities.filter((e) => !e.outlier?.new_entrant).slice(0, HEAD_LIMIT),
    [entities]
  );

  // Precompute each topic's trail geometry once. Color is identity (palette[i]),
  // not quadrant, so a single trajectory stays one color end to end.
  const traces = useMemo(
    () =>
      plotted.map((e, i) => ({
        id: e.id,
        label: e.label,
        ratio: e.ratio,
        momentum: e.momentum,
        quadrant: e.quadrant,
        color: TRAIL_PALETTE[i % TRAIL_PALETTE.length],
        points: trailPoints(e),
      })),
    [plotted]
  );

  // Axis range spans ALL plotted trail points (not just heads) and is symmetric
  // around 100, so toggling a topic's visibility never warps the layout.
  const dev = useMemo(() => axisExtent(traces), [traces]);

  // Visibility toggles. A hidden Set keeps "all visible" as the empty default, so
  // a topic is shown unless explicitly hidden.
  const [hidden, setHidden] = useState(() => new Set());
  const toggle = (id) =>
    setHidden((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });

  if (!traces.length) return null;

  const lo = 100 - dev;
  const hi = 100 + dev;
  const mapX = (v) => PAD + ((clampVal(v) - lo) / (hi - lo)) * (S - 2 * PAD);
  const mapY = (v) => S - PAD - ((clampVal(v) - lo) / (hi - lo)) * (S - 2 * PAD);
  const cx = mapX(100);
  const cy = mapY(100);
  const qv = (q) => `var(${quadrantOf(q).colorVar})`;

  const rects = [
    { q: "leading", x: cx, y: PAD, w: S - PAD - cx, h: cy - PAD },
    { q: "improving", x: PAD, y: PAD, w: cx - PAD, h: cy - PAD },
    { q: "weakening", x: cx, y: cy, w: S - PAD - cx, h: S - PAD - cy },
    { q: "lagging", x: PAD, y: cy, w: cx - PAD, h: S - PAD - cy },
  ];

  return (
    <>
      <svg viewBox={`0 0 ${S} ${S}`} width="100%" role="img" aria-label="Relative rotation plane with trailing trajectories" style={{ display: "block" }}>
        {rects.map((r) => (
          <rect key={r.q} x={r.x} y={r.y} width={Math.max(0, r.w)} height={Math.max(0, r.h)} fill={qv(r.q)} opacity="0.07" />
        ))}
        <line x1={cx} y1={PAD} x2={cx} y2={S - PAD} stroke="var(--border-strong)" strokeWidth="1" />
        <line x1={PAD} y1={cy} x2={S - PAD} y2={cy} stroke="var(--border-strong)" strokeWidth="1" />
        <text x={S - PAD} y={PAD + 12} textAnchor="end" fontSize="11" fontWeight="600" fill="var(--q-leading)">Leading</text>
        <text x={PAD} y={PAD + 12} fontSize="11" fontWeight="600" fill="var(--q-improving)">Improving</text>
        <text x={S - PAD} y={S - PAD - 5} textAnchor="end" fontSize="11" fontWeight="600" fill="var(--q-weakening)">Weakening</text>
        <text x={PAD} y={S - PAD - 5} fontSize="11" fontWeight="600" fill="var(--q-lagging)">Lagging</text>
        {traces.map((t) => {
          if (hidden.has(t.id)) return null;
          const go = () => navigate(`/technique/${t.id}`);
          const pts = t.points.map(([rx, my]) => [mapX(rx), mapY(my)]);
          const head = pts[pts.length - 1];
          const tail = pts.slice(0, -1);
          const poly = pts.map(([x, y]) => `${x.toFixed(1)},${y.toFixed(1)}`).join(" ");
          return (
            <g key={t.id}>
              {pts.length > 1 && (
                <polyline
                  points={poly}
                  fill="none"
                  stroke={t.color}
                  strokeWidth="1.5"
                  strokeOpacity="0.7"
                  strokeLinejoin="round"
                  strokeLinecap="round"
                  style={{ pointerEvents: "none" }}
                />
              )}
              {tail.map(([x, y], j) => (
                <circle key={j} cx={x} cy={y} r="2.5" fill={t.color} opacity="0.55" style={{ pointerEvents: "none" }}>
                  <title>{`${t.label}  ratio ${t.points[j][0]}  momentum ${t.points[j][1]}`}</title>
                </circle>
              ))}
              <circle
                cx={head[0]}
                cy={head[1]}
                r="6"
                fill={t.color}
                opacity="0.95"
                style={{ cursor: "pointer" }}
                tabIndex={0}
                role="button"
                aria-label={`${t.label}: ratio ${t.ratio}, momentum ${t.momentum} (${t.quadrant})`}
                onClick={go}
                onKeyDown={(ev) => onPointKey(ev, go)}
              >
                <title>{`${t.label}  ratio ${t.ratio}  momentum ${t.momentum}  (${t.quadrant})`}</title>
              </circle>
              <text
                x={head[0] + 9}
                y={head[1] + 3.5}
                fontSize="10"
                fill={t.color}
                stroke="var(--surface)"
                strokeWidth="3"
                paintOrder="stroke"
                strokeLinejoin="round"
                style={{ pointerEvents: "none" }}
              >
                {truncate(t.label)}
              </text>
            </g>
          );
        })}
      </svg>
      <div className="rot-legend" role="group" aria-label="Show or hide topics on the rotation plane">
        {traces.map((t) => {
          const active = !hidden.has(t.id);
          return (
            <button
              key={t.id}
              type="button"
              className="rot-pill"
              aria-pressed={active}
              onClick={() => toggle(t.id)}
              style={active ? { background: t.color, borderColor: t.color } : { color: t.color, borderColor: t.color }}
              title={active ? `Hide ${t.label}` : `Show ${t.label}`}
            >
              {t.label}
            </button>
          );
        })}
      </div>
    </>
  );
}

export default memo(RotationChart);
