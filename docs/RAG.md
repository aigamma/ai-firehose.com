# RAG and Embedding Substrate

The non-chat embedding layer, reimplemented natively in the worker from the approach proven at civil (there is no separate top-level rag directory and no Python). It powers organization, the visualizations, the relative-rotation math, and one live semantic search endpoint. There is no chatbot.

## Substrate

- **Pinecone.** Index `ai-firehose`, serverless, cosine, 1024-dim. Single namespace plus metadata filters (cross-kind similarity matters for clusters and neighbors, so no namespace-per-kind).
- **Voyage.** `voyage-3` for embeddings (`input_type=document` on ingest, `query` on retrieval). `rerank-2` for the live search second stage.
- **Modules.** Shared helpers in `worker/lib/`: `worker/lib/voyage.mjs` (Voyage embeddings and rerank), `worker/lib/pinecone.mjs` (vector upsert, metadata update, query, and manual listing), and `worker/lib/retrieve.mjs` (two-stage retrieval), over `worker/lib/env.mjs`, `worker/lib/cache.mjs`, and `worker/lib/hash.mjs`. Idempotent embed-and-upsert is orchestrated by `worker/pipeline/run.mjs` with `worker/pipeline/vector_manifest.mjs`; the network precompute (centroids, clusters, spectrums, neighbors, influence) is `worker/pipeline/network.mjs`. All JavaScript; no Python.

## Item Vector Metadata

Each corpus vector carries: `id`, `kind` (technique|tool|opinion), `source`, `source_authority_weight`, `title`, `url`, `author_or_channel`, `published_at`, `concepts` (glossary slugs), `entities`, `stance` (opinions), `engagement`, `summary`, `text`, and `content_hash`. `summary` is the display payload; `text` is the trimmed retrieval payload used by rerank. Durable glossary vectors use `glossary::<slug>` ids and the same `title`, `url`, `kind`, `summary`, `text`, `concepts`, `durable`, `source`, and `content_hash` shape. Retrieval can filter by any field (for example kind, or `published_at` within a horizon).

## Live Semantic Search

`netlify/functions/retrieve.mjs`: embed the query (voyage-3, `input_type=query`), Pinecone dense query for top-K, Voyage `rerank-2` over `metadata.text` to top-N, apply a similarity floor, return the citation payload. Fail-open: if Voyage rerank errors, fall back to dense order. No generation, no chat.

## Citation Contract

Every surface that attributes a claim, whether live search results, the agentic daily briefing, or a Watch video card, emits the same citation payload, so attribution reads uniformly across the site and a future surface inherits it for free. This mirrors civil's `CitationPayload` and worldthought's "cite the source, never invent it" discipline. The shape is the existing `ItemCard` shape:

```
{ id, kind, title, url, author_or_channel, published_at, concepts: string[], summary, score? }
```

Rules:

- A model claim must trace to an item (rendered as the title linked to `url`) or to a concept (rendered as a wiki-link to its hub at `/technique/<slug>`). The project's "cite claims" Writing Rule is enforced here: generated prose that names a development links it to the item or concept it came from.
- `concepts[]` are glossary slugs; the renderer turns each into a hub link. This is the worldthought person-page-as-hub pattern: the concept hub is the citation target, carrying the definition, neighbors, axes, and momentum.
- Never fabricate a `url`, a `title`, or a `published_at`. If a field is unknown, omit it; the card still renders from what is present.
- Verbatim source titles are quotes, left intact (they may contain an em dash); generated prose around them follows the no-em-dash rule and is sanitized through `worker/lib/text.mjs`.

The agentic daily briefing (`worker/pipeline/briefing.mjs`) and the featured-creators artifact (`scripts/build_creators.mjs`) both carry `cited_items` and concept references in this shape. See `docs/FEATURE_PLAYBOOK.md` for how a new feature adopts the contract.

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
| `attention/<kind>_<horizon>.json` | the trend and rotation math below | drives the trend boards (Home and the kind deep views) |
| `digests/<horizon>.json` | new items plus entered or jumped entities plus outliers | What Is New |
| `digests/briefing_<horizon>.json` | the agentic daily briefing (`worker/pipeline/briefing.mjs`): a cited, sanitized prose summary of the window | the Home briefing lede |
| `creators.json` | featured creators resolved from RSS plus the corpus join (`scripts/build_creators.mjs`) | the Watch page and the Home watch teaser; see `docs/SOURCES.md` |

