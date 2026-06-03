import { test } from "node:test";
import assert from "node:assert/strict";
import { buildAtlas } from "./atlas.mjs";

// A small fixture across three categories with a known related mesh. Two cross-category
// links A<->B (one in each direction, both fold into the single undirected A,B edge),
// one cross-category link A<->C, and one same-category link inside A.
const FIXTURE = [
  { slug: "a1", title: "A One", kind: "technique", category: "Alpha", related: ["a2", "b1"] }, // a1->a2 internal, a1->b1 cross
  { slug: "a2", title: "A Two", kind: "technique", category: "Alpha", related: ["c1"] }, // a2->c1 cross
  { slug: "b1", title: "B One", kind: "tool", category: "Beta", related: ["a1"] }, // b1->a1 cross (folds into Alpha,Beta)
  { slug: "c1", title: "C One", kind: "opinion", category: "Gamma", related: ["nonexistent"] }, // dangling target: ignored
];

test("buildAtlas counts categories, concepts, and cross-links", () => {
  const atlas = buildAtlas(FIXTURE, { generated: "2026-06-03" });
  assert.equal(atlas.categoryCount, 3);
  assert.equal(atlas.conceptCount, 4);
  assert.equal(atlas.generated, "2026-06-03");
  // Cross-links: Alpha-Beta has weight 2 (a1->b1 and b1->a1), Alpha-Gamma weight 1.
  assert.equal(atlas.edges.length, 2);
  assert.equal(atlas.crossLinks, 3);
  assert.equal(atlas.maxEdgeWeight, 2);
});

test("cross-category edges are undirected and correctly weighted", () => {
  const atlas = buildAtlas(FIXTURE);
  const ab = atlas.edges.find((e) => e.a === "Alpha" && e.b === "Beta");
  const ag = atlas.edges.find((e) => e.a === "Alpha" && e.b === "Gamma");
  assert.ok(ab && ag);
  assert.equal(ab.weight, 2);
  assert.equal(ag.weight, 1);
  // Edges are emitted heaviest-first.
  assert.deepEqual(atlas.edges.map((e) => e.weight), [2, 1]);
  // Endpoints are ordered a < b lexicographically.
  for (const e of atlas.edges) assert.ok(e.a < e.b, `${e.a} should sort before ${e.b}`);
});

test("same-category links land in internalLinks, not edges", () => {
  const atlas = buildAtlas(FIXTURE);
  const alpha = atlas.categories.find((c) => c.name === "Alpha");
  assert.equal(alpha.internalLinks, 1); // a1->a2
  assert.equal(alpha.count, 2);
});

test("a related pointer to a non-authored concept is not an edge", () => {
  const atlas = buildAtlas(FIXTURE);
  // c1 -> "nonexistent" must not create a Gamma edge or inflate any weight.
  assert.ok(!atlas.edges.some((e) => e.a === "Gamma" || e.b === "Gamma" ? e.weight > 1 : false));
  const gamma = atlas.categories.find((c) => c.name === "Gamma");
  assert.equal(gamma.internalLinks, 0);
});

test("category nodes sit on the unit circle, ordered by count then name", () => {
  const atlas = buildAtlas(FIXTURE);
  // Alpha (count 2) is largest, so it is first and sits at the top (angle -pi/2).
  assert.equal(atlas.categories[0].name, "Alpha");
  // Beta and Gamma both have count 1; the name tiebreak puts Beta before Gamma.
  assert.deepEqual(atlas.categories.map((c) => c.name), ["Alpha", "Beta", "Gamma"]);
  for (const c of atlas.categories) {
    // Positions are stored to 4 decimals, so the unit-circle invariant holds only to
    // within that rounding (~2e-4), not to machine epsilon.
    assert.ok(Math.abs(c.x * c.x + c.y * c.y - 1) < 1e-3, `${c.name} should lie on the unit circle`);
    assert.ok(c.r > 0 && c.r < 0.1, `${c.name} radius should be a small normalized fraction`);
    assert.ok(c.hue >= 0 && c.hue < 360);
  }
  // First node is at the top of the circle (y = -1 in screen coords).
  assert.ok(Math.abs(atlas.categories[0].y + 1) < 1e-3);
});

test("top concepts are ranked by outgoing link degree", () => {
  const atlas = buildAtlas(FIXTURE);
  const alpha = atlas.categories.find((c) => c.name === "Alpha");
  // a1 has 2 related links, a2 has 1, so a1 leads.
  assert.equal(alpha.top[0].slug, "a1");
  assert.equal(alpha.top.length, 2);
});

test("output is deterministic across runs", () => {
  const a = buildAtlas(FIXTURE, { generated: "x" });
  const b = buildAtlas(FIXTURE, { generated: "x" });
  assert.deepEqual(a, b);
});

test("empty input is handled without throwing", () => {
  const atlas = buildAtlas([], { generated: "z" });
  assert.equal(atlas.categoryCount, 0);
  assert.equal(atlas.conceptCount, 0);
  assert.deepEqual(atlas.edges, []);
  assert.equal(atlas.maxEdgeWeight, 0);
});
