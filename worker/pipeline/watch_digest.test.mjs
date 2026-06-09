import { test } from "node:test";
import assert from "node:assert/strict";
import { recentVideos, buildWatchDigestState, stateHash } from "./watch_digest.mjs";

const registry = {
  channels: [
    { channel_id: "UCa", name: "Anchor Teacher", recommended: true },
    { channel_id: "UCb", name: "Plain Channel" },
  ],
};

test("recentVideos keeps youtube items, sorts newest first, and tags the inner circle", () => {
  const items = [
    { source: "youtube", source_id: "v1", title: "Old", url: "u1", published_at: "2026-05-01T00:00:00Z", author_or_channel: "Anchor Teacher" },
    { source: "youtube", source_id: "v2", title: "New", url: "u2", published_at: "2026-06-01T00:00:00Z", author_or_channel: "Plain Channel" },
    { source: "arxiv", source_id: "x1", title: "Paper", url: "u3", published_at: "2026-06-02T00:00:00Z", author_or_channel: "Anchor Teacher" }, // non-youtube dropped
    { source: "youtube", source_id: "v3", title: "", url: "u4", published_at: "2026-06-03T00:00:00Z" }, // titleless dropped
  ];
  const out = recentVideos(items, registry);
  assert.deepEqual(out.map((v) => v.title), ["New", "Old"]); // newest first; arxiv + titleless excluded
  assert.equal(out.find((v) => v.title === "Old").recommended, true); // Anchor Teacher is recommended (name join)
  assert.equal(out.find((v) => v.title === "New").recommended, false);
});

test("buildWatchDigestState puts recommended first, then recency, with a deduped concept vocab", () => {
  const videos = [
    { title: "Plain newer", url: "p1", published_at: "2026-06-05T00:00:00Z", author_or_channel: "Plain", recommended: false, concepts: ["RAG", "RAG"] },
    { title: "Rec older", url: "r1", published_at: "2026-06-01T00:00:00Z", author_or_channel: "Anchor", recommended: true, concepts: ["Transformers"] },
    { title: "", url: "x", recommended: true }, // dropped (no title)
  ];
  const state = buildWatchDigestState({ videos });
  assert.deepEqual(state.videos.map((v) => v.title), ["Rec older", "Plain newer"]); // recommended leads despite older
  assert.deepEqual(state.concepts.map((c) => c.slug).sort(), ["rag", "transformers"]); // slugified + deduped
});

test("stateHash is stable for the same set and moves when a video or its inner-circle flag changes", () => {
  const a = buildWatchDigestState({ videos: [{ title: "T", url: "u1", recommended: false, author_or_channel: "X" }] });
  const b = buildWatchDigestState({ videos: [{ title: "T", url: "u1", recommended: false, author_or_channel: "X" }] });
  const c = buildWatchDigestState({ videos: [{ title: "T", url: "u1", recommended: true, author_or_channel: "X" }] });
  assert.equal(stateHash(a), stateHash(b));
  assert.notEqual(stateHash(a), stateHash(c));
});
