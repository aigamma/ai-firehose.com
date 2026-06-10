# Ingestion Log

Append-only per-run record. Newest on top. Each entry: date, who ran it (agent or model), counts (fetched, new, classified, embedded, pruned), anomalies, wall-clock, and approximate cost. This is the substrate for tuning the rotation windows and the taxonomy thresholds.

Entry template:

```
## YYYY-MM-DD HH:MM, <agent/model>
- fetched: N   new: N   classified: N   embedded: N   pruned: N
- new concepts proposed: N   bound: N   review: N
- anomalies: ...
- wall-clock: Nm   approx cost: $N
- notes: ...
```

---

## 2026-06-10, Claude Opus 4.8 (YouTube Shorts purge + CS50/Austin Marchese onboarding, with Eric)
- Onboarded `@cs50` (already present, confirmed `UCcabW7890RKJzL968QWEykA`) and `@austin.marchese` (new, `UCFeFVytEkT8kaqPCJZGFswg`, listed) to the ingestion registry; rebuilt the directory (48 creators). Austin Marchese fills in its corpus enrichment on the next worker run.
- Built the end-to-end Shorts exclusion (`worker/sources/youtube_shorts.mjs`: the `/shorts/<id>` redirect probe + committed `worker/.cache/shorts.json` verdict cache): adapter ingest filter (`youtube.mjs`), store guard (`run.mjs`), explicit Watch guard (`selectVideos`), and the one-time purge (`scripts/remove_shorts.mjs`).
- REBASE: 3 `data: scheduled ingestion` commits (35037885, ebc7ec43, 68bbe797) landed on `main` mid-session, so the scheduled refresh IS running. Re-applied the code/docs/registry/verdict-seed onto the fresh corpus and re-ran the idempotent purge on it (the Session 22 rebase pattern). The fresh ingestion had re-introduced the 118 Shorts plus 12 new ones (the worker did not yet have the filter); my push gives the next run the filter, so it self-heals.
- purge (on the fresh 1061-item corpus): probed 470 YouTube items (20 new vs the seeded verdict cache, 0 undetermined), found and removed **130 Shorts** (28%). items.json 1061 -> 931 (youtube 470 -> 340). Pinecone: deleted 130 short vectors (verified absent via `/vectors/fetch`, 0/6 sampled present; a kept video still present). Scrubbed digests `new_items` (7 per horizon), `feed.xml` (13 items), `stats.json` (1061 -> 931). Rebuilt creators.json + directory.json (keyless), regenerated 4 briefings + the Watch digest (Opus, no longer citing a Short), re-embedded the 340-video Watch surface (Voyage, write-ups reused, 130 short pages pruned). Artifacts anchored to the newest corpus item; boards not recomputed (they hold no Short as an item).
- anomalies: (1) glossary hub `top_items` still reference Shorts in 278 places (deferred: no Short appears there as a clickable item, and a clean rebuild needs the keyed network stage; the next worker run reconciles). (2) Manifest/Pinecone drift: on the pre-ingestion snapshot, of 14 sampled kept videos 14/14 in the manifest but only 11/14 in Pinecone (manifest over-claims; `planVectorSync` then silently skips re-embedding them). The 3 scheduled ingestions reconciled it to 14/14, so it self-heals across runs but recurs in any partial-sync snapshot. Logged for a reconcile playbook (ROADMAP).
- wall-clock: ~10m (two purge runs across the rebase)   approx cost: low (5 Opus syntheses + one Voyage batch per run; the redirect probes are keyless)
- notes: Going forward Shorts never enter (adapter + guard); `FILTER_SHORTS=0` disables, `SHORTS_PROBE_MAX` bounds per-run probing. The probe is a normal lightweight request (unlike yt-dlp), so it should hold on the worker's datacenter IP.

## 2026-06-09 12:43, Claude Opus 4.8 (concept fold migration, with Eric in the loop)
- Applied `scripts/fold_corpus_concepts.mjs` to the committed snapshot: folded 57 corpus-discovered duplicate concepts onto their durable authored hubs (the snapshot patch for the resolver gap tracked in `docs/ROADMAP.md`). No fetch, classify, embed, or prune.
- folded: 57 duplicates across 12 boards   index total: 1313 -> 1256 (durable 644 unchanged, corpus 669 -> 612)   redirect stubs on disk: 75
- audit: previewed with `--dry` and hand-checked the full 57-row map for a false merge before applying. Every fold is an exact normalized-surface match to a durable title or authored alias, not an embedding guess (for example `ai-economics -> market-dynamics` is the authored "AI economics" alias of Market Dynamics; `vibe-coding -> ai-assisted-coding`, `colbert -> late-interaction`, and `evals -> evaluation` likewise). Ambiguous surfaces are dropped by the matcher and already barred by `check_glossary`.
- verification: `npm test` 218/0, `npm run build` clean. `build_glossary` reproduces the folded state idempotently (reads the deduped index, rewrites the 644 durable hubs, and the 75 redirect stubs survive regeneration), so `check:generated` is clean except the spurious `creators.json` YouTube-RSS flake (restored). `TechniqueHub` already routes the redirect stubs via `<Navigate>`. Reconciled OVERVIEW.md total-concepts 1313 -> 1256 (the gated count the fold shifts).
- anomalies: none. The worker resolver still does not dedupe against the durable layer, so a future live worker run will re-fragment until the `run.mjs` fix lands (ROADMAP); the fold is idempotent, so re-running it is a no-op.
- notes: clicking a trending tag like "AI agents", "LLMs", or "vector search" now lands on the rich authored hub instead of a thin stub, and each trend board shows one row per concept.

