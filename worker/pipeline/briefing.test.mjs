import { test } from "node:test";
import assert from "node:assert/strict";
import { buildBriefingState, stateHash } from "./briefing.mjs";

// buildBriefingState is the pure, offline core of the agentic briefing: it
// normalizes a window's movers, outliers, and new items, and builds the concept
// vocabulary (real slugs plus labels) the model is allowed to cite. generateBriefing
// itself calls the model, so it is exercised live by the pipeline, not here.

test("buildBriefingState builds a citable concept vocabulary and normalizes items", () => {
  const state = buildBriefingState({
    horizon: "week",
    horizonLabel: "week",
    movers: [{ id: "test-time-compute", kind: "technique", label: "test-time compute", ratio: 145, momentum: 145, quadrant: "leading" }],
    outliers: [{ id: "ai-agents", kind: "tool", label: "AI agents", outlier: { breakout: true } }],
    newItems: [{ title: "X", author_or_channel: "Y", url: "http://x", summary: "s", concepts: ["prompt-chaining"] }],
  });

  // The vocabulary maps slugs to labels, humanizing item concept slugs that have no
  // board label of their own.
  const vocab = Object.fromEntries(state.concepts.map((c) => [c.slug, c.label]));
  assert.equal(vocab["test-time-compute"], "test-time compute");
  assert.equal(vocab["ai-agents"], "AI agents");
  assert.equal(vocab["prompt-chaining"], "prompt chaining");

  // Items and movers are normalized to the fields the prompt needs.
  assert.equal(state.newItems[0].url, "http://x");
  assert.equal(state.newItems[0].concepts[0], "prompt-chaining");
  assert.equal(state.movers[0].momentum, 145);
  assert.equal(state.outliers[0].outlier.breakout, true);
});

test("buildBriefingState caps the concept vocabulary at 32", () => {
  const movers = Array.from({ length: 50 }, (_, i) => ({
    id: `concept-${i}`,
    kind: "technique",
    label: `concept ${i}`,
    ratio: 100,
    momentum: 100,
    quadrant: "lagging",
  }));
  const state = buildBriefingState({ horizon: "day", horizonLabel: "day", movers, outliers: [], newItems: [] });
  assert.ok(state.concepts.length <= 32, `expected <= 32 concepts, got ${state.concepts.length}`);
});

test("buildBriefingState tolerates empty and malformed input", () => {
  const state = buildBriefingState({ horizon: "month", horizonLabel: "month" });
  assert.deepEqual(state.movers, []);
  assert.deepEqual(state.outliers, []);
  assert.deepEqual(state.newItems, []);
  assert.deepEqual(state.concepts, []);
});

// stateHash is the briefing's idempotency key: the pipeline reuses the cached Opus
// briefing while the hash is unchanged, so it must be stable for identical state, move
// on a salient change, and stay put for a cosmetic one (no needless Opus regeneration).
const briefingInput = () => ({
  horizon: "day",
  horizonLabel: "Day",
  movers: [{ id: "rag", kind: "technique", label: "RAG", ratio: 1.2, momentum: 3.4, quadrant: "leading" }],
  outliers: [{ id: "ai-agent", kind: "technique", label: "AI Agent", outlier: { breakout: true } }],
  newItems: [{ title: "A paper", url: "https://example.com/1", concepts: ["rag"] }],
});

test("stateHash is identical for identical window state (the cache-hit path)", () => {
  const a = stateHash(buildBriefingState(briefingInput()));
  const b = stateHash(buildBriefingState(briefingInput()));
  assert.equal(a, b);
  assert.match(a, /^[0-9a-f]{16}$/, "hash16 shape");
});

test("stateHash moves when a salient field changes (the cache-miss path)", () => {
  const base = stateHash(buildBriefingState(briefingInput()));
  const quadrant = briefingInput();
  quadrant.movers[0].quadrant = "weakening";
  assert.notEqual(stateHash(buildBriefingState(quadrant)), base, "a quadrant flip is a content change");
  const momentum = briefingInput();
  momentum.movers[0].momentum = 9.9; // rounds to 10, not 3
  assert.notEqual(stateHash(buildBriefingState(momentum)), base, "momentum rounding to a new integer is a change");
  const newItem = briefingInput();
  newItem.newItems.push({ title: "Another", url: "https://example.com/2", concepts: [] });
  assert.notEqual(stateHash(buildBriefingState(newItem)), base, "a new item is a change");
  const outlier = briefingInput();
  outlier.outliers.push({ id: "world-model", kind: "technique", label: "World Model", outlier: { new_entrant: true } });
  assert.notEqual(stateHash(buildBriefingState(outlier)), base, "a new outlier is a change");
});

test("stateHash ignores cosmetic changes that must not trigger an Opus regeneration", () => {
  const base = stateHash(buildBriefingState(briefingInput()));
  const relabel = briefingInput();
  relabel.movers[0].label = "Retrieval Augmented Generation";
  assert.equal(stateHash(buildBriefingState(relabel)), base, "relabeling the same concept is not a content change");
  const ratio = briefingInput();
  ratio.movers[0].ratio = 99; // ratio is not part of the cache key
  assert.equal(stateHash(buildBriefingState(ratio)), base, "ratio is not in the signature");
  const jitter = briefingInput();
  jitter.movers[0].momentum = 3.4001; // still rounds to 3
  assert.equal(stateHash(buildBriefingState(jitter)), base, "sub-integer momentum jitter rounds the same");
});
