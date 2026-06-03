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
