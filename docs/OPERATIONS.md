# Operations

Keys, schedule, costs, monitoring, and recovery. Read `docs/DEPLOYMENT.md` for the deploy chain.

## Keys and Where They Come From

Keys are pulled from sibling repo `.env` files at setup time, never committed, then set as Fly.io secrets (for the worker) and Netlify environment variables (for the site function).

- Pinecone and Voyage: from the civil and worldthought RAG envs (for example `C:\civil\rag\.env.local`).
- Anthropic: from the sibling sites' envs.
- OpenAI (optional dual-check and possibly Whisper): from civil's functions env.

Names are listed in `.env.example`. For local runs, `worker/.env.local` (gitignored) is built from the sibling files and used via `node --env-file=worker/.env.local`. To set worker secrets: `fly secrets set PINECONE_API_KEY=... VOYAGE_API_KEY=... ANTHROPIC_API_KEY=...` in `worker/`. To set the site function key: add `VOYAGE_API_KEY` and `PINECONE_*` in the Netlify UI.

The `ai-firehose` Pinecone index was created with the civil project's key, so it currently lives in that Pinecone project alongside `civil-rights` (isolated by index name; `pinecone.mjs` resolves the host from the index name and never writes to a sibling index). Optionally migrate it to a dedicated `ai-firehose` Pinecone project later.

## State: the Accumulating Corpus and Vector Manifest

The rolling-quarter corpus lives in `worker/.cache/items.json`, the retention-pruned raw items that are the substrate for every rebuild and the recovery source above. This is **durable state, not a cache**, so it is committed to the repo: each scheduled run clones fresh, loads the corpus, adds the new feed items, prunes by `published_at`, and commits the updated `items.json` back alongside the artifacts. Without this, a clone-fresh run would start empty and the corpus would collapse to the latest feed snapshot.

The vector sync state lives in `worker/.cache/vector_manifest.json`, also committed. It records each Pinecone id the worker owns, plus a text hash and metadata hash. That manifest is what lets the worker embed only new or changed text, update metadata without Voyage, and delete known stale ids without a routine full Pinecone list. The other `.cache` files (classify, definitions, axis_vectors) are regenerable and stay gitignored: they cost a little Claude/Voyage spend to rebuild but are never the source of truth.

## Schedule

The Fly worker runs the full pipeline daily by default (tunable). Because YouTube is the leading indicator, its RSS poll can run more often than the full rebuild. The Day horizon benefits from at least one refresh per day; Week, Month, and Quarter tolerate daily. Scheduled runs should commit both `worker/.cache/items.json` and `worker/.cache/vector_manifest.json` with the rebuilt artifacts.

## Costs

The rolling-quarter corpus keeps storage and retrieval costs flat regardless of runtime. The vector manifest keeps daily embedding costs tied to new or changed hashes, not the full retained corpus or all 600 durable glossary entries. Expect a figure near the civil reference (about 25 dollars per month: Pinecone plus a few dollars of Voyage) plus Claude classification (bulk on Sonnet or Haiku) and Whisper per caption-less video. Record actual run costs and counts in `docs/INGESTION_LOG.md` so the budget stays honest, including embedded, metadata-updated, unchanged, and deleted vector counts.

## Monitoring

Each run appends to `docs/INGESTION_LOG.md` (counts: fetched, new, classified, embedded, metadata-updated, unchanged, pruned; anomalies; wall-clock; approximate cost). A run that fetches but embeds nothing can be healthy if hashes are unchanged; a run that embeds the whole glossary or prunes far more than expected is a signal to investigate.

## Recovery Recipes

- **Stale or wrong artifacts.** Re-run the worker (`npm run ingest`); its network stage deterministically rebuilds every derived artifact from the committed store and current vector state. For only the attention boards, `node worker/pipeline/recompute_boards.mjs` replays the committed store offline. For generated read-surface JSON, run `npm run check:generated` to rebuild and fail on any uncommitted diff.
- **Bad classification on an item.** Correct or remove the item, re-run; content-hash idempotency re-embeds only what changed.
- **Pinecone index lost or recreated.** Re-ingest from the staged raw items within the retention window and clear or rebuild `worker/.cache/vector_manifest.json` so the worker knows it must upsert those vectors again; older items are intentionally gone.
- **Pinecone manifest drift.** If stats or search imply missing vectors, run a manual reconciliation when Pinecone read units are available: list or fetch bounded id sets, compare to `worker/.cache/vector_manifest.json`, backfill missing retained corpus vectors once, then commit the corrected manifest. Do not put full listing back into the scheduled path.
- **Threshold drift (taxonomy fragmenting or over-merging).** Adjust `TAXONOMY` in the registry, re-run `network`, and note the change in `docs/INGESTION_LOG.md`.
