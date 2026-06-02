/*
  Relative-rotation helpers, ported from aigamma.com (RotationChart.jsx and
  rotations.mjs). ratio and momentum are on a 100-centered scale: above 100
  leads the discourse "market" / is gaining, below 100 trails / is fading.
*/

// The four-quadrant assignment, identical in spirit to aigamma's quadrantOf.
export function quadrantOf(ratio, momentum) {
  if (ratio >= 100 && momentum >= 100) return "leading"; // outperforming, gaining
  if (ratio >= 100 && momentum < 100) return "weakening"; // outperforming, fading
  if (ratio < 100 && momentum < 100) return "lagging"; // trailing, fading
  return "improving"; // trailing, gaining
}

// Exponential moving average. Used to build the smoothed RS, the ratio, and the
// momentum (the three-stage construction). Window is in samples.
export function ema(values, window) {
  if (!values || values.length === 0) return [];
  const k = 2 / (window + 1);
  const out = [values[0]];
  for (let i = 1; i < values.length; i += 1) {
    out.push(values[i] * k + out[i - 1] * (1 - k));
  }
  return out;
}

// Percentile rank of a target within a distribution (0..100). Ported from the
// aigamma oscillator; used by the outlier hunt to place current attention in
// the trailing (quarter-bounded) distribution.
export function percentileRank(values, target) {
  if (!values || values.length === 0) return null;
  let below = 0;
  for (const v of values) if (v < target) below += 1;
  return (below / values.length) * 100;
}
