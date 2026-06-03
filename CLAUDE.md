# AI Firehose, Codebase Guide

Project context: ai-firehose.com is a personal AI-industry intelligence dashboard, structurally an outlier hunt. It ingests the most salient signal across the AI field every day, organizes it with an embedding and RAG substrate, and surfaces what is new and what is breaking out across four nested time depths: Day, Week, Month, and Quarter. It is the third in a personal trilogy. aigamma.com was built to learn PhD-level math by interacting with models directly. worldthought.com was built to learn philosophy and the interconnections between major thinkers. AI Firehose is built so its author can feel organized and courageous facing the daily flood of AI developments, and stay on the bleeding edge. It is personal first; if others find it useful, good. Keep that north star in every design choice: the job is to turn an overwhelming firehose into something navigable and conquerable, not to build one more noisy feed.

This document is auto-loaded into every agent's context. If a contributor (human or AI) reads only one file, this is it. It is the canonical source of conventions. `AGENTS.md` delegates here.

## Writing Rules (apply to all generative output)

Em dashes (the long dash, U+2014) are forbidden in any generative text on this project: UI copy, JSX strings, code comments, Markdown docs, JSON artifact content (summaries, definitions, cluster names, headlines), and all prompts shipped to models. Replace an em dash with the punctuation the sentence actually wants: comma, colon, semicolon, period, parentheses, or "and". En dashes (U+2013) are allowed only for numeric ranges. Model-generated prose (classifier summaries and stances, glossary definitions) is additionally sanitized through `worker/lib/text.mjs` before it enters the corpus, because a prompt instruction alone does not guarantee a model complies. Verbatim source titles are quotes, not generative text, and are left intact.

Headings and titles use Title Case. Cite claims: AI-written summaries and definitions must trace to the item they describe.

Do not use "RRG" or "Relative Rotation Graph": those name a trademark. This project uses the older prior-art math, Mansfield Relative Performance (Roy Mansfield, 1979), and the neutral terms "rotation ratio" and "rotation momentum", mirroring aigamma.com/rotations. Cite Mansfield where the methodology is explained.

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

### Sources of Truth and How to Update Them

Private session memory and chat transcripts decay across sessions; the repository does not. So when you learn something durable, route it to the right home, do not leave it in a session note. A working tree where the docs lie is a process failure, no different from code that lies.

| What you learned or changed | Where it goes |
|---|---|
| A project-wide convention, contract, or north-star decision | `CLAUDE.md` (this file): the relevant section, plus the `Current State` section when a subsystem's shape changes |
| A subsystem detail (pipeline, embedding, sources, ops, deploy) | that subsystem's tier-2 doc in `docs/`, in the same commit as the code |
| A lesson, failure mode, or "do this not that" from a session | `LESSONS_LEARNED.md` (append-only, newest on top) |
| A per-run record (counts, anomalies, what ran) | `docs/INGESTION_LOG.md` (append-only) |
| A change to the document hierarchy itself, or a new tier-2 doc | `STEERING_DOCS.md` (the map) |
| A repeatable way to onboard a feature | `docs/FEATURE_PLAYBOOK.md` |
| A structural constant (kind, horizon, quadrant, axis, threshold, retention) | `src/data/registry.js`, the single source of truth the code derives from |

Any agent, in any tool (Claude Code, Cursor, Copilot, OpenCode, Antigravity Gemini, Codex, Aider), inherits this rule through the thin pointer files that delegate here. The pointers never duplicate content, so there is one source of truth and no drift.

This section applies to itself: it lives here, in the auto-loaded doc, because the rule about durable docs is itself a durable insight.

## Architecture

Subsystems, each in its own directory:

