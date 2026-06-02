#!/usr/bin/env node
/*
  ai-firehose-mcp

  An MCP (Model Context Protocol) server for AI Firehose (https://ai-firehose.com).
  Query the bleeding edge of AI from any MCP client: semantic search, breakout
  trends, the glossary, and corpus stats over a rolling quarter of AI developments.

  This server is a thin client of the PUBLIC ai-firehose.com read API. It needs no
  repository checkout, no API keys, and no local data, so anyone can run it with
  "npx -y ai-firehose-mcp". Its only dependency is the MCP SDK.
*/
import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  ListToolsRequestSchema,
  CallToolRequestSchema,
} from "@modelcontextprotocol/sdk/types.js";

const VERSION = "0.1.0";
const BASE = (process.env.AI_FIREHOSE_BASE_URL || "https://ai-firehose.com").replace(/\/+$/, "");
const HORIZONS = ["day", "week", "month", "quarter"];
const KINDS = ["technique", "tool", "opinion"];
const FETCH_TIMEOUT_MS = 20000;

async function fetchJson(path) {
  const url = path.startsWith("http") ? path : `${BASE}${path}`;
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);
  try {
    const res = await fetch(url, {
      signal: controller.signal,
      headers: { "user-agent": `ai-firehose-mcp/${VERSION}`, accept: "application/json" },
    });
    if (!res.ok) throw new Error(`HTTP ${res.status} fetching ${url}`);
    return await res.json();
  } finally {
    clearTimeout(timer);
  }
}

function text(payload) {
  const body = typeof payload === "string" ? payload : JSON.stringify(payload, null, 2);
  return { content: [{ type: "text", text: body }] };
}
function failure(message) {
  return { content: [{ type: "text", text: `Error: ${message}` }], isError: true };
}

const normalize = (s) => String(s || "").toLowerCase().replace(/[^a-z0-9]+/g, " ").trim();
const tokenize = (s) => normalize(s).split(" ").filter(Boolean);
// Whole-word containment: " leverage " does not contain " rag ", so a short query
// like "RAG" never false-matches a substring buried inside a longer word.
const phraseIn = (hayNorm, needleNorm) => ` ${hayNorm} `.includes(` ${needleNorm} `);

const TOOLS = [
  {
    name: "search_ai",
    description:
      "Semantic search over the AI Firehose corpus: a rolling, retention-pruned quarter of the most salient AI developments (techniques, tools, and opinions) from YouTube, arXiv, Hacker News, GitHub, blogs, and Hugging Face. Returns the most relevant items with title, url, kind, summary, concepts, source, date, and a relevance score. Use it to find recent work on an AI topic.",
    inputSchema: {
      type: "object",
      properties: {
        query: { type: "string", description: "Natural-language query, for example 'retrieval augmented generation' or 'agent benchmarks'." },
        kind: { type: "string", enum: KINDS, description: "Optional filter by item kind." },
      },
      required: ["query"],
    },
  },
  {
    name: "whats_new",
    description:
      "What is new and breaking out in AI over a time horizon. Returns the latest items plus the outlier concepts (breakouts, new entrants, momentum) for the chosen window. Use it to catch up on recent trends.",
    inputSchema: {
      type: "object",
      properties: {
        horizon: { type: "string", enum: HORIZONS, description: "Time depth: day, week, month, or quarter. Defaults to week." },
      },
    },
  },
  {
    name: "define",
    description:
      "Look up an AI concept in the AI Firehose glossary: a cited definition, its current momentum (rotation quadrant), nearest related concepts, and example items. Matches by concept name or alias.",
    inputSchema: {
      type: "object",
      properties: {
        concept: { type: "string", description: "Concept to define, for example 'mixture of experts' or 'RAG'." },
      },
      required: ["concept"],
    },
  },
  {
    name: "stats",
    description:
      "Corpus statistics for AI Firehose: total items, concept count, retention window, and breakdowns by source and by kind. Useful for context on coverage and freshness.",
    inputSchema: { type: "object", properties: {} },
  },
];

