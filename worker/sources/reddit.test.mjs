import { test } from "node:test";
import assert from "node:assert/strict";
import { fetchReddit } from "./reddit.mjs";

// fetchReddit hits the public Reddit JSON listing once PER subreddit, then normalizes each
// post (data.children[].data) into the uniform corpus item shape. These tests mock global
// fetch with canned listing JSON (no network), pinning the normalization the adapter owns:
// the field mapping, the url override-vs-permalink choice, the summary_text join, the
// created_utc -> ISO conversion, the recency cutoff, the missing-title skip, and the empty
// case. Only the success path is exercised: the adapter returns [] on a non-ok response
// (Reddit 403s datacenter IPs) and that branch needs no parsing.
//
// The adapter SUBS list has six subreddits and sleeps 800ms between each, so a naive run
// would block ~4.8s on real timers. We stub setTimeout so those sleeps resolve immediately,
// keeping the suite fast; we restore both fetch and setTimeout in finally.

const SUB_COUNT = 6; // SUBS.length in reddit.mjs: one fetch per subreddit

function withFetch(responder, fn) {
  const realFetch = globalThis.fetch;
  const realSetTimeout = globalThis.setTimeout;
  globalThis.fetch = responder;
  // Collapse the inter-sub sleep(800) to an immediate tick so six subs do not block ~4.8s.
  globalThis.setTimeout = (cb) => realSetTimeout(cb, 0);
  return Promise.resolve()
    .then(fn)
    .finally(() => {
      globalThis.fetch = realFetch;
      globalThis.setTimeout = realSetTimeout;
    });
}

// A response whose listing is returned for ANY subreddit url. ok:true forces the parse path.
const okJson = (listing) => async () => ({ ok: true, json: async () => listing });

const FAR_FUTURE = 4102444800; // 2100-01-01 in unix SECONDS, always inside any window
const FAR_PAST = 946684800; //   2000-01-01 in unix SECONDS, always outside the window

const POST = ({
  id = "abc123",
  title = "A Reddit Title",
  selftext = "",
  url_overridden_by_dest = undefined,
  permalink = "/r/LocalLLaMA/comments/abc123/a_reddit_title/",
  subreddit = "LocalLLaMA",
  created_utc = FAR_FUTURE,
  score = 42,
} = {}) => ({
  data: { id, title, selftext, url_overridden_by_dest, permalink, subreddit, created_utc, score },
});

// Wrap posts in the listing envelope the adapter reads (j.data.children[].data).
const LISTING = (...posts) => ({ data: { children: posts } });
const EMPTY = { data: { children: [] } };

test("normalizes a Reddit post into the uniform corpus item shape", async () => {
  // Only the first subreddit returns a post; the rest are empty, so exactly one item results.
  let call = 0;
  const responder = async () => ({
    ok: true,
    json: async () => (call++ === 0 ? LISTING(POST()) : EMPTY),
  });
  await withFetch(responder, async () => {
    const items = await fetchReddit({ maxAgeDays: 100000 });
    assert.equal(items.length, 1);
    const it = items[0];
    assert.equal(it.source, "reddit");
    assert.equal(it.source_id, "abc123");
    assert.equal(it.title, "A Reddit Title");
    assert.equal(it.author_or_channel, "r/LocalLLaMA");
    assert.equal(it.engagement, 42, "engagement is the post score");
    assert.equal(it.source_authority_weight, 0.55);
    assert.equal(it.kind_bias, "opinion");
    assert.equal(it.published_at, "2100-01-01T00:00:00.000Z", "created_utc seconds -> ISO");
    assert.match(it.summary_text, /A Reddit Title/);
  });
});

test("fetches once per subreddit and aggregates across all of them", async () => {
  // Every subreddit returns one post; the adapter loops all SUBS, so we get SUB_COUNT items.
  let calls = 0;
  const responder = async (url) => {
    calls++;
    assert.match(String(url), /reddit\.com\/r\/[^/]+\/top\.json/, "hits the per-sub top listing");
    return { ok: true, json: async () => LISTING(POST({ id: `id${calls}` })) };
  };
  await withFetch(responder, async () => {
    const items = await fetchReddit({ maxAgeDays: 100000 });
    assert.equal(calls, SUB_COUNT, "one fetch per subreddit");
    assert.equal(items.length, SUB_COUNT, "one item gathered per subreddit");
  });
});

