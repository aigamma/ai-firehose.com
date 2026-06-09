import { test } from "node:test";
import assert from "node:assert/strict";
import { itemKey, publishedMs, isNewSince, countNewSince, clearedCount, allCleared } from "./seen.js";

// seen.js is the pure core of the returning-visitor layer ("new since your last visit"
// and the read/cleared "you have cleared this window's wire" completion signal). It is
// deliberately free of React and localStorage (the hook owns those), so these tests pin
// the set math and date comparison directly.

test("itemKey prefers url, then id, then empty string", () => {
  assert.equal(itemKey({ url: "u", id: "i" }), "u");
  assert.equal(itemKey({ id: "i" }), "i");
  assert.equal(itemKey({}), "");
  assert.equal(itemKey(null), "");
});

test("publishedMs parses published_at to epoch ms, else NaN", () => {
  assert.equal(publishedMs({ published_at: "2026-06-01T00:00:00Z" }), Date.parse("2026-06-01T00:00:00Z"));
  assert.ok(Number.isNaN(publishedMs({})));
  assert.ok(Number.isNaN(publishedMs({ published_at: "not a date" })));
  assert.ok(Number.isNaN(publishedMs(null)));
});

test("isNewSince is true only for items published after a real prior visit", () => {
  const since = Date.parse("2026-06-01T00:00:00Z");
  assert.equal(isNewSince({ published_at: "2026-06-02T00:00:00Z" }, since), true);
  assert.equal(isNewSince({ published_at: "2026-05-31T00:00:00Z" }, since), false);
  assert.equal(isNewSince({ published_at: "2026-06-02T00:00:00Z" }, 0), false, "first-ever visit has no baseline");
  assert.equal(isNewSince({ published_at: "not a date" }, since), false);
});

test("countNewSince counts items published after the last visit, tolerating junk input", () => {
  const since = Date.parse("2026-06-01T00:00:00Z");
  const items = [
    { published_at: "2026-06-03T00:00:00Z" },
    { published_at: "2026-06-02T00:00:00Z" },
    { published_at: "2026-05-30T00:00:00Z" },
  ];
  assert.equal(countNewSince(items, since), 2);
  assert.equal(countNewSince([], since), 0);
  assert.equal(countNewSince(null, since), 0);
});

test("clearedCount counts items whose key is in the read set (Set or array)", () => {
  const items = [{ url: "a" }, { url: "b" }, { url: "c" }];
  assert.equal(clearedCount(items, new Set(["a", "c"])), 2);
  assert.equal(clearedCount(items, ["a"]), 1);
  assert.equal(clearedCount(items, new Set()), 0);
});

test("allCleared is true only when there is at least one item and all are cleared", () => {
  const items = [{ url: "a" }, { url: "b" }];
  assert.equal(allCleared(items, new Set(["a", "b"])), true);
  assert.equal(allCleared(items, new Set(["a"])), false);
  assert.equal(allCleared([], new Set()), false, "an empty window is not a cleared one");
});
