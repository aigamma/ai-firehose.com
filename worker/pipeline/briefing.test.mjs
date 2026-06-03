import { test } from "node:test";
import assert from "node:assert/strict";
import { buildBriefingState } from "./briefing.mjs";

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
