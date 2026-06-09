# Onboarding YouTube Educators

The exact, repeatable procedure for adding YouTube educators to the site. Eric runs an
ongoing discovery workflow (watching on a Google TV) and drops in fresh lists of handles;
a fresh-session agent should be able to take a list and execute this end to end without
reading the adapter code.

Adding a channel to the ingestion registry does three things at once:

1. **Feeds the three-month RAG.** On the next worker run the channel's recent uploads are
   fetched, classified, embedded, and folded into the boards and glossary like any source.
2. **Weights the trend rotation.** `authority_weight` scales how strongly the channel moves
   the boards, so a trusted teacher's coverage is a leading indicator.
3. **Appears in the Watch directory.** Every active channel shows in the browse-and-subscribe
   roster on `/watch`, enriched from the corpus with what it covers.

Everything here is keyless (no API key, no Pinecone, Voyage, or Anthropic spend). The Fly
worker reads the registry from `origin/main` on its next run, so the work is not done until
it is committed and pushed.

## TL;DR: drop a list, run one command

```
node scripts/onboard_youtube.mjs --dry @a @b @c            # resolve and preview, write nothing
node scripts/onboard_youtube.mjs @a @b @c                  # add them at the safe default 0.85 mixed
node scripts/onboard_youtube.mjs @anchor --weight=0.95     # an anchor-tier favorite
node scripts/onboard_youtube.mjs --track-only @a @b @c     # ingest and track, do not endorse (hidden from the directory)
```

`onboard_youtube.mjs` resolves each handle to a channel id, adds it to
`sources/youtube_channels.json` idempotently, rebuilds the served directory, and prints a
summary table plus the exact verify and commit steps. It accepts an `@handle`, a channel
URL, or a `UC...` id, and a mix of them. It never commits or pushes.

Then verify and ship:

```
node worker/sources/youtube_registry.mjs list             # confirm the entries are active
node worker/sources/youtube.mjs 3650                       # dry fetch: prove the feeds return videos
npm run check:generated && npm test && npm run build       # gates stay green
git add sources/youtube_channels.json public/data/directory.json
git commit -m "sources: onboard <names> to the ingestion registry and directory"
git push origin main
git rev-parse HEAD                                         # confirm it equals origin/main
```

The rest of this document explains each field and the gotchas.

## What You Are Editing

- `sources/youtube_channels.json` is the curated ingestion registry (top-level `sources/`,
  not `worker/sources/`). Each entry has `channel_id`, `name`, `handle`, `authority_weight`,
  `kind_bias`, `active`, and an optional `hide_from_directory`.
- `worker/sources/youtube.mjs` (the adapter) polls each `active` channel's free RSS feed
  `https://www.youtube.com/feeds/videos.xml?channel_id=<id>` for new uploads.
- `worker/sources/youtube_registry.mjs` (the CLI) and `scripts/onboard_youtube.mjs` (the
  batch wrapper over it) are the safe way to edit the registry: they resolve the channel id,
  write idempotently, and sort and clean the file on save. Prefer them over hand-editing.
- `scripts/build_directory.mjs` turns the registry into the served roster
  `public/data/directory.json` (corpus-only and deterministic). The onboarding tool rebuilds
  it for you; it also runs as a prebuild step and in the worker.

## Choosing authority_weight and kind_bias

The onboarding tool applies one `--weight` and `--kind` to the whole list. Drop favorites and
news channels in separate runs if you want different weights, or tune individual entries in
the file afterward.

- **authority_weight** in [0, 1] scales how strongly this channel moves the trend rotation (it
  feeds `w_source` in the attention math; see `docs/RAG.md`). Guide:
  - 0.95: the anchor tier, highest-signal teachers (Nick Saraev is the current 0.95 anchor).
    Use sparingly.
  - 0.85: strong, trusted teachers (the default for a solid add).
  - 0.80: opinion, news, or reaction-heavy channels that should contribute without dominating.
- **kind_bias** is a hint only; the classifier decides each video's actual kind. One of
  `technique | tool | opinion | mixed`. Use `mixed` unless the channel is clearly one lane (a
  news or reaction channel is `opinion`; a build-along tutorial channel leans `technique`).

When unsure, the default `--weight=0.85 --kind=mixed` is the safe add.

## Verify Against Oracles (Before You Commit)

1. **Registered and active.** `node worker/sources/youtube_registry.mjs list`. A leading `*`
   marks an active channel; confirm each new one is present with the weight and kind you
   intended.
