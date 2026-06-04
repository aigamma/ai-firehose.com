// Pure logic for the returning-visitor layer: "new since your last visit" and the
// read/cleared state that lets a reader conquer the firehose (mark items handled and
// see a finite, beatable task instead of an endless feed). Kept free of React and
// localStorage so it is unit-testable and reusable, exactly as src/lib/lens.js is to
// useLens. The hook (src/hooks/useSeen.js) owns persistence and the wall clock; these
// functions own the set math and the date comparison.

// The stable per-item key. Digest new_items carry a url but no id, so url wins; a
// concept-like record falls back to its id. Empty string for an unkeyable item, which
// every helper below treats as "not tracked".
export function itemKey(item) {
  if (!item) return "";
  return item.url || item.id || "";
}

// An item's published_at as ms epoch, or NaN when missing or unparseable.
export function publishedMs(item) {
  if (!item || !item.published_at) return NaN;
  const t = new Date(item.published_at).getTime();
  return Number.isFinite(t) ? t : NaN;
}

// Was this item published after the reader's last visit? Only meaningful when
// sinceMs is a real prior-visit timestamp (> 0); a first-ever visit has no
// baseline, so callers pass sinceMs <= 0 and nothing reads as new.
export function isNewSince(item, sinceMs) {
  if (!(sinceMs > 0)) return false;
  const p = publishedMs(item);
  return Number.isFinite(p) && p > sinceMs;
}

// How many of these items are new since the last visit.
export function countNewSince(items, sinceMs) {
  const list = Array.isArray(items) ? items : [];
  return list.reduce((n, it) => (isNewSince(it, sinceMs) ? n + 1 : n), 0);
}

// How many of these items the reader has cleared (read set is a Set of item keys).
export function clearedCount(items, readSet) {
  const list = Array.isArray(items) ? items : [];
  const set = readSet instanceof Set ? readSet : new Set(readSet || []);
  if (!set.size) return 0;
  return list.reduce((n, it) => (set.has(itemKey(it)) ? n + 1 : n), 0);
}

// True only when there is at least one item and every item is cleared, the
// "you have cleared this window's wire" completion signal.
export function allCleared(items, readSet) {
  const list = Array.isArray(items) ? items : [];
  if (!list.length) return false;
  const set = readSet instanceof Set ? readSet : new Set(readSet || []);
  return list.every((it) => set.has(itemKey(it)));
}
