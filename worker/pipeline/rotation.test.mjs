// Offline unit check for the rotation engine. Run: node worker/pipeline/rotation.test.mjs
import assert from "node:assert/strict";
import { computeRotation, rotationForEntities, flagOutliers } from "./rotation.mjs";

const len = 30;
const rising = Array.from({ length: len }, (_, i) => 10 + i); // 10..39, steadily gaining share
const flat = Array.from({ length: len }, () => 20);
const benchmark = rising.map((v, i) => v + flat[i]);

const r = computeRotation(rising, benchmark, { smooth: 3, slow: 14, fast: 5 });
assert.ok(Number.isFinite(r.ratio) && Number.isFinite(r.momentum), "finite ratio and momentum");
assert.ok(["leading", "improving", "weakening", "lagging"].includes(r.quadrant), "valid quadrant");
assert.equal(r.sparkline.length, 8, "sparkline has 8 points");
assert.ok(r.ratio > 100, "a steadily gaining entity should lead the market (ratio > 100)");

const rows = rotationForEntities({ rising, flat }, { smooth: 3, slow: 14, fast: 5 });
assert.equal(rows.length, 2, "two entities returned");
assert.ok(rows.every((x) => x.id && x.quadrant && Number.isFinite(x.ratio)), "rows are well formed");

// Degenerate series must never emit NaN/Infinity to the boards: a single-mention
// concept is a mostly-zero series, and this math runs unattended for a quarter.
for (const series of [[0], [7], [0, 0, 0, 0], [0, 0, 0, 5]]) {
  const d = computeRotation(series, series.map(() => 10), { smooth: 3, slow: 14, fast: 5 });
  assert.ok(Number.isFinite(d.ratio) && Number.isFinite(d.momentum) && Number.isFinite(d.rs), "degenerate series stays finite");
  assert.ok(["leading", "improving", "weakening", "lagging"].includes(d.quadrant), "degenerate quadrant valid");
}
const empty = computeRotation([], [], { smooth: 3, slow: 14, fast: 5 });
assert.ok(Number.isFinite(empty.ratio) && Number.isFinite(empty.momentum), "empty series is total, no NaN");
const fo = flagOutliers([5], [100], [100], null);
assert.equal(fo.breakout, false, "no breakout on a single point");
assert.equal(fo.momentum_z, null, "z is null on a single point");

console.log("rotation.test.mjs OK:", { quadrant: r.quadrant, ratio: r.ratio, momentum: r.momentum });
