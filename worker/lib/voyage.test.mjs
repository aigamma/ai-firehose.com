import { test } from "node:test";
import assert from "node:assert/strict";
import { orderEmbeddings } from "./voyage.mjs";

test("orderEmbeddings places each embedding at its input index, regardless of response order", () => {
  const data = [
    { index: 2, embedding: [3] },
    { index: 0, embedding: [1] },
    { index: 1, embedding: [2] },
  ];
  assert.deepEqual(orderEmbeddings(data, 3), [[1], [2], [3]]);
});

test("orderEmbeddings preserves an already-in-order response", () => {
  const data = [
    { index: 0, embedding: [1] },
    { index: 1, embedding: [2] },
  ];
  assert.deepEqual(orderEmbeddings(data, 2), [[1], [2]]);
});
