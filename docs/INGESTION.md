# Ingestion Pipeline

The daily pipeline that turns raw source signal into the embedded, classified, rotated corpus the site reads. It runs on the Fly.io worker. Every stage is idempotent and safe to re-run; a few stages stop for human-authored input.

Read `CLAUDE.md` Core Contracts first. This document details the stages, the concept-resolution algorithm, and the retention prune.

## Stages

Run order (each checks "already done" and skips, the civil onboard pattern):

1. **fetch.** Each adapter under `worker/sources/` returns raw Items. YouTube is primary (see `docs/SOURCES.md`). Output goes to a staging area keyed by deterministic ID.
2. **dedupe.** Content hash `sha256(text).slice(0,16)`. Stable IDs `<kind>::<source>::<slug>::<hash16>`. Skip anything already in Pinecone with the same hash. Prune orphaned vectors whose source item is gone.
3. **transcript.** For YouTube: captions via yt-dlp when present, else download audio and run Whisper. For text sources this stage is a passthrough.
4. **classify and extract.** Claude with a strict JSON schema returns `kind` (with a one-line justification), a factual `summary` (no em dashes), candidate `concepts[]`, `entities[]`, and `stance` for opinions. `kind` is decided by the classifier, not the source. Optional OpenAI dual-check; disagreement sends the item to staging rather than publishing.
5. **concept resolution (the AI-grown taxonomy).** See the algorithm below. Binds candidates to existing concepts, or stages new ones for approval.
6. **embed and upsert.** Voyage `voyage-3` (1024-dim, `input_type=document`) in batches; upsert to Pinecone with full metadata. Unchanged chunks are skipped.
7. **attention and rotation.** Recompute attention per entity per kind, then the relative-rotation triple (RS, ratio, momentum) and quadrant per horizon. See `docs/RAG.md`.
8. **network rebuild.** One deterministic command rebuilds every derived artifact in dependency order (centroids, constellation, clusters then names, spectrums, neighbors, influence, glossary hubs, attention, digests). Pinned seeds, stable sort.
9. **prune (retention).** Delete vectors and artifact rows older than `RETENTION_DAYS` by `published_at`. See below.
10. **publish.** Write artifacts to `public/data/`, commit verbosely, push, and append a run entry to `docs/INGESTION_LOG.md`.

## Concept Resolution (AI-Discovered, AI-Created, Fitted Loosely)

Tags and concepts are an AI-grown taxonomy, not a fixed vocabulary. For each candidate concept the classifier surfaces:

1. **Embed the candidate** (its name plus a short gloss) with voyage-3.
2. **Find nearest existing concepts** by cosine against the concept centroids (`public/data/glossary/<slug>.json` carry a centroid; the live concept-embedding set is maintained by the network stage).
3. **Decide by threshold** (`TAXONOMY` in `src/data/registry.js`):
   - cosine at or above `mergeThreshold` (0.86): **bind** to that concept. If the surface form is new, add it as an alias.
   - cosine in `[reviewFloor, mergeThreshold)` (0.78 to 0.86): **ambiguous**, queue for in-repo review.
   - cosine below `reviewFloor` (0.78): **create new**. The model coins a canonical Title Case name and a cited one-paragraph definition, written to `public/data/glossary/_proposed.json`.
4. **Approval.** Proposed concepts do not enter the canonical taxonomy until approved in-repo (a file edit or PR). Approval moves the entry from `_proposed.json` into `public/data/glossary/<slug>.json` and the registry-visible set.

This collapses near-duplicates ("test-time compute" and "test time compute scaling") onto one concept with aliases, while still letting genuinely new ideas enter. Thresholds are tuned against real voyage-3 cosine once data accrues; record tuning in `docs/INGESTION_LOG.md`.

## Retention Prune

The corpus self-expires at one quarter. The prune stage is keyed on each item's real-world `published_at`, not its fetch date:

- Delete Pinecone vectors and artifact rows where `now - published_at > RETENTION_DAYS` (default 100, in the registry).
- A glossary concept with no items inside the window is marked `dormant` and drops off the live rotation boards, but its definition hub persists as lightweight reference. A concept dormant for two full windows may be garbage-collected (decide and document before enabling).
- The prune is idempotent: re-running deletes nothing new if nothing has aged out.

## Human-Authored Stops

The pipeline pauses for human input only at concept approval (stage 5 output). Everything else is deterministic or model-driven. This mirrors civil's stops for chapter specs and summaries: never guess past a genuine editorial decision.

## Running It

- `npm run ingest` runs one full pass (Phase 1+).
- `npm run network` runs only the deterministic rebuild (Phase 2+), useful after editing concept anchors or approving concepts.
