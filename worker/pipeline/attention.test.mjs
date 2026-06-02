import { test } from "node:test";
import assert from "node:assert/strict";
import { decayedLevel, windowSum, dayIndexOf } from "./attention.mjs";

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
