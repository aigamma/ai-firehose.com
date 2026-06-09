import { test } from "node:test";
import assert from "node:assert/strict";
import { quadrantOf, ema, percentileRank } from "./rotation.js";

// rotation.js holds the relative-rotation helpers (ported from aigamma) the front end
// uses to place a concept on the 100-centered ratio/momentum plane. Pure math, so the
// tests pin the quadrant boundaries, the EMA seeding and smoothing, and the percentile
// rank directly.

test("quadrantOf assigns the four quadrants on the 100-centered scale", () => {
  assert.equal(quadrantOf(120, 110), "leading"); // outperforming and gaining
  assert.equal(quadrantOf(120, 90), "weakening"); // outperforming but fading
  assert.equal(quadrantOf(80, 90), "lagging"); // trailing and fading
  assert.equal(quadrantOf(80, 110), "improving"); // trailing but gaining
  // 100 reads as the high side of each axis
  assert.equal(quadrantOf(100, 100), "leading");
  assert.equal(quadrantOf(100, 99.9), "weakening");
  assert.equal(quadrantOf(99.9, 100), "improving");
});

test("ema returns [] for empty input and seeds with the first value", () => {
  assert.deepEqual(ema([], 5), []);
  assert.deepEqual(ema([7], 5), [7]);
});

test("ema with window 1 tracks the input exactly (k = 1)", () => {
  assert.deepEqual(ema([0, 10, 4], 1), [0, 10, 4]);
});

test("ema smooths a step toward the new level (0 < k < 1)", () => {
  // window 3 -> k = 2/(3+1) = 0.5, so the second sample is halfway to 10
  assert.equal(ema([0, 10], 3)[1], 5);
});

test("percentileRank is the share of values strictly below the target", () => {
  assert.equal(percentileRank([1, 2, 3, 4], 3), 50); // 1 and 2 are below 3
  assert.equal(percentileRank([1, 2, 3, 4], 1), 0); // none below
  assert.equal(percentileRank([1, 2, 3, 4], 5), 100); // all below
  assert.equal(percentileRank([], 3), null);
});
