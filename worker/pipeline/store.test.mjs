import { test } from "node:test";
import assert from "node:assert/strict";
import { collapseStore } from "./store.mjs";

test("collapseStore prefers this run's version of a re-edited source item", () => {
  const store = {
    "opinion::youtube::vid::OLD": { source: "youtube", source_id: "vid", title: "old title", published_at: "2026-05-01" },
    "opinion::youtube::vid::NEW": { source: "youtube", source_id: "vid", title: "new title", published_at: "2026-05-01" },
  };
  // Even though published_at ties, the run's freshly classified id must win.
  for (const order of [["OLD", "NEW"], ["NEW", "OLD"]]) {
    const s = {};
    for (const k of order) s[`opinion::youtube::vid::${k}`] = store[`opinion::youtube::vid::${k}`];
    const out = collapseStore(s, new Set(["opinion::youtube::vid::NEW"]));
    assert.deepEqual(Object.keys(out), ["opinion::youtube::vid::NEW"]);
    assert.equal(out["opinion::youtube::vid::NEW"].title, "new title");
  }
});

test("collapseStore keeps the most recently published when neither is from this run", () => {
  const store = {
    "t::hn::1::A": { source: "hackernews", source_id: "1", published_at: "2026-04-01" },
    "t::hn::1::B": { source: "hackernews", source_id: "1", published_at: "2026-05-01" },
  };
  const out = collapseStore(store, new Set());
  assert.deepEqual(Object.keys(out), ["t::hn::1::B"]);
});

test("collapseStore leaves distinct source items untouched", () => {
  const store = {
    a: { source: "arxiv", source_id: "1", published_at: "2026-05-01" },
    b: { source: "arxiv", source_id: "2", published_at: "2026-05-01" },
    c: { source: "github", source_id: "1", published_at: "2026-05-01" },
  };
  const out = collapseStore(store, new Set());
  assert.equal(Object.keys(out).length, 3);
});
