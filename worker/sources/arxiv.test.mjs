import { test } from "node:test";
import assert from "node:assert/strict";
import { fetchArxiv } from "./arxiv.mjs";

// fetchArxiv hits the arXiv Atom API then normalizes each entry into the uniform corpus
// item shape. These tests mock global fetch with canned Atom XML (no network), pinning
// the normalization the adapter owns: field mapping, source_id extraction, HTML-entity
// decoding, whitespace collapse, the three-author cap, the recency cutoff, and the skip
// rules. Only the success path is exercised; the failure path retries with real backoff
// sleeps (~15s total), too slow for a unit test, and is covered by the live pipeline.

function withFetch(responder, fn) {
  const real = globalThis.fetch;
  globalThis.fetch = responder;
  return Promise.resolve()
    .then(fn)
    .finally(() => {
      globalThis.fetch = real;
    });
}
const okXml = (xml) => async () => ({ ok: true, text: async () => xml });

const ATOM = (entries) => `<?xml version="1.0"?><feed>${entries}</feed>`;
const ENTRY = ({
  id = "http://arxiv.org/abs/2401.00001v1",
  title = "A Title",
  summary = "A summary.",
  published = "2099-01-01T00:00:00Z", // far-future so the recency cutoff always keeps it
  authors = ["Ada Lovelace"],
} = {}) =>
  `<entry><id>${id}</id><title>${title}</title><summary>${summary}</summary>` +
  `<published>${published}</published>${authors.map((a) => `<author><name>${a}</name></author>`).join("")}</entry>`;

test("normalizes an arXiv entry into the uniform corpus item shape", async () => {
  await withFetch(okXml(ATOM(ENTRY())), async () => {
    const items = await fetchArxiv({ maxAgeDays: 100000 });
    assert.equal(items.length, 1);
    const it = items[0];
    assert.equal(it.source, "arxiv");
    assert.equal(it.source_id, "2401.00001v1", "source_id is the id after /abs/");
    assert.equal(it.url, "http://arxiv.org/abs/2401.00001v1");
    assert.equal(it.title, "A Title");
    assert.match(it.summary_text, /A Title/);
    assert.match(it.summary_text, /A summary\./);
    assert.equal(it.author_or_channel, "Ada Lovelace");
    assert.equal(it.published_at, "2099-01-01T00:00:00Z");
    assert.equal(it.engagement, 0);
    assert.equal(it.source_authority_weight, 0.7);
    assert.equal(it.kind_bias, "technique");
  });
});

test("decodes HTML entities and collapses whitespace in the title", async () => {
  await withFetch(okXml(ATOM(ENTRY({ title: "Scaling   Laws &amp; &quot;Emergence&quot;" }))), async () => {
    const items = await fetchArxiv({ maxAgeDays: 100000 });
    assert.equal(items[0].title, 'Scaling Laws & "Emergence"');
  });
});

test("joins at most three author names", async () => {
  await withFetch(okXml(ATOM(ENTRY({ authors: ["A One", "B Two", "C Three", "D Four"] }))), async () => {
    const items = await fetchArxiv({ maxAgeDays: 100000 });
    assert.equal(items[0].author_or_channel, "A One, B Two, C Three");
  });
});

test("drops entries older than maxAgeDays", async () => {
  const xml = ATOM(
    ENTRY({ id: "http://arxiv.org/abs/fresh.1", title: "Fresh", published: "2099-01-01T00:00:00Z" }) +
      ENTRY({ id: "http://arxiv.org/abs/stale.1", title: "Stale", published: "2000-01-01T00:00:00Z" })
  );
  await withFetch(okXml(xml), async () => {
    const items = await fetchArxiv({ maxAgeDays: 100 });
    assert.deepEqual(items.map((i) => i.title), ["Fresh"], "the year-2000 entry is outside the window");
  });
});

test("skips entries missing an id or title", async () => {
  const xml = ATOM(
    `<entry><id></id><title>No Id</title><published>2099-01-01T00:00:00Z</published></entry>` +
      ENTRY({ title: "Has Both" })
  );
  await withFetch(okXml(xml), async () => {
    const items = await fetchArxiv({ maxAgeDays: 100000 });
    assert.deepEqual(items.map((i) => i.title), ["Has Both"]);
  });
});

test("returns an empty list when the feed body is empty", async () => {
  await withFetch(okXml(""), async () => {
    assert.deepEqual(await fetchArxiv({ maxAgeDays: 100000 }), []);
  });
});
