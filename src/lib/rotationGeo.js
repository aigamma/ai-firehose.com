/*
  Shared geometry for the two rotation planes: RotationChart (single kind, on the
  deep views) and UnifiedRotationChart (all three kinds, on Home). Extracted so the
  two charts can never drift on the clamp range, the trail building, or the axis
  extent. The normalization is Mansfield Relative Performance (see docs/RAG.md):
  ratio on x, momentum on y, both centered at 100, clamped to [55, 145] to match
  the worker's trail clamp so one stray point cannot blow out the axis range.
*/

// Clamp matches the worker's trail clamp (55..145).
export const clampVal = (v) => Math.max(55, Math.min(145, v));

// Truncate a head label so it does not overrun the plane on the right edge.
export function truncate(label, n = 16) {
  const s = String(label || "");
  return s.length > n ? `${s.slice(0, n - 1)}…` : s;
}

// Activate a point on Enter or Space, mirroring click-to-navigate.
export function onPointKey(e, go) {
  if (e.key === "Enter" || e.key === " " || e.key === "Spacebar") {
    e.preventDefault();
    go();
  }
}

// The points to plot for one entity: its trail (oldest to newest) if present and
// well-formed, otherwise just the head [ratio, momentum]. Every point is clamped
// defensively in case an artifact slips an out-of-range value through.
export function trailPoints(e) {
  const raw = Array.isArray(e.trail) ? e.trail : null;
  const pts = (raw && raw.length ? raw : [[e.ratio, e.momentum]])
    .filter((p) => Array.isArray(p) && p.length >= 2 && Number.isFinite(p[0]) && Number.isFinite(p[1]))
    .map((p) => [clampVal(p[0]), clampVal(p[1])]);
  // Fall back to the head if filtering emptied the trail.
  if (!pts.length) pts.push([clampVal(e.ratio), clampVal(e.momentum)]);
  return pts;
}

// Symmetric half-extent around 100 that spans ALL plotted trail points (each trace
// carries a `.points` array of [ratio, momentum]), so toggling a topic's visibility
// never warps the layout. At least `floor`, then padded by `pad`.
export function axisExtent(traces, floor = 1.5, pad = 1.18) {
  let d = floor;
  for (const t of traces) {
    for (const [rx, my] of t.points) {
      d = Math.max(d, Math.abs(rx - 100), Math.abs(my - 100));
    }
  }
  return d * pad;
}
