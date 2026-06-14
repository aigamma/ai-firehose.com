# Sources

Every source is an adapter under `worker/sources/` behind a common interface that returns raw Items. The classifier (not the adapter) decides each item's `kind`. Each source has an authority weight that scales how strongly it moves the rotation.

Every adapter HTTP `fetch` carries an `AbortSignal.timeout` (15s for sources and RSS feeds, 30s for the Voyage, Pinecone, Anthropic, and Whisper calls), so one hung host raises a retryable throw instead of stalling the scheduled run. The aggregator's `Promise.allSettled` rescues a rejected adapter but not a hung socket, which is exactly why the per-call timeout matters.

## YouTube (primary, coded from scratch)

Eric's favorite high-signal teachers are the primary input and a leading indicator: when a trusted teacher covers a new topic, it should move the boards early.

- **Registry.** `sources/youtube_channels.json` (Eric curates). Each channel has a `channel_id`, `name`, `authority_weight`, and a `kind_bias` hint.
- **New-upload detection.** Poll the free per-channel RSS feed `https://www.youtube.com/feeds/videos.xml?channel_id=<ID>`. No API key. Cheap enough to poll often.
- **Metadata and captions.** `yt-dlp` (open source) for title, description, duration, and captions (the timedtext track) when present.
- **Transcription fallback.** When captions are absent, download audio with `yt-dlp` and transcribe with Whisper. This is the exact transcript pattern civil uses. The Whisper host (whisper.cpp on the worker vs the OpenAI Whisper API) is decided in Phase 1 by cost and quality.
- **Apify.** Documented only as a paid fallback if RSS or yt-dlp is blocked at scale. The default path is from scratch.

