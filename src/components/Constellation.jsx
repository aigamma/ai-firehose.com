import { useNavigate } from "react-router-dom";
import { KINDS } from "../data/registry.js";

// SVG idea-space map. Points placed by their 2D PCA projection (x, y in [-1, 1]),
// colored by kind, sized by attention. Ported in spirit from civil's Constellation.
const S = 360;
const PAD = 16;

const kindVar = (k) => KINDS.find((x) => x.key === k)?.accentVar || "--accent";

export default function Constellation({ points = [] }) {
  const navigate = useNavigate();
  if (!points.length) return null;
  const mapX = (x) => PAD + ((x + 1) / 2) * (S - 2 * PAD);
  const mapY = (y) => S - PAD - ((y + 1) / 2) * (S - 2 * PAD);
  const r = (a) => 2.5 + Math.sqrt(Math.max(0, a)) * 0.8;
  return (
    <svg viewBox={`0 0 ${S} ${S}`} width="100%" role="img" aria-label="Idea-space constellation" style={{ display: "block" }}>
      <line x1={mapX(0)} y1={PAD} x2={mapX(0)} y2={S - PAD} stroke="var(--border)" strokeWidth="1" />
      <line x1={PAD} y1={mapY(0)} x2={S - PAD} y2={mapY(0)} stroke="var(--border)" strokeWidth="1" />
      {points.map((p) => (
        <circle key={p.id} cx={mapX(p.x)} cy={mapY(p.y)} r={r(p.attention)} fill={`var(${kindVar(p.kind)})`} opacity="0.8" style={{ cursor: "pointer" }} onClick={() => navigate(`/technique/${p.id}`)}>
          <title>{`${p.label} (${p.kind})`}</title>
        </circle>
      ))}
    </svg>
  );
}
