import { slugify } from "../lib/hash.mjs";

/*
  Network precompute over the canonical concept set: semantic neighbors, k-means
  clusters, concept-axis spectrums, and a co-occurrence influence graph. All
  deterministic (fixed k-means init, stable sort), ported in spirit from
  C:\civil\rag precompute. Consumes the canon list ({id, label, vec}) plus a
  per-concept attention map and the working item set.
*/
const round3 = (x) => Math.round(x * 1000) / 1000;
const dot = (a, b) => {
  let s = 0;
  for (let i = 0; i < a.length; i += 1) s += a[i] * b[i];
  return s;
};
const normalize = (v) => {
  const n = Math.sqrt(dot(v, v)) || 1;
  return v.map((x) => x / n);
};
const cosine = (a, b) => dot(a, b) / (Math.sqrt(dot(a, a)) * Math.sqrt(dot(b, b)) || 1);

// Per-concept top-k cosine neighbors.
export function computeNeighbors(canon, { k = 6 } = {}) {
  const out = {};
  for (const a of canon) {
    out[a.id] = canon
      .filter((b) => b.id !== a.id)
      .map((b) => ({ id: b.id, label: b.label, score: round3(cosine(a.vec, b.vec)) }))
      .sort((x, y) => y.score - x.score)
      .slice(0, k);
  }
  return out;
}

// Deterministic k-means over L2-normalized concept vectors (cosine geometry).
export function computeClusters(canon, attentionById = {}, { k } = {}) {
  const n = canon.length;
  if (n < 4) return [];
  const K = k || Math.max(2, Math.round(Math.sqrt(n)));
  const X = canon.map((c) => normalize(c.vec));
  const dim = X[0].length;
  let centers = Array.from({ length: K }, (_, i) => X[Math.floor((i * n) / K)].slice());
  const assign = new Array(n).fill(-1);
  for (let iter = 0; iter < 60; iter += 1) {
    let changed = false;
    for (let i = 0; i < n; i += 1) {
      let best = 0;
      let bs = -Infinity;
      for (let c = 0; c < K; c += 1) {
        const s = dot(X[i], centers[c]);
        if (s > bs) {
          bs = s;
          best = c;
        }
      }
      if (assign[i] !== best) {
        assign[i] = best;
        changed = true;
      }
    }
    const sums = Array.from({ length: K }, () => new Array(dim).fill(0));
    const cnt = new Array(K).fill(0);
    for (let i = 0; i < n; i += 1) {
      cnt[assign[i]] += 1;
      const v = X[i];
      const s = sums[assign[i]];
      for (let j = 0; j < dim; j += 1) s[j] += v[j];
    }
    for (let c = 0; c < K; c += 1) if (cnt[c]) centers[c] = normalize(sums[c]);
    if (!changed && iter > 0) break;
  }
  const clusters = [];
  for (let c = 0; c < K; c += 1) {
    const members = canon
      .filter((_, i) => assign[i] === c)
      .map((m) => ({ id: m.id, label: m.label, attention: Math.round(attentionById[m.id] || 0) }))
      .sort((a, b) => b.attention - a.attention);
    if (members.length) {
      clusters.push({ cluster_id: c, size: members.length, label: members.slice(0, 4).map((m) => m.label).join(", "), members });
    }
  }
  return clusters.sort((a, b) => b.size - a.size);
}

// Project every concept centroid onto each authored axis. Persists axis_vector
// so the client can project a fresh embedding onto the same axis without re-embedding.
export async function computeSpectrums(canon, axes, embedFn) {
  if (!canon.length || !axes.length) return [];
  const anchors = axes.flatMap((a) => [a.pole_a.anchor, a.pole_b.anchor]);
  const av = await embedFn(anchors, "document");
  const out = [];
  for (let i = 0; i < axes.length; i += 1) {
    const eA = av[2 * i];
    const eB = av[2 * i + 1];
    const axisVec = normalize(eA.map((x, j) => x - eB[j]));
    const positions = canon.map((c) => ({ id: c.id, label: c.label, position: round3(dot(normalize(c.vec), axisVec)) }));
    const ps = positions.map((p) => p.position);
    const min = Math.min(...ps);
    const max = Math.max(...ps);
    const span = max - min || 1;
    for (const p of positions) p.position_normalized = round3(((p.position - min) / span) * 2 - 1);
    positions.sort((a, b) => b.position - a.position);
    out.push({
      slug: axes[i].slug,
      title: axes[i].title,
      pole_a: axes[i].pole_a.label,
      pole_b: axes[i].pole_b.label,
      axis_vector: axisVec.map((x) => round3(x)),
      positions,
    });
  }
  return out;
}

// Co-occurrence graph: concepts mentioned together in the same item.
export function computeInfluence(working, canonById, { minCount = 2 } = {}) {
  const edges = new Map();
  for (const it of working) {
    const cs = [...new Set((it.concepts || []).map((c) => slugify(c)).filter((id) => canonById[id]))];
    for (let i = 0; i < cs.length; i += 1) {
      for (let j = i + 1; j < cs.length; j += 1) {
        const [a, b] = [cs[i], cs[j]].sort();
        const key = `${a}|${b}`;
        edges.set(key, (edges.get(key) || 0) + 1);
      }
    }
  }
  const edgeList = [...edges.entries()]
    .filter(([, c]) => c >= minCount)
    .map(([k, count]) => {
      const [from, to] = k.split("|");
      return { from, to, count };
    })
    .sort((a, b) => b.count - a.count);
  const ids = new Set();
  edgeList.forEach((e) => {
    ids.add(e.from);
    ids.add(e.to);
  });
  const nodes = [...ids].map((id) => ({ id, label: canonById[id]?.label || id }));
  return { nodes, edges: edgeList };
}
