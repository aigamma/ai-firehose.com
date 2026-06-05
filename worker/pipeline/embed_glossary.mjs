import { readFileSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { requireKeys } from "../lib/env.mjs";
import { embed } from "../lib/voyage.mjs";
import { ensureIndex, upsert, updateMetadata, deleteByIds } from "../lib/pinecone.mjs";
import { hash16 } from "../lib/hash.mjs";
import {
  loadVectorManifest,
  markVectorSynced,
  planVectorSync,
  removeVectorIds,
  saveVectorManifest,
} from "./vector_manifest.mjs";

/*
  Embed the DURABLE glossary into Pinecone so the live semantic search (RAG) is aware
  of the knowledge layer: a query like "what is a geodesic" returns the geodesic hub
  alongside the trending items, and the durable concepts become first-class retrieval
  targets, not just static pages.

  Vectors get `glossary::<slug>` ids and live in the same voyage-3 (1024-dim) space as
  the corpus, so one query ranks both. Manifest-driven deletion is scoped by vector
  type, so these persist with the durable layer instead of being pruned as "not in
  the retained store". Idempotent and cost-gated: stable ids, text hashes, and
  metadata hashes in worker/.cache/vector_manifest.json mean daily runs embed only
  changed glossary text, not the whole durable glossary.

  Run standalone: node --env-file=worker/.env.local worker/pipeline/embed_glossary.mjs
  It also runs as a step in run.mjs, right after the durable-glossary merge.
*/

const HERE = dirname(fileURLToPath(import.meta.url));
const GDIR = resolve(HERE, "../../public/data/glossary");

const blockText = (b) => (b?.type === "ul" ? (b.items || []).join(". ") : b?.text || "");
const bodyText = (body) => (Array.isArray(body) ? body.map(blockText).join(" ") : "");

export function glossaryVectorRecords() {
  const index = JSON.parse(readFileSync(resolve(GDIR, "index.json"), "utf8"));
  const durable = (index.concepts || []).filter((c) => c.durable);
  return durable.map((c) => {
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
        text,
        concepts: [c.id],
        author_or_channel: "Glossary",
        category: c.category || "",
        durable: true,
        source: "glossary",
        content_hash: hash16(text),
      },
    };
  });
}

export async function embedGlossary() {
  requireKeys(["PINECONE_API_KEY", "VOYAGE_API_KEY"]);
  const records = glossaryVectorRecords();

  if (!records.length) {
    console.log("embed_glossary: no durable entries, nothing to do.");
    return 0;
  }

  const host = await ensureIndex();
  let manifest = loadVectorManifest();
  const plan = planVectorSync(manifest, records, "glossary");

  if (plan.toEmbed.length) {
    console.log(`embed_glossary: embedding ${plan.toEmbed.length} changed durable glossary entries (voyage-3)...`);
    const embeddings = await embed(plan.toEmbed.map((r) => r.text), "document");
    const vectors = plan.toEmbed.map((r, i) => ({ id: r.id, values: embeddings[i], metadata: r.metadata }));
    await upsert(host, vectors);
    manifest = markVectorSynced(manifest, plan.toEmbed, "glossary");
  }

  if (plan.toUpdate.length) {
    await updateMetadata(host, plan.toUpdate);
    manifest = markVectorSynced(manifest, plan.toUpdate, "glossary");
  }

  if (plan.staleIds.length) {
    await deleteByIds(host, plan.staleIds);
    manifest = removeVectorIds(manifest, plan.staleIds);
  }

  saveVectorManifest(manifest);
  console.log(
    `embed_glossary: total=${plan.total} embedded=${plan.toEmbed.length} metadata_updated=${plan.toUpdate.length} unchanged=${plan.unchanged} deleted=${plan.staleIds.length}.`
  );
  return plan.toEmbed.length;
}

if (import.meta.url === pathToFileURL(process.argv[1] || "").href) {
  embedGlossary().catch((e) => {
    console.error(e);
    process.exit(1);
  });
}