async function runTool(name, args) {
  args = args || {};

  if (name === "search_ai") {
    const query = String(args.query || "").trim();
    if (!query) return failure("'query' is required.");
    const kind = KINDS.includes(args.kind) ? args.kind : undefined;
    const params = new URLSearchParams({ q: query });
    if (kind) params.set("kind", kind);
    const data = await fetchJson(`/api/retrieve?${params}`);
    const results = data.results || [];
    if (!results.length) return text(`No results for "${query}"${kind ? ` (kind=${kind})` : ""}.`);
    return text({ query, kind: kind || "all", count: results.length, results });
  }

  if (name === "whats_new") {
    const horizon = HORIZONS.includes(args.horizon) ? args.horizon : "week";
    const d = await fetchJson(`/data/digests/${horizon}.json`);
    return text({
      horizon,
      generated: d.generated,
      new_items: (d.new_items || []).map((i) => ({
        kind: i.kind,
        title: i.title,
        url: i.url,
        source: i.source,
        author_or_channel: i.author_or_channel,
        published_at: i.published_at,
        concepts: i.concepts,
      })),
      breakout_concepts: (d.outliers || []).map((o) => ({
        concept: o.label,
        kind: o.kind,
        quadrant: o.quadrant,
        momentum: o.momentum,
        breakout: o.outlier?.breakout,
        new_entrant: o.outlier?.new_entrant,
      })),
    });
  }

  if (name === "define") {
    const term = String(args.concept || "").trim();
    if (!term) return failure("'concept' is required.");
    const index = await fetchJson(`/data/glossary/index.json`);
    const concepts = index.concepts || [];
    const target = normalize(term);
    const matchExact = (c) =>
      c.id === term || normalize(c.label) === target || (c.aliases || []).some((a) => normalize(a) === target);
    const matchPhrase = (c) =>
      phraseIn(normalize(c.label), target) || (c.aliases || []).some((a) => phraseIn(normalize(a), target));
    const hit = concepts.find(matchExact) || concepts.find(matchPhrase);
    if (!hit) {
      const sig = tokenize(term).filter((t) => t.length >= 3);
      const suggestions = concepts
        .filter((c) => {
          const toks = new Set([...tokenize(c.label), ...(c.aliases || []).flatMap(tokenize)]);
          return sig.some((t) => toks.has(t));
        })
        .slice(0, 6)
        .map((c) => c.label);
      return text(
        suggestions.length
          ? `No exact glossary match for "${term}". Closest concepts: ${suggestions.join(", ")}. Use search_ai to find items.`
          : `No glossary concept matching "${term}". Try search_ai to find items instead.`
      );
    }
    let hub = null;
    try {
      hub = await fetchJson(`/data/glossary/c/${hit.id}.json`);
    } catch {
      // Fall back to the index entry alone if the hub is unavailable.
    }
    return text({
      concept: hit.label,
      id: hit.id,
      kind: hit.kind,
      definition: hit.def_snippet,
      aliases: hit.aliases || [],
      attention: hit.attention,
      momentum: hub?.rotation
        ? { horizon: hub.rotation.horizon, quadrant: hub.rotation.quadrant, momentum: hub.rotation.momentum }
        : undefined,
      first_seen: hub?.first_seen,
      related: (hub?.neighbors || []).slice(0, 6).map((n) => n.label),
      example_items: (hub?.top_items || []).slice(0, 5).map((t) => ({ title: t.title, url: t.url })),
      page: `${BASE}/technique/${hit.id}`,
    });
  }

  if (name === "stats") {
    return text(await fetchJson(`/data/stats.json`));
  }

  return failure(`Unknown tool: ${name}`);
}

const server = new Server({ name: "ai-firehose", version: VERSION }, { capabilities: { tools: {} } });
server.setRequestHandler(ListToolsRequestSchema, async () => ({ tools: TOOLS }));
server.setRequestHandler(CallToolRequestSchema, async (request) => {
  try {
    return await runTool(request.params.name, request.params.arguments);
  } catch (err) {
    return failure(err?.message || String(err));
  }
});

await server.connect(new StdioServerTransport());
// stdout is the JSON-RPC channel; logs must go to stderr.
console.error(`ai-firehose-mcp ${VERSION} ready (source: ${BASE})`);
