# Ingestion Pipeline

The daily pipeline that turns raw source signal into the embedded, classified, rotated corpus the site reads. It runs on the Fly.io worker. Every stage is idempotent and safe to re-run, and the pipeline currently runs fully automatically (see Human-Authored Stops).

Read `CLAUDE.md` Core Contracts first. This document details the stages, the concept-resolution algorithm, and the retention prune.

## Stages

Run order (each checks "already done" and skips, the civil onboard pattern):

1. **fetch.** Each adapter under `worker/sources/` returns raw Items. YouTube is primary (see `docs/SOURCES.md`). Output goes to a staging area keyed by deterministic ID.
2. **dedupe.** Content hash `sha256(text).slice(0,16)`. Stable IDs `<kind>::<source>::<slug>::<hash16>`. Skip anything already in Pinecone with the same hash. The accumulating store keeps exactly one entry per source item: when a source is re-titled or edited its content hash (and id) changes, so the new version replaces the stale one rather than accumulating beside it (`collapseStore` in `worker/pipeline/store.mjs`); within-run dedup keys on `source:source_id` and does not catch cross-run re-edits. Prune orphaned vectors whose source item is gone.
3. **transcript.** For YouTube: captions via yt-dlp when present, else download audio and run Whisper. For text sources this stage is a passthrough.
4. **classify and extract.** Claude with a strict JSON schema returns `kind` (with a one-line justification), a factual `summary` (no em dashes, sanitized via `worker/lib/text.mjs`), candidate `concepts[]`, `entities[]`, and `stance` for opinions. `kind` is decided by the classifier, not the source. (An optional OpenAI dual-check that would send disagreements to staging is intended but not yet implemented; classification today is a single Claude pass.)
5. **concept resolution (the AI-grown taxonomy).** See the algorithm below. Binds candidates to existing concepts, or coins new ones (which currently enter the taxonomy directly).
6. **embed and upsert.** Voyage `voyage-3` (1024-dim, `input_type=document`) in batches; upsert to Pinecone with full metadata. Unchanged chunks are skipped.
7. **attention, trend, and rotation.** Recompute attention per entity per kind, then the heat signal each board ranks by: `delta` (growth in weighted attention this horizon window versus the prior equal window) and its [-1, 1] normalization `trend` (`windowTrend` in `worker/pipeline/attention.mjs`). The Mansfield rotation triple (RS, ratio, momentum) and quadrant are still computed per horizon, now feeding the concept hub Momentum card rather than a plane. Board construction is the shared pure `computeBoards` in `worker/pipeline/boards.mjs`, so the live run (`run.mjs`) and the offline `worker/pipeline/recompute_boards.mjs` (a no-network replay of the committed store) cannot drift apart. See `docs/RAG.md`.
8. **network rebuild.** One deterministic command rebuilds every derived artifact in dependency order (centroids, clusters then names, spectrums, neighbors, influence, glossary hubs, attention, digests). Pinned seeds, stable sort.
9. **prune (retention).** Delete vectors and artifact rows older than `RETENTION_DAYS` by `published_at`. See below.
10. **publish.** Write artifacts to `public/data/`, commit verbosely, push, and append a run entry to `docs/INGESTION_LOG.md`.

## Concept Resolution (AI-Discovered, AI-Created, Fitted Loosely)

Tags and concepts are an AI-grown taxonomy, not a fixed vocabulary. The resolver (`worker/pipeline/concepts.mjs`) recomputes the whole taxonomy deterministically each run from the current corpus:

1. **Collect candidates.** Gather every concept surface form the classifier produced across all retained items, frequency-counted, dropping junk (under 2 or over 60 characters, or no letter). `concepts` is coerced to a list first, so a stray comma-joined string does not slip through as characters.
2. **Embed the unique labels** with voyage-3 (`input_type=document`).
3. **Merge in priority order.** Process labels most-frequent-then-shortest first. For each, find the most similar already-canonical concept by cosine and decide with the registry `TAXONOMY` thresholds (injected into the resolver):
   - cosine at or above `mergeThreshold` (0.86): **bind**. The first (most frequent, then shortest) surface form is the canonical label; later ones become aliases.
   - cosine in `[reviewFloor, mergeThreshold)` (0.78 to 0.86): **bind only with a lexical signal**, a shared significant token or an acronym match (LLM and large language models). This resolves the ambiguous band automatically and keeps distinct short "AI X" labels (generative AI vs self-improving AI) from over-merging on their near-identical embeddings.
   - otherwise (below `reviewFloor`, or in the band with no lexical support): **create a new canonical concept**.
4. **Definitions.** The top concepts by attention get a one-sentence cited definition (Claude, cached by id, em-dash sanitized) for their hubs.

New concepts currently enter the canonical taxonomy directly. The intended `public/data/glossary/_proposed.json` human-approval gate (proposed concepts held out of the live set until approved in-repo) is **not yet implemented**; when added it becomes the pipeline's one human-authored stop. The resolution collapses near-duplicates onto one concept with aliases while still letting genuinely new ideas enter. Thresholds are tuned against real voyage-3 cosine once data accrues; record tuning in `docs/INGESTION_LOG.md`.

## Retention Prune

The corpus self-expires at one quarter. The prune stage is keyed on each item's real-world `published_at`, not its fetch date:

- Delete Pinecone vectors and artifact rows where `now - published_at > RETENTION_DAYS` (default 100, in the registry).
- A glossary concept with no items inside the window is marked `dormant` and drops off the live trend boards, but its definition hub persists as lightweight reference. A concept dormant for two full windows may be garbage-collected (decide and document before enabling).
- The prune is idempotent: re-running deletes nothing new if nothing has aged out.

## Human-Authored Stops

The pipeline is currently fully automatic end to end. The intended human-authored stop, approving newly coined concepts before they enter the taxonomy (the `_proposed.json` gate), is **not yet implemented**; until it is, concept curation happens after the fact by editing the committed artifacts. When added it will mirror civil's stops for chapter specs and summaries: never guess past a genuine editorial decision.

## Running It

- `npm run ingest` runs one full pass (Phase 1+).
- `npm run network` runs only the deterministic rebuild (Phase 2+), useful after editing concept anchors or approving concepts.