**Shorts are excluded.** YouTube Shorts read as a trick here (they take longer to open than to watch), so they never enter the corpus, the boards, search, the Watch surface, or the vector store. The RSS feed carries no duration and no shorts marker, so a Short cannot be told from a regular upload at parse time, and many Shorts carry no `#shorts` in the title. Detection is the canonical `/shorts/<id>` redirect oracle (`worker/sources/youtube_shorts.mjs`): a Short serves HTTP 200, a regular video 30x-redirects to `/watch` (empirically clean, and unlike yt-dlp it is a normal lightweight request that works from the worker's datacenter IP). Verdicts are cached in the COMMITTED `worker/.cache/shorts.json` (a Short is always a Short, the worker clones fresh each run, and the probe is the expensive part, so the verdict must persist), only confident verdicts are cached, and every consumer FAILS OPEN: an undetermined video is treated as a regular video, never wrongly dropped. The adapter drops Shorts at fetch (bounded by `SHORTS_PROBE_MAX`, default 150; disabled by `FILTER_SHORTS=0`), and `run.mjs` guards the store as a backstop, so every downstream artifact is short-free from one chokepoint. `scripts/remove_shorts.mjs` is the one-time purge of Shorts that landed before the filter existed: probe the corpus, drop them from `items.json`, delete their vectors from Pinecone and the manifest, scrub the digests and RSS, and rebuild the Watch surfaces (`--dry` previews, write nothing).

**Managing channels.** Drop a list of handles through the batch onboarding tool (no API key):

```
node scripts/onboard_youtube.mjs --dry @a @b @c            # resolve and preview, write nothing
node scripts/onboard_youtube.mjs @a @b @c [--weight=0.9] [--kind=mixed]
node scripts/onboard_youtube.mjs --track-only @a @b @c     # ingest and track, but keep out of the directory
```

It wraps the registry CLI, which remains available for single edits:

```
node worker/sources/youtube_registry.mjs add @handle --weight=0.9 --kind=mixed
node worker/sources/youtube_registry.mjs remove @handle
node worker/sources/youtube_registry.mjs list
```

Both resolve a handle, URL, or UC id to the channel id from the authoritative RSS-alternate or canonical link on the page (not the first `channelId` in the blob, which is not always the owner's). The RSS feed endpoint is flaky from datacenter IPs (intermittent 404 and 5xx for valid channels), so the adapter retries with backoff; this is expected and clears on retry. The directory is an endorsement surface: every endorsed channel appears there, but onboard with `--track-only` (which sets `hide_from_directory: true`) to ingest a channel for signal without publicly listing it, and `--endorse` to promote it later. Tracking is not endorsing; both still feed the RAG and the rotation. v1 channels: Nick Saraev (anchor, 0.95), plus Liam Ottley, David Ondrej, Cole Medin, Nate Herk, Matthew Berman, Wes Roth.

**Onboarding educators (full runbook):** `docs/ONBOARD_YOUTUBE_CHANNEL.md`. The one-command flow a fresh agent follows whenever Eric drops a list of handles: `node scripts/onboard_youtube.mjs @list` resolves and adds them and rebuilds the directory, then choose `authority_weight` and `kind_bias`, verify against oracles (the `list` and a dry adapter fetch), then commit and push so the worker sees them on its next run.

## Other Sources

- **arXiv.** Public Atom API across cs.AI, cs.LG, cs.CL, cs.CV. Technique and research signal.
- **Hugging Face.** Trending models, datasets, and Papers via the authenticated HF MCP (account `ai-gamma`). Tool and technique signal.
- **GitHub Trending** and **Hacker News / Show HN.** Public endpoints (the HN Firebase API, GitHub search). Tool and launch signal.
- **Blogs and newsletters.** RSS and Atom, driven by a manifest (`sources/blogs.json`) with a per-feed authority weight. The manifest is curated for breadth across four kinds of signal: frontier-lab blogs (OpenAI, Google DeepMind, Google Research, Google AI, Microsoft Research, NVIDIA Developer, Apple ML Research, weighted 0.8); heavy curated newsletters and analysts (Simon Willison, Import AI, Latent Space, Interconnects, Ahead of AI, Last Week in AI, TLDR AI, ChinAI, Hugging Face, BAIR, weighted 0.65 to 0.75); tech press AI sections (TechCrunch AI, MIT Technology Review AI, plus a Google News query for "artificial intelligence", weighted 0.55); and policy and research-data orgs (NIST news, Epoch AI, weighted 0.6). Some labs publish a clean lab changelog or news feed; where one is not exposed (for example Anthropic, Meta AI, and Mistral do not offer a public RSS endpoint), they are omitted rather than scraped. Opinion and announcement signal. Dead or moved feeds are skipped automatically, so the run never sinks on one bad URL.
- **Reddit** (r/LocalLLaMA, r/MachineLearning, r/artificial, r/singularity, r/OpenAI, r/StableDiffusion) and **X** curated lists. Community pulse. X access is the hardest; v1 may start read-only or via lists.

## Authority Weighting

`source_authority_weight` (and per-channel `authority_weight` for YouTube) feeds `w_source` in the attention math (`docs/RAG.md`). Favorite teachers and primary labs are weighted high; noisy community sources lower. This is what makes a trusted teacher's coverage a leading indicator rather than just one more mention.

## The Watch Surface: Directory and Spotlight

The Watch page (`/watch`) consolidates two surfaces over the same favorite educators: a **browse directory** on top, then the **Latest** spotlight funnel below. Neither surfaces YouTube Shorts: they are excluded from the corpus at ingest (see "Shorts are excluded" above), and the per-video Watch selection (`selectVideos` in `worker/pipeline/videos.mjs`) guards against them explicitly, so the directory's latest-video, the spotlight, and the per-video grid show only full videos.

**The directory** is the browseable view of the ingestion roster `sources/youtube_channels.json`: every active channel, rendered as a card whose name links to the channel, the concepts it covers (links into the glossary hubs), its kind lean, and how active it is. `scripts/build_directory.mjs` (pure core in `scripts/lib/directory.mjs`) turns the registry plus the corpus into the served artifact `public/data/directory.json`, corpus-only and deterministic (no live RSS), so it is a hard prebuild and generated-fresh gate. Concept chips are filtered to slugs that resolve to a real glossary hub, so every chip is a live link (the integrity test guards this). A freshly onboarded channel shows immediately with registry-only fields, marked newly added, and fills in its corpus enrichment after the worker ingests it. Set `hide_from_directory: true` on a registry entry to ingest a channel without listing it.

A `recommended: true` entry is the inner circle: a carefully vetted vote of confidence that earns a gold star badge and sorts to the front of the roster (and carries the badge into the spotlight if the channel is also featured). It is purely editorial, never touching the rotation math, and implies endorsement (it clears `hide_from_directory`). Set it with `node worker/sources/youtube_registry.mjs recommend @handle` or onboard with `--recommend`; see `docs/ONBOARD_YOUTUBE_CHANNEL.md`.

**The spotlight** `sources/featured.json` is a separate, presentation-only registry that drives the Watch Latest funnel and the Home watch teaser. It is deliberately distinct from `youtube_channels.json`: that one is an ingestion and rotation-weighting source of truth, so featuring a creator on the dashboard never perturbs the rotation math. `featured.json` has `creators[]` (`channel_id`, `name`, `handle`, `blurb`, `active`, optional `latest_count`) and a `pinned[]` playlist (`videoId`, `note`).

The resolver `scripts/build_creators.mjs` turns it into the served artifact `public/data/creators.json` (schema in `docs/RAG.md`). It is corpus-only and deterministic by default, exactly like its sibling `build_directory.mjs`: it reads each creator's recent videos from the committed corpus (`worker/.cache/items.json`), which already holds their classified uploads because every featured creator is also an ingestion source in `youtube_channels.json`, and carries each video's model-written `summary` and its `concepts` as links into the glossary hubs (the RAG join, the Citation Contract). No API key, no network, no wall clock: the same corpus plus the same `featured.json` always yield byte-identical output, so the resolver is a hard `prebuild` step and generated-fresh gate (the `generated` stamp and the retention window are both anchored to the newest corpus item, mirroring `directory.mjs:corpusDate`). It runs in the worker `run.mjs` too, writing the identical artifact. Live RSS is an explicit opt-in (`buildCreators({ live: true })`, or `--live` on the CLI) that polls each creator's free feed (reusing `fetchFeed` and `parseEntries` from `worker/sources/youtube.mjs`) to surface a brand-new upload before the worker classifies it, at the cost of determinism and enrichment; it is off by default and used by nothing in the build, gate, or worker, because the corpus is the better source in every deployed context (Netlify build IPs are datacenter IPs the feed blocks anyway). Per-video semantic neighbors (related videos by vector similarity) are a documented future enhancement; the concept hubs already provide the related-concepts surface.

**Retention (nothing lingers).** In parity with the corpus auto-prune, the resolver drops any featured video whose `published_at` is older than `RETENTION_DAYS` (the rolling quarter, in `src/data/registry.js`), so nothing flows in the Watch stream longer than three months after it loaded. The cutoff is anchored to the newest corpus item (not the wall clock), so the filter stays deterministic and the gate cannot drift by date; the committed corpus is itself already pruned to this window. A creator with no uploads inside the window falls out of the Latest funnel until they post again. The directory's activity and "covers" are derived from the already-pruned corpus, so they respect the window automatically.

Hand-pinned videos self-expire too, on a tighter, explicit clock: a pin is removed from the record `PIN_RETENTION_DAYS` (90) days after it went on the site, keyed on `pinned_at` (when it was pinned), not the video's publish date. The pure rule is `scripts/lib/pins.mjs`; `scripts/prune_pins.mjs` stamps any pin missing `pinned_at` and rewrites `featured.json` to drop expired ones (run by the worker each pass and committed by `worker/publish.sh`, or on demand via `npm run prune:pins`); `build_creators.mjs` also filters expired pins at render time, so one never shows between prunes. The durable glossary layer is the only thing exempt from retention.

### The Curation Workflow (the agentic terminal)

Eric curates Watch by asking Claude Code, which edits the one file `sources/featured.json`, commits, and pushes; Netlify's `prebuild` then refreshes the artifact and the video appears.

- **Feature a creator.** Resolve the channel id (`node worker/sources/youtube_registry.mjs resolve @handle`), append a `creators[]` entry with a one-line `blurb` (no em dashes), optionally `npm run creators` to verify locally, then commit and push.
- **Pin a video.** Extract the `v=` id from the watch URL (validate `^[\w-]{11}$`), append `{ videoId, note, pinned_at }` to `pinned[]` with `pinned_at` set to today (YYYY-MM-DD), optionally `npm run creators`, then commit and push. The pin self-expires 90 days after `pinned_at`; if you omit it, the worker stamps it on the next run.

### Per-Video Study Notes (Transcript Insights)

Each video page (`/watch/:videoId`) carries transcript-grounded study notes, so a reader gets the substance on-site instead of bouncing to YouTube: a short write-up, a key-points list, and timestamped chapters that SEEK the embedded player (`startAt`/`playToken` on `LiteYouTube`). They are authored from the video's CAPTIONS, not its metadata. This matters because the pipeline runs `ENABLE_TRANSCRIPTS=0`, so the classifier `summary` and the fallback write-up only ever saw the title plus the RSS description; the insights read what is actually said in the talk.

The contract is in `worker/pipeline/prompts/video_insights.mjs` (a grounded write-up, 3 to 6 key points, and 4 to 8 chapters anchored to real `[mm:ss]` markers in the transcript). `worker/pipeline/videos.mjs` PRESERVES `key_points`, `chapters`, `insights`, and the upgraded `writeup` across a rebuild (a keyed run otherwise rebuilds each page from a fixed field set and would drop them); a metadata-only write-up remains the fallback where captions are absent.

The library was backfilled once, on the Max subscription, never the API (see `docs/OPERATIONS.md` Spend Discipline): `scripts/batch_fetch_transcripts.mjs` fetches captions GENTLY in one paced `yt-dlp` process (parallel fetches trip YouTube's HTTP 429 bot-block, see `LESSONS_LEARNED.md` Session 29), one Sonnet subagent per video reads its cached transcript and writes insights to a staging cache (`worker/.cache/insights/<id>.json`), and `scripts/merge_video_insights.mjs` validates, sanitizes (em dashes), and merges them into the served per-video JSONs, preserving every other field. Genuinely caption-less videos keep the metadata write-up.

## Adding a Source

Implement the adapter interface, register it, set a default authority weight, and document it here in the same commit (the maintenance rule). The classifier and the rest of the pipeline are source-agnostic downstream of fetch.