2. **The feeds actually return videos.** `node worker/sources/youtube.mjs 3650` runs the
   adapter and prints fetched videos, including the new channels. This is the real oracle that
   the channel id is correct and the RSS feed resolves. The RSS endpoint is flaky from
   datacenter IPs (intermittent 404 and 5xx for valid channels), so run this on a local or
   residential connection; a transient error clears on retry and is not a failure of the entry.
3. **Gates stay green.** `npm run check:generated && npm test`. A registry edit rebuilds
   `directory.json`; the generated-fresh gate proves it is committed-fresh, and the integrity
   test proves every directory concept chip resolves to a glossary hub.

## When It Goes Live

- On the **next daily worker run** (Fly app `ai-firehose-worker`, machine `firehose-daily`),
  the new channels are polled, their recent uploads classified, embedded, and folded into the
  boards and glossary. The directory cards fill in their corpus enrichment (what they cover,
  activity) at that point.
- The directory card shows **immediately** on the next site deploy with registry-only fields
  (name, handle, subscribe link, kind hint), marked as newly added, even before the worker
  ingests the channel.
- To see ingestion **sooner** than the daily schedule, trigger a one-off worker run; see
  `docs/OPERATIONS.md`.

## Removing or Pausing a Channel

- **Remove:** `node worker/sources/youtube_registry.mjs remove @handle` (also accepts the
  `UC...` id), then rebuild the directory (`npm run directory`), commit, and push.
- **Pause without deleting:** set `"active": false` on the entry (hand-edit is fine for this
  one field), then rebuild, commit, and push. A paused channel keeps its config but is not
  polled and drops out of the directory.
- **Keep ingesting but hide from the public directory (track-only):** onboard with
  `--track-only` (or set `"hide_from_directory": true` by hand). Use this for a channel you
  ingest for signal but are not ready to publicly endorse: it still feeds the RAG and the
  rotation, it just does not appear on `/watch`. Re-onboard with `--endorse` (or remove the
  flag) to promote it into the directory once you vouch for it.

## Ingesting Is Not Featuring (Two Registries)

- `sources/youtube_channels.json` (this runbook) is the **ingestion** roster. It feeds the RAG,
  weights the rotation, and drives the Watch **browse-and-subscribe directory**.
- `sources/featured.json` is the separate, presentation-only **spotlight** that drives the
  Watch **Latest** funnel: a curated few creators whose newest videos get a full block with a
  cited summary and concept links, plus a hand-pinned playlist. To spotlight a creator there,
  see "Featured Creators and the Watch Surface" in `docs/SOURCES.md`.

The two are deliberately separate so featuring never perturbs the rotation math. And the
directory is an **endorsement** surface, so it lists only channels you vouch for: onboard with
`--track-only` to ingest and rotation-weight a channel for signal without listing it (it sets
`hide_from_directory`), and re-onboard with `--endorse` to promote it into the directory later.
Tracking is not endorsing; both still feed the three-month RAG.

## Retention: Nothing Featured Past Three Months

In parity with the corpus auto-prune, no video is featured in the Watch stream longer than the
rolling quarter (`RETENTION_DAYS`, default 100, in `src/data/registry.js`), keyed on
`published_at`. A creator who has not posted within the window drops out of the **Latest**
funnel until they post again. The directory's activity and "covers" are derived from the
already-pruned corpus, so they respect the window automatically. Hand-pinned videos
(`pinned[]`) self-expire too, on a tighter explicit clock: a pin is removed from the record
90 days after `pinned_at` (when it was pinned, `PIN_RETENTION_DAYS` in `src/data/registry.js`),
via `scripts/prune_pins.mjs` (run by the worker, or `npm run prune:pins` locally). The durable
glossary layer is the only thing exempt from retention.

## Gotchas

- **Transcripts are off in production.** The daily worker runs with `ENABLE_TRANSCRIPTS=0`
  because YouTube blocks `yt-dlp` from Fly's datacenter IPs. New channels still ingest fully via
  RSS (title and description); deep per-video transcript enrichment is a separate, deferred
  feature that needs a residential proxy or cookies. See `docs/OPERATIONS.md` and `docs/ROADMAP.md`.
- **Resolution can fail transiently.** If `onboard_youtube.mjs` prints `skip <handle>: ...`, the
  channel page may be region-gated or rate-limiting. Retry once; if it keeps failing, resolve
  the id manually with `yt-dlp --print channel_id <channel_url>` and pass the `UC...` id instead.
- **A backlog already exists.** `sources/youtube_channels.json` carries a
  `_suggested_to_verify_and_add` list of high-signal channels worth adding. Pull from it when
  curating, then trim each name as it is added.
