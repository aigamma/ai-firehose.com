import { embedQuery, rerank } from "./voyage.mjs";
import { ensureIndex, query } from "./pinecone.mjs";

/*
  Two-stage semantic search (dense retrieve, then Voyage rerank-2), shared by the
  Netlify function and the CLI verifier. No generation, no chat. Fail-open: if
  rerank errors, fall back to the dense order. Ported from C:\civil\rag\retrieve.
*/
let cachedHost;
async function getHost() {
  if (!cachedHost) cachedHost = await ensureIndex();
  return cachedHost;
}

export async function semanticSearch(q, { kind, topK = 30, topN = 8 } = {}) {
  if (!q || !q.trim()) return [];
  const qv = await embedQuery(q);
  const filter = kind ? { kind: { $eq: kind } } : undefined;
  const matches = await query(await getHost(), qv, { topK, filter, includeMetadata: true });
  if (!matches.length) return [];

  let ordered = matches.slice(0, topN);
  try {
    const docs = matches.map((m) => (m.metadata?.summary || m.metadata?.title || "").slice(0, 1000));
    const rr = await rerank(q, docs, Math.min(topN, docs.length));
    ordered = rr.map((r) => ({ ...matches[r.index], _rr: r.relevance_score }));
  } catch {
    /* fail open to dense order */
  }

  return ordered.slice(0, topN).map((m) => ({
    title: m.metadata?.title || "",
    url: m.metadata?.url || "#",
    kind: m.metadata?.kind || "",
    author_or_channel: m.metadata?.author_or_channel || "",
    published_at: m.metadata?.published_at || "",
    summary: m.metadata?.summary || "",
    concepts: m.metadata?.concepts || [],
    score: Math.round(((m._rr ?? m.score) || 0) * 1000) / 1000,
  }));
}
