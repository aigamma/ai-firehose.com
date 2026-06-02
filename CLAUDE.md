# AI Firehose, Codebase Guide

Project context: ai-firehose.com is a personal AI-industry intelligence dashboard, structurally an outlier hunt. It ingests the most salient signal across the AI field every day, organizes it with an embedding and RAG substrate, and surfaces what is new and what is breaking out across four nested time depths: Day, Week, Month, and Quarter. It is the third in a personal trilogy. aigamma.com was built to learn PhD-level math by interacting with models directly. worldthought.com was built to learn philosophy and the interconnections between major thinkers. AI Firehose is built so its author can feel organized and courageous facing the daily flood of AI developments, and stay on the bleeding edge. It is personal first; if others find it useful, good. Keep that north star in every design choice: the job is to turn an overwhelming firehose into something navigable and conquerable, not to build one more noisy feed.

This document is auto-loaded into every agent's context. If a contributor (human or AI) reads only one file, this is it. It is the canonical source of conventions. `AGENTS.md` delegates here.

## Writing Rules (apply to all generative output)

Em dashes (the long dash, U+2014) are forbidden in any generative text on this project: UI copy, JSX strings, code comments, Markdown docs, JSON artifact content (summaries, definitions, cluster names, headlines), and all prompts shipped to models. Replace an em dash with the punctuation the sentence actually wants: comma, colon, semicolon, period, parentheses, or "and". En dashes (U+2013) are allowed only for numeric ranges.

Headings and titles use Title Case. Cite claims: AI-written summaries and definitions must trace to the item they describe.

Do not use "RRG" or "Relative Rotation Graph": those name a trademark. This project uses the older prior-art math, Mansfield Relative Performance (Roy Mansfield, 1979), and the neutral terms "rotation plane", "rotation ratio", and "rotation momentum", mirroring aigamma.com/rotations. Cite Mansfield where the methodology is explained.

## Pacing Constraints

Eric is on Claude Max 20x with consistent unused weekly headroom and pre-paid overage credits. Do not throttle token usage, insert sleep gaps, or split independent work across wakeups to conserve cache. Optimize for wall-clock time and visible progress.

