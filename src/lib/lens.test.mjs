import test from "node:test";
import assert from "node:assert/strict";
import { toggleFollow, conceptIdsOf, filterByLens } from "./lens.js";

test("toggleFollow adds then removes a concept, immutably", () => {
  const a = [];
  const b = toggleFollow(a, "x");
  assert.deepEqual(b, ["x"]);
  assert.deepEqual(a, []); // the original is never mutated
  assert.deepEqual(toggleFollow(b, "x"), []);
  assert.deepEqual(toggleFollow(["a", "b"], "c"), ["a", "b", "c"]);
});

test("conceptIdsOf handles slug arrays, object arrays, and bare records", () => {
  assert.deepEqual(conceptIdsOf({ concepts: ["a", "b"] }), ["a", "b"]);
  assert.deepEqual(conceptIdsOf({ concepts: [{ slug: "a" }, { slug: "b" }] }), ["a", "b"]);
  assert.deepEqual(conceptIdsOf({ id: "z" }), ["z"]);
  assert.deepEqual(conceptIdsOf(null), []);
});

test("filterByLens narrows to followed concepts, and an empty lens is a no-op", () => {
  const items = [
    { id: "1", concepts: ["transformer", "attention"] },
    { id: "2", concepts: ["diffusion"] },
    { id: "3", concepts: [{ slug: "attention" }] },
  ];
  assert.equal(filterByLens(items, []).length, 3); // empty lens: full view, never empty
  assert.deepEqual(filterByLens(items, ["attention"]).map((i) => i.id), ["1", "3"]);
  assert.equal(filterByLens(items, ["nope"]).length, 0);
});
