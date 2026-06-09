import { test } from "node:test";
import assert from "node:assert/strict";
import { fetchBlogs } from "./blogs.mjs";

// fetchBlogs reads the curated feed manifest (sources/blogs.json), fetches each feed's
// RSS or Atom XML (one fetch PER feed), and normalizes every entry into the uniform
// corpus item shape. These tests mock global fetch with canned XML (no network), pinning
// the normalization the adapter owns: the field mapping, the RSS-vs-Atom branch (item vs
// entry, link text vs href, guid vs id), HTML-entity decoding, whitespace collapse, the
// recency cutoff (maxAgeDays), the perFeed cap, the skip rule (no title), and the empty
// case. Only the success path is exercised; a failed fetch is caught and the feed is
// skipped, so there is no slow retry/backoff to avoid, but we still always return ok.
//
// The manifest urls are fixed and there are many of them, so the mock is url-aware: it
// serves a canned feed only for the specific url(s) a test cares about and an empty feed
// for every other manifest url. That decouples exact item counts from the manifest size,
// so adding or removing a real feed never breaks these tests.

function withFetch(responder, fn) {
  const real = globalThis.fetch;
  globalThis.fetch = responder;
  return Promise.resolve()
    .then(fn)
    .finally(() => {
      globalThis.fetch = real;
    });
}

// Build a url-aware responder from a map of url -> xml. Any url not in the map returns an
// empty (item-less) RSS feed, so feeds we are not testing contribute nothing.
const EMPTY_RSS = `<?xml version="1.0"?><rss><channel></channel></rss>`;
const byUrl = (map) => async (url) => ({
  ok: true,
  text: async () => map[url] ?? EMPTY_RSS,
});

// Real manifest urls used as anchors. Simon Willison is an Atom feed; OpenAI is RSS. Both
// are long-standing entries in sources/blogs.json with stable weights (0.75 and 0.8).
const ATOM_URL = "https://simonwillison.net/atom/everything/";
const ATOM_NAME = "Simon Willison";
const RSS_URL = "https://openai.com/news/rss.xml";
const RSS_NAME = "OpenAI";

const FAR_FUTURE = "Wed, 01 Jan 2099 00:00:00 GMT"; // always inside any recency window
const FAR_PAST = "Sat, 01 Jan 2000 00:00:00 GMT"; // always outside a 100-day window

const RSS = (items) => `<?xml version="1.0"?><rss version="2.0"><channel>${items}</channel></rss>`;
const RSS_ITEM = ({
  title = "An RSS Post",
  link = "https://openai.com/news/an-rss-post",
  guid = "https://openai.com/news/an-rss-post",
  pubDate = FAR_FUTURE,
  description = "An RSS description.",
} = {}) =>
  `<item><title>${title}</title><link>${link}</link><guid>${guid}</guid>` +
  `<pubDate>${pubDate}</pubDate><description>${description}</description></item>`;

const ATOM = (entries) => `<?xml version="1.0"?><feed xmlns="http://www.w3.org/2005/Atom">${entries}</feed>`;
const ATOM_ENTRY = ({
  title = "An Atom Post",
  href = "https://simonwillison.net/2099/an-atom-post/",
  id = "tag:simonwillison.net,2099:an-atom-post",
  published = "2099-01-01T00:00:00Z",
  summary = "An Atom summary.",
} = {}) =>
  `<entry><title>${title}</title><link href="${href}" rel="alternate"/><id>${id}</id>` +
  `<published>${published}</published><summary>${summary}</summary></entry>`;

test("normalizes an RSS item into the uniform corpus item shape", async () => {
  const responder = byUrl({ [RSS_URL]: RSS(RSS_ITEM()) });
  await withFetch(responder, async () => {
    const items = await fetchBlogs({ maxAgeDays: 100000 });
    assert.equal(items.length, 1);
    const it = items[0];
    assert.equal(it.source, "blog");
    assert.equal(it.source_id, "https://openai.com/news/an-rss-post", "RSS source_id is the guid");
    assert.equal(it.url, "https://openai.com/news/an-rss-post");
    assert.equal(it.title, "An RSS Post");
    assert.match(it.summary_text, /An RSS Post/);
    assert.match(it.summary_text, /An RSS description\./);
    assert.equal(it.author_or_channel, RSS_NAME, "author_or_channel is the feed name from the manifest");
    assert.equal(it.published_at, "2099-01-01T00:00:00.000Z", "pubDate is parsed to ISO");
    assert.equal(it.engagement, 0);
    assert.equal(it.source_authority_weight, 0.8, "weight comes from the manifest entry (OpenAI = 0.8)");
    assert.equal(it.kind_bias, "opinion");
  });
});

test("normalizes an Atom entry, taking the link href and the id", async () => {
  const responder = byUrl({ [ATOM_URL]: ATOM(ATOM_ENTRY()) });
  await withFetch(responder, async () => {
    const items = await fetchBlogs({ maxAgeDays: 100000 });
    assert.equal(items.length, 1);
    const it = items[0];
    assert.equal(it.source, "blog");
    assert.equal(it.url, "https://simonwillison.net/2099/an-atom-post/", "Atom url is the link href attribute");
    assert.equal(it.source_id, "tag:simonwillison.net,2099:an-atom-post", "Atom source_id is the id element");
    assert.equal(it.title, "An Atom Post");
    assert.match(it.summary_text, /An Atom summary\./);
    assert.equal(it.author_or_channel, ATOM_NAME);
    assert.equal(it.published_at, "2099-01-01T00:00:00.000Z");
    assert.equal(it.source_authority_weight, 0.75, "weight comes from the manifest entry (Simon Willison = 0.75)");
    assert.equal(it.kind_bias, "opinion");
  });
});

