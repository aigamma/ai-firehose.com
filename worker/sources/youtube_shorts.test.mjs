import { test } from "node:test";
import assert from "node:assert/strict";
import { verdictFromStatus, shortIdSet, partitionByVerdict } from "./youtube_shorts.mjs";

test("verdictFromStatus: 200 is a Short", () => {
  assert.equal(verdictFromStatus(200), true);
});

test("verdictFromStatus: any 3xx is a regular video (redirect to /watch)", () => {
  for (const s of [301, 302, 303, 307, 308]) assert.equal(verdictFromStatus(s), false);
});

test("verdictFromStatus: errors and other codes are undetermined (fail open)", () => {
  for (const s of [0, 403, 404, 429, 500, 503]) assert.equal(verdictFromStatus(s), null);
});

test("shortIdSet: only verdict === true ids, never false/null/undefined", () => {
  const set = shortIdSet({ a: true, b: false, c: null, d: true, e: undefined });
  assert.deepEqual([...set].sort(), ["a", "d"]);
  assert.equal(shortIdSet({}).size, 0);
  assert.equal(shortIdSet().size, 0);
});

test("partitionByVerdict: splits known Shorts, known regular, and unprobed", () => {
  const { shorts, regular, unknown } = partitionByVerdict(["a", "b", "c", "d"], { a: true, b: false, c: true });
  assert.deepEqual(shorts, ["a", "c"]);
  assert.deepEqual(regular, ["b"]);
  assert.deepEqual(unknown, ["d"]);
});

test("partitionByVerdict: empty verdicts leaves everything unknown", () => {
  const { shorts, regular, unknown } = partitionByVerdict(["x", "y"], {});
  assert.deepEqual(shorts, []);
  assert.deepEqual(regular, []);
  assert.deepEqual(unknown, ["x", "y"]);
});
