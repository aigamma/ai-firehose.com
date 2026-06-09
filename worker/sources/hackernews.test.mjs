import { test } from "node:test";
import assert from "node:assert/strict";
import { fetchHackerNews } from "./hackernews.mjs";

// fetchHackerNews hits the HN Firebase API: first the topstories id index, then one
// item endpoint per id. It keeps only AI-relevant "story" items (a title/text keyword
// gate, so we do not pay Claude to classify unrelated stories) and normalizes each into
// the uniform corpus item shape. These tests mock global fetch with canned JSON (no
// network), URL-aware so the list endpoint returns the id array and each item endpoint
// returns its story. They pin the normalization the adapter owns: field mapping, the
// score -> engagement and unix-seconds -> ISO time mapping, the url fallback, HTML-tag
// stripping in summary_text, the AI keyword gate, the type/title skips, the recency
// cutoff, the limit cap, and the empty case. Only the success path is exercised; the
// failure path retries with real backoff sleeps (~10s+ total), too slow for a unit
// test, and is covered by the live pipeline. Every mock returns ok:true for that reason.

function withFetch(responder, fn) {
  const real = globalThis.fetch;
  globalThis.fetch = responder;
  return Promise.resolve()
    .then(fn)
    .finally(() => {
      globalThis.fetch = real;
    });
}

const API = "https://hacker-news.firebaseio.com/v0";
const FAR_FUTURE = Math.floor(Date.parse("2099-01-01T00:00:00Z") / 1000); // unix seconds, always inside any window
const FAR_PAST = Math.floor(Date.parse("2000-01-01T00:00:00Z") / 1000); // unix seconds, always outside a 100-day window

// A default AI-relevant story; override any field. time is unix SECONDS like HN returns.
const STORY = (over = {}) => ({
  type: "story",
  title: "A New LLM Agent Framework",
  score: 123,
  by: "pg",
  time: FAR_FUTURE,
  url: "https://example.com/post",
  ...over,
});

// Build a URL-aware responder from an id list plus an id -> story map. The adapter reads
// r.json(), so each canned response exposes an async json(). Unknown ids resolve to null,
// which the adapter treats as a skippable item.
const hnFetch = (ids, byId) => async (u) => {
  const url = String(u);
  if (url === `${API}/topstories.json`) {
    return { ok: true, json: async () => ids };
  }
  const m = url.match(/\/item\/(\d+)\.json$/);
  if (m) {
    const story = Object.prototype.hasOwnProperty.call(byId, m[1]) ? byId[m[1]] : null;
    return { ok: true, json: async () => story };
  }
  throw new Error(`unexpected url ${url}`);
};

test("normalizes an HN story into the uniform corpus item shape", async () => {
  await withFetch(hnFetch([1], { 1: STORY() }), async () => {
    const items = await fetchHackerNews({ maxAgeDays: 100000 });
    assert.equal(items.length, 1);
    const it = items[0];
    assert.equal(it.source, "hackernews");
    assert.equal(it.source_id, "1", "source_id is the stringified id");
    assert.equal(it.url, "https://example.com/post");
    assert.equal(it.title, "A New LLM Agent Framework");
    assert.match(it.summary_text, /A New LLM Agent Framework/);
    assert.equal(it.author_or_channel, "pg");
    assert.equal(it.published_at, new Date(FAR_FUTURE * 1000).toISOString(), "time is unix seconds -> ISO");
    assert.equal(it.engagement, 123, "engagement is the HN score");
    assert.equal(it.source_authority_weight, 0.6);
    assert.equal(it.kind_bias, "mixed");
  });
});

test("falls back to the HN item permalink when the story has no url", async () => {
  await withFetch(hnFetch([42], { 42: STORY({ url: undefined }) }), async () => {
    const items = await fetchHackerNews({ maxAgeDays: 100000 });
    assert.equal(items[0].url, "https://news.ycombinator.com/item?id=42");
  });
});

