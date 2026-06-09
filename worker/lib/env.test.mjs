import { test } from "node:test";
import assert from "node:assert/strict";
import { ENV, requireKeys } from "./env.mjs";

// env.mjs is the worker's environment access. ENV exposes the keys (two of them with a
// default), and requireKeys is the startup guard that fails loudly, naming what is
// missing, rather than letting a half-configured run limp on. These tests set and restore
// the relevant process.env keys so they never leak (node --test isolates files, but the
// finally restore keeps the in-file order clean too).

function withEnv(vars, fn) {
  const saved = {};
  for (const k of Object.keys(vars)) {
    saved[k] = process.env[k];
    if (vars[k] === undefined) delete process.env[k];
    else process.env[k] = vars[k];
  }
  try {
    fn();
  } finally {
    for (const k of Object.keys(vars)) {
      if (saved[k] === undefined) delete process.env[k];
      else process.env[k] = saved[k];
    }
  }
}

test("ENV reads each key from process.env", () => {
  withEnv({ PINECONE_API_KEY: "pk", VOYAGE_API_KEY: "vk", ANTHROPIC_API_KEY: "ak", OPENAI_API_KEY: "ok" }, () => {
    assert.equal(ENV.pineconeKey, "pk");
    assert.equal(ENV.voyageKey, "vk");
    assert.equal(ENV.anthropicKey, "ak");
    assert.equal(ENV.openaiKey, "ok");
  });
});

test("pineconeIndex defaults to ai-firehose and openaiKey defaults to empty", () => {
  withEnv({ PINECONE_INDEX: undefined, OPENAI_API_KEY: undefined }, () => {
    assert.equal(ENV.pineconeIndex, "ai-firehose");
    assert.equal(ENV.openaiKey, "");
  });
});

test("pineconeIndex honors an explicit PINECONE_INDEX", () => {
  withEnv({ PINECONE_INDEX: "other-index" }, () => {
    assert.equal(ENV.pineconeIndex, "other-index");
  });
});

test("requireKeys throws naming exactly the missing keys", () => {
  withEnv({ PINECONE_API_KEY: "pk", VOYAGE_API_KEY: undefined, ANTHROPIC_API_KEY: undefined }, () => {
    assert.throws(() => requireKeys(), /Missing env keys: VOYAGE_API_KEY, ANTHROPIC_API_KEY/);
  });
});

test("requireKeys passes when all required keys are present", () => {
  withEnv({ PINECONE_API_KEY: "pk", VOYAGE_API_KEY: "vk", ANTHROPIC_API_KEY: "ak" }, () => {
    assert.doesNotThrow(() => requireKeys());
  });
});

test("requireKeys checks the custom key list it is given", () => {
  withEnv({ SOME_CUSTOM_KEY: undefined }, () => {
    assert.throws(() => requireKeys(["SOME_CUSTOM_KEY"]), /Missing env keys: SOME_CUSTOM_KEY/);
  });
});
