import { test } from "node:test";
import assert from "node:assert/strict";
import { withTimeout } from "./index.mjs";

test("withTimeout resolves with the value when the work finishes in time", async () => {
  const v = await withTimeout(Promise.resolve(42), 1000, "fast");
  assert.equal(v, 42);
});

test("withTimeout rejects with a named budget error when the work overruns", async () => {
  const slow = new Promise((r) => setTimeout(() => r("late"), 100));
  await assert.rejects(() => withTimeout(slow, 10, "slow"), /slow exceeded its 10ms budget/);
});

test("withTimeout clears its guard timer so a fast resolve does not keep the loop alive", async () => {
  // A long budget with a fast resolve must not hold the process open; if the timer
  // were not cleared this test would hang the suite rather than return promptly.
  const v = await withTimeout(Promise.resolve("ok"), 600000, "long-budget");
  assert.equal(v, "ok");
});
