import { memo, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { KINDS } from "../data/registry.js";

// SVG idea-space map. Points placed by their 2D PCA projection (x, y in [-1, 1]),
// colored by kind, sized by attention. Ported in spirit from civil's Constellation.
const S = 360;
const PAD = 16;

const kindVar = (k) => KINDS.find((x) => x.key === k)?.accentVar || "--accent";
const mapX = (x) => PAD + ((x + 1) / 2) * (S - 2 * PAD);
const mapY = (y) => S - PAD - ((y + 1) / 2) * (S - 2 * PAD);
const r = (a) => 2.5 + Math.sqrt(Math.max(0, a)) * 0.8;

// Activate a point on Enter or Space, mirroring the click-to-navigate behavior
// so the map is operable from the keyboard.
function onPointKey(e, go) {
  if (e.key === "Enter" || e.key === " " || e.key === "Spacebar") {
    e.preventDefault();
    go();
  }
}

function Constellation({ points = [], clusters = [] }) {
  const navigate = useNavigate();

  // Derived geometry recomputes only when the artifacts change, not on every
  // Home re-render (horizon switches, theme toggles, etc.).
  const byId = useMemo(() => Object.fromEntries(points.map((p) => [p.id, p])), [points]);
  const regions = useMemo(
    () =>
      (clusters || [])
        .slice()
        .sort((a, b) => (b.size || 0) - (a.size || 0))
        .slice(0, 6)
        .map((c) => {
          const pts = (c.members || []).map((m) => byId[m.id]).filter(Boolean);
          if (pts.length < 3) return null;
          return {
            label: String(c.label || "").split(",")[0].trim(),
            x: pts.reduce((s, p) => s + p.x, 0) / pts.length,
            y: pts.reduce((s, p) => s + p.y, 0) / pts.length,
          };
        })
        .filter(Boolean),
    [clusters, byId]
  );

  if (!points.length) return null;

  return (
    <svg viewBox={`0 0 ${S} ${S}`} width="100%" role="img" aria-label="Idea-space constellation" style={{ display: "block" }}>
      <line x1={mapX(0)} y1={PAD} x2={mapX(0)} y2={S - PAD} stroke="var(--border)" strokeWidth="1" />
      <line x1={PAD} y1={mapY(0)} x2={S - PAD} y2={mapY(0)} stroke="var(--border)" strokeWidth="1" />
      {points.map((p) => {
        const go = () => navigate(`/technique/${p.id}`);
        return (
          <circle
            key={p.id}
            cx={mapX(p.x)}
            cy={mapY(p.y)}
            r={r(p.attention)}
            fill={`var(${kindVar(p.kind)})`}
            opacity="0.8"
            style={{ cursor: "pointer" }}
            tabIndex={0}
            role="button"
            aria-label={`${p.label} (${p.kind})`}
            onClick={go}
            onKeyDown={(e) => onPointKey(e, go)}
          >
            <title>{`${p.label} (${p.kind})`}</title>
          </circle>
        );
      })}
      {regions.map((rg, i) => (
        <text key={`r${i}`} x={mapX(rg.x)} y={mapY(rg.y)} fontSize="9" fill="var(--muted)" textAnchor="middle" opacity="0.85" style={{ pointerEvents: "none" }}>
          {rg.label}
        </text>
      ))}
    </svg>
  );
}

export default memo(Constellation);
