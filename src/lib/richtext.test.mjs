import { test } from "node:test";
import assert from "node:assert/strict";
import { buildMatcher, parseInline } from "./richtext.js";

const concepts = [
  { id: "self-attention", label: "Self-Attention", aliases: ["scaled dot-product attention"] },
  { id: "large-language-model", label: "Large Language Model", aliases: ["LLM"] },
  { id: "transformer", label: "Transformer", aliases: [] },
];

test("buildMatcher prefers the longest surface form and skips tiny aliases", () => {
  const m = buildMatcher(concepts);
  assert.ok(m.re);
  assert.ok(m.map.has("self-attention"));
  assert.ok(m.map.has("large language model"));
  // "llm" is length 3 with letters, so it is kept; a 1-char alias would be dropped.
  assert.ok(m.map.has("llm"));
});

test("parseInline wiki-links the first occurrence of each known term only", () => {
  const matcher = buildMatcher(concepts);
  const toks = parseInline("The Transformer is a Transformer used in a Large Language Model.", { matcher });
  const wikis = toks.filter((t) => t.t === "wiki");
  assert.equal(wikis.length, 2, "transformer linked once, LLM linked once");
  assert.deepEqual(
    wikis.map((w) => w.slug),
    ["transformer", "large-language-model"]
  );
});

test("a concept's own label beats another concept's alias for the same surface form", () => {
  // attention-mechanism wrongly lists "self-attention" as an alias; self-attention's
  // own label must still win so the link goes to the right hub.
  const m = buildMatcher([
    { id: "attention-mechanism", label: "Attention Mechanism", aliases: ["self-attention", "attention"] },
    { id: "self-attention", label: "Self-Attention", aliases: [] },
  ]);
  assert.equal(m.map.get("self-attention").slug, "self-attention");
  assert.equal(m.map.get("attention").slug, "attention-mechanism");
});

test("parseInline does not link a term to its own page", () => {
  const matcher = buildMatcher(concepts);
  const toks = parseInline("A Transformer explains itself.", { matcher, currentSlug: "transformer" });
  assert.equal(toks.filter((t) => t.t === "wiki").length, 0);
});

test("parseInline handles bold, italic, code, links, and citations", () => {
  const matcher = buildMatcher([]);
  const toks = parseInline("a **b** and *c* and `d` and [e](http://x) and [1]", { matcher, withCitations: true });
  const types = toks.map((t) => t.t);
  assert.ok(types.includes("strong"));
  assert.ok(types.includes("em"));
  assert.ok(types.includes("code"));
  assert.ok(types.includes("link"));
  assert.ok(types.includes("cite"));
});
