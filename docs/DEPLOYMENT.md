# Deployment

Two deploy targets: the Fly.io worker (heavy, scheduled) and the Netlify site (static plus one read function).

## Fly.io Worker

- `worker/Dockerfile`: Node plus Python, with `yt-dlp`, `ffmpeg`, and the Whisper implementation installed. Installs npm and pip deps.
- `worker/fly.toml`: app `ai-firehose-worker`. The pipeline runs on a schedule (a Fly scheduled Machine, or a small process running a cron inside the container) executing `npm run ingest` daily.
- Secrets via `fly secrets set` (see `docs/OPERATIONS.md`). Deploy with `fly deploy` from `worker/`.
- The worker commits rebuilt artifacts back to the repo and pushes, which triggers the Netlify build. Use a race-safe rebase-and-push (the worldthought refresh-rag pattern) so a concurrent push does not clobber.

## Netlify Site

- Connect the GitHub repo. Build `npm run build`, publish `dist`, functions `netlify/functions` (see `netlify.toml`).
- Environment variables for the `retrieve` function (Pinecone and Voyage) set in the Netlify UI.
- Add the IndexNow plugin later (port from aigamma or worldthought) for SEO ping on deploy.

## DNS

Point `ai-firehose.com` at Netlify (currently not pointed). Add the apex and `www` per Netlify's instructions.

## The Chain

1. The worker ingests on schedule and pushes new artifacts to `main`.
2. The push triggers a Netlify production build of the static site.
3. The site reads the fresh artifacts from `/data`; the `retrieve` function serves live semantic search.

Push at milestones, batch intermediate pushes during active development (pushes consume Netlify build minutes).
