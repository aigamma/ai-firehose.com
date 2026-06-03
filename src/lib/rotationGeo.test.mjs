import { test } from "node:test";
import assert from "node:assert/strict";
import { clampVal, truncate, trailPoints, axisExtent, pruneForPlane } from "./rotationGeo.js";

// The shared rotation geometry and the unified-plane pruning are pure and offline,
// so they are unit-tested here (the chart components that use them are not). These
// guard the clamp band, the trail building, the axis extent, and, most importantly,
// the pruning rule that decides what the unified plane plots.

test("clampVal clamps to the 55..145 band", () => {
  assert.equal(clampVal(10), 55);
  assert.equal(clampVal(200), 145);
  assert.equal(clampVal(100), 100);
});

test("trailPoints clamps points and falls back to the head when the trail is empty or malformed", () => {
  assert.deepEqual(trailPoints({ trail: [[10, 200], [100, 100]] }), [[55, 145], [100, 100]]);
  assert.deepEqual(trailPoints({ ratio: 120, momentum: 80, trail: [] }), [[120, 80]]);
  assert.deepEqual(trailPoints({ ratio: 200, momentum: 10, trail: "bad" }), [[145, 55]]);
});

test("axisExtent is symmetric around 100, floored, and padded", () => {
  // All points at center: the floor (1.5) times the pad (1.18).
  assert.ok(Math.abs(axisExtent([{ points: [[100, 100]] }]) - 1.5 * 1.18) < 1e-9);
  // Spans the largest deviation from 100 across all points.
  assert.ok(Math.abs(axisExtent([{ points: [[120, 100], [100, 70]] }]) - 30 * 1.18) < 1e-9);
});

test("truncate adds an ellipsis only past the limit", () => {
  assert.equal(truncate("short", 16), "short");
  assert.equal(truncate("a very long label indeed", 10), "a very lo…");
});

test("pruneForPlane keeps at least one per kind even when nothing is moving", () => {
  // Three dead-center entities (no movement, no flags): the floor keeps one per kind
  // rather than letting the interest gate empty a kind.
  const flat = [
    { kind: "technique", id: "t1", attention: 9, ratio: 100, momentum: 100, outlier: {} },
    { kind: "tool", id: "to1", attention: 8, ratio: 100, momentum: 100, outlier: {} },
    { kind: "opinion", id: "o1", attention: 7, ratio: 100, momentum: 100, outlier: {} },
  ];
  const kept = pruneForPlane(flat);
  assert.equal(kept.length, 3);
  assert.deepEqual(new Set(kept.map((e) => e.kind)), new Set(["technique", "tool", "opinion"]));
});

test("pruneForPlane drops new entrants and keeps real movers", () => {
  const ents = [
    { kind: "technique", id: "mover", attention: 5, ratio: 130, momentum: 130, outlier: {} },
    { kind: "technique", id: "newbie", attention: 100, ratio: 145, momentum: 145, outlier: { new_entrant: true } },
    { kind: "technique", id: "flat", attention: 4, ratio: 101, momentum: 100, outlier: {} },
  ];
  const ids = pruneForPlane(ents).map((e) => e.id);
  assert.ok(ids.includes("mover"), "the real mover is plotted");
  assert.ok(!ids.includes("newbie"), "the new entrant is excluded from the plane");
});

test("pruneForPlane caps the plane at the registry maxTotal", () => {
  const many = Array.from({ length: 30 }, (_, i) => ({
    kind: i % 2 ? "tool" : "technique",
    id: `m${i}`,
    attention: 100 - i,
    ratio: 130,
    momentum: 130,
    outlier: {},
  }));
  assert.ok(pruneForPlane(many).length <= 15, "the plane never plots more than maxTotal");
});
