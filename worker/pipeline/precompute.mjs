/*
  Precompute helpers ported from C:\civil\rag\precompute.mjs. Power-iteration PCA
  to 2D for the constellation. Deterministic: the initialization is a fixed
  function of the index (no Math.random), so re-running yields the same map.
*/

const dot = (a, b) => {
  let s = 0;
  for (let i = 0; i < a.length; i += 1) s += a[i] * b[i];
  return s;
};
const normalize = (v) => {
  const n = Math.sqrt(dot(v, v)) || 1;
  return v.map((x) => x / n);
};
function norm11(xs) {
  const min = Math.min(...xs);
  const max = Math.max(...xs);
  const span = max - min || 1;
  return xs.map((x) => ((x - min) / span) * 2 - 1);
}

function powerIteration(X, deflate) {
  const dim = X[0].length;
  let v = normalize(Array.from({ length: dim }, (_, i) => Math.sin(i + 1)));
  for (let iter = 0; iter < 150; iter += 1) {
    const Xv = X.map((row) => dot(row, v));
    const w = new Array(dim).fill(0);
    for (let s = 0; s < X.length; s += 1) {
      const c = Xv[s];
      const row = X[s];
      for (let i = 0; i < dim; i += 1) w[i] += c * row[i];
    }
    if (deflate) {
      const d = dot(w, deflate);
      for (let i = 0; i < dim; i += 1) w[i] -= d * deflate[i];
    }
    v = normalize(w);
  }
  return v;
}

// vectors: array of equal-length embeddings. Returns [{x, y}] normalized to [-1, 1].
export function pca2d(vectors) {
  const n = vectors.length;
  const dim = vectors[0]?.length || 0;
  if (!n || !dim) return [];
  if (n === 1) return [{ x: 0, y: 0 }];
  const mean = new Array(dim).fill(0);
  for (const v of vectors) for (let i = 0; i < dim; i += 1) mean[i] += v[i];
  for (let i = 0; i < dim; i += 1) mean[i] /= n;
  const X = vectors.map((v) => v.map((x, i) => x - mean[i]));
  const u1 = powerIteration(X, null);
  const u2 = powerIteration(X, u1);
  const xs = norm11(X.map((r) => dot(r, u1)));
  const ys = norm11(X.map((r) => dot(r, u2)));
  return xs.map((x, i) => ({ x: Math.round(x * 1000) / 1000, y: Math.round(ys[i] * 1000) / 1000 }));
}
