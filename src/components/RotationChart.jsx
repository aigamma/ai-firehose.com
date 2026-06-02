import { QUADRANTS } from "../data/registry.js";

// A lean SVG rotation scatter (the "rotation plane"). ratio on x, momentum on y,
// both centered at 100. The normalization is Mansfield Relative Performance
// (Roy Mansfield, 1979), the prior-art math aigamma.com cites; "RRG" is a
// trademark and is avoided. Chosen over Plotly to keep the bundle small.
const S = 320;
const PAD = 30;

function domainDev(entities) {
  let dev = 6;
  for (const e of entities) {
    dev = Math.max(dev, Math.abs(e.ratio - 100), Math.abs(e.momentum - 100));
  }
  return dev * 1.12;
}

export default function RotationChart({ entities = [] }) {
  if (!entities.length) return null;
  const dev = domainDev(entities);
  const lo = 100 - dev;
  const hi = 100 + dev;
  const mapX = (v) => PAD + ((v - lo) / (hi - lo)) * (S - 2 * PAD);
  const mapY = (v) => S - PAD - ((v - lo) / (hi - lo)) * (S - 2 * PAD);
  const cx = mapX(100);
  const cy = mapY(100);
  const qv = (q) => `var(${QUADRANTS[q].colorVar})`;
  const rdot = (a) => 3 + Math.sqrt(Math.max(0, a)) * 0.9;

  const rects = [
    { q: "leading", x: cx, y: PAD, w: S - PAD - cx, h: cy - PAD },
    { q: "improving", x: PAD, y: PAD, w: cx - PAD, h: cy - PAD },
    { q: "weakening", x: cx, y: cy, w: S - PAD - cx, h: S - PAD - cy },
    { q: "lagging", x: PAD, y: cy, w: cx - PAD, h: S - PAD - cy },
  ];

  return (
    <svg viewBox={`0 0 ${S} ${S}`} width="100%" role="img" aria-label="Relative rotation scatter" style={{ display: "block" }}>
      {rects.map((r) => (
        <rect key={r.q} x={r.x} y={r.y} width={Math.max(0, r.w)} height={Math.max(0, r.h)} fill={qv(r.q)} opacity="0.07" />
      ))}
      <line x1={cx} y1={PAD} x2={cx} y2={S - PAD} stroke="var(--border-strong)" strokeWidth="1" />
      <line x1={PAD} y1={cy} x2={S - PAD} y2={cy} stroke="var(--border-strong)" strokeWidth="1" />
      <text x={S - PAD} y={PAD + 10} textAnchor="end" fontSize="9" fill="var(--q-leading)">Leading</text>
      <text x={PAD} y={PAD + 10} fontSize="9" fill="var(--q-improving)">Improving</text>
      <text x={S - PAD} y={S - PAD - 4} textAnchor="end" fontSize="9" fill="var(--q-weakening)">Weakening</text>
      <text x={PAD} y={S - PAD - 4} fontSize="9" fill="var(--q-lagging)">Lagging</text>
      {entities.map((e) => (
        <circle key={e.id} cx={mapX(e.ratio)} cy={mapY(e.momentum)} r={rdot(e.attention)} fill={qv(e.quadrant)} opacity="0.85">
          <title>{`${e.label}  ratio ${e.ratio}  momentum ${e.momentum}  (${e.quadrant})`}</title>
        </circle>
      ))}
    </svg>
  );
}
