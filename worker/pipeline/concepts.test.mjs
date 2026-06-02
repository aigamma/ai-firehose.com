import { test } from "node:test";
import assert from "node:assert/strict";
import { canonicalizeConcepts } from "./concepts.mjs";

// Crafted vectors: the LLM family is near-identical; generative AI and
// self-improving AI are only moderately close and share no significant token.
const VEC = {
  LLMs: [1, 0, 0],
  LLM: [0.99, 0.01, 0],
  "large language models": [0.98, 0, 0.02],
  "generative AI": [0, 1, 0],
  "self-improving AI": [0, 0.6, 0.8],
};
const fakeEmbed = async (labels) => labels.map((l) => VEC[l] || [0, 0, 0.0001]);

test("merges synonyms but keeps distinct AI-X concepts apart", async () => {
  const items = [{ concepts: ["LLMs", "LLM", "large language models", "generative AI", "self-improving AI"] }];
  const { canon } = await canonicalizeConcepts(items, { embedFn: fakeEmbed });
  assert.equal(canon.length, 3, "five labels collapse to three concepts");
  const llm = canon.find((c) => /llm|language/i.test(c.label));
  assert.ok(llm && llm.aliases.length >= 2, "the LLM family merged with aliases");
  assert.ok(canon.some((c) => c.label === "generative AI"), "generative AI stays distinct");
  assert.ok(canon.some((c) => c.label === "self-improving AI"), "self-improving AI stays distinct");
});
