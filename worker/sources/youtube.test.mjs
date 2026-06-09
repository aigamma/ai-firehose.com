import { test } from "node:test";
import assert from "node:assert/strict";
import { parseEntries } from "./youtube.mjs";

// parseEntries is the pure normalization core of the primary (YouTube) adapter: it turns
// a channel feed's Atom XML plus the channel's registry record into the uniform corpus
// item shape. It does no network and reads no clock (the recency cutoff lives in
// fetchYouTube), so these tests pass canned feed XML directly. They pin the field
// mapping, HTML-entity decode, the title+description summary, the view-count -> engagement
// mapping, the channel weight/kind defaults, and the no-videoId skip rule.

const CHANNEL = { name: "Test Channel", channel_id: "UC123", authority_weight: 0.9, kind_bias: "technique" };

const FEED = (entries) => `<?xml version="1.0"?><feed>${entries}</feed>`;
const ENTRY = ({
  videoId = "vid123",
  title = "A Video",
  desc = "A description.",
  published = "2026-06-01T00:00:00+00:00",
  views = "1000",
} = {}) =>
  `<entry>` +
  (videoId ? `<yt:videoId>${videoId}</yt:videoId>` : "") +
  `<title>${title}</title>` +
  `<published>${published}</published>` +
  `<media:group><media:description>${desc}</media:description>` +
  (views ? `<media:community><media:statistics views="${views}"/></media:community>` : "") +
  `</media:group></entry>`;

test("parses a feed entry into the uniform YouTube item shape", () => {
  const items = parseEntries(FEED(ENTRY()), CHANNEL);
  assert.equal(items.length, 1);
  const it = items[0];
  assert.equal(it.source, "youtube");
  assert.equal(it.source_id, "vid123");
  assert.equal(it.url, "https://www.youtube.com/watch?v=vid123");
  assert.equal(it.title, "A Video");
  assert.match(it.summary_text, /A Video/);
  assert.match(it.summary_text, /A description\./);
  assert.equal(it.author_or_channel, "Test Channel");
  assert.equal(it.published_at, "2026-06-01T00:00:00+00:00");
  assert.equal(it.engagement, 1000);
  assert.equal(it.source_authority_weight, 0.9);
  assert.equal(it.kind_bias, "technique");
});

test("decodes HTML entities in the title", () => {
  const items = parseEntries(FEED(ENTRY({ title: "Q&amp;A: &quot;LLMs&quot; &lt;live&gt;" })), CHANNEL);
  assert.equal(items[0].title, 'Q&A: "LLMs" <live>');
});

test("maps the view count to engagement, defaulting to 0 when absent", () => {
  assert.equal(parseEntries(FEED(ENTRY({ views: "54321" })), CHANNEL)[0].engagement, 54321);
  assert.equal(parseEntries(FEED(ENTRY({ views: "" })), CHANNEL)[0].engagement, 0);
});

test("builds summary_text from the title then the description", () => {
  const it = parseEntries(FEED(ENTRY({ title: "Title", desc: "Body." })), CHANNEL)[0];
  assert.equal(it.summary_text, "Title\n\nBody.");
});

test("falls back to weight 0.8 and kind mixed when the channel omits them", () => {
  const it = parseEntries(FEED(ENTRY()), { name: "Plain" })[0];
  assert.equal(it.source_authority_weight, 0.8);
  assert.equal(it.kind_bias, "mixed");
  assert.equal(it.author_or_channel, "Plain");
});

test("skips entries without a videoId, keeps the rest", () => {
  const xml = FEED(ENTRY({ videoId: "" }) + ENTRY({ videoId: "keep1", title: "Keep" }));
  assert.deepEqual(
    parseEntries(xml, CHANNEL).map((i) => i.source_id),
    ["keep1"]
  );
});

test("returns an empty list for a feed with no entries", () => {
  assert.deepEqual(parseEntries(FEED(""), CHANNEL), []);
});
