import { test } from "node:test";
import assert from "node:assert/strict";
import { pruneByRetention } from "./retention.mjs";

// Core contract: Retention, a self-expiring corpus (CLAUDE.md "Retention").
// The prune is idempotent and keyed on the effective timestamp (published_at,
// falling back to ingested_at). These tests pin the exact boundary and the
// undateable-item fallback so the rolling quarter cannot silently drift.

const DAY = 86400000;
const NOW = Date.UTC(2026, 5, 2); // 2026-06-02, the project's "today"
const RETENTION = 100;
const cutoff = NOW - RETENTION * DAY;
const iso = (ms) => new Date(ms).toISOString();

test("removes an item published well past the retention cutoff", () => {
  const store = {
    old: { published_at: iso(cutoff - 30 * DAY) }, // a month past the edge
  };
  pruneByRetention(store, { nowMs: NOW, retentionDays: RETENTION });
  assert.deepEqual(Object.keys(store), [], "the aged-out item is deleted");
});

test("keeps a fresh item inside the window", () => {
  const store = {
    fresh: { published_at: iso(NOW - 5 * DAY) },
  };
  pruneByRetention(store, { nowMs: NOW, retentionDays: RETENTION });
  assert.deepEqual(Object.keys(store), ["fresh"], "the recent item is kept");
});

test("the exact-cutoff boundary is kept (strict less-than)", () => {
  // An item whose effective timestamp equals the cutoff is NOT older than the
  // window (t < cutoff is false), so it survives. One millisecond earlier dies.
  const store = {
    onEdge: { published_at: iso(cutoff) },
    justBefore: { published_at: iso(cutoff - 1) },
  };
  pruneByRetention(store, { nowMs: NOW, retentionDays: RETENTION });
  assert.deepEqual(Object.keys(store), ["onEdge"], "exact cutoff stays, one ms older goes");
});

test("an undateable item is pruned by ingested_at once outside the window", () => {
  // Missing or unparseable published_at falls back to ingested_at. An item that
  // first entered the store more than a quarter ago expires rather than living
  // forever; one that entered recently is kept even though it has no valid date.
  const store = {
    missingOld: { published_at: undefined, ingested_at: cutoff - 10 * DAY },
    missingFresh: { published_at: undefined, ingested_at: NOW - 3 * DAY },
    garbageOld: { published_at: "not a date", ingested_at: cutoff - 1 },
    garbageFresh: { published_at: "not a date", ingested_at: NOW - DAY },
  };
  pruneByRetention(store, { nowMs: NOW, retentionDays: RETENTION });
  assert.deepEqual(
    Object.keys(store).sort(),
    ["garbageFresh", "missingFresh"],
    "undateable but fresh-by-ingest survive; undateable and old-by-ingest are pruned"
  );
});

test("an item with no ageable timestamp at all is kept (no finite t)", () => {
  // Neither a parseable published_at nor a finite ingested_at: the original
  // Number.isFinite(t) guard means it cannot be aged out yet, so it stays.
  const store = {
    noStamps: { published_at: "", ingested_at: undefined },
  };
  pruneByRetention(store, { nowMs: NOW, retentionDays: RETENTION });
  assert.deepEqual(Object.keys(store), ["noStamps"], "an item with no timestamp is retained");
});

test("prune mutates in place and returns the same store object", () => {
  const store = { a: { published_at: iso(cutoff - DAY) }, b: { published_at: iso(NOW) } };
  const ret = pruneByRetention(store, { nowMs: NOW, retentionDays: RETENTION });
  assert.equal(ret, store, "returns the same reference it mutated");
  assert.deepEqual(Object.keys(store), ["b"]);
});
