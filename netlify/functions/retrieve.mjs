import { semanticSearch } from "../../worker/lib/retrieve.mjs";

// GET /api/retrieve?q=...&kind=technique|tool|opinion
// The non-chat semantic search surface. Pinecone dense retrieve + Voyage rerank.
// This is a public, billable endpoint: each call triggers paid Voyage + Pinecone
// work, so it is hardened against empty input, bad kinds, and abusive volume.

// Local literal, not imported from src/ (that is the browser registry). Keep in
// sync with the classifier kinds the corpus actually uses.
const ALLOWED = new Set(["technique", "tool", "opinion"]);

const MAX_QUERY_LEN = 200;

// Best-effort, in-memory rate limit. Resets on cold start, which is acceptable
// for a personal dashboard: it only needs to blunt runaway or abusive volume,
// not enforce a precise global quota.
const RATE_LIMIT_MAX = 30; // requests
const RATE_LIMIT_WINDOW_MS = 60_000; // per 60s
const hits = new Map(); // ip -> array of recent request timestamps (ms)

function rateLimited(ip) {
  const now = Date.now();
  const cutoff = now - RATE_LIMIT_WINDOW_MS;
  // Prune timestamps older than the window so the entry can't grow unbounded.
  const recent = (hits.get(ip) || []).filter((t) => t > cutoff);
  recent.push(now);
  hits.set(ip, recent);
  return recent.length > RATE_LIMIT_MAX;
}

export default async (req) => {
  try {
    const ip = req.headers.get("x-nf-client-connection-ip") || "unknown";
    if (rateLimited(ip)) {
      return new Response(JSON.stringify({ error: "rate limited" }), {
        status: 429,
        headers: { "content-type": "application/json" },
      });
    }

    const url = new URL(req.url);
    // Bound the query: cap length first, then trim. Too-short input returns an
    // empty result without any paid call.
    const q = (url.searchParams.get("q") || "").slice(0, MAX_QUERY_LEN).trim();
    if (q.length < 2) {
      return new Response(JSON.stringify({ query: q, results: [] }), {
        headers: { "content-type": "application/json", "cache-control": "public, max-age=60" },
      });
    }

    // Allowlist the kind filter; anything else is dropped to undefined.
    const rawKind = url.searchParams.get("kind") || undefined;
    const kind = ALLOWED.has(rawKind) ? rawKind : undefined;

    const results = await semanticSearch(q, { kind });
    return new Response(JSON.stringify({ query: q, results }), {
      headers: { "content-type": "application/json", "cache-control": "public, max-age=60" },
    });
  } catch (e) {
    // Log the real error server-side; return a generic message so we never leak
    // upstream error text or provider names to clients.
    console.error("retrieve function error:", e);
    return new Response(JSON.stringify({ error: "search unavailable" }), {
      status: 500,
      headers: { "content-type": "application/json" },
    });
  }
};
