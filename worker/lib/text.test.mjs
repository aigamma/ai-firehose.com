import { test } from "node:test";
import assert from "node:assert/strict";
import { stripEmDashes, decodeEntities } from "./text.mjs";

test("stripEmDashes replaces em dashes (and surrounding spaces) with a comma", () => {
  assert.equal(stripEmDashes("agents — they browse — and act"), "agents, they browse, and act");
  assert.equal(stripEmDashes("open—source"), "open, source");
  assert.equal(stripEmDashes("A, — B"), "A, B"); // no doubled comma
});

test("stripEmDashes leaves en dashes, hyphens, and non-strings alone", () => {
  assert.equal(stripEmDashes("2020–2024"), "2020–2024"); // en dash, numeric range
  assert.equal(stripEmDashes("state-of-the-art"), "state-of-the-art");
  assert.equal(stripEmDashes("no dashes here"), "no dashes here");
  assert.equal(stripEmDashes(undefined), undefined);
  assert.equal(stripEmDashes(null), null);
});

test("decodeEntities decodes numeric, hex, and named character references", () => {
  // The real bug: numeric refs for curly punctuation leaked into titles.
  assert.equal(decodeEntities("Why Apple&#8217;s slow-and-steady AI bet"), "Why Apple’s slow-and-steady AI bet");
  assert.equal(decodeEntities("accusing it of &#8216;dual-pricing&#8217; tricks"), "accusing it of ‘dual-pricing’ tricks");
  assert.equal(decodeEntities("loading&#8230;"), "loading…");
  // Hex refs (Hacker News / Reddit encode slashes and apostrophes this way).
  assert.equal(decodeEntities("path a&#x2F;b and it&#x27;s here"), "path a/b and it's here");
  // Named refs, including the smart quotes and the en/em dashes.
  assert.equal(decodeEntities("Tom &amp; Jerry, &quot;quoted&quot;, A&ndash;B"), 'Tom & Jerry, "quoted", A–B');
  assert.equal(decodeEntities("&lt;tag&gt; &nbsp;x"), "<tag>  x");
});

test("decodeEntities leaves unknown entities and non-strings intact, and is idempotent", () => {
  // Do not guess an unmapped named entity; leave it verbatim rather than mangle it.
  assert.equal(decodeEntities("score &fakeentity; here"), "score &fakeentity; here");
  // An out-of-range numeric ref is left as-is rather than throwing.
  assert.equal(decodeEntities("&#99999999999;"), "&#99999999999;");
  // Already-decoded text is unchanged (safe to run twice, e.g. re-ingest over a clean corpus).
  assert.equal(decodeEntities("clean ’ title, no refs"), "clean ’ title, no refs");
  assert.equal(decodeEntities(undefined), undefined);
  assert.equal(decodeEntities(null), null);
});
