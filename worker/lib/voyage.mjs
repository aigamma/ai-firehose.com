import { ENV } from "./env.mjs";

// Voyage AI client. voyage-3 (1024-dim) for embeddings, rerank-2 for the live
// search second stage. Ported from the civil and worldthought RAG substrate.
const BASE = "https://api.voyageai.com/v1";

async function post(path, body) {
  const r = await fetch(`${BASE}${path}`, {
    method: "POST",
    headers: { Authorization: `Bearer ${ENV.voyageKey}`, "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  if (!r.ok) throw new Error(`Voyage ${path} ${r.status}: ${(await r.text()).slice(0, 300)}`);
  return r.json();
}

// Embed documents (ingest) or a query. Batches at 128 (Voyage input limit).
export async function embed(texts, inputType = "document", model = "voyage-3") {
  const out = [];
  for (let i = 0; i < texts.length; i += 128) {
    const j = await post("/embeddings", { input: texts.slice(i, i + 128), model, input_type: inputType });
    for (const d of j.data) out.push(d.embedding);
  }
  return out;
}

export const embedQuery = async (q, model = "voyage-3") => (await embed([q], "query", model))[0];

// Cross-encoder rerank. Returns [{ index, relevance_score }] sorted by score.
export async function rerank(query, documents, topK, model = "rerank-2") {
  const j = await post("/rerank", { query, documents, model, top_k: topK });
  return j.data;
}
