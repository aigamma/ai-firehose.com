import { slugify } from "../lib/hash.mjs";

/*
  Attention series. Each classified item attributes attention to each concept it
  references, on the item's published day, weighted by source authority and a log
  of engagement. The result is a per-kind, per-concept daily series over the
  retained quarter, which the rotation engine turns into ratio and momentum.
*/

export function dayIndexOf(dateStr, todayMs, days) {
  const t = new Date(dateStr).getTime();
  if (!Number.isFinite(t)) return -1;
  const ago = Math.floor((todayMs - t) / 86400000);
  if (ago < 0 || ago >= days) return -1;
  return days - 1 - ago; // 0 = oldest day in window, days-1 = today
}

export const engagementFactor = (e) => 1 + Math.log10(1 + Math.max(0, e || 0));

// Returns { byKind: { technique: {conceptId: number[]}, ... }, labels, primaryKind }.
export function buildSeries(items, { days, todayMs }) {
  const byKind = { technique: {}, tool: {}, opinion: {} };
  const labels = {};
  const kindAttention = {}; // conceptId -> {kind: total} to pick a primary kind for the map
  for (const it of items) {
    if (!byKind[it.kind]) continue;
    const idx = dayIndexOf(it.published_at, todayMs, days);
    if (idx < 0) continue;
    const w = (it.source_authority_weight ?? 0.8) * engagementFactor(it.engagement);
    for (const concept of it.concepts || []) {
      const id = slugify(concept);
      if (!id) continue;
      labels[id] = labels[id] || concept;
      const series = (byKind[it.kind][id] ||= new Array(days).fill(0));
      series[idx] += w;
      kindAttention[id] = kindAttention[id] || {};
      kindAttention[id][it.kind] = (kindAttention[id][it.kind] || 0) + w;
    }
  }
  const primaryKind = {};
  for (const [id, kinds] of Object.entries(kindAttention)) {
    primaryKind[id] = Object.entries(kinds).sort((a, b) => b[1] - a[1])[0][0];
  }
  return { byKind, labels, primaryKind };
}

// Sum the last `windowDays` of a daily series (the displayed attention).
export const windowSum = (series, windowDays) =>
  series.slice(Math.max(0, series.length - windowDays)).reduce((s, x) => s + x, 0);

// Convert bursty daily attention into a smooth, positive attention LEVEL by
// exponential decay. A single mention then has a continuous, fading presence
// instead of a one-day spike. This is what the rotation engine consumes: the
// raw bursty series produces degenerate ratios (a concept seen once on one day
// yields ratio in the hundreds), but a decayed level behaves like a price-like
// series, which is what Mansfield normalization assumes. half-life in days.
export function decayedLevel(series, halfLifeDays = 10) {
  const decay = Math.pow(0.5, 1 / halfLifeDays);
  const out = new Array(series.length).fill(0);
  let lvl = 0;
  for (let i = 0; i < series.length; i += 1) {
    lvl = lvl * decay + (series[i] || 0);
    out[i] = Math.round(lvl * 1000) / 1000;
  }
  return out;
}
