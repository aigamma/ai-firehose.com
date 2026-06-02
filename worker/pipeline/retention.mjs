/*
  Retention prune: the rolling-quarter contract (CLAUDE.md "Retention").

  Nothing older than one quarter is kept. This is the pure core extracted from
  run.mjs so it can be unit-tested without the pipeline. The effective timestamp
  is the parsed published_at, falling back to ingested_at, so an item with a
  missing or unparseable published_at expires one quarter after it first entered
  the store rather than living forever.

  Behavior is identical to the prior inline loop: an item is removed only when its
  effective timestamp is a finite number strictly less than the cutoff. An item
  with neither a parseable published_at nor a finite ingested_at is kept (it has no
  ageable timestamp yet), matching the original Number.isFinite(t) guard.
*/
const DAY_MS = 86400000;

export function pruneByRetention(store, { nowMs, retentionDays }) {
  const cutoffMs = nowMs - retentionDays * DAY_MS;
  for (const [id, it] of Object.entries(store)) {
    const tPub = new Date(it.published_at).getTime();
    const t = Number.isFinite(tPub) ? tPub : it.ingested_at;
    if (Number.isFinite(t) && t < cutoffMs) delete store[id];
  }
  return store;
}
