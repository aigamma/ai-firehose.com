// Offline unit check for the rotation engine. Run: node worker/pipeline/rotation.test.mjs
import assert from "node:assert/strict";
import { computeRotation, rotationForEntities } from "./rotation.mjs";

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

console.log("rotation.test.mjs OK:", { quadrant: r.quadrant, ratio: r.ratio, momentum: r.momentum });
