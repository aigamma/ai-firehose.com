# RAG and Embedding Substrate

The non-chat embedding layer, ported from `C:\civil\rag`. It powers organization, the visualizations, the relative-rotation math, and one live semantic search endpoint. There is no chatbot.

## Substrate

- **Pinecone.** Index `ai-firehose`, serverless, cosine, 1024-dim. Single namespace plus metadata filters (cross-kind similarity matters for clusters and neighbors, so no namespace-per-kind).
- **Voyage.** `voyage-3` for embeddings (`input_type=document` on ingest, `query` on retrieval). `rerank-2` for the live search second stage.
- **Ports.** `rag/shared.mjs` (env, Pinecone and Voyage helpers), `rag/ingest.mjs` (idempotent upsert), `rag/retrieve.mjs` (two-stage retrieval). Precompute scripts: `rag/precompute.mjs`, `rag/precompute_concept_axes.mjs`, `rag/precompute_clusters_neighbors.py`, `rag/precompute_influence.py`.

## Item Vector Metadata

Each vector carries: `id`, `kind` (technique|tool|opinion), `source`, `source_authority_weight`, `title`, `url`, `author_or_channel`, `published_at`, `concepts` (glossary slugs), `entities`, `stance` (opinions), `engagement`, `content_hash`. Retrieval can filter by any field (for example kind, or `published_at` within a horizon).

## Live Semantic Search

`netlify/functions/retrieve.mjs`: embed the query (voyage-3, `input_type=query`), Pinecone dense query for top-K, Voyage `rerank-2` to top-N, apply a similarity floor, return the citation payload. Fail-open: if Voyage rerank errors, fall back to dense order. No generation, no chat.

## Precompute Artifacts

Built at network-rebuild time, served from `/data`:

| Artifact | Algorithm | Notes |
|---|---|---|
| `centroids.json` | mean-pool the entity's item vectors, L2 normalize | per-entity position |
| `clusters.json` | deterministic k-means (k near sqrt(N), seed-spread init, up to 60 iterations); labeled by its top member concepts | auto themes (LLM naming is intended, not yet wired) |
| `spectrums.json` | concept axes: `axis_vector = normalize(embed(pole_a) - embed(pole_b))`, project centroids | served file is positions-only (`{id, label, position_normalized}`); the 1024-dim `axis_vector` and the raw `position` are stripped from the payload. Vectors are parked in `worker/.cache/axis_vectors.json` for future live projection |
| `influence.json` | derivation and mention edges | network view |
| `glossary/c/<slug>.json` | per-concept hub assembled from the above | full hub (definition, neighbors, axis_positions, top_items), fetched on demand by `/technique/:slug` |
| `glossary/index.json` | slim list derived from the hubs | `{id, label, kind, attention, aliases, def_snippet}` per concept; drives the glossary list and search |
| `attention/<kind>_<horizon>.json` | the rotation math below | drives the rotation boards |
| `digests/<horizon>.json` | new items plus entered or jumped entities plus outliers | What Is New |

Neighbors are computed every rebuild and denormalized into the hubs, so no standalone `neighbors.json` is served (it was fetched by nothing).

### Artifact Schemas (initial)

`attention/<kind>_<horizon>.json`: `{ kind, horizon, generated, entities: [{ id|slug, label, attention, rs, ratio, momentum, quadrant, sparkline: number[], outlier: { breakout, new_entrant, quadrant_jump } }] }`.

`glossary/index.json`: `{ generated, count, concepts: [{ id, label, kind, attention, aliases, def_snippet }] }`. The light list and search payload.

`glossary/c/<slug>.json`: `{ id, label, kind, attention, first_seen, rotation: { horizon, quadrant, ratio, momentum, sparkline } | null, aliases, definition, neighbors: [{ id, label, score }], axis_positions: [{ slug, title, position }], top_items: [{ title, url, author_or_channel, published_at, kind }] }`. The full per-concept hub, fetched on demand. `rotation` is the concept's status on its primary kind's board for the default horizon (null when it has no attention in that window), and powers the hub Momentum card.

`spectrums.json`: `{ generated, axes: [{ slug, title, pole_a, pole_b, positions: [{ id, label, position_normalized }] }] }`. The `axis_vector` per axis is held out of the served payload (see the table above).

(Schemas are extended as phases land; keep this table and the writers in sync. Rule: a served artifact ships only the fields a page renders. Audit consumers with a raw recursive grep before adding a field, since the dedicated search tool ignores the built `dist/` bundle.)

## Relative-Rotation Math (ported from aigamma)

Per entity `e` at time `t`, within a kind:

```
attention_raw(e,t) = sum over items i in window referencing e of
                     w_source(i) * w_recency(i) * w_engagement(i)
benchmark(t)       = sum over all e of attention_raw(e,t)        # the discourse "market"
RS(e,t)            = 100 * attention_raw(e,t) / benchmark(t)
sRS                = EMA(RS, smoothWindow)
rotation_ratio     = 100 * sRS / EMA(sRS, slowWindow)            # > 100 leading
rotation_momentum  = 100 * rotation_ratio / EMA(rotation_ratio, fastWindow)  # > 100 gaining
quadrant           = quadrantOf(rotation_ratio, rotation_momentum)
```

Window triples per horizon live in `registry.js` `HORIZONS`. `quadrantOf`, `ema`, and `percentileRank` are in `src/lib/rotation.js`. Trailing distributions for outlier z-scores and percentile ranks are bounded by the retained quarter.

## Outlier Hunt

Flag an entity when any holds: extreme momentum z-score over its trailing distribution (breakout), attention percentile rank above a high threshold, first appearance in the window (new entrant), or a quadrant change since the last rebuild. The outliers strip and digests are built from these flags.

## Concept Axes (v1)

Seven AI-discourse axes (slugs in `registry.js` `AXES`): open vs closed, scaling vs efficiency, capability vs safety, research vs product, agents vs assistive, neural vs symbolic, central vs local. Each pole is a multi-sentence anchor (authored in `worker/pipeline/prompts/`) that embeds both the concept and concrete examples, the civil pole-writing pattern.

## Determinism and Cost

A pinned PCA start vector, deterministic k-means init (seed-spread, no RNG), stable sort, and content-hash gating make the network rebuild reproducible: unchanged data is a no-op, one new item recomputes only what changed. With the rolling-quarter corpus, expect costs near the civil reference (about 25 dollars per month) plus Whisper per caption-less video. See `docs/OPERATIONS.md`.
