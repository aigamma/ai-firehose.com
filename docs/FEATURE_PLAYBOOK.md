# Feature Playbook

The repeatable recipe for onboarding a feature to AI Firehose without re-deriving the conventions each time. It exists so the site can grow toward a mature, consistent portfolio piece, with every feature wired the same way into the embedding substrate, the citation discipline, and the documentation harness.

Read this before adding a feature. Then read the tier-2 doc for the subsystem you are touching. The patterns here are distilled from the sibling trilogy: quantitative modeling and agentic summaries from aigamma.com, cited embedding-backed pages from worldthought.com, and the elaborate non-chat RAG substrate from civil.

## Two Tracks

- **Track A, a presentation feature**: reads existing artifacts and renders a new surface. No new embeddings. Example: the unified rotation plane (it merges three existing `attention/*` artifacts client-side). Do steps 1, 5, 6, 7.
- **Track B, a fully RAG/Voyage/Pinecone-integrated feature**: introduces or joins model-written, embedding-grounded, cited content. Example: the agentic daily briefing, and the featured-creators Watch surface. Do all steps.

Decide the track first, and say which in the commit and the tier-2 doc.

## The Steps

### 1. Data Contract (single source of truth)

Structural constants (kinds, horizons, quadrants, axes, thresholds, retention, navigation, and any new tunable) live in `src/data/registry.js`. Nav, routes, and the sitemap derive from it. Add the constant there, not inline in a component. A new tunable for the feature (a cap, a threshold) is a named export, so the behavior has one place to tune and document.

### 2. Embedding Integration (Track B)

Reuse the substrate, do not rebuild it.

- **Idempotency**: content-hash every chunk (`sha256(text).slice(0,16)`), deterministic vector IDs (`<kind>::<source>::<slug>::<hash16>`). Unchanged content is skipped, not re-embedded. Re-running is a no-op. See `worker/lib/` and `docs/INGESTION.md`.
- **Retrieval**: two stages, Pinecone dense then Voyage `rerank-2`, fail-open to dense order. Reuse `worker/lib/retrieve.mjs`; never write a second retriever.
- **Neighbors and hubs**: nearest concepts and items are denormalized into the glossary hubs at network-rebuild time. A feature that needs "related X" joins to the existing hub or computes neighbors in the worker (which has the keys), not in the browser.
- **Retention-bounded**: distributions for z-scores and percentiles are bounded by the retained quarter. Do not reach outside the window.

### 3. Citation Contract (Track B)

Every claim a model writes must cite an item or a concept, in the shape documented in `docs/RAG.md` (Citation Contract): `{ id, kind, title, url, author_or_channel, published_at, concepts[], summary, score? }`. Render an item as its title linked to `url`, a concept as a wiki-link to `/technique/<slug>`. Never fabricate a url, title, or date. This is the "cite claims" Writing Rule, enforced at the surface.

### 4. Agentic Summary Pattern (Track B, when the feature writes prose)

Mirror aigamma's narrator, adapted to this project's MODELS registry:

- **Rich state object**: assemble the inputs (movers, breakouts, new entrants, notable items with their summaries and concepts) into a structured object, numerics rounded. Fail-open on any missing input; a degraded state still produces a partial result.
- **Model tiers**: Haiku feeders for per-section terse passes, a `quality` (Sonnet) synthesis for the top-level prose. Read the tier from `MODELS` in the registry, do not hardcode a model id.
- **Strict persona**: descriptive not prescriptive, tight and declarative, Title Case, no em dashes. The persona lives in `worker/pipeline/prompts/`.
- **Severity signal**: a 0 to 3 notability score drives the UI accent (the aigamma pattern), so a quiet day reads as quiet.
- **Sanitize at the boundary**: run model output through `worker/lib/text.mjs` before it enters an artifact. A prompt instruction is a hint, not a guarantee.
- **Telemetry and idempotency**: persist `model`, `prompt_version`, and the inputs. Cache on a hash of the state so an unchanged run reuses the result (cost-flat, deterministic-enough, matches the content-hash ethos). Bump `prompt_version` when the prompt's shape changes.

### 5. Served-Artifact Rule

A committed artifact under `public/data/` is downloaded by every visitor, so it ships only the fields a page renders. Park server-only data (raw vectors, large intermediate state) in `worker/.cache/` outside `public/`. Audit consumers with a raw recursive grep before adding a field (the dedicated search tool ignores the built `dist/`). Keep per-entity hubs split and fetched on demand, with a slim index for lists and search.

### 6. UI Integration

- Read artifacts through `useData(path)` (module cache, three states: data, the 404 "awaiting ingestion" empty box, and a distinct load error). Never read raw fetch in a component.
- A new page is a lazy route in `src/App.jsx` and an entry in `registry.js` `NAV` (the sitemap derives from NAV). Home stays eager.
- Reuse the component vocabulary: `ItemCard`, `Sparkline`, the `.card`, `.feed`, `.chips`, `.badge`, `.leaders` idioms, the quadrant and kind CSS tokens. Dark-first with the light toggle; respect `prefers-reduced-motion`.

### 7. Closing Checklist (every feature)

- Update the subsystem's tier-2 doc in the same commit (the maintenance rule).
- Update `CLAUDE.md` `Current State` when the subsystem's shape changes.
- Add a deterministic, offline worker test if the feature has worker logic (`npm test` is `node --test`).
- Keep CI green (`npm install`, `npm test`, `npm run build`).
- If the feature touches a served surface that needs an external origin (an image host, an embed), update the CSP in `netlify.toml`, or the feature works in `npm run dev` and silently fails in production.
- Append a lesson to `LESSONS_LEARNED.md` if you learned something durable.
- `node --check` any edited worker `.mjs` (a load-time SyntaxError is silent otherwise).

## Reference Implementations

- **Track A**: a client-side visualization over precomputed artifacts. The live example is the trend heat boards (`src/components/TrendBoard.jsx`, fed by `src/lib/useUnifiedAttention.js`), which read the `attention/*` artifacts and rank topics by windowed growth. (This replaced an earlier rotation plane; see `LESSONS_LEARNED.md`, Session 6.)
- **Track B, prose**: the agentic daily briefing (`worker/pipeline/briefing.mjs`, `worker/pipeline/prompts/briefing.mjs`, the `digests/briefing_<horizon>.json` artifact, `src/components/Briefing.jsx`).
- **Track B, joined corpus**: the featured-creators Watch surface (`sources/featured.json`, `scripts/build_creators.mjs`, the `creators.json` artifact, `src/pages/Watch.jsx`), which joins each creator's recent corpus videos to their classified records for cited summaries and concept-hub links. Corpus-only and deterministic by default (live RSS is an explicit `--live` opt-in), so it is a hard prebuild and generated-fresh gate. Curation workflow is in `docs/SOURCES.md`.
- **Track B, deterministic corpus-join**: the creators directory (`sources/youtube_channels.json`, the pure core `scripts/lib/directory.mjs` plus the thin IO runner `scripts/build_directory.mjs`, the `directory.json` artifact, `src/components/CreatorDirectory.jsx`). Corpus-only with no live RSS, so the builder is a hard prebuild and generated-fresh gate (as is the creators spotlight above, brought to the same determinism in Session 25). Two patterns worth copying: concept chips are filtered to slugs that resolve to a real glossary hub (so the integrity test passes by construction), and the `generated` stamp is derived from the data (the newest corpus publish date) rather than the wall clock, so a gated artifact is byte-identical on regeneration and never drifts by date. Onboarding is one command, `scripts/onboard_youtube.mjs` (runbook `docs/ONBOARD_YOUTUBE_CHANNEL.md`).
