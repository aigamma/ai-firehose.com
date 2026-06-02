import { semanticSearch } from "../../worker/lib/retrieve.mjs";

// GET /api/retrieve?q=...&kind=technique|tool|opinion
// The non-chat semantic search surface. Pinecone dense retrieve + Voyage rerank.
export default async (req) => {
  try {
    const url = new URL(req.url);
    const q = url.searchParams.get("q") || "";
    const kind = url.searchParams.get("kind") || undefined;
    const results = await semanticSearch(q, { kind });
    return new Response(JSON.stringify({ query: q, results }), {
      headers: { "content-type": "application/json", "cache-control": "public, max-age=60" },
    });
  } catch (e) {
    return new Response(JSON.stringify({ error: String(e?.message || e) }), {
      status: 500,
      headers: { "content-type": "application/json" },
    });
  }
};
