import { test } from "node:test";
import assert from "node:assert/strict";
import { costUsd, recordLlm, flushTelemetry } from "./otel.mjs";

// otel.mjs is the worker's zero-dependency OTLP emitter. These pin the pure cost
// math and, most importantly, the fail-open contract: with no collector endpoint
// configured (the test environment), recordLlm must be a complete no-op and must
// not touch global fetch, which the anthropic/voyage suites mock.

test("costUsd prices input and output tokens per 1,000 for a known model", () => {
  // claude-haiku-4-5: [0.0008, 0.004] per 1k tokens.
  assert.equal(costUsd("claude-haiku-4-5-20251001", 1000, 1000), 0.0008 + 0.004);
  assert.equal(costUsd("claude-haiku-4-5-20251001", 0, 0), 0);
});

test("costUsd treats an unknown model as free and never throws", () => {
  assert.equal(costUsd("nonexistent-model", 1234, 567), 0);
});

test("costUsd bills embedding models on input tokens only", () => {
  // voyage-3: [0.00006, 0]; output tokens must not add cost.
  assert.equal(costUsd("voyage-3", 1000, 9999), 0.00006);
});

test("recordLlm is a no-op (no throw, no fetch) when no endpoint is configured", async () => {
  let fetched = false;
  const real = globalThis.fetch;
  globalThis.fetch = () => {
    fetched = true;
    return Promise.resolve({ ok: true, json: async () => ({}) });
  };
  try {
    recordLlm({
      system: "anthropic",
      model: "claude-haiku-4-5-20251001",
      operation: "classify",
      inputTokens: 10,
      outputTokens: 5,
      startMs: Date.now(),
      ok: true,
    });
    await flushTelemetry();
    assert.equal(fetched, false, "disabled emitter must not call fetch");
  } finally {
    globalThis.fetch = real;
  }
});
