/*
  Rotation board construction, extracted from run.mjs so the same pure logic can
  be replayed offline (worker/pipeline/recompute_boards.mjs) without re-running
  the whole ingest. computeBoards reproduces exactly what run.mjs does for the
  per-kind, per-horizon attention boards:

    buildSeries (raw weighted daily mentions per kind per concept)
    -> decayedLevel per kind   (the smooth, price-like level the rotation math eats)
    -> rotationForEntities per kind per horizon
    -> attach label + windowed (per-horizon) displayed attention
    -> filter attention > 0
    -> sort by attention desc
    -> slice top 16

  It returns a flat map keyed `${kind}_${horizon}` to the entities array, so a
  caller can wrap each in the served envelope. Entities carry a `sparkline` trace alongside the displayed `attention` and the
  `delta`/`trend` heat read; the old rotation `trail` trajectory was removed. Pure: no I/O,
  no clock; the caller supplies todayMs so day-windows are reproducible.
*/
import { buildSeries, windowSum, windowTrend, decayedLevel } from "./attention.mjs";
import { rotationForEntities } from "./rotation.mjs";

const round1 = (x) => Math.round(x * 10) / 10;
const round2 = (x) => Math.round(x * 100) / 100;

export function computeBoards(working, { todayMs, retentionDays, horizons, kinds }) {
  const kindKeys = kinds.map((k) => k.key);
  const { byKind, labels } = buildSeries(working, { days: retentionDays, todayMs });
  // Rotation runs on the smooth decayed level; the displayed attention stays the
  // raw weighted mentions in the horizon's window.
  const levelByKind = {};
  for (const kind of kindKeys) {
    levelByKind[kind] = Object.fromEntries(
      Object.entries(byKind[kind] || {}).map(([id, s]) => [id, decayedLevel(s)])
    );
  }
  const boards = {};
  for (const kind of kindKeys) {
    const series = byKind[kind] || {};
    for (const h of horizons) {
      const ranked = rotationForEntities(levelByKind[kind], h.windows)
        .map((r) => {
          const wt = windowTrend(series[r.id] || [], h.days);
          return {
            id: r.id,
            label: labels[r.id] || r.id,
            attention: Math.round(windowSum(series[r.id] || [], h.days)),
            rs: r.rs,
            ratio: r.ratio,
            momentum: r.momentum,
            quadrant: r.quadrant,
            // The heat signal the ranked boards sort by: `delta` is the absolute
            // growth in weighted attention this window versus the prior equal
            // window, `trend` its [-1, 1] normalization for the up/steady/down
            // arrow. Both are clamp-free (windowTrend in attention.mjs).
            trend: round2(wt.trend),
            delta: round1(wt.delta),
            sparkline: r.sparkline,
            outlier: r.outlier,
          };
        })
        .filter((e) => e.attention > 0)
        .sort((a, b) => b.attention - a.attention);
      boards[`${kind}_${h.key}`] = ranked.slice(0, 16);
    }
  }
  return boards;
}
