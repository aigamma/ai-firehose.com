/*
  Relative-rotation engine.

  Mansfield Relative Performance (Roy Mansfield, 1979) normalization, with an EMA
  in place of his original 52-week SMA so old samples decay smoothly, applied to
  attention instead of price. This is the same prior-art math aigamma.com cites.
  Not "RRG" (a trademark); we say "rotation plane".

  Input is a per-entity daily attention series (oldest to newest, equal length,
  bounded by the retained quarter). Output is RS, rotation ratio, rotation
  momentum, the quadrant, a sparkline, and outlier flags.
*/
import { ema, quadrantOf, percentileRank } from "../../src/lib/rotation.js";

const round1 = (x) => Math.round(x * 10) / 10;
const mean = (a) => (a.length ? a.reduce((s, x) => s + x, 0) / a.length : 0);
function zscore(arr, x) {
  if (arr.length < 2) return NaN;
  const m = mean(arr);
  const sd = Math.sqrt(mean(arr.map((v) => (v - m) ** 2)));
  return sd > 0 ? (x - m) / sd : 0;
}

// RS_t = 100 * attention_e / attention_market (the SPY analog is the per-day
// total attention across all entities of the kind).
export function relativeStrengthSeries(entitySeries, benchmarkSeries) {
  return entitySeries.map((v, i) => {
    const b = benchmarkSeries[i];
    return b > 0 ? (100 * v) / b : 0;
  });
}

// The three-stage construction: pre-smooth RS, express as a percentage of its
// slow EMA (the ratio arm), then the same percentage operation on the ratio with
// a faster smoother (the momentum arm).
export function computeRotation(entitySeries, benchmarkSeries, windows) {
  const { smooth, slow, fast } = windows;
  const rs = relativeStrengthSeries(entitySeries, benchmarkSeries);
  const sRS = ema(rs, smooth);
  const sRSslow = ema(sRS, slow);
  const ratioSeries = sRS.map((v, i) => (sRSslow[i] > 0 ? (100 * v) / sRSslow[i] : 100));
  const ratioFast = ema(ratioSeries, fast);
  const momentumSeries = ratioSeries.map((v, i) => (ratioFast[i] > 0 ? (100 * v) / ratioFast[i] : 100));
  const n = entitySeries.length;
  const ratio = ratioSeries[n - 1];
  const momentum = momentumSeries[n - 1];
  return {
    rs: round1(rs[n - 1] || 0),
    ratio: round1(ratio),
    momentum: round1(momentum),
    quadrant: quadrantOf(ratio, momentum),
    ratioSeries,
    momentumSeries,
    sparkline: entitySeries.slice(-8).map((x) => Math.round(x)),
  };
}

// Outlier hunt: breakout (extreme momentum z-score over the trailing
// distribution), new entrant (only recently nonzero), and quadrant jump.
export function flagOutliers(entitySeries, ratioSeries, momentumSeries, prevQuadrant = null) {
  const n = entitySeries.length;
  const z = zscore(momentumSeries.slice(0, -1), momentumSeries[n - 1]);
  const pct = percentileRank(entitySeries.slice(0, -1), entitySeries[n - 1]);
  const head = entitySeries.slice(0, Math.max(1, n - 3));
  const newEntrant = head.every((x) => x === 0) && entitySeries[n - 1] > 0;
  const curQ = quadrantOf(ratioSeries[n - 1], momentumSeries[n - 1]);
  return {
    breakout: Number.isFinite(z) && z >= 2,
    new_entrant: newEntrant,
    quadrant_jump: prevQuadrant != null && prevQuadrant !== curQ,
    momentum_z: Number.isFinite(z) ? round1(z) : null,
    attention_pct: pct == null ? null : Math.round(pct),
  };
}

// Compute rotation for many entities. entityToSeries maps id -> daily attention
// (equal length). The benchmark is the per-day sum across all entities.
export function rotationForEntities(entityToSeries, windows, prevQuadrants = {}) {
  const entries = Object.entries(entityToSeries);
  if (!entries.length) return [];
  const len = entries[0][1].length;
  const benchmark = new Array(len).fill(0);
  for (const [, s] of entries) for (let i = 0; i < len; i += 1) benchmark[i] += s[i] || 0;
  return entries.map(([id, series]) => {
    const r = computeRotation(series, benchmark, windows);
    const outlier = flagOutliers(series, r.ratioSeries, r.momentumSeries, prevQuadrants[id] ?? null);
    return {
      id,
      attention: Math.round(series[len - 1] || 0),
      rs: r.rs,
      ratio: r.ratio,
      momentum: r.momentum,
      quadrant: r.quadrant,
      sparkline: r.sparkline,
      outlier,
    };
  });
}