Neighbors are computed every rebuild and denormalized into the hubs, so no standalone `neighbors.json` is served (it was fetched by nothing).

### Artifact Schemas (initial)

`attention/<kind>_<horizon>.json`: `{ kind, horizon, generated, entities: [{ id|slug, label, attention, rs, ratio, momentum, quadrant, trend, delta, sparkline: number[], outlier: { breakout, new_entrant, quadrant_jump } }] }`. `delta` is the growth in weighted attention this window versus the prior equal window and is the board's sort key; `trend` is that same change normalized to [-1, 1] for the up/steady/down arrow. `ratio`, `momentum`, and `quadrant` are the Mansfield rotation values, retained for the concept hub Momentum card rather than a plane.

`glossary/index.json`: `{ generated, count, concepts: [{ id, label, kind, attention, aliases, def_snippet }] }`. The light list and search payload.

`glossary/c/<slug>.json`: `{ id, label, kind, attention, first_seen, rotation: { horizon, quadrant, ratio, momentum, sparkline } | null, aliases, definition, neighbors: [{ id, label, score }], axis_positions: [{ slug, title, position }], top_items: [{ title, url, author_or_channel, published_at, kind }] }`. The full per-concept hub, fetched on demand. `rotation` is the concept's status on its primary kind's board for the default horizon (null when it has no attention in that window), and powers the hub Momentum card.

`spectrums.json`: `{ generated, axes: [{ slug, title, pole_a, pole_b, positions: [{ id, label, position_normalized }] }] }`. The `axis_vector` per axis is held out of the served payload (see the table above).

`digests/briefing_<horizon>.json`: `{ horizon, generated, severity (0..3), headline, body, cited_concepts: [{ slug, label }], cited_items: [{ n, title, url, author_or_channel }], model, prompt_version }`. The `body` carries inline `[n]` markers that reference `cited_items[].n` (the new-item index), rendered as numbered superscript citation links. Headline and body are sanitized and em-dash-free (the style test scans them).

`creators.json`: `{ generated, source, creators: [{ channel_id, name, handle, channelUrl, blurb, videos: [{ videoId, title, published, url, thumbnail, kind, summary, concepts: [{ slug, label }] }] }], pinned: [{ videoId, title, url, thumbnail, note, ... }] }`. `source` is `build`, `worker`, or `fallback`. `summary` and `concepts` are the corpus join (the Citation Contract); a video not yet in the corpus carries an empty summary until the next ingest.

(Schemas are extended as phases land; keep this table and the writers in sync. Rule: a served artifact ships only the fields a page renders. Audit consumers with a raw recursive grep before adding a field, since the dedicated search tool ignores the built `dist/` bundle.)

## Trend and Rotation Math

The boards rank by **trend**: how much weighted attention a topic gained or lost this horizon window versus the equally long window just before it. It is clamp-free and discriminates well on sparse, recency-heavy data (`windowTrend` in `worker/pipeline/attention.mjs`, on the RAW per-day series so a board reflects this window's burst rather than smoothing it away).

```
attention_now(e)   = sum of weighted mentions of e in the last `days`
attention_prev(e)  = sum of weighted mentions of e in the `days` before that
delta(e)           = attention_now - attention_prev               # the board sort key
trend(e)           = delta / (attention_now + attention_prev)     # the same change in [-1, 1]
```

A **Mansfield Relative Performance** rotation (ratio, momentum, quadrant) is still computed per entity and shown on the concept hub Momentum card. It was the original board visualization, but on this corpus (a few hundred topics over a rolling quarter, most first appearing inside the window) the `[55, 145]` display clamp pinned almost every topic to a wall, so the boards moved to the trend measure above. See `LESSONS_LEARNED.md` (Session 6).

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

A pinned PCA start vector, deterministic k-means init (seed-spread, no RNG), stable sort, and content-hash gating make the network rebuild reproducible: unchanged data is a no-op, one new item recomputes only what changed. The committed `worker/.cache/vector_manifest.json` records every vector id the worker owns with its text hash and metadata hash. Daily runs embed only records whose text hash is new or changed, call Pinecone metadata update for metadata-only drift, and delete stale ids by diffing the old manifest against the retained corpus and durable glossary. Full Pinecone `/vectors/list` is reserved for manual reconciliation and bounded audits, because it spends read units. With the rolling-quarter corpus, expect costs near the civil reference (about 25 dollars per month) plus Whisper per caption-less video. See `docs/OPERATIONS.md`.
