import { test } from "node:test";
import assert from "node:assert/strict";
import { buildRoster, corpusDate } from "./directory.mjs";

// A small synthetic corpus and registry exercising the directory transform.
const channels = [
  { channel_id: "UCaaa", name: "Anchor Teacher", handle: "@anchor", authority_weight: 0.95, kind_bias: "mixed", active: true },
  { channel_id: "UCbbb", name: "Tool Channel", handle: "@toolch", authority_weight: 0.85, kind_bias: "tool", active: true },
  { channel_id: "UCccc", name: "Fresh Add", handle: "@fresh", authority_weight: 0.85, kind_bias: "technique", active: true },
  { channel_id: "UCddd", name: "Hidden For Signal", handle: "@hidden", authority_weight: 0.6, kind_bias: "opinion", active: true, hide_from_directory: true },
  { channel_id: "UCeee", name: "Paused", handle: "@paused", authority_weight: 0.9, kind_bias: "mixed", active: false },
];

const items = [
  // Anchor: two technique videos, one opinion -> dominant kind technique; concepts mixed.
  { source: "youtube", source_id: "v1", author_or_channel: "Anchor Teacher", kind: "technique", published_at: "2026-05-01T00:00:00Z", title: "A1", url: "https://www.youtube.com/watch?v=v1", concepts: ["Transformers", "Made Up Concept"] },
  { source: "youtube", source_id: "v2", author_or_channel: "Anchor Teacher", kind: "technique", published_at: "2026-05-10T00:00:00Z", title: "A2", url: "https://www.youtube.com/watch?v=v2", concepts: ["Transformers", "RAG"] },
  { source: "youtube", source_id: "v3", author_or_channel: "Anchor Teacher", kind: "opinion", published_at: "2026-04-01T00:00:00Z", title: "A3", url: "https://www.youtube.com/watch?v=v3", concepts: ["RAG"] },
  // Tool channel: name differs only by case/space -> normalized match still joins.
  { source: "youtube", source_id: "v4", author_or_channel: "tool channel", kind: "tool", published_at: "2026-05-20T00:00:00Z", title: "T1", url: "https://www.youtube.com/watch?v=v4", concepts: ["RAG"] },
  // A non-youtube item is ignored even if the name collides.
  { source: "arxiv", source_id: "x1", author_or_channel: "Anchor Teacher", kind: "technique", published_at: "2026-06-01T00:00:00Z", title: "paper", concepts: ["RAG"] },
];

// Only these resolve to real glossary hubs; "made-up-concept" must be dropped.
const glossarySlugs = new Set(["transformers", "rag"]);

const roster = buildRoster({ channels, items, glossarySlugs });
const by = Object.fromEntries(roster.map((r) => [r.channel_id, r]));

test("excludes hidden, paused, and id-less channels", () => {
  const ids = roster.map((r) => r.channel_id);
  assert.deepEqual(ids.sort(), ["UCaaa", "UCbbb", "UCccc"]);
});

test("sorts by authority weight desc, then name", () => {
  // 0.95 anchor first; then the two 0.85s tie-broken by name ("Fresh Add" < "Tool Channel").
  assert.deepEqual(roster.map((r) => r.channel_id), ["UCaaa", "UCccc", "UCbbb"]);
});

test("derives the subscribe URL from the handle", () => {
  assert.equal(by.UCaaa.subscribeUrl, "https://www.youtube.com/@anchor?sub_confirmation=1");
  assert.equal(by.UCaaa.channelUrl, "https://www.youtube.com/@anchor");
});

test("counts only the channel's youtube items and picks the newest as latest", () => {
  assert.equal(by.UCaaa.videoCount, 3); // the arxiv item is excluded
  assert.equal(by.UCaaa.latest.videoId, "v2"); // 2026-05-10 is newest
});

test("filters concept chips to resolvable glossary slugs, ranked by frequency", () => {
  // Transformers (2) and RAG (2) survive; "Made Up Concept" is dropped (not a hub).
  const slugs = by.UCaaa.concepts.map((c) => c.slug);
  assert.ok(slugs.includes("transformers") && slugs.includes("rag"));
  assert.ok(!slugs.includes("made-up-concept"));
});

test("kindLean is the dominant corpus kind, over the registry hint", () => {
  assert.equal(by.UCaaa.kindLean, "technique"); // 2 technique vs 1 opinion, ignoring kind_bias "mixed"
  assert.equal(by.UCbbb.kindLean, "tool"); // normalized name join worked
});

test("a freshly added channel with no corpus items renders registry-only", () => {
  const fresh = by.UCccc;
  assert.equal(fresh.videoCount, 0);
  assert.equal(fresh.latest, null);
  assert.deepEqual(fresh.concepts, []);
  assert.equal(fresh.kindLean, "technique"); // falls back to kind_bias (a real kind)
});

test("kindLean is null when there is no corpus and kind_bias is the 'mixed' hint", () => {
  // Synthesize a mixed-bias channel with no items.
  const r = buildRoster({ channels: [{ channel_id: "UCzzz", name: "Z", handle: "@z", authority_weight: 0.8, kind_bias: "mixed", active: true }], items: [], glossarySlugs });
  assert.equal(r[0].kindLean, null);
});

test("at equal frequency, a durable concept outranks a thin corpus tag", () => {
  const its = [
    { source: "youtube", source_id: "z1", author_or_channel: "Z", kind: "technique", published_at: "2026-01-01T00:00:00Z", concepts: ["Thin Tag", "Transformers"] },
  ];
  const ch = [{ channel_id: "UCz", name: "Z", handle: "@z", authority_weight: 0.8, kind_bias: "technique", active: true }];
  const r = buildRoster({
    channels: ch,
    items: its,
    glossarySlugs: new Set(["thin-tag", "transformers"]),
    durableSlugs: new Set(["transformers"]),
  });
  // Both appear once; the durable "transformers" leads despite "Thin Tag" sorting first alphabetically.
  assert.deepEqual(r[0].concepts.map((c) => c.slug), ["transformers", "thin-tag"]);
});

test("corpusDate is the newest publish date, derived from data not the clock", () => {
  assert.equal(corpusDate(items), "2026-06-01"); // the arxiv item is newest by date
  assert.equal(corpusDate([]), "");
});
