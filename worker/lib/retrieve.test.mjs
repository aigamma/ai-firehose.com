import { test } from "node:test";
import assert from "node:assert/strict";
import { semanticSearch } from "./retrieve.mjs";

// Two-stage semantic search (dense retrieve, then rerank) with a fail-open
// fallback to dense order. The live Voyage/Pinecone deps are injected so this
// runs offline. Mirrors the "No Chatbot" read surface contract in CLAUDE.md.

const QV = [0.1, 0.2, 0.3];
const match = (i, extra = {}) => ({
  id: `id${i}`,
  score: 0.9 - i * 0.1, // strictly descending dense scores
  metadata: { title: `T${i}`, url: `https://e/${i}`, kind: "technique", summary: `S${i}`, concepts: [`c${i}`] },
  ...extra,
});

// A deps factory: records the host and the query options it was called with, and
// returns a fixed match list. rerank/embedQuery/getHost are stubbed.
function makeDeps({ matches = [], rerankImpl, rec = {} } = {}) {
  return {
    embedQuery: async (q) => {
      rec.embeddedQuery = q;
      return QV;
    },
    getHost: async () => "host.example",
    query: async (host, vector, opts) => {
      rec.host = host;
      rec.vector = vector;
      rec.opts = opts;
      return matches;
    },
    rerank:
      rerankImpl ||
      (async (_q, docs, topK) => {
        rec.rerankCalled = true;
        // Reverse the dense order so a passing rerank is observably different.
        return docs.map((_d, i) => ({ index: docs.length - 1 - i, relevance_score: 0.5 + i * 0.01 })).slice(0, topK);
      }),
  };
}

test("empty or whitespace query returns [] without touching any dependency", async () => {
  const rec = {};
  const deps = makeDeps({ matches: [match(0)], rec });
  assert.deepEqual(await semanticSearch("", {}, deps), []);
  assert.deepEqual(await semanticSearch("   ", {}, deps), []);
  assert.equal(rec.embeddedQuery, undefined, "embedQuery never called on empty input");
  assert.equal(rec.host, undefined, "query never called on empty input");
});

test("zero dense matches returns []", async () => {
  const deps = makeDeps({ matches: [] });
  assert.deepEqual(await semanticSearch("anything", {}, deps), []);
});

test("passing kind produces a Pinecone filter of { kind: { $eq: kind } }", async () => {
  const rec = {};
  const deps = makeDeps({ matches: [match(0)], rec });
  await semanticSearch("agents", { kind: "opinion" }, deps);
  assert.deepEqual(rec.opts.filter, { kind: { $eq: "opinion" } });
});

test("passing no kind yields filter undefined", async () => {
  const rec = {};
  const deps = makeDeps({ matches: [match(0)], rec });
  await semanticSearch("agents", {}, deps);
  assert.equal(rec.opts.filter, undefined, "no kind means no filter");
});

test("when rerank throws, results return in dense order with the dense score (fail-open)", async () => {
  const matches = [match(0), match(1), match(2)]; // scores 0.9, 0.8, 0.7
  const deps = makeDeps({
    matches,
    rerankImpl: async () => {
      throw new Error("rerank-2 unavailable");
    },
  });
  const out = await semanticSearch("agents", { topN: 3 }, deps);
  assert.deepEqual(
    out.map((r) => r.title),
    ["T0", "T1", "T2"],
    "dense order is preserved when rerank fails"
  );
  // Score is taken from the dense match (m._rr ?? m.score), rounded to 3 dp.
  assert.deepEqual(
    out.map((r) => r.score),
    [0.9, 0.8, 0.7],
    "fail-open scores come from the dense matches"
  );
});

test("a successful rerank reorders results and uses the rerank score", async () => {
  const matches = [match(0), match(1), match(2)];
  const deps = makeDeps({ matches }); // default rerank reverses order
  const out = await semanticSearch("agents", { topN: 3 }, deps);
  assert.deepEqual(
    out.map((r) => r.title),
    ["T2", "T1", "T0"],
    "rerank order (reversed) wins over dense order"
  );
  assert.ok(
    out.every((r) => typeof r.score === "number"),
    "scores are numeric"
  );
});

test("shaped results expose the metadata fields the read surface needs", async () => {
  const deps = makeDeps({ matches: [match(0)] });
  const [r] = await semanticSearch("agents", { topN: 1 }, deps);
  assert.deepEqual(Object.keys(r).sort(), [
    "author_or_channel",
    "concepts",
    "kind",
    "published_at",
    "score",
    "summary",
    "title",
    "url",
  ]);
  assert.equal(r.title, "T0");
  assert.equal(r.url, "https://e/0");
  assert.deepEqual(r.concepts, ["c0"]);
});
