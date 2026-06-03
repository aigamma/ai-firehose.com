# Sources

Every source is an adapter under `worker/sources/` behind a common interface that returns raw Items. The classifier (not the adapter) decides each item's `kind`. Each source has an authority weight that scales how strongly it moves the rotation.

## YouTube (primary, coded from scratch)

Eric's favorite high-signal teachers are the primary input and a leading indicator: when a trusted teacher covers a new topic, it should move the boards early.

- **Registry.** `sources/youtube_channels.json` (Eric curates). Each channel has a `channel_id`, `name`, `authority_weight`, and a `kind_bias` hint.
- **New-upload detection.** Poll the free per-channel RSS feed `https://www.youtube.com/feeds/videos.xml?channel_id=<ID>`. No API key. Cheap enough to poll often.
- **Metadata and captions.** `yt-dlp` (open source) for title, description, duration, and captions (the timedtext track) when present.
- **Transcription fallback.** When captions are absent, download audio with `yt-dlp` and transcribe with Whisper. This is the exact transcript pattern civil uses. The Whisper host (whisper.cpp on the worker vs the OpenAI Whisper API) is decided in Phase 1 by cost and quality.
- **Apify.** Documented only as a paid fallback if RSS or yt-dlp is blocked at scale. The default path is from scratch.

**Managing channels.** Curate with the registry CLI (no API key):

```
node worker/sources/youtube_registry.mjs add @handle --weight=0.9 --kind=mixed
node worker/sources/youtube_registry.mjs remove @handle
node worker/sources/youtube_registry.mjs list
```

It resolves a handle, URL, or UC id to the channel id from the authoritative RSS-alternate or canonical link on the page (not the first `channelId` in the blob, which is not always the owner's). The RSS feed endpoint is flaky from datacenter IPs (intermittent 404 and 5xx for valid channels), so the adapter retries with backoff; this is expected and clears on retry. v1 channels: Nick Saraev (anchor, 0.95), plus Liam Ottley, David Ondrej, Cole Medin, Nate Herk, Matthew Berman, Wes Roth.

## Other Sources

- **arXiv.** Public Atom API across cs.AI, cs.LG, cs.CL, cs.CV. Technique and research signal.
- **Hugging Face.** Trending models, datasets, and Papers via the authenticated HF MCP (account `ai-gamma`). Tool and technique signal.
- **GitHub Trending** and **Hacker News / Show HN.** Public endpoints (the HN Firebase API, GitHub search). Tool and launch signal.
- **Blogs and newsletters.** RSS, driven by a manifest like worldthought's Gutenberg manifest: OpenAI, Anthropic, Google DeepMind, Meta AI, Import AI, The Batch, Latent Space, Simon Willison. Opinion and announcement signal.
- **Reddit** (r/LocalLLaMA, r/MachineLearning) and **X** curated lists. Community pulse. X access is the hardest; v1 may start read-only or via lists.

## Authority Weighting

`source_authority_weight` (and per-channel `authority_weight` for YouTube) feeds `w_source` in the attention math (`docs/RAG.md`). Favorite teachers and primary labs are weighted high; noisy community sources lower. This is what makes a trusted teacher's coverage a leading indicator rather than just one more mention.

## Featured Creators and the Watch Surface

`sources/featured.json` is a separate, presentation-only registry that drives the Watch page and the Home watch teaser. It is deliberately distinct from `youtube_channels.json`: that one is an ingestion and rotation-weighting source of truth, so featuring a creator on the dashboard never perturbs the rotation math. `featured.json` has `creators[]` (`channel_id`, `name`, `handle`, `blurb`, `active`, optional `latest_count`) and a `pinned[]` playlist (`videoId`, `note`).

The resolver `scripts/build_creators.mjs` turns it into the served artifact `public/data/creators.json` (schema in `docs/RAG.md`). It uses no API key: it polls each creator's free RSS feed for the latest videos (reusing `fetchFeed` and `parseEntries` exported from `worker/sources/youtube.mjs`), then joins each video to its classified record in the corpus (`worker/.cache/items.json`) so every video carries the model-written `summary` and its `concepts` as links into the glossary hubs (the RAG join, the Citation Contract). The corpus is also the fallback: when RSS is blocked (Netlify build IPs are datacenter IPs, and the feed is flaky from those), a creator resolves from the corpus, which already holds the recent uploads, and a fully blocked build keeps the previously committed `creators.json` rather than emptying. The resolver runs as a `prebuild` npm step (so every Netlify deploy refreshes it) and again in the worker `run.mjs` (so the committed fallback stays fresh). Per-video semantic neighbors (related videos by vector similarity) are a documented future enhancement; the concept hubs already provide the related-concepts surface.

### The Curation Workflow (the agentic terminal)

Eric curates Watch by asking Claude Code, which edits the one file `sources/featured.json`, commits, and pushes; Netlify's `prebuild` then refreshes the artifact and the video appears.

- **Feature a creator.** Resolve the channel id (`node worker/sources/youtube_registry.mjs resolve @handle`), append a `creators[]` entry with a one-line `blurb` (no em dashes), optionally `npm run creators` to verify locally, then commit and push.
- **Pin a video.** Extract the `v=` id from the watch URL (validate `^[\w-]{11}$`), append `{ videoId, note }` to `pinned[]`, optionally `npm run creators`, then commit and push.

## Adding a Source

Implement the adapter interface, register it, set a default authority weight, and document it here in the same commit (the maintenance rule). The classifier and the rest of the pipeline are source-agnostic downstream of fetch.
