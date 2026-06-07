# Onboarding a New YouTube Author

The exact, repeatable procedure for adding a YouTube author (channel) to the
ingestion registry. When Eric submits a channel, a fresh-session agent should be
able to execute this end to end without reading the adapter code.

The registry is the single source of truth. Everything here is keyless (no API
key, no Pinecone, Voyage, or Anthropic spend). The Fly worker reads the registry
from `origin/main` on its next daily run, so the work is not done until it is
committed and pushed.

Read `docs/SOURCES.md` (YouTube section) for the conceptual picture first; this
doc is the step-by-step runbook.

## TL;DR

```
node worker/sources/youtube_registry.mjs add @handle --weight=0.9 --kind=mixed
node worker/sources/youtube_registry.mjs list          # confirm it is active
node worker/sources/youtube.mjs 3650                    # dry fetch: prove the feed returns videos
npm test                                                # must stay all-pass
git add sources/youtube_channels.json
git commit -m "sources: add YouTube author <Name> (<@handle>) to the ingestion registry"
git push origin main
```

The rest of this document explains each step, how to pick the two tuning fields,
and the gotchas.

## What You Are Editing

- `sources/youtube_channels.json` is the curated registry (top-level `sources/`,
  not `worker/sources/`). Each entry has `channel_id`, `name`, `handle`,
  `authority_weight`, `kind_bias`, and `active`.
- `worker/sources/youtube.mjs` (the adapter) polls each `active` channel's free
  RSS feed `https://www.youtube.com/feeds/videos.xml?channel_id=<id>` for new
  uploads.
- `worker/sources/youtube_registry.mjs` (the CLI) is the safe way to edit the
  registry: it resolves the channel id, writes idempotently, and sorts and
  cleans the file on save. Prefer the CLI over hand-editing.

## Step 1: Resolve and Add

The `add` subcommand accepts an `@handle`, a full channel URL, or a `UC...` id.

```
node worker/sources/youtube_registry.mjs add @handle --weight=0.9 --kind=mixed
```

- It fetches the public channel page and extracts the `channel_id` from the
  authoritative RSS-alternate or canonical link, not the first `channelId` in the
  page blob (which is not always the channel's own).
- It is idempotent: re-adding an existing channel updates it in place rather than
  duplicating it.
- To preview the resolution without writing the file: `resolve @handle` (prints
  the resolved id, name, and handle as JSON).
- Multiple at once: `add @a @b @c --weight=0.85` adds each with the same flags.

If resolution fails ("no channelId on page" or a fetch error), the channel page
may be region-gated or temporarily blocking the request. Retry once; if it keeps
failing, resolve the id manually with `yt-dlp --print channel_id <channel_url>`
and add by id: `add UCxxxxxxxxxxxxxxxxxxxxxx --weight=0.9 --kind=mixed`.

## Step 2: Choose authority_weight and kind_bias

- **authority_weight** in [0, 1] scales how strongly this channel moves the trend
  rotation (it feeds `w_source` in the attention math; see `docs/RAG.md`). Guide:
  - 0.95: the anchor tier, highest-signal teachers (Nick Saraev is the current
    0.95 anchor). Use sparingly.
  - 0.85: strong, trusted teachers (the default for a solid add).
  - 0.80: opinion, news, or reaction-heavy channels that should contribute
    without dominating.
- **kind_bias** is a hint only; the classifier decides each video's actual kind.
  One of `technique | tool | opinion | mixed`. Use `mixed` unless the channel is
  clearly one lane (a news or reaction channel is `opinion`; a build-along
  tutorial channel leans `technique`).

When unsure, `--weight=0.85 --kind=mixed` is the safe default.

## Step 3: Verify Against Oracles (Before You Commit)

1. **Registered and active.** `node worker/sources/youtube_registry.mjs list`. A
   leading `*` marks an active channel; confirm the new one is present with the
   weight and kind you intended.
2. **The feed actually returns videos.** `node worker/sources/youtube.mjs 3650`
   runs the adapter and prints fetched videos, including the new channel. This is
   the real oracle that the channel id is correct and the RSS feed resolves. The
   RSS endpoint is flaky from datacenter IPs (intermittent 404 and 5xx for valid
   channels), so run this on a local or residential connection; a transient error
   clears on retry and is not a failure of the entry.
3. **Suite stays green.** `npm test` (currently all-pass). A registry edit is data
   only and should not change the count, run it as a guard.
4. **Writing-rule gate, only if you edited any `.md`.** `node scripts/check_no_emdash.mjs`
   (no em dashes U+2014 in authored text).

## Step 4: Commit and Push (Required: the Worker Reads main)

The Fly worker clones the repo fresh on every run, so a local-only edit is
invisible to it. The channel takes effect only once it is on `origin/main`.

```
git add sources/youtube_channels.json
git commit -m "sources: add YouTube author <Name> (<@handle>) to the ingestion registry"
git push origin main
```

Confirm the push landed: `git rev-parse HEAD` equals `git rev-parse origin/main`.

## Step 5: When It Goes Live

- On the **next daily worker run** (Fly app `ai-firehose-worker`, machine
  `firehose-daily`), the new channel is polled, its recent uploads are classified,
  embedded, and folded into the boards and glossary like any other source. No
  further action is needed.
- To see it **sooner** than the daily schedule, trigger a one-off worker run (a
  manual `fly machine run` of the worker image; see `docs/OPERATIONS.md`).

## Removing or Pausing a Channel

- **Remove:** `node worker/sources/youtube_registry.mjs remove @handle` (also
  accepts the `UC...` id), then commit and push.
- **Pause without deleting:** set `"active": false` on the entry (hand-edit is
  fine for this one field), then commit and push. A paused channel keeps its
  config but is not polled.

## Gotchas

- **Transcripts are off in production.** The daily worker runs with
  `ENABLE_TRANSCRIPTS=0` because YouTube blocks `yt-dlp` from Fly's datacenter
  IPs. New channels still ingest fully via RSS (title and description); deep
  per-video transcript enrichment is a separate, deferred feature that needs a
  residential proxy or cookies. See `docs/OPERATIONS.md` and `docs/ROADMAP.md`.
- **Ingesting is not featuring.** Adding a channel here weights it in the trend
  rotation. To showcase a creator on the Watch page, edit `sources/featured.json`
  instead (see "Featured Creators and the Watch Surface" in `docs/SOURCES.md`).
  The two registries are deliberately separate so featuring never perturbs the
  rotation math.
- **A backlog already exists.** `sources/youtube_channels.json` carries a
  `_suggested_to_verify_and_add` list of high-signal channels worth adding. Pull
  from it when curating, then trim each name as it is added.