- `src/` React 18 + Vite frontend. Reads precomputed JSON from `/data` (served from `public/data/`). The registry at `src/data/registry.js` is the single source of truth: kinds, horizons, quadrants, concept axes, retention, taxonomy thresholds, and navigation all derive from it. Dark-first theme with a real light toggle.
- `worker/` The Fly.io ingestion worker (Node plus Python). Source adapters under `worker/sources/` (YouTube is primary). The pipeline under `worker/pipeline/` runs fetch, dedupe, transcript, classify, embed, upsert, rotation, network, prune, then commits artifacts. Model-facing prompts live in `worker/pipeline/prompts/`.
- `rag/` The embedding substrate, ported from `C:\civil\rag`: `shared.mjs`, `ingest.mjs`, `retrieve.mjs`, and the precompute scripts.
- `netlify/functions/` One light read function, `retrieve.mjs`, the non-chat semantic search proxy (Pinecone plus Voyage rerank). No chatbot.
- `public/data/` The committed JSON artifacts the site reads: `clusters.json`, `spectrums.json` (positions-only; axis vectors held in the worker cache), `influence.json`, `stats.json`, `creators.json` (the Watch surface), plus `attention/`, `digests/` (per-horizon `<horizon>.json` plus the agentic `briefing_<horizon>.json`), and `glossary/` (a slim `index.json` for the list and search plus one `c/<slug>.json` hub per concept, fetched on demand). A served artifact ships only what a page renders.
- `docs/` Tier-2 subsystem docs. `sources/` Curated source registries (for example `youtube_channels.json`). `content/glossary/` The durable, authored knowledge layer: one Markdown file per concept, compiled into the served glossary by `scripts/build_glossary.mjs`.

Heavy and long-running work lives on the Fly worker because it exceeds Netlify function limits. Netlify serves the static site and the one read function.

## Core Contracts

These are non-negotiable. They are what let a fresh agent ingest new information idempotently and without guessing.

### Idempotency

Content hash every chunk (`sha256(text).slice(0,16)`). Vector IDs are deterministic (`<kind>::<source>::<slug>::<hash16>`). Unchanged content is skipped, not re-embedded. Orphaned vectors are pruned. Re-running the pipeline on unchanged data is a no-op. Ported from `C:\civil\rag\ingest.mjs` and `D:\worldthought.com\scripts\rag\ingest.mjs`.

### Retention: A Self-Expiring Corpus

Nothing older than one quarter is kept. A prune stage (idempotent, keyed on `published_at`) deletes vectors from Pinecone and items from the artifacts once they pass `RETENTION_DAYS` (default 100, in `src/data/registry.js`). The four horizons are nested windows inside this single rolling quarter. The clusters and spectrums therefore always depict the current frontier, and Pinecone and Voyage costs stay flat no matter how long the site runs. Glossary concepts are the one durable layer: a concept hub persists as lightweight reference, but with no items inside the window it is marked dormant and drops off the live boards. On top of this sits the deliberate permanent layer: a durable, Opus-authored knowledge base under `content/glossary` (foundational, advanced, and exotic concepts marked `durable: true`), never pruned, merged into the served glossary by `scripts/build_glossary.mjs`. See `docs/GLOSSARY.md`.

### Classification Without Guessing

Each item is classified by Claude against a strict JSON schema (structured output). The model returns `kind` with a one-line justification, a factual `summary`, `concepts[]`, `entities[]`, and `stance` for opinions. `kind` is assigned by the classifier, not by the source, because one YouTube video can teach a technique, demo a tool, and argue an opinion. Never invent a mapping. Today this is a single strict-schema Claude pass; the optional OpenAI dual-check that would route disagreements to staging is intended but not yet implemented. The discipline is deterministic-or-flagged.

### The AI-Grown Taxonomy (Concept Resolution)

Tags and concepts are not a fixed vocabulary. The classifier discovers candidate concepts in each item, and the model coins a canonical name plus a cited definition for genuinely new ones. Every candidate is then fitted loosely to the existing taxonomy by embedding similarity (voyage-3 cosine), so near-duplicates collapse onto one concept with aliases instead of fragmenting. Thresholds live in `registry.js` `TAXONOMY`, the single source of truth, injected into the resolver: bind when cosine is at or above `mergeThreshold` (0.86); in the band down to `reviewFloor` (0.78) bind only when a lexical signal agrees (a shared significant token, or one label is an acronym of the other), which keeps distinct short "AI X" labels apart; below `reviewFloor` the model coins a new canonical concept. New concepts currently enter the taxonomy automatically once resolved; the `_proposed.json` human-approval staging gate is intended but not yet implemented in `worker/pipeline/concepts.mjs`. The full algorithm is in `docs/INGESTION.md`.

