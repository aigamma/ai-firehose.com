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

The target cadence is **every 6 hours** (four refreshes a day): the AI firehose moves fast enough that a single daily rebuild reads as stale, and the Day horizon benefits most from intraday refreshes. Each run commits both `worker/.cache/items.json` and `worker/.cache/vector_manifest.json` with the rebuilt artifacts, and that push triggers CI plus a Netlify deploy, so four runs a day is four deploys a day. Cost stays modest because the pipeline is idempotent (content-hash gated): a run only classifies and embeds items new since the last one, so an intraday run is mostly fetch-and-skip.

Fly's scheduled-Machine `--schedule` only accepts the presets `hourly | daily | weekly | monthly`, so it cannot express a 6-hour cadence. The cron trigger therefore lives in GitHub Actions (`.github/workflows/ingest.yml`, `cron: 0 */6 * * *`): each tick launches a one-off worker Machine from the deployed image and removes it when the batch exits (`--rm`). That workflow is dormant until the image is deployed and `FLY_API_TOKEN` is set; its guard step no-ops cleanly until then. Build and push the image once, then arm the trigger:

```
fly deploy . -c worker/fly.toml --build-only --push
gh secret set FLY_API_TOKEN   # paste a `fly tokens create deploy` token
```

Then the GitHub Actions cron drives the 6-hourly runs; fire one immediately from the Actions tab (`workflow_dispatch`) to verify end to end. If you would rather keep scheduling on Fly itself at the coarser once-a-day cadence, leave the workflow dormant and create a daily scheduled Machine instead:

```
fly machine run registry.fly.io/ai-firehose-worker:<deployment-tag> -c worker/fly.toml \
  --schedule daily --vm-memory 1024 --env ENABLE_TRANSCRIPTS=0 --name firehose-daily
```

Two gotchas, both learned the hard way (see `LESSONS_LEARNED.md`):

- **Memory.** `fly machine run` does NOT apply the `[[vm]]` memory in `fly.toml`; it defaults to 256 MB, which OOM-stalls the pipeline (a run clones, starts fetching, then goes silent for many minutes). Always pass `--vm-memory 1024`.
- **Secret rotation.** A Machine captures secrets at create time, and a scheduled restart reuses that stored config. After `fly secrets set` (for example rotating `GH_TOKEN`), destroy and recreate `firehose-daily` so it picks up the new value; setting the secret alone is not enough, and the worker keeps using the old one until it expires.

## Known Datacenter-IP Limitations

Fly's egress is a datacenter IP, which some sources block regardless of a correct User-Agent:

- **YouTube transcripts.** `yt-dlp` is rate-limited or blocked from datacenter IPs and can stall on long retry, so production runs with `ENABLE_TRANSCRIPTS=0`. Videos still ingest fully via RSS (title and description); deep transcript enrichment needs a residential proxy or cookies (a deferred enhancement). When re-enabled, the enrichment is bounded by `TRANSCRIPT_MAX` and `TRANSCRIPT_BUDGET_MS` so it can never stall the run or drop already-fetched videos.
- **Reddit.** The public JSON endpoint returns 403 from datacenter IPs even with a descriptive User-Agent. The adapter is fail-soft (logs and yields nothing), so Reddit currently contributes zero items from the cloud. The real fix is Reddit's OAuth app-only token flow (a `REDDIT_CLIENT_ID` and `REDDIT_CLIENT_SECRET` script app, which works from servers); a tracked follow-up.
- **General defense.** Every adapter runs under a per-adapter wall-clock budget in `worker/sources/index.mjs` (`withTimeout`), so a blocked or hung source becomes a clean, logged rejection and the rest of the run proceeds.

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
