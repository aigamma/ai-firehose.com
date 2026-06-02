# Deployment

Two targets: the Fly.io ingestion worker (heavy, scheduled, writes artifacts) and
the Netlify site (static plus one read function). Nothing is deployed yet; this is
the runbook. The actual commands need Eric's accounts, credits, and DNS.

## 0. Prerequisites

- A GitHub remote for this repo (none is configured yet). Create one and push:
  `git remote add origin https://github.com/<owner>/ai-firehose.com.git` then
  `git push -u origin main`. The worker and Netlify both build from it.
- Keys available in sibling `.env` files (see `docs/OPERATIONS.md`). The
  `ai-firehose` Pinecone index already exists.

## 1. Fly.io worker

The worker clones the repo, runs the pipeline, and pushes the rebuilt artifacts
back, which triggers a Netlify build. It needs a GitHub token to push.

```
# from the repo root (so the build context includes worker/publish.sh)
fly launch --no-deploy -c worker/fly.toml      # or: fly apps create <name>; edit app name in fly.toml
fly secrets set -c worker/fly.toml \
  PINECONE_API_KEY=... VOYAGE_API_KEY=... ANTHROPIC_API_KEY=... OPENAI_API_KEY=... \
  REPO_URL=https://github.com/<owner>/ai-firehose.com.git \
  GH_TOKEN=<fine-grained PAT with contents:write>
fly deploy -c worker/fly.toml --dockerfile worker/Dockerfile
# run it daily as a scheduled Machine:
fly machine run . -c worker/fly.toml --schedule daily
```

The image bakes node, python3, ffmpeg, git, and yt-dlp. `ENABLE_TRANSCRIPTS=1`
turns on YouTube caption enrichment (captions via yt-dlp; an audio plus Whisper
fallback can be added). `worker/publish.sh` is the entrypoint: clone, run, commit
`public/data` and `public/sitemap.xml`, push to `main`.

Cost: the rolling-quarter corpus keeps it near the civil reference (Pinecone plus
a few dollars of Voyage) plus Claude classification (Haiku) on new items only
(the classify cache makes re-runs cheap). Record runs in `docs/INGESTION_LOG.md`.

## 2. Netlify site

```
# connect the GitHub repo in the Netlify UI, or:
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

## 3. DNS

Point `ai-firehose.com` at Netlify (apex plus `www`) per the Netlify dashboard.
Currently not pointed.

## 4. The chain

1. The Fly worker ingests on its daily schedule and pushes new artifacts to `main`.
2. The push triggers a Netlify production build of the static site.
3. The site reads the fresh artifacts from `/data`; `/api/retrieve` serves live
   semantic search.

Push at milestones; the worker's daily push is the production cadence. During
development, commit locally and push sparingly to conserve build minutes.
