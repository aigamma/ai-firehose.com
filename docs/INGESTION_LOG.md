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

## 2026-06-01, Claude (scaffold)
- No pipeline run yet. Phase 0 scaffold only. The worker is built in Phase 1.
- notes: This file is seeded so the first real run has a home and the format is set.
