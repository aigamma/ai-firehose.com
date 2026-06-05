import test from "node:test";
import assert from "node:assert/strict";
import { normalizeSurface, depluralize, buildDurableSurfaceMap, buildFoldMap } from "./fold.mjs";

const entries = [
  { slug: "ai-agent", title: "AI Agent", aliases: ["agent", "LLM agent"] },
  { slug: "large-language-model", title: "Large Language Model", aliases: ["LLM", "large language models"] },
  { slug: "multi-agent-system", title: "Multi-Agent System", aliases: ["multi-agent systems"] },
  { slug: "vision-language-model", title: "Vision-Language Model", aliases: ["VLM", "vision language model"] },
];

test("normalizeSurface collapses case, hyphens, and spacing", () => {
  assert.equal(normalizeSurface("Vision-Language Models"), "vision language models");
  assert.equal(normalizeSurface("multi-agent  systems"), "multi agent systems");
});

test("depluralize folds a trailing plural but spares 'ss' words and short tokens", () => {
  assert.equal(depluralize("agents"), "agent");
  assert.equal(depluralize("systems"), "system");
  assert.equal(depluralize("llms"), "llm");
  assert.equal(depluralize("loss"), "loss"); // 'ss' is spared
  assert.equal(depluralize("ai"), "ai"); // too short to fold
  // It is a fuzzy matching aid, not a true singularizer: a vowel+s word like "bias"
  // is over-folded to "bia". That is harmless, because a generated key only triggers
  // a fold when it equals a REAL durable surface, and every fold is reported for audit.
});

test("buildFoldMap folds plural and surface-variant tags onto the durable concept", () => {
  const { surface } = buildDurableSurfaceMap(entries);
  const corpus = [
    { id: "ai-agents", label: "AI agents", attention: 108 },
    { id: "llm", label: "LLM", attention: 11 },
    { id: "llms", label: "LLMs", attention: 13 },
    { id: "large-language-models", label: "large language models", attention: 28 },
    { id: "multi-agent-systems", label: "multi-agent systems", attention: 36 },
    { id: "vision-language-models", label: "vision-language models", attention: 9 },
    { id: "automation", label: "automation", attention: 88 },
    { id: "claude-code", label: "Claude Code", attention: 69 },
  ];
  const { foldMap } = buildFoldMap(surface, corpus);
  assert.equal(foldMap["ai-agents"], "ai-agent");
  assert.equal(foldMap["llm"], "large-language-model");
  assert.equal(foldMap["llms"], "large-language-model");
  assert.equal(foldMap["large-language-models"], "large-language-model");
  assert.equal(foldMap["multi-agent-systems"], "multi-agent-system");
  assert.equal(foldMap["vision-language-models"], "vision-language-model");
  // Genuinely-new concepts are NOT folded; they go to the authoring pile.
  assert.equal(foldMap["automation"], undefined);
  assert.equal(foldMap["claude-code"], undefined);
});

test("an ambiguous surface (claimed by two durable concepts) is never folded", () => {
  const amb = [
    { slug: "a-thing", title: "Thing", aliases: ["shared label"] },
    { slug: "b-thing", title: "Other", aliases: ["shared label"] },
  ];
  const { surface, ambiguous } = buildDurableSurfaceMap(amb);
  assert.ok(ambiguous.some((x) => x.key === "shared label"));
  const { foldMap } = buildFoldMap(surface, [{ id: "shared-label", label: "shared label", attention: 5 }]);
  assert.equal(foldMap["shared-label"], undefined);
});

test("a concept whose surface equals its own slug is never folded onto itself", () => {
  const { surface } = buildDurableSurfaceMap(entries);
  const { foldMap } = buildFoldMap(surface, [{ id: "ai-agent", label: "AI Agent", attention: 1 }]);
  assert.equal(foldMap["ai-agent"], undefined);
});
