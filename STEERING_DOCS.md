# Steering Document Hierarchy

A one-page map of the project's documents, ranked by where to start and what each is for. Use it to decide what to read before you work, and where a new insight belongs.

## The Hierarchy at a Glance

| Tier | What it is | When to read | Documents |
|---|---|---|---|
| 1. Orientation | "Read first." What this is, the conventions, the contracts. | New contributor, human or AI. | `OVERVIEW.md`, `CLAUDE.md`, `README.md` |
| 2. Active reference | "Read when building or running a subsystem." | Doing ingestion, RAG, sources, glossary, ops, or deploy work, or onboarding a feature. | `docs/INGESTION.md`, `docs/RAG.md`, `docs/SOURCES.md`, `docs/GLOSSARY.md`, `docs/OPERATIONS.md`, `docs/DEPLOYMENT.md`, `docs/FEATURE_PLAYBOOK.md`, `docs/OBSERVABILITY.md` |
| 3. Cumulative wisdom | "Read to understand why, and to avoid past mistakes." | Before any non-trivial change. Append to it when you learn something. | `LESSONS_LEARNED.md` |
| 4. Run record | "Read to see what the pipeline has actually done." | Tuning rotation windows or thresholds, debugging a bad run. | `docs/INGESTION_LOG.md` |

## Tier 1: Orientation

### `OVERVIEW.md` (root)
The human-friendly guided tour: what the project is, what you can do on the site, what is under the hood, why it is trustworthy, and the numbers, written for a smart human (and usable as presentation notes). Start here for the warm, narrative picture, then go to `CLAUDE.md` for the technical canon.

### `CLAUDE.md` (root)
The central, auto-loaded guide. Project context and north star, writing rules, pacing, the dialectical absorption protocol, architecture, the core contracts (idempotency, retention, classification without guessing, the AI-grown taxonomy, determinism, no chatbot), the stack, multi-agent collaboration, the documentation map, commands, and current state. If you read one document, read this.

### `README.md` (root)
Public-facing overview for someone landing on the GitHub repo or curious about the site. Shorter and higher-level than `CLAUDE.md`.

## Tier 2: Active Reference

- `docs/INGESTION.md`: the pipeline stages, the concept-resolution algorithm (AI-discovered, AI-created, then fitted loosely by embedding similarity), and the rolling-quarter prune. Read before touching `worker/`.
- `docs/RAG.md`: the embedding substrate, Pinecone and Voyage setup, the precompute artifacts and their JSON schemas, the relative-rotation math. Read before touching `worker/lib/` (the embedding substrate) or the artifacts.
- `docs/SOURCES.md`: every source adapter, with YouTube primary (RSS plus yt-dlp plus Whisper, Apify only as paid fallback), and the source authority weighting. Read before adding or changing a source.
- `docs/ONBOARD_YOUTUBE_CHANNEL.md`: the one-command runbook for onboarding a list of YouTube educators (`node scripts/onboard_youtube.mjs @list` resolves each, adds it to the ingestion registry, and rebuilds the browse-and-subscribe directory; then choose weight and kind, verify against oracles, commit and push so the worker sees them). The companion runbook to `docs/SOURCES.md`; read it whenever Eric drops a list of handles.
- `docs/OPERATIONS.md`: keys and where they come from, the daily schedule, cost ceilings, monitoring, and recovery recipes.
- `docs/DEPLOYMENT.md`: the Fly worker and the Netlify site, DNS, and the deploy chain.
- `docs/OBSERVABILITY.md`: how the site reports into the fleet observability spine (the Grafana Alloy collector and Grafana Cloud), the worker's zero-dependency OTLP emitter (`worker/lib/otel.mjs`) and the instrumented LLM call sites, the fail-open env-gated contract, and the LLM cost and token metrics. Read before touching telemetry.
- `docs/GLOSSARY.md`: the durable knowledge layer. The two-layer model (authored durable knowledge versus the trending corpus), authoring entries, the build into served artifacts, the durability contract, and wiki-style auto-linking. Read before touching the glossary or `content/glossary`.
- `docs/FEATURE_PLAYBOOK.md`: the repeatable recipe for onboarding a feature, with a dedicated path for a fully Pinecone/Voyage-integrated one (the embedding integration, the citation contract, the agentic-summary pattern, the served-artifact rule, the UI integration, and the closing checklist). Read before adding any feature.

## Glossary Campaigns (active: the quality pass, then onboarding)

