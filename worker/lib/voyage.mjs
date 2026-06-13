import { ENV } from "./env.mjs";
import { recordLlm } from "./otel.mjs";

// Voyage AI client. voyage-3 (1024-dim) for embeddings, rerank-2 for the live
// search second stage. Ported from the civil and worldthought RAG substrate.
const BASE = "https://api.voyageai.com/v1";

async function post(path, body) {
  const startMs = Date.now();
  const op = path.replace(/^\//, "");
  try {
    const r = await fetch(`${BASE}${path}`, {
      method: "POST",
      headers: { Authorization: `Bearer ${ENV.voyageKey}`, "Content-Type": "application/json" },
      body: JSON.stringify(body),
      signal: AbortSignal.timeout(30000),
    });
    if (!r.ok) throw new Error(`Voyage ${path} ${r.status}: ${(await r.text()).slice(0, 300)}`);
    const j = await r.json();
    // Voyage bills embeddings and rerank on input tokens only (no output).
    recordLlm({
      system: "voyage",
      model: body.model || "voyage-3",
      operation: op,
      inputTokens: j.usage?.total_tokens ?? 0,
      outputTokens: 0,
      startMs,
      ok: true,
    });
    return j;
  } catch (e) {
    recordLlm({ system: "voyage", model: body.model || "voyage-3", operation: op, startMs, ok: false });
    throw e;
  }
}

// Voyage returns each embedding tagged with its input index. Reorder by that index
// so a batch can never be silently misaligned with its inputs, the one failure that
// would corrupt every downstream similarity, cluster, neighbor, and spectrum.
export function orderEmbeddings(data, length) {
  const out = new Array(length);
  for (const d of data) out[d.index] = d.embedding;
  return out;
}

// Embed documents (ingest) or a query. Batches at 128 (Voyage input limit).
export async function embed(texts, inputType = "document", model = "voyage-3") {
  const out = [];
  for (let i = 0; i < texts.length; i += 128) {
    const batch = texts.slice(i, i + 128);
    const j = await post("/embeddings", { input: batch, model, input_type: inputType });
    out.push(...orderEmbeddings(j.data, batch.length));
  }
  return out;
}

export const embedQuery = async (q, model = "voyage-3") => (await embed([q], "query", model))[0];

// Cross-encoder rerank. Returns [{ index, relevance_score }] sorted by score.
export async function rerank(query, documents, topK, model = "rerank-2") {
  const j = await post("/rerank", { query, documents, model, top_k: topK });
  return j.data;
}
