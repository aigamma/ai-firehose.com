import { test } from "node:test";
import assert from "node:assert/strict";
import { hash16, itemId, slugify } from "./hash.mjs";

// Core contract: Idempotency. Content-hashed chunks and deterministic vector ids
// are what let a re-run be a no-op upsert (CLAUDE.md "Idempotency").

test("hash16 is deterministic, 16 hex chars, and sensitive to a one-char change", () => {
  const a = hash16("the quick brown fox");
  assert.equal(a.length, 16, "16 chars");
  assert.match(a, /^[0-9a-f]{16}$/, "lowercase hex");
  assert.equal(hash16("the quick brown fox"), a, "same input yields same hash");
  const b = hash16("the quick brown fix"); // one char changed
  assert.notEqual(b, a, "a one-char change changes the hash");
  assert.equal(b.length, 16, "still 16 chars after the change");
});

test("itemId composes exactly kind::source::slug::hash and is stable across calls", () => {
  // slug is the slugified source slug, not the raw string.
  const id = itemId("technique", "youtube", "Attention Is All You Need", "abc123def4567890");
  assert.equal(id, "technique::youtube::attention-is-all-you-need::abc123def4567890");
  // The no-op idempotency guarantee: identical inputs yield byte-identical ids.
  assert.equal(itemId("technique", "youtube", "Attention Is All You Need", "abc123def4567890"), id);
});

test("itemId slugifies the source slug segment", () => {
  // A raw slug with spaces/punctuation must be normalized inside the id so the
  // vector id stays a clean, deterministic key.
  assert.equal(itemId("opinion", "hn", "GPT-5: a hot take!", "0000000000000000"), "opinion::hn::gpt-5-a-hot-take::0000000000000000");
});

test("slugify lowercases, collapses non-alphanumerics to single hyphens, and trims", () => {
  assert.equal(slugify("Hello World"), "hello-world", "space -> single hyphen, lowercased");
  assert.equal(slugify("A  B___C--D"), "a-b-c-d", "runs of non-alphanumerics collapse to one hyphen");
  assert.equal(slugify("  leading and trailing  "), "leading-and-trailing", "leading/trailing hyphens stripped");
  assert.equal(slugify("!!!surrounded!!!"), "surrounded", "leading/trailing punctuation stripped");
});

test("slugify caps the output at 64 chars", () => {
  const long = "a".repeat(200);
  assert.equal(slugify(long).length, 64, "capped at 64");
  // A label whose 65th boundary falls on a hyphen still caps cleanly to 64.
  const mixed = `${"word ".repeat(40)}`; // many words, well over 64 chars
  assert.ok(slugify(mixed).length <= 64, "never exceeds 64");
});

test("slugify folds diacritics via NFKD", () => {
  // NFKD decomposes an accented letter into base + a combining mark. The base
  // ASCII letter survives; the combining mark is non-alphanumeric. When the accent
  // is on a trailing letter the mark trims away cleanly (cafe, resume). When it is
  // mid-word the mark collapses to a separating hyphen, but the base letters around
  // it still survive, which is the fold doing its job.
  assert.equal(slugify("Café au lait"), "cafe-au-lait", "trailing accent folds to a bare base letter");
  // Mid-word combining marks collapse to a separating hyphen; the base ASCII
  // letters around them all survive, which is the NFKD fold doing its job.
  assert.equal(slugify("résumé"), "re-sume", "mid-word accent separates, trailing accent trims");
  assert.equal(slugify("naïve"), "nai-ve", "a mid-word combining mark separates but base letters survive");
  // A precomposed character that NFKD expands to ASCII (ﬁ ligature -> f i).
  assert.equal(slugify("eﬃcient"), "efficient", "NFKD compatibility-decomposes the ﬃ ligature");
});
