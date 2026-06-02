/*
  One-time enrichment: add `first_seen` (the earliest item date for each concept)
  to the committed hubs, computed from the local item store worker/.cache/items.json.
  Also normalizes hub key order to match the generator. Pure local; idempotent.
  Run: node worker/pipeline/enrich_hub_first_seen.mjs
*/
import { readFileSync, writeFileSync, readdirSync, existsSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { slugify } from "../lib/hash.mjs";

const DATA = resolve(dirname(fileURLToPath(import.meta.url)), "../../public/data");
const CACHE = resolve(dirname(fileURLToPath(import.meta.url)), "../.cache/items.json");
const read = (rel) => JSON.parse(readFileSync(resolve(DATA, rel), "utf8"));
const write = (rel, obj) => writeFileSync(resolve(DATA, rel), `${JSON.stringify(obj, null, 2)}\n`);

if (!existsSync(CACHE)) {
  console.log("items.json absent; first_seen backfills on the next live ingest. Skipped.");
  process.exit(0);
}
const store = JSON.parse(readFileSync(CACHE, "utf8"));
const items = Array.isArray(store) ? store : Object.values(store);

// concept id -> earliest published_at across its items.
const firstSeen = {};
for (const it of items) {
  const t = it.published_at;
  if (!t) continue;
  const raw = Array.isArray(it.concepts)
    ? it.concepts
    : typeof it.concepts === "string"
      ? it.concepts.split(",")
      : [];
  for (const c of new Set(raw.map((x) => slugify(String(x).trim())).filter(Boolean))) {
    if (!firstSeen[c] || t < firstSeen[c]) firstSeen[c] = t;
  }
}

let n = 0;
for (const f of readdirSync(resolve(DATA, "glossary/c"))) {
  const h = read(`glossary/c/${f}`);
  const next = {
    id: h.id, label: h.label, aliases: h.aliases, kind: h.kind, attention: h.attention,
    first_seen: firstSeen[h.id] || null, rotation: h.rotation ?? null,
    neighbors: h.neighbors, axis_positions: h.axis_positions, top_items: h.top_items,
  };
  if (h.definition !== undefined) next.definition = h.definition;
  write(`glossary/c/${f}`, next);
  if (next.first_seen) n++;
}
console.log(`hub first_seen: ${n} hubs dated from ${items.length} stored items`);
