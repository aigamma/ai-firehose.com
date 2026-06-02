/*
  Accumulating-store hygiene. The store is keyed by deterministic item id
  (<kind>::<source>::<slug>::<hash16>), where hash16 covers the title and text. When
  a source item is re-titled or edited between runs (common on YouTube, where
  creators A/B test titles), its content hash changes, so it gets a NEW id and would
  accumulate alongside its stale prior version, double-counting attention and
  cluttering the feed. collapseStore keeps exactly one entry per (source, source_id):
  this run's freshly classified version when present, otherwise the most recently
  published, with a deterministic id tie-break.
*/
export function collapseStore(store, runIds = new Set()) {
  const best = {}; // "source:source_id" -> winning id
  for (const [id, it] of Object.entries(store)) {
    const k = `${it.source}:${it.source_id}`;
    if (runIds.has(id)) {
      best[k] = id; // this run's version always wins
      continue;
    }
    if (best[k] !== undefined && runIds.has(best[k])) continue; // run winner already locked
    if (best[k] === undefined) {
      best[k] = id;
      continue;
    }
    const prev = store[best[k]];
    const tPrev = new Date(prev.published_at || 0).getTime();
    const tCur = new Date(it.published_at || 0).getTime();
    if (tCur > tPrev || (tCur === tPrev && id > best[k])) best[k] = id;
  }
  const out = {};
  for (const id of Object.values(best)) out[id] = store[id];
  return out;
}
