# Lessons Learned

Append-only cumulative wisdom for AI Firehose. The lesson from one session is absorbed into the wisdom for the next. Read this before working; add to it before you finish. Newest sessions on top. Do not delete entries; if one is superseded, annotate it.

---

## Session 1, 2026-06-01: Founding (planning and scaffold)

The decisions and principles that shaped the project, captured so a fresh agent inherits them without re-deriving them.

- **The core is robotlogic.org's non-chat embedding machinery, not a chatbot.** The most advanced RAG work in the portfolio (constellation, centroids, clusters, concept spectrums, influence graph, neighbors) is all non-conversational. Why: that machinery organizes and visualizes a corpus, which is exactly what this site needs. How to apply: do not add a chatbot. The only live model surface is semantic search via `netlify/functions/retrieve.mjs`.

- **Retention is a feature: the corpus self-expires at one quarter.** Why: in the fastest-growing industry, stale signal is noise, and a bounded corpus keeps Pinecone and Voyage costs flat forever. How to apply: the prune stage deletes by `published_at` past `RETENTION_DAYS` (registry). The four horizons are nested windows inside that single quarter; Quarter is the hard outer bound.

- **The taxonomy is AI-grown and fitted loosely, never a fixed tag list.** Why: a fast field coins new concepts constantly, and exact-string tagging both misses them and fragments near-duplicates. How to apply: the model discovers and names new concepts, then every candidate is reconciled to the existing taxonomy by voyage-3 cosine (`TAXONOMY` thresholds in registry). Bind at or above 0.86, review in the ambiguous band, create-new below 0.78 into `_proposed.json` for in-repo approval.

- **Three per-kind rotation boards, and the rotating entity differs per kind.** Techniques rotate by concept, Tools by named product or repo, Opinions by discourse theme. Why: Eric chose three boards plus one unified constellation. How to apply: one shared attention-and-rotation computation, three entity sources.

- **YouTube is the primary source, coded from scratch.** Channel RSS for new-upload detection, yt-dlp for metadata and captions, Whisper for caption-less videos (the exact civil transcript pattern). Why: high-signal teachers are a leading indicator, and from-scratch is cheaper and more interesting than a paid scraper. How to apply: Apify is documented only as a paid fallback if RSS or yt-dlp is blocked. Favorite teachers get high `source_authority_weight`.

- **Public, no auth; curation happens in-repo.** Why: simplest, matches the sibling sites, and the human-author stop (approving new glossary concepts) fits a file or PR review. How to apply: proposed concepts land in `public/data/glossary/_proposed.json`; Eric approves them into the canonical taxonomy.

- **Classification is deterministic-or-flagged, never guessed.** Why: a strict schema plus an optional OpenAI dual-check keeps hallucinated tags out. How to apply: disagreement routes an item to staging rather than publishing.

- **The AGENTS.md hub-and-spoke is what makes the ensemble safe.** Why: Eric runs Codex, Cursor Composer, and Antigravity Gemini alongside Claude. Each reads `AGENTS.md` then `CLAUDE.md` and builds against the deterministic, idempotent contracts. How to apply: keep `AGENTS.md` a pure delegator; per-model driving prompts live in `D:\prompts`.

- **Pacing: parallel subagents for independent build-out, not `/loop`.** Why: an N-item backlog finishes in the time of the slowest single subagent. How to apply: fan out independent adapters or component ports as parallel `Agent` calls; reserve the main thread for coherent, cross-cutting work like the steering docs.

- **The plan lives in the planning system; its decisions are mirrored into `CLAUDE.md`.** Why: durable conventions belong in the auto-loaded doc, not only in a plan file. How to apply: when a decision changes, update `CLAUDE.md` and note it here.

- **Lean SVG over Plotly for the rotation and constellation charts.** Why: the rotation plane is a four-quadrant scatter and the constellation is a 2D scatter; neither needs a multi-megabyte charting engine, and the bundle stays near 58 kB gzip. How to apply: keep visualizations as small SVG components (`RotationChart.jsx`, `Constellation.jsx`, `Sparkline.jsx`) unless a feature genuinely needs a charting library. This refines the plan, which had named Plotly.

- **Built the dashboard against a clearly-labeled synthetic seed before the live pipeline.** `worker/seed/seed.mjs` emits artifacts with `synthetic: true`, and the UI shows a "demo data" ribbon. Why: makes the outlier-hunt concept tangible and surfaces design feedback early without blocking on real data, keys, or the channel list. How to apply: the schemas the seed emits (in `docs/RAG.md`) are the contract the real worker must honor; swap to real artifacts in Phase 1+ and the ribbon disappears on its own.

- **Never call the rotation visualization "RRG" or a "Relative Rotation Graph".** Those name a trademark (de Kempenaer / StockCharts). Why: Eric deliberately cites older prior-art math and flagged this directly. How to apply: use "rotation plane", "rotation ratio", and "rotation momentum", and cite Mansfield Relative Performance (Roy Mansfield, 1979), exactly as aigamma.com/rotations does. This is also in CLAUDE.md Writing Rules.

- **The full live path is verified, so do not treat external inputs as a blanket blocker.** A smoke run (`worker/pipeline/smoke.mjs`) proved fetch -> Claude classify -> Voyage embed -> Pinecone upsert -> query on real videos, and Claude's kind and concept extraction is good out of the box. Why: this was logged after a session wrongly stopped, claiming the channel list blocked all of Phases 1 to 3 when it only gated the YouTube adapter. How to apply: build and verify the autonomous surface (substrate, rotation, precompute, non-YouTube adapters) without waiting; only the YouTube channel curation needs Eric.

- **YouTube channel ids: resolve from the canonical/RSS-alternate link, and the feed endpoint is flaky from datacenter IPs.** The first `channelId` in the page blob is sometimes a different channel. The RSS feed returns intermittent 404 and 5xx for valid channels, so retry with backoff (the adapter does). How to apply: trust a 200 with content; do not delete a channel on a single 404.

- **The ai-firehose Pinecone index was created with the civil project key, so it lives alongside civil-rights and worldthought.** It is isolated by index name (host ai-firehose-...pinecone.io). Why: Pinecone projects cannot be created via an API key. How to apply: optionally migrate to a dedicated ai-firehose project later; for now never write to the sibling indexes (pinecone.mjs resolves the host from the index name, not a sibling PINECONE_HOST).

- **Sparse, bursty attention breaks raw rotation math; smooth it into a decayed level first.** On the first real run a concept seen in one video on one day produced ratio 750 and momentum 237, because Mansfield normalization assumes a continuously-sampled, price-like series. Fix: `decayedLevel()` (attention.mjs) turns mentions into a smooth, fading attention level (half-life about 10 days) that the rotation engine consumes; the displayed attention stays the raw weighted mentions in the window; ratio and momentum are clamped to [55, 145] as a safety. How to apply: always feed levels, not raw counts, to the rotation engine. After the fix, test-time compute reads ratio 62.8, momentum 79.6 with a smooth sparkline.

- **Concept near-duplicates still need the embedding fuzzy-merge (next priority).** The first real run produced llm, large-language-models, and generative-ai as separate concepts. This is exactly what the AI-grown taxonomy resolution (docs/INGESTION.md, the TAXONOMY thresholds) is meant to collapse by voyage-3 cosine. It is the top Phase 2 task; until it lands the boards and constellation carry some duplication.
