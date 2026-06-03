import { test } from "node:test";
import assert from "node:assert/strict";
import { decayedLevel, windowSum, windowTrend, dayIndexOf } from "./attention.mjs";

test("windowSum sums the last N samples", () => {
  assert.equal(windowSum([1, 2, 3, 4], 2), 7);
  assert.equal(windowSum([5], 3), 5);
});

test("decayedLevel smooths a spike into a fading tail", () => {
  const out = decayedLevel([0, 0, 5, 0, 0], 10);
  assert.equal(out[2], 5);
  assert.ok(out[3] > 0 && out[3] < 5, "decays after the spike");
  assert.ok(out[4] < out[3], "monotonic decay");
});

test("dayIndexOf maps recent dates into the window and rejects old ones", () => {
  const today = Date.parse("2026-06-02T00:00:00Z");
  assert.equal(dayIndexOf("2026-05-31T00:00:00Z", today, 5), 2); // days - 1 - 2
  assert.equal(dayIndexOf("2000-01-01", today, 5), -1);
});

test("windowTrend measures growth this window vs the prior equal window", () => {
  // Last 2 days vs the 2 before: now = 3+4 = 7, prev = 1+2 = 3.
  const rising = windowTrend([1, 2, 3, 4], 2);
  assert.equal(rising.now, 7);
  assert.equal(rising.prev, 3);
  assert.equal(rising.delta, 4);
  assert.ok(rising.trend > 0 && rising.trend <= 1, "growth trends up, bounded");

  // A faded topic: attention was all in the prior window, none now.
  const faded = windowTrend([5, 5, 0, 0], 2);
  assert.equal(faded.delta, -10);
  assert.equal(faded.trend, -1);

  // A freshly surfaced concept (nothing before this window) saturates to +1.
  assert.equal(windowTrend([0, 0, 4, 3], 2).trend, 1);

  // Flat and empty are both neutral, never NaN.
  assert.equal(windowTrend([3, 3, 3, 3], 2).trend, 0);
  assert.equal(windowTrend([], 7).trend, 0);
  assert.equal(windowTrend([0, 0], 1).trend, 0);
});
