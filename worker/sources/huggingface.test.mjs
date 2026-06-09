import { test } from "node:test";
import assert from "node:assert/strict";
import { fetchHuggingFace } from "./huggingface.mjs";

// fetchHuggingFace hits the Hugging Face daily_papers JSON API then normalizes each entry
// into the uniform corpus item shape. These tests mock global fetch with a canned JSON
// array (no network), pinning the normalization the adapter owns: field mapping, the
// "paper:<id>" source_id, the /papers/<id> url, the title + summary join with whitespace
// collapse and the 1500-char summary cap, the publishedAt/upvotes fallback between the
// item and its nested paper object, the recency cutoff, and the skip rules (missing id or
// title). Only the success path is exercised; the failure path swallows the error and just
// returns what it has, but a non-ok response would still cost a real request, so the mock
// always answers { ok: true }.

function withFetch(responder, fn) {
  const real = globalThis.fetch;
  globalThis.fetch = responder;
  return Promise.resolve()
    .then(fn)
    .finally(() => {
      globalThis.fetch = real;
    });
}
// The adapter reads the body with r.json(), so the canned response exposes json(), not text().
const okJson = (data) => async () => ({ ok: true, json: async () => data });

// A daily_papers entry: the API wraps the paper under a `paper` key, with publishedAt and
// upvotes living at the item level. Defaults use a far-future date so the recency cutoff
// always keeps the row regardless of when the test runs.
const PAPER = ({
  id = "2401.00001",
  title = "A Title",
  summary = "A summary.",
  upvotes = 0,
} = {}) => ({ id, title, summary, upvotes });
const ENTRY = ({
  publishedAt = "2099-01-01T00:00:00.000Z", // far-future so the recency cutoff always keeps it
  upvotes,
  paper = PAPER(),
} = {}) => {
  const e = { publishedAt, paper };
  if (upvotes !== undefined) e.upvotes = upvotes;
  return e;
};

test("normalizes a daily_papers entry into the uniform corpus item shape", async () => {
  await withFetch(okJson([ENTRY({ paper: PAPER({ upvotes: 42 }) })]), async () => {
    const items = await fetchHuggingFace({ maxAgeDays: 100000 });
    assert.equal(items.length, 1);
    const it = items[0];
    assert.equal(it.source, "huggingface");
    assert.equal(it.source_id, "paper:2401.00001", "source_id is paper:<id>");
    assert.equal(it.url, "https://huggingface.co/papers/2401.00001");
    assert.equal(it.title, "A Title");
    assert.match(it.summary_text, /A Title/);
    assert.match(it.summary_text, /A summary\./);
    assert.equal(it.author_or_channel, "HF Papers");
    assert.equal(it.published_at, "2099-01-01T00:00:00.000Z");
    assert.equal(it.engagement, 42, "engagement is the paper upvote count");
    assert.equal(it.source_authority_weight, 0.72);
    assert.equal(it.kind_bias, "technique");
  });
});

test("joins title and summary into summary_text with a blank line", async () => {
  await withFetch(okJson([ENTRY({ paper: PAPER({ title: "Scaling Laws", summary: "It scales." }) })]), async () => {
    const items = await fetchHuggingFace({ maxAgeDays: 100000 });
    assert.equal(items[0].summary_text, "Scaling Laws\n\nIt scales.");
  });
});

test("collapses internal whitespace in the title and caps the summary at 1500 chars", async () => {
  const longSummary = "x".repeat(2000);
  await withFetch(
    okJson([ENTRY({ paper: PAPER({ title: "Scaling   Laws\nand\tEmergence", summary: longSummary }) })]),
    async () => {
      const items = await fetchHuggingFace({ maxAgeDays: 100000 });
      const it = items[0];
      assert.equal(it.title, "Scaling Laws and Emergence", "runs of whitespace collapse to one space");
      // summary_text is "<title>\n\n<summary sliced to 1500>"; the slice keeps exactly 1500 chars.
      const body = it.summary_text.split("\n\n")[1];
      assert.equal(body.length, 1500, "the summary is truncated to 1500 characters");
    }
  );
});

test("falls back to the nested paper fields when item-level fields are absent", async () => {
  // No item-level publishedAt or upvotes; the values live on the paper object instead.
  const entry = { paper: { id: "2402.12345", title: "Nested", summary: "S", publishedAt: "2099-06-01T00:00:00.000Z", upvotes: 7 } };
  await withFetch(okJson([entry]), async () => {
    const items = await fetchHuggingFace({ maxAgeDays: 100000 });
    assert.equal(items.length, 1);
    assert.equal(items[0].published_at, "2099-06-01T00:00:00.000Z", "publishedAt falls back to the paper");
    assert.equal(items[0].engagement, 7, "upvotes falls back to the paper");
  });
});

test("drops entries older than maxAgeDays", async () => {
  const data = [
    ENTRY({ publishedAt: "2099-01-01T00:00:00.000Z", paper: PAPER({ id: "fresh.1", title: "Fresh" }) }),
    ENTRY({ publishedAt: "2000-01-01T00:00:00.000Z", paper: PAPER({ id: "stale.1", title: "Stale" }) }),
  ];
  await withFetch(okJson(data), async () => {
    const items = await fetchHuggingFace({ maxAgeDays: 100 });
    assert.deepEqual(items.map((i) => i.title), ["Fresh"], "the year-2000 entry is outside the window");
  });
});

test("skips entries missing an id or a title", async () => {
  const data = [
    ENTRY({ paper: { id: "noTitle.1", summary: "S" } }), // has id, no title
    ENTRY({ paper: { title: "No Id", summary: "S" } }), // has title, no id
    ENTRY({ paper: PAPER({ id: "ok.1", title: "Has Both" }) }),
  ];
  await withFetch(okJson(data), async () => {
    const items = await fetchHuggingFace({ maxAgeDays: 100000 });
    assert.deepEqual(items.map((i) => i.title), ["Has Both"]);
  });
});

test("returns an empty list when the API returns a non-array body", async () => {
  await withFetch(okJson({ error: "nope" }), async () => {
    assert.deepEqual(await fetchHuggingFace({ maxAgeDays: 100000 }), []);
  });
});

test("returns an empty list when there are no papers", async () => {
  await withFetch(okJson([]), async () => {
    assert.deepEqual(await fetchHuggingFace({ maxAgeDays: 100000 }), []);
  });
});