### Determinism in Precompute

Pinned PCA start vector, deterministic k-means init (seed-spread, no RNG), stable sort, content-hash gating. The one-command `network` rebuild regenerates every dependent artifact in dependency order and is safe to re-run. Ported from civil's stage-14 `network` step.

### No Chatbot

The embedding layer powers organization, visualization, and a live semantic search surface only. There is no conversational agent. robotlogic.org proved this non-chat embedding machinery; that is exactly what is being cloned.

## Stack and Keys

Pinecone (vector store, index `ai-firehose`, voyage-3 at 1024-dim cosine, single namespace plus metadata filters). Voyage (`voyage-3` embeddings, `rerank-2` for live search). Claude (Haiku does the bulk classification and the glossary definitions today; a Sonnet `quality` tier is defined in `MODELS` for future quality passes). Opus gates, LLM cluster naming, and an OpenAI dual-check are intended but not yet wired; OpenAI may also host Whisper. Keys are pulled from sibling repo `.env` files at build time, then set as Fly.io secrets and Netlify environment variables. Never commit keys.

## Multi-Agent Collaboration

`AGENTS.md` is a hub-and-spoke delegator that points here, so cross-vendor agents (Codex, Cursor Composer, Antigravity Gemini, Aider) discover these conventions through the canonical doc. The ensemble can build concurrently against the deterministic, idempotent contracts above. Suggested division of labor once the scaffold exists: Claude builds the embedding and precompute layer, the rotation math, and the dashboard; Codex builds the source adapters and the from-scratch YouTube plus Whisper worker; Cursor Composer ports the visualization components and theming; Antigravity Gemini builds the Netlify function and deploy plumbing.

The cross-project prompt library is at `D:\prompts` (per-model directories plus a `private` tree). Operational prompts the worker ships live in `worker/pipeline/prompts/` in this repo. Proprietary or experimental prompt engineering lives under `D:\prompts\private\ai-firehose.com`, which is local-only. Hard rule from `D:\prompts\CLAUDE.md`: everything under `private/` is gitignored and must never be published or force-added.

## Documentation Map

See `STEERING_DOCS.md` for the tiered map and a "when to read what" cheat sheet. Tier-2 docs: `docs/INGESTION.md` (the pipeline, concept resolution, retention), `docs/RAG.md` (embedding substrate, Pinecone and Voyage, precompute artifacts and schemas, the citation contract), `docs/SOURCES.md` (every source adapter, YouTube primary, the featured-creators curation workflow), `docs/OPERATIONS.md` (keys, schedules, costs, recovery), `docs/DEPLOYMENT.md` (Fly and Netlify), `docs/GLOSSARY.md` (the durable knowledge layer: authoring, the build, the durability contract, and wiki-style auto-linking), `docs/FEATURE_PLAYBOOK.md` (the repeatable recipe for onboarding a feature, with a dedicated fully-RAG-integrated path). Cumulative wisdom: `LESSONS_LEARNED.md`. Run log: `docs/INGESTION_LOG.md`. Cross-vendor agent delegation: `AGENTS.md` plus the thin pointers `.cursor/rules/project-context.mdc`, `.github/copilot-instructions.md`, `opencode.md`, `GEMINI.md`.

## Commands

- `npm install` then `npm run dev` runs the site locally.
- `npm run build` produces the static site in `dist/`.
- `npm run ingest` runs one pipeline pass on the worker (Phase 1+).
- `npm run network` rebuilds all derived artifacts deterministically (Phase 2+).

## Current State

The site is feature-complete and deployed. Build and the worker test suite (`npm test`) are green, and CI (`.github/workflows/ci.yml`) runs `npm install`, `npm test`, and `npm run build` on every push and PR to `main`. Routes are code-split (Home eager, the rest lazy behind a Suspense boundary). The GitHub repo is public and MIT-licensed at `https://github.com/aigamma/ai-firehose.com` and `main` is pushed; the Netlify site `ai-firehose` is live with continuous deploy from `main` and a verified `/api/retrieve`; DNS is switched to Netlify and propagating with the cert issued. The Fly worker is not yet deployed, so the daily data refresh is the one piece still pending.

