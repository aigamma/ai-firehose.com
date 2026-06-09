import { test } from "node:test";
import assert from "node:assert/strict";
import { MODELS, structured, complete } from "./anthropic.mjs";

// anthropic.mjs wraps the Messages API in three stakes tiers (MODELS) plus two helpers:
// structured() forces a tool call and returns its validated input, complete() returns the
// joined text. The network call is mocked here, so these pin the tier registry and the
// response parsing (the tool_use extraction, the text join, the non-ok error), not the
// live API. AbortSignal.timeout's timer is unref'd, so the success-path mocks stay fast.

function withFetch(responder, fn) {
  const real = globalThis.fetch;
  globalThis.fetch = responder;
  return Promise.resolve()
    .then(fn)
    .finally(() => {
      globalThis.fetch = real;
    });
}
const okJson = (data) => async () => ({ ok: true, json: async () => data });

test("MODELS maps the three stakes tiers to non-empty model ids", () => {
  for (const tier of ["bulk", "quality", "enduring"]) {
    assert.equal(typeof MODELS[tier], "string");
    assert.ok(MODELS[tier].length > 0, `${tier} is a non-empty model id`);
  }
  assert.match(MODELS.bulk, /haiku/, "bulk is the cheap Haiku tier");
  assert.match(MODELS.enduring, /opus/, "enduring is the strongest Opus tier");
});

test("structured returns the forced tool call's input object", async () => {
  const tool = { name: "classify", input_schema: { type: "object" } };
  await withFetch(
    okJson({ content: [{ type: "tool_use", name: "classify", input: { kind: "technique" } }] }),
    async () => {
      const out = await structured({ prompt: "hi", tool });
      assert.deepEqual(out, { kind: "technique" });
    }
  );
});

test("structured throws when the model returns no tool_use block", async () => {
  const tool = { name: "classify", input_schema: { type: "object" } };
  await withFetch(okJson({ content: [{ type: "text", text: "no tool here" }] }), async () => {
    await assert.rejects(structured({ prompt: "hi", tool }), /no tool_use block/);
  });
});

test("complete joins and trims the returned text blocks", async () => {
  await withFetch(
    okJson({ content: [{ type: "text", text: "  Hello" }, { type: "text", text: " world  " }] }),
    async () => {
      assert.equal(await complete({ prompt: "hi" }), "Hello world");
    }
  );
});

test("a non-ok response throws with the status code", async () => {
  await withFetch(async () => ({ ok: false, status: 429, text: async () => "rate limited" }), async () => {
    await assert.rejects(complete({ prompt: "hi" }), /Anthropic 429/);
  });
});
