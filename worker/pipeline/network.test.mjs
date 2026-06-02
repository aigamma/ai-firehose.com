import { test } from "node:test";
import assert from "node:assert/strict";
import { computeNeighbors, computeClusters, computeInfluence } from "./network.mjs";

const canon = [
  { id: "a", label: "A", vec: [1, 0, 0] },
  { id: "b", label: "B", vec: [0.95, 0.05, 0] },
  { id: "c", label: "C", vec: [0, 0, 1] },
  { id: "d", label: "D", vec: [0, 0.05, 0.95] },
];

test("computeNeighbors ranks the closest concept first", () => {
  const n = computeNeighbors(canon, { k: 2 });
  assert.equal(n.a[0].id, "b");
  assert.equal(n.c[0].id, "d");
});

test("computeInfluence builds co-mention edges", () => {
  const canonById = Object.fromEntries(canon.map((c) => [c.id, c]));
  const working = [{ concepts: ["A", "B"] }, { concepts: ["A", "B"] }];
  const g = computeInfluence(working, canonById, { minCount: 2 });
  assert.equal(g.edges.length, 1);
  assert.equal(g.edges[0].count, 2);
});

test("computeClusters partitions every concept", () => {
  const clusters = computeClusters(canon, { a: 5, b: 4, c: 3, d: 2 });
  const total = clusters.reduce((s, c) => s + c.size, 0);
  assert.equal(total, canon.length);
});