Do not use `/loop` for backlog work. For "burn through N known independent items," spawn N parallel `Agent` subagents in a single message; wall-clock is the slowest single subagent, not the sum. Use `/schedule` (cron in Anthropic's cloud) for genuine multi-hour persistence that must survive session close. Do not end a turn early just to schedule the next wakeup; when more work is in front of you, keep doing it in the same turn.

Do not ask for confirmation between batches of independent work. Run to completion. External rate limits (OpenAI, Fly.io, GitHub, Netlify, YouTube) still apply; this rule is about Anthropic-side conservatism only.

Commit liberally and verbosely. Push less often than you commit (pushes trigger Netlify builds), but always push at a milestone or a state of completion. Leaving finished work committed but unpushed is the failure that causes the deployed tree and local tree to silently diverge.

## Documentation as Durable Source of Truth, and the Dialectical Absorption Protocol

This is the cultural keystone of the project, and the reason the agent harness does not go stale.

Insights, rules, decisions, and process improvements that future contributors need MUST land in this repository's documentation, not in session memory or chat history. Session memory decays; the repo does not. The hierarchy is `CLAUDE.md` (auto-loaded) then `STEERING_DOCS.md` (the map) then the tier-2 subsystem docs in `docs/` then `LESSONS_LEARNED.md` (append-only cumulative wisdom).

The protocol every session follows:

1. Before acting, read `LESSONS_LEARNED.md` and the tier-2 doc for the subsystem you are about to touch.
2. When you discover a process improvement, a sourcing rule, a failure mode, or a better contract, commit that insight to the right doc before the turn ends. The lesson from one session must be absorbed into the wisdom for the next, with enduring notes that retain value cumulatively.
3. When a working rule conflicts with the docs, fix the docs (or fix the rule and make the alignment explicit in the commit). A working tree where the docs lie is a process failure, no different from code that lies.
4. Every commit that materially changes a subsystem updates that subsystem's tier-2 doc in the same commit.
5. `docs/INGESTION_LOG.md` records each pipeline run (what, when, by which agent or model, counts, anomalies). It is the substrate for tuning the rotation windows and thresholds.

This section applies to itself: it lives here, in the auto-loaded doc, because the rule about durable docs is itself a durable insight.

## Architecture

Subsystems, each in its own directory:

- `src/` React 18 + Vite frontend. Reads precomputed JSON from `/data` (served from `public/data/`). The registry at `src/data/registry.js` is the single source of truth: kinds, horizons, quadrants, concept axes, retention, taxonomy thresholds, and navigation all derive from it. Dark-first theme with a real light toggle.
- `worker/` The Fly.io ingestion worker (Node plus Python). Source adapters under `worker/sources/` (YouTube is primary). The pipeline under `worker/pipeline/` runs fetch, dedupe, transcript, classify, embed, upsert, rotation, network, prune, then commits artifacts. Model-facing prompts live in `worker/pipeline/prompts/`.
- `rag/` The embedding substrate, ported from `C:\civil\rag`: `shared.mjs`, `ingest.mjs`, `retrieve.mjs`, and the precompute scripts.
- `netlify/functions/` One light read function, `retrieve.mjs`, the non-chat semantic search proxy (Pinecone plus Voyage rerank). No chatbot.
- `public/data/` The committed JSON artifacts the site reads: `centroids.json`, `constellation.json`, `clusters.json`, `spectrums.json`, `neighbors.json`, `influence.json`, plus `entities/`, `attention/`, `glossary/`, and `digests/`.
- `docs/` Tier-2 subsystem docs. `sources/` Curated source registries (for example `youtube_channels.json`).

Heavy and long-running work lives on the Fly worker because it exceeds Netlify function limits. Netlify serves the static site and the one read function.

## Core Contracts

These are non-negotiable. They are what let a fresh agent ingest new information idempotently and without guessing.

### Idempotency

Content hash every chunk (`sha256(text).slice(0,16)`). Vector IDs are deterministic (`<kind>::<source>::<slug>::<hash16>`). Unchanged content is skipped, not re-embedded. Orphaned vectors are pruned. Re-running the pipeline on unchanged data is a no-op. Ported from `C:\civil\rag\ingest.mjs` and `D:\worldthought.com\scripts\rag\ingest.mjs`.

### Retention: A Self-Expiring Corpus

Nothing older than one quarter is kept. A prune stage (idempotent, keyed on `published_at`) deletes vectors from Pinecone and items from the artifacts once they pass `RETENTION_DAYS` (default 100, in `src/data/registry.js`). The four horizons are nested windows inside this single rolling quarter. The constellation, clusters, and spectrums therefore always depict the current frontier, and Pinecone and Voyage costs stay flat no matter how long the site runs. Glossary concepts are the one durable layer: a concept hub persists as lightweight reference, but with no items inside the window it is marked dormant and drops off the live boards.

### Classification Without Guessing

Each item is classified by Claude against a strict JSON schema (structured output). The model returns `kind` with a one-line justification, a factual `summary`, `concepts[]`, `entities[]`, and `stance` for opinions. `kind` is assigned by the classifier, not by the source, because one YouTube video can teach a technique, demo a tool, and argue an opinion. Never invent a mapping. An optional second pass with OpenAI gives a dual-check; disagreement routes the item to staging rather than publishing on a coin flip. This is the civil discipline of deterministic-or-flagged.

### The AI-Grown Taxonomy (Concept Resolution)

Tags and concepts are not a fixed vocabulary. The classifier discovers candidate concepts in each item, and the model coins a canonical name plus a cited definition for genuinely new ones. Every candidate is then fitted loosely to the existing taxonomy by embedding similarity (voyage-3 cosine), so near-duplicates collapse onto one concept with aliases instead of fragmenting. Thresholds live in `registry.js` `TAXONOMY`: bind when cosine is at or above `mergeThreshold` (0.86); queue for in-repo review in the ambiguous band down to `reviewFloor` (0.78); below that the model creates a new concept, staged in `public/data/glossary/_proposed.json` for approval before it enters the canonical taxonomy. The full algorithm is in `docs/INGESTION.md`.

### Determinism in Precompute

Pinned PCA seed, k-means seed 42, stable sort, content-hash gating. The one-command `network` rebuild regenerates every dependent artifact in dependency order and is safe to re-run. Ported from civil's stage-14 `network` step.

### No Chatbot

The embedding layer powers organization, visualization, and a live semantic search surface only. There is no conversational agent. robotlogic.org proved this non-chat embedding machinery; that is exactly what is being cloned.

## Stack and Keys

Pinecone (vector store, index `ai-firehose`, voyage-3 at 1024-dim cosine, single namespace plus metadata filters). Voyage (`voyage-3` embeddings, `rerank-2` for live search). Claude (Opus for gates, cluster naming, glossary definitions; Sonnet or Haiku for bulk classification). OpenAI optional (dual-check, possibly Whisper). Keys are pulled from sibling repo `.env` files at build time, then set as Fly.io secrets and Netlify environment variables. Never commit keys.

## Multi-Agent Collaboration

`AGENTS.md` is a hub-and-spoke delegator that points here, so cross-vendor agents (Codex, Cursor Composer, Antigravity Gemini, Aider) discover these conventions through the canonical doc. The ensemble can build concurrently against the deterministic, idempotent contracts above. Suggested division of labor once the scaffold exists: Claude builds the embedding and precompute layer, the rotation math, and the dashboard; Codex builds the source adapters and the from-scratch YouTube plus Whisper worker; Cursor Composer ports the visualization components and theming; Antigravity Gemini builds the Netlify function and deploy plumbing.

The cross-project prompt library is at `D:\prompts` (per-model directories plus a `private` tree). Operational prompts the worker ships live in `worker/pipeline/prompts/` in this repo. Proprietary or experimental prompt engineering lives under `D:\prompts\private\ai-firehose.com`, which is local-only. Hard rule from `D:\prompts\CLAUDE.md`: everything under `private/` is gitignored and must never be published or force-added.

## Documentation Map

See `STEERING_DOCS.md` for the tiered map and a "when to read what" cheat sheet. Tier-2 docs: `docs/INGESTION.md` (the pipeline, concept resolution, retention), `docs/RAG.md` (embedding substrate, Pinecone and Voyage, precompute artifacts and schemas), `docs/SOURCES.md` (every source adapter, YouTube primary), `docs/OPERATIONS.md` (keys, schedules, costs, recovery), `docs/DEPLOYMENT.md` (Fly and Netlify). Cumulative wisdom: `LESSONS_LEARNED.md`. Run log: `docs/INGESTION_LOG.md`.

## Commands

- `npm install` then `npm run dev` runs the site locally.
- `npm run build` produces the static site in `dist/`.
- `npm run ingest` runs one pipeline pass on the worker (Phase 1+).
- `npm run network` rebuilds all derived artifacts deterministically (Phase 2+).

## Current State

Phase 0 (scaffold and steering harness) is complete and committed. A Phase 4 vertical slice has landed early: the Home dashboard renders three per-kind relative-rotation boards, the constellation, the outliers strip, and the What Is New feed as lean SVG components, against a clearly-labeled synthetic seed (`worker/seed/seed.mjs`, `synthetic: true`, with a "demo data" ribbon in the UI). The build is clean (about 58 kB gzip). The embedding substrate (Voyage, Pinecone, Anthropic clients), the rotation engine (Phase 3, unit-tested), and the YouTube primary source are built, and the full live path is verified end to end: a smoke run (`worker/pipeline/smoke.mjs`) fetched real videos from the curated channels, classified them with Claude, embedded with Voyage, created the `ai-firehose` Pinecone index, upserted, and ran a sensible semantic query. The channel registry is populated (Nick Saraev plus six similar creators) with an add/remove CLI (`worker/sources/youtube_registry.mjs`). The full pipeline (`worker/pipeline/run.mjs`) now runs end to end and writes real artifacts (attention per kind and horizon, a 118-concept PCA constellation, and digests) into `public/data`, so the dashboard shows real data from the channels and the demo ribbon is gone. The rotation engine consumes a smooth decayed attention level, since raw bursty mentions break the Mansfield math. Concept resolution (the embedding fuzzy-merge, `concepts.mjs`) and an accumulating retention-pruned corpus store (`worker/.cache/items.json`) with a classification cache now ship, so the boards deduplicate and stay stable across flaky fetches. The precompute layer is complete: concept resolution, constellation, clusters, concept spectrums, neighbors, and a co-occurrence influence graph all write to `public/data` (`network.mjs`). The Explore page (themes, concept spectrums, strongest connections) and a Glossary with per-concept integration hubs (aliases, neighbors, axis positions, recent items) now render from the artifacts (`glossary/index.json`). Seven source adapters run behind one aggregator (`worker/sources/index.mjs`): YouTube (primary), Hacker News (AI-keyword gated), arXiv, GitHub (new AI repos by stars), blogs/newsletters (editable RSS manifest `sources/blogs.json`), Hugging Face (daily papers), and Reddit (which returns 403 from datacenter IPs, so it contributes only from a residential or Fly IP). The corpus is about 240 items. Live semantic search is wired (`netlify/functions/retrieve.mjs`, dense retrieve plus Voyage rerank, shared via `worker/lib/retrieve.mjs`, verified against the index) and surfaced on Explore. A gated YouTube transcript module (`worker/pipeline/transcript.mjs`, captions via yt-dlp, on when `ENABLE_TRANSCRIPTS=1`) and the full deploy kit (`worker/Dockerfile`, `worker/fly.toml`, `worker/publish.sh`, `docs/DEPLOYMENT.md`) are ready. Still pending (needs Eric's accounts, credits, and DNS): create a GitHub remote and push, deploy the Fly worker and Netlify site, and point DNS. Every concept dot, rotation-plane point, leaderboard mover, and outlier links to its `/technique/:id` hub, so the dashboard is a navigable graph. The per-kind deep views (`/techniques`, `/tools`, `/opinions`) now render full rotation planes and complete leaderboards, so every nav link lands on a real page. A skip link and `main` landmark are in, and a worker unit-test suite (`npm test`, 9 passing) covers the attention, concept-resolution, rotation, PCA, and network logic. A subscribable RSS feed (`/feed.xml`, the 50 most recent items across all sources, written by the worker) ships, discoverable via the head link and footer. The transcript module now has both paths (captions, then an audio plus OpenAI Whisper fallback for caption-less videos), and Home shows a data-freshness stamp. Also pending: an X (Twitter) adapter and optional text wiki-linking of concept names in prose. The Methodology and About pages carry real content explaining the thesis, and What Is New items link to their sources. The Pinecone index reconciles against the retained store each run (aged-out vectors are deleted), and SEO basics are in place: a generated sitemap, robots.txt, Open Graph and theme-color meta, and an SVG favicon. Nothing is deployed yet and DNS is not pointed. When a phase lands, update this section and the relevant tier-2 doc in the same commit.
