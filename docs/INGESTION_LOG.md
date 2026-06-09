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
