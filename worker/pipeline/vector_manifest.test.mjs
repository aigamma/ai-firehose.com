import { test } from "node:test";
import assert from "node:assert/strict";
import { metadataHash, planVectorSync, markVectorSynced, removeVectorIds, stableJson } from "./vector_manifest.mjs";

const record = (id, text, metadata = {}) => ({ id, text, metadata: { title: id, ...metadata } });

test("stableJson is independent of object key order", () => {
  assert.equal(stableJson({ b: 2, a: { y: 2, x: 1 } }), stableJson({ a: { x: 1, y: 2 }, b: 2 }));
  assert.equal(metadataHash({ b: 2, a: 1 }), metadataHash({ a: 1, b: 2 }));
});

test("planVectorSync embeds new or changed text, updates metadata-only changes, and finds stale ids by type", () => {
  let manifest = { version: 1, vectors: {} };
  manifest = markVectorSynced(manifest, [record("corpus::1", "same", { tag: "old" })], "corpus", "t1");
  manifest = markVectorSynced(manifest, [record("corpus::stale", "gone")], "corpus", "t1");
  manifest = markVectorSynced(manifest, [record("glossary::kept", "old")], "glossary", "t1");

  const plan = planVectorSync(
    manifest,
    [
      record("corpus::1", "same", { tag: "new" }),
      record("corpus::2", "new text"),
      record("corpus::3", "changed text"),
    ],
    "corpus"
  );

  assert.deepEqual(plan.toUpdate.map((r) => r.id), ["corpus::1"]);
  assert.deepEqual(plan.toEmbed.map((r) => r.id), ["corpus::2", "corpus::3"]);
  assert.deepEqual(plan.staleIds, ["corpus::stale"]);
  assert.equal(plan.unchanged, 0);
});

test("markVectorSynced records the type and removeVectorIds deletes only requested ids", () => {
  let manifest = markVectorSynced({}, [record("a", "A"), record("b", "B")], "corpus", "t1");
  assert.equal(manifest.vectors.a.type, "corpus");
  assert.equal(manifest.vectors.a.updated_at, "t1");

  manifest = removeVectorIds(manifest, ["a"]);
  assert.equal(manifest.vectors.a, undefined);
  assert.ok(manifest.vectors.b);
});