test("defaults author to Hacker News and engagement to 0 when absent", async () => {
  await withFetch(hnFetch([7], { 7: STORY({ by: undefined, score: undefined }) }), async () => {
    const items = await fetchHackerNews({ maxAgeDays: 100000 });
    assert.equal(items[0].author_or_channel, "Hacker News");
    assert.equal(items[0].engagement, 0);
  });
});

test("strips HTML tags from the story text in summary_text", async () => {
  await withFetch(
    hnFetch([3], { 3: STORY({ title: "GPT Notes", text: "See <a href=\"x\">this</a> on <b>RAG</b>" }) }),
    async () => {
      const items = await fetchHackerNews({ maxAgeDays: 100000 });
      const s = items[0].summary_text;
      assert.match(s, /GPT Notes/);
      assert.doesNotMatch(s, /<a |<b>/, "anchor and bold tags are stripped");
      assert.match(s, /See\s+this\s+on\s+RAG/, "tag positions collapse to whitespace");
    }
  );
});

test("keeps only AI-relevant stories (title/text keyword gate)", async () => {
  const ids = [10, 11];
  const byId = {
    10: STORY({ title: "A New Transformer Architecture" }), // matches the AI gate
    11: STORY({ title: "Best Sourdough Bread Recipe", text: "no relevant words here" }), // does not
  };
  await withFetch(hnFetch(ids, byId), async () => {
    const items = await fetchHackerNews({ maxAgeDays: 100000 });
    assert.deepEqual(items.map((i) => i.title), ["A New Transformer Architecture"]);
  });
});

test("skips items that are not stories or have no title", async () => {
  const ids = [20, 21, 22];
  const byId = {
    20: STORY({ type: "job", title: "AI job posting" }), // wrong type
    21: STORY({ title: undefined, text: "an AI comment" }), // no title
    22: STORY({ title: "Kept LLM Story" }), // kept
  };
  await withFetch(hnFetch(ids, byId), async () => {
    const items = await fetchHackerNews({ maxAgeDays: 100000 });
    assert.deepEqual(items.map((i) => i.title), ["Kept LLM Story"]);
  });
});

test("drops stories older than maxAgeDays", async () => {
  const ids = [30, 31];
  const byId = {
    30: STORY({ title: "Fresh AI News", time: FAR_FUTURE }),
    31: STORY({ title: "Stale AI News", time: FAR_PAST }),
  };
  await withFetch(hnFetch(ids, byId), async () => {
    const items = await fetchHackerNews({ maxAgeDays: 100 });
    assert.deepEqual(items.map((i) => i.title), ["Fresh AI News"], "the year-2000 story is outside the window");
  });
});

test("skips a null item without aborting the batch", async () => {
  // id 41 has no entry in the map, so the mock returns null; the adapter must continue.
  const ids = [40, 41, 43];
  const byId = {
    40: STORY({ title: "First AI Story" }),
    43: STORY({ title: "Third AI Story" }),
  };
  await withFetch(hnFetch(ids, byId), async () => {
    const items = await fetchHackerNews({ maxAgeDays: 100000 });
    assert.deepEqual(items.map((i) => i.title), ["First AI Story", "Third AI Story"]);
  });
});

test("honors the limit, returning at most that many items", async () => {
  const ids = [50, 51, 52, 53];
  const byId = {
    50: STORY({ title: "AI One" }),
    51: STORY({ title: "AI Two" }),
    52: STORY({ title: "AI Three" }),
    53: STORY({ title: "AI Four" }),
  };
  await withFetch(hnFetch(ids, byId), async () => {
    const items = await fetchHackerNews({ maxAgeDays: 100000, limit: 2 });
    assert.equal(items.length, 2);
    assert.deepEqual(items.map((i) => i.title), ["AI One", "AI Two"]);
  });
});

test("returns an empty list when topstories is empty", async () => {
  await withFetch(hnFetch([], {}), async () => {
    assert.deepEqual(await fetchHackerNews({ maxAgeDays: 100000 }), []);
  });
});
