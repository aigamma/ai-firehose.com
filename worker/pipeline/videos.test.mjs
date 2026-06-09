import { test } from "node:test";
import assert from "node:assert/strict";
import { selectVideos } from "./videos.mjs";

const registry = {
  channels: [
    { channel_id: "UCa", name: "Anchor", handle: "@anchor", recommended: true },
    { channel_id: "UCb", name: "Plain", handle: "@plain" },
  ],
};

test("selectVideos keeps youtube, sorts newest first, joins recommended + handle, slugs concepts", () => {
  const items = [
    { source: "youtube", source_id: "v1", title: "Old", author_or_channel: "Anchor", published_at: "2026-05-01T00:00:00Z", concepts: ["RAG"] },
    { source: "youtube", source_id: "v2", title: "New", author_or_channel: "Plain", published_at: "2026-06-01T00:00:00Z", concepts: [] },
    { source: "arxiv", source_id: "x", title: "Paper", author_or_channel: "Anchor", published_at: "2026-06-02T00:00:00Z" }, // non-youtube dropped
    { source: "youtube", source_id: "", title: "NoId", author_or_channel: "Anchor" }, // id-less dropped
  ];
  const out = selectVideos(items, registry);
  assert.deepEqual(out.map((v) => v.id), ["v2", "v1"]); // newest first; arxiv + id-less excluded
  const old = out.find((v) => v.id === "v1");
  assert.equal(old.recommended, true); // Anchor is recommended (name join)
  assert.equal(old.channelUrl, "https://www.youtube.com/@anchor"); // handle join
  assert.deepEqual(old.concepts, [{ slug: "rag", label: "RAG" }]); // concepts slugified
  assert.equal(out.find((v) => v.id === "v2").recommended, false);
});
