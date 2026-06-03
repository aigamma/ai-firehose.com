import { memo, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { quadrantOf, getKind, KINDS, ROTATION } from "../data/registry.js";
import { clampVal, truncate, trailPoints, onPointKey, axisExtent } from "../lib/rotationGeo.js";

// The unified rotation plane on Home: all three kinds on ONE large set of axes
// (ratio on x, momentum on y, both centered at 100, so combining kinds is
// legitimate). It replaces three cramped per-kind charts. Color encodes KIND
// (the kind accents), with a redundant marker SHAPE per kind for colorblind
// safety, so the eye reads "techniques cluster in Leading, opinions in Lagging."
// Identity is recovered by the head label and a hover highlight. The boring long
// tail is pruned per the ROTATION rule (registry). Pure SVG, no charting library;
// the clamp, trail, label, and axis-extent helpers are shared with the single-kind
// RotationChart via rotationGeo.js so the two planes cannot drift. Mansfield
// Relative Performance (1979); "RRG" is a trademark and is avoided.
//
// A concept can rotate on more than one kind's board at once (test-time compute
// can lead as a technique while lagging as an opinion), so traces are keyed by a
// composite `kind::id` (`uid`); navigation still targets the shared concept hub.
const US = 560;
const UPAD = 40;

// Prune the long tail. Per kind: drop new entrants (surfaced separately, they have
// no trajectory), keep the top `perKind` by attention, then keep only the ones
// actually moving, but never drop a kind to zero. Cap the whole plane at `maxTotal`.
function prune(entities) {
  const byKind = new Map();
  for (const e of entities) {
    if (!byKind.has(e.kind)) byKind.set(e.kind, []);
    byKind.get(e.kind).push(e);
  }
  const kept = [];
  for (const list of byKind.values()) {
    const live = list
      .filter((e) => !e.outlier?.new_entrant)
      .sort((a, b) => (b.attention || 0) - (a.attention || 0));
    const top = live.slice(0, ROTATION.perKind);
    const moving = top.filter(
      (e) =>
        e.outlier?.breakout ||
        e.outlier?.quadrant_jump ||
        Math.abs((e.momentum ?? 100) - 100) >= ROTATION.momMin ||
        Math.abs((e.ratio ?? 100) - 100) >= ROTATION.rsMin
    );
    kept.push(...(moving.length ? moving : live.slice(0, 1)));
  }
  return kept.sort((a, b) => (b.attention || 0) - (a.attention || 0)).slice(0, ROTATION.maxTotal);
}

// Greedy 1-D declutter: given labeled heads, push overlapping labels downward by
// the deficit so head labels do not stack. Returns uid -> adjusted baseline y.
function layoutLabels(items, minGap) {
  const out = new Map();
  let prev = -Infinity;
  for (const it of [...items].sort((a, b) => a.y - b.y)) {
    const y = it.y - prev < minGap ? prev + minGap : it.y;
    out.set(it.uid, y);
    prev = y;
  }
  return out;
}

function UnifiedRotationChart({ entities = [] }) {
  const navigate = useNavigate();

  const traces = useMemo(
    () =>
      prune(entities).map((e) => {
        const k = getKind(e.kind);
        return {
          uid: `${e.kind}::${e.id}`,
          id: e.id,
          kind: e.kind,
          label: e.label,
          ratio: e.ratio,
          momentum: e.momentum,
          quadrant: e.quadrant,
          attention: e.attention || 0,
          breakout: !!e.outlier?.breakout,
          color: k ? `var(${k.accentVar})` : "var(--accent)",
          shape: k?.shape || "circle",
          points: trailPoints(e),
        };
      }),
    [entities]
  );

  // Persistently label only breakouts plus the top `labelPerKind` per kind; the
  // rest carry their name in a hover tooltip, so a dense plane stays readable.
  const labelIds = useMemo(() => {
    const ids = new Set();
    const byKind = new Map();
    for (const t of traces) {
      if (t.breakout) ids.add(t.uid);
      if (!byKind.has(t.kind)) byKind.set(t.kind, []);
      byKind.get(t.kind).push(t);
    }
    for (const list of byKind.values()) {
      [...list].sort((a, b) => b.attention - a.attention).slice(0, ROTATION.labelPerKind).forEach((t) => ids.add(t.uid));
    }
    return ids;
  }, [traces]);

  const dev = useMemo(() => axisExtent(traces), [traces]);

  const [hiddenKinds, setHiddenKinds] = useState(() => new Set());
  const [hiddenIds, setHiddenIds] = useState(() => new Set());
  const [hot, setHot] = useState(null);

  const toggleKind = (k) =>
    setHiddenKinds((prev) => {
      const next = new Set(prev);
      next.has(k) ? next.delete(k) : next.add(k);
      return next;
    });
  const toggleId = (uid) =>
    setHiddenIds((prev) => {
      const next = new Set(prev);
      next.has(uid) ? next.delete(uid) : next.add(uid);
      return next;
    });
  const enter = (uid) => setHot(uid);
  const leave = (uid) => setHot((h) => (h === uid ? null : h));

  if (!traces.length) return null;

  const lo = 100 - dev;
  const hi = 100 + dev;
  const mapX = (v) => UPAD + ((clampVal(v) - lo) / (hi - lo)) * (US - 2 * UPAD);
  const mapY = (v) => US - UPAD - ((clampVal(v) - lo) / (hi - lo)) * (US - 2 * UPAD);
  const cx = mapX(100);
  const cy = mapY(100);
  const qv = (q) => `var(${quadrantOf(q).colorVar})`;

  const rects = [
    { q: "leading", x: cx, y: UPAD, w: US - UPAD - cx, h: cy - UPAD },
    { q: "improving", x: UPAD, y: UPAD, w: cx - UPAD, h: cy - UPAD },
    { q: "weakening", x: cx, y: cy, w: US - UPAD - cx, h: US - UPAD - cy },
    { q: "lagging", x: UPAD, y: cy, w: cx - UPAD, h: US - UPAD - cy },
  ];

  // Visible traces, with screen geometry resolved once. Hot trace painted last so
  // it sits above the dimmed others.
  const visible = traces
    .filter((t) => !hiddenKinds.has(t.kind) && !hiddenIds.has(t.uid))
    .map((t) => {
      const pts = t.points.map(([rx, my]) => [mapX(rx), mapY(my)]);
      const head = pts[pts.length - 1];
      // Flip the label to the left for heads near the right edge so it never clips.
      const flip = head[0] + 9 + t.label.length * 5.4 > US - UPAD;
      return { ...t, pts, head, flip };
    })
    .sort((a, b) => (a.uid === hot ? 1 : 0) - (b.uid === hot ? 1 : 0));

  // Label baselines for the labeled-or-hot subset, deconflicted top to bottom.
  const labeled = visible.filter((t) => labelIds.has(t.uid) || t.uid === hot);
  const labelY = layoutLabels(labeled.map((t) => ({ uid: t.uid, y: t.head[1] + 3.5 })), ROTATION.labelMinGap);

  const kindsPresent = KINDS.filter((k) => traces.some((t) => t.kind === k.key));
  const countOf = (k) => traces.filter((t) => t.kind === k).length;

  return (
    <>
      <svg viewBox={`0 0 ${US} ${US}`} width="100%" role="img" aria-label="Relative rotation plane for techniques, tools, and opinions" style={{ display: "block" }}>
        {rects.map((r) => (
          <rect key={r.q} x={r.x} y={r.y} width={Math.max(0, r.w)} height={Math.max(0, r.h)} fill={qv(r.q)} opacity="0.07" />
        ))}
        <line x1={cx} y1={UPAD} x2={cx} y2={US - UPAD} stroke="var(--border-strong)" strokeWidth="1" />
        <line x1={UPAD} y1={cy} x2={US - UPAD} y2={cy} stroke="var(--border-strong)" strokeWidth="1" />
        <text x={US - UPAD} y={UPAD + 13} textAnchor="end" fontSize="12" fontWeight="600" fill="var(--q-leading)">Leading</text>
        <text x={UPAD} y={UPAD + 13} fontSize="12" fontWeight="600" fill="var(--q-improving)">Improving</text>
        <text x={US - UPAD} y={US - UPAD - 6} textAnchor="end" fontSize="12" fontWeight="600" fill="var(--q-weakening)">Weakening</text>
        <text x={UPAD} y={US - UPAD - 6} fontSize="12" fontWeight="600" fill="var(--q-lagging)">Lagging</text>

        {visible.map((t) => {
          const dim = hot && hot !== t.uid;
          const go = () => navigate(`/technique/${t.id}`);
          const head = t.head;
          const tail = t.pts.slice(0, -1);
          const poly = t.pts.map(([x, y]) => `${x.toFixed(1)},${y.toFixed(1)}`).join(" ");
          const showLabel = labelIds.has(t.uid) || t.uid === hot;
          const ly = labelY.get(t.uid);
          const common = {
            fill: t.color,
            opacity: dim ? 0.3 : 0.95,
            style: { cursor: "pointer" },
            tabIndex: 0,
            role: "button",
            "aria-label": `${t.label} (${getKind(t.kind)?.singular}): ratio ${t.ratio}, momentum ${t.momentum} (${t.quadrant})`,
            onClick: go,
            onKeyDown: (ev) => onPointKey(ev, go),
            onMouseEnter: () => enter(t.uid),
            onMouseLeave: () => leave(t.uid),
            onFocus: () => enter(t.uid),
            onBlur: () => leave(t.uid),
          };
          const title = <title>{`${t.label}  ${getKind(t.kind)?.singular}  ratio ${t.ratio}  momentum ${t.momentum}  (${t.quadrant})`}</title>;
          return (
            <g key={t.uid}>
              {t.pts.length > 1 && (
                <polyline
                  points={poly}
                  fill="none"
                  stroke={t.color}
                  strokeWidth="1.5"
                  strokeOpacity={dim ? 0.15 : 0.7}
                  strokeLinejoin="round"
                  strokeLinecap="round"
                  style={{ pointerEvents: "none" }}
                />
              )}
              {tail.map(([x, y], j) => (
                <circle key={j} cx={x} cy={y} r="2.5" fill={t.color} opacity={dim ? 0.18 : 0.55} style={{ pointerEvents: "none" }} />
              ))}
              {showLabel && ly !== undefined && Math.abs(ly - head[1]) > 9 && (
                <line x1={head[0]} y1={head[1]} x2={t.flip ? head[0] - 7 : head[0] + 7} y2={ly - 3} stroke={t.color} strokeWidth="0.75" strokeOpacity="0.5" style={{ pointerEvents: "none" }} />
              )}
              {t.shape === "triangle" ? (
                <polygon points={`${head[0]},${head[1] - 7} ${head[0] - 6.1},${head[1] + 3.5} ${head[0] + 6.1},${head[1] + 3.5}`} {...common}>{title}</polygon>
              ) : t.shape === "square" ? (
                <rect x={head[0] - 5} y={head[1] - 5} width="10" height="10" rx="1.5" {...common}>{title}</rect>
              ) : (
                <circle cx={head[0]} cy={head[1]} r="6" {...common}>{title}</circle>
              )}
              {showLabel && ly !== undefined && (
                <text
                  x={t.flip ? head[0] - 10 : head[0] + 10}
                  y={ly}
                  textAnchor={t.flip ? "end" : "start"}
                  fontSize="11"
                  fontWeight="600"
                  fill={t.color}
                  opacity={dim ? 0.4 : 1}
                  stroke="var(--surface)"
                  strokeWidth="3"
                  paintOrder="stroke"
                  strokeLinejoin="round"
                  style={{ pointerEvents: "none" }}
                >
                  {truncate(t.label, 22)}
                </text>
              )}
            </g>
          );
        })}
      </svg>

      <div className="rot-legend rot-kinds" role="group" aria-label="Show or hide a whole kind on the rotation plane">
        {kindsPresent.map((k) => {
          const active = !hiddenKinds.has(k.key);
          const color = `var(${k.accentVar})`;
          return (
            <button
              key={k.key}
              type="button"
              className="rot-pill"
              aria-pressed={active}
              onClick={() => toggleKind(k.key)}
              style={active ? { background: color, borderColor: color } : { color, borderColor: color }}
              title={active ? `Hide ${k.label}` : `Show ${k.label}`}
            >
              {k.label} {countOf(k.key)}
            </button>
          );
        })}
      </div>

      <div className="rot-legend" role="group" aria-label="Show, hide, or highlight a single topic on the rotation plane">
        {traces.map((t) => {
          const active = !hiddenKinds.has(t.kind) && !hiddenIds.has(t.uid);
          return (
            <button
              key={t.uid}
              type="button"
              className="rot-pill"
              aria-pressed={active}
              onClick={() => toggleId(t.uid)}
              onMouseEnter={() => enter(t.uid)}
              onMouseLeave={() => leave(t.uid)}
              onFocus={() => enter(t.uid)}
              onBlur={() => leave(t.uid)}
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

export default memo(UnifiedRotationChart);
