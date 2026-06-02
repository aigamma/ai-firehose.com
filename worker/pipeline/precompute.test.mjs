import { test } from "node:test";
import assert from "node:assert/strict";
import { pca2d } from "./precompute.mjs";

test("pca2d returns normalized 2D points, deterministically", () => {
  const vecs = [
    [1, 0, 0, 0],
    [0, 1, 0, 0],
    [1, 1, 0, 0],
    [0, 0, 1, 1],
  ];
  const a = pca2d(vecs);
  const b = pca2d(vecs);
  assert.equal(a.length, 4);
  for (const p of a) {
    assert.ok(p.x >= -1 && p.x <= 1, "x normalized");
    assert.ok(p.y >= -1 && p.y <= 1, "y normalized");
  }
  assert.deepEqual(a, b, "deterministic across runs");
});