## 2026-06-09, Claude Opus 4.8 (local ingest after onboarding 10 educators)
- fetched: 214 new items from the non-YouTube sources (Hacker News, arXiv, GitHub, blogs, Hugging Face). ALL YouTube `feeds/videos.xml` requests returned HTTP 404 from this machine's IP, so no new YouTube videos were ingested this run.
- classified: 214 new (30 cache hits) via Claude Haiku. new concepts merged into 784 canonical concepts.
- embedded: 244   metadata-only: 185   unchanged: 241   pruned: 8. Corpus 670 vectors; glossary index total 1313 (durable 644).
- anomalies: YouTube's RSS feed endpoint hard-404s for every channel from this IP right now, including known-good Nick Saraev (confirmed by a direct fetch with a browser UA). A datacenter-IP rate-limit, total rather than intermittent. Consequence: the 10 newly-onboarded educators did not ingest, and the Watch spotlight populates only the 4 creators that already had corpus videos (Nick Saraev, AI Engineer, Cole Medin, AI Jason). The other 7 stay as empty featured/directory entries until a feed pull succeeds (a retry when the IP unblocks, or the deployed Fly worker on its own network). Re-ingest is additive, so they fill in with no rework.
- wall-clock: ~3m   approx cost: low (214 Haiku classifications + 244 Voyage embeds)
- notes: Run to integrate the 10 endorsed channels (`sources/youtube_channels.json`) and feature them in the Watch spotlight (`sources/featured.json`, now 11 creators). Reconciled OVERVIEW.md total-concepts 1192 -> 1313 (the Session 22 gotcha: a corpus refresh shifts the gated count). `check_generated_fresh` buffer-overflows its internal `git diff` on the 818-file uncommitted change, so I canonicalized the four generators directly (`build_glossary`, `build_harness`, `build_creators`, `build_directory`) and verified the gate green on the committed tree.

## 2026-06-02, Claude (Opus 4.8)
- Partial run for the dashboard overhaul: generated the agentic daily briefing (4 Sonnet syntheses, one per horizon, cached on the window state hash) from the committed digests and attention boards, and resolved the featured-creators artifact (`creators.json`) for Nick Saraev (RSS succeeded from this IP, 4 videos, each joined to the corpus for a cited summary and concepts). No fetch, classify, embed, or prune.
- briefings written: 4 (day, week, month, quarter)   creators: 1   videos: 4   pinned: 0
- anomalies: none. The full pipeline (fetch, classify, embed, prune) was not run; the briefing and creators steps are now wired into `run.mjs` and refresh on the next live run.
- approx cost: about $0.05 (4 Sonnet briefing calls, short). notes: briefing prose is sanitized and em-dash-clean (the style test now scans it); concepts in `creators.json` are slugified for hub links.

## 2026-06-02, Claude (Opus 4.8)
- Offline board backfill, no network (no fetch, embed, or prune). Replayed `worker/.cache/items.json` through the shared `computeBoards` to add the `trail` trajectory to every rotation board.
- items: 256 (collapsed store, within retention)   boards written: 12 (3 kinds across 4 horizons)
- determinism: re-running `recompute_boards.mjs` reproduces all 12 artifacts byte-for-byte (sha256 identical), confirming the committed boards match the current code.
- anomalies: none. This work was recovered as uncommitted changes after a host crash; tests 47/47 green, build clean.
- notes: New files `worker/pipeline/boards.mjs` (shared pure builder, also called by `run.mjs`) and `worker/pipeline/recompute_boards.mjs`. Frontend `RotationChart` now draws the comet tails with an identity-color legend toggle and a Just Surfaced row for new entrants.

## 2026-06-01, Claude (scaffold)
- No pipeline run yet. Phase 0 scaffold only. The worker is built in Phase 1.
- notes: This file is seeded so the first real run has a home and the format is set.
