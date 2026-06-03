import { readFileSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { requireKeys } from "../lib/env.mjs";
import { embed } from "../lib/voyage.mjs";
import { ensureIndex, upsert } from "../lib/pinecone.mjs";

/*
  Embed the DURABLE glossary into Pinecone so the live semantic search (RAG) is aware
  of the knowledge layer: a query like "what is a geodesic" returns the geodesic hub
  alongside the trending items, and the durable concepts become first-class retrieval
  targets, not just static pages.

  Vectors get `glossary::<slug>` ids and live in the same voyage-3 (1024-dim) space as
  the corpus, so one query ranks both. The corpus retention reconcile in run.mjs skips
  the `glossary::` prefix, so these persist with the durable layer instead of being
  pruned as "not in the retained store". Idempotent: stable ids, re-running overwrites
  in place.

  Run standalone: node --env-file=worker/.env.local worker/pipeline/embed_glossary.mjs
  It also runs as a step in run.mjs, right after the durable-glossary merge.
*/

const HERE = dirname(fileURLToPath(import.meta.url));
const GDIR = resolve(HERE, "../../public/data/glossary");

const blockText = (b) => (b?.type === "ul" ? (b.items || []).join(". ") : b?.text || "");
const bodyText = (body) => (Array.isArray(body) ? body.map(blockText).join(" ") : "");

export async function embedGlossary() {
  requireKeys(["PINECONE_API_KEY", "VOYAGE_API_KEY"]);
  const index = JSON.parse(readFileSync(resolve(GDIR, "index.json"), "utf8"));
  const durable = (index.concepts || []).filter((c) => c.durable);
  const records = durable.map((c) => {
    let hub = {};
    try {
      hub = JSON.parse(readFileSync(resolve(GDIR, "c", `${c.id}.json`), "utf8"));
    } catch {
      /* index row is enough if the hub is missing */
    }
    const def = hub.definition || c.def_snippet || "";
    // Embed the label, definition, and body so retrieval matches on the whole entry;
    // store only the definition as `summary` (what rerank and the result card use).
    const text = `${c.label}. ${def} ${bodyText(hub.body)}`.replace(/\s+/g, " ").trim().slice(0, 2000);
    return {
      id: `glossary::${c.id}`,
      text,
      metadata: {
        title: c.label,
        url: `/technique/${c.id}`,
        kind: c.kind || "technique",
        summary: def,
        concepts: [c.id],
        author_or_channel: "Glossary",
        category: c.category || "",
        durable: true,
        source: "glossary",
      },
    };
  });

  if (!records.length) {
    console.log("embed_glossary: no durable entries, nothing to do.");
    return 0;
  }
  console.log(`embed_glossary: embedding ${records.length} durable glossary entries (voyage-3)...`);
  const embeddings = await embed(records.map((r) => r.text), "document");
  const vectors = records.map((r, i) => ({ id: r.id, values: embeddings[i], metadata: r.metadata }));
  const host = await ensureIndex();
  await upsert(host, vectors);
  console.log(`embed_glossary: upserted ${vectors.length} glossary vectors (glossary:: prefix) into ${process.env.PINECONE_INDEX || "ai-firehose"}.`);
  return vectors.length;
}

if (import.meta.url === pathToFileURL(process.argv[1] || "").href) {
  embedGlossary().catch((e) => {
    console.error(e);
    process.exit(1);
  });
}