test("decodes HTML entities and collapses whitespace in the title", async () => {
  const xml = RSS(RSS_ITEM({ title: "Scaling   Laws &amp; &quot;Emergence&quot;" }));
  await withFetch(byUrl({ [RSS_URL]: xml }), async () => {
    const items = await fetchBlogs({ maxAgeDays: 100000 });
    assert.equal(items[0].title, 'Scaling Laws & "Emergence"');
  });
});

test("strips CDATA and inline markup from a description", async () => {
  const xml = RSS(
    RSS_ITEM({ description: "<![CDATA[<p>Hello <b>world</b> &amp; friends</p>]]>" })
  );
  await withFetch(byUrl({ [RSS_URL]: xml }), async () => {
    const items = await fetchBlogs({ maxAgeDays: 100000 });
    assert.match(items[0].summary_text, /Hello world & friends/);
    assert.doesNotMatch(items[0].summary_text, /<p>|<b>|CDATA/, "tags and CDATA wrapper are removed");
  });
});

test("falls back to the link when an RSS item has no guid", async () => {
  const xml = RSS(`<item><title>No Guid</title><link>https://openai.com/news/no-guid</link><pubDate>${FAR_FUTURE}</pubDate></item>`);
  await withFetch(byUrl({ [RSS_URL]: xml }), async () => {
    const items = await fetchBlogs({ maxAgeDays: 100000 });
    assert.equal(items.length, 1);
    assert.equal(items[0].source_id, "https://openai.com/news/no-guid", "source_id falls back to the link");
  });
});

test("drops items older than maxAgeDays but keeps undated items", async () => {
  const xml = RSS(
    RSS_ITEM({ title: "Fresh", pubDate: FAR_FUTURE }) +
      RSS_ITEM({ title: "Stale", pubDate: FAR_PAST }) +
      `<item><title>Undated</title><link>https://openai.com/news/undated</link></item>`
  );
  await withFetch(byUrl({ [RSS_URL]: xml }), async () => {
    const items = await fetchBlogs({ maxAgeDays: 100 });
    const titles = items.map((i) => i.title).sort();
    assert.deepEqual(titles, ["Fresh", "Undated"], "the year-2000 item is outside the 100-day window; the undated item is kept");
  });
});

test("caps each feed at perFeed items", async () => {
  const many = Array.from({ length: 8 }, (_, i) =>
    RSS_ITEM({ title: `Post ${i}`, guid: `https://openai.com/news/post-${i}`, link: `https://openai.com/news/post-${i}` })
  ).join("");
  await withFetch(byUrl({ [RSS_URL]: RSS(many) }), async () => {
    const items = await fetchBlogs({ maxAgeDays: 100000, perFeed: 3 });
    assert.equal(items.length, 3, "only the first perFeed items survive");
  });
});

test("aggregates items across multiple feeds", async () => {
  const responder = byUrl({
    [RSS_URL]: RSS(RSS_ITEM({ title: "From OpenAI" })),
    [ATOM_URL]: ATOM(ATOM_ENTRY({ title: "From Simon" })),
  });
  await withFetch(responder, async () => {
    const items = await fetchBlogs({ maxAgeDays: 100000 });
    const titles = items.map((i) => i.title).sort();
    assert.deepEqual(titles, ["From OpenAI", "From Simon"], "items from both feeds are present");
    const channels = items.map((i) => i.author_or_channel).sort();
    assert.deepEqual(channels, [ATOM_NAME, RSS_NAME].sort(), "each item carries its own feed name");
  });
});

test("skips entries with no title", async () => {
  const xml = RSS(
    `<item><link>https://openai.com/news/no-title</link><pubDate>${FAR_FUTURE}</pubDate></item>` +
      RSS_ITEM({ title: "Has Title" })
  );
  await withFetch(byUrl({ [RSS_URL]: xml }), async () => {
    const items = await fetchBlogs({ maxAgeDays: 100000 });
    assert.deepEqual(items.map((i) => i.title), ["Has Title"]);
  });
});

test("returns an empty list when every feed body is empty", async () => {
  await withFetch(byUrl({}), async () => {
    assert.deepEqual(await fetchBlogs({ maxAgeDays: 100000 }), []);
  });
});

test("skips a feed whose fetch is not ok without sinking the run", async () => {
  // One feed 404s, another returns a good item; the bad feed is skipped, the run survives.
  const responder = async (url) => {
    if (url === RSS_URL) return { ok: false, status: 404, text: async () => "" };
    if (url === ATOM_URL) return { ok: true, text: async () => ATOM(ATOM_ENTRY({ title: "Survivor" })) };
    return { ok: true, text: async () => EMPTY_RSS };
  };
  await withFetch(responder, async () => {
    const items = await fetchBlogs({ maxAgeDays: 100000 });
    assert.deepEqual(items.map((i) => i.title), ["Survivor"]);
  });
});