Two campaigns hold and grow the durable knowledge layer, both flowing from the `CLAUDE.md` Current State pointer. Phase A re-passes the existing entries to the Opus 4.8 bar; Phase B then authors the genuinely-new ones. The committed docs that run them, each describing itself and its neighbors:

- `docs/GLOSSARY_QUALITY_PASS.md`: the Phase A resume doc. The goal, the method distilled from Sessions 13 and 15, the per-category checklist, the gotchas, and live status for the fresh full re-pass over all existing durable entries. A fresh agent resumes Phase A from here.
- `docs/GLOSSARY_ONBOARDING.md`: the Phase B resume doc. The goal, the per-batch procedure, the voice contract, the reusable category labels, the gotchas (PowerShell quoting, the `check_doc_accuracy` count-sync), and the live status. A fresh agent resumes onboarding from here.
- `docs/glossary_backlog.md`: the corpus-derived prospect list (every non-durable concept, ordered by attention), auto-generated by `scripts/build_glossary_backlog.mjs` and regenerated after each batch. This is what the data mining surfaced.
- `docs/glossary_queue.md`: the agent-curated candidate queue. What an agent's judgment flagged as worth a durable entry; the `CLAUDE.md` Sources-of-Truth protocol instructs every agent to add to it after a dedup check. This is what human judgment surfaced.

Phase A authors no new entries; Phase B authors from both queues, following the `docs/GLOSSARY_ONBOARDING.md` procedure and updating its status block in the same commit.

## Cross-Vendor Pointers and Other Docs

- `AGENTS.md`, `GEMINI.md`, `opencode.md`, `.cursor/rules/project-context.mdc`, `.github/copilot-instructions.md`: thin pointer files that delegate to `CLAUDE.md` so every vendor's agent inherits the same canon. They never duplicate content, so there is one source of truth and no drift.
- `docs/glossary_image_wishlist.md`: the backlog of glossary concepts still needing a cited figure, the visual-enrichment counterpart to the text backlog above.

## Tier 3: Cumulative Wisdom

### `LESSONS_LEARNED.md` (root)
Append-only. Every session that learns something (a better contract, a failure mode, a sourcing rule, a tuning result) appends an entry. This is where the harness gets smarter over time. Read it before you work; add to it before you finish.

## Tier 4: Run Record

### `docs/INGESTION_LOG.md`
Append-only per-run log: what ran, when, by which agent or model, with what counts and anomalies. The substrate for tuning the rotation windows and the taxonomy thresholds.

## When to Read What (cheat sheet)

| You are about to... | Read first |
|---|---|
| Contribute for the first time | `CLAUDE.md`, then `LESSONS_LEARNED.md` |
| Onboard a new feature | `docs/FEATURE_PLAYBOOK.md`, then the tier-2 doc for the subsystem it touches |
| Touch the ingestion pipeline or a source | `docs/INGESTION.md`, `docs/SOURCES.md` |
| Onboard a list of YouTube educators Eric dropped | `docs/ONBOARD_YOUTUBE_CHANNEL.md` |
| Touch the embedding substrate or artifacts | `docs/RAG.md` |
| Change the rotation math or thresholds | `docs/RAG.md`, `docs/INGESTION_LOG.md` |
| Deploy or change infrastructure | `docs/DEPLOYMENT.md`, `docs/OPERATIONS.md` |
| Add or change telemetry or observability | `docs/OBSERVABILITY.md` |
| Re-pass existing glossary entries for quality | `docs/GLOSSARY_QUALITY_PASS.md` (method, per-category checklist, live status) |
| Continue or expand the glossary (new entries) | `docs/GLOSSARY_ONBOARDING.md` (procedure and live status), then `docs/glossary_backlog.md` and `docs/glossary_queue.md` (what to author) |
| Discover a new rule or insight mid-session | Put it in `CLAUDE.md` (if a convention) or `LESSONS_LEARNED.md` (if a lesson). Never rely on session memory. |

## Forward Plan

### `docs/ROADMAP.md`
The prioritized backlog of what to build next, split into unblocked work and items that need Eric (credentials, deploys, pushes). It is the fuel for continuous development: an autonomous build session (in-turn parallel subagents, or a `/schedule` cron) reads it, pulls the top unblocked item, ships and verifies it, then checks it off. Forward-looking, so it sits beside the tiers rather than inside them.

## Maintenance Rule

Every commit that materially changes a subsystem updates its tier-2 doc in the same commit. A working tree where the code changed but the doc lies is a process failure. Tier 3 and Tier 4 are append-only and grow over time; Tiers 1 and 2 are kept evergreen.
