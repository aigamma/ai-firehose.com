# Deployment

Two targets: the Fly.io ingestion worker (heavy, scheduled, writes artifacts) and
the Netlify site (static plus one read function). The GitHub repo and Netlify site
are live; the Fly worker is the one remaining piece. This is the runbook.

Current state: the GitHub remote is `https://github.com/aigamma/ai-firehose.com`
(public, MIT). The Netlify site `ai-firehose` is deployed with continuous deploy
from `main`, and `/api/retrieve` is verified working. DNS is switched to Netlify
and propagating, with the Let's Encrypt cert issued. The Fly worker is not yet
deployed, so the data does not refresh on a schedule yet (section 1).

## 0. Prerequisites

- The GitHub remote `origin` points at `https://github.com/aigamma/ai-firehose.com`.
  New branches push with `git push -u`. The worker and Netlify both build from it.
- Keys available in sibling `.env` files (see `docs/OPERATIONS.md`). The
  `ai-firehose` Pinecone index already exists.

## 1. Fly.io worker (not yet deployed: the remaining piece)

This is the one piece still to do. Until it runs, the site serves whatever
artifacts are committed to `main`; deploying it turns on the daily data refresh.
The worker clones the repo, runs the pipeline, and pushes the rebuilt artifacts
back, which triggers a Netlify build. It needs a GitHub token to push.

```
# from the repo root (so the build context includes worker/publish.sh)
fly launch --no-deploy -c worker/fly.toml      # or: fly apps create <name>; edit app name in fly.toml
fly secrets set -c worker/fly.toml \
  PINECONE_API_KEY=... VOYAGE_API_KEY=... ANTHROPIC_API_KEY=... OPENAI_API_KEY=... \
  REPO_URL=https://github.com/aigamma/ai-firehose.com.git \
  GH_TOKEN=<fine-grained PAT with contents:write>
fly deploy -c worker/fly.toml --dockerfile worker/Dockerfile
# run it daily as a scheduled Machine:
fly machine run . -c worker/fly.toml --schedule daily
```

The image bakes node, python3, ffmpeg, git, and yt-dlp. `ENABLE_TRANSCRIPTS=1`
turns on YouTube transcript enrichment: captions via yt-dlp first, then an audio
plus OpenAI Whisper (`whisper-1`) fallback for caption-less videos (needs
`OPENAI_API_KEY`). `worker/publish.sh` is the entrypoint: clone, run, commit the
artifacts (`public/data`, `public/sitemap.xml`, `public/feed.xml`), the
accumulating corpus (`worker/.cache/items.json`), and the vector manifest
(`worker/.cache/vector_manifest.json`), then push to `main`.

Cost: the rolling-quarter corpus and vector manifest keep it near the civil
reference (Pinecone plus a few dollars of Voyage) plus Claude classification
(Haiku) on new items only. The classify cache makes re-runs cheap, and the
manifest means unchanged corpus and durable glossary text skip Voyage. Record
runs in `docs/INGESTION_LOG.md`.

## 2. Netlify site (live)

The site `ai-firehose` is deployed with continuous deploy from GitHub `main`:
every push to `main` (including the worker's daily artifact push) triggers a
production build. CI runs `npm run check:generated`, `npm test`, and
`npm run build` before the build path is trusted. The env vars `VOYAGE_API_KEY`,
`PINECONE_API_KEY`, and `PINECONE_INDEX` (`ai-firehose`) are set, and
`/api/retrieve` is verified working.

To reproduce from scratch (connect the GitHub repo in the Netlify UI, or):

```
netlify init
# build command: npm run build   publish: dist   functions: netlify/functions
netlify env:set VOYAGE_API_KEY ...
netlify env:set PINECONE_API_KEY ...
netlify env:set PINECONE_INDEX ai-firehose
netlify deploy --build --prod
```

`netlify.toml` already routes `/api/*` to functions and serves `/data/*` with a
short cache plus stale-while-revalidate. The `retrieve` function powers semantic
search. Optionally add the IndexNow plugin (port from aigamma or worldthought).

## 3. DNS (propagating)

A Netlify DNS zone exists for `ai-firehose.com`, and the GoDaddy nameservers are
switched to Netlify's (`dns1.p01.nsone.net` through `dns4.p01.nsone.net`). DNS is
propagating and the Let's Encrypt cert is issued. Once propagation completes the
apex and `www` resolve through Netlify automatically.

## 4. The chain

1. The Fly worker ingests on its daily schedule and pushes new artifacts to `main`
   (steps 2 and 3 already run on every push; step 1 starts once the worker deploys).
2. The push triggers a Netlify production build of the static site.
3. The site reads the fresh artifacts from `/data`; `/api/retrieve` serves live
   semantic search.

Push at milestones; the worker's daily push is the production cadence. During
development, commit locally and push sparingly to conserve build minutes.