**Pipeline (`worker/`).** Seven source adapters behind one aggregator (`sources/index.mjs`): YouTube (primary, with a captions-then-Whisper transcript path gated by `ENABLE_TRANSCRIPTS`), Hacker News, arXiv, GitHub, blogs and newsletters (`sources/blogs.json`), Hugging Face daily papers, and Reddit (403 from datacenter IPs; works from residential or Fly). `run.mjs` runs: fetch, classify (Claude), the AI-grown concept resolution (`concepts.mjs`), embed and upsert (Voyage, Pinecone), the per-board heat signal each board ranks by (`delta` and `trend`, the growth in attention this window versus the prior equal window, `windowTrend` in `attention.mjs`) plus the Mansfield rotation values (`rotation.mjs`) that now feed the concept hubs; board construction is the shared pure `boards.mjs`, replayable offline by `recompute_boards.mjs` so the live run and the offline rebuild cannot drift), the network precompute (`network.mjs`: centroids, clusters, spectrums, neighbors, influence), AI-written glossary definitions (`define.mjs`) then the durable authored-knowledge merge (`scripts/build_glossary.mjs`, so a run never drops the permanent layer), digests, the agentic daily briefing (`briefing.mjs`, a Sonnet synthesis cached on a hash of the window state, sanitized and cited), the Pinecone retention reconcile, sitemap, RSS, stats, and the featured-creators resolver (`scripts/build_creators.mjs`, which also runs as a `prebuild` step on every Netlify deploy). An accumulating retention-pruned store (`worker/.cache/items.json`) plus a classification cache keep runs stable and cheap. Corpus is roughly 250 items.

**Site (`src/`, Netlify).** The Home outlier-hunt dashboard (horizon switch with arrow-key nav, breakout hero) leads with the agentic daily briefing (`Briefing.jsx`, a severity-tinted, cited prose lede from `digests/briefing_<horizon>.json`), then three ranked trend boards (`TrendBoard.jsx`, one per kind: the topics that gained or lost the most attention this window versus the prior equal window, with a magnitude bar, a signed `delta` and arrow, and breakout and just-surfaced flags), a Watch teaser, and a full-width What Is New grid of cited `ItemCard`s. The per-kind deep views render the same `TrendBoard` as a full ranked list. The Watch page (`/watch`) spotlights favorite YouTube teachers from `creators.json`, each video joined to the corpus for a cited summary and concept-hub links, with a click-to-play `LiteYouTube` facade. The Glossary leads with a durable, Opus-authored knowledge base (356 entries across 31 categories, from foundations and advanced mathematics, through deep learning, reinforcement learning, and mechanistic interpretability, to cognitive science and the philosophy of mind), grouped by category and woven into the live trending taxonomy by wiki-style auto-linking (`RichText.jsx` and `richtext.js`); per-concept hubs (the authored body with wiki-links and a related mesh, plus the corpus momentum quadrant, neighbors, and items where present) fetched on demand; Explore (semantic search via `netlify/functions/retrieve.mjs`, themes, spectrums, connections); Methodology (with live stats) and About; RSS, sitemap, robots, Open Graph meta, favicon; dark-first theme with a light toggle; skip link and `main` landmark. Every concept is a link into its hub.

**Notes.** Local `public/data` holds a real run's output (the demo seed is replaced). Served artifacts ship only what a page renders: the glossary index is slim and each concept hub loads on demand, spectrums are positions-only with the axis vectors held in `worker/.cache`. The one-time migration that reshaped the committed artifacts is `worker/pipeline/slim_artifacts.mjs` (idempotent). The `ai-firehose` Pinecone index lives in the civil project, isolated by name.

**Pending**: deploy the Fly worker (turns on the daily data refresh), and let DNS finish propagating to Netlify. Minor stretch: an X (Twitter) adapter; deepen and illustrate the durable glossary entries (more QA passes, images).

When a subsystem changes, update this section and the relevant tier-2 doc in the same commit. Keep this section evergreen and scannable, not a chronological pile.
