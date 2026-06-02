/*
  End-to-end smoke test of the live path: fetch real items, classify with Claude,
  embed with Voyage, create the ai-firehose Pinecone index, upsert, then query.
  Run: node --env-file=worker/.env.local worker/pipeline/smoke.mjs [limit]

  Tiny by design (a few items). Proves the integrations work before the full
  pipeline. Creates a separate ai-firehose index; never touches sibling indexes.
*/
import { requireKeys, ENV } from "../lib/env.mjs";
import { fetchYouTube } from "../sources/youtube.mjs";
import { classifyItem } from "./classify.mjs";
import { embed } from "../lib/voyage.mjs";
import { ensureIndex, upsert, query } from "../lib/pinecone.mjs";
import { hash16, itemId } from "../lib/hash.mjs";

requireKeys();
const LIMIT = Number(process.argv[2]) || 5;

// Fallback items so the Voyage and Pinecone path verifies even if YouTube's feed
// endpoint is throttling this IP at the moment.
const FALLBACK = [
  {
    source: "manual",
    source_id: "vllm-paged-attention",
    url: "https://github.com/vllm-project/vllm",
    title: "vLLM uses paged attention for faster LLM serving",
    summary_text:
      "vLLM is an inference engine that uses paged attention to serve large language models with higher throughput and lower memory use.",
    author_or_channel: "vLLM",
    published_at: new Date().toISOString(),
    source_authority_weight: 0.7,
  },
  {
    source: "manual",
    source_id: "test-time-compute-debate",
    url: "#",
    title: "Is test-time compute the new scaling axis?",
    summary_text:
      "Researchers debate whether scaling inference-time compute, often called test-time compute, is replacing parameter scaling as the dominant way to improve model capability.",
    author_or_channel: "blog",
    published_at: new Date().toISOString(),
    source_authority_weight: 0.6,
  },
];

async function main() {
  console.log("1. fetching real items from YouTube registry...");
  const yt = await fetchYouTube({ maxAgeDays: 120, perChannel: 2 }).catch(() => []);
  const items = yt.slice(0, LIMIT);
  if (items.length < 2) items.push(...FALLBACK);
  console.log(`   using ${items.length} items`);

  console.log("2. classifying with Claude...");
  const classified = [];
  for (const it of items) {
    try {
      const c = await classifyItem(it);
      classified.push({ ...it, ...c });
      console.log(`   [${c.kind}] ${it.title}  ->  ${c.concepts.join(", ")}`);
    } catch (e) {
      console.log(`   classify failed (${it.title}): ${e.message}`);
    }
  }
  if (!classified.length) throw new Error("nothing classified");

  console.log("3. embedding summaries with Voyage voyage-3...");
  const vecs = await embed(classified.map((c) => `${c.title}\n\n${c.summary}`), "document");
  console.log(`   ${vecs.length} vectors of dim ${vecs[0]?.length}`);

  console.log(`4. ensuring Pinecone index ${ENV.pineconeIndex} (create if missing)...`);
  const host = await ensureIndex();
  console.log(`   host ${host}`);

  const vectors = classified.map((c, i) => ({
    id: itemId(c.kind, c.source, c.source_id, hash16(c.summary_text || c.title)),
    values: vecs[i],
    metadata: {
      kind: c.kind,
      source: c.source,
      title: c.title,
      url: c.url,
      author_or_channel: c.author_or_channel || "",
      published_at: c.published_at || "",
      concepts: c.concepts || [],
      entities: c.entities || [],
      source_authority_weight: c.source_authority_weight ?? 0.8,
      summary: c.summary || "",
    },
  }));
  console.log("5. upserting...");
  await upsert(host, vectors);
  console.log(`   upserted ${vectors.length}`);

  console.log("6. query check: 'AI coding agents and automation'");
  const [qv] = await embed(["AI coding agents and automation"], "query");
  const matches = await query(host, qv, { topK: 5 });
  matches.forEach((m) => console.log(`   ${m.score.toFixed(3)}  [${m.metadata?.kind}] ${m.metadata?.title}`));
  console.log("\nSMOKE OK");
}

main().catch((e) => {
  console.error("SMOKE FAILED:", e.message);
  process.exit(1);
});