test("passes the perSub limit through to the listing url", async () => {
  let seenUrl = "";
  const responder = async (url) => {
    if (!seenUrl) seenUrl = String(url);
    return { ok: true, json: async () => EMPTY };
  };
  await withFetch(responder, async () => {
    await fetchReddit({ maxAgeDays: 100000, perSub: 7 });
    assert.match(seenUrl, /limit=7/, "perSub is forwarded as the listing limit");
  });
});

test("prefers url_overridden_by_dest over the permalink", async () => {
  let call = 0;
  const responder = async () => ({
    ok: true,
    json: async () =>
      call++ === 0
        ? LISTING(POST({ url_overridden_by_dest: "https://example.com/paper.pdf" }))
        : EMPTY,
  });
  await withFetch(responder, async () => {
    const items = await fetchReddit({ maxAgeDays: 100000 });
    assert.equal(items[0].url, "https://example.com/paper.pdf");
  });
});

test("falls back to the reddit permalink when no external dest is set", async () => {
  let call = 0;
  const responder = async () => ({
    ok: true,
    json: async () =>
      call++ === 0
        ? LISTING(POST({ permalink: "/r/MachineLearning/comments/xyz/title/" }))
        : EMPTY,
  });
  await withFetch(responder, async () => {
    const items = await fetchReddit({ maxAgeDays: 100000 });
    assert.equal(items[0].url, "https://www.reddit.com/r/MachineLearning/comments/xyz/title/");
  });
});

test("appends a truncated selftext to the title in summary_text", async () => {
  let call = 0;
  const long = "x".repeat(2000);
  const responder = async () => ({
    ok: true,
    json: async () =>
      call++ === 0 ? LISTING(POST({ title: "Headline", selftext: long })) : EMPTY,
  });
  await withFetch(responder, async () => {
    const items = await fetchReddit({ maxAgeDays: 100000 });
    const s = items[0].summary_text;
    assert.match(s, /^Headline\n\n/, "title leads, blank-line separated");
    assert.equal(s, `Headline\n\n${"x".repeat(1500)}`, "selftext is capped at 1500 chars");
  });
});

test("drops posts older than maxAgeDays", async () => {
  let call = 0;
  const responder = async () => ({
    ok: true,
    json: async () =>
      call++ === 0
        ? LISTING(
            POST({ id: "fresh", title: "Fresh", created_utc: FAR_FUTURE }),
            POST({ id: "stale", title: "Stale", created_utc: FAR_PAST })
          )
        : EMPTY,
  });
  await withFetch(responder, async () => {
    const items = await fetchReddit({ maxAgeDays: 100 });
    assert.deepEqual(items.map((i) => i.title), ["Fresh"], "the year-2000 post is outside the window");
  });
});

test("skips children with no data or no title", async () => {
  let call = 0;
  const responder = async () => ({
    ok: true,
    json: async () =>
      call++ === 0
        ? LISTING(
            { data: null }, // no data object
            POST({ id: "notitle", title: "" }), // empty title is falsy
            POST({ id: "ok", title: "Kept" })
          )
        : EMPTY,
  });
  await withFetch(responder, async () => {
    const items = await fetchReddit({ maxAgeDays: 100000 });
    assert.deepEqual(items.map((i) => i.title), ["Kept"]);
  });
});

test("defaults engagement to 0 when score is missing", async () => {
  // Build the post data directly so no `score` key exists at all (POST's default of 42
  // would otherwise re-fill an undefined score via destructuring defaults).
  const noScore = { data: { id: "noscore", title: "No Score", subreddit: "OpenAI", created_utc: FAR_FUTURE, permalink: "/r/OpenAI/c/noscore/" } };
  let call = 0;
  const responder = async () => ({
    ok: true,
    json: async () => (call++ === 0 ? LISTING(noScore) : EMPTY),
  });
  await withFetch(responder, async () => {
    const items = await fetchReddit({ maxAgeDays: 100000 });
    assert.equal(items[0].engagement, 0);
  });
});

test("returns an empty list when every listing is empty", async () => {
  await withFetch(okJson(EMPTY), async () => {
    assert.deepEqual(await fetchReddit({ maxAgeDays: 100000 }), []);
  });
});
